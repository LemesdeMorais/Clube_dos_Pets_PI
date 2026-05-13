const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const {
  listarUsuarios,
  buscarUsuarioPorId,
  cadastrarUsuario,
  loginUsuario,
  atualizarUsuario
} = require('../controllers/usuarioController');

router.get('/', listarUsuarios);
router.post('/', cadastrarUsuario);
router.post('/login', loginUsuario);
router.get('/:id', buscarUsuarioPorId);
router.patch('/:id', verificarToken, atualizarUsuario);

module.exports = router;