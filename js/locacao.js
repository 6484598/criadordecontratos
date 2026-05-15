/* =========================================================
   LOCACAO.JS — Lógica do contrato de locação
========================================================= */

let passoAtualLocacao = 1;
let dadosContratoLocacao = {};
let totalLocadores = 1;
let totalLocatarios = 1;
const TOTAL_PASSOS_LOCACAO = 6;


/* =========================================================
   1) NAVEGAÇÃO ENTRE PASSOS
========================================================= */
function proximoPassoLocacao(passo) {
  console.log("[proximoPassoLocacao] chamado com passo =", passo);

  if (!validarPasso(passo)) {
    console.log("[proximoPassoLocacao] validarPasso retornou false");
    return;
  }

  // Validações específicas por passo
  if (passo === 5) {
    const tipoGarantia = document.querySelector('input[name="tipo_garantia"]:checked').value;
    if (tipoGarantia === "fiador") {
      const fiadorNome = document.getElementById("fiador_nome").value.trim();
      const fiadorCPF = document.getElementById("fiador_cpf").value.trim();
      if (!fiadorNome) {
        mostrarToast("⚠️ Informe o nome do fiador");
        document.getElementById("fiador_nome").focus();
        return;
      }
      if (!validarCPF(fiadorCPF)) {
        mostrarToast("❌ CPF do fiador inválido");
        document.getElementById("fiador_cpf").focus();
        return;
      }
    }
    if (tipoGarantia === "caucao") {
      const valorCaucao = parseFloat(document.getElementById("caucao_valor").value);
      const valorAluguel = parseFloat(document.getElementById("valor_aluguel").value);
      if (!valorCaucao) {
        mostrarToast("⚠️ Informe o valor da caução");
        return;
      }
      if (valorCaucao > valorAluguel * 3) {
        mostrarToast("⚠️ Caução não pode exceder 3 aluguéis (art. 38, §2º)");
        return;
      }
    }
  }

  const passoEl = document.querySelector(`[data-passo="${passo}"]`);
  const proximoEl = document.querySelector(`[data-passo="${passo + 1}"]`);

  console.log("[proximoPassoLocacao] passoEl =", passoEl, "proximoEl =", proximoEl);

  if (!passoEl || !proximoEl) {
    console.error("[proximoPassoLocacao] Elemento não encontrado");
    return;
  }

  passoEl.classList.remove("passo-ativo");
  proximoEl.classList.add("passo-ativo");
  passoAtualLocacao = passo + 1;
  atualizarProgressoLocacao();
  scrollParaElemento("#gerador");
}

function passoAnteriorLocacao(passo) {
  document.querySelector(`[data-passo="${passo}"]`).classList.remove("passo-ativo");
  document.querySelector(`[data-passo="${passo - 1}"]`).classList.add("passo-ativo");
  passoAtualLocacao = passo - 1;
  atualizarProgressoLocacao();
  scrollParaElemento("#gerador");
}

function atualizarProgressoLocacao() {
  const pct = (passoAtualLocacao / TOTAL_PASSOS_LOCACAO) * 100;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("passoAtual").textContent = passoAtualLocacao;
}


