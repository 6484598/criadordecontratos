/* =========================================================
   SERVICOS.JS — Lógica do contrato de prestação de serviços
========================================================= */

let passoAtualSV = 1;
let dadosContratoSV = {};
const TOTAL_PASSOS_SV = 5;


/* =========================================================
   1) NAVEGAÇÃO
========================================================= */
function proximoPassoSV(passo) {
  console.log("[proximoPassoSV] passo =", passo);

  if (!validarPasso(passo)) {
    console.log("[proximoPassoSV] validação falhou");
    return;
  }

  // Validações específicas
  if (passo === 4) {
    const tipoPrazo = document.querySelector('input[name="sv_tipo_prazo"]:checked').value;
    if (tipoPrazo === "determinado") {
      const inicio = document.getElementById("sv_data_inicio").value;
      const fim = document.getElementById("sv_data_fim").value;
      if (inicio && fim && new Date(fim) <= new Date(inicio)) {
        mostrarToast("⚠️ Data de término deve ser posterior à de início");
        return;
      }
    }
  }

  const passoEl = document.querySelector(`[data-passo="${passo}"]`);
  const proximoEl = document.querySelector(`[data-passo="${passo + 1}"]`);

  if (!passoEl || !proximoEl) return;

  passoEl.classList.remove("passo-ativo");
  proximoEl.classList.add("passo-ativo");
  passoAtualSV = passo + 1;
  atualizarProgressoSV();
  scrollParaElemento("#gerador");
}

function passoAnteriorSV(passo) {
  document.querySelector(`[data-passo="${passo}"]`).classList.remove("passo-ativo");
  document.querySelector(`[data-passo="${passo - 1}"]`).classList.add("passo-ativo");
  passoAtualSV = passo - 1;
  atualizarProgressoSV();
  scrollParaElemento("#gerador");
}

function atualizarProgressoSV() {
  const pct = (passoAtualSV / TOTAL_PASSOS_SV) * 100;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("passoAtual").textContent = passoAtualSV;
}


/* =========================================================
   2) ALTERNAR PF/PJ
========================================================= */
function alternarTipoPessoa(grupo) {
  const tipo = document.querySelector(`input[name="tipo_${grupo}"]:checked`).value;
  document.getElementById(`${grupo}_pf`).style.display = tipo === "pf" ? "block" : "none";
  document.getElementById(`${grupo}_pj`).style.display = tipo === "pj" ? "block" : "none";

  // Ativar/desativar required dinâmico
  document.querySelectorAll(`#${grupo}_pf [required], #${grupo}_pj [required]`).forEach(el => {
    el.dataset.requiredOriginal = "true";
  });
}


/* =========================================================
   3) ALTERNAR FORMA DE PAGAMENTO
========================================================= */
function alternarFormaPagamentoSV() {
  const forma = document.querySelector('input[name="sv_forma_pagamento"]:checked').value;
  document.getElementById("sv_campos_parcelado").style.display = forma === "parcelado" ? "block" : "none";
  document.getElementById("sv_campos_mensal").style.display = forma === "mensal" ? "block" : "none";
  document.getElementById("sv_campos_entrega").style.display = forma === "por_entrega" ? "block" : "none";
}


/* =========================================================
   4) ALTERNAR TIPO DE PRAZO
========================================================= */
function alternarPrazoSV() {
  const tipo = document.querySelector('input[name="sv_tipo_prazo"]:checked').value;
  document.getElementById("campos_prazo_determinado").style.display = tipo === "determinado" ? "grid" : "none";
  document.getElementById("campos_prazo_indeterminado").style.display = tipo === "indeterminado" ? "block" : "none";
}


