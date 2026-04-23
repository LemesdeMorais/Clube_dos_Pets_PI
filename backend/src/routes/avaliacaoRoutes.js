const express = require('express');
const router = express.Router();
const {
  listarAvaliacoes,
  listarAvaliacoesPorEstabelecimento,
  cadastrarAvaliacao
} = require('../controllers/avaliacaoController');

router.get('/', listarAvaliacoes);
router.get('/filtro', listarAvaliacoesPorEstabelecimento);
router.post('/', cadastrarAvaliacao);

module.exports = router;