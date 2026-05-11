/* =========================================================
   COOKIES.JS — Banner de consentimento LGPD
========================================================= */

(function() {
  const COOKIE_KEY = "contratos_facil_cookies_consent";
  const CONSENT_VERSION = "1.0";

  // Verifica se já tem consentimento válido
  function temConsentimento() {
    try {
      const data = JSON.parse(localStorage.getItem(COOKIE_KEY));
      return data && data.version === CONSENT_VERSION;
    } catch {
      return false;
    }
  }

  function salvarConsentimento(escolha) {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      escolha: escolha, // "aceitar" ou "apenas_essenciais"
      data: new Date().toISOString()
    }));
  }

  function criarBanner() {
    const banner = document.createElement("div");
    banner.id = "cookieBanner";
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <div class="cookie-banner-texto">
          <strong>🍪 Cookies e privacidade</strong>
          <p>Utilizamos cookies para melhorar sua experiência e exibir anúncios relevantes (Google AdSense).
          Ao continuar navegando, você concorda com nossa
          <a href="privacidade.html" target="_blank">Política de Privacidade</a>.</p>
        </div>
        <div class="cookie-banner-botoes">
          <button class="btn btn-outline" id="btnCookiesEssenciais">Apenas essenciais</button>
          <button class="btn btn-primary" id="btnCookiesAceitar">Aceitar todos</button>
        </div>
      </div>
    `;

    banner.style.cssText = `
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: white;
      border-top: 2px solid #2563eb;
      padding: 20px;
      z-index: 9999;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
      animation: slideUpBanner 0.4s ease;
    `;

    // Estilo interno
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUpBanner {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      .cookie-banner-inner {
        max-width: 1100px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;
      }
      .cookie-banner-texto { flex: 1; min-width: 280px; }
      .cookie-banner-texto strong { display: block; margin-bottom: 6px; font-size: 15px; }
      .cookie-banner-texto p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; }
      .cookie-banner-texto a { color: #2563eb; }
      .cookie-banner-botoes { display: flex; gap: 10px; flex-wrap: wrap; }
      @media (max-width: 600px) {
        .cookie-banner-botoes { width: 100%; }
        .cookie-banner-botoes .btn { flex: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(banner);

    // Eventos
    document.getElementById("btnCookiesAceitar").addEventListener("click", () => {
      salvarConsentimento("aceitar");
      banner.remove();
    });

    document.getElementById("btnCookiesEssenciais").addEventListener("click", () => {
      salvarConsentimento("apenas_essenciais");
      banner.remove();
    });
  }

  // Mostra o banner se ainda não tem consentimento
  function init() {
    if (!temConsentimento()) {
      // Pequeno delay para não ser intrusivo
      setTimeout(criarBanner, 800);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();