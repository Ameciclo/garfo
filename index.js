const express = require('express');
const app = express();

// Defina as rotas da sua API aqui

app.get('/', (req, res) => {
  res.send('Hello, World!');
});


const port = 3000;
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
