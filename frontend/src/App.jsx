import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScannerStudio from './components/ScannerStudio';
import AttackArsenal from './components/AttackArsenal';
import BenchmarkRunner from './components/BenchmarkRunner';
import PipelineVisualizer from './components/PipelineVisualizer';
import TaxonomyView from './components/TaxonomyView';
import HistoryDrawer from './components/HistoryDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [health, setHealth] = useState(null);
  const [attacks, setAttacks] = useState(null);
  const [taxonomy, setTaxonomy] = useState(null);

  const [scannerState, setScannerState] = useState({
    appInstructions: '',
    externalContent: '',
    conversationContext: ''
  });

  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_scan_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch Initial Data (Health, Attacks, Taxonomy)
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [healthRes, attacksRes, taxRes] = await Promise.all([
          fetch('/api/health').then(r => r.json()),
          fetch('/api/attacks').then(r => r.json()),
          fetch('/api/taxonomy').then(r => r.json())
        ]);
        setHealth(healthRes);
        setAttacks(attacksRes);
        setTaxonomy(taxRes);
      } catch (err) {
        console.error("Failed to load initial metadata:", err);
      }
    };
    fetchInitData();
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sentinel_scan_history', JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save scan history to localStorage", e);
    }
  }, [history]);

  // Run single analysis
  const handleAnalyze = async () => {
    if (!scannerState.externalContent.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_instructions: scannerState.appInstructions,
          external_content: scannerState.externalContent,
          conversation_context: scannerState.conversationContext
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned error ${resp.status}`);
      }

      const data = await resp.json();
      setVerdict(data);

      // Record in session history
      const newEntry = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        appInstructions: scannerState.appInstructions,
        content: scannerState.externalContent,
        conversationContext: scannerState.conversationContext,
        verdict: data
      };
      setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // keep last 50
    } catch (err) {
      setError(err.message || 'Failed to complete analysis.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Load Attack from Arsenal
  const handleSelectAttack = (attack) => {
    setScannerState({
      appInstructions: attack.application_instructions || '',
      externalContent: attack.external_content || '',
      conversationContext: attack.conversation_context || ''
    });
    setVerdict(null);
    setError(null);
    setActiveTab('scanner');
  };

  // Reload past scan from History
  const handleReloadScan = (item) => {
    setScannerState({
      appInstructions: item.appInstructions || '',
      externalContent: item.content || '',
      conversationContext: item.conversationContext || ''
    });
    setVerdict(item.verdict);
    setActiveTab('scanner');
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        historyCount={history.length}
        toggleHistory={() => setHistoryOpen(!historyOpen)}
      />

      {/* Main Content Body */}
      <main style={{
        flex: 1,
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px 64px 24px'
      }}>
        {activeTab === 'scanner' && (
          <ScannerStudio
            scannerState={scannerState}
            setScannerState={setScannerState}
            onAnalyze={handleAnalyze}
            loading={loading}
            verdict={verdict}
            error={error}
          />
        )}

        {activeTab === 'arsenal' && (
          <AttackArsenal
            attacks={attacks}
            onSelectAttack={handleSelectAttack}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkRunner
            attacks={attacks}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineVisualizer />
        )}

        {activeTab === 'taxonomy' && (
          <TaxonomyView
            taxonomy={taxonomy}
          />
        )}
      </main>

      {/* History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onReloadScan={handleReloadScan}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(6, 8, 14, 0.95)',
        padding: '20px 24px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span>🛡️ SentinelPrompt — Indirect Prompt Injection Detection Platform</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>FastAPI + React 18 + OpenRouter LLM-Guard</span>
        </div>
      </footer>
    </div>
  );
}
