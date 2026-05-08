// Helper: scrape visible page text (strips scripts/styles/nav etc.)
function getPageContent() {
  const clone = document.body.cloneNode(true);

  ['script', 'style', 'nav', 'footer', 'header', 'noscript'].forEach(tag => {
    clone.querySelectorAll(tag).forEach(el => el.remove());
  });

  const text = clone.innerText || clone.textContent || '';
  return text.replace(/\s+/g, ' ').trim().substring(0, 3000);
}

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

      // ✅ Add event handler AFTER init
      embeddedservice_bootstrap.addEventHandler('onEmbeddedMessagingReady', () => {

        // Pass current page URL as context
        embeddedservice_bootstrap.utilAPI.setSessionContext({
          currentPage: {
            url: window.location.href,
            title: document.title
          }
        });

        // Pass page URL + scraped content as hidden pre-chat fields
        embeddedservice_bootstrap.utilAPI.setHiddenPrechatFields({
          currentPageUrl: window.location.href,
          pageContent: getPageContent()
        });

      });

    } catch (e) {
      console.error(e);
    }
  };

  document.body.appendChild(script);
}

initChat();