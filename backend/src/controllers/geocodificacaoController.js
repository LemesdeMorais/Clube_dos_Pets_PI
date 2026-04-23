const { geocodificarEndereco } = require('../services/geocodificacaoService');

const buscarCoordenadasPorEndereco = async (req, res) => {
  try {
    const { endereco } = req.query;

    if (!endereco) {
      return res.status(400).json({
        mensagem: 'O parâmetro endereco é obrigatório.'
      });
    }

    const resultado = await geocodificarEndereco(endereco);

    if (!resultado) {
      return res.status(404).json({
        mensagem: 'Endereço não encontrado.'
      });
    }

    res.status(200).json(resultado);
  } catch (erro) {
    console.error('Erro na geocodificação:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao buscar coordenadas para o endereço informado.'
    });
  }
};

module.exports = {
  buscarCoordenadasPorEndereco
};