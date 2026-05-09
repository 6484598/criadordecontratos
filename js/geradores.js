/* =========================================================
   GERADORES.JS — Geração de PDF e Word (compartilhado)
========================================================= */


/* =========================================================
   1) GERAR PDF a partir de texto formatado
========================================================= */
function gerarPDF(texto, nomeArquivo) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

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
  let pagina = 1;

  // Adicionar número da página + espaço para rubrica (rodapé)
  function adicionarRodape() {
    doc.setFontSize(9);
    doc.setFont("times", "italic");
    doc.text(`Página ${pagina}`, 105, 287, { align: "center" });
    doc.text("Rubrica: _______________", 20, 287);
    doc.setFontSize(11);
    doc.setFont("times", "normal");
  }

  for (const linha of linhas) {
    if (y > margemTopo + alturaUtil) {
      adicionarRodape();
      doc.addPage();
      pagina++;
      y = margemTopo;
    }

    // Detectar título principal
    if (linha.startsWith("CONTRATO DE")) {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(linha, 105, y, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(11);
    }
    // Detectar cláusulas e seções
    else if (linha.startsWith("CLÁUSULA") || linha.startsWith("PARTES:") ||
             linha.startsWith("TESTEMUNHAS:") || linha.startsWith("FIADOR")) {
      doc.setFont("times", "bold");
      doc.text(linha, margemEsq, y);
      doc.setFont("times", "normal");
    }
    else {
      doc.text(linha, margemEsq, y);
    }
    y += alturaLinha;
  }

  adicionarRodape();
  doc.save(nomeArquivo);
  mostrarToast("📄 PDF baixado!");
}


/* =========================================================
   2) GERAR WORD (.docx) a partir de texto formatado
========================================================= */
async function gerarWord(texto, nomeArquivo) {
  try {
    const { Document, Packer, Paragraph, TextRun, AlignmentType } = window.docx;

    const linhas = texto.split("\n");

    const paragrafos = linhas.map(linha => {
      // Título principal
      if (linha.startsWith("CONTRATO DE")) {
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
      if (linha.startsWith("CLÁUSULA") || linha.startsWith("PARTES:") ||
          linha.startsWith("TESTEMUNHAS:") || linha.startsWith("FIADOR")) {
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
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);

    mostrarToast("📝 Word baixado!");
  } catch (err) {
    console.error(err);
    mostrarToast("❌ Erro ao gerar Word. Tente o PDF.");
  }
}


/* =========================================================
   3) GERAR HASH (assinatura digital simples)
   Cria um identificador único do conteúdo do contrato
========================================================= */
async function gerarHashContrato(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 16).toUpperCase();
}


/* =========================================================
   4) IMPRIMIR DIRETO
========================================================= */
function imprimirContrato(textoContrato, hashAssinatura) {
  const janela = window.open("", "_blank");
  janela.document.write(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Contrato — Impressão</title>
      <style>
        @page { size: A4; margin: 2.5cm; }
        body {
          font-family: "Times New Roman", serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          white-space: pre-wrap;
        }
        .hash {
          margin-top: 2cm;
          padding-top: 0.5cm;
          border-top: 1px dashed #999;
          font-size: 9pt;
          color: #666;
          font-family: monospace;
        }
        @media print {
          .no-print { display: none; }
        }
        .no-print {
          position: fixed;
          top: 10px;
          right: 10px;
          background: #2563eb;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <button class="no-print" onclick="window.print()">🖨️ Imprimir</button>
      <div>${textoContrato.replace(/</g, "&lt;")}</div>
      ${hashAssinatura ? `<div class="hash">Código de verificação: ${hashAssinatura} · Gerado em ${new Date().toLocaleString("pt-BR")}</div>` : ""}
    </body>
    </html>
  `);
  janela.document.close();
}