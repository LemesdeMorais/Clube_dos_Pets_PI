const usuarios = require('../data/usuarios');

const listarUsuarios = (req, res) => {
  res.status(200).json(usuarios);
};

const buscarUsuarioPorId = (req, res) => {
  const { id } = req.params;

  const usuario = usuarios.find(
    (item) => item.id_usuario === Number(id)
  );

  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  }

  res.status(200).json(usuario);
};

const cadastrarUsuario = (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      mensagem: 'Nome, email e senha são obrigatórios.'
    });
  }

  const emailJaExiste = usuarios.find(
    (item) => item.email === email
  );

  if (emailJaExiste) {
    return res.status(400).json({
      mensagem: 'Já existe um usuário com este email.'
    });
  }

  const novoUsuario = {
    id_usuario: usuarios.length + 1,
    nome,
    email,
    senha,
    data_cadastro: new Date().toISOString()
  };

  usuarios.push(novoUsuario);

  res.status(201).json({
    mensagem: 'Usuário cadastrado com sucesso.',
    usuario: novoUsuario
  });
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  cadastrarUsuario
};