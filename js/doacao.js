/* =========================================================
   DOACAO.JS — Lógica do contrato de doação
========================================================= */

let passoAtualDC = 1;
let dadosContratoDC = {};
let totalDoadores = 1;
let totalDonatarios = 1;
const TOTAL_PASSOS_DC = 5;


/* =========================================================
   1) NAVEGAÇÃO
========================================================= */
function proximoPassoDC(passo) {
  console.log("[proximoPassoDC] passo =", passo);

  if (!validarPasso(passo)) return;

  // Validações específicas
  if (passo === 1) {
    const tipoDoacao = document.querySelector('input[name="tipo_doacao"]:checked').value;
    if (tipoDoacao === "encargo") {
      const desc = document.getElementById("dc_encargo_descricao").value.trim();
      if (!desc) {
        mostrarToast("⚠️ Descreva o encargo do donatário");
        document.getElementById("dc_encargo_descricao").focus();
        return;
      }
    }
  }

  if (passo === 3) {
    // Validar que quinhões somam 100%
    const blocos = document.querySelectorAll('[data-pessoa^="donatario-"]');
    let total = 0;
    blocos.forEach(b => {
      const id = b.dataset.pessoa.split("-")[1];
      total += parseFloat(document.getElementById(`donatario_${id}_quinhao`).value || 0);
    });
    if (blocos.length > 1 && Math.abs(total - 100) > 0.01) {
      mostrarToast(`⚠️ Os quinhões somam ${total}%. Devem somar 100%.`);
      return;
    }
  }

  if (passo === 4) {
    const tipoBem = document.querySelector('input[name="dc_tipo_bem"]:checked').value;
    if (tipoBem === "imovel") {
      if (!document.getElementById("dc_imovel_endereco").value.trim()) {
        mostrarToast("⚠️ Informe o endereço do imóvel");
        return;
      }
      if (!document.getElementById("dc_imovel_matricula").value.trim()) {
        mostrarToast("⚠️ Informe a matrícula do imóvel");
        return;
      }
    } else if (tipoBem === "movel") {
      if (!document.getElementById("dc_movel_titulo").value.trim()) {
        mostrarToast("⚠️ Descreva o bem móvel");
        return;
      }
      if (!document.getElementById("dc_movel_descricao").value.trim()) {
        mostrarToast("⚠️ Detalhe a identificação do bem");
        return;
      }
    }
  }

  const passoEl = document.querySelector(`[data-passo="${passo}"]`);
  const proximoEl = document.querySelector(`[data-passo="${passo + 1}"]`);
  if (!passoEl || !proximoEl) return;

  passoEl.classList.remove("passo-ativo");
  proximoEl.classList.add("passo-ativo");
  passoAtualDC = passo + 1;
  atualizarProgressoDC();
  scrollParaElemento("#gerador");
}

function passoAnteriorDC(passo) {
  document.querySelector(`[data-passo="${passo}"]`).classList.remove("passo-ativo");
  document.querySelector(`[data-passo="${passo - 1}"]`).classList.add("passo-ativo");
  passoAtualDC = passo - 1;
  atualizarProgressoDC();
  scrollParaElemento("#gerador");
}

function atualizarProgressoDC() {
  const pct = (passoAtualDC / TOTAL_PASSOS_DC) * 100;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("passoAtual").textContent = passoAtualDC;
}


/* =========================================================
   2) ADICIONAR/REMOVER PESSOAS
========================================================= */
function adicionarPessoaDC(tipo) {
  const container = document.getElementById(tipo + "sContainer");
  const total = tipo === "doador" ? ++totalDoadores : ++totalDonatarios;
  const labelTipo = tipo === "doador" ? "Doador" : "Donatário";

  const bloco = document.createElement("div");
  bloco.className = "pessoa-bloco";
  bloco.dataset.pessoa = `${tipo}-${total}`;

  let extraDonatario = "";
  if (tipo === "donatario") {
    extraDonatario = `
      <div class="grid-2">
        <div class="campo">
          <label>Relação com o doador</label>
          <select id="donatario_${total}_relacao">
            <option value="">Não especificar</option>
            <option value="filho(a)">Filho(a)</option>
            <option value="cônjuge">Cônjuge</option>
            <option value="neto(a)">Neto(a)</option>
            <option value="irmão(ã)">Irmão(ã)</option>
            <option value="sobrinho(a)">Sobrinho(a)</option>
            <option value="amigo(a)">Amigo(a)</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div class="campo">
          <label>Quinhão (%)</label>
          <input type="number" id="donatario_${total}_quinhao" placeholder="50" min="0" max="100" step="0.01">
        </div>
      </div>
    `;
  }

  bloco.innerHTML = `
    <h4>
      ${labelTipo} ${total}
      <button type="button" class="btn-remover" onclick="removerPessoaDC('${tipo}', ${total})">✕ Remover</button>
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

    ${extraDonatario}

    <div class="campo">
      <label>Endereço completo *</label>
      <input type="text" id="${tipo}_${total}_endereco" required>
    </div>
  `;

  container.appendChild(bloco);
  aplicarMascaraCPF(document.getElementById(`${tipo}_${total}_cpf`));
  aplicarMascaraRG(document.getElementById(`${tipo}_${total}_rg`));
}

