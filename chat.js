function getPageContent() {
  const clone = document.body.cloneNode(true);
 
  ['script', 'style', 'nav', 'footer', 'header', 'noscript'].forEach(function(tag) {
    clone.querySelectorAll(tag).forEach(function(el) { el.remove(); });
  });
 
  const text = clone.innerText || clone.textContent || '';
  return text.replace(/\s+/g, ' ').trim().substring(0, 3000);
}
 
// Stub so your HTML's loadPageData() call doesn't crash
function loadPageData() {
  // Page context is set — no action needed here for the POC
  console.log('loadPageData called. Page context:', window.pageContext);
}
 
function initChat() {
  const script = document.createElement("script");
  script.src = "https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494/assets/js/bootstrap.min.js";
 
  script.onload = function() {
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
 
      // ✅ Correct method: addEventListener (not addEventHandler)
      window.addEventListener('onEmbeddedMessagingReady', function() {
        console.log('Agentforce ready — setting page context...');
 
        try {
          // Pass current page URL + title as session context
          embeddedservice_bootstrap.utilAPI.setSessionContext({
            currentPage: {
              url: window.location.href,
              title: document.title
            }
          });
        } catch(e) {
          console.warn('setSessionContext failed:', e);
        }
 
        try {
          // Pass scraped page content as hidden pre-chat fields
          embeddedservice_bootstrap.utilAPI.setHiddenPrechatFields({
            currentPageUrl: window.location.href,
            pageContent: getPageContent()
          });
        } catch(e) {
          console.warn('setHiddenPrechatFields failed:', e);
        }
 
      });
 
    } catch (e) {
      console.error('Agentforce init error:', e);
    }
  };
 
  script.onerror = function() {
    console.error('Failed to load Agentforce bootstrap script. Check the URL or network.');
  };
 
  document.body.appendChild(script);
}
 
initChat();
 
