"""
app.py

SentinelPrompt - FastAPI Backend & AI Security Engine Service.
Provides REST endpoints for prompt injection detection, taxonomy lookup,
attack library preset inspection, and batch evaluation.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

from core.analyzer import MODEL, analyze
from core.taxonomy import (
    ATTACK_TYPE_DESCRIPTIONS,
    RISK_LEVEL_ORDER,
    AttackType,
    RecommendedAction,
    RiskLevel,
)
from core.validator import AnalysisResult

app = FastAPI(
    title="SentinelPrompt API",
    description="Indirect Prompt Injection Detection System for RAG & Tool-Calling Pipelines",
    version="2.0.0",
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
ATTACKS_FILE = BASE_DIR / "attacks.json"
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"


class AnalyzeRequest(BaseModel):
    application_instructions: Optional[str] = Field(
        default="",
        description="Trusted system / developer instructions for the downstream model",
    )
    external_content: str = Field(
        ...,
        description="Untrusted content to analyze (user input, retrieved document, tool output)",
    )
    conversation_context: Optional[str] = Field(
        default="",
        description="Optional multi-turn conversation history",
    )


class BatchAnalyzeRequest(BaseModel):
    attack_ids: Optional[list[str]] = Field(
        default=None,
        description="Optional list of specific attack IDs to evaluate. If empty, evaluates all.",
    )


@app.get("/api/health")
def get_health() -> dict[str, Any]:
    """Returns system status, API key configuration state, and active model."""
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    has_key = bool(api_key and not api_key.startswith("sk-or-v1-your-key-here"))

    return {
        "status": "healthy",
        "has_api_key": has_key,
        "model": MODEL,
        "version": "2.0.0",
        "engine": "SentinelPrompt LLM-Guard",
    }


@app.get("/api/taxonomy")
def get_taxonomy() -> dict[str, Any]:
    """Returns the full attack taxonomy, descriptions, risk levels, and recommended actions."""
    categories = []
    for attack_type, desc in ATTACK_TYPE_DESCRIPTIONS.items():
        categories.append({
            "type": attack_type.value if hasattr(attack_type, "value") else str(attack_type),
            "description": desc,
            "is_benign": attack_type == AttackType.NONE or str(attack_type) == "NONE",
        })

    return {
        "attack_types": categories,
        "risk_levels": [r.value for r in RiskLevel],
        "risk_level_order": [r.value for r in RISK_LEVEL_ORDER],
        "recommended_actions": [a.value for a in RecommendedAction],
    }


@app.get("/api/attacks")
def get_attacks() -> dict[str, Any]:
    """Returns the curated library of prompt injection attack vectors and test cases."""
    if not ATTACKS_FILE.exists():
        raise HTTPException(status_code=404, detail="attacks.json not found")

    try:
        with open(ATTACKS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        examples = data.get("examples", [])
        
        # Group by attack category for convenient UI tabs/filters
        categories_map: dict[str, list[dict]] = {}
        for ex in examples:
            atype = ex.get("attack_type", "OTHER")
            categories_map.setdefault(atype, []).append(ex)

        return {
            "total": len(examples),
            "note": data.get("_note", ""),
            "examples": examples,
            "categories": [
                {"category": cat, "count": len(items)}
                for cat, items in categories_map.items()
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load attacks: {str(e)}")


@app.post("/api/analyze")
def analyze_content(req: AnalyzeRequest) -> dict[str, Any]:
    """Analyzes a single prompt / payload for indirect prompt injection."""
    if not req.external_content or not req.external_content.strip():
        raise HTTPException(status_code=400, detail="External content cannot be empty.")

    result: AnalysisResult = analyze(
        application_instructions=req.application_instructions,
        external_content=req.external_content,
        conversation_context=req.conversation_context,
    )

    return result.model_dump()


@app.post("/api/analyze-batch")
def analyze_batch(req: BatchAnalyzeRequest) -> dict[str, Any]:
    """Executes a batch benchmark across the attack test suite."""
    if not ATTACKS_FILE.exists():
        raise HTTPException(status_code=404, detail="attacks.json not found")

    with open(ATTACKS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_examples = data.get("examples", [])
    target_examples = all_examples
    if req.attack_ids:
        target_set = set(req.attack_ids)
        target_examples = [ex for ex in all_examples if ex.get("id") in target_set]

    results = []
    correct_count = 0
    total_evaluated = 0

    for ex in target_examples:
        res = analyze(
            application_instructions=ex.get("application_instructions"),
            external_content=ex.get("external_content", ""),
            conversation_context=ex.get("conversation_context"),
        )
        res_dict = res.model_dump()
        expected_is_inj = ex.get("expected_is_injection", True)
        is_match = (res.is_prompt_injection == expected_is_inj)
        
        if not res.is_fallback:
            total_evaluated += 1
            if is_match:
                correct_count += 1

        results.append({
            "test_case": ex,
            "result": res_dict,
            "is_correct_detection": is_match,
        })

    accuracy = (correct_count / total_evaluated) if total_evaluated > 0 else 0.0

    return {
        "total": len(target_examples),
        "evaluated": total_evaluated,
        "correct": correct_count,
        "accuracy": round(accuracy, 4),
        "results": results,
    }


# Mount production static build if available
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
