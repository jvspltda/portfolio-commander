import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';

export default function Layout({ children, user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        user={user}
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleNotifications={() => setNotificationPanelOpen(!notificationPanelOpen)}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main Content - Ocupa tela toda sem espaço para sidebar */}
        <main className="flex-1 p-4 md:p-8 mt-16">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <NotificationPanel 
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
        />
      </div>
      
      {/* Overlay para mobile E desktop */}
      {(sidebarOpen || notificationPanelOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setSidebarOpen(false);
            setNotificationPanelOpen(false);
          }}
        />
      )}
    </div>
  );
}