/* =========================================================
   5) COLETAR DADOS
========================================================= */
function coletarDadosSV() {
  const tipoPrestador = document.querySelector('input[name="tipo_prestador"]:checked').value;
  const tipoContratante = document.querySelector('input[name="tipo_contratante"]:checked').value;
  const tipoPrazo = document.querySelector('input[name="sv_tipo_prazo"]:checked').value;
  const formaPgto = document.querySelector('input[name="sv_forma_pagamento"]:checked').value;

  // Prestador
  let prestador;
  if (tipoPrestador === "pf") {
    prestador = {
      tipo: "pf",
      nome: document.getElementById("prestador_pf_nome").value.trim(),
      cpf: document.getElementById("prestador_pf_cpf").value.trim(),
      rg: document.getElementById("prestador_pf_rg").value.trim() || "não informado",
      estadoCivil: document.getElementById("prestador_pf_estado_civil").value,
      profissao: document.getElementById("prestador_pf_profissao").value.trim(),
      endereco: document.getElementById("prestador_pf_endereco").value.trim()
    };
  } else {
    prestador = {
      tipo: "pj",
      razao: document.getElementById("prestador_pj_razao").value.trim(),
      cnpj: document.getElementById("prestador_pj_cnpj").value.trim(),
      ie: document.getElementById("prestador_pj_ie").value.trim(),
      endereco: document.getElementById("prestador_pj_endereco").value.trim(),
      repNome: document.getElementById("prestador_pj_rep_nome").value.trim(),
      repCpf: document.getElementById("prestador_pj_rep_cpf").value.trim(),
      repCargo: document.getElementById("prestador_pj_rep_cargo").value.trim() || "representante legal"
    };
  }

  // Contratante
  let contratante;
  if (tipoContratante === "pf") {
    contratante = {
      tipo: "pf",
      nome: document.getElementById("contratante_pf_nome").value.trim(),
      cpf: document.getElementById("contratante_pf_cpf").value.trim(),
      rg: document.getElementById("contratante_pf_rg").value.trim() || "não informado",
      estadoCivil: document.getElementById("contratante_pf_estado_civil").value,
      profissao: document.getElementById("contratante_pf_profissao").value.trim() || "não informada",
      endereco: document.getElementById("contratante_pf_endereco").value.trim()
    };
  } else {
    contratante = {
      tipo: "pj",
      razao: document.getElementById("contratante_pj_razao").value.trim(),
      cnpj: document.getElementById("contratante_pj_cnpj").value.trim(),
      ie: document.getElementById("contratante_pj_ie").value.trim(),
      endereco: document.getElementById("contratante_pj_endereco").value.trim(),
      repNome: document.getElementById("contratante_pj_rep_nome").value.trim(),
      repCpf: document.getElementById("contratante_pj_rep_cpf").value.trim(),
      repCargo: document.getElementById("contratante_pj_rep_cargo").value.trim() || "representante legal"
    };
  }

  // Pagamento
  const pagamento = { forma: formaPgto, valor: parseFloat(document.getElementById("sv_valor").value || 0) };
  if (formaPgto === "parcelado") {
    pagamento.entrada = parseFloat(document.getElementById("sv_entrada").value || 0);
    pagamento.numParcelas = parseInt(document.getElementById("sv_num_parcelas").value || 0);
  } else if (formaPgto === "mensal") {
    pagamento.diaVencimento = document.getElementById("sv_dia_vencimento").value;
    pagamento.reajuste = document.getElementById("sv_reajuste").value;
  } else if (formaPgto === "por_entrega") {
    pagamento.etapas = document.getElementById("sv_etapas_pgto").value.trim();
  }

  return {
    prestador,
    contratante,
    servico: {
      titulo: document.getElementById("sv_titulo").value.trim(),
      descricao: document.getElementById("sv_descricao").value.trim(),
      local: document.getElementById("sv_local").value,
      entregas: document.getElementById("sv_entregas").value.trim()
    },
    prazo: {
      tipo: tipoPrazo,
      inicio: tipoPrazo === "determinado"
        ? document.getElementById("sv_data_inicio").value
        : document.getElementById("sv_data_inicio_ind").value,
      fim: tipoPrazo === "determinado" ? document.getElementById("sv_data_fim").value : null,
      avisoPrevio: tipoPrazo === "indeterminado" ? document.getElementById("sv_aviso_previo").value : null
    },
    pagamento,
    meioPagamento: document.getElementById("sv_meio_pagamento").value,
    cidadeForo: document.getElementById("sv_cidade_foro").value.trim(),
    opcionais: {
      sigilo: document.getElementById("sv_sigilo").checked,
      pi: document.getElementById("sv_propriedade_intelectual").checked,
      piTitular: document.getElementById("sv_pi_titular").value,
      exclusividade: document.getElementById("sv_exclusividade").checked,
      naoConcorrencia: document.getElementById("sv_nao_concorrencia").checked,
      naoVinculo: document.getElementById("sv_nao_vinculo").checked,
      multaRescisoria: document.getElementById("sv_multa_rescisoria").checked,
      multaPercent: document.getElementById("sv_multa_percent").value,
      garantia: document.getElementById("sv_garantia").checked,
      garantiaDias: document.getElementById("sv_garantia_dias").value
    }
  };
}


