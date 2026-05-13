const token = localStorage.getItem('token');
const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

if (!token) {
  alert('Você precisa estar logado.');
  window.location.href = 'login.html';
}

if (usuario) {
  const el = document.getElementById('usuarioLogado');
  if (el) el.innerText = `Olá, ${usuario.nome}`;
}

const mapa = L.map('map').setView([-23.55052, -46.633308], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(mapa);

let marcadorUsuario = null;
let marcadores = [];

/* =========================
   CARREGAR CATEGORIAS
========================= */
async function carregarCategorias() {
  try {
    const resposta = await fetch('http://localhost:3000/categorias');
    const categorias = await resposta.json();
    const select = document.getElementById('categoria');

    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id_categoria;
      option.textContent = cat.nome_categoria;
      select.appendChild(option);
    });
  } catch (erro) {
    console.error('Erro ao carregar categorias:', erro);
  }
}

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
    if (!item.endereco || !item.endereco.latitude || !item.endereco.longitude) return;

    const distanciaTexto = item.distancia_km != null ? `<br><b>${item.distancia_km} km</b>` : '';

    const marker = L.marker([item.endereco.latitude, item.endereco.longitude])
      .addTo(mapa)
      .bindPopup(`
        <strong>${item.nome}</strong><br>
        ${item.descricao || ''}
        ${distanciaTexto}
        <br><a href="pagina-hotel.html?id=${item.id_estabelecimento}" target="_blank">Ver detalhes</a>
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

  container.innerHTML = estabelecimentos.map(item => {
    const distanciaTexto = item.distancia_km != null ? `<span class="distancia-badge">${item.distancia_km} km</span>` : '';
    const enderecoTexto = item.endereco ? `${item.endereco.logradouro}, ${item.endereco.numero}` : '';

    return `
      <a href="pagina-hotel.html?id=${item.id_estabelecimento}" style="text-decoration:none;color:inherit;">
        <div class="card-resultado">
          <div class="card-resultado-topo">
            <h3>${item.nome}</h3>
            ${distanciaTexto}
          </div>
          <p>${item.descricao || ''}</p>
          <p class="resultado-endereco">${enderecoTexto}</p>
        </div>
      </a>
    `;
  }).join('');
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

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    renderizarMapa(dados);
    renderizarLista(dados);

    document.getElementById('resultadoInfo').innerText =
      `${dados.length} locais encontrados próximos de você`;
  } catch (erro) {
    console.error('Erro ao buscar locais:', erro);
    document.getElementById('resultadoInfo').innerText = 'Erro ao buscar locais.';
  }
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
   LER URL PARAMS
========================= */
function lerParamsURL() {
  const params = new URLSearchParams(window.location.search);
  const endereco = params.get('endereco');
  const categoria = params.get('categoria');

  if (endereco) {
    document.getElementById('enderecoBusca').value = endereco;
  }

  if (categoria) {
    const select = document.getElementById('categoria');
    // aguarda categorias carregarem antes de setar
    const tentarSetar = setInterval(() => {
      if (select.options.length > 1) {
        select.value = categoria;
        clearInterval(tentarSetar);
      }
    }, 100);
  }

  if (endereco) {
    buscarPorEndereco();
  }
}

/* =========================
   EVENTOS
========================= */
document.getElementById('usarMinhaLocalizacao')
  .addEventListener('click', usarMinhaLocalizacao);

document.getElementById('buscarLocais')
  .addEventListener('click', buscarPorEndereco);

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});

document.getElementById('enderecoBusca').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarPorEndereco();
});

/* =========================
   INICIALIZAÇÃO
========================= */
carregarCategorias().then(() => {
  lerParamsURL();
  // só usa geolocalização automática se não veio por URL params
  const params = new URLSearchParams(window.location.search);
  if (!params.get('endereco')) {
    usarMinhaLocalizacao();
  }
});
