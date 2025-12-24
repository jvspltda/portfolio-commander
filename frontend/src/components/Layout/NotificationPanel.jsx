import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/api';
import { formatRelativeTime } from '../../utils/helpers';

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  async function fetchNotifications() {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <aside 
      className={`fixed right-0 top-16 bottom-0 w-80 bg-gray-800 border-l border-gray-700 z-40 transform transition-transform duration-300 overflow-y-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Notificações</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Marcar todas como lidas ({unreadCount})
          </button>
        )}
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  notification.lida
                    ? 'bg-gray-900/50 border-gray-700'
                    : 'bg-blue-900/20 border-blue-700'
                }`}
                onClick={() => !notification.lida && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {notification.lida ? (
                      <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.lida ? 'text-gray-400' : 'text-white font-medium'}`}>
                      {notification.mensagem}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}