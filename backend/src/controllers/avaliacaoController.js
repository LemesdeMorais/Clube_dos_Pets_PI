const db = require('../config/db');

const montarAvaliacaoCompleta = (linha) => ({
  id_avaliacao: linha.id_avaliacao,
  nota: linha.nota,
  comentario: linha.comentario,
  data_avaliacao: linha.data_avaliacao,
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
        nome: linha.nome_estabelecimento
      }
    : null
});

const consultaBaseAvaliacoes = `
  SELECT
    a.id_avaliacao,
    a.nota,
    a.comentario,
    a.data_avaliacao,
    a.id_usuario,
    a.id_estabelecimento,
    u.nome AS nome_usuario,
    u.email AS email_usuario,
    e.nome AS nome_estabelecimento
  FROM avaliacao a
  INNER JOIN usuario u ON u.id_usuario = a.id_usuario
  INNER JOIN estabelecimento e ON e.id_estabelecimento = a.id_estabelecimento
`;

const listarAvaliacoes = async (req, res) => {
  try {
    const [avaliacoes] = await db.query(
      `${consultaBaseAvaliacoes} ORDER BY a.data_avaliacao DESC`
    );

    res.status(200).json(avaliacoes.map(montarAvaliacaoCompleta));
  } catch (erro) {
    console.error('Erro ao listar avaliações:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar avaliações.' });
  }
};

const listarAvaliacoesPorEstabelecimento = async (req, res) => {
  try {
    const { id_estabelecimento } = req.query;

    if (!id_estabelecimento) {
      return res.status(400).json({
        mensagem: 'Informe o id_estabelecimento para filtrar as avaliações.'
      });
    }

    const [avaliacoes] = await db.query(
      `${consultaBaseAvaliacoes} WHERE a.id_estabelecimento = ? ORDER BY a.data_avaliacao DESC`,
      [id_estabelecimento]
    );

    res.status(200).json(avaliacoes.map(montarAvaliacaoCompleta));
  } catch (erro) {
    console.error('Erro ao listar avaliações por estabelecimento:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar avaliações por estabelecimento.' });
  }
};

const cadastrarAvaliacao = async (req, res) => {
  try {
    const { nota, comentario = null, id_usuario, id_estabelecimento } = req.body || {};

    if (!nota || !id_usuario || !id_estabelecimento) {
      return res.status(400).json({
        mensagem: 'Nota, id_usuario e id_estabelecimento são obrigatórios.'
      });
    }

    const notaNumero = Number(nota);

    if (!Number.isInteger(notaNumero) || notaNumero < 1 || notaNumero > 5) {
      return res.status(400).json({ mensagem: 'A nota deve ser um número inteiro entre 1 e 5.' });
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

    const [resultado] = await db.query(
      `INSERT INTO avaliacao (nota, comentario, id_usuario, id_estabelecimento)
       VALUES (?, ?, ?, ?)`,
      [notaNumero, comentario, id_usuario, id_estabelecimento]
    );

    const [avaliacoes] = await db.query(
      `${consultaBaseAvaliacoes} WHERE a.id_avaliacao = ? LIMIT 1`,
      [resultado.insertId]
    );

    res.status(201).json({
      mensagem: 'Avaliação cadastrada com sucesso.',
      avaliacao: montarAvaliacaoCompleta(avaliacoes[0])
    });
  } catch (erro) {
    console.error('Erro ao cadastrar avaliação:', erro);
    res.status(500).json({ mensagem: 'Erro ao cadastrar avaliação.' });
  }
};

module.exports = {
  listarAvaliacoes,
  listarAvaliacoesPorEstabelecimento,
  cadastrarAvaliacao
};
