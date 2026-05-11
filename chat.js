// ===============================
// AGENTFORCE WEBSITE CONTEXT CHAT
// ===============================


// -------------------------------
// Extract visible page text
// -------------------------------
function getPageContent() {
    const clone = document.body.cloneNode(true);
    ['script', 'style', 'nav', 'footer', 'header', 'noscript']
        .forEach(tag => clone.querySelectorAll(tag).forEach(el => el.remove()));
    return (clone.innerText || clone.textContent || '')
        .replace(/\s+/g, ' ').trim().substring(0, 1000);
}


// -------------------------------
// Build context string
// -------------------------------
function buildContextString() {
    const pageCtx = window.pageContext || {};
    return `[SYSTEM CONTEXT]\n` +
           `Page: ${pageCtx.title || document.title}\n` +
           `URL: ${window.location.href}\n` +
           `Data: ${JSON.stringify(pageCtx.data || {})}\n` +
           `Content: ${getPageContent()}\n` +
           `[END CONTEXT]\n` +
           `Use only the above to answer user questions. Do not say information is unavailable if it exists above.`;
}


// -------------------------------
// Type into chat iframe and submit
// -------------------------------
function injectContextViaIframe() {
    console.log('🔁 Starting iframe injection...');

    let attempts = 0;

    const interval = setInterval(function () {
        attempts++;

        // Give up after 10 seconds
        if (attempts > 33) {
            clearInterval(interval);
            console.error('❌ Could not find chat input after 10s');
            return;
        }

        // Search all iframes on the page
        const iframes = document.querySelectorAll('iframe');
        console.log(`🔍 Attempt ${attempts}: found ${iframes.length} iframe(s)`);

        for (let i = 0; i < iframes.length; i++) {
            let doc;
            try {
                doc = iframes[i].contentDocument || iframes[i].contentWindow.document;
            } catch (e) {
                console.warn(`⚠️ iframe[${i}] is cross-origin — cannot access DOM`);
                continue;
            }

            if (!doc) continue;

            // Find the text input inside the chat
            const input = doc.querySelector(
                'textarea, input[type="text"], [contenteditable="true"]'
            );

            if (!input) continue;

            clearInterval(interval);
            console.log(`✅ Found chat input in iframe[${i}]`);

            const context = buildContextString();

            // Set value using native setter (works with React/LWC frameworks)
            try {
                const proto = iframes[i].contentWindow.HTMLTextAreaElement?.prototype
                           || iframes[i].contentWindow.HTMLInputElement?.prototype;
                const setter = proto
                    ? Object.getOwnPropertyDescriptor(proto, 'value')?.set
                    : null;

                if (setter) {
                    setter.call(input, context);
                } else {
                    input.value = context;
                }
            } catch (e) {
                input.value = context;
            }

            // Trigger input events so the framework registers the value
            input.dispatchEvent(new Event('focus',  { bubbles: true }));
            input.dispatchEvent(new Event('input',  { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

            // Submit after short delay
            setTimeout(function () {
                // Try clicking the Send button first
                const sendBtn = doc.querySelector(
                    'button[title*="Send"], button[aria-label*="Send"], ' +
                    'button[type="submit"], button.send-button, ' +
                    '[data-key="send"], button[name="send"]'
                );

                if (sendBtn) {
                    sendBtn.click();
                    console.log('✅ Context submitted via Send button');
                } else {
                    // Fallback — simulate Enter key
                    input.dispatchEvent(new KeyboardEvent('keydown', {
                        key: 'Enter', keyCode: 13, bubbles: true, cancelable: true
                    }));
                    input.dispatchEvent(new KeyboardEvent('keyup', {
                        key: 'Enter', keyCode: 13, bubbles: true
                    }));
                    console.log('✅ Context submitted via Enter key');
                }
            }, 600);

            return; // found and handled
        }

    }, 300);
}


// -------------------------------
// Trigger injection when chat opens
// -------------------------------
function injectContextOnConversationStart() {
    let injected = false;

    window.addEventListener('onEmbeddedMessagingConversationStarted', function () {
        if (injected) return;
        injected = true;
        console.log('💬 Conversation started — injecting page context via iframe...');
        // Wait for iframe to fully render before injecting
        setTimeout(injectContextViaIframe, 1000);
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
    script.src = 'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494/assets/js/bootstrap.min.js';

    script.onload = function () {
        try {
            embeddedservice_bootstrap.settings.language      = 'en_US';
            embeddedservice_bootstrap.settings.enablePrechat = true;

            embeddedservice_bootstrap.init(
                '00DgL00000AGQdV',
                'SIAA_Airlines_Agent',
                'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com/ESWSIAAAirlinesAgent1757863514494',
                { scrt2URL: 'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.salesforce-scrt.com' }
            );

            window.addEventListener('onEmbeddedMessagingReady', function () {
    console.log('✅ Agentforce Ready');

    // Debug — log every single event that fires
    const allEvents = [
        'onEmbeddedMessagingReady',
        'onEmbeddedMessagingConversationStarted',
        'onEmbeddedMessagingInitialized',
        'onEmbeddedMessagingChatEstablished',
        'onEmbeddedMessagingConversationCreated',
        'onEmbeddedMessagingBeforeConversationStarted'
    ];

    allEvents.forEach(function(eventName) {
        window.addEventListener(eventName, function() {
            console.log('🔔 Event fired:', eventName);
        });
    });

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
