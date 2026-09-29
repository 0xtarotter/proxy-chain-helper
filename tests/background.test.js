import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(
  new URL("../background.js", import.meta.url),
  "utf8",
);

function response(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return data;
    },
  };
}

function createHarness(fetchImpl) {
  let listener;
  const chrome = {
    storage: {
      local: {
        async get(defaults) {
          return {
            ...defaults,
            controller: "http://controller.test:9090",
            timeout: 1000,
          };
        },
      },
    },
    runtime: {
      onMessage: {
        addListener(fn) {
          listener = fn;
        },
      },
    },
    action: {
      async setBadgeText() {},
      async setBadgeBackgroundColor() {},
      async setTitle() {},
    },
    tabs: {
      async sendMessage() {},
    },
  };

  vm.runInNewContext(source, {
    AbortSignal,
    URL,
    Intl,
    Map,
    Set,
    Date,
    RegExp,
    String,
    Number,
    Object,
    Array,
    Boolean,
    Error,
    Promise,
    encodeURIComponent,
    chrome,
    fetch: fetchImpl,
  });

  return {
    invoke(message, sender = { tab: { id: 7 } }) {
      return new Promise((resolve) => {
        assert.equal(listener(message, sender, resolve), true);
      });
    },
  };
}

test("uses destination IP for the site and proxy server IP for the node", async () => {
  const urls = [];
  const harness = createHarness(async (input) => {
    const url = String(input);
    urls.push(url);
    if (url.endsWith("/connections")) {
      return response({
        connections: [
          {
            metadata: {
              host: "example.com",
              destinationIP: "93.184.216.34",
            },
            chains: ["Auto", "Node A"],
            start: "2026-09-29T00:00:00Z",
          },
        ],
      });
    }
    if (url.endsWith("/proxies")) {
      return response({
        proxies: {
          Auto: { type: "Selector", now: "Node A" },
          "Node A": { type: "VLESS", server: "1.1.1.1" },
        },
      });
    }
    if (url.includes("/proxies/Auto")) {
      return response({ type: "Selector", now: "Node A" });
    }
    if (url.includes("/proxies/Node%20A/delay")) return response({ delay: 42 });
    if (url.includes("/proxies/Node%20A")) {
      return response({ type: "VLESS", server: "1.1.1.1" });
    }
    if (url.includes("cloudflare-dns.com") || url.includes("dns.google")) {
      return response({ Answer: [{ data: "93.184.216.34" }] });
    }
    if (url.includes("93.184.216.34")) {
      return response({ country_code: "US", country_name: "United States" });
    }
    if (url.includes("1.1.1.1")) {
      return response({ country_code: "AU", country_name: "Australia" });
    }
    throw new Error(`Unexpected URL: ${url}`);
  });

  const result = await harness.invoke({
    type: "inspect",
    target: "example.com",
  });

  assert.equal(result.siteIp, "93.184.216.34");
  assert.equal(result.siteCountryCode, "US");
  assert.equal(result.nodeIp, "1.1.1.1");
  assert.equal(result.nodeCountryCode, "AU");
  assert.equal(urls.filter((url) => url.endsWith("/proxies")).length, 1);
  assert.equal(
    urls.some((url) => url.includes("cloudflare-dns.com")),
    false,
  );
  assert.equal(
    urls.some((url) => url.includes("dns.google")),
    false,
  );
});

test("coalesces concurrent inspections for the same target", async () => {
  let connectionRequests = 0;
  const harness = createHarness(async (input) => {
    const url = String(input);
    if (url.endsWith("/connections")) {
      connectionRequests += 1;
      await new Promise((resolve) => setTimeout(resolve, 25));
      return response({ connections: [] });
    }
    if (url.includes("cloudflare-dns.com")) return response({ Answer: [] });
    if (url.includes("dns.google")) return response({ Answer: [] });
    throw new Error(`Unexpected URL: ${url}`);
  });

  await Promise.all([
    harness.invoke({ type: "inspect", target: "example.com" }),
    harness.invoke({ type: "inspect", target: "example.com" }),
  ]);

  assert.equal(connectionRequests, 1);
});

test("does not send private addresses to public GeoIP providers", async () => {
  const urls = [];
  const harness = createHarness(async (input) => {
    const url = String(input);
    urls.push(url);
    if (url.endsWith("/connections")) return response({ connections: [] });
    if (url.includes("cloudflare-dns.com")) {
      return response({ Answer: [{ data: "192.168.1.2" }] });
    }
    if (url.includes("dns.google")) return response({ Answer: [] });
    if (url.includes("ipapi.co") || url.includes("ipwho.is")) {
      return response({ country_code: "US", country_name: "United States" });
    }
    throw new Error(`Unexpected URL: ${url}`);
  });

  const result = await harness.invoke({
    type: "inspect",
    target: "router.lan",
  });

  assert.equal(result.siteCountry, "");
  assert.equal(
    urls.some((url) => url.includes("ipapi.co/192.168.1.2")),
    false,
  );
  assert.equal(
    urls.some((url) => url.includes("ipwho.is/192.168.1.2")),
    false,
  );
});

test("rejects invalid inspection targets before controller access", async () => {
  let calls = 0;
  const harness = createHarness(async () => {
    calls += 1;
    return response({ connections: [] });
  });

  const result = await harness.invoke({
    type: "inspect",
    target: "../connections?x=1",
  });

  assert.match(result.error, /域名|目标/);
  assert.equal(calls, 0);
});
