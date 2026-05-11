/* =========================================================
   EDITAR.JS — Upload e edição de contratos existentes
========================================================= */

let textoAtual = "";

/* =========================================================
   CLÁUSULAS PRONTAS (sugestões)
========================================================= */
const CLAUSULAS = [
  {
    id: "reajuste",
    titulo: "🔧 Cláusula de Reajuste (IGP-M)",
    descricao: "Reajuste anual pelo IGP-M ou índice substituto.",
    texto: `\n\nCLÁUSULA DE REAJUSTE\n\nO valor será reajustado anualmente pelo IGP-M (Índice Geral de Preços do Mercado), ou outro índice legal que vier a substituí-lo, observada a periodicidade mínima legal.\n`
  },
  {
    id: "multa",
    titulo: "⚠️ Cláusula de Multa por Atraso",
    descricao: "Multa de 10% + juros de 1% ao mês + correção monetária.",
    texto: `\n\nCLÁUSULA DE MULTA POR ATRASO\n\nO atraso no pagamento implicará multa de 10% (dez por cento) sobre o valor devido, juros de mora de 1% (um por cento) ao mês e correção monetária pelo IGP-M ou índice que vier a substituí-lo.\n`
  },
  {
    id: "vistoria",
    titulo: "🏠 Cláusula de Vistoria",
    descricao: "Declaração de que foi feita vistoria do imóvel.",
    texto: `\n\nCLÁUSULA DE VISTORIA\n\nAs partes declaram que foi realizada vistoria no imóvel, encontrando-se este em perfeitas condições de uso, salvo eventuais ressalvas registradas em termo de vistoria anexo, se houver. O LOCATÁRIO compromete-se a devolver o imóvel nas mesmas condições, salvo desgastes naturais decorrentes do uso normal.\n`
  },
  {
    id: "foro",
    titulo: "📋 Cláusula de Foro",
    descricao: "Eleição de foro para resolver disputas.",
    texto: `\n\nCLÁUSULA DE FORO\n\nAs partes elegem o foro da Comarca de _________________ para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.\n`
  },
  {
    id: "rescisao",
    titulo: "🚪 Cláusula de Rescisão Antecipada",
    descricao: "Permite rescindir com 30 dias de aviso prévio.",
    texto: `\n\nCLÁUSULA DE RESCISÃO ANTECIPADA\n\nQualquer das partes poderá rescindir o presente contrato antes do prazo final, mediante aviso prévio de 30 (trinta) dias, sujeitando-se ao pagamento de multa proporcional ao período de cumprimento do contrato, conforme art. 4º da Lei 8.245/91 quando aplicável.\n`
  },
  {
    id: "despesas",
    titulo: "🔌 Cláusula de Despesas (locação)",
    descricao: "Define quais despesas o locatário paga.",
    texto: `\n\nCLÁUSULA DE DESPESAS\n\nO LOCATÁRIO obriga-se a pagar, além do aluguel, todas as despesas de consumo do imóvel, incluindo:\na) Energia elétrica;\nb) Água e esgoto;\nc) Gás (quando aplicável);\nd) Internet, telefone e demais serviços contratados;\ne) IPTU (Imposto Predial e Territorial Urbano);\nf) Taxas de condomínio (quando houver).\n`
  },
  {
    id: "confidencialidade",
    titulo: "🤐 Cláusula de Confidencialidade",
    descricao: "Obriga as partes a manter sigilo de informações.",
    texto: `\n\nCLÁUSULA DE CONFIDENCIALIDADE\n\nAs partes comprometem-se a manter em absoluto sigilo todas as informações de natureza confidencial relativas a este contrato e à outra parte, durante sua vigência e pelo prazo de 5 (cinco) anos após seu término, sob pena de responder pelas perdas e danos decorrentes.\n`
  },
  {
    id: "lgpd",
    titulo: "🔒 Cláusula de Proteção de Dados (LGPD)",
    descricao: "Garante tratamento de dados conforme a LGPD.",
    texto: `\n\nCLÁUSULA DE PROTEÇÃO DE DADOS\n\nAs partes obrigam-se a tratar os dados pessoais obtidos em razão deste contrato em conformidade com a Lei nº 13.709/2018 (LGPD), utilizando-os exclusivamente para as finalidades aqui previstas, adotando medidas de segurança adequadas e respeitando os direitos do titular dos dados.\n`
  }
];

