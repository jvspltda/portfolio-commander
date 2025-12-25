const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { updateAllPrices } = require('../services/priceUpdater'); // ← ADICIONAR

const router = express.Router();
const prisma = new PrismaClient();
```

---

### **2️⃣ NO FINAL (ANTES DE `module.exports = router;`):**

Adicione este bloco **ANTES** da última linha:

```javascript
// POST /api/assets/update-prices - Atualizar todos os preços
router.post('/update-prices', async (req, res) => {
  try {
    const result = await updateAllPrices();
    res.json({
      success: true,
      message: `${result.updated} preços atualizados, ${result.failed} falharam`,
      updated: result.updated,
      failed: result.failed
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
```

---

## 📄 CÓDIGO COMPLETO FINAL:

**Aqui está o arquivo COMPLETO como deve ficar:**

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { updateAllPrices } = require('../services/priceUpdater');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware: todas rotas requerem autenticação
router.use(authenticateToken);

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId: req.user.id,
        ativo: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30
        }
      }
    });
    
    if (!asset) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assets
router.post('/', async (req, res) => {
  try {
    const { ticker, name, carteira, tipo, quantidade, precoEntrada, precoAtual, currency, corretora } = req.body;
    
    if (!ticker || !carteira || !tipo || !quantidade || !precoEntrada) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    
    const asset = await prisma.asset.create({
      data: {
        userId: req.user.id,
        ticker: ticker.toUpperCase().trim(),
        name,
        carteira,
        tipo,
        quantidade: parseFloat(quantidade),
        precoEntrada: parseFloat(precoEntrada),
        precoAtual: precoAtual ? parseFloat(precoAtual) : parseFloat(precoEntrada),
        currency: currency || 'BRL',
        corretora
      }
    });
    
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/assets/:id
router.put('/:id', async (req, res) => {
  try {
    const { quantidade, precoAtual, corretora } = req.body;
    
    const updateData = {};
    if (quantidade !== undefined) updateData.quantidade = parseFloat(quantidade);
    if (precoAtual !== undefined) updateData.precoAtual = parseFloat(precoAtual);
    if (corretora !== undefined) updateData.corretora = corretora;
    
    const asset = await prisma.asset.updateMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      data: updateData
    });
    
    if (asset.count === 0) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }
    
    res.json({ message: 'Ativo atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const asset = await prisma.asset.updateMany({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id
      },
      data: { ativo: false }
    });
    
    if (asset.count === 0) {
      return res.status(404).json({ error: 'Ativo não encontrado' });
    }
    
    res.json({ message: 'Ativo removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assets/portfolio/summary
router.get('/portfolio/summary', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId: req.user.id,
        ativo: true
      }
    });
    
    const USD_BRL = 5.43;
    
    let totalA = 0;
    let totalB = 0;
    let investidoA = 0;
    let investidoB = 0;
    
    assets.forEach(a => {
      const valorAtual = a.quantidade * a.precoAtual * (a.currency === 'USD' ? USD_BRL : 1);
      const valorEntrada = a.quantidade * a.precoEntrada * (a.currency === 'USD' ? USD_BRL : 1);
      
      if (a.carteira === 'A') {
        totalA += valorAtual;
        investidoA += valorEntrada;
      } else {
        totalB += valorAtual;
        investidoB += valorEntrada;
      }
    });
    
    res.json({
      totalA,
      totalB,
      total: totalA + totalB,
      investidoA,
      investidoB,
      investidoTotal: investidoA + investidoB,
      lucroA: totalA - investidoA,
      lucroB: totalB - investidoB,
      lucroTotal: (totalA + totalB) - (investidoA + investidoB),
      numAtivos: assets.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assets/update-prices - Atualizar todos os preços
router.post('/update-prices', async (req, res) => {
  try {
    const result = await updateAllPrices();
    res.json({
      success: true,
      message: `${result.updated} preços atualizados, ${result.failed} falharam`,
      updated: result.updated,
      failed: result.failed
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
