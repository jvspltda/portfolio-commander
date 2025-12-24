import React, { useState, useEffect } from 'react';
import { getAssets, getPortfolioSummary, deleteAsset, updateAsset } from '../../services/api';
import AssetsTable from './AssetsTable';
import AddAssetModal from './AddAssetModal';
import { formatCurrency } from '../../utils/helpers';

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [assetsRes, summaryRes] = await Promise.all([
        getAssets(),
        getPortfolioSummary()
      ]);
      setAssets(assetsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja remover este ativo?')) return;
    
    try {
      await deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      fetchData();
    } catch (error) {
      alert('Erro ao remover ativo: ' + error.message);
    }
  }

  async function handleUpdatePrice(id, newPrice) {
    try {
      await updateAsset(id, { precoAtual: parseFloat(newPrice) });
      setAssets(prev => prev.map(a => 
        a.id === id ? { ...a, precoAtual: parseFloat(newPrice) } : a
      ));
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar preço: ' + error.message);
    }
  }

  const filteredAssets = assets.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'A' || filter === 'B') return a.carteira === filter;
    return a.tipo === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-400">Carteira A</h3>
            <span className="badge badge-info">Tradicional</span>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(summary?.totalA || 0)}</p>
          <div className="flex items-center text-sm">
            <span className="text-gray-400 mr-2">Lucro:</span>
            <span className={summary?.lucroA >= 0 ? 'text-green-400' : 'text-red-400'}>
              {formatCurrency(summary?.lucroA || 0)}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-400">Carteira B</h3>
            <span className="badge badge-warning">Cripto</span>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(summary?.totalB || 0)}</p>
          <div className="flex items-center text-sm">
            <span className="text-gray-400 mr-2">Lucro:</span>
            <span className={summary?.lucroB >= 0 ? 'text-green-400' : 'text-red-400'}>
              {formatCurrency(summary?.lucroB || 0)}
            </span>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-blue-200">Patrimônio Total</h3>
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold mb-1">{formatCurrency(summary?.total || 0)}</p>
          <div className="flex items-center text-sm">
            <span className="text-blue-200 mr-2">Meta R$ 6.7M:</span>
            <span className="text-blue-100 font-medium">
              {((summary?.total || 0) / 6700000 * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Ativos</h2>
            <p className="text-sm text-gray-400">{filteredAssets.length} ativos encontrados</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Ativo
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'A', 'B', 'RF', 'Ação BR', 'Ação USA', 'Cripto'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>

        <AssetsTable 
          assets={filteredAssets}
          onDelete={handleDelete}
          onUpdatePrice={handleUpdatePrice}
        />
      </div>

      {showAddModal && (
        <AddAssetModal 
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