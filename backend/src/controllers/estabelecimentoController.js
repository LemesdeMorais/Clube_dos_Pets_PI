const estabelecimentos = require('../data/estabelecimentos');
const enderecos = require('../data/enderecos');

const montarEstabelecimentoCompleto = (estabelecimento) => {
  const endereco = enderecos.find(
    (item) => item.id_endereco === estabelecimento.id_endereco
  );

  return {
    ...estabelecimento,
    endereco: endereco || null
  };
};

const calcularDistanciaKm = (lat1, lon1, lat2, lon2) => {
  const raioTerra = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return raioTerra * c;
};

const listarEstabelecimentos = (req, res) => {
  const resultados = estabelecimentos.map(montarEstabelecimentoCompleto);
  res.status(200).json(resultados);
};

const buscarEstabelecimentoPorId = (req, res) => {
  const { id } = req.params;

  const estabelecimento = estabelecimentos.find(
    (item) => item.id_estabelecimento === Number(id)
  );

  if (!estabelecimento) {
    return res.status(404).json({ mensagem: 'Estabelecimento não encontrado.' });
  }

  res.status(200).json(montarEstabelecimentoCompleto(estabelecimento));
};

const listarEstabelecimentosPorCategoria = (req, res) => {
  const { id_categoria } = req.query;

  if (!id_categoria) {
    return res.status(400).json({ mensagem: 'Informe o id_categoria para filtrar.' });
  }

  const resultados = estabelecimentos
    .filter((item) => item.id_categoria === Number(id_categoria))
    .map(montarEstabelecimentoCompleto);

  res.status(200).json(resultados);
};

const listarEstabelecimentosProximos = (req, res) => {
  const { latitude, longitude, distancia_maxima, id_categoria } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      mensagem: 'Latitude e longitude são obrigatórias.'
    });
  }

  const distanciaMaximaKm = distancia_maxima ? Number(distancia_maxima) : 5;

  let resultados = estabelecimentos.map(montarEstabelecimentoCompleto);

  resultados = resultados
    .filter((item) => item.endereco && item.endereco.latitude && item.endereco.longitude)
    .map((item) => {
      const distancia = calcularDistanciaKm(
        Number(latitude),
        Number(longitude),
        item.endereco.latitude,
        item.endereco.longitude
      );

      return {
        ...item,
        distancia_km: Number(distancia.toFixed(2))
      };
    });

  if (id_categoria) {
    resultados = resultados.filter(
      (item) => item.id_categoria === Number(id_categoria)
    );
  }

  resultados = resultados
    .filter((item) => item.distancia_km <= distanciaMaximaKm)
    .sort((a, b) => a.distancia_km - b.distancia_km);

  res.status(200).json(resultados);
};

module.exports = {
  listarEstabelecimentos,
  buscarEstabelecimentoPorId,
  listarEstabelecimentosPorCategoria,
  listarEstabelecimentosProximos
};