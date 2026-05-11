// ===============================
// AGENTFORCE WEBSITE CONTEXT CHAT
// ===============================


// -------------------------------
// Extract visible page text
// -------------------------------
function getPageContent() {
    const contextDiv = document.getElementById('agent-context');
    if (contextDiv) return contextDiv.innerText.trim();

    const clone = document.body.cloneNode(true);
    ['script', 'style', 'nav', 'footer', 'header', 'noscript']
        .forEach(tag => clone.querySelectorAll(tag).forEach(el => el.remove()));
    return (clone.innerText || '').replace(/\s+/g, ' ').trim().substring(0, 1000);
}


// -------------------------------
// Build context string
// -------------------------------
function buildContextString() {
    const pageCtx = window.pageContext || {};
    return '[SYSTEM CONTEXT]\n' +
           'Page: '    + (pageCtx.title || document.title)      + '\n' +
           'URL: '     + window.location.href                    + '\n' +
           'Data: '    + JSON.stringify(pageCtx.data || {})      + '\n' +
           'Content: ' + getPageContent()                        + '\n' +
           '[END CONTEXT]\n' +
           'Use only the above to answer. Never say info is unavailable if it exists above.';
}


// -------------------------------
// Discover + log all bootstrap APIs
// -------------------------------
function logBootstrapAPIs() {
    console.log('--- Bootstrap API Discovery ---');
    const b = embeddedservice_bootstrap;
    console.log('Top-level keys:', Object.keys(b).join(', '));
    Object.keys(b).forEach(function(key) {
        try {
            if (b[key] && typeof b[key] === 'object') {
                const methods = Object.keys(b[key]).filter(k => typeof b[key][k] === 'function');
                if (methods.length) console.log(key + '() methods:', methods.join(', '));
            }
        } catch(e) {}
    });
    console.log('--- End Discovery ---');
}


// -------------------------------
// Try every known Salesforce API
// to send a message
// -------------------------------
function trySalesforceAPIs(text) {
    const b = embeddedservice_bootstrap;

    const attempts = [
        // Agentforce / MIAW APIs
        () => b.utilAPI.sendMessage(text),
        () => b.utilAPI.sendTextMessage(text),
        () => b.utilAPI.sendChatMessage(text),
        () => b.utilAPI.sendUserMessage(text),
        // Older Live Agent APIs
        () => b.liveAgentAPI.sendMessage(text),
        () => b.liveAgentAPI.sendUserMessage(text),
        // Message-specific APIs
        () => b.messageAPI.sendMessage(text),
        () => b.chatAPI.sendMessage(text),
        // Direct on bootstrap
        () => b.sendMessage(text),
        () => b.sendChatMessage(text),
    ];

    for (let i = 0; i < attempts.length; i++) {
        try {
            attempts[i]();
            console.log('✅ Context sent via method #' + (i + 1));
            return true;
        } catch(e) {
            // silently try next
        }
    }
    return false;
}


// -------------------------------
// postMessage to all iframes
// (works cross-origin)
// -------------------------------
function tryPostMessage(text) {
    console.log('📨 Trying postMessage to all iframes...');

    const iframes = document.querySelectorAll('iframe');
    const targets = [
        'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.site.com',
        'https://orgfarm-3a2cf22c1a-dev-ed.develop.my.salesforce-scrt.com',
        '*'  // fallback broadcast
    ];

    iframes.forEach(function(iframe, idx) {
        targets.forEach(function(origin) {
            try {
                iframe.contentWindow.postMessage({
                    type: 'EmbeddedMessaging.SendMessage',
                    message: text,
                    source: 'websiteContext'
                }, origin);
                console.log('📨 postMessage sent to iframe[' + idx + '] → ' + origin);
            } catch(e) {}
        });
    });

    // Also try posting to the parent Salesforce domain directly
    try {
        window.postMessage({ type: 'EmbeddedMessaging.SendMessage', message: text }, '*');
    } catch(e) {}
}


// -------------------------------
// Main injection function
// -------------------------------
function injectContext() {
    const text = buildContextString();
    console.log('📦 Context to inject:\n', text);

    // Step 1: try official Salesforce APIs
    const sent = trySalesforceAPIs(text);
    if (sent) return;

    // Step 2: try postMessage cross-origin
    tryPostMessage(text);

    // Step 3: log all APIs so we can identify the correct method
    console.warn('⚠️ Could not inject via API — see discovery below:');
    logBootstrapAPIs();
    console.warn('👆 Share the above with your developer to identify the correct send method.');
}


// -------------------------------
// Fire on conversation start
// -------------------------------
function injectContextOnConversationStart() {
    let injected = false;

    window.addEventListener('onEmbeddedMessagingConversationStarted', function () {
        if (injected) return;
        injected = true;
        console.log('💬 Conversation started — injecting context...');
        setTimeout(injectContext, 800);
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

            // Log all available APIs after 3s (once bootstrap fully loads)
            setTimeout(logBootstrapAPIs, 3000);

            window.addEventListener('onEmbeddedMessagingReady', function () {
                console.log('✅ Agentforce Ready');
                injectContextOnConversationStart();
            });

        } catch (e) {
            console.error('❌ Agentforce Init Error:', e);
        }
    };

    script.onerror = function () { console.error('❌ Failed to load bootstrap'); };
    document.body.appendChild(script);
}

initAgentforce();
