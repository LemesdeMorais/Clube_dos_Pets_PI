const express = require('express');
const router = express.Router();
const {
  listarFavoritos,
  listarFavoritosPorUsuario,
  cadastrarFavorito
} = require('../controllers/favoritoController');

router.get('/', listarFavoritos);
router.get('/filtro', listarFavoritosPorUsuario);
router.post('/', cadastrarFavorito);

module.exports = router;