import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  
  const menuItems = [
    {
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Dashboard',
      description: 'Visão geral do portfólio'
    },
    {
      path: '/alerts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: 'Alertas',
      description: 'Gerenciar alertas de preço'
    },
    {
      path: '/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Relatórios',
      description: 'Performance e análises'
    }
  ];
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 w-64 bg-gray-800 border-r border-gray-700 z-40 transform transition-transform duration-300 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {item.icon}
            <div className="flex-1">
              <p className="font-medium">{item.label}</p>
              <p className="text-xs opacity-75">{item.description}</p>
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="p-4 m-4 bg-blue-900/30 border border-blue-700 rounded-lg">
        <p className="text-sm font-medium text-blue-300 mb-2">💡 Dica</p>
        <p className="text-xs text-gray-300">
          Preços atualizam automaticamente todo dia às 9h.
        </p>
      </div>
    </aside>
  );
}