const DEFAULTS = {
  controller: "",
  secret: "",
  timeout: 3000,
  overlayEnabled: true,
  overlaySide: "right",
};
const tabSiteDelays = new Map(),
  geoCache = new Map(),
  dnsCache = new Map(),
  inspectCache = new Map(),
  inspectInflight = new Map();
const CACHE_TTL = 300000;
const INSPECT_CACHE_TTL = 2000;
const flagIconCache = new Map();
const DEFAULT_ACTION_ICON = {
  16: "icons/icon16.svg",
  32: "icons/icon32.svg",
};
function cached(map, key) {
  const x = map.get(key);
  if (!x) return { hit: false, value: null };
  if (Date.now() - x.time >= (x.ttl ?? CACHE_TTL)) {
    map.delete(key);
    return { hit: false, value: null };
  }
  return { hit: true, value: x.value };
}
const ISO_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );
const countryNames = {
  hk: "Hong Kong",
  tw: "Taiwan",
  jp: "Japan",
  sg: "Singapore",
  us: "United States",
  gb: "United Kingdom",
  de: "Germany",
  fr: "France",
  kr: "South Korea",
  ca: "Canada",
  au: "Australia",
  nl: "Netherlands",
  tr: "Türkiye",
  in: "India",
  ru: "Russia",
  ch: "Switzerland",
  br: "Brazil",
  my: "Malaysia",
};
const aliases = {
  ad: ["安道尔", "安道爾", "andorra"],
  ae: ["阿联酋", "阿聯酋", "阿拉伯联合酋长国", "united arab emirates", "uae"],
  af: ["阿富汗", "afghanistan"],
  al: ["阿尔巴尼亚", "阿爾巴尼亞", "albania"],
  am: ["亚美尼亚", "亞美尼亞", "armenia"],
  ao: ["安哥拉", "angola"],
  ar: ["阿根廷", "argentina"],
  at: ["奥地利", "奧地利", "austria"],
  au: ["澳大利亚", "澳大利亞", "澳洲", "australia", "sydney", "melbourne"],
  az: ["阿塞拜疆", "亞塞拜然", "azerbaijan"],
  ba: ["波黑", "波斯尼亚", "波斯尼亞", "bosnia", "sarajevo"],
  bd: ["孟加拉", "bangladesh"],
  be: ["比利时", "比利時", "belgium"],
  bg: ["保加利亚", "保加利亞", "bulgaria"],
  bh: ["巴林", "bahrain"],
  br: ["巴西", "brazil"],
  by: ["白俄罗斯", "白俄羅斯", "belarus"],
  bz: ["伯利兹", "伯利茲", "belize"],
  ca: ["加拿大", "canada", "toronto", "vancouver"],
  ch: ["瑞士", "switzerland", "zurich"],
  cl: ["智利", "chile"],
  cn: ["中国", "中國", "china", "beijing", "shanghai"],
  co: ["哥伦比亚", "哥倫比亞", "colombia"],
  cr: ["哥斯达黎加", "哥斯達黎加", "costa rica"],
  cy: ["塞浦路斯", "賽普勒斯", "cyprus"],
  cz: ["捷克", "czechia", "czech republic"],
  de: ["德国", "德國", "germany", "frankfurt", "berlin"],
  dk: ["丹麦", "丹麥", "denmark"],
  do: ["多米尼加", "dominican republic"],
  dz: ["阿尔及利亚", "阿爾及利亞", "algeria"],
  ec: ["厄瓜多尔", "厄瓜多爾", "ecuador"],
  ee: ["爱沙尼亚", "愛沙尼亞", "estonia"],
  eg: ["埃及", "egypt"],
  es: ["西班牙", "spain", "madrid"],
  fi: ["芬兰", "芬蘭", "finland"],
  fj: ["斐济", "斐濟", "fiji"],
  fr: ["法国", "法國", "france", "paris"],
  gb: ["英国", "英國", "united kingdom", "uk", "london"],
  ge: ["格鲁吉亚", "格魯吉亞", "georgia"],
  gh: ["加纳", "加納", "ghana"],
  gr: ["希腊", "希臘", "greece"],
  hk: ["香港", "hong kong"],
  hr: ["克罗地亚", "克羅地亞", "croatia"],
  hu: ["匈牙利", "hungary"],
  id: ["印度尼西亚", "印度尼西亞", "印尼", "indonesia", "jakarta"],
  ie: ["爱尔兰", "愛爾蘭", "ireland"],
  il: ["以色列", "israel"],
  in: ["印度", "india", "mumbai", "delhi"],
  ir: ["伊朗", "iran"],
  is: ["冰岛", "冰島", "iceland"],
  it: ["意大利", "義大利", "italy", "rome", "milan"],
  jm: ["牙买加", "牙買加", "jamaica"],
  jo: ["约旦", "約旦", "jordan"],
  jp: ["日本", "japan", "东京", "東京", "tokyo"],
  ke: ["肯尼亚", "肯亞", "kenya"],
  kh: ["柬埔寨", "cambodia"],
  kz: ["哈萨克斯坦", "哈薩克斯坦", "kazakhstan"],
  la: ["老挝", "寮國", "laos"],
  lb: ["黎巴嫩", "lebanon"],
  lk: ["斯里兰卡", "斯里蘭卡", "sri lanka"],
  lt: ["立陶宛", "lithuania"],
  lu: ["卢森堡", "盧森堡", "luxembourg"],
  lv: ["拉脱维亚", "拉脫維亞", "latvia"],
  ma: ["摩洛哥", "morocco"],
  mc: ["摩纳哥", "摩納哥", "monaco"],
  md: ["摩尔多瓦", "摩爾多瓦", "moldova"],
  me: ["黑山", "montenegro"],
  mg: ["马达加斯加", "馬達加斯加", "madagascar"],
  mk: ["北马其顿", "北馬其頓", "north macedonia"],
  ml: ["马里", "馬里", "mali"],
  mn: ["蒙古", "mongolia"],
  mo: ["澳门", "澳門", "macau", "macao"],
  mt: ["马耳他", "馬耳他", "malta"],
  mu: ["毛里求斯", "模里西斯", "mauritius"],
  mv: ["马尔代夫", "馬爾地夫", "maldives"],
  mw: ["马拉维", "馬拉威", "malawi"],
  mx: ["墨西哥", "mexico"],
  my: [
    "马来西亚",
    "馬來西亞",
    "马来",
    "馬來",
    "malaysia",
    "kuala lumpur",
    "kl",
  ],
  mz: ["莫桑比克", "莫三比克", "mozambique"],
  na: ["纳米比亚", "納米比亞", "namibia"],
  ng: ["尼日利亚", "奈及利亞", "nigeria"],
  ni: ["尼加拉瓜", "nicaragua"],
  nl: ["荷兰", "荷蘭", "netherlands", "amsterdam"],
  no: ["挪威", "norway"],
  np: ["尼泊尔", "尼泊爾", "nepal"],
  nz: ["新西兰", "紐西蘭", "new zealand", "auckland"],
  om: ["阿曼", "oman"],
  pa: ["巴拿马", "巴拿馬", "panama"],
  pe: ["秘鲁", "秘魯", "peru"],
  ph: ["菲律宾", "菲律賓", "philippines", "manila"],
  pk: ["巴基斯坦", "pakistan"],
  pl: ["波兰", "波蘭", "poland"],
  pt: ["葡萄牙", "portugal"],
  qa: ["卡塔尔", "卡達", "qatar"],
  ro: ["罗马尼亚", "羅馬尼亞", "romania"],
  rs: ["塞尔维亚", "塞爾維亞", "serbia"],
  sa: ["沙特", "沙烏地阿拉伯", "saudi arabia"],
  se: ["瑞典", "sweden"],
  sg: ["新加坡", "singapore"],
  si: ["斯洛文尼亚", "斯洛維尼亞", "slovenia"],
  sk: ["斯洛伐克", "slovakia"],
  sn: ["塞内加尔", "塞內加爾", "senegal"],
  th: ["泰国", "泰國", "thailand", "bangkok"],
  tj: ["塔吉克斯坦", "塔吉克", "tajikistan"],
  tn: ["突尼斯", "突尼斯", "tunisia"],
  tr: ["土耳其", "turkey", "türkiye"],
  tw: ["台湾", "台灣", "臺灣", "taiwan", "台北", "臺北", "taipei"],
  tz: ["坦桑尼亚", "坦尚尼亞", "tanzania"],
  ua: ["乌克兰", "烏克蘭", "ukraine"],
  ug: ["乌干达", "烏干達", "uganda"],
  us: [
    "美国",
    "美國",
    "美",
    "united states",
    "usa",
    "los angeles",
    "new york",
    "chicago",
  ],
  uy: ["乌拉圭", "烏拉圭", "uruguay"],
  uz: ["乌兹别克斯坦", "烏茲別克斯坦", "uzbekistan"],
  ve: ["委内瑞拉", "委內瑞拉", "venezuela"],
  vn: ["越南", "vietnam", "hanoi", "ho chi minh"],
  za: ["南非", "south africa", "johannesburg"],
  zm: ["赞比亚", "贊比亞", "zambia"],
  zw: ["津巴布韦", "辛巴威", "zimbabwe"],
};
for (const code of ISO_CODES) {
  if (!countryNames[code.toLowerCase()]) {
    try {
      countryNames[code.toLowerCase()] =
        new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
    } catch {
      countryNames[code.toLowerCase()] = code;
    }
  }
}
function fullCountry(code, fallback = "") {
  return countryNames[String(code || "").toLowerCase()] || fallback || "";
}
function countryFor(value) {
  const s = String(value || "")
    .toLowerCase()
    .trim();
  const candidates = [];
  for (const code of ISO_CODES) {
    const c = code.toLowerCase();
    const words = aliases[c] || [];
    for (const word of words) {
      const w = word.toLowerCase();
      const isLatin = /^[a-z][a-z .'-]*$/.test(w);
      const re = isLatin
        ? new RegExp(
            `(?:^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-z])`,
          )
        : new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      if (re.test(s)) candidates.push({ code: c, score: w.length + 100 });
    }
    const re = new RegExp(`(?:^|[^a-z])${c}(?:$|[^a-z])`);
    if (re.test(s)) candidates.push({ code: c, score: 50 });
  }
  candidates.sort((a, b) => b.score - a.score);
  const code = candidates[0]?.code || "";
  return {
    code,
    country: fullCountry(code),
    source: code ? "node-name" : "unknown",
  };
}
async function config() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}
function baseUrl(value) {
  const u = new URL(value.trim());
  if (!["http:", "https:"].includes(u.protocol))
    throw Error("控制器地址必须使用 HTTP 或 HTTPS");
  return u.origin + u.pathname.replace(/\/$/, "");
}
async function request(path, settings) {
  const c = settings || (await config());
  if (!c.controller) throw Error("尚未配置 OpenClash/Mihomo 控制器地址");
  const h = { Accept: "application/json" };
  if (c.secret) h.Authorization = `Bearer ${c.secret}`;
  const r = await fetch(`${baseUrl(c.controller)}${path}`, {
    headers: h,
    signal: AbortSignal.timeout(Number(c.timeout) || 3000),
  });
  if (!r.ok) throw Error(`控制器返回 HTTP ${r.status}`);
  return r.json();
}
function hostOf(c) {
  const m = c.metadata || {};
  return String(m.host || m.destination || c.host || m.remoteDestination || "")
    .toLowerCase()
    .replace(/\.$/, "");
}
function matches(h, t) {
  return Boolean(h) && (h === t || h.endsWith(`.${t}`) || t.endsWith(`.${h}`));
}
function normalizeTarget(value) {
  const target = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");
  if (!target || target.length > 253 || /[\s/?#@]/.test(target)) {
    throw Error("检测目标必须是有效域名或 IP 地址");
  }
  if (ipFrom(target)) return target;
  if (
    !target
      .split(".")
      .every(
        (label) =>
          label.length > 0 &&
          label.length <= 63 &&
          /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
      )
  ) {
    throw Error("检测目标必须是有效域名或 IP 地址");
  }
  return target;
}
function parseIpv4(value) {
  const match = String(value).match(
    /(?:^|[^\d])((?:\d{1,3}\.){3}\d{1,3})(?!\d)/,
  );
  if (!match) return null;
  const parts = match[1].split(".").map(Number);
  return parts.every((part) => part >= 0 && part <= 255)
    ? { address: match[1], parts }
    : null;
}
function ipFrom(v) {
  const s = String(v || "");
  const ipv4 = parseIpv4(s);
  if (ipv4) return ipv4.address;
  return (
    s.match(/(?<![\w:])(?:[0-9a-f]{1,4}:){2,7}[0-9a-f]{1,4}(?![\w])/i)?.[0] ||
    ""
  );
}
function siteIps(connection) {
  return [
    ...new Set(
      [
        connection?.metadata?.destinationIP,
        connection?.metadata?.remoteIP,
        connection?.metadata?.remoteAddress,
        connection?.remoteIP,
      ]
        .map(ipFrom)
        .filter(Boolean),
    ),
  ];
}
function nodeIps(proxy) {
  return [
    ...new Set(
      [proxy?.server, proxy?.address, proxy?.servername]
        .map(ipFrom)
        .filter(Boolean),
    ),
  ];
}
function isPublicIp(ip) {
  const ipv4 = parseIpv4(ip);
  if (ipv4) {
    const [a, b, c] = ipv4.parts;
    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113)
    )
      return false;
    return true;
  }
  const value = String(ip).toLowerCase();
  return (
    Boolean(value) &&
    value !== "::" &&
    value !== "::1" &&
    !/^f[cd]/.test(value) &&
    !/^fe[89ab]/.test(value)
  );
}
async function geo(ip) {
  if (!isPublicIp(ip)) return null;
  const cachedGeo = cached(geoCache, ip);
  if (cachedGeo.hit) return cachedGeo.value;
  let result = null;
  try {
    const r = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: AbortSignal.timeout(2200),
    });
    if (r.ok) {
      const d = await r.json();
      if (d.country_code)
        result = {
          ip,
          country: fullCountry(d.country_code, d.country_name || ""),
          code: String(d.country_code).toLowerCase(),
        };
    }
  } catch {}
  if (!result)
    try {
      const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
        signal: AbortSignal.timeout(2200),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.success !== false && d.country_code)
          result = {
            ip,
            country: fullCountry(d.country_code, d.country || ""),
            code: String(d.country_code).toLowerCase(),
          };
      }
    } catch {}
  geoCache.set(ip, { time: Date.now(), value: result });
  return result;
}
async function resolveSiteIps(host) {
  if (!host) return [];
  if (ipFrom(host)) return [ipFrom(host)];
  const cachedDns = cached(dnsCache, host);
  if (cachedDns.hit) return cachedDns.value;
  try {
    const r = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`,
      {
        headers: { Accept: "application/dns-json" },
        signal: AbortSignal.timeout(2200),
      },
    );
    if (r.ok) {
      const d = await r.json(),
        ips = (d.Answer || []).map((x) => ipFrom(x.data)).filter(Boolean);
      if (ips.length) {
        dnsCache.set(host, { time: Date.now(), value: ips });
        return ips;
      }
    }
  } catch {}
  try {
    const r = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`,
      { signal: AbortSignal.timeout(2200) },
    );
    const d = await r.json(),
      ips = (d.Answer || []).map((x) => ipFrom(x.data)).filter(Boolean);
    dnsCache.set(host, { time: Date.now(), value: ips });
    return ips;
  } catch {
    dnsCache.set(host, { time: Date.now(), value: [] });
    return [];
  }
}
function isGroup(p) {
  return [
    "Selector",
    "URLTest",
    "Fallback",
    "LoadBalance",
    "Relay",
    "Smart",
    "Compatible",
  ].includes(String(p?.type || ""));
}
function chooseNode(chains, proxies) {
  const list = Array.isArray(chains) ? chains.map(String).filter(Boolean) : [];
  const resolved = list.map((name) => ({ name, proxy: proxies[name] || null }));
  for (let i = resolved.length - 1; i >= 0; i--) {
    let current = resolved[i],
      seen = new Set();
    while (
      current?.proxy &&
      isGroup(current.proxy) &&
      current.proxy.now &&
      !seen.has(current.name)
    ) {
      seen.add(current.name);
      const nextName = String(current.proxy.now);
      const nextProxy = proxies[nextName];
      if (!nextProxy) break;
      current = { name: nextName, proxy: nextProxy };
    }
    if (
      current?.proxy &&
      !isGroup(current.proxy) &&
      !/^DIRECT|REJECT$/i.test(current.name)
    )
      return current;
  }
  const named = resolved
    .slice()
    .reverse()
    .find(
      (x) => countryFor(x.name).country && !/^DIRECT|REJECT$/i.test(x.name),
    );
  if (named) return named;
  return { name: "DIRECT", proxy: null };
}
function policyFromChains(chains, nodeName) {
  const list = Array.isArray(chains) ? chains.map(String).filter(Boolean) : [];
  return (
    list.filter((x) => x !== nodeName && !/^DIRECT|REJECT$/i.test(x)).at(-1) ||
    "—"
  );
}
async function firstGeo(ips) {
  for (const ip of ips) {
    const result = await geo(ip);
    if (result) return result;
  }
  return null;
}
async function inspectOnce(target) {
  const settings = await config();
  const connectionData = await request("/connections", settings);
  const all = Array.isArray(connectionData.connections)
    ? connectionData.connections
    : [];
  const found = all
    .filter((connection) => matches(hostOf(connection), target))
    .sort((a, b) => String(b.start || "").localeCompare(String(a.start || "")));
  const connection = found[0] || null;
  const connectionSiteIps = siteIps(connection);
  const resolvedSiteIps = connectionSiteIps.length
    ? connectionSiteIps
    : await resolveSiteIps(target);
  const siteIp = resolvedSiteIps[0] || "";
  const siteGeoPromise = firstGeo(resolvedSiteIps);

  if (!connection) {
    const siteGeo = await siteGeoPromise;
    return {
      target,
      found: false,
      activeConnections: all.length,
      node: "DIRECT",
      actualNode: "DIRECT",
      chainLabel: "直连",
      chains: [],
      rule: "—",
      rulePayload: "—",
      siteIp,
      siteCountry: siteGeo?.country || "",
      siteCountryCode: (siteGeo?.code || "").toUpperCase(),
      nodeIp: "",
      nodeCountry: "",
      nodeCountryCode: "",
      country: siteGeo?.country || "",
      countryCode: (siteGeo?.code || "").toUpperCase(),
      countrySource: siteGeo ? "site-ip" : "unknown",
      proxyIp: "",
    };
  }

  const chains = Array.isArray(connection.chains) ? connection.chains : [];
  let proxies = {};
  try {
    proxies = (await request("/proxies", settings)).proxies || {};
  } catch {}
  const chosen = chooseNode(chains, proxies);
  const nodeName = chosen.name;
  const nodeNamed = countryFor(nodeName);
  const candidateNodeIps = nodeIps(chosen.proxy);
  const nodeIp = candidateNodeIps[0] || "";
  const nodeGeoPromise = nodeNamed.country
    ? Promise.resolve(null)
    : firstGeo(candidateNodeIps);
  const delayPromise =
    nodeName === "DIRECT"
      ? Promise.resolve(null)
      : request(
          `/proxies/${encodeURIComponent(nodeName)}/delay?url=${encodeURIComponent("https://www.gstatic.com/generate_204")}&timeout=5000`,
          settings,
        )
          .then((data) => data.delay ?? null)
          .catch(() => null);
  const [siteGeo, nodeGeo, delay] = await Promise.all([
    siteGeoPromise,
    nodeGeoPromise,
    delayPromise,
  ]);
  const nodeCountry = nodeNamed.country || nodeGeo?.country || "";
  const nodeCode = (nodeNamed.code || nodeGeo?.code || "").toUpperCase();

  return {
    target,
    found: true,
    activeConnections: all.length,
    host: hostOf(connection),
    rule: connection.rule || "未知",
    rulePayload: connection.rulePayload || "",
    policy: policyFromChains(chains, nodeName),
    chains,
    node: nodeName,
    actualNode: nodeName,
    chainLabel: chains.join(" → "),
    nodeIp,
    nodeCountry,
    nodeCountryCode: nodeCode,
    nodeCountrySource: nodeNamed.country
      ? "node-name"
      : nodeGeo
        ? "api-ip"
        : "unknown",
    siteIp,
    siteCountry: siteGeo?.country || "",
    siteCountryCode: (siteGeo?.code || "").toUpperCase(),
    country: nodeCountry,
    countryCode: nodeCode,
    countrySource: nodeNamed.country
      ? "node-name"
      : nodeGeo
        ? "api-ip"
        : siteGeo
          ? "site-ip"
          : "unknown",
    proxyIp: nodeIp,
    delay,
    type: connection.metadata?.type || connection.type || "",
    network: connection.metadata?.network || "",
    start: connection.start || "",
    closed: connection.closed ?? false,
  };
}
async function inspect(value) {
  const target = normalizeTarget(value);
  const cachedInspect = cached(inspectCache, target);
  if (cachedInspect.hit) return cachedInspect.value;
  if (inspectInflight.has(target)) return inspectInflight.get(target);
  const pending = inspectOnce(target)
    .then((result) => {
      inspectCache.set(target, {
        time: Date.now(),
        ttl: INSPECT_CACHE_TTL,
        value: result,
      });
      return result;
    })
    .finally(() => inspectInflight.delete(target));
  inspectInflight.set(target, pending);
  return pending;
}
async function flagIcon(code) {
  const normalized = String(code || "").toUpperCase();
  if (!ISO_CODES.includes(normalized)) return null;
  if (!flagIconCache.has(normalized)) {
    flagIconCache.set(
      normalized,
      (async () => {
        const response = await fetch(
          chrome.runtime.getURL(`icons/flags/${normalized}.svg`),
        );
        if (!response.ok) throw Error("本地国旗资源不可用");
        const bitmap = await createImageBitmap(await response.blob());
        const imageData = {};
        for (const size of [16, 32]) {
          const canvas = new OffscreenCanvas(size, size);
          const context = canvas.getContext("2d");
          const height = Math.round((size * 2) / 3);
          context.clearRect(0, 0, size, size);
          context.drawImage(
            bitmap,
            0,
            Math.floor((size - height) / 2),
            size,
            height,
          );
          imageData[size] = context.getImageData(0, 0, size, size);
        }
        bitmap.close?.();
        return imageData;
      })().catch((error) => {
        flagIconCache.delete(normalized);
        throw error;
      }),
    );
  }
  return flagIconCache.get(normalized);
}
async function updateBadge(r, tabId) {
  const direct = !r?.found || r.node === "DIRECT";
  const code = String(r?.nodeCountryCode || "").toUpperCase();
  const text = direct ? "直" : ISO_CODES.includes(code) ? code : "?";
  const scope = tabId ? { tabId } : {};
  const imageData = direct ? null : await flagIcon(code).catch(() => null);
  await chrome.action.setIcon({
    ...(imageData ? { imageData } : { path: DEFAULT_ACTION_ICON }),
    ...scope,
  });
  await chrome.action.setBadgeText({ text, ...scope });
  await chrome.action.setBadgeBackgroundColor({
    color: direct ? "#6b7280" : "#356ae6",
    ...scope,
  });
  await chrome.action.setTitle({
    title: direct
      ? "代理链助手：直连"
      : `代理链助手：${r.nodeCountry || "未知归属地"} ${r.node || ""}`,
    ...scope,
  });
  if (tabId)
    await chrome.tabs
      .sendMessage(tabId, { type: "overlayResult", data: r })
      .catch(() => {});
}
chrome.runtime.onMessage.addListener((m, s, send) => {
  (async () => {
    if (m.type === "test") {
      const settings = await config();
      const [version, proxyData] = await Promise.all([
        request("/version", settings),
        request("/proxies", settings),
      ]);
      return {
        version,
        proxies: Object.keys(proxyData.proxies || {}).length,
      };
    }
    if (m.type === "inspect") {
      const id = s.tab?.id;
      if (id && Number.isFinite(m.siteDelay))
        tabSiteDelays.set(id, m.siteDelay);
      const r = { ...(await inspect(m.target)) };
      r.siteDelay = Number.isFinite(m.siteDelay)
        ? m.siteDelay
        : id
          ? (tabSiteDelays.get(id) ?? null)
          : null;
      await updateBadge(r, id);
      return r;
    }
    if (m.type === "overlayConfig") return config();
    throw Error("未知请求");
  })()
    .then(send)
    .catch((e) => send({ error: e.message || String(e) }));
  return true;
});
