import React, { useState, useEffect } from 'react';
import { getAssistants, deleteAssistant } from '../api';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, SlidersHorizontal, MessagesSquare, Trash2, FilePlus2 } from 'lucide-react';

export default function Dashboard() {
  const [assistants, setAssistants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAssistants().then(res => setAssistants(res.data)).catch(console.error);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este asistente y todos sus datos?')) return;
    try {
      await deleteAssistant(id);
      setAssistants(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Mis Asistentes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Gestiona y chatea con tus asistentes RAG personalizados</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '7px' }} onClick={() => navigate('/create')}>
          <FilePlus2 size={18} />
          Crear Asistente
        </button>
      </div>

      <div className="page-body">
        {assistants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-secondary)' }}>
            <BrainCircuit size={52} style={{ margin: '0 auto', opacity: 0.3, marginBottom: '1.25rem', color: 'var(--amber)' }} />
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Sin asistentes todavía</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.75rem' }}>Crea tu primer asistente y añade documentos a su base de conocimiento</p>
            <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }} onClick={() => navigate('/create')}>
              <FilePlus2 size={17} /> Crear Asistente
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {assistants.map((ast) => (
              <div key={ast.id} className="card glass-panel" onClick={() => navigate(`/assistant/${ast.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: 'rgba(155,127,212,0.1)',
                    border: '1px solid rgba(155,127,212,0.2)',
                    padding: '10px',
                    borderRadius: '12px',
                    color: 'var(--amber)',
                    flexShrink: 0,
                  }}>
                    <BrainCircuit size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}>{ast.name}</h3>
                    <span className="badge" style={{ marginTop: '3px' }}>ID {ast.id}</span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ast.description || ast.instructions}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '0.9rem', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <button className="btn-danger" style={{ padding: '0.45rem 0.65rem', display: 'flex', alignItems: 'center' }} onClick={(e) => handleDelete(e, ast.id)} title="Eliminar asistente">
                    <Trash2 size={15} />
                  </button>
                  <button className="btn-secondary" style={{ padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem' }} onClick={(e) => { e.stopPropagation(); navigate(`/assistant/${ast.id}`); }}>
                    <SlidersHorizontal size={14} /> Configurar
                  </button>
                  <button className="btn-primary" style={{ padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem' }} onClick={(e) => { e.stopPropagation(); navigate(`/assistant/${ast.id}/chat`); }}>
                    <MessagesSquare size={14} /> Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