/* =========================================================
   UPLOAD DE ARQUIVO
========================================================= */
function setupUpload() {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const btnSelecionar = document.getElementById("btnSelecionarArquivo");

  if (!uploadArea || !fileInput) return;

  // Clique na área (mas não no botão, pra não disparar 2x)
  uploadArea.addEventListener("click", e => {
    if (e.target.closest("button")) return;
    fileInput.click();
  });

  // Clique no botão "selecione"
  if (btnSelecionar) {
    btnSelecionar.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      fileInput.click();
    });
  }

  // Arquivo selecionado
  fileInput.addEventListener("change", e => {
    if (e.target.files[0]) processarArquivo(e.target.files[0]);
  });

  // Drag and drop
  uploadArea.addEventListener("dragover", e => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", e => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    if (e.dataTransfer.files[0]) processarArquivo(e.dataTransfer.files[0]);
  });
}

async function processarArquivo(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext !== "pdf" && ext !== "docx") {
    mostrarToast("❌ Apenas PDF e Word (.docx) são aceitos");
    return;
  }

  // Limite de tamanho (10MB)
  if (file.size > 10 * 1024 * 1024) {
    mostrarToast("❌ Arquivo muito grande (máximo 10MB)");
    return;
  }

  document.getElementById("uploadArea").style.display = "none";
  document.getElementById("uploadLoading").style.display = "block";

  try {
    let texto = "";
    if (ext === "pdf") {
      texto = await extrairTextoPDF(file);
    } else {
      texto = await extrairTextoWord(file);
    }

    if (!texto.trim()) {
      throw new Error("Não foi possível extrair texto do arquivo. Pode ser um PDF escaneado (imagem) — esses precisam de OCR.");
    }

    document.getElementById("uploadLoading").style.display = "none";
    document.getElementById("editorArea").style.display = "block";
    document.getElementById("editorTexto").innerText = texto;
    textoAtual = texto;

    mostrarToast("✅ Contrato carregado! Você já pode editar.");
  } catch (err) {
    console.error(err);
    document.getElementById("uploadLoading").style.display = "none";
    document.getElementById("uploadArea").style.display = "block";
    mostrarToast("❌ " + err.message);
  }
}

async function extrairTextoPDF(file) {
  if (typeof pdfjsLib === "undefined") {
    throw new Error("Biblioteca PDF.js não carregou. Recarregue a página.");
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;

  let texto = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    texto += content.items.map(item => item.str).join(" ") + "\n\n";
  }
  return texto;
}

