(() => {
  let box;

  function siteDelay() {
    const nav = performance.getEntriesByType("navigation")[0];
    return nav && nav.responseEnd > 0
      ? Math.round(nav.responseEnd - nav.startTime)
      : null;
  }
  function render(data) {
    if (!data || data.error) return;
    if (!box) {
      box = document.createElement("div");
      box.id = "proxy-chain-helper";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      const indicator = document.createElement("span");
      indicator.className = "pch-indicator";
      const content = document.createElement("span");
      content.className = "pch-content";
      const title = document.createElement("strong");
      const meta = document.createElement("small");
      content.append(title, meta);
      const close = document.createElement("button");
      close.type = "button";
      close.title = "收起代理链信息";
      close.setAttribute("aria-label", close.title);
      close.textContent = "×";
      close.onclick = () => box.classList.add("pch-hidden");
      box.onclick = (event) => {
        if (box.classList.contains("pch-hidden") && event.target !== close) {
          box.classList.remove("pch-hidden");
        }
      };
      box.append(indicator, content, close);
      document.documentElement.appendChild(box);
    }
    const direct = !data.found || data.node === "DIRECT";
    const site =
      data.siteDelay == null ? "站点：—" : `站点：${data.siteDelay} ms`;
    const node = data.delay == null ? "节点：—" : `节点：${data.delay} ms`;
    box.dataset.state = direct ? "direct" : "proxy";
    box.querySelector(".pch-indicator").textContent = direct
      ? "直"
      : data.nodeCountryCode || "代";
    box.querySelector("strong").textContent = direct
      ? "直连"
      : data.chainLabel || data.node || "代理";
    box.querySelector("small").textContent = `${node} · ${site}`;
    box.style.left = "";
    box.style.right = "";
    box.style.bottom = "";
    const side = window.__pchSide || "right";
    box.style[side] = "14px";
    box.style.bottom = "14px";
  }
  chrome.runtime.onMessage.addListener((m, _s, sendResponse) => {
    if (m.type === "overlayResult") render(m.data);
    if (m.type === "getSiteDelay") {
      sendResponse({ siteDelay: siteDelay() });
      return true;
    }
  });
  chrome.runtime
    .sendMessage({ type: "overlayConfig" })
    .then((c) => {
      if (!c?.overlayEnabled) return;
      window.__pchSide = c.overlaySide || "right";
      chrome.runtime
        .sendMessage({
          type: "inspect",
          target: location.hostname,
          siteDelay: siteDelay(),
        })
        .then(render)
        .catch(() => {});
    })
    .catch(() => {});
})();
