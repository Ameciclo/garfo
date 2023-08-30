// Import necessary modules and packages
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/authMiddleware');
const citiesRouter = require("./modules/cities/cities");

const cyclistCountsRouter = require("./modules/cyclist-counts/summary");
const cyclistCountsEditionsRouter = require("./modules/cyclist-counts/editions");

const cyclistProfileRouter = require("./modules/cyclist-profile/summary");
const cyclistProfileEditionsRouter = require("./modules/cyclist-profile/editions");

const cyclistInfraRelationsByCityRouter = require("./modules/cyclist-infra/relations-by-city.js");
const cyclistInfraRelationsRouter = require("./modules/cyclist-infra/relations");
const cyclistInfraRelationRouter = require("./modules/cyclist-infra/relation");
const cyclistInfraWaysRouter = require("./modules/cyclist-infra/ways");
const cyclistInfraUpdateRouter = require("./modules/cyclist-infra/updater");

const port = 3000; // Define the desired port for the API

// Create an instance of Express app
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// ROUTES
app.use("/cities", citiesRouter);
app.use("/cyclist-counts", cyclistCountsRouter);
app.use("/cyclist-counts/edition", cyclistCountsEditionsRouter);
app.use("/cyclist-profile", cyclistProfileRouter);
app.use("/cyclist-profile/edition", cyclistProfileEditionsRouter);
app.use("/cyclist-infra/relations", cyclistInfraRelationsRouter);
app.use("/cyclist-infra/relationsByCity", cyclistInfraRelationsByCityRouter);
app.use("/cyclist-infra/relation", cyclistInfraRelationRouter);
app.use("/cyclist-infra/ways", cyclistInfraWaysRouter);


// Usuários simulados (para simplificação, você usaria um banco de dados real)
const temporaryUsersList = [
  { id: 1, username: process.env.UPDATE_USER, password: process.env.UPDATE_PASSWORD },
];

const secretKey = process.env.UPDATE_SECRET;

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

app.use("/cyclist-infra/update", authMiddleware, cyclistInfraUpdateRouter);

// Rota para servir a página de login
app.get("/login-page", (req, res) => {
  const routesListHtml = fs.readFileSync("login.html", "utf8");
  res.send(routesListHtml);
});


// Rota para servir a página de listagem de rotas
app.get("/api-routes", (req, res) => {
  const routesListHtml = fs.readFileSync("api-routes.html", "utf8");
  res.send(routesListHtml);
});

// Start the Express app listening on the specified port
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
