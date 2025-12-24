import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Header({ user, onLogout, onToggleSidebar, onToggleNotifications }) {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/alerts': return 'Alertas';
      case '/reports': return 'Relatórios';
      default: return 'Portfolio Commander';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Menu Hamburger + Logo + Title */}
          <div className="flex items-center space-x-4">
            {/* MENU HAMBURGER - SEMPRE VISÍVEL */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Logo + Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">{getPageTitle()}</h1>
                <p className="text-xs text-gray-400 hidden md:block">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right: Notifications + User */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              onClick={onToggleNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title="Notificações"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="notification-badge">3</span>
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-600 transition-colors"
                title="Sair"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}