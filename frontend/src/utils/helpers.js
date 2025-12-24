// Taxa de câmbio USD/BRL (fixa por enquanto)
export const USD_BRL = 5.43;

// Formata moeda
export function formatCurrency(value, currency = 'BRL') {
  const val = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(val)) return 'R$ 0,00';
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

// Formata percentual
export function formatPercent(value, decimals = 2) {
  const val = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(val)) return '0%';
  
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

// Formata número grande (1000 -> 1k)
export function formatLargeNumber(value) {
  const val = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(val)) return '0';
  
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + 'M';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(1) + 'k';
  }
  return val.toFixed(0);
}

// Calcula valor total de um ativo
export function calculateValue(asset) {
  const value = asset.quantidade * asset.precoAtual;
  return asset.currency === 'USD' ? value * USD_BRL : value;
}

// Calcula P&L (Profit & Loss) de um ativo
export function calculatePL(asset) {
  const valorAtual = calculateValue(asset);
  const valorEntrada = asset.quantidade * asset.precoEntrada * (asset.currency === 'USD' ? USD_BRL : 1);
  
  if (valorEntrada === 0) return 0;
  
  return ((valorAtual - valorEntrada) / valorEntrada) * 100;
}

// Calcula lucro/prejuízo em reais
export function calculatePLValue(asset) {
  const valorAtual = calculateValue(asset);
  const valorEntrada = asset.quantidade * asset.precoEntrada * (asset.currency === 'USD' ? USD_BRL : 1);
  
  return valorAtual - valorEntrada;
}

// Formata data
export function formatDate(date, format = 'short') {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('pt-BR');
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
  
  if (format === 'datetime') {
    return d.toLocaleString('pt-BR');
  }
  
  return d.toLocaleDateString('pt-BR');
}

// Formata data relativa (há 2 horas, há 3 dias, etc)
export function formatRelativeTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays} dias`;
  
  return formatDate(d);
}

// Gera cor baseada em valor (verde/vermelho)
export function getColorFromValue(value) {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

// Gera cor de fundo baseada em valor
export function getBgColorFromValue(value) {
  if (value > 0) return 'bg-green-900/50';
  if (value < 0) return 'bg-red-900/50';
  return 'bg-gray-800';
}

// Trunca texto
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Valida email
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Download de arquivo
export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Exporta para CSV
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(','))
  ].join('\n');
  
  downloadFile(csv, filename, 'text/csv');
}

// Exporta para JSON
export function exportToJSON(data, filename = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

// Copia para clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Erro ao copiar:', err);
    return false;
  }
}