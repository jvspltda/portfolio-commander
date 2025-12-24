// Tipos de ativo
export const ASSET_TYPES = [
  'RF',
  'Ação BR',
  'Ação USA',
  'ETF BR',
  'ETF USA',
  'Cripto',
  'Ouro',
  'CTAs',
  'Treasuries',
  'Commodity'
];

// Carteiras
export const CARTEIRAS = [
  { value: 'A', label: 'Carteira A (Tradicional)' },
  { value: 'B', label: 'Carteira B (Cripto)' }
];

// Moedas
export const CURRENCIES = [
  { value: 'BRL', label: 'Real (R$)', symbol: 'R$' },
  { value: 'USD', label: 'Dólar (US$)', symbol: 'US$' }
];

// Corretoras comuns
export const CORRETORAS = [
  'XP Investimentos',
  'BTG Pactual',
  'Rico',
  'Avenue',
  'Nomad',
  'Tesouro Direto',
  'Binance',
  'Coinbase',
  'Mercado Bitcoin',
  'Outro'
];

// Tipos de alerta
export const ALERT_TYPES = [
  { value: 'preco', label: 'Preço' },
  { value: 'percentual', label: 'Ganho/Perda %' },
  { value: 'alocacao', label: 'Alocação Portfolio' }
];

// Condições de alerta
export const ALERT_CONDITIONS = [
  { value: '>', label: 'Maior que (>)' },
  { value: '<', label: 'Menor que (<)' },
  { value: '>=', label: 'Maior ou igual (≥)' },
  { value: '<=', label: 'Menor ou igual (≤)' }
];

// Cores por tipo de ativo
export const ASSET_TYPE_COLORS = {
  'RF': '#6366f1',
  'Ação BR': '#10b981',
  'Ação USA': '#3b82f6',
  'ETF BR': '#8b5cf6',
  'ETF USA': '#06b6d4',
  'Cripto': '#f59e0b',
  'Ouro': '#fbbf24',
  'CTAs': '#ec4899',
  'Treasuries': '#14b8a6',
  'Commodity': '#ef4444'
};

// Meta de patrimônio
export const PORTFOLIO_GOAL = 6700000;

// Ano meta
export const GOAL_YEAR = 2031;

// CAGR necessário
export const REQUIRED_CAGR = 14.0;

// CAGR esperado
export const EXPECTED_CAGR = 27.9;

// Frequência de atualização (ms)
export const REFRESH_INTERVAL = 300000;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  AUTH: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER: 'Erro no servidor. Tente novamente mais tarde.',
  VALIDATION: 'Dados inválidos. Verifique os campos.',
  UNKNOWN: 'Erro desconhecido. Contate o suporte.'
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  ASSET_CREATED: 'Ativo adicionado com sucesso!',
  ASSET_UPDATED: 'Ativo atualizado com sucesso!',
  ASSET_DELETED: 'Ativo removido com sucesso!',
  ALERT_CREATED: 'Alerta criado com sucesso!',
  ALERT_DELETED: 'Alerta removido com sucesso!',
  PRICE_UPDATED: 'Preços atualizados com sucesso!'
};
