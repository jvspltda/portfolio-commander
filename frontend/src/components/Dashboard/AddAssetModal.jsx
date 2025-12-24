import React, { useState } from 'react';
import { createAsset } from '../../services/api';
import { ASSET_TYPES, CARTEIRAS, CURRENCIES, CORRETORAS } from '../../utils/constants';

export default function AddAssetModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    ticker: '',
    name: '',
    carteira: 'A',
    tipo: 'Ação BR',
    quantidade: '',
    precoEntrada: '',
    precoAtual: '',
    currency: 'BRL',
    corretora: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!formData.ticker || !formData.quantidade || !formData.precoEntrada) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    setLoading(true);
    
    try {
      await createAsset({
        ...formData,
        quantidade: parseFloat(formData.quantidade),
        precoEntrada: parseFloat(formData.precoEntrada),
        precoAtual: formData.precoAtual ? parseFloat(formData.precoAtual) : parseFloat(formData.precoEntrada)
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar ativo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Adicionar Novo Ativo</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Ticker / Símbolo *</label>
              <input 
                type="text"
                className="input"
                value={formData.ticker}
                onChange={(e) => setFormData({...formData, ticker: e.target.value.toUpperCase()})}
                placeholder="Ex: PETR4, BTC, AAPL"
                required
              />
            </div>

            <div>
              <label className="label">Nome (opcional)</label>
              <input 
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Petrobras"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Carteira *</label>
              <select 
                className="input"
                value={formData.carteira}
                onChange={(e) => setFormData({...formData, carteira: e.target.value})}
              >
                {CARTEIRAS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tipo *</label>
              <select 
                className="input"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                {ASSET_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Quantidade *</label>
              <input 
                type="number"
                step="0.0001"
                className="input"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                placeholder="Ex: 100"
                required
              />
            </div>

            <div>
              <label className="label">Preço de Entrada *</label>
              <input 
                type="number"
                step="0.01"
                className="input"
                value={formData.precoEntrada}
                onChange={(e) => setFormData({...formData, precoEntrada: e.target.value})}
                placeholder="Ex: 25.50"
                required
              />
            </div>

            <div>
              <label className="label">Preço Atual</label>
              <input 
                type="number"
                step="0.01"
                className="input"
                value={formData.precoAtual}
                onChange={(e) => setFormData({...formData, precoAtual: e.target.value})}
                placeholder="Deixe vazio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Moeda *</label>
              <select 
                className="input"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Corretora</label>
              <select 
                className="input"
                value={formData.corretora}
                onChange={(e) => setFormData({...formData, corretora: e.target.value})}
              >
                <option value="">Selecione...</option>
                {CORRETORAS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Adicionando...' : 'Adicionar Ativo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}