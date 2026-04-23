console.log("Clube dos Pets rodando 🚀");

const API_BASE_URL = "http://localhost:3000";

/* =========================
   CADASTRO DE USUÁRIO
========================= */
const formCadastroUsuario = document.getElementById("formCadastroUsuario");

if (formCadastroUsuario) {
  formCadastroUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("emailCadastro").value.trim();
    const senha = document.getElementById("senhaCadastro").value.trim();

    try {
      const resposta = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.mensagem || "Erro ao cadastrar usuário.");
        return;
      }

      alert("Cadastro realizado com sucesso!");
      window.location.href = "login.html";
    } catch (erro) {
      console.error("Erro no cadastro:", erro);
      alert("Não foi possível cadastrar o usuário.");
    }
  });
}

/* =========================
   LOGIN
========================= */
const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    try {
      const resposta = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.mensagem || "Email ou senha inválidos.");
        return;
      }

      localStorage.setItem("token", dados.token);
      localStorage.setItem("usuario", JSON.stringify(dados.usuario));

      alert("Login realizado com sucesso!");
      window.location.href = "mapa.html";
    } catch (erro) {
      console.error("Erro no login:", erro);
      alert("Não foi possível realizar o login.");
    }
  });
}