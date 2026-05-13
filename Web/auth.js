const API_BASE_URL = 'http://localhost:3000';

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getToken() {
  return localStorage.getItem('token');
}

function getUsuario() {
  try {
    const dados = localStorage.getItem('usuario');
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

function gerenciarNav() {
  const btnEntrar = document.getElementById('btn-entrar');
  const btnSair = document.getElementById('btn-sair');
  const logado = isLoggedIn();

  if (btnEntrar) btnEntrar.classList.toggle('hidden', logado);
  if (btnSair) btnSair.classList.toggle('hidden', !logado);

  const usuario = getUsuario();
  const boasVindas = document.getElementById('boas-vindas');
  if (boasVindas && usuario) boasVindas.textContent = `Olá, ${usuario.nome}`;

  const linkPerfil = document.getElementById('link-perfil');
  if (linkPerfil) linkPerfil.classList.toggle('hidden', !logado);
}

document.addEventListener('DOMContentLoaded', gerenciarNav);
