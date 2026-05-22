/* =========================================================
   RECIBO-ALUGUEL.JS — Gerador de Recibo de Aluguel
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Auto-preenche data de emissão com hoje
  const hoje = new Date().toISOString().split("T")[0];
  const dataEmissao = document.getElementById("dataEmissao");
  if (dataEmissao && !dataEmissao.value) dataEmissao.value = hoje;

  // Auto-preenche data de pagamento com hoje
  const dataPagamento = document.getElementById("dataPagamento");
  if (dataPagamento && !dataPagamento.value) dataPagamento.value = hoje;

  // Máscara de CPF
  document.querySelectorAll("#locadorCPF, #locatarioCPF").forEach(input => {
    input.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g, "").slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      e.target.value = v;
    });
  });
});

/* =========================================================
   COLETAR DADOS
========================================================= */
function coletarDados() {
  const valorPago = parseFloat(document.getElementById("valorPago").value) || 0;
  const valorCondominio = parseFloat(document.getElementById("valorCondominio").value) || 0;
  const valorIPTU = parseFloat(document.getElementById("valorIPTU").value) || 0;
  const valorMulta = parseFloat(document.getElementById("valorMulta").value) || 0;
  const valorTotal = valorPago + valorCondominio + valorIPTU + valorMulta;

  return {
    locadorNome: document.getElementById("locadorNome").value.trim(),
    locadorCPF: document.getElementById("locadorCPF").value.trim(),
    locadorEndereco: document.getElementById("locadorEndereco").value.trim(),

    locatarioNome: document.getElementById("locatarioNome").value.trim(),
    locatarioCPF: document.getElementById("locatarioCPF").value.trim(),

    imovelEndereco: document.getElementById("imovelEndereco").value.trim(),

    valorPago,
    valorCondominio,
    valorIPTU,
    valorMulta,
    valorTotal,
    valorTotalExtenso: numeroParaExtenso(valorTotal),

    mesReferencia: document.getElementById("mesReferencia").value,
    anoReferencia: document.getElementById("anoReferencia").value,
    dataPagamento: formatarData(document.getElementById("dataPagamento").value),
    formaPagamento: document.getElementById("formaPagamento").value,

    observacoes: document.getElementById("observacoes").value.trim(),

    cidadeEmissao: document.getElementById("cidadeEmissao").value.trim(),
    dataEmissao: formatarData(document.getElementById("dataEmissao").value)
  };
}

