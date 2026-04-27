import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateAssistant from './pages/CreateAssistant';
import AssistantView from './pages/AssistantView';
import ChatView from './pages/ChatView';
import AboutView from './pages/AboutView';
import MixView from './pages/MixView';
import { Cpu, LayoutGrid, FilePlus2, Globe, BookMarked } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar" style={{ borderRadius: 0, borderTop: 0, borderBottom: 0, borderLeft: 0 }}>

          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Cpu size={20} color="#f8f4ee" strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>RAG Manager</h2>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Multi-Asistente IA</p>
            </div>
          </div>

          <p className="section-title">Menú</p>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <LayoutGrid size={17} />
              <span>Mis Asistentes</span>
            </NavLink>

            <NavLink to="/create" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <FilePlus2 size={17} />
              <span>Crear Asistente</span>
            </NavLink>

            <NavLink to="/mix" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Globe size={17} />
              <span>Chat Global</span>
            </NavLink>

            <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <BookMarked size={17} />
              <span>Sobre el Proyecto</span>
            </NavLink>
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{
              padding: '0.7rem 0.9rem',
              borderRadius: '10px',
              background: 'var(--gradient-glow)',
              border: '1px solid rgba(155,127,212,0.15)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Desarrollado por<br />
                <span style={{ color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.01em' }}>alejandrobtez</span>
              </p>
            </div>
          </div>

        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateAssistant />} />
            <Route path="/assistant/:id" element={<AssistantView />} />
            <Route path="/assistant/:id/chat" element={<ChatView />} />
            <Route path="/mix" element={<MixView />} />
            <Route path="/about" element={<AboutView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
