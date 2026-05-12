/* =========================================================
   ADMIN.JS — Dashboard Administrativo
   Lê e salva config.json no GitHub via API
========================================================= */

// ⚙️ CONFIGURAÇÕES — EDITE AQUI
const CONFIG = {
  // Senha do painel (TROCA POR UMA SENHA DIFÍCIL!)
  senha: "@Biel9569085",

  // Dados do seu GitHub
  github: {
    owner: "6484598",           // Seu usuário do GitHub
    repo: "criadordecontratos", // Nome do repositório
    branch: "main",             // Pode ser "main" ou "master"
    arquivo: "config.json"      // Onde os dados ficam salvos
  }
};

// Estado global
let configAtual = null;
let shaAtual = null; // hash do arquivo no GitHub (necessário para atualizar)

/* =========================================================
   LOGIN
========================================================= */
function entrar() {
  const senha = document.getElementById("senha").value;
  const token = document.getElementById("token").value.trim();

  if (!senha || !token) {
    mostrarToast("Preencha senha e token", "erro");
    return;
  }

  if (senha !== CONFIG.senha) {
    mostrarToast("Senha incorreta", "erro");
    return;
  }

  if (!token.startsWith("ghp_") && !token.startsWith("github_pat_")) {
    mostrarToast("Token do GitHub inválido (deve começar com ghp_ ou github_pat_)", "erro");
    return;
  }

  // Salvar token no localStorage (só no navegador, NÃO vai pro servidor)
  localStorage.setItem("github_token", token);
  localStorage.setItem("admin_logado", "sim");

  // Mostrar dashboard
  document.getElementById("telaLogin").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  // Carregar configurações
  carregarConfig();
}

function sair() {
  if (!confirm("Tem certeza que quer sair?")) return;
  localStorage.removeItem("admin_logado");
  // Por segurança, NÃO remove o token automaticamente (você pode querer ele depois)
  // Pra remover, vai no navegador: F12 > Application > Local Storage
  location.reload();
}

function mostrarAjudaToken() {
  alert(
    "📋 COMO CRIAR O TOKEN DO GITHUB:\n\n" +
    "1. Acesse github.com e faça login\n" +
    "2. Clique no seu avatar → Settings\n" +
    "3. Role até o final → Developer settings\n" +
    "4. Personal access tokens → Tokens (classic)\n" +
    "5. Generate new token (classic)\n" +
    "6. Nome: 'Dashboard Contratos Facil'\n" +
    "7. Validade: 90 days\n" +
    "8. Marque APENAS a opção 'repo'\n" +
    "9. Clique em Generate token\n" +
    "10. COPIE o token (aparece UMA vez só!)\n" +
    "11. Cole aqui no campo Token"
  );
}

/* =========================================================
   CARREGAR CONFIG DO GITHUB
========================================================= */
async function carregarConfig() {
  mostrarToast("Carregando configurações...", "info");

  const token = localStorage.getItem("github_token");
  const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${CONFIG.github.arquivo}?ref=${CONFIG.github.branch}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (response.status === 401) {
      throw new Error("Token inválido ou expirado. Crie um novo no GitHub.");
    }

    if (response.status === 404) {
      // Arquivo não existe ainda, criar com valores padrão
      mostrarToast("Criando configuração inicial...", "info");
      configAtual = configPadrao();
      shaAtual = null;
      preencherForm(configAtual);
      return;
    }

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    shaAtual = data.sha;

    // Decodificar conteúdo (vem em base64)
    const conteudoTexto = decodeURIComponent(escape(atob(data.content)));
    configAtual = JSON.parse(conteudoTexto);

    preencherForm(configAtual);
    mostrarToast("✅ Configurações carregadas", "sucesso");

  } catch (err) {
    console.error(err);
    mostrarToast("❌ " + err.message, "erro");

    // Se falhou, mostrar padrão pra usuário não ficar travado
    configAtual = configPadrao();
    preencherForm(configAtual);
  }
}

function configPadrao() {
  return {
    version: "1.0",
    ultimaAtualizacao: new Date().toISOString().split("T")[0],
    site: {
      nome: "Contratos Fácil",
      tagline: "Modelos jurídicos automatizados",
      tituloHero: 'Contratos prontos<br>em <span class="highlight">minutos</span>',
      subtituloHero: "Modelos juridicamente corretos, atualizados conforme a legislação brasileira."
    },
    contato: {
      whatsapp: "5511947755850",
      email: "cultor.motovlog@gmail.com",
      linkWhatsappTexto: "Olá! Tenho interesse nos contratos do Contratos Fácil."
    },
    premium: {
      ativo: true,
      preco: 19.90,
      precoFormatado: "R$ 19,90",
      linkHotmart: "https://pay.hotmart.com/SEU_PRODUTO_HOTMART",
      tituloCard: "Já tem um contrato?",
      descricaoCard: "Tenha o modelo Premium com cláusulas avançadas.",
      textoCTA: "Comprar agora com segurança"
    },
    adsense: {
      ativo: true,
      publisherId: "ca-pub-6511130884911412"
    },
    analytics: {
      ativo: false,
      measurementId: ""
    },
    cards: {
      mostrarPremium: true,
      mostrarEditar: true,
      mostrarContato: true
    }
  };
}

