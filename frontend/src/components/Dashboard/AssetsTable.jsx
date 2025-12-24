import React from 'react';
import { formatCurrency, formatPercent, calculateValue, calculatePL } from '../../utils/helpers';

export default function AssetsTable({ assets, onDelete, onUpdatePrice }) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-lg font-medium mb-1">Nenhum ativo encontrado</p>
        <p className="text-sm">Adicione seu primeiro ativo para começar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Ativo</th>
            <th className="text-center">Cart.</th>
            <th className="text-right">Quantidade</th>
            <th className="text-right">Preço Atual</th>
            <th className="text-right">Valor Total</th>
            <th className="text-right">P&L</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(asset => {
            const valor = calculateValue(asset);
            const pl = calculatePL(asset);
            const decimals = asset.tipo === 'Cripto' ? 4 : 0;
            
            return (
              <tr key={asset.id}>
                <td>
                  <div>
                    <p className="font-bold text-white">{asset.ticker}</p>
                    <p className="text-xs text-gray-400">{asset.tipo}</p>
                  </div>
                </td>
                <td className="text-center">
                  <span className={`badge ${asset.carteira === 'A' ? 'badge-info' : 'badge-warning'}`}>
                    {asset.carteira}
                  </span>
                </td>
                <td className="text-right font-mono text-sm">
                  {asset.quantidade.toFixed(decimals)}
                </td>
                <td className="text-right">
                  <input 
                    type="number"
                    step="0.01"
                    value={asset.precoAtual}
                    onChange={(e) => onUpdatePrice(asset.id, e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 w-28 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="text-right font-bold text-white">
                  {formatCurrency(valor)}
                </td>
                <td className={`text-right font-bold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(pl)}
                </td>
                <td className="text-right">
                  <button 
                    onClick={() => onDelete(asset.id)}
                    className="p-2 rounded hover:bg-red-600 transition-colors"
                    title="Remover"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}