/* =========================================================
   6) FORMATAR PARTE (PF ou PJ)
========================================================= */
function formatarParteSV(p) {
  if (p.tipo === "pf") {
    return `${p.nome}, ${p.estadoCivil}, ${p.profissao}, portador(a) do CPF nº ${p.cpf} e RG nº ${p.rg}, residente e domiciliado(a) à ${p.endereco}`;
  } else {
    return `${p.razao}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${p.cnpj}${p.ie ? ", IE/IM nº " + p.ie : ""}, com sede à ${p.endereco}, neste ato representada por seu(sua) ${p.repCargo}, ${p.repNome}, portador(a) do CPF nº ${p.repCpf}`;
  }
}


/* =========================================================
   7) GERAR TEXTO DO CONTRATO
========================================================= */
function gerarTextoContratoSV(d) {
  const valor = formatarMoeda(d.pagamento.valor);
  const valorExt = valorPorExtenso(d.pagamento.valor);

  let texto = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS


Por este instrumento particular, as partes abaixo qualificadas têm entre si, justo e contratado, o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições seguintes, com fundamento nos arts. 593 a 609 do Código Civil.


PARTES:

PRESTADOR(A) DE SERVIÇOS: ${formatarParteSV(d.prestador)}.

CONTRATANTE: ${formatarParteSV(d.contratante)}.


CLÁUSULA PRIMEIRA — DO OBJETO

O(A) PRESTADOR obriga-se a prestar ao CONTRATANTE os serviços de ${d.servico.titulo}, conforme descrição abaixo:

${d.servico.descricao}

Local de execução: ${d.servico.local === "remoto" ? "remoto, à distância" : d.servico.local === "contratante" ? "nas dependências do CONTRATANTE" : d.servico.local === "prestador" ? "nas dependências do PRESTADOR" : "híbrido (presencial e remoto)"}.`;

  if (d.servico.entregas) {
    texto += `\n\nEntregas previstas:\n${d.servico.entregas}`;
  }


  // === PRAZO ===
  texto += `\n\n\nCLÁUSULA SEGUNDA — DO PRAZO\n\n`;

  if (d.prazo.tipo === "determinado") {
    texto += `O presente contrato tem prazo determinado, com início em ${formatarData(d.prazo.inicio)} e término em ${formatarData(d.prazo.fim)}.

Parágrafo único: O contrato poderá ser prorrogado mediante termo aditivo escrito, firmado por ambas as partes.`;
  } else {
    texto += `O presente contrato tem prazo indeterminado, com início em ${formatarData(d.prazo.inicio)}, podendo ser rescindido por qualquer das partes mediante aviso prévio escrito de ${d.prazo.avisoPrevio} (${numeroPorExtenso(d.prazo.avisoPrevio)}) dias.`;
  }


  // === VALOR E PAGAMENTO ===
  texto += `\n\n\nCLÁUSULA TERCEIRA — DO VALOR E DA FORMA DE PAGAMENTO\n\n`;

  if (d.pagamento.forma === "a_vista") {
    texto += `Pelos serviços prestados, o CONTRATANTE pagará ao PRESTADOR o valor total de ${valor} (${valorExt}), à vista, mediante ${d.meioPagamento}.`;

  } else if (d.pagamento.forma === "parcelado") {
    const restante = d.pagamento.valor - d.pagamento.entrada;
    const valorParcela = restante / d.pagamento.numParcelas;
    texto += `Pelos serviços prestados, o CONTRATANTE pagará ao PRESTADOR o valor total de ${valor} (${valorExt}), da seguinte forma:

a) ENTRADA: ${formatarMoeda(d.pagamento.entrada)}, paga no ato da assinatura mediante ${d.meioPagamento};