function removerPessoaDC(tipo, num) {
  const bloco = document.querySelector(`[data-pessoa="${tipo}-${num}"]`);
  if (bloco) bloco.remove();
}


/* =========================================================
   3) ALTERNAR TIPO DE DOAÇÃO E TIPO DE BEM
========================================================= */
function alternarTipoDoacao() {
  const tipo = document.querySelector('input[name="tipo_doacao"]:checked').value;
  document.getElementById("campos_encargo").style.display = tipo === "encargo" ? "block" : "none";
  document.getElementById("campos_adiantamento").style.display = tipo === "adiantamento" ? "block" : "none";
  document.getElementById("campos_usufruto").style.display = tipo === "usufruto" ? "block" : "none";
}

function alternarTipoBem() {
  const tipo = document.querySelector('input[name="dc_tipo_bem"]:checked').value;
  document.getElementById("campos_imovel").style.display = tipo === "imovel" ? "block" : "none";
  document.getElementById("campos_movel").style.display = tipo === "movel" ? "block" : "none";
  document.getElementById("campos_dinheiro").style.display = tipo === "dinheiro" ? "block" : "none";
}


/* =========================================================
   4) COLETAR DADOS
========================================================= */
function coletarDadosDC() {
  // Doadores
  const doadores = [];
  document.querySelectorAll('[data-pessoa^="doador-"]').forEach(bloco => {
    const id = bloco.dataset.pessoa.split("-")[1];
    doadores.push({
      nome: document.getElementById(`doador_${id}_nome`).value.trim(),
      cpf: document.getElementById(`doador_${id}_cpf`).value.trim(),
      rg: document.getElementById(`doador_${id}_rg`).value.trim() || "não informado",
      estadoCivil: document.getElementById(`doador_${id}_estado_civil`).value,
      profissao: document.getElementById(`doador_${id}_profissao`).value.trim() || "não informada",
      endereco: document.getElementById(`doador_${id}_endereco`).value.trim()
    });
  });

  // Donatários
  const donatarios = [];
  document.querySelectorAll('[data-pessoa^="donatario-"]').forEach(bloco => {
    const id = bloco.dataset.pessoa.split("-")[1];
    donatarios.push({
      nome: document.getElementById(`donatario_${id}_nome`).value.trim(),
      cpf: document.getElementById(`donatario_${id}_cpf`).value.trim(),
      rg: document.getElementById(`donatario_${id}_rg`).value.trim() || "não informado",
      estadoCivil: document.getElementById(`donatario_${id}_estado_civil`).value,
      profissao: document.getElementById(`donatario_${id}_profissao`).value.trim() || "não informada",
      endereco: document.getElementById(`donatario_${id}_endereco`).value.trim(),
      relacao: document.getElementById(`donatario_${id}_relacao`)?.value || "",
      quinhao: parseFloat(document.getElementById(`donatario_${id}_quinhao`)?.value || 100)
    });
  });

  // Tipo de doação
  const tipoDoacao = document.querySelector('input[name="tipo_doacao"]:checked').value;
  const doacao = { tipo: tipoDoacao };

  if (tipoDoacao === "encargo") {
    doacao.encargo = document.getElementById("dc_encargo_descricao").value.trim();
  } else if (tipoDoacao === "adiantamento") {
    doacao.dispensaColacao = document.getElementById("dc_dispensa_colacao").checked;
  } else if (tipoDoacao === "usufruto") {
    doacao.usufrutuario = document.getElementById("dc_usufruto_beneficiario").value;
  }

  // Bem
  const tipoBem = document.querySelector('input[name="dc_tipo_bem"]:checked').value;
  const bem = { tipo: tipoBem, valor: parseFloat(document.getElementById("dc_valor").value || 0) };

  if (tipoBem === "imovel") {
    bem.endereco = document.getElementById("dc_imovel_endereco").value.trim();
    bem.tipoImovel = document.getElementById("dc_imovel_tipo").value;
    bem.area = document.getElementById("dc_imovel_area").value;
    bem.matricula = document.getElementById("dc_imovel_matricula").value.trim();
    bem.descricao = document.getElementById("dc_imovel_descricao").value.trim();
  } else if (tipoBem === "movel") {
    bem.titulo = document.getElementById("dc_movel_titulo").value.trim();
    bem.descricao = document.getElementById("dc_movel_descricao").value.trim();
  } else if (tipoBem === "dinheiro") {
    bem.formaEntrega = document.getElementById("dc_dinheiro_forma").value;
  }

  return {
    doacao,
    doadores,
    donatarios,
    bem,
    restricoes: {
      inalienabilidade: document.getElementById("dc_inalienabilidade").checked,
      inalienabilidadePrazo: document.getElementById("dc_inalienabilidade_prazo").value,
      impenhorabilidade: document.getElementById("dc_impenhorabilidade").checked,
      incomunicabilidade: document.getElementById("dc_incomunicabilidade").checked,
      reversao: document.getElementById("dc_reversao").checked
    },
    cidadeForo: document.getElementById("dc_cidade_foro").value.trim(),
    data: document.getElementById("dc_data").value
  };
}


