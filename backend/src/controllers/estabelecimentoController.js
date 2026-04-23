const estabelecimentos = require('../data/estabelecimentos');

const listarEstabelecimentos = (req, res) => {
  res.status(200).json(estabelecimentos);
};

const buscarEstabelecimentoPorId = (req, res) => {
  const { id } = req.params;

  const estabelecimento = estabelecimentos.find(
    (item) => item.id_estabelecimento === Number(id)
  );

  if (!estabelecimento) {
    return res.status(404).json({ mensagem: 'Estabelecimento não encontrado.' });
  }

  res.status(200).json(estabelecimento);
};

const listarEstabelecimentosPorCategoria = (req, res) => {
  const { id_categoria } = req.query;

  if (!id_categoria) {
    return res.status(400).json({ mensagem: 'Informe o id_categoria para filtrar.' });
  }

  const resultados = estabelecimentos.filter(
    (item) => item.id_categoria === Number(id_categoria)
  );

  res.status(200).json(resultados);
};

module.exports = {
  listarEstabelecimentos,
  buscarEstabelecimentoPorId,
  listarEstabelecimentosPorCategoria
};