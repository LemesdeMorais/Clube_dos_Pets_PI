const favoritos = require('../data/favoritos');
const usuarios = require('../data/usuarios');
const estabelecimentos = require('../data/estabelecimentos');

const listarFavoritos = (req, res) => {
  res.status(200).json(favoritos);
};

const listarFavoritosPorUsuario = (req, res) => {
  const { id_usuario } = req.query;

  if (!id_usuario) {
    return res.status(400).json({
      mensagem: 'Informe o id_usuario para filtrar os favoritos.'
    });
  }

  const resultados = favoritos.filter(
    (item) => item.id_usuario === Number(id_usuario)
  );

  res.status(200).json(resultados);
};

const cadastrarFavorito = (req, res) => {
  const { id_usuario, id_estabelecimento } = req.body;

  if (!id_usuario || !id_estabelecimento) {
    return res.status(400).json({
      mensagem: 'id_usuario e id_estabelecimento são obrigatórios.'
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

  const favoritoJaExiste = favoritos.find(
    (item) =>
      item.id_usuario === Number(id_usuario) &&
      item.id_estabelecimento === Number(id_estabelecimento)
  );

  if (favoritoJaExiste) {
    return res.status(400).json({
      mensagem: 'Este estabelecimento já está nos favoritos do usuário.'
    });
  }

  const novoFavorito = {
    id_favorito: favoritos.length + 1,
    data_favorito: new Date().toISOString(),
    id_usuario: Number(id_usuario),
    id_estabelecimento: Number(id_estabelecimento)
  };

  favoritos.push(novoFavorito);

  res.status(201).json({
    mensagem: 'Favorito cadastrado com sucesso.',
    favorito: novoFavorito
  });
};

module.exports = {
  listarFavoritos,
  listarFavoritosPorUsuario,
  cadastrarFavorito
};