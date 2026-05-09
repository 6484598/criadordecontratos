/* =========================================================
   UTILS.JS — Funções compartilhadas entre todos os contratos
========================================================= */


/* =========================================================
   1) TOAST (notificação flutuante)
========================================================= */
function mostrarToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}


/* =========================================================
   2) MÁSCARAS DE INPUT
========================================================= */

function aplicarMascaraCPF(input) {
  if (!input) return;
  input.addEventListener("input", e => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    e.target.value = v;
  });
}

function aplicarMascaraRG(input) {
  if (!input) return;
  input.addEventListener("input", e => {
    let v = e.target.value.replace(/[^\dXx]/g, "");
    if (v.length > 9) v = v.slice(0, 9);
    if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})([\dXx]{1})/, "$1.$2.$3-$4");
    else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,3})/, "$1.$2");
    e.target.value = v;
  });
}

function aplicarMascaraTelefone(input) {
  if (!input) return;
  input.addEventListener("input", e => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{1,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, "($1) $2");
    e.target.value = v;
  });
}

function aplicarMascaraCEP(input) {
  if (!input) return;
  input.addEventListener("input", e => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 5) v = v.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    e.target.value = v;
  });
}

function aplicarMascaraMoeda(input) {
  if (!input) return;
  input.addEventListener("input", e => {
    let v = e.target.value.replace(/\D/g, "");
    if (!v) { e.target.value = ""; return; }
    v = (parseInt(v) / 100).toFixed(2);
    v = v.replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    e.target.value = "R$ " + v;
  });
}


/* =========================================================
   3) VALIDAÇÃO DE CPF (algoritmo dos dígitos verificadores)
========================================================= */
function validarCPF(cpf) {
  cpf = String(cpf || "").replace(/\D/g, "");

  // Tem que ter 11 dígitos e não pode ser todos iguais
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/* Validação de CNPJ (para futura expansão) */
function validarCNPJ(cnpj) {
  cnpj = String(cnpj || "").replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(1)) return false;

  return true;
}


/* =========================================================
   4) FORMATADORES
========================================================= */

