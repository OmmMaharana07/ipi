import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Download, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Search 
} from 'lucide-react';

export default function HistoryDrawer({ 
  isOpen, 
  onClose, 
  history, 
  onClearHistory, 
  onReloadScan 
}) {
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const matchRisk = filterRisk === 'ALL' || item.verdict?.risk_level === filterRisk;
    const matchSearch = 
      item.content?.toLowerCase().includes(search.toLowerCase()) ||
      item.verdict?.attacker_intent?.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_scan_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#0a0d15',
        borderLeft: '1px solid var(--border-subtle)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700 }}>
              Session Threat Logs
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {history.length} scans recorded this session
            </p>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px', padding: '8px 12px 8px 32px', fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'CRITICAL', 'HIGH', 'SAFE'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterRisk(lvl)}
                  style={{
                    background: filterRisk === lvl ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: filterRisk === lvl ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-subtle)',
                    color: filterRisk === lvl ? '#38bdf8' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {history.length > 0 && (
                <>
                  <button onClick={handleExport} className="btn-ghost" title="Export JSON" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
                    <Download size={13} />
                  </button>
                  <button onClick={onClearHistory} className="btn-ghost" title="Clear all" style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#f87171' }}>
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* History List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No recorded scans found.
            </div>
          ) : (
            filteredHistory.map((item, idx) => {
              const verdict = item.verdict;
              const isCrit = verdict?.risk_level === 'CRITICAL';
              const isHigh = verdict?.risk_level === 'HIGH';
              const isSafe = verdict?.risk_level === 'SAFE';

              const riskColor = isCrit ? '#ef4444' : (isHigh ? '#f97316' : (isSafe ? '#10b981' : '#f59e0b'));

              return (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="cyber-badge" style={{
                      background: `${riskColor}20`,
                      color: riskColor,
                      border: `1px solid ${riskColor}40`,
                      fontSize: '0.68rem'
                    }}>
                      {verdict?.risk_level || 'ANALYSIS'}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <Clock size={11} />
                      {item.timestamp}
                    </span>
                  </div>

                  <p style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.76rem',
                    color: '#cbd5e1',
                    background: '#070a10',
                    padding: '8px',
                    borderRadius: '6px',
                    maxHeight: '60px',
                    overflow: 'hidden'
                  }}>
                    "{item.content?.slice(0, 100)}..."
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Action: <strong style={{ color: riskColor }}>{verdict?.recommended_action || 'FLAG'}</strong>
                    </span>

                    <button
                      onClick={() => {
                        onReloadScan(item);
                        onClose();
                      }}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                    >
                      <RotateCcw size={12} />
                      <span>Reload</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
