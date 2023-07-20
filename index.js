require('dotenv').config();
const express = require('express');
const cors = require('cors')
const app = express();

const port = 3000; // Defina a porta desejada para a API

app.use(cors())

const cyclistCountsRouter = require('./cyclist-counts');
app.use('/cyclist-counts', cyclistCountsRouter);

const cyclistCountsEditionsRouter = require('./cyclist-counts-editions');
app.use('/cyclist-counts-editions', cyclistCountsEditionsRouter);

const cyclistProfieRouter = require('./cyclist-profile');
app.use('/cyclist-profile', cyclistProfieRouter);

const cyclistProfileEditionsRouter = require('./cyclist-profile-editions'); // Importe o roteador para cyclist-profile-editions
app.use('/cyclist-profile-editions', cyclistProfileEditionsRouter); // Registre o roteador para cyclist-profile-editions

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
