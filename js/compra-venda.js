/* =========================================================
   COMPRA-VENDA.JS — Lógica do contrato de compra e venda
========================================================= */

let passoAtualCV = 1;
let dadosContratoCV = {};
let totalVendedores = 1;
let totalCompradores = 1;
const TOTAL_PASSOS_CV = 5;


/* =========================================================
   1) NAVEGAÇÃO
========================================================= */
function proximoPassoCV(passo) {
  if (!validarPasso(passo)) return;

  const passoEl = document.querySelector(`[data-passo="${passo}"]`);
  passoEl.classList.remove("passo-ativo");

  const proximoEl = document.querySelector(`[data-passo="${passo + 1}"]`);
  if (proximoEl) {
    proximoEl.classList.add("passo-ativo");
    passoAtualCV = passo + 1;
    atualizarProgressoCV();
    scrollParaElemento("#gerador");
  }
}

function passoAnteriorCV(passo) {
  document.querySelector(`[data-passo="${passo}"]`).classList.remove("passo-ativo");
  document.querySelector(`[data-passo="${passo - 1}"]`).classList.add("passo-ativo");
  passoAtualCV = passo - 1;
  atualizarProgressoCV();
  scrollParaElemento("#gerador");
}

function atualizarProgressoCV() {
  const pct = (passoAtualCV / TOTAL_PASSOS_CV) * 100;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("passoAtual").textContent = passoAtualCV;
}


/* =========================================================
   2) ADICIONAR/REMOVER VENDEDOR OU COMPRADOR
========================================================= */
function adicionarPessoaCV(tipo) {
  const container = document.getElementById(tipo + "esContainer");
  const total = tipo === "vendedor" ? ++totalVendedores : ++totalCompradores;

  const bloco = document.createElement("div");
  bloco.className = "pessoa-bloco";
  bloco.dataset.pessoa = `${tipo}-${total}`;
  bloco.innerHTML = `
    <h4>
      ${tipo === "vendedor" ? "Vendedor" : "Comprador"} ${total}
      <button type="button" class="btn-remover" onclick="removerPessoaCV('${tipo}', ${total})">✕ Remover</button>
    </h4>

    <div class="campo">
      <label>Nome completo *</label>
      <input type="text" id="${tipo}_${total}_nome" required>
    </div>

    <div class="grid-2">
      <div class="campo">
        <label>CPF *</label>
        <input type="text" id="${tipo}_${total}_cpf" placeholder="000.000.000-00" required data-validar="cpf">
      </div>
      <div class="campo">
        <label>RG</label>
        <input type="text" id="${tipo}_${total}_rg">
      </div>
    </div>

    <div class="grid-2">
      <div class="campo">
        <label>Estado civil</label>
        <select id="${tipo}_${total}_estado_civil">
          <option value="solteiro(a)">Solteiro(a)</option>
          <option value="casado(a)">Casado(a)</option>
          <option value="divorciado(a)">Divorciado(a)</option>
          <option value="viúvo(a)">Viúvo(a)</option>
          <option value="união estável">União estável</option>
        </select>
      </div>
      <div class="campo">
        <label>Profissão</label>
        <input type="text" id="${tipo}_${total}_profissao">
      </div>
    </div>

    <div class="campo">
      <label>Endereço completo *</label>
      <input type="text" id="${tipo}_${total}_endereco" required>
    </div>
  `;

  container.appendChild(bloco);
  aplicarMascaraCPF(document.getElementById(`${tipo}_${total}_cpf`));
  aplicarMascaraRG(document.getElementById(`${tipo}_${total}_rg`));
}

function removerPessoaCV(tipo, num) {
  const bloco = document.querySelector(`[data-pessoa="${tipo}-${num}"]`);
  if (bloco) bloco.remove();
}