b) SALDO: ${formatarMoeda(restante)}, dividido em ${d.pagamento.numParcelas} (${numeroPorExtenso(d.pagamento.numParcelas)}) parcelas iguais de ${formatarMoeda(valorParcela)}, com vencimentos mensais consecutivos.`;

  } else if (d.pagamento.forma === "mensal") {
    texto += `Pelos serviços prestados, o CONTRATANTE pagará ao PRESTADOR o valor mensal de ${valor} (${valorExt}), com vencimento todo dia ${d.pagamento.diaVencimento} de cada mês, mediante ${d.meioPagamento}.`;
    if (d.pagamento.reajuste) {
      texto += `\n\nParágrafo único: O valor será reajustado anualmente pelo ${d.pagamento.reajuste}, ou outro índice legal que vier a substituí-lo.`;
    }

  } else if (d.pagamento.forma === "por_entrega") {
    texto += `Pelos serviços prestados, o CONTRATANTE pagará ao PRESTADOR o valor total de ${valor} (${valorExt}), conforme cronograma de entregas a seguir:

${d.pagamento.etapas}

Os pagamentos serão efetuados mediante ${d.meioPagamento}, no prazo de até 5 (cinco) dias úteis após o aceite de cada etapa.`;
  }

  texto += `\n\nParágrafo: O atraso no pagamento implicará multa moratória de 2% (dois por cento), juros de 1% (um por cento) ao mês e correção monetária pelo IPCA.`;


  // === OBRIGAÇÕES ===
  texto += `\n\n\nCLÁUSULA QUARTA — DAS OBRIGAÇÕES DO PRESTADOR

São obrigações do PRESTADOR:
a) Executar os serviços com diligência, qualidade técnica e dentro dos prazos acordados;
b) Manter sigilo sobre todas as informações do CONTRATANTE a que tiver acesso;
c) Comunicar tempestivamente eventuais dificuldades, atrasos ou impedimentos;
d) Responder por danos causados por dolo ou culpa na execução dos serviços;
e) Arcar com os tributos incidentes sobre sua atividade (ISS, IR, contribuições previdenciárias quando aplicáveis).


CLÁUSULA QUINTA — DAS OBRIGAÇÕES DO CONTRATANTE