/* =========================================================
   2) ADICIONAR/REMOVER LOCADOR OU LOCATÁRIO
========================================================= */
function adicionarPessoa(tipo) {
  // Mapeamento dos containers (plural em português é irregular: locador → locadores)
  const idsContainer = {
    locador: "locadoresContainer",
    locatario: "locatariosContainer"
  };
  const container = document.getElementById(idsContainer[tipo]);
  const total = tipo === "locador" ? ++totalLocadores : ++totalLocatarios;

  const bloco = document.createElement("div");
  bloco.className = "pessoa-bloco";
  bloco.dataset.pessoa = `${tipo}-${total}`;
  bloco.innerHTML = `
    <h4>
      ${tipo === "locador" ? "Locador" : "Locatário"} ${total}
      <button type="button" class="btn-remover" onclick="removerPessoa('${tipo}', ${total})">✕ Remover</button>
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

  // Aplicar máscaras nos novos campos
  aplicarMascaraCPF(document.getElementById(`${tipo}_${total}_cpf`));
  aplicarMascaraRG(document.getElementById(`${tipo}_${total}_rg`));
}

function removerPessoa(tipo, num) {
  const bloco = document.querySelector(`[data-pessoa="${tipo}-${num}"]`);
  if (bloco) bloco.remove();
}


/* =========================================================
   3) COLETAR DADOS DO FORMULÁRIO
========================================================= */
function coletarDadosLocacao() {
  // Locadores
  const locadores = [];
  document.querySelectorAll('[data-pessoa^="locador-"]').forEach(bloco => {
    const id = bloco.dataset.pessoa.split("-")[1];
    locadores.push({
      nome: document.getElementById(`locador_${id}_nome`).value.trim(),
      cpf: document.getElementById(`locador_${id}_cpf`).value.trim(),
      rg: document.getElementById(`locador_${id}_rg`).value.trim() || "não informado",
      estadoCivil: document.getElementById(`locador_${id}_estado_civil`).value,
      profissao: document.getElementById(`locador_${id}_profissao`).value.trim() || "não informada",
      endereco: document.getElementById(`locador_${id}_endereco`).value.trim()
    });
  });

  // Locatários
  const locatarios = [];
  document.querySelectorAll('[data-pessoa^="locatario-"]').forEach(bloco => {
    const id = bloco.dataset.pessoa.split("-")[1];
    locatarios.push({
      nome: document.getElementById(`locatario_${id}_nome`).value.trim(),
      cpf: document.getElementById(`locatario_${id}_cpf`).value.trim(),
      rg: document.getElementById(`locatario_${id}_rg`).value.trim() || "não informado",
      estadoCivil: document.getElementById(`locatario_${id}_estado_civil`).value,
      profissao: document.getElementById(`locatario_${id}_profissao`).value.trim() || "não informada",
      endereco: document.getElementById(`locatario_${id}_endereco`).value.trim()
    });
  });

  // Garantia
  const tipoGarantia = document.querySelector('input[name="tipo_garantia"]:checked').value;
  const garantia = { tipo: tipoGarantia };

  if (tipoGarantia === "caucao") {
    garantia.valor = parseFloat(document.getElementById("caucao_valor").value || 0);
    garantia.forma = document.getElementById("caucao_forma").value;
  } else if (tipoGarantia === "fiador") {
    garantia.fiador = {
      nome: document.getElementById("fiador_nome").value.trim(),
      cpf: document.getElementById("fiador_cpf").value.trim(),
      rg: document.getElementById("fiador_rg").value.trim() || "não informado",
      estadoCivil: document.getElementById("fiador_estado_civil").value,
      profissao: document.getElementById("fiador_profissao").value.trim() || "não informada",
      endereco: document.getElementById("fiador_endereco").value.trim(),
      imovel: document.getElementById("fiador_imovel").value.trim()
    };
  } else if (tipoGarantia === "seguro_fianca") {
    garantia.seguradora = document.getElementById("seguro_seguradora").value.trim();
    garantia.apolice = document.getElementById("seguro_apolice").value.trim();
  }

  // Cláusulas opcionais
  const opcionais = {
    animais: document.getElementById("clausula_animais").checked,
    mobiliado: document.getElementById("clausula_mobiliado").checked,
    listaMobilia: document.getElementById("lista_mobilia").value.trim(),
    vistoria: document.getElementById("clausula_vistoria").checked,
    multaPersonalizada: document.getElementById("clausula_multa_personalizada").checked,
    multaAlugueis: document.getElementById("multa_alugueis").value,
    sublocacao: document.getElementById("clausula_sublocacao").checked,
    iptuLocador: document.getElementById("clausula_iptu_locador").checked
  };

  return {
    locadores,
    locatarios,
    imovel: {
      endereco: document.getElementById("imovel_endereco").value.trim(),
      tipo: document.getElementById("imovel_tipo").value,
      finalidade: document.getElementById("imovel_finalidade").value,
      matricula: document.getElementById("imovel_matricula").value.trim(),
      descricao: document.getElementById("imovel_descricao").value.trim() ||
                 "Imóvel destinado exclusivamente para fins " +
                 document.getElementById("imovel_finalidade").value + "is."
    },
    contrato: {
      valorAluguel: parseFloat(document.getElementById("valor_aluguel").value || 0),
      diaVencimento: document.getElementById("dia_vencimento").value,
      prazoMeses: document.getElementById("prazo_meses").value,
      dataInicio: document.getElementById("data_inicio").value,
      formaPagamento: document.getElementById("forma_pagamento").value,
      indiceReajuste: document.getElementById("indice_reajuste").value,
      cidadeForo: document.getElementById("cidade_foro").value.trim()
    },
    garantia,
    opcionais
  };
}


/* =========================================================
   4) FORMATAR PESSOAS (locadores/locatários) NO TEXTO
========================================================= */
function formatarPessoas(pessoas, tipo) {
  return pessoas.map(p =>
    `${p.nome}, ${p.estadoCivil}, ${p.profissao}, portador(a) do CPF nº ${p.cpf} e RG nº ${p.rg}, ` +
    `residente e domiciliado(a) à ${p.endereco}`
  ).join(";\n\n") + ".";
}


/* =========================================================
   5) GERAR TEXTO DO CONTRATO
========================================================= */
function gerarTextoContratoLocacao(d) {
  const dataFim = calcularDataFim(d.contrato.dataInicio, d.contrato.prazoMeses);
  const valorFormatado = formatarMoeda(d.contrato.valorAluguel);
  const valorExtenso = valorPorExtenso(d.contrato.valorAluguel);

  // Termos no plural quando há mais de uma pessoa
  const locadorLabel = d.locadores.length > 1 ? "LOCADORES" : "LOCADOR(A)";
  const locatarioLabel = d.locatarios.length > 1 ? "LOCATÁRIOS" : "LOCATÁRIO(A)";

  let texto = `CONTRATO DE LOCAÇÃO ${d.imovel.finalidade.toUpperCase()}


Por este instrumento particular, as partes abaixo qualificadas têm entre si, justo e contratado, o presente Contrato de Locação ${d.imovel.finalidade}, que se regerá pelas cláusulas e condições seguintes, com fundamento na Lei nº 8.245/91 (Lei do Inquilinato).


PARTES:

${locadorLabel}: ${formatarPessoas(d.locadores, "locador")}

${locatarioLabel}: ${formatarPessoas(d.locatarios, "locatario")}
`;

  // Bloco do FIADOR (se houver)
  if (d.garantia.tipo === "fiador" && d.garantia.fiador) {
    const f = d.garantia.fiador;
    texto += `
FIADOR(A): ${f.nome}, ${f.estadoCivil}, ${f.profissao}, portador(a) do CPF nº ${f.cpf} e RG nº ${f.rg}, residente e domiciliado(a) à ${f.endereco}.
`;
  }

  texto += `

CLÁUSULA PRIMEIRA — DO OBJETO

O LOCADOR dá em locação ao LOCATÁRIO o imóvel localizado à ${d.imovel.endereco}, do tipo ${d.imovel.tipo}, destinado exclusivamente para fins ${d.imovel.finalidade}is${d.imovel.matricula ? ", " + d.imovel.matricula : ""}.

Descrição do imóvel: ${d.imovel.descricao}


CLÁUSULA SEGUNDA — DO PRAZO

A presente locação terá prazo determinado de ${d.contrato.prazoMeses} (${numeroPorExtenso(d.contrato.prazoMeses)}) meses, com início em ${formatarData(d.contrato.dataInicio)} e término em ${dataFim}.

Parágrafo único: Findo o prazo, caso o LOCATÁRIO permaneça no imóvel sem oposição do LOCADOR, a locação será prorrogada por prazo indeterminado, mantendo-se as demais cláusulas deste contrato.


CLÁUSULA TERCEIRA — DO ALUGUEL

O valor mensal do aluguel é de ${valorFormatado} (${valorExtenso}), a ser pago até o dia ${d.contrato.diaVencimento} de cada mês, mediante ${d.contrato.formaPagamento}.

§1º — O atraso no pagamento implicará multa de 10% (dez por cento) sobre o valor do aluguel, juros de 1% (um por cento) ao mês e correção monetária pelo ${d.contrato.indiceReajuste} ou índice que vier a substituí-lo.

§2º — O valor do aluguel será reajustado anualmente pelo ${d.contrato.indiceReajuste} (${d.contrato.indiceReajuste === "IGP-M" ? "Índice Geral de Preços do Mercado" : d.contrato.indiceReajuste === "IPCA" ? "Índice Nacional de Preços ao Consumidor Amplo" : "Índice Nacional de Preços ao Consumidor"}), ou outro índice legal que o substitua, observada a periodicidade mínima legal.


CLÁUSULA QUARTA — DAS DESPESAS

O LOCATÁRIO obriga-se a pagar, além do aluguel, todas as despesas de consumo do imóvel, incluindo:
a) Energia elétrica;
b) Água e esgoto;
c) Gás (quando aplicável);
d) Internet, telefone e demais serviços contratados;
${d.opcionais.iptuLocador ? "e) Taxas de condomínio (quando houver).\n\nParágrafo único: O IPTU (Imposto Predial e Territorial Urbano) ficará a cargo do LOCADOR." : "e) IPTU (Imposto Predial e Territorial Urbano);\nf) Taxas de condomínio (quando houver)."}


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
`;

  // === CLÁUSULA DE GARANTIA ===
  let numClausula = 7;

  if (d.garantia.tipo !== "sem_garantia") {
    texto += `\n\nCLÁUSULA SÉTIMA — DA GARANTIA LOCATÍCIA\n\n`;

    if (d.garantia.tipo === "caucao") {
      const valorCaucao = formatarMoeda(d.garantia.valor);
      texto += `Em garantia das obrigações assumidas neste contrato, o LOCATÁRIO presta caução em dinheiro no valor de ${valorCaucao} (${valorPorExtenso(d.garantia.valor)}), correspondente a ${(d.garantia.valor / d.contrato.valorAluguel).toFixed(1)} aluguéis, mediante ${d.garantia.forma}.\n\n§1º — A caução será restituída ao LOCATÁRIO ao final do contrato, devidamente corrigida, descontados eventuais débitos ou danos ao imóvel.\n\n§2º — A caução observa o limite legal de 3 (três) meses de aluguel previsto no art. 38, §2º, da Lei 8.245/91.`;

    } else if (d.garantia.tipo === "fiador") {
      texto += `Em garantia das obrigações assumidas neste contrato, o(a) FIADOR(A) acima qualificado(a) declara expressamente que se responsabiliza solidariamente, como fiador(a) e principal pagador(a), por todas as obrigações decorrentes deste contrato, inclusive aluguéis, encargos, multas, danos e despesas judiciais, até a efetiva entrega do imóvel.\n\n§1º — A fiança permanecerá válida mesmo no caso de prorrogação do contrato por prazo indeterminado, nos termos do art. 39 da Lei 8.245/91, salvo manifestação expressa em contrário.`;
      if (d.garantia.fiador.imovel) {
        texto += `\n\n§2º — O(A) FIADOR(A) oferece como reforço de garantia o seguinte bem: ${d.garantia.fiador.imovel}.`;
      }

    } else if (d.garantia.tipo === "seguro_fianca") {
      texto += `Em garantia das obrigações assumidas neste contrato, o LOCATÁRIO contratou seguro-fiança junto à seguradora ${d.garantia.seguradora || "____________"}${d.garantia.apolice ? ", apólice nº " + d.garantia.apolice : ""}, conforme apólice anexa que passa a integrar este contrato.\n\nParágrafo único: O LOCATÁRIO obriga-se a manter o seguro vigente durante toda a locação, renovando-o tempestivamente, sob pena de rescisão contratual.`;
    }
    numClausula = 8;
  }

  // === CLÁUSULA DE RESCISÃO ===
  const ordinais = ["", "PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "QUINTA", "SEXTA", "SÉTIMA", "OITAVA", "NONA", "DÉCIMA", "DÉCIMA PRIMEIRA", "DÉCIMA SEGUNDA", "DÉCIMA TERCEIRA", "DÉCIMA QUARTA"];

  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA RESCISÃO

O presente contrato poderá ser rescindido nas seguintes hipóteses:
a) Por mútuo acordo entre as partes;
b) Por descumprimento de qualquer cláusula deste contrato;
c) Por falta de pagamento do aluguel ou encargos por mais de 30 (trinta) dias;
d) Por iniciativa do LOCATÁRIO, mediante aviso prévio de 30 (trinta) dias e pagamento de multa proporcional ao período restante (na forma do art. 4º da Lei 8.245/91)${d.opcionais.multaPersonalizada ? `, equivalente a ${d.opcionais.multaAlugueis} (${numeroPorExtenso(d.opcionais.multaAlugueis)}) ${d.opcionais.multaAlugueis === "1" ? "aluguel" : "aluguéis"}` : ""}.`;
  numClausula++;

  // === CLÁUSULA DE VISTORIA ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA VISTORIA\n\n`;
  if (d.opcionais.vistoria) {
    texto += `As partes declaram que foi realizada vistoria detalhada no imóvel, cujo Termo de Vistoria, com fotografias e descrição minuciosa do estado de conservação, faz parte integrante deste contrato como ANEXO I, devendo o LOCATÁRIO restituir o imóvel nas mesmas condições, salvo desgaste natural decorrente do uso regular.`;
  } else {
    texto += `As partes declaram que foi realizada vistoria no imóvel, encontrando-se este em perfeitas condições de uso, salvo eventuais ressalvas registradas em termo de vistoria anexo, se houver.`;
  }
  numClausula++;

  // === CLÁUSULAS OPCIONAIS ===
  if (d.opcionais.animais) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DOS ANIMAIS DOMÉSTICOS\n\nFica expressamente autorizada a permanência de animais domésticos no imóvel, ficando o LOCATÁRIO responsável por quaisquer danos, ruídos excessivos, transtornos a vizinhos ou descumprimento das normas condominiais decorrentes da presença dos animais.`;
    numClausula++;
  }

  if (d.opcionais.mobiliado && d.opcionais.listaMobilia) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA MOBÍLIA E EQUIPAMENTOS\n\nO imóvel é entregue mobiliado, contendo os seguintes itens, que passam a integrar o objeto da locação:\n\n${d.opcionais.listaMobilia}\n\nParágrafo único: O LOCATÁRIO compromete-se a conservar os móveis e equipamentos em bom estado, restituindo-os ao final do contrato, salvo desgaste natural decorrente do uso normal.`;
    numClausula++;
  }

  if (d.opcionais.sublocacao) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA PROIBIÇÃO DE SUBLOCAÇÃO\n\nÉ vedado ao LOCATÁRIO, sob pena de rescisão imediata do contrato, sublocar, ceder ou emprestar, total ou parcialmente, o imóvel a terceiros, sem prévia e expressa autorização escrita do LOCADOR.`;
    numClausula++;
  }

  // === DISPOSIÇÕES FINAIS ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DAS DISPOSIÇÕES FINAIS

§1º — Qualquer alteração deste contrato somente terá validade se feita por escrito e assinada por ambas as partes.

§2º — O presente contrato obriga as partes, seus herdeiros e sucessores, a qualquer título.

§3º — As partes elegem o foro da Comarca de ${d.contrato.cidadeForo} para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.


E por estarem assim justas e contratadas, as partes assinam o presente contrato em ${d.garantia.tipo === "fiador" ? "3 (três)" : "2 (duas)"} vias de igual teor, na presença de 2 (duas) testemunhas.


${d.contrato.cidadeForo}, ${dataPorExtenso(d.contrato.dataInicio)}.


`;

  // === ASSINATURAS ===
  d.locadores.forEach((p, i) => {
    texto += `\n_______________________________________________\n${locadorLabel}${d.locadores.length > 1 ? " " + (i + 1) : ""}\n${p.nome}\nCPF: ${p.cpf}\n\n`;
  });

  d.locatarios.forEach((p, i) => {
    texto += `\n_______________________________________________\n${locatarioLabel}${d.locatarios.length > 1 ? " " + (i + 1) : ""}\n${p.nome}\nCPF: ${p.cpf}\n\n`;
  });

  if (d.garantia.tipo === "fiador" && d.garantia.fiador) {
    texto += `\n_______________________________________________\nFIADOR(A)\n${d.garantia.fiador.nome}\nCPF: ${d.garantia.fiador.cpf}\n\n`;
  }

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
   6) GERAR CONTRATO (botão final)
