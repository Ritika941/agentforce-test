// ===============================
// AGENTFORCE WEBSITE CONTEXT CHAT
// ===============================


// -------------------------------
// Extract visible page text
// -------------------------------
function getPageContent() {
    const clone = document.body.cloneNode(true);

    ['script', 'style', 'nav', 'footer', 'header', 'noscript']
        .forEach(tag => {
            clone.querySelectorAll(tag).forEach(el => el.remove());
        });

    const text = clone.innerText || clone.textContent || '';
    return text.replace(/\s+/g, ' ').trim().substring(0, 1500);
}


// -------------------------------
// Build context string from page
// -------------------------------
function buildContextString() {
    const pageCtx = window.pageContext || {};
    const data    = pageCtx.data    || {};
    const content = getPageContent();

    return [
        `[SYSTEM CONTEXT - not typed by user, do not show this to user]`,
        `Page     : ${pageCtx.title || document.title}`,
        `URL      : ${window.location.href}`,
        `Data     : ${JSON.stringify(data)}`,
        `Content  : ${content}`,
        `[END CONTEXT]`,
        ``,
        `Use the above context to answer all user questions on this page.`,
        `If flight data, prices, or routes are present — answer from them directly.`,
        `Never say you cannot find information if it exists in the context above.`
    ].join('\n');
}


// -------------------------------
// Inject context when chat opens
// -------------------------------
function injectContextOnConversationStart() {
    let injected = false;

    window.addEventListener('onEmbeddedMessagingConversationStarted', function () {
        if (injected) return;
        injected = true;

        console.log('💬 Conversation started — injecting context...');

        const contextString = buildContextString();
        console.log('📦 Context to inject:\n', contextString);

        // Small delay to ensure channel is fully ready
        setTimeout(function () {
            try {
                embeddedservice_bootstrap.utilAPI.sendMessage(contextString);
                console.log('✅ Context injected via sendMessage');
            } catch (e) {
                console.warn('⚠️ sendMessage failed — trying liveAgentAPI...', e);

                // Secondary fallback
                try {
                    embeddedservice_bootstrap.liveAgentAPI.sendMessage(contextString);
                    console.log('✅ Context injected via liveAgentAPI');
                } catch (e2) {
                    console.error('❌ Both sendMessage methods failed:', e2);
                }
            }
        }, 800);
    });
}


// -------------------------------
// Stub — prevents HTML crash
// -------------------------------
function loadPageData() {
    console.log('loadPageData called. Page context:', window.pageContext);
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
            embeddedservice_bootstrap.settings.language      = 'en_US';
            embeddedservice_bootstrap.settings.enablePrechat = true;

            embeddedservice_bootstrap.init(
                '00DgL00000AGQdV',
                'SIAA_Airlines_Agent',
                'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494',
                {
                    scrt2URL: 'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.salesforce-scrt.com'
                }
            );

            window.addEventListener('onEmbeddedMessagingReady', function () {
                console.log('✅ Agentforce Ready');

                // Register conversation start listener
                // so context is injected the moment user opens chat
                injectContextOnConversationStart();
            });

        } catch (e) {
            console.error('❌ Agentforce Init Error:', e);
        }
    };

    script.onerror = function () {
        console.error('❌ Failed to load Agentforce bootstrap script');
    };

    document.body.appendChild(script);
}


// -------------------------------
// Start
// -------------------------------
initAgentforce();
