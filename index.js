require('dotenv').config();
const express = require('express');
const app = express();

// Importe o arquivo cyclistCount.js
const cyclistCountsRouter = require('./cyclist-counts');
const cyclistCountsEditionsRouter = require('./cyclist-counts-editions');

const port = 3000; // Defina a porta desejada para a API

// Registre a rota "cyclist-count"
app.use('/cyclist-counts', cyclistCountsRouter);

// Registre a rota "cyclist-count"
app.use('/cyclist-counts-editions', cyclistCountsEditionsRouter);

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
