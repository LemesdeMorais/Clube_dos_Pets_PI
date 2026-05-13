const db = require('../config/db');

const montarEstabelecimentoCompleto = (linha) => ({
  id_estabelecimento: linha.id_estabelecimento,
  nome: linha.nome,
  descricao: linha.descricao,
  telefone: linha.telefone,
  email_contato: linha.email_contato,
  site: linha.site,
  id_endereco: linha.id_endereco,
  id_categoria: linha.id_categoria,
  media_avaliacao: linha.media_avaliacao !== null ? Number(linha.media_avaliacao) : 0,
  total_avaliacoes: linha.total_avaliacoes || 0,
  foto_url: linha.foto_url || null,
  categoria: linha.nome_categoria
    ? {
        id_categoria: linha.id_categoria,
        nome_categoria: linha.nome_categoria
      }
    : null,
  endereco: linha.id_endereco
    ? {
        id_endereco: linha.id_endereco,
        logradouro: linha.logradouro,
        numero: linha.numero,
        bairro: linha.bairro,
        cidade: linha.cidade,
        uf: linha.uf,
        cep: linha.cep,
        latitude: linha.latitude,
        longitude: linha.longitude
      }
    : null
});

const consultaBaseEstabelecimentos = `
  SELECT
    e.id_estabelecimento,
    e.nome,
    e.descricao,
    e.telefone,
    e.email_contato,
    e.site,
    e.id_endereco,
    e.id_categoria,
    c.nome_categoria,
    en.logradouro,
    en.numero,
    en.bairro,
    en.cidade,
    en.uf,
    en.cep,
    en.latitude,
    en.longitude,
    ROUND(COALESCE((SELECT AVG(nota) FROM avaliacao WHERE id_estabelecimento = e.id_estabelecimento), 0), 1) AS media_avaliacao,
    COALESCE((SELECT COUNT(*) FROM avaliacao WHERE id_estabelecimento = e.id_estabelecimento), 0) AS total_avaliacoes,
    (SELECT url_foto FROM foto_estabelecimento WHERE id_estabelecimento = e.id_estabelecimento ORDER BY id_foto ASC LIMIT 1) AS foto_url
  FROM estabelecimento e
  INNER JOIN categoria c ON c.id_categoria = e.id_categoria
  INNER JOIN endereco en ON en.id_endereco = e.id_endereco
`;

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

const listarEstabelecimentos = async (req, res) => {
  try {
    const [linhas] = await db.query(`${consultaBaseEstabelecimentos} ORDER BY e.nome ASC`);
    const resultados = linhas.map(montarEstabelecimentoCompleto);

    res.status(200).json(resultados);
  } catch (erro) {
    console.error('Erro ao listar estabelecimentos:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar estabelecimentos.' });
  }
};

const buscarEstabelecimentoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [linhas] = await db.query(
      `${consultaBaseEstabelecimentos} WHERE e.id_estabelecimento = ? LIMIT 1`,
      [id]
    );

    if (!linhas.length) {
      return res.status(404).json({ mensagem: 'Estabelecimento não encontrado.' });
    }

    res.status(200).json(montarEstabelecimentoCompleto(linhas[0]));
  } catch (erro) {
    console.error('Erro ao buscar estabelecimento:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar estabelecimento.' });
  }
};

const listarEstabelecimentosPorCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.query;

    if (!id_categoria) {
      return res.status(400).json({ mensagem: 'Informe o id_categoria para filtrar.' });
    }

    const [linhas] = await db.query(
      `${consultaBaseEstabelecimentos} WHERE e.id_categoria = ? ORDER BY e.nome ASC`,
      [id_categoria]
    );

    const resultados = linhas.map(montarEstabelecimentoCompleto);
    res.status(200).json(resultados);
  } catch (erro) {
    console.error('Erro ao filtrar estabelecimentos por categoria:', erro);
    res.status(500).json({ mensagem: 'Erro ao filtrar estabelecimentos por categoria.' });
  }
};

const listarEstabelecimentosProximos = async (req, res) => {
  try {
    const { latitude, longitude, distancia_maxima, id_categoria } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ mensagem: 'Latitude e longitude são obrigatórias.' });
    }

    const latitudeNumero = Number(latitude);
    const longitudeNumero = Number(longitude);
    const distanciaMaximaKm = distancia_maxima ? Number(distancia_maxima) : 5;

    if (
      Number.isNaN(latitudeNumero) ||
      Number.isNaN(longitudeNumero) ||
      Number.isNaN(distanciaMaximaKm)
    ) {
      return res.status(400).json({ mensagem: 'Latitude, longitude e distância devem ser números válidos.' });
    }

    const parametros = [];
    let sql = `${consultaBaseEstabelecimentos} WHERE en.latitude IS NOT NULL AND en.longitude IS NOT NULL`;

    if (id_categoria) {
      sql += ' AND e.id_categoria = ?';
      parametros.push(id_categoria);
    }

    const [linhas] = await db.query(sql, parametros);

    const resultados = linhas
      .map(montarEstabelecimentoCompleto)
      .map((item) => {
        const distancia = calcularDistanciaKm(
          latitudeNumero,
          longitudeNumero,
          Number(item.endereco.latitude),
          Number(item.endereco.longitude)
        );

        return {
          ...item,
          distancia_km: Number(distancia.toFixed(2))
        };
      })
      .filter((item) => item.distancia_km <= distanciaMaximaKm)
      .sort((a, b) => a.distancia_km - b.distancia_km);

    res.status(200).json(resultados);
  } catch (erro) {
    console.error('Erro ao listar estabelecimentos próximos:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar estabelecimentos próximos.' });
  }
};

module.exports = {
  listarEstabelecimentos,
  buscarEstabelecimentoPorId,
  listarEstabelecimentosPorCategoria,
  listarEstabelecimentosProximos
};
