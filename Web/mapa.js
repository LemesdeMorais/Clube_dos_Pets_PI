const usuario = JSON.parse(localStorage.getItem('usuario'));

if (usuario) {
  document.getElementById('usuarioLogado').innerText = `Olá, ${usuario.nome}`;
}

const token = localStorage.getItem('token');

if (!token) {
  alert('Você precisa estar logado.');
  window.location.href = 'login.html';
}

const mapa = L.map('map').setView([-23.55052, -46.633308], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(mapa);

let marcadorUsuario = null;
let marcadores = [];

/* =========================
   LIMPAR MARCADORES
========================= */
function limparMarcadores() {
  marcadores.forEach(m => mapa.removeLayer(m));
  marcadores = [];
}

/* =========================
   RENDERIZAR NO MAPA
========================= */
function renderizarMapa(estabelecimentos) {
  limparMarcadores();

  estabelecimentos.forEach(item => {
    if (!item.endereco) return;

    const marker = L.marker([
      item.endereco.latitude,
      item.endereco.longitude
    ])
      .addTo(mapa)
      .bindPopup(`
        <strong>${item.nome}</strong><br>
        ${item.descricao}<br>
        <b>${item.distancia_km} km</b>
      `);

    marcadores.push(marker);
  });
}

/* =========================
   RENDERIZAR LISTA
========================= */
function renderizarLista(estabelecimentos) {
  const container = document.getElementById('lista-estabelecimentos');

  if (!estabelecimentos.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span>😕</span>
        <p>Nenhum local encontrado nessa região.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = estabelecimentos.map(item => `
    <div class="card-resultado">
      <div class="card-resultado-topo">
        <h3>${item.nome}</h3>
        <span class="distancia-badge">${item.distancia_km} km</span>
      </div>
      <p>${item.descricao}</p>
      <p class="resultado-endereco">
        ${item.endereco.logradouro}, ${item.endereco.numero}
      </p>
    </div>
  `).join('');
}

/* =========================
   BUSCAR NO BACKEND
========================= */
async function buscarLocais(latitude, longitude) {
  const categoria = document.getElementById('categoria').value;
  const distancia = document.getElementById('distancia').value;

  let url = `http://localhost:3000/estabelecimentos/proximos?latitude=${latitude}&longitude=${longitude}&distancia_maxima=${distancia}`;

  if (categoria) {
    url += `&id_categoria=${categoria}`;
  }

  const resposta = await fetch(url);
  const dados = await resposta.json();

  renderizarMapa(dados);
  renderizarLista(dados);

  document.getElementById('resultadoInfo').innerText =
    `${dados.length} locais encontrados próximos de você`;
}

/* =========================
   GEOLOCALIZAÇÃO
========================= */
function usarMinhaLocalizacao() {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      mapa.setView([lat, lon], 14);

      if (marcadorUsuario) {
        mapa.removeLayer(marcadorUsuario);
      }

      marcadorUsuario = L.marker([lat, lon])
        .addTo(mapa)
        .bindPopup('Você está aqui')
        .openPopup();

      buscarLocais(lat, lon);
    },
    () => {
      alert('Permissão de localização negada.');
    }
  );
}

/* =========================
   BUSCA POR ENDEREÇO
========================= */
async function buscarPorEndereco() {
  const endereco = document.getElementById('enderecoBusca').value;

  if (!endereco) {
    alert('Digite um endereço.');
    return;
  }

  try {
    const resposta = await fetch(
      `http://localhost:3000/geocodificacao?endereco=${encodeURIComponent(endereco)}`
    );

    const dados = await resposta.json();

    if (!dados.latitude) {
      alert('Endereço não encontrado.');
      return;
    }

    mapa.setView([dados.latitude, dados.longitude], 14);

    buscarLocais(dados.latitude, dados.longitude);

  } catch (erro) {
    console.error(erro);
    alert('Erro ao buscar endereço.');
  }
}

/* =========================
   EVENTOS
========================= */

document.getElementById('usarMinhaLocalizacao')
  .addEventListener('click', usarMinhaLocalizacao);

document.getElementById('buscarLocais')
  .addEventListener('click', buscarPorEndereco);

/* =========================
   INICIALIZAÇÃO
========================= */

// tenta carregar localização automaticamente
usarMinhaLocalizacao();


document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});