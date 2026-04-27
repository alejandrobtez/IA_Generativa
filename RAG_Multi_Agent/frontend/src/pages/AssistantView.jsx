import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssistant, updateAssistant, getDocuments, uploadDocument, deleteDocument, generateInstructions } from '../api';
import { ChevronLeft, BookmarkCheck, FolderOpen, FileText, Trash2, Loader, Wand2, MessagesSquare, BrainCircuit } from 'lucide-react';

export default function AssistantView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [astRes, docsRes] = await Promise.all([getAssistant(id), getDocuments(id)]);
      setAssistant(astRes.data);
      setDocuments(docsRes.data);
    } catch (e) { console.error(e); }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAssistant(id, assistant);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 1800);
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadDocument(id, file);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Error al subir el documento');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (docId) => {
    try { await deleteDocument(id, docId); await loadData(); }
    catch (e) { console.error(e); }
  };

  const handleGenerateInstructions = async () => {
    if (documents.length === 0) { alert('Sube al menos un documento primero.'); return; }
    setIsGenerating(true);
    try {
      const res = await generateInstructions(id);
      setAssistant(prev => ({ ...prev, instructions: res.data.instructions }));
    } catch (e) {
      alert(e.response?.data?.detail || 'Error al generar instrucciones');
    } finally { setIsGenerating(false); }
  };

  if (!assistant) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Loader size={18} className="animate-spin" /> Cargando...
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-secondary" style={{ padding: '0.45rem', borderRadius: '9px', flexShrink: 0 }} onClick={() => navigate('/')}>
          <ChevronLeft size={19} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{assistant.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Instrucciones y base de conocimiento del asistente</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }} onClick={() => navigate(`/assistant/${id}/chat`)}>
          <MessagesSquare size={16} /> Ir al Chat
        </button>
      </div>

      <div className="page-body" style={{ display: 'flex', gap: '1.75rem' }}>

        {/* Config */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <BrainCircuit size={18} color="var(--amber)" />
              <h3 style={{ fontSize: '1rem' }}>Configuración</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nombre</label>
                <input style={{ width: '100%' }} value={assistant.name} onChange={e => setAssistant({ ...assistant, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.45rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Descripción</label>
                <input style={{ width: '100%' }} value={assistant.description || ''} onChange={e => setAssistant({ ...assistant, description: e.target.value })} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instrucciones de Sistema</label>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleGenerateInstructions}
                    disabled={isGenerating || documents.length === 0}
                    title={documents.length === 0 ? 'Sube documentos primero' : 'Generar desde los documentos'}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  >
                    {isGenerating ? <Loader size={13} className="animate-spin" /> : <Wand2 size={13} />}
                    {isGenerating ? 'Generando…' : 'Generar con IA'}
                  </button>
                </div>
                <textarea rows={10} style={{ width: '100%', resize: 'vertical' }} value={assistant.instructions} onChange={e => setAssistant({ ...assistant, instructions: e.target.value })} />
                {documents.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Sube documentos para habilitar la generación automática de instrucciones.
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button className="btn-primary" onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <BookmarkCheck size={16} />
                  {savedOk ? '¡Guardado!' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge base */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={17} color="var(--teal)" />
                Base de Conocimiento
              </h3>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.md,.pptx" onChange={handleUpload} />
              <button className="btn-secondary" onClick={() => fileInputRef.current.click()} disabled={isUploading} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
                {isUploading ? <Loader size={15} className="animate-spin" /> : <FolderOpen size={15} />}
                {isUploading ? 'Subiendo…' : 'Subir Archivo'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
              {documents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                  <FileText size={44} style={{ margin: '0 auto', opacity: 0.3, marginBottom: '0.9rem', color: 'var(--teal)' }} />
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>Sin documentos</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sube archivos para darle conocimiento al asistente</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: 'rgba(9,9,11,0.5)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <FileText size={17} color="var(--teal)" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(doc.created_at).toLocaleDateString('es-ES')}</div>
                      </div>
                    </div>
                    <button className="btn-danger" style={{ padding: '0.4rem', flexShrink: 0 }} onClick={() => handleDeleteDoc(doc.id)} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