São obrigações do CONTRATANTE:
a) Pagar pontualmente os valores acordados;
b) Fornecer ao PRESTADOR todas as informações, materiais e acessos necessários à execução dos serviços;
c) Apresentar feedback tempestivo sobre as entregas;
d) Não exigir do PRESTADOR atividades estranhas ao escopo contratado.`;


  let numClausula = 6;
  const ordinais = ["", "PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "QUINTA", "SEXTA", "SÉTIMA", "OITAVA", "NONA", "DÉCIMA", "DÉCIMA PRIMEIRA", "DÉCIMA SEGUNDA", "DÉCIMA TERCEIRA", "DÉCIMA QUARTA", "DÉCIMA QUINTA"];


  // === SIGILO / NDA ===
  if (d.opcionais.sigilo) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DO SIGILO E CONFIDENCIALIDADE

As partes obrigam-se a manter absoluto sigilo sobre toda e qualquer informação confidencial a que tiverem acesso em razão deste contrato, incluindo dados técnicos, comerciais, financeiros, estratégicos, de clientes, fornecedores e operações.

§1º — A obrigação de sigilo permanecerá vigente durante todo o contrato e por 5 (cinco) anos após seu término, independentemente da causa de extinção.

§2º — A violação desta cláusula sujeita a parte infratora ao pagamento de perdas e danos, sem prejuízo de responsabilização civil e criminal.`;
    numClausula++;
  }


  // === PROPRIEDADE INTELECTUAL ===
  if (d.opcionais.pi) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA PROPRIEDADE INTELECTUAL\n\n`;

    if (d.opcionais.piTitular === "contratante") {
      texto += `Todos os direitos de propriedade intelectual sobre os trabalhos, criações, desenvolvimentos e resultados gerados em decorrência deste contrato serão CEDIDOS INTEGRAL, DEFINITIVA E IRRESTRITAMENTE ao CONTRATANTE, em caráter exclusivo e mundial, para todas as modalidades de utilização e exploração econômica, sem qualquer remuneração adicional além da já prevista neste contrato.`;
    } else if (d.opcionais.piTitular === "prestador") {
      texto += `Os direitos de propriedade intelectual sobre os trabalhos, criações e resultados gerados serão MANTIDOS COM O PRESTADOR, sendo concedida ao CONTRATANTE LICENÇA DE USO não exclusiva, sem direito a sublicenciamento, para os fins específicos previstos neste contrato.`;
    } else {
      texto += `Os direitos de propriedade intelectual sobre os trabalhos e resultados gerados serão COMPARTILHADOS entre as partes, podendo ambas utilizá-los para fins comerciais e não comerciais, vedado o sublicenciamento sem prévia autorização escrita da outra parte.`;
    }
    numClausula++;
  }


  // === EXCLUSIVIDADE ===
  if (d.opcionais.exclusividade) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA EXCLUSIVIDADE

Durante a vigência do presente contrato, o PRESTADOR obriga-se a não prestar serviços similares ou concorrentes a empresas, profissionais ou entidades que atuem no mesmo segmento de mercado do CONTRATANTE, sem prévia autorização escrita.

Parágrafo único: A violação desta cláusula importará em rescisão imediata do contrato, com pagamento de multa equivalente a 50% (cinquenta por cento) do valor total contratado, sem prejuízo de perdas e danos.`;
    numClausula++;
  }


  // === NÃO-CONCORRÊNCIA ===
  if (d.opcionais.naoConcorrencia) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA NÃO-CONCORRÊNCIA PÓS-CONTRATUAL

Após o término deste contrato, por qualquer motivo, o PRESTADOR obriga-se a não prestar serviços, direta ou indiretamente, a concorrentes do CONTRATANTE, no território do Estado, pelo prazo de 12 (doze) meses.

§1º — Em contrapartida à obrigação acima, o CONTRATANTE pagará ao PRESTADOR remuneração mensal equivalente a 50% (cinquenta por cento) do valor mensal médio recebido durante o contrato.

§2º — A violação desta cláusula importará em devolução integral dos valores recebidos a título de não-concorrência, acrescidos de multa de igual valor.`;
    numClausula++;
  }


  // === NÃO-VÍNCULO EMPREGATÍCIO ===
  if (d.opcionais.naoVinculo) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA INEXISTÊNCIA DE VÍNCULO EMPREGATÍCIO

As partes declaram expressamente que o presente contrato é de natureza estritamente CIVIL, regido pelos arts. 593 a 609 do Código Civil, NÃO HAVENDO entre elas qualquer vínculo empregatício, societário ou de subordinação.

§1º — O PRESTADOR atua com plena autonomia técnica, profissional e administrativa, podendo organizar livremente seu horário, métodos de trabalho e demais condições de execução, dentro do que for compatível com a entrega contratada.

§2º — O PRESTADOR é o único responsável por todos os encargos fiscais, previdenciários e trabalhistas relativos a si próprio e a eventuais auxiliares contratados.

§3º — Não há entre as partes pessoalidade obrigatória, podendo o PRESTADOR delegar parcial ou totalmente a execução dos serviços, salvo expressa estipulação em contrário, mantida sempre sua responsabilidade pelo resultado.`;
    numClausula++;
  }


  // === GARANTIA ===
  if (d.opcionais.garantia) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA GARANTIA

