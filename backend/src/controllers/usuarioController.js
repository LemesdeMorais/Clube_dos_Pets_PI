const usuarios = require('../data/usuarios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const listarUsuarios = (req, res) => {
  const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario);
  res.status(200).json(usuariosSemSenha);
};

const buscarUsuarioPorId = (req, res) => {
  const { id } = req.params;

  const usuario = usuarios.find(
    (item) => item.id_usuario === Number(id)
  );

  if (!usuario) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
  }

  const { senha, ...usuarioSemSenha } = usuario;
  res.status(200).json(usuarioSemSenha);
};

const cadastrarUsuario = async (req, res) => {
  try {
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

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      id_usuario: usuarios.length + 1,
      nome,
      email,
      senha: senhaHash,
      data_cadastro: new Date().toISOString()
    };

    usuarios.push(novoUsuario);

    const { senha: _, ...usuarioSemSenha } = novoUsuario;

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: usuarioSemSenha
    });
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao cadastrar usuário.'
    });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: 'Email e senha são obrigatórios.'
      });
    }

    const usuario = usuarios.find((item) => item.email === email);

    if (!usuario) {
      return res.status(401).json({
        mensagem: 'Email ou senha inválidos.'
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: 'Email ou senha inválidos.'
      });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao realizar login.'
    });
  }
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  cadastrarUsuario,
  loginUsuario
};