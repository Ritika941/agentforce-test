// ===============================
// AGENTFORCE WEBSITE CONTEXT CHAT
// ===============================

// -------------------------------
// Extract meaningful page content
// -------------------------------
function getPageContent() {

    const clone = document.body.cloneNode(true);

    // Remove unwanted elements
    ['script', 'style', 'nav', 'footer', 'header', 'noscript']
    .forEach(tag => {
        clone.querySelectorAll(tag).forEach(el => el.remove());
    });

    const text =
        clone.innerText ||
        clone.textContent ||
        '';

    return text
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 4000);
}


// -------------------------------
// Send website context to agent
// -------------------------------
function sendWebsiteContext() {

    if (!window.pageContext) {
        console.warn('No pageContext found');
        return;
    }

    try {

        const contextPayload = {
            page: window.pageContext.page,
            title: window.pageContext.title,
            url: window.location.href,
            data: window.pageContext.data,
            content: getPageContent()
        };

        console.log('Sending context:', contextPayload);

        // Hidden fields
        embeddedservice_bootstrap.prechatAPI
        .setHiddenPrechatFields({

            pageName: contextPayload.page,

            pageTitle: contextPayload.title,

            currentURL: contextPayload.url,

            pageData: JSON.stringify(contextPayload.data),

            websiteContent: contextPayload.content
        });

        console.log('✅ Website context sent');

    } catch (err) {

        console.error('❌ Failed sending context', err);
    }
}


// -------------------------------
// Initialize Agentforce
// -------------------------------
function initAgentforce() {

    const script = document.createElement('script');

    script.src =
    'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494/assets/js/bootstrap.min.js';

    script.onload = function () {

        try {

            embeddedservice_bootstrap.settings.language =
            'en_US';

            embeddedservice_bootstrap.settings.enablePrechat =
            true;

            embeddedservice_bootstrap.init(
                '00DgL00000AGQdV',
                'SIAA_Airlines_Agent',
                'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494',
                {
                    scrt2URL:
                    'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.salesforce-scrt.com'
                }
            );

            // Correct Agentforce event
            window.addEventListener(
                'onEmbeddedMessagingReady',
                () => {

                    console.log(
                        '✅ Agentforce Ready'
                    );

                    sendWebsiteContext();
                }
            );

        } catch (e) {

            console.error(
                'Agentforce Init Error:',
                e
            );
        }
    };

    script.onerror = function () {

        console.error(
            '❌ Failed loading Agentforce'
        );
    };

    document.body.appendChild(script);
}


// -------------------------------
// Start Agentforce
// -------------------------------
initAgentforce();