O PRESTADOR garante a qualidade dos serviços executados pelo prazo de ${d.opcionais.garantiaDias} (${numeroPorExtenso(d.opcionais.garantiaDias)}) dias após a entrega final, comprometendo-se a corrigir, sem custo adicional, eventuais defeitos ou inconsistências decorrentes da execução, desde que comunicados por escrito.

Parágrafo único: A garantia não cobre alterações de escopo, falhas decorrentes de uso indevido, modificações realizadas por terceiros ou solicitações de novas funcionalidades.`;
    numClausula++;
  }


  // === RESCISÃO ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA RESCISÃO

O presente contrato poderá ser rescindido nas seguintes hipóteses:
a) Por mútuo acordo entre as partes;
b) Por descumprimento de qualquer cláusula deste contrato, mediante notificação prévia de 10 (dez) dias para purgação da mora;
c) Por iniciativa de qualquer das partes${d.prazo.tipo === "indeterminado" ? `, mediante aviso prévio de ${d.prazo.avisoPrevio} dias` : ", com pagamento da multa abaixo prevista"};
d) Por força maior ou caso fortuito que torne impossível o cumprimento.`;

  if (d.opcionais.multaRescisoria) {
    texto += `\n\nParágrafo único: Em caso de rescisão imotivada por qualquer das partes, será devida multa equivalente a ${d.opcionais.multaPercent}% (${numeroPorExtenso(d.opcionais.multaPercent)} por cento) sobre o valor restante do contrato, ou, no caso de prazo indeterminado, sobre 3 (três) meses de remuneração.`;
  }
  numClausula++;


  // === DISPOSIÇÕES FINAIS ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DAS DISPOSIÇÕES FINAIS

§1º — Qualquer alteração deste contrato somente terá validade se feita por escrito e assinada por ambas as partes.

§2º — A tolerância de uma das partes quanto ao descumprimento de qualquer cláusula não constituirá novação ou renúncia ao direito de exigir seu cumprimento.

§3º — As partes elegem o foro da Comarca de ${d.cidadeForo} para dirimir quaisquer questões oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.


E por estarem assim justas e contratadas, as partes assinam o presente contrato em 2 (duas) vias de igual teor, na presença de 2 (duas) testemunhas.


${d.cidadeForo}, ${dataPorExtenso(d.prazo.inicio)}.


_______________________________________________
PRESTADOR(A) DE SERVIÇOS
${d.prestador.tipo === "pf" ? d.prestador.nome : d.prestador.razao}
${d.prestador.tipo === "pf" ? "CPF: " + d.prestador.cpf : "CNPJ: " + d.prestador.cnpj}


_______________________________________________
CONTRATANTE
${d.contratante.tipo === "pf" ? d.contratante.nome : d.contratante.razao}
${d.contratante.tipo === "pf" ? "CPF: " + d.contratante.cpf : "CNPJ: " + d.contratante.cnpj}


TESTEMUNHAS:


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
   8) GERAR / BAIXAR / IMPRIMIR
