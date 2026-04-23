const express = require('express');
const router = express.Router();
const {
  buscarCoordenadasPorEndereco
} = require('../controllers/geocodificacaoController');

router.get('/', buscarCoordenadasPorEndereco);

module.exports = router;