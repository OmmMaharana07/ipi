import React, { useState } from 'react';
import { BookOpen, ShieldAlert, ShieldCheck, Tag, Search, AlertOctagon, Terminal } from 'lucide-react';

export default function TaxonomyView({ taxonomy }) {
  const [search, setSearch] = useState('');

  const attackTypes = taxonomy?.attack_types || [];

  const filtered = attackTypes.filter(item => 
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.25)'
          }}>
            <BookOpen size={22} color="#a78bfa" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
              Attack Taxonomy & Threat Matrix
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Standardized prompt injection categories recognized and classified by SentinelPrompt
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search taxonomy category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Grid of Taxonomy Definitions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filtered.map((item, idx) => {
          const isBenign = item.is_benign;

          return (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="cyber-badge" style={{
                  background: isBenign ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isBenign ? '#10b981' : '#f87171',
                  border: isBenign ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  fontSize: '0.65rem'
                }}>
                  {isBenign ? 'BENIGN PATTERN' : 'THREAT VECTOR'}
                </span>

                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  TAX-{idx + 1}
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, color: '#f1f5f9' }}>
                {item.type.replace(/_/g, ' ')}
              </h3>

              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