/* =========================================================
   3) COLETAR DADOS
========================================================= */
function coletarDadosCV() {
  const vendedores = [];
  document.querySelectorAll('[data-pessoa^="vendedor-"]').forEach(bloco => {
    const id = bloco.dataset.pessoa.split("-")[1];
    vendedores.push({
      nome: document.getElementById(`vendedor_${id}_nome`).value.trim(),
      cpf: document.getElementById(`vendedor_${id}_cpf`).value.trim(),
      rg: document.getElementById(`vendedor_${id}_rg`).value.trim() || "não informado",
      estadoCivil: document.getElementById(`vendedor_${id}_estado_civil`).value,
      profissao: document.getElementById(`vendedor_${id}_profissao`).value.trim() || "não informada",
      endereco: document.getElementById(`vendedor_${id}_endereco`).value.trim()
    });
  });

  const compradores = [];
  document.querySelectorAll('[data-pessoa^="comprador-"]').forEach(bloco => {
    const id = bloco.dataset.pessoa.split("-")[1];
    compradores.push({
      nome: document.getElementById(`comprador_${id}_nome`).value.trim(),
      cpf: document.getElementById(`comprador_${id}_cpf`).value.trim(),
      rg: document.getElementById(`comprador_${id}_rg`).value.trim() || "não informado",
      estadoCivil: document.getElementById(`comprador_${id}_estado_civil`).value,
      profissao: document.getElementById(`comprador_${id}_profissao`).value.trim() || "não informada",
      endereco: document.getElementById(`comprador_${id}_endereco`).value.trim()
    });
  });

  const formaPagamento = document.querySelector('input[name="forma_pagamento_cv"]:checked').value;
  const pagamento = { forma: formaPagamento };

  if (formaPagamento === "parcelado") {
    pagamento.entrada = parseFloat(document.getElementById("valor_entrada").value || 0);
    pagamento.numParcelas = parseInt(document.getElementById("num_parcelas").value || 0);
    pagamento.valorParcela = parseFloat(document.getElementById("valor_parcela").value || 0);
    pagamento.diaVencimento = document.getElementById("dia_vencimento_cv").value;
    pagamento.indiceCorrecao = document.getElementById("indice_correcao_cv").value;
  } else if (formaPagamento === "financiamento") {
    pagamento.sinal = parseFloat(document.getElementById("valor_sinal_fin").value || 0);
    pagamento.banco = document.getElementById("banco_fin").value.trim();
    pagamento.prazoFin = document.getElementById("prazo_fin").value;
  }

  // Corretagem
  let corretagem = null;
  if (document.getElementById("cv_corretagem").checked) {
    corretagem = {
      nome: document.getElementById("cv_corretor_nome").value.trim(),
      valor: document.getElementById("cv_corretor_valor").value.trim(),
      pagador: document.getElementById("cv_corretor_pagador").value
    };
  }

  return {
    tipoContrato: document.querySelector('input[name="tipo_contrato_cv"]:checked').value,
    vendedores,
    compradores,
    imovel: {
      endereco: document.getElementById("imovel_cv_endereco").value.trim(),
      tipo: document.getElementById("imovel_cv_tipo").value,
      area: document.getElementById("imovel_cv_area").value,
      matricula: document.getElementById("imovel_cv_matricula").value.trim(),
      descricao: document.getElementById("imovel_cv_descricao").value.trim(),
      iptu: document.getElementById("imovel_cv_iptu").value.trim()
    },
    valorTotal: parseFloat(document.getElementById("valor_total_cv").value || 0),
    pagamento,
    meioPagamento: document.getElementById("meio_pagamento_cv").value,
    dataEntrega: document.getElementById("data_entrega_cv").value,
    cidadeForo: document.getElementById("cidade_foro_cv").value.trim(),
    opcionais: {
      arrependimento: document.getElementById("cv_arrependimento").checked,
      imissaoPosse: document.getElementById("cv_imissao_posse").checked,
      evicao: document.getElementById("cv_evicao").checked
    },
    corretagem
  };
}


/* =========================================================
   4) FORMATADORES AUXILIARES
========================================================= */
function formatarPessoasCV(pessoas) {
  return pessoas.map(p =>
    `${p.nome}, ${p.estadoCivil}, ${p.profissao}, portador(a) do CPF nº ${p.cpf} e RG nº ${p.rg}, ` +
    `residente e domiciliado(a) à ${p.endereco}`
  ).join(";\n\n") + ".";
}