function validarDados(d) {
  const obrigatorios = [
    ["locadorNome", "Nome do locador"],
    ["locadorCPF", "CPF do locador"],
    ["locatarioNome", "Nome do locatário"],
    ["locatarioCPF", "CPF do locatário"],
    ["imovelEndereco", "Endereço do imóvel"],
    ["mesReferencia", "Mês de referência"],
    ["anoReferencia", "Ano"],
    ["dataPagamento", "Data do pagamento"],
    ["formaPagamento", "Forma de pagamento"],
    ["cidadeEmissao", "Cidade de emissão"],
    ["dataEmissao", "Data de emissão"]
  ];

  for (const [campo, label] of obrigatorios) {
    if (!d[campo]) {
      alert(`Por favor, preencha: ${label}`);
      document.getElementById(campo)?.focus();
      return false;
    }
  }

  if (d.valorPago <= 0) {
    alert("Valor do aluguel deve ser maior que zero");
    document.getElementById("valorPago")?.focus();
    return false;
  }

  return true;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarData(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

/* =========================================================
   NÚMERO POR EXTENSO (versão simples)
========================================================= */
function numeroParaExtenso(valor) {
  if (typeof numeroExtenso === "function") {
    return numeroExtenso(valor); // Usa do utils.js se existir
  }
  // Fallback simples
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);
  return `${reais} reais${centavos > 0 ? ` e ${centavos} centavos` : ""}`;
}

/* =========================================================
   GERAR PDF
========================================================= */
function gerarPDF() {
  const d = coletarDados();
  if (!validarDados(d)) return;

  if (typeof window.jspdf === "undefined") {
    alert("Biblioteca PDF não carregou. Recarregue a página.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const margemEsq = 20;
  const larguraUtil = 170;
  let y = 25;

  // CABEÇALHO COM BORDA
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.rect(margemEsq - 5, y - 5, larguraUtil + 10, 25);

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("RECIBO DE ALUGUEL", 105, y + 5, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Referente a ${d.mesReferencia.toUpperCase()}/${d.anoReferencia}`, 105, y + 13, { align: "center" });

  y += 30;

  // VALOR EM DESTAQUE
  doc.setFillColor(240, 249, 255);
  doc.rect(margemEsq, y, larguraUtil, 16, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text(`R$ ${formatarMoeda(d.valorTotal)}`, 105, y + 10, { align: "center" });
  doc.setTextColor(0, 0, 0);

  y += 22;

  // DECLARAÇÃO PRINCIPAL
  doc.setFont("times", "normal");
  doc.setFontSize(11);

  const declaracao = `Eu, ${d.locadorNome}, portador(a) do CPF nº ${d.locadorCPF}${d.locadorEndereco ? `, residente à ${d.locadorEndereco}` : ""}, DECLARO ter recebido de ${d.locatarioNome}, portador(a) do CPF nº ${d.locatarioCPF}, a quantia de R$ ${formatarMoeda(d.valorTotal)} (${d.valorTotalExtenso}), referente ao aluguel do mês de ${d.mesReferencia} de ${d.anoReferencia} do imóvel localizado à ${d.imovelEndereco}.`;

  const linhasDeclaracao = doc.splitTextToSize(declaracao, larguraUtil);
  doc.text(linhasDeclaracao, margemEsq, y);
  y += linhasDeclaracao.length * 5 + 8;

  // DETALHAMENTO DE VALORES (se tiver extras)
  if (d.valorCondominio > 0 || d.valorIPTU > 0 || d.valorMulta > 0) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("Detalhamento:", margemEsq, y);
    y += 6;

    doc.setFont("times", "normal");
    doc.text(`• Aluguel: R$ ${formatarMoeda(d.valorPago)}`, margemEsq + 5, y);
    y += 5;

    if (d.valorCondominio > 0) {
      doc.text(`• Condomínio: R$ ${formatarMoeda(d.valorCondominio)}`, margemEsq + 5, y);
      y += 5;
    }
    if (d.valorIPTU > 0) {
      doc.text(`• IPTU: R$ ${formatarMoeda(d.valorIPTU)}`, margemEsq + 5, y);
      y += 5;
    }
    if (d.valorMulta > 0) {
      doc.text(`• Multa/juros: R$ ${formatarMoeda(d.valorMulta)}`, margemEsq + 5, y);
      y += 5;
    }

    doc.setFont("times", "bold");
    doc.text(`TOTAL: R$ ${formatarMoeda(d.valorTotal)}`, margemEsq + 5, y);
    y += 8;
    doc.setFont("times", "normal");
  }

  // DETALHES DO PAGAMENTO
  doc.setFont("times", "bold");
  doc.text("Data do pagamento:", margemEsq, y);
  doc.setFont("times", "normal");
  doc.text(d.dataPagamento, margemEsq + 50, y);
  y += 6;

  doc.setFont("times", "bold");
  doc.text("Forma de pagamento:", margemEsq, y);
  doc.setFont("times", "normal");
  doc.text(d.formaPagamento, margemEsq + 50, y);
  y += 10;

  // OBSERVAÇÕES (se houver)
  if (d.observacoes) {
    doc.setFont("times", "bold");
    doc.text("Observações:", margemEsq, y);
    y += 6;
    doc.setFont("times", "normal");
    const linhasObs = doc.splitTextToSize(d.observacoes, larguraUtil);
    doc.text(linhasObs, margemEsq, y);
    y += linhasObs.length * 5 + 8;
  }

  // QUITAÇÃO
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  const quitacao = "Para maior clareza, firmo o presente recibo, dando plena, geral e irrevogável quitação do valor acima especificado, referente ao mês indicado.";
  const linhasQuit = doc.splitTextToSize(quitacao, larguraUtil);
  doc.text(linhasQuit, margemEsq, y);
  y += linhasQuit.length * 5 + 15;

  // LOCAL E DATA
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text(`${d.cidadeEmissao}, ${d.dataEmissao}.`, 105, y, { align: "center" });
  y += 20;

  // ASSINATURA
  doc.setLineWidth(0.3);
  doc.line(60, y, 150, y);
  y += 5;
  doc.setFont("times", "bold");
  doc.text(d.locadorNome, 105, y, { align: "center" });
  y += 5;
  doc.setFont("times", "normal");
  doc.text(`CPF: ${d.locadorCPF}`, 105, y, { align: "center" });
  y += 5;
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text("(LOCADOR)", 105, y, { align: "center" });

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Gerado em criadordecontratos.net.br", 105, 285, { align: "center" });

  doc.save(`Recibo_Aluguel_${d.mesReferencia}_${d.anoReferencia}.pdf`);
}

/* =========================================================
   GERAR WORD
========================================================= */
async function gerarWord() {
  const d = coletarDados();
  if (!validarDados(d)) return;

  if (typeof window.docx === "undefined") {
    alert("Biblioteca Word não carregou. Recarregue a página.");
    return;
  }

  const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = window.docx;

  const paragrafos = [];

  // Título
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: "RECIBO DE ALUGUEL", bold: true, size: 36, font: "Times New Roman" })]
  }));

  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: `Referente a ${d.mesReferencia.toUpperCase()}/${d.anoReferencia}`, size: 24, font: "Times New Roman" })]
  }));

  // Valor em destaque
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [new TextRun({ text: `R$ ${formatarMoeda(d.valorTotal)}`, bold: true, size: 40, font: "Times New Roman", color: "2563EB" })]
  }));

  // Declaração principal
  const declaracao = `Eu, ${d.locadorNome}, portador(a) do CPF nº ${d.locadorCPF}${d.locadorEndereco ? `, residente à ${d.locadorEndereco}` : ""}, DECLARO ter recebido de ${d.locatarioNome}, portador(a) do CPF nº ${d.locatarioCPF}, a quantia de R$ ${formatarMoeda(d.valorTotal)} (${d.valorTotalExtenso}), referente ao aluguel do mês de ${d.mesReferencia} de ${d.anoReferencia} do imóvel localizado à ${d.imovelEndereco}.`;

  paragrafos.push(new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 300 },
    children: [new TextRun({ text: declaracao, size: 22, font: "Times New Roman" })]
  }));

  // Detalhamento (se houver extras)
  if (d.valorCondominio > 0 || d.valorIPTU > 0 || d.valorMulta > 0) {
    paragrafos.push(new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: "Detalhamento:", bold: true, size: 22, font: "Times New Roman" })]
    }));

    paragrafos.push(new Paragraph({
      children: [new TextRun({ text: `• Aluguel: R$ ${formatarMoeda(d.valorPago)}`, size: 22, font: "Times New Roman" })]
    }));

    if (d.valorCondominio > 0) {
      paragrafos.push(new Paragraph({
        children: [new TextRun({ text: `• Condomínio: R$ ${formatarMoeda(d.valorCondominio)}`, size: 22, font: "Times New Roman" })]
      }));
    }
    if (d.valorIPTU > 0) {
      paragrafos.push(new Paragraph({
        children: [new TextRun({ text: `• IPTU: R$ ${formatarMoeda(d.valorIPTU)}`, size: 22, font: "Times New Roman" })]
      }));
    }
    if (d.valorMulta > 0) {
      paragrafos.push(new Paragraph({
        children: [new TextRun({ text: `• Multa/juros: R$ ${formatarMoeda(d.valorMulta)}`, size: 22, font: "Times New Roman" })]
      }));
    }

    paragrafos.push(new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: `TOTAL: R$ ${formatarMoeda(d.valorTotal)}`, bold: true, size: 22, font: "Times New Roman" })]
    }));
  }

  // Detalhes do pagamento
  paragrafos.push(new Paragraph({
    children: [
      new TextRun({ text: "Data do pagamento: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({ text: d.dataPagamento, size: 22, font: "Times New Roman" })
    ]
  }));

  paragrafos.push(new Paragraph({
    spacing: { after: 300 },
    children: [
      new TextRun({ text: "Forma de pagamento: ", bold: true, size: 22, font: "Times New Roman" }),
      new TextRun({ text: d.formaPagamento, size: 22, font: "Times New Roman" })
    ]
  }));

  // Observações
  if (d.observacoes) {
    paragrafos.push(new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: "Observações:", bold: true, size: 22, font: "Times New Roman" })]
    }));
    paragrafos.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 300 },
      children: [new TextRun({ text: d.observacoes, size: 22, font: "Times New Roman" })]
    }));
  }

  // Quitação
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 200, after: 600 },
    children: [new TextRun({ text: "Para maior clareza, firmo o presente recibo, dando plena, geral e irrevogável quitação do valor acima especificado, referente ao mês indicado.", italics: true, size: 20, font: "Times New Roman" })]
  }));

  // Local e data
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [new TextRun({ text: `${d.cidadeEmissao}, ${d.dataEmissao}.`, size: 22, font: "Times New Roman" })]
  }));

  // Assinatura
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 100 },
    children: [new TextRun({ text: "_______________________________________________", size: 22, font: "Times New Roman" })]
  }));
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: d.locadorNome, bold: true, size: 22, font: "Times New Roman" })]
  }));
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `CPF: ${d.locadorCPF}`, size: 22, font: "Times New Roman" })]
  }));
  paragrafos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "(LOCADOR)", italics: true, size: 20, font: "Times New Roman" })]
  }));

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: paragrafos
    }]
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Recibo_Aluguel_${d.mesReferencia}_${d.anoReferencia}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar Word. Tente o PDF.");
  }
}
