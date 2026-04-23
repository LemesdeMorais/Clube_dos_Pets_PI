const express = require('express');
const router = express.Router();
const {
  listarEnderecos,
  buscarEnderecoPorId
} = require('../controllers/enderecoController');

router.get('/', listarEnderecos);
router.get('/:id', buscarEnderecoPorId);

module.exports = router;