/* =========================================================
   5) GERAR TEXTO DO CONTRATO
========================================================= */
function gerarTextoContratoCV(d) {
  const valorFormatado = formatarMoeda(d.valorTotal);
  const valorExtenso = valorPorExtenso(d.valorTotal);

  const tituloContrato = d.tipoContrato === "promessa"
    ? "INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA DE IMÓVEL"
    : "CONTRATO DE COMPRA E VENDA DE IMÓVEL";

  const verboObrigacao = d.tipoContrato === "promessa"
    ? "prometem, respectivamente, vender e comprar"
    : "vendem e compram";

  const vendedorLabel = d.vendedores.length > 1 ? "VENDEDORES" : "VENDEDOR(A)";
  const compradorLabel = d.compradores.length > 1 ? "COMPRADORES" : "COMPRADOR(A)";

  let texto = `${tituloContrato}


Por este instrumento particular, as partes abaixo qualificadas têm entre si, justo e contratado, o presente ${d.tipoContrato === "promessa" ? "instrumento particular de promessa" : "contrato"} de compra e venda de imóvel, que se regerá pelas cláusulas e condições seguintes, com fundamento nos arts. 481 a 504 e ${d.tipoContrato === "promessa" ? "arts. 462 a 466 e 1.417 a 1.418" : "art. 1.245"} do Código Civil.


PARTES:

${vendedorLabel}: ${formatarPessoasCV(d.vendedores)}

${compradorLabel}: ${formatarPessoasCV(d.compradores)}


CLÁUSULA PRIMEIRA — DO OBJETO

O(s) VENDEDOR(ES) ${verboObrigacao} ao(s) COMPRADOR(ES) o imóvel a seguir descrito, de sua legítima propriedade, livre e desembaraçado de quaisquer ônus, dívidas, hipotecas ou ações judiciais:

Endereço: ${d.imovel.endereco}
Tipo: ${d.imovel.tipo}${d.imovel.area ? `\nÁrea total: ${d.imovel.area} m²` : ""}
Matrícula: ${d.imovel.matricula}${d.imovel.iptu ? `\nInscrição IPTU: ${d.imovel.iptu}` : ""}${d.imovel.descricao ? `\n\nDescrição: ${d.imovel.descricao}` : ""}


CLÁUSULA SEGUNDA — DO PREÇO

O preço total ajustado para a presente ${d.tipoContrato === "promessa" ? "promessa de compra e venda" : "compra e venda"} é de ${valorFormatado} (${valorExtenso}).
`;

  // === FORMA DE PAGAMENTO ===
  texto += `\n\nCLÁUSULA TERCEIRA — DA FORMA DE PAGAMENTO\n\n`;

  if (d.pagamento.forma === "a_vista") {
    texto += `O preço será pago integralmente, à vista, no ato da assinatura deste instrumento, mediante ${d.meioPagamento}, dando o(s) VENDEDOR(ES) plena, geral, rasa e irrevogável quitação, para nada mais reclamar a qualquer título.`;

  } else if (d.pagamento.forma === "parcelado") {
    const valorEntrada = formatarMoeda(d.pagamento.entrada);
    const valorParcela = formatarMoeda(d.pagamento.valorParcela);
    const valorRestante = d.valorTotal - d.pagamento.entrada;

    texto += `O preço será pago da seguinte forma:

a) ENTRADA: ${valorEntrada} (${valorPorExtenso(d.pagamento.entrada)}), pagos no ato da assinatura, mediante ${d.meioPagamento}, dando o(s) VENDEDOR(ES) recibo e quitação parcial;

b) SALDO: ${formatarMoeda(valorRestante)} (${valorPorExtenso(valorRestante)}), divididos em ${d.pagamento.numParcelas} (${numeroPorExtenso(d.pagamento.numParcelas)}) parcelas mensais e consecutivas de ${valorParcela} cada, com vencimento todo dia ${d.pagamento.diaVencimento} de cada mês, a primeira vencendo no mês subsequente à assinatura.`;

    if (d.pagamento.indiceCorrecao) {
      texto += `\n\n§1º — As parcelas serão atualizadas monetariamente pelo ${d.pagamento.indiceCorrecao}, com periodicidade anual.`;
    }

    texto += `\n\n§${d.pagamento.indiceCorrecao ? "2" : "1"}º — O atraso no pagamento de qualquer parcela implicará multa moratória de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês e correção monetária pelo IPCA, sem prejuízo da possibilidade de rescisão contratual após 3 (três) parcelas em atraso.`;

  } else if (d.pagamento.forma === "financiamento") {
    const valorSinal = formatarMoeda(d.pagamento.sinal);
    const valorRestante = d.valorTotal - d.pagamento.sinal;

    texto += `O preço será pago da seguinte forma:

a) SINAL E PRINCÍPIO DE PAGAMENTO: ${valorSinal} (${valorPorExtenso(d.pagamento.sinal)}), pagos no ato da assinatura mediante ${d.meioPagamento};

b) SALDO: ${formatarMoeda(valorRestante)} (${valorPorExtenso(valorRestante)}), a ser pago diretamente pela instituição financeira ${d.pagamento.banco || "____________"} ao(s) VENDEDOR(ES), por meio de financiamento imobiliário a ser contratado pelo(s) COMPRADOR(ES).

§1º — O(s) COMPRADOR(ES) compromete(m)-se a apresentar a documentação exigida pelo banco no prazo de 15 (quinze) dias e a diligenciar pela aprovação do financiamento no prazo máximo de ${d.pagamento.prazoFin} (${numeroPorExtenso(d.pagamento.prazoFin)}) dias contados da assinatura.

§2º — Não sendo aprovado o financiamento dentro do prazo previsto, o presente contrato poderá ser rescindido por qualquer das partes, com devolução integral e corrigida do sinal pago.`;
  }


  // === CLÁUSULAS PRINCIPAIS ===
  texto += `\n\n\nCLÁUSULA QUARTA — DA POSSE E DA ENTREGA DAS CHAVES\n\n`;

  if (d.opcionais.imissaoPosse) {
    texto += `O(s) COMPRADOR(ES) será(ão) imitido(s) na posse mansa e pacífica do imóvel no ato da assinatura deste instrumento, recebendo as chaves e assumindo, a partir desta data, todas as despesas e tributos relativos ao imóvel.`;
  } else {
    texto += `O(s) VENDEDOR(ES) entregará(ão) as chaves e a posse mansa e pacífica do imóvel ao(s) COMPRADOR(ES) na data de ${formatarData(d.dataEntrega)}, mediante quitação ${d.pagamento.forma === "a_vista" ? "integral" : "do pactuado nesta data"}, devendo o imóvel estar livre e desocupado, sem dívidas pendentes de qualquer natureza.`;
  }


  // === IMPOSTOS E DESPESAS ===
  texto += `\n\n\nCLÁUSULA QUINTA — DOS IMPOSTOS, TAXAS E DESPESAS

§1º — Até a data da entrega das chaves, todos os impostos, taxas, condomínio e demais despesas relativas ao imóvel ficam a cargo do(s) VENDEDOR(ES). A partir desta data, ficam a cargo do(s) COMPRADOR(ES).

§2º — Correm por conta do(s) COMPRADOR(ES) o ITBI (Imposto sobre Transmissão de Bens Imóveis), as despesas de escritura pública, registro no Cartório de Registro de Imóveis e demais emolumentos relativos à transferência da propriedade.`;


  // === RESPONSABILIDADES DO VENDEDOR ===
  texto += `\n\n\nCLÁUSULA SEXTA — DAS DECLARAÇÕES E RESPONSABILIDADES DO(S) VENDEDOR(ES)

O(s) VENDEDOR(ES) declara(m), sob as penas da lei, que:
a) É(são) legítimo(s) proprietário(s) do imóvel objeto deste contrato;
b) O imóvel encontra-se livre e desembaraçado de quaisquer ônus, dívidas, hipotecas, alienações, penhoras ou ações reais ou pessoais reipersecutórias;
c) Está(ão) em dia com todas as obrigações fiscais, condominiais e demais encargos relativos ao imóvel até a data da entrega;
d) Não há ações judiciais em seu nome capazes de comprometer este negócio;
e) Compromete(m)-se a entregar todas as certidões necessárias à lavratura da escritura pública${d.tipoContrato === "promessa" ? " e ao registro" : ""}.`;


  // === EVICÇÃO ===
  if (d.opcionais.evicao) {
    texto += `\n\n\nCLÁUSULA SÉTIMA — DA EVICÇÃO

O(s) VENDEDOR(ES) responde(m) integralmente pela evicção de direito, na forma dos arts. 447 a 457 do Código Civil, comprometendo-se a indenizar o(s) COMPRADOR(ES) por todos os prejuízos sofridos, incluindo o valor do imóvel atualizado, frutos restituídos, despesas com o contrato, custas processuais e honorários advocatícios, caso venha(m) a perder o imóvel por sentença judicial em razão de direito anterior à venda.`;
  }


  // === PROMESSA — TRANSFERÊNCIA DEFINITIVA ===
  if (d.tipoContrato === "promessa") {
    const numClausula = d.opcionais.evicao ? "OITAVA" : "SÉTIMA";
    texto += `\n\n\nCLÁUSULA ${numClausula} — DA ESCRITURA PÚBLICA E REGISTRO

Quitado integralmente o preço, o(s) VENDEDOR(ES) obriga(m)-se a outorgar ao(s) COMPRADOR(ES), no prazo máximo de 30 (trinta) dias, a competente ESCRITURA PÚBLICA DEFINITIVA DE COMPRA E VENDA, comparecendo ao Cartório de Notas indicado pelo(s) COMPRADOR(ES) e fornecendo toda a documentação exigida.

Parágrafo único: Para garantia do(s) COMPRADOR(ES) e nos termos do art. 1.417 do Código Civil, este instrumento poderá ser registrado no Cartório de Registro de Imóveis competente, conferindo direito real à aquisição do imóvel.`;
  }


  // === ARREPENDIMENTO ===
  if (d.opcionais.arrependimento) {
    const numClausula = d.tipoContrato === "promessa" ? (d.opcionais.evicao ? "NONA" : "OITAVA") : (d.opcionais.evicao ? "OITAVA" : "SÉTIMA");
    texto += `\n\n\nCLÁUSULA ${numClausula} — DO ARREPENDIMENTO

Fica facultado às partes o direito de arrependimento, na forma do art. 420 do Código Civil:

a) Caso o(s) COMPRADOR(ES) desista(m) do negócio, perderá(ão) integralmente o valor pago a título de sinal/entrada;

b) Caso o(s) VENDEDOR(ES) desista(m) do negócio, devolverá(ão) o valor recebido em DOBRO, devidamente corrigido pelo IPCA, sem prejuízo de eventuais perdas e danos.`;
  }


  // === CORRETAGEM ===
  if (d.corretagem) {
    texto += `\n\n\nCLÁUSULA — DA CORRETAGEM

A intermediação do presente negócio foi realizada por ${d.corretagem.nome || "________________"}, fazendo jus à comissão de corretagem no valor de ${d.corretagem.valor || "__________"}, a ser paga pelo(s) ${d.corretagem.pagador === "ambos" ? "VENDEDOR(ES) e COMPRADOR(ES) na proporção de 50% (cinquenta por cento) cada" : d.corretagem.pagador.toUpperCase() + "(ES)"}.`;
  }


  // === RESCISÃO ===
  texto += `\n\n\nCLÁUSULA — DA RESCISÃO

O presente contrato poderá ser rescindido nas seguintes hipóteses:
a) Por mútuo acordo entre as partes;
b) Por descumprimento de qualquer cláusula deste contrato, mediante notificação prévia de 15 (quinze) dias para purgação da mora;
c) Pelo não pagamento do preço ou de suas parcelas nas datas avençadas.

Parágrafo único: Em caso de rescisão por culpa de uma das partes, a parte culpada pagará multa equivalente a 10% (dez por cento) do valor total do contrato, sem prejuízo de perdas e danos.`;


  // === DISPOSIÇÕES FINAIS ===
  texto += `\n\n\nCLÁUSULA — DAS DISPOSIÇÕES FINAIS

§1º — Qualquer alteração deste contrato somente terá validade se feita por escrito e assinada por ambas as partes.

§2º — O presente contrato é celebrado em caráter ${d.tipoContrato === "promessa" ? "irretratável e irrevogável, salvo a hipótese de arrependimento prevista neste instrumento (quando aplicável)" : "definitivo, transferindo-se a propriedade nos termos da lei"}, e obriga as partes, seus herdeiros e sucessores, a qualquer título.

§3º — As partes elegem o foro da Comarca de ${d.cidadeForo} para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.


E por estarem assim justas e contratadas, as partes assinam o presente contrato em ${d.vendedores.length + d.compradores.length} vias de igual teor, na presença de 2 (duas) testemunhas.


${d.cidadeForo}, ${dataPorExtenso(d.dataEntrega)}.


`;

  // === ASSINATURAS ===
  d.vendedores.forEach((p, i) => {
    texto += `\n_______________________________________________\n${vendedorLabel}${d.vendedores.length > 1 ? " " + (i + 1) : ""}\n${p.nome}\nCPF: ${p.cpf}\n\n`;
  });

  d.compradores.forEach((p, i) => {
    texto += `\n_______________________________________________\n${compradorLabel}${d.compradores.length > 1 ? " " + (i + 1) : ""}\n${p.nome}\nCPF: ${p.cpf}\n\n`;
  });

  texto += `\nTESTEMUNHAS:


1. ____________________________________________
   Nome:
   CPF:


2. ____________________________________________
   Nome:
   CPF:
`;

  return texto;
}