/* =========================================================
   5) FORMATADORES
========================================================= */
function formatarPessoasDC(pessoas) {
  return pessoas.map(p => {
    let texto = `${p.nome}, ${p.estadoCivil}, ${p.profissao}, portador(a) do CPF nº ${p.cpf} e RG nº ${p.rg}, residente e domiciliado(a) à ${p.endereco}`;
    if (p.relacao) texto += ` (${p.relacao} do(a) doador(a))`;
    return texto;
  }).join(";\n\n") + ".";
}


/* =========================================================
   6) GERAR TEXTO DO CONTRATO
========================================================= */
function gerarTextoContratoDC(d) {
  const valor = formatarMoeda(d.bem.valor);
  const valorExt = valorPorExtenso(d.bem.valor);

  // Título adaptado ao tipo
  let tituloContrato = "INSTRUMENTO PARTICULAR DE DOAÇÃO";
  if (d.doacao.tipo === "encargo") tituloContrato += " COM ENCARGO";
  else if (d.doacao.tipo === "adiantamento") tituloContrato += " EM ADIANTAMENTO DE LEGÍTIMA";
  else if (d.doacao.tipo === "usufruto") tituloContrato += " COM RESERVA DE USUFRUTO";

  const doadorLabel = d.doadores.length > 1 ? "DOADORES" : "DOADOR(A)";
  const donatarioLabel = d.donatarios.length > 1 ? "DONATÁRIOS" : "DONATÁRIO(A)";

  let texto = `${tituloContrato}


Por este instrumento particular, as partes abaixo qualificadas, com fundamento nos arts. 538 a 564 do Código Civil, têm entre si, justo e contratado, o presente Contrato de Doação, que se regerá pelas cláusulas e condições seguintes.


PARTES:

${doadorLabel}: ${formatarPessoasDC(d.doadores)}

${donatarioLabel}: ${formatarPessoasDC(d.donatarios)}


CLÁUSULA PRIMEIRA — DO OBJETO

O(s) ${doadorLabel}, por liberalidade e por sua livre e espontânea vontade, doa(m) ao(s) ${donatarioLabel}, que aceita(m) a presente doação, o(s) bem(ns) abaixo descrito(s):

`;

  // Descrição do bem
  if (d.bem.tipo === "imovel") {
    texto += `Imóvel localizado à ${d.bem.endereco}, do tipo ${d.bem.tipoImovel}${d.bem.area ? `, com área total de ${d.bem.area} m²` : ""}, devidamente matriculado sob o nº ${d.bem.matricula}.`;
    if (d.bem.descricao) texto += `\n\nDescrição: ${d.bem.descricao}`;
  } else if (d.bem.tipo === "movel") {
    texto += `Bem móvel: ${d.bem.titulo}.\n\nIdentificação detalhada: ${d.bem.descricao}`;
  } else if (d.bem.tipo === "dinheiro") {
    texto += `Quantia em dinheiro no valor de ${valor} (${valorExt}), a ser entregue mediante ${d.bem.formaEntrega}.`;
  }

  texto += `\n\nValor estimado do bem doado para fins fiscais: ${valor} (${valorExt}).`;

  // Distribuição entre múltiplos donatários
  if (d.donatarios.length > 1) {
    texto += `\n\nA doação se divide entre os DONATÁRIOS na seguinte proporção:\n`;
    d.donatarios.forEach(don => {
      texto += `\n• ${don.nome}: ${don.quinhao}% (${valorPorExtenso(d.bem.valor * don.quinhao / 100)} — ${formatarMoeda(d.bem.valor * don.quinhao / 100)})`;
    });
  }


  // === MODALIDADE DA DOAÇÃO ===
  let numClausula = 2;
  const ordinais = ["", "PRIMEIRA", "SEGUNDA", "TERCEIRA", "QUARTA", "QUINTA", "SEXTA", "SÉTIMA", "OITAVA", "NONA", "DÉCIMA", "DÉCIMA PRIMEIRA", "DÉCIMA SEGUNDA"];

  if (d.doacao.tipo === "encargo") {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DO ENCARGO

A presente doação é feita com encargo, com fundamento no art. 553 do Código Civil. O(s) DONATÁRIO(s), aceitando a presente doação, obriga(m)-se a cumprir o seguinte encargo:

${d.doacao.encargo}

Parágrafo único: O descumprimento do encargo, mediante notificação prévia para purgação no prazo de 30 (trinta) dias, autoriza a revogação da doação, com retorno do bem ao patrimônio do(s) DOADOR(es), nos termos do art. 555 e 562 do Código Civil.`;
    numClausula++;
  }

  if (d.doacao.tipo === "adiantamento") {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DO ADIANTAMENTO DE LEGÍTIMA

A presente doação é feita em ADIANTAMENTO DE LEGÍTIMA, nos termos do art. 544 do Código Civil, devendo o bem doado, em princípio, ser trazido à colação no inventário do(s) DOADOR(es) para igualar a partilha entre os herdeiros necessários.`;

    if (d.doacao.dispensaColacao) {
      texto += `\n\nParágrafo único: O(s) DOADOR(es), no uso da faculdade prevista no art. 2.005 do Código Civil, DISPENSA(M) EXPRESSAMENTE a colação, sendo a presente doação imputada à parte disponível do patrimônio do(s) DOADOR(es), e não à legítima do(s) DONATÁRIO(s). Declara(m) o(s) DOADOR(es) estar a doação dentro dos limites da parte disponível.`;
    } else {
      texto += `\n\nParágrafo único: O(s) DONATÁRIO(s) declara(m) ter ciência da obrigação de trazer o bem à colação no momento da abertura da sucessão, salvo se o presente bem couber na parte disponível do patrimônio do(s) DOADOR(es).`;
    }
    numClausula++;
  }

  if (d.doacao.tipo === "usufruto") {
    const usufrutuario = d.doacao.usufrutuario === "doador" ? "o(s) DOADOR(es)" : "o(s) DOADOR(es) e seu(sua) cônjuge";
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA RESERVA DE USUFRUTO

O(s) DOADOR(es) RESERVA(M) PARA SI, em caráter vitalício, o USUFRUTO sobre o bem ora doado, transferindo ao(s) DONATÁRIO(s) apenas a NUA-PROPRIEDADE.

§1º — Em decorrência da reserva de usufruto, ${usufrutuario} permanecerá(ão) na posse e uso do bem, podendo dele(a) usufruir economicamente, recebendo seus frutos e rendimentos, durante toda sua(s) vida(s).

§2º — O usufruto é vitalício e intransferível, extinguindo-se com a morte do(s) usufrutuário(s), nos termos do art. 1.410, I, do Código Civil, momento em que o(s) DONATÁRIO(s) consolidará(ão) a propriedade plena.

§3º — Cabe(m) ao(s) usufrutuário(s) as despesas ordinárias de conservação do bem; ao(s) nu(s)-proprietário(s), as extraordinárias.`;
    numClausula++;
  }


  // === CLÁUSULAS RESTRITIVAS ===
  if (d.restricoes.inalienabilidade || d.restricoes.impenhorabilidade || d.restricoes.incomunicabilidade) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DAS CLÁUSULAS RESTRITIVAS\n`;

    if (d.restricoes.inalienabilidade) {
      const prazo = d.restricoes.inalienabilidadePrazo === "vitalicia"
        ? "vitalícia, durante toda a vida do(s) DONATÁRIO(s)"
        : `pelo prazo de ${d.restricoes.inalienabilidadePrazo} (${numeroPorExtenso(d.restricoes.inalienabilidadePrazo)}) anos`;
      texto += `\n§1º — INALIENABILIDADE: O bem ora doado é gravado com cláusula de INALIENABILIDADE ${prazo}, ficando o(s) DONATÁRIO(s) impedido(s) de vender, doar, permutar ou de qualquer forma alienar o bem, nos termos do art. 1.911 do Código Civil.`;
    }

    if (d.restricoes.impenhorabilidade) {
      texto += `\n\n§${d.restricoes.inalienabilidade ? "2" : "1"}º — IMPENHORABILIDADE: O bem ora doado é gravado com cláusula de IMPENHORABILIDADE, ficando excluído de qualquer execução judicial por dívidas pessoais do(s) DONATÁRIO(s).`;
    }

    if (d.restricoes.incomunicabilidade) {
      const numParagrafo = (d.restricoes.inalienabilidade ? 1 : 0) + (d.restricoes.impenhorabilidade ? 1 : 0) + 1;
      texto += `\n\n§${numParagrafo}º — INCOMUNICABILIDADE: O bem ora doado é gravado com cláusula de INCOMUNICABILIDADE, não se comunicando com o cônjuge ou companheiro(a) do(s) DONATÁRIO(s), independentemente do regime de bens, nem se integrando à meação em caso de separação ou divórcio.`;
    }
    numClausula++;
  }


  // === REVERSÃO ===
  if (d.restricoes.reversao) {
    texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA CLÁUSULA DE REVERSÃO

Estabelecem as partes, com fundamento no art. 547 do Código Civil, cláusula de REVERSÃO, segundo a qual, no caso de o(s) DONATÁRIO(s) falecer(em) antes do(s) DOADOR(es), o bem ora doado retornará automaticamente ao patrimônio do(s) DOADOR(es), independentemente de qualquer formalidade adicional, não passando aos herdeiros do(s) DONATÁRIO(s).`;
    numClausula++;
  }


  // === ACEITAÇÃO ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA ACEITAÇÃO

O(s) DONATÁRIO(s), neste ato, ACEITA(M) EXPRESSAMENTE a presente doação, com todas as suas condições, cláusulas e encargos, agradecendo ao(s) DOADOR(es) pela liberalidade.`;
  numClausula++;


  // === DECLARAÇÕES DO DOADOR ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DAS DECLARAÇÕES E RESPONSABILIDADES

§1º — O(s) DOADOR(es) declara(m), sob as penas da lei, que:
a) É(são) legítimo(s) proprietário(s) do bem ora doado;
b) O bem encontra-se livre e desembaraçado de quaisquer ônus, dívidas, hipotecas, alienações, penhoras ou ações judiciais;
c) A presente doação respeita os limites legais, não comprometendo recursos necessários ao próprio sustento (art. 548 CC), nem invadindo a legítima dos herdeiros necessários (art. 549 CC);
d) Não há vícios de consentimento na presente doação.