async function extrairTextoWord(file) {
  if (typeof mammoth === "undefined") {
    throw new Error("Biblioteca Mammoth não carregou. Recarregue a página.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function resetarEditor() {
  if (!confirm("Carregar outro contrato? O atual será descartado (se você não baixou ainda, perderá as edições).")) return;
  document.getElementById("editorArea").style.display = "none";
  document.getElementById("uploadArea").style.display = "block";
  document.getElementById("fileInput").value = "";
  document.getElementById("editorTexto").innerText = "";
  document.getElementById("camposDetectados").innerHTML =
    '<p class="aviso-vazio">Clique em "Detectar campos editáveis" para começar.</p>';
  textoAtual = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   DETECÇÃO AUTOMÁTICA DE CAMPOS
========================================================= */
function detectarCampos() {
  const texto = document.getElementById("editorTexto").innerText;
  if (!texto.trim()) {
    mostrarToast("⚠️ Editor vazio");
    return;
  }

  const campos = [];

  // Padrões de detecção
  const padroes = [
    { regex: /CPF[:\s]*([\d.\-]+)/gi, label: "CPF" },
    { regex: /CNPJ[:\s]*([\d.\-\/]+)/gi, label: "CNPJ" },
    { regex: /RG[:\s]*([\d.\-Xx]+)/gi, label: "RG" },
    { regex: /R\$\s*[\d.,]+/gi, label: "Valor monetário" },
    { regex: /\d{1,2}\/\d{1,2}\/\d{2,4}/g, label: "Data" },
    { regex: /(\d+)\s*\(([^)]+)\)\s*meses/gi, label: "Prazo (meses)" },
    { regex: /Comarca de ([A-ZÀ-Ú][a-zà-ú\s]+?)(?:\.|,)/g, label: "Cidade/Foro" },
    { regex: /CEP[:\s]*\d{5}-?\d{3}/gi, label: "CEP" }
  ];

  padroes.forEach(({ regex, label }) => {
    let match;
    const matches = new Set();
    while ((match = regex.exec(texto)) !== null) {
      const valor = match[0];
      if (!matches.has(valor)) {
        matches.add(valor);
        campos.push({ label, valor });
      }
    }
  });

  const container = document.getElementById("camposDetectados");

  if (campos.length === 0) {
    container.innerHTML = '<p class="aviso-vazio">Nenhum campo detectado automaticamente. Edite o texto diretamente.</p>';
    mostrarToast("⚠️ Nenhum campo padrão detectado");
    return;
  }

  container.innerHTML = campos.map(c => `
    <div class="campo-detectado" data-valor="${c.valor.replace(/"/g, '&quot;')}">
      <div class="label">${c.label}</div>
      <div class="valor">${c.valor}</div>
    </div>
  `).join("");

  // Eventos de clique
  container.querySelectorAll(".campo-detectado").forEach(el => {
    el.addEventListener("click", () => {
      destacarTexto(el.getAttribute("data-valor"));
    });
  });

  mostrarToast(`✅ ${campos.length} campo(s) detectado(s)`);
}

function destacarTexto(textoBusca) {
  const editor = document.getElementById("editorTexto");
  const texto = editor.innerText;

  const idx = texto.indexOf(textoBusca);
  if (idx === -1) {
    mostrarToast("⚠️ Texto não encontrado (talvez tenha sido editado)");
    return;
  }

  editor.focus();

  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let node;
  while ((node = walker.nextNode())) {
    const len = node.textContent.length;
    if (pos + len >= idx) {
      try {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(node, idx - pos);
        range.setEnd(node, Math.min(idx - pos + textoBusca.length, len));
        selection.removeAllRanges();
        selection.addRange(range);

        // Scroll até o texto
        const rect = range.getBoundingClientRect();
        if (rect.top < 100 || rect.bottom > window.innerHeight - 100) {
          window.scrollTo({
            top: window.scrollY + rect.top - 200,
            behavior: "smooth"
          });
        }
        mostrarToast("✏️ Texto selecionado — pode editar");
      } catch (e) {
        console.error(e);
      }
      return;
    }
    pos += len;
  }
}

/* =========================================================
   MODAL DE SUGESTÕES DE CLÁUSULAS
========================================================= */
function popularSugestoes() {
  const container = document.getElementById("sugestoesLista");
  if (!container) return;

  container.innerHTML = CLAUSULAS.map(c => `
    <div class="sugestao-card">
      <h5>${c.titulo}</h5>
      <p class="small">${c.descricao}</p>
      <button class="btn btn-outline" data-clausula="${c.id}">+ Inserir no contrato</button>
    </div>
  `).join("");

  // Eventos
  container.querySelectorAll("[data-clausula]").forEach(btn => {
    btn.addEventListener("click", () => {
      inserirClausula(btn.getAttribute("data-clausula"));
    });
  });
}

function abrirSugestoes() {
  document.getElementById("modalSugestoes").classList.add("show");
}

function fecharSugestoes() {
  document.getElementById("modalSugestoes").classList.remove("show");
}

function inserirClausula(id) {
  const clausula = CLAUSULAS.find(c => c.id === id);
  if (!clausula) return;

  const editor = document.getElementById("editorTexto");
  editor.innerText += clausula.texto;
  fecharSugestoes();
  mostrarToast("✅ Cláusula inserida no fim do contrato");

  // Scroll até o fim
  editor.scrollTop = editor.scrollHeight;
}

/* =========================================================
   DOWNLOAD — PDF
========================================================= */
function baixarPDF() {
  const texto = document.getElementById("editorTexto").innerText;
  if (!texto.trim()) {
    mostrarToast("⚠️ Editor vazio");
    return;
  }

  if (typeof window.jspdf === "undefined") {
    mostrarToast("❌ Biblioteca PDF não carregou. Recarregue a página.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const margemEsq = 20, margemTopo = 25, alturaUtil = 247, larguraUtil = 170;
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

    if (linha.startsWith("CONTRATO") && linha === linha.toUpperCase()) {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(linha, 105, y, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(11);
    } else if (linha.startsWith("CLÁUSULA") || linha.startsWith("PARTES:") || linha.startsWith("TESTEMUNHAS:")) {
      doc.setFont("times", "bold");
      doc.text(linha, margemEsq, y);
      doc.setFont("times", "normal");
    } else {
      doc.text(linha, margemEsq, y);
    }
    y += alturaLinha;
  }

  doc.save("Contrato_Editado.pdf");
  mostrarToast("📄 PDF baixado!");
}

/* =========================================================
   DOWNLOAD — Word
========================================================= */
async function baixarWord() {
  const texto = document.getElementById("editorTexto").innerText;
  if (!texto.trim()) {
    mostrarToast("⚠️ Editor vazio");
    return;
  }

  if (typeof window.docx === "undefined") {
    mostrarToast("❌ Biblioteca Word não carregou. Recarregue a página.");
    return;
  }

  try {
    const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;

    const linhas = texto.split("\n");
    const paragrafos = linhas.map(linha => {
      if (linha.startsWith("CONTRATO") && linha === linha.toUpperCase() && linha.length < 80) {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          children: [new TextRun({ text: linha, bold: true, size: 28, font: "Times New Roman" })]
        });
      }
      if (linha.startsWith("CLÁUSULA") || linha.startsWith("PARTES:") || linha.startsWith("TESTEMUNHAS:")) {
        return new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: linha, bold: true, size: 22, font: "Times New Roman" })]
        });
      }
      if (linha.trim() === "") {
        return new Paragraph({ children: [new TextRun({ text: "" })] });
      }
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: linha, size: 22, font: "Times New Roman" })]
      });
    });

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: paragrafos
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Contrato_Editado.docx";
    a.click();
    URL.revokeObjectURL(url);

    mostrarToast("📝 Word baixado!");
  } catch (err) {
    console.error(err);
    mostrarToast("❌ Erro ao gerar Word. Tente o PDF.");
  }
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  setupUpload();
  popularSugestoes();

  // Eventos da toolbar do editor
  document.getElementById("btnCarregarOutro")?.addEventListener("click", resetarEditor);
  document.getElementById("btnDetectarCampos")?.addEventListener("click", detectarCampos);
  document.getElementById("btnAbrirSugestoes")?.addEventListener("click", abrirSugestoes);
  document.getElementById("btnFecharSugestoes")?.addEventListener("click", fecharSugestoes);

  // Modal fecha clicando fora
  document.getElementById("modalSugestoes")?.addEventListener("click", e => {
    if (e.target.id === "modalSugestoes") fecharSugestoes();
  });

  // Botões de download
  document.getElementById("btnBaixarPDF")?.addEventListener("click", baixarPDF);
  document.getElementById("btnBaixarWord")?.addEventListener("click", baixarWord);
});