/* =========================================================
   6) GERAR CONTRATO
========================================================= */
async function gerarContratoCV() {
  if (!validarPasso(5)) return;

  if (document.querySelectorAll('[data-pessoa^="vendedor-"]').length === 0) {
    mostrarToast("⚠️ Adicione ao menos um vendedor");
    return;
  }
  if (document.querySelectorAll('[data-pessoa^="comprador-"]').length === 0) {
    mostrarToast("⚠️ Adicione ao menos um comprador");
    return;
  }

  dadosContratoCV = coletarDadosCV();
  const texto = gerarTextoContratoCV(dadosContratoCV);

  document.getElementById("contratoFormCV").style.display = "none";
  document.querySelector(".progress-bar").style.display = "none";
  document.querySelector(".progress-text").style.display = "none";
  const resultado = document.getElementById("resultado");
  resultado.style.display = "block";
  document.getElementById("previewContratoCV").textContent = texto;

  try {
    const hash = await gerarHashContrato(texto);
    document.getElementById("hashAssinaturaCV").innerHTML =
      `Código de verificação: <strong>${hash}</strong> · Gerado em ${new Date().toLocaleString("pt-BR")}`;
    dadosContratoCV._hash = hash;
  } catch (e) {
    console.warn("Hash não pôde ser gerado:", e);
  }

  setTimeout(() => {
    resultado.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);

  mostrarToast("✅ Contrato gerado!");
}

function novoContratoCV() {
  if (!confirm("Tem certeza? Você perderá os dados preenchidos.")) return;
  limparDados("compra-venda");
  location.reload();
}

function limparTudoCompraVenda() {
  if (!confirm("Apagar todos os dados salvos e recomeçar?")) return;
  limparDados("compra-venda");
  location.reload();
}


/* =========================================================
   7) BAIXAR / IMPRIMIR
========================================================= */
function baixarPDFCV() {
  const texto = gerarTextoContratoCV(dadosContratoCV);
  const nomeComprador = dadosContratoCV.compradores[0].nome.replace(/\s+/g, "_");
  const tipoArquivo = dadosContratoCV.tipoContrato === "promessa" ? "Promessa" : "Compra_Venda";
  gerarPDF(texto, `${tipoArquivo}_${nomeComprador}.pdf`);
}

function baixarWordCV() {
  const texto = gerarTextoContratoCV(dadosContratoCV);
  const nomeComprador = dadosContratoCV.compradores[0].nome.replace(/\s+/g, "_");
  const tipoArquivo = dadosContratoCV.tipoContrato === "promessa" ? "Promessa" : "Compra_Venda";
  gerarWord(texto, `${tipoArquivo}_${nomeComprador}.docx`);
}

function imprimirCV() {
  const texto = gerarTextoContratoCV(dadosContratoCV);
  imprimirContrato(texto, dadosContratoCV._hash);
}


/* =========================================================
   8) CAMPOS DINÂMICOS
========================================================= */
function alternarCamposPagamentoCV() {
  const tipo = document.querySelector('input[name="forma_pagamento_cv"]:checked').value;
  document.getElementById("campos_parcelado").style.display = tipo === "parcelado" ? "block" : "none";
  document.getElementById("campos_financiamento").style.display = tipo === "financiamento" ? "block" : "none";
}


/* =========================================================
   9) INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Máscaras
  aplicarMascaraCPF(document.getElementById("vendedor_1_cpf"));
  aplicarMascaraCPF(document.getElementById("comprador_1_cpf"));
  aplicarMascaraRG(document.getElementById("vendedor_1_rg"));
  aplicarMascaraRG(document.getElementById("comprador_1_rg"));

  // Data padrão = 30 dias à frente
  const dataInput = document.getElementById("data_entrega_cv");
  if (!dataInput.value) {
    const futuro = new Date();
    futuro.setDate(futuro.getDate() + 30);
    dataInput.value = futuro.toISOString().split("T")[0];
  }

  // Listeners da forma de pagamento
  document.querySelectorAll('input[name="forma_pagamento_cv"]').forEach(radio => {
    radio.addEventListener("change", alternarCamposPagamentoCV);
  });

  // Listener da corretagem
  document.getElementById("cv_corretagem").addEventListener("change", e => {
    document.getElementById("campos_corretagem").style.display = e.target.checked ? "block" : "none";
  });

  // Auto-salvar
  ativarAutoSalvar("contratoFormCV", "compra-venda");

  // Indicador de salvamento
  const indicator = document.createElement("div");
  indicator.className = "save-indicator";
  indicator.textContent = "Salvando automaticamente";
  document.body.appendChild(indicator);
});