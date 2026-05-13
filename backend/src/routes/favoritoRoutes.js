const express = require('express');
const router = express.Router();
const {
  listarFavoritos,
  listarFavoritosPorUsuario,
  cadastrarFavorito,
  removerFavorito
} = require('../controllers/favoritoController');

router.get('/', listarFavoritos);
router.get('/filtro', listarFavoritosPorUsuario);
router.post('/', cadastrarFavorito);
router.delete('/:id', removerFavorito);

module.exports = router;