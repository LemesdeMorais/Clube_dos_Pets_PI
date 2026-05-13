// Requer CATEGORIA_ID definido na página antes de carregar este script
// Requer auth.js carregado antes

const IMAGENS_PADRAO_CAT = {
    1: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=500',
    2: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500',
    3: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500',
    4: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500',
    5: 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=500',
    6: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=500',
    7: 'https://images.unsplash.com/photo-1543489822-c49534f3271f?auto=format&fit=crop&w=500'
};

function renderizarCardCategoria(item) {
    const img = item.foto_url || IMAGENS_PADRAO_CAT[item.id_categoria] || IMAGENS_PADRAO_CAT[1];
    const rating = item.media_avaliacao > 0
        ? `⭐ ${item.media_avaliacao}`
        : '<span style="color:var(--gray)">Sem avaliações</span>';
    const local = item.endereco ? `${item.endereco.cidade}, ${item.endereco.uf}` : '';

    return `
        <a href="pagina-hotel.html?id=${item.id_estabelecimento}" style="text-decoration: none; color: inherit;" class="card">
            <div class="img-box">
                <img src="${img}" alt="${item.nome}" onerror="this.src='${IMAGENS_PADRAO_CAT[1]}'">
                <span class="fav">♡</span>
            </div>
            <div class="card-info">
                <div class="card-header">
                    <h3>${item.nome}</h3>
                    <span class="rating">${rating}</span>
                </div>
                <p>${item.descricao || ''}</p>
                <p class="price">${local}</p>
            </div>
        </a>
    `;
}

async function carregarEstabelecimentosCategoria() {
    const grid = document.getElementById('grid-estabelecimentos');
    if (!grid) return;

    try {
        const url = typeof CATEGORIA_ID !== 'undefined' && CATEGORIA_ID
            ? `${API_BASE_URL}/estabelecimentos/filtro?id_categoria=${CATEGORIA_ID}`
            : `${API_BASE_URL}/estabelecimentos`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!dados.length) {
            grid.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray)">Nenhum estabelecimento nesta categoria ainda.</p>';
            return;
        }

        grid.innerHTML = dados.map(renderizarCardCategoria).join('');
    } catch (erro) {
        console.error('Erro ao carregar estabelecimentos:', erro);
        grid.innerHTML = '<p style="text-align:center;padding:40px;color:var(--gray)">Erro ao carregar. Verifique se o servidor está rodando.</p>';
    }
}

document.addEventListener('DOMContentLoaded', carregarEstabelecimentosCategoria);
