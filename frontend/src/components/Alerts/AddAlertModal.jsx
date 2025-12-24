import React, { useState } from 'react';
import { createAlert } from '../../services/api';
import { ALERT_TYPES, ALERT_CONDITIONS } from '../../utils/constants';

export default function AddAlertModal({ assets, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    assetId: '',
    tipo: 'preco',
    condicao: '>',
    valorGatilho: '',
    acaoSugerida: '',
    notificarEmail: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!formData.assetId || !formData.valorGatilho || !formData.acaoSugerida) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    setLoading(true);
    
    try {
      await createAlert({
        ...formData,
        assetId: parseInt(formData.assetId),
        valorGatilho: parseFloat(formData.valorGatilho)
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar alerta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Criar Novo Alerta</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Ativo *</label>
            <select 
              className="input"
              value={formData.assetId}
              onChange={(e) => setFormData({...formData, assetId: e.target.value})}
              required
            >
              <option value="">Selecione um ativo...</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.ticker} - {asset.name || asset.tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Alerta *</label>
              <select 
                className="input"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                {ALERT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Condição *</label>
              <select 
                className="input"
                value={formData.condicao}
                onChange={(e) => setFormData({...formData, condicao: e.target.value})}
              >
                {ALERT_CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">
              Valor do Gatilho * 
              {formData.tipo === 'preco' ? ' (em reais ou dólares)' : ' (em %)'}
            </label>
            <input 
              type="number"
              step="0.01"
              className="input"
              value={formData.valorGatilho}
              onChange={(e) => setFormData({...formData, valorGatilho: e.target.value})}
              placeholder={formData.tipo === 'preco' ? 'Ex: 100.00' : 'Ex: 30'}
              required
            />
          </div>

          <div>
            <label className="label">Ação Sugerida *</label>
            <textarea 
              className="input"
              rows="3"
              value={formData.acaoSugerida}
              onChange={(e) => setFormData({...formData, acaoSugerida: e.target.value})}
              placeholder="Ex: Vender 20% da posição"
              required
            />
          </div>

          <div className="flex items-center">
            <input 
              type="checkbox"
              id="notificarEmail"
              checked={formData.notificarEmail}
              onChange={(e) => setFormData({...formData, notificarEmail: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="notificarEmail" className="ml-2 text-sm text-gray-300">
              Notificar por email (em breve)
            </label>
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
              {loading ? 'Criando...' : 'Criar Alerta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}