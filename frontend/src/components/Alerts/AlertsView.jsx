import React, { useState, useEffect } from 'react';
import { getAlerts, getAssets, toggleAlert, deleteAlert } from '../../services/api';
import AddAlertModal from './AddAlertModal';
import { formatCurrency } from '../../utils/helpers';

export default function AlertsView() {
  const [alerts, setAlerts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [alertsRes, assetsRes] = await Promise.all([
        getAlerts(),
        getAssets()
      ]);
      setAlerts(alertsRes.data);
      setAssets(assetsRes.data);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id) {
    try {
      await toggleAlert(id);
      setAlerts(prev => prev.map(a => 
        a.id === id ? { ...a, ativo: !a.ativo } : a
      ));
    } catch (error) {
      alert('Erro ao alternar alerta');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover este alerta?')) return;
    
    try {
      await deleteAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert('Erro ao remover alerta');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.ativo);
  const inactiveAlerts = alerts.filter(a => !a.ativo);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Alertas</h2>
          <p className="text-sm text-gray-400">{activeAlerts.length} alertas ativos</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Alerta
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Ativos</h3>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <AlertCard 
                key={alert.id}
                alert={alert}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {inactiveAlerts.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4 text-gray-400">Desativados</h3>
          <div className="space-y-3">
            {inactiveAlerts.map(alert => (
              <AlertCard 
                key={alert.id}
                alert={alert}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-lg font-medium mb-1">Nenhum alerta configurado</p>
          <p className="text-sm">Clique em "Novo Alerta" para começar</p>
        </div>
      )}

      {showAddModal && (
        <AddAlertModal 
          assets={assets}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function AlertCard({ alert, onToggle, onDelete }) {
  const getValueDisplay = () => {
    if (alert.tipo === 'preco') {
      return formatCurrency(alert.valorGatilho, alert.asset.currency);
    }
    return `${alert.valorGatilho}%`;
  };

  return (
    <div className={`p-4 rounded-lg border ${
      alert.ativo 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-900/50 border-gray-800'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-bold">{alert.asset.ticker}</h4>
            <span className={`badge ${alert.ativo ? 'badge-success' : 'badge-danger'}`}>
              {alert.ativo ? 'Ativo' : 'Desativado'}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-1">
            {alert.tipo === 'preco' ? 'Preço' : 'Ganho/Perda'} {alert.condicao} {getValueDisplay()}
          </p>
          <p className="text-sm text-yellow-400">→ {alert.acaoSugerida}</p>
          {alert.lastTriggered && (
            <p className="text-xs text-gray-500 mt-2">
              Último disparo: {new Date(alert.lastTriggered).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onToggle(alert.id)}
            className={`px-3 py-1 rounded text-sm ${
              alert.ativo ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-700 hover:bg-green-600'
            }`}
          >
            {alert.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button
            onClick={() => onDelete(alert.id)}
            className="btn-danger text-sm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}