import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

const html = await readFile(new URL("../popup.html", import.meta.url), "utf8");
const script = await readFile(new URL("../popup.js", import.meta.url), "utf8");

async function renderPopup(result) {
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "chrome-extension://test/popup.html",
  });
  const { window } = dom;
  window.chrome = {
    tabs: {
      async query() {
        return [{ id: 9, url: "https://example.com/path" }];
      },
      async sendMessage() {
        return { siteDelay: 123 };
      },
    },
    runtime: {
      async sendMessage() {
        return result;
      },
      getManifest() {
        return { version: "1.5.0" };
      },
      openOptionsPage() {},
    },
    storage: {
      local: {
        async get(defaults) {
          return defaults;
        },
        async set() {},
      },
    },
  };

  window.eval(script);
  await new Promise((resolve) => setTimeout(resolve, 20));
  return dom;
}

test("renders country names, IP addresses, and node text without double escaping", async () => {
  const dom = await renderPopup({
    found: true,
    activeConnections: 1,
    siteCountry: "United States",
    siteCountryCode: "US",
    siteIp: "93.184.216.34",
    actualNode: "Node & One",
    node: "Node & One",
    nodeCountry: "Australia",
    nodeCountryCode: "AU",
    nodeIp: "1.1.1.1",
    countrySource: "api-ip",
    host: "example.com",
    rule: "MATCH",
    policy: "Auto",
    chains: ["Auto", "Node & One"],
    delay: 42,
    network: "tcp",
    type: "HTTPS",
    start: "2026-09-29T00:00:00Z",
  });

  const text = dom.window.document.querySelector("#result").textContent;
  assert.equal(
    dom.window.document.querySelector(".route-badge")?.textContent,
    "PROXY",
  );
  assert.equal(dom.window.document.querySelectorAll(".signal-card").length, 2);
  assert.match(text, /United States/);
  assert.match(text, /93\.184\.216\.34/);
  assert.match(text, /Australia/);
  assert.match(text, /1\.1\.1\.1/);
  assert.match(text, /Node & One/);
  assert.match(text, /123 ms/);
  assert.doesNotMatch(text, /&amp;/);
});

test("announces asynchronous status changes to assistive technology", async () => {
  const dom = await renderPopup({
    found: false,
    activeConnections: 0,
    chains: [],
  });
  const status = dom.window.document.querySelector("#status");
  assert.equal(status.getAttribute("role"), "status");
  assert.equal(status.getAttribute("aria-live"), "polite");
});
