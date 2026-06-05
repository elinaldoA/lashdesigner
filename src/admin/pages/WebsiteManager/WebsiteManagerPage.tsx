import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../../shared/store/useStore';
import { Globe, Image, MessageSquare, Settings, Scissors, Info, Phone, Store } from 'lucide-react';

// Sub-editors
import HeroEditor from './sections/HeroEditor';
import AboutEditor from './sections/AboutEditor';
import ServicesEditor from './sections/ServicesEditor';
import GalleryManager from './sections/GalleryManager';
import TestimonialsEditor from './sections/TestimonialsEditor';
import ContactEditor from './sections/ContactEditor';
import SiteSettingsEditor from './sections/SiteSettingsEditor';
import MessagesViewer from './sections/MessagesViewer';
import StoreEditor from './sections/StoreEditor';

const tabs = [
  { path: '', label: 'Hero/Home', icon: Globe, end: true },
  { path: 'sobre', label: 'Sobre', icon: Info },
  { path: 'servicos', label: 'Serviços', icon: Scissors },
  { path: 'galeria', label: 'Galeria', icon: Image },
  { path: 'depoimentos', label: 'Depoimentos', icon: MessageSquare },
  { path: 'contato', label: 'Contato', icon: Phone },
  { path: 'loja', label: 'Loja', icon: Store },
  { path: 'mensagens', label: 'Mensagens', icon: MessageSquare },
  { path: 'configuracoes', label: 'Configurações', icon: Settings },
];

export default function WebsiteManagerPage() {
  const { contactMessages } = useStore(s => ({ contactMessages: s.contactMessages }));
  const unread = contactMessages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Gerenciar Site</h1>
        <p className="text-sm text-gray-500 mt-1">Edite o conteúdo do site institucional em tempo real</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <NavLink
                key={tab.path}
                to={`/admin/website${tab.path ? '/' + tab.path : ''}`}
                end={tab.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <tab.icon size={16} />
                <span className="flex-1">{tab.label}</span>
                {tab.path === 'mensagens' && unread > 0 && (
                  <span className="w-5 h-5 bg-pink-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unread}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route index element={<HeroEditor />} />
            <Route path="sobre" element={<AboutEditor />} />
            <Route path="servicos" element={<ServicesEditor />} />
            <Route path="galeria" element={<GalleryManager />} />
            <Route path="depoimentos" element={<TestimonialsEditor />} />
            <Route path="contato" element={<ContactEditor />} />
            <Route path="loja" element={<StoreEditor />} />
            <Route path="mensagens" element={<MessagesViewer />} />
            <Route path="configuracoes" element={<SiteSettingsEditor />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
