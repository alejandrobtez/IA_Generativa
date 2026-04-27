import React, { useState, useEffect, useRef } from 'react';
import { getAssistants, mixChat } from '../api';
import { Globe, BrainCircuit, CornerDownLeft, Loader, User, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function MixView() {
  const [assistants, setAssistants] = useState([]);
  const [selected, setSelected] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getAssistants().then(res => setAssistants(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const toggleAssistant = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || selected.length === 0) return;
    const content = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsSending(true);
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    try {
      const res = await mixChat({ assistant_ids: selected, message: content, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer, citations: res.data.citations }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al obtener respuesta del servidor.', citations: [] }]);
    } finally { setIsSending(false); }
  };

  const selectedNames = assistants.filter(a => selected.includes(a.id)).map(a => a.name);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={22} color="var(--teal)" />
          <span className="gradient-text">Chat Global</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Selecciona varios asistentes para combinar su base de conocimiento en un único chat
        </p>
      </div>

      <div className="page-body" style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>

        {/* Selector */}
        <div className="glass-panel" style={{ width: '255px', flexShrink: 0, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Asistentes
          </p>
          {assistants.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No hay asistentes creados.</p>
          ) : (
            assistants.map(a => {
              const isActive = selected.includes(a.id);
              return (
                <div
                  key={a.id}
                  onClick={() => toggleAssistant(a.id)}
                  style={{
                    padding: '0.7rem 0.9rem', borderRadius: '10px', cursor: 'pointer',
                    border: `1px solid ${isActive ? 'rgba(155,127,212,0.3)' : 'var(--border-glass)'}`,
                    background: isActive ? 'rgba(155,127,212,0.07)' : 'transparent',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '9px',
                  }}
                >
                  <div style={{
                    width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0,
                    border: `2px solid ${isActive ? 'var(--amber)' : 'var(--text-muted)'}`,
                    background: isActive ? 'var(--amber)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isActive && <span style={{ color: '#f8f4ee', fontSize: '10px', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                    {a.description && (
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {selected.length >= 2 && (
            <div style={{ marginTop: 'auto', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'rgba(95,163,158,0.06)', border: '1px solid rgba(95,163,158,0.15)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Combinando: <strong style={{ color: 'var(--teal)' }}>{selectedNames.join(' + ')}</strong>
            </div>
          )}
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ textAlign: 'center' }}>
                <Globe size={50} style={{ margin: '0 auto', opacity: 0.25, marginBottom: '1rem', color: 'var(--teal)' }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Selecciona al menos un asistente</h3>
                <p style={{ fontSize: '0.88rem' }}>Marca dos o más asistentes del panel izquierdo para combinar su conocimiento</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ padding: '0.55rem 1.1rem', background: 'rgba(95,163,158,0.04)', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Globe size={13} color="var(--teal)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contexto activo:</span>
                {selectedNames.map((name, i) => (
                  <span key={i} className="tag" style={{ fontSize: '0.73rem', padding: '0.18rem 0.55rem' }}>{name}</span>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem', fontSize: '0.9rem' }}>
                      <Globe size={36} style={{ margin: '0 auto', opacity: 0.25, marginBottom: '0.75rem', color: 'var(--teal)' }} />
                      <p>Haz una pregunta para consultar el conocimiento combinado de los asistentes seleccionados.</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '0.9rem', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: isUser ? 'rgba(155,127,212,0.18)' : 'var(--bg-surface2)',
                          color: isUser ? 'var(--amber-light)' : 'var(--teal)',
                          border: isUser ? 'none' : '1px solid var(--border-glass)',
                        }}>
                          {isUser ? <User size={17} strokeWidth={2.5} /> : <Globe size={16} />}
                        </div>

                        <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            padding: '0.9rem 1.1rem',
                            borderRadius: '16px',
                            borderTopLeftRadius: isUser ? '16px' : '4px',
                            borderTopRightRadius: isUser ? '4px' : '16px',
                            background: isUser ? 'rgba(155,127,212,0.14)' : 'rgba(28,28,31,0.9)',
                            color: isUser ? 'var(--text-primary)' : 'var(--text-primary)',
                            border: isUser ? 'none' : '1px solid var(--border-glass)',
                            fontSize: '0.9rem', lineHeight: '1.6',
                          }}>
                            {isUser ? <span style={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>{msg.content}</span> : <ReactMarkdown>{msg.content}</ReactMarkdown>}
                          </div>

                          {!isUser && msg.citations && msg.citations.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                              {msg.citations.map((cite, i) => (
                                <span key={i} className="tag" style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>
                                  <FileText size={11} /> {cite}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div style={{ display: 'flex', gap: '0.9rem' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface2)', border: '1px solid var(--border-glass)', flexShrink: 0, color: 'var(--teal)' }}>
                        <Globe size={16} />
                      </div>
                      <div style={{ padding: '0.9rem 1.1rem', borderRadius: '16px', borderTopLeftRadius: '4px', background: 'rgba(28,28,31,0.9)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Loader size={16} className="animate-spin" style={{ color: 'var(--amber)' }} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Consultando {selectedNames.join(' + ')}…</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div style={{ padding: '1.25rem 2rem', background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--border-glass)' }}>
                <form onSubmit={handleSend} style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', gap: '0.75rem' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={`Pregunta a ${selectedNames.join(' + ')}…`}
                    style={{ flex: 1, padding: '0.85rem 1.25rem', background: 'var(--bg-surface2)', fontSize: '0.92rem', borderRadius: '12px' }}
                    disabled={isSending}
                  />
                  <button type="submit" className="btn-primary" style={{ borderRadius: '12px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '7px' }} disabled={isSending || !input.trim()}>
                    <CornerDownLeft size={17} /> Enviar
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
