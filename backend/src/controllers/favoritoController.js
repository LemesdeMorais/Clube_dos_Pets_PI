const db = require('../config/db');

const montarFavoritoCompleto = (linha) => ({
  id_favorito: linha.id_favorito,
  data_favorito: linha.data_favorito,
  id_usuario: linha.id_usuario,
  id_estabelecimento: linha.id_estabelecimento,
  usuario: linha.nome_usuario
    ? {
        id_usuario: linha.id_usuario,
        nome: linha.nome_usuario,
        email: linha.email_usuario
      }
    : null,
  estabelecimento: linha.nome_estabelecimento
    ? {
        id_estabelecimento: linha.id_estabelecimento,
        nome: linha.nome_estabelecimento,
        descricao: linha.descricao_estabelecimento
      }
    : null
});

const consultaBaseFavoritos = `
  SELECT
    f.id_favorito,
    f.data_favorito,
    f.id_usuario,
    f.id_estabelecimento,
    u.nome AS nome_usuario,
    u.email AS email_usuario,
    e.nome AS nome_estabelecimento,
    e.descricao AS descricao_estabelecimento
  FROM favorito f
  INNER JOIN usuario u ON u.id_usuario = f.id_usuario
  INNER JOIN estabelecimento e ON e.id_estabelecimento = f.id_estabelecimento
`;

const listarFavoritos = async (req, res) => {
  try {
    const [favoritos] = await db.query(
      `${consultaBaseFavoritos} ORDER BY f.data_favorito DESC`
    );

    res.status(200).json(favoritos.map(montarFavoritoCompleto));
  } catch (erro) {
    console.error('Erro ao listar favoritos:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar favoritos.' });
  }
};

const listarFavoritosPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.query;

    if (!id_usuario) {
      return res.status(400).json({
        mensagem: 'Informe o id_usuario para filtrar os favoritos.'
      });
    }

    const [favoritos] = await db.query(
      `${consultaBaseFavoritos} WHERE f.id_usuario = ? ORDER BY f.data_favorito DESC`,
      [id_usuario]
    );

    res.status(200).json(favoritos.map(montarFavoritoCompleto));
  } catch (erro) {
    console.error('Erro ao listar favoritos por usuário:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar favoritos por usuário.' });
  }
};

const cadastrarFavorito = async (req, res) => {
  try {
    const { id_usuario, id_estabelecimento } = req.body || {};

    if (!id_usuario || !id_estabelecimento) {
      return res.status(400).json({
        mensagem: 'id_usuario e id_estabelecimento são obrigatórios.'
      });
    }

    const [usuarios] = await db.query(
      'SELECT id_usuario FROM usuario WHERE id_usuario = ? LIMIT 1',
      [id_usuario]
    );

    if (!usuarios.length) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    const [estabelecimentos] = await db.query(
      'SELECT id_estabelecimento FROM estabelecimento WHERE id_estabelecimento = ? LIMIT 1',
      [id_estabelecimento]
    );

    if (!estabelecimentos.length) {
      return res.status(404).json({ mensagem: 'Estabelecimento não encontrado.' });
    }

    const [favoritosExistentes] = await db.query(
      `SELECT id_favorito
       FROM favorito
       WHERE id_usuario = ? AND id_estabelecimento = ?
       LIMIT 1`,
      [id_usuario, id_estabelecimento]
    );

    if (favoritosExistentes.length) {
      return res.status(400).json({
        mensagem: 'Este estabelecimento já está nos favoritos do usuário.'
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO favorito (id_usuario, id_estabelecimento)
       VALUES (?, ?)`,
      [id_usuario, id_estabelecimento]
    );

    const [favoritos] = await db.query(
      `${consultaBaseFavoritos} WHERE f.id_favorito = ? LIMIT 1`,
      [resultado.insertId]
    );

    res.status(201).json({
      mensagem: 'Favorito cadastrado com sucesso.',
      favorito: montarFavoritoCompleto(favoritos[0])
    });
  } catch (erro) {
    console.error('Erro ao cadastrar favorito:', erro);
    res.status(500).json({ mensagem: 'Erro ao cadastrar favorito.' });
  }
};

module.exports = {
  listarFavoritos,
  listarFavoritosPorUsuario,
  cadastrarFavorito
};