function formatarMoeda(valor) {
  const num = typeof valor === "string"
    ? parseFloat(valor.replace(/[^\d,]/g, "").replace(",", "."))
    : valor;
  return (num || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseMoedaInput(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  return parseFloat(String(valor).replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

function formatarData(dataISO) {
  if (!dataISO) return "____/____/______";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function dataPorExtenso(dataISO) {
  if (!dataISO) return "_____ de ___________ de _______";
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
                 "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const [ano, mes, dia] = dataISO.split("-");
  return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${ano}`;
}

function calcularDataFim(dataInicioISO, meses) {
  if (!dataInicioISO) return "_____ de ___________ de _______";
  const data = new Date(dataInicioISO);
  data.setMonth(data.getMonth() + parseInt(meses));
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function numeroPorExtenso(num) {
  const numeros = {
    "1": "um", "2": "dois", "3": "três", "4": "quatro", "5": "cinco",
    "6": "seis", "7": "sete", "8": "oito", "9": "nove", "10": "dez",
    "11": "onze", "12": "doze", "13": "treze", "14": "quatorze", "15": "quinze",
    "16": "dezesseis", "17": "dezessete", "18": "dezoito", "19": "dezenove",
    "20": "vinte", "24": "vinte e quatro", "25": "vinte e cinco",
    "30": "trinta", "36": "trinta e seis", "48": "quarenta e oito", "60": "sessenta"
  };
  return numeros[String(num)] || num;
}

/* Valor por extenso (versão funcional para até milhões) */
function valorPorExtenso(valor) {
  valor = parseFloat(valor);
  if (!valor || isNaN(valor)) return "zero reais";

  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
                    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis",
                    "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta",
                   "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
                    "seiscentos", "setecentos", "oitocentos", "novecentos"];

  function ate999(n) {
    if (n === 0) return "";
    if (n === 100) return "cem";
    let r = "";
    const c = Math.floor(n / 100);
    const resto = n % 100;
    if (c) r += centenas[c];
    if (c && resto) r += " e ";
    if (resto < 20) r += unidades[resto];
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      r += dezenas[d];
      if (u) r += " e " + unidades[u];
    }
    return r.trim();
  }

  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);

  let texto = "";
  const milhoes = Math.floor(inteiro / 1000000);
  const milhares = Math.floor((inteiro % 1000000) / 1000);
  const resto = inteiro % 1000;

  if (milhoes) texto += ate999(milhoes) + (milhoes === 1 ? " milhão" : " milhões");
  if (milhares) {
    if (texto) texto += ", ";
    texto += ate999(milhares) + " mil";
  }
  if (resto) {
    if (texto) texto += " e ";
    texto += ate999(resto);
  }
  if (!texto) texto = "zero";

  texto += inteiro === 1 ? " real" : " reais";

  if (centavos) {
    texto += " e " + ate999(centavos) + (centavos === 1 ? " centavo" : " centavos");
  }

  return texto;
}


/* =========================================================
   5) STORAGE (sessionStorage para persistir dados)
========================================================= */

const STORAGE_PREFIX = "contratos_facil_";

function salvarDados(chave, dados) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + chave, JSON.stringify(dados));
    return true;
  } catch (e) {
    console.warn("Erro ao salvar:", e);
    return false;
  }
}

function carregarDados(chave) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + chave);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function limparDados(chave) {
  sessionStorage.removeItem(STORAGE_PREFIX + chave);
}

/* Auto-salvar todos os inputs de um formulário */
function ativarAutoSalvar(formId, chaveStorage) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Restaurar dados anteriores
  const dadosSalvos = carregarDados(chaveStorage);
  if (dadosSalvos) {
    Object.entries(dadosSalvos).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el && valor) {
        if (el.type === "checkbox") el.checked = !!valor;
        else el.value = valor;
      }
    });
    mostrarToast("📋 Dados anteriores restaurados");
  }

  // Salvar a cada mudança
  form.addEventListener("input", () => {
    const dados = {};
    form.querySelectorAll("input, select, textarea").forEach(el => {
      if (!el.id) return;
      dados[el.id] = el.type === "checkbox" ? el.checked : el.value;
    });
    salvarDados(chaveStorage, dados);
  });
}


/* =========================================================
   6) VALIDAÇÃO DE PASSO (com mensagens específicas)
========================================================= */
function validarPasso(passoNum) {
  const passoEl = document.querySelector(`[data-passo="${passoNum}"]`);
  if (!passoEl) {
    console.warn("[validarPasso] Passo não encontrado:", passoNum);
    return true;
  }

  // Pega só os obrigatórios VISÍVEIS (ignora campos em display:none)
  const obrigatorios = Array.from(passoEl.querySelectorAll("[required]")).filter(campo => {
    // Verifica se o campo ou algum ancestral está escondido
    return campo.offsetParent !== null;
  });

  for (const campo of obrigatorios) {
    const valor = String(campo.value || "").trim();

    if (!valor) {
      campo.focus();
      mostrarToast("⚠️ Preencha os campos obrigatórios");
      campo.style.borderColor = "#ef4444";
      setTimeout(() => campo.style.borderColor = "", 2000);
      console.warn("[validarPasso] Campo vazio:", campo.id);
      return false;
    }

    // Validação específica de CPF
    if (campo.dataset && campo.dataset.validar === "cpf" && !validarCPF(valor)) {
      campo.focus();
      mostrarToast("❌ CPF inválido — verifique os dígitos");
      campo.style.borderColor = "#ef4444";
      setTimeout(() => campo.style.borderColor = "", 2500);
      console.warn("[validarPasso] CPF inválido:", campo.id, valor);
      return false;
    }
  }
  return true;
}


/* =========================================================
   7) SCROLL E NAVEGAÇÃO
========================================================= */
function scrollParaElemento(seletor) {
  const el = document.querySelector(seletor);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}