import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAssistant } from '../api';
import { BrainCircuit, ChevronLeft } from 'lucide-react';

export default function CreateAssistant() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', instructions: '' });
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await createAssistant(form);
      navigate(`/assistant/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Error al crear el asistente');
    } finally { setIsCreating(false); }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-secondary" style={{ padding: '0.45rem', borderRadius: '9px' }} onClick={() => navigate('/')}>
          <ChevronLeft size={19} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Crear Asistente</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Define el rol, descripción e instrucciones de tu nuevo asistente IA</p>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div className="glass-panel" style={{ padding: '2.25rem', width: '100%', maxWidth: '620px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(155,127,212,0.1)', border: '1px solid rgba(155,127,212,0.2)', padding: '10px', borderRadius: '12px', color: 'var(--amber)' }}>
              <BrainCircuit size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Nuevo Asistente</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Tras crearlo podrás subir documentos a su base documental</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Nombre <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input required style={{ width: '100%' }} placeholder="Ej: Asistente de RRHH" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Descripción</label>
              <input style={{ width: '100%' }} placeholder="Descripción breve del asistente..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Instrucciones de Sistema <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea required rows={7} style={{ width: '100%', resize: 'vertical' }} placeholder="Eres un experto asistente de RRHH. Responde únicamente con información de los documentos proporcionados..." value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} />
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Puedes generarlas automáticamente desde la configuración del asistente tras subir documentos.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.9rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isCreating}>
                {isCreating ? 'Creando…' : 'Crear Asistente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
