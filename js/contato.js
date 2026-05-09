/* =========================================================
   CONTATO.JS — Lógica do formulário de contato
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Máscara de telefone
  aplicarMascaraTelefone(document.getElementById("contato_telefone"));

  // Form
  const form = document.getElementById("formContato");
  const btnEnviar = document.getElementById("btnEnviar");
  const msgSucesso = document.getElementById("msgSucesso");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validação básica
    const nome = document.getElementById("contato_nome").value.trim();
    const email = document.getElementById("contato_email").value.trim();
    const tipo = document.getElementById("contato_tipo").value;
    const mensagem = document.getElementById("contato_mensagem").value.trim();
    const lgpd = document.getElementById("contato_lgpd").checked;

    if (!nome || !email || !tipo || !mensagem) {
      mostrarToast("⚠️ Preencha todos os campos obrigatórios");
      return;
    }

    if (!validarEmail(email)) {
      mostrarToast("❌ E-mail inválido");
      document.getElementById("contato_email").focus();
      return;
    }

    if (!lgpd) {
      mostrarToast("⚠️ É necessário aceitar o tratamento de dados (LGPD)");
      return;
    }

    // Estado de envio
    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";

    try {
      // Verifica se Formspree foi configurado
      const action = form.getAttribute("action");
      if (action.includes("SEU_ID_FORMSPREE")) {
        // Modo de fallback: ainda não configurou Formspree → abre e-mail direto
        const corpo = montarCorpoEmail(nome, email, tipo, mensagem);
        const assunto = encodeURIComponent(`[Contato Site] ${nome} — ${textoTipoDemanda(tipo)}`);
        // ⚙️ CONFIGURAR: substitua pelo seu e-mail
        window.location.href = `mailto:contato@seusite.com.br?subject=${assunto}&body=${corpo}`;

        setTimeout(() => {
          mostrarToast("📧 Abrimos seu app de e-mail. Configure o Formspree para receber direto no site.");
          btnEnviar.disabled = false;
          btnEnviar.textContent = "📨 Enviar mensagem";
        }, 1500);
        return;
      }

      // Envio via Formspree
      const formData = new FormData(form);
      const response = await fetch(action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      });

      if (response.ok) {
        // Esconde o form e mostra mensagem de sucesso
        form.style.display = "none";
        msgSucesso.style.display = "block";
        msgSucesso.scrollIntoView({ behavior: "smooth", block: "center" });
        mostrarToast("✅ Mensagem enviada com sucesso!");
      } else {
        throw new Error("Erro no envio");
      }
    } catch (err) {
      console.error(err);
      mostrarToast("❌ Erro ao enviar. Tente o WhatsApp ou e-mail direto.");
      btnEnviar.disabled = false;
      btnEnviar.textContent = "📨 Enviar mensagem";
    }
  });
});


/* =========================================================
   VALIDAÇÃO DE E-MAIL
========================================================= */
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}


/* =========================================================
   MONTAR CORPO DO E-MAIL (fallback sem Formspree)
========================================================= */
function montarCorpoEmail(nome, email, tipo, mensagem) {
  const telefone = document.getElementById("contato_telefone").value.trim();
  const urgencia = document.getElementById("contato_urgencia").value;

  const corpo = `Nova solicitação de contato

═══════════════════════════════
DADOS DO SOLICITANTE
═══════════════════════════════
Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone || "Não informado"}

═══════════════════════════════
DEMANDA
═══════════════════════════════
Tipo: ${textoTipoDemanda(tipo)}
Urgência: ${textoUrgencia(urgencia)}

═══════════════════════════════
MENSAGEM
═══════════════════════════════
${mensagem}

═══════════════════════════════
Enviado via formulário do site Contratos Fácil
${new Date().toLocaleString("pt-BR")}
`;

  return encodeURIComponent(corpo);
}

function textoTipoDemanda(tipo) {
  const tipos = {
    contrato_personalizado: "Contrato personalizado",
    revisao_minuta: "Revisão de minuta",
    contrato_imobiliario: "Contrato imobiliário complexo",
    contrato_empresarial: "Contrato empresarial / societário",
    sucessao_familia: "Sucessão / Direito de Família",
    duvida_modelo: "Dúvida sobre os modelos do site",
    outro: "Outro"
  };
  return tipos[tipo] || tipo;
}

function textoUrgencia(urgencia) {
  const urgencias = {
    normal: "Normal — alguns dias",
    alta: "Alta — até 48h",
    urgente: "Urgente — mesmo dia"
  };
  return urgencias[urgencia] || urgencia;
}