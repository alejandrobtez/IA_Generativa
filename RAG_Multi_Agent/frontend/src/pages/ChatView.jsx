import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssistant, getConversations, createConversation, getConversation, sendMessage, uploadDocument, getDocuments, deleteDocument, deleteConversation } from '../api';
import { ChevronLeft, CornerDownLeft, MessagesSquare, MessageSquarePlus, Loader, FileText, User, BrainCircuit, FolderOpen, Trash2, Library, ChevronDown, ChevronUp, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assistant, setAssistant] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [docsExpanded, setDocsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadDocuments = useCallback(async () => {
    try { const res = await getDocuments(id); setDocuments(res.data); }
    catch (e) { console.error(e); }
  }, [id]);

  useEffect(() => {
    getAssistant(id).then(res => setAssistant(res.data)).catch(console.error);
    getConversations(id).then(res => setConversations(res.data)).catch(console.error);
    getDocuments(id).then(res => setDocuments(res.data)).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!activeConvId) return;
    getConversation(activeConvId).then(res => setMessages(res.data.messages || [])).catch(console.error);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try { await uploadDocument(id, file); await loadDocuments(); }
    catch { alert('Error al subir el documento'); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const handleDeleteDoc = async (docId) => {
    try { await deleteDocument(id, docId); await loadDocuments(); }
    catch (e) { console.error(e); }
  };

  const handleNewChat = async () => {
    try {
      const res = await createConversation({ assistant_id: id });
      setConversations([...conversations, res.data]);
      setActiveConvId(res.data.id);
      setMessages([]);
    } catch (e) { console.error(e); }
  };

  const handleExportChat = () => {
    if (!messages.length) return;
    const lines = [`# Chat: ${assistant.name}\n`];
    messages.forEach(msg => {
      const role = msg.role === 'user' ? '**Usuario**' : `**${assistant.name}**`;
      lines.push(`${role}\n\n${msg.content}`);
      if (msg.citations) {
        try {
          const cites = JSON.parse(msg.citations);
          if (cites.length) lines.push(`*Fuentes: ${cites.join(', ')}*`);
        } catch { /* noop */ }
      }
      lines.push('---');
    });
    const blob = new Blob([lines.join('\n\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${assistant.name}-${activeConvId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConvId) return;
    const isFirstMessage = messages.length === 0;
    const content = input;
    setInput('');
    setMessages([...messages, { role: 'user', content }]);
    setIsSending(true);
    try {
      const res = await sendMessage(activeConvId, content);
      setMessages(prev => [...prev, res.data]);
      if (isFirstMessage) {
        const convRes = await getConversations(id);
        setConversations(convRes.data);
      }
    } catch (e) {
      console.error(e);
      alert('Error al enviar el mensaje');
    } finally { setIsSending(false); }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) { setActiveConvId(null); setMessages([]); }
    } catch (err) { console.error(err); }
  };

  if (!assistant) return (
    <div style={{ padding: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Loader size={18} className="animate-spin" /> Cargando...
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', height: '100%' }}>

      {/* Sidebar */}
      <div style={{ width: '255px', borderRight: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', background: 'rgba(9,9,11,0.7)', flexShrink: 0 }}>
        <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-secondary" style={{ padding: '0.35rem', borderRadius: '8px', flexShrink: 0 }} onClick={() => navigate('/')}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assistant.name}</span>
        </div>

        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '0.85rem', padding: '0.6rem' }} onClick={handleNewChat}>
            <MessageSquarePlus size={16} /> Nuevo Chat
          </button>

          {/* Knowledge base toggle */}
          <div style={{ border: '1px solid var(--border-glass)', borderRadius: '9px', overflow: 'hidden' }}>
            <button
              onClick={() => setDocsExpanded(!docsExpanded)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Library size={14} color="var(--teal)" />
                Documentos ({documents.length})
              </span>
              {docsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {docsExpanded && (
              <div style={{ borderTop: '1px solid var(--border-glass)', padding: '0.5rem' }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.md,.pptx" onChange={handleUpload} />
                <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.45rem', fontSize: '0.78rem', marginBottom: '0.45rem' }} onClick={() => fileInputRef.current.click()} disabled={isUploading}>
                  {isUploading ? <Loader size={13} className="animate-spin" /> : <FolderOpen size={13} />}
                  {isUploading ? 'Subiendo…' : 'Subir documento'}
                </button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '160px', overflowY: 'auto' }}>
                  {documents.length === 0 ? (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.4rem 0' }}>Sin documentos</p>
                  ) : (
                    documents.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: 'rgba(9,9,11,0.5)', borderRadius: '7px', border: '1px solid var(--border-glass)' }}>
                        <span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                          <FileText size={11} color="var(--teal)" /> {doc.filename}
                        </span>
                        <button onClick={() => handleDeleteDoc(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', flexShrink: 0 }} title="Eliminar">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.85rem 0.85rem' }}>
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              style={{
                padding: '0.5rem 0.7rem', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px',
                background: activeConvId === conv.id ? 'rgba(155,127,212,0.08)' : 'transparent',
                border: activeConvId === conv.id ? '1px solid rgba(155,127,212,0.2)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <MessagesSquare size={14} style={{ flexShrink: 0, color: activeConvId === conv.id ? 'var(--amber)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, color: activeConvId === conv.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {conv.title}
              </span>
              <button onClick={(e) => handleDeleteConversation(e, conv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', flexShrink: 0, opacity: 0.7 }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {!activeConvId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center' }}>
              <BrainCircuit size={52} style={{ margin: '0 auto', opacity: 0.25, marginBottom: '1rem', color: 'var(--amber)' }} />
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Bienvenido a {assistant.name}</h3>
              <p style={{ fontSize: '0.88rem' }}>Selecciona una conversación o inicia un chat nuevo para empezar.</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem', fontSize: '0.9rem' }}>
                    Escribe un mensaje para iniciar la conversación.
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  let citations = [];
                  if (msg.citations) { try { citations = JSON.parse(msg.citations); } catch { /* noop */ } }

                  return (
                    <div key={idx} style={{ display: 'flex', gap: '0.9rem', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        background: isUser ? 'rgba(155,127,212,0.18)' : 'var(--bg-surface2)',
                        color: isUser ? 'var(--amber-light)' : 'var(--teal)',
                        border: isUser ? 'none' : '1px solid var(--border-glass)',
                      }}>
                        {isUser ? <User size={17} strokeWidth={2.5} /> : <BrainCircuit size={17} />}
                      </div>

                      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          padding: '0.9rem 1.1rem',
                          borderRadius: '16px',
                          borderTopLeftRadius: isUser ? '16px' : '4px',
                          borderTopRightRadius: isUser ? '4px' : '16px',
                          background: isUser ? 'rgba(155,127,212,0.14)' : 'rgba(28, 28, 31, 0.9)',
                          color: isUser ? 'var(--text-primary)' : 'var(--text-primary)',
                          border: isUser ? 'none' : '1px solid var(--border-glass)',
                          fontSize: '0.9rem',
                          lineHeight: '1.6',
                        }}>
                          {isUser ? (
                            <span style={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>{msg.content}</span>
                          ) : (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          )}
                        </div>

                        {!isUser && citations.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {citations.map((cite, i) => (
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
                      <BrainCircuit size={17} />
                    </div>
                    <div style={{ padding: '0.9rem 1.1rem', borderRadius: '16px', borderTopLeftRadius: '4px', background: 'rgba(28,28,31,0.9)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader size={16} className="animate-spin" style={{ color: 'var(--amber)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Buscando contexto y generando respuesta…</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input bar */}
            <div style={{ padding: '1.25rem 2rem', background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--border-glass)' }}>
              <form onSubmit={handleSend} style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', gap: '0.75rem' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Pregunta a ${assistant.name}…`}
                  style={{ flex: 1, padding: '0.85rem 1.25rem', background: 'var(--bg-surface2)', fontSize: '0.92rem', borderRadius: '12px' }}
                  disabled={isSending}
                />
                <button type="button" className="btn-secondary" title="Exportar chat como Markdown" onClick={handleExportChat} disabled={!messages.length} style={{ borderRadius: '12px', padding: '0 0.9rem', display: 'flex', alignItems: 'center' }}>
                  <Download size={17} />
                </button>
                <button type="submit" className="btn-primary" style={{ borderRadius: '12px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '7px' }} disabled={isSending || !input.trim()}>
                  <CornerDownLeft size={17} />
                  Enviar
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
