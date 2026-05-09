/* =========================================================
   CONTRATOS FÁCIL — APP.JS
   Gerador de contrato de locação residencial
========================================================= */

let passoAtualNum = 1;
let dadosContrato = {};

/* ===== Navegação entre passos ===== */
function proximoPasso(passo) {
  // Validar campos obrigatórios do passo atual
  const passoEl = document.querySelector(`[data-passo="${passo}"]`);
  const obrigatorios = passoEl.querySelectorAll("[required]");
  for (const campo of obrigatorios) {
    if (!campo.value.trim()) {
      campo.focus();
      mostrarToast("⚠️ Preencha os campos obrigatórios");
      campo.style.borderColor = "#ef4444";
      setTimeout(() => campo.style.borderColor = "", 2000);
      return;
    }
  }

  // Esconder atual, mostrar próximo
  passoEl.classList.remove("passo-ativo");
  const proximoEl = document.querySelector(`[data-passo="${passo + 1}"]`);
  if (proximoEl) {
    proximoEl.classList.add("passo-ativo");
    passoAtualNum = passo + 1;
    atualizarProgresso();
    scrollParaTopo();
  }
}

function passoAnterior(passo) {
  document.querySelector(`[data-passo="${passo}"]`).classList.remove("passo-ativo");
  document.querySelector(`[data-passo="${passo - 1}"]`).classList.add("passo-ativo");
  passoAtualNum = passo - 1;
  atualizarProgresso();
  scrollParaTopo();
}

function atualizarProgresso() {
  const total = 4;
  const pct = (passoAtualNum / total) * 100;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("passoAtual").textContent = passoAtualNum;
}

