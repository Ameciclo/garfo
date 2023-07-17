require('dotenv').config();
const express = require('express');
const app = express();

// Importe o arquivo cyclistCount.js
const cyclistCountsRouter = require('./cyclist-counts');

const port = 3001; // Defina a porta desejada para a API

// Registre a rota "cyclist-count"
app.use('/cyclist-counts', cyclistCountsRouter);

// Rota para listar todos os endpoints
app.get('/', (req, res) => {
  const endpoints = [];

  // Percorra a lista de rotas registradas
  app._router.stack.forEach((route) => {
      console.log(route)
    if (route.route && route.route.path) {
      // Obtenha as informações sobre cada rota
      const method = Object.keys(route.route.methods)[0].toUpperCase();
      const path = route.route.path;

      // Crie um objeto com as informações da rota
      const endpoint = {
        method,
        path,
      };
      // Adicione o objeto à lista de endpoints
      endpoints.push(endpoint);
    }
  });

  // Retorne a lista de endpoints como resposta
  res.json(endpoints);
});

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
