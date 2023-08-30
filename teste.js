require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');

const secretKey = process.env.UPDATE_SECRET;
const app = express();

// Usuários simulados (para simplificação, você usaria um banco de dados real)
const temporaryUsersList = [
  { id: 1, username: process.env.UPDATE_USER, password: process.env.UPDATE_PASSWORD },
];

app.use(bodyParser.json());

// Endpoint de autenticação (gera um token JWT)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Verifica se as credenciais são válidas (simulação)
  const user = temporaryUsersList.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  // Credenciais válidas, gera um token JWT
  const token = jwt.sign({ user: user.id }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// Endpoint protegido
app.get('/endpoint-protegido', authMiddleware, (req, res) => {
  res.json({ message: 'Este é um endpoint protegido!' });
});


app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