function scrollParaTopo() {
  document.getElementById("gerador").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ===== Coletar dados do formulário ===== */
function coletarDados() {
  return {
    locador: {
      nome: document.getElementById("locador_nome").value.trim(),
      cpf: document.getElementById("locador_cpf").value.trim(),
      rg: document.getElementById("locador_rg").value.trim() || "não informado",
      estadoCivil: document.getElementById("locador_estado_civil").value,
      endereco: document.getElementById("locador_endereco").value.trim()
    },
    locatario: {
      nome: document.getElementById("locatario_nome").value.trim(),
      cpf: document.getElementById("locatario_cpf").value.trim(),
      rg: document.getElementById("locatario_rg").value.trim() || "não informado",
      estadoCivil: document.getElementById("locatario_estado_civil").value,
      endereco: document.getElementById("locatario_endereco").value.trim()
    },
    imovel: {
      endereco: document.getElementById("imovel_endereco").value.trim(),
      tipo: document.getElementById("imovel_tipo").value,
      finalidade: document.getElementById("imovel_finalidade").value,
      descricao: document.getElementById("imovel_descricao").value.trim() || "Imóvel destinado exclusivamente para fins " + document.getElementById("imovel_finalidade").value + "is."
    },
    contrato: {
      valorAluguel: parseFloat(document.getElementById("valor_aluguel").value || 0),
      diaVencimento: document.getElementById("dia_vencimento").value,
      prazoMeses: document.getElementById("prazo_meses").value,
      dataInicio: document.getElementById("data_inicio").value,
      formaPagamento: document.getElementById("forma_pagamento").value,
      cidadeForo: document.getElementById("cidade_foro").value.trim()
    }
  };
}

/* ===== Helpers ===== */
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valorPorExtenso(valor) {
  // Versão simplificada — em produção usaríamos uma biblioteca completa
  if (!valor) return "zero reais";
  return formatarMoeda(valor) + " (a confirmar por extenso)";
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

/* ===== Gerar texto do contrato ===== */
function gerarTextoContrato(d) {
  const dataFim = calcularDataFim(d.contrato.dataInicio, d.contrato.prazoMeses);
  const valorFormatado = formatarMoeda(d.contrato.valorAluguel);

  return `CONTRATO DE LOCAÇÃO ${d.imovel.finalidade.toUpperCase()}


Por este instrumento particular, as partes abaixo qualificadas têm entre si, justo e contratado, o presente Contrato de Locação ${d.imovel.finalidade}, que se regerá pelas cláusulas e condições seguintes, com fundamento na Lei nº 8.245/91 (Lei do Inquilinato).


PARTES:

LOCADOR(A): ${d.locador.nome}, ${d.locador.estadoCivil}, portador(a) do CPF nº ${d.locador.cpf} e RG nº ${d.locador.rg}, residente e domiciliado(a) à ${d.locador.endereco}.

LOCATÁRIO(A): ${d.locatario.nome}, ${d.locatario.estadoCivil}, portador(a) do CPF nº ${d.locatario.cpf} e RG nº ${d.locatario.rg}, residente e domiciliado(a) à ${d.locatario.endereco}.


CLÁUSULA PRIMEIRA — DO OBJETO

O LOCADOR dá em locação ao LOCATÁRIO o imóvel localizado à ${d.imovel.endereco}, do tipo ${d.imovel.tipo}, destinado exclusivamente para fins ${d.imovel.finalidade}is.

Descrição do imóvel: ${d.imovel.descricao}


CLÁUSULA SEGUNDA — DO PRAZO

A presente locação terá prazo determinado de ${d.contrato.prazoMeses} (${numeroPorExtenso(d.contrato.prazoMeses)}) meses, com início em ${formatarData(d.contrato.dataInicio)} e término em ${dataFim}.

Parágrafo único: Findo o prazo, caso o LOCATÁRIO permaneça no imóvel sem oposição do LOCADOR, a locação será prorrogada por prazo indeterminado, mantendo-se as demais cláusulas deste contrato.


CLÁUSULA TERCEIRA — DO ALUGUEL

O valor mensal do aluguel é de ${valorFormatado}, a ser pago até o dia ${d.contrato.diaVencimento} de cada mês, mediante ${d.contrato.formaPagamento}.

§1º — O atraso no pagamento implicará multa de 10% (dez por cento) sobre o valor do aluguel, juros de 1% (um por cento) ao mês e correção monetária pelo IGP-M ou índice que vier a substituí-lo.

§2º — O valor do aluguel será reajustado anualmente pelo IGP-M (Índice Geral de Preços do Mercado), ou outro índice legal que o substitua, observada a periodicidade mínima legal.


CLÁUSULA QUARTA — DAS DESPESAS

O LOCATÁRIO obriga-se a pagar, além do aluguel, todas as despesas de consumo do imóvel, incluindo:
a) Energia elétrica;
b) Água e esgoto;
c) Gás (quando aplicável);
d) Internet, telefone e demais serviços contratados;
e) IPTU (Imposto Predial e Territorial Urbano);
f) Taxas de condomínio (quando houver).


CLÁUSULA QUINTA — DAS OBRIGAÇÕES DO LOCATÁRIO

São obrigações do LOCATÁRIO:
a) Pagar pontualmente o aluguel e demais encargos;
b) Servir-se do imóvel para uso convencionado, com cuidado de proprietário, conservando-o e mantendo-o em bom estado;
c) Restituir o imóvel, finda a locação, no estado em que o recebeu, salvo as deteriorações decorrentes do uso normal;
d) Comunicar ao LOCADOR, imediatamente, qualquer dano ou defeito do imóvel cuja reparação seja de responsabilidade do LOCADOR;
e) Não modificar a estrutura do imóvel sem prévia autorização escrita do LOCADOR;
f) Permitir vistorias periódicas no imóvel, mediante prévio aviso;
g) Cumprir integralmente o regulamento interno do condomínio (quando aplicável).


CLÁUSULA SEXTA — DAS OBRIGAÇÕES DO LOCADOR

São obrigações do LOCADOR:
a) Entregar o imóvel em condições de uso para o fim a que se destina;
b) Garantir, durante o tempo da locação, o uso pacífico do imóvel;
c) Manter, durante a locação, a forma e o destino do imóvel;
d) Responder pelos vícios ou defeitos anteriores à locação;
e) Pagar as despesas extraordinárias do condomínio (quando aplicável).


CLÁUSULA SÉTIMA — DA RESCISÃO

O presente contrato poderá ser rescindido nas seguintes hipóteses:
a) Por mútuo acordo entre as partes;
b) Por descumprimento de qualquer cláusula deste contrato;
c) Por falta de pagamento do aluguel ou encargos por mais de 30 (trinta) dias;
d) Por iniciativa do LOCATÁRIO, mediante aviso prévio de 30 (trinta) dias e pagamento de multa proporcional ao período restante (na forma do art. 4º da Lei 8.245/91).


CLÁUSULA OITAVA — DA VISTORIA

As partes declaram que foi realizada vistoria no imóvel, encontrando-se este em perfeitas condições de uso, salvo eventuais ressalvas registradas em termo de vistoria anexo, se houver.


CLÁUSULA NONA — DAS DISPOSIÇÕES FINAIS

§1º — Qualquer alteração deste contrato somente terá validade se feita por escrito e assinada por ambas as partes.

§2º — O presente contrato obriga as partes, seus herdeiros e sucessores, a qualquer título.

§3º — As partes elegem o foro da Comarca de ${d.contrato.cidadeForo} para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.


E por estarem assim justas e contratadas, as partes assinam o presente contrato em 2 (duas) vias de igual teor, na presença de 2 (duas) testemunhas.


${d.contrato.cidadeForo}, ${dataPorExtenso(d.contrato.dataInicio)}.



_______________________________________________
LOCADOR(A)
${d.locador.nome}
CPF: ${d.locador.cpf}



_______________________________________________
LOCATÁRIO(A)
${d.locatario.nome}
CPF: ${d.locatario.cpf}



TESTEMUNHAS:


1. ____________________________________________
   Nome:
   CPF:


2. ____________________________________________
   Nome:
   CPF:
`;
}

function numeroPorExtenso(num) {
  const numeros = {
    "1": "um", "2": "dois", "3": "três", "4": "quatro", "5": "cinco",
    "6": "seis", "7": "sete", "8": "oito", "9": "nove", "10": "dez",
    "11": "onze", "12": "doze", "15": "quinze", "18": "dezoito",
    "20": "vinte", "24": "vinte e quatro", "30": "trinta", "36": "trinta e seis",
    "48": "quarenta e oito", "60": "sessenta"
  };
  return numeros[String(num)] || num;
}

/* ===== Gerar contrato (botão final) ===== */
function gerarContrato() {
  // Validar último passo
  const passoEl = document.querySelector('[data-passo="4"]');
  const obrigatorios = passoEl.querySelectorAll("[required]");
  for (const campo of obrigatorios) {
    if (!campo.value.trim()) {
      campo.focus();
      mostrarToast("⚠️ Preencha os campos obrigatórios");
      campo.style.borderColor = "#ef4444";
      setTimeout(() => campo.style.borderColor = "", 2000);
      return;
    }
  }

  dadosContrato = coletarDados();
  const texto = gerarTextoContrato(dadosContrato);

  // Mostrar resultado
  document.getElementById("contratoForm").style.display = "none";
  document.querySelector(".progress-bar").style.display = "none";
  document.querySelector(".progress-text").style.display = "none";
  const resultado = document.getElementById("resultado");
  resultado.style.display = "block";
  document.getElementById("previewContrato").textContent = texto;

  // Scroll para o resultado
  setTimeout(() => {
    resultado.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);

  mostrarToast("✅ Contrato gerado!");
}

function novoContrato() {
  if (!confirm("Tem certeza? Você perderá os dados preenchidos.")) return;
  document.getElementById("contratoForm").reset();
  document.getElementById("contratoForm").style.display = "block";
  document.querySelector(".progress-bar").style.display = "block";
  document.querySelector(".progress-text").style.display = "block";
  document.getElementById("resultado").style.display = "none";

  // Voltar para o passo 1
  document.querySelectorAll(".passo").forEach(p => p.classList.remove("passo-ativo"));
  document.querySelector('[data-passo="1"]').classList.add("passo-ativo");
  passoAtualNum = 1;
  atualizarProgresso();
  scrollParaTopo();
}

/* ===== Baixar PDF ===== */
function baixarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const texto = gerarTextoContrato(dadosContrato);
  const margemEsq = 20;
  const margemDir = 20;
  const margemTopo = 25;
  const margemBaixo = 25;
  const larguraUtil = 210 - margemEsq - margemDir;
  const alturaUtil = 297 - margemTopo - margemBaixo;

  doc.setFont("times", "normal");
  doc.setFontSize(11);

  const linhas = doc.splitTextToSize(texto, larguraUtil);
  let y = margemTopo;
  const alturaLinha = 5;

  for (const linha of linhas) {
    if (y > margemTopo + alturaUtil) {
      doc.addPage();
      y = margemTopo;
    }

    // Detectar título principal
    if (linha.startsWith("CONTRATO DE LOCAÇÃO")) {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(linha, 105, y, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(11);
    }
    // Detectar cláusulas
    else if (linha.startsWith("CLÁUSULA") || linha.startsWith("PARTES:")) {
      doc.setFont("times", "bold");
      doc.text(linha, margemEsq, y);
      doc.setFont("times", "normal");
    }
    else {
      doc.text(linha, margemEsq, y);
    }
    y += alturaLinha;
  }

  const nomeArquivo = `Contrato_Locacao_${dadosContrato.locatario.nome.replace(/\s+/g, "_")}.pdf`;
  doc.save(nomeArquivo);
  mostrarToast("📄 PDF baixado!");
}

/* ===== Baixar Word (.docx) ===== */
async function baixarWord() {
  try {
    const { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } = window.docx;

    const texto = gerarTextoContrato(dadosContrato);
    const linhas = texto.split("\n");

    const paragrafos = linhas.map(linha => {
      // Título principal
      if (linha.startsWith("CONTRATO DE LOCAÇÃO")) {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({
              text: linha,
              bold: true,
              size: 28,
              font: "Times New Roman"
            })
          ]
        });
      }
      // Cláusulas e títulos de seção
      if (linha.startsWith("CLÁUSULA") || linha.startsWith("PARTES:") || linha.startsWith("TESTEMUNHAS:")) {
        return new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: linha,
              bold: true,
              size: 22,
              font: "Times New Roman"
            })
          ]
        });
      }
      // Linhas em branco
      if (linha.trim() === "") {
        return new Paragraph({ children: [new TextRun({ text: "" })] });
      }
      // Texto normal
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: linha,
            size: 22,
            font: "Times New Roman"
          })
        ]
      });
    });

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: paragrafos
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Contrato_Locacao_${dadosContrato.locatario.nome.replace(/\s+/g, "_")}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    mostrarToast("📝 Word baixado!");
  } catch (err) {
    console.error(err);
    mostrarToast("❌ Erro ao gerar Word. Tente o PDF.");
  }
}

/* ===== Toast ===== */
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

/* ===== Máscara de CPF ===== */
function aplicarMascaraCPF(input) {
  input.addEventListener("input", e => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    e.target.value = v;
  });
}

/* ===== Inicialização ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Aplicar máscara nos CPFs
  aplicarMascaraCPF(document.getElementById("locador_cpf"));
  aplicarMascaraCPF(document.getElementById("locatario_cpf"));

  // Data de início padrão = hoje
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("data_inicio").value = hoje;
});