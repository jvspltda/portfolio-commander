const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas' 
      });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'super-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro no servidor' 
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ user });
    
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;