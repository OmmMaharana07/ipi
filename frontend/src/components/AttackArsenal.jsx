import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Play, 
  Terminal, 
  Tag, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AttackArsenal({ attacks, onSelectAttack }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const examples = attacks?.examples || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(examples.map(ex => ex.attack_type));
    return ['ALL', ...Array.from(cats)];
  }, [examples]);

  // Filter examples based on category & search
  const filteredExamples = useMemo(() => {
    return examples.filter(ex => {
      const matchCat = selectedCategory === 'ALL' || ex.attack_type === selectedCategory;
      const matchSearch = 
        ex.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.attack_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.external_content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.application_instructions?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [examples, selectedCategory, searchQuery]);

  return (
    <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.25)'
          }}>
            <Zap size={22} color="#f43f5e" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
              Attack Arsenal & Test Library
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Curated repository of {examples.length} indirect prompt injection, RAG exploits, and jailbreak vectors
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search attack vector, payload, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {categories.map((cat, idx) => {
          const isActive = selectedCategory === cat;
          const count = cat === 'ALL' 
            ? examples.length 
            : examples.filter(ex => ex.attack_type === cat).length;

          return (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.2) 100%)' 
                  : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.45)' : '1px solid var(--border-subtle)',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{cat === 'ALL' ? 'All Vectors' : cat.replace(/_/g, ' ')}</span>
              <span style={{
                background: isActive ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                borderRadius: '9999px',
                padding: '1px 6px',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)'
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Attack Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filteredExamples.map((ex) => {
          const isBenign = ex.expected_is_injection === false || ex.attack_type === 'NONE';
          const riskColor = isBenign ? '#10b981' : (ex.expected_risk_min === 'CRITICAL' ? '#ef4444' : (ex.expected_risk_min === 'HIGH' ? '#f97316' : '#f59e0b'));

          return (
            <div
              key={ex.id}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                  <span className="cyber-badge" style={{
                    background: isBenign ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isBenign ? '#10b981' : '#f87171',
                    border: isBenign ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    fontSize: '0.68rem'
                  }}>
                    {isBenign ? 'BENIGN BASELINE' : `${ex.expected_risk_min || 'THREAT'} EXPLOIT`}
                  </span>

                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    ID: {ex.id}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.02rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
                  {ex.label}
                </h3>

                <p style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                  <Tag size={12} color="#38bdf8" />
                  <span>Category: {ex.attack_type.replace(/_/g, ' ')}</span>
                </p>

                {/* Snippet Preview */}
                <div style={{
                  background: '#080c14',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.76rem',
                  color: '#cbd5e1',
                  maxHeight: '100px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  "{ex.external_content?.length > 140 ? ex.external_content.slice(0, 140) + '...' : ex.external_content}"
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Expected: <strong style={{ color: isBenign ? '#10b981' : '#f87171' }}>{isBenign ? 'Pass / Benign' : 'Detect & Block'}</strong>
                </span>

                <button
                  onClick={() => onSelectAttack(ex)}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  <span>Load & Test</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
