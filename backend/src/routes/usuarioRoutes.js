const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  buscarUsuarioPorId,
  cadastrarUsuario
} = require('../controllers/usuarioController');

router.get('/', listarUsuarios);
router.get('/:id', buscarUsuarioPorId);
router.post('/', cadastrarUsuario);

module.exports = router;