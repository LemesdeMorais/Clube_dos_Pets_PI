const categorias = require('../data/categorias');

const listarCategorias = (req, res) => {
  res.status(200).json(categorias);
};

module.exports = {
  listarCategorias
};