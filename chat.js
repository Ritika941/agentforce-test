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
        `[SYSTEM CONTEXT]`,
        `Page    : ${pageCtx.title || document.title}`,
        `URL     : ${window.location.href}`,
        `Data    : ${JSON.stringify(data)}`,
        `Content : ${content}`,
        `[END CONTEXT]`,
        `Use the above to answer all user questions. Never say information is unavailable if it exists above.`
    ].join('\n');
}


// -------------------------------
// Log ALL available APIs
// (run this to discover what exists)
// -------------------------------
function logAvailableAPIs() {
    console.log('=== Agentforce Bootstrap API Discovery ===');
    console.log('embeddedservice_bootstrap keys:', Object.keys(embeddedservice_bootstrap));

    if (embeddedservice_bootstrap.utilAPI) {
        console.log('utilAPI keys:', Object.keys(embeddedservice_bootstrap.utilAPI));
    } else {
        console.warn('utilAPI: NOT available');
    }

    if (embeddedservice_bootstrap.prechatAPI) {
        console.log('prechatAPI keys:', Object.keys(embeddedservice_bootstrap.prechatAPI));
    } else {
        console.warn('prechatAPI: NOT available');
    }

    if (embeddedservice_bootstrap.liveAgentAPI) {
        console.log('liveAgentAPI keys:', Object.keys(embeddedservice_bootstrap.liveAgentAPI));
    } else {
        console.warn('liveAgentAPI: NOT available');
    }
}


// -------------------------------
// Try every known send method
// -------------------------------
function trySendMessage(text) {
    const api = embeddedservice_bootstrap;

    // Method 1 - utilAPI.sendMessage
    if (api.utilAPI && typeof api.utilAPI.sendMessage === 'function') {
        console.log('Using: utilAPI.sendMessage');
        api.utilAPI.sendMessage(text);
        return true;
    }

    // Method 2 - utilAPI.sendTextMessage
    if (api.utilAPI && typeof api.utilAPI.sendTextMessage === 'function') {
        console.log('Using: utilAPI.sendTextMessage');
        api.utilAPI.sendTextMessage(text);
        return true;
    }

    // Method 3 - messageAPI.sendMessage
    if (api.messageAPI && typeof api.messageAPI.sendMessage === 'function') {
        console.log('Using: messageAPI.sendMessage');
        api.messageAPI.sendMessage(text);
        return true;
    }

    // Method 4 - chatAPI.sendMessage
    if (api.chatAPI && typeof api.chatAPI.sendMessage === 'function') {
        console.log('Using: chatAPI.sendMessage');
        api.chatAPI.sendMessage(text);
        return true;
    }

    // Method 5 - direct on bootstrap
    if (typeof api.sendMessage === 'function') {
        console.log('Using: embeddedservice_bootstrap.sendMessage');
        api.sendMessage(text);
        return true;
    }

    console.error('❌ No sendMessage method found. Available API dump:');
    logAvailableAPIs();
    return false;
}


// -------------------------------
// Inject context via iframe DOM
// (ultimate fallback — directly
//  types into the chat input)
// -------------------------------
function injectViaIframe(text) {
    console.log('🔁 Trying iframe DOM injection fallback...');

    const findChatInput = setInterval(function () {
        const iframes = document.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
            try {
                const doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
                if (!doc) continue;

                // Look for textarea or input in the chat iframe
                const input = doc.querySelector('textarea, input[type="text"]');
                if (input) {
                    clearInterval(findChatInput);
                    console.log('✅ Found chat input in iframe');

                    // Set value and dispatch events so the framework picks it up
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLTextAreaElement.prototype, 'value'
                    ) || Object.getOwnPropertyDescriptor(
                        iframes[i].contentWindow.HTMLTextAreaElement.prototype, 'value'
                    );

                    if (nativeInputValueSetter && nativeInputValueSetter.set) {
                        nativeInputValueSetter.set.call(input, text);
                    } else {
                        input.value = text;
                    }

                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));

                    // Auto-submit after short delay
                    setTimeout(function () {
                        const sendBtn = doc.querySelector('button[title*="Send"], button[aria-label*="Send"], button[type="submit"]');
                        if (sendBtn) {
                            sendBtn.click();
                            console.log('✅ Context submitted via iframe send button');
                        } else {
                            // Simulate Enter key
                            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                            console.log('✅ Context submitted via Enter key');
                        }
                    }, 500);

                    return;
                }
            } catch (e) {
                // Cross-origin iframe — can't access DOM
                console.warn('⚠️ Cannot access iframe DOM (cross-origin):', e.message);
                clearInterval(findChatInput);
                console.error('❌ All injection methods exhausted. See API discovery above.');
            }
        }
    }, 300);

    // Stop trying after 5 seconds
    setTimeout(function () { clearInterval(findChatInput); }, 5000);
}


// -------------------------------
// Main injection on chat open
// -------------------------------
function injectContextOnConversationStart() {
    let injected = false;

    window.addEventListener('onEmbeddedMessagingConversationStarted', function () {
        if (injected) return;
        injected = true;

        console.log('💬 Conversation started — discovering APIs...');
        logAvailableAPIs(); // 👈 shows exactly what your bootstrap exposes

        const contextString = buildContextString();
        console.log('📦 Context to inject:\n', contextString);

        setTimeout(function () {
            const sent = trySendMessage(contextString);
            if (!sent) {
                injectViaIframe(contextString);
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
