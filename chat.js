function initChat() {
  const script = document.createElement("script");
  script.src = "https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494/assets/js/bootstrap.min.js";

  script.onload = () => {
    try {
      embeddedservice_bootstrap.settings.language = 'en_US';
      embeddedservice_bootstrap.settings.enablePrechat = true;

      embeddedservice_bootstrap.init(
        '00DgL00000AGQdV',
        'SIAA_Airlines_Agent',
        'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494',
        {
          scrt2URL: 'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.salesforce-scrt.com'
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  document.body.appendChild(script);
}

initChat();