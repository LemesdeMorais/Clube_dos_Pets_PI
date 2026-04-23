const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  buscarUsuarioPorId,
  cadastrarUsuario,
  loginUsuario
} = require('../controllers/usuarioController');

router.get('/', listarUsuarios);
router.post('/', cadastrarUsuario);
router.post('/login', loginUsuario);
router.get('/:id', buscarUsuarioPorId);

module.exports = router;