========================================================= */
async function gerarContratoLocacao() {
  if (!validarPasso(6)) return;

  // Validações finais (locadores e locatários têm pelo menos 1)
  if (document.querySelectorAll('[data-pessoa^="locador-"]').length === 0) {
    mostrarToast("⚠️ Adicione ao menos um locador");
    return;
  }
  if (document.querySelectorAll('[data-pessoa^="locatario-"]').length === 0) {
    mostrarToast("⚠️ Adicione ao menos um locatário");
    return;
  }

  dadosContratoLocacao = coletarDadosLocacao();
  const texto = gerarTextoContratoLocacao(dadosContratoLocacao);

  // Mostrar resultado
  document.getElementById("contratoForm").style.display = "none";
  document.querySelector(".progress-bar").style.display = "none";
  document.querySelector(".progress-text").style.display = "none";
  const resultado = document.getElementById("resultado");
  resultado.style.display = "block";
  document.getElementById("previewContrato").textContent = texto;

  // Gerar hash de assinatura
  try {
    const hash = await gerarHashContrato(texto);
    document.getElementById("hashAssinatura").innerHTML =
      `Código de verificação: <strong>${hash}</strong> · Gerado em ${new Date().toLocaleString("pt-BR")}`;
    dadosContratoLocacao._hash = hash;
  } catch (e) {
    console.warn("Hash não pôde ser gerado:", e);
  }

  setTimeout(() => {
    resultado.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);

  mostrarToast("✅ Contrato gerado!");
}

function novoContratoLocacao() {
  if (!confirm("Tem certeza? Você perderá os dados preenchidos.")) return;

  limparDados("locacao");
  document.getElementById("contratoForm").reset();
  document.getElementById("contratoForm").style.display = "block";
  document.querySelector(".progress-bar").style.display = "block";
  document.querySelector(".progress-text").style.display = "block";
  document.getElementById("resultado").style.display = "none";

  // Voltar para o passo 1
  document.querySelectorAll(".passo").forEach(p => p.classList.remove("passo-ativo"));
  document.querySelector('[data-passo="1"]').classList.add("passo-ativo");
  passoAtualLocacao = 1;
  atualizarProgressoLocacao();
  scrollParaElemento("#gerador");

  // Recarregar a página para limpar pessoas adicionais
  setTimeout(() => location.reload(), 500);
}

function limparTudoLocacao() {
  if (!confirm("Apagar todos os dados salvos e recomeçar?")) return;
  limparDados("locacao");
  location.reload();
}


/* =========================================================
   7) BAIXAR PDF E WORD
========================================================= */
function baixarPDFLocacao() {
  const texto = gerarTextoContratoLocacao(dadosContratoLocacao);
  const nomeLocatario = dadosContratoLocacao.locatarios[0].nome.replace(/\s+/g, "_");
  gerarPDF(texto, `Contrato_Locacao_${nomeLocatario}.pdf`);
}

function baixarWordLocacao() {
  const texto = gerarTextoContratoLocacao(dadosContratoLocacao);
  const nomeLocatario = dadosContratoLocacao.locatarios[0].nome.replace(/\s+/g, "_");
  gerarWord(texto, `Contrato_Locacao_${nomeLocatario}.docx`);
}

function imprimirLocacao() {
  const texto = gerarTextoContratoLocacao(dadosContratoLocacao);
  imprimirContrato(texto, dadosContratoLocacao._hash);
}


/* =========================================================
   8) MOSTRAR/ESCONDER CAMPOS DA GARANTIA
========================================================= */
function alternarCamposGarantia() {
  const tipo = document.querySelector('input[name="tipo_garantia"]:checked').value;
  document.getElementById("campos_caucao").style.display = tipo === "caucao" ? "block" : "none";
  document.getElementById("campos_fiador").style.display = tipo === "fiador" ? "block" : "none";
  document.getElementById("campos_seguro").style.display = tipo === "seguro_fianca" ? "block" : "none";

  // Atualiza dica da caução
  if (tipo === "caucao") {
    const aluguel = parseFloat(document.getElementById("valor_aluguel").value || 0);
    if (aluguel) {
      document.getElementById("caucao_dica").textContent =
        `Limite máximo: ${formatarMoeda(aluguel * 3)} (3 aluguéis)`;
    }
  }
}


/* =========================================================
   9) INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Máscaras iniciais
  aplicarMascaraCPF(document.getElementById("locador_1_cpf"));
  aplicarMascaraCPF(document.getElementById("locatario_1_cpf"));
  aplicarMascaraCPF(document.getElementById("fiador_cpf"));
  aplicarMascaraRG(document.getElementById("locador_1_rg"));
  aplicarMascaraRG(document.getElementById("locatario_1_rg"));
  aplicarMascaraRG(document.getElementById("fiador_rg"));

  // Data de início padrão = hoje
  const dataInput = document.getElementById("data_inicio");
  if (!dataInput.value) {
    dataInput.value = new Date().toISOString().split("T")[0];
  }

  // Listeners da garantia
  document.querySelectorAll('input[name="tipo_garantia"]').forEach(radio => {
    radio.addEventListener("change", alternarCamposGarantia);
  });

  // Listeners das cláusulas opcionais
  document.getElementById("clausula_mobiliado").addEventListener("change", e => {
    document.getElementById("campos_mobiliado").style.display = e.target.checked ? "block" : "none";
  });

  document.getElementById("clausula_multa_personalizada").addEventListener("change", e => {
    document.getElementById("campos_multa").style.display = e.target.checked ? "block" : "none";
  });

  // Auto-salvar
  ativarAutoSalvar("contratoForm", "locacao");

  // Indicador de salvamento
  const indicator = document.createElement("div");
  indicator.className = "save-indicator";
  indicator.textContent = "Salvando automaticamente";
  document.body.appendChild(indicator);
});