§2º — As despesas com a transferência do bem (escritura pública, registro, ITCMD e demais emolumentos) ficarão a cargo do(s) DONATÁRIO(s), salvo disposição em contrário.`;
  numClausula++;


  // === REVOGAÇÃO ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DA REVOGAÇÃO

A presente doação poderá ser revogada nas hipóteses legais previstas nos arts. 555 a 564 do Código Civil, especialmente:
a) Por descumprimento de encargo (quando aplicável);
b) Por ingratidão do(s) DONATÁRIO(s) nas hipóteses previstas em lei (atentado contra a vida do(s) DOADOR(es), ofensa física, injúria grave, recusa de alimentos quando devidos).`;
  numClausula++;


  // === DISPOSIÇÕES FINAIS ===
  texto += `\n\n\nCLÁUSULA ${ordinais[numClausula]} — DAS DISPOSIÇÕES FINAIS

§1º — A presente doação é feita em caráter irrevogável e irretratável, observadas as hipóteses de revogação previstas em lei e neste contrato.

§2º — As partes elegem o foro da Comarca de ${d.cidadeForo} para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro.

${d.bem.tipo === "imovel" ? "§3º — As partes têm ciência de que, tratando-se de bem imóvel, o presente contrato deverá ser convertido em escritura pública e registrado no Cartório de Registro de Imóveis competente para fins de transferência de propriedade (art. 108 CC e art. 167 da Lei 6.015/73).\n\n" : ""}

E por estarem assim justas e contratadas, as partes assinam o presente contrato em ${d.doadores.length + d.donatarios.length} (${numeroPorExtenso(d.doadores.length + d.donatarios.length)}) vias de igual teor, na presença de 2 (duas) testemunhas.


${d.cidadeForo}, ${dataPorExtenso(d.data)}.


`;

  // === ASSINATURAS ===
  d.doadores.forEach((p, i) => {
    texto += `\n_______________________________________________\n${doadorLabel}${d.doadores.length > 1 ? " " + (i + 1) : ""}\n${p.nome}\nCPF: ${p.cpf}\n\n`;
  });

  d.donatarios.forEach((p, i) => {
    texto += `\n_______________________________________________\n${donatarioLabel}${d.donatarios.length > 1 ? " " + (i + 1) : ""}\n${p.nome}\nCPF: ${p.cpf}\n\n`;
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
   7) GERAR / BAIXAR / IMPRIMIR
========================================================= */
async function gerarContratoDC() {
  if (!validarPasso(5)) return;

  if (document.querySelectorAll('[data-pessoa^="doador-"]').length === 0) {
    mostrarToast("⚠️ Adicione ao menos um doador");
    return;
  }
  if (document.querySelectorAll('[data-pessoa^="donatario-"]').length === 0) {
    mostrarToast("⚠️ Adicione ao menos um donatário");
    return;
  }

  dadosContratoDC = coletarDadosDC();
  const texto = gerarTextoContratoDC(dadosContratoDC);

  document.getElementById("contratoFormDC").style.display = "none";
  document.querySelector(".progress-bar").style.display = "none";
  document.querySelector(".progress-text").style.display = "none";
  const resultado = document.getElementById("resultado");
  resultado.style.display = "block";
  document.getElementById("previewContratoDC").textContent = texto;

  try {
    const hash = await gerarHashContrato(texto);
    document.getElementById("hashAssinaturaDC").innerHTML =
      `Código de verificação: <strong>${hash}</strong> · Gerado em ${new Date().toLocaleString("pt-BR")}`;
    dadosContratoDC._hash = hash;
  } catch (e) { console.warn(e); }

  setTimeout(() => resultado.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  mostrarToast("✅ Contrato gerado!");
}

function novoContratoDC() {
  if (!confirm("Tem certeza? Você perderá os dados preenchidos.")) return;
  limparDados("doacao");
  location.reload();
}

function limparTudoDoacao() {
  if (!confirm("Apagar todos os dados salvos e recomeçar?")) return;
  limparDados("doacao");
  location.reload();
}

function baixarPDFDC() {
  const texto = gerarTextoContratoDC(dadosContratoDC);
  const nome = dadosContratoDC.donatarios[0].nome.replace(/\s+/g, "_");
  gerarPDF(texto, `Contrato_Doacao_${nome}.pdf`);
}

function baixarWordDC() {
  const texto = gerarTextoContratoDC(dadosContratoDC);
  const nome = dadosContratoDC.donatarios[0].nome.replace(/\s+/g, "_");
  gerarWord(texto, `Contrato_Doacao_${nome}.docx`);
}

function imprimirDC() {
  const texto = gerarTextoContratoDC(dadosContratoDC);
  imprimirContrato(texto, dadosContratoDC._hash);
}


/* =========================================================
   8) INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Máscaras
  ["doador_1_cpf", "donatario_1_cpf"].forEach(id => aplicarMascaraCPF(document.getElementById(id)));
  ["doador_1_rg", "donatario_1_rg"].forEach(id => aplicarMascaraRG(document.getElementById(id)));

  // Data padrão
  const dataInput = document.getElementById("dc_data");
  if (!dataInput.value) dataInput.value = new Date().toISOString().split("T")[0];

  // Listeners do tipo de doação
  document.querySelectorAll('input[name="tipo_doacao"]').forEach(radio => {
    radio.addEventListener("change", alternarTipoDoacao);
  });

  // Listeners do tipo de bem
  document.querySelectorAll('input[name="dc_tipo_bem"]').forEach(radio => {
    radio.addEventListener("change", alternarTipoBem);
  });

  // Listener da inalienabilidade
  document.getElementById("dc_inalienabilidade").addEventListener("change", e => {
    document.getElementById("campos_inalienabilidade").style.display = e.target.checked ? "block" : "none";
  });

  // Auto-salvar
  ativarAutoSalvar("contratoFormDC", "doacao");

  // Indicador
  const indicator = document.createElement("div");
  indicator.className = "save-indicator";
  indicator.textContent = "Salvando automaticamente";
  document.body.appendChild(indicator);
});