import React, { useState, useEffect } from 'react';
import { getAssets, getPortfolioSummary } from '../../services/api';
import { formatCurrency, calculateValue, calculatePL, exportToCSV, exportToJSON } from '../../utils/helpers';
import { PORTFOLIO_GOAL, EXPECTED_CAGR } from '../../utils/constants';

export default function ReportsView() {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

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

  function handleExportCSV() {
    const data = assets.map(a => ({
      Ticker: a.ticker,
      Nome: a.name || '',
      Carteira: a.carteira,
      Tipo: a.tipo,
      Quantidade: a.quantidade,
      PrecoEntrada: a.precoEntrada,
      PrecoAtual: a.precoAtual,
      Moeda: a.currency,
      ValorTotal: calculateValue(a),
      'P&L%': calculatePL(a).toFixed(2),
      Corretora: a.corretora || ''
    }));
    exportToCSV(data, `portfolio-${new Date().toISOString().split('T')[0]}.csv`);
  }

  function handleExportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      summary,
      assets: assets.map(a => ({
        ...a,
        valorTotal: calculateValue(a),
        pl: calculatePL(a)
      }))
    };
    exportToJSON(data, `portfolio-${new Date().toISOString().split('T')[0]}.json`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const topPerformers = assets
    .map(a => ({ ...a, pl: calculatePL(a), valor: calculateValue(a) }))
    .sort((a, b) => b.pl - a.pl)
    .slice(0, 5);

  const worstPerformers = assets
    .map(a => ({ ...a, pl: calculatePL(a), valor: calculateValue(a) }))
    .sort((a, b) => a.pl - b.pl)
    .slice(0, 5);

  const byType = {};
  assets.forEach(a => {
    const tipo = a.tipo;
    if (!byType[tipo]) byType[tipo] = 0;
    byType[tipo] += calculateValue(a);
  });

  const progressToGoal = ((summary?.total || 0) / PORTFOLIO_GOAL) * 100;
  const yearsToGoal = 2031 - new Date().getFullYear();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Relatórios e Análises</h2>
          <p className="text-sm text-gray-400">Visão detalhada do seu portfólio</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary text-sm">
            📊 Exportar CSV
          </button>
          <button onClick={handleExportJSON} className="btn-secondary text-sm">
            💾 Exportar JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Patrimônio Total</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.total || 0)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Investido</p>
          <p className="text-2xl font-bold">{formatCurrency(summary?.investidoTotal || 0)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Lucro Total</p>
          <p className={`text-2xl font-bold ${summary?.lucroTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(summary?.lucroTotal || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Retorno (%)</p>
          <p className={`text-2xl font-bold ${summary?.lucroTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary?.investidoTotal > 0 
              ? ((summary.lucroTotal / summary.investidoTotal) * 100).toFixed(2) + '%'
              : '0%'}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4">🎯 Progresso até a Meta (R$ 6.7M em 2031)</h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progresso</span>
            <span className="font-bold">{progressToGoal.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressToGoal, 100)}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Faltam</p>
            <p className="text-xl font-bold">{formatCurrency(PORTFOLIO_GOAL - (summary?.total || 0))}</p>
          </div>
          <div>
            <p className="text-gray-400">Anos restantes</p>
            <p className="text-xl font-bold">{yearsToGoal} anos</p>
          </div>
          <div>
            <p className="text-gray-400">CAGR esperado</p>
            <p className="text-xl font-bold text-green-400">{EXPECTED_CAGR}% a.a.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">🏆 Top 5 Ganhos</h3>
          <div className="space-y-3">
            {topPerformers.map((asset, idx) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-600">#{idx + 1}</span>
                  <div>
                    <p className="font-bold">{asset.ticker}</p>
                    <p className="text-xs text-gray-400">{asset.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">+{asset.pl.toFixed(2)}%</p>
                  <p className="text-sm text-gray-400">{formatCurrency(asset.valor)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4">📉 Top 5 Perdas</h3>
          <div className="space-y-3">
            {worstPerformers.map((asset, idx) => (
              <div key={asset.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-600">#{idx + 1}</span>
                  <div>
                    <p className="font-bold">{asset.ticker}</p>
                    <p className="text-xs text-gray-400">{asset.tipo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-400">{asset.pl.toFixed(2)}%</p>
                  <p className="text-sm text-gray-400">{formatCurrency(asset.valor)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4">📊 Alocação por Tipo de Ativo</h3>
        <div className="space-y-3">
          {Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .map(([tipo, valor]) => {
              const percent = ((valor / (summary?.total || 1)) * 100);
              return (
                <div key={tipo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{tipo}</span>
                    <span className="text-gray-400">{percent.toFixed(1)}% • {formatCurrency(valor)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Carteira A (Tradicional)</h3>
          <p className="text-3xl font-bold mb-2">{formatCurrency(summary?.totalA || 0)}</p>
          <p className="text-sm text-gray-400">
            {((summary?.totalA / summary?.total * 100) || 0).toFixed(1)}% do portfólio
          </p>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Carteira B (Cripto)</h3>
          <p className="text-3xl font-bold mb-2">{formatCurrency(summary?.totalB || 0)}</p>
          <p className="text-sm text-gray-400">
            {((summary?.totalB / summary?.total * 100) || 0).toFixed(1)}% do portfólio
          </p>
        </div>
      </div>
    </div>
  );
}