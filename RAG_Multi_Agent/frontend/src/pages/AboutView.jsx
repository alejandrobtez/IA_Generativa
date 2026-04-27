import React from 'react';
import { BrainCircuit, Database, Zap, Code2, ExternalLink, GraduationCap, Globe } from 'lucide-react';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const technologies = [
  { icon: <BrainCircuit size={15} />, label: 'FastAPI + Python' },
  { icon: <Zap size={15} />, label: 'Azure OpenAI GPT-4o' },
  { icon: <Database size={15} />, label: 'Azure AI Search' },
  { icon: <Globe size={15} />, label: 'LangChain RAG' },
  { icon: <Code2 size={15} />, label: 'React + Vite' },
];

export default function AboutView() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>
          <span className="gradient-text">Sobre el Proyecto</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Multi-Asistente RAG — IA Generativa aplicada
        </p>
      </div>

      <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Developer card */}
        <div className="glass-panel" style={{ padding: '2.25rem', background: 'var(--gradient-card)', border: '1px solid rgba(155,127,212,0.18)' }}>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <div className="avatar-ring animate-float">
                <img
                  src="/shawn.jpg"
                  alt="Alejandro Benítez"
                  width={130}
                  height={130}
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div style="width:130px;height:130px;border-radius:50%;background:linear-gradient(135deg,#9b7fd4,#5fa39e);display:flex;align-items:center;justify-content:center;font-size:2.75rem;font-weight:800;color:#09090b;border:3px solid #09090b">AB</div>`;
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <span className="badge" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>Desarrollador</span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.035em', marginBottom: '0.3rem' }}>
                Alejandro Benítez
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                <GraduationCap size={15} color="var(--amber)" />
                <span>Inteligencia Artificial &amp; Big Data</span>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a href="https://github.com/alejandrobtez" target="_blank" rel="noopener noreferrer" className="social-btn social-btn-github">
                  <GithubIcon />
                  <span>@alejandrobtez</span>
                </a>
                <a href="https://www.linkedin.com/in/alejandrobtez" target="_blank" rel="noopener noreferrer" className="social-btn social-btn-linkedin">
                  <LinkedInIcon />
                  <span>alejandrobtez</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Info panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <BrainCircuit size={18} color="var(--amber)" />
              ¿Qué es este proyecto?
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Plataforma full-stack de IA generativa con múltiples asistentes RAG, cada uno con su propia
              base documental aislada y conversaciones persistentes.
            </p>
            <a
              href="https://github.com/alejandrobtez/IA_Generativa/tree/main/RAG_Multi_Agent"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-btn-github"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.83rem' }}
            >
              <GithubIcon />
              <span>Ver en GitHub</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
              <Globe size={18} color="var(--teal)" />
              ¿Cómo funciona el RAG?
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.88rem' }}>
              Al enviar un mensaje el sistema recupera los fragmentos más relevantes del índice vectorial del asistente
              (Azure AI Search), los inyecta en el prompt junto al historial de conversación, y
              <strong style={{ color: 'var(--text-primary)' }}> GPT-4o </strong>
              genera una respuesta fundamentada con citas.
            </p>
          </div>
        </div>

        {/* Tech stack */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
            <Zap size={17} color="var(--amber)" />
            Tecnologías Utilizadas
          </h3>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {technologies.map((t, i) => (
              <span key={i} className="tag">{t.icon}{t.label}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
