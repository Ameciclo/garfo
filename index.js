require('dotenv').config();
const express = require('express');
const app = express();

const port = 3000; // Defina a porta desejada para a API

const cyclistCountsRouter = require('./cyclist-counts');
app.use('/cyclist-counts', cyclistCountsRouter);

const cyclistCountsEditionsRouter = require('./cyclist-counts-editions');
app.use('/cyclist-counts-editions', cyclistCountsEditionsRouter);

const cyclistProfieRouter = require('./cyclist-profile');
app.use('/cyclist-profile', cyclistProfieRouter);


app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
