import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Terminal, 
  Activity, 
  Target, 
  FileCode, 
  Shield, 
  AlertOctagon, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const RISK_CONFIG = {
  CRITICAL: {
    label: "CRITICAL RISK",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.4)",
    glow: "rgba(239, 68, 68, 0.3)",
    icon: AlertOctagon,
    desc: "Severe malicious instruction designed to hijack downstream execution or leak confidential data."
  },
  HIGH: {
    label: "HIGH RISK",
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.12)",
    border: "rgba(249, 115, 22, 0.4)",
    glow: "rgba(249, 115, 22, 0.3)",
    icon: ShieldAlert,
    desc: "High probability prompt injection attempting instruction override or system extraction."
  },
  MEDIUM: {
    label: "MEDIUM RISK",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.4)",
    glow: "rgba(245, 158, 11, 0.3)",
    icon: AlertTriangle,
    desc: "Suspicious pattern or ambiguous instruction requiring human review or sanitization."
  },
  LOW: {
    label: "LOW RISK",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.12)",
    border: "rgba(56, 189, 248, 0.4)",
    glow: "rgba(56, 189, 248, 0.3)",
    icon: ShieldCheck,
    desc: "Minimal threat detected; structure contains mild ambiguity but no active injection payload."
  },
  SAFE: {
    label: "SAFE / BENIGN",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.4)",
    glow: "rgba(16, 185, 129, 0.3)",
    icon: ShieldCheck,
    desc: "Input is benign and conforms with standard application safety boundaries."
  }
};

const ACTION_CONFIG = {
  BLOCK: {
    badgeBg: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    text: "BLOCK PAYLOAD",
    instruction: "Halt execution immediately. Do not forward untrusted content to downstream LLM."
  },
  SANITIZE: {
    badgeBg: "rgba(249, 115, 22, 0.2)",
    color: "#f97316",
    text: "SANITIZE & STRIP",
    instruction: "Strip identified injected instructions or escape XML delimiter tags before passing."
  },
  FLAG: {
    badgeBg: "rgba(245, 158, 11, 0.2)",
    color: "#f59e0b",
    text: "FLAG FOR AUDIT",
    instruction: "Allow with warning and route transcript to security team audit queue."
  },
  ALLOW: {
    badgeBg: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    text: "ALLOW EXECUTION",
    instruction: "Content verified safe. Safe to proceed to application pipeline."
  }
};

export default function VerdictDashboard({ result }) {
  const [showJson, setShowJson] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!result) return null;

  const riskLevel = result.risk_level || 'MEDIUM';
  const riskInfo = RISK_CONFIG[riskLevel] || RISK_CONFIG.MEDIUM;
  const RiskIcon = riskInfo.icon;

  const action = result.recommended_action || 'FLAG';
  const actionInfo = ACTION_CONFIG[action] || ACTION_CONFIG.FLAG;

  const confidencePct = Math.round((result.confidence || 0) * 100);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="glass-panel-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header: Security Verdict & Fallback Warning */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: riskInfo.bg,
            border: `1px solid ${riskInfo.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 15px ${riskInfo.glow}`
          }}>
            <RiskIcon size={20} color={riskInfo.color} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Security Analysis Diagnosis
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              SentinelPrompt isolated sandbox verdict & validation report
            </p>
          </div>
        </div>

        {/* JSON Inspector Toggle */}
        <button 
          onClick={() => setShowJson(!showJson)}
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '6px 12px' }}
        >
          <FileCode size={14} color="#38bdf8" />
          <span>{showJson ? 'Hide JSON' : 'Inspect JSON'}</span>
        </button>
      </div>

      {/* Fallback Notice if triggered */}
      {result.is_fallback && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          color: '#fbbf24'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>Fail-Safe Fallback Triggered</p>
            <p style={{ fontSize: '0.78rem', color: '#fef08a' }}>
              {result.fallback_reason || "SentinelPrompt defaulted to safe review posture rather than assuming safe."}
            </p>
          </div>
        </div>
      )}

      {/* Main Scorecards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {/* Risk Level Card */}
        <div style={{
          background: riskInfo.bg,
          border: `1px solid ${riskInfo.border}`,
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: `0 4px 20px -5px ${riskInfo.glow}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Risk Assessment
            </span>
            <RiskIcon size={16} color={riskInfo.color} />
          </div>
          <p style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.35rem', 
            fontWeight: 800, 
            color: riskInfo.color,
            letterSpacing: '0.02em'
          }}>
            {riskInfo.label}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {riskInfo.desc}
          </span>
        </div>

        {/* Action Protocol Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Action Protocol
            </span>
            <Shield size={16} color={actionInfo.color} />
          </div>
          <span className="cyber-badge" style={{ 
            background: actionInfo.badgeBg, 
            color: actionInfo.color, 
            border: `1px solid ${actionInfo.color}40`,
            fontSize: '0.82rem',
            width: 'fit-content',
            padding: '6px 12px'
          }}>
            {actionInfo.text}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {actionInfo.instruction}
          </span>
        </div>

        {/* Confidence Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Confidence Score
            </span>
            <Activity size={16} color="#38bdf8" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9' }}>
              {confidencePct}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({result.confidence?.toFixed(2)})
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', marginTop: '6px' }}>
            <div style={{ 
              width: `${confidencePct}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
              boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)'
            }} />
          </div>
        </div>
      </div>

      {/* Attack Taxonomy Tags */}
      <div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <Target size={14} color="#f43f5e" />
          <span>Classified Threat Vectors</span>
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {result.attack_types && result.attack_types.length > 0 ? (
            result.attack_types.map((type, idx) => (
              <span
                key={idx}
                className="cyber-badge"
                style={{
                  background: type === 'NONE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: type === 'NONE' ? '#10b981' : '#fb7185',
                  border: type === 'NONE' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.35)',
                  padding: '6px 12px',
                  fontSize: '0.75rem'
                }}
              >
                {type}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No attack vectors identified.</span>
          )}
        </div>
      </div>

      {/* Attacker Intent */}
      {result.attacker_intent && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '14px 16px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Target size={14} color="#38bdf8" />
            <span>Extracted Attacker Intent</span>
          </span>
          <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            {result.attacker_intent}
          </p>
        </div>
      )}

      {/* Evidence Viewer */}
      {result.evidence && result.evidence.length > 0 && (
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Terminal size={14} color="#f59e0b" />
            <span>Detected Injection Evidence Snippets</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.evidence.map((ev, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#090e17',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderLeft: '3px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: '#fef08a'
                }}
              >
                "{ev}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning Summary */}
      {result.reasoning_summary && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '14px 16px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Sparkles size={14} color="#8b5cf6" />
            <span>Analytical Reasoning</span>
          </span>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {result.reasoning_summary}
          </p>
        </div>
      )}

      {/* Actionable Mitigation Strategy */}
      {result.mitigation && result.mitigation.length > 0 && (
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Recommended Mitigation Steps</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {result.mitigation.map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}
              >
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw JSON Modal / Section */}
      {showJson && (
        <div style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          background: '#070a10',
          padding: '14px',
          marginTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              raw_validated_result.json
            </span>
            <button onClick={handleCopyJson} className="btn-ghost" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
              {copiedJson ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
