const db = require('../config/db');

const listarEnderecos = async (req, res) => {
  try {
    const [enderecos] = await db.query(
      `SELECT id_endereco, logradouro, numero, bairro, cidade, uf, cep, latitude, longitude
       FROM endereco
       ORDER BY cidade ASC, bairro ASC, logradouro ASC`
    );

    res.status(200).json(enderecos);
  } catch (erro) {
    console.error('Erro ao listar endereços:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar endereços.' });
  }
};

const buscarEnderecoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [enderecos] = await db.query(
      `SELECT id_endereco, logradouro, numero, bairro, cidade, uf, cep, latitude, longitude
       FROM endereco
       WHERE id_endereco = ?`,
      [id]
    );

    if (!enderecos.length) {
      return res.status(404).json({ mensagem: 'Endereço não encontrado.' });
    }

    res.status(200).json(enderecos[0]);
  } catch (erro) {
    console.error('Erro ao buscar endereço:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar endereço.' });
  }
};

module.exports = {
  listarEnderecos,
  buscarEnderecoPorId
};
