const express = require('express');
const router = express.Router();
const {
  listarEstabelecimentos,
  buscarEstabelecimentoPorId,
  listarEstabelecimentosPorCategoria
} = require('../controllers/estabelecimentoController');

router.get('/', listarEstabelecimentos);
router.get('/filtro', listarEstabelecimentosPorCategoria);
router.get('/:id', buscarEstabelecimentoPorId);

module.exports = router;