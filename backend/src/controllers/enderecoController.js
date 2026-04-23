const enderecos = require('../data/enderecos');

const listarEnderecos = (req, res) => {
  res.status(200).json(enderecos);
};

const buscarEnderecoPorId = (req, res) => {
  const { id } = req.params;

  const endereco = enderecos.find(
    (item) => item.id_endereco === Number(id)
  );

  if (!endereco) {
    return res.status(404).json({
      mensagem: 'Endereço não encontrado.'
    });
  }

  res.status(200).json(endereco);
};

module.exports = {
  listarEnderecos,
  buscarEnderecoPorId
};