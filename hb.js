/* hb.js — 藥戰手冊網頁（beta22）。補藥神器 GitHub 網頁的一頁：hb.html。
 * 給：核可名單上的同事看手冊；開發者在這裡編輯、管理。
 * 登入：跟補藥神器網頁同一把鑰匙；看之前還要「手冊驗證」（從 LINE 手冊按「🌐 網頁」開，或在 LINE 打網頁上出的「手冊 1234」）。
 * 閒置超過設定的分鐘數：自動登出、內容從畫面上拿掉。手冊內容只放在記憶體，不存進瀏覽器、不留在網址列。
 * 這個檔裡沒有任何手冊內容（章名、標題、內文、圖片都要登入、驗證後才向後端要）。
 * 原始碼在分支的 yz/（shared/rt.js、shared/cards.js、front/*.js），用 yz/build_front.py 組成這一個檔。 */
(function () {
/* ════════ rt.js ════════ */
/* rt.js — 「格式文字」：粗體、斜體、底線、刪除線、文字顏色、文字大小、標題、分隔線、標註、引用、連結到標題。
 * 存起來的就是一段普通文字，格式用方括號標記（[b]粗體[/b]、[c=red]紅字[/c]）；沒有標記的舊內容照原樣顯示。
 * 純函式、不碰畫面，寫法照 Apps Script（函式名字尾有底線），之後原封不動搬進 LINE 專案的「藥戰手冊」檔。
 *
 * 一行的寫法：
 *   開頭（可有）：[h1]～[h4] 標題　[hr] 分隔線　[q] 引用　[box=info|warn|bad|ok] 標註　[go=標題代號] 連結到標題
 *               [img=圖的代號] 一張圖（第 28 批：文字和圖片放在同一塊；圖的網址、圖說放在這一塊的 pics 裡）
 *   行內（可疊）：[b]粗體[/b]　[i]斜體[/i]　[u]底線[/u]　[s]刪除線[/s]　[c=red]顏色[/c]　[z=lg]大小[/z]
 *   縮排：開頭的全形空格（一格＝一層，最多 3 層）
 *   字本身有「[b]」這種長得像標記的字，寫成「[[b]」（兩個左括號）；其他情況不用管。
 *   標記只管「這一行」，不會跨行。 */

var YZ_RT_COLOR_ORDER = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"];
// 字的顏色（白底上的對比都 ≥ 4.5:1，手機上看得清楚）
var YZ_RT_COLORS = { gray: "#6B7280", brown: "#92572A", orange: "#C2410C", yellow: "#A16207", green: "#15803D", blue: "#1D4ED8", purple: "#7E22CE", pink: "#BE185D", red: "#B91C1C" };
var YZ_RT_COLOR_LABEL = { gray: "灰", brown: "咖啡", orange: "橘", yellow: "黃", green: "綠", blue: "藍", purple: "紫", pink: "粉", red: "紅" };
// 字的大小（普通＝不加標記）。line＝LINE 卡片上的字級；em＝網頁上是內文的幾倍
var YZ_RT_SIZE_ORDER = ["sm", "lg", "xl"];
var YZ_RT_SIZES = { sm: { label: "小", line: "xs", em: 0.86 }, lg: { label: "大", line: "lg", em: 1.25 }, xl: { label: "特大", line: "xxl", em: 1.7 } };
// 標題 1～4（整行粗體）
var YZ_RT_HEAD = {
  h1: { label: "標題 1", line: "xl", em: 1.5, color: "#1F1F1F" },
  h2: { label: "標題 2", line: "lg", em: 1.25, color: "#1F1F1F" },
  h3: { label: "標題 3", line: "md", em: 1.1, color: "#0B7A75" },
  h4: { label: "標題 4", line: "sm", em: 1, color: "#4A5565" }
};
// 標註（整行底色的提示框；LINE 做不到「字的螢光筆底色」，用這個代替）
var YZ_RT_TONE_ORDER = ["info", "warn", "bad", "ok"];
var YZ_RT_TONES = {
  info: { icon: "💡", bg: "#EAF3FB", bd: "#BBD7EE", ink: "#1B3A57", label: "提示", color: "藍" },
  warn: { icon: "⚠️", bg: "#FFF6DB", bd: "#F0D78A", ink: "#5B4300", label: "注意", color: "黃" },
  bad: { icon: "⛔", bg: "#FDECEC", bd: "#F2B8B8", ink: "#7A1F1F", label: "警告", color: "紅" },
  ok: { icon: "✅", bg: "#E8F5EC", bd: "#B5DDC2", ink: "#1F5130", label: "完成", color: "綠" }
};
var YZ_RT_ORDER = ["b", "i", "u", "s", "c", "z"];   // 寫出標記時的固定順序（疊起來才會剛好蓋住）
var YZ_RT_MAXLV = 3;                                 // 最多縮排 3 層
// 項目符號／編號／核對清單的記號（跟以前的「文字」一樣：行首打 1. (1) ① • - 就會自動排整齊）
var YZ_RT_ITEM = /^((?:\d{1,2}[.、)）](?!\d)|\(\d{1,2}\)|（\d{1,2}）|[①-⑩]|[•・●☐☑]|-(?=\s)))\s*/;

// ── 小工具 ──
function _yzRtRunsText_(runs) { var s = ""; for (var i = 0; i < (runs || []).length; i++) s += runs[i].t; return s; }
function _yzRtAttrKey_(r) { var k = ""; for (var i = 0; i < YZ_RT_ORDER.length; i++) k += (r[YZ_RT_ORDER[i]] ? YZ_RT_ORDER[i] + "=" + r[YZ_RT_ORDER[i]] + ";" : ""); return k; }
function _yzRtMerge_(runs) {   // 相鄰、格式一樣的合併；空字串丟掉
  var out = [];
  (runs || []).forEach(function (r) {
    if (!r || !r.t) return;
    var last = out[out.length - 1];
    if (last && _yzRtAttrKey_(last) === _yzRtAttrKey_(r)) last.t += r.t; else out.push(_yzRtCopy_(r));
  });
  return out;
}
function _yzRtCopy_(r) { var o = { t: r.t }; for (var i = 0; i < YZ_RT_ORDER.length; i++) if (r[YZ_RT_ORDER[i]]) o[YZ_RT_ORDER[i]] = r[YZ_RT_ORDER[i]]; return o; }
function _yzRtCut_(runs, n) {   // 去掉前 n 個字（算出「記號」之後，剩下的才是內文）
  var out = [];
  (runs || []).forEach(function (r) {
    if (n >= r.t.length) { n -= r.t.length; return; }
    var c = _yzRtCopy_(r); if (n > 0) { c.t = c.t.slice(n); n = 0; } out.push(c);
  });
  return out;
}
function _yzRtSlice_(runs, a, b) {   // 取第 a～b 個字
  var out = [], pos = 0;
  (runs || []).forEach(function (r) {
    var s = pos, e = pos + r.t.length; pos = e;
    var x = Math.max(a, s), y = Math.min(b, e);
    if (y > x) { var c = _yzRtCopy_(r); c.t = r.t.slice(x - s, y - s); out.push(c); }
  });
  return out;
}

// ── 字 → 一行的資料 ──
// 行內：把「[b]…[/b]」這種標記拆開，變成一小段一小段（每段有自己的格式）
function _yzRtInline_(s) {
  var runs = [], cur = {}, buf = "", i = 0, n = s.length;
  function flush() { if (buf) { var r = { t: buf }; for (var k in cur) r[k] = cur[k]; runs.push(r); buf = ""; } }
  while (i < n) {
    var ch = s.charAt(i);
    if (ch === "[") {
      if (s.charAt(i + 1) === "[") { buf += "["; i += 2; continue; }   // 「[[」＝一個真的「[」
      var m = /^\[(\/?)(b|i|u|s|c|z)(?:=([a-z0-9]+))?\]/.exec(s.substr(i, 16));
      if (m) {
        var close = m[1] === "/", key = m[2], val = m[3], ok = false;
        if (close) { if (!val) { flush(); delete cur[key]; ok = true; } }
        else if (key === "c") { if (val && YZ_RT_COLORS[val]) { flush(); cur.c = val; ok = true; } }
        else if (key === "z") { if (val && YZ_RT_SIZES[val]) { flush(); cur.z = val; ok = true; } }
        else if (!val) { flush(); cur[key] = 1; ok = true; }
        if (ok) { i += m[0].length; continue; }
      }
    }
    buf += ch; i++;
  }
  flush();
  return _yzRtMerge_(runs);
}
// 一行 → { k:"p|h1..h4|hr|q|box|go", lv:縮排層數, tone, go, runs:[{t, b,i,u,s,c,z}] }
// plain＝true：這段字不含標記（備註用），整行就是一段字
function _yzRtParseLine_(ln, plain) {
  ln = String(ln === null || ln === undefined ? "" : ln).replace(/\r/g, "");
  var lead = /^[ 　\t]*/.exec(ln)[0], full = 0, sp = 0, c;
  for (c = 0; c < lead.length; c++) { if (lead.charAt(c) === " ") sp++; else full++; }
  var L = { k: "p", lv: Math.min(YZ_RT_MAXLV, full + Math.floor(sp / 2)), runs: [] };
  ln = ln.slice(lead.length);
  if (!plain) {
    var pm = /^\[(h[1-4]|hr|q|box|go|img)(?:=([A-Za-z0-9_-]+))?\] ?/.exec(ln);
    if (pm) {
      L.k = pm[1];
      if (L.k === "box") L.tone = YZ_RT_TONES[pm[2]] ? pm[2] : "info";
      if (L.k === "go") L.go = pm[2] || "";
      if (L.k === "img") L.img = pm[2] || "";
      ln = ln.slice(pm[0].length);
      if (L.k === "hr" || L.k === "go" || L.k === "img") return L;   // 這三種沒有字
    }
  }
  L.runs = plain ? (ln ? [{ t: ln }] : []) : _yzRtInline_(ln);
  return L;
}
function _yzRtParse_(text) {   // 一段字 → 一行一行（編輯器載入用；至少一行）
  var out = String(text === null || text === undefined ? "" : text).split("\n").map(function (ln) { return _yzRtParseLine_(ln); });
  return out.length ? out : [{ k: "p", lv: 0, runs: [] }];
}

// ── 一行的資料 → 字 ──
function _yzRtEsc_(s) {   // 字本身長得像標記的，左括號寫成兩個；結尾的「[」也寫成兩個（後面可能接標記）
  return String(s).replace(/\[(?=\[|$|\/?(?:b|i|u|s)\]|\/(?:c|z)\]|(?:c|z)=[a-z0-9]+\]|(?:h[1-4]|hr|q|box|go|img)(?:=[A-Za-z0-9_-]+)?\])/g, "[[");
}
function _yzRtSerRuns_(runs) {
  var out = "", stack = [], x;
  (runs || []).forEach(function (r) {
    var want = [];
    YZ_RT_ORDER.forEach(function (k) { if (r[k]) want.push(k === "c" || k === "z" ? k + "=" + r[k] : k); });
    var j = 0; while (j < stack.length && j < want.length && stack[j] === want[j]) j++;
    for (x = stack.length - 1; x >= j; x--) out += "[/" + stack[x].charAt(0) + "]";
    stack = stack.slice(0, j);
    for (x = j; x < want.length; x++) { out += "[" + want[x] + "]"; stack.push(want[x]); }
    out += _yzRtEsc_(r.t);
  });
  for (x = stack.length - 1; x >= 0; x--) out += "[/" + stack[x].charAt(0) + "]";
  return out;
}
function _yzRtSerLine_(L) {
  var ind = "", i;
  for (i = 0; i < (L.lv || 0); i++) ind += "　";
  if (L.k === "hr") return ind + "[hr]";
  if (L.k === "go") return ind + "[go=" + (L.go || "") + "]";
  if (L.k === "img") return ind + "[img=" + (L.img || "") + "]";
  var pre = L.k === "box" ? "[box=" + (L.tone || "info") + "] " : (L.k && L.k !== "p" ? "[" + L.k + "] " : "");
  var body = _yzRtSerRuns_(L.runs || []);
  if (L.k === "p" && !body) return "";
  return ind + pre + body;
}
function _yzRtSerialize_(lines) { return (lines || []).map(_yzRtSerLine_).join("\n"); }

// ── 不要標記的版本（搜尋、字數用）──
function _yzRtPlainLines_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) {
    var L = _yzRtParseLine_(ln); if (L.k === "hr" || L.k === "go" || L.k === "img") return;
    var t = _yzRtRunsText_(L.runs).replace(/^\s+|\s+$/g, ""); if (t) out.push(t);
  });
  return out;
}
function _yzRtPlain_(text) { return _yzRtPlainLines_(text).join("\n"); }
// 這段字有沒有用到格式標記（LINE 裡改字時，要提醒「請保留標記」）
function _yzRtHas_(text) { return /\[(?:\/?(?:b|i|u|s)|\/(?:c|z)|(?:c|z)=[a-z0-9]+|(?:h[1-4]|hr|q|box|go|img)(?:=[A-Za-z0-9_-]+)?)\]/.test(String(text === null || text === undefined ? "" : text)); }
// 這段字裡有哪些圖（[img=代號] 那幾行，照順序、不重複）
function _yzImgIds_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) { var m = /^[ 　\t]*\[img=([A-Za-z0-9_-]+)\]/.exec(ln); if (m && out.indexOf(m[1]) < 0) out.push(m[1]); });
  return out;
}

// ── 給畫面（網頁、LINE）用：一行一行的「種類」。網頁和 LINE 共用這一份，兩邊排出來才會一樣。
//   plain＝一般行　item＝有記號的行（編號、圓點、核對框）　head＝標題　hr＝分隔線　box＝標註　quote＝引用　go＝連結到標題　gap＝空行
//   runs＝這一行的字（每段有自己的格式）；text＝不含格式的字；lv＝縮排層數；indent＝有沒有縮排（舊欄位）
function _yzParseLines_(text, plain) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) {
    var L = _yzRtParseLine_(ln, plain);
    if (L.k === "hr") { out.push({ k: "hr", lv: L.lv }); return; }
    if (L.k === "go") { out.push({ k: "go", go: L.go, lv: L.lv }); return; }
    if (L.k === "img") { out.push({ k: "img", img: L.img, lv: L.lv }); return; }
    var pl = _yzRtRunsText_(L.runs);
    if (!pl.replace(/\s/g, "")) { out.push({ k: "gap" }); return; }
    if (L.k === "p") {
      var m = YZ_RT_ITEM.exec(pl);
      if (m && pl.length > m[0].length) { out.push({ k: "item", mark: m[1], runs: _yzRtCut_(L.runs, m[0].length), text: pl.slice(m[0].length), lv: L.lv, indent: L.lv > 0 }); return; }
      out.push({ k: "plain", runs: L.runs, text: pl, lv: L.lv, indent: L.lv > 0 });
      return;
    }
    if (L.k === "box") out.push({ k: "box", tone: L.tone, runs: L.runs, text: pl, lv: L.lv });
    else if (L.k === "q") out.push({ k: "quote", runs: L.runs, text: pl, lv: L.lv });
    else out.push({ k: "head", h: +L.k.charAt(1), runs: L.runs, text: pl, lv: L.lv });
  });
  return out;
}
// 編輯器用：這一行的字有沒有記號（按 Enter 要不要接下一個）、下一個記號是什麼
function _yzRtItem_(s) {
  var m = YZ_RT_ITEM.exec(String(s === null || s === undefined ? "" : s));
  return m ? { mark: m[1], len: m[0].length, rest: String(s).slice(m[0].length) } : null;
}
function _yzRtNextMark_(mark) {
  var m;
  if ((m = /^(\d{1,2})([.、)）])$/.exec(mark))) return (+m[1] + 1) + m[2];
  if ((m = /^\((\d{1,2})\)$/.exec(mark))) return "(" + (+m[1] + 1) + ")";
  if ((m = /^（(\d{1,2})）$/.exec(mark))) return "（" + (+m[1] + 1) + "）";
  if (/^[①-⑩]$/.test(mark)) { var c = mark.charCodeAt(0); return c < 0x2469 ? String.fromCharCode(c + 1) : "①"; }
  if (mark === "☑") return "☐";
  return mark;
}

/* ════════ cards.js ════════ */
/* cards.js — 藥戰手冊的 LINE 卡片（純函式：進去資料，出來 Flex JSON；不讀不寫任何東西）。
 * 寫法照 Apps Script 的樣子（函式名字尾有底線、不碰 DOM、不用瀏覽器才有的東西），之後原封不動搬進 LINE 專案的「藥戰手冊」檔。
 * 預覽用的就是這份，所以預覽上看到的卡片 ＝ 之後機器人真的送出去的卡片。 */
var YZ_ACCENT = "#0B7A75";
var YZ_ACCENT_SOFT = "#CFEDEA";
var YZ_PG_BG = "#DDF1EE", YZ_PG_BD = "#8CCBC5", YZ_PG_INK = "#0B5F5B", YZ_PG_STRONG = "#064B47";   // 備註裡「藥戰手冊頁數」小框的顏色（青綠色）
var YZ_NOTICE = "內部資料，請勿外傳";
var YZ_BUBBLE_SAFE = 27e3;   // 一張卡片的安全上限（LINE 的上限約 30 KB，留一點空）
var YZ_MSG_SAFE = 45e3;      // 一則訊息的安全上限（LINE 的上限 50 KB）
var YZ_CAROUSEL_MAX = 12;    // 一排最多 12 張（LINE 的規定）
var YZ_REPLY_MAX = 5;        // 一次回覆最多 5 則訊息（LINE 的規定）
// LINE 卡片大小：最小 nano … 最大 giga，共 7 級（LINE 的規定）
var YZ_SIZES = ["nano", "micro", "deca", "hecto", "kilo", "mega", "giga"];
// 各級卡片的寬度（px）。這是照 LINE 畫面抓的估計值，實機才準（待實機確認）；預覽畫卡片、算表格欄寬都用這一份。
var YZ_BUBBLE_PX = { nano: 120, micro: 160, deca: 200, hecto: 230, kilo: 260, mega: 300, giga: 340 };
// 設定（真的程式會在每次回覆前，從「設定」那一頁讀進來；預覽裡可以手動切換）
var YZ_CFG = { imgDirect: true, animDirect: true, footer: true, webUrl: "https://example.invalid/hb" };
// 動畫（LINE 官方規定：卡片裡「會自己動的圖」只認 APNG；超過 300 KB 不播；一則訊息最多 10 張；圖最長邊 1024 px）
var YZ_ANIM_MAX_BYTES = 300 * 1024;
var YZ_ANIM_MAX_PX = 1024;
var YZ_ANIM_PER_MSG = 10;
var YZ_ANIM_WEB_MAX = 10 * 1024 * 1024;   // 網頁這邊動畫檔的上限（我抓的，不是 LINE 規定；Apps Script 能收多大，寫程式時再實測）
var YZ_STEPS_MAX = 8;                     // 分步動畫最多幾步（LINE 一排最多 12 張卡片）

// 一個字串／物件在 LINE 眼中有幾個位元組（UTF-8）。不用 TextEncoder，Apps Script 也能跑。
function _yzBytes_(o) {
  var s = JSON.stringify(o), n = 0;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 0x80) n += 1; else if (c < 0x800) n += 2;
    else if (c >= 0xD800 && c <= 0xDBFF) { n += 4; i++; } else n += 3;
  }
  return n;
}

// 圖片比例：LINE 規定「高」不能超過「寬」的 3 倍，兩邊都不能超過 100000
function _yzAR_(w, h) {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  if (h > 3 * w) h = 3 * w;
  var a = w, b = h; while (b) { var t = a % b; a = b; b = t; }
  w = w / a; h = h / a;
  while (w > 100000 || h > 100000) { w = Math.max(1, Math.round(w / 2)); h = Math.max(1, Math.round(h / 2)); }
  return w + ":" + h;
}

function _yzT_(text, o) {
  text = (text === null || text === undefined ? "" : String(text));
  if (!text) return null;
  var t = { type: "text", text: text, wrap: true };
  for (var k in (o || {})) t[k] = o[k];
  return t;
}

// 一段文字 → 一行一行的「種類」：寫在 rt.js 的 _yzParseLines_（網頁和 LINE 共用，兩邊排出來才會一樣）。

// 一行字（含格式）→ LINE 的一個 text。沒有格式就是一般的 text；有格式就拆成一小段一小段（span），每段都寫明字級和顏色，不靠「繼承」。
function _yzRtTextNode_(runs, base) {
  base = base || {};
  var simple = true, i;
  for (i = 0; i < (runs || []).length; i++) { var r0 = runs[i]; if (r0.b || r0.i || r0.u || r0.s || r0.c || r0.z) { simple = false; break; } }
  var node = { type: "text", wrap: true, size: base.size || "sm", color: base.color || "#1F1F1F" };
  if (base.weight) node.weight = base.weight;
  if (base.style) node.style = base.style;
  if (base.flex !== undefined) node.flex = base.flex;
  if (base.margin) node.margin = base.margin;
  if (simple) { node.text = _yzRtRunsText_(runs); return node.text ? node : null; }
  node.contents = runs.map(function (r) {
    var sp = { type: "span", text: r.t };
    sp.size = r.z ? YZ_RT_SIZES[r.z].line : node.size;
    sp.color = r.c ? YZ_RT_COLORS[r.c] : node.color;
    if (r.b || base.weight === "bold") sp.weight = "bold";
    if (r.i || base.style === "italic") sp.style = "italic";
    if (r.s) sp.decoration = "line-through"; else if (r.u) sp.decoration = "underline";   // LINE 一段字只能選一種：兩個都有時留刪除線
    return sp;
  });
  return node;
}

// 縮排（第 27 批：任何內容都能縮排）：把一個元件包進「左邊留 px」的方塊裡；它前面的間距（margin）搬到外面那一層，才算得到
function _yzIndent_(node, px) {
  if (!node || !px) return node;
  var c = Object.assign({}, node), w = { type: "box", layout: "vertical", paddingStart: px + "px", contents: [c] };
  if (c.margin) { w.margin = c.margin; delete c.margin; }
  return w;
}
function _yzIndentNodes_(nodes, px) { return px ? (nodes || []).map(function (n) { return _yzIndent_(n, px); }) : nodes; }
var YZ_IND_PX = 18;   // LINE：縮排一層幾 px（跟文字的縮排一樣）
var YZ_IND_MAX = 3;   // 整塊最多縮排 3 層（跟文字一樣）
var YZ_BOX_ICW = { xxs: "15px", xs: "17px", sm: "19px", md: "22px", lg: "25px", xl: "28px" };   // 好幾行的標註：左邊圖示那一欄多寬（每一列的字才對齊）
function _yzBlockInd_(b) { var n = Math.floor(Number(b && b.ind) || 0); return Math.max(0, Math.min(YZ_IND_MAX, n)); }

// 一段文字 → LINE 的幾行。編號行做成「記號＋內文」（內文換行時對齊內文，不會縮回記號下面）。
// 連續的「標註」（同一種）、連續的「引用」各合成一個框。o.go(標題代號)→{label}：「連結到標題」的行要用（找不到就不顯示）；o.plain：整段當一般文字（備註用，不看標記）
function _yzTextLines_(text, o) {
  o = o || {};
  var size = o.size || "sm", color = o.color || "#1F1F1F", out = [], ls = _yzParseLines_(text, o.plain), i = 0, first = true;
  while (i < ls.length) {
    var L = ls[i], pad = (L.lv || 0) * 18, j, node = null;
    if (L.k === "gap") { out.push({ type: "separator", margin: "sm", color: "#FFFFFF" }); i++; continue; }   // 空一行（LINE 已經不收 spacer：用一條白色、看不見的分隔線）
    if (L.k === "hr") { out.push(_yzIndent_({ type: "separator", margin: "md", color: "#D5DAE1" }, pad)); i++; first = false; continue; }
    if (L.k === "go") {
      var tg = o.go ? o.go(L.go) : null;
      if (tg && tg.label) {
        out.push({
          type: "box", layout: "horizontal", spacing: "sm", backgroundColor: "#F1F7F6", cornerRadius: "8px", paddingAll: "9px", paddingStart: (9 + pad) + "px",
          action: _yzPB_((tg.kind === "c" ? "yz=c&c=" : "yz=t&t=") + L.go, String(tg.label).slice(0, 20)),   // 第 27 批：也能連到整章
          contents: [
            { type: "text", text: "→", size: size, color: YZ_ACCENT, flex: 0 },
            { type: "text", text: tg.label, size: size, color: YZ_ACCENT, weight: "bold", wrap: true, flex: 1 },
            { type: "text", text: "›", size: size, color: YZ_ACCENT, flex: 0 }
          ]
        });
        first = false;
      }
      i++; continue;
    }
    if (L.k === "img") {   // 第 28 批：文字和圖片放在同一塊（圖的網址、圖說在這一塊的 pics 裡）；找不到那張圖就不顯示
      var P = o.pics && o.pics[L.img], im = P && P.url ? _yzImage_(P, o.pact ? o.pact(L.img) : null) : null;
      if (im) { out.push(_yzIndent_(im, pad)); first = false; }
      i++; continue;
    }
    if (L.k === "box") {
      var T = YZ_RT_TONES[L.tone] || YZ_RT_TONES.info, kids = [];
      for (j = i; j < ls.length && ls[j].k === "box" && ls[j].tone === L.tone && (ls[j].lv || 0) === (L.lv || 0); j++) { var bn = _yzRtTextNode_(ls[j].runs, { size: size, color: T.ink }); if (bn) kids.push(bn); }
      if (kids.length === 1) out.push(_yzIndent_({
        type: "box", layout: "horizontal", spacing: "sm", backgroundColor: T.bg, borderColor: T.bd, borderWidth: "1px", cornerRadius: "8px", paddingAll: "9px",
        contents: [{ type: "text", text: T.icon, size: size, flex: 0 }, { type: "box", layout: "vertical", flex: 1, spacing: "xs", contents: kids }]
      }, pad));
      else if (kids.length > 1) {   // 第 28 批：好幾行的標註：一行一列、中間一條線（跟編輯器裡看到的一樣）；圖示只在第一列，每一列的字對齊
        var icw = YZ_BOX_ICW[size] || "22px", rows = [];
        kids.forEach(function (k, n) {
          if (n) rows.push({ type: "separator", color: T.bd });
          rows.push({ type: "box", layout: "horizontal", spacing: "sm", paddingAll: "9px", contents: [
            { type: "box", layout: "vertical", width: icw, contents: [{ type: "text", text: n ? " " : T.icon, size: size }] },
            Object.assign({}, k, { flex: 1 })
          ] });
        });
        out.push(_yzIndent_({ type: "box", layout: "vertical", backgroundColor: T.bg, borderColor: T.bd, borderWidth: "1px", cornerRadius: "8px", contents: rows }, pad));
      }
      i = j; first = false; continue;
    }
    if (L.k === "quote") {
      var qk = [];
      for (j = i; j < ls.length && ls[j].k === "quote" && (ls[j].lv || 0) === (L.lv || 0); j++) { var qn = _yzRtTextNode_(ls[j].runs, { size: size, color: "#4A5565" }); if (qn) qk.push(qn); }
      // 左邊那條線：外框塗灰色、只留 3px，裡面的白底蓋掉其餘的（比「單邊框線」可靠，LINE 沒有單邊框線）
      if (qk.length) out.push(_yzIndent_({ type: "box", layout: "horizontal", backgroundColor: "#B8C2CC", paddingStart: "3px", contents: [{ type: "box", layout: "vertical", backgroundColor: "#FFFFFF", paddingStart: "10px", spacing: "xs", contents: qk }] }, pad));
      i = j; first = false; continue;
    }
    if (L.k === "item") {
      var body = _yzRtTextNode_(L.runs, { size: size, color: color, flex: 1 });
      if (body) out.push({ type: "box", layout: "horizontal", spacing: "sm", paddingStart: pad ? pad + "px" : undefined, contents: [{ type: "text", text: L.mark, size: size, color: o.markColor || "#4A5565", flex: 0 }, body] });
      i++; first = false; continue;
    }
    if (L.k === "head") {
      var H = YZ_RT_HEAD["h" + L.h];
      node = _yzRtTextNode_(L.runs, { size: H.line, color: H.color, weight: "bold", margin: first ? undefined : (L.h <= 2 ? "xxl" : "xl") });   // 第 27 批：標題前面空大一點（太擠）
    } else node = _yzRtTextNode_(L.runs, { size: size, color: color });
    if (node) {
      out.push(_yzIndent_(node, pad));   // 第 27 批：標題也能縮排（以前標題不縮）
      first = false;
    }
    i++;
  }
  return out;
}

// ── 表格 ──
// 一段字在 LINE 上大概多寬（px）：中文一個字佔一格；英數字照一般無襯線字體的寬度估（m、W 比較寬，i、l 比較窄），再多留 6% 的餘地。
// 只是估計，實機才準（待實機確認）。估得偏寬一點沒關係，頂多欄寬多給一點；估太窄才會把「00003」「100mL/BT」硬拆成兩行。
var YZ_CW_ = (function () {
  var m = {};
  function put(chars, w) { for (var i = 0; i < chars.length; i++) m[chars.charAt(i)] = w; }
  put("ijl", 0.222); put(" !,./:;I[\\]ft", 0.278); put("()-r`", 0.333); put("*", 0.389);
  put("ckJsvxyz", 0.5); put("0123456789abdeghnopquL?_#$", 0.556); put("+<=>~", 0.584);
  put("FTZ", 0.611); put("ABEKPSVXY&", 0.667); put("CDHNRUw", 0.722); put("GOQ", 0.778);
  put("mM", 0.833); put("%", 0.889); put("W", 0.944); put("'", 0.191); put("|", 0.26);
  put("\"", 0.355); put("^", 0.469); put("{}", 0.334); put("@", 1.015);
  return m;
})();
var YZ_CW_SAFE = 1.06;
function _yzCharW_(c, ch) {   // 一個字的寬度（單位：字級的幾倍）
  if (c >= 0x2E80 || (c >= 0x2460 && c <= 0x25FF)) return 1;            // 中文、全形符號、圈號
  if (c >= 0x2010 && c <= 0x2027) return 0.7;                            // – — … 之類
  if (c >= 0x2000) return 1;
  var w = YZ_CW_[ch]; return w === undefined ? 0.6 : w;
}
function _yzTxtW_(s, px) {
  var w = 0; s = String(s === null || s === undefined ? "" : s);
  for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); w += _yzCharW_(c, s.charAt(i)) * (c >= 0x2E80 ? 1 : YZ_CW_SAFE); }
  return w * px;
}
// 一格字「最少要多寬」才不會被硬拆開：英文數字連在一起的（例如 10mL/BT）不能拆；中文可以在任何字後面換行，至少留兩個字寬
function _yzNeedW_(s, px) {
  var need = 0, run = 0, cjk = 0;
  s = String(s === null || s === undefined ? "" : s);
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i), ch = s.charAt(i);
    if (/\s/.test(ch)) { if (run > need) need = run; run = 0; cjk = 0; continue; }
    if (c >= 0x2E80 || (c >= 0x2460 && c <= 0x25FF)) {
      if (run > need) need = run; run = 0; cjk++;
      var cw = Math.min(cjk, 2) * px; if (cw > need) need = cw;
    } else { cjk = 0; run += _yzTxtW_(ch, px); }
  }
  if (run > need) need = run;
  return need;
}
// 算這張表在某一級卡片上怎麼排：每欄分多寬（flex 比例）、要不要把字縮小一號、還是太擠
function _yzTableFit_(tb, bs) {
  var rows = (tb && tb.rows || []).filter(function (r) { return r && r.length; });
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  var out = { nc: nc, size: "xs", flex: [], tooWide: false, shrunk: false, minTotal: 0, avail: 0, xsMin: [], alloc: [] };
  if (!nc) return out;
  var head = !tb || tb.head !== false;
  // 可用寬度 ＝ 卡片寬 − 內文左右各 13 − 外框 2 − 欄與欄之間的分隔線
  var avail = (YZ_BUBBLE_PX[bs || "giga"] || 340) - 26 - 2 - (nc - 1);
  var tries = [[13, "xs"], [11, "xxs"]], best = null;
  for (var t = 0; t < tries.length; t++) {
    var px = tries[t][0], minW = [], maxW = [], sMin = 0, sMax = 0;
    for (var c = 0; c < nc; c++) {
      var mn = 0, mx = 0;
      for (var ri = 0; ri < rows.length; ri++) {
        var v = rows[ri][c], str = (v === undefined || v === null) ? "" : String(v), f = head && ri === 0 ? 1.07 : 1;
        mn = Math.max(mn, _yzNeedW_(str, px) * f); mx = Math.max(mx, _yzTxtW_(str, px) * f);
      }
      var a = Math.ceil(mn) + 12, b = Math.max(a, Math.min(Math.ceil(mx) + 12, 200));
      minW.push(a); maxW.push(b); sMin += a; sMax += b;
    }
    if (t === 0) out.xsMin = minW.slice();
    best = { size: tries[t][1], minW: minW, maxW: maxW, sMin: sMin, sMax: sMax };
    if (sMin <= avail) break;      // 這個字級放得下，就用它
  }
  var alloc;
  if (best.sMax <= avail) alloc = best.maxW.slice();                       // 每一欄都放得下單行
  else if (best.sMin <= avail) {                                           // 先給每欄「最少要的」，剩下的照「還想要多少」分
    var left = avail - best.sMin, want = best.sMax - best.sMin;
    alloc = best.minW.map(function (m, c) { return m + (want ? left * (best.maxW[c] - m) / want : 0); });
  } else { alloc = best.minW.slice(); out.tooWide = true; }
  out.size = best.size; out.shrunk = best.size !== "xs"; out.minTotal = best.sMin; out.avail = Math.floor(avail); out.alloc = alloc;
  out.flex = alloc.map(function (a) { return Math.max(1, Math.round(a)); });
  return out;
}
// 給編輯器提醒用：這張表在這個大小的卡片上會不會太擠？（自動欄寬、手動比例都算）
function _yzTableCheck_(tb, bs) {
  var fit = _yzTableFit_(tb, bs), nc = fit.nc;
  fit.manual = !!(tb && tb.w && tb.w.length === nc);
  fit.narrow = [];
  if (fit.manual) {
    var sum = 0; tb.w.forEach(function (x) { sum += Number(x) || 1; });
    tb.w.forEach(function (x, c) { var got = fit.avail * (Number(x) || 1) / sum; if (got < fit.xsMin[c] - 1) fit.narrow.push(c + 1); });
  }
  return fit;
}
// 表格：外框一圈、格與格之間用細線（separator）隔開；每一列自己決定高度。
// 沒指定欄寬比例（w）就自動算；指定了就照比例（flex 一律取整數）。
function _yzTable_(tb, o) {
  var rows = (tb && tb.rows || []).filter(function (r) { return r && r.length; });
  if (!rows.length) return null;
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  var fit = _yzTableFit_(tb, o && o.bs), size = "xs", w;
  if (tb.w && tb.w.length === nc) w = tb.w.map(function (x) { return Math.max(1, Math.round((Number(x) || 1) * 10)); });
  else { w = fit.flex; size = fit.size; }
  var head = tb.head !== false;
  var rowBoxes = [];
  rows.forEach(function (r, ri) {
    var isHead = head && ri === 0;
    var cells = [];
    for (var ci = 0; ci < nc; ci++) {
      if (ci > 0) cells.push({ type: "separator", color: "#CBD2DA" });
      cells.push({
        type: "box", layout: "vertical", flex: w[ci], paddingAll: "4px",
        contents: [{ type: "text", text: String(r[ci] === undefined || r[ci] === null || r[ci] === "" ? " " : r[ci]), size: size, wrap: true, align: "center", weight: isHead ? "bold" : "regular", color: "#1F1F1F" }]
      });
    }
    if (ri > 0) rowBoxes.push({ type: "separator", color: "#CBD2DA" });
    rowBoxes.push({ type: "box", layout: "horizontal", spacing: "none", backgroundColor: isHead ? "#F1F3F4" : "#FFFFFF", contents: cells });
  });
  return { type: "box", layout: "vertical", spacing: "none", borderWidth: "1px", borderColor: "#CBD2DA", cornerRadius: "4px", contents: rowBoxes };
}

// 圖片：設定「圖片直接顯示」開著就直接放圖；關掉就換成一個按鈕（點了開網頁，要登入才看得到）
function _yzImage_(im, act) {
  if (!im || !im.url) return null;
  var cap = _yzT_(im.cap, { size: "xs", color: "#6B7280", align: "center" });
  if (!YZ_CFG.imgDirect) {
    var bx = { type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#F1F3F4", cornerRadius: "8px", paddingAll: "10px", contents: [
      { type: "text", text: "🖼 這裡有一張圖（為了保密，不直接顯示）", size: "xs", color: "#5F6B7A", wrap: true, align: "center" }
    ] };
    if (cap) bx.contents.push(cap);
    var wb = _yzWebBtn_("🖼 登入網頁看圖", YZ_CFG.webUrl);
    if (wb) bx.contents.push(wb);
    return bx;
  }
  var box = { type: "box", layout: "vertical", spacing: "xs", contents: [] };
  var img = { type: "image", url: im.url, size: "full", aspectMode: "fit", aspectRatio: im.ar || "4:3" };
  if (act) img.action = act;
  box.contents.push(img);
  if (cap) box.contents.push(cap);
  return box;
}

// ── 動畫（兩種）──
// ① 動畫檔（kind:"file"：GIF／APNG／WebP 一個檔）：LINE 卡片只有「APNG、300 KB 以內」能自己動；其他的顯示「第一格＋▶ 在網頁看動畫」。
// ② 分步動畫（kind:"steps"：幾張圖輪流）：LINE 上做成「左右滑的一排卡片」，一步一張（不會自己動）；網頁上才會自動輪播。
function _yzKbText_(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
// 「在網頁看」的連結：正式版由 LINE 專案給（YZ_CFG.link，帶這個人自己的網頁鑰匙）；沒有網址（網頁還沒接好）就回空字串，按鈕不放
function _yzAnimLink_(tid) { var u = typeof YZ_CFG.link === "function" ? YZ_CFG.link(tid) : (YZ_CFG.webUrl ? YZ_CFG.webUrl + "?t=" + encodeURIComponent(tid || "") : ""); return /^https:\/\//.test(u || "") ? u : ""; }
function _yzWebBtn_(label, uri) { return /^https:\/\//.test(uri || "") ? { type: "button", style: "secondary", height: "sm", action: { type: "uri", label: label, uri: uri } } : null; }
function _yzFmtName_(f) { return f === "gif" ? "GIF" : f === "apng" ? "APNG" : f === "webp" ? "WebP" : "這個格式"; }
// 這個動畫檔放在 LINE 卡片上，能不能自己動？{ok, why}（why 是給開發者看的白話原因）
function _yzAnimWhy_(b, used) {
  if (!b || !b.url) return { ok: false, why: "還沒有動畫檔" };
  if (b.fmt !== "apng") return { ok: false, why: _yzFmtName_(b.fmt) + "：LINE 卡片只能播 APNG，所以卡片上只顯示第一格，旁邊放「▶ 在網頁看動畫」按鈕" };
  if ((b.bytes || 0) > YZ_ANIM_MAX_BYTES) return { ok: false, why: "檔案 " + _yzKbText_(b.bytes) + "，超過 LINE 動畫的上限 300 KB，所以卡片上只顯示第一格＋「▶ 在網頁看動畫」按鈕" };
  if (Math.max(b.w || 0, b.h || 0) > YZ_ANIM_MAX_PX) return { ok: false, why: "圖最長邊 " + Math.max(b.w || 0, b.h || 0) + " px，超過 LINE 的 1024 px，所以卡片上只顯示第一格＋「▶ 在網頁看動畫」按鈕" };
  if ((used || 0) >= YZ_ANIM_PER_MSG) return { ok: false, why: "同一則訊息已經有 " + YZ_ANIM_PER_MSG + " 張會動的圖（LINE 上限），這一張改成第一格＋按鈕" };
  return { ok: true, why: "APNG、" + _yzKbText_(b.bytes || 0) + "、" + (b.w || "?") + "×" + (b.h || "?") + "：LINE 卡片上會自己動（對方的 LINE 要開「自動播放」才會動）" };
}
// play＝卡片上自己動　poster＝只顯示第一格＋按鈕　button＝連第一格都不顯示（保密設定）
function _yzAnimMode_(b, used) {
  if (!YZ_CFG.imgDirect) return "button";
  if (!YZ_CFG.animDirect) return "poster";
  return _yzAnimWhy_(b, used).ok ? "play" : "poster";
}
function _yzAnimFile_(b, o) {
  o = o || {};
  if (!b || (!b.url && !b.poster)) return null;
  var used = o.used || { n: 0 }, mode = _yzAnimMode_(b, used.n);
  var cap = _yzT_(b.cap, { size: "xs", color: "#6B7280", align: "center" });
  var link = _yzWebBtn_("▶ 在網頁看動畫", _yzAnimLink_(o.tid));
  if (mode === "button") {
    var bx = { type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#F1F3F4", cornerRadius: "8px", paddingAll: "10px", contents: [
      { type: "text", text: "🎞 這裡有一段動畫（為了保密，不直接顯示）", size: "xs", color: "#5F6B7A", wrap: true, align: "center" }
    ] };
    if (cap) bx.contents.push(cap);
    var lb = _yzWebBtn_("🎞 登入網頁看動畫", _yzAnimLink_(o.tid));
    if (lb) bx.contents.push(lb);
    return bx;
  }
  var box = { type: "box", layout: "vertical", spacing: "xs", contents: [] };
  if (mode === "play") {
    used.n++;
    box.contents.push({ type: "image", url: b.raw || b.url, size: "full", aspectMode: "fit", aspectRatio: b.ar || "4:3", animated: true });   // 會動的要原檔（raw）；縮圖網址只有第一格
  } else {
    var im = { type: "image", url: b.poster || b.url, size: "full", aspectMode: "fit", aspectRatio: b.ar || "4:3" };
    if (o.act) im.action = o.act;
    box.contents.push(im);
    box.contents.push({ type: "text", text: "🎞 這是動畫，卡片上只顯示第一格", size: "xxs", color: "#7B8696", align: "center", wrap: true });
  }
  if (cap) box.contents.push(cap);
  if (mode === "poster" && link) box.contents.push(link);
  return box;
}
// 分步動畫 → 一排卡片（一步一張，左右滑）
function _yzStepBubbles_(ch, ti, b, bs, o) {
  o = o || {};
  var steps = (b.steps || []).filter(function (s) { return s && (s.url || String(s.cap || "").trim()); }).slice(0, YZ_STEPS_MAX), n = steps.length;
  return steps.map(function (s, i) {
    var body = [], im = _yzImage_({ url: s.url, ar: s.ar, cap: "" }, o.act ? o.act(b, i) : null);
    if (im) body.push(im);
    var cap = _yzT_(s.cap, { size: "sm", color: "#1F1F1F" }); if (cap) body.push(cap);
    return {
      type: "bubble", size: bs,
      header: _yzHead_("🎞 步驟 " + (i + 1) + "／" + n, ti.name, i < n - 1 ? "左右滑，看下一步 ›" : "最後一步"),
      body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "13px", contents: body.length ? body : [{ type: "text", text: "（這一步還沒有內容）", size: "sm", color: "#7B8696" }] },
      footer: { type: "box", layout: "vertical", paddingAll: "10px", contents: [_yzFoot_()] }
    };
  });
}

// ── 藥戰手冊頁數（備註裡的欄位：這一段對應紙本手冊的第幾頁）──
// 打「14」「14-15」「P.14」「12、15」都看得懂；看不懂的寫法（例如「附錄 3」）照原樣顯示。
function _yzNorm_(s) {   // 全形 → 半形、英文轉小寫。一個字換一個字，長度不變（拿來對位置用）
  s = String(s === null || s === undefined ? "" : s);
  var o = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i), ch = s.charAt(i);
    if (c === 0x3000) ch = " "; else if (c >= 0xFF01 && c <= 0xFF5E) ch = String.fromCharCode(c - 0xFEE0);
    var l = ch.toLowerCase(); o += (l.length === 1 ? l : ch);
  }
  return o;
}
function _yzPageText_(p) {
  var raw = String(p === null || p === undefined ? "" : p).replace(/\s+/g, " ").trim();
  if (!raw) return "";
  var n = _yzNorm_(raw).replace(/\s+/g, ""), m = /^(?:p\.?|page|第)?(\d{1,4})(?:[-~–—至](\d{1,4}))?頁?$/.exec(n);
  if (m) return "第 " + m[1] + (m[2] ? "–" + m[2] : "") + " 頁";
  if (/^\d{1,4}(?:[、,]\d{1,4})+$/.test(n)) return "第 " + n.split(/[、,]/).join("、") + " 頁";
  return raw;
}
function _yzPageShort_(p) {   // 清單裡用的短寫法：第 13–14 頁 → P.13–14
  var t = _yzPageText_(p);
  var m = /^第 (.+) 頁$/.exec(t);
  return m ? "P." + m[1] : t;
}
function _yzPageNums_(p) {    // 「12–14」→ [12,13,14]；「12、15」→ [12,15]；看不懂 → []
  var n = _yzNorm_(String(p === null || p === undefined ? "" : p)).replace(/\s+/g, ""), out = [];
  if (!/\d/.test(n)) return out;
  n.replace(/^(?:p\.?|page|第)/, "").replace(/頁$/, "").split(/[、,]/).forEach(function (seg) {
    var m = /^(\d{1,4})(?:[-~–—至](\d{1,4}))?$/.exec(seg);
    if (!m) return;
    var a = +m[1], b = m[2] ? +m[2] : a;
    if (b < a) { var x = a; a = b; b = x; }
    if (b - a > 200) b = a + 200;
    for (var i = a; i <= b; i++) out.push(i);
  });
  return out;
}
function _yzPageHas_(p, n) { return _yzPageNums_(p).indexOf(n) >= 0; }
function _yzPageQuery_(q) {   // 搜尋時打「第14頁」「p14」「14頁」→ 14；不是這種打法 → 0
  var n = _yzNorm_(String(q === null || q === undefined ? "" : q)).replace(/\s+/g, "");
  var m = /^(?:第|p\.?|page)(\d{1,4})頁?$/.exec(n) || /^(\d{1,4})頁$/.exec(n);
  return m ? +m[1] : 0;
}

// 備註有沒有寫字：空白、空行、看不見的字（零寬空白，從別的地方複製過來常夾帶）都不算
function _yzNoteHas_(note) { return !!String(note === null || note === undefined ? "" : note).replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").trim(); }
function _yzNote_(note, page) {
  // 沒填備註（空白、只有空行）：整個備註框不要（以前會留一個只有「備註」兩個字的空框）；前後多打的空行也不要
  var lines = _yzNoteHas_(note) ? _yzTextLines_(note, { size: "xs", color: "#5B4300", markColor: "#8A6D00", plain: true }) : [];
  var gap = function (n) { return n && n.type === "separator" && n.color === "#FFFFFF"; };
  while (lines.length && gap(lines[0])) lines.shift();
  while (lines.length && gap(lines[lines.length - 1])) lines.pop();
  var pg = _yzPageText_(page);
  if (!lines.length && !pg) return null;
  // 頁數：自己一個小框（青綠色，跟黃色的備註框不同色）
  var chip = pg ? {
    type: "box", layout: "vertical", backgroundColor: YZ_PG_BG, borderColor: YZ_PG_BD, borderWidth: "1px", cornerRadius: "8px", paddingAll: "6px",
    contents: [{ type: "text", size: "xs", wrap: true, contents: [
      { type: "span", text: "📖 藥戰手冊頁數　", color: YZ_PG_INK }, { type: "span", text: pg, weight: "bold", color: YZ_PG_STRONG }
    ] }]
  } : null;
  if (!lines.length) return chip;   // 第 28 批：只寫了頁數（備註沒有字）：只放頁數小框，不要黃色的「備註」框
  var c = [{ type: "text", text: "備註", size: "xxs", weight: "bold", color: "#8A6D00" }].concat(lines);
  if (chip) c.push({ type: "text", text: " ", size: "xs", wrap: true }, chip);   // 備註有字：頁數小框放在備註框裡面，文字和小框中間空一行
  return { type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#FFF8E1", cornerRadius: "8px", paddingAll: "8px", contents: c };
}

function _yzFoot_() {
  if (!YZ_CFG.footer) return { type: "separator", color: "#FFFFFF" };   // 頁尾關掉：放一條白色、看不見的分隔線（LINE 已經不收 spacer）
  return { type: "text", text: YZ_NOTICE, size: "xxs", color: "#9AA0A6", align: "center", margin: "sm" };
}

function _yzHead_(top, title, sub) {
  var c = [{ type: "text", text: top, size: "xs", color: YZ_ACCENT_SOFT, wrap: true }];
  if (title) c.push({ type: "text", text: title, size: "lg", weight: "bold", color: "#FFFFFF", wrap: true, margin: "xs" });
  if (sub) c.push({ type: "text", text: sub, size: "xs", color: YZ_ACCENT_SOFT, wrap: true, margin: "xs" });
  return { type: "box", layout: "vertical", paddingAll: "12px", backgroundColor: YZ_ACCENT, contents: c };
}

function _yzPB_(data, label, display) { var a = { type: "postback", label: label, data: data }; if (display) a.displayText = display; return a; }

// ── 章的主題圖：目錄圖（圖一）上這一章的位置裁下來的（網頁編輯器按「儲存」時自動做好）；開發者自己放的「章元圖」優先 ──
function _yzChBg_(ch) { return (ch && (ch.img || (ch.bg && ch.bg.img))) || ""; }
function _yzChIcons_(hb) {   // { 章代號: 圖示 }：目錄圖上連到這一章的地點的圖示（同一章有好幾個，拿第一個）
  var o = {};
  ((hb && hb.cat && hb.cat.spots) || []).forEach(function (s) { var m = /^c:(.+)$/.exec(String(s && s.to || "")); if (m && s.ico && !o[m[1]]) o[m[1]] = String(s.ico); });
  return o;
}
// 卡片最上面：主題圖＋圖的下緣一條半透明深色字條（寫章名、標題）。沒有圖、或設定「圖片不直接顯示在 LINE」→ null（照舊用青綠色那條）
function _yzThemeHero_(ch, top, title, sub, ar, act) {
  var u = _yzChBg_(ch);
  if (!u || !YZ_CFG.imgDirect) return null;
  var txt = [];
  if (top) txt.push({ type: "text", text: top, size: "xxs", color: "#D8F1EE", wrap: true });
  if (title) txt.push({ type: "text", text: title, size: "lg", weight: "bold", color: "#FFFFFF", wrap: true, margin: "xs" });
  if (sub) txt.push({ type: "text", text: sub, size: "xxs", color: "#D8F1EE", wrap: true, margin: "xs" });
  var hero = { type: "box", layout: "vertical", paddingAll: "0px", contents: [
    { type: "image", url: u, size: "full", aspectRatio: ar || "20:9", aspectMode: "cover" },
    { type: "box", layout: "vertical", position: "absolute", offsetBottom: "0px", offsetStart: "0px", offsetEnd: "0px", paddingAll: "11px", backgroundColor: "#0B1F1DB8", contents: txt }
  ] };
  if (act) hero.action = act;
  return hero;
}

function _yzTopOf_(b, hero, head) {   // 卡片最上面：有主題圖放主題圖（hero），沒有就放青綠色那條（header）
  if (hero) b.hero = hero; else b.header = head();
  return b;
}

// ── 章元：一章一張（主題圖＋章名），一排左右滑。不寫「第幾章」 ──
function _yzChapterBubble_(ch, nTitles) {
  var open = _yzPB_("yz=c&c=" + ch.id, "打開");
  var body = [{ type: "text", text: (ch.ico ? ch.ico + " " : "") + ch.name, size: "md", weight: "bold", wrap: true, color: "#1F1F1F" }];
  var intro = _yzT_(ch.intro, { size: "xs", color: "#5F6B7A", margin: "sm", maxLines: 3 });
  if (intro) body.push(intro);
  body.push({ type: "text", text: nTitles ? nTitles + " 個標題" : "🔒 還在整理", size: "xxs", color: "#7B8696", margin: "sm" });
  var b = { type: "bubble", size: ch.size || "kilo" }, bg = _yzChBg_(ch);
  if (bg && YZ_CFG.imgDirect) b.hero = { type: "image", url: bg, size: "full", aspectRatio: "20:13", aspectMode: "cover", action: open };
  else b.hero = { type: "box", layout: "vertical", backgroundColor: YZ_ACCENT, paddingAll: "18px", action: open, contents: [{ type: "text", text: ch.ico || "📘", size: "3xl", align: "center", color: "#FFFFFF" }] };
  b.body = { type: "box", layout: "vertical", paddingAll: "12px", contents: body, action: open };
  b.footer = { type: "box", layout: "vertical", paddingAll: "10px", spacing: "xs", contents: [
    { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", action: _yzPB_("yz=c&c=" + ch.id, "打開這一章") },
    _yzFoot_()
  ] };
  return b;
}
function _yzChapterList_(chapters, counts, icons) {
  var bs = chapters.slice(0, YZ_CAROUSEL_MAX).map(function (c) { return _yzChapterBubble_(icons && icons[c.id] ? Object.assign({}, c, { ico: icons[c.id] }) : c, counts[c.id] || 0); });
  return { type: "carousel", contents: bs };
}

// ── 目錄圖（「藥師調劑台」）第 3 版：像「圖二」那種實景圖。每個地方有一個白色小標籤（圖示＋名稱）和一顆圓點；點標籤或點物品，就進到那一章（或某一個標題）──
// 資料（cat）：{ on, title, hint, img, ar, w, h, size, labels, btns, fx, web, spots:[{ id, label, to, x, y, w, h, pos, ico, desc, st }] }
//   to ＝ "c:章代號"（整章）或 "t:標題代號"（某一個標題）；「🔒 尚未開放」的地方可以不填 to；
//   x、y、w、h ＝ 「物品」佔整張圖的幾 %（整數）；圓點在這個框的正中間；
//   pos ＝ 標籤在圓點的上(t)／下(b)／左(l)／右(r)（舊版的「中(m)」自動當成「上」）；
//   ico ＝ 標籤前面的圖示（一個表情符號）；desc ＝ 網頁上滑過去時，底下說明卡的那一句話（LINE 上沒有「滑過」，所以不放）；
//   st ＝ ""（一般）／"lock"（🔒 還沒開放：標籤變灰，點了只會說「還在整理」）／"new"（標籤上多一顆紅點）；
//   fx ＝ 網頁上的動態效果（滑過放大、說明卡、飄浮光點）開不開，預設開（只影響網頁，LINE 沒有）。
// LINE 上的做法：圖片區（hero）放「圖＋疊在圖上的方塊」。每個地方有兩個「絕對位置」的方塊（位置、大小用百分比，LINE 官方規格有支援）：
//   ① 透明的「物品框」（點物品用）；② 「標籤方塊」（白色小標籤＋圓點；範圍至少 44 px 高，手指好點）。兩個都有「點了要做什麼」（postback）。
//   實機畫出來是不是這個樣子，要用手機確認（待實機確認），所以另外做了「圖下面加按鈕」的備用開關。
var YZ_MAP_MAX = 12;         // 圖上最多幾個地點（再多就擠得點不到）
var YZ_MAP_MIN_PCT = 4;      // 一個地點的物品框最小幾 %
var YZ_MAP_RECT_WARN = 24;   // 物品框小於這個大小（px）就提醒（標籤本身還是點得到）
var YZ_MAP_PILL_PX = 11;     // 標籤字級（xxs ＝ 11 px）
var YZ_MAP_PILL_H = 23;      // 標籤高度（px，估計：字 11 px × 1.35 ＋ 上下各 3 px ＋ 框線上下各 1 px）
var YZ_MAP_INK_BORDER = "#1D5E5C";   // 標籤的框線顏色（照「圖二」：白底、深綠框）
var YZ_MAP_DOT = 12;         // 圓點直徑（px）
var YZ_MAP_GAP = 3;          // 標籤和圓點的間隔（px）
var YZ_MAP_TAP = 44;         // 標籤方塊至少這麼高（px）：手指好點的大小
var YZ_MAP_ICO = 14;         // 圖示寬（px，估計）
var YZ_MAP_PILL_MAX = 96;    // 標籤寬超過這個（px）就提醒（太寬會擠到旁邊的標籤）
var YZ_MAP_PILL_MAX_HALF = 124;   // 切成左右兩張時（一張只放一半的地點，比較不擠）的標準
var YZ_MAP_WARN_BYTES = 20e3;   // 目錄卡片超過這個大小就提醒（上限抓 27 KB）
var YZ_MAP_LOCK_INK = "#6B7480", YZ_MAP_LOCK_DOT = "#8A94A0", YZ_MAP_NEW = "#E5484D";
var YZ_MAP_URL_SAMPLE = "https://drive.google.com/thumbnail?id=1AbCdEfGhIjKlMnOpQrStUvWxYz00000&sz=w1000";   // 算大小用：跟真的圖片網址一樣長

function _yzMapTo_(to) {   // "c:c2" → "yz=c&c=c2"；"t:t22" → "yz=t&t=t22"；看不懂 → ""
  var m = /^([ct]):([A-Za-z0-9_\-]+)$/.exec(String(to === null || to === undefined ? "" : to));
  return m ? "yz=" + m[1] + "&" + m[1] + "=" + m[2] : "";
}
function _yzMapToInfo_(to, hb) {   // 連到哪裡：{ ok, kind:"c"|"t", name:"藥品補充與藥品請領"（標題：「章名　標題」）, short:"藥品補充與藥品請領" }
  var m = /^([ct]):(.+)$/.exec(String(to === null || to === undefined ? "" : to)), i;
  if (m && m[1] === "c") { var cs = (hb && hb.chapters) || []; for (i = 0; i < cs.length; i++) if (cs[i].id === m[2]) return { ok: true, kind: "c", name: cs[i].name, short: cs[i].name }; }
  if (m && m[1] === "t") { var f = hb ? _yzFindTitle_(hb, m[2]) : null; if (f) return { ok: true, kind: "t", name: f.ch.name + "　" + f.t.name, short: f.t.name }; }
  return { ok: false, kind: m ? m[1] : "", name: "（找不到）", short: "" };
}
function _yzMapNum_(v, lo, hi) { v = Math.round(Number(v)); if (!isFinite(v)) v = lo; return Math.max(lo, Math.min(hi, v)); }
function _yzMapSpotOk_(s) { return !!(s && (s.st === "lock" || _yzMapTo_(s.to)) && isFinite(Number(s.x)) && isFinite(Number(s.y)) && Number(s.w) >= 1 && Number(s.h) >= 1); }
function _yzMapRect_(s) {   // 一定落在 0～100 之內的整數百分比（LINE 規格：百分比寫成 "12%"）
  var x = _yzMapNum_(s.x, 0, 99), y = _yzMapNum_(s.y, 0, 99);
  return { x: x, y: y, w: _yzMapNum_(s.w, 1, 100 - x), h: _yzMapNum_(s.h, 1, 100 - y) };
}
function _yzMapPos_(p) { return p === "t" || p === "b" || p === "l" || p === "r" ? p : "t"; }   // 舊版的「中」（m）和看不懂的，都當成「上」
function _yzMapSt_(v) { return v === "lock" || v === "new" ? v : ""; }
function _yzMapStr_(v) { return String(v === null || v === undefined ? "" : v).replace(/\s+/g, " ").trim(); }
// 第 26 批：網頁滑到時「亮起來的形狀」＝編輯器自動找的物品輪廓（[[x,y,…],…]，整張圖的 %）。選「整個框」、還沒算、框動過了：沒有（＝亮整個框）
function _yzMapShape_(s, r) {
  var sh = s && s.shape;
  if (!sh || s.lit === "box" || !Array.isArray(sh.r) || !sh.r.length || sh.b !== [r.x, r.y, r.w, r.h].join(",")) return null;
  var out = sh.r.filter(function (ring) { return Array.isArray(ring) && ring.length >= 6 && ring.every(function (v) { return typeof v === "number" && isFinite(v); }); });
  return out.length ? out : null;
}
function _yzMapNorm_(s) {   // 把一個地點整理乾淨（不管能不能用）
  var r = _yzMapRect_(s);
  var o = { id: s.id, label: _yzMapStr_(s.label), to: s.to, x: r.x, y: r.y, w: r.w, h: r.h, pos: _yzMapPos_(s.pos), ico: _yzMapStr_(s.ico).replace(/\s/g, ""), desc: _yzMapStr_(s.desc), st: _yzMapSt_(s.st) };
  if (s.empty === true) o.empty = true;
  var sh = _yzMapShape_(s, r);
  if (sh) o.shape = sh;
  return o;
}
// 空的章自動上鎖：連到「還沒有任何標題的章」的地點，藥師看到的是「🔒 尚未開放」（點了說還在整理）；寫好第一個標題就自動打開。
// 開發者（dev）不鎖，只多一個 empty（網頁上標籤框線變虛線，提醒這一章還是空的）。回傳一份新的 cat（原本的不動）。
function _yzMapEmptyCh_(hb) {
  var o = {};
  ((hb && hb.chapters) || []).forEach(function (c) { if (!(((hb.titles || {})[c.id]) || []).length) o[c.id] = 1; });
  return o;
}
function _yzMapLive_(cat, hb, dev) {
  if (!cat || !hb) return cat;
  var emp = _yzMapEmptyCh_(hb);
  return Object.assign({}, cat, { spots: ((cat && cat.spots) || []).map(function (s) {
    var m = /^c:(.+)$/.exec(String(s && s.to || ""));
    if (!m || !emp[m[1]] || (s && s.st === "lock")) return s;
    return Object.assign({}, s, dev ? { empty: true } : { st: "lock" });
  }) });
}
function _yzMapSpots_(cat) {   // 能用的地點（連結看得懂或是「尚未開放」、位置大小是數字），整理成乾淨的一份
  var out = [];
  ((cat && cat.spots) || []).forEach(function (s) { if (_yzMapSpotOk_(s)) out.push(_yzMapNorm_(s)); });
  return out;
}
function _yzMapOrder_(spots) {   // 閱讀順序：由上到下，同一排由左到右（備用按鈕用）
  return spots.slice().sort(function (a, b) { var ra = Math.floor((a.y + a.h / 2) / 25), rb = Math.floor((b.y + b.h / 2) / 25); return ra - rb || a.x - b.x; });
}
function _yzMapDims_(cat) {   // 這張目錄卡片在手機上的大小：{ sz, px（寬）, ih（圖高）}
  var sz = (cat && cat.size) || "giga", px = YZ_BUBBLE_PX[sz] || 340, ar = String((cat && cat.ar) || "20:13").split(":"), aw = Number(ar[0]) || 20, ah = Number(ar[1]) || 13;
  return { sz: sz, px: px, ih: px * ah / aw };
}
function _yzMapIcoOf_(s) { return s.st === "lock" ? "🔒" : s.ico; }
function _yzMapPillW_(s) {   // 標籤的寬（px，估計）：字 ＋ 圖示 ＋ 紅點 ＋ 前後留白
  if (!s.label) return 0;
  return Math.ceil(_yzTxtW_(s.label, YZ_MAP_PILL_PX) * 1.04 + (_yzMapIcoOf_(s) ? YZ_MAP_ICO + 3 : 0) + (s.st === "new" ? 11 : 0) + 17);
}
// 一個地點在手機卡片上的位置（px，圖的左上角算 0,0）：圓點中心、標籤、圓點。給畫卡片和檢查共用，所以檢查講的就是實際畫出來的樣子。
function _yzMapGeom_(s, cat) {
  var d = _yzMapDims_(cat), D = YZ_MAP_DOT, G = YZ_MAP_GAP, PH = YZ_MAP_PILL_H;
  var ax = (s.x + s.w / 2) / 100 * d.px, ay = (s.y + s.h / 2) / 100 * d.ih, pos = _yzMapPos_(s.pos);
  var show = !cat || cat.labels !== false, pw = show ? _yzMapPillW_(s) : 0, pill = null, x0, y0;
  if (pw) {
    x0 = pos === "l" ? ax - D / 2 - G - pw : pos === "r" ? ax + D / 2 + G : ax - pw / 2;
    y0 = pos === "t" ? ay - D / 2 - G - PH : pos === "b" ? ay + D / 2 + G : ay - PH / 2;
    pill = { x0: x0, y0: y0, x1: x0 + pw, y1: y0 + PH };
  }
  return { px: d.px, ih: d.ih, ax: ax, ay: ay, pos: pos, show: show, pw: pw, pill: pill, dot: { x0: ax - D / 2, y0: ay - D / 2, x1: ax + D / 2, y1: ay + D / 2 } };
}
function _yzMapAct_(s, hb) {   // 點了要做什麼：一般＝進到那一章；「尚未開放」＝只回一句「還在整理」
  var info = _yzMapToInfo_(s.to, hb), name = (s.label || (info.ok ? info.short : "") || "打開").slice(0, 20);
  if (s.st === "lock") return _yzPB_("yz=lock&p=" + (String(s.id).replace(/[^A-Za-z0-9_\-]/g, "") || "x"), name);
  return _yzPB_(_yzMapTo_(s.to), name);
}
// ① 物品框：透明的，蓋在物品上，點物品用
function _yzMapHit_(s, hb) {
  return { type: "box", layout: "vertical", position: "absolute", offsetStart: s.x + "%", offsetTop: s.y + "%", width: s.w + "%", height: s.h + "%", action: _yzMapAct_(s, hb), contents: [{ type: "filler" }] };
}
// ② 標籤方塊：白色小標籤（圖示＋名稱）＋圓點。標籤在圓點的上／下／左／右；方塊本身至少 44 px 高，加上「點了要做什麼」。
function _yzMapTag_(s, cat, hb) {
  var g = _yzMapGeom_(s, cat), D = YZ_MAP_DOT, G = YZ_MAP_GAP, PH = YZ_MAP_PILL_H, P = 4, SL = 10, lock = s.st === "lock";
  var ink = lock ? YZ_MAP_LOCK_INK : YZ_ACCENT, dotCol = lock ? YZ_MAP_LOCK_DOT : YZ_ACCENT, ico = _yzMapIcoOf_(s);
  var dot = { type: "box", layout: "vertical", flex: 0, width: D + "px", height: D + "px", cornerRadius: (D / 2) + "px", borderWidth: "2px", borderColor: "#FFFFFF", backgroundColor: dotCol, contents: [{ type: "filler" }] };   // 方塊一定要有內容，所以放一個 filler
  var kids = [];
  if (g.pw) {
    if (ico) kids.push({ type: "text", text: ico, size: "xxs", flex: 0, gravity: "center" });
    kids.push({ type: "text", text: s.label, size: "xxs", weight: "bold", color: lock ? ink : "#13312F", flex: 0, gravity: "center" });
    if (s.st === "new") kids.push({ type: "text", text: "●", size: "xxs", color: YZ_MAP_NEW, flex: 0, gravity: "center" });
  }
  var pill = g.pw ? { type: "box", layout: "horizontal", flex: 0, spacing: "xs", backgroundColor: lock ? "#EEF0F3F2" : "#FFFFFFF2", borderWidth: "1px", borderColor: lock ? "#9AA3AE" : YZ_MAP_INK_BORDER, cornerRadius: "8px", paddingTop: "3px", paddingBottom: "3px", paddingStart: "7px", paddingEnd: "8px", contents: kids } : null;
  function center(n, margin) { var b = { type: "box", layout: "horizontal", contents: [{ type: "filler" }, n, { type: "filler" }] }; if (margin) b.margin = margin + "px"; return b; }
  var b = { type: "box", position: "absolute", action: _yzMapAct_(s, hb) }, wpx, left, top;
  if (g.pos === "t" || g.pos === "b") {
    // 方塊左右對稱地包住標籤和圓點，圓點才會剛好在物品框中間；靠近圖的邊緣時，先縮小多留的空間，真的放不下才整個推回圖裡面
    var half = Math.max(Math.max(g.pw, D) / 2 + P + SL / 2, 28), room = Math.min(g.ax, g.px - g.ax), need = Math.max(g.pw, D) / 2 + 1;
    if (half > room) half = Math.max(need, room);
    wpx = half * 2; left = g.ax - half; top = (g.pos === "t" ? (g.pill ? g.pill.y0 : g.dot.y0) : g.dot.y0) - P;
    b.layout = "vertical"; b.paddingTop = P + "px"; b.paddingBottom = P + "px";
    b.contents = !pill ? [center(dot)] : g.pos === "t" ? [center(pill), center(dot, G)] : [center(dot), center(pill, G)];
  } else {
    var pv = Math.round((YZ_MAP_TAP - PH) / 2), min = (g.pw ? g.pw + G : 0) + D + P + 1;
    wpx = min + P + SL - 1; top = g.ay - PH / 2 - pv;
    if (g.pos === "l") { var right = g.ax + D / 2 + P; if (right - wpx < 0) wpx = Math.max(min, right); left = right - wpx; }
    else { left = g.ax - D / 2 - P; if (left + wpx > g.px) wpx = Math.max(min, g.px - left); }
    b.layout = "horizontal"; b.paddingTop = pv + "px"; b.paddingBottom = pv + "px"; b.alignItems = "center";   // 上下置中：box 要用 alignItems（box 沒有 gravity，放了 LINE 會整則退回＝沒反應）
    if (!pill) b.contents = [{ type: "filler" }, dot, { type: "filler" }];
    else if (g.pos === "l") { pill.margin = "none"; dot.margin = G + "px"; b.contents = [{ type: "filler" }, pill, dot]; b.paddingEnd = P + "px"; }
    else { pill.margin = G + "px"; b.contents = [dot, pill, { type: "filler" }]; b.paddingStart = P + "px"; }
  }
  // 圖的邊緣：整個方塊不能超出圖（超出的部分 LINE 不顯示）。真的超出了，就把方塊整個推回圖裡面（圓點會跟著偏一點，檢查會提醒）。
  // 百分比要四捨五入成整數，所以先算寬，再算位置，保證「位置＋寬」不會超過 100%。
  var hpx = g.pos === "t" || g.pos === "b" ? 2 * P + D + (g.pw ? PH + G : 0) : PH + 2 * Math.round((YZ_MAP_TAP - PH) / 2);
  var wp = Math.min(100, Math.max(1, Math.round(wpx / g.px * 100))), lp = Math.round(left / g.px * 100), hp = Math.min(100, Math.ceil(hpx / g.ih * 100)), tp = Math.round(top / g.ih * 100);
  if (lp + wp > 100) lp = 100 - wp; if (lp < 0) lp = 0;
  if (tp + hp > 100) tp = 100 - hp; if (tp < 0) tp = 0;
  b.offsetStart = lp + "%"; b.offsetTop = tp + "%"; b.width = wp + "%";
  return b;
}
// 備用：每個地點一個按鈕，兩個一排（LINE 圖上的方塊萬一不能點，還有這個）
function _yzMapButtons_(spots, hb) {
  var list = _yzMapOrder_(spots), rows = [];
  for (var i = 0; i < list.length; i += 2) {
    var pair = [list[i], list[i + 1]].filter(Boolean).map(function (s) {
      var a = _yzMapAct_(s, hb); if (s.st === "lock") a = _yzPB_(a.data, ("🔒 " + (a.label || "")).slice(0, 20));
      return { type: "button", style: "secondary", height: "sm", flex: 1, action: a };
    });
    if (pair.length === 1) pair.push({ type: "filler" });
    rows.push({ type: "box", layout: "horizontal", spacing: "sm", contents: pair });
  }
  return rows;
}
// 目錄圖的卡片。「圖片直接顯示」關掉時，圖不放，改成「每個地點一個按鈕」（保密設定一樣管得到這張圖）。
function _yzMapBubble_(cat, hb, o) {
  cat = cat || {}; o = o || {};
  var spots = _yzMapSpots_(cat).slice(0, YZ_MAP_MAX), direct = YZ_CFG.imgDirect !== false && !!cat.img, foot = [], part = o.part === 0 || o.part === 1 ? o.part : -1;
  var b = { type: "bubble", size: cat.size || "giga" };
  if (part < 0) b.header = _yzHead_("📘 藥戰手冊　目錄", cat.title || "目錄", cat.hint || "");
  else b.header = _yzHead_("📘 藥戰手冊　目錄（" + (part + 1) + "／2）", cat.title || "目錄", part === 0 ? "👉 往左滑，還有右半邊" : "👈 往右滑，回到左半邊");
  if (direct) {
    var cs = [{ type: "image", url: cat.img, size: "full", aspectMode: "cover", aspectRatio: cat.ar || _yzAR_(cat.w || 1000, cat.h || 650) }];
    spots.forEach(function (s) { cs.push(_yzMapHit_(s, hb)); });                                              // 先放物品框（在下面）
    if (cat.labels !== false) spots.forEach(function (s) { cs.push(_yzMapTag_(s, cat, hb)); });               // 再放標籤（在上面）
    b.hero = { type: "box", layout: "vertical", paddingAll: "0px", contents: cs };
    if (cat.btns) foot = foot.concat(_yzMapButtons_(spots, hb));
  } else {
    b.body = { type: "box", layout: "vertical", paddingAll: "13px", contents: [{ type: "text", text: "🖼 為了保密，目錄圖不直接顯示。請按下面的按鈕選地方。", size: "xs", color: "#5F6B7A", wrap: true }] };
    foot = foot.concat(_yzMapButtons_(spots, hb));
  }
  foot.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=chs", "📚 全部章元（文字）") });
  foot.push(_yzFoot_());
  b.footer = { type: "box", layout: "vertical", spacing: "sm", paddingAll: "10px", contents: foot };
  return b;
}
// ── 很寬的目錄圖（像「圖一」那種環景）：LINE 一張卡片太矮、標籤會擠在一起，所以切成「左右兩張」，左右滑著看 ──
// cat.parts ＝ [{ img, fname, x0, x1, w, h }, { … }]：切好的兩張圖（網頁編輯器換圖時自動切、自動上傳，檔名一樣是亂碼）；
//   x0、x1 ＝ 這一張是原圖的「幾 % 到幾 %」。cat.split ＝ 要不要切（沒填＝要；圖不寬、或還沒切好，就照舊一張）。
// 地點照「圓點在哪一半」分到左邊或右邊那張，位置換算成那一張的 %（物品框跨過切線的，超出的部分 LINE 不顯示，標籤和圓點還是在）。
var YZ_MAP_WIDE = 1.8;                     // 寬是高的幾倍以上，算「很寬」
var YZ_MAP_CUTS = [[0, 52], [48, 100]];    // 左右兩張各佔原圖的幾 %（中間重疊 4 %，中間附近的東西兩張都看得到）
function _yzMapRatio_(cat) {
  var a = String((cat && cat.ar) || "").split(":"), w = Number(a[0]), hh = Number(a[1]);
  if (w > 0 && hh > 0) return w / hh;
  return cat && cat.w > 0 && cat.h > 0 ? cat.w / cat.h : 0;
}
function _yzMapWide_(cat) { return _yzMapRatio_(cat) >= YZ_MAP_WIDE; }
function _yzMapSplitOn_(cat) {
  var p = (cat && cat.parts) || [];
  return !!(cat && cat.split !== false && p.length === 2 && p[0] && p[0].img && p[1] && p[1].img && p[1].x0 < p[0].x1);
}
function _yzMapPartCat_(cat, i) {   // 左（0）／右（1）那一張：圖換成切好的那一半，地點換算成那一半的 %
  var pt = cat.parts[i], span = Math.max(1, pt.x1 - pt.x0), mid = (cat.parts[0].x1 + cat.parts[1].x0) / 2;
  var spots = (cat.spots || []).filter(function (s) { return s && isFinite(Number(s.x)) && isFinite(Number(s.w)); }).filter(function (s) {
    var cx = Number(s.x) + Number(s.w) / 2; return i === 0 ? cx < mid : cx >= mid;
  }).map(function (s) {
    var x0 = (Number(s.x) - pt.x0) / span * 100, x1 = (Number(s.x) + Number(s.w) - pt.x0) / span * 100, cx = (x0 + x1) / 2, hw = (x1 - x0) / 2;
    hw = Math.min(hw, cx, 100 - cx);   // 跨過切線的物品框：以圓點為中心縮小，圓點位置不變
    var wi = Math.max(1, Math.round(hw * 2)), xi = Math.max(0, Math.min(100 - wi, Math.round(cx - wi / 2)));   // 換成整數 %（圓點最多偏 0.5 %）
    return Object.assign({}, s, { x: xi, w: wi });
  });
  return Object.assign({}, cat, { img: pt.img, fname: pt.fname, ar: _yzAR_(pt.w || 1, pt.h || 1), w: pt.w, h: pt.h, spots: spots, parts: null, split: false });
}
function _yzMapHome_(cat, hb) {   // 「🏠 首頁」（以前叫「📚 目錄」）回的那一則：切好了＝兩張一排（左右滑）；不然照舊一張
  if (!_yzMapSplitOn_(cat) || YZ_CFG.imgDirect === false) return _yzMapBubble_(cat, hb);
  return { type: "carousel", contents: [0, 1].map(function (i) { return _yzMapBubble_(_yzMapPartCat_(cat, i), hb, { part: i }); }) };
}
// 點了「🔒 尚未開放」的地方，機器人回的那一張小卡
function _yzMapLockedBubble_(cat, pid) {
  var s = null; ((cat && cat.spots) || []).forEach(function (x) { if (x && String(x.id).replace(/[^A-Za-z0-9_\-]/g, "") === pid) s = x; });
  var nm = s ? _yzMapStr_(s.label) : "";
  return _yzNoticeBubble_("🔒 這一章還沒開放", [(nm ? "「" + nm + "」" : "這一章") + "還在整理中。", "開放以後，這裡的標籤會變回彩色。", "先看看其他章：按「🏠 首頁」。"], "warn");
}
// 哪些章在圖上點得到（有地點直接連到那一章，或連到那一章底下的某個標題）
function _yzMapCovered_(cat, hb) {
  var hit = {}, spots = _yzMapSpots_(cat);
  spots.forEach(function (s) {
    var m = /^([ct]):(.+)$/.exec(s.to || ""); if (!m) return;
    if (m[1] === "c") hit[m[2]] = 1; else { var f = _yzFindTitle_(hb, m[2]); if (f) hit[f.ch.id] = 1; }
  });
  var cov = [], un = [];
  ((hb && hb.chapters) || []).forEach(function (c) { (hit[c.id] ? cov : un).push(c); });
  return { covered: cov, uncovered: un };
}
function _yzMapCps_(s) { var n = 0; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); if (c >= 0xDC00 && c <= 0xDFFF) continue; n++; } return n; }
function _yzMapBox_(a, b) { var w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0); return w > 0 && h > 0 ? w * h : 0; }
// 檢查（給編輯器、測試用）：每個地點的問題＋整張圖的問題。lv：bad（一定要改）／warn（建議改）
// 圖切成左右兩張的時候：「位置、大小」的問題（標籤擠不擠、會不會超出邊）照 LINE 上實際那一張（左／右半張）檢查。
function _yzMapCheck_(cat, hb) {
  cat = cat || {};
  if (!_yzMapSplitOn_(cat)) {
    var one = _yzMapCheck1_(cat, hb, { basic: true, geom: true });
    if (cat.img && _yzMapWide_(cat)) { one.general.push({ lv: "warn", msg: "圖很寬（寬是高的 " + (Math.round(_yzMapRatio_(cat) * 10) / 10) + " 倍）：LINE 一張卡片會很矮、標籤擠在一起。建議打開「LINE 切成左右兩張」。" }); one.warn++; }
    return one;
  }
  var out = _yzMapCheck1_(cat, hb, { basic: true, geom: false });
  out.parts = [];
  [0, 1].forEach(function (i) {
    var r = _yzMapCheck1_(_yzMapPartCat_(cat, i), hb, { basic: false, geom: true, pmax: YZ_MAP_PILL_MAX_HALF, tag: i ? "（LINE 右半張）" : "（LINE 左半張）" });
    Object.keys(r.spots).forEach(function (id) { out.spots[id] = (out.spots[id] || []).concat(r.spots[id]); });
    out.bad += r.bad; out.warn += r.warn; out.parts.push({ px: r.px, ih: r.ih, n: r.n });
  });
  if (cat.img) {
    var car = _yzMapHome_(Object.assign({}, cat, { img: YZ_MAP_URL_SAMPLE, parts: cat.parts.map(function (pt) { return Object.assign({}, pt, { img: YZ_MAP_URL_SAMPLE }); }) }), hb || {});
    out.bytes = _yzBytes_(car);
    if (out.bytes > YZ_MSG_SAFE) { out.general.push({ lv: "bad", msg: "左右兩張的目錄卡片一共約 " + Math.round(out.bytes / 100) / 10 + " KB，超過 LINE 一則訊息的上限（我們抓 " + Math.round(YZ_MSG_SAFE / 1000) + " KB）：減少地點，或關掉「圖下面加按鈕」。" }); out.bad++; }
  }
  return out;
}
// 檢查一張卡片。o.basic：連結、名稱長度、說明、整張圖的問題；o.geom：位置、大小（標籤擠不擠、會不會超出邊、卡片多大）；o.tag：訊息前面加的字
function _yzMapCheck1_(cat, hb, o) {
  cat = cat || {}; o = o || { basic: true, geom: true };
  var d = _yzMapDims_(cat), px = d.px, ih = d.ih, sz = d.sz, tag = o.tag || "";
  var out = { px: px, ih: ih, general: [], spots: {}, bad: 0, warn: 0, info: 0, uncovered: [], bytes: 0, n: 0 };
  function G(lv, msg) { if (!o.basic) return; out.general.push({ lv: lv, msg: msg }); out[lv]++; }
  function S(id, lv, msg) { (out.spots[id] = out.spots[id] || []).push({ lv: lv, msg: tag + msg }); out[lv]++; }
  function SB(id, lv, msg) { if (o.basic) S(id, lv, msg); }
  function SG(id, lv, msg) { if (o.geom) S(id, lv, msg); }
  if (!cat.img) G("bad", "還沒有目錄圖：沒有圖的時候，LINE 和網頁的目錄會改回「章元卡片」。");
  var all = ((cat.spots || []).filter(function (s) { return s; }));
  out.n = all.length;
  if (!all.length) G("warn", "圖上還沒有任何地點。按「＋新增地點」，或在圖上快點兩下。");
  if (all.length > YZ_MAP_MAX) G("warn", "地點有 " + all.length + " 個，超過 " + YZ_MAP_MAX + " 個：多出來的不會放到 LINE 卡片上。");
  var items = [], labelsOn = cat.labels !== false;
  all.slice(0, YZ_MAP_MAX).forEach(function (s0) {
    var id = s0.id, n = _yzMapNorm_(s0), info = _yzMapToInfo_(s0.to, hb), wpx = n.w / 100 * px, hpx = n.h / 100 * ih, g = _yzMapGeom_(n, cat), nm = n.label || info.short || "（沒有名稱）";
    if (!info.ok && n.st !== "lock") SB(id, "bad", "連到的章或標題找不到（可能被刪掉了），請重新選一個。");
    if (Number(s0.x) < 0 || Number(s0.y) < 0 || Number(s0.x) + Number(s0.w) > 100 || Number(s0.y) + Number(s0.h) > 100) SB(id, "warn", "物品框超出圖片邊界：超出的部分 LINE 不會顯示。");
    var mn = Math.min(wpx, hpx);
    if (mn < YZ_MAP_RECT_WARN) SG(id, "warn", "物品框偏小：在「" + sz + "」卡片上只有約 " + Math.round(wpx) + "×" + Math.round(hpx) + " px，點物品不太容易（標籤本身還是點得到）。建議框大一點。");
    if (labelsOn) {
      if (!n.label) SB(id, "warn", "沒有名稱：圖上只會有一顆圓點，沒有標籤。");
      else {
        if (g.pw > (o.pmax || YZ_MAP_PILL_MAX)) SG(id, "warn", "標籤「" + n.label + "」約 " + g.pw + " px 寬，太長：在手機上會擠到旁邊的標籤。字數少一點（4 個字最剛好），或不放圖示。");
        var p = g.pill;
        if (p.x0 < -1 || p.x1 > px + 1 || p.y0 < -1 || p.y1 > ih + 1) SG(id, "warn", "標籤超出圖片邊界（" + (p.x0 < -1 ? "左" : p.x1 > px + 1 ? "右" : p.y0 < -1 ? "上" : "下") + "邊）：超出的部分 LINE 不會顯示，圓點也會偏一點。換一個標籤方向，或把物品框往圖裡面移。");
      }
    }
    if (n.label.length > 20) SB(id, "warn", "名稱超過 20 個字：LINE 的按鈕上最多放 20 個字。");
    if (n.desc.length > 30) SB(id, "warn", "說明超過 30 個字：網頁底下的說明卡一行放不下，會被切掉。");
    if (n.ico && _yzMapCps_(n.ico) > 4) SB(id, "warn", "圖示請只放一個符號（一個表情符號）。");
    items.push({ id: id, name: nm, n: n, g: g, r: { x0: n.x / 100 * px, y0: n.y / 100 * ih, x1: (n.x + n.w) / 100 * px, y1: (n.y + n.h) / 100 * ih } });
  });
  for (var i = 0; i < items.length && o.geom; i++) for (var j = i + 1; j < items.length; j++) {
    var a = items[i], b = items[j];
    var ov = _yzMapBox_(a.r, b.r);
    if (ov && ov / Math.min((a.r.x1 - a.r.x0) * (a.r.y1 - a.r.y0), (b.r.x1 - b.r.x0) * (b.r.y1 - b.r.y0)) > 0.25) {
      S(a.id, "warn", "物品框和「" + b.name + "」疊在一起（疊到的地方，點到的是排在後面的那一個）。"); S(b.id, "warn", "物品框和「" + a.name + "」疊在一起（疊到的地方，點到的是排在後面的那一個）。");
    }
    if (labelsOn && a.g.pill && b.g.pill && _yzMapBox_(a.g.pill, b.g.pill) > 0) { S(a.id, "warn", "標籤和「" + b.name + "」的標籤疊在一起。換一個標籤方向（上／下／左／右），或把其中一個物品框移開。"); S(b.id, "warn", "標籤和「" + a.name + "」的標籤疊在一起。換一個標籤方向（上／下／左／右），或把其中一個物品框移開。"); }
  }
  if (labelsOn && o.geom) for (var k = 0; k < items.length; k++) for (var m = 0; m < items.length; m++) {
    if (k !== m && items[k].g.pill && _yzMapBox_(items[k].g.pill, items[m].g.dot) > 0) S(items[k].id, "warn", "標籤蓋住了「" + items[m].name + "」的圓點。換一個標籤方向。");
  }
  if (!o.basic) return out;
  var cv = _yzMapCovered_(cat, hb || {});
  out.uncovered = cv.uncovered;
  if (cv.uncovered.length && all.length) G("warn", "有 " + cv.uncovered.length + " 章在圖上沒有地方可以點：" + cv.uncovered.slice(0, 4).map(function (c) { return "「" + c.name + "」"; }).join("、") + (cv.uncovered.length > 4 ? "…" : "") + "。（LINE 的「📚 全部章元」按鈕、網頁首頁的「☰ 章元」，還是找得到它們。）");
  var emp = _yzMapEmptyCh_(hb || {}), lk = [];
  all.slice(0, YZ_MAP_MAX).forEach(function (s0) { var m0 = /^c:(.+)$/.exec(String(s0.to || "")); if (m0 && emp[m0[1]] && s0.st !== "lock") lk.push(s0.label || m0[1]); });
  if (lk.length) G("info", "有 " + lk.length + " 個地點連到「還沒有標題」的章（" + lk.slice(0, 4).join("、") + (lk.length > 4 ? "…" : "") + "）：藥師看到的是🔒，點了說「還在整理」；那一章寫好第一個標題，就自動打開。");
  if (cat.img && o.geom) {
    out.bytes = _yzBytes_(_yzMapBubble_(Object.assign({}, cat, { img: YZ_MAP_URL_SAMPLE }), hb || {}));
    if (out.bytes > YZ_BUBBLE_SAFE) G("bad", "這張目錄卡片約 " + Math.round(out.bytes / 100) / 10 + " KB，超過 LINE 的上限（我們抓 " + Math.round(YZ_BUBBLE_SAFE / 1000) + " KB）：減少地點，或關掉「圖下面加按鈕」。");
    else if (out.bytes > YZ_MAP_WARN_BYTES) G("warn", "這張目錄卡片約 " + Math.round(out.bytes / 100) / 10 + " KB，快到 LINE 的上限了（我們抓 " + Math.round(YZ_BUBBLE_SAFE / 1000) + " KB）：地點再多就放不下。");
  }
  return out;
}

// ── 標題清單：一章一張，每個標題一行，點了開內容 ──
function _yzTitleListBubble_(ch, titles, o) {
  o = o || {};
  var rows = [];
  titles.forEach(function (t, i) {
    if (i > 0) rows.push({ type: "separator", color: "#E3E7EC" });
    rows.push({
      type: "box", layout: "horizontal", paddingAll: "10px", spacing: "sm", action: _yzPB_("yz=t&t=" + t.id, "打開"),
      contents: [
        { type: "text", text: t.name, size: "sm", wrap: true, color: "#1F1F1F", flex: 1 },
        _yzPageShort_(t.page) ? { type: "text", text: _yzPageShort_(t.page), size: "xxs", color: "#8A6D00", flex: 0, gravity: "center" } : null,
        { type: "text", text: "›", size: "lg", color: YZ_ACCENT, flex: 0, gravity: "center" }
      ].filter(Boolean)
    });
  });
  var nm = (ch.ico ? ch.ico + " " : "") + ch.name, sub = titles.length + " 個標題，點一個看內容";
  return _yzTopOf_({
    type: "bubble", size: "mega",
    body: { type: "box", layout: "vertical", paddingAll: "4px", contents: rows },
    footer: { type: "box", layout: "vertical", paddingAll: "8px", contents: (o.back || []).slice(0, 3).map(function (x) {   // 互相連結：從別的標題連到這一章的
      return { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=t&t=" + x.t.id, ("↩ " + _yzBackLabel_(x, ch.id)).slice(0, 20)) };
    }).concat([
      { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=home", "🏠 回首頁") },
      _yzFoot_()
    ]) }
  }, _yzThemeHero_(ch, "📘 藥戰手冊", nm, sub, "20:9"), function () { return _yzHead_("📘 藥戰手冊", nm, sub); });
}

// ── 階梯式內容（像法條：一層一層縮排，編號自動算）──
// 每一行只存「第幾層（lv）＋文字（v）」，編號是算出來的：加一行、搬一行，後面的編號自己跟著變。
var YZ_LADDER_MAX = 5;   // 最多 5 層
var YZ_LADDER_IMG_MAX = 20;   // 一段階梯式內容最多放幾張圖（編輯器的 🖼 按鈕到這個數就停用）
var YZ_LADDER_STYLES = {
  law: { name: "法條式", ex: "第一條／一、／（一）／1.／(1)" },
  cn:  { name: "條列式", ex: "一、／（一）／1.／(1)／①" },
  num: { name: "數字層級", ex: "1.／1.1／1.1.1／…" },
  dot: { name: "圓點縮排（不編號）", ex: "•／◦／▪／…" },
  plain: { name: "只縮排（不編號、不加記號）", ex: "前言、說明文字用" }
};
function _yzLadderNoNum_(st) { return st === "dot" || st === "plain"; }   // 這兩種沒有編號：「編號從哪裡開始」對它們沒有用，也不算「上一段」
var YZ_LADDER_STEP = { nano: 6, micro: 8, deca: 10, hecto: 12, kilo: 14, mega: 14, giga: 16 };   // LINE 卡片上，每往右一層縮進去幾 px（卡片越小縮越少）

function _yzCn_(n) {   // 1 → 一、12 → 十二、110 → 一百十（法條的寫法）
  var d = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  n = Math.floor(Number(n) || 0);
  if (n <= 0 || n >= 1000) return String(n);
  if (n < 10) return d[n];
  if (n < 20) return "十" + (n % 10 ? d[n % 10] : "");
  if (n < 100) return d[Math.floor(n / 10)] + "十" + (n % 10 ? d[n % 10] : "");
  var h = Math.floor(n / 100), r = n % 100, t = d[h] + "百";
  if (r === 0) return t;
  if (r < 10) return t + "零" + d[r];
  if (r < 20) return t + "十" + (r % 10 ? d[r % 10] : "");
  return t + d[Math.floor(r / 10)] + "十" + (r % 10 ? d[r % 10] : "");
}
function _yzCirc_(n) { return n >= 1 && n <= 20 ? String.fromCharCode(0x2460 + n - 1) : "(" + n + ")"; }

// 一行可以是「文字」{ lv, v }，也可以是「圖片」{ lv, img:{ url, cap, ar, … } }。圖片行沒有編號、不佔編號，掛在它上面那一個文字行底下。
function _yzLadderIsImg_(it) { return !!(it && it.img && typeof it.img === "object"); }
// 層級修正：第一行一定是第 1 層；每一行最多比上一個「文字行」多一層（圖片行不算上一行）；最多 5 層。回傳新的陣列，不動原本的。
function _yzLadderFix_(items) {
  var out = [], prev = 0;
  (items || []).forEach(function (it) {
    var lv = Math.floor(Number(it && it.lv) || 1);
    lv = Math.max(1, Math.min(YZ_LADDER_MAX, lv));
    if (lv > prev + 1) lv = prev + 1;
    if (_yzLadderIsImg_(it)) { out.push({ lv: lv, img: it.img }); return; }
    out.push({ lv: lv, v: it && it.v !== undefined && it.v !== null ? String(it.v) : "" });
    prev = lv;
  });
  return out;
}
// 要畫出來的行：空白的文字行、還沒有圖的圖片行不畫、也不佔編號；拿掉以後層級再修一次。LINE、網頁、編輯器都用這一份，三邊的編號才會一樣。
function _yzLadderShown_(it) {
  if (_yzLadderIsImg_(it)) return !!it.img.url;
  return !!(it && it.v !== undefined && it.v !== null && String(it.v).trim() !== "");
}
function _yzLadderRows_(b) {
  var items = _yzLadderFix_((b && b.items || []).filter(_yzLadderShown_));
  return { items: items, marks: _yzLadderMarks_(items, b && b.style, b && b.n0) };
}
// 這一段裡「會畫出來的圖片行」，照順序。「看大圖」按鈕用它的第幾張來找圖。
function _yzLadderImgs_(b) { return _yzLadderRows_(b).items.filter(_yzLadderIsImg_); }
// n0：第 1 層前面已經用掉幾號（「接續上一段」「自己指定」才有；0 ＝ 從第一條開始）。只縮排（plain）每一行都是 ""（不加記號）。
function _yzLadderMarks_(items, style, n0) {
  var st = YZ_LADDER_STYLES[style] ? style : "law", cnt = [0, 0, 0, 0, 0, 0], out = [];
  if (!_yzLadderNoNum_(st)) cnt[1] = Math.max(0, Math.floor(Number(n0) || 0));
  items.forEach(function (it) {
    if (_yzLadderIsImg_(it) || st === "plain") { out.push(""); return; }
    var lv = it.lv, k, n, m;
    cnt[lv]++; for (k = lv + 1; k <= YZ_LADDER_MAX; k++) cnt[k] = 0;
    n = cnt[lv];
    if (st === "law") m = lv === 1 ? "第" + _yzCn_(n) + "條" : lv === 2 ? _yzCn_(n) + "、" : lv === 3 ? "（" + _yzCn_(n) + "）" : lv === 4 ? n + "." : "(" + n + ")";
    else if (st === "cn") m = lv === 1 ? _yzCn_(n) + "、" : lv === 2 ? "（" + _yzCn_(n) + "）" : lv === 3 ? n + "." : lv === 4 ? "(" + n + ")" : _yzCirc_(n);
    else if (st === "num") { var p = []; for (k = 1; k <= lv; k++) p.push(Math.max(1, cnt[k])); m = p.join(".") + (lv === 1 ? "." : ""); }
    else m = ["•", "◦", "▪", "▫", "-"][lv - 1];
    out.push(m);
  });
  return out;
}
// ── 編號從哪裡開始（像法條分成好幾個標題：「藥師與民眾及病人」接在「總則」第六條後面，從第七條開始）──
// b.num：""（從頭開始）／"cont"（接續上一段）／"set"（自己指定：從 b.from 號開始，1～999）。
// 「上一段」＝同一章裡（照標題順序、段落順序）前面最近一段「有編號、也有字」的階梯式內容；圓點、只縮排的不算；不跨章。
// 算出來的放在 b.n0（第 1 層前面已經用掉幾號）。只放在記憶體、存檔時會被清掉，所以前面的條文增減，後面的號碼自動跟著變。
// LINE（讀資料時）、網頁（打開文章、搜尋時）、編輯器（每次畫編號時）都先跑一次。
// want（選填）：要問的那一段 → 回傳 { n0, prev }（prev ＝ 接在哪一段後面 { ch, t, last:最後一號, st:樣式 }；沒有就是 null）
var YZ_LADDER_FROM_MAX = 999;
function _yzLadderFrom_(v) { var n = Math.floor(Number(v)); return n >= 1 ? Math.min(YZ_LADDER_FROM_MAX, n) : 1; }
function _yzLadderNumberAll_(hb, want) {
  var ans = null;
  ((hb && hb.chapters) || []).forEach(function (c) {
    var prev = null;
    (((hb.titles || {})[c.id]) || []).forEach(function (t) {
      ((t && t.blocks) || []).forEach(function (b) {
        if (!b || b.t !== "ladder") return;
        var st = YZ_LADDER_STYLES[b.style] ? b.style : "law";
        var n0 = b.num === "cont" ? (prev ? prev.last : 0) : b.num === "set" ? _yzLadderFrom_(b.from) - 1 : 0;
        b.n0 = n0;
        if (b === want) ans = { n0: n0, prev: b.num === "cont" ? prev : null };
        if (_yzLadderNoNum_(st)) return;
        var n1 = 0;
        _yzLadderFix_((b.items || []).filter(_yzLadderShown_)).forEach(function (it) { if (it.lv === 1 && !_yzLadderIsImg_(it)) n1++; });
        if (n1) prev = { ch: c, t: t, last: n0 + n1, st: st };
      });
    });
  });
  return want ? (ans || { n0: 0, prev: null }) : hb;
}
// 第 n 號（第 1 層）用這個樣式寫出來長什麼樣子：7 → 第七條（法條式）、七、（條列式）、7.（數字層級）
function _yzLadderNoText_(st, n) { return _yzLadderMarks_([{ lv: 1, v: "x" }], st, Math.max(1, n) - 1)[0] || ""; }
// 記號欄要多寬（px），同一層取最寬的，文字才會對齊
function _yzMarkW_(m, px) {
  var w = 0;
  for (var i = 0; i < m.length; i++) {
    var c = m.charCodeAt(i), ch = m.charAt(i);
    if (c === 0x2022) w += 0.5;
    else if (c >= 0x2E80 || (c >= 0x2460 && c <= 0x25FF)) w += 1;
    else if (c >= 48 && c <= 57) w += 0.58;
    else if (ch === ".") w += 0.3;
    else if (ch === "(" || ch === ")") w += 0.4;
    else w += 0.6;
  }
  return Math.ceil(w * px) + 5;
}
// 階梯 → LINE 的幾個方塊。每一「條」（第 1 層）一個方塊，方塊和方塊之間才拆卡片（一條太長就在第 2 層再拆）。
function _yzLadderLines_(b, o) {
  o = o || {};
  var size = o.size || "sm", px = size === "xs" ? 13 : 14, r = _yzLadderRows_(b), mw = {};
  var st = YZ_LADDER_STYLES[b && b.style] ? b.style : "law";
  r.items.forEach(function (it, i) { if (_yzLadderIsImg_(it) || !r.marks[i]) return; var w = _yzMarkW_(r.marks[i], px); if (!mw[it.lv] || w > mw[it.lv]) mw[it.lv] = w; });   // 只縮排：沒有記號，就沒有記號欄
  var step = YZ_LADDER_STEP[o.bs || "giga"] || 14, chunks = [], cur = null, rows = 0, imgN = 0;
  r.items.forEach(function (it, i) {
    if (!cur || it.lv === 1 || (it.lv === 2 && rows >= 14)) { cur = { type: "box", layout: "vertical", spacing: "sm", contents: [] }; chunks.push(cur); rows = 0; }
    if (_yzLadderIsImg_(it)) {   // 圖片：縮排跟同一層的文字對齊（沒有文字的那一層，就只照層級縮）
      var inner = _yzImage_({ url: it.img.url, ar: it.img.ar, cap: it.img.cap }, o.act ? o.act(imgN) : null);
      imgN++;
      if (inner) { cur.contents.push({ type: "box", layout: "vertical", paddingStart: (step * (it.lv - 1) + (mw[it.lv] ? mw[it.lv] + 4 : 0)) + "px", contents: [inner] }); rows++; }
      return;
    }
    var strong = st === "law" && it.lv === 1, mk = r.marks[i];
    cur.contents.push({
      type: "box", layout: "horizontal", spacing: "sm", paddingStart: (step * (it.lv - 1)) + "px",
      contents: [
        mk ? { type: "box", layout: "vertical", flex: 0, width: mw[it.lv] + "px", contents: [{ type: "text", text: mk, size: size, color: strong ? YZ_ACCENT : "#4A5565", weight: strong ? "bold" : "regular" }] } : null,   // LINE 不收空白的文字：沒有記號就整欄不放
        { type: "text", text: it.v, size: size, color: "#1F1F1F", wrap: true, flex: 1 }
      ].filter(Boolean)
    });
    rows++;
  });
  return chunks;
}

// 一整段文字 → 階梯。開頭的編號決定層級（編號本身會拿掉，之後由程式重新算）；沒有編號的行接在上一行後面。
function _yzLadderGuess_(text) {
  var n = { law: 0, cn: 0, num: 0 };
  String(text === null || text === undefined ? "" : text).split("\n").slice(0, 40).forEach(function (l) {
    l = l.replace(/^[\s　]+/, "");
    if (/^第\s*(?:[一二三四五六七八九十百零〇]+|\d{1,3})\s*條/.test(l)) n.law++;
    else if (/^\d+\.\d+/.test(l)) n.num++;
    else if (/^(?:[一二三四五六七八九十百]+[、．.]|[（(][一二三四五六七八九十]+[）)])/.test(l)) n.cn++;
  });
  return n.law ? "law" : n.num ? "num" : n.cn ? "cn" : "";
}
// 圖片：整段文字裡用 ［圖］ 或 ［圖：圖說］ 單獨一行代表。old ＝ 這一段原本的行（要把原本的圖片接回去：第 1 個 ［圖］ 接原本的第 1 張圖，依序）。
// 回傳的 lostImgs ＝ 原本有、這次文字裡沒有對應 ［圖］ 的圖片張數（儲存的話，這幾張會不見）；emptyImgs ＝ ［圖］ 比原本的圖還多，多出來的是空位。
var YZ_LADDER_IMG_RE = /^[［\[]\s*圖\s*(?:[:：]\s*([^］\]]*?))?\s*[］\]]\s*$/;
function _yzLadderParse_(text, style, old) {
  var st = YZ_LADDER_STYLES[style] ? style : (_yzLadderGuess_(text) || "law");
  var pool = (old || []).filter(function (it) { return _yzLadderIsImg_(it) && it.img.url; }), emptyImgs = 0, lastTextLv = 0;
  var CN = "[一二三四五六七八九十百零〇]+";
  var reTiao = new RegExp("^第\\s*(?:" + CN + "|\\d{1,3})\\s*條[：:\\s]*");
  var reDun = new RegExp("^" + CN + "[、．.]\\s*");
  var rePar = new RegExp("^[（(]" + CN + "[）)]\\s*");
  var reDec = /^\d+(?:\.\d+)+[.、．]?\s*/;
  var reNum = /^\d{1,3}[.、．]\s*/;
  var reNumPar = /^[（(]\d{1,3}[）)]\s*/;
  var reCirc = /^[①-⑳]\s*/;
  var reDot = /^[•◦▪▫‣・●○■□\-–—]\s+/;
  var LV = {   // 各樣式：這種編號算第幾層
    law: { tiao: 1, dun: 2, par: 3, num: 4, npar: 5, circ: 5 },
    cn:  { tiao: 1, dun: 1, par: 2, num: 3, npar: 4, circ: 5 },
    num: { tiao: 1, dun: 1, par: 2, num: 1, npar: 3, circ: 4 },
    dot: { tiao: 1, dun: 1, par: 2, num: 1, npar: 2, circ: 3 }
  }[st];
  var items = [];
  String(text === null || text === undefined ? "" : text).replace(/\r/g, "").split("\n").forEach(function (raw) {
    if (!raw.trim()) return;
    var ind = /^([\s　]*)/.exec(raw)[1], line = raw.slice(ind.length), kind = "", m, lv = 0;
    var mi = YZ_LADDER_IMG_RE.exec(line.trim());
    if (mi) {
      var src = pool.shift(), im = src ? Object.assign({}, src.img) : { url: "", cap: "", ar: "4:3" };
      if (!src) emptyImgs++;
      im.cap = mi[1] ? mi[1].trim() : "";
      var icols = 0; for (var q = 0; q < ind.length; q++) icols += (ind.charAt(q) === "　" ? 2 : ind.charAt(q) === "\t" ? 4 : 1);
      items.push({ lv: ind ? 1 + Math.floor(icols / 2) : Math.max(1, lastTextLv), img: im });   // 有縮排就照縮排（每 2 格一層，跟 _yzLadderToText_ 寫出來的一樣）；沒縮排就跟上面那一行同一層
      return;
    }
    if (st === "plain") {   // 只縮排：不認編號、不拿掉任何字（行首的「一、」「1.」都當成文字）；一行一項，層級只看縮排（每 2 格一層）
      var pc = 0; for (var pq = 0; pq < ind.length; pq++) pc += (ind.charAt(pq) === "　" ? 2 : ind.charAt(pq) === "\t" ? 4 : 1);
      items.push({ lv: 1 + Math.floor(pc / 2), v: line.trim() }); lastTextLv = items[items.length - 1].lv;
      return;
    }
    if ((m = reTiao.exec(line))) { kind = "tiao"; }
    else if ((m = reDec.exec(line)) && st === "num") { kind = "dec"; lv = m[0].replace(/[.、．]?\s*$/, "").split(".").length; }
    else if ((m = reDun.exec(line))) { kind = "dun"; }
    else if ((m = rePar.exec(line))) { kind = "par"; }
    else if ((m = reNum.exec(line))) { kind = "num"; }
    else if ((m = reNumPar.exec(line))) { kind = "npar"; }
    else if ((m = reCirc.exec(line))) { kind = "circ"; }
    else if ((m = reDot.exec(line))) { kind = "dot"; }
    if (!kind) {
      var lastIt = items[items.length - 1];
      if (st === "dot" || !items.length) {   // 圓點縮排：沒有編號的行是新的一行，層級看縮排（每 2 格一層）
        var cols = 0; for (var i = 0; i < ind.length; i++) cols += (ind.charAt(i) === "　" ? 2 : ind.charAt(i) === "\t" ? 4 : 1);
        items.push({ lv: 1 + Math.floor(cols / 2), v: line.trim() }); lastTextLv = items[items.length - 1].lv;
      } else if (_yzLadderIsImg_(lastIt)) { items.push({ lv: Math.max(1, lastTextLv), v: line.trim() }); }   // 上一行是圖片：這一行另起一個文字行（跟上面那個文字行同一層）
      else lastIt.v += "\n" + line.trim();
      return;
    }
    var body = line.slice(m[0].length).trim();
    if (kind === "dot") { var c2 = 0; for (var j = 0; j < ind.length; j++) c2 += (ind.charAt(j) === "　" ? 2 : ind.charAt(j) === "\t" ? 4 : 1); lv = 1 + Math.floor(c2 / 2); }
    else if (kind !== "dec") lv = LV[kind];
    items.push({ lv: lv, v: body }); lastTextLv = lv;
  });
  return { items: _yzLadderFix_(items), style: st, lostImgs: pool.length, emptyImgs: emptyImgs };
}
// 階梯 → 一整段文字（編號＋縮排）。LINE 裡改整段、編輯器的「整段文字」都用它。n0：編號從哪裡開始（跟畫出來的一樣，見 _yzLadderNumberAll_）
function _yzLadderToText_(items, style, n0) {
  var r = _yzLadderRows_({ items: items, style: style, n0: n0 }), dot = style === "dot", plain = style === "plain";
  return r.items.map(function (it, i) {
    var pad = ""; for (var k = 1; k < it.lv; k++) pad += "　";
    if (_yzLadderIsImg_(it)) return pad + "［圖" + (String(it.img.cap || "").trim() ? "：" + String(it.img.cap).trim().replace(/[\r\n］\]]+/g, " ") : "") + "］";
    if (plain) return pad + it.v.replace(/\n/g, "\n" + pad);   // 只縮排：沒有記號；一行裡面換行的，下一行也照同一層縮排（讀回來是同一層的兩行）
    var m = r.marks[i];
    return pad + m + (/條$/.test(m) || dot ? " " : "") + it.v.replace(/\n/g, "\n" + pad + "　");   // 圓點後面要空一格，讀回來才分得出「記號」和「文字」
  }).join("\n");
}

// ── 內容：一個標題一張（文字、表格、圖片、備註）；太長就自動拆成幾張 ──
function _yzBlockNodes_(b, act, bs, ctx) {
  ctx = ctx || {};
  if (b.t === "text") return _yzTextLines_(b.v, { go: ctx.go, pics: b.pics, pact: ctx.pact ? function (id) { return ctx.pact(b, id); } : null });
  if (b.t === "ladder") return _yzLadderLines_(b, { bs: bs, act: act ? function (k) { return act(b, k); } : null });
  if (b.t === "table") { var x = _yzTable_(b, { bs: bs }); return x ? [x] : []; }
  if (b.t === "img") { var y = _yzImage_(b, act ? act(b) : null); return y ? [y] : []; }
  if (b.t === "anim" && b.kind !== "steps") { var z = _yzAnimFile_(b, { act: act ? act(b) : null, used: ctx.used, tid: ctx.tid }); return z ? [z] : []; }
  return [];   // 分步動畫（steps）不放在文字卡裡，由 _yzContentBubbles_ 另外做成一排卡片
}
function _yzContentBubble_(ch, ti, nodes, note, o) {
  o = o || {};
  var body = nodes.slice();
  if (o.noteOn === undefined ? !!note : o.noteOn) { var n = _yzNote_(note, ti.page); if (n) body.push(n); }
  var nav = [];
  if (o.prev) nav.push({ type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_(o.prev, "‹ 上一個") });
  if (o.next) nav.push({ type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_(o.next, "下一個 ›") });
  var foot = [];
  (o.back || []).forEach(function (x) { foot.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=t&t=" + x.t.id, ("↩ " + _yzBackLabel_(x, ch.id)).slice(0, 20)) }); });   // 互相連結：從這些標題連過來的
  if (nav.length) foot.push({ type: "box", layout: "horizontal", spacing: "sm", contents: nav });
  foot.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=c&c=" + ch.id, "📚 這一章的標題") });
  if (o.dev) foot.push({ type: "box", layout: "horizontal", spacing: "sm", contents: [
    { type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=ed&t=" + ti.id, "✏️ 修改") },
    o.editUrl ? { type: "button", style: "secondary", height: "sm", flex: 1, action: { type: "uri", label: "🌐 網頁編輯", uri: o.editUrl } } : null
  ].filter(Boolean) });
  foot.push(_yzFoot_());
  var part = o.parts > 1 ? "（第 " + o.part + "／" + o.parts + " 張）" : "";
  var top = "📘 藥戰手冊　" + (ch.ico ? ch.ico + " " : "") + ch.name;
  var hero = !o.part || o.part === 1 ? _yzThemeHero_(ch, top, ti.name, part || null, "20:7") : null;   // 第一張：主題圖；後面幾張：青綠色那條就好（省空間）
  return _yzTopOf_({
    type: "bubble", size: o.size || ti.size || "giga",
    body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "13px", contents: body.length ? body : [{ type: "text", text: "（這個標題還沒有內容）", size: "sm", color: "#7B8696" }] },
    footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "10px", contents: foot }
  }, hero, function () { return _yzHead_(top, ti.name, part || null); });
}
// 這一組的第一個元件前面至少空 m（已經空更多的就不動）。回傳新的陣列（第一個元件複製一份，不改原本的）
var YZ_GAPS = ["none", "xs", "sm", "md", "lg", "xl", "xxl"];
function _yzGapBefore_(nodes, m) {
  if (!nodes || !nodes.length) return nodes;
  var n0 = nodes[0], has = YZ_GAPS.indexOf(n0 && n0.margin);
  if (has >= YZ_GAPS.indexOf(m)) return nodes;
  return [Object.assign({}, n0, { margin: m })].concat(nodes.slice(1));
}
// blocks → 一則或多則訊息。回傳 {bubbles:[每則訊息（bubble 或 carousel）], bytes:[每則多大], parts:內容拆成幾段, cards:總共幾張卡片, kinds:["bubble"|"carousel"…], anim:n}
// 文字、表格、圖片、階梯式、動畫檔：塞進同一張卡片，太長就拆成下一張；分步動畫：每一步一張。
// 第 28 批：兩張以上的卡片合成一則「左右滑」的訊息（carousel）。
function _yzContentBubbles_(ch, ti, blocks, note, o) {
  o = o || {};
  var act = function (b, s) { return _yzPB_("yz=img&t=" + ti.id + "&i=" + (b.i === undefined ? 0 : b.i) + (s === undefined ? "" : "&s=" + s), "看大圖"); };
  var pact = function (b, id) { return _yzPB_("yz=img&t=" + ti.id + "&i=" + (b.i === undefined ? 0 : b.i) + "&p=" + id, "看大圖"); };   // 文字塊裡的圖
  var segs = [{ nodes: [] }], used = { n: 0 };   // used：已經放了幾張「會自己動」的圖（LINE 一則訊息最多 10 張，整個標題一起算比較保守）
  var cur = function () { return segs[segs.length - 1]; };
  var hasNote = !!_yzNote_(note, ti.page);
  var probe = function (nodes, last) { return _yzBytes_(_yzContentBubble_(ch, ti, nodes, note, { size: o.size, dev: o.dev, editUrl: o.editUrl, prev: o.prev, next: o.next, parts: 9, part: 9, noteOn: !!last, back: last ? back : null })); };
  var bs = o.size || ti.size || "giga";
  // 「連結到標題」的行：用標題代號找到標題，按鈕上寫「章名　標題名」（同一章就只寫標題名）；找不到（被刪了）就不顯示
  var goFn = o.hb ? function (id) { return _yzGoTarget_(o.hb, id, ch.id); } : null;
  var back = o.hb ? _yzBacklinks_(o.hb, [ti.id, ch.id], ti.id).slice(0, 3) : [];   // 互相連結：有連到這裡（這個標題、這一章）的，放在最後一張下面
  blocks.forEach(function (b, i) {
    b = Object.assign({}, b, { i: i });
    if (b.brk && i > 0 && cur().nodes && cur().nodes.length) segs.push({ nodes: [] });   // 編輯者指定「從這一塊開始放到下一張卡片」（只有 LINE；網頁照常一整頁）
    if (b.t === "anim" && b.kind === "steps") {
      var sb = _yzStepBubbles_(ch, ti, b, bs, { act: act });
      if (!sb.length) return;
      if (!cur().nodes.length) {
        if (segs.length === 1) segs[0] = { nodes: [{ type: "text", text: "🎞 下面是分步動畫，左右滑著看。", size: "sm", color: "#5F6B7A", wrap: true }] };   // 動畫排在最前面時，前面先放一張小卡（「上一個」按鈕才有地方放）
        else segs.pop();   // 前一個也是動畫：兩個直接接在一起，不留空卡
      }
      segs.push({ steps: sb }); segs.push({ nodes: [] });
      return;
    }
    var nodes = _yzIndentNodes_(_yzBlockNodes_(b, act, bs, { used: used, tid: ti.id, go: goFn, pact: pact }), _yzBlockInd_(b) * YZ_IND_PX);   // 整塊縮排（編輯器每一塊的 ⇤ ⇥）
    // 一個內容塊平常整塊放；階梯式內容常常很長，可以在「一條」和「一條」之間拆開；
    // 文字塊只有「自己一個就放不下」才一行一行拆。
    var units = [nodes];
    if (nodes.length > 1 && (b.t === "ladder" || (b.t === "text" && probe(nodes, false) > YZ_BUBBLE_SAFE))) units = nodes.map(function (n) { return [n]; });
    var gap = "xl";   // 一塊和一塊之間空大一點（第 27 批：太擠）；這一塊一開頭就是大標題：再空大一點（跟一塊裡面的大標題一樣）
    if (b.t === "text") { var L0 = _yzParseLines_(b.v).filter(function (L) { return L.k !== "gap"; })[0]; if (L0 && L0.k === "head" && L0.h <= 2) gap = "xxl"; }
    units.forEach(function (u, k) {
      var c = cur(), next = c.nodes.concat(k === 0 && c.nodes.length ? _yzGapBefore_(u, gap) : u);
      if (c.nodes.length && probe(next, false) > YZ_BUBBLE_SAFE) segs.push({ nodes: u }); else c.nodes = next;
    });
  });
  // 最後一段是空的（動畫後面沒有別的內容）：有備註就放備註；沒有就放一句收尾，「上一個／下一個」按鈕才有地方放
  var last = cur();
  if (!last.nodes.length && segs.length > 1 && !hasNote) last.nodes = [{ type: "text", text: "（動畫到這裡結束）", size: "sm", color: "#7B8696", wrap: true }];
  // 備註放最後一張；放不下就單獨一張
  if (hasNote && last.nodes.length && probe(last.nodes, true) > YZ_BUBBLE_SAFE) segs.push({ nodes: [] });
  var parts = segs.length, flat = [];
  segs.forEach(function (sg, i) {
    var lastOne = i === parts - 1;
    if (sg.steps) { flat = flat.concat(sg.steps); return; }
    flat.push(_yzContentBubble_(ch, ti, sg.nodes, note, { size: o.size, dev: o.dev && lastOne, editUrl: o.editUrl, prev: i === 0 ? o.prev : null, next: lastOne ? o.next : null, parts: parts, part: i + 1, noteOn: lastOne, back: lastOne ? back : null }));
  });
  // 第 28 批：兩張以上 → 一則「左右滑」的卡片（carousel，照順序：內容、分步動畫的每一步）。一排最多 12 張、一則不超過 YZ_MSG_SAFE；放不下就接下一則
  var out = [], bytes = [], kinds = [], grp = [];
  var flush = function () {
    if (!grp.length) return;
    var el = grp.length > 1 ? { type: "carousel", contents: grp } : grp[0];
    out.push(el); bytes.push(_yzBytes_(el)); kinds.push(grp.length > 1 ? "carousel" : "bubble");
    grp = [];
  };
  flat.forEach(function (b) {
    if (grp.length && (grp.length >= YZ_CAROUSEL_MAX || _yzBytes_({ type: "carousel", contents: grp.concat([b]) }) > YZ_MSG_SAFE)) flush();
    grp.push(b);
  });
  flush();
  return { bubbles: out, bytes: bytes, parts: parts, cards: flat.length, kinds: kinds, anim: used.n };
}

// ── 搜尋 ──
// 資料長這樣（hb）：{ chapters:[…], titles:{ 章id:[標題…] }, kws:[關鍵字…]（關鍵字功能已經拿掉，資料留在試算表，不再顯示） }
//   標題 ＝ { id, ch, name, page(藥戰手冊頁數), blocks:[…], note, … }
//   關鍵字 ＝ { id, name, alias:[別名…], pts:[ { v:重點, t:來源標題id, url:外部網址(選填) } ] }
var YZ_WHERE = { name: "標題", text: "內文", ladder: "條文", table: "表格", img: "圖說", ocr: "圖片裡的字", note: "備註", page: "頁數" };
var YZ_WEIGHT = { name: 50, text: 10, ladder: 10, table: 8, img: 5, ocr: 4, note: 6 };

function _yzTokens_(q) { return _yzNorm_(q).replace(/\s+/g, " ").trim().split(" ").filter(function (x) { return x; }); }
// 一小段字裡，哪些地方是搜尋的字：[{t:"文字", h:是不是搜尋的字}]。網頁用 <mark>，LINE 用粗體＋顏色。
// sq＝不管空白（圖片裡的字：辨識出來的「正班 33 分」也算「正班33分」，中間的空白一起標）
function _yzHL_(text, toks, sq) {
  text = String(text === null || text === undefined ? "" : text);
  var ns = _yzNorm_(text), mark = [], i, q = sq ? _yzSq_(ns) : { s: ns, map: null };
  for (i = 0; i < ns.length; i++) mark.push(false);
  (toks || []).forEach(function (tk) {
    if (!tk) return;
    var at = 0, k;
    while ((k = q.s.indexOf(tk, at)) >= 0) {
      var a = q.map ? q.map[k] : k, b = q.map ? q.map[k + tk.length - 1] : k + tk.length - 1;
      for (i = a; i <= b; i++) mark[i] = true;
      at = k + tk.length;
    }
  });
  var out = [], cur = null;
  for (i = 0; i < text.length; i++) {
    if (!cur || cur.h !== mark[i]) { cur = { t: "", h: mark[i] }; out.push(cur); }
    cur.t += text.charAt(i);
  }
  return out;
}
// ── 連結（第 27 批：標題和標題、標題和整章「互相連結」）──
// 一段文字裡，「連結」那幾行連到哪裡（標題或章的代號，照順序、不重複）
function _yzGoIds_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) { var m = /^[ 　\t]*\[go=([A-Za-z0-9_-]+)\]/.exec(ln); if (m && out.indexOf(m[1]) < 0) out.push(m[1]); });
  return out;
}
// 連結的目標：先找標題、再找章 → { kind:"t"|"c", id, ch, t, label }（找不到＝null：那一行不顯示）。fromCh＝現在這一章（同一章就不寫章名）
function _yzGoTarget_(hb, id, fromCh) {
  if (!hb || !id) return null;
  var f = _yzFindTitle_(hb, id);
  if (f) return { kind: "t", id: id, ch: f.ch, t: f.t, label: (fromCh && f.ch.id === fromCh ? "" : f.ch.name + "　") + (f.t.name || "（還沒有標題）") };
  var c = (hb.chapters || []).filter(function (x) { return x.id === id; })[0];
  return c ? { kind: "c", id: id, ch: c, t: null, label: c.name + "（整章）" } : null;
}
// 誰連到這裡（互相連結）：哪些標題的文字裡，有「連結」連到 ids 其中一個（這個標題、它這一章）→ [{ ch, t }]（照章、標題順序；自己不算）
function _yzBacklinks_(hb, ids, selfTid) {
  var out = [];
  ((hb && hb.chapters) || []).forEach(function (c) {
    (((hb.titles || {})[c.id]) || []).forEach(function (t) {
      if (!t || t.id === selfTid) return;
      var hit = (t.blocks || []).some(function (b) { return b && b.t === "text" && _yzGoIds_(b.v).some(function (g) { return ids.indexOf(g) >= 0; }); });
      if (hit) out.push({ ch: c, t: t });
    });
  });
  return out;
}
function _yzBackLabel_(x, fromCh) { return (fromCh && x.ch.id === fromCh ? "" : x.ch.name + "　") + (x.t.name || "（還沒有標題）"); }
function _yzFindTitle_(hb, tid) {
  var cs = hb.chapters || [];
  for (var i = 0; i < cs.length; i++) {
    var ts = (hb.titles || {})[cs[i].id] || [];
    for (var j = 0; j < ts.length; j++) if (ts[j].id === tid) return { ch: cs[i], t: ts[j] };
  }
  return null;
}
function _yzSrcLabel_(f) {   // 藥品補充　二、藥品請領…　｜藥戰手冊 第 14 頁
  var pg = _yzPageText_(f.t.page);
  return f.ch.name + "　" + f.t.name + (pg ? "｜藥戰手冊 " + pg : "");
}
// 去掉空白：{ s: 沒有空白的字, map: 每個字在原來的第幾個 }（圖片裡的字搜尋用）
function _yzSq_(s) {
  var o = "", map = [];
  for (var i = 0; i < s.length; i++) { var c = s.charAt(i); if (!/\s/.test(c)) { o += c; map.push(i); } }
  return { s: o, map: map };
}
// 圖片裡的字（第 27 批：照片裡的字也搜得到）：一行一行；好幾行的再加「接起來的一整段」（要找的字被拆在兩行也找得到）。
// sq＝比對時不管空白（辨識出來的字常常多空白：「正班 33 分」打「正班33分」也要找得到）
function _yzOcrUnits_(u, pic, i) {
  var ls = String((pic && pic.ocr) || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
  ls.forEach(function (l) { u.push({ k: "ocr", v: l, b: i, sq: 1 }); });
  if (ls.length > 1) u.push({ k: "ocr", v: ls.join(" "), b: i, sq: 1 });
}
// 文字塊裡的圖（第 28 批）：照 [img=代號] 那幾行的順序；圖不見了（pics 裡沒有）的不算
function _yzTextPics_(b) {
  var out = [];
  if (!b || b.t !== "text" || !b.pics || typeof b.pics !== "object") return out;
  _yzImgIds_(b.v).forEach(function (id) { var p = b.pics[id]; if (p && p.url) out.push(p); });
  return out;
}
// 一個標題裡所有「內容裡的圖」（圖片、階梯裡的圖、分步動畫的每一格、文字裡的圖）：圖片裡的字、圖片檢查都用這一份
function _yzTitlePics_(t) {
  var out = [];
  (t && t.blocks || []).forEach(function (b) {
    if (!b) return;
    if (b.t === "img") { if (b.url) out.push(b); }
    else if (b.t === "ladder") (b.items || []).forEach(function (it) { if (it && it.img && it.img.url) out.push(it.img); });
    else if (b.t === "anim" && b.kind === "steps") (b.steps || []).forEach(function (st) { if (st && st.url) out.push(st); });
    else if (b.t === "text") out = out.concat(_yzTextPics_(b));
  });
  return out;
}
// 圖片裡的字辨識了幾張（同一張圖只算一次）：{ n:全部, done:辨識過的, todo:還沒的 }
function _yzOcrStat_(hb) {
  var seen = {}, r = { n: 0, done: 0, todo: 0 };
  ((hb && hb.chapters) || []).forEach(function (c) {
    (((hb.titles || {})[c.id]) || []).forEach(function (t) {
      _yzTitlePics_(t).forEach(function (p) {
        var k = p.fid || p.url;
        if (!k || seen[k]) return;
        seen[k] = 1; r.n++;
        if (typeof p.ocr === "string") r.done++; else r.todo++;
      });
    });
  });
  return r;
}
// 一個標題裡「找得到的字」攤平成一行一行（標題、每行文字、階梯每條、表格每列、圖說、圖片裡的字、備註）
function _yzUnits_(t) {
  var u = [{ k: "name", v: String(t.name || ""), b: -1 }];
  (t.blocks || []).forEach(function (b, i) {
    if (b.t === "text") {
      _yzRtPlainLines_(b.v).forEach(function (ln) { u.push({ k: "text", v: ln, b: i }); });
      _yzTextPics_(b).forEach(function (p) { if (String(p.cap || "").trim()) u.push({ k: "img", v: String(p.cap).trim(), b: i }); _yzOcrUnits_(u, p, i); });   // 文字裡的圖：圖說、圖片裡的字
    }
    else if (b.t === "ladder") { var r = _yzLadderRows_(b); r.items.forEach(function (it, j) { if (_yzLadderIsImg_(it)) { if (String(it.img.cap || "").trim()) u.push({ k: "img", v: String(it.img.cap).trim(), b: i }); _yzOcrUnits_(u, it.img, i); return; } u.push({ k: "ladder", v: (r.marks[j] ? r.marks[j] + " " : "") + String(it.v).replace(/\n/g, " "), b: i }); }); }
    else if (b.t === "table") (b.rows || []).forEach(function (row, ri) {
      var s = (row || []).map(function (c) { return String(c === null || c === undefined ? "" : c).trim(); }).filter(Boolean).join(" ｜ ");
      if (s) u.push({ k: "table", v: s, b: i, h: ri === 0 && b.head !== false });   // h＝這一列是表頭
    });
    else if (b.t === "img") { if (b.cap) u.push({ k: "img", v: String(b.cap), b: i }); _yzOcrUnits_(u, b, i); }
    else if (b.t === "anim") {
      if (b.kind === "steps") (b.steps || []).forEach(function (st) { if (st && String(st.cap || "").trim()) u.push({ k: "img", v: String(st.cap).trim(), b: i }); _yzOcrUnits_(u, st, i); });
      else if (b.cap) u.push({ k: "img", v: String(b.cap), b: i });
    }
  });
  String(t.note || "").split("\n").forEach(function (ln) { if (ln.trim()) u.push({ k: "note", v: ln.trim(), b: -2 }); });
  return u;
}
function _yzSearchTitle_(t, toks) {
  var us = _yzUnits_(t), ns = us.map(function (u) { var n = _yzNorm_(u.v); return u.sq ? _yzSq_(n) : { s: n, map: null }; }), score = 0, ok = true, i;
  toks.forEach(function (tk) {
    var found = false;
    for (i = 0; i < us.length; i++) if (ns[i].s.indexOf(tk) >= 0) { score += found ? 1 : (YZ_WEIGHT[us[i].k] || 5); found = true; }
    if (!found) ok = false;
  });
  if (!ok) return null;
  var best = 0, bs = -1;   // 摘錄的那一句：含最多要找的字、而且最重要的
  for (i = 0; i < us.length; i++) {
    var n = 0; toks.forEach(function (tk) { if (ns[i].s.indexOf(tk) >= 0) n++; });
    if (!n) continue;
    var sc = n * 100 + (YZ_WEIGHT[us[i].k] || 5);
    if (sc > bs) { bs = sc; best = i; }
  }
  var u0 = us[best], v = u0.v, at = 0;
  if (u0.k === "name" && us.length > 1) { v = us[1].v; u0 = { k: "name" }; } else {
    var nb = ns[best]; at = nb.s.length; toks.forEach(function (tk) { var k = nb.s.indexOf(tk); if (k >= 0 && k < at) at = k; });
    if (nb.map) at = at < nb.map.length ? nb.map[at] : v.length;   // 不管空白比對的：換回原來的位置
  }
  var from = Math.max(0, at - 14), to = Math.min(v.length, from + 46);
  var snip = (from > 0 ? "…" : "") + v.slice(from, to) + (to < v.length ? "…" : "");
  return { score: score, where: u0.k, snip: snip, segs: _yzHL_(snip, toks, !!u0.sq) };
}
function _yzSearch_(hb, q) {
  var toks = _yzTokens_(q), pg = _yzPageQuery_(q), res = { q: String(q), toks: toks, page: pg, kws: [], hits: [] };
  if (!toks.length) return res;
  _yzLadderNumberAll_(hb);   // 條文的編號（接續上一段的）先算好：找「第七條」才找得到
  (hb.chapters || []).forEach(function (c) {
    ((hb.titles || {})[c.id] || []).forEach(function (t) {
      var hit = null;
      if (pg) { if (_yzPageHas_(t.page, pg)) { var tx = "藥戰手冊 " + _yzPageText_(t.page); hit = { score: 100, where: "page", snip: tx, segs: [{ t: tx, h: false }] }; } }
      else hit = _yzSearchTitle_(t, toks);
      if (hit) { hit.ch = c; hit.t = t; hit.ord = res.hits.length; res.hits.push(hit); }
    });
  });
  res.hits.sort(function (a, b) { return b.score - a.score || a.ord - b.ord; });
  return res;
}

function _yzSpans_(segs, o) {
  o = o || {};
  var t = { type: "text", size: o.size || "xs", wrap: true, color: o.color || "#5F6B7A", contents: segs.map(function (g) {
    var sp = { type: "span", text: g.t };
    if (g.h) { sp.weight = "bold"; sp.color = YZ_ACCENT; }
    return sp;
  }) };
  if (o.maxLines) t.maxLines = o.maxLines;
  return t;
}
// 搜尋結果卡
function _yzSearchBubble_(q, hits, more, o) {
  o = o || {};
  var rows = [];
  hits.forEach(function (h, i) {
    if (i > 0) rows.push({ type: "separator", color: "#E3E7EC" });
    var pg = _yzPageText_(h.t.page), label = (YZ_WHERE[h.where] && h.where !== "page" ? YZ_WHERE[h.where] : "");
    var meta = [label ? label + "有符合" : "", pg ? "📖 藥戰手冊 " + pg : ""].filter(Boolean).join("　");
    var c = [
      { type: "text", text: h.ch.name, size: "xxs", color: YZ_ACCENT, weight: "bold", wrap: true },
      { type: "text", text: h.t.name, size: "sm", weight: "bold", wrap: true, color: "#1F1F1F" }
    ];
    if (meta) c.push({ type: "text", text: meta, size: "xxs", color: "#8A6D00", wrap: true });
    if (h.segs && h.where !== "page") c.push(_yzSpans_(h.segs, { size: "xs", color: "#5F6B7A", maxLines: 2 }));
    rows.push({ type: "box", layout: "vertical", paddingAll: "9px", spacing: "xs", action: _yzPB_("yz=t&t=" + h.t.id, "打開"), contents: c });
  });
  if (more > 0) rows.push({ type: "text", text: "還有 " + more + " 筆，請把要找的字打得更精確。", size: "xs", color: "#7B8696", margin: "md", wrap: true });
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊　搜尋", o.page ? "藥戰手冊 第 " + o.page + " 頁" : "「" + q + "」", (hits.length + more) + " 筆" + (o.page ? "" : "（符合的字會用顏色標出來）")),
    body: { type: "box", layout: "vertical", paddingAll: "4px", contents: rows },
    footer: { type: "box", layout: "vertical", paddingAll: "8px", contents: [
      { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=home", "🏠 回首頁") },
      _yzFoot_()
    ] }
  };
}
// ── 提示用的小卡片（進入、退出、不查藥…） ──
function _yzNoticeBubble_(title, lines, kind) {
  var head = kind === "warn" ? { bg: "#8A5A00" } : { bg: YZ_ACCENT };
  return {
    type: "bubble", size: "mega",
    header: { type: "box", layout: "vertical", paddingAll: "12px", backgroundColor: head.bg, contents: [{ type: "text", text: title, size: "md", weight: "bold", color: "#FFFFFF", wrap: true }] },
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: lines.map(function (l) { return { type: "text", text: l, size: "sm", wrap: true, color: "#1F1F1F" }; }) }
  };
}

// ── 「手冊申請」的回覆（給要加入的同事）：說明＋一顆打開申請網頁的按鈕（url 空的＝不放按鈕）──
function _yzJoinBubble_(lines, url, label) {
  var b = {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊", "申請看藥戰手冊", "要員工代號＋開發者核可"),
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: lines.map(function (l) { return { type: "text", text: l, size: "sm", wrap: true, color: "#1F1F1F" }; }) }
  };
  if (url) b.footer = { type: "box", layout: "vertical", paddingAll: "10px", contents: [{ type: "button", style: "primary", color: YZ_ACCENT, height: "sm", action: { type: "uri", label: label || "📝 填申請", uri: url } }] };
  return b;
}

// ── 申請審核卡（給開發者）──
function _yzApprovalBubble_(rq) {
  var row = function (k, v) { return { type: "box", layout: "baseline", spacing: "sm", contents: [{ type: "text", text: k, size: "xs", color: "#7B8696", flex: 2 }, { type: "text", text: v, size: "sm", color: "#1F1F1F", flex: 5, wrap: true, weight: "bold" }] }; };
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊", "新的使用申請", "請確認是院內同事再核可"),
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: [row("LINE 名稱", rq.name), row("員工代號", rq.emp), row("申請時間", rq.at)] },
    footer: { type: "box", layout: "horizontal", spacing: "sm", paddingAll: "10px", contents: [
      { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", flex: 1, action: _yzPB_("yz=ok&u=" + rq.id, "✅ 核可") },
      { type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=no&u=" + rq.id, "✖ 拒絕") }
    ] }
  };
}

// ── 改前／改後確認卡（LINE 裡修改文字時）──
function _yzDiffBubble_(what, before, after) {
  var q = function (label, text, bg, fg) { return { type: "box", layout: "vertical", spacing: "xs", backgroundColor: bg, cornerRadius: "8px", paddingAll: "8px", contents: [{ type: "text", text: label, size: "xxs", weight: "bold", color: fg }, { type: "text", text: text || "（空白）", size: "sm", wrap: true, color: "#1F1F1F" }] }; };
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊　修改", what, "確認沒問題再按「儲存」"),
    body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "13px", contents: [q("改前", before, "#F3F4F6", "#6B7280"), q("改後", after, "#E3F4F2", YZ_ACCENT)] },
    footer: { type: "box", layout: "horizontal", spacing: "sm", paddingAll: "10px", contents: [
      { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", flex: 1, action: _yzPB_("yz=sv", "✅ 儲存") },
      { type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=cx", "取消") }
    ] }
  };
}

// ── 輸入框上面那排「釘住的按鈕」──
function _yzQuickBar_(mode, o) {
  o = o || {};
  var m = function (label, text) { return { label: label, text: text }; };
  if (mode === "yz") {
    var a = [m("💊 補藥神器", "補藥神器"), m("🏠 首頁", "首頁"), { label: "🌐 網頁", web: "yz" }];
    if (o.dev) a.push(m("🔧 開發者", "藥戰開發者"));
    return a;
  }
  var base = [{ label: "🌐 網頁", web: "app" }, m("📖 教學", "教學"), m("📢 藥品通知", "公告"), m("🛠 BUG", "bug"), m("👥 加入補藥神器", "加入補藥神器")];
  if (o.dev) base.push(m("🔧 開發者", "開發者"));
  return o.approved ? [m("📘 藥戰手冊", "藥戰手冊")].concat(base) : base;
}

/* ════════ flex.js ════════ */
/* flex.js — 把 LINE 的 Flex Message JSON 畫成網頁（只給預覽用；字級、間距、卡片寬度是照 LINE 畫面抓的近似值）。
 * 只實作這份預覽用得到的欄位：bubble／carousel、box、text（含 span）、image、button、separator、spacer。 */
var FlexView = (function () {
  var TS = { xxs: 11, xs: 13, sm: 14, md: 16, lg: 19, xl: 22, xxl: 29, "3xl": 35, "4xl": 40, "5xl": 46 };
  var SP = { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 20 };
  var BW = { nano: 120, micro: 160, deca: 200, hecto: 230, kilo: 260, mega: 300, giga: 340 };   // 近似值，實機才準（待實機確認）
  var IW = { xxs: 40, xs: 60, sm: 80, md: 100, lg: 120, xl: 160, xxl: 200, "3xl": 240, "4xl": 280, "5xl": 320 };
  var BH = { sm: 40, md: 52 };
  var JC = { "flex-start": "flex-start", center: "center", "flex-end": "flex-end", "space-between": "space-between", "space-around": "space-around", "space-evenly": "space-evenly" };

  function num(v, map, def) {
    if (v === undefined || v === null || v === "") return def;
    if (typeof v === "number") return v;
    if (map && map[v] !== undefined) return map[v];
    var m = /^(-?[\d.]+)px$/.exec(String(v));
    return m ? parseFloat(m[1]) : def;
  }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  // 位置偏移（offsetTop／Start／End／Bottom）：像素、關鍵字（xs…xxl）、百分比三種寫法（LINE 官方規格）。百分比＝佔「上一層方塊」寬（Start、End）或高（Top、Bottom）的幾成。
  function offs(v) {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v === "string" && /^-?[\d.]+%$/.test(v)) return v;
    if (typeof v === "string" && v === "none") return "0px";
    var p = num(v, SP, null);
    return p === null ? null : p + "px";
  }
  function common(d, n, parent, idx) {
    var s = d.style;
    var horizP = parent && (parent.layout === "horizontal" || parent.layout === "baseline");
    var m = n.margin !== undefined ? n.margin : (idx > 0 && parent ? parent.spacing : undefined);
    var mv = num(m, SP, null);
    if (mv !== null) { if (horizP) s.marginLeft = mv + "px"; else s.marginTop = mv + "px"; }
    // flex：水平方塊裡預設平分；垂直方塊裡預設照內容高
    if (n.flex !== undefined) { s.flex = n.flex === 0 ? "0 0 auto" : n.flex + " 1 0"; }
    else if (horizP && n.type !== "separator") { s.flex = "1 1 0"; }
    else s.flex = "0 0 auto";
    if (n.width !== undefined) { s.width = typeof n.width === "string" && /%$/.test(n.width) ? n.width : num(n.width, null, 0) + "px"; s.flex = "0 0 auto"; }
    if (n.height !== undefined && n.type !== "button") s.height = typeof n.height === "string" && /%$/.test(n.height) ? n.height : num(n.height, null, 0) + "px";   // 按鈕的 height 是 sm／md，不是像素
    if (n.maxWidth !== undefined) s.maxWidth = num(n.maxWidth, null, 0) + "px";
    if (n.backgroundColor) s.background = n.backgroundColor;
    if (n.cornerRadius !== undefined) s.borderRadius = num(n.cornerRadius, { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 20 }, 0) + "px";
    if (n.borderWidth !== undefined) {
      s.borderStyle = "solid";
      s.borderWidth = num(n.borderWidth, { none: 0, light: 0.5, normal: 1, medium: 2, "semi-bold": 3, bold: 4 }, 1) + "px";
      s.borderColor = n.borderColor || "#000";
    }
    if (n.align) { if (horizP) { /* 水平方塊裡 align 是主軸位置 */ } else s.alignSelf = n.align === "start" ? "flex-start" : n.align === "end" ? "flex-end" : "center"; }
    if (n.gravity && horizP) s.alignSelf = n.gravity === "top" ? "flex-start" : n.gravity === "bottom" ? "flex-end" : "center";
    if (n.position === "absolute") {   // 絕對位置：不佔位置、不撐大上一層，照偏移量貼在上一層方塊裡（超出的部分 LINE 不顯示）
      s.position = "absolute"; s.margin = "0"; s.flex = "none";
      var o4 = [["offsetTop", "top"], ["offsetBottom", "bottom"], ["offsetStart", "left"], ["offsetEnd", "right"]];
      o4.forEach(function (p) { var v = offs(n[p[0]]); if (v !== null) s[p[1]] = v; });
    }
    if (n.action) { d.classList.add("fx-tap"); d.dataset.act = JSON.stringify(n.action); d.title = describe(n.action); }
  }
  function describe(a) {
    if (!a) return "";
    if (a.type === "postback") return "按下去（postback）：" + a.data;
    if (a.type === "message") return "按下去（送出文字）：" + a.text;
    if (a.type === "uri") return "按下去（開網頁）：" + (a.uri || "").slice(0, 80);
    return a.type;
  }
  function pad(d, n) {
    var s = d.style;
    var all = n.paddingAll !== undefined ? num(n.paddingAll, SP, 0) : null;
    var t = n.paddingTop !== undefined ? num(n.paddingTop, SP, 0) : all;
    var b = n.paddingBottom !== undefined ? num(n.paddingBottom, SP, 0) : all;
    var l = n.paddingStart !== undefined ? num(n.paddingStart, SP, 0) : all;
    var r = n.paddingEnd !== undefined ? num(n.paddingEnd, SP, 0) : all;
    if (t !== null) s.paddingTop = t + "px";
    if (b !== null) s.paddingBottom = b + "px";
    if (l !== null) s.paddingLeft = l + "px";
    if (r !== null) s.paddingRight = r + "px";
  }

  function rBox(n, parent, idx, ctx) {
    var d = el("div", "fx-box");
    var h = n.layout === "horizontal" || n.layout === "baseline";
    d.style.display = "flex"; d.style.flexDirection = h ? "row" : "column";
    if (n.layout === "baseline") d.style.alignItems = "baseline";
    if (n.justifyContent && JC[n.justifyContent]) d.style.justifyContent = JC[n.justifyContent];
    if (n.alignItems) d.style.alignItems = n.alignItems === "center" ? "center" : n.alignItems === "flex-end" ? "flex-end" : "flex-start";
    pad(d, n); common(d, n, parent, idx);
    (n.contents || []).forEach(function (c, i) { var e = rNode(c, n, i, ctx); if (e) d.appendChild(e); });
    return d;
  }
  function rText(n, parent, idx, ctx) {
    var d = el("div", "fx-text");
    var s = d.style;
    s.fontSize = num(n.size, TS, 16) + "px";
    s.fontWeight = n.weight === "bold" ? "700" : "400";
    s.color = n.color || "#111";
    s.lineHeight = n.lineSpacing ? "calc(1em + " + num(n.lineSpacing, SP, 0) + "px)" : "1.35";
    if (n.align) s.textAlign = n.align === "end" ? "right" : n.align === "center" ? "center" : "left";
    if (n.decoration === "underline") s.textDecoration = "underline";
    if (n.decoration === "line-through") s.textDecoration = "line-through";
    if (n.style === "italic") s.fontStyle = "italic";
    if (n.wrap) { s.whiteSpace = "pre-wrap"; } else { s.whiteSpace = "nowrap"; s.overflow = "hidden"; s.textOverflow = "ellipsis"; }
    if (n.maxLines) { s.display = "-webkit-box"; s.webkitLineClamp = String(n.maxLines); s.webkitBoxOrient = "vertical"; s.overflow = "hidden"; s.whiteSpace = "pre-wrap"; }
    if (n.contents && n.contents.length) {
      n.contents.forEach(function (sp) {
        var e = document.createElement("span"); e.textContent = sp.text || "";
        if (sp.size) e.style.fontSize = num(sp.size, TS, 16) + "px";
        if (sp.weight === "bold") e.style.fontWeight = "700";
        if (sp.color) e.style.color = sp.color;
        if (sp.decoration === "underline") e.style.textDecoration = "underline";
        if (sp.decoration === "line-through") e.style.textDecoration = "line-through";
        if (sp.style === "italic") e.style.fontStyle = "italic";
        d.appendChild(e);
      });
    } else d.textContent = /^\s+$/.test(n.text || "") ? "\u00A0" : (n.text || "");   // 只有空白的 text ＝ 空一行（高度照字級算）
    common(d, n, parent, idx);
    return d;
  }
  function rImage(n, parent, idx, ctx) {
    var w = el("div");
    var d = el("img", "fx-img");
    d.src = n.url; d.alt = "";
    if (n.animated) d.setAttribute("data-animated", "1");
    var full = !n.size || n.size === "full";
    if (full) { w.style.width = "100%"; d.style.width = "100%"; }
    else { var px = num(n.size, IW, 100); d.style.width = px + "px"; }
    if (n.aspectRatio) {
      var m = /^(\d+):(\d+)$/.exec(n.aspectRatio);
      if (m) { d.style.aspectRatio = m[1] + " / " + m[2]; }
    }
    d.style.objectFit = n.aspectMode === "cover" ? "cover" : "contain";
    if (n.aspectMode !== "cover" && !n.backgroundColor) d.style.background = "transparent";
    w.appendChild(d);
    if (n.align === "center") w.style.textAlign = "center", d.style.margin = "0 auto";
    common(w, n, parent, idx);
    if (n.backgroundColor) w.style.background = n.backgroundColor;
    return w;
  }
  function rButton(n, parent, idx, ctx) {
    var d = el("div", "fx-btn");
    var st = n.style || "link";
    d.style.height = (BH[n.height || "md"] || 52) + "px";
    d.style.fontSize = (n.height === "sm" ? 14 : 16) + "px";
    d.textContent = n.action && n.action.label || "";
    if (st === "primary") { d.style.background = n.color || "#06C755"; d.style.color = "#fff"; }
    else if (st === "secondary") { d.style.background = "#EAEAEA"; d.style.color = n.color || "#111"; }
    else { d.style.background = "transparent"; d.style.color = n.color || "#42659A"; }
    common(d, n, parent, idx);
    d.style.flexShrink = "1";
    return d;
  }
  function rSep(n, parent, idx) {
    var d = el("div", "fx-sep");
    var horizP = parent && (parent.layout === "horizontal" || parent.layout === "baseline");
    if (n.color) d.style.background = n.color;
    common(d, n, parent, idx);
    d.style.alignSelf = "stretch"; d.style.flex = "0 0 1px";
    if (horizP) { d.style.width = "1px"; d.style.height = "auto"; d.style.marginLeft = "0"; }   // 水平方塊裡的分隔線是直的
    return d;
  }
  function rSpacer(n, parent, idx) {
    var d = el("div"); var px = num(n.size || "md", SP, 8);
    d.style.flex = "0 0 " + px + "px"; d.style.height = px + "px"; return d;
  }
  function rNode(n, parent, idx, ctx) {
    if (!n) return null;
    switch (n.type) {
      case "box": return rBox(n, parent, idx, ctx);
      case "text": return rText(n, parent, idx, ctx);
      case "image": return rImage(n, parent, idx, ctx);
      case "button": return rButton(n, parent, idx, ctx);
      case "separator": return rSep(n, parent, idx);
      case "spacer": return rSpacer(n, parent, idx);
      case "filler": var f = el("div"); f.style.flex = "1 1 0"; return f;
    }
    return null;
  }
  function rBubble(n, ctx) {
    var d = el("div", "fx-bubble");
    d.style.width = (BW[n.size || "kilo"] || 260) + "px";
    d.style.borderRadius = "17px"; d.style.overflow = "hidden"; d.style.background = "#fff";
    d.style.boxShadow = "0 1px 3px rgba(0,0,0,.25)"; d.style.display = "flex"; d.style.flexDirection = "column";
    var st = n.styles || {};
    ["header", "hero", "body", "footer"].forEach(function (k, i, arr) {
      if (!n[k]) return;
      var e = rNode(n[k], null, 0, ctx);
      if (!e) return;
      e.style.flex = k === "body" ? "1 1 auto" : "0 0 auto";
      if (k !== "hero" && n[k].type === "box") {
        var has = n[k].paddingAll !== undefined || n[k].paddingTop !== undefined || n[k].paddingBottom !== undefined || n[k].paddingStart !== undefined || n[k].paddingEnd !== undefined;
        if (!has) e.style.padding = "13px";
      }
      var sk = st[k] || {};
      if (sk.backgroundColor) e.style.background = sk.backgroundColor;
      if (sk.separator && d.children.length) { e.style.borderTop = "1px solid " + (sk.separatorColor || "#E0E0E0"); }
      d.appendChild(e);
    });
    wire(d, ctx);
    return d;
  }
  function wire(root, ctx) {
    if (!ctx || !ctx.onAction) return;
    root.addEventListener("click", function (ev) {
      var t = ev.target; while (t && t !== root) { if (t.dataset && t.dataset.act) { ctx.onAction(JSON.parse(t.dataset.act)); ev.stopPropagation(); return; } t = t.parentNode; }
    });
  }
  function render(json, ctx) {
    if (json.type === "carousel") {
      var c = el("div", "fx-car");
      (json.contents || []).forEach(function (b) { c.appendChild(rBubble(b, ctx)); });
      return c;
    }
    return rBubble(json, ctx);
  }
  return { render: render, bytes: function (o) { return new TextEncoder().encode(JSON.stringify(o)).length; } };
})();

/* ════════ core.js ════════ */
/* ═══════════════ core.js：手冊網頁的骨架（登入、驗證、跟後端講話、閒置登出、浮水印、頁籤）═══════════════
 * 登入：跟補藥神器網頁同一把鑰匙（這台瀏覽器登入過補藥神器網頁、或從 LINE 的連結開）。
 * 手冊驗證（每一台各自算）：從 LINE 手冊裡按「🌐 網頁」開（連結上有一次性的通行證），或在 LINE 打網頁上出的「手冊 1234」。
 * 閒置超過設定的分鐘數：自動登出，內容從畫面上拿掉，要再驗證一次。
 * 手冊內容只放在記憶體：不存進瀏覽器、不留在網址列。 */

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function kb(n) { return (n / 1000).toFixed(1) + " KB"; }
function h(tag, attrs, kids) {
  var e = document.createElement(tag);
  for (var k in (attrs || {})) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k === "style") e.style.cssText = v;
    else if (k.slice(0, 2) === "on" && typeof v === "function") e[k] = v;
    else if (k === "value") e.value = v;
    else if (k === "checked") e.checked = !!v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  (kids || []).forEach(function (c) { if (c === null || c === undefined || c === false) return; e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}
function btn(label, fn, cls) { return h("button", { class: "btn " + (cls || "sm"), type: "button", onclick: fn }, [label]); }
function toast(msg) {
  var t = $("#toast"); if (!t) { t = h("div", { id: "toast", class: "toast", role: "status" }); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("on"); }, 3200);
}
function lightbox(url) {
  var lb = h("div", { class: "lightbox", role: "dialog", "aria-label": "放大的圖（點一下關掉）", tabindex: "-1", onclick: function () { lb.remove(); } }, [h("img", { src: url, alt: "" })]);
  lb.onkeydown = function (e) { if (e.key === "Escape") lb.remove(); };
  document.body.appendChild(lb); try { lb.focus(); } catch (x) { /* 沒關係 */ }
}
function stamp() { var d = new Date(); function z(n) { return ("0" + n).slice(-2); } return d.getFullYear() + "/" + z(d.getMonth() + 1) + "/" + z(d.getDate()) + " " + z(d.getHours()) + ":" + z(d.getMinutes()); }
// 預覽版用來標「要你確認第幾題」的紅圈：正式版不需要
function mk() { return ""; }
function mkEl() { return null; }

/* ── 手冊資料（只在記憶體）── */
var HB = null, CFG = null, ME = null, IS_DEV = false, MAIN = false;
function chapterOf(id) { return (HB.chapters || []).filter(function (c) { return c.id === id; })[0] || null; }
function titleOf(id) { for (var k in HB.titles) { var r = HB.titles[k].filter(function (t) { return t.id === id; })[0]; if (r) return r; } return null; }
function titlesOf(cid) { return HB.titles[cid] || []; }
function counts() { var o = {}; HB.chapters.forEach(function (c) { o[c.id] = titlesOf(c.id).length; }); return o; }
function applyCfg() {
  YZ_CFG.imgDirect = CFG.imgDirect !== false; YZ_CFG.animDirect = CFG.animDirect !== false; YZ_CFG.footer = CFG.footer !== false;
  YZ_CFG.webUrl = location.origin + location.pathname;   // 編輯器預覽 LINE 卡片時，按鈕上的網址（只拿來估卡片大小）
  IDLE_MS = Math.max(5, Math.min(240, +CFG.idle || 30)) * 6e4;
}

/* ── 連結：#x=網頁專案部署ID&app=鑰匙（藥師版）／&dev=鑰匙（開發者版）&k=通行證&t=標題（直接打開）&edit=標題（開發者：編輯器打開）── */
(function () {
  var qs = location.search || ""; if (!/[?&](x|app|dev|k)=/.test(qs)) return;
  var p = new URLSearchParams(qs), f = [];
  ["x", "app", "dev", "k", "t", "edit"].forEach(function (k) { if (p.get(k)) f.push(k + "=" + encodeURIComponent(p.get(k))); });
  try { history.replaceState(null, "", location.pathname + "#" + f.join("&")); } catch (e) { /* 換不了就算了 */ }
})();
function hashParams() { var o = {}; String(location.hash || "").replace(/^#/, "").split("&").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) { try { o[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* 壞掉的不要 */ } } }); return o; }
var HP = hashParams(), XRE = /^[A-Za-z0-9_-]{20,120}$/, TRE = /^[0-9a-f]{32}$/;
var X = HP.x || "", T = HP.dev || HP.app || "", FROMLINK = !!T, FROMSAVED = false;
var TICKET = /^[0-9a-z]{6,11}\.[0-9a-f]{24}$/.test(HP.k || "") ? HP.k : "";
// 跟補藥神器網頁共用：這台記住的鑰匙（bk）、後端（bx）、裝置碼（bdk）
function keyLoad() { try { var o = JSON.parse(localStorage.getItem("bk") || "null"); if (o && XRE.test(String(o.x || "")) && TRE.test(String(o.t || ""))) return o; } catch (e) { /* 沒有 */ } return null; }
function bxLoad() { try { var v = localStorage.getItem("bx"); if (XRE.test(v || "")) return v; } catch (e) { /* 沒有 */ } return ""; }
function keySave() { if (!XRE.test(X) || !TRE.test(T)) return; try { localStorage.setItem("bk", JSON.stringify({ x: X, t: T })); localStorage.setItem("bx", X); } catch (e) { /* 記不住就算了 */ } }
function keyDrop() { try { var o = keyLoad(); if (o && o.x === X && o.t === T) localStorage.removeItem("bk"); } catch (e) { /* 沒關係 */ } }
var CFGX = ""; try { if (typeof window.BUYAO_X === "string" && XRE.test(window.BUYAO_X)) CFGX = window.BUYAO_X; } catch (e) { /* cfg.js 沒放 */ }
var SAVED = keyLoad();
if (!T && SAVED && (!X || SAVED.x === X) && (!CFGX || SAVED.x === CFGX)) { X = SAVED.x; T = SAVED.t; FROMSAVED = true; }
if (!X && !T) X = CFGX || bxLoad();
// 網址列只留短的（鑰匙、通行證不留在網址列；分享網址也不會帶出去）
try { if (/(^|[#&])(x|app|dev|k)=/.test(location.hash || "")) history.replaceState(null, "", location.pathname); } catch (e) { /* 沒關係 */ }

var DK = (function () {
  var k = ""; try { k = localStorage.getItem("bdk") || ""; } catch (e) { k = ""; }
  if (TRE.test(k)) return k;
  try { var a = new Uint8Array(16); crypto.getRandomValues(a); k = Array.prototype.map.call(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); localStorage.setItem("bdk", k); if (localStorage.getItem("bdk") !== k) k = ""; } catch (e) { k = ""; }
  return k;
})();
var DKX = "", API = "", SESS = 0;
function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }

/* ── 跟後端講話（網頁專案的 API；跟補藥神器網頁一樣的格式）── */
function post(fn, a, ms, bg) {
  var ctl = window.AbortController ? new AbortController() : null, tm = 0;
  if (ctl && ms) tm = setTimeout(function () { try { ctl.abort(); } catch (e) { /* 沒關係 */ } }, ms);
  var o = { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ v: 1, fn: fn, t: T, dk: DKX, a: a || [] }), credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", redirect: "follow", keepalive: !!bg };
  if (ctl) o.signal = ctl.signal;
  return fetch(API, o).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json().catch(function () { throw new Error("後端回的不是手冊的格式"); }); })
    .then(function (j) { clearTimeout(tm); return j; }, function (e) { clearTimeout(tm); throw (e && e.name === "AbortError") ? new Error("等太久沒回應") : e; });
}
// 只是「讀」的，斷線、等太久會自己再試（最多 3 次）；會改資料的只送一次
var SAFE = { hbBoot: 1, hbData: 1, hbPing: 1, hbLog: 1, hbUsers: 1, hbCatImg: 1 };
function call(fn, args, opt) {
  opt = opt || {};
  var sid = SESS, tries = SAFE[fn] ? 3 : 1, n = 0;
  return new Promise(function (ok, bad) {
    function go() {
      n++;
      post(fn, args, opt.ms || (fn === "hbImg" || fn === "hbSave" || fn === "hbCatImg" ? 120000 : 40000)).then(function (j) {
        if (sid !== SESS) return;
        if (!j || j.ok !== 1) {
          var code = j && typeof j.code === "string" ? j.code : "", msg = j && typeof j.err === "string" ? j.err : "";
          if (!code && !msg && n < tries) { setTimeout(go, 900 * n); return; }
          if (code === "tok" || code === "bind" || code === "down" || code === "moved") { stop(msg, code, j.need); return; }
          var e = new Error(msg || "後端沒有回應"); e.code = code; bad(e); return;
        }
        ok(j.r);
      }, function (err) {
        if (sid !== SESS) return;
        if (n < tries) { setTimeout(go, 900 * n); return; }
        var e = new Error("連不上後端（" + String(err && err.message || err) + "），網路好了再試一次"); e.net = true; bad(e);
      });
    }
    go();
  });
}

/* ── 整頁的畫面 ── */
var APP = null;
function screen(kids, cls) {
  stopPolls();
  MAIN = false;
  APP.className = "app"; APP.innerHTML = "";
  var box = h("div", { class: "scr " + (cls || "") }, [h("div", { class: "scr-in" }, kids)]);
  APP.appendChild(box);
  return box;
}
function logo() { return h("div", { class: "scr-logo" }, [h("span", {}, ["📘"]), h("b", {}, ["藥戰手冊"])]); }
function scrMsg(title, lines, buttons) {
  return screen([logo(), h("h2", {}, [title]), h("div", { class: "scr-p" }, (lines || []).map(function (l) { return h("p", {}, [l]); })), buttons && buttons.length ? h("div", { class: "scr-b" }, buttons) : null]);
}
var MSG_LINE = "回 LINE 打開「📘 藥戰手冊」，按下面那排的「🌐 網頁」。";
var MSG_NODK = "這個瀏覽器沒辦法記住這台裝置（可能是無痕模式、關掉了網站資料，或瀏覽器太舊），所以不能看藥戰手冊。請用一般模式開，或換最新的 Chrome、Safari。";
function reloadBtn() { return btn("🔄 重新載入", function () { location.reload(); }, "pri"); }
// 停下來：鑰匙不對、這台還沒綁定（開發者）、後端連不到
function stop(msg, code, need) {
  SESS++;
  lockClean();
  if (code === "bind" && need) { scrBind(msg); return; }
  if (code === "tok") { keyDrop(); scrMsg("連結過期了", [msg || "登入的鑰匙不對或過期了。", MSG_LINE]); return; }
  scrMsg(code === "down" ? "現在連不到後端" : "沒辦法打開", [msg || "後端沒有回應。"], [reloadBtn()]);
}
// 開發者連結：這台還沒綁定 → 輸入 LINE「開發者網頁 綁定」給的 6 位數碼
function scrBind(msg) {
  var inp = h("input", { class: "in code6", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "6", placeholder: "6 位數碼", "aria-label": "綁定碼" });
  var m = h("div", { class: "scr-m", role: "status" });
  var b = btn("綁定", function () {
    var c = inp.value.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(c)) { m.textContent = "請輸入 6 位數字"; return; }
    b.disabled = true; m.textContent = "確認中…";
    call("appBind", [c]).then(function (r) {
      b.disabled = false;
      if (r && r.ok) { m.textContent = "✅ 綁好了"; boot(); return; }
      m.textContent = "❌ " + (r && r.err || "沒綁成功，再試一次"); inp.value = "";
    }, function (e) { b.disabled = false; m.textContent = "❌ " + e.message; });
  }, "pri");
  inp.onkeydown = function (e) { if (e.key === "Enter") b.onclick(); };
  screen([logo(), h("h2", {}, ["這一台還沒綁定（開發者）"]), h("div", { class: "scr-p" }, [h("p", {}, [msg || "開發者連結要先綁定這台裝置。"]), h("p", {}, ["在 LINE 打「開發者網頁 綁定」，把收到的 6 位數碼打在這裡。"])]), h("div", { class: "scr-b" }, [inp, b]), m]);
  try { inp.focus(); } catch (e) { /* 沒關係 */ }
}

/* ── 沒核可：送申請、等核可 ── */
function scrJoin(r) {
  var emp = h("input", { class: "in", maxlength: "20", autocomplete: "off", placeholder: "例：E10107", "aria-label": "員工代號" });
  var nm = h("input", { class: "in", maxlength: "20", autocomplete: "off", placeholder: "可以不填", "aria-label": "名字" });
  var m = h("div", { class: "scr-m", role: "status" });
  var b = btn("送出申請", function () {
    var e = emp.value.trim().toUpperCase();
    if (!/^[A-Z0-9-]{2,20}$/.test(e)) { m.textContent = "員工代號只能是英文字母、數字（2～20 個字）"; return; }
    b.disabled = true; m.textContent = "送出中…";
    call("hbJoin", [e, nm.value.trim()]).then(function (x) {
      b.disabled = false;
      if (x && x.err) { m.textContent = "❌ " + x.err; return; }
      if (x && x.st === "wait") { scrWait({ me: { emp: e } }); return; }
      boot();
    }, function (er) { b.disabled = false; m.textContent = "❌ " + er.message; });
  }, "pri");
  screen([logo(), h("h2", {}, ["要開發者核可才能看"]),
    h("div", { class: "scr-p" }, [h("p", {}, ["藥戰手冊是院內同事的工作手冊。請填員工代號送出申請；開發者的 LINE 會收到審核卡，核可後你的 LINE 會收到通知。"]), h("p", { class: "muted" }, ["核可之前看不到任何內容。"])]),
    h("div", { class: "scr-form" }, [h("label", {}, [h("span", {}, ["員工代號"]), emp]), h("label", {}, [h("span", {}, ["名字"]), nm])]),
    h("div", { class: "scr-b" }, [b]), m]);
  try { emp.focus(); } catch (e) { /* 沒關係 */ }
}
var POLL = 0, POLL2 = 0;
function stopPolls() { clearTimeout(POLL); clearInterval(POLL2); POLL = POLL2 = 0; }
function scrWait(r) {
  var emp = r && r.me && r.me.emp;
  screen([logo(), h("h2", {}, ["⏳ 已送出，等開發者核可"]),
    h("div", { class: "scr-p" }, [h("p", {}, [(emp ? "員工代號 " + emp + "。" : "") + "核可後你的 LINE 會收到通知；" + MSG_LINE]), h("p", { class: "muted" }, ["這個畫面每 30 秒會自己檢查一次。"])]),
    h("div", { class: "scr-b" }, [btn("現在檢查", function () { boot(); })])]);
  var t0 = Date.now();
  (function loop() { POLL = setTimeout(function () { if (Date.now() - t0 > 30 * 6e4) return; if (document.visibilityState === "hidden") { loop(); return; } call("hbBoot", [""]).then(function (x) { if (x && x.st === "wait") loop(); else onBoot(x); }, function () { loop(); }); }, 30000); })();
}

/* ── 能看，但這一台還沒驗證（或閒置登出了）──
   方法一（手機）：回 LINE 手冊按「🌐 網頁」。方法二（電腦）：網頁出「手冊 1234」，在 LINE 打這幾個字；打了這個畫面自己會打開。 */
var KEEP_ED = null;   // 閒置登出時還沒存的修改（只在記憶體，重新驗證後接著編輯）
function scrLock(r, why) {
  r = r || {};
  var lines = [];
  if (why === "idle") lines.push("閒置超過 " + Math.round(IDLE_MS / 6e4) + " 分鐘，已自動登出，手冊內容已經從畫面上拿掉。");
  else if (why === "out") lines.push("已登出，手冊內容已經從畫面上拿掉。");
  else if (why === "expired") lines.push("太久沒動作，這一台的驗證過期了。");
  else if (r.bad) lines.push("這條連結用過了、或已經過期（從 LINE 按下去之後太久才開）。");
  lines.push("看手冊之前，要先驗證這一台（每一台各自驗證；閒置太久要再驗證一次）。");
  var codeEl = h("div", { class: "lockcode", "aria-live": "polite" }, ["…"]), left = h("span", { class: "muted" }), m = h("div", { class: "scr-m", role: "status" });
  var again = btn("重新取得", function () { getCode(); });
  screen([logo(), h("h2", {}, ["🔒 先驗證這一台"]), h("div", { class: "scr-p" }, lines.map(function (l) { return h("p", {}, [l]); })),
    h("div", { class: "lockway" }, [h("b", {}, ["方法一（手機）"]), h("p", {}, [MSG_LINE])]),
    h("div", { class: "lockway" }, [h("b", {}, ["方法二（電腦）"]), h("p", {}, ["在手機的 LINE（補藥神器聊天室）打下面這幾個字："]), codeEl, h("div", { class: "lockrow" }, [left, again]), h("p", { class: "muted" }, ["打了之後，這個畫面會自己打開（不用按任何東西）。只在你自己的電腦上用。"])]),
    KEEP_ED ? h("p", { class: "lockkeep" }, ["✏️ 你有還沒儲存的修改：驗證好以後會接著編輯（還沒存進手冊）。"]) : null,
    m]);
  var exp = 0;
  function tick() { var s = Math.max(0, Math.round((exp - Date.now()) / 1000)); left.textContent = exp ? (s > 0 ? "這組 " + Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2) + " 內有效" : "這組過期了，按「重新取得」") : ""; if (exp && s <= 0) codeEl.classList.add("dead"); }
  function getCode() {
    again.disabled = true; codeEl.classList.remove("dead"); codeEl.textContent = "…"; m.textContent = "";
    call("hbCode", []).then(function (x) {
      again.disabled = false;
      if (x && x.code) { codeEl.textContent = "手冊 " + x.code; exp = Date.now() + (x.ttl || 300) * 1000; tick(); poll(); return; }
      if (x && x.st === "open") {   // 後端說這一台還是驗證過的
        if (OUTED) { hbOut().then(getCode, function () { codeEl.textContent = "—"; m.textContent = "❌ 網路不好，登出還沒送到後端；網路好了請重新載入。"; }); return; }
        boot(); return;
      }
      if (x && x.st && x.st !== "lock") { onBoot(x); return; }
      codeEl.textContent = "—"; m.textContent = "❌ " + (x && x.err || "拿不到驗證碼");
    }, function (e) { again.disabled = false; codeEl.textContent = "—"; m.textContent = "❌ " + e.message; });
  }
  function poll() {
    clearTimeout(POLL);
    POLL = setTimeout(function () {
      if (Date.now() > exp + 5000) return;
      if (document.visibilityState === "hidden") { poll(); return; }
      call("hbBoot", [""]).then(function (x) { if (x && x.st === "lock") poll(); else onBoot(x); }, function () { poll(); });
    }, 3000);
  }
  clearInterval(POLL2); POLL2 = setInterval(tick, 1000);
  getCode();
}

/* ── 開場 ── */
function gate(cb) {
  if (!X && !T) { cb("none"); return; }
  if (!XRE.test(X) || (T && !TRE.test(T))) { cb("bad"); return; }
  if (!window.fetch || !window.Promise) { cb("old"); return; }
  if (!T) { cb("none"); return; }
  if (!DK || !(window.crypto && crypto.subtle && window.TextEncoder)) { cb("nodk"); return; }
  crypto.subtle.digest("SHA-256", new TextEncoder().encode(DK + "|" + X)).then(function (b) { DKX = hex(b).slice(0, 32); cb("ok"); }, function () { cb("nodk"); });
}
function boot() {
  stopPolls();
  call("hbBoot", [TICKET]).then(onBoot, function (e) { scrMsg("沒辦法打開", [e.message], [reloadBtn()]); });   // 開發者這一台還沒綁定時，後端還沒看通行證：綁好再帶一次
}
function onBoot(r) {
  TICKET = "";   // 通行證只用一次
  if (!r) { scrMsg("沒辦法打開", ["後端沒有回應。"], [reloadBtn()]); return; }
  if (r.err) { stop(r.err, "tok"); return; }
  if (FROMLINK && !FROMSAVED) keySave();   // 從 LINE 開的：這台記住鑰匙（跟補藥神器網頁一樣）
  var st = r.st;
  if (st === "closed") { scrMsg("藥戰手冊還沒開放", ["請等開發者通知。"]); return; }
  if (st === "setup") { scrMsg("藥戰手冊還沒建立", ["在 LINE 專案的 Apps Script 編輯器，選 yzSetup → 執行一次。", "建好以後重新整理這一頁。"], [reloadBtn()]); return; }
  if (st === "none") { scrJoin(r); return; }
  if (st === "wait") { scrWait(r); return; }
  if (st === "no") { scrMsg("沒有通過審核", ["看不到藥戰手冊的內容。有疑問請找開發者。"]); return; }
  if (st === "off") { scrMsg("權限已經撤銷", ["你的藥戰手冊權限已經被撤銷，看不到內容了。有疑問請找開發者。"]); return; }
  if (st === "nodk") { scrMsg("這個瀏覽器不能用", [MSG_NODK]); return; }
  if (st === "lock") { ME = r.me || ME; if (r.cfg) { CFG = r.cfg; applyCfg(); } scrLock(r); return; }
  if ((st === "ok" || st === "dev") && r.data) { enterMain(r); return; }
  scrMsg("沒辦法打開", ["看不懂後端的回應（" + String(st) + "）。"], [reloadBtn()]);
}

/* ── 打開手冊：上面一排（標題、頁籤、誰、閒置倒數、登出）＋頁籤內容＋浮水印 ── */
var IDLE_MS = 30 * 6e4, LAST_ACT = Date.now(), LAST_PING = 0, TAB = "view";
// 有人改了手冊（hbPing 看到 rev 變了）：重新拿一次，看的這邊換成新的（編輯器裡還沒存的修改不動）
function refreshData() {
  call("hbData", []).then(function (x) {
    if (!MAIN || !x) return;
    if (x.st === "lock") { logout("expired"); return; }
    if (!x.data) return;
    HB = x.data; if (x.cfg) { CFG = x.cfg; applyCfg(); }
    if (typeof edBaseChanged === "function") edBaseChanged();
    if (TAB === "view") drawWeb();
    toast("手冊有更新，已經換成新的內容");
  }, function () { /* 下次再說 */ });
}
function enterMain(r) {
  stopPolls();
  OUTED = false;
  HB = r.data; CFG = r.cfg || CFG || {}; ME = r.me || {}; IS_DEV = r.st === "dev";
  applyCfg();
  MAIN = true; LAST_ACT = Date.now(); LAST_PING = Date.now();
  APP.className = "app hb-on"; APP.innerHTML = "";
  var tabs = h("nav", { class: "tabs", role: "tablist", "aria-label": "頁籤" });
  [["view", "📘 看手冊"], ["edit", "✏️ 編輯"], ["admin", "👥 管理"]].forEach(function (p) {
    if (p[0] !== "view" && !IS_DEV) return;
    tabs.appendChild(h("button", { class: "tab", type: "button", role: "tab", "data-t": p[0], "aria-selected": "false", onclick: function () { showTab(p[0]); } }, [p[1]]));
  });
  var who = (ME.name || "") + (ME.emp ? "　" + ME.emp : "") + (IS_DEV && ME.name !== "開發者" ? "　（開發者）" : "");
  var hdr = h("header", { class: "hdr", id: "hdr" }, [h("div", { class: "hrow" }, [
    h("button", { class: "hlogo", type: "button", title: "回首頁（手冊目錄）", onclick: function () { goHomeTab(); } }, ["📘 藥戰手冊"]), IS_DEV ? tabs : null, h("span", { class: "sp" }),
    h("span", { class: "who" }, [who]), h("span", { class: "idle", id: "idle" }, [""]),
    btn("登出", function () { logout("out"); }, "sm")
  ])]);
  APP.appendChild(hdr);
  APP.appendChild(h("main", { class: "panes" }, [h("div", { class: "pane", id: "pane-view" }), IS_DEV ? h("div", { class: "pane", id: "pane-edit" }) : null, IS_DEV ? h("div", { class: "pane", id: "pane-admin" }) : null]));
  if (CFG.watermark !== false) APP.appendChild(h("div", { class: "wm", id: "wm", "aria-hidden": "true" }));
  paintWm();
  buildView();
  if (IS_DEV) { buildEditPane(); buildAdminPane(); }
  syncTabsH();
  if (IS_DEV && KEEP_ED) { edRestore(KEEP_ED); KEEP_ED = null; showTab("edit"); toast("接著剛剛還沒儲存的修改（還沒存進手冊）"); }
  else if (IS_DEV && HP.edit && edTitleExists(HP.edit)) { gotoEdit(HP.edit); }
  else { showTab("view"); if (HP.t && titleOf(HP.t)) openTitle(HP.t); }
  HP.t = HP.edit = "";
  idleTick();
}
function showTab(name) {
  if (!MAIN) return;
  if ((name === "edit" || name === "admin") && !IS_DEV) name = "view";
  TAB = name;
  if (name !== "view") homeClass(false);   // 首頁（滿版）只在「看手冊」；編輯、管理照舊有上面那一排
  $$(".tab").forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-t") === name ? "true" : "false"); });
  $$(".pane").forEach(function (p) { p.classList.toggle("on", p.id === "pane-" + name); });
  syncTabsH();
  if (name === "edit") { renderEdit(); if (typeof edOnShow === "function") edOnShow(); } else if (typeof pvSync === "function") pvSync();
  if (name === "view") drawWeb();
  if (name === "admin") adminLoad();
}
function syncTabsH() { var t = $("#hdr"); if (t) document.documentElement.style.setProperty("--tabsH", t.offsetHeight + "px"); }
window.addEventListener("resize", syncTabsH);
// 浮水印：名字＋員工代號＋時間（每分鐘換一次時間）
function wmCss(text) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="340" height="210"><text x="170" y="110" font-size="15" font-family="sans-serif" fill="#000" text-anchor="middle" transform="rotate(-24 170 110)">' + esc(text) + "</text></svg>";
  return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
}
function wmText() { return [ME && ME.name, ME && ME.emp, ME && !ME.emp && ME.tail ? "…" + ME.tail : "", stamp()].filter(Boolean).join("　"); }
function paintWm() { var w = $("#wm"); if (w) w.style.backgroundImage = wmCss(wmText()); }

/* ── 閒置自動登出 ── */
function act() {
  LAST_ACT = Date.now();
  if (MAIN && Date.now() - LAST_PING > 4 * 6e4) {   // 有在動：每 4 分鐘讓後端也知道（後端那邊的驗證才不會先過期）
    LAST_PING = Date.now();
    call("hbPing", []).then(function (x) {
      if (!MAIN) return;
      if (x && x.st === "lock") { logout("expired"); return; }
      if (x && x.st) { MAIN = false; lockClean(); onBoot(x); return; }   // 被撤銷了、手冊關了
      if (x && x.rev && HB && x.rev !== HB.rev) refreshData();           // 有人改了手冊：看的這邊換成新的
    }, function () { /* 網路不好：下次再說 */ });
  }
}
["pointerdown", "keydown", "wheel", "touchstart", "input"].forEach(function (ev) { window.addEventListener(ev, act, { capture: true, passive: true }); });
window.addEventListener("scroll", act, { capture: true, passive: true });
function idleTick() {
  if (!MAIN) return;
  var left = IDLE_MS - (Date.now() - LAST_ACT);
  if (left <= 0) { logout("idle"); return; }
  var s = Math.ceil(left / 1000);
  var mmss = Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2);
  $$(".idle").forEach(function (e) { e.textContent = e.classList.contains("short") ? "⏱ " + mmss : "閒置 " + mmss + " 後自動登出"; e.classList.toggle("soon", s <= 60); });   // 上面那一排、首頁右上角（手機上用短的「⏱ 29:59」）
}
setInterval(idleTick, 1000);
setInterval(function () { if (MAIN) paintWm(); }, 60000);
document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") idleTick(); });
// 登出：內容從畫面、記憶體拿掉（還沒存的修改只留在記憶體，驗證後接著編輯）；後端那邊這一台的驗證作廢
function lockClean() {
  try { if (WV && WV.pano) { WV.pano.destroy(); WV.pano = null; } } catch (e) { /* 沒關係 */ }
  try { if (typeof PV !== "undefined" && PV.pano) { PV.pano.destroy(); PV.pano = null; } } catch (e) { /* 沒關係 */ }
  $$(".lightbox, .bigov, #pvwin, .modal").forEach(function (x) { x.remove(); });
  catBlobDrop();
  HB = null;
}
var OUTED = false;   // 這邊自己登出的（後端那邊也要確定作廢，才可以出驗證碼）
function hbOut(n) { return post("hbOut", [], 8000).then(function (j) { if (!j || j.ok !== 1) throw new Error("x"); }).catch(function () { if ((n || 0) < 2) return new Promise(function (ok) { setTimeout(ok, 1200); }).then(function () { return hbOut((n || 0) + 1); }); throw new Error("登出沒有送到後端"); }); }
function logout(why) {
  if (!MAIN) return;
  if (IS_DEV && typeof ED !== "undefined" && ED && ED.dirty) KEEP_ED = edKeep();
  MAIN = false; OUTED = true;
  lockClean();
  if (typeof ED !== "undefined") ED = null;
  screen([logo(), h("h2", {}, [why === "idle" ? "閒置太久，登出中…" : "登出中…"])]);
  var sid = ++SESS;
  hbOut().then(function () { if (sid === SESS) scrLock({}, why); }, function () { if (sid === SESS) scrMsg("已登出", ["手冊內容已經從畫面上拿掉。", "（網路不好，登出還沒送到後端；網路好了請重新載入。）"], [reloadBtn()]); });
}
window.addEventListener("beforeunload", function (e) { if (MAIN && IS_DEV && typeof ED !== "undefined" && ED && ED.dirty) { e.preventDefault(); e.returnValue = ""; } });

/* ── 小視窗（取代瀏覽器的 confirm，網頁不用跳出系統視窗）── */
function modal(o) {
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true" });
  var close = function () { bx.remove(); };
  var dlg = h("div", { class: "dlg" }, [h("h3", {}, [o.title || ""]), h("div", { class: "dlg-p" }, (o.lines || []).map(function (l) { return h("p", {}, [l]); })),
    h("div", { class: "dlg-b" }, (o.buttons || []).map(function (b) { return btn(b.label, function () { close(); if (b.fn) b.fn(); }, b.cls || "sm"); }))]);
  bx.appendChild(dlg); document.body.appendChild(bx);
  var f = $("button", dlg); if (f) try { f.focus(); } catch (e) { /* 沒關係 */ }
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
  return close;
}

/* ── 目錄圖的原始檔（3D 目錄要用；只放記憶體，登出就丟掉）── */
var CATBLOB = { url: "", fid: "", busy: false, err: false };
function catBlobDrop() { if (CATBLOB.url) try { URL.revokeObjectURL(CATBLOB.url); } catch (e) { /* 沒關係 */ } CATBLOB = { url: "", fid: "", busy: false, err: false }; }
function catBlob(cat, cb) {   // 拿到了回 blob 網址；還在拿回 ""（拿到後叫 cb）；拿不到回 null
  if (!cat || !cat.img || !cat.fid) return null;
  if (CATBLOB.fid === cat.fid && CATBLOB.url) return CATBLOB.url;
  if (CATBLOB.fid === cat.fid && CATBLOB.err) return null;
  if (CATBLOB.fid === cat.fid && CATBLOB.busy) return "";
  catBlobDrop(); CATBLOB.fid = cat.fid; CATBLOB.busy = true;
  var sid = SESS, fid = cat.fid;
  call("hbCatImg", []).then(function (x) {
    if (sid !== SESS || CATBLOB.fid !== fid) return;
    CATBLOB.busy = false;
    if (!x || !x.b64) { CATBLOB.err = true; if (x && x.st === "lock") { logout("expired"); return; } if (cb) cb(); return; }
    var bin = atob(x.b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    CATBLOB.url = URL.createObjectURL(new Blob([u], { type: x.mime || "image/jpeg" }));
    if (cb) cb();
  }, function () { if (CATBLOB.fid !== fid) return; CATBLOB.busy = false; CATBLOB.err = true; if (cb) cb(); });
  return "";
}

/* ── 不同的後端（這台原本連的，跟這條連結的不一樣）：問一下用哪一個 ── */
function backendCheck(cb) {
  var RX = CFGX || (SAVED ? SAVED.x : bxLoad());
  if (!RX || !HP.x || RX === HP.x || !XRE.test(HP.x)) { cb(); return; }
  scrMsg("⚠️ 這條連結要連到不同的後端", ["這台原本連的後端（…" + RX.slice(-6) + "），跟這條連結的（…" + HP.x.slice(-6) + "）不一樣。", "如果這條連結不是你自己從 LINE 按的，請直接關掉這個網頁。"], [
    btn("用原本連的", function () { X = RX; if (SAVED && SAVED.x === RX) { T = SAVED.t; FROMSAVED = true; FROMLINK = false; } else { T = ""; } TICKET = ""; cb(); }, "pri"),
    btn("用這條連結的", function () { cb(); })
  ]);
}

function start() {
  APP = $("#app");
  if (window.top !== window.self) { try { document.documentElement.innerHTML = ""; } catch (e) { /* 沒關係 */ } return; }   // 不讓別的網站用框框包住
  backendCheck(function () {
    gate(function (g) {
      if (g === "ok") { API = "https://script.google.com/macros/s/" + X + "/exec"; screen([logo(), h("p", { class: "muted" }, ["載入中…"])]); boot(); return; }
      if (g === "nodk") { scrMsg("這個瀏覽器不能用", [MSG_NODK]); return; }
      if (g === "old") { scrMsg("瀏覽器太舊", ["請改用最新的 Chrome 或 Safari。"]); return; }
      if (g === "bad") { scrMsg("連結不完整", [MSG_LINE]); return; }
      scrMsg("請從 LINE 打開", [MSG_LINE, "（這台瀏覽器登入過「補藥神器網頁」的話，也可以直接開這一頁。）"]);
    });
  });
}

/* ════════ view.js ════════ */
/* ═══════════════ view.js：看手冊（首頁、章、標題、搜尋）＋畫內容的零件（編輯器的網頁預覽也用）═══════════════ */

/* ───────── 畫「內容」的零件 ───────── */
function hlNodes(text, hl, sq) {   // 搜尋的字用 <mark> 標出來（sq＝不管空白：圖片裡的字）
  text = String(text === undefined || text === null ? "" : text);
  if (!hl || !hl.length) return [text];
  return _yzHL_(text, hl, sq).map(function (g) { return g.h ? h("mark", {}, [g.t]) : g.t; });
}
// 一行字裡一小段一小段（各有自己的格式）→ 網頁上的 span。搜尋的字照樣用 <mark> 標出來
function rtKids(runs, hl) {
  var out = [];
  (runs || []).forEach(function (r) {
    var kids = hlNodes(r.t, hl);
    if (!(r.b || r.i || r.u || r.s || r.c || r.z)) { out = out.concat(kids); return; }
    var cls = "rt" + (r.b ? " rt-b" : "") + (r.i ? " rt-i" : "") + (r.u ? " rt-u" : "") + (r.s ? " rt-s" : "") + (r.z && YZ_RT_SIZES[r.z] ? " rt-z" + r.z : "");
    var sp = h("span", { class: cls }, kids);
    if (r.c && YZ_RT_COLORS[r.c]) sp.style.color = YZ_RT_COLORS[r.c];
    out.push(sp);
  });
  return out;
}
// 一段文字 → 網頁。o.plain：整段當一般字（備註）；o.go(標題代號)→{label}、o.onTitle(標題代號)：「連結到標題」的行
function webText(v, hl, o) {
  o = o || {};
  var box = h("div", { class: "txtb" }), ls = _yzParseLines_(v, o.plain), i = 0, j;
  function ind(L) { return L.lv ? "padding-left:" + (L.lv * 1.6) + "em" : ""; }
  function indM(L) { return L.lv ? "margin-left:" + (L.lv * 1.6) + "em;" : ""; }   // 有框、有底色的（標註、引用、分隔線）：整個框往右移（第 27 批：任何內容都能縮排）
  while (i < ls.length) {
    var L = ls[i];
    if (L.k === "gap") { box.appendChild(h("div", { style: "height:.45em" })); i++; continue; }
    if (L.k === "hr") { box.appendChild(h("hr", { class: "rt-hr", style: indM(L) })); i++; continue; }
    if (L.k === "go") {
      var tg = o.go ? o.go(L.go) : null;
      if (tg && tg.label) box.appendChild(h("a", { class: "rt-go" + (tg.kind === "c" ? " ch" : ""), href: "#", style: ind(L), onclick: function (id, kind) { return function (e) { e.preventDefault(); if (kind === "c") { if (o.onChapter) o.onChapter(id); } else if (o.onTitle) o.onTitle(id); }; }(L.go, tg.kind) }, [h("span", {}, [tg.kind === "c" ? "📚" : "→"]), h("b", {}, [tg.label]), h("span", {}, ["›"])]));   // 第 27 批：也能連到整章
      i++; continue;
    }
    if (L.k === "img") {   // 第 28 批：文字和圖片放在同一塊（圖跟著這一行的縮排）
      var P = o.pics && o.pics[L.img];
      if (P && P.url) box.appendChild(webFig(P, { hl: hl, onImg: o.onImg, cls: "rt-img", style: indM(L) }));
      i++; continue;
    }
    if (L.k === "box") {
      var T = YZ_RT_TONES[L.tone] || YZ_RT_TONES.info, lines = [];
      for (j = i; j < ls.length && ls[j].k === "box" && ls[j].tone === L.tone && (ls[j].lv || 0) === (L.lv || 0); j++) lines.push(h("div", { class: "rt-bl" }, rtKids(ls[j].runs, hl)));
      box.appendChild(h("div", { class: "rt-box" + (lines.length > 1 ? " rows" : ""), "data-tone": L.tone, style: indM(L) + "background:" + T.bg + ";border-color:" + T.bd + ";color:" + T.ink + ";--bd:" + T.bd }, [h("span", { class: "rt-ic" }, [T.icon]), h("div", { class: "rt-bb" }, lines)]));   // 第 28 批：好幾行＝一行一列、中間一條線（跟編輯器一樣）
      i = j; continue;
    }
    if (L.k === "quote") {
      var qs = [];
      for (j = i; j < ls.length && ls[j].k === "quote" && (ls[j].lv || 0) === (L.lv || 0); j++) qs.push(h("div", { class: "rt-bl" }, rtKids(ls[j].runs, hl)));
      box.appendChild(h("div", { class: "rt-quote", style: indM(L) }, qs));
      i = j; continue;
    }
    if (L.k === "head") {
      var H = YZ_RT_HEAD["h" + L.h];
      box.appendChild(h("div", { class: "rt-h rt-h" + L.h, style: "font-size:" + H.em + "em;color:" + H.color + (L.lv ? ";padding-left:" + (L.lv * 1.6 / H.em).toFixed(2) + "em" : "") }, rtKids(L.runs, hl)));   // 標題字比較大：縮排用內文的 em 算（跟其他行對齊）
    } else if (L.k === "item") {
      box.appendChild(h("div", { class: "li", style: ind(L) }, [h("span", { class: "mkr" }, [L.mark]), h("span", {}, rtKids(L.runs, hl))]));
    } else box.appendChild(h("div", { class: "txt", style: ind(L) }, rtKids(L.runs, hl)));
    i++;
  }
  return box;
}
// 表格：欄寬預設自動（照內容分）；開發者指定了比例（b.w）才照比例。太寬時外面那層有左右拉條
// 圖片裡的字（第 27 批）：從搜尋打開時，這張圖裡有沒有要找的字（有的話，圖外面框黃色、寫一行「🔍 這張圖裡有你要找的字」，畫面捲到這張圖）
function ocrHit(p, hl) {
  if (!p || !p.ocr || !hl || !hl.length) return false;
  var j = _yzNorm_(String(p.ocr)).replace(/\s+/g, "");   // 不管空白、換行（跟搜尋一樣）
  return hl.some(function (tk) { return tk && j.indexOf(tk) >= 0; });
}
function ocrTag() { return h("div", { class: "ocrtag" }, ["🔍 這張圖裡有你要找的字"]); }
function webTable(b, hl) {
  var rows = (b.rows || []).filter(function (r) { return r && r.length; });
  if (!rows.length) return h("div");
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  var w = (b.w && b.w.length === nc) ? b.w : null, sum = 0;
  if (w) w.forEach(function (x) { sum += x; });
  var tb = h("table");
  if (w) { var cg = h("colgroup"); w.forEach(function (x) { cg.appendChild(h("col", { style: "width:" + (x / sum * 100).toFixed(1) + "%" })); }); tb.appendChild(cg); tb.style.width = "100%"; }
  rows.forEach(function (r, ri) {
    var tr = h("tr");
    for (var ci = 0; ci < nc; ci++) tr.appendChild(h(ri === 0 && b.head !== false ? "th" : "td", {}, hlNodes(r[ci] === undefined ? "" : String(r[ci]), hl)));
    tb.appendChild(tr);
  });
  return h("div", { class: "tscroll" }, [tb]);
}
// 階梯式內容：編號跟 LINE 用同一份程式算（_yzLadderRows_），兩邊一定一樣。「接續上一段」的起始號碼（b.n0）由 webArticle 先算好
function webLadder(b, hl, o) {
  var r = _yzLadderRows_(b), st = YZ_LADDER_STYLES[b.style] ? b.style : "law", mw = {}, box = h("div", { class: "lad" + (st === "plain" ? " plain" : "") });
  r.items.forEach(function (it, i) { if (_yzLadderIsImg_(it) || !r.marks[i]) return; var w = _yzMarkW_(r.marks[i], 14); if (!mw[it.lv] || w > mw[it.lv]) mw[it.lv] = w; });
  r.items.forEach(function (it, i) {
    if (_yzLadderIsImg_(it)) {
      var im = h("img", { src: it.img.url, alt: it.img.cap || "", loading: "lazy" });
      im.onclick = function () { if (o && o.onImg) o.onImg(it.img.url); };
      var oh = ocrHit(it.img, hl);
      box.appendChild(h("figure", { class: "lim lv" + it.lv + (oh ? " ocrhit" : ""), style: "margin-left:" + ((it.lv - 1) * 1.7 + (mw[it.lv] ? mw[it.lv] / 14 + 0.45 : 0)).toFixed(2) + "em" }, [im, it.img.cap ? h("figcaption", {}, hlNodes(it.img.cap, hl)) : null, oh ? ocrTag() : null]));
      return;
    }
    var strong = st === "law" && it.lv === 1, mk = r.marks[i];
    box.appendChild(h("div", { class: "lr lv" + it.lv + (strong ? " strong" : ""), style: "padding-left:" + ((it.lv - 1) * 1.7).toFixed(1) + "em" }, [
      mk ? h("span", { class: "lm", style: "width:" + (mw[it.lv] / 14).toFixed(2) + "em" }, [mk]) : null,   // 只縮排：沒有記號
      h("span", { class: "lt" }, hlNodes(it.v, hl))
    ]));
  });
  return box;
}
/* ───────── 動畫（網頁）─────────
 * 手機有開「減少動態效果」的人，動畫一律先停住（只看第一格），按「▶ 播放」才會動。設定「網頁動畫自動播放」關掉也一樣。 */
function reduceMotion() { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } }
function animAuto() { return !reduceMotion() && !(CFG && CFG.webAnimAuto === false); }
function animWhyStopped() { return reduceMotion() ? "你的裝置開了「減少動態效果」，所以動畫先停住；按「▶ 播放」才會動。" : "設定是「不自動播放」，按「▶ 播放」才會動。"; }
function webAnimFile(b, o) {
  o = o || {};
  var playing = animAuto(), first = playing;
  var img = h("img", { class: "animimg", alt: b.cap || "" });
  var tog = h("button", { class: "btn sm animtog", type: "button" });
  function paint() {
    img.src = playing ? (b.raw || b.url) : (b.poster || b.url);
    tog.textContent = playing ? "⏸ 暫停" : "▶ 播放"; tog.setAttribute("aria-pressed", playing ? "true" : "false");
    tog.setAttribute("aria-label", playing ? "暫停動畫" : "播放動畫");
  }
  tog.onclick = function () { playing = !playing; paint(); };
  img.onclick = function () { if (o.onImg) o.onImg(playing ? (b.raw || b.url) : (b.poster || b.url)); };
  paint();
  var box = h("div", { class: "animbox" }, [img, h("span", { class: "animtag" }, ["🎞 動畫"])]);
  if (b.ar && /^\d+:\d+$/.test(b.ar)) box.style.aspectRatio = b.ar.replace(":", " / ");
  return h("figure", { class: "anim" }, [box, h("div", { class: "animbar" }, [tog, first ? null : h("span", { class: "muted animnote" }, [animWhyStopped()])]), b.cap ? h("figcaption", {}, hlNodes(b.cap, o.hl)) : null]);
}
function webSteps(b, o) {
  o = o || {};
  var steps = (b.steps || []).filter(function (s) { return s && (s.url || String(s.cap || "").trim()); }), n = steps.length;
  if (!n) return h("div", { class: "muted" }, ["（分步動畫還沒有內容）"]);
  var i = 0, auto = animAuto() && n > 1, playing = auto, sec = Math.max(1, +b.sec || 2), loop = b.loop !== false;
  var hitAt = -1; steps.forEach(function (s, k) { if (hitAt < 0 && ocrHit(s, o.hl)) hitAt = k; });
  if (hitAt >= 0) { i = hitAt; playing = false; }   // 從搜尋打開：停在圖裡有那個字的那一步
  var img = h("img", { class: "stepimg", alt: "" }), cap = h("div", { class: "stepcap", "aria-live": "polite" }), dots = h("div", { class: "stepdots" });
  var tog = h("button", { class: "btn sm animtog", type: "button" }), pv = h("button", { class: "btn sm", type: "button", "aria-label": "上一步" }, ["◀ 上一步"]), nx = h("button", { class: "btn sm", type: "button", "aria-label": "下一步" }, ["下一步 ▶"]);
  var box = h("div", { class: "animbox stepbox" }, [img, h("span", { class: "animtag" }, ["🎞 分步動畫"])]);
  var ar = (steps.filter(function (s) { return s.url && s.ar; })[0] || {}).ar;
  if (ar && /^\d+:\d+$/.test(ar)) box.style.aspectRatio = ar.replace(":", " / ");
  img.onclick = function () { var s = steps[i]; if (s && s.url && o.onImg) o.onImg(s.url); };
  function paint() {
    var s = steps[i] || {};
    if (s.url) { img.src = s.url; img.style.display = ""; } else { img.removeAttribute("src"); img.style.display = "none"; }
    cap.innerHTML = ""; cap.appendChild(h("b", {}, ["步驟 " + (i + 1) + "／" + n + "　"])); if (s.cap) cap.appendChild(document.createTextNode(s.cap));
    dots.innerHTML = ""; steps.forEach(function (x, k) { dots.appendChild(h("i", { class: k === i ? "on" : "" })); });
    tog.textContent = playing ? "⏸ 暫停" : "▶ 播放"; tog.setAttribute("aria-pressed", playing ? "true" : "false");
    pv.disabled = i === 0 && !loop; nx.disabled = i === n - 1 && !loop;
  }
  function go(d) { i = (i + d + n) % n; paint(); }
  tog.onclick = function () { if (!playing && i === n - 1 && !loop) i = 0; playing = !playing; paint(); };
  pv.onclick = function () { playing = false; go(-1); }; nx.onclick = function () { playing = false; go(1); };
  paint();
  var fig = h("figure", { class: "stepsfig" + (hitAt >= 0 ? " ocrhit" : "") }, [box, cap, h("div", { class: "animbar" }, [pv, tog, nx, dots, auto || n < 2 ? null : h("span", { class: "muted animnote" }, [animWhyStopped()])]), hitAt >= 0 ? ocrTag() : null]);
  if (n > 1) { var timer = setInterval(function () {
    if (!fig.isConnected) { clearInterval(timer); return; }
    if (!playing) return;
    if (i < n - 1) i++; else if (loop) i = 0; else playing = false;
    paint();
  }, sec * 1000); }
  return fig;
}
function webAnim(b, o) { return b.kind === "steps" ? webSteps(b, o) : (b.url ? webAnimFile(b, o) : h("div")); }
function webFig(b, o) {   // 圖還沒載好就先照長寬比留好位置（下面的東西不會跳；從搜尋捲到的位置也不會跑掉）。o.cls、o.style：文字裡的圖用（第 28 批）
  o = o || {};
  var im = h("img", { src: b.url, alt: b.cap || "", loading: "lazy", style: /^\d+:\d+$/.test(b.ar || "") ? "aspect-ratio:auto " + b.ar.replace(":", " / ") : null });
  im.onclick = function () { if (o.onImg) o.onImg(b.url); };
  var oh = ocrHit(b, o.hl);
  return h("figure", { class: [o.cls || "", oh ? "ocrhit" : ""].join(" ").trim() || null, style: o.style || null }, [im, b.cap ? h("figcaption", {}, hlNodes(b.cap, o.hl)) : null, oh ? ocrTag() : null]);
}
function extLink(url, label) {   // 外部網址：只收 https，開新分頁、不帶來源
  return /^https:\/\/[^\s"'<>]+$/.test(url || "") ? h("a", { class: "src ext", href: url, target: "_blank", rel: "noopener noreferrer" }, [label]) : null;
}
// 互相連結（第 27 批）：「從這些標題連過來」的那一區（沒有＝null）。網頁文章最下面、章的頁面最下面都用
function webBacklinks(list, fromCh, onTitle) {
  if (!list || !list.length) return null;
  return h("div", { class: "backl" }, [h("div", { class: "bl-h" }, ["↩ 從這些標題連過來（互相連結）"])].concat(list.map(function (x) {
    return h("a", { class: "rt-go back", href: "#", onclick: function (e) { e.preventDefault(); if (onTitle) onTitle(x.t.id); } }, [h("span", {}, ["↩"]), h("b", {}, [_yzBackLabel_(x, fromCh)]), h("span", {}, ["›"])]);
  })));
}
function webArticle(ch, t, o) {   // o.page：在「圖一」樣式的頁面裡（章名、標題已經寫在上面，這裡不再寫）
  o = o || {};
  var a = h("article", { class: "art" });
  if (o.width) a.style.setProperty("--aw", o.width + "px");
  if (!o.page) {
    a.appendChild(h("div", { class: "crumb" }, [ch.name]));
    a.appendChild(h("h2", {}, hlNodes(t.name || "（還沒有標題）", o.hl)));
  }
  var goFn = o.hb ? function (id) { return _yzGoTarget_(o.hb, id, ch.id); } : null;
  if (o.hb) _yzLadderNumberAll_(o.hb);   // 條文「接續上一段」：先算好這一章每一段從第幾號開始
  (t.blocks || []).forEach(function (b) {
    var el = null;
    if (b.t === "text") el = webText(b.v, o.hl, { go: goFn, onTitle: o.onTitle, onChapter: o.onChapter, pics: b.pics, onImg: o.onImg });
    else if (b.t === "ladder") el = webLadder(b, o.hl, o);
    else if (b.t === "table") el = webTable(b, o.hl);
    else if (b.t === "img" && b.url) el = webFig(b, o);
    else if (b.t === "anim") el = webAnim(b, o);
    if (!el) return;
    var bi = _yzBlockInd_(b);
    if (bi) { el.style.marginLeft = (bi * 1.6).toFixed(1) + "em"; el.classList.add("bind"); }   // 整塊縮排（第 27 批：圖片、表格、動畫、階梯式也能縮排）
    a.appendChild(el);
  });
  if (o.hb) { var bk = webBacklinks(_yzBacklinks_(o.hb, [t.id, ch.id], t.id), ch.id, o.onTitle); if (bk) a.appendChild(bk); }   // 互相連結：從別的標題連到這裡的
  var pg = _yzPageText_(t.page), nt = _yzNoteHas_(t.note) ? String(t.note).replace(/^(?:[ \t　\r]*\n)+|(?:\r?\n[ \t　\r]*)+$/g, "") : "";   // 沒填備註（空白、只有空行、看不見的字）：不顯示備註框；前後多打的空行也拿掉
  var pgEl = pg ? h("div", { class: "pgline" + (nt ? " gap" : " solo") }, [h("span", { class: "pgtag" }, [h("span", {}, ["📖 藥戰手冊頁數　"]), h("b", {}, [pg])])]) : null;
  if (nt) {
    var nb = h("div", { class: "note" }, [h("b", { class: "nl" }, ["備註"])]);
    nb.appendChild(webText(nt, o.hl, { plain: true }));
    if (pgEl) nb.appendChild(pgEl);
    a.appendChild(nb);
  } else if (pgEl) a.appendChild(pgEl);   // 第 28 批：只寫了頁數（備註沒有字）：只放頁數小框，不要黃色的「備註」框
  if (YZ_CFG.footer) a.appendChild(h("div", { class: "foot" }, [YZ_NOTICE]));
  return a;
}
// 標籤（圖示＋名稱）＋圓點：網頁和編輯器共用（編輯器裡看到的標籤，就是網頁上的樣子）。ghost＝看不見的複製品（點擊層佔位置用）
function webSpotTag(s, cat, ghost) {
  var kids = [];
  if (!ghost) kids.push(h("i", { class: "sp-dot" }));
  if (cat.labels !== false && s.label) {
    var ico = s.st === "lock" ? "🔒" : s.ico, p = h("span", { class: "sp-tag" + (ghost ? " ghost" : "") });
    if (ico) p.appendChild(h("i", { class: "sp-ico" }, [ico]));
    p.appendChild(h("b", {}, [s.label]));
    if (s.st === "new") p.appendChild(h("em", { class: "sp-new", title: "新" }));
    kids.push(p);
  }
  return kids;
}
function mapSpotBox(s) { return "left:" + s.x + "%;top:" + s.y + "%;width:" + s.w + "%;height:" + s.h + "%"; }
function arCss(ar) { return /^\d+:\d+$/.test(ar || "") ? ar.replace(":", " / ") : "20 / 13"; }
var MAP_ZOOM = 1.3;
// 平面目錄圖（不能 3D 的時候）：圖＋標籤＋圓點。滑過：標籤變色、物品亮起來、鏡頭靠近、底下說明卡；手機第一下選到、第二下進去
// 第 25 批：cat.dim（預設開）＝整張圖淡一點，有按鍵的物品留一半顏色。做法：圖本身用 CSS 濾鏡變淡，
// 　每個物品框上面再疊一塊「原本顏色」的同一張圖（邊緣慢慢淡出），平常半透明、滑到時全彩又亮一點（跟 3D 的樣子一樣）。
function webCatalogMap(cat, hb, o) {
  o = o || {};
  var spots = _yzMapSpots_(cat).slice(0, YZ_MAP_MAX), fx = cat.fx !== false && o.fx !== false, dim = cat.dim !== false;
  // o.full：滿版（首頁）＝整張圖放進畫面裡（不裁掉），左右或上下留深色邊
  var touch = !!(window.matchMedia && window.matchMedia("(hover: none)").matches), still = reduceMotion();
  var box = h("div", { class: "catmap" + (fx ? " fx" : "") + (dim ? " dim" : "") });
  if (o.width) box.style.maxWidth = o.width + "px";
  if (o.full) { var arN = (function () { var a = String(cat.ar || "20:13").split(":"); return (Number(a[0]) || 20) / (Number(a[1]) || 13); })(); box.classList.add("full"); box.style.width = "min(100%, calc(var(--hsh, 80vh) * " + arN.toFixed(4) + "))"; }
  var stage = h("div", { class: "catstage", style: "aspect-ratio:" + arCss(cat.ar) });
  var cam = h("div", { class: "catcam", "aria-hidden": "true" }, [h("img", { src: o.img || cat.img, alt: "", draggable: "false" })]);
  var hit = h("div", { class: "cathit" }), vis = {}, pat = {}, info = null, cur = null, leaveT = 0, lastPT = "";
  stage.appendChild(cam);
  if (dim || fx) {   // 物品上面那一塊「原本顏色」的圖：照物品的形狀（沒有輪廓＝整個框）挖出來、邊緣淡出（遮罩是畫布畫的）
    var src = o.img || cat.img, A = (function () { var a = String(cat.ar || "20:13").split(":"); return (Number(a[0]) || 20) / (Number(a[1]) || 13); })();
    spots.forEach(function (s) {
      if (s.st === "lock") return;   // 還沒開放的：一直是淡的，不用疊
      var ey = 2.4, ex = ey / A, R = [s.x, s.y, s.x + s.w, s.y + s.h];
      if (Array.isArray(s.shape)) s.shape.forEach(function (rg) { for (var k = 0; k + 1 < rg.length; k += 2) { R[0] = Math.min(R[0], rg[k]); R[2] = Math.max(R[2], rg[k]); R[1] = Math.min(R[1], rg[k + 1]); R[3] = Math.max(R[3], rg[k + 1]); } });   // 物品比框大（第 27 批：整本書、整個藥盤）：這一塊要包住整個物品
      var X = Math.max(0, R[0] - ex), Y = Math.max(0, R[1] - ey), Wp = Math.min(100, R[2] + ex) - X, Hp = Math.min(100, R[3] + ey) - Y;
      if (Wp <= 0 || Hp <= 0) return;
      var mk = spotMask(s, X, Y, Wp, Hp, A); if (!mk) return;
      var bx = Wp < 100 ? (X / (100 - Wp)) * 100 : 0, by = Hp < 100 ? (Y / (100 - Hp)) * 100 : 0;
      pat[s.id] = cam.appendChild(h("i", { class: "spc", "aria-hidden": "true", style: "left:" + X.toFixed(3) + "%;top:" + Y.toFixed(3) + "%;width:" + Wp.toFixed(3) + "%;height:" + Hp.toFixed(3) + "%;-webkit-mask-image:" + cssUrl(mk) + ";mask-image:" + cssUrl(mk) }, [
        h("b", { style: "background-image:" + cssUrl(src) + ";background-size:" + (10000 / Wp).toFixed(3) + "% " + (10000 / Hp).toFixed(3) + "%;background-position:" + bx.toFixed(3) + "% " + by.toFixed(3) + "%" })
      ]));
    });
  }
  if (fx) {
    var dust = h("div", { class: "dust", "aria-hidden": "true" }), r = 7;
    var rnd = function () { r = (r * 16807) % 2147483647; return r / 2147483647; };
    for (var i = 0; i < 22; i++) dust.appendChild(h("i", { style: "left:" + (rnd() * 100).toFixed(1) + "%;top:" + (25 + rnd() * 70).toFixed(1) + "%;--s:" + (2 + rnd() * 3).toFixed(1) + "px;--t:" + (9 + rnd() * 9).toFixed(1) + "s;--dl:-" + (rnd() * 14).toFixed(1) + "s;--dx:" + ((rnd() - 0.5) * 44).toFixed(0) + "px" }));
    stage.appendChild(dust);
    info = h("div", { class: "catinfo", role: "button", tabindex: "-1" }, [
      h("div", { class: "ci-txt" }, [h("div", { class: "ci-t" }), h("div", { class: "ci-d" })]),
      h("span", { class: "ci-go", "aria-hidden": "true", html: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' })
    ]);
  }
  function cls(s) { return "mspot pos-" + _yzMapPos_(s.pos) + (s.st ? " st-" + s.st : "") + (s.empty && s.st !== "lock" ? " empty" : ""); }
  function infoOf(s) { return _yzMapToInfo_(s.to, hb); }
  function title(s) { return s.label || infoOf(s).short || "打開"; }
  function fill(s) {
    if (!info) return;
    $(".ci-t", info).textContent = (s.st === "lock" ? "🔒 " : "") + title(s);
    $(".ci-d", info).textContent = s.st === "lock" ? "還在整理，開放後這裡的標籤會變回彩色。" : s.empty ? "這一章還沒有標題：藥師看到的是🔒（寫好第一個標題就自動打開）" : (s.desc || infoOf(s).name || "");
    info.classList.toggle("lock", s.st === "lock");
  }
  function aim(s) {
    var W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
    var ax = (s.x + s.w / 2) / 100 * W, ay = (s.y + s.h / 2) / 100 * H, tx0 = W * 0.5, ty0 = H * 0.42, k = 0.62;
    var nx = ax + (tx0 - ax) * k, ny = ay + (ty0 - ay) * k;
    var tx = Math.min(0, Math.max(W - MAP_ZOOM * W, nx - MAP_ZOOM * ax)), ty = Math.min(0, Math.max(H - MAP_ZOOM * H, ny - MAP_ZOOM * ay));
    cam.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + MAP_ZOOM + ")";
  }
  function light(s) {   // 滑到的物品亮起來（還沒開放的不亮）；其他地方暗一點
    var on = !!(s && fx && s.st !== "lock");
    Object.keys(pat).forEach(function (id) { pat[id].classList.toggle("on", on && id === s.id); });
    box.classList.toggle("foc", on);
  }
  function pick(s) {
    clearTimeout(leaveT); cur = s;
    Object.keys(vis).forEach(function (id) { vis[id].classList.toggle("on", id === s.id); });
    light(s);
    if (!fx) return;
    fill(s); info.classList.add("show");
    if (!still) aim(s);
  }
  function unpick() { cur = null; Object.keys(vis).forEach(function (id) { vis[id].classList.remove("on"); }); light(null); if (fx) { info.classList.remove("show"); cam.style.transform = ""; } }
  function leave() { clearTimeout(leaveT); leaveT = setTimeout(unpick, 150); }
  function go(s) {
    if (s.st === "lock") { if (o.onLock) o.onLock(s); else toast("🔒 「" + title(s) + "」還在整理，開放以後就能看"); return; }
    if (o.onSpot) o.onSpot(s.to, s);
  }
  spots.forEach(function (s, i) {
    vis[s.id] = cam.appendChild(h("div", { class: "spv " + cls(s), style: mapSpotBox(s) + ";--d:" + ((i * 0.43) % 2.6).toFixed(2) + "s" }, webSpotTag(s, cat, false)));
    var nm = title(s), inf = infoOf(s);
    var b = h("button", { type: "button", class: cls(s) + " spot", "data-id": s.id, style: mapSpotBox(s), "aria-label": nm + (s.st === "lock" ? "（還沒開放）" : "：" + inf.name), title: s.st === "lock" ? "還沒開放" : inf.name }, webSpotTag(s, cat, true));
    b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pick(s); });
    b.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") leave(); });
    b.addEventListener("pointerdown", function (e) { lastPT = e.pointerType; });
    b.addEventListener("focus", function () { var kbd = true; try { kbd = b.matches(":focus-visible"); } catch (x) { /* 舊瀏覽器 */ } if (kbd) pick(s); });
    b.addEventListener("blur", function () { leave(); });
    b.addEventListener("click", function (e) {
      var tch = lastPT ? lastPT !== "mouse" : touch; lastPT = "";
      if (tch && fx && cur !== s) { e.preventDefault(); pick(s); return; }   // 手機：第一下只是「選到」，第二下才進去
      go(s);
    });
    hit.appendChild(b);
  });
  stage.appendChild(hit);
  if (info) {
    stage.appendChild(info);
    info.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") clearTimeout(leaveT); });
    info.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") leave(); });
    info.addEventListener("click", function () { if (cur) go(cur); });
    info.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && cur) { e.preventDefault(); go(cur); } });
  }
  stage.addEventListener("click", function (e) { if (!(e.target.closest && e.target.closest(".spot, .catinfo")) && cur) unpick(); });
  box.appendChild(stage);
  return box;
}
// 平面目錄圖的遮罩：這一塊（X、Y、Wp、Hp，整張圖的 %）裡，地點的形狀（物品輪廓；沒有＝圓角的框）塗白、邊緣模糊 → data: 網址
// 跟 3D 一樣用「影子」的模糊（Safari 不支援 ctx.filter）。畫不出來（很舊的瀏覽器）＝null（那一塊就不疊）。
function spotMask(s, X, Y, Wp, Hp, A) {
  try {
    var BASE = 1200, pw = Math.max(8, Math.round(Wp / 100 * BASE)), ph = Math.max(8, Math.round(Hp / 100 * BASE / A)), sx = pw / Wp, sy = ph / Hp;
    var cv = document.createElement("canvas"); cv.width = pw; cv.height = ph;
    var c = cv.getContext("2d"), blur = Math.max(2, 0.014 * BASE / A), off = pw + 60 + blur * 4;
    c.fillStyle = "#fff"; c.shadowColor = "#fff"; c.shadowBlur = blur; c.shadowOffsetX = off;
    c.beginPath();
    if (Array.isArray(s.shape) && s.shape.length) {
      s.shape.forEach(function (r) { for (var k = 0; k + 1 < r.length; k += 2) { var px = (r[k] - X) * sx - off, py = (r[k + 1] - Y) * sy; if (k) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); });
    } else {
      var x = (s.x - X) * sx - off, y = (s.y - Y) * sy, w = s.w * sx, hh = s.h * sy, rr = Math.max(0, Math.min(w / 2, hh / 2, 2 * BASE / A / 100));
      c.moveTo(x + rr, y); c.arcTo(x + w, y, x + w, y + hh, rr); c.arcTo(x + w, y + hh, x, y + hh, rr); c.arcTo(x, y + hh, x, y, rr); c.arcTo(x, y, x + w, y, rr); c.closePath();
    }
    c.fill();
    return cv.toDataURL("image/png");
  } catch (e) { return null; }
}
// 3D 環景目錄（YZPano，hb3d.js）：圖要用「原始檔」（hbCatImg 拿來的，放記憶體），Google 的圖片網址不一定讓網頁讀像素。
// 不能 3D、拿不到原始檔、圖讀失敗 → 外面改用平面目錄（一樣能點）。一頁同時只留一個 3D（換頁、重畫前要 destroy）。
function panoOk(cat) { return !!(cat && cat.img && cat.fid && cat.p3d !== false && window.YZPano && YZPano.webglOk()); }
function webCatalogPano(parent, cat, hb, o) {
  o = o || {};
  if (!panoOk(cat) || !o.img) return null;
  var spots = _yzMapSpots_(cat).slice(0, YZ_MAP_MAX).map(function (s) { var inf = _yzMapToInfo_(s.to, hb); return Object.assign({}, s, { sub: inf.ok ? inf.name : "" }); });
  var wrap = h("div", { class: "panowrap" + (o.float ? " full" : "") }), box = h("div", { class: "pano" });
  if (o.width) wrap.style.maxWidth = o.width + "px";
  wrap.appendChild(box); parent.appendChild(wrap);
  var api = YZPano.mount(box, {
    img: o.img, ar: cat.ar, spots: spots, theta: cat.theta || 70, labels: cat.labels !== false, fx: cat.fx !== false, dim: cat.dim !== false, ctl: o.ctl || "", title: cat.title || "目錄", float: !!o.float, avoid: o.avoid,
    onOpen: function (s) { if (o.onSpot) o.onSpot(s.to, s); },
    onLock: function (s) { if (o.onLock) o.onLock(s); else toast("🔒 「" + (s.label || "這裡") + "」還在整理，開放以後就能看"); },
    onError: function () { if (o.onError) o.onError(); }
  });
  if (!api) { wrap.remove(); return null; }
  wrap._api = api;
  return wrap;
}
/* ───────── 章的主題（第 25 批）：背景＝目錄圖（圖一）上這一章的位置裁下來的圖；圖示＝目錄圖上那個地點的圖示 ───────── */
function cssUrl(u) { return 'url("' + String(u || "").replace(/["\\\n\r]/g, "") + '")'; }
function chIco(c, hb) { var o = _yzChIcons_(hb || HB); return (c && o[c.id]) || "📘"; }
function chBgUrl(c) { return _yzChBg_(c); }
// 章元卡片（沒有目錄圖時的首頁、編輯器的預覽）：主題圖＋圖示＋章名＋簡介。不寫「第幾章」
function webChapterCard(c, n, o) {
  o = o || {};
  var lock = !!o.lock, bg = chBgUrl(c), ico = o.ico || chIco(c, o.hb);
  var go = function () { if (o.onclick) o.onclick(); };
  var el = h("div", { class: "ccard" + (lock ? " lock" : ""), role: "button", tabindex: "0", "aria-label": (c.name || "") + (lock ? "（還在整理）" : ""), onclick: go, onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } } }, [
    bg && !lock ? h("div", { class: "cc-img", style: "background-image:" + cssUrl(bg) }) : h("div", { class: "cc-img noimg" }, [h("span", {}, [lock ? "🔒" : ico])]),
    h("div", { class: "cc-b" }, [
      h("div", { class: "cc-t" }, [(bg && !lock ? ico + " " : "") + (c.name || "（還沒有章名）")]),
      c.intro ? h("div", { class: "cc-it" }, [c.intro]) : null,
      h("div", { class: "cc-n" }, [lock ? "還在整理，開放以後就能看" : n ? n + " 個標題" : (IS_DEV ? "還沒有標題（藥師看到🔒）" : "還沒有內容")])
    ])
  ]);
  if (o.width) { el.style.width = o.width + "px"; el.style.cursor = "default"; }
  return el;
}

/* ───────── 看手冊 ───────── */
// view：""＝首頁／章／內容、"search"＝搜尋結果
var WV = { cid: null, tid: null, view: "", q: "", qv: "", hl: null, pano: null, flat: false };
function buildView() { WV = { cid: null, tid: null, view: "", q: "", qv: "", hl: null, pano: null, flat: false }; }
function seen(kind, label) { if (CFG && CFG.viewLog === false) return; call("hbSeen", [kind, String(label || "").slice(0, 80)]).then(function (x) { if (x && x.st === "lock") logout("expired"); }, function () { /* 記不到就算了 */ }); }
// 捲到某個地方以後，上面的圖才載好（高度變了）：再捲一次。自己動過畫面（滾輪、手指、按鍵）就不管；最多 5 秒
function keepInView(el) {
  var moved = false, t0 = Date.now(), stop = function () { moved = true; };
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) { window.addEventListener(ev, stop, { once: true, passive: true }); });
  Array.prototype.forEach.call(document.querySelectorAll("#pane-view img"), function (im) {
    if (im.complete || !(im.compareDocumentPosition(el) & 4)) return;   // 4＝這張圖在 el 前面
    im.addEventListener("load", function () { if (!moved && Date.now() - t0 < 5000 && el.isConnected) el.scrollIntoView({ block: "center" }); }, { once: true });
  });
}
function topOfView() { try { window.scrollTo(0, 0); } catch (e) { /* 沒關係 */ } }
function openChapter(cid) {
  var c = chapterOf(cid); if (!c) { toast("找不到這一章（可能被刪掉了）"); return; }
  var ts = titlesOf(cid);
  if (ts.length === 1) { openTitle(ts[0].id); return; }
  WV.cid = cid; WV.tid = null; WV.view = ""; WV.hl = null; drawWeb(); topOfView();
  seen("開啟章", c.name);
}
function openTitle(tid, hl) {
  var t = titleOf(tid); if (!t) { toast("找不到這個標題（可能被刪掉了）"); return; }
  var c = chapterOf(t.ch);
  WV.cid = t.ch; WV.tid = tid; WV.view = ""; WV.hl = hl && hl.length ? hl : null; drawWeb();
  var m = $("#pane-view mark, #pane-view figure.ocrhit"); if (m) { m.scrollIntoView({ block: "center" }); keepInView(m); } else topOfView();   // 第一個符合的字（或圖裡有那個字的那張圖）
  seen("看標題", (c ? c.name + "　" : "") + t.name);
}
function webSearch(q) {
  q = String(q || "").trim().slice(0, 60); WV.qv = q;
  if (!q) { WV.view = ""; drawWeb(); return; }
  WV.q = q; WV.view = "search"; WV.tid = null; drawWeb(); topOfView();
}
function goHome() { WV.cid = null; WV.tid = null; WV.view = ""; drawWeb(); topOfView(); }
function goHomeTab() { if (TAB !== "view") showTab("view"); goHome(); }   // 標誌、「🏠 首頁」、「‹ 調劑台」
function homeName() { return homeMapOn() ? ((HB.cat && HB.cat.title) || "藥師調劑台") : "首頁"; }

function drawWeb() {
  var root = $("#pane-view"); if (!root || !HB) return;
  if (WV.pano) { try { WV.pano.destroy(); } catch (e) { /* 沒關係 */ } WV.pano = null; }
  root.innerHTML = "";
  var atHome = !WV.cid && !WV.tid && !WV.view;
  if (atHome && homeMapOn()) { drawHomeFull(root); return; }   // 首頁＝滿版調劑台
  homeClass(true);   // 章、標題、搜尋（還有沒有目錄圖時的首頁）：也是整個畫面，上面那一排收起來
  drawPage(root, atHome);
}

/* ───────── 章、標題、搜尋、沒有目錄圖時的首頁：照「圖一」的樣子（第 25 批）─────────
   背景＝這一章在目錄圖上的位置（放大、淡淡的）；上下各一條跑馬燈；左上「‹ 調劑台」（回上一層）；右上「藥戰手冊」標誌（＝回首頁）；
   名字、閒置倒數、登出在下面一行；每個標題一張粗黑框卡片，按了打開。
   第 28 批：大標題兩邊的波浪線拿掉；那個位置可以放自己上傳的符號（編輯器「📢 跑馬燈・大標題」；例如以後的藥劑部標誌），沒放就空著。 */
function pgSym() { var s = HB && HB.cat && HB.cat.sym; return s && /^https:\/\//.test(s.url || "") ? s : null; }
function pgHead(title, sub) {
  var sym = pgSym();
  var box = h("div", { class: "pgh" + (sym ? " sym" : "") }, [sym ? h("img", { class: "pgsym", src: sym.url, alt: "", "aria-hidden": "true" }) : null, h("h1", {}, [title])]);
  return sub ? h("div", {}, [box, h("div", { class: "pgsub" }, [h("span", {}, [sub])])]) : box;
}
function pgCard(kids, o) {   // 一張粗黑框卡片；o.go：整張可以按
  o = o || {};
  var el = h("div", { class: "pcard" + (o.cls ? " " + o.cls : "") }, kids);
  if (o.go) {
    el.setAttribute("role", "button"); el.setAttribute("tabindex", "0");
    if (o.label) el.setAttribute("aria-label", o.label);
    el.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) return; o.go(); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); o.go(); } });
  } else el.classList.add("flat");
  return el;
}
function titleThumb(t) {   // 標題卡片上的小圖：內容裡的第一張圖（沒有就不放）
  var u = "";
  (t.blocks || []).some(function (b) {
    if (b.t === "img" && b.url) u = b.url;
    else if (b.t === "anim") u = b.kind === "steps" ? (((b.steps || []).filter(function (x) { return x && x.url; })[0] || {}).url || "") : (b.poster || "");
    else if (b.t === "ladder") { var im = _yzLadderImgs_(b)[0]; if (im) u = im.img.url; }
    return !!u;
  });
  return /^https:\/\//.test(u) ? u : "";
}
function pgStatus() {   // 名字、閒置倒數、登出（開發者多「編輯」「管理」）
  var who = (ME.name || "") + (ME.emp ? "　" + ME.emp : "") + (IS_DEV && ME.name !== "開發者" ? "　（開發者）" : "");
  return h("div", { class: "pgme" }, [
    h("div", { class: "hwho" }, [who ? h("b", {}, [who]) : null, h("span", { class: "idle" }, [""]), h("span", { class: "idle short", "aria-hidden": "true" }, [""])]),
    IS_DEV ? btn("✏️ 編輯", function () { showTab("edit"); }, "sm hbtn") : null,
    IS_DEV ? btn("👥 管理", function () { showTab("admin"); }, "sm hbtn") : null,
    btn("登出", function () { logout("out"); }, "sm hbtn")
  ]);
}
function drawPage(root, atHome) {
  var t = WV.view !== "search" && WV.tid ? titleOf(WV.tid) : null;
  var c = WV.view === "search" ? null : t ? chapterOf(t.ch) : (WV.cid ? chapterOf(WV.cid) : null);
  if (!atHome && WV.view !== "search" && !c) { WV.cid = null; WV.tid = null; atHome = true; }
  var bg = c ? chBgUrl(c) : "", ico = c ? chIco(c) : "";
  var pg = h("section", { class: "pg" + (bg ? " has-bg" : ""), "aria-label": c ? c.name : WV.view === "search" ? "搜尋" : "藥戰手冊" });
  var back = h("div", { class: "pgbg", "aria-hidden": "true" });
  if (bg) back.style.backgroundImage = cssUrl(bg);
  pg.appendChild(back);
  var mqOn = mqConf(HB.cat).on, mqName = c ? c.name : WV.view === "search" ? "搜尋" : "";
  if (mqOn) pg.appendChild(marquee(mqWords(mqName))); else pg.style.setProperty("--mqh", "0px");
  var col = h("div", { class: "pgcol" });
  // 上：‹ 回上一層 ＋ 標誌
  var up = null;
  if (t && c && titlesOf(c.id).length > 1) up = h("button", { class: "pgback", type: "button", onclick: function () { openChapter(c.id); } }, ["‹ " + c.name]);
  else if (!atHome) up = h("button", { class: "pgback", type: "button", onclick: goHome }, ["‹ " + homeName()]);
  col.appendChild(h("div", { class: "pgtop" }, [up || h("span"), h("button", { class: "pglogo", type: "button", title: "回首頁", onclick: goHomeTab }, ["藥戰手冊"])]));
  col.appendChild(pgStatus());
  if (WV.view === "search") drawSearchResults(col);
  else if (t) drawTitlePage(col, c, t);
  else if (c) drawChapterPage(col, c, ico, bg);
  else drawHome(col);
  if (YZ_CFG.footer) col.appendChild(h("div", { class: "pgfoot" }, [YZ_NOTICE]));
  pg.appendChild(col);
  if (mqOn) pg.appendChild(marquee(mqWords(mqName), "mqb"));
  pg.appendChild(h("div", { class: "pgdock" }, [
    btn("🔍 搜尋", function () { homeSearch(pg); }, "hfab"),
    btn("☰ 章元", function () { homeDrawer(pg); }, "hfab")
  ]));
  if (!atHome) pg.appendChild(h("button", { class: "hhome", type: "button", onclick: goHome, title: "回首頁" }, ["🏠 首頁"]));
  root.appendChild(pg);
  if (WV.cid || WV.tid || WV.view) pg.style.setProperty("--colw", (t ? Math.min(1000, Math.max(680, (t.ww || 760) + 70)) : 680) + "px");
  idleTick();
}
function drawChapterPage(col, c, ico, bg) {
  var tts = titlesOf(c.id);
  col.appendChild(pgHead(ico + " " + c.name, c.intro || (tts.length ? tts.length + " 個標題" : "")));
  if (IS_DEV && !bg) col.appendChild(h("div", { class: "pgdev" }, [homeMapOn() || (HB.cat && HB.cat.img) ? "（開發者）這一章在目錄圖上沒有地點，所以沒有背景：到「✏️ 編輯」→「🖼 目錄圖」新增一個連到這一章的地點，按「儲存」就會自動做好。" : "（開發者）還沒有背景：先到「✏️ 編輯」→「🖼 目錄圖」放圖一，按「儲存」，每一章的背景就會自動做好。"]));
  if (!tts.length) {
    col.appendChild(pgCard([h("div", { class: "pc-t" }, [IS_DEV ? "這一章還沒有標題" : "🔒 這一章還在整理"]), h("div", { class: "pc-note" }, [IS_DEV ? "藥師在首頁看到的是🔒。到「✏️ 編輯」新增第一個標題，就會自動打開。" : "還沒有內容，開放以後就能看。"])]));
    return;
  }
  // 第 28 批：整章的內容直接展開（不用一篇一篇點進去）；上面一排是標題清單，點了直接捲到那一篇
  if (tts.length > 1) {
    var toc = h("div", { class: "chtoc" }, [h("div", { class: "chtoc-h" }, ["這一章有 " + tts.length + " 個標題（點了直接捲到那一篇）"])]), tl = h("div", { class: "chtoc-l" });
    tts.forEach(function (tt, k) {
      tl.appendChild(h("button", { class: "chtoc-b", type: "button", onclick: function () { var el = document.getElementById("cht-" + tt.id); if (el) el.scrollIntoView({ block: "start" }); } }, [(k + 1) + ". " + (tt.name || "（還沒有標題）")]));
    });
    toc.appendChild(tl);
    col.appendChild(pgCard([toc], { cls: "slim" }));
  }
  tts.forEach(function (tt) {
    var art = webArticle(c, tt, { width: tt.ww || 760, onImg: lightbox, hl: null, hb: HB, onTitle: openTitle, onChapter: openChapter, page: true });
    art.insertBefore(h("div", { class: "chsec-h" }, [h("h2", { class: "chsec-t" }, [tt.name || "（還沒有標題）"]), h("button", { class: "pbtn chsec-o", type: "button", onclick: function () { openTitle(tt.id); }, "aria-label": "單獨看「" + (tt.name || "") + "」" }, ["單獨看 ›"])]), art.firstChild);
    col.appendChild(h("section", { class: "chsec", id: "cht-" + tt.id }, [h("div", { class: "pgart" }, [art])]));
  });
  var bk = webBacklinks(_yzBacklinks_(HB, [c.id], null), c.id, openTitle);   // 互相連結：從別的標題連到這一章的
  if (bk) col.appendChild(pgCard([bk]));
}
function drawTitlePage(col, c, t) {
  var ts = titlesOf(c.id), i = ts.indexOf(t);
  col.appendChild(pgHead(t.name || "（還沒有標題）"));
  col.appendChild(h("div", { class: "pgsub" }, [h("button", { class: "pgchip", type: "button", onclick: function () { openChapter(c.id); } }, [chIco(c) + " " + c.name])]));
  var art = webArticle(c, t, { width: t.ww || 760, onImg: lightbox, hl: WV.hl, hb: HB, onTitle: openTitle, onChapter: openChapter, page: true });
  col.appendChild(h("div", { class: "pgart" }, [art]));
  col.appendChild(h("div", { class: "pgnav" }, [
    i > 0 ? h("button", { class: "pbtn nav", type: "button", onclick: function () { openTitle(ts[i - 1].id); } }, ["‹ " + ts[i - 1].name]) : h("span"),
    i < ts.length - 1 ? h("button", { class: "pbtn nav", type: "button", onclick: function () { openTitle(ts[i + 1].id); } }, [ts[i + 1].name + " ›"]) : h("span")
  ]));
  if (IS_DEV) col.appendChild(h("div", { class: "pgnav c" }, [h("button", { class: "pbtn nav", type: "button", onclick: function () { gotoEdit(t.id); } }, ["✏️ 在編輯器打開這個標題"])]));
}
function drawHome(col) {   // 還沒有目錄圖（或「開啟目錄圖」關著）的首頁：章元卡片
  WV.cid = null; WV.tid = null;
  col.appendChild(pgHead("藥戰手冊", "點一章開始看；或用左下角的「🔍 搜尋」"));
  var g = h("div", { class: "pgrid" });
  HB.chapters.forEach(function (c) {
    var n = titlesOf(c.id).length, lock = !n && !IS_DEV;
    g.appendChild(webChapterCard(c, n, { lock: lock, onclick: function () { if (lock) { homeLockToast(c.name); return; } openChapter(c.id); } }));
  });
  col.appendChild(g);
}
/* ───────── 首頁：滿版調劑台（照參考網站：一打開整個畫面就是調劑台）─────────
   最上面一條跑馬燈；左上角「藥戰手冊」標誌＋提示；右上角名字、閒置倒數、登出（開發者多「編輯」「管理」）；
   左下角 🔍 搜尋、☰ 章元；右下角是 3D 的按鍵。還沒有目錄圖（或「開啟目錄圖」關著）：用章元卡片當首頁。 */
function homeMapOn() { var c = HB && HB.cat; return !!(c && c.on && c.img); }
function homeClass(on) { if (APP) APP.classList.toggle("home-on", !!on); }
function homeLockToast(name) { toast("🔒 「" + (name || "這一章") + "」還在整理，開放以後就能看"); }
/* 跑馬燈：開發者在編輯器「📢 跑馬燈」改（開關、內容一段一段、速度）；沒設定過＝預設。「［這一頁］」＝那一頁的名字 */
var MQ_PAGE = "［這一頁］", MQ_SPEED = { slow: 1.1, mid: 0.74, fast: 0.45 };   // 每個字跑幾秒（字越多，一圈越久，看起來一樣快）
function mqDefault() { return ["藥戰手冊", MQ_PAGE].concat(YZ_CFG.footer ? [YZ_NOTICE.replace(/[。.]$/, "")] : []); }
function mqConf(cat) {
  var q = cat && cat.mq;
  if (!q) return { on: true, items: mqDefault(), speed: "mid" };
  return { on: q.on !== false, items: (q.items || []).length ? q.items.slice() : ["藥戰手冊", MQ_PAGE], speed: MQ_SPEED[q.speed] ? q.speed : "mid" };
}
function mqWordsOf(conf, name) { return conf.items.map(function (w) { return String(w).split(MQ_PAGE).join(name); }); }
function mqWords(name) { return mqWordsOf(mqConf(HB && HB.cat), name || (HB && HB.cat && HB.cat.title) || "藥師調劑台"); }
function marquee(words, cls, speed) {
  var group = function () {
    var g = h("span", { class: "mq-g" });
    for (var i = 0; i < 6; i++) words.forEach(function (w) { g.appendChild(h("i", { class: "mq-ar" }, ["→"])); g.appendChild(h("b", {}, [w])); });
    return g;
  };
  var n = 0; words.forEach(function (w) { n += String(w).length + 2; });
  var el = h("div", { class: "mq" + (cls ? " " + cls : ""), "aria-hidden": "true" }, [h("div", { class: "mq-track" }, [group(), group()])]);   // 兩組一樣的接在一起，往左跑一組的寬度＝接得起來
  el.style.setProperty("--mqs", Math.max(16, Math.round(n * 6 * (MQ_SPEED[speed || mqConf(HB && HB.cat).speed] || MQ_SPEED.mid))) + "s");
  return el;
}
function drawHomeFull(root) {
  WV.cid = null; WV.tid = null;
  homeClass(true);
  var cat = _yzMapLive_(HB.cat, HB, IS_DEV);
  var goTo = function (to) { var m = /^([ct]):(.+)$/.exec(to || ""); if (!m) return; if (m[1] === "c") openChapter(m[2]); else openTitle(m[2]); };
  var onLock = function (s) { homeLockToast(s && s.label); };
  var home = h("section", { class: "home", "aria-label": "首頁（手冊目錄）" });
  var stage = h("div", { class: "hstage" }), scene = h("div", { class: "hscene" });
  if (mqConf(HB.cat).on) home.appendChild(marquee(mqWords(cat.title))); else home.style.setProperty("--mqh", "0px");   // 跑馬燈關掉：不放
  home.appendChild(stage); stage.appendChild(scene); root.appendChild(home);
  var flat = function () {
    if (WV.pano) { try { WV.pano.destroy(); } catch (e) { /* 沒關係 */ } WV.pano = null; }
    scene.innerHTML = ""; scene.classList.add("flat");
    scene.appendChild(webCatalogMap(cat, HB, { full: true, onSpot: goTo, onLock: onLock }));
  };
  if (panoOk(cat) && !WV.flat) {
    var u = catBlob(cat, function () { if (MAIN && TAB === "view" && !WV.tid && !WV.cid && !WV.view) drawWeb(); });
    if (u) {
      var pw = webCatalogPano(scene, cat, HB, { img: u, float: true, ctl: "hide", onSpot: goTo, onLock: onLock, onError: function () { WV.flat = true; flat(); },
        avoid: function () { return [$(".hbrand", stage), $(".hme", stage), $(".hdock", stage)]; } });   // 標籤避開蓋在圖上的標誌、名字、按鈕
      if (pw) WV.pano = pw._api; else flat();
    } else if (u === "") scene.appendChild(h("div", { class: "panoload hload", style: "background-image:url(\"" + String(cat.img).replace(/["\\]/g, "") + "\")" }, [h("span", {}, ["3D 目錄載入中…"])]));
    else flat();
  } else flat();
  // 左上：標誌＋提示
  stage.appendChild(h("div", { class: "hbrand" }, [
    h("h1", { class: "hlogo2" }, [h("span", { class: "sr" }, ["手冊目錄　"]), "藥戰手冊"]),
    h("div", { class: "hchip" }, [cat.hint || "拖曳轉動、點圖上的按鍵，進到那一章"])
  ]));
  // 右上：誰、閒置倒數、登出（開發者：編輯、管理）
  var who = (ME.name || "") + (ME.emp ? "　" + ME.emp : "") + (IS_DEV && ME.name !== "開發者" ? "　（開發者）" : "");
  stage.addEventListener("scroll", function () { if (stage.scrollLeft || stage.scrollTop) { stage.scrollLeft = 0; stage.scrollTop = 0; } });
  stage.appendChild(h("div", { class: "hme" }, [
    h("div", { class: "hwho" }, [who ? h("b", {}, [who]) : null, h("span", { class: "idle" }, [""]), h("span", { class: "idle short", "aria-hidden": "true" }, [""])]),
    IS_DEV ? btn("✏️ 編輯", function () { showTab("edit"); }, "sm hbtn") : null,
    IS_DEV ? btn("👥 管理", function () { showTab("admin"); }, "sm hbtn") : null,
    btn("登出", function () { logout("out"); }, "sm hbtn")
  ]));
  // 左下：搜尋、章元
  stage.appendChild(h("div", { class: "hdock" }, [
    btn("🔍 搜尋", function () { homeSearch(stage); }, "hfab"),
    btn("☰ 章元", function () { homeDrawer(stage); }, "hfab")
  ]));
  idleTick();
  if (WV.pano && WV.pano.refreshAvoid) WV.pano.refreshAvoid();
}
function homeSearch(stage) {
  var old = $(".hsearch", stage); if (old) { old.remove(); return; }
  var qin = h("input", { class: "in", type: "search", enterkeyhint: "search", placeholder: "搜尋手冊（打字，或打「第14頁」）", "aria-label": "搜尋手冊" });
  var box = h("form", { class: "hsearch", role: "search", onsubmit: function (e) { e.preventDefault(); var q = qin.value; box.remove(); webSearch(q); } }, [
    qin, h("button", { class: "btn pri", type: "submit" }, ["搜尋"]), h("button", { class: "btn", type: "button", "aria-label": "關掉搜尋", onclick: function () { box.remove(); } }, ["✕"])
  ]);
  box.addEventListener("keydown", function (e) { if (e.key === "Escape") box.remove(); });
  stage.appendChild(box);
  try { qin.focus(); } catch (e) { /* 沒關係 */ }
}
function homeDrawer(stage) {
  var close = function () { $$(".hdrawer, .hshade", stage).forEach(function (x) { x.remove(); }); };
  if ($(".hdrawer", stage)) { close(); return; }
  var list = h("nav", { class: "hdrawer", "aria-label": "章元" });
  list.appendChild(h("div", { class: "hdh" }, [h("b", {}, ["章元（" + HB.chapters.length + "）"]), h("button", { class: "btn sm", type: "button", "aria-label": "關掉章元", onclick: close }, ["✕"])]));
  var item = function (on, thumb, name, sub, label, fn) {
    return h("div", { class: "chI" + (on ? " on" : "") + (label.lock ? " lock" : ""), role: "button", tabindex: "0", "aria-label": label.text, onclick: fn, onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } } }, [
      thumb, h("div", {}, [h("div", { class: "t2" }, [name]), sub ? h("div", { class: "t1" }, [sub]) : null])
    ]);
  };
  var atHome = !WV.cid && !WV.tid && !WV.view;
  list.appendChild(item(atHome, h("div", { class: "th thi" }, ["🏠"]), homeName(), "", { text: "回首頁" }, function () { close(); goHome(); }));
  HB.chapters.forEach(function (c) {
    var n = titlesOf(c.id).length, lock = !n && !IS_DEV, bg = chBgUrl(c);
    var go = function () { if (lock) { homeLockToast(c.name); return; } close(); openChapter(c.id); };
    list.appendChild(item(WV.cid === c.id && !WV.view, bg && !lock ? h("div", { class: "th thimg", style: "background-image:" + cssUrl(bg) }) : h("div", { class: "th thi" }, [lock ? "🔒" : chIco(c)]),
      c.name, lock ? "還在整理" : n ? n + " 個標題" : "還沒有標題（藥師看到🔒）", { text: c.name + (lock ? "（還在整理）" : ""), lock: lock }, go));
  });
  list.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  stage.appendChild(h("div", { class: "hshade", onclick: close }));
  stage.appendChild(list);
  var f = $(".chI", list); if (f) try { f.focus(); } catch (e) { /* 沒關係 */ }
}
function drawSearchResults(col) {
  var r = _yzSearch_(HB, WV.q);
  col.appendChild(pgHead(r.page ? "手冊第 " + r.page + " 頁" : "搜尋「" + WV.q + "」", r.hits.length ? "找到 " + r.hits.length + " 個標題" : ""));
  var qin = h("input", { class: "in", type: "search", enterkeyhint: "search", placeholder: "搜尋手冊（打字，或打「第14頁」）", value: WV.qv, "aria-label": "搜尋手冊" });
  col.appendChild(pgCard([h("form", { class: "pgsearch", role: "search", onsubmit: function (e) { e.preventDefault(); qin.blur(); webSearch(qin.value); } }, [qin, h("button", { class: "pbtn dark", type: "submit" }, ["搜尋"])])], { cls: "slim" }));
  if (!r.hits.length) col.appendChild(pgCard([h("div", { class: "pc-t" }, [r.page ? "手冊裡沒有對應這一頁的標題" : "手冊裡沒有「" + WV.q + "」"]), h("div", { class: "pc-note" }, [r.page ? "標題有填「藥戰手冊頁數」才找得到。" : "這裡只查手冊，不查藥。"])]));
  r.hits.forEach(function (hit) {
    var pg = _yzPageText_(hit.t.page), label = YZ_WHERE[hit.where] && hit.where !== "page" ? YZ_WHERE[hit.where] + "有符合" : "";
    col.appendChild(pgCard([
      h("div", { class: "pc-meta" }, [h("span", { class: "pc-ch" }, [chIco(hit.ch) + " " + hit.ch.name]), pg ? h("span", { class: "pc-pg" }, ["📖 " + pg]) : null, label ? h("span", {}, [label]) : null]),
      h("h2", { class: "pc-t" }, hlNodes(hit.t.name, r.toks)),
      hit.where !== "page" ? h("div", { class: "pc-note" }, hlNodes(hit.snip, r.toks, hit.where === "ocr")) : null
    ], { go: function () { openTitle(hit.t.id, r.toks); }, label: "打開「" + hit.t.name + "」" }));
  });
}

/* ════════ rte.js ════════ */
/* rte.js — 文字編輯器（網頁編輯用）。像 Notion 那樣「看到什麼就是什麼」，格式用最上面那一排按鍵（沒有「/」選單）。
 * 內容存成「格式文字」（rt.js 的標記）；這裡只管畫面和操作：選字 → 按鍵、按 Enter 換行、Backspace 合併、貼上、復原。
 * 做法：打字交給瀏覽器（中文輸入法不會被打斷）；按格式鍵、Enter、Backspace、貼上這些，才改「資料」再重畫。
 * 資料的單位是「一行」：{k:種類, lv:縮排, tone:標註顏色, go:連結的標題, img:圖的代號, runs:[{t:字, b,i,u,s,c,z}]}。
 * 第 28 批：一行也可以是一張圖（[img=代號]）：文字和圖片放在同一塊；圖的網址、圖說放在這一塊的 pics（o.pics() 拿得到），上傳交給編輯器（o.imgUp）。 */
var RTE = { cur: null, pop: null, bar: null, lastColor: "red" };
var RTE_EMOJI = ["⚠️", "❗", "❓", "✅", "❌", "➡️", "⬆️", "⬇️", "📌", "📖", "📞", "⏰", "🔒", "💊", "💉", "🌡️", "❄️", "🔥", "⭐", "🔴", "🟡", "🟢", "🔵", "👍"];

function rteTxt(runs) { return _yzRtRunsText_(runs); }
function rteLen(L) { return L && L.runs ? rteTxt(L.runs).length : 0; }
// 「連結」可以選的：[{ id, label, grp }]（有 grp 的照 grp 分組）→ <option>／<optgroup>
function rteGoOpts(opts) {
  var out = [], gs = {};
  (opts || []).forEach(function (x) {
    var op = h("option", { value: x.id }, [x.label]);
    if (!x.grp) { out.push(op); return; }
    if (!gs[x.grp]) { gs[x.grp] = h("optgroup", { label: x.grp }); out.push(gs[x.grp]); }
    gs[x.grp].appendChild(op);
  });
  return out;
}
function rteIsBlock(L) { return !!L && (L.k === "hr" || L.k === "go" || L.k === "img"); }        // 沒有字的行（分隔線、連結到標題、圖）
function rteNewPicId(pics) { var id; do { id = Math.random().toString(36).slice(2, 10); } while (!/^[a-z0-9]{8}$/.test(id) || (pics && pics[id])); return id; }   // 圖的代號（這一塊裡不重複）
function rtePickFile(cb) {   // 選一張圖（電腦、手機的檔案選擇）
  var f = h("input", { type: "file", accept: "image/*", style: "display:none" });
  f.onchange = function () { var x = f.files && f.files[0]; f.remove(); if (x) cb(x); };
  document.body.appendChild(f); f.click();
}
function rteMarkClass(m) { return /^[☐☑]$/.test(m) ? "todo" : /^[•・●-]$/.test(m) ? "ul" : "ol"; }
function rteNewLine() { return { k: "p", lv: 0, runs: [] }; }
function rteCopyLines(ls) {
  return ls.map(function (L) {
    var o = { k: L.k, lv: L.lv || 0, runs: (L.runs || []).map(_yzRtCopy_) };
    if (L.tone) o.tone = L.tone;
    if (L.go !== undefined) o.go = L.go;
    if (L.img !== undefined) o.img = L.img;
    return o;
  });
}

function rteCreate(o) {
  o = o || {};
  var inst = {};
  var body = h("div", { class: "rtbody", contenteditable: "true", spellcheck: "false", autocapitalize: "off", autocorrect: "off", role: "textbox", "aria-multiline": "true", "aria-label": "文字內容（選取文字後，按最上面第二排的按鍵）" });
  var rawTa = h("textarea", { class: "ta rtraw", spellcheck: "false", "aria-label": "原始標記" });
  var rawNote = h("div", { class: "hint rtrawnote" }, ["標記模式：這就是「LINE 裡改字」時看到的樣子。[b]…[/b] 粗體、[c=red]…[/c] 紅字、[h2] 標題。改完再按一次「</> 標記」回到一般模式。"]);
  rawTa.hidden = true; rawNote.hidden = true;
  var el = h("div", { class: "rte" }, [body, rawNote, rawTa]);
  var lines = _yzRtParse_(o.value || "");
  var lastSel = null, rawMode = false, composing = false;
  var Hs = { st: [], i: -1, t: null };

  // ───────── 資料 → 畫面 ─────────
  function runNode(r) {
    if (!(r.b || r.i || r.u || r.s || r.c || r.z)) return document.createTextNode(r.t);
    var sp = h("span", { class: "rt" + (r.b ? " rt-b" : "") + (r.i ? " rt-i" : "") + (r.u ? " rt-u" : "") + (r.s ? " rt-s" : "") + (r.z ? " rt-z" + r.z : "") });
    sp.textContent = r.t;
    if (r.b) sp.setAttribute("data-b", "1");
    if (r.i) sp.setAttribute("data-i", "1");
    if (r.u) sp.setAttribute("data-u", "1");
    if (r.s) sp.setAttribute("data-s", "1");
    if (r.c && YZ_RT_COLORS[r.c]) { sp.setAttribute("data-c", r.c); sp.style.color = YZ_RT_COLORS[r.c]; }
    if (r.z && YZ_RT_SIZES[r.z]) sp.setAttribute("data-z", r.z);
    return sp;
  }
  function removeLine(d) {
    run(function (ls) {
      var li = Array.prototype.indexOf.call(body.childNodes, d);
      if (li >= 0) ls.splice(li, 1);
      if (!ls.length) ls.push(rteNewLine());
      var at = Math.min(Math.max(li, 0), ls.length - 1);
      return caret(at, 0);
    });
  }
  function lineEl(L) {
    var d = h("div", { class: "rl rl-" + L.k + (L.lv ? " rl-lv" + L.lv : ""), "data-k": L.k });
    if (L.lv) d.setAttribute("data-lv", String(L.lv));
    if (L.k === "hr") {
      d.setAttribute("contenteditable", "false");
      d.appendChild(h("hr"));
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這條分隔線", "aria-label": "刪除這條分隔線", onclick: function () { removeLine(d); } }, ["✕"]));
      return d;
    }
    if (L.k === "go") {
      d.setAttribute("contenteditable", "false"); d.setAttribute("data-go", L.go || "");
      var opts = o.titles ? o.titles() : [];
      var sel = h("select", { class: "in rl-gosel", "aria-label": "要連結到哪一章、哪個標題" }, [h("option", { value: "" }, ["（選一個標題或整章）"])].concat(rteGoOpts(opts)));
      sel.value = L.go || "";
      var gh = h("span", { class: "muted rl-gohint" });
      var paintGo = function () {
        var ok = !!sel.value, gone = !ok && !!d.getAttribute("data-go");
        d.classList.toggle("warn", !ok);
        gh.textContent = ok ? "LINE 上是一個可以點的按鈕列；對方那一頁最下面也會自動出現「從這裡連過來」（互相連結）。改名會自動跟著變" : gone ? "⚠ 原本連結的標題（或章）找不到了（可能被刪掉），請重新選一個" : "⚠ 還沒選：沒選的話，LINE 和網頁上都不會顯示這一行";
      };
      sel.onchange = function () { d.setAttribute("data-go", sel.value); paintGo(); lines = readLines(); emit(); histPush(); syncBar(); };
      paintGo();
      d.appendChild(h("span", { class: "rl-goic" }, ["🔗 連結到"]));
      d.appendChild(sel);
      d.appendChild(gh);
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這個連結", "aria-label": "刪除這個連結", onclick: function () { removeLine(d); } }, ["✕"]));
      return d;
    }
    if (L.k === "img") {   // 一張圖：縮圖＋圖說＋圖片裡的字的狀態＋換一張、刪除（整行不能打字）
      d.setAttribute("contenteditable", "false"); d.setAttribute("data-img", L.img || "");
      var P = o.pics ? (o.pics() || {})[L.img] : null;
      if (!P || !P.url) {
        d.classList.add("warn");
        d.appendChild(h("span", { class: "rl-imgmiss" }, ["⚠ 這張圖找不到了（可能被刪掉）：LINE 和網頁上都不會顯示這一行"]));
      } else {
        var cap = h("input", { class: "in rl-imgcap", value: P.cap || "", placeholder: "圖說（可以不填）", "aria-label": "圖說" });
        ["keydown", "keyup", "keypress", "beforeinput", "input", "paste", "copy", "cut", "compositionstart", "compositionend"].forEach(function (ev) { cap.addEventListener(ev, function (e) { e.stopPropagation(); }); });   // 圖說的字不是這一段文字：不要讓文字編輯器處理
        cap.addEventListener("input", function () { P.cap = cap.value; if (o.onPics) o.onPics(); });
        var side = h("div", { class: "rl-imgside" }, [cap]);
        var info = o.picInfo ? o.picInfo(P) : null; if (info) side.appendChild(info);
        side.appendChild(h("div", { class: "rl-imgbtns" }, [h("button", { class: "btn sm", type: "button", onclick: function () { rtePickFile(function (f) { replaceImg(L.img, f); }); } }, ["換一張…"])]));
        d.appendChild(h("img", { class: "rl-imgsrc", src: P.url, alt: "" }));
        d.appendChild(side);
      }
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這張圖", "aria-label": "刪除這張圖", onclick: function () { removeLine(d); } }, ["✕"]));
      return d;
    }
    if (L.k === "box") {
      var T = YZ_RT_TONES[L.tone] || YZ_RT_TONES.info;
      d.setAttribute("data-tone", L.tone || "info"); d.setAttribute("data-ic", T.icon);
      d.style.background = T.bg; d.style.borderColor = T.bd; d.style.color = T.ink;
    } else if (/^h[1-4]$/.test(L.k)) { var H = YZ_RT_HEAD[L.k]; d.style.fontSize = H.em + "em"; d.style.color = H.color; }
    if (!(L.runs || []).length) d.appendChild(h("br"));
    else L.runs.forEach(function (r) { d.appendChild(runNode(r)); });
    return d;
  }
  function render() {
    if (!lines.length) lines.push(rteNewLine());
    if (rteIsBlock(lines[lines.length - 1])) lines.push(rteNewLine());       // 最後一行一定要能打字
    body.innerHTML = "";
    lines.forEach(function (L, i) {
      var d = lineEl(L), pv = lines[i - 1], nx = lines[i + 1];
      if (L.k === "box") {   // 連續、同一種的標註，LINE 和網頁會合成一個框；這裡也畫成一個框
        if (pv && pv.k === "box" && pv.tone === L.tone && (pv.lv || 0) === (L.lv || 0)) d.setAttribute("data-cont", "1");   // 縮排不一樣的：分開成兩個框（跟網頁、LINE 一樣）
        if (nx && nx.k === "box" && nx.tone === L.tone && (nx.lv || 0) === (L.lv || 0)) d.setAttribute("data-more", "1");
      }
      body.appendChild(d);
    });
  }

  // ───────── 畫面 → 資料 ─────────
  function textLen(n) {
    if (n.nodeType === 3) return n.nodeValue.length;
    if (n.nodeName === "BR" || (n.nodeType === 1 && n.getAttribute("contenteditable") === "false")) return 0;
    var s = 0; for (var c = n.firstChild; c; c = c.nextSibling) s += textLen(c);
    return s;
  }
  function runsOf(root) {
    var runs = [];
    (function walk(n, at) {
      if (n.nodeType === 3) { var t = n.nodeValue.replace(/ /g, " ").replace(/[​﻿]/g, ""); if (t) { var r = { t: t }; for (var k in at) r[k] = at[k]; runs.push(r); } return; }
      if (n.nodeType !== 1 || n.nodeName === "BR") return;
      var a = {}; for (var k2 in at) a[k2] = at[k2];
      var nn = n.nodeName;
      if (n.hasAttribute("data-b") || nn === "B" || nn === "STRONG") a.b = 1;
      if (n.hasAttribute("data-i") || nn === "I" || nn === "EM") a.i = 1;
      if (n.hasAttribute("data-u") || nn === "U") a.u = 1;
      if (n.hasAttribute("data-s") || nn === "S" || nn === "STRIKE" || nn === "DEL") a.s = 1;
      if (n.hasAttribute("data-c") && YZ_RT_COLORS[n.getAttribute("data-c")]) a.c = n.getAttribute("data-c");
      if (n.hasAttribute("data-z") && YZ_RT_SIZES[n.getAttribute("data-z")]) a.z = n.getAttribute("data-z");
      for (var c = n.firstChild; c; c = c.nextSibling) walk(c, a);
    })(root, {});
    return _yzRtMerge_(runs);
  }
  function readLines() {
    var out = [];
    Array.prototype.forEach.call(body.childNodes, function (n) {
      if (n.nodeType === 3) { var t = n.nodeValue.replace(/ /g, " "); if (t.trim()) out.push({ k: "p", lv: 0, runs: [{ t: t }] }); return; }
      if (n.nodeType !== 1) return;
      var k = n.getAttribute("data-k") || "p";
      if (!/^(p|h[1-4]|hr|q|box|go|img)$/.test(k)) k = "p";
      var L = { k: k, lv: Math.min(YZ_RT_MAXLV, +(n.getAttribute("data-lv") || 0) || 0), runs: [] };
      if (k === "hr") { out.push(L); return; }
      if (k === "go") { L.go = n.getAttribute("data-go") || ""; out.push(L); return; }
      if (k === "img") { L.img = n.getAttribute("data-img") || ""; out.push(L); return; }
      if (k === "box") L.tone = YZ_RT_TONES[n.getAttribute("data-tone")] ? n.getAttribute("data-tone") : "info";
      L.runs = runsOf(n);
      out.push(L);
    });
    if (!out.length) out.push(rteNewLine());
    return out;
  }
  // 瀏覽器自己亂改了畫面（跨行刪除、拖拉…）留下奇怪的標籤：重畫一次，變回乾淨的樣子
  function dirtyDom() {
    var kids = body.childNodes, i, j, n;
    for (i = 0; i < kids.length; i++) { n = kids[i]; if (n.nodeType !== 1 || n.nodeName !== "DIV" || !n.hasAttribute("data-k")) return true; }
    var lns = body.querySelectorAll(".rl");
    for (i = 0; i < lns.length; i++) {
      var k = lns[i].getAttribute("data-k"); if (k === "hr" || k === "go" || k === "img") continue;
      var all = lns[i].getElementsByTagName("*");
      for (j = 0; j < all.length; j++) { var e = all[j]; if (e.nodeName === "BR") continue; if (e.nodeName === "SPAN" && e.classList.contains("rt")) continue; return true; }
    }
    return false;
  }
  function normalize() {
    var s = getSel() || lastSel;
    lines = readLines(); render();
    if (s) { try { setSel(s.a, s.b); } catch (e) { /* 位置對不上就算了 */ } }
    lastSel = getSel() || s;
  }

  // ───────── 游標位置（第幾行、第幾個字） ─────────
  function lineIndexOf(node) { var n = node; while (n && n.parentNode !== body) n = n.parentNode; return n ? Array.prototype.indexOf.call(body.childNodes, n) : -1; }
  function domPos(node, off) {
    if (node === body) { var last = body.childNodes.length - 1, li0 = Math.max(0, Math.min(off, last)); return { li: li0, o: off > last ? textLen(body.childNodes[li0]) : 0 }; }
    var li = lineIndexOf(node); if (li < 0) return null;
    var lineNode = body.childNodes[li], count = 0, found = false;
    (function walk(n) {
      if (found) return;
      if (n === node) {
        if (n.nodeType === 3) count += off; else for (var i = 0; i < off && i < n.childNodes.length; i++) count += textLen(n.childNodes[i]);
        found = true; return;
      }
      if (n.nodeType === 3) { count += n.nodeValue.length; return; }
      if (n.nodeName === "BR" || (n.nodeType === 1 && n.getAttribute("contenteditable") === "false")) return;
      for (var c = n.firstChild; c; c = c.nextSibling) { walk(c); if (found) return; }
    })(lineNode);
    return { li: li, o: count };
  }
  function domFromPos(li, off) {
    var lineNode = body.childNodes[li]; if (!lineNode) return null;
    if (lineNode.getAttribute("contenteditable") === "false") return { node: body, offset: li };
    var rest = off, lastT = null, res = null;
    (function walk(n) {
      if (res) return;
      if (n.nodeType === 3) { if (rest <= n.nodeValue.length) { res = { node: n, offset: rest }; return; } rest -= n.nodeValue.length; lastT = n; return; }
      if (n.nodeName === "BR") return;
      for (var c = n.firstChild; c; c = c.nextSibling) { walk(c); if (res) return; }
    })(lineNode);
    if (res) return res;
    if (lastT) return { node: lastT, offset: lastT.nodeValue.length };
    return { node: lineNode, offset: 0 };
  }
  function getSel() {
    var s = window.getSelection(); if (!s || !s.rangeCount) return null;
    var r = s.getRangeAt(0);
    if (!body.contains(r.startContainer) || !body.contains(r.endContainer)) return null;
    var a = domPos(r.startContainer, r.startOffset), b = domPos(r.endContainer, r.endOffset);
    return a && b ? { a: a, b: b } : null;
  }
  function setSel(a, b) {
    b = b || a;
    var s = domFromPos(a.li, a.o), e = domFromPos(b.li, b.o); if (!s || !e) return;
    var r = document.createRange(); r.setStart(s.node, s.offset); r.setEnd(e.node, e.offset);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  function caret(li, o) { return { a: { li: li, o: o }, b: { li: li, o: o } }; }
  function isCollapsed(s) { return s.a.li === s.b.li && s.a.o === s.b.o; }
  function lineSpan(s) {   // 要改「整行」的指令用：連點三下選一行時，選取的尾巴會落在下一行的開頭，那一行不算
    var to = s.b.li; if (to > s.a.li && s.b.o === 0) to--;
    return { from: s.a.li, to: to };
  }

  // ───────── 復原／重做 ─────────
  function snap() { return { v: _yzRtSerialize_(readLines()), sel: getSel() || lastSel }; }
  function histInit() { Hs.st = [snap()]; Hs.i = 0; }
  function histPush() {
    var s = snap(), top = Hs.st[Hs.i];
    if (top && top.v === s.v) { top.sel = s.sel; return; }
    Hs.st = Hs.st.slice(0, Hs.i + 1); Hs.st.push(s);
    if (Hs.st.length > 200) Hs.st.shift();
    Hs.i = Hs.st.length - 1;
  }
  function histFlush() { if (Hs.t) { clearTimeout(Hs.t); Hs.t = null; histPush(); } }
  function histLater() { if (Hs.t) clearTimeout(Hs.t); Hs.t = setTimeout(function () { Hs.t = null; histPush(); }, 500); }
  function restore(sn) {
    lines = _yzRtParse_(sn.v); render();
    if (sn.sel) { try { setSel(sn.sel.a, sn.sel.b); } catch (e) { /* 位置對不上就算了 */ } }
    lastSel = getSel() || sn.sel;
    emit(); syncBar();
  }
  function undo() { histFlush(); if (Hs.i > 0) { Hs.i--; restore(Hs.st[Hs.i]); } }
  function redo() { histFlush(); if (Hs.i < Hs.st.length - 1) { Hs.i++; restore(Hs.st[Hs.i]); } }

  // ───────── 通知外面 ─────────
  function value() { return _yzRtSerialize_(lines).replace(/\n+$/, ""); }
  function emit() { if (o.onChange) o.onChange(value()); }
  function syncBar() { if (typeof rteBarSync === "function") rteBarSync(); }
  function focusBody() {
    if (!body.contains(document.activeElement)) { body.focus({ preventScroll: true }); if (lastSel) { try { setSel(lastSel.a, lastSel.b); } catch (e) { /* ignore */ } } }
  }
  // 改資料的統一入口：fn(行們, 選取) → 新的選取
  function run(fn) {
    if (rawMode) return;
    focusBody();
    var s = getSel() || lastSel || caret(Math.max(0, lines.length - 1), 0);
    lines = readLines(); histFlush();
    if (s.a.li >= lines.length || s.b.li >= lines.length) s = caret(lines.length - 1, 0);
    var ns = fn(lines, s) || s;
    if (!lines.length) lines.push(rteNewLine());
    render();
    try { setSel(ns.a, ns.b); } catch (e) { /* ignore */ }
    lastSel = getSel() || ns;
    histPush(); emit(); syncBar();
  }

  // ───────── 改資料的小動作 ─────────
  function deleteSel(ls, s) {   // 刪掉選到的字（可能跨好幾行），回傳游標位置
    if (isCollapsed(s)) return { li: s.a.li, o: s.a.o };
    var A = ls[s.a.li], B = ls[s.b.li];
    var head = rteIsBlock(A) ? null : _yzRtSlice_(A.runs || [], 0, s.a.o);
    var tail = rteIsBlock(B) ? null : _yzRtSlice_(B.runs || [], s.b.o, 1e9);
    if (head === null && tail === null) { ls.splice(s.a.li, s.b.li - s.a.li + 1, rteNewLine()); return { li: s.a.li, o: 0 }; }
    if (head === null) { ls.splice(s.a.li, s.b.li - s.a.li); B.runs = tail; return { li: s.a.li, o: 0 }; }   // 從分隔線／連結開始選：它們整個刪掉
    if (tail === null) { ls.splice(s.a.li + 1, s.b.li - s.a.li); A.runs = head; return { li: s.a.li, o: s.a.o }; }
    if (s.a.o === 0 && s.b.o === 0 && s.b.li > s.a.li) { ls.splice(s.a.li, s.b.li - s.a.li); return { li: s.a.li, o: 0 }; }   // 整行整行選（連點三下）：後面那一行原封不動留著
    A.runs = _yzRtMerge_(head.concat(tail));
    ls.splice(s.a.li + 1, s.b.li - s.a.li);
    return { li: s.a.li, o: s.a.o };
  }
  function pasteLines(ls, pos, P) {   // 把「一行一行」的 P 放進游標處：第一行接在游標前面的字後面，最後一行接在游標後面的字前面
    var L = ls[pos.li];
    if (rteIsBlock(L)) { ls.splice(pos.li + 1, 0, rteNewLine()); pos = { li: pos.li + 1, o: 0 }; L = ls[pos.li]; }
    var len = rteLen(L), head = _yzRtSlice_(L.runs || [], 0, pos.o), tail = _yzRtSlice_(L.runs || [], pos.o, len);
    var empty = !head.length && !tail.length, out = [], i, f;
    P = rteCopyLines(P);
    if (!P.length) P = [rteNewLine()];
    f = P[0];
    if (!rteIsBlock(f)) {
      var ln = { k: empty ? f.k : L.k, lv: empty ? (f.lv || 0) : (L.lv || 0), runs: _yzRtMerge_(head.concat(f.runs)) };
      if (ln.k === "box") ln.tone = empty ? f.tone : L.tone;
      out.push(ln);
      for (i = 1; i < P.length; i++) out.push(P[i]);
    } else {
      if (head.length) { var hl = { k: L.k, lv: L.lv || 0, runs: head }; if (L.tone) hl.tone = L.tone; out.push(hl); }
      for (i = 0; i < P.length; i++) out.push(P[i]);
    }
    var last = out[out.length - 1], cl, co;
    if (rteIsBlock(last)) { out.push({ k: "p", lv: 0, runs: tail }); cl = out.length - 1; co = 0; }
    else { cl = out.length - 1; co = rteLen(last); last.runs = _yzRtMerge_(last.runs.concat(tail)); }
    Array.prototype.splice.apply(ls, [pos.li, 1].concat(out));
    return caret(pos.li + cl, co);
  }
  function splitAt(ls, li, off) {   // Enter：在游標處切成兩行；清單會接下一個記號；標註／引用在空行按 Enter 就跳出來
    var L = ls[li], plain = rteTxt(L.runs || []), len = plain.length;
    var head = _yzRtSlice_(L.runs || [], 0, off), tail = _yzRtSlice_(L.runs || [], off, len);
    if (L.k === "p") {
      var it = _yzRtItem_(plain);
      if (it && !it.rest.trim()) { L.runs = []; return caret(li, 0); }            // 空的清單項目再按 Enter ＝ 跳出清單
      if (it && off >= it.len) {
        var mk = _yzRtNextMark_(it.mark) + " ";
        ls.splice(li + 1, 0, { k: "p", lv: L.lv || 0, runs: _yzRtMerge_([{ t: mk }].concat(tail)) });
        L.runs = head;
        return caret(li + 1, mk.length);
      }
    }
    if ((L.k === "box" || L.k === "q") && !plain.trim()) { L.k = "p"; delete L.tone; return caret(li, 0); }
    var nk = /^h[1-4]$/.test(L.k) && !tail.length ? "p" : L.k, nl = { k: nk, lv: L.lv || 0, runs: tail };   // 標題結尾按 Enter ＝ 下一行是一般文字
    if (nk === "box") nl.tone = L.tone;
    L.runs = head;
    ls.splice(li + 1, 0, nl);
    return caret(li + 1, 0);
  }

  function cmdInline(key, val) {
    run(function (ls, s) {
      if (isCollapsed(s)) { toast("請先用滑鼠選取要改的字，再按這個鈕"); return s; }
      var cov = [], li;
      for (li = s.a.li; li <= s.b.li; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === s.b.li ? s.b.o : len;
        if (b > a) cov.push({ L: L, a: a, b: b });
      }
      if (!cov.length) return s;
      var on;
      if (key === "c" || key === "z") on = val || 0;
      else on = cov.every(function (c) { return _yzRtSlice_(c.L.runs, c.a, c.b).every(function (r) { return !!r[key]; }); }) ? 0 : 1;
      cov.forEach(function (c) {
        var len2 = rteLen(c.L);
        var mid = _yzRtSlice_(c.L.runs, c.a, c.b).map(function (r) { if (on) r[key] = on; else delete r[key]; return r; });
        c.L.runs = _yzRtMerge_(_yzRtSlice_(c.L.runs, 0, c.a).concat(mid, _yzRtSlice_(c.L.runs, c.b, len2)));
      });
      return s;
    });
  }
  function cmdClear() {
    run(function (ls, s) {
      if (isCollapsed(s)) { toast("請先用滑鼠選取要清除格式的字"); return s; }
      for (var li = s.a.li; li <= s.b.li; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === s.b.li ? s.b.o : len;
        if (b <= a) continue;
        var mid = _yzRtSlice_(L.runs, a, b).map(function (r) { return { t: r.t }; });
        L.runs = _yzRtMerge_(_yzRtSlice_(L.runs, 0, a).concat(mid, _yzRtSlice_(L.runs, b, len)));
      }
      return s;
    });
  }
  function cmdKind(kind, tone) {   // 整行變成：文字／標題／引用／標註（再按一次同一個鈕＝變回文字）
    run(function (ls, s) {
      var r = lineSpan(s), first = ls[r.from], same = first && first.k === kind && (kind !== "box" || first.tone === tone);
      for (var li = r.from; li <= r.to; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        if (same || kind === "p") { L.k = "p"; delete L.tone; } else { L.k = kind; if (kind === "box") L.tone = tone; else delete L.tone; }
      }
      return s;
    });
  }
  function cmdList(type) {   // 項目符號／編號／核對清單：切換行首的記號（記號就是普通的字，LINE 和網頁看到記號就會自動排整齊）
    run(function (ls, s) {
      var r = lineSpan(s), first = ls[r.from], it0 = first && first.k === "p" && !rteIsBlock(first) ? _yzRtItem_(rteTxt(first.runs)) : null;
      var off = !!(it0 && rteMarkClass(it0.mark) === type), prevMark = null, ns = { a: { li: s.a.li, o: s.a.o }, b: { li: s.b.li, o: s.b.o } };
      if (type === "ol" && r.from > 0) { var pv = ls[r.from - 1], pit = pv && pv.k === "p" ? _yzRtItem_(rteTxt(pv.runs)) : null; if (pit && rteMarkClass(pit.mark) === "ol") prevMark = pit.mark; }
      for (var li = r.from; li <= r.to; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var wasP = L.k === "p"; L.k = "p"; delete L.tone;
        var it = wasP ? _yzRtItem_(rteTxt(L.runs)) : null, oldLen = it ? it.len : 0, rest = it ? _yzRtCut_(L.runs, it.len) : L.runs, mark = "";
        if (!off) {
          mark = type === "ul" ? "•" : type === "todo" ? "☐" : (prevMark ? _yzRtNextMark_(prevMark) : "1.");
          if (type === "ol") prevMark = mark;
          L.runs = _yzRtMerge_([{ t: mark + " " }].concat(rest));
        } else L.runs = rest;
        var delta = (mark ? mark.length + 1 : 0) - oldLen;
        if (li === ns.a.li) ns.a.o = Math.max(0, s.a.o + delta);
        if (li === ns.b.li) ns.b.o = Math.max(0, s.b.o + delta);
      }
      if (ns.a.li === ns.b.li && ns.b.o < ns.a.o) ns.b.o = ns.a.o;
      return ns;
    });
  }
  function cmdInsertLine(kind, arg) {   // 分隔線、連結到標題、圖：整行；游標在空行就直接變成它，不然插在這一行後面；後面一定留一行可以打字
    run(function (ls, s) {
      var li = s.b.li, L = ls[li], empty = L && L.k === "p" && !rteTxt(L.runs || []).trim();
      var nl = kind === "hr" ? { k: "hr", lv: 0, runs: [] } : kind === "img" ? { k: "img", lv: L ? (L.lv || 0) : 0, img: arg || "", runs: [] } : { k: "go", lv: 0, go: "", runs: [] }, at;   // 圖：縮排跟這一行一樣（跟上面的字對齊）
      if (empty) { ls[li] = nl; at = li; } else { ls.splice(li + 1, 0, nl); at = li + 1; }
      if (!ls[at + 1] || rteIsBlock(ls[at + 1])) ls.splice(at + 1, 0, rteNewLine());
      return caret(at + 1, 0);
    });
  }
  function cmdIndent(d) {
    run(function (ls, s) {
      var r = lineSpan(s);
      for (var li = r.from; li <= r.to; li++) if (ls[li]) ls[li].lv = Math.max(0, Math.min(YZ_RT_MAXLV, (ls[li].lv || 0) + d));
      return s;
    });
  }
  // ── 圖（第 28 批）：選檔／拖進來／貼上 → 編輯器上傳（縮小、檔名亂碼）→ 放在游標那一行後面 ──
  function insertImgFile(file) {
    if (!o.imgUp || !o.pics) { toast("這裡不能放圖"); return; }
    var keep = getSel() || lastSel;
    o.imgUp(file, function (p) {
      if (!p) return;
      var pics = o.pics(), id = rteNewPicId(pics);
      pics[id] = p;
      if (keep) lastSel = keep;
      cmdInsertLine("img", id);
      if (o.onPics) o.onPics(p, id);
    });
  }
  function replaceImg(id, file) {
    if (!o.imgUp || !o.pics) return;
    o.imgUp(file, function (p) {   // 第 3 個參數 true＝換一張（不是多一張）
      if (!p) return;
      var pics = o.pics(), P = pics[id] || (pics[id] = {});
      ["url", "fid", "fname", "ar", "info"].forEach(function (k) { if (p[k] !== undefined) P[k] = p[k]; else delete P[k]; });
      delete P.ocr;   // 換了圖：圖裡的字要重新辨識
      lines = readLines(); render(); emit();
      if (o.onPics) o.onPics(P, id);
    }, true);
  }
  function cmdImg() { if (rawMode) return; lastSel = getSel() || lastSel; rtePickFile(insertImgFile); }
  function cmdText(str, mode) {   // 在游標處放字（表情符號、貼上）。mode："markup"＝當成格式文字讀（從 LINE 或這個編輯器複製來的）；其他＝一般字，一行一行放
    str = String(str === null || str === undefined ? "" : str).replace(/\r\n?/g, "\n").replace(/ /g, " ");
    var P = mode === "markup" ? _yzRtParse_(str) : str.split("\n").map(function (x) { return { k: "p", lv: 0, runs: x ? [{ t: x }] : [] }; });
    run(function (ls, s) { return pasteLines(ls, deleteSel(ls, s), P); });
  }
  function doEnter() {
    run(function (ls, s) {
      var pos = deleteSel(ls, s), L = ls[pos.li];
      if (rteIsBlock(L)) { ls.splice(pos.li + 1, 0, rteNewLine()); return caret(pos.li + 1, 0); }
      return splitAt(ls, pos.li, pos.o);
    });
  }
  function doBackspaceStart() {   // 在一行的最前面按 Backspace：標題／標註／引用 → 變回文字；有縮排 → 少一層；否則跟上一行合併
    run(function (ls, s) {
      var li = s.a.li, L = ls[li];
      if (rteIsBlock(L)) { ls.splice(li, 1); return caret(Math.max(0, li - 1), 0); }
      if (L.k !== "p") { L.k = "p"; delete L.tone; return caret(li, 0); }
      if ((L.lv || 0) > 0) { L.lv--; return caret(li, 0); }
      if (li === 0) return s;
      var P = ls[li - 1];
      if (rteIsBlock(P)) { ls.splice(li - 1, 1); return caret(li - 1, 0); }
      var plen = rteLen(P); P.runs = _yzRtMerge_((P.runs || []).concat(L.runs || [])); ls.splice(li, 1);
      return caret(li - 1, plen);
    });
  }
  function doDeleteEnd() {   // 在一行的最後面按 Delete：把下一行接上來
    run(function (ls, s) {
      var li = s.a.li, N = ls[li + 1];
      if (!N) return s;
      if (rteIsBlock(N)) { ls.splice(li + 1, 1); return s; }
      var L = ls[li], plen = rteLen(L); L.runs = _yzRtMerge_((L.runs || []).concat(N.runs || [])); ls.splice(li + 1, 1);
      return caret(li, plen);
    });
  }

  // ───────── 現在的狀態（給格式列用） ─────────
  function state() {
    var ls = readLines(), s = getSel() || lastSel, st = { ok: !!s, kind: null, tone: null, list: null, b: 0, i: 0, u: 0, s: 0, c: null, z: null };
    if (!s) return st;
    var first = ls[Math.min(s.a.li, ls.length - 1)];
    if (first) { st.kind = first.k; st.tone = first.tone || null; var it = rteIsBlock(first) || first.k !== "p" ? null : _yzRtItem_(rteTxt(first.runs)); st.list = it ? rteMarkClass(it.mark) : null; }
    var pieces = [], li;
    if (isCollapsed(s)) {
      var Lc = ls[Math.min(s.a.li, ls.length - 1)];
      if (Lc && !rteIsBlock(Lc)) pieces = s.a.o > 0 ? _yzRtSlice_(Lc.runs, s.a.o - 1, s.a.o) : _yzRtSlice_(Lc.runs, 0, 1);
    } else for (li = s.a.li; li <= s.b.li; li++) {
      var L = ls[li]; if (!L || rteIsBlock(L)) continue;
      var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === s.b.li ? s.b.o : len;
      if (b > a) pieces = pieces.concat(_yzRtSlice_(L.runs, a, b));
    }
    if (pieces.length) {
      ["b", "i", "u", "s"].forEach(function (k) { st[k] = pieces.every(function (r) { return !!r[k]; }) ? 1 : 0; });
      var c0 = pieces[0].c || null, z0 = pieces[0].z || null;
      st.c = pieces.every(function (r) { return (r.c || null) === c0; }) ? (c0 || "") : null;
      st.z = pieces.every(function (r) { return (r.z || null) === z0; }) ? (z0 || "") : null;
    }
    return st;
  }

  // 在游標那一行切開：給「＋表格／＋圖片…」用——游標那一行（含）以前的留在這個文字塊，後面的搬到新的文字塊。
  // 游標在一行空白行上：那一行就是「要放東西的位置」，兩邊都不帶它。
  function splitAtCaret() {
    lines = readLines(); histFlush();
    var s = getSel() || lastSel, li = s ? Math.min(s.b.li, lines.length - 1) : lines.length - 1, cl = lines[li];
    var blank = !!cl && cl.k === "p" && !rteTxt(cl.runs || []).trim();
    var before = _yzRtSerialize_(lines.slice(0, blank ? li : li + 1)).replace(/\n+$/, "");
    var after = _yzRtSerialize_(lines.slice(li + 1)).replace(/^\n+|\n+$/g, "");
    return { before: before, after: after };
  }

  // ───────── 事件 ─────────
  var FORMAT_MAP = { formatBold: "b", formatItalic: "i", formatUnderline: "u", formatStrikeThrough: "s" };
  body.addEventListener("beforeinput", function (e) {
    if (e.isComposing) return;
    var t = e.inputType;
    if (t === "insertParagraph" || t === "insertLineBreak") { e.preventDefault(); doEnter(); return; }
    if (t === "historyUndo") { e.preventDefault(); undo(); return; }
    if (t === "historyRedo") { e.preventDefault(); redo(); return; }
    if (t === "insertFromDrop" || t === "insertFromYank") { e.preventDefault(); return; }
    if (/^format/.test(t)) { e.preventDefault(); if (FORMAT_MAP[t]) cmdInline(FORMAT_MAP[t]); return; }
    var s = getSel(); if (!s) return;
    if (!isCollapsed(s) && s.a.li !== s.b.li) {   // 選取跨好幾行：自己處理，不讓瀏覽器把好幾行亂併在一起
      if (t === "insertText") { e.preventDefault(); cmdText(e.data || "", "plain"); return; }
      if (/^delete/.test(t)) { e.preventDefault(); run(function (ls, s2) { var p = deleteSel(ls, s2); return caret(p.li, p.o); }); return; }
    }
    if (isCollapsed(s) && (t === "deleteContentBackward" || t === "deleteContentForward")) {
      var ls = readLines(), L = ls[s.a.li];
      if (t === "deleteContentBackward" && s.a.o === 0) { e.preventDefault(); doBackspaceStart(); return; }
      if (t === "deleteContentForward" && L && s.a.o >= rteLen(L) && ls[s.a.li + 1]) { e.preventDefault(); doDeleteEnd(); }
    }
  });
  body.addEventListener("compositionstart", function () { composing = true; });   // 輸入法選字中：不要動畫面
  body.addEventListener("compositionend", function () {
    composing = false;
    setTimeout(function () { if (dirtyDom()) normalize(); lines = readLines(); lastSel = getSel() || lastSel; emit(); histLater(); syncBar(); }, 0);
  });
  body.addEventListener("input", function () {
    // 瀏覽器自己改了畫面（打字、剪下）：把畫面讀回資料
    if (!composing && dirtyDom()) normalize();
    lines = readLines(); lastSel = getSel() || lastSel; emit(); histLater(); syncBar();
  });
  function copySel(e, cut) {
    var s = getSel(); if (!s || isCollapsed(s) || !e.clipboardData) return;   // 沒選字：交給瀏覽器
    var ls = readLines(), to = lineSpan(s).to, part = [], li;
    for (li = s.a.li; li <= to; li++) {
      var L = ls[li]; if (!L) continue;
      var c = { k: L.k, lv: L.lv || 0, runs: [] };
      if (L.tone) c.tone = L.tone;
      if (L.go !== undefined) c.go = L.go;
      if (L.img !== undefined) c.img = L.img;
      if (!rteIsBlock(L)) {
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === to && to === s.b.li ? s.b.o : len;
        c.runs = _yzRtSlice_(L.runs, a, b);
        if (s.a.li === to) { c.k = "p"; c.lv = 0; delete c.tone; }   // 只選了半行：只帶字的格式，不帶「這一行是標題」
      }
      part.push(c);
    }
    e.clipboardData.setData("text/plain", part.map(function (L) { return rteIsBlock(L) ? "" : rteTxt(L.runs); }).join("\n"));
    e.clipboardData.setData("application/x-yz-rt", _yzRtSerialize_(part));
    var pp = {}, pics = o.pics ? o.pics() || {} : {};   // 複製到的圖：圖的資料也帶著（貼到別的文字塊也看得到）
    part.forEach(function (L) { if (L.k === "img" && pics[L.img]) pp[L.img] = pics[L.img]; });
    if (Object.keys(pp).length) e.clipboardData.setData("application/x-yz-pics", JSON.stringify(pp));
    e.preventDefault();
    if (cut) run(function (ls2, s2) { var p = deleteSel(ls2, s2); return caret(p.li, p.o); });
  }
  body.addEventListener("copy", function (e) { copySel(e, false); });
  body.addEventListener("cut", function (e) { copySel(e, true); });
  body.addEventListener("paste", function (e) {
    e.preventDefault();
    var cd = e.clipboardData || window.clipboardData, own = cd && cd.getData ? cd.getData("application/x-yz-rt") : "", tx = cd && cd.getData ? cd.getData("text/plain") : "";
    if (!own && !tx && cd && cd.items) {   // 剪貼簿裡只有圖（截圖、複製圖片）：放一張圖
      for (var pi = 0; pi < cd.items.length; pi++) if (cd.items[pi].kind === "file" && /^image\//.test(cd.items[pi].type || "")) { var pf = cd.items[pi].getAsFile(); if (pf) { insertImgFile(pf); return; } }
    }
    if (own) {
      try { var pj = JSON.parse(cd.getData("application/x-yz-pics") || "null"), pics = o.pics ? o.pics() : null; if (pj && pics) Object.keys(pj).forEach(function (k) { if (!pics[k] && pj[k] && pj[k].url) pics[k] = pj[k]; }); } catch (x) { /* 沒有圖 */ }
      cmdText(own, "markup");
    }
    else if (tx) cmdText(tx, _yzRtHas_(tx) ? "markup" : "plain");   // 貼上的字：長得像標記的（從 LINE 裡改字複製來的）就還原格式；其他一律當一般字，外面的格式不會跟進來
    else toast("剪貼簿裡沒有文字");
  });
  body.addEventListener("dragstart", function (e) { e.preventDefault(); });
  body.addEventListener("drop", function (e) {   // 把圖拖進來：放一張圖（其他東西不收）
    e.preventDefault();
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && /^image\//.test(f.type || "")) insertImgFile(f);
  });
  body.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") >= 0) e.preventDefault(); });
  body.addEventListener("keydown", function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    var mod = e.ctrlKey || e.metaKey, k = (e.key || "").toLowerCase();
    if (mod && !e.altKey) {
      if (k === "b") { e.preventDefault(); cmdInline("b"); return; }
      if (k === "i") { e.preventDefault(); cmdInline("i"); return; }
      if (k === "u") { e.preventDefault(); cmdInline("u"); return; }
      if (k === "x" && e.shiftKey) { e.preventDefault(); cmdInline("s"); return; }
      if (k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (k === "y") { e.preventDefault(); redo(); return; }
      return;
    }
    if (k === "tab" && !e.altKey) {   // Tab＝縮排（只在「選了字、在一行最前面、或這一行是清單」時）；其他情形照常跳到下一個欄位，鍵盤才不會被卡住
      var s = getSel(); if (!s) return;
      var ls = readLines(), r = lineSpan(s), want = false, li;
      if (e.shiftKey) { for (li = r.from; li <= r.to; li++) if (ls[li] && (ls[li].lv || 0) > 0) want = true; }
      else {
        var L0 = ls[s.a.li], it = L0 && !rteIsBlock(L0) && L0.k === "p" ? _yzRtItem_(rteTxt(L0.runs)) : null;
        want = !isCollapsed(s) || s.a.o === 0 || !!it;
      }
      if (want) { e.preventDefault(); cmdIndent(e.shiftKey ? -1 : 1); }
    }
  });
  body.addEventListener("focus", function () { RTE.cur = inst; lastSel = getSel() || lastSel; syncBar(); });
  function maybeLeave() {   // 游標離開這個文字框（連「標記模式」的框也不在）：格式列熄掉
    setTimeout(function () { if (RTE.cur === inst && !el.contains(document.activeElement)) { RTE.cur = null; syncBar(); } }, 140);
  }
  body.addEventListener("blur", function () { lastSel = getSel() || lastSel; maybeLeave(); });
  body.addEventListener("mouseup", function () { lastSel = getSel() || lastSel; syncBar(); });
  body.addEventListener("keyup", function () { lastSel = getSel() || lastSel; syncBar(); });

  // ───────── 標記模式（看／改原始標記；萬一畫面編輯器不好用的備案） ─────────
  function fitRaw() { rawTa.style.height = "auto"; rawTa.style.height = Math.max(120, rawTa.scrollHeight + 4) + "px"; }
  function setRaw(on) {
    if (on === rawMode) return;
    if (on) { lines = readLines(); histFlush(); rawTa.value = value(); rawMode = true; body.hidden = true; rawTa.hidden = false; rawNote.hidden = false; fitRaw(); rawTa.focus(); }
    else { lines = _yzRtParse_(rawTa.value); rawMode = false; rawTa.hidden = true; rawNote.hidden = true; body.hidden = false; render(); histPush(); emit(); body.focus({ preventScroll: true }); }
    syncBar();
  }
  rawTa.addEventListener("input", function () { fitRaw(); if (o.onChange) o.onChange(rawTa.value.replace(/\n+$/, "")); });
  rawTa.addEventListener("focus", function () { RTE.cur = inst; syncBar(); });
  rawTa.addEventListener("blur", maybeLeave);

  render(); histInit();
  inst.el = el; inst.body = body;
  inst.cmd = { inline: cmdInline, clear: cmdClear, kind: cmdKind, list: cmdList, line: cmdInsertLine, indent: cmdIndent, text: cmdText, undo: undo, redo: redo, raw: function () { setRaw(!rawMode); }, img: cmdImg };
  inst.refresh = function () { lines = readLines(); render(); };   // 圖片裡的字辨識好了之類（畫面重畫，內容不變）
  inst.state = state; inst.value = function () { return rawMode ? rawTa.value.replace(/\n+$/, "") : value(); }; inst.isRaw = function () { return rawMode; };
  inst.splitAtCaret = function () { if (rawMode) setRaw(false); return splitAtCaret(); };
  inst.focus = function () {
    body.focus({ preventScroll: true });
    var last = lines.length - 1;
    try { setSel({ li: last, o: rteIsBlock(lines[last]) ? 0 : rteLen(lines[last]) }); } catch (e) { /* ignore */ }
  };
  inst.hasHist = function () { return { undo: Hs.i > 0, redo: Hs.i < Hs.st.length - 1 }; };
  return inst;
}

/* ───────── 最上面的「格式列」（所有文字塊共用，作用在你正在改的那一個） ───────── */
var RTE_BAR = [
  { g: "字", items: [
    { id: "b", h: "<b>B</b>", tip: "粗體（Ctrl+B）：先選取要改的字", a: ["inline", "b"] },
    { id: "i", h: "<i>I</i>", tip: "斜體（Ctrl+I）：先選取要改的字", a: ["inline", "i"] },
    { id: "u", h: "<u>U</u>", tip: "底線（Ctrl+U）：先選取要改的字", a: ["inline", "u"] },
    { id: "s", h: "<s>S</s>", tip: "刪除線（Ctrl+Shift+X）：先選取要改的字", a: ["inline", "s"] },
    { id: "color", h: '<span class="fbA">A</span><i class="fbcbar"></i><span class="fbcar">▾</span>', tip: "文字顏色：先選取要改的字", pop: "color" },
    { id: "size", h: "Aa ▾", tip: "文字大小（小・普通・大・特大）：先選取要改的字", pop: "size" },
    { id: "clear", h: "清除格式", tip: "把選到的字的粗體、顏色、大小…全部拿掉", a: ["clear"] }
  ] },
  { g: "整行", items: [
    { id: "p", h: "文字", tip: "一般文字", a: ["kind", "p"] },
    { id: "h1", h: "標題1", tip: "標題 1（最大）。再按一次＝變回文字", a: ["kind", "h1"] },
    { id: "h2", h: "標題2", tip: "標題 2。再按一次＝變回文字", a: ["kind", "h2"] },
    { id: "h3", h: "標題3", tip: "標題 3。再按一次＝變回文字", a: ["kind", "h3"] },
    { id: "h4", h: "標題4", tip: "標題 4（最小）。再按一次＝變回文字", a: ["kind", "h4"] },
    { id: "ul", h: "• 項目符號", tip: "項目符號（Enter 會自動接下一個）。再按一次＝取消", a: ["list", "ul"] },
    { id: "ol", h: "1. 編號", tip: "編號（Enter 會自動接下一個號碼）。再按一次＝取消", a: ["list", "ol"] },
    { id: "todo", h: "☐ 核對清單", tip: "核對清單：☐ 沒做、☑ 做了（讀的人在 LINE 上不能勾，只是看）。再按一次＝取消", a: ["list", "todo"] },
    { id: "q", h: "❝ 引用", tip: "引用（左邊一條線）。再按一次＝變回文字", a: ["kind", "q"] },
    { id: "box-info", h: "💡", tip: "標註：提示（藍）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "info"] },
    { id: "box-warn", h: "⚠️", tip: "標註：注意（黃）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "warn"] },
    { id: "box-bad", h: "⛔", tip: "標註：警告（紅）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "bad"] },
    { id: "box-ok", h: "✅", tip: "標註：完成（綠）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "ok"] },
    { id: "hr", h: "— 分隔線", tip: "在這一行後面放一條分隔線", a: ["line", "hr"] },
    { id: "go", h: "🔗 連結（標題／整章）", tip: "在這一行後面放一個連結，連到手冊裡另一個標題或整章（LINE 上是一個可以點的按鈕列；對方那一頁也會自動連回來）", a: ["line", "go"] },
    { id: "img", h: "🖼 圖片", tip: "在這一行後面放一張圖（跟文字放在同一塊；縮排跟這一行一樣，⇤ ⇥ 可以調）。也可以把圖拖進來，或複製後按 Ctrl+V 貼上", a: ["img"] },
    { id: "indent", h: "⇥", tip: "縮排（Tab）", a: ["indent", 1] },
    { id: "outdent", h: "⇤", tip: "取消縮排（Shift+Tab）", a: ["indent", -1] }
  ] },
  { g: "其他", items: [
    { id: "emoji", h: "☺ 表情 ▾", tip: "放一個表情符號", pop: "emoji" },
    { id: "undo", h: "↶", tip: "復原（Ctrl+Z）", a: ["undo"] },
    { id: "redo", h: "↷", tip: "重做（Ctrl+Y）", a: ["redo"] },
    { id: "raw", h: "&lt;/&gt; 標記", tip: "看／改原始標記（LINE 裡改字看到的就是這個）", a: ["raw"] }
  ] }
];
function rteClosePop() { if (RTE.pop) { RTE.pop.el.remove(); RTE.pop = null; } }
function rteDo(a, arg2, arg3) {
  var c = RTE.cur; if (!c) { toast("先點一下要改的那一段文字"); return; }
  var f = c.cmd[a];
  if (f) f(arg2, arg3);
}
function rteExec(a) {
  var name = a[0];
  if (name === "inline" || name === "kind" || name === "list" || name === "line" || name === "indent") rteDo(name, a[1], a[2]);
  else rteDo(name);
}
function rteOpenPop(anchor, kind) {
  var same = RTE.pop && RTE.pop.anchor === anchor; rteClosePop(); if (same) return;
  if (!RTE.cur) { toast("先點一下要改的那一段文字"); return; }
  var pop = h("div", { class: "rtpop rtpop-" + kind });
  pop.addEventListener("mousedown", function (e) { e.preventDefault(); });   // 點彈出的選單，文字框不會失去焦點（選的字才不會不見）
  if (kind === "color") {
    pop.appendChild(h("div", { class: "rtpop-t" }, ["文字顏色（先選取要改的字）"]));
    var grid = h("div", { class: "rtsw" });
    YZ_RT_COLOR_ORDER.forEach(function (c) {
      grid.appendChild(h("button", { type: "button", class: "rtsw-b", title: YZ_RT_COLOR_LABEL[c], "data-c": c, onclick: function () { RTE.lastColor = c; rteDo("inline", "c", c); rteClosePop(); } }, [h("span", { style: "color:" + YZ_RT_COLORS[c] }, ["A"]), h("small", {}, [YZ_RT_COLOR_LABEL[c]])]));
    });
    grid.appendChild(h("button", { type: "button", class: "rtsw-b", title: "拿掉顏色，變回預設的黑色", "data-c": "", onclick: function () { rteDo("inline", "c", null); rteClosePop(); } }, [h("span", {}, ["A"]), h("small", {}, ["預設"])]));
    pop.appendChild(grid);
    pop.appendChild(h("div", { class: "hint", style: "max-width:270px" }, ["顏色固定 9 種，白底上都看得清楚；LINE 和網頁顯示一樣。"]));
  } else if (kind === "size") {
    pop.appendChild(h("div", { class: "rtpop-t" }, ["文字大小（先選取要改的字）"]));
    [["sm", "小"], ["", "普通"], ["lg", "大"], ["xl", "特大"]].forEach(function (x) {
      var em = x[0] ? YZ_RT_SIZES[x[0]].em : 1;
      pop.appendChild(h("button", { type: "button", class: "rtsz-b", "data-z": x[0], onclick: function () { rteDo("inline", "z", x[0] || null); rteClosePop(); } }, [h("span", { style: "font-size:" + em + "em" }, [x[1]])]));
    });
  } else if (kind === "emoji") {
    pop.appendChild(h("div", { class: "rtpop-t" }, ["表情符號（放在游標的位置）"]));
    var eg = h("div", { class: "rtem" });
    RTE_EMOJI.forEach(function (em) { eg.appendChild(h("button", { type: "button", class: "rtem-b", onclick: function () { rteDo("text", em); rteClosePop(); } }, [em])); });
    pop.appendChild(eg);
  }
  document.body.appendChild(pop);
  var r = anchor.getBoundingClientRect();
  pop.style.top = (r.bottom + 4) + "px";
  pop.style.left = Math.max(8, Math.min(r.left, innerWidth - pop.offsetWidth - 8)) + "px";
  RTE.pop = { el: pop, anchor: anchor };
}
function rteBuildBar() {
  var bar = h("div", { class: "fmtbar", role: "toolbar", "aria-label": "文字格式" }), btns = {};
  RTE_BAR.forEach(function (g, gi) {
    var grp = h("div", { class: "fg" }, [h("span", { class: "tblabel" }, [g.g])]);
    g.items.forEach(function (it) {
      var b = h("button", { type: "button", class: "fb fb-" + it.id, title: it.tip, "data-id": it.id, "aria-label": it.tip.replace(/[（(：。].*$/, "") || it.id });
      b.innerHTML = it.h;
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });   // 按按鍵不會讓文字框失去焦點（選的字才不會不見）
      b.addEventListener("click", function () { if (it.pop) rteOpenPop(b, it.pop); else { rteClosePop(); rteExec(it.a); } });
      btns[it.id] = b; grp.appendChild(b);
    });
    bar.appendChild(grp);
    if (gi < RTE_BAR.length - 1) bar.appendChild(h("span", { class: "vsep" }));
  });
  bar.appendChild(h("span", { class: "fbstat muted", id: "fbstat" }));
  RTE.bar = { el: bar, btns: btns };
  rteBarSync();
  return bar;
}
function rteBarSync() {
  if (!RTE.bar) return;
  var c = RTE.cur, st = c ? c.state() : null, raw = !!c && c.isRaw(), B = RTE.bar.btns;
  Object.keys(B).forEach(function (id) {
    var on = false, dis = !c;
    if (c && raw) dis = id !== "raw";
    if (st && !raw) {
      if (id === "b" || id === "i" || id === "u" || id === "s") on = !!st[id];
      else if (/^h[1-4]$/.test(id) || id === "q") on = st.kind === id;
      else if (id.indexOf("box-") === 0) on = st.kind === "box" && st.tone === id.slice(4);
      else if (id === "ul" || id === "ol" || id === "todo") on = st.list === id;
      else if (id === "p") on = st.kind === "p" && !st.list;
    }
    if (id === "raw") { dis = !c; on = raw; }
    if (id === "undo" || id === "redo") { var hh = c ? c.hasHist() : { undo: false, redo: false }; dis = !c || raw || !hh[id]; }
    B[id].disabled = dis; B[id].classList.toggle("on", !!on && !dis); B[id].setAttribute("aria-pressed", on && !dis ? "true" : "false");
  });
  var cb = B.color && B.color.querySelector(".fbcbar"); if (cb) cb.style.background = YZ_RT_COLORS[(st && st.c) || RTE.lastColor] || "#999";
  var stat = document.getElementById("fbstat");
  if (stat) stat.textContent = c ? (raw ? "標記模式" : "") : "← 先點一下要改的那一段文字，格式鍵才會亮";
}
document.addEventListener("mousedown", function (e) { if (RTE.pop && !RTE.pop.el.contains(e.target) && !RTE.pop.anchor.contains(e.target)) rteClosePop(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape") rteClosePop(); });
document.addEventListener("selectionchange", function () { if (RTE.cur) rteBarSync(); });

/* ════════ shapelib.js ════════ */
/* ═══════════════ shapelib.js：圖一（目錄圖）的物品圖庫（第 27 批；第 28 批：覆核＝條碼掃描器＋電腦、行政事宜＝文件資料櫃、冰箱改到水藥調劑）═══════════════
 * 用比較準的方法（SAM，物品分割的模型）在開發的電腦上先把圖一裡每個按鍵該亮的物品切好，這裡只存外框的點（整張圖的 %）。
 * 編輯器按「儲存」時：目錄圖是這一張（比對 fp＝圖的指紋：縮成 17×8 格、左右比亮暗的 128 個 0/1，看不出圖的內容）→ 直接用這裡的物品；
 * 換了別張圖 → 照舊在框裡自動找（shFind）。ids＝預設的地點（yzSetup 建的 p1…p10）優先用哪一個物品。不用手動改這個檔。 */
var SH_LIB = [{"fp":"6ea8eaaab6c5bd4ddc9c78d33bcb38eb","ar":2.3325,"objs":[{"id":"book","nm":"法規書（整本）","r":[[30.8,84.2,29.3,82.6,28.7,82.1,28.3,82.1,27.5,81.2,27.0,80.4,26.0,80.0,25.3,79.5,25.0,78.8,23.9,78.0,23.0,76.7,22.0,76.0,21.0,74.9,20.6,74.7,19.3,73.3,18.3,73.0,15.7,74.3,15.2,74.8,14.3,75.3,13.7,75.9,11.6,77.0,11.2,77.5,8.8,79.0,8.5,79.4,7.9,79.5,6.7,80.4,6.5,80.9,6.1,84.2,6.1,87.1,6.5,88.7,7.9,90.7,8.5,91.2,8.8,92.0,9.9,93.3,10.3,94.2,10.9,94.8,11.9,96.5,12.3,96.8,14.0,99.9,18.0,99.9,18.0,96.5,18.2,96.0,20.1,94.0,20.5,93.9,22.2,92.1,23.6,91.1,25.1,89.5,29.8,85.6,30.8,84.5]],"ids":["p8"],"c":1},{"id":"binder","nm":"規則本（整本）","r":[[71.9,94.2,71.9,97.8,72.0,98.4,72.5,99.1,72.9,99.4,73.3,99.4,73.6,99.6,73.6,99.9,96.0,99.9,96.2,99.4,96.2,98.4,95.8,95.9,95.5,94.3,95.4,93.3,95.1,92.6,94.8,89.8,94.5,88.9,94.2,86.7,93.8,85.1,93.4,82.1,93.2,81.1,92.7,78.7,92.6,78.3,91.1,77.6,90.1,77.6,89.3,77.2,88.4,77.1,88.1,76.9,85.3,76.4,84.9,76.1,84.5,76.1,84.2,75.9,82.9,75.6,82.6,75.4,81.5,75.3,81.1,75.0,80.7,75.2,80.4,74.9,79.9,74.9,79.5,74.7,78.3,74.5,78.0,74.2,77.1,73.9,76.6,73.9,76.2,74.2,75.9,75.0,75.7,76.1,75.4,76.7,73.4,86.0,73.2,86.8,73.0,88.2,72.5,89.8,72.0,92.7]],"ids":["p10"],"c":1},{"id":"clip","nm":"處方夾板","r":[[55.2,88.8,55.3,89.5,55.7,90.1,56.1,90.1,57.5,91.0,58.0,91.0,60.5,92.6,61.4,92.8,61.9,93.4,63.6,94.2,64.2,94.2,64.5,94.5,65.7,94.9,66.0,95.2,68.3,96.7,68.6,96.3,68.9,95.1,68.9,94.4,70.0,88.9,70.2,87.2,70.7,85.3,71.1,82.8,71.7,80.1,71.8,78.4,71.6,78.0,70.5,77.3,69.0,76.9,68.4,77.1,68.3,76.9,68.2,76.2,67.6,76.1,67.4,76.4,66.9,75.9,65.3,75.5,65.1,75.3,64.5,75.4,64.2,75.2,63.8,75.2,63.6,75.5,63.1,75.5,62.2,74.8,61.5,74.8,60.4,77.1,59.4,79.5,58.7,80.6,57.9,82.5,57.8,82.9,57.6,83.2,55.6,87.7]],"ids":["p9"],"c":1},{"id":"tray","nm":"藥盤","r":[[36.0,68.8,36.6,69.5,37.1,70.9,37.5,71.3,38.1,70.9,39.6,71.1,40.1,71.5,40.9,71.6,41.5,72.1,42.5,72.4,43.1,72.8,44.3,72.8,44.8,73.3,45.8,73.4,47.2,74.2,47.9,75.2,48.9,75.4,49.4,76.2,49.7,76.2,50.1,76.9,50.5,77.0,51.0,76.6,51.7,74.8,53.6,71.9,54.8,71.0,55.3,70.4,56.2,68.3,56.4,67.1,56.5,66.1,55.9,65.7,54.9,65.4,53.4,65.4,52.8,64.8,50.7,64.3,50.0,63.8,48.7,63.8,48.2,63.2,48.2,62.6,47.9,62.4,47.1,62.5,46.7,63.1,45.3,63.1,44.4,62.6,43.2,62.4,41.8,63.5,40.8,63.8,40.5,64.7,39.5,65.5,38.9,65.7,37.8,66.6,37.0,67.0,36.1,68.0]],"ids":["p7"],"c":1},{"id":"liquid","nm":"藥水瓶、量杯和冰箱","r":[[7.6,19.9,7.4,20.3,7.4,23.8,7.3,23.9,7.4,26.3,7.4,29.2,7.4,29.4,7.4,36.3,7.4,36.4,7.4,42.5,7.3,42.6,7.4,46.8,7.5,47.7,8.1,47.9,8.7,47.6,9.0,47.3,9.3,47.3,9.5,47.5,9.8,46.9,10.0,46.2,10.0,42.1,10.0,40.3,9.9,39.8,9.9,34.8,9.8,33.4,9.8,29.0,9.8,28.9,10.0,23.1,9.8,21.0,9.7,20.5,9.6,20.3,9.1,20.5,8.8,20.2],[8.6,62.0,8.4,61.8,8.1,61.8,8.0,61.6,7.9,61.6,7.9,61.8,7.3,61.9,7.2,62.0,7.0,62.0,6.8,62.2,6.7,62.5,6.7,64.6,6.6,65.0,6.5,65.3,6.3,66.0,6.3,67.7,6.2,68.0,6.0,67.7,5.8,67.8,5.2,68.0,5.2,68.1,5.0,68.1,4.8,68.5,4.8,68.7,4.8,68.8,4.8,70.9,4.7,71.0,4.7,71.7,4.8,71.9,4.8,73.6,4.9,74.1,5.1,74.3,6.0,74.3,6.2,74.1,6.3,73.9,6.3,73.7,6.4,73.4,6.5,73.6,6.8,73.7,7.4,73.2,7.6,73.2,7.7,73.1,8.0,73.0,8.3,72.7,8.6,72.6,8.9,72.2,9.0,71.7,9.0,65.7,8.8,64.1,8.8,62.5],[17.7,64.2,17.4,64.9,17.4,67.2,17.3,67.7,17.3,70.6,17.2,70.8,17.2,72.7,17.3,73.0,17.4,73.1,17.8,73.0,18.7,72.4,18.8,71.9,18.8,69.1,18.9,68.8,19.0,68.6,19.6,68.6,19.8,69.1,19.8,73.2,19.8,73.4,20.5,74.2,20.7,74.3,21.0,74.2,21.2,73.6,21.2,67.8,21.0,66.9,20.8,66.3,20.8,65.2,20.6,65.0,20.6,65.2,20.0,65.3,19.7,66.0,19.5,65.7,19.3,65.4,19.1,65.7,19.0,65.5,18.9,64.7,18.5,64.1,18.2,64.1,18.2,64.2,17.8,64.1],[14.4,65.0,14.2,64.7,14.2,64.8,13.6,64.8,13.5,64.9,13.0,64.8,12.8,65.0,12.6,64.9,12.4,65.3,11.4,65.3,11.1,65.5,11.1,65.7,11.1,67.7,11.0,67.8,11.0,69.1,11.1,69.7,11.1,70.6,11.3,70.9,11.4,70.9,11.5,71.0,11.5,70.9,11.8,70.9,11.9,70.8,12.1,70.8,12.1,70.6,12.4,70.6,12.6,70.4,12.7,69.8,12.9,69.4,13.1,69.7,13.5,69.8,13.6,69.7,13.8,69.7,14.2,69.3,14.3,68.9,14.4,68.3],[22.4,69.1,22.4,69.3,22.3,69.4,22.3,71.0,22.3,71.1,22.3,72.6,22.3,72.7,22.3,73.1,22.4,73.2,22.5,73.8,22.7,74.5,22.8,74.7,23.0,74.7,23.1,74.8,23.3,74.8,23.3,74.7,23.6,74.7,23.6,74.5,24.7,74.8,25.0,74.5,25.1,74.2,25.1,73.9,25.2,73.8,25.2,69.4,25.0,69.2,24.7,69.2,24.6,69.3,24.4,69.3,24.4,69.4,23.5,69.5,23.3,69.3,22.8,69.3,22.5,68.9]],"ids":["p6"],"c":8},{"id":"consult","nm":"藥師和病人（左邊窗口）","r":[[46.1,22.4,45.8,22.0,45.1,21.9,44.7,22.5,44.6,23.0,44.5,26.2,44.7,26.9,44.2,27.6,43.3,30.0,43.2,29.8,42.4,27.8,41.6,27.2,41.3,26.4,40.8,26.1,40.5,26.6,40.5,28.6,40.0,30.5,39.7,30.7,39.5,30.6,39.1,28.7,38.9,28.5,38.7,28.6,38.4,30.2,38.3,32.0,38.3,33.3,39.0,34.7,39.0,36.2,38.6,38.1,38.7,39.2,38.9,39.5,40.8,39.6,41.7,40.3,42.5,40.3,42.7,40.1,42.7,39.2,42.3,34.2,42.3,33.6,42.4,33.3,42.7,33.1,43.1,33.4,43.7,33.4,43.9,33.0,44.0,32.0,44.2,31.7,45.0,32.3,45.5,31.4,46.8,31.5,47.3,31.2,47.4,30.8,47.3,29.5,46.8,27.4,46.4,23.6]],"ids":["p2"],"c":2},{"id":"dispense","nm":"藥師和病人（中間窗口）","r":[[58.8,26.2,58.6,26.4,58.3,27.2,58.0,27.8,57.4,28.3,57.2,28.9,57.0,30.1,57.0,34.6,57.1,35.6,57.5,35.9,57.7,36.4,57.7,37.4,57.5,38.2,57.4,39.7,57.4,40.3,57.2,41.2,57.2,42.0,57.4,42.3,57.6,42.3,57.7,42.4,59.2,42.5,59.2,42.6,59.6,42.6,59.6,42.8,60.4,42.8,60.5,42.9,60.9,42.9,60.9,43.0,61.6,43.0,61.7,42.8,61.8,42.1,61.7,41.5,61.6,39.3,61.3,37.4,61.3,36.7,61.2,36.1,61.2,35.6,61.5,35.1,62.0,35.6,62.2,35.6,62.7,35.2,62.9,34.8,63.1,34.0,63.1,32.9,63.0,32.6,62.4,31.9,61.8,30.5,61.6,29.0,61.4,28.5,60.3,27.5,59.9,26.6,59.5,26.2],[64.5,20.7,64.2,21.4,64.2,21.9,64.2,23.3,64.5,24.0,64.5,24.2,64.3,24.8,64.3,25.9,64.2,26.2,63.8,26.2,63.2,27.3,62.8,28.7,62.8,29.7,63.0,30.0,63.2,30.0,63.3,29.8,64.1,30.0,64.2,30.1,64.4,30.1,64.6,30.5,65.0,30.5,65.3,29.8,65.5,29.8,65.8,30.2,66.9,30.2,67.1,30.6,67.2,32.3,67.4,32.5,67.5,32.4,67.6,31.5,67.6,30.9,67.7,30.6,67.7,29.1,67.5,27.5,67.4,27.3,66.9,26.8,66.7,26.3,66.4,26.1,66.2,26.1,66.0,25.7,65.8,24.5,65.8,23.8,66.0,23.0,66.1,22.2,65.9,21.3,65.4,20.3,65.0,20.3]],"ids":["p3"],"c":2},{"id":"er","nm":"藥師和病人（右邊窗口）","r":[[91.7,21.2,90.8,20.5,90.0,21.6,89.8,22.4,90.0,23.9,89.8,25.9,88.7,27.2,88.3,28.9,87.4,28.7,86.6,27.5,86.1,27.6,86.1,30.8,85.8,33.0,85.5,33.5,84.8,32.4,84.3,29.5,83.8,29.4,83.5,29.8,83.2,31.5,83.0,35.6,83.5,37.1,84.2,38.1,83.9,42.5,85.8,43.2,86.5,43.0,87.3,41.9,88.7,41.2,88.4,37.9,88.4,34.2,88.8,33.9,89.3,34.3,89.8,33.9,90.1,33.0,90.0,31.5,88.9,30.1,89.0,29.5,90.0,29.0,91.1,29.4,91.2,30.1,90.9,30.8,91.1,32.9,91.3,33.3,91.7,33.0,92.3,31.3,94.0,31.2,94.1,30.2,93.7,27.8,93.1,26.9,92.5,25.0,92.1,24.4,92.0,22.2]],"ids":["p4"],"c":2},{"id":"review","nm":"條碼掃描器和電腦","r":[[79.5,42.6,73.6,42.1,70.7,41.4,69.3,41.7,68.9,47.5,68.8,53.0,68.2,53.3,67.1,53.3,66.2,54.8,65.7,56.4,65.7,57.5,65.9,58.6,66.9,59.2,67.3,59.9,67.6,63.7,67.6,64.9,66.9,65.5,66.5,66.6,66.4,67.8,66.6,68.2,69.5,69.1,70.6,67.6,70.7,67.1,70.6,65.9,69.6,64.9,69.5,61.6,69.1,59.8,69.4,59.0,69.8,60.2,71.1,59.9,71.7,60.8,71.9,60.5,72.7,60.8,72.8,61.3,72.7,64.2,74.0,64.7,74.2,64.2,74.3,61.9,74.8,60.2,76.0,59.1,76.2,58.0,76.6,57.4,78.0,56.2,78.9,55.9,79.3,54.9,79.5,52.6,79.7,44.5,79.7,43.1]],"ids":["p5"],"c":2},{"id":"cabinet","nm":"文件資料櫃（放文件夾的那一層）","r":[[9.6,14.9,9.7,16.1,9.6,16.7,9.6,19.1,9.7,19.6,10.1,20.3,10.2,21.4,10.3,21.7,11.5,21.7,11.6,21.8,11.9,21.8,12.2,21.4,12.5,21.9,12.8,21.9,12.9,22.0,15.2,22.0,15.2,22.2,15.5,22.0,15.5,21.8,15.5,15.7,15.4,15.5,15.0,15.5,14.9,15.3,14.5,15.2,14.5,15.1,14.3,15.1,14.2,15.0,14.2,15.1,13.8,15.1,13.7,15.0,13.6,15.0,13.4,14.7,13.3,14.9,12.3,14.9,12.2,15.1,11.9,14.5,10.4,14.5,10.4,14.6,9.9,14.5]],"ids":["p1"],"c":1},{"id":"meds","nm":"藥品櫃（不含冰箱）","r":[[15.6,15.0,11.1,13.3,10.7,12.8,8.4,12.4,6.5,11.7,5.8,11.9,5.1,13.0,5.2,14.6,5.2,22.7,5.0,25.0,5.2,26.7,5.1,28.7,5.2,29.5,5.1,31.5,5.3,33.6,5.1,36.1,5.3,36.7,5.4,40.2,5.2,44.9,5.5,51.4,5.8,51.4,5.7,50.4,5.9,50.1,6.5,49.8,7.2,48.1,7.0,46.2,7.2,36.2,7.0,23.8,7.2,19.7,7.6,19.2,9.1,19.9,9.6,19.7,9.8,20.0,10.1,20.8,10.2,23.0,10.0,28.7,10.3,45.1,12.2,45.2,12.6,43.6,13.3,43.4,13.3,40.6,13.0,40.0,12.7,40.0,12.5,39.1,12.6,38.2,13.1,38.2,13.4,37.6,13.2,34.2,14.2,33.0,15.3,33.1,15.7,32.3,15.7,22.4,15.6,21.0,15.7,16.6]],"c":1},{"id":"beaker","nm":"量杯","r":[[22.4,69.1,22.4,69.3,22.3,69.4,22.3,71.0,22.3,71.1,22.3,72.6,22.3,72.7,22.3,73.1,22.4,73.2,22.5,73.8,22.7,74.5,22.8,74.7,23.0,74.7,23.1,74.8,23.3,74.8,23.3,74.7,23.6,74.7,23.6,74.5,24.7,74.8,25.0,74.5,25.1,74.2,25.1,73.9,25.2,73.8,25.2,69.4,25.0,69.2,24.7,69.2,24.6,69.3,24.4,69.3,24.4,69.4,23.5,69.5,23.3,69.3,22.8,69.3,22.5,68.9]],"c":1},{"id":"bottles","nm":"藥水瓶","r":[[8.6,62.0,8.4,61.8,8.1,61.8,8.0,61.6,7.9,61.6,7.9,61.8,7.3,61.9,7.2,62.0,7.0,62.0,6.8,62.2,6.7,62.5,6.7,64.6,6.6,65.0,6.5,65.3,6.3,66.0,6.3,67.7,6.2,68.0,6.0,67.7,5.8,67.8,5.2,68.0,5.2,68.1,5.0,68.1,4.8,68.5,4.8,68.7,4.8,68.8,4.8,70.9,4.7,71.0,4.7,71.7,4.8,71.9,4.8,73.6,4.9,74.1,5.1,74.3,6.0,74.3,6.2,74.1,6.3,73.9,6.3,73.7,6.4,73.4,6.5,73.6,6.8,73.7,7.4,73.2,7.6,73.2,7.7,73.1,8.0,73.0,8.3,72.7,8.6,72.6,8.9,72.2,9.0,71.7,9.0,65.7,8.8,64.1,8.8,62.5],[17.7,64.2,17.4,64.9,17.4,67.2,17.3,67.7,17.3,70.6,17.2,70.8,17.2,72.7,17.3,73.0,17.4,73.1,17.8,73.0,18.7,72.4,18.8,71.9,18.8,69.1,18.9,68.8,19.0,68.6,19.6,68.6,19.8,69.1,19.8,73.2,19.8,73.4,20.5,74.2,20.7,74.3,21.0,74.2,21.2,73.6,21.2,67.8,21.0,66.9,20.8,66.3,20.8,65.2,20.6,65.0,20.6,65.2,20.0,65.3,19.7,66.0,19.5,65.7,19.3,65.4,19.1,65.7,19.0,65.5,18.9,64.7,18.5,64.1,18.2,64.1,18.2,64.2,17.8,64.1],[14.4,65.0,14.2,64.7,14.2,64.8,13.6,64.8,13.5,64.9,13.0,64.8,12.8,65.0,12.6,64.9,12.4,65.3,11.4,65.3,11.1,65.5,11.1,65.7,11.1,67.7,11.0,67.8,11.0,69.1,11.1,69.7,11.1,70.6,11.3,70.9,11.4,70.9,11.5,71.0,11.5,70.9,11.8,70.9,11.9,70.8,12.1,70.8,12.1,70.6,12.4,70.6,12.6,70.4,12.7,69.8,12.9,69.4,13.1,69.7,13.5,69.8,13.6,69.7,13.8,69.7,14.2,69.3,14.3,68.9,14.4,68.3]],"c":6},{"id":"fridge","nm":"冰箱","r":[[7.6,19.9,7.4,20.3,7.4,23.8,7.3,23.9,7.4,26.3,7.4,29.2,7.4,29.4,7.4,36.3,7.4,36.4,7.4,42.5,7.3,42.6,7.4,46.8,7.5,47.7,8.1,47.9,8.7,47.6,9.0,47.3,9.3,47.3,9.5,47.5,9.8,46.9,10.0,46.2,10.0,42.1,10.0,40.3,9.9,39.8,9.9,34.8,9.8,33.4,9.8,29.0,9.8,28.9,10.0,23.1,9.8,21.0,9.7,20.5,9.6,20.3,9.1,20.5,8.8,20.2]],"c":1},{"id":"folders","nm":"資料夾","r":[[12.3,15.2,12.2,15.5,12.2,16.1,12.1,16.7,12.1,17.4,12.1,17.5,12.1,18.0,12.1,18.1,12.1,19.4,12.1,19.5,12.1,20.0,12.2,20.1,12.2,21.3,12.3,21.6,12.5,21.8,12.8,21.8,12.8,21.9,14.4,21.9,14.4,22.0,15.4,21.9,15.5,21.8,15.5,21.6,15.5,18.1,15.5,18.0,15.5,17.4,15.5,17.3,15.5,16.1,15.5,15.8,15.4,15.7,14.7,15.6,14.7,15.5,14.4,15.5,14.3,15.3,13.8,15.3,13.6,15.1,13.0,15.1,13.0,15.0,12.4,15.0]],"c":1},{"id":"monitor","nm":"電腦螢幕","r":[[69.6,42.8,69.3,44.0,69.2,46.2,69.0,47.9,68.9,49.8,69.0,50.4,69.0,52.7,69.1,53.2,69.3,53.6,69.8,54.9,70.0,57.6,70.1,57.7,70.5,57.6,70.9,58.0,72.1,58.3,72.4,58.2,73.2,58.6,73.5,59.0,74.2,59.0,74.8,59.3,74.9,59.2,75.7,59.2,76.0,59.0,76.2,58.0,76.7,57.1,77.4,56.8,78.0,56.2,78.7,56.0,79.1,55.2,79.1,54.1,79.2,53.5,79.5,52.7,79.5,51.5,79.6,50.5,79.6,43.4,79.5,42.9,79.1,42.6,78.2,42.5,77.8,43.0,76.4,42.4,75.9,42.4,75.5,42.8,74.7,42.3,73.6,42.5,73.2,42.0,72.0,42.3,71.7,42.0,70.8,41.9,70.5,41.7,70.0,41.9]],"c":1},{"id":"printer","nm":"印表機","r":[[53.3,48.4,52.9,48.0,52.3,47.9,52.3,47.7,50.2,47.5,49.5,47.9,49.2,48.4,48.9,48.7,48.6,49.3,48.4,50.5,48.1,51.4,48.0,52.4,48.0,53.7,48.0,53.8,48.0,56.5,47.9,56.6,47.9,57.7,47.8,58.6,47.8,59.9,47.7,60.0,47.7,61.0,47.8,61.4,48.2,61.8,49.1,61.8,49.8,62.1,50.2,62.1,50.4,62.4,51.0,62.4,51.1,62.2,51.2,61.5,51.2,58.8,51.3,58.6,51.6,58.0,52.0,57.5,52.5,57.2,53.1,56.8,53.3,56.0,53.4,55.7,53.4,54.4,53.3,54.3,53.3,53.6,53.4,53.5,53.4,48.6]],"c":1},{"id":"pillbottle","nm":"藥罐","r":[[55.2,71.0,55.1,71.1,54.9,71.6,54.9,76.9,55.0,77.0,55.0,77.5,55.1,77.8,55.4,78.0,55.4,78.1,56.2,78.1,56.2,78.0,56.3,78.0,56.5,77.7,56.5,77.5,56.6,77.3,56.6,76.0,56.6,75.9,56.6,75.0,56.7,74.9,56.7,71.9,56.6,71.7,56.6,71.5,56.5,71.3,56.1,70.9,55.4,70.9,55.4,71.0]],"c":1}]}];

/* ════════ shape.js ════════ */
/* ───────── 物品的形狀（第 26 批）：在「物品框」裡自動找出物品的輪廓 ─────────
   做法：GrabCut（框外面＝背景；框裡面用「物品的顏色」和「背景的顏色」兩個模型，加上「相鄰的點盡量同一邊」，用圖割分成物品／背景，來回 4 次）。
   只有開發者的編輯器會算（選到一個地點、移動框、點選要亮的物品、按「儲存」的時候）；算好的輪廓（幾個多邊形，用整張圖的 %）存在地點裡。
   網頁首頁：平常有按鍵的物品留一半顏色、滑到時亮起來——都只照輪廓（物品本身），框裡的背景不亮。藥師的瀏覽器照著畫，不用算。
   「點一下要亮的物品」（pick）：那一點附近一定算物品，最後只留那一樣（框裡的其他東西不亮）。
   這個檔裡的函式除了 shFind、shFp（要畫布）以外都不碰畫面，測試可以直接跑。
   第 27 批：目錄圖是「圖一」（物品圖庫 shapelib.js 裡有的那一張）→ 直接用圖庫裡切好的整個物品（整本書、整個藥盤…，不用設定）；別張圖才用上面的方法在框裡找。 */
var SH_VER = "s3", SH_SIDE = 180, SH_ITER = 4, SH_K = 5, SH_GAMMA = 12, SH_PTS = 40, SH_RINGS = 4;
// SH_VER：第 28 批改成 s3（圖庫的「覆核」多了電腦）→ 存過的形狀都會在下次儲存時重找一次（圖一用圖庫，很快）。
// SH_GAMMA：「相鄰的點盡量同一邊」有多重要。縮小過的圖用 OpenCV 的 50 太重（整個框會變成背景）；12 試過藥盤、藥水瓶、法規書、處方夾都對。
// 還是整個變背景的話，自動用一半再試一次。

function shBox(s) { return [s.x, s.y, s.w, s.h].map(function (v) { return Math.round(Number(v) || 0); }).join(","); }
function shKey(cat, s) { return SH_VER + "|" + ((cat && cat.fid) || "") + "|" + shBox(s) + "|" + (Array.isArray(s.pick) ? s.pick.join(",") : "") + "|" + String((s && s.id) || "").slice(0, 40); }
function shNeed(cat, s) { return !!(cat && cat.img && s && s.lit !== "box" && !(s.shape && s.shape.k === shKey(cat, s))); }

/* ── 第 27 批：物品圖庫（shapelib.js 的 SH_LIB）──
   圖的指紋 fp：縮成 272×128 → 每 16×16 一格平均 → 17×8 格灰階 → 每一列左右相鄰比亮暗 → 128 個 0/1（32 個十六進位字）。跟 build_lib.py 同一個算法；
   重新存過、縮小過的同一張圖，差不到幾個；別張圖差 50～70 個。差 SH_FP_MAX 個以內、長寬比差 3% 以內＝同一張。 */
var SH_FP_MAX = 20;
function shFpOf(px, W, H) {   // px＝RGBA（W×H，已經縮成 272×128）
  var L = new Float64Array(17 * 8), x, y, hex = "", nib = 0, nb = 0;
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) { var o = (y * W + x) * 4; L[(Math.min(7, (y * 8 / H) | 0)) * 17 + Math.min(16, (x * 17 / W) | 0)] += px[o] * 0.299 + px[o + 1] * 0.587 + px[o + 2] * 0.114; }
  for (y = 0; y < 8; y++) for (x = 0; x < 16; x++) { nib = nib * 2 + (L[y * 17 + x] < L[y * 17 + x + 1] ? 1 : 0); if (++nb === 4) { hex += nib.toString(16); nib = 0; nb = 0; } }
  return hex;
}
function shFp(img) {   // 瀏覽器裡：載好的圖 → 指紋
  var cv = document.createElement("canvas"); cv.width = 272; cv.height = 128;
  var g = cv.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingEnabled = true; try { g.imageSmoothingQuality = "high"; } catch (e) { /* 舊瀏覽器 */ }
  g.drawImage(img, 0, 0, 272, 128);
  return shFpOf(g.getImageData(0, 0, 272, 128).data, 272, 128);
}
function shFpDist(a, b) {   // 兩個指紋差幾個 0/1
  if (!a || !b || a.length !== b.length) return 999;
  var n = 0; for (var i = 0; i < a.length; i++) { var v = parseInt(a.charAt(i), 16) ^ parseInt(b.charAt(i), 16); while (v) { n += v & 1; v >>= 1; } }
  return n;
}
function shLibMatch(fp, ar) {   // 指紋、長寬比 → 圖庫裡的那一筆（沒有＝null）
  var lib = typeof SH_LIB !== "undefined" ? SH_LIB : [];
  for (var i = 0; i < lib.length; i++) if (Math.abs(ar - lib[i].ar) / lib[i].ar <= 0.03 && shFpDist(fp, lib[i].fp) <= SH_FP_MAX) return lib[i];
  return null;
}
function shInRings(rings, x, y) {   // 這一點在不在物品裡（好幾圈：在任一圈裡就算）
  var c = false;
  (rings || []).forEach(function (r) { for (var i = 0, j = r.length - 2; i < r.length; j = i, i += 2) { var xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } });
  return c;
}
function shRingsBox(rings) { var b = [Infinity, Infinity, -Infinity, -Infinity]; (rings || []).forEach(function (r) { for (var k = 0; k + 1 < r.length; k += 2) { b[0] = Math.min(b[0], r[k]); b[2] = Math.max(b[2], r[k]); b[1] = Math.min(b[1], r[k + 1]); b[3] = Math.max(b[3], r[k + 1]); } }); return b; }
function shRingsArea(rings) { var a = 0; (rings || []).forEach(function (r) { a += shArea(r); }); return a; }
// 這個地點要亮圖庫裡的哪一個物品（沒有合適的＝null，照舊在框裡找）：
//   ① 點選過（pick）：點到的那一個（點到好幾個，例如量杯也在「藥水瓶和量杯」裡：小的那個）
//   ② 預設的地點（p1…p10）：圖庫指定的物品，只要它還在框附近（框搬到別的東西上面就不算）
//   ③ 其他：框裡佔最多的物品（至少佔框的 15%，物品也至少有 8% 在框裡）
function shLibPick(L, s) {
  var objs = (L && L.objs) || [], B = [s.x, s.y, s.x + s.w, s.y + s.h], i;
  if (Array.isArray(s.pick)) {
    var hit = null;
    objs.forEach(function (o) { if (shInRings(o.r, s.pick[0], s.pick[1]) && (!hit || shRingsArea(o.r) < shRingsArea(hit.r))) hit = o; });
    return hit;
  }
  var mx = Math.max(4, s.w * 0.5), my = Math.max(4, s.h * 0.5);
  for (i = 0; i < objs.length; i++) {
    var o = objs[i];
    if (!o.ids || o.ids.indexOf(s.id) < 0) continue;
    var bb = shRingsBox(o.r);
    if (bb[0] < B[2] + mx && bb[2] > B[0] - mx && bb[1] < B[3] + my && bb[3] > B[1] - my) return o;
  }
  var N = 24, best = null, bc = 0, ba = Infinity, boxA = Math.max(1e-6, s.w * s.h);
  objs.forEach(function (o) {
    var bb = shRingsBox(o.r); if (bb[0] > B[2] || bb[2] < B[0] || bb[1] > B[3] || bb[3] < B[1]) return;
    var n = 0, a, b;
    for (a = 0; a < N; a++) for (b = 0; b < N; b++) if (shInRings(o.r, B[0] + (a + 0.5) / N * s.w, B[1] + (b + 0.5) / N * s.h)) n++;
    var cov = n / (N * N), oa = shRingsArea(o.r), inBox = oa > 0 ? cov * boxA / oa : 0;
    if (cov >= 0.15 && inBox >= 0.08 && (cov > bc + 1e-9 || (Math.abs(cov - bc) <= 1e-9 && oa < ba))) { best = o; bc = cov; ba = oa; }
  });
  return best;
}
// 編輯器：img＝目錄圖（載好的），s＝地點 → 圖庫裡有：{ r, n, nm }；這張圖不在圖庫、或框裡沒有圖庫的物品：null
function shLibFind(img, s) {
  if (!img) return null;
  if (img.__shLib === undefined) {
    var IW = img.naturalWidth || img.width, IH = img.naturalHeight || img.height, L = null;
    try { if (IW && IH) L = shLibMatch(shFp(img), IW / IH); } catch (e) { L = null; }
    img.__shLib = L;
  }
  var o = img.__shLib ? shLibPick(img.__shLib, s) : null;
  return o ? { r: o.r.map(function (r) { return r.slice(); }), n: o.c || o.r.length, nm: o.nm } : null;
}

// 固定的亂數（同一張圖、同一個框，每次算出來都一樣）
function shRand(seed) { var r = (seed >>> 0) || 1; return function () { r = (Math.imul(r, 1664525) + 1013904223) >>> 0; return r / 4294967296; }; }

/* ── k-means（給顏色模型一個好的起點）── */
function shKmeans(Z, idx, K, iters, rnd) {
  var n = idx.length, lab = new Uint8Array(n), C = new Float64Array(K * 3), d2 = new Float64Array(n), i, k, c;
  if (!n) return lab;
  var dist = function (p, kk) { var a = Z[p * 3] - C[kk * 3], b = Z[p * 3 + 1] - C[kk * 3 + 1], e = Z[p * 3 + 2] - C[kk * 3 + 2]; return a * a + b * b + e * e; };
  var p0 = idx[Math.floor(rnd() * n)];
  for (c = 0; c < 3; c++) C[c] = Z[p0 * 3 + c];
  for (i = 0; i < n; i++) d2[i] = dist(idx[i], 0);
  for (k = 1; k < K; k++) {   // k-means++：離已經選的中心越遠，越容易被選
    var sum = 0; for (i = 0; i < n; i++) sum += d2[i];
    var pick = Math.floor(rnd() * n);
    if (sum > 0) { var t = rnd() * sum; for (i = 0; i < n; i++) { t -= d2[i]; if (t <= 0) { pick = i; break; } } }
    for (c = 0; c < 3; c++) C[k * 3 + c] = Z[idx[pick] * 3 + c];
    for (i = 0; i < n; i++) { var dd = dist(idx[i], k); if (dd < d2[i]) d2[i] = dd; }
  }
  var S = new Float64Array(K * 3), cnt = new Float64Array(K);
  for (var it = 0; it < iters; it++) {
    for (i = 0; i < n; i++) { var best = 0, bd = Infinity; for (k = 0; k < K; k++) { var v = dist(idx[i], k); if (v < bd) { bd = v; best = k; } } lab[i] = best; }
    S.fill(0); cnt.fill(0);
    for (i = 0; i < n; i++) { k = lab[i]; cnt[k]++; for (c = 0; c < 3; c++) S[k * 3 + c] += Z[idx[i] * 3 + c]; }
    for (k = 0; k < K; k++) if (cnt[k]) for (c = 0; c < 3; c++) C[k * 3 + c] = S[k * 3 + c] / cnt[k];
  }
  return lab;
}

/* ── 顏色模型（5 個高斯混在一起；跟 OpenCV 的 GrabCut 一樣的算法）── */
function shGmm() { var K = SH_K; return { coef: new Float64Array(K), mean: new Float64Array(K * 3), inv: new Float64Array(K * 9), det: new Float64Array(K), isd: new Float64Array(K), S: new Float64Array(K * 3), P: new Float64Array(K * 9), n: new Float64Array(K), tot: 0, best: 0 }; }
function shGmmReset(m) { m.S.fill(0); m.P.fill(0); m.n.fill(0); m.tot = 0; }
function shGmmAdd(m, k, r, g, b) {
  var o = k * 3, q = k * 9, P = m.P;
  m.S[o] += r; m.S[o + 1] += g; m.S[o + 2] += b;
  P[q] += r * r; P[q + 1] += r * g; P[q + 2] += r * b; P[q + 4] += g * g; P[q + 5] += g * b; P[q + 8] += b * b;
  m.n[k]++; m.tot++;
}
function shGmmEnd(m) {
  for (var k = 0; k < SH_K; k++) {
    var n = m.n[k];
    if (!n) { m.coef[k] = 0; continue; }
    m.coef[k] = n / m.tot;
    var o = k * 3, q = k * 9, a = m.S[o] / n, b = m.S[o + 1] / n, e = m.S[o + 2] / n, P = m.P;
    m.mean[o] = a; m.mean[o + 1] = b; m.mean[o + 2] = e;
    var c0 = P[q] / n - a * a, c1 = P[q + 1] / n - a * b, c2 = P[q + 2] / n - a * e, c4 = P[q + 4] / n - b * b, c5 = P[q + 5] / n - b * e, c8 = P[q + 8] / n - e * e;
    var det = c0 * (c4 * c8 - c5 * c5) - c1 * (c1 * c8 - c5 * c2) + c2 * (c1 * c5 - c4 * c2);
    if (det <= 1e-9) { c0 += 0.01; c4 += 0.01; c8 += 0.01; det = c0 * (c4 * c8 - c5 * c5) - c1 * (c1 * c8 - c5 * c2) + c2 * (c1 * c5 - c4 * c2); }   // 顏色幾乎一樣（平的一片）：加一點點，免得除以 0
    if (det <= 1e-12) det = 1e-12;
    m.det[k] = det; m.isd[k] = 1 / Math.sqrt(det);
    var I = m.inv;
    I[q] = (c4 * c8 - c5 * c5) / det; I[q + 1] = (c2 * c5 - c1 * c8) / det; I[q + 2] = (c1 * c5 - c2 * c4) / det;
    I[q + 3] = I[q + 1]; I[q + 4] = (c0 * c8 - c2 * c2) / det; I[q + 5] = (c1 * c2 - c0 * c5) / det;
    I[q + 6] = I[q + 2]; I[q + 7] = I[q + 5]; I[q + 8] = (c0 * c4 - c1 * c1) / det;
  }
}
function shGmmEval(m, r, g, b) {   // 這個顏色像不像（Σ 權重×密度，不含常數）；m.best＝最像的那一個高斯
  var s = 0, best = 0, bp = -1, I = m.inv, M = m.mean, C = m.coef, D = m.isd;
  for (var k = 0; k < SH_K; k++) {
    if (C[k] <= 0) continue;
    var o = k * 3, q = k * 9, d0 = r - M[o], d1 = g - M[o + 1], d2 = b - M[o + 2];
    var p = Math.exp(-0.5 * (d0 * (d0 * I[q] + 2 * (d1 * I[q + 1] + d2 * I[q + 2])) + d1 * (d1 * I[q + 4] + 2 * d2 * I[q + 5]) + d2 * d2 * I[q + 8])) * D[k];
    s += C[k] * p;
    if (p > bp) { bp = p; best = k; }
  }
  m.best = best;
  return s;
}

/* ── 圖割（最大流／最小割，Boykov–Kolmogorov 演算法）：每個點是一個節點；連到「物品」端、「背景」端的容量＋相鄰點之間的容量 ── */
function shGraph(N, E) {   // E：最多幾條邊（每條邊兩個方向）
  return { N: N, first: new Int32Array(N).fill(-1), trCap: new Float64Array(N), head: new Int32Array(E * 2), nxtA: new Int32Array(E * 2), rCap: new Float64Array(E * 2), nA: 0 };
}
function shEdge(G, i, j, cap, rev) {
  var a = G.nA; G.nA += 2;
  G.head[a] = j; G.nxtA[a] = G.first[i]; G.first[i] = a; G.rCap[a] = cap;
  G.head[a + 1] = i; G.nxtA[a + 1] = G.first[j]; G.first[j] = a + 1; G.rCap[a + 1] = rev;
}
function shMaxflow(G) {   // 回傳：每個節點在不在「物品」那一邊（Uint8Array）
  var N = G.N, first = G.first, head = G.head, nxtA = G.nxtA, rCap = G.rCap, trCap = G.trCap;
  var NONE = -1, TERM = -2, ORPH = -3, INF_D = 1e9;
  var parent = new Int32Array(N), nxt = new Int32Array(N).fill(-1), TS = new Int32Array(N), DIST = new Int32Array(N), sink = new Uint8Array(N);
  var qF = -1, qL = -1, orph = [], oh = 0, TIME = 0, i, j, a, a0;
  var setActive = function (v) { if (nxt[v] === -1) { if (qL >= 0) nxt[qL] = v; else qF = v; qL = v; nxt[v] = v; } };
  var nextActive = function () {
    for (;;) {
      var v = qF; if (v < 0) return -1;
      if (nxt[v] === v) { qF = qL = -1; } else qF = nxt[v];
      nxt[v] = -1;
      if (parent[v] !== NONE) return v;
    }
  };
  var orphan = function (v) { parent[v] = ORPH; orph.push(v); };
  for (i = 0; i < N; i++) {
    if (trCap[i] > 0) { sink[i] = 0; parent[i] = TERM; setActive(i); DIST[i] = 1; }
    else if (trCap[i] < 0) { sink[i] = 1; parent[i] = TERM; setActive(i); DIST[i] = 1; }
    else parent[i] = NONE;
  }
  var augment = function (mid) {
    var v, e, b = rCap[mid];
    for (v = head[mid ^ 1]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; if (b > rCap[e ^ 1]) b = rCap[e ^ 1]; }
    if (b > trCap[v]) b = trCap[v];
    for (v = head[mid]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; if (b > rCap[e]) b = rCap[e]; }
    if (b > -trCap[v]) b = -trCap[v];
    rCap[mid ^ 1] += b; rCap[mid] -= b;
    for (v = head[mid ^ 1]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; rCap[e] += b; rCap[e ^ 1] -= b; if (rCap[e ^ 1] <= 0) { rCap[e ^ 1] = 0; orphan(v); } }
    trCap[v] -= b; if (trCap[v] <= 0) { trCap[v] = 0; orphan(v); }
    for (v = head[mid]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; rCap[e ^ 1] += b; rCap[e] -= b; if (rCap[e] <= 0) { rCap[e] = 0; orphan(v); } }
    trCap[v] += b; if (trCap[v] >= 0) { trCap[v] = 0; orphan(v); }
  };
  var adopt = function (v) {
    var isS = sink[v], dmin = INF_D, amin = NONE, d, w, e, e0;
    for (e0 = first[v]; e0 !== NONE; e0 = nxtA[e0]) {
      if ((isS ? rCap[e0] : rCap[e0 ^ 1]) > 0) {
        w = head[e0];
        if (sink[w] === isS && (e = parent[w]) !== NONE) {
          d = 0;
          for (;;) {   // 這個鄰居是不是真的接回「物品」端（或「背景」端）
            if (TS[w] === TIME) { d += DIST[w]; break; }
            e = parent[w]; d++;
            if (e === TERM) { TS[w] = TIME; DIST[w] = 1; break; }
            if (e === ORPH) { d = INF_D; break; }
            w = head[e];
          }
          if (d < INF_D) {
            if (d < dmin) { amin = e0; dmin = d; }
            for (w = head[e0]; TS[w] !== TIME; w = head[parent[w]]) { TS[w] = TIME; DIST[w] = d--; }
          }
        }
      }
    }
    parent[v] = amin;
    if (amin !== NONE) { TS[v] = TIME; DIST[v] = dmin + 1; return; }
    for (e0 = first[v]; e0 !== NONE; e0 = nxtA[e0]) {   // 找不到新的爸爸：變成自由的點，鄰居重新長過來
      w = head[e0];
      if (sink[w] === isS && (e = parent[w]) !== NONE) {
        if ((isS ? rCap[e0] : rCap[e0 ^ 1]) > 0) setActive(w);
        if (e !== TERM && e !== ORPH && head[e] === v) orphan(w);
      }
    }
  };
  var cur = -1;
  for (;;) {
    i = -1;
    if (cur >= 0) { nxt[cur] = -1; if (parent[cur] !== NONE) i = cur; cur = -1; }
    if (i < 0) { i = nextActive(); if (i < 0) break; }
    a = NONE;
    if (!sink[i]) {
      for (a0 = first[i]; a0 !== NONE; a0 = nxtA[a0]) if (rCap[a0] > 0) {
        j = head[a0];
        if (parent[j] === NONE) { sink[j] = 0; parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; setActive(j); }
        else if (sink[j]) { a = a0; break; }
        else if (TS[j] <= TS[i] && DIST[j] > DIST[i]) { parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; }
      }
    } else {
      for (a0 = first[i]; a0 !== NONE; a0 = nxtA[a0]) if (rCap[a0 ^ 1] > 0) {
        j = head[a0];
        if (parent[j] === NONE) { sink[j] = 1; parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; setActive(j); }
        else if (!sink[j]) { a = a0 ^ 1; break; }
        else if (TS[j] <= TS[i] && DIST[j] > DIST[i]) { parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; }
      }
    }
    TIME++;
    if (a !== NONE) {
      nxt[i] = i; cur = i;   // 這個點等一下再看一次（可能還有別條路）
      augment(a);
      while (oh < orph.length) adopt(orph[oh++]);
      orph.length = 0; oh = 0;
    }
  }
  var fg = new Uint8Array(N);
  for (i = 0; i < N; i++) fg[i] = parent[i] !== NONE && !sink[i] ? 1 : 0;   // 從「物品」端走得到的＝物品
  return fg;
}

/* ── GrabCut：px＝RGBA（W×H），框＝[X0,Y0,X1,Y1)（框外＝確定是背景），pk＝[x,y]（點選的地方，可以沒有），gamma＝相鄰的點有多黏 → 每個點是不是物品 ── */
function shGrabCut(px, W, H, X0, Y0, X1, Y1, pk, gamma) {
  var N = W * H, i, x, y, it;
  gamma = gamma || SH_GAMMA;
  var LAMBDA = 9 * gamma, Z = new Float64Array(N * 3);
  for (i = 0; i < N; i++) { Z[i * 3] = px[i * 4]; Z[i * 3 + 1] = px[i * 4 + 1]; Z[i * 3 + 2] = px[i * 4 + 2]; }
  var lab = new Uint8Array(N);   // 0 確定背景、1 確定物品、2 可能背景、3 可能物品（跟 OpenCV 一樣）
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) lab[y * W + x] = x >= X0 && x < X1 && y >= Y0 && y < Y1 ? 3 : 0;
  if (pk) {   // 點選的地方：一小圈確定是物品
    var rr = Math.max(1.5, Math.min(X1 - X0, Y1 - Y0) * 0.035);
    for (y = Math.max(Y0, Math.floor(pk[1] - rr)); y <= Math.min(Y1 - 1, Math.ceil(pk[1] + rr)); y++)
      for (x = Math.max(X0, Math.floor(pk[0] - rr)); x <= Math.min(X1 - 1, Math.ceil(pk[0] + rr)); x++)
        if ((x - pk[0]) * (x - pk[0]) + (y - pk[1]) * (y - pk[1]) <= rr * rr) lab[y * W + x] = 1;
  }
  var bgIdx = [], fgIdx = [];
  for (i = 0; i < N; i++) (lab[i] === 0 || lab[i] === 2 ? bgIdx : fgIdx).push(i);
  if (bgIdx.length < 20 || fgIdx.length < 20) return null;   // 框太大（外面沒有背景可以參考）或太小
  // 圖：每個點連到左、左上、上、右上（容量＝顏色越像越大）；只建一次
  var d2 = function (p, q) { var a = Z[p * 3] - Z[q * 3], b = Z[p * 3 + 1] - Z[q * 3 + 1], c = Z[p * 3 + 2] - Z[q * 3 + 2]; return a * a + b * b + c * c; };
  var sum = 0, cnt = 0;
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
    i = y * W + x;
    if (x > 0) { sum += d2(i, i - 1); cnt++; }
    if (x > 0 && y > 0) { sum += d2(i, i - W - 1); cnt++; }
    if (y > 0) { sum += d2(i, i - W); cnt++; }
    if (x < W - 1 && y > 0) { sum += d2(i, i - W + 1); cnt++; }
  }
  var beta = sum > 1e-9 ? 1 / (2 * sum / cnt) : 0, gD = gamma / Math.SQRT2, G = shGraph(N, N * 4);
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
    i = y * W + x;
    if (x > 0) { var w1 = gamma * Math.exp(-beta * d2(i, i - 1)); shEdge(G, i, i - 1, w1, w1); }
    if (x > 0 && y > 0) { var w2 = gD * Math.exp(-beta * d2(i, i - W - 1)); shEdge(G, i, i - W - 1, w2, w2); }
    if (y > 0) { var w3 = gamma * Math.exp(-beta * d2(i, i - W)); shEdge(G, i, i - W, w3, w3); }
    if (x < W - 1 && y > 0) { var w4 = gD * Math.exp(-beta * d2(i, i - W + 1)); shEdge(G, i, i - W + 1, w4, w4); }
  }
  var cap0 = new Float64Array(G.rCap.subarray(0, G.nA));
  // 顏色模型的起點：物品、背景各分 5 群
  var rnd = shRand(20261017), bg = shGmm(), fg = shGmm();
  var lb = shKmeans(Z, bgIdx, SH_K, 6, rnd), lf = shKmeans(Z, fgIdx, SH_K, 6, rnd);
  shGmmReset(bg); shGmmReset(fg);
  for (i = 0; i < bgIdx.length; i++) { var pb = bgIdx[i]; shGmmAdd(bg, lb[i], Z[pb * 3], Z[pb * 3 + 1], Z[pb * 3 + 2]); }
  for (i = 0; i < fgIdx.length; i++) { var pf = fgIdx[i]; shGmmAdd(fg, lf[i], Z[pf * 3], Z[pf * 3 + 1], Z[pf * 3 + 2]); }
  shGmmEnd(bg); shGmmEnd(fg);
  var pB = new Float64Array(N), pF = new Float64Array(N), bB = new Uint8Array(N), bF = new Uint8Array(N), BIG = 1e4;
  var evalAll = function () { for (var k = 0; k < N; k++) { var r = Z[k * 3], g = Z[k * 3 + 1], b = Z[k * 3 + 2]; pB[k] = shGmmEval(bg, r, g, b); bB[k] = bg.best; pF[k] = shGmmEval(fg, r, g, b); bF[k] = fg.best; } };
  var nlog = function (p) { return p > 1e-300 ? Math.min(BIG, -Math.log(p)) : BIG; };
  evalAll();
  for (it = 0; it < SH_ITER; it++) {
    // ① 每個點歸到最像的高斯 → 重新學兩個顏色模型 ② 算新的「像不像」
    shGmmReset(bg); shGmmReset(fg);
    for (i = 0; i < N; i++) { var isB = lab[i] === 0 || lab[i] === 2; shGmmAdd(isB ? bg : fg, isB ? bB[i] : bF[i], Z[i * 3], Z[i * 3 + 1], Z[i * 3 + 2]); }
    shGmmEnd(bg); shGmmEnd(fg);
    evalAll();
    // ③ 容量換新、切開
    G.rCap.set(cap0);
    for (i = 0; i < N; i++) {
      var L = lab[i];
      G.trCap[i] = L === 2 || L === 3 ? nlog(pB[i]) - nlog(pF[i]) : L === 0 ? -LAMBDA : LAMBDA;
    }
    var cut = shMaxflow(G);
    for (i = 0; i < N; i++) if (lab[i] === 2 || lab[i] === 3) lab[i] = cut[i] ? 3 : 2;
  }
  var out = new Uint8Array(N);
  for (i = 0; i < N; i++) out[i] = lab[i] === 1 || lab[i] === 3 ? 1 : 0;
  return out;
}

/* ── 整理：去掉細小的點、補小縫、太小的塊不要；點選了就只留那一樣；補洞 ── */
function shMorph(m, W, H, grow) {   // 3×3 擴張（grow）或侵蝕
  var o = new Uint8Array(W * H), x, y, dx, dy;
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
    var hit = grow ? 0 : 1;
    for (dy = -1; dy <= 1 && hit === (grow ? 0 : 1); dy++) for (dx = -1; dx <= 1; dx++) {
      var xx = x + dx, yy = y + dy, v = xx >= 0 && yy >= 0 && xx < W && yy < H ? m[yy * W + xx] : 0;
      if (grow && v) { hit = 1; break; }
      if (!grow && !v) { hit = 0; break; }
    }
    o[y * W + x] = hit;
  }
  return o;
}
function shComps(m, W, H) {   // 連在一起的塊（8 個方向）：{ id: Int32Array（0＝背景）, n, size: [] }
  var id = new Int32Array(W * H), n = 0, size = [0], st = [], i, x, y;
  for (i = 0; i < W * H; i++) if (m[i] && !id[i]) {
    n++; size.push(0); id[i] = n; st.push(i);
    while (st.length) {
      var p = st.pop(); size[n]++; x = p % W; y = (p / W) | 0;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        var q = yy * W + xx; if (m[q] && !id[q]) { id[q] = n; st.push(q); }
      }
    }
  }
  return { id: id, n: n, size: size };
}
function shClean(m, W, H, X0, Y0, X1, Y1, pk) {
  if (!m) return null;
  var a = shMorph(shMorph(m, W, H, false), W, H, true);   // 打開：細小的點不要
  a = shMorph(shMorph(a, W, H, true), W, H, false);        // 關起來：小縫補起來
  var c = shComps(a, W, H), minA = Math.max(12, (X1 - X0) * (Y1 - Y0) * 0.02), keep = new Uint8Array(c.n + 1), i, k, x, y;
  if (pk) {   // 點選的：只留那一塊（點的地方剛好不是物品：留最近的那一塊）
    var px = Math.min(W - 1, Math.max(0, Math.round(pk[0]))), py = Math.min(H - 1, Math.max(0, Math.round(pk[1]))), hitId = c.id[py * W + px];
    if (!hitId) { var bd = Infinity; for (i = 0; i < W * H; i++) if (c.id[i] && c.size[c.id[i]] >= 4) { x = i % W; y = (i / W) | 0; var d = (x - px) * (x - px) + (y - py) * (y - py); if (d < bd) { bd = d; hitId = c.id[i]; } } }
    if (hitId) keep[hitId] = 1;
  } else for (k = 1; k <= c.n; k++) keep[k] = c.size[k] >= minA ? 1 : 0;
  var o = new Uint8Array(W * H), any = 0;
  for (i = 0; i < W * H; i++) if (keep[c.id[i]] && c.id[i]) { o[i] = 1; any++; }
  if (!any) return null;
  // 補洞：從邊邊走不到的背景＝洞
  var seen = new Uint8Array(W * H), st = [];
  for (x = 0; x < W; x++) { st.push(x); st.push((H - 1) * W + x); }
  for (y = 0; y < H; y++) { st.push(y * W); st.push(y * W + W - 1); }
  while (st.length) {
    var p = st.pop(); if (seen[p] || o[p]) continue; seen[p] = 1; x = p % W; y = (p / W) | 0;
    if (x > 0) st.push(p - 1); if (x < W - 1) st.push(p + 1); if (y > 0) st.push(p - W); if (y < H - 1) st.push(p + W);
  }
  for (i = 0; i < W * H; i++) if (!o[i] && !seen[i]) o[i] = 1;
  var nk = 0; for (k = 1; k <= c.n; k++) if (keep[k]) nk++;
  return { m: o, n: nk };
}

/* ── 描外框：沿著物品和背景之間的格線走一圈（物品永遠在右手邊），再簡化成多邊形 ── */
function shRings(m, W, H) {
  var VW = W + 1, NV = VW * (H + 1), e1 = new Int32Array(NV).fill(-1), e2 = new Int32Array(NV).fill(-1), x, y, out = [];
  var add = function (a, b) { if (e1[a] < 0) e1[a] = b; else e2[a] = b; };
  var f = function (xx, yy) { return xx >= 0 && yy >= 0 && xx < W && yy < H && m[yy * W + xx] === 1; };
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (f(x, y)) {
    if (!f(x, y - 1)) add(y * VW + x, y * VW + x + 1);
    if (!f(x + 1, y)) add(y * VW + x + 1, (y + 1) * VW + x + 1);
    if (!f(x, y + 1)) add((y + 1) * VW + x + 1, (y + 1) * VW + x);
    if (!f(x - 1, y)) add((y + 1) * VW + x, y * VW + x);
  }
  for (var v0 = 0; v0 < NV; v0++) {
    while (e1[v0] >= 0) {
      var ring = [], v = v0, prev = -1, guard = 0;
      do {
        var nx;
        if (e2[v] >= 0) {   // 兩條路（斜對角碰在一起的地方）：往右轉（緊貼著同一塊）
          nx = e1[v];
          if (prev >= 0) {
            var dx = v % VW - prev % VW, dy = ((v / VW) | 0) - ((prev / VW) | 0), rx = -dy, ry = dx;
            if (e2[v] % VW - v % VW === rx && ((e2[v] / VW) | 0) - ((v / VW) | 0) === ry) nx = e2[v];
          }
          if (nx === e1[v]) { e1[v] = e2[v]; e2[v] = -1; } else e2[v] = -1;
        } else { nx = e1[v]; e1[v] = -1; }
        ring.push(v % VW, (v / VW) | 0);
        prev = v; v = nx;
      } while (v !== v0 && v >= 0 && ++guard < 4e5);
      if (ring.length >= 8) out.push(ring);
    }
  }
  return out;
}
function shArea(r) { var s = 0, n = r.length / 2; for (var i = 0; i < n; i++) { var j = (i + 1) % n; s += r[i * 2] * r[j * 2 + 1] - r[j * 2] * r[i * 2 + 1]; } return Math.abs(s) / 2; }
function shSimplify(r, eps) {   // 封閉多邊形的 Douglas–Peucker
  var n = r.length / 2; if (n <= 4) return r.slice();
  var far = 0, fd = -1, i;
  for (i = 1; i < n; i++) { var dx = r[i * 2] - r[0], dy = r[i * 2 + 1] - r[1], d = dx * dx + dy * dy; if (d > fd) { fd = d; far = i; } }
  var keep = new Uint8Array(n); keep[0] = keep[far] = 1;
  var dp = function (a, b) {   // a→b（繞一圈的索引）
    var len = (b - a + n) % n; if (len < 2) return;
    var ax = r[a * 2], ay = r[a * 2 + 1], bx = r[b * 2], by = r[b * 2 + 1], vx = bx - ax, vy = by - ay, L = Math.sqrt(vx * vx + vy * vy) || 1, md = -1, mi = -1;
    for (var t = 1; t < len; t++) { var k = (a + t) % n, d = Math.abs((r[k * 2] - ax) * vy - (r[k * 2 + 1] - ay) * vx) / L; if (d > md) { md = d; mi = k; } }
    if (md > eps) { keep[mi] = 1; dp(a, mi); dp(mi, b); }
  };
  dp(0, far); dp(far, 0);
  var o = []; for (i = 0; i < n; i++) if (keep[i]) o.push(r[i * 2], r[i * 2 + 1]);
  return o;
}
function shPoly(rings, minArea) {   // 簡化到每圈最多 SH_PTS 個點；太小的圈不要；最多 SH_RINGS 圈（大的優先）
  return rings.map(function (r) { return { r: r, a: shArea(r) }; }).filter(function (o) { return o.a >= minArea; }).sort(function (p, q) { return q.a - p.a; }).slice(0, SH_RINGS).map(function (o) {
    var eps = 0.75, s = shSimplify(o.r, eps);
    while (s.length / 2 > SH_PTS && eps < 50) { eps *= 1.4; s = shSimplify(o.r, eps); }
    return s;
  });
}

/* ── 整個流程（不碰畫面）：rgba＝工作區的像素（W×H），box＝框在工作區的位置，pk＝點選的地方，map＝工作區→整張圖 % 的換算 ── */
function shSeg(rgba, W, H, box, pk, map) {
  var area = Math.max(1, (box[2] - box[0]) * (box[3] - box[1])), fgOf = function (mm) { var n = 0; if (mm) for (var i = 0; i < mm.length; i++) n += mm[i]; return n / area; };
  var m = shGrabCut(rgba, W, H, box[0], box[1], box[2], box[3], pk, SH_GAMMA);
  if (m && fgOf(m) < 0.03) m = shGrabCut(rgba, W, H, box[0], box[1], box[2], box[3], pk, SH_GAMMA / 2);   // 整個變背景：放鬆一點再試
  var c = shClean(m, W, H, box[0], box[1], box[2], box[3], pk);
  if (!c) return { r: [], n: 0 };
  var rings = shPoly(shRings(c.m, W, H), Math.max(6, (box[2] - box[0]) * (box[3] - box[1]) * 0.01));
  var r = rings.map(function (ring) {
    var o = [];
    for (var i = 0; i < ring.length; i += 2) o.push(Math.round(Math.max(0, Math.min(100, map.x(ring[i]))) * 10) / 10, Math.round(Math.max(0, Math.min(100, map.y(ring[i + 1]))) * 10) / 10);
    return o;
  }).filter(function (o) { return o.length >= 6; });
  return { r: r, n: c.n };
}
// 在瀏覽器裡：img＝目錄圖（已經載好的 Image），s＝地點（x、y、w、h 是 %；pick 是 [x%, y%]）→ { r: [[x,y,x,y,…],…]（整張圖的 %）, n: 找到幾樣 }
function shFind(img, s) {
  var IW = img.naturalWidth || img.width, IH = img.naturalHeight || img.height;
  var bx0 = s.x / 100 * IW, by0 = s.y / 100 * IH, bx1 = (s.x + s.w) / 100 * IW, by1 = (s.y + s.h) / 100 * IH;
  var mx = Math.max(8, (bx1 - bx0) * 0.25), my = Math.max(8, (by1 - by0) * 0.25);   // 框外面一圈：當背景的樣本
  var rx0 = Math.max(0, Math.floor(bx0 - mx)), ry0 = Math.max(0, Math.floor(by0 - my)), rx1 = Math.min(IW, Math.ceil(bx1 + mx)), ry1 = Math.min(IH, Math.ceil(by1 + my));
  var sc = Math.min(1, SH_SIDE / Math.max(rx1 - rx0, ry1 - ry0)), W = Math.max(8, Math.round((rx1 - rx0) * sc)), H = Math.max(8, Math.round((ry1 - ry0) * sc));
  var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  var g = cv.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, rx0, ry0, rx1 - rx0, ry1 - ry0, 0, 0, W, H);
  var px = g.getImageData(0, 0, W, H).data;
  var kx = W / (rx1 - rx0), ky = H / (ry1 - ry0);
  var box = [Math.max(0, Math.round((bx0 - rx0) * kx)), Math.max(0, Math.round((by0 - ry0) * ky)), Math.min(W, Math.round((bx1 - rx0) * kx)), Math.min(H, Math.round((by1 - ry0) * ky))];
  var pk = Array.isArray(s.pick) ? [(s.pick[0] / 100 * IW - rx0) * kx, (s.pick[1] / 100 * IH - ry0) * ky] : null;
  return shSeg(px, W, H, box, pk, { x: function (v) { return (rx0 + v / kx) / IW * 100; }, y: function (v) { return (ry0 + v / ky) / IH * 100; } });
}

/* ════════ edit.js ════════ */
/* ═══════════════ edit.js：編輯（開發者）：最上面一排工具列、左邊章節／目錄圖、中間表單、預覽（浮動視窗）═══════════════
 * 圖片：放進來就在瀏覽器縮好、馬上上傳（檔名換成亂碼、原檔名不留）；上傳完才算放好。
 * 儲存：整本存回去；在你編輯的時候別人（或 LINE 裡）改過，會先問你要不要蓋掉。 */
var ED = null;
var PV = { open: (typeof innerWidth === "undefined" || innerWidth > 900), x: null, y: null, w: 420, h: 680, max: false };   // 窄螢幕（手機、小視窗）一開始先關著，會把編輯區蓋住   // 預覽視窗的狀態（開／關、位置、大小、是否放到最大）
function edFirst(chs, tts) {   // 一開始選哪一個：第一個標題；沒有標題就第一章；連章都沒有就目錄圖
  chs = chs || ED.chapters; tts = tts || ED.titles;
  for (var i = 0; i < chs.length; i++) { var ts = tts[chs[i].id] || []; if (ts.length) return { kind: "title", id: ts[0].id }; }
  return chs.length ? { kind: "ch", id: chs[0].id } : { kind: "map", id: "" };
}
function edReset(src) {   // src：從哪一本開始（沒給＝現在的手冊 HB；第 28 批：載入舊版本時給舊的那一本）
  src = src || HB;
  var cat = clone(src.cat || {}); if (!Array.isArray(cat.spots)) cat.spots = []; if (!Array.isArray(cat.parts)) cat.parts = [];
  var titles = clone(src.titles || {}), chs = clone(src.chapters || []);
  chs.forEach(function (c) { if (!titles[c.id]) titles[c.id] = []; });
  var cur = edFirst(chs, titles);
  ED = { chapters: chs, titles: titles, kws: clone(src.kws || []), cat: cat, rev: HB.rev, base: HB, catLocal: null, mapUi: null, lastCh: null, cfg: { chSize: (chs[0] && chs[0].size) || "kilo", chWeb: 200 }, cur: cur, mode: cur.kind === "map" ? "map" : "ch", view: "line", dirty: false, saving: false, ab: null, warners: [], restore: null, savedAt: 0, saveMs: 0, auto: false };
  AS.first = 0; if (AS.pause !== "conflict") AS.pause = "";
}
function edHb() { return { chapters: ED.chapters, titles: ED.titles, kws: ED.kws, cat: ED.cat }; }
function edCh(id) { return ED.chapters.filter(function (c) { return c.id === id; })[0]; }
function edTitle(id) { for (var k in ED.titles) { var r = ED.titles[k].filter(function (t) { return t.id === id; })[0]; if (r) return r; } return null; }
function edCounts() { var o = {}; ED.chapters.forEach(function (c) { o[c.id] = (ED.titles[c.id] || []).length; }); return o; }
function renumber() { ED.chapters.forEach(function (c, i) { c.no = String(i + 1); }); }
function markDirty() { ED.dirty = true; dirtyPaint(); asKick(); }
function hhmm(t) { var d = new Date(t); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
function dirtyPaint() {
  var d = $("#edDirty"); if (!d || !ED) return;
  var idle = !ED.dirty && !ED.saving && !UPL && !ED.bgMsg, nb = idle ? edBgNeed() : 0, ns = idle ? edShapeNeed() : 0, no = idle ? edOcrTodo().length : 0;
  var todo = [nb ? nb + " 章的背景" : "", ns ? ns + " 個物品的形狀" : ""].filter(Boolean).join("、"), txt = "", cls = "";
  if (ED.bgMsg) txt = ED.bgMsg;
  else if (ED.saving) txt = ED.auto ? "自動儲存中…" : "儲存中…";
  else if (UPL) txt = "⏳ 圖片上傳中（" + UPL + "）…";
  else if (ED.restore) { txt = "🕘 正在看「" + ED.restore + "」的舊版本：按「儲存」換成這一版；不要的話按「放棄修改」"; cls = "warn"; }
  else if (ED.dirty) {
    if (AS.pause === "conflict") { txt = "⏸ 自動存檔暫停：手冊剛剛被改過（按「儲存」處理）"; cls = "warn"; }
    else if (AS.pause === "img") { txt = "⏸ 自動存檔暫停：有圖片沒放好（按「儲存」）"; cls = "warn"; }
    else if (AS.fail) txt = "● 有修改還沒存進去（等一下自動再試）";
    else txt = AS.on ? "● 有修改：停手 3 秒就自動儲存" : "● 有還沒儲存的修改";
    if (ED_OCR_RUN && !cls) txt += "（背景辨識圖片裡的字中…）";
  } else if (todo) txt = "● 有 " + todo + "還沒做：按「儲存」就會做好";
  else if (ED_OCR_OFF && no) { txt = "⚠ 圖片裡的字還不能辨識：網頁專案要加「Drive API」服務（加好按「儲存」）"; cls = "warn"; }
  else if (ED_OCR_RUN || (no && !ED_OCR_OFF)) txt = "🔍 背景辨識圖片裡的字（還有 " + Math.max(no, ED_OCR_RUN) + " 張）…";
  else if (ED.savedAt) txt = "✅ 已" + (ED.auto ? "自動" : "") + "儲存（" + hhmm(ED.savedAt) + "，花了 " + (ED.saveMs / 1000).toFixed(1) + " 秒）";
  d.textContent = txt; d.className = "dirty" + (cls ? " " + cls : "");
  var sb = $("#edSave"); if (sb) sb.disabled = !!(ED.saving || UPL);
}
function changed() { markDirty(); refreshPreview(); ED.warners.forEach(function (fn) { fn(); }); }

function no6(n) { return h("span", { class: "no6" }, [n + "、"]); }
function lbl(n, text, extra) { return h("div", { class: "lbl" }, [n ? no6(n) : null, text, extra ? h("span", { html: " " + extra }) : null]); }
function hint(text) { return h("div", { class: "hint" }, [text]); }
function sizeSeg(cur, onPick) {
  var seg = h("div", { class: "seg" });
  YZ_SIZES.forEach(function (s, i) {
    var b = h("button", { class: s === cur ? "on" : "", title: s + (i === 0 ? "（LINE 規定的最小）" : i === YZ_SIZES.length - 1 ? "（LINE 規定的最大）" : "") }, [s]);
    b.onclick = function () { $$("button", seg).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); onPick(s); };
    seg.appendChild(b);
  });
  return seg;
}
function rangeRow(min, max, val, unit, onInput) {
  var out = h("b", {}, [val + " " + unit]);
  var r = h("input", { type: "range", min: String(min), max: String(max), step: "10", value: String(val), style: "flex:1;min-width:140px" });
  r.oninput = function () { out.textContent = r.value + " " + unit; onInput(parseInt(r.value, 10)); };
  return h("div", { class: "rrow" }, [h("span", { class: "muted" }, ["最小 " + min]), r, h("span", { class: "muted" }, ["最大 " + max]), out]);
}
function confirmBtn(label, fn, cls) {
  var b = btn(label, function () {
    if (b.dataset.arm) { fn(); return; }
    b.dataset.arm = "1"; b.textContent = "再按一次確認"; b.classList.add("bad");
    setTimeout(function () { if (!b.isConnected) return; delete b.dataset.arm; b.textContent = label; b.classList.remove("bad"); }, 3000);
  }, cls || "sm");
  return b;
}

/* 圖片：縮到最長邊 1600、轉成 JPEG（LINE 一張圖不能超過 1 MB）；檔名改成亂碼，原檔名不保存 */
function shrinkImage(blob, cb, max, png) {   // png＝留透明背景、存成 PNG（第 28 批：大標題旁的符號）
  var fr = new FileReader();
  fr.onload = function () {
    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth || 1, hh = img.naturalHeight || 1, M = max || 1600, s = Math.min(1, M / Math.max(w, hh));
      var cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(w * s)); cv.height = Math.max(1, Math.round(hh * s));
      var g = cv.getContext("2d"); if (!png) { g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); } g.drawImage(img, 0, 0, cv.width, cv.height);
      var uri = png ? cv.toDataURL("image/png") : cv.toDataURL("image/jpeg", 0.85);
      cb(uri, { w: cv.width, h: cv.height, ow: w, oh: hh, bytes: Math.round((uri.length - (png ? 22 : 23)) * 0.75), obytes: blob.size || 0 });
    };
    img.onerror = function () { cb(null, { error: "這個檔案打不開，請換一張圖" }); };
    img.src = fr.result;
  };
  fr.onerror = function () { cb(null, { error: "讀不到這個檔案" }); };
  fr.readAsDataURL(blob);
}
// 放圖的框：拖進來／選檔案／Ctrl+V 貼上 → 在瀏覽器縮好 → 上傳（o.kind 是上傳的種類）→ o.set(上傳結果 {url, raw, fid, fname}, 圖的資訊)
// o.upload(uri, info) 有給就用它自己上傳（動畫、目錄圖要傳好幾張）；回傳 Promise
function dropZone(o) {
  var el = h("div", { class: "drop", tabindex: "0" }), busy = false;
  var file = h("input", { type: "file", accept: o.accept || "image/*", style: "display:none" });
  function paint() {
    el.innerHTML = "";
    var cur = o.get();
    if (busy) el.appendChild(h("div", { class: "upl" }, ["⏳ 上傳中…（檔名會換成亂碼）"]));
    else if (cur) {
      el.appendChild(h("img", { src: o.shown ? o.shown() : cur, alt: "" }));
      var inf = o.info && o.info();
      el.appendChild(h("div", { class: "fn" }, [o.fnText ? o.fnText() : (inf && inf.w ? inf.w + "×" + inf.h + "，約 " + Math.round((inf.bytes || 0) / 1000) + " KB　" : "") + "存檔名稱（亂碼）：" + (o.fname && o.fname() || "—") + "　原檔名不保存"]));
    } else el.appendChild(h("div", {}, [o.empty || "把圖拖進來　／　點這裡之後按 Ctrl+V 貼上"]));
    el.appendChild(h("div", { style: "margin-top:6px;display:flex;gap:6px;justify-content:center" }, [
      btn(cur ? "換一個…" : "選擇檔案…", function (e) { e.stopPropagation(); if (!busy) file.click(); }),
      cur && o.clear && !busy ? btn("移除", function (e) { e.stopPropagation(); o.clear(); paint(); }) : null
    ]));
    el.appendChild(file);
  }
  function take(blob) {
    if (busy) { toast("上一張還在上傳，等一下"); return; }
    if (!blob || !(o.ok ? o.ok(blob) : /^image\/(jpeg|png|gif|webp|bmp)$/.test(blob.type || ""))) { toast(o.bad || "這不是圖片檔（JPEG、PNG、GIF、WebP）"); return; }
    var reader = o.reader || function (bl, cb) { shrinkImage(bl, cb, o.max || 1600); };
    reader(blob, function (uri, info) {
      if (!uri) { toast(info && info.error || "讀不到這個檔案"); return; }
      busy = true; paint();
      var job = o.upload ? o.upload(uri, info) : uploadUri(uri, o.kind || "圖片").then(function (r) { o.set(r, info); });
      job.then(function () { busy = false; paint(); toast(o.done || "圖片放好了（已縮小、檔名換成亂碼）"); },
        function (e) {   // 沒放進去：用小視窗講清楚（只跳一下的提示容易漏看）
          busy = false; paint();
          modal({ title: "❌ 這張圖沒有放進去", lines: [(e && e.message) || "上傳失敗", "請再放一次。一直失敗的話：截圖給開發者，或在 LINE 打「手冊圖片檢查」。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
        });
    });
  }
  file.onchange = function () { if (file.files[0]) take(file.files[0]); file.value = ""; };
  el.addEventListener("dragover", function (e) { e.preventDefault(); el.classList.add("hot"); });
  el.addEventListener("dragleave", function () { el.classList.remove("hot"); });
  el.addEventListener("drop", function (e) { e.preventDefault(); el.classList.remove("hot"); var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) take(f); });
  el.addEventListener("focus", function () { el.classList.add("hot"); });
  el.addEventListener("blur", function () { el.classList.remove("hot"); });
  el.addEventListener("paste", function (e) {
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].type.indexOf("image/") === 0) { e.preventDefault(); take(items[i].getAsFile()); return; }
    toast("剪貼簿裡沒有圖片");
  });
  paint();
  return { el: el, take: take, paint: paint };
}
// 上傳一張（data: 網址）→ {url, raw, fid, fname}。一次最多約 6 MB（Apps Script 一次收得下的大小）
var UPL = 0, UP_MAX_B64 = 8.4e6;
function uploadUri(uri, kind) {
  var m = /^data:([^;,]+);base64,(.*)$/.exec(uri || "");
  if (!m) return Promise.reject(new Error("圖片壞掉了"));
  if (m[2].length > UP_MAX_B64) return Promise.reject(new Error("檔案太大（上限約 6 MB）"));
  UPL++; dirtyPaint();
  return call("hbImg", [m[2], m[1], kind]).then(function (r) {
    UPL--; dirtyPaint();
    if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了"); }
    if (!r || !r.ok || !r.url) throw new Error(r && r.err || "上傳失敗");
    if (r.warn) modal({ title: "⚠ 圖片放好了，但是……", lines: [r.warn, "在 LINE 打「手冊圖片檢查」可以再檢查一次、自動修好。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
    return r;
  }, function (e) { UPL--; dirtyPaint(); throw e; });
}

/* ───────── 章元背景（第 25 批）：目錄圖（圖一）上這一章的位置，裁成 20:13 的圖 ─────────
   按「儲存」時：還沒做過、或目錄圖換了、或那一章的框移動了 → 在瀏覽器裁好、上傳（檔名亂碼、放手冊資料夾）。
   網頁的章、標題頁的背景，和 LINE 章、標題卡片最上面那張圖，都用這一張。開發者自己放的「章元圖」優先（不會被蓋掉）。 */
var BG_VER = "b2", BG_W = 1024, BG_H = 666;   // 20:13（跟 LINE 章元卡片上的圖一樣比例）
function bgSpotOf(cat, cid) {   // 目錄圖上連到這一章的地點（好幾個拿最大的）；沒有的話，拿連到這一章某個標題的
  var best = null, alt = null, ts = (ED.titles[cid] || []).map(function (t) { return "t:" + t.id; });
  _yzMapSpots_(cat).forEach(function (sp) {
    if (sp.to === "c:" + cid) { if (!best || sp.w * sp.h > best.w * best.h) best = sp; }
    else if (!alt && ts.indexOf(sp.to) >= 0) alt = sp;
  });
  return best || alt;
}
function bgKey(cat, sp) { return BG_VER + "|" + cat.fid + "|" + [sp.x, sp.y, sp.w, sp.h].map(function (v) { return Math.round(v * 10); }).join(","); }
function edBgNeed() {   // 有幾章的背景要（重）做（只算，不改東西）
  var cat = ED && ED.cat, n = 0;
  if (!cat || !cat.img || !cat.fid) return 0;
  ED.chapters.forEach(function (c) { var sp = bgSpotOf(cat, c.id); if (sp && (!c.bg || c.bg.k !== bgKey(cat, sp))) n++; });
  return n;
}
function edBgTodo() {   // 要（重）做背景的章：[{ c, sp, k }]。目錄圖上已經沒有這一章的地點：背景拿掉
  var cat = ED.cat, out = [];
  if (!cat || !cat.img || !cat.fid) return out;
  ED.chapters.forEach(function (c) {
    var sp = bgSpotOf(cat, c.id);
    if (!sp) { if (c.bg) { c.bg = null; markDirty(); } return; }
    var k = bgKey(cat, sp);
    if (!c.bg || c.bg.k !== k) out.push({ c: c, sp: sp, k: k });
  });
  return out;
}
function bgRect(W, H, sp) {   // 裁哪一塊（像素）：框的中心當中心、寬是框的 2.2 倍（最少整張的 24%）、20:13、不超出圖
  var ar = BG_W / BG_H, cx = (sp.x + sp.w / 2) / 100 * W, cy = (sp.y + sp.h / 2) / 100 * H;
  var w = Math.max(W * 0.24, Math.min(W, sp.w / 100 * W * 2.2)), hh = w / ar;
  if (hh > H) { hh = H; w = hh * ar; }
  if (w > W) { w = W; hh = w / ar; }
  return { x: Math.max(0, Math.min(W - w, cx - w / 2)), y: Math.max(0, Math.min(H - hh, cy - hh / 2)), w: w, h: hh };
}
function catSrcP() {   // 目錄圖的原始檔（瀏覽器裡的 data:／blob: 網址才畫得進畫布、讀得出像素）
  return new Promise(function (ok, bad) {
    var cat = ED.cat;
    if (ED.catLocal && ED.catLocal.fid === cat.fid) { ok(ED.catLocal.url); return; }
    if (!(HB && HB.cat && cat.fid && cat.fid === HB.cat.fid)) { bad(new Error("拿不到目錄圖")); return; }
    var u = catBlob(HB.cat, function () { var v = catBlob(HB.cat); if (v) ok(v); else bad(new Error("拿不到目錄圖")); });
    if (u) ok(u); else if (u === null) bad(new Error("拿不到目錄圖"));
  });
}
function loadImg(src) { return new Promise(function (ok, bad) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { bad(new Error("目錄圖打不開")); }; im.src = src; }); }
function bgCut(img, sp) {
  var W = img.naturalWidth || 1, H = img.naturalHeight || 1, r = bgRect(W, H, sp), cv = document.createElement("canvas");
  cv.width = BG_W; cv.height = BG_H;
  var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, BG_W, BG_H);
  g.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, BG_W, BG_H);
  return cv.toDataURL("image/jpeg", 0.84);
}
function edBgMake(onStep) {   // Promise：做了幾張
  var todo = edBgTodo();
  if (!todo.length) return Promise.resolve(0);
  return catSrcP().then(loadImg).then(function (img) {
    var i = 0;
    var next = function () {
      if (i >= todo.length) return todo.length;
      var it = todo[i++]; if (onStep) onStep(i, todo.length);
      return uploadUri(bgCut(img, it.sp), "章元背景").then(function (r) { it.c.bg = { img: r.url, fid: r.fid, k: it.k }; markDirty(); return next(); });
    };
    return next();
  });
}
function edChI(c) { var ico = _yzChIcons_(edHb())[c.id]; return ico ? Object.assign({}, c, { ico: ico }) : c; }   // 預覽用：章＋目錄圖上的圖示

/* ───────── 物品的形狀（第 26 批）：在框裡自動找物品的輪廓（shape.js），網頁滑到時只亮物品本身 ─────────
   選到一個地點、移動框、點選要亮的物品時：只算那一個（看得到綠色外框）；按「儲存」時：還沒算的都算好。算過的記著（同一張圖、同一個框不重算）。 */
var SHC = {}, ED_IMG = null;
function edShapeNeed() { var cat = ED && ED.cat; if (!cat || !cat.img || !cat.fid) return 0; return cat.spots.filter(function (s) { return shNeed(cat, s); }).length; }
function edCatImg() {   // 目錄圖（載好的 Image）：同一張圖只載一次
  var fid = ED.cat.fid;
  if (ED_IMG && ED_IMG.fid === fid) return ED_IMG.p;
  var p = catSrcP().then(loadImg);
  ED_IMG = { fid: fid, p: p };
  p.catch(function () { if (ED_IMG && ED_IMG.p === p) ED_IMG = null; });
  return p;
}
function edShapeOne(img, s) {   // 算一個（算過的就拿出來）→ 寫進這個地點。第 27 批：圖一 → 用物品圖庫（整個物品）；別張圖 → 在框裡找
  var cat = ED.cat, k = shKey(cat, s), r = SHC[k];
  if (!r) { try { r = shLibFind(img, s) || shFind(img, s); } catch (e) { r = { r: [], n: 0 }; } SHC[k] = r; }
  s.shape = { k: k, b: shBox(s), r: r.r };
  if (r.nm) s.shape.nm = r.nm;   // 圖庫裡的物品名字（編輯器顯示「自動找到：法規書（整本）」用）
  return r;
}
function edShapeMake(onStep) {   // 按「儲存」：要（重）算的都算好。Promise：算了幾個
  var cat = ED.cat, todo = cat.spots.filter(function (s) { return shNeed(cat, s); });
  if (!todo.length) return Promise.resolve(0);
  return edCatImg().then(function (img) {
    return new Promise(function (ok) {
      var i = 0;
      var next = function () {
        if (i >= todo.length) { ok(todo.length); return; }
        var s = todo[i++]; if (onStep) onStep(i, todo.length);
        edShapeOne(img, s); markDirty();
        setTimeout(next, 0);   // 讓畫面有機會更新進度
      };
      next();
    });
  });
}

/* ───────── 圖片裡的字（第 27 批：照片裡的字也搜得到，例如時間表裡的「正班33分」）─────────
   用 Google 雲端硬碟內建的文字辨識（後端 hbOcr）。辨識出來的字只存成「搜尋用」（LINE 卡片、網頁上都不會顯示）。換了圖就重新辨識。
   第 28 批：不再卡在「儲存」裡（存檔快很多）——打開編輯器、放了新的圖，就在背景一張一張辨識（同時 2 張）；辨識好了算「有修改」，自動存檔會存。
   每張圖下面直接寫狀態（已辨識／辨識中／還沒辨識／辨識不了＋原因），可以按「重新辨識」。 */
var ED_OCR = {}, ED_OCR_BAD = {}, ED_OCR_OFF = "", ED_OCR_TOLD = false, ED_OCR_RUN = 0, ED_OCR_PAR = 2, ED_OCR_ELS = [];
// ED_OCR：fid → Promise（辨識中）；ED_OCR_BAD：fid → 辨識不了的原因（重新整理網頁、或按「重新辨識」再試）；ED_OCR_OFF：辨識功能還沒開（按「儲存」、「重新辨識」再試）
function edPics() {   // 要辨識的圖：圖片、階梯裡的圖、分步動畫的每一格、文字裡的圖（已經上傳好的）
  var out = [];
  if (!ED) return out;
  ED.chapters.forEach(function (c) { (ED.titles[c.id] || []).forEach(function (t) { out = out.concat(_yzTitlePics_(t)); }); });
  return out.filter(function (p) { return p.fid && p.url && String(p.url).indexOf("data:") !== 0; });
}
function edOcrTodo() {   // 還沒辨識的圖（同一張圖只算一次；辨識不了的不算）：[fid]
  var seen = {}, out = [];
  edPics().forEach(function (p) { if (typeof p.ocr !== "string" && !ED_OCR_BAD[p.fid] && !seen[p.fid]) { seen[p.fid] = 1; out.push(p.fid); } });
  return out;
}
function edOcrAsk(fid) {   // Promise：這張圖裡的字（""＝沒有字）。同一張圖辨識中：等同一個。辨識好就寫進用到這張圖的每一個地方
  if (ED_OCR[fid]) return ED_OCR[fid];
  var p = call("hbOcr", [fid]).then(function (r) {
    if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了"); }
    if (!r || !r.ok) { var e = new Error(r && r.err || "辨識不了"); e.code = r && r.code; throw e; }
    return String(r.text || "");
  });
  ED_OCR[fid] = p;
  p.then(function (text) { delete ED_OCR[fid]; edPics().forEach(function (x) { if (x.fid === fid) x.ocr = text; }); }, function (e) {
    delete ED_OCR[fid];
    if (e && e.code === "noapi") ED_OCR_OFF = e.message; else ED_OCR_BAD[fid] = (e && e.message) || "辨識不了";
  });
  return p;
}
function edOcrPump() {   // 背景辨識：還沒辨識的圖，同時 2 張；辨識好一張就標「有修改」（自動存檔會存）
  if (!ED || ED_OCR_OFF) { ocrPaint(); dirtyPaint(); return; }
  var todo = edOcrTodo().filter(function (fid) { return !ED_OCR[fid]; });
  while (ED_OCR_RUN < ED_OCR_PAR && todo.length) {
    var fid = todo.shift();
    ED_OCR_RUN++;
    edOcrAsk(fid).then(function () { if (ED) markDirty(); }, function (e) { if (e && e.code === "noapi") edOcrOff(e.message); }).then(function () { ED_OCR_RUN--; ocrPaint(); dirtyPaint(); setTimeout(edOcrPump, 200); });
  }
  ocrPaint(); dirtyPaint();
}
function edOcrNew(p) {   // 剛放好（或換了）一張圖：舊的字拿掉，在背景辨識新的
  delete p.ocr;
  if (p.fid) delete ED_OCR_BAD[p.fid];
  setTimeout(edOcrPump, 0);
}
function edOcrRetry(p) {   // 「重新辨識」
  delete p.ocr; ED_OCR_OFF = "";
  if (p.fid) delete ED_OCR_BAD[p.fid];
  edPics().forEach(function (x) { if (x.fid === p.fid) delete x.ocr; });
  markDirty(); edOcrPump();
}
function edOcrOff(msg) {   // 辨識功能還沒開：第一次用小視窗講清楚，之後只寫在上面
  if (ED_OCR_TOLD) return;
  ED_OCR_TOLD = true;
  modal({ title: "⚠ 圖片裡的字還不能搜尋", lines: [msg + "（只要做一次）。", "加好以後，在編輯器按一次「儲存」（或圖下面的「重新辨識」），就會開始辨識每一張圖。其他的修改照樣儲存。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
}
function ocrStat(p) {   // 這張圖的「圖片裡的字」狀態：{ t: 文字, c: 樣式, retry: 能不能重新辨識 }
  if (!p || !p.url) return null;
  if (!p.fid || String(p.url).indexOf("data:") === 0) return { t: "🔍 圖片裡的字：圖放好以後才會辨識", c: "" };
  if (typeof p.ocr === "string") return p.ocr ? { t: "🔍 圖片裡的字（搜尋找得到）：" + p.ocr.replace(/\s+/g, " ").slice(0, 60) + (p.ocr.length > 60 ? "…" : ""), c: "ok", retry: true } : { t: "🔍 圖片裡的字：辨識過了，這張圖沒有字", c: "", retry: true };
  if (ED_OCR[p.fid]) return { t: "🔍 圖片裡的字：辨識中…", c: "" };
  if (ED_OCR_BAD[p.fid]) return { t: "⚠ 圖片裡的字：辨識不了（" + ED_OCR_BAD[p.fid] + "）", c: "warn", retry: true };
  if (ED_OCR_OFF) return { t: "⚠ 圖片裡的字：還不能辨識（網頁專案要加「Drive API」服務）", c: "warn", retry: true };
  return { t: "🔍 圖片裡的字：還沒辨識（馬上會在背景做）", c: "" };
}
function ocrLine(p) {   // 每張圖下面那一行（辨識好了會自己更新）
  var el = h("div", { class: "ocrst" });
  el._p = p; ED_OCR_ELS.push(el); ocrPaint1(el);
  return el;
}
function ocrPaint1(el) {
  var st = ocrStat(el._p); el.innerHTML = "";
  if (!st) { el.hidden = true; return; }
  el.hidden = false; el.className = "ocrst" + (st.c ? " " + st.c : "");
  el.appendChild(h("span", {}, [st.t]));
  if (st.retry) el.appendChild(h("button", { class: "btn sm ocrre", type: "button", onclick: function (e) { e.preventDefault(); e.stopPropagation(); edOcrRetry(el._p); } }, ["重新辨識"]));
}
function ocrPaint() { ED_OCR_ELS = ED_OCR_ELS.filter(function (el) { return el.isConnected; }); ED_OCR_ELS.forEach(ocrPaint1); }

/* ───────── 自動存檔（第 28 批：有修改就自動存，12 秒內存好）─────────
   停手 3 秒就存；一直在改的話，最晚第一個修改後 8 秒也會存（存一次大約 2～5 秒）。最上面的「自動存檔」可以關掉（記在這台電腦）。
   不會自動存的時候：圖片還在上傳、有圖片沒放好、存不進去（手冊剛被別人改過）、正在看舊版本、連不上（等一下自動再試）。
   自動存檔存好以後不重畫編輯器（不打斷正在打字的人）。 */
var AS = { on: true, t: null, first: 0, pause: "", fail: 0 }, AS_IDLE = 3000, AS_MAX = 8000;
function asInit() { try { AS.on = localStorage.getItem("yz_autosave") !== "0"; } catch (e) { AS.on = true; } AS.pause = ""; AS.first = 0; AS.fail = 0; clearTimeout(AS.t); AS.t = null; }
function asSet(on) {
  AS.on = !!on;
  try { localStorage.setItem("yz_autosave", on ? "1" : "0"); } catch (e) { /* 記不住就算了 */ }
  if (on) asKick(); else { clearTimeout(AS.t); AS.t = null; }
  dirtyPaint();
}
function asKick() {   // 有修改了：排一次自動存檔
  if (!ED || !AS.on || AS.pause || !ED.dirty) return;
  var now = Date.now(); if (!AS.first) AS.first = now;
  clearTimeout(AS.t); AS.t = setTimeout(asRun, Math.max(200, Math.min(AS_IDLE, AS.first + AS_MAX - now)));
}
function asRun() {
  AS.t = null;
  if (!ED || !AS.on || AS.pause || !ED.dirty) return;
  if (ED.saving || UPL || ED.bgMsg) { AS.t = setTimeout(asRun, 1200); return; }   // 上一次還在存、圖片還在上傳：等一下再看
  if (edLocalImgs()) { AS.pause = "img"; dirtyPaint(); return; }                    // 有圖片沒放好：不自動存（按「儲存」會問你）
  saveEd(false, true);
}
function asFail(msg, auto) {   // 沒存進去：自動存的話，等一下自動再試（5、10、15… 秒，最多 1 分鐘）
  AS.fail++; dirtyPaint();
  if (!auto || AS.fail === 1) toast("❌ 沒有存進去：" + msg + (auto ? "（等一下會自動再試）" : ""));
  if (AS.on && ED && ED.dirty) { clearTimeout(AS.t); AS.t = setTimeout(asRun, Math.min(60000, 5000 * AS.fail)); }
}

/* ───────── 🕘 舊版本（第 28 批：自動存檔很快，改錯的也很快存進去 → 每 10 分鐘留一份，最多 50 份）─────────
   列出來 → 選一份「載入」→ 編輯器換成那一份（還沒存；看一看）→ 按「儲存」才換成那一份（換之前會先留一份現在的），不要就按「放棄修改」。 */
function verOpen() {
  if (!ED) return;
  if (ED.saving || UPL) { toast("等存好（圖片上傳好）再看舊版本"); return; }
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true" }), close = function () { bx.remove(); };
  var list = h("div", { class: "verlist" }, [h("div", { class: "muted" }, ["讀取中…"])]);
  var dlg = h("div", { class: "dlg verdlg" }, [h("h3", {}, ["🕘 舊版本"]), h("div", { class: "dlg-p" }, [h("p", {}, ["每 10 分鐘留一份「存之前的樣子」，最多 50 份（放在手冊資料夾裡的「舊版本」，檔名亂碼）。選一份「載入」：編輯器先換成那一份讓你看，按「儲存」才算數。"])]), list,
    h("div", { class: "dlg-b" }, [btn("關閉", close, "sm")])]);
  bx.appendChild(dlg); document.body.appendChild(bx);
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
  call("hbVer", ["list"]).then(function (r) {
    if (r && r.st === "lock") { close(); logout("expired"); return; }
    list.innerHTML = "";
    if (!r || !r.ok) { list.appendChild(h("div", { class: "muted" }, ["❌ " + (r && r.err || "拿不到舊版本")])); return; }
    if (!r.list.length) { list.appendChild(h("div", { class: "muted" }, ["還沒有舊版本（第一次存檔、或 10 分鐘後的存檔，才會留第一份）。"])); return; }
    r.list.forEach(function (v) {
      var label = v.at;
      list.appendChild(h("div", { class: "verrow" }, [
        h("div", { class: "vermeta" }, [h("b", {}, [v.at]), h("span", { class: "muted" }, ["　" + (v.who || "") + (v.why ? "（" + v.why + "）" : "") + "　" + v.kb + " KB"])]),
        btn("載入這一版", function () {
          if (ED.dirty && !confirmLoss()) return;
          call("hbVer", ["get", v.id]).then(function (g) {
            if (!g || !g.ok) { toast("❌ " + (g && g.err || "拿不到這一版")); return; }
            close(); edLoadVer(g.m, label);
          }, function (e) { toast("❌ " + e.message); });
        }, "sm")
      ]));
    });
  }, function (e) { list.innerHTML = ""; list.appendChild(h("div", { class: "muted" }, ["❌ " + e.message])); });
}
function confirmLoss() { toast("你有還沒存的修改：先按「儲存」或「放棄修改」，再載入舊版本"); return false; }
function edLoadVer(m, label) {   // 編輯器換成舊版本（還沒存）
  var cur = ED.cur, mode = ED.mode;
  edReset(m);
  ED.chapters.forEach(function (c) { if (c.bg) c.bg = null; });   // 章元背景：舊的那幾張可能已經丟到垃圾桶了 → 拿掉，儲存時重做
  ED.restore = label; ED.dirty = true; AS.pause = "restore"; clearTimeout(AS.t);
  edPick(cur, mode); renderEdit(); dirtyPaint();
  toast("已載入「" + label + "」的舊版本：按「儲存」才算數");
}

/* ───────── 📢 跑馬燈（第 25 批）：開關、內容（一行一段）、速度 ───────── */
function edMq() {   // 還沒設定過：照網頁現在的預設（藥戰手冊 →［這一頁］→ 內部資料，請勿外傳）
  if (!ED.cat.mq) ED.cat.mq = { on: true, items: mqDefault(), speed: "mid" };
  return ED.cat.mq;
}
function mqPreview(q) {   // 首頁、章的頁面各一條（跟網頁上一模一樣，會跑）
  var box = h("div", {});
  if (q.on === false) { box.appendChild(h("div", { class: "muted" }, ["（跑馬燈關掉了：網頁上下都不放）"])); return box; }
  var conf = { on: true, items: (q.items || []).length ? q.items : ["藥戰手冊", MQ_PAGE], speed: q.speed || "mid" };
  [["首頁", ED.cat.title || "藥師調劑台"], ["章的頁面（例：" + ((ED.chapters[0] || {}).name || "章名") + "）", (ED.chapters[0] || {}).name || "章名"]].forEach(function (x) {
    box.appendChild(h("div", { class: "mqpvl" }, [x[0]]));
    box.appendChild(marquee(mqWordsOf(conf, x[1]), "pv", conf.speed));
  });
  return box;
}
function renderMqForm(f) {
  var q = edMq();
  f.appendChild(h("h3", { style: "font-size:16px" }, ["📢 跑馬燈"]));
  f.appendChild(hint("網頁最上面那一條會跑的字（章、標題頁上下各一條）。手機開了「減少動態效果」的人，會停住不跑。LINE 沒有跑馬燈。改完會自動儲存（也可以按「儲存」）。"));
  var pv = h("div", { class: "mqpv" });
  var paint = function () { pv.innerHTML = ""; pv.appendChild(mqPreview(q)); };
  var on = h("input", { type: "checkbox", id: "mqOn" }); on.checked = q.on !== false;
  on.onchange = function () { q.on = on.checked; changed(); paint(); };
  f.appendChild(h("label", { class: "mck" }, [on, h("span", {}, [h("b", {}, ["顯示跑馬燈"]), h("span", { class: "muted mcn" }, ["　關掉：網頁上下都不放跑馬燈"])])]));
  f.appendChild(lbl("", "內容（一行一段，每段前面會自動加「→」；最多 8 段、每段 30 個字）"));
  var ta = h("textarea", { class: "ta", id: "mqText", style: "min-height:130px" }); ta.value = (q.items || []).join("\n");
  ta.oninput = function () { q.items = ta.value.split(/\r?\n/).map(function (x) { return x.trim().slice(0, 30).replace(/[\uD800-\uDBFF]$/, "").trim(); }).filter(Boolean).slice(0, 8); changed(); paint(); };
  f.appendChild(ta);
  f.appendChild(h("div", { class: "addrow" }, [
    btn("＋插入「" + MQ_PAGE + "」", function () {
      var a = ta.selectionStart || 0, b = ta.selectionEnd || 0, v = ta.value;
      ta.value = v.slice(0, a) + MQ_PAGE + v.slice(b); ta.focus(); ta.selectionStart = ta.selectionEnd = a + MQ_PAGE.length; ta.oninput();
    }),
    confirmBtn("還原成預設", function () { q.on = true; q.items = mqDefault(); q.speed = "mid"; changed(); renderForm(); })
  ]));
  f.appendChild(hint("「" + MQ_PAGE + "」會自動換成那一頁的名字：首頁＝" + (ED.cat.title || "藥師調劑台") + "、章和標題的頁面＝章名、搜尋頁＝搜尋。"));
  f.appendChild(lbl("", "速度"));
  var seg = h("div", { class: "seg", id: "mqSpeed" });
  [["slow", "慢"], ["mid", "一般"], ["fast", "快"]].forEach(function (x) {
    var b = h("button", { class: (q.speed || "mid") === x[0] ? "on" : "", type: "button", "data-v": x[0] }, [x[1]]);
    b.onclick = function () { q.speed = x[0]; $$("button", seg).forEach(function (y) { y.classList.toggle("on", y === b); }); changed(); paint(); };
    seg.appendChild(b);
  });
  f.appendChild(seg);
  f.appendChild(lbl("", "預覽（跟網頁上一樣）"));
  f.appendChild(pv); paint();
  renderSymForm(f);
}
/* ───────── 🔰 大標題旁的符號（第 28 批）：以前大標題兩邊是波浪符號（拿掉了）；可以放自己的符號（例如藥劑部的標誌），沒放就只有字 ───────── */
function renderSymForm(f) {
  f.appendChild(h("h3", { style: "font-size:16px;margin-top:26px" }, ["🔰 大標題旁的符號"]));
  f.appendChild(hint("網頁上章、標題頁的大標題左邊，可以放一個小符號（例如以後的藥劑部標誌）。沒放就只有標題的字。建議用正方形、去背的 PNG（透明的地方會照樣透明），會縮成約 64 px。LINE 沒有這個符號。"));
  var pv = h("div", { class: "sympv", "aria-hidden": "true" });
  var paintPv = function () {
    var s = ED.cat.sym;
    pv.innerHTML = "";
    if (s && s.url) pv.appendChild(h("img", { src: s.url, alt: "" }));
    pv.appendChild(h("b", {}, [(ED.chapters[0] || {}).name || "章名"]));
  };
  var dz = dropZone({
    kind: "符號", accept: "image/png,image/jpeg,image/webp,image/gif",
    reader: function (bl, cb) { shrinkImage(bl, cb, 256, true); },
    get: function () { return ED.cat.sym && ED.cat.sym.url; }, fname: function () { return ED.cat.sym && ED.cat.sym.fname; },
    info: function () { return ED.cat.sym && ED.cat.sym.info; },
    empty: "把符號的圖拖進來　／　點這裡之後按 Ctrl+V 貼上（可以不放）",
    done: "符號放好了（檔名換成亂碼）",
    set: function (r, info) { ED.cat.sym = { url: r.url, fid: r.fid, fname: r.fname, ar: _yzAR_(info.w, info.h), info: info }; changed(); paintPv(); },
    clear: function () { ED.cat.sym = null; changed(); paintPv(); }
  });
  f.appendChild(dz.el);
  f.appendChild(lbl("", "樣子（深色的大標題列）"));
  f.appendChild(pv); paintPv();
}

/* ───────── 最上面的工具列 ───────── */
// 還沒放好的圖（上傳失敗、還是 data: 網址）：存的時候後端會丟掉，先提醒
function edLocalImgs() { var n = 0; JSON.stringify(edHb(), function (k, v) { if (typeof v === "string" && v.indexOf("data:") === 0) n++; return v; }); return n; }
function saveEd(force, auto) {   // auto＝自動存檔（不跳小視窗、存好不重畫）
  if (!ED || ED.saving) return;
  if (UPL) { if (!auto) toast("還有圖片在上傳，等上傳好再存"); return; }
  var nl = edLocalImgs();
  if (nl && !force) {
    if (auto) { AS.pause = "img"; dirtyPaint(); return; }
    modal({ title: "有 " + nl + " 張圖沒有放好", lines: ["那幾張圖沒有上傳成功，存的時候會被拿掉。要先重新放一次嗎？"], buttons: [{ label: "先不存", cls: "sm" }, { label: "照樣儲存", cls: "sm pri", fn: function () { saveEd(true); } }] });
    return;
  }
  clearTimeout(AS.t); AS.t = null;
  if (!auto && AS.pause === "img") AS.pause = "";
  ED.saving = true; ED.auto = !!auto;
  if (ED_OCR_OFF && !auto) { ED_OCR_OFF = ""; setTimeout(edOcrPump, 0); }   // 圖片文字辨識沒開的話：按「儲存」再試一次（開好了就會做）
  dirtyPaint();
  var t0 = Date.now();
  var bgStep = function () {
    var nbg = edBgTodo().length;   // 章元背景（目錄圖上每一章的位置）：目錄圖或框改了才重做
    if (!nbg) { saveSend(force, auto, t0); return; }
    ED.bgMsg = "做章元背景中（0／" + nbg + "）…"; dirtyPaint();
    edBgMake(function (i, n) { ED.bgMsg = "做章元背景中（" + i + "／" + n + "）…"; dirtyPaint(); }).then(function () { ED.bgMsg = ""; saveSend(force, auto, t0); }, function (e) {
      ED.bgMsg = ""; toast("⚠ 章元背景沒做好（" + e.message + "）：其他的照樣儲存，下次儲存會再試一次"); saveSend(force, auto, t0);
    });
  };
  var nsh = edShapeNeed();   // 物品的形狀（滑到時只亮物品本身）：框或圖改了才重找
  if (!nsh) { bgStep(); return; }
  ED.bgMsg = "找物品的形狀（0／" + nsh + "）…"; dirtyPaint();
  edShapeMake(function (i, n) { ED.bgMsg = "找物品的形狀（" + i + "／" + n + "）…"; dirtyPaint(); }).then(function () { ED.bgMsg = ""; bgStep(); }, function (e) {
    ED.bgMsg = ""; toast("⚠ 物品的形狀沒找好（" + e.message + "）：先亮整個框，下次儲存會再試一次"); bgStep();
  });
}
function saveSend(force, auto, t0) {
  if (!ED) return;
  var cur = ED.cur, mode = ED.mode, sent = edJson(), why = ED.restore ? "restore" : auto ? "auto" : "";
  t0 = t0 || Date.now();
  call("hbSave", [sent, ED.rev, !!force, why]).then(function (r) {
    if (!ED) return;
    ED.saving = false;
    if (r && r.st === "lock") { dirtyPaint(); logout("expired"); return; }
    if (r && r.conflict) {
      AS.pause = "conflict"; dirtyPaint();
      modal({ title: "存不進去：手冊剛剛被改過", lines: ["在你編輯的時候，手冊被改過了（可能是別的開發者，或在 LINE 裡改的）。自動存檔先暫停。", "「用我的蓋掉」：別人剛改的會不見。「放棄我的」：重新載入最新的內容，你這次的修改不見。"], buttons: [
        { label: "先不要", cls: "sm" }, { label: "放棄我的、重新載入", cls: "sm", fn: function () { AS.pause = ""; refreshForEdit(); } }, { label: "用我的蓋掉", cls: "sm bad", fn: function () { AS.pause = ""; saveEd(true); } }] });
      return;
    }
    if (!r || !r.ok || !r.data) { asFail(r && r.err || "後端沒有回應", auto); return; }
    AS.fail = 0;
    var still = edJson() !== sent;   // 存的時候又改了：那些修改保留在編輯器裡
    HB = r.data;
    ED.rev = HB.rev; ED.base = HB; ED.savedAt = Date.now(); ED.saveMs = Date.now() - t0;
    var wasRestore = !!ED.restore; ED.restore = null; if (AS.pause === "restore") AS.pause = "";
    if (still) { AS.first = 0; markDirty(); if (!auto) toast("已儲存（存的時候你又改了一些，那些還沒存）"); }
    else if (auto && !wasRestore) { ED.dirty = false; AS.first = 0; dirtyPaint(); }   // 自動存檔：不重畫（不打斷正在打字的人）
    else { edReset(); edPick(cur, mode); ED.savedAt = Date.now(); ED.saveMs = Date.now() - t0; renderEdit(); toast(wasRestore ? "✅ 已換成那一版（換之前的樣子也留了一份）" : "✅ 已儲存：LINE 和網頁都會看到新的內容"); }
    if (r.line === 0 && !ED.lineWarned) { ED.lineWarned = true; toast("⚠ 存好了，但 LINE 那邊沒有收到通知：LINE 最晚 30 分鐘後才會看到（網頁專案的 LINE_APP_URL 對嗎？）"); }
    if (TAB !== "edit") drawWeb();
    edOcrPump();
  }, function (e) { if (!ED) return; ED.saving = false; asFail(e.message, auto); });
}
function edPick(cur, mode) {   // 存完、重新載入以後，盡量停在原本選的地方
  var gone = !cur || (cur.kind === "title" ? !edTitle(cur.id) : cur.kind === "ch" ? !edCh(cur.id) : cur.kind === "map" ? !!(cur.id && !edSpot(cur.id)) : cur.kind === "mq" ? false : true);
  if (!gone) { ED.cur = cur; ED.mode = mode; }
}
function refreshForEdit() {
  call("hbData", []).then(function (x) {
    if (!x || x.st === "lock") { logout("expired"); return; }
    if (!x.data) { toast("❌ 重新載入失敗"); return; }
    var cur = ED && ED.cur, mode = ED && ED.mode;
    HB = x.data; edReset(); edPick(cur, mode); renderEdit(); toast("已重新載入最新的內容");
  }, function (e) { toast("❌ " + e.message); });
}
function discardEd() {
  if (!ED.dirty) { toast("沒有要放棄的修改"); return; }
  modal({ title: "放棄還沒儲存的修改？", lines: ["會回到上一次儲存的內容（已經上傳的圖片會留在雲端資料夾，但不會出現在手冊裡）。"], buttons: [{ label: "不要", cls: "sm" }, { label: "放棄修改", cls: "sm bad", fn: function () {
    var cur = ED.cur, mode = ED.mode; AS.pause = ""; clearTimeout(AS.t); AS.t = null; AS.fail = 0;   // 正在看舊版本、存不進去暫停的：回到現在的內容（自動存檔也恢復）
    edReset(); edPick(cur, mode); renderEdit(); toast("已還原成上一次儲存的內容");
  } }] });
}
function renderToolbar() {
  var tb = $("#edtb"); tb.innerHTML = "";
  var isT = ED.cur.kind === "title";
  var vb = h("button", { class: "btn sm verb", id: "edVer", type: "button", title: "每 10 分鐘留一份舊的（最多 50 份）：改錯了可以換回去", onclick: verOpen }, ["🕘 舊版本"]);
  tb.appendChild(vb);   // 第 28 批：放在最左上角
  var sb = btn("儲存", function () { saveEd(false); }, "pri"); sb.id = "edSave";
  tb.appendChild(sb);
  tb.appendChild(btn("放棄修改", discardEd));
  var ac = h("input", { type: "checkbox", id: "edAuto" }); ac.checked = AS.on; ac.onchange = function () { asSet(ac.checked); };
  tb.appendChild(h("label", { class: "asck", title: "有修改就自動儲存：停手 3 秒就存，一直在改的話最晚 8 秒（記在這台電腦）" }, [ac, h("span", {}, ["自動存檔"])]));
  tb.appendChild(h("span", { id: "edDirty", class: "dirty", "aria-live": "polite" }, [""]));
  tb.appendChild(h("span", { class: "vsep" }));
  tb.appendChild(h("span", { class: "tblabel" }, ["新增內容"]));
  [["text", "＋文字"], ["ladder", "＋階梯式內容"], ["table", "＋表格"], ["img", "＋圖片"], ["anim", "＋動畫"]].forEach(function (x) {
    var b = h("button", { class: "btn sm addb", "data-k": x[0], title: isT ? (x[0] === "text" ? "新的文字塊會接在你點選的那一塊後面（沒點選就放最後面）" : "游標在文字裡的話，文字會從游標那一行切開，新的放在中間；不然接在你點選的那一塊後面") : "先在左邊選一個標題" }, [x[1], x[0] === "ladder" || x[0] === "anim" ? h("span", { class: "newb" }, ["新"]) : null]);
    if (!isT) b.disabled = true;
    b.addEventListener("mousedown", function (e) { e.preventDefault(); });   // 按下去，文字框不會失去游標（才知道要從哪裡切開）
    b.onclick = function () { addBlock(x[0]); };
    tb.appendChild(b);
  });
  var fm = $("#edfmt"); if (fm) fm.style.display = isT ? "" : "none";   // 文字格式那一排：只有在編輯「標題」時才出現
  tb.appendChild(h("span", { class: "sp" }));
  var pb = h("button", { class: "btn sm" + (PV.open ? " on" : ""), id: "pvToggle", type: "button", title: "預覽會浮在畫面上，可以拖來拖去、拉大拉小、放到最大" }, [PV.open ? "👁 預覽視窗：開" : "👁 打開預覽視窗"]);
  pb.onclick = function () { PV.open = !PV.open; pvSync(); renderToolbar(); if (PV.open) refreshPreview(); };
  tb.appendChild(pb);
  dirtyPaint();
}

/* ───────── 左：章節清單（「🔑 關鍵字」第 25 批拿掉了）───────── */
function renderTree() {
  var c1 = $("#edc1"); c1.innerHTML = "";
  var seg = h("div", { class: "seg", style: "display:flex;margin-bottom:8px" });
  [["ch", "章節"], ["map", "🖼 目錄圖"], ["mq", "📢 跑馬燈"]].forEach(function (p) {
    var b = h("button", { class: ED.mode === p[0] ? "on" : "", style: "flex:1;padding-left:4px;padding-right:4px;white-space:nowrap", "data-m": p[0] }, [p[1]]);
    b.onclick = function () {
      if (ED.mode === p[0]) return;
      if (ED.mode === "ch") ED.lastCh = ED.cur;   // 離開「章節」前，記住看到哪裡，回來時接著看
      ED.mode = p[0]; ED.ab = null;
      if (p[0] === "map") ED.cur = { kind: "map", id: "" };
      else if (p[0] === "mq") { ED.cur = { kind: "mq", id: "" }; ED.view = "web"; }   // 跑馬燈只有網頁有：預覽切到「網頁」
      else {
        var lc = ED.lastCh;
        ED.cur = lc && ((lc.kind === "title" && edTitle(lc.id)) || (lc.kind === "ch" && edCh(lc.id))) ? lc : edFirst();
        if (ED.cur.kind === "map") ED.mode = "map";
      }
      renderEdit();
    };
    seg.appendChild(b);
  });
  c1.appendChild(seg);
  if (ED.mode === "map") { renderMapTree(c1); return; }
  if (ED.mode === "mq") { c1.appendChild(hint("跑馬燈：網頁最上面那一條會跑的字（章、標題頁上下各一條）。下面還有「🔰 大標題旁的符號」。在中間改內容、速度，存好才會生效（會自動存）。LINE 沒有跑馬燈。")); return; }
  c1.appendChild(lbl("", "章元（" + ED.chapters.length + " ／ 一排最多 12 張）"));
  ED.chapters.forEach(function (c) {
    var chosen = ED.cur.kind === "ch" ? ED.cur.id === c.id : (edTitle(ED.cur.id) || {}).ch === c.id;
    var bgu = _yzChBg_(c);
    c1.appendChild(h("div", { class: "chI" + (ED.cur.kind === "ch" && ED.cur.id === c.id ? " on" : ""), onclick: function () { selectNode("ch", c.id); } }, [
      bgu ? h("div", { class: "th thimg", style: "background-image:" + cssUrl(bgu) }) : h("div", { class: "th thi" }, [chIco(c, edHb())]),
      h("div", {}, [h("div", { class: "t2" }, [c.name || "（還沒有章名）"]), h("div", { class: "t1" }, [(ED.titles[c.id] || []).length + " 個標題"])])
    ]));
    if (chosen) {
      (ED.titles[c.id] || []).forEach(function (t) {
        c1.appendChild(h("div", { class: "chT" + (ED.cur.kind === "title" && ED.cur.id === t.id ? " on" : ""), onclick: function () { selectNode("title", t.id); } }, [t.name || "（還沒有標題）"]));
      });
      c1.appendChild(h("div", { style: "padding:4px 0 6px 26px" }, [btn("＋新增標題", function () { addTitle(c.id); })]));
    }
  });
  c1.appendChild(h("div", { style: "padding-top:8px" }, [h("button", { class: "btn sm", disabled: ED.chapters.length >= YZ_CAROUSEL_MAX, onclick: addChapter }, ["＋新增章元"])]));
}
function selectNode(kind, id) { ED.cur = { kind: kind, id: id }; ED.mode = kind === "map" ? "map" : kind === "mq" ? "mq" : "ch"; ED.ab = null; renderEdit(); }
function addTitle(cid) {
  var t = { id: "t" + Date.now(), ch: cid, name: "（新標題）", size: "giga", ww: 760, note: "", page: "", blocks: [] };
  ED.titles[cid].push(t); markDirty(); selectNode("title", t.id);
}
function addChapter() {
  if (ED.chapters.length >= YZ_CAROUSEL_MAX) return;
  var n = ED.chapters.length + 1, id = "c" + Date.now();
  ED.chapters.push({ id: id, no: String(n), name: "（新章元）", intro: "", img: "", fid: "", size: ED.cfg.chSize });
  ED.titles[id] = []; markDirty(); selectNode("ch", id);
}

/* ───────── 中：表單 ───────── */
function renderForm() {
  var f = $("#edc2"); f.innerHTML = ""; ED.warners = [];
  RTE.cur = null; rteClosePop(); rteBarSync();   // 舊的文字框都被換掉了：格式列先熄掉，點進新的文字框才又亮起來
  ED.mapUi = null;
  if (ED.cur.kind === "map") return renderMapForm(f);
  if (ED.cur.kind === "mq") return renderMqForm(f);
  if (ED.cur.kind === "ch") return renderChForm(f, edCh(ED.cur.id));
  var t = edTitle(ED.cur.id);
  if (!t) return;
  renderTitleForm(f, t, edCh(t.ch));
}
function renderChForm(f, c) {
  var ts = ED.titles[c.id] || [];
  f.appendChild(h("h3", { style: "font-size:16px" }, ["章元：" + (c.name || "（還沒有章名）")]));
  // 背景：目錄圖上這一章的位置（按「儲存」時自動做）；自己放的圖優先
  f.appendChild(lbl("三", "背景（藥師看到的章、標題頁的背景，和 LINE 卡片最上面那張圖）"));
  var bsp = ED.cat && ED.cat.img ? bgSpotOf(ED.cat, c.id) : null, have = _yzChBg_(c);
  var why = c.img ? "現在用的是你自己放的圖（下面那張）。拿掉它，就改用目錄圖上這一章的位置。" :
    !ED.cat || !ED.cat.img ? "還沒有目錄圖：先到「🖼 目錄圖」放圖一，按「儲存」，每一章的背景就會自動做好。" :
    !bsp ? "目錄圖上沒有連到這一章的地點：背景先用青綠色。到「🖼 目錄圖」新增一個連到這一章的地點，按「儲存」就會自動做好。" :
    c.bg && c.bg.k === bgKey(ED.cat, bsp) ? "用目錄圖上「" + (bsp.label || "這一章") + "」那個框的位置（放大）。目錄圖換了、或框移動了，按「儲存」會自動重做。" :
    "按「儲存」時，會自動用目錄圖上「" + (bsp.label || "這一章") + "」那個框的位置做好。";
  f.appendChild(h("div", { class: "bgrow" }, [have ? h("div", { class: "bgth", style: "background-image:" + cssUrl(have) }) : h("div", { class: "bgth none" }, ["還沒有"]), h("div", { class: "bgwhy" }, [why])]));
  f.appendChild(lbl("三", "自己換一張背景（可以不放）"));
  f.appendChild(hint("放了就用你放的這張，不用目錄圖裁的。拖進來、選檔案，或複製後在下面框裡按 Ctrl+V 貼上。圖裡面不要有病人資料、人臉。"));
  var dz = dropZone({
    kind: "章元封面",
    get: function () { return c.img; }, info: function () { return c.info; }, fname: function () { return c.fname; },
    set: function (r, info) { c.img = r.url; c.fid = r.fid; c.fname = r.fname; c.info = info; markDirty(); renderTree(); refreshPreview(); },
    clear: function () { c.img = ""; c.fid = ""; c.info = null; markDirty(); renderTree(); refreshPreview(); }
  });
  f.appendChild(dz.el);
  f.appendChild(lbl("三", "章名（純文字）"));
  var nm = h("input", { class: "in", value: c.name }); nm.oninput = function () { c.name = nm.value; markDirty(); renderTree(); refreshPreview(); }; f.appendChild(nm);
  f.appendChild(lbl("三", "簡介（一兩行，章元卡片上會顯示）"));
  var it = h("textarea", { class: "ta", style: "min-height:56px" }); it.value = c.intro || ""; it.oninput = function () { c.intro = it.value; changed(); }; f.appendChild(it);
  f.appendChild(hint("卡片的大小在預覽視窗裡調（所有章元共用同一個大小）。"));
  f.appendChild(h("div", { class: "lbl" }, ["這一章的標題（" + ts.length + "）"]));
  ts.forEach(function (t) { f.appendChild(h("div", { class: "chT", style: "padding-left:8px;border:1px solid var(--line);border-radius:8px;margin:4px 0", onclick: function () { selectNode("title", t.id); } }, [t.name])); });
  f.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:12px" }, [
    btn("＋新增標題", function () { addTitle(c.id); }), btn("▲ 往前移", function () { moveChapter(c.id, -1); }), btn("▼ 往後移", function () { moveChapter(c.id, 1); }),
    confirmBtn("刪除這一章", function () {
      var i = ED.chapters.indexOf(c); ED.chapters.splice(i, 1); delete ED.titles[c.id]; renumber(); markDirty();
      if (ED.chapters.length) selectNode("ch", ED.chapters[Math.min(i, ED.chapters.length - 1)].id); else renderEdit();
    })
  ]));
}
function moveChapter(id, d) {
  var i = ED.chapters.indexOf(edCh(id)), j = i + d; if (j < 0 || j >= ED.chapters.length) return;
  var x = ED.chapters[i]; ED.chapters[i] = ED.chapters[j]; ED.chapters[j] = x; renumber(); markDirty(); renderEdit();
}
function renderTitleForm(f, t, ch) {
  f.appendChild(h("div", { class: "muted", style: "font-size:12.5px" }, [ch.name + " ›"]));
  f.appendChild(lbl("四", "標題（純文字）"));
  var ti = h("input", { class: "in", value: t.name, placeholder: "例：一、一般藥品補充" });
  ti.oninput = function () { t.name = ti.value; markDirty(); renderTree(); refreshPreview(); };
  f.appendChild(ti);
  f.appendChild(hint("標題只能是純文字：貼上帶格式的文字，格式會自動拿掉。"));

  f.appendChild(lbl("五", "內容（文字、階梯式、表格、圖片，可以混著放，順序可以調）"));
  f.appendChild(hint("新增請用最上面第一排的按鈕。游標在文字裡：表格、圖片、動畫、階梯式會放在游標那一行的後面（文字自動從那裡切開）；不然接在你點選的那一塊後面。文字的格式（粗體、顏色、標題…）用第二排的按鍵。"));
  var list = h("div", { id: "blklist" }); t.blocks.forEach(function (b, i) { list.appendChild(blockEditor(t, b, i)); });
  f.appendChild(list);
  if (!t.blocks.length) f.appendChild(h("div", { class: "muted", style: "padding:10px;border:1px dashed #C7CED7;border-radius:10px;text-align:center" }, ["這個標題還沒有內容，按最上面的「＋文字」「＋階梯式內容」「＋表格」「＋圖片」開始。"]));
  list.addEventListener("focusin", function (e) {
    var blk = e.target.closest && e.target.closest(".blk"); if (!blk) return;
    ED.ab = +blk.getAttribute("data-i");
    $$(".blk", list).forEach(function (x) { x.classList.toggle("act", x === blk); });
  });

  f.appendChild(lbl("六", "備註（會用淡黃色框，放在內容最下面；沒寫字就不顯示）"));
  var nt = h("textarea", { class: "ta", style: "min-height:60px" }); nt.value = t.note || ""; nt.oninput = function () { t.note = nt.value; changed(); if (typeof pgNote === "function") pgNote(); }; f.appendChild(nt);
  var pgOut = h("span", { class: "muted", id: "pgOut" });
  function pgNote() { var x = _yzPageText_(t.page); pgOut.textContent = x ? (_yzNoteHas_(t.note) ? "→ 備註框裡會多一個青綠色小框：📖 藥戰手冊頁數　" + x + "（備註文字和小框中間空一行）" : "→ 只顯示一個青綠色小框：📖 藥戰手冊頁數　" + x + "（備註沒寫字：不會有黃色的備註框）") : "（不填，就不會顯示這個小框）"; }
  var pgIn = h("input", { class: "in", id: "pgIn", value: t.page || "", placeholder: "例：14　或　14–15　或　12、15", style: "max-width:230px" });
  pgIn.oninput = function () { t.page = pgIn.value; pgNote(); changed(); };
  pgNote();
  f.appendChild(h("div", { class: "pgbox" }, [
    h("div", { class: "lbl", style: "margin-top:6px" }, ["📖 藥戰手冊頁數", h("span", { class: "tag warn", style: "margin-left:6px" }, ["備註裡新增的欄位"]), mkEl(15)]),
    h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, [pgIn, pgOut]),
    hint("這一段對應紙本「藥戰手冊」的第幾頁。LINE 卡片、網頁的備註框、搜尋結果都會帶出來；也可以在 LINE 打「第14頁」反過來找。")
  ]));

  // 第 27 批：🔗 連結（互相連結）
  f.appendChild(lbl("七", "🔗 連結（互相連結：A 連到 B，B 那一頁最下面也會自動出現連回 A 的連結）"));
  f.appendChild(linkPanel(t, ch));

  f.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:14px" }, [
    btn("▲ 往前移", function () { moveTitle(t, -1); }), btn("▼ 往後移", function () { moveTitle(t, 1); }),
    confirmBtn("刪除這個標題", function () { var a = ED.titles[ch.id], i = a.indexOf(t); a.splice(i, 1); markDirty(); a.length ? selectNode("title", a[Math.min(i, a.length - 1)].id) : selectNode("ch", ch.id); })
  ]));
}
// 第 27 批：這個標題的「連結」一區：這一篇連到哪裡（文字裡的「連結」行）、誰連到這一篇（自動）、＋ 加一個連結
function linkPanel(t, ch) {
  var outBox = h("span", { class: "lkchips" }), backBox = h("span", { class: "lkchips" }), backTip = h("span", { class: "muted" });
  var chip = function (label, go, cls) { var x = h("button", { class: "lkchip" + (cls ? " " + cls : ""), type: "button" }, [label]); x.onclick = go; return x; };
  function paint() {
    if (!outBox.isConnected && outBox.parentNode) return;
    var hb = edHb(), ids = [];
    (t.blocks || []).forEach(function (b) { if (b.t === "text") _yzGoIds_(b.v).forEach(function (g) { if (ids.indexOf(g) < 0) ids.push(g); }); });
    outBox.innerHTML = ""; backBox.innerHTML = "";
    ids.forEach(function (g) {
      var tg = _yzGoTarget_(hb, g, ch.id);
      outBox.appendChild(tg ? chip((tg.kind === "c" ? "📚 " : "→ ") + tg.label, function () { selectNode(tg.kind === "c" ? "ch" : "title", tg.id); }) : chip("⚠ 有一個連結找不到了（可能被刪掉）", function () { toast("在文字裡找到那一行「🔗 連結到」，重新選一個"); }, "bad"));
    });
    if (!ids.length) outBox.appendChild(h("span", { class: "muted" }, ["（還沒有。用下面的「＋ 加一個連結」，或在文字裡按第二排的「🔗 連結」）"]));
    var back = _yzBacklinks_(hb, [t.id, ch.id], t.id);
    back.forEach(function (x) { backBox.appendChild(chip("↩ " + _yzBackLabel_(x, ch.id), function () { selectNode("title", x.t.id); })); });
    if (!back.length) backBox.appendChild(h("span", { class: "muted" }, ["（還沒有）"]));
    backTip.textContent = back.length ? "→ 會自動出現在這一頁最下面（LINE：最後一張卡片下面的按鈕）" : "";
  }
  var sel = h("select", { class: "in lksel", style: "width:auto;max-width:100%", "aria-label": "要連到哪一章、哪個標題" }, [h("option", { value: "" }, ["（選要連到的標題或整章）"])].concat(rteGoOpts(edTitleChoices().filter(function (x) { return x.id !== t.id; }))));
  var add = btn("＋ 加一個連結", function () {
    if (!sel.value) { toast("先選要連到哪裡"); return; }
    var last = t.blocks[t.blocks.length - 1];
    if (last && last.t === "text") last.v = String(last.v || "").replace(/\s+$/, "") + "\n[go=" + sel.value + "]";
    else t.blocks.push({ t: "text", v: "[go=" + sel.value + "]" });
    renderForm(); changed(); toast("加好了：放在最後一塊文字的最下面（LINE、網頁上是一個可以點的按鈕列）");
  }, "sm pri lkadd");
  paint();
  ED.warners.push(paint);   // 文字裡加了、刪了「連結」：馬上更新
  return h("div", { class: "lkpanel" }, [
    h("div", { class: "lkrow" }, [h("b", {}, ["這一篇連到："]), outBox]),
    h("div", { class: "lkrow" }, [h("b", {}, ["連到這一篇的："]), backBox, backTip]),
    h("div", { class: "lkrow" }, [sel, add])
  ]);
}
function moveTitle(t, d) { var a = ED.titles[t.ch], i = a.indexOf(t), j = i + d; if (j < 0 || j >= a.length) return; a[i] = a[j]; a[j] = t; markDirty(); renderEdit(); }

/* ───────── 內容塊（文字／階梯式／表格／圖片） ───────── */
var KIND_NAME = { text: "文字", ladder: "階梯式內容", table: "表格", img: "圖片", anim: "動畫" };
function blockEditor(t, b, i) {
  var del = function () { t.blocks.splice(i, 1); ED.ab = null; renderForm(); changed(); };
  var delBtn = (b.t === "ladder" || b.t === "table" || b.t === "anim") ? confirmBtn("✕", del, "sm bad") : btn("✕", del, "sm bad");
  // 第 27 批：「📄 換下一張」＝LINE 從這一塊開始放到下一張卡片（網頁照常一整頁）；第一塊不用
  var brkLbl = function () { return b.brk ? "✂ LINE 從這裡換下一張 ✓" : "📄 換下一張"; };
  var brkBtn = i > 0 ? btn(brkLbl(), function () {
    if (b.brk) delete b.brk; else b.brk = true;
    brkBtn.textContent = brkLbl(); brkBtn.classList.toggle("on", !!b.brk); brkBtn.setAttribute("aria-pressed", b.brk ? "true" : "false");
    var el = brkBtn.closest(".blk"); if (el) el.classList.toggle("brk", !!b.brk);
    changed();
  }, "sm brkb" + (b.brk ? " on" : "")) : null;
  if (brkBtn) { brkBtn.title = "LINE：從這一塊開始，放到下一張卡片（太擠的時候用；網頁不受影響）。再按一次取消。"; brkBtn.setAttribute("aria-pressed", b.brk ? "true" : "false"); }
  // 第 27 批：整塊縮排（任何內容都能縮排：文字、階梯式、表格、圖片、動畫）。⇤＝往左、⇥＝往右，最多 3 層；文字裡每一行的縮排照舊用第二排的 ⇤ ⇥
  var indTxt = function (n) { return n ? "整塊縮排 " + n + " 層" : "整塊縮排"; };
  var indLbl = h("span", { class: "indn" + (_yzBlockInd_(b) ? " on" : ""), title: "這一塊整塊往右縮幾層（LINE、網頁都一樣）" }, [indTxt(_yzBlockInd_(b))]);
  var setInd = function (d) {
    var n = Math.max(0, Math.min(YZ_IND_MAX, _yzBlockInd_(b) + d));
    if (n) b.ind = n; else delete b.ind;
    indLbl.textContent = indTxt(n); indLbl.classList.toggle("on", !!n);
    var el = indLbl.closest(".blk"); if (el) { if (n) el.setAttribute("data-ind", String(n)); else el.removeAttribute("data-ind"); }
    decB.disabled = n <= 0; incB.disabled = n >= YZ_IND_MAX;
    changed();
  };
  var decB = btn("⇤", function () { setInd(-1); }), incB = btn("⇥", function () { setInd(1); });
  decB.title = "整塊往左（少縮排一層）"; incB.title = "整塊往右縮排一層（例如圖片、表格要對齊上面縮排的文字）";
  decB.setAttribute("aria-label", "整塊往左"); incB.setAttribute("aria-label", "整塊往右縮排");
  decB.className += " indb"; incB.className += " indb";
  decB.disabled = !_yzBlockInd_(b); incB.disabled = _yzBlockInd_(b) >= YZ_IND_MAX;
  // 第 28 批：「⤴ 併到上一塊」：文字、圖片併進上一塊文字（不用一塊一塊調；縮排照舊）
  var mrg = mergeOk(t, i) ? btn("⤴ 併到上一塊", function () { mergeUp(t, i); }, "sm mrgb") : null;
  if (mrg) mrg.title = b.t === "img" ? "這張圖放進上一塊文字的最後面（圖說、圖片裡的字都帶著；縮排照舊）" : "這一塊的文字（連同裡面的圖）接到上一塊文字的最後面（縮排照舊）";
  var head = h("div", { class: "bh" }, [KIND_NAME[b.t] + "　#" + (i + 1), b.t === "ladder" || b.t === "anim" ? h("span", { class: "newb" }, ["新"]) : null, h("span", { class: "sp" }),
    mrg, indLbl, decB, incB, brkBtn, btn("▲", function () { moveBlock(t, i, -1); }), btn("▼", function () { moveBlock(t, i, 1); }), delBtn]);
  var body = h("div", { class: "bb2" });
  var rte = null;
  if (b.t === "text") {
    rte = rteCreate({ value: b.v || "", titles: edTitleChoices, onChange: function (v) { b.v = v; changed(); },
      pics: function () { if (!b.pics || typeof b.pics !== "object") b.pics = {}; return b.pics; },   // 第 28 批：文字裡的圖
      onPics: function (p) { if (p) edOcrNew(p); changed(); }, picInfo: ocrLine,
      imgUp: function (file, cb, swap) { if (!swap && _yzImgIds_(b.v).length >= ED_TEXT_PICS_MAX) { toast("一塊文字最多放 " + ED_TEXT_PICS_MAX + " 張圖：請放到下一塊"); cb(null); return; } edImgUp(file, cb); } });
    body.appendChild(rte.el);
    body.appendChild(hint("選取文字 → 按最上面第二排的按鍵（粗體、顏色、大小）。整行的變化（標題、項目符號、編號、標註、分隔線…）：游標放在那一行，按對應的鍵，再按一次就取消。Enter 換行，清單會自動接下一個符號；Ctrl+Z 復原。圖片可以直接放在文字裡：游標放在那一行，按「🖼 圖片」（或把圖拖進來、Ctrl+V 貼上），圖會放在那一行下面、跟那一行一樣縮排。要做像法條那樣一層一層的編號，請用「＋階梯式內容」。"));
  } else if (b.t === "ladder") body.appendChild(ladderEditor(t, b));
  else if (b.t === "table") body.appendChild(tableEditor(b, t));
  else if (b.t === "anim") body.appendChild(animEditor(t, b));
  else {
    var dz = dropZone({
      kind: "圖片",
      get: function () { return b.url; }, info: function () { return b.info; }, fname: function () { return b.fname; },
      set: function (r, info) { b.url = r.url; b.fid = r.fid; b.fname = r.fname; b.info = info; b.ar = _yzAR_(info.w, info.h); edOcrNew(b); changed(); },
      clear: function () { b.url = ""; b.fid = ""; b.info = null; delete b.ocr; changed(); ocrPaint(); }
    });
    body.appendChild(dz.el);
    var cap = h("input", { class: "in", value: b.cap || "", placeholder: "圖說（可以不填）", style: "margin-top:6px" });
    cap.oninput = function () { b.cap = cap.value; changed(); };
    body.appendChild(cap);
    body.appendChild(ocrLine(b));   // 第 28 批：圖片裡的字的狀態
  }
  var blk = h("div", { class: "blk" + (ED.ab === i ? " act" : "") + (b.brk && i > 0 ? " brk" : ""), "data-i": String(i), "data-ind": _yzBlockInd_(b) ? String(_yzBlockInd_(b)) : null }, [head, body]);
  if (rte) blk._rte = rte;
  return blk;
}
function edTitleChoices() {   // 「連結」可以選的：整章（第 27 批）＋全部章元的全部標題（照章分組）
  var out = ED.chapters.map(function (c) { return { id: c.id, label: "📚 " + (c.name || "（還沒有章名）") + "（整章）", grp: "整章（打開那一章的標題清單）" }; });
  ED.chapters.forEach(function (c) { (ED.titles[c.id] || []).forEach(function (t) { out.push({ id: t.id, label: c.name + " › " + (t.name || "（還沒有標題）"), grp: "標題：" + (c.name || "") }); }); });
  return out;
}
// 第 28 批：文字裡的圖：選好檔 → 縮小 → 上傳（檔名亂碼）→ cb({ url, fid, fname, ar, info })；不行 cb(null)
var ED_TEXT_PICS_MAX = 30;   // 一塊文字最多幾張圖（跟後端 YZ_TEXT_PICS_MAX 一樣）
function edImgUp(file, cb) {
  if (!file || !/^image\/(jpeg|png|gif|webp|bmp)$/.test(file.type || "")) { toast("這不是圖片檔（JPEG、PNG、GIF、WebP）"); cb(null); return; }
  shrinkImage(file, function (uri, info) {
    if (!uri) { toast(info && info.error || "讀不到這個檔案"); cb(null); return; }
    uploadUri(uri, "圖片").then(function (r) {
      cb({ url: r.url, fid: r.fid, fname: r.fname, ar: _yzAR_(info.w, info.h), info: info });
      toast("圖片放好了（已縮小、檔名換成亂碼）");
    }, function (e) {
      cb(null);
      modal({ title: "❌ 這張圖沒有放進去", lines: [(e && e.message) || "上傳失敗", "請再放一次。一直失敗的話：截圖給開發者，或在 LINE 打「手冊圖片檢查」。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
    });
  }, 1600);
}
// 「⤴ 併到上一塊」：上一塊是文字；這一塊是文字、或放好的圖片
function mergeOk(t, i) {
  var b = t.blocks[i], pv = t.blocks[i - 1];
  return !!(i > 0 && pv && pv.t === "text" && b && (b.t === "text" || (b.t === "img" && b.url && b.fid && String(b.url).indexOf("data:") !== 0)));
}
function mergeShift(v, d) {   // 每一行的縮排加 d 層（0～3）：整塊縮排不一樣的兩塊併在一起，看起來照舊
  if (!d) return v;
  return String(v || "").split("\n").map(function (ln) {
    if (!ln.trim()) return ln;
    var L = _yzRtParseLine_(ln), n = Math.max(0, Math.min(YZ_RT_MAXLV, (L.lv || 0) + d)), pre = "";
    for (var k = 0; k < n; k++) pre += "　";
    return pre + ln.replace(/^[ 　\t]*/, "");
  }).join("\n");
}
function mergeUp(t, i) {
  if (!mergeOk(t, i)) return;
  var b = t.blocks[i], pv = t.blocks[i - 1], d = _yzBlockInd_(b) - _yzBlockInd_(pv), add, pics = {};
  if (!pv.pics || typeof pv.pics !== "object") pv.pics = {};
  if (b.t === "img") {
    var id = rteNewPicId(pv.pics), lv = Math.max(0, Math.min(YZ_RT_MAXLV, d)), pre = "";
    for (var k = 0; k < lv; k++) pre += "　";
    pics[id] = { url: b.url, fid: b.fid, fname: b.fname, ar: b.ar, cap: b.cap || "", info: b.info };
    if (typeof b.ocr === "string") pics[id].ocr = b.ocr;
    add = pre + "[img=" + id + "]";
  } else {
    add = mergeShift(b.v, d);
    var bp = b.pics && typeof b.pics === "object" ? b.pics : {};
    _yzImgIds_(add).forEach(function (old) {   // 代號跟上一塊的一樣：換一個
      if (!bp[old]) return;
      var nid = old;
      if (pv.pics[nid] || pics[nid]) { nid = rteNewPicId(Object.assign({}, pv.pics, pics)); add = add.split("[img=" + old + "]").join("[img=" + nid + "]"); }
      pics[nid] = bp[old];
    });
  }
  var nImg = _yzImgIds_(pv.v).length + Object.keys(pics).length;
  if (nImg > ED_TEXT_PICS_MAX) { toast("一塊文字最多放 " + ED_TEXT_PICS_MAX + " 張圖：這一塊先不併"); return; }
  Object.keys(pics).forEach(function (k) { pv.pics[k] = pics[k]; });
  pv.v = String(pv.v || "").replace(/\s+$/, "") + (add.trim() ? "\n" + add : "");
  t.blocks.splice(i, 1);
  ED.ab = i - 1; renderForm(); changed();
  var el = $("#edc2 .blk[data-i='" + (i - 1) + "']"); if (el && !window.__SHOT) el.scrollIntoView({ block: "center" });
  toast(b.t === "img" ? "併好了：圖放進上一塊文字的最後面" : "併好了：接到上一塊文字的最後面" + (b.brk ? "（這一塊的「換下一張」拿掉了）" : ""));
}
function moveBlock(t, i, d) { var j = i + d; if (j < 0 || j >= t.blocks.length) return; var x = t.blocks[i]; t.blocks[i] = t.blocks[j]; t.blocks[j] = x; ED.ab = j; renderForm(); changed(); }
function addBlock(kind) {
  if (ED.cur.kind !== "title") return;
  var t = edTitle(ED.cur.id); if (!t) return;
  var nb = kind === "text" ? { t: "text", v: "" } : kind === "ladder" ? { t: "ladder", style: "law", items: [{ lv: 1, v: "" }] } : kind === "table" ? { t: "table", head: true, rows: [["", ""], ["", ""]] } : kind === "anim" ? { t: "anim", kind: "file", url: "", poster: "", fmt: "", bytes: 0, w: 0, h: 0, frames: 0, dur: 0, ar: "4:3", cap: "", steps: [], sec: 2, loop: true } : { t: "img", url: "", cap: "", ar: "4:3" };
  var at = (ED.ab === null || ED.ab === undefined) ? t.blocks.length : Math.min(t.blocks.length, ED.ab + 1);
  // 游標在某一個文字塊裡：表格／圖片／動畫／階梯式放在游標那一行的後面，文字從那裡切成上下兩塊（不用先自己拆）
  var cur = RTE.cur, cb = cur && cur.el && cur.el.closest ? cur.el.closest(".blk") : null, bi = cb ? +cb.getAttribute("data-i") : -1, tb = bi >= 0 ? t.blocks[bi] : null;
  if (kind === "img" && tb && tb.t === "text" && cur.cmd && cur.cmd.img) { cur.cmd.img(); return; }   // 第 28 批：游標在文字裡 → 圖直接放在文字裡（游標那一行下面），不用切成好幾塊
  if (kind !== "text" && tb && tb.t === "text") {
    var sp = cur.splitAtCaret(), hasB = !!sp.before.trim(), hasA = !!sp.after.trim();
    if (!hasB && !hasA) { t.blocks.splice(bi, 1, nb); at = bi; }                                              // 這個文字塊是空的：直接換成新的
    else if (hasB && !hasA) { tb.v = sp.before; t.blocks.splice(bi + 1, 0, nb); at = bi + 1; }                 // 游標在最後面：接在後面
    else if (!hasB && hasA) { tb.v = sp.after; t.blocks.splice(bi, 0, nb); at = bi; }                          // 游標在最前面：放在前面
    else { tb.v = sp.before; t.blocks.splice(bi + 1, 0, nb, { t: "text", v: sp.after }); at = bi + 1; }       // 游標在中間：切成兩塊文字，新的夾在中間
  } else t.blocks.splice(at, 0, nb);
  ED.ab = at; renderForm(); changed();
  var el = $("#edc2 .blk[data-i='" + at + "']");
  if (el) {
    if (!window.__SHOT) el.scrollIntoView({ block: "center" });
    if (el._rte) el._rte.focus(); else { var f = $("textarea,input:not([type=file])", el); if (f) f.focus(); }
  }
}

/* 階梯式內容：只存「第幾層」和「文字」，編號（第一條／一、／（一）…）是算出來的，加一行、搬一行，後面的編號自己跟著變。
   一行也可以是「圖片」：{ lv, img:{ url, cap, ar, info, fname } }。圖片行不佔編號，掛在它上面那一個文字行底下（預設比那一行深一層，⇤ ⇥ 可以調）。 */
function edMarks(b) {   // 編輯器每一行前面的編號；空白的行不會顯示出去，所以也不佔編號（跟 LINE、網頁一樣）→ null（畫成「—」）。圖片行、只縮排的行沒有記號（""）
  var idx = [], vis = [];
  _yzLadderNumberAll_(edHb());   // 「接續上一段」：前面的段落改了，這一段從第幾號開始也跟著變
  b.items.forEach(function (it, i) { if (_yzLadderShown_(it)) { idx.push(i); vis.push(it); } });
  var marks = _yzLadderMarks_(_yzLadderFix_(vis), b.style, b.n0), out = b.items.map(function () { return null; });
  idx.forEach(function (i, k) { out[i] = marks[k]; });
  return out;
}
function edJson() { return JSON.stringify(edHb(), function (k, v) { return k === "n0" ? undefined : v; }); }   // 要存的內容（n0＝算出來的起始號碼，不用存）
function ladderEditor(t, b) {
  if (!b.items) b.items = [];
  if (!YZ_LADDER_STYLES[b.style]) b.style = "law";
  var wrap = h("div", { class: "ladE" }), rowsBox = h("div", { class: "lrows" }), isImg = _yzLadderIsImg_;
  function subEnd(i) { if (isImg(b.items[i])) return i + 1; var lv = b.items[i].lv, j = i + 1; while (j < b.items.length && b.items[j].lv > lv) j++; return j; }   // 這一行（連同底下的子項）到哪裡結束；圖片行沒有子項
  function maxLv(i, j) { var m = 0; for (var k = i; k < j; k++) m = Math.max(m, b.items[k].lv); return m; }
  function prevTextLv(i) { for (var p = i - 1; p >= 0; p--) if (!isImg(b.items[p])) return b.items[p].lv; return 0; }   // 上面最近的「文字行」是第幾層（圖片行不算，跟 _yzLadderFix_ 一樣）
  function imgCount() { return b.items.filter(isImg).length; }
  function canShift(i, d) {
    var it = b.items, lv = it[i].lv, j = subEnd(i);
    if (d > 0) return lv <= prevTextLv(i) && maxLv(i, j) + 1 <= YZ_LADDER_MAX;
    return lv > 1;
  }
  function shift(i, d) { if (!canShift(i, d)) return false; for (var k = i, j = subEnd(i); k < j; k++) b.items[k].lv += d; return true; }
  function upStart(i) { var it = b.items, lv = it[i].lv, p = i - 1; while (p >= 0 && it[p].lv > lv) p--; return (p >= 0 && it[p].lv === lv) ? p : -1; }
  function canDown(i) { var j = subEnd(i); return j < b.items.length && b.items[j].lv === b.items[i].lv; }
  function moveUp(i) { var p = upStart(i); if (p < 0) return -1; var j = subEnd(i), seg = b.items.splice(i, j - i); Array.prototype.splice.apply(b.items, [p, 0].concat(seg)); return p; }
  function moveDown(i) { if (!canDown(i)) return -1; var j = subEnd(i), k = subEnd(j), seg = b.items.splice(i, j - i); Array.prototype.splice.apply(b.items, [i + (k - j), 0].concat(seg)); return i + (k - j); }
  function focusRow(i) {   // 文字行：游標放到最後面；圖片行：停在放圖的格子上（可以直接 Ctrl+V 貼圖）
    var row = rowsBox.children[i]; if (!row) return;
    var ta = $("textarea", row);
    if (ta) { ta.focus(); var n = ta.value.length; try { ta.setSelectionRange(n, n); } catch (e) { /* 沒關係 */ } }
    else { var dz = $(".drop", row); if (dz) dz.focus(); }
  }
  function after(i) { b.items = _yzLadderFix_(b.items); draw(); changed(); if (i !== undefined && i !== null) focusRow(i); }
  function addSibling(i) { var at = subEnd(i); b.items.splice(at, 0, { lv: b.items[i].lv, v: "" }); after(at); }
  function addChild(i) { if (isImg(b.items[i]) || b.items[i].lv >= YZ_LADDER_MAX) return; b.items.splice(i + 1, 0, { lv: b.items[i].lv + 1, v: "" }); after(i + 1); }
  function addImage(i) {   // 在這一行的正下方放一張圖：掛在這一行底下（比它深一層）；在圖片行上按，就接在那張圖後面（同一層）
    if (imgCount() >= YZ_LADDER_IMG_MAX) { toast("一段階梯式內容最多放 " + YZ_LADDER_IMG_MAX + " 張圖，再多請分成兩段"); return; }
    var cur = b.items[i], lv = isImg(cur) ? cur.lv : Math.min(cur.lv + 1, YZ_LADDER_MAX);
    b.items.splice(i + 1, 0, { lv: lv, img: { url: "", cap: "", ar: "4:3" } }); after(i + 1);
  }
  function delRow(i) { var j = subEnd(i); b.items.splice(i, j - i); if (!b.items.length) b.items.push({ lv: 1, v: "" }); after(Math.max(0, i - 1)); }
  function refreshMarks() { var m = edMarks(b); $$(".lmk", rowsBox).forEach(function (el, i) { if (b.items[i] && isImg(b.items[i])) return; el.textContent = m[i] === null ? "—" : m[i]; el.classList.toggle("empty", m[i] === null); }); stat(); }
  var statEl = h("div", { class: "hint" });
  function stat() {
    var r = _yzLadderRows_(b), mx = 0, ni = 0; r.items.forEach(function (it) { mx = Math.max(mx, it.lv); if (isImg(it)) ni++; });
    statEl.textContent = "共 " + (r.items.length - ni) + " 行文字" + (ni ? "、" + ni + " 張圖" : "") + "，最深 " + mx + " 層（最多 " + YZ_LADDER_MAX + " 層）。空白的行、還沒放圖的圖片列不會顯示，也不佔編號。LINE 上每往下一層，縮進去約 " + (YZ_LADDER_STEP[t.size || "giga"] || 14) + " px。";
  }
  function draw() {
    rowsBox.innerHTML = "";
    var marks = edMarks(b);
    b.items.forEach(function (it, i) {
      var hasKids = subEnd(i) > i + 1, isI = isImg(it);
      var ib = function (label, title, fn, off, cls) { var x = h("button", { class: "ib" + (cls ? " " + cls : ""), title: title, type: "button" }, [label]); if (off) x.disabled = true; x.onclick = fn; return x; };
      var armDel = function (title) { var x = h("button", { class: "ib bad", title: title, type: "button" }, ["✕"]); x.onclick = function () { if (x.dataset.arm) { delRow(i); return; } x.dataset.arm = "1"; x.textContent = "確定？"; setTimeout(function () { if (x.isConnected) { delete x.dataset.arm; x.textContent = "✕"; } }, 3000); }; return x; };
      var delb = isI ? (it.img.url ? armDel("刪除這張圖（要再按一次確認）") : ib("✕", "刪除這一列", function () { delRow(i); }, false, "bad"))
        : hasKids ? armDel("刪除這一行和底下的子項（要再按一次確認）")
        : ib("✕", "刪除這一行", function () { delRow(i); }, false, "bad");
      var btns = h("span", { class: "lbt" }, [
        ib("⇤", "往左一層（Shift+Tab）", function () { if (shift(i, -1)) after(i); }, !canShift(i, -1)),
        ib("⇥", "往右一層（Tab）", function () { if (shift(i, 1)) after(i); }, !canShift(i, 1)),
        ib("▲", "這一行（連同底下的子項）往上搬", function () { var p = moveUp(i); if (p >= 0) after(p); }, upStart(i) < 0),
        ib("▼", "這一行（連同底下的子項）往下搬", function () { var p = moveDown(i); if (p >= 0) after(p); }, !canDown(i)),
        ib("＋", "在下面新增一行（同一層）", function () { addSibling(i); }),
        ib("↳", isI ? "圖片底下不能再縮進一層" : "在下面新增一行（往右一層）", function () { addChild(i); }, isI || it.lv >= YZ_LADDER_MAX),
        ib("🖼", "在下面放一張圖片（掛在這一行底下）", function () { addImage(i); }, imgCount() >= YZ_LADDER_IMG_MAX, "pic"),
        delb
      ]);
      var ind = h("span", { class: "lind", style: "width:" + ((it.lv - 1) * 20) + "px" });
      var row;
      if (isI) {
        var im = it.img;
        var dz = dropZone({
          kind: "圖片",
          get: function () { return im.url; }, info: function () { return im.info; }, fname: function () { return im.fname; },
          set: function (r, info) { im.url = r.url; im.fid = r.fid; im.fname = r.fname; im.info = info; im.ar = _yzAR_(info.w, info.h); edOcrNew(im); changed(); stat(); },
          clear: function () { im.url = ""; im.fid = ""; im.info = null; delete im.ocr; changed(); stat(); ocrPaint(); },
          empty: "把圖拖進來　／　點這裡之後按 Ctrl+V 貼上"
        });
        var cap = h("input", { class: "in", value: im.cap || "", placeholder: "圖說（可以不填）" });
        cap.oninput = function () { im.cap = cap.value; changed(); };
        row = h("div", { class: "lrow limg lv" + it.lv }, [ind, h("span", { class: "lmk", title: "圖片：不佔編號" }, ["🖼"]), h("div", { class: "limgb" }, [dz.el, cap, ocrLine(im)]), btns]);
      } else {
        var ta = h("textarea", { class: "lta", rows: "1", placeholder: i === 0 ? "第一行（Tab 往右一層，Shift+Tab 往左，Enter 新增一行）" : "文字" });
        ta.value = it.v || "";
        var fit = function () { ta.style.height = "auto"; ta.style.height = Math.max(30, ta.scrollHeight) + "px"; };
        ta.oninput = function () { it.v = ta.value; fit(); changed(); refreshMarks(); };
        ta.onkeydown = function (e) {
          if (e.isComposing || e.keyCode === 229) return;
          if (e.key === "Tab") { e.preventDefault(); if (shift(i, e.shiftKey ? -1 : 1)) after(i); return; }
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addSibling(i); return; }
          if (e.key === "Backspace" && !ta.value && b.items.length > 1 && !hasKids) { e.preventDefault(); delRow(i); }
        };
        row = h("div", { class: "lrow lv" + it.lv }, [ind, h("span", { class: "lmk" + (marks[i] === null ? " empty" : "") }, [marks[i] === null ? "—" : marks[i]]), ta, btns]);
        setTimeout(fit, 0);
      }
      rowsBox.appendChild(row);
    });
    stat(); syncNum();
  }
  // 樣式
  var sel = h("select", { class: "in", style: "width:auto;max-width:100%" }, Object.keys(YZ_LADDER_STYLES).map(function (k) { return h("option", { value: k }, [YZ_LADDER_STYLES[k].name + "　" + YZ_LADDER_STYLES[k].ex]); }));
  sel.value = b.style; sel.onchange = function () { b.style = sel.value; draw(); changed(); };
  wrap.appendChild(h("div", { class: "ladtop" }, [h("span", { class: "muted" }, ["編號樣式"]), sel, mkEl(11)]));
  // 編號從哪裡開始：法條分成好幾個標題時（「總則」第一～六條，「藥師與民眾及病人」要從第七條開始），選「接續上一段」
  var numSel = h("select", { class: "in ladnumsel", style: "width:auto;max-width:100%" }, [
    h("option", { value: "" }, ["從頭開始"]), h("option", { value: "cont" }, ["接續上一段"]), h("option", { value: "set" }, ["自己指定從第幾號開始"])
  ]);
  var fromIn = h("input", { class: "in ladfrom", type: "number", min: "1", max: String(YZ_LADDER_FROM_MAX), step: "1", inputmode: "numeric", style: "width:6.5em", title: "從第幾號開始（1～" + YZ_LADDER_FROM_MAX + "）", "aria-label": "從第幾號開始" });
  var numRow = h("div", { class: "ladtop ladnum" }, [h("span", { class: "muted" }, ["編號從"]), numSel, fromIn]);
  var numInfo = h("div", { class: "hint ladni" });
  function syncNum() {   // 選單、號碼、說明跟著現在的設定（前面的段落改了、樣式換了，都要重算）
    var st = YZ_LADDER_STYLES[b.style] ? b.style : "law", q = _yzLadderNumberAll_(edHb(), b), first = _yzLadderNoText_(st, q.n0 + 1);
    wrap.classList.toggle("plain", st === "plain");
    numRow.style.display = _yzLadderNoNum_(st) ? "none" : "";
    numSel.value = b.num === "cont" || b.num === "set" ? b.num : "";
    numSel.options[0].textContent = "從頭開始（" + _yzLadderNoText_(st, 1) + "）";
    fromIn.style.display = b.num === "set" ? "" : "none";
    if (b.num === "set" && document.activeElement !== fromIn) fromIn.value = String(_yzLadderFrom_(b.from));
    var where = q.prev ? (q.prev.t === t ? "這個標題上面那一段" : "「" + (q.prev.t.name || "（還沒有標題）") + "」") : "";
    numInfo.style.display = st === "dot" ? "none" : "";
    numInfo.classList.toggle("on", !!b.num && st !== "plain");
    numInfo.textContent = st === "plain" ? "只縮排：每一行前面不加記號、不編號，只照層級往右縮（適合前言、說明文字）。"
      : b.num === "cont" ? (q.prev ? "這一段從「" + first + "」開始：接在" + where + "的「" + _yzLadderNoText_(q.prev.st, q.prev.last) + "」後面。前面的條文增減，這裡的號碼會自動跟著變。" : "這一章前面沒有別的「有編號」的段落可以接，所以從「" + first + "」開始。")
      : b.num === "set" ? "這一段從「" + first + "」開始（你指定的）。"
      : "這一段從「" + first + "」開始。同一部法規分在好幾個標題（例如「總則」第一～六條，下一個標題要從第七條開始）：選「接續上一段」。";
  }
  numSel.onchange = function () {
    var now = _yzLadderNumberAll_(edHb(), b).n0;   // 改成「自己指定」時，先填現在看到的號碼（畫面上的號碼不會突然跳掉）
    if (numSel.value === "cont") { b.num = "cont"; delete b.from; }
    else if (numSel.value === "set") { b.num = "set"; b.from = _yzLadderFrom_(now + 1); fromIn.value = String(b.from); }
    else { delete b.num; delete b.from; }
    syncNum(); refreshMarks(); changed();
  };
  fromIn.oninput = function () { var n = Math.floor(Number(fromIn.value)); if (!(n >= 1)) return; b.from = _yzLadderFrom_(n); syncNum(); refreshMarks(); changed(); };
  fromIn.onblur = function () { fromIn.value = String(_yzLadderFrom_(b.from)); };
  wrap.appendChild(numRow);
  wrap.appendChild(numInfo);
  ED.warners.push(function () { if (wrap.isConnected) { syncNum(); refreshMarks(); } });   // 同一個標題裡上面那一段改了：這一段的號碼、說明跟著變
  // 貼上整段條文（文字裡單獨一行的 ［圖］ 會變成一個空的圖片列，貼進來以後再放圖）
  var pta = h("textarea", { class: "ta", style: "min-height:96px", placeholder: "把條文從 Word 或 PDF 複製貼在這裡（行首有「第一條」「一、」「（一）」「1.」「(1)」都看得懂，編號會重新自動排）" });
  var pinfo = h("div", { class: "hint" }, ["貼上後，這裡會告訴你看懂了幾行。"]), parsed = null;
  pta.oninput = function () {
    var own = _yzLadderNoNum_(b.style) && !_yzLadderGuess_(pta.value);   // 圓點、只縮排的段落，貼的又是沒有編號的文字：照這一段的樣式讀（一行一項，縮排決定層級）
    parsed = _yzLadderParse_(pta.value, own ? b.style : "");
    var mx = 0, ni = 0; parsed.items.forEach(function (it) { mx = Math.max(mx, it.lv); if (isImg(it)) ni++; });
    pinfo.textContent = parsed.items.length ? "看懂了 " + (parsed.items.length - ni) + " 行" + (ni ? "＋" + ni + " 個圖片位置（貼進去以後，在那一列放圖）" : "") + "，最深 " + mx + " 層，樣式：" + YZ_LADDER_STYLES[parsed.style].name + "。" : "還沒有內容。";
  };
  var applyPaste = function (replace) {
    if (!parsed || !parsed.items.length) { toast("先貼上條文"); return; }
    var keep = replace ? [] : b.items.filter(_yzLadderShown_);
    b.items = _yzLadderFix_(keep.concat(parsed.items)); if (replace || !keep.length) b.style = parsed.style; sel.value = b.style;
    pta.value = ""; parsed = null; pinfo.textContent = "貼上了。"; draw(); changed(); toast("條文貼進來了，編號已重新自動排");
  };
  // 「取代全部」會把已經放好的圖也一起拿掉：有圖的時候，要再按一次確認
  var replBtn = btn("取代全部", function () {
    var n = b.items.filter(function (it) { return isImg(it) && it.img.url; }).length;
    if (n && !replBtn.dataset.arm) { replBtn.dataset.arm = "1"; replBtn.textContent = "確定？會刪掉現有的 " + n + " 張圖"; setTimeout(function () { if (replBtn.isConnected) { delete replBtn.dataset.arm; replBtn.textContent = "取代全部"; } }, 4000); return; }
    delete replBtn.dataset.arm; replBtn.textContent = "取代全部"; applyPaste(true);
  }, "sm pri");
  var det = h("details", { class: "ladpaste" }, [h("summary", {}, ["📋 貼上整段條文（從 Word／PDF 複製）"]), pta, pinfo, h("div", { style: "display:flex;gap:6px;margin-top:6px" }, [replBtn, btn("接在後面", function () { applyPaste(false); })])]);
  if (b.items.length <= 1 && !String((b.items[0] || {}).v || "").trim()) det.setAttribute("open", "");
  wrap.appendChild(det);
  wrap.appendChild(rowsBox);
  wrap.appendChild(statEl);
  draw();
  return wrap;
}

/* 表格 */
function parseTSV(tx) {
  var rows = tx.replace(/\r/g, "").replace(/\n+$/, "").split("\n").map(function (l) { return l.split("\t"); });
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  rows.forEach(function (r) { while (r.length < nc) r.push(""); });
  return rows;
}
function tableEditor(b, t) {
  var wrap = h("div"), warn = h("div", { class: "twarn" });
  function paintWarn() {
    warn.innerHTML = "";
    var bs = t.size || "giga", c = _yzTableCheck_(b, bs);
    if (c.nc < 2) return;
    var m = [];
    if (c.tooWide) m.push(["bad", "⚠ 這張表在 LINE「" + bs + "」卡片上放不下（可用寬度約 " + c.avail + " px，最少要 " + c.minTotal + " px）。可以：把卡片調大（最大是 giga）、少幾欄、字寫短一點、或拆成兩張表。還有別的辦法，見「要你確認」第 12 題。"]);
    else if (c.shrunk) m.push(["note", "ℹ 為了放得下，這張表在 LINE 上的字自動縮小了一號。"]);
    else m.push(["ok", "✓ 這張表在 LINE「" + bs + "」卡片上放得下。"]);
    if (c.manual && c.narrow.length) m.push(["warn", "⚠ 你自己調的欄寬裡，第 " + c.narrow.join("、") + " 欄太窄，英文或數字可能被硬拆開。建議改回「自動」。"]);
    m.push(["note", "網頁上：表格太寬時，外面會出現左右拉條（LINE 卡片沒辦法拉，只能擠）。"]);
    m.forEach(function (x) { warn.appendChild(h("div", { class: "tw " + x[0] }, [x[1]])); });
  }
  ED.warners.push(paintWarn);
  function draw() {
    wrap.innerHTML = "";
    if (!b.rows || !b.rows.length) b.rows = [["", ""], ["", ""]];
    var rows = b.rows, nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
    rows.forEach(function (r) { while (r.length < nc) r.push(""); });
    var tbl = h("table", { class: "gridT" });
    rows.forEach(function (r, ri) {
      var tr = h("tr");
      r.forEach(function (v, ci) {
        var inp = h("input", { value: v });
        inp.oninput = function () { r[ci] = inp.value; changed(); };
        inp.onpaste = function (e) {
          var tx = (e.clipboardData && e.clipboardData.getData("text/plain")) || "";
          if (tx.indexOf("\t") >= 0 || /\n./.test(tx.replace(/\n+$/, ""))) { e.preventDefault(); b.rows = parseTSV(tx); b.w = null; draw(); changed(); toast("整張表貼上了（" + b.rows.length + " 列 × " + b.rows[0].length + " 欄）"); }
        };
        tr.appendChild(h("td", {}, [inp]));
      });
      tbl.appendChild(tr);
    });
    wrap.appendChild(h("div", { style: "overflow:auto" }, [tbl]));
    // 欄寬：預設「自動」（照內容分，英文數字不會被拆開）；要的話可以自己調
    var manual = !!(b.w && b.w.length === nc);
    var seg = h("div", { class: "seg wseg" });
    [["auto", "欄寬：自動（建議）"], ["man", "自己調"]].forEach(function (p) {
      var x = h("button", { class: (p[0] === "man") === manual ? "on" : "", "data-w": p[0] }, [p[1]]);
      x.onclick = function () {
        if ((p[0] === "man") === manual) return;
        if (p[0] === "auto") b.w = null;
        else { var fl = _yzTableFit_(b, t.size || "giga").flex, base = fl.reduce(function (a, c) { return a + c; }, 0) / (fl.length || 1) || 1; b.w = fl.map(function (v) { return Math.max(0.1, Math.min(9, Math.round(v / base * 10) / 10)); }); }
        draw(); changed();
      };
      seg.appendChild(x);
    });
    wrap.appendChild(h("div", { class: "wrow" }, [seg, mkEl(12)]));
    if (manual) {
      var wr = h("div", { class: "wrow" }, [h("span", { class: "muted" }, ["每欄的比例："])]);
      for (var ci = 0; ci < nc; ci++) (function (ci) {
        var n = h("input", { type: "number", min: "0.1", max: "9", step: "0.1", value: String(b.w[ci] || 1), class: "wn" });
        n.oninput = function () { b.w[ci] = Math.max(0.1, parseFloat(n.value) || 1); changed(); };
        wr.appendChild(n);
      })(ci);
      wrap.appendChild(wr);
    }
    var hd = h("input", { type: "checkbox", checked: b.head !== false });
    hd.onchange = function () { b.head = hd.checked; changed(); };
    wrap.appendChild(h("div", { class: "tb" }, [
      btn("＋列", function () { rows.push(Array.apply(null, Array(nc)).map(function () { return ""; })); draw(); changed(); }),
      btn("＋欄", function () { rows.forEach(function (r) { r.push(""); }); b.w = null; draw(); changed(); }),
      btn("－列", function () { if (rows.length > 1) { rows.pop(); draw(); changed(); } }),
      btn("－欄", function () { if (nc > 1) { rows.forEach(function (r) { r.pop(); }); b.w = null; draw(); changed(); } }),
      h("label", { style: "margin-left:8px" }, [hd, " 第一列是表頭"]),
      h("span", { class: "muted", style: "margin-left:8px" }, [nc + " 欄 × " + rows.length + " 列"])
    ]));
    wrap.appendChild(warn);
    wrap.appendChild(hint("可以從 Excel、Word、網頁複製一整張表，點進任何一格按 Ctrl+V，整張就貼上了。"));
    paintWarn();
  }
  draw();
  return wrap;
}

/* ───────── 動畫 ─────────
 * 動畫檔不能重新壓縮（壓了就不會動了）。這裡只看檔頭，認出格式、尺寸、幾格、多長；
 * 第一格另外存成一張 JPEG（LINE 卡片放不下動畫時，顯示這一張）。檔名一樣換成亂碼。 */
function u16le(a, i) { return a[i] | (a[i + 1] << 8); }
function u16be(a, i) { return (a[i] << 8) | a[i + 1]; }
function u24le(a, i) { return a[i] | (a[i + 1] << 8) | (a[i + 2] << 16); }
function u32be(a, i) { return a[i] * 16777216 + ((a[i + 1] << 16) | (a[i + 2] << 8) | a[i + 3]); }
function u32le(a, i) { return a[i] + a[i + 1] * 256 + a[i + 2] * 65536 + a[i + 3] * 16777216; }
function ascii(a, i, n) { var s = ""; for (var k = 0; k < n && i + k < a.length; k++) s += String.fromCharCode(a[i + k]); return s; }
function sniffAnim(buf) {
  var a = new Uint8Array(buf), r = { fmt: "", animated: false, w: 0, h: 0, frames: 0, dur: 0 };
  if (a.length < 16) return r;
  var h6 = ascii(a, 0, 6), p, len, typ;
  if (h6 === "GIF87a" || h6 === "GIF89a") {
    r.fmt = "gif"; r.w = u16le(a, 6); r.h = u16le(a, 8);
    p = 13; if (a[10] & 0x80) p += 3 * (1 << ((a[10] & 7) + 1));
    while (p < a.length) {
      var t = a[p];
      if (t === 0x3B) break;
      if (t === 0x21) { if (a[p + 1] === 0xF9 && a[p + 2] === 4) r.dur += (u16le(a, p + 4) || 10) * 10; p += 2; while (p < a.length && a[p]) p += a[p] + 1; p++; continue; }
      if (t === 0x2C) { r.frames++; var pk = a[p + 9]; p += 10; if (pk & 0x80) p += 3 * (1 << ((pk & 7) + 1)); p++; while (p < a.length && a[p]) p += a[p] + 1; p++; continue; }
      break;
    }
    r.animated = r.frames > 1; return r;
  }
  if (a[0] === 0x89 && ascii(a, 1, 3) === "PNG") {
    r.fmt = "png"; p = 8;
    while (p + 8 <= a.length) {
      len = u32be(a, p); typ = ascii(a, p + 4, 4);
      if (typ === "IHDR") { r.w = u32be(a, p + 8); r.h = u32be(a, p + 12); }
      else if (typ === "acTL") { r.fmt = "apng"; r.frames = u32be(a, p + 8); }
      else if (typ === "fcTL") { var dd = u16be(a, p + 8 + 22) || 100; r.dur += Math.round(u16be(a, p + 8 + 20) * 1000 / dd); }
      else if (typ === "IEND") break;
      p += 12 + len;
    }
    r.animated = r.fmt === "apng" && r.frames > 1; return r;
  }
  if (ascii(a, 0, 4) === "RIFF" && ascii(a, 8, 4) === "WEBP") {
    r.fmt = "webp"; p = 12; var anim = false;
    while (p + 8 <= a.length) {
      typ = ascii(a, p, 4); len = u32le(a, p + 4);
      if (typ === "VP8X") { anim = !!(a[p + 8] & 2); r.w = 1 + u24le(a, p + 12); r.h = 1 + u24le(a, p + 15); }
      else if (typ === "ANMF") { r.frames++; r.dur += u24le(a, p + 8 + 12); }
      p += 8 + len + (len & 1);
    }
    r.animated = anim && r.frames > 1; return r;
  }
  return r;
}
function readAnimFile(blob, cb) {
  if (blob.size > ANIM_UP_MAX) { cb(null, { error: "檔案 " + _yzKbText_(blob.size) + "，超過上限 6 MB（Apps Script 一次收得下的大小）。請縮短秒數或縮小尺寸再傳。" }); return; }
  var fr = new FileReader();
  fr.onerror = function () { cb(null, { error: "讀不到這個檔案" }); };
  fr.onload = function () {
    var info = sniffAnim(fr.result);
    if (!info.fmt) { cb(null, { error: "這不是 GIF／APNG／WebP 動畫檔" }); return; }
    if (!info.animated) { cb(null, { error: "這個檔案只有一格，不會動。靜止的圖請用「＋圖片」" }); return; }
    var u8 = new Uint8Array(fr.result), bin = "", CH = 0x8000;
    for (var i = 0; i < u8.length; i += CH) bin += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
    var uri = "data:" + (info.fmt === "gif" ? "image/gif" : info.fmt === "webp" ? "image/webp" : "image/png") + ";base64," + btoa(bin);
    var img = new Image();
    img.onload = function () {
      var w = info.w || img.naturalWidth || 1, hh = info.h || img.naturalHeight || 1, sc = Math.min(1, 1024 / Math.max(w, hh));
      var cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(w * sc)); cv.height = Math.max(1, Math.round(hh * sc));
      var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
      info.poster = cv.toDataURL("image/jpeg", 0.85); info.w = w; info.h = hh; info.bytes = blob.size;
      cb(uri, info);
    };
    img.onerror = function () { cb(null, { error: "這個動畫檔打不開" }); };
    img.src = uri;
  };
  fr.readAsArrayBuffer(blob);
}
function animInfoText(b) {
  var p = [_yzFmtName_(b.fmt), _yzKbText_(b.bytes || 0)];
  if (b.w && b.h) p.push(b.w + "×" + b.h);
  if (b.frames > 1) p.push(b.frames + " 格");
  if (b.dur > 0) p.push((b.dur / 1000).toFixed(1) + " 秒");
  return p.join("・") + (b.demo ? "（示範檔：程式畫的，不是真的 " + _yzFmtName_(b.fmt) + "）" : "");
}
var ANIM_UP_MAX = 6 * 1024 * 1024;

function animEditor(t, b) {
  var wrap = h("div", { class: "animE" });
  var seg = h("div", { class: "seg wseg" });
  [["file", "動畫檔（GIF／APNG／WebP）"], ["steps", "分步動畫（幾張圖輪流）"]].forEach(function (p) {
    var x = h("button", { class: b.kind === p[0] ? "on" : "", "data-k": p[0], type: "button" }, [p[1]]);
    x.onclick = function () {
      if (b.kind === p[0]) return;
      b.kind = p[0];
      if (p[0] === "steps" && !(b.steps && b.steps.length)) b.steps = [{ url: "", cap: "", ar: "4:3" }, { url: "", cap: "", ar: "4:3" }];
      renderForm(); changed();
    };
    seg.appendChild(x);
  });
  wrap.appendChild(h("div", { class: "wrow" }, [seg, mkEl(17)]));
  if (b.kind === "steps") { animStepsEditor(wrap, b); return wrap; }

  var st = h("div", { class: "animst" });
  function paintSt() {
    st.innerHTML = "";
    if (!b.url) return;
    var why = _yzAnimWhy_(b, 0), mode = _yzAnimMode_(b, 0), m = [];
    if (mode === "play") m.push(["ok", "✓ LINE 卡片上：" + why.why + "。"]);
    else if (mode === "poster") m.push(["note", "ℹ LINE 卡片上：" + (YZ_CFG.animDirect ? why.why : "設定裡「動畫直接在 LINE 卡片上播放」是關的，所以只顯示第一格＋「▶ 在網頁看動畫」按鈕") + "。"]);
    else m.push(["note", "ℹ 設定裡「圖片直接顯示」是關的：LINE 卡片上連第一格都不顯示，只有「🎞 登入網頁看動畫」按鈕。"]);
    m.push(["note", "網頁上：會自動播放，可以暫停；手機有開「減少動態效果」的人，先停住、按「▶ 播放」才會動。"]);
    m.forEach(function (x) { st.appendChild(h("div", { class: "tw " + x[0] }, [x[1]])); });
  }
  var dz = dropZone({
    accept: "image/gif,image/png,image/webp",
    empty: "把動畫檔（GIF／APNG／WebP）拖進來　／　點下面選擇檔案",
    bad: "這不是 GIF／APNG／WebP 檔", done: "動畫放進來了（沒有重新壓縮，所以還是會動；存檔名稱改成亂碼）",
    ok: function (f) { return /^image\/(gif|png|webp)$/.test(f.type || "") || /\.(gif|png|apng|webp)$/i.test(f.name || ""); },
    reader: readAnimFile,
    get: function () { return b.url; }, shown: function () { return b.poster || b.url; },
    fnText: function () { return animInfoText(b) + "　存檔名稱（亂碼）：" + (b.fname || "—") + "　原檔名不保存"; },
    upload: function (uri, info) {   // 原檔（不重新壓縮，才會動）＋第一格（JPEG，LINE 卡片放不下動畫時用）
      var mime = info.fmt === "gif" ? "image/gif" : info.fmt === "webp" ? "image/webp" : "image/png";
      var u2 = uri.replace(/^data:[^;,]+;/, "data:" + mime + ";");
      return uploadUri(u2, "動畫").then(function (r1) {
        return uploadUri(info.poster, "動畫第一格").then(function (r2) {
          b.url = r1.raw; b.raw = r1.raw; b.fid = r1.fid; b.fname = r1.fname; b.poster = r2.url;
          b.fmt = info.fmt; b.bytes = info.bytes; b.w = info.w; b.h = info.h; b.frames = info.frames; b.dur = info.dur;
          b.ar = _yzAR_(info.w, info.h); b.demo = false; paintSt(); changed();
        });
      });
    },
    clear: function () { b.url = ""; b.raw = ""; b.fid = ""; b.fname = ""; b.poster = ""; b.fmt = ""; b.bytes = 0; b.w = 0; b.h = 0; b.frames = 0; b.dur = 0; b.demo = false; paintSt(); changed(); }
  });
  wrap.appendChild(dz.el);
  wrap.appendChild(st);
  var cap = h("input", { class: "in", value: b.cap || "", placeholder: "圖說（可以不填）", style: "margin-top:6px" });
  cap.oninput = function () { b.cap = cap.value; changed(); };
  wrap.appendChild(cap);
  wrap.appendChild(hint("要讓動畫在 LINE 卡片上自己動：存成 APNG、300 KB 以內、最長邊 1024 px 以內（可以縮短秒數、縮小尺寸、減少顏色）。GIF 和太大的檔，LINE 卡片只顯示第一格，旁邊放「▶ 在網頁看動畫」按鈕，網頁上照樣會動。"));
  wrap.appendChild(hint("⚠ 保密：有院內畫面的螢幕錄影，上傳前請先裁掉或遮住院名和病人資料（系統認不出來）；也不要拿去網路上的轉檔網站，內容會被送到外面。"));
  paintSt();
  return wrap;
}
function animStepsEditor(wrap, b) {
  var list = h("div", { class: "steplist" }), cnt = h("span", { class: "muted" }), add;
  function drawSteps() {
    list.innerHTML = "";
    b.steps.forEach(function (s, i) {
      var dz = dropZone({
        kind: "圖片",
        get: function () { return s.url; }, info: function () { return s.info; }, fname: function () { return s.fname; },
        empty: "把這一步的圖拖進來／點選擇檔案（也可以不放圖，只寫說明）",
        set: function (r, info) { s.url = r.url; s.fid = r.fid; s.fname = r.fname; s.info = info; s.ar = _yzAR_(info.w, info.h); edOcrNew(s); changed(); },
        clear: function () { s.url = ""; s.fid = ""; s.info = null; delete s.ocr; changed(); ocrPaint(); }
      });
      var ta = h("textarea", { class: "ta", rows: "2", placeholder: "這一步的說明（可以不填）" }); ta.value = s.cap || "";
      ta.oninput = function () { s.cap = ta.value; changed(); };
      var mv = function (d) { var j = i + d; if (j < 0 || j >= b.steps.length) return; var x = b.steps[i]; b.steps[i] = b.steps[j]; b.steps[j] = x; drawSteps(); changed(); };
      list.appendChild(h("div", { class: "steprow" }, [
        h("div", { class: "stepno" }, ["步驟 " + (i + 1)]),
        h("div", { class: "stepmain" }, [dz.el, ta, ocrLine(s)]),
        h("div", { class: "kbt" }, [btn("▲", function () { mv(-1); }), btn("▼", function () { mv(1); }), btn("✕", function () { b.steps.splice(i, 1); drawSteps(); changed(); }, "sm bad")])
      ]));
    });
    add.disabled = b.steps.length >= YZ_STEPS_MAX;
    cnt.textContent = b.steps.length + " 步（最多 " + YZ_STEPS_MAX + " 步）";
  }
  add = btn("＋新增一步", function () {
    if (b.steps.length >= YZ_STEPS_MAX) return;
    b.steps.push({ url: "", cap: "", ar: "4:3" }); drawSteps(); changed();
    var tas = $$(".steprow textarea", wrap); if (tas.length) tas[tas.length - 1].focus();
  });
  var sec = h("select", { class: "in", style: "width:auto" }, [1, 2, 3, 5].map(function (n) { return h("option", { value: String(n) }, ["每一步停 " + n + " 秒"]); }));
  sec.value = String(b.sec || 2); sec.onchange = function () { b.sec = +sec.value; changed(); };
  var lp = h("input", { type: "checkbox", checked: b.loop !== false });
  lp.onchange = function () { b.loop = lp.checked; changed(); };
  drawSteps();
  wrap.appendChild(list);
  wrap.appendChild(h("div", { class: "stepopt" }, [add, cnt, sec, h("label", {}, [lp, " 播完回到第一步（反覆播）"])]));
  wrap.appendChild(hint("LINE 上：每一步是一張卡片，左右滑著看（LINE 卡片沒辦法自己輪流播）。網頁上：自動輪播，可以暫停、上一步、下一步；手機有開「減少動態效果」的人先停在第一步。圖和檔名的處理跟「＋圖片」一樣（縮到 1600、轉 JPEG、檔名亂碼）。"));
}

/* ───────── 預覽：彈出視窗（可以拖、可以拉大、可以放到最大、可以關） ───────── */
function pvSync() {
  var w = $("#pvwin"); if (!w) return;
  var tab = $(".tab[aria-selected=true]");
  w.style.display = (tab && tab.getAttribute("data-t") === "edit" && PV.open) ? "flex" : "none";
  placePv();
}
function placePv() {
  var w = $("#pvwin"); if (!w || w.style.display === "none") return;   // 還沒顯示（在別的分頁）就先不排位置，等真的打開再排
  if (PV.max) { w.style.left = "12px"; w.style.top = "12px"; w.style.width = (innerWidth - 24) + "px"; w.style.height = (innerHeight - 24) + "px"; }
  else {
    var W = Math.min(PV.w, innerWidth - 16), H = Math.min(PV.h, innerHeight - 16);
    if (PV.x === null) {   // 第一次：放在最上面兩排工具列的下面（不蓋住格式按鍵），高度配合螢幕
      var tbw = $("#edtbw"), tabsH = ($("#hdr") || {}).offsetHeight || 58, top = tbw ? tabsH + tbw.offsetHeight + 8 : 110;
      PV.y = Math.max(110, Math.min(top, innerHeight - 380));
      PV.h = Math.min(PV.h, Math.max(360, innerHeight - PV.y - 12)); H = Math.min(PV.h, innerHeight - 16);
      PV.x = Math.max(8, innerWidth - W - 24);
    }
    PV.x = Math.min(Math.max(0, PV.x), Math.max(0, innerWidth - 80)); PV.y = Math.min(Math.max(0, PV.y), Math.max(0, innerHeight - 40));
    w.style.left = PV.x + "px"; w.style.top = PV.y + "px"; w.style.width = W + "px"; w.style.height = H + "px";
  }
  w.classList.toggle("max", PV.max);
}
function buildPvWin() {
  var old = $("#pvwin"); if (old) old.remove();
  var seg = h("div", { class: "seg", id: "pvseg" });
  [["line", "LINE 卡片"], ["web", "網頁"]].forEach(function (p) {
    var b = h("button", { class: ED.view === p[0] ? "on" : "", "data-v": p[0] }, [p[1]]);
    b.onclick = function () { ED.view = p[0]; $$("button", seg).forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-v") === ED.view); }); renderSizeCtl(); refreshPreview(); };
    seg.appendChild(b);
  });
  var w = h("div", { id: "pvwin", class: "pvwin", role: "dialog", "aria-label": "預覽" }, [
    h("div", { class: "pvh", id: "pvh", title: "按住這一排可以拖動視窗" }, [
      h("b", {}, ["預覽"]), mkEl(16), h("span", { class: "muted pvsub" }, ["改一個字，這裡馬上跟著變"]), h("span", { class: "sp" }), seg,
      h("button", { class: "btn sm", id: "pvMax", title: "放到最大／還原" }, ["⛶"]), h("button", { class: "btn sm", id: "pvClose", title: "關閉預覽視窗（用最上面的 👁 可以再打開）" }, ["✕"])
    ]),
    h("div", { class: "pvc", id: "pvc" }, [h("div", { id: "pvsize" }), h("div", { id: "pvbody", style: "margin-top:8px" }), h("div", { id: "pvmeter", style: "margin-top:10px" })])
  ]);
  document.body.appendChild(w);
  $("#pvMax").onclick = function () { PV.max = !PV.max; placePv(); refreshPreview(); };
  $("#pvClose").onclick = function () { PV.open = false; pvSync(); renderToolbar(); };
  var hd = $("#pvh");
  hd.addEventListener("pointerdown", function (e) {
    if (PV.max || (e.target.closest && e.target.closest("button,select,input"))) return;
    var r = w.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    try { hd.setPointerCapture(e.pointerId); } catch (x) { /* 沒關係 */ }
    var mv = function (ev) { PV.x = ev.clientX - dx; PV.y = ev.clientY - dy; placePv(); };
    var up = function () { hd.removeEventListener("pointermove", mv); hd.removeEventListener("pointerup", up); hd.removeEventListener("pointercancel", up); };
    hd.addEventListener("pointermove", mv); hd.addEventListener("pointerup", up); hd.addEventListener("pointercancel", up);
  });
  if (window.ResizeObserver) {
    var last = 0;
    new ResizeObserver(function () {
      if (PV.max || w.style.display === "none") return;
      if (w.offsetWidth < 100) return;
      PV.w = w.offsetWidth; PV.h = w.offsetHeight;
      cancelAnimationFrame(last); last = requestAnimationFrame(function () { refreshPreview(); });
    }).observe(w);
  }
  window.addEventListener("resize", placePv);
}
function renderSizeCtl() {
  var box = $("#pvsize"); if (!box) return; box.innerHTML = "";
  if (ED.cur.kind === "map") {   // 目錄圖：LINE 卡片大小（決定每個地點在手機上有多大）／網頁寬度
    if (ED.view === "line") {
      box.appendChild(lbl("二", "LINE 卡片大小（目錄圖）", mk(6)));
      box.appendChild(h("div", { class: "ends" }, [h("span", {}, ["◂ LINE 最小"]), h("span", {}, ["LINE 最大 ▸"])]));
      box.appendChild(sizeSeg(ED.cat.size || "giga", function (s) { ED.cat.size = s; changed(); }));
      box.appendChild(hint("卡片越小，圖上的地點在手機上越小、越不好點；右邊「檢查」會用這個大小幫你算。"));
    } else {
      box.appendChild(lbl("二", "網頁目錄圖寬度", mk(6)));
      box.appendChild(rangeRow(320, 1200, ED.cat.web || 960, "px", function (v) { ED.cat.web = v; changed(); }));
    }
    return;
  }
  var isCh = ED.cur.kind === "ch", t = ED.cur.kind === "title" ? edTitle(ED.cur.id) : null;
  if (!isCh && !t) return;
  if (ED.view === "line") {
    box.appendChild(lbl("二", isCh ? "LINE 卡片大小（所有章元共用）" : "LINE 卡片大小", mk(6)));
    box.appendChild(h("div", { class: "ends" }, [h("span", {}, ["◂ LINE 最小"]), h("span", {}, ["LINE 最大 ▸"])]));
    box.appendChild(sizeSeg(isCh ? ED.cfg.chSize : (t.size || "giga"), function (s) {
      if (isCh) { ED.cfg.chSize = s; ED.chapters.forEach(function (x) { x.size = s; }); } else t.size = s;
      changed();
    }));
  } else {
    box.appendChild(lbl("二", isCh ? "網頁章元卡片寬度（所有章元共用）" : "網頁內容寬度", mk(6)));
    var min = isCh ? 160 : 320, max = isCh ? 320 : 860, val = isCh ? ED.cfg.chWeb : (t.ww || 760);
    box.appendChild(rangeRow(min, max, val, "px", function (v) { if (isCh) ED.cfg.chWeb = v; else t.ww = v; changed(); }));
  }
}
function meterRow(label, bytes, cap) {
  var pct = bytes / cap * 100, cls = "meter" + (bytes > cap ? " over" : pct > 80 ? " warn" : "");
  return h("div", { class: "mrow" }, [h("span", {}, [label]), h("div", { class: cls }, [h("i", { style: "width:" + Math.min(100, pct).toFixed(0) + "%" })]), h("span", { class: "num" }, [kb(bytes) + " / " + kb(cap)])]);
}
function refreshPreview() {
  var body = $("#pvbody"), meter = $("#pvmeter"); if (!body) return;
  if (PV.pano) { PV.pano.destroy(); PV.pano = null; }   // 3D 目錄：重畫前先收掉
  body.innerHTML = ""; meter.innerHTML = "";
  var seg = $$("#pvseg button"); seg.forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-v") === ED.view); });
  var pvw = $("#pvc").clientWidth || 380;
  var stackOf = function (bubbles) { var st = h("div", { class: "pvstack" }); bubbles.forEach(function (b) { st.appendChild(FlexView.render(b, {})); }); return h("div", { class: "pvwrap" }, [st]); };
  if (ED.cur.kind === "mq") {
    if (ED.view === "line") { body.appendChild(h("div", { class: "pvempty" }, ["LINE 沒有跑馬燈（只有網頁有）。", "切到上面的「網頁」看樣子。"])); return; }
    body.appendChild(h("div", { class: "mqpv", style: "padding:10px" }, [mqPreview(edMq())]));
    return;
  }
  if (ED.cur.kind === "map") {
    var cat = ED.cat, cw = cat.web || 760;
    if (!cat.img || !cat.on) {
      body.appendChild(h("div", { class: "pvempty" }, [!cat.img ? "還沒有目錄圖。" : "「開啟目錄圖」關掉了。", "這時候 LINE 的「🏠 首頁」和網頁的首頁，都會改回章元卡片。"]));
      return;
    }
    var pcat = _yzMapLive_(cat, edHb(), false);   // 預覽＝藥師看到的樣子（還沒有標題的章是🔒）
    if (ED.view === "line") {
      var lm = lineMap(pcat, edHb(), {});
      body.appendChild(h("div", { class: "pvwrap" }, [FlexView.render(lm.bubble, {})]));
      if (lm.split) {
        lm.each.forEach(function (by, k) { meter.appendChild(meterRow(k ? "右半張" : "左半張", by, YZ_BUBBLE_SAFE)); });
        meter.appendChild(meterRow("兩張一排（一則）", lm.bytes, YZ_MSG_SAFE));
        meter.appendChild(hint("圖很寬，所以 LINE 上切成左右兩張，左右滑著看（中間重疊一點，中間附近的東西兩張都看得到）。每個按鍵照「圓點在哪一半」放到那一張。切好的兩張圖是自動做的，檔名一樣亂碼。"));
      } else meter.appendChild(meterRow("這一張", lm.bytes, YZ_BUBBLE_SAFE));
      meter.appendChild(hint("每個地點＝透明的「物品框」＋「標籤方塊」（圖示＋名稱＋圓點），兩個都點得到。是照 LINE 官方規格畫的；手機上實際長相要實機確認（待實機確認）。LINE 沒有「滑過」、也沒有 3D，滑過、說明卡、拖曳轉動只有網頁有（切到「網頁」看）。「圖片直接顯示」關掉時，圖不放，改成每個地點一個按鈕。"));
    } else if (panoOk(cat) && edCatSrc()) {
      var pvb = h("div", { class: "pvpano" }); body.appendChild(pvb);
      var pw2 = webCatalogPano(pvb, pcat, edHb(), { img: edCatSrc(), onSpot: function (to) { var i3 = _yzMapToInfo_(to, edHb()); toast("（預覽：這裡會跳到　" + (i3.ok ? i3.name : "（找不到）") + "）"); } });
      if (pw2) PV.pano = pw2._api;
      meter.appendChild(hint("3D 環景：拖曳＝左右轉、上下看；滾輪（手機兩指）＝放大縮小；下面一排按鍵也可以。滑鼠移到按鍵或東西上：標籤變橘紅、畫面往那邊靠、出現說明卡；按說明卡（或再點一下）才進去。手機上：第一下＝選到（畫面轉過去），第二下＝進去。不支援 3D 的電腦，會自動改回平面的圖。"));
    } else {
      var mb = h("div", { class: "pvweb", style: "width:" + (cw + 26) + "px;max-width:none" }, [webCatalogMap(pcat, edHb(), { width: cw, onSpot: function (to) { var i2 = _yzMapToInfo_(to, edHb()); toast("（預覽：這裡會跳到　" + (i2.ok ? i2.name : "（找不到）") + "）"); } })]);
      var mz = Math.min(1, (pvw - 28) / (cw + 26)); if (mz < 1) mb.style.zoom = mz.toFixed(3);
      body.appendChild(h("div", { class: "pvwebwrap" }, [mb]));
      meter.appendChild(hint((cat.fx !== false ? "滑鼠移到標籤或東西上：標籤變橘紅、鏡頭靠近、底下出現說明卡；按說明卡（或再點一下）才進去。手機上：第一下＝選到，第二下＝進去。" : "動態效果關掉了：滑過只會讓標籤變色。") + (mz < 1 ? "（這裡縮小到 " + Math.round(mz * 100) + "% 顯示，實際寬度 " + cw + " px）" : "")));
    }
    return;
  }
  if (ED.cur.kind === "ch") {
    var c = edCh(ED.cur.id); if (!c) return;
    var n = (ED.titles[c.id] || []).length;
    if (ED.view === "line") {
      var lc = lineChapter(edChI(c), n);
      body.appendChild(h("div", { class: "pvwrap" }, [FlexView.render(lc.bubble, {})]));
      meter.appendChild(meterRow("這一張", lc.bytes, YZ_BUBBLE_SAFE));
      var fakeAll = ED.chapters.map(function (x) { return Object.assign({}, x, { img: _yzChBg_(x) ? fakeUrl(0) : "", bg: null }); });
      meter.appendChild(meterRow(ED.chapters.length + " 張一排", _yzBytes_(_yzChapterList_(fakeAll, edCounts())), YZ_MSG_SAFE));
      meter.appendChild(hint("LINE：一排最多 12 張、一則訊息不能超過 50 KB。"));
    } else body.appendChild(h("div", { class: "pvwebwrap" }, [webChapterCard(c, n, { width: ED.cfg.chWeb, hb: edHb() })]));
    return;
  }
  var t = edTitle(ED.cur.id); if (!t) return;
  var ch = edCh(t.ch), ts = ED.titles[ch.id], i = ts.indexOf(t);
  if (ED.view === "line") {
    var r = lineCards(edChI(ch), t, { hb: edHb(), size: t.size, dev: true, editUrl: YZ_CFG.webUrl + "?edit=1", prev: i > 0 ? "x" : null, next: i < ts.length - 1 ? "x" : null });
    body.appendChild(stackOf(r.bubbles));
    r.bytes.forEach(function (by, kk) {
      var car = r.kinds && r.kinds[kk] === "carousel", nn = car ? r.bubbles[kk].contents.length : 1;
      meter.appendChild(meterRow(car ? "第 " + (kk + 1) + " 則（" + nn + " 張，左右滑）" : "第 " + (kk + 1) + " 則（1 張）", by, car ? YZ_MSG_SAFE : YZ_BUBBLE_SAFE));
    });
    var tot2 = 0; r.bytes.forEach(function (x) { tot2 += x; });
    var nBrk = (t.blocks || []).filter(function (b, bi) { return bi > 0 && b.brk; }).length;
    meter.appendChild(hint("這個標題 ＝ " + r.cards + " 張卡片" + (r.cards > 1 ? "（兩張以上：左右滑）" : "") + "，" + r.bubbles.length + " 則訊息（共 " + kb(tot2) + "）。" + (nBrk ? "其中 " + nBrk + " 處是你按了「📄 換下一張」。" : "太擠的話，在要換到下一張的那一塊按「📄 換下一張」。") + "一張卡片的上限 LINE 是約 30 KB，我抓 27 KB 留空，超過也會自動拆成下一張。" + (r.bubbles.length > YZ_REPLY_MAX ? " ⚠ LINE 一次回覆最多 5 則訊息，第 6 則以後會被截掉：內容太多了，請把一部分分到別的標題。" : "")));
    if (YZ_SIZES.indexOf(t.size || "giga") < YZ_SIZES.indexOf("kilo")) meter.appendChild(hint("⚠ 小於 kilo 的卡片很窄，放表格或長文字會很擠（看上面預覽）。"));
    (t.blocks || []).forEach(function (b, bi) {
      if (b.t !== "table") return;
      var cc = _yzTableCheck_(b, t.size || "giga");
      if (cc.tooWide) meter.appendChild(h("div", { class: "tw bad" }, ["⚠ 第 " + (bi + 1) + " 塊（表格）在「" + (t.size || "giga") + "」放不下，欄位被擠到很窄（可用約 " + cc.avail + " px，最少要 " + cc.minTotal + " px）。"]));
    });
    if (r.anim) meter.appendChild(hint("🎞 這個標題有 " + r.anim + " 張會在 LINE 卡片上自己動的圖（LINE 規定一則訊息最多 " + YZ_ANIM_PER_MSG + " 張，多的會改成第一格＋按鈕）。"));
    var ni = (t.blocks || []).filter(function (b) { return b.t === "img" && b.url; }).length;
    if (ni) meter.appendChild(hint("圖片 " + ni + " 張：存檔前會自動縮到最長邊 1600、轉成 JPEG（LINE 規定一張圖不能超過 1 MB）。卡片大小上限算的是網址，不是圖檔本身。"));
  } else {
    var wd = t.ww || 760;
    var art = webArticle(ch, t, { width: wd, onImg: lightbox, hb: edHb(), onTitle: function () { toast("（預覽：這裡會跳到那個標題）"); }, onChapter: function () { toast("（預覽：這裡會跳到那一章）"); } });
    var box = h("div", { class: "pvweb" }, [art]);
    box.style.width = (wd + 26) + "px";
    var z = Math.min(1, (pvw - 28) / (wd + 26)); if (z < 1) box.style.zoom = z.toFixed(3);
    body.appendChild(h("div", { class: "pvwebwrap" }, [box]));
    if (z < 1) meter.appendChild(hint("這裡縮小到 " + Math.round(z * 100) + "% 顯示（實際寬度 " + wd + " px）。"));
    meter.appendChild(h("div", { style: "margin-top:6px" }, [btn("🔍 用實際大小看", function () { bigWebPreview(ch, t); })]));
  }
}
function bigWebPreview(ch, t) {
  var w = t.ww || 760;
  var box = h("div", { class: "pvweb", style: "width:" + (w + 26) + "px;max-width:none;max-height:none;margin:0 auto" }, [webArticle(ch, t, { width: w, onImg: lightbox, hb: edHb(), onTitle: function () { toast("（預覽：這裡會跳到那個標題）"); }, onChapter: function () { toast("（預覽：這裡會跳到那一章）"); } })]);
  var ov = h("div", { class: "bigov", onclick: function (e) { if (e.target === ov) ov.remove(); } }, [
    h("div", { class: "bigbar" }, [h("b", {}, ["網頁實際大小（內容寬 " + w + " px）"]), h("span", { style: "flex:1" }), btn("關閉", function () { ov.remove(); }, "sm pri")]),
    h("div", { class: "bigbody" }, [box])
  ]);
  document.body.appendChild(ov);
}
function renderEdit() { renderToolbar(); renderTree(); renderForm(); renderSizeCtl(); refreshPreview(); pvSync(); }
function gotoEdit(tid) { if (!ED) edReset(); if (edTitle(tid)) { ED.cur = { kind: "title", id: tid }; ED.mode = "ch"; ED.ab = null; } showTab("edit"); }
function edTitleExists(tid) { if (!ED) edReset(); return !!edTitle(tid); }
// 閒置登出時：還沒存的修改留在記憶體（不存進瀏覽器），重新驗證後接著編輯
function edKeep() { return { chapters: ED.chapters, titles: ED.titles, kws: ED.kws, cat: ED.cat, rev: ED.rev, cur: ED.cur, mode: ED.mode, cfg: ED.cfg, restore: ED.restore }; }
function edRestore(k) { edReset(); ED.chapters = k.chapters; ED.titles = k.titles; ED.kws = k.kws; ED.cat = k.cat; ED.rev = k.rev; ED.cfg = k.cfg; ED.dirty = true; ED.restore = k.restore || null; if (ED.restore) AS.pause = "restore"; edPick(k.cur, k.mode); asKick(); }
// 看的那邊拿到新的手冊（別人改了）：編輯器沒改東西就換成新的；有改就留著（存的時候會問要不要蓋掉）
function edBaseChanged() { if (!ED || ED.dirty || ED.saving || UPL) return; var cur = ED.cur, mode = ED.mode; edReset(); edPick(cur, mode); if (TAB === "edit") renderEdit(); }
// 目錄圖的圖（3D 預覽要用原始檔）：剛放進來還沒存的 → 瀏覽器裡那一份；手冊裡存的那一張 → 向後端拿
function edCatSrc() {
  var cat = ED.cat;
  if (ED.catLocal && ED.catLocal.fid === cat.fid) return ED.catLocal.url;
  if (HB && HB.cat && cat.fid && cat.fid === HB.cat.fid) return catBlob(HB.cat, function () { if (ED && ED.cur.kind === "map" && ED.view === "web") refreshPreview(); }) || "";
  return "";
}

function buildEditPane() {
  edReset();
  var pane = $("#pane-edit");
  pane.innerHTML = '<p class="sub">最上面一排是工具列（🕘 舊版本、儲存、新增內容，捲到哪裡都在）；左邊選章元／標題（或「🖼 目錄圖」）；中間填內容；預覽是浮動視窗。<b>有修改會自動儲存</b>（停手 3 秒就存，最上面的「自動存檔」可以關掉），存好 LINE 和網頁就看得到。</p>' +
    '<div class="edwrap"><div class="edtbw" id="edtbw"><div class="edtb" id="edtb"></div><div class="edfmt" id="edfmt"></div></div><div class="edgrid"><div class="c1" id="edc1"></div><div class="c2" id="edc2"></div></div></div>';
  RTE.cur = null; RTE.pop = null; RTE.bar = null;
  $("#edfmt").appendChild(rteBuildBar());
  buildPvWin();
  asInit();
  ED_OPENED = false;
  renderEdit();
}
// 第 28 批：第一次打開「✏️ 編輯」（不是一進網頁就做；只看手冊的時候不會跳出提醒、不會存檔）：
//   ① 還沒辨識的圖，在背景辨識；② 自動存檔開著、有章元背景或物品形狀還沒做（例如這一批「覆核」多亮電腦）：自動做好、存好（不用按「儲存」）
var ED_OPENED = false;
function edOnShow() {
  if (!ED || ED_OPENED) return;
  ED_OPENED = true;
  edOcrPump();
  setTimeout(function () { if (ED && TAB === "edit" && AS.on && !AS.pause && !ED.dirty && !ED.saving && !UPL && (edShapeNeed() || edBgTodo().length)) saveEd(false, true); }, 1500);
}

/* ── 編輯的第三個分頁「🖼 目錄圖」：換圖、在圖上拖拉框出「可以點的地方」（LINE 卡片的畫法在 cards.js）── */
function edSpot(id) { var a = ED.cat.spots; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
// 選一個地點。不重畫整頁（拖拉到一半不能把畫面換掉）：只換框框的高亮、右邊的面板、左邊的清單
function mapPick(id) {
  ED.cur = { kind: "map", id: id || "" }; ED.mode = "map";
  if (ED.mapUi) { ED.mapUi.onPick(); renderTree(); } else renderEdit();
}
function mapAdd(cx, cy) {
  var cat = ED.cat, first = ED.chapters[0], w = 14, hh = 20;
  var x = cx === undefined ? 40 : Math.round(cx - w / 2), y = cy === undefined ? 35 : Math.round(cy - hh / 2);
  x = Math.max(0, Math.min(100 - w, x)); y = Math.max(0, Math.min(100 - hh, y));
  var s = { id: "p" + Date.now() + cat.spots.length, label: "新地點", to: first ? "c:" + first.id : "", x: x, y: y, w: w, h: hh, pos: "t", ico: "", desc: "", st: "" };
  cat.spots.push(s); markDirty(); ED.cur = { kind: "map", id: s.id }; ED.mode = "map"; renderEdit();
}
// 左邊清單的 ⚠／✖ 小記號：直接改，不重畫整個清單（重畫會讓「剛好在點清單」的那一下點不到）
function mapTreeBadges() {
  var chk = _yzMapCheck_(ED.cat, edHb());
  $$("#edc1 .spi").forEach(function (el) {
    var id = el.getAttribute("data-id"), lv = mapIssueLv(chk, id), b = $(".spw", el);
    if (!lv) { if (b) b.remove(); return; }
    if (!b) { b = h("span", { class: "spw" }); el.appendChild(b); }
    b.className = "spw " + lv; b.title = (chk.spots[id] || []).map(function (x) { return x.msg; }).join("\n"); b.textContent = lv === "bad" ? "✖" : "⚠";
  });
}
function mapIssueLv(chk, id) { var a = chk.spots[id] || []; return a.some(function (x) { return x.lv === "bad"; }) ? "bad" : a.length ? "warn" : ""; }

/* ── 左邊：地點清單 ── */
function renderMapTree(c1) {
  var cat = ED.cat, hb = edHb(), chk = _yzMapCheck_(cat, hb);
  c1.appendChild(h("div", { class: "chT kwi" + (!ED.cur.id ? " on" : ""), onclick: function () { mapPick(""); } }, ["🖼 " + (cat.title || "目錄圖") + "　（圖與設定）"]));
  c1.appendChild(lbl("", "圖上的地點（" + cat.spots.length + "　／　LINE 最多放 " + YZ_MAP_MAX + " 個）"));
  cat.spots.forEach(function (s, i) {
    var info = _yzMapToInfo_(s.to, hb), lv = mapIssueLv(chk, s.id), iss = (chk.spots[s.id] || []).map(function (x) { return x.msg; }).join("\n");
    c1.appendChild(h("div", { class: "chT kwi spi" + (ED.cur.id === s.id ? " on" : ""), "data-id": s.id, onclick: function () { mapPick(s.id); } }, [
      h("span", { class: "spn" }, [String(i + 1)]),
      h("span", { class: "spt" }, [(s.st === "lock" ? "🔒 " : s.ico ? s.ico + " " : "") + (s.label || "（沒有名稱）") + (s.st === "new" ? " 🔴" : ""), h("span", { class: "muted spto" }, [s.st === "lock" && !info.ok ? " → （尚未開放）" : " → " + (info.ok ? info.short : "找不到")])]),
      lv ? h("span", { class: "spw " + lv, title: iss }, [lv === "bad" ? "✖" : "⚠"]) : null
    ]));
  });
  if (!cat.spots.length) c1.appendChild(h("div", { class: "muted", style: "padding:6px 8px;font-size:12.5px" }, ["還沒有地點。按下面的「＋新增地點」，或在圖上快點兩下。"]));
  c1.appendChild(h("div", { style: "padding-top:8px" }, [btn("＋新增地點", function () { mapAdd(); })]));
}

/* ── 中間：圖、設定、拖拉框、這個地點的設定、檢查 ── */
function renderMapForm(f) {
  var cat = ED.cat, MIN = YZ_MAP_MIN_PCT, ui = { nums: null }; ED.mapUi = ui;
  f.appendChild(h("h3", { style: "font-size:16px" }, ["🖼 目錄圖", mkEl(25)]));
  f.appendChild(hint("LINE 和網頁的「首頁」（目錄）可以是一張實景圖（像你的「圖一」）：在圖上框出每一樣東西，每樣東西會有一個「標籤（圖示＋名稱）＋圓點」，點標籤或點東西，就進到那一章（或某一個標題）。網頁的首頁是整個畫面的 3D 環景（可以拖曳轉動、縮放）；LINE 上圖很寬就切成左右兩張。還沒有標題的章，藥師看到的是🔒（寫好第一個標題就自動打開）。"));

  // ① 圖
  f.appendChild(lbl("", "目錄圖片（圖片檔名自動換成亂碼）"));
  var dz = dropZone({
    max: 2000,
    get: function () { return cat.img; }, info: function () { return cat.info; }, fname: function () { return cat.fname; },
    empty: "把目錄圖拖進來　／　點這裡之後按 Ctrl+V 貼上",
    done: "目錄圖放好了（檔名換成亂碼；很寬的圖也切好了左右兩張給 LINE 用）。按「儲存」才會生效",
    upload: function (uri, info) {   // 原圖（最長邊 2000）＋很寬的話切好的左右兩張，一起上傳
      var had = !!cat.img;
      return uploadUri(uri, "目錄圖").then(function (r) {
        return catPartsUp(uri, info).then(function (parts) {
          cat.img = r.url; cat.fid = r.fid; cat.fname = r.fname; cat.info = info; cat.w = info.w; cat.h = info.h; cat.ar = _yzAR_(info.w, info.h); cat.parts = parts;
          if (!had) cat.on = true;   // 第一次放圖：順便打開「開啟目錄圖」（不想用再取消勾選）
          ED.catLocal = { fid: r.fid, url: uri };
          syncOn(); markDirty(); drawCanvas(); changed(); renderTree(); queueShape(edSpot(ED.cur.id));
        });
      });
    },
    clear: function () { cat.img = ""; cat.fid = ""; cat.info = null; cat.fname = ""; cat.parts = []; cat.on = false; syncOn(); markDirty(); drawCanvas(); changed(); renderTree(); }
  });
  var onBox = null;   // 「開啟目錄圖」那一格（放圖、移除圖的時候，勾勾跟著變）
  function syncOn() { var c = onBox && onBox.querySelector("input"); if (c) c.checked = !!cat.on; }
  f.appendChild(dz.el);
  f.appendChild(hint("換圖的時候，圖上框好的地點位置不會動（用的是「佔整張圖的幾 %」）；新的圖如果長寬比不一樣，請再檢查一下框的位置。手機（LINE）上圖只有約 340 px 寬，標籤很容易擠在一起：同一排的東西不要超過 4 個，或讓標籤一個放上面、一個放下面。圖裡面不要有醫院名稱、人臉、病人資料（檔名會換亂碼，但圖裡面的字不會動）——要用自己拍的照片，請先把這些蓋掉或模糊。"));

  // ② 設定
  function chkBox(label, get, set, note) {
    var c = h("input", { type: "checkbox" }); c.checked = !!get();
    c.onchange = function () { set(c.checked); c.checked = !!get(); drawCanvas(); changed(); };
    return h("label", { class: "mck" }, [c, h("span", {}, [h("b", {}, [label]), note ? h("span", { class: "muted mcn" }, ["　" + note]) : null])]);
  }
  onBox = chkBox("開啟目錄圖", function () { return cat.on; }, function (v) { if (v && !cat.img) { toast("先放一張目錄圖"); cat.on = false; return; } cat.on = v; }, "關掉：LINE 的「🏠 首頁」和網頁的首頁改回章元卡片");
  f.appendChild(h("div", { class: "mset" }, [
    onBox,
    chkBox("圖上顯示標籤（圖示＋名稱＋圓點）", function () { return cat.labels !== false; }, function (v) { cat.labels = v; }, "圖裡面已經有字的話，可以關掉（物品還是點得到）"),
    chkBox("網頁：3D 環景（拖曳轉動、上下看、縮放）", function () { return cat.p3d !== false; }, function (v) { cat.p3d = v; }, "圖很寬（像全景照）的時候最好看。電腦或手機不支援 3D 的時候，自動改回平面的圖"),
    chkBox("LINE：很寬的圖切成左右兩張", function () { return cat.split !== false; }, function (v) { cat.split = v; if (v && !_yzMapSplitOn_(cat) && cat.img) catPartsAgain(); }, "一張卡片會太矮、標籤擠在一起；切成兩張，左右滑著看（中間重疊一點）。圖不寬的時候沒有作用"),
    chkBox("網頁：圖淡一點（有按鍵的物品比較亮）", function () { return cat.dim !== false; }, function (v) { cat.dim = v; }, "整張圖的顏色淡一點，看起來比較不亂；框起來的物品留一半顏色。還沒開放（🔒）的章一直是淡的。LINE 的圖不變"),
    chkBox("網頁：滑過的動態效果", function () { return cat.fx !== false; }, function (v) { cat.fx = v; }, "滑到哪個按鍵，圖上那個物品就亮起來（手機：點一下）；還有標籤變色、畫面靠過去、底下的說明卡、飄浮光點、圓點光圈。只有網頁有，LINE 沒有「滑過」"),
    chkBox("圖下面加按鈕（備用）", function () { return !!cat.btns; }, function (v) { cat.btns = v; }, "每個地點一個按鈕。LINE 圖上的方塊萬一點不了，還有按鈕可以按" )
  ]));
  f.appendChild(h("div", { class: "msel2" }, [
    h("div", {}, [lbl("", "標題（卡片最上面的大字）"), (function () { var i = h("input", { class: "in", value: cat.title || "", maxlength: "20" }); i.oninput = function () { cat.title = i.value; renderTree(); changed(); }; return i; })()]),
    h("div", {}, [lbl("", "提示文字（標題下面的小字）"), (function () { var i = h("input", { class: "in", value: cat.hint || "", maxlength: "30" }); i.oninput = function () { cat.hint = i.value; changed(); }; return i; })()])
  ]));

  // ③ 拖拉
  f.appendChild(lbl("", "在圖上框出每一樣東西（虛線框＝物品框；圓點在框的正中間）", mk(26)));
  f.appendChild(hint("拖方框＝移動　拖四個角＝放大縮小　方向鍵＝微調 1%（Shift＋方向鍵＝調大小；加按 Alt＝一次 5%）　在圖上空白處快點兩下＝新增。標籤會擺在圓點的上／下／左／右（在下面「這個地點的設定」選）。"));
  var cv = h("div", { class: "mcv", id: "mcv" });
  f.appendChild(cv);
  var pn = h("div", { class: "mpanel", id: "mpanel" });
  f.appendChild(pn);
  var ck = h("div", { class: "mchk", id: "mchk" });
  f.appendChild(ck);

  function arStage() { return $(".catstage", cv); }
  function paintBox(bx, s) {
    bx.style.left = s.x + "%"; bx.style.top = s.y + "%"; bx.style.width = s.w + "%"; bx.style.height = s.h + "%";
    bx.className = bx.className.replace(/\b(pos|st)-\w+\b/g, "").replace(/\s+/g, " ").trim() + " pos-" + _yzMapPos_(s.pos) + (_yzMapSt_(s.st) ? " st-" + _yzMapSt_(s.st) : "");
  }
  function updateChip(bx, s) {   // 換掉圓點和標籤（名稱、圖示、狀態改了的時候）
    $$(".sp-dot, .sp-tag", bx).forEach(function (x) { x.remove(); });
    var first = $(".hnd", bx), n = _yzMapNorm_(s);
    webSpotTag(n, cat, false).forEach(function (k) { bx.insertBefore(k, first); });
    bx.setAttribute("aria-label", "地點 " + (cat.spots.indexOf(s) + 1) + "：" + (s.label || "沒有名稱"));
  }
  function spotBox(s, i) {
    var bx = h("div", { class: "mbx mspot" + (ED.cur.id === s.id ? " sel" : ""), "data-id": s.id, tabindex: "0", role: "button" });
    bx.appendChild(h("span", { class: "nn" }, [String(i + 1)]));
    ["nw", "ne", "sw", "se"].forEach(function (k) { bx.appendChild(h("i", { class: "hnd " + k, "data-h": k })); });
    paintBox(bx, s); updateChip(bx, s);
    return bx;
  }
  function drawCanvas() {
    cv.innerHTML = "";
    if (!cat.img) { cv.appendChild(h("div", { class: "muted", style: "padding:46px 12px;text-align:center;line-height:1.5" }, ["還沒有圖。先在上面放一張圖，才能在圖上框地點。"])); return; }
    var stage = h("div", { class: "catstage", style: "aspect-ratio:" + arCss(cat.ar) }, [h("img", { src: cat.img, alt: "", draggable: "false" })]);
    cat.spots.forEach(function (s, i) { stage.appendChild(spotBox(s, i)); });
    cv.appendChild(stage);
    markIssues(); shapeSvg();
  }
  function markIssues() {
    var chk = _yzMapCheck_(cat, edHb());
    $$(".mbx", cv).forEach(function (bx) { var lv = mapIssueLv(chk, bx.getAttribute("data-id")); bx.classList.toggle("bad", lv === "bad"); bx.classList.toggle("warn", lv === "warn"); });
    mapTreeBadges();
  }
  function paintSel() { $$(".mbx", cv).forEach(function (bx) { bx.classList.toggle("sel", bx.getAttribute("data-id") === ED.cur.id); }); shapeSvg(); }
  // 物品的外框（綠色）：自動找到的形狀；選到的那個比較明顯。點選的位置：小十字
  function shapeSvg() {
    var st = arStage(); if (!st) return;
    $$(".mshp, .mpick", st).forEach(function (x) { x.remove(); });
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "mshp"); svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
    cat.spots.forEach(function (s) {
      if (s.lit === "box" || !s.shape || s.shape.k !== shKey(cat, s)) return;   // 還沒找、或框／圖換過（舊的不畫）
      (s.shape.r || []).forEach(function (r) {
        var pg = document.createElementNS(ns, "polygon"), pts = [];
        for (var k = 0; k + 1 < r.length; k += 2) pts.push(r[k] + "," + r[k + 1]);
        pg.setAttribute("points", pts.join(" ")); if (s.id === ED.cur.id) pg.setAttribute("class", "on");
        svg.appendChild(pg);
      });
    });
    st.insertBefore(svg, $(".mbx", st));
    var sel = edSpot(ED.cur.id);
    if (sel && sel.lit !== "box" && Array.isArray(sel.pick)) st.appendChild(h("i", { class: "mpick", style: "left:" + sel.pick[0] + "%;top:" + sel.pick[1] + "%", title: "只亮這一樣" }));
  }
  var shT = 0;
  function shapeStat(s, how) {   // 這個地點設定裡的那一行狀態
    var el = $("#shpStat", pn); if (!el || !s || ED.cur.id !== s.id) return;
    var ok = s.shape && s.shape.k === shKey(cat, s), n = ok ? (s.shape.r || []).length : -1, nm = ok && s.shape.nm ? s.shape.nm : "";
    el.className = "shpst" + (how === "busy" ? " busy" : n > 0 && s.lit !== "box" ? " ok" : "");
    el.textContent = s.lit === "box" ? "滑到時亮整個框（框裡的背景也會亮）。" : how === "busy" ? "⏳ 找物品中…" : how === "noimg" ? "拿不到目錄圖的原始檔，按「儲存」時再找。" :
      nm ? "✅ 自動找到「" + nm + "」（圖上綠色的外框）：滑到時整個物品都會亮，不用設定。" :
      n > 0 ? "✅ 找到 " + n + " 樣物品（圖上綠色的外框）：滑到時只亮外框裡面" + (Array.isArray(s.pick) ? "（你點的那一樣）" : "") + "。" :
      n === 0 ? "框裡找不到物品：滑到時亮整個框。可以把框調整一下，或點一下要亮的物品。" : "按「儲存」時會自動找。";
  }
  function queueShape(s, fast) {   // 選到、框動了、點選了：等一下（不要一邊拖一邊算）再找這一個
    clearTimeout(shT);
    if (!s) return;
    if (!shNeed(cat, s)) { shapeStat(s); return; }
    shapeStat(s, "busy");
    shT = setTimeout(function () {
      edCatImg().then(function (img) {
        if (!edSpot(s.id) || !shNeed(cat, s)) { shapeStat(s); return; }
        edShapeOne(img, s); markDirty(); shapeSvg(); shapeStat(s); refreshPreview();
      }, function () { shapeStat(s, "noimg"); });
    }, fast ? 40 : 450);
  }
  // 點選要亮的物品：在框裡點一下（這時候點圖不會拖框）
  cv.addEventListener("pointerdown", function (e) {
    var s = edSpot(ui.picking || ""); if (!s) return;
    var stage = arStage(); if (!stage) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var rc = stage.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * 100, y = (e.clientY - rc.top) / rc.height * 100;
    if (x < s.x || x > s.x + s.w || y < s.y || y > s.y + s.h) { toast("要點在這個地點的框裡面"); return; }
    s.pick = [Math.round(x * 10) / 10, Math.round(y * 10) / 10]; ui.picking = null; cv.classList.remove("picking");
    changed(); shapeSvg(); drawPanel(); queueShape(s, true);
  }, true);

  // 很寬的圖：切好的左右兩張不見了（之前關掉過「切成左右兩張」）→ 用原始檔重新切、上傳
  function catPartsAgain() {
    var src = edCatSrc();
    if (!src) { toast("要重新切圖：請重新放一次目錄圖"); return; }
    toast("切圖中…");
    catPartsUp(src, { w: cat.w, h: cat.h }).then(function (parts) { cat.parts = parts; drawCanvas(); changed(); toast(parts.length ? "切好了（左右兩張）" : "圖不夠寬，不用切"); }, function (e) { toast("❌ " + e.message); });
  }

  // 拖拉：移動、四個角放大縮小
  var raf = 0;
  function softChanged() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; changed(); markIssues(); }); }
  function apply(mode, st, dx, dy, s) {
    var X = st.x, Y = st.y, W = st.w, H = st.h, r = Math.round;
    if (mode === "move") { s.x = Math.max(0, Math.min(100 - W, r(X + dx))); s.y = Math.max(0, Math.min(100 - H, r(Y + dy))); s.w = W; s.h = H; return; }
    var x0 = X, y0 = Y, x1 = X + W, y1 = Y + H;
    if (mode === "nw" || mode === "sw") x0 = Math.max(0, Math.min(x1 - MIN, r(X + dx)));
    if (mode === "ne" || mode === "se") x1 = Math.min(100, Math.max(x0 + MIN, r(X + W + dx)));
    if (mode === "nw" || mode === "ne") y0 = Math.max(0, Math.min(y1 - MIN, r(Y + dy)));
    if (mode === "sw" || mode === "se") y1 = Math.min(100, Math.max(y0 + MIN, r(Y + H + dy)));
    s.x = x0; s.y = y0; s.w = x1 - x0; s.h = y1 - y0;
  }
  cv.addEventListener("pointerdown", function (e) {
    var bx = e.target.closest && e.target.closest(".mbx"); if (!bx) return;
    var s = edSpot(bx.getAttribute("data-id")); if (!s) return;
    e.preventDefault();
    var hn = e.target.closest(".hnd"), mode = hn ? hn.getAttribute("data-h") : "move";
    if (ED.cur.id !== s.id) mapPick(s.id);
    try { bx.focus({ preventScroll: true }); } catch (x) { /* 沒關係 */ }
    var rc = arStage().getBoundingClientRect(), st = { x: s.x, y: s.y, w: s.w, h: s.h }, px = e.clientX, py = e.clientY;
    try { bx.setPointerCapture(e.pointerId); } catch (x2) { /* 沒關係 */ }
    function mv(ev) {
      apply(mode, st, (ev.clientX - px) / rc.width * 100, (ev.clientY - py) / rc.height * 100, s);
      paintBox(bx, s); syncNums(); softChanged();
    }
    function up() {
      bx.removeEventListener("pointermove", mv); bx.removeEventListener("pointerup", up); bx.removeEventListener("pointercancel", up);
      if (s.x !== st.x || s.y !== st.y || s.w !== st.w || s.h !== st.h) { pickInBox(s); changed(); markIssues(); renderTree(); shapeSvg(); queueShape(s); }
    }
    bx.addEventListener("pointermove", mv); bx.addEventListener("pointerup", up); bx.addEventListener("pointercancel", up);
  });
  cv.addEventListener("keydown", function (e) {
    var bx = e.target.closest && e.target.closest(".mbx"); if (!bx || e.target !== bx) return;
    var s = edSpot(bx.getAttribute("data-id")); if (!s) return;
    var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
    e.preventDefault();
    var step = e.altKey ? 5 : 1, st = { x: s.x, y: s.y, w: s.w, h: s.h };
    if (e.shiftKey) { s.w = Math.max(MIN, Math.min(100 - s.x, s.w + d[0] * step)); s.h = Math.max(MIN, Math.min(100 - s.y, s.h + d[1] * step)); }
    else { s.x = Math.max(0, Math.min(100 - s.w, s.x + d[0] * step)); s.y = Math.max(0, Math.min(100 - s.h, s.y + d[1] * step)); }
    paintBox(bx, s); syncNums(); pickInBox(s); changed(); markIssues(); renderTree(); shapeSvg(); queueShape(s);
  });
  function pickInBox(s) { if (Array.isArray(s.pick) && (s.pick[0] < s.x || s.pick[0] > s.x + s.w || s.pick[1] < s.y || s.pick[1] > s.y + s.h)) s.pick = null; }   // 框移走了，點選的位置不在框裡：不算數
  cv.addEventListener("dblclick", function (e) {
    if (e.target.closest && e.target.closest(".mbx")) return;
    var stage = arStage(); if (!stage) return;
    var rc = stage.getBoundingClientRect(); if (e.clientX < rc.left || e.clientX > rc.right || e.clientY < rc.top || e.clientY > rc.bottom) return;
    mapAdd((e.clientX - rc.left) / rc.width * 100, (e.clientY - rc.top) / rc.height * 100);
  });
  cv.addEventListener("pointerdown", function (e) { if (!(e.target.closest && e.target.closest(".mbx")) && ED.cur.id) { /* 點空白處＝不選任何一個 */ mapPick(""); } });

  // 這個地點的設定
  function syncNums() {
    var s = edSpot(ED.cur.id); if (!s || !ui.nums) return;
    ["x", "y", "w", "h"].forEach(function (k) { if (document.activeElement !== ui.nums[k]) ui.nums[k].value = String(s[k]); });
    var px = YZ_BUBBLE_PX[cat.size || "giga"] || 340, ar = String(cat.ar || "20:13").split(":"), ih = px * (Number(ar[1]) || 13) / (Number(ar[0]) || 20);
    if (ui.nums.px) ui.nums.px.textContent = "在「" + (cat.size || "giga") + "」卡片上約 " + Math.round(s.w / 100 * px) + "×" + Math.round(s.h / 100 * ih) + " px";
  }
  function targetSelect(s) {
    var sel = h("select", { class: "in", "aria-label": "連到哪裡" }), ok = _yzMapToInfo_(s.to, edHb()).ok, lock = s.st === "lock";
    if (lock) sel.appendChild(h("option", { value: "-" }, ["（先不連：尚未開放）"]));
    else if (!ok) sel.appendChild(h("option", { value: "", selected: "selected" }, ["（找不到，請重新選一個）"]));
    ED.chapters.forEach(function (c) {
      var g = h("optgroup", { label: c.name || "（還沒有章名）" });
      g.appendChild(h("option", { value: "c:" + c.id }, ["整章：" + (c.name || "")]));
      (ED.titles[c.id] || []).forEach(function (t) { g.appendChild(h("option", { value: "t:" + t.id }, ["　標題：" + (t.name || "（還沒有標題）")])); });
      sel.appendChild(g);
    });
    if (ok) sel.value = s.to; else if (lock) sel.value = "-";
    sel.onchange = function () { if (!sel.value) return; s.to = sel.value === "-" ? "" : sel.value; renderTree(); changed(); markIssues(); };
    return sel;
  }
  function refreshBox(s) { var bx = $('.mbx[data-id="' + s.id + '"]', cv); if (bx) { paintBox(bx, s); updateChip(bx, s); } }
  function seg2(opts, cur, onPick) {   // 一排按鈕選一個
    var g = h("div", { class: "seg" });
    opts.forEach(function (p) {
      var b = h("button", { type: "button", class: cur === p[0] ? "on" : "", "data-p": p[0] }, [p[1]]);
      b.onclick = function () { $$("button", g).forEach(function (x) { x.classList.toggle("on", x === b); }); onPick(p[0]); };
      g.appendChild(b);
    });
    return g;
  }
  var ICONS = ["💊", "💧", "🧊", "📞", "📋", "🚨", "🗂️", "💉", "📦", "🧾", "♻️", "❓"];
  function drawPanel() {
    pn.innerHTML = ""; ui.nums = null;
    var s = edSpot(ED.cur.id);
    if (!s) { pn.appendChild(h("div", { class: "muted", style: "padding:8px 2px" }, ["點圖上的一個方框（或左邊清單的一個地點），就能在這裡改它的名稱、圖示、說明、狀態、標籤方向、連到哪裡、位置和大小。"])); return; }
    var i = cat.spots.indexOf(s);
    function touched(tree) { refreshBox(s); if (tree) renderTree(); changed(); markIssues(); }
    pn.appendChild(h("div", { class: "mph" }, [h("span", { class: "spn" }, [String(i + 1)]), h("b", {}, ["這個地點的設定"])]));
    // 名稱、圖示
    var nm = h("input", { class: "in", value: s.label || "", maxlength: "20", "aria-label": "地點名稱" });
    nm.oninput = function () { s.label = nm.value; touched(true); };
    var ic = h("input", { class: "in", value: s.ico || "", maxlength: "8", "aria-label": "圖示（一個表情符號）", style: "width:5.5em;text-align:center" });
    ic.oninput = function () { s.ico = ic.value.replace(/\s/g, ""); touched(true); };
    var picks = h("div", { class: "icopick" }, ICONS.map(function (e) { return h("button", { type: "button", title: "用 " + e, onclick: function () { s.ico = e; ic.value = e; touched(true); } }, [e]); }).concat([h("button", { type: "button", title: "不要圖示", onclick: function () { s.ico = ""; ic.value = ""; touched(true); } }, ["無"])]));
    pn.appendChild(h("div", { class: "mgrid" }, [
      h("div", {}, [lbl("", "名稱（標籤上的字；4 個字最剛好）"), nm]),
      h("div", {}, [lbl("", "圖示（標籤前面的小符號，可以不放）"), h("div", { style: "display:flex;gap:6px;align-items:center;flex-wrap:wrap" }, [ic, picks])])
    ]));
    // 說明
    var ds = h("input", { class: "in", value: s.desc || "", maxlength: "30", "aria-label": "一句話說明", placeholder: "例：錠劑怎麼調、怎麼核對" });
    ds.oninput = function () { s.desc = ds.value; changed(); markIssues(); };
    pn.appendChild(h("div", {}, [lbl("", "一句話說明（網頁上滑過去時，底下說明卡的那一句；LINE 沒有「滑過」，所以 LINE 上不放）"), ds]));
    // 狀態、標籤方向
    var stSeg = seg2([["", "一般"], ["lock", "🔒 尚未開放"], ["new", "🔴 新"]], _yzMapSt_(s.st), function (v) { s.st = v; touched(true); drawPanel(); });
    var posSeg = seg2([["t", "上"], ["b", "下"], ["l", "左"], ["r", "右"]], _yzMapPos_(s.pos), function (v) { s.pos = v; touched(false); });
    pn.appendChild(h("div", { class: "mgrid" }, [
      h("div", {}, [lbl("", "狀態"), stSeg, h("div", { class: "muted", style: "font-size:12px;margin-top:3px" }, [s.st === "lock" ? "🔒 標籤變灰色；點了只會說「還在整理」，不會進到那一章。" : s.st === "new" ? "🔴 標籤上多一顆紅點，提醒大家有新東西。" : "一般：點了就進到那一章。"])]),
      h("div", {}, [lbl("", "標籤放在圓點的"), posSeg])
    ]));
    // 連到哪裡、位置大小
    pn.appendChild(h("div", { class: "mgrid" }, [h("div", {}, [lbl("", "點了連到哪裡" + (s.st === "lock" ? "（尚未開放：可以先不選）" : "")), targetSelect(s)]), h("div", {}, [lbl("", "物品框的位置和大小（佔整張圖的 %）"), (function () {
      var wrap = h("div", { class: "mnums" }); ui.nums = {};
      [["x", "左"], ["y", "上"], ["w", "寬"], ["h", "高"]].forEach(function (p) {
        var inp = h("input", { class: "in", type: "number", min: "0", max: "100", step: "1", value: String(s[p[0]]), "aria-label": p[1] + "（%）" });
        ui.nums[p[0]] = inp;
        inp.oninput = function () {
          var v = Math.round(Number(inp.value)); if (!isFinite(v)) return;
          if (p[0] === "x") s.x = Math.max(0, Math.min(100 - MIN, v)); else if (p[0] === "y") s.y = Math.max(0, Math.min(100 - MIN, v));
          else if (p[0] === "w") s.w = Math.max(MIN, Math.min(100, v)); else s.h = Math.max(MIN, Math.min(100, v));
          var bx = $('.mbx[data-id="' + s.id + '"]', cv); if (bx) paintBox(bx, s);
          syncNums(); pickInBox(s); changed(); markIssues(); shapeSvg(); queueShape(s);
        };
        inp.onchange = function () { inp.value = String(s[p[0]]); mapTreeBadges(); };
        wrap.appendChild(h("label", { class: "mnum" }, [h("span", {}, [p[1]]), inp]));
      });
      return wrap;
    })(), (function () { ui.nums.px = h("div", { class: "muted", style: "font-size:12px;margin-top:3px" }); return ui.nums.px; })()])]));
    // 滑到時亮哪裡（第 26 批）
    var litSeg = seg2([["", "自動找物品"], ["box", "整個框"]], s.lit === "box" ? "box" : "", function (v) { s.lit = v; if (v === "box") { s.shape = null; ui.picking = null; cv.classList.remove("picking"); } changed(); shapeSvg(); drawPanel(); queueShape(s, true); });
    var pickRow = s.lit === "box" ? null : h("div", { class: "mpickrow" }, [
      btn(ui.picking === s.id ? "取消點選" : "👆 點一下要亮的物品", function () {
        ui.picking = ui.picking === s.id ? null : s.id; cv.classList.toggle("picking", !!ui.picking); drawPanel();
        if (ui.picking) toast("在圖上這個地點的框裡，點一下要亮的那一樣");
      }, "sm" + (ui.picking === s.id ? " pri" : "")),
      Array.isArray(s.pick) ? btn("框裡的都亮（不指定）", function () { s.pick = null; changed(); shapeSvg(); drawPanel(); queueShape(s, true); }, "sm") : null
    ]);
    pn.appendChild(h("div", { class: "mlit" }, [
      lbl("", "滑到這個地點時，圖上亮哪裡（網頁）"), litSeg,
      h("div", { id: "shpStat", class: "shpst" }, [""]),
      pickRow,
      h("div", { class: "muted", style: "font-size:12px;margin-top:4px;line-height:1.5" }, [s.lit === "box" ? "整個框都亮（框裡的背景也亮）。" : "不用設定：程式自動找出這個按鍵的物品，整個物品都會亮（例如藥師法規＝整本書），背景不亮。找得不對才需要：按「👆 點一下要亮的物品」再點圖上那一樣，或改成「整個框」。LINE 不受影響。"])
    ]));
    pn.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:10px" }, [
      btn("複製這個地點", function () {
        var c = clone(s); c.id = "p" + Date.now() + cat.spots.length; c.x = Math.min(100 - c.w, c.x + 3); c.y = Math.min(100 - c.h, c.y + 3); c.label = (s.label || "") + "2";
        cat.spots.push(c); markDirty(); ED.cur = { kind: "map", id: c.id }; renderEdit();
      }),
      confirmBtn("刪除這個地點", function () { var k = cat.spots.indexOf(s); cat.spots.splice(k, 1); markDirty(); ED.cur = { kind: "map", id: "" }; renderEdit(); })
    ]));
    syncNums(); shapeStat(s);
  }
  function drawChecks() {
    var r = _yzMapCheck_(cat, edHb()); ck.innerHTML = "";
    ck.appendChild(h("div", { class: "lbl" }, ["檢查（用「" + (cat.size || "giga") + "」卡片、圖寬約 " + r.px + " px 算）"]));
    var infos = r.general.filter(function (g) { return g.lv === "info"; });
    var oneMi = function (g) { return h("div", { class: "mi " + g.lv }, [h("span", { class: "mic" }, [g.lv === "bad" ? "✖" : g.lv === "info" ? "ℹ️" : "⚠"]), h("span", {}, [g.msg])]); };
    if (!r.bad && !r.warn) {
      ck.appendChild(h("div", { class: "mok" }, ["✅ 沒有問題：每個地點都點得到、連得到，標籤放得下，章元都有地方點。"]));
      if (infos.length) ck.appendChild(h("div", { class: "mlist" }, infos.map(oneMi)));
      return;
    }
    var box = h("div", { class: "mlist" });
    r.general.forEach(function (g) { box.appendChild(oneMi(g)); });
    cat.spots.forEach(function (s, i) {
      (r.spots[s.id] || []).forEach(function (x) {
        box.appendChild(h("div", { class: "mi " + x.lv + " go", onclick: function () { mapPick(s.id); } }, [h("span", { class: "mic" }, [x.lv === "bad" ? "✖" : "⚠"]), h("span", {}, [h("b", {}, ["第 " + (i + 1) + " 個「" + (s.label || "沒有名稱") + "」："]), x.msg])]));
      });
    });
    ck.appendChild(box);
  }
  ui.onPick = function () { if (ui.picking && ui.picking !== ED.cur.id) { ui.picking = null; cv.classList.remove("picking"); } paintSel(); drawPanel(); queueShape(edSpot(ED.cur.id)); };
  ED.warners.push(drawChecks);
  drawCanvas(); drawPanel(); drawChecks(); queueShape(edSpot(ED.cur.id));
}

/* ── 算「這張卡片多大」用的：圖片網址換成跟真的一樣長的 Drive 網址（預覽裡的圖是內嵌的，網址太長會誤判） ───────── */
var FAKE_PREFIX = "https://drive.google.com/thumbnail?id=1AbCdEfGhIjKlMnOpQrStUvWxYz";
function fakeUrl(i) { return FAKE_PREFIX + ("00000" + i).slice(-5) + "&sz=w1000"; }
function unfake(node, blocks) {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) { node.forEach(function (x) { unfake(x, blocks); }); return node; }
  if (node.type === "image" && typeof node.url === "string" && node.url.indexOf(FAKE_PREFIX) === 0) {
    // 網址尾巴的數字 ＝ 第幾個內容塊 ×100 ＋ 第幾張圖（0＝主圖、1＝動畫的第一格、10 起＝分步動畫的第幾步、50 起＝階梯式內容裡的第幾張圖）
    var code = parseInt(node.url.slice(FAKE_PREFIX.length, FAKE_PREFIX.length + 5), 10), bi = Math.floor(code / 100), j = code % 100, b = blocks && blocks[bi], u = null;
    if (b) {
      if (j >= 50) { var li = b.t === "ladder" ? _yzLadderImgs_(b)[j - 50] : null; u = li && li.img ? li.img.url : null; }   // 50 起＝階梯式內容裡的第幾張圖
      else if (j === 0) u = b.url; else if (j === 1) u = b.poster; else if (b.steps && b.steps[j - 10]) u = b.steps[j - 10].url;
    }
    if (u) node.url = u;
  }
  for (var k in node) if (node[k] && typeof node[k] === "object") unfake(node[k], blocks);
  return node;
}
function lineCards(ch, t, opts) {
  _yzLadderNumberAll_(edHb());   // 條文「接續上一段」的起始號碼先算好（下面複製出來的內容塊也會帶著）
  var fb = (t.blocks || []).map(function (b, i) {
    if (b.t === "img" && b.url) return Object.assign({}, b, { url: fakeUrl(i * 100) });
    if (b.t === "anim") {
      if (b.kind === "steps") return Object.assign({}, b, { steps: (b.steps || []).map(function (st, j) { return st && st.url ? Object.assign({}, st, { url: fakeUrl(i * 100 + 10 + j) }) : st; }) });
      return Object.assign({}, b, { url: b.url ? fakeUrl(i * 100) : "", poster: b.poster ? fakeUrl(i * 100 + 1) : "" });
    }
    if (b.t === "ladder" && (b.items || []).some(_yzLadderIsImg_)) {   // 階梯式裡的圖片行：照順序編 50、51…（跟 _yzLadderImgs_ 的順序一樣）
      var k = 0;
      return Object.assign({}, b, { items: b.items.map(function (it) { return _yzLadderIsImg_(it) && it.img.url ? Object.assign({}, it, { img: Object.assign({}, it.img, { url: fakeUrl(i * 100 + 50 + (k++)) }) }) : it; }) });
    }
    return b;
  });
  var r = _yzContentBubbles_(ch, t, fb, t.note, Object.assign({ hb: HB }, opts));
  if (!(opts && opts.keepFake)) r.bubbles.forEach(function (b) { unfake(b, t.blocks); });   // keepFake：給檢查程式用，保留「跟真的一樣長的 Drive 網址」
  return r;
}
function lineChapter(ch, n) {
  var fc = Object.assign({}, ch, { img: _yzChBg_(ch) ? fakeUrl(0) : "", bg: null });
  var bytes = _yzBytes_(_yzChapterBubble_(fc, n));
  var b = _yzChapterBubble_(ch, n);
  return { bubble: b, bytes: bytes };
}
// 目錄圖卡片：算大小時圖片網址換成跟真的一樣長的 Drive 網址（預覽裡的圖是內嵌的，網址太長會誤判）
function lineMap(cat, hb, over) {   // 很寬的圖切成左右兩張的時候，bubble 是「一排兩張」（carousel），bytes 是兩張合起來
  var c = Object.assign({}, cat, over || {});
  var fake = Object.assign({}, c, { img: c.img ? fakeUrl(0) : "", parts: (c.parts || []).map(function (pt) { return Object.assign({}, pt, { img: pt.img ? fakeUrl(0) : "" }); }) });
  var home = _yzMapHome_(c, hb);
  return { bubble: home, bytes: _yzBytes_(_yzMapHome_(fake, hb)), split: home.type === "carousel", each: home.type === "carousel" ? _yzMapHome_(fake, hb).contents.map(_yzBytes_) : null };
}
function chapterListBytes() {
  var chs = HB.chapters.map(function (c) { return Object.assign({}, c, { img: fakeUrl(0) }); });
  return _yzBytes_(_yzChapterList_(chs, counts()));
}


/* ── 很寬的目錄圖：切成左右兩張（LINE 用；左 0～52 %、右 48～100 %），每張寬不超過 1024 px，上傳（檔名一樣亂碼）──
   src 要是瀏覽器裡的圖（data: 或 blob: 網址）：Google 的圖片網址畫進畫布後讀不出像素 */
function catPartsUp(src, info) {
  var ar = info && info.w && info.h ? info.w / info.h : 0;
  if (ar && ar < YZ_MAP_WIDE) return Promise.resolve([]);
  return new Promise(function (ok, bad) {
    var img = new Image();
    img.onload = function () {
      var W = img.naturalWidth || 1, H = img.naturalHeight || 1;
      if (W / H < YZ_MAP_WIDE) { ok([]); return; }
      try {
        var cuts = YZ_MAP_CUTS.map(function (c) {
          var x0 = Math.round(W * c[0] / 100), x1 = Math.round(W * c[1] / 100), k = Math.min(1, 1024 / Math.max(1, x1 - x0)), cv = document.createElement("canvas");
          cv.width = Math.max(1, Math.round((x1 - x0) * k)); cv.height = Math.max(1, Math.round(H * k));
          var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, x0, 0, x1 - x0, H, 0, 0, cv.width, cv.height);
          return { uri: cv.toDataURL("image/jpeg", 0.86), x0: c[0], x1: c[1], w: cv.width, h: cv.height };
        });
      } catch (e) { bad(new Error("切圖失敗")); return; }
      Promise.all(cuts.map(function (p) { return uploadUri(p.uri, "目錄圖半張").then(function (r) { return { img: r.url, fid: r.fid, fname: r.fname, x0: p.x0, x1: p.x1, w: p.w, h: p.h }; }); })).then(ok, bad);
    };
    img.onerror = function () { bad(new Error("讀不到這張圖，沒辦法切")); };
    img.src = src;
  });
}

/* ════════ admin.js ════════ */
/* ═══════════════ admin.js：管理（開發者）：誰可以看（核可名單）、看過紀錄、保密設定 ═══════════════ */
var AD = { users: null, devs: 0, log: null, busy: false };
function buildAdminPane() {
  AD = { users: null, devs: 0, log: null, busy: false };
  var pane = $("#pane-admin");
  pane.innerHTML = "";
  pane.appendChild(h("p", { class: "sub" }, ["誰可以看、誰看過什麼、保密開關，都在這一頁（只有開發者看得到）。也可以直接在 LINE 的審核卡按「核可」。"]));
  pane.appendChild(h("div", { class: "row" }, [
    h("section", { class: "card adm" }, [h("h2", {}, ["① 誰可以看（核可名單）"]), h("div", { id: "userBox" }, [h("div", { class: "muted" }, ["載入中…"])])]),
    h("section", { class: "card adm" }, [h("h2", {}, ["② 保密設定"]), h("div", { id: "cfgBox" })])
  ]));
  pane.appendChild(h("section", { class: "card adm", style: "margin-top:16px" }, [h("h2", {}, ["③ 看過紀錄（最新的在最上面）"]), h("div", { id: "logBox" }, [h("div", { class: "muted" }, ["載入中…"])])]));
}
function adminLoad() {
  drawSettings();
  call("hbUsers", []).then(function (r) { if (!adOk(r)) return; AD.users = r.users || []; AD.devs = r.devs || 0; drawUsers(); }, function (e) { var b = $("#userBox"); if (b) b.textContent = "❌ " + e.message; });
  call("hbLog", [300]).then(function (r) { if (!adOk(r)) return; AD.log = r.rows || []; drawLog(); }, function (e) { var b = $("#logBox"); if (b) b.textContent = "❌ " + e.message; });
}
function adOk(r) {
  if (!r) { toast("❌ 後端沒有回應"); return false; }
  if (r.st === "lock") { logout("expired"); return false; }
  if (r.err) { toast("❌ " + r.err); return false; }
  return MAIN;
}
var ST_TXT = { ok: ["ok", "已核可"], wait: ["wait", "等審核"], no: ["no", "已拒絕"], off: ["gray", "已撤銷"], dev: ["ok", "開發者"] };
function drawUsers() {
  var box = $("#userBox"); if (!box) return; box.innerHTML = "";
  var rows = (AD.users || []).slice().sort(function (a, b) { var o = { wait: 0, ok: 1, dev: 2, off: 3, no: 4 }; return (o[a.st] - o[b.st]) || String(b.at).localeCompare(String(a.at)); });
  var nOk = rows.filter(function (u) { return u.st === "ok"; }).length, nW = rows.filter(function (u) { return u.st === "wait"; }).length;
  box.appendChild(h("div", { class: "hint" }, ["核可 " + nOk + " 人、等審核 " + nW + " 人；開發者 " + AD.devs + " 位（固定可以看，不在這裡改；名單在 LINE 專案的 DEV_USERS）。"]));
  if (!rows.length) { box.appendChild(h("div", { class: "muted", style: "padding:8px 0" }, ["還沒有人申請。同事打開手冊網頁、填員工代號送出後，會出現在這裡。"])); return; }
  var tb = h("table", { class: "tbl" });
  tb.appendChild(h("tr", {}, ["名字", "員工代號", "狀態", "申請時間", "處理", "動作"].map(function (x) { return h("th", {}, [x]); })));
  rows.forEach(function (u) {
    var acts = [], set = function (act, label) { return btn(label, function (e) { adSet(u, act, e.target); }, act === "off" || act === "no" ? "sm bad" : act === "ok" ? "sm pri" : "sm"); };
    if (u.st === "dev") acts.push(h("span", { class: "muted" }, ["固定可以看"]));
    else if (u.st === "wait") { acts.push(set("ok", "核可")); acts.push(set("no", "拒絕")); }
    else if (u.st === "ok") acts.push(set("off", "撤銷"));
    else acts.push(set("ok", "重新核可"));
    var nm = (u.name || "（沒填）") + (u.lname ? "（LINE：" + u.lname + "）" : "");
    var stt = ST_TXT[u.st] || ST_TXT.wait;
    tb.appendChild(h("tr", {}, [h("td", {}, [nm]), h("td", {}, [u.emp || "—"]), h("td", {}, [h("span", { class: "st " + stt[0] }, [stt[1]])]), h("td", { class: "muted" }, [u.at || ""]), h("td", { class: "muted" }, [u.done ? u.done + (u.by ? "　" + u.by : "") : ""]), h("td", {}, [h("div", { class: "acts" }, acts)])]));
  });
  box.appendChild(h("div", { class: "tscroll" }, [tb]));
}
function adSet(u, act, el) {
  if (AD.busy) return;
  var go = function () {
    AD.busy = true; if (el) el.disabled = true;
    call("hbUserSet", [u.uid, act]).then(function (r) {
      AD.busy = false;
      if (!adOk(r)) { if (el) el.disabled = false; return; }
      AD.users = r.users || AD.users; AD.devs = r.devs || AD.devs; drawUsers();
      toast(act === "ok" ? "✅ 已核可（已通知對方的 LINE）" : act === "off" ? "已撤銷：對方下次開手冊就進不去" : "已拒絕（不會通知對方）");
    }, function (e) { AD.busy = false; if (el) el.disabled = false; toast("❌ " + e.message); });
  };
  if (act === "off") modal({ title: "撤銷「" + (u.name || u.lname || u.emp || "這位") + "」？", lines: ["撤銷後，對方的 LINE 和網頁都看不到藥戰手冊（正在看的也會被請出去）。之前送出去的 LINE 卡片會留在他的聊天室裡（機器人收不回來）。"], buttons: [{ label: "不要", cls: "sm" }, { label: "撤銷", cls: "sm bad", fn: go }] });
  else go();
}
function drawLog() {
  var box = $("#logBox"); if (!box) return; box.innerHTML = "";
  if (CFG && CFG.viewLog === false) box.appendChild(h("div", { class: "hint" }, ["「看過紀錄」目前是關的：不再新增紀錄（舊的會保留）。"]));
  var rows = AD.log || [];
  if (!rows.length) { box.appendChild(h("div", { class: "muted" }, ["還沒有紀錄。"])); return; }
  var tb = h("table", { class: "tbl" });
  tb.appendChild(h("tr", {}, ["時間", "名字", "員工代號", "從哪裡", "做了什麼", "哪一個"].map(function (x) { return h("th", {}, [x]); })));
  rows.forEach(function (r) { tb.appendChild(h("tr", {}, [h("td", { class: "muted nowrap" }, [r[0]]), h("td", {}, [r[2] || "…" + String(r[1] || "").slice(-4)]), h("td", {}, [r[3]]), h("td", {}, [r[4]]), h("td", {}, [r[5]]), h("td", {}, [r[6]])])); });
  box.appendChild(h("div", { class: "tscroll logscroll" }, [tb]));
  box.appendChild(h("div", { class: "hint" }, ["只記「誰、何時、從 LINE 或網頁、看了哪一章／哪個標題」。不記內容，也不記搜尋的字。超過 6000 筆會自動刪掉最舊的。"]));
}
function settingRow(title, desc, ctl) {
  return h("div", { class: "srow" }, [h("div", { style: "flex:1;min-width:0" }, [h("div", { style: "font-weight:700" }, [title]), h("div", { class: "muted", style: "font-size:12.5px" }, [desc])]), ctl]);
}
function tog(on, fn, label) { var b = h("button", { class: "tog" + (on ? " on" : ""), type: "button", role: "switch", "aria-checked": on ? "true" : "false", "aria-label": label }); b.onclick = function () { fn(!on, b); }; return b; }
function drawSettings() {
  var box = $("#cfgBox"); if (!box || !CFG) return; box.innerHTML = "";
  var c = CFG;
  function save(patch, el) {
    if (el) el.disabled = true;
    call("hbCfg", [JSON.stringify(patch)]).then(function (r) {
      if (el) el.disabled = false;
      if (!adOk(r) || !r.ok) { drawSettings(); return; }
      CFG = Object.assign({}, CFG, r.cfg); applyCfg(); drawSettings(); paintWm();
      if (!$("#wm") && CFG.watermark !== false) { $("#app").appendChild(h("div", { class: "wm", id: "wm", "aria-hidden": "true" })); paintWm(); }
      if ($("#wm") && CFG.watermark === false) $("#wm").remove();
      toast("✅ 設定存好了（LINE 和網頁都會用新的設定）");
    }, function (e) { if (el) el.disabled = false; toast("❌ " + e.message); drawSettings(); });
  }
  function row(k, title, desc) { box.appendChild(settingRow(title, desc, tog(c[k] !== false, function (v, el) { var p = {}; p[k] = v; if (k === "empReview" && !v) { modal({ title: "關掉「員工代號＋核可」？", lines: ["關掉以後，只要有補藥神器的人（登入過補藥神器網頁、或在 LINE 用補藥神器）都看得到藥戰手冊。保密會大幅降低。"], buttons: [{ label: "不要", cls: "sm" }, { label: "關掉", cls: "sm bad", fn: function () { save(p, el); } }] }); return; } save(p, el); }, title))); }
  row("empReview", "需要員工代號＋開發者核可", "關掉＝有補藥神器的人都看得到（不建議）");
  row("showAll", "所有藥師都看得到「📘 藥戰手冊」按鍵", "LINE 下面那排每個人都有這顆；還沒核可的人按了是「申請」（填員工代號），內容一樣要核可＋驗證才看得到。關掉＝只有可以看的人才有這顆");
  var idle = h("input", { class: "in", type: "number", min: "5", max: "240", value: String(c.idle || 30), style: "width:80px", "aria-label": "閒置幾分鐘自動退出" });
  idle.onchange = function () { var v = Math.max(5, Math.min(240, parseInt(idle.value, 10) || 30)); idle.value = String(v); save({ idle: v }, idle); };
  box.appendChild(settingRow("閒置自動退出（分鐘）", "LINE 和網頁都用這個時間：LINE 下次一按就回補藥神器；網頁自動登出、要再驗證（5～240）", h("div", { class: "sw2" }, [idle, h("span", { class: "muted" }, ["分鐘"])])));
  row("watermark", "網頁浮水印", "網頁每一頁蓋「姓名＋員工代號＋時間」");
  row("viewLog", "看過紀錄", "記誰、何時、看哪一章／哪個標題（不記內容）");
  row("footer", "固定頁尾「內部資料，請勿外傳」", "LINE 每張卡片和網頁最下面都放這一行");
  row("imgDirect", "圖片直接顯示在 LINE 卡片上", "關掉＝LINE 卡片上的圖片、目錄圖改成按鈕，要登入網頁才看得到");
  row("animDirect", "動畫直接在 LINE 卡片上播放", "關掉＝只顯示第一格＋「▶ 在網頁看動畫」按鈕");
  row("webAnimAuto", "網頁動畫自動播放", "關掉＝一律先停住，按「▶ 播放」才動（手機開了「減少動態效果」的人，一律先停住）");
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
