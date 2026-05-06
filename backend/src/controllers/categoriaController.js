const db = require('../config/db');

const listarCategorias = async (req, res) => {
  try {
    const [categorias] = await db.query(
      `SELECT id_categoria, nome_categoria
       FROM categoria
       ORDER BY nome_categoria ASC`
    );

    res.status(200).json(categorias);
  } catch (erro) {
    console.error('Erro ao listar categorias:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar categorias.' });
  }
};

module.exports = {
  listarCategorias
};
