const avaliacoes = require('../data/avaliacoes');
const usuarios = require('../data/usuarios');
const estabelecimentos = require('../data/estabelecimentos');

const listarAvaliacoes = (req, res) => {
  res.status(200).json(avaliacoes);
};

const listarAvaliacoesPorEstabelecimento = (req, res) => {
  const { id_estabelecimento } = req.query;

  if (!id_estabelecimento) {
    return res.status(400).json({
      mensagem: 'Informe o id_estabelecimento para filtrar as avaliações.'
    });
  }

  const resultados = avaliacoes.filter(
    (item) => item.id_estabelecimento === Number(id_estabelecimento)
  );

  res.status(200).json(resultados);
};

const cadastrarAvaliacao = (req, res) => {
  const { nota, comentario, id_usuario, id_estabelecimento } = req.body;

  if (!nota || !comentario || !id_usuario || !id_estabelecimento) {
    return res.status(400).json({
      mensagem: 'Nota, comentário, id_usuario e id_estabelecimento são obrigatórios.'
    });
  }

  const usuarioExiste = usuarios.find(
    (item) => item.id_usuario === Number(id_usuario)
  );

  if (!usuarioExiste) {
    return res.status(404).json({
      mensagem: 'Usuário não encontrado.'
    });
  }

  const estabelecimentoExiste = estabelecimentos.find(
    (item) => item.id_estabelecimento === Number(id_estabelecimento)
  );

  if (!estabelecimentoExiste) {
    return res.status(404).json({
      mensagem: 'Estabelecimento não encontrado.'
    });
  }

  const novaAvaliacao = {
    id_avaliacao: avaliacoes.length + 1,
    nota,
    comentario,
    data_avaliacao: new Date().toISOString(),
    id_usuario: Number(id_usuario),
    id_estabelecimento: Number(id_estabelecimento)
  };

  avaliacoes.push(novaAvaliacao);

  res.status(201).json({
    mensagem: 'Avaliação cadastrada com sucesso.',
    avaliacao: novaAvaliacao
  });
};

module.exports = {
  listarAvaliacoes,
  listarAvaliacoesPorEstabelecimento,
  cadastrarAvaliacao
};