/* =========================================================
   PREENCHER E LER FORM
========================================================= */
function preencherForm(c) {
  // Site
  set("cfg_site_nome", c.site?.nome);
  set("cfg_site_tagline", c.site?.tagline);
  set("cfg_site_titulo_hero", c.site?.tituloHero);
  set("cfg_site_subtitulo_hero", c.site?.subtituloHero);

  // Contato
  set("cfg_whatsapp", c.contato?.whatsapp);
  set("cfg_email", c.contato?.email);
  set("cfg_whatsapp_texto", c.contato?.linkWhatsappTexto);

  // Premium
  setCheck("cfg_premium_ativo", c.premium?.ativo);
  set("cfg_premium_preco", c.premium?.preco);
  set("cfg_premium_preco_formatado", c.premium?.precoFormatado);
  set("cfg_premium_hotmart", c.premium?.linkHotmart);
  set("cfg_premium_titulo", c.premium?.tituloCard);
  set("cfg_premium_descricao", c.premium?.descricaoCard);
  set("cfg_premium_cta", c.premium?.textoCTA);

  // Cards
  setCheck("cfg_card_premium", c.cards?.mostrarPremium);
  setCheck("cfg_card_editar", c.cards?.mostrarEditar);
  setCheck("cfg_card_contato", c.cards?.mostrarContato);

  // AdSense
  setCheck("cfg_adsense_ativo", c.adsense?.ativo);
  set("cfg_adsense_id", c.adsense?.publisherId);

  // Analytics
  setCheck("cfg_analytics_ativo", c.analytics?.ativo);
  set("cfg_analytics_id", c.analytics?.measurementId);
}

function lerForm() {
  return {
    version: "1.0",
    ultimaAtualizacao: new Date().toISOString().split("T")[0],
    site: {
      nome: get("cfg_site_nome"),
      tagline: get("cfg_site_tagline"),
      tituloHero: get("cfg_site_titulo_hero"),
      subtituloHero: get("cfg_site_subtitulo_hero")
    },
    contato: {
      whatsapp: get("cfg_whatsapp"),
      email: get("cfg_email"),
      linkWhatsappTexto: get("cfg_whatsapp_texto")
    },
    premium: {
      ativo: getCheck("cfg_premium_ativo"),
      preco: parseFloat(get("cfg_premium_preco")) || 0,
      precoFormatado: get("cfg_premium_preco_formatado"),
      linkHotmart: get("cfg_premium_hotmart"),
      tituloCard: get("cfg_premium_titulo"),
      descricaoCard: get("cfg_premium_descricao"),
      textoCTA: get("cfg_premium_cta")
    },
    adsense: {
      ativo: getCheck("cfg_adsense_ativo"),
      publisherId: get("cfg_adsense_id")
    },
    analytics: {
      ativo: getCheck("cfg_analytics_ativo"),
      measurementId: get("cfg_analytics_id")
    },
    cards: {
      mostrarPremium: getCheck("cfg_card_premium"),
      mostrarEditar: getCheck("cfg_card_editar"),
      mostrarContato: getCheck("cfg_card_contato")
    }
  };
}

// Helpers
function set(id, valor) {
  const el = document.getElementById(id);
  if (el && valor !== undefined && valor !== null) {
    el.value = valor;
  }
}

function get(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setCheck(id, valor) {
  const el = document.getElementById(id);
  if (el) el.checked = !!valor;
}

function getCheck(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

/* =========================================================
   SALVAR NO GITHUB
========================================================= */
async function salvarTudo() {
  const btn = document.getElementById("btnSalvar");
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = "⏳ Salvando...";

  try {
    const novoConfig = lerForm();
    const token = localStorage.getItem("github_token");

    // Codificar JSON em base64 (formato que o GitHub aceita)
    const conteudoJSON = JSON.stringify(novoConfig, null, 2);
    const conteudoBase64 = btoa(unescape(encodeURIComponent(conteudoJSON)));

    const url = `https://api.github.com/repos/${CONFIG.github.owner}/${CONFIG.github.repo}/contents/${CONFIG.github.arquivo}`;

    const body = {
      message: `Atualizando config.json via dashboard - ${new Date().toLocaleString("pt-BR")}`,
      content: conteudoBase64,
      branch: CONFIG.github.branch
    };

    // Se tem SHA (arquivo existe), incluir
    if (shaAtual) {
      body.sha = shaAtual;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (response.status === 401) {
      throw new Error("Token inválido ou expirado");
    }

    if (response.status === 409) {
      throw new Error("Arquivo foi modificado em outro lugar. Recarregue a página.");
    }

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.message || `Erro ${response.status}`);
    }

    const resultado = await response.json();
    shaAtual = resultado.content.sha;
    configAtual = novoConfig;

    mostrarToast("✅ Salvo! Site atualiza em 1-2 minutos.", "sucesso");

  } catch (err) {
    console.error(err);
    mostrarToast("❌ " + err.message, "erro");
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}

/* =========================================================
   TOAST
========================================================= */
function mostrarToast(msg, tipo = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + tipo;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    t.className = "";
  }, 3500);
}

/* =========================================================
   INICIALIZAÇÃO — Verificar se já está logado
========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  // Se já logou antes, restaura sessão automaticamente
  if (localStorage.getItem("admin_logado") === "sim" && localStorage.getItem("github_token")) {
    document.getElementById("telaLogin").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    carregarConfig();
  }

  // Atalho: Enter na senha tenta entrar
  document.getElementById("senha")?.addEventListener("keypress", e => {
    if (e.key === "Enter") entrar();
  });
  document.getElementById("token")?.addEventListener("keypress", e => {
    if (e.key === "Enter") entrar();
  });
});
