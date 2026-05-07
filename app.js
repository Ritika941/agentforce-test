function loadPageData() {
  const ctx = window.pageContext;

  if (!ctx) return;

  const container = document.getElementById(`${ctx.page}-data`);
  if (container) {
    container.innerHTML = `
      <pre>${JSON.stringify(ctx.data, null, 2)}</pre>
    `;
  }

  sendContextToAgent(ctx);
}


// 🔥 SEND DATA TO SALESFORCE
function sendContextToAgent(context) {

  // Wait until Salesforce widget loads
  if (!window.embeddedservice_bootstrap) {
    setTimeout(() => sendContextToAgent(context), 1000);
    return;
  }

  try {
    embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
      pageName: context.page,
      pageTitle: context.title,
      pageData: JSON.stringify(context.data)
    });

    console.log("✅ Context sent:", context);

  } catch (e) {
    console.error("❌ Error sending context", e);
  }
}


// 🔄 OPTIONAL REAL-TIME UPDATE
function updateContext(newData) {
  if (!window.pageContext) return;

  window.pageContext.data = newData;
  sendContextToAgent(window.pageContext);
}