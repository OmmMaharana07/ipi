import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  Sparkles, 
  BookOpen, 
  History, 
  Zap, 
  Activity,
  Cpu
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  health, 
  historyCount, 
  toggleHistory,
  stats
}) {
  const tabs = [
    { id: 'scanner', label: 'Scanner Studio', icon: Terminal },
    { id: 'arsenal', label: 'Attack Arsenal', icon: Zap },
    { id: 'benchmark', label: 'Benchmark Suite', icon: Activity },
    { id: 'pipeline', label: 'Defense Pipeline', icon: Layers },
    { id: 'taxonomy', label: 'Taxonomy Map', icon: BookOpen },
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(6, 8, 14, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('scanner')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
          }}>
            <ShieldAlert size={24} color="#06b6d4" />
          </div>
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff 30%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                SentinelPrompt
              </span>
              <span className="cyber-badge" style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontSize: '0.65rem'
              }}>
                v2.0 PRO
              </span>
            </div>
            <p style={{ 
              fontSize: '0.72rem', 
              color: 'var(--text-muted)',
              letterSpacing: '0.02em'
            }}>
              AI Prompt Injection & RAG Security Guard
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-sans)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)' 
                    : 'transparent',
                  border: isActive ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.25)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#38bdf8' : 'currentColor'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Active Model Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: health?.status === 'healthy' ? '#10b981' : '#ef4444',
              boxShadow: health?.status === 'healthy' ? '0 0 8px #10b981' : '0 0 8px #ef4444'
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#e2e8f0' }}>
              {health?.model ? health.model.split('/').pop() : 'OpenRouter Model'}
            </span>
          </div>

          {/* History Drawer Toggle */}
          <button
            onClick={toggleHistory}
            className="btn-secondary"
            title="View scan history"
            style={{ position: 'relative', padding: '8px 12px' }}
          >
            <History size={16} />
            <span style={{ fontSize: '0.8rem' }}>History</span>
            {historyCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#06b6d4',
                color: '#06080e',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