========================================================= */
async function gerarContratoSV() {
  if (!validarPasso(5)) return;

  dadosContratoSV = coletarDadosSV();
  const texto = gerarTextoContratoSV(dadosContratoSV);

  document.getElementById("contratoFormSV").style.display = "none";
  document.querySelector(".progress-bar").style.display = "none";
  document.querySelector(".progress-text").style.display = "none";
  const resultado = document.getElementById("resultado");
  resultado.style.display = "block";
  document.getElementById("previewContratoSV").textContent = texto;

  try {
    const hash = await gerarHashContrato(texto);
    document.getElementById("hashAssinaturaSV").innerHTML =
      `Código de verificação: <strong>${hash}</strong> · Gerado em ${new Date().toLocaleString("pt-BR")}`;
    dadosContratoSV._hash = hash;
  } catch (e) { console.warn(e); }

  setTimeout(() => resultado.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  mostrarToast("✅ Contrato gerado!");
}

function novoContratoSV() {
  if (!confirm("Tem certeza? Você perderá os dados preenchidos.")) return;
  limparDados("servicos");
  location.reload();
}

function limparTudoServicos() {
  if (!confirm("Apagar todos os dados salvos e recomeçar?")) return;
  limparDados("servicos");
  location.reload();
}

function baixarPDFSV() {
  const texto = gerarTextoContratoSV(dadosContratoSV);
  const nome = (dadosContratoSV.contratante.tipo === "pf"
    ? dadosContratoSV.contratante.nome
    : dadosContratoSV.contratante.razao).replace(/\s+/g, "_");
  gerarPDF(texto, `Contrato_Servicos_${nome}.pdf`);
}

function baixarWordSV() {
  const texto = gerarTextoContratoSV(dadosContratoSV);
  const nome = (dadosContratoSV.contratante.tipo === "pf"
    ? dadosContratoSV.contratante.nome
    : dadosContratoSV.contratante.razao).replace(/\s+/g, "_");
  gerarWord(texto, `Contrato_Servicos_${nome}.docx`);
}

function imprimirSV() {
  const texto = gerarTextoContratoSV(dadosContratoSV);
  imprimirContrato(texto, dadosContratoSV._hash);
}


/* =========================================================
   9) INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Máscaras
  ["prestador_pf_cpf", "contratante_pf_cpf", "prestador_pj_rep_cpf", "contratante_pj_rep_cpf"]
    .forEach(id => aplicarMascaraCPF(document.getElementById(id)));

  ["prestador_pf_rg", "contratante_pf_rg"]
    .forEach(id => aplicarMascaraRG(document.getElementById(id)));

  // Máscara de CNPJ (simples — usa a função CPF como base)
  ["prestador_pj_cnpj", "contratante_pj_cnpj"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g, "");
      if (v.length > 14) v = v.slice(0, 14);
      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
      e.target.value = v;
    });
  });

  // Datas padrão
  const hoje = new Date().toISOString().split("T")[0];
  ["sv_data_inicio", "sv_data_inicio_ind"].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = hoje;
  });

  // Listeners de tipo PF/PJ
  document.querySelectorAll('input[name="tipo_prestador"]').forEach(radio => {
    radio.addEventListener("change", () => alternarTipoPessoa("prestador"));
  });
  document.querySelectorAll('input[name="tipo_contratante"]').forEach(radio => {
    radio.addEventListener("change", () => alternarTipoPessoa("contratante"));
  });

  // Listeners de forma de pagamento
  document.querySelectorAll('input[name="sv_forma_pagamento"]').forEach(radio => {
    radio.addEventListener("change", alternarFormaPagamentoSV);
  });

  // Listeners de prazo
  document.querySelectorAll('input[name="sv_tipo_prazo"]').forEach(radio => {
    radio.addEventListener("change", alternarPrazoSV);
  });

  // Listeners de cláusulas opcionais com campos extras
  document.getElementById("sv_propriedade_intelectual").addEventListener("change", e => {
    document.getElementById("sv_campos_pi").style.display = e.target.checked ? "block" : "none";
  });
  document.getElementById("sv_multa_rescisoria").addEventListener("change", e => {
    document.getElementById("sv_campos_multa").style.display = e.target.checked ? "block" : "none";
  });
  document.getElementById("sv_garantia").addEventListener("change", e => {
    document.getElementById("sv_campos_garantia").style.display = e.target.checked ? "block" : "none";
  });

  // Auto-salvar
  ativarAutoSalvar("contratoFormSV", "servicos");

  // Indicador
  const indicator = document.createElement("div");
  indicator.className = "save-indicator";
  indicator.textContent = "Salvando automaticamente";
  document.body.appendChild(indicator);
});