const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const listarUsuarios = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      `SELECT id_usuario, cpf, nome, email, data_cadastro
       FROM usuario
       ORDER BY data_cadastro DESC`
    );

    res.status(200).json(usuarios);
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar usuários.' });
  }
};

const buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [usuarios] = await db.query(
      `SELECT id_usuario, cpf, nome, email, data_cadastro
       FROM usuario
       WHERE id_usuario = ?`,
      [id]
    );

    if (!usuarios.length) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    res.status(200).json(usuarios[0]);
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar usuário.' });
  }
};

const cadastrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, cpf = null } = req.body || {};

    const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
    const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const senhaLimpa = typeof senha === 'string' ? senha.trim() : '';
    const cpfLimpo = typeof cpf === 'string' && cpf.trim() ? cpf.trim() : null;

    if (!nomeLimpo || !emailLimpo || !senhaLimpa) {
      return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
    }

    const [usuariosExistentes] = await db.query(
      'SELECT id_usuario FROM usuario WHERE email = ? LIMIT 1',
      [emailLimpo]
    );

    if (usuariosExistentes.length) {
      return res.status(400).json({ mensagem: 'Já existe um usuário com este email.' });
    }

    if (cpfLimpo) {
      const [cpfExistente] = await db.query(
        'SELECT id_usuario FROM usuario WHERE cpf = ? LIMIT 1',
        [cpfLimpo]
      );

      if (cpfExistente.length) {
        return res.status(400).json({ mensagem: 'Já existe um usuário com este CPF.' });
      }
    }

    const senhaHash = await bcrypt.hash(senhaLimpa, 10);

    const [resultado] = await db.query(
      `INSERT INTO usuario (cpf, nome, email, senha)
       VALUES (?, ?, ?, ?)`,
      [cpfLimpo, nomeLimpo, emailLimpo, senhaHash]
    );

    const novoUsuario = {
      id_usuario: resultado.insertId,
      cpf: cpfLimpo,
      nome: nomeLimpo,
      email: emailLimpo
    };

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: novoUsuario
    });
  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.' });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body || {};

    const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const senhaLimpa = typeof senha === 'string' ? senha.trim() : '';

    if (!emailLimpo || !senhaLimpa) {
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado no .env');
      return res.status(500).json({ mensagem: 'JWT_SECRET não configurado no servidor.' });
    }

    const [usuarios] = await db.query(
      `SELECT id_usuario, nome, email, senha
       FROM usuario
       WHERE email = ?
       LIMIT 1`,
      [emailLimpo]
    );

    if (!usuarios.length) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }

    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senhaLimpa, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
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
    console.error('Erro ao realizar login:', erro);
    res.status(500).json({ mensagem: 'Erro ao realizar login.' });
  }
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  cadastrarUsuario,
  loginUsuario
};
