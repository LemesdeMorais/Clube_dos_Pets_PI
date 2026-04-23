const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const categoriaRoutes = require('./routes/categoriaRoutes');
const estabelecimentoRoutes = require('./routes/estabelecimentoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend Clube dos Pets rodando!');
});

app.use('/categorias', categoriaRoutes);
app.use('/estabelecimentos', estabelecimentoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/avaliacoes', avaliacaoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});