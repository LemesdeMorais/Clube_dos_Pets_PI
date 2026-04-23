const geocodificarEndereco = async (endereco) => {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(endereco)}&limit=1&addressdetails=1`;

  const resposta = await fetch(url, {
    headers: {
      'User-Agent': 'ClubeDosPets/1.0 (Projeto Academico)'
    }
  });

  if (!resposta.ok) {
    throw new Error('Erro ao consultar serviço de geocodificação.');
  }

  const dados = await resposta.json();

  if (!dados.length) {
    return null;
  }

  return {
    latitude: Number(dados[0].lat),
    longitude: Number(dados[0].lon),
    endereco_formatado: dados[0].display_name
  };
};

module.exports = {
  geocodificarEndereco
};