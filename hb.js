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
    var pm = /^\[(h[1-4]|hr|q|box|go)(?:=([A-Za-z0-9_-]+))?\] ?/.exec(ln);
    if (pm) {
      L.k = pm[1];
      if (L.k === "box") L.tone = YZ_RT_TONES[pm[2]] ? pm[2] : "info";
      if (L.k === "go") L.go = pm[2] || "";
      ln = ln.slice(pm[0].length);
      if (L.k === "hr" || L.k === "go") return L;   // 這兩種沒有字
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
  return String(s).replace(/\[(?=\[|$|\/?(?:b|i|u|s)\]|\/(?:c|z)\]|(?:c|z)=[a-z0-9]+\]|(?:h[1-4]|hr|q|box|go)(?:=[A-Za-z0-9_-]+)?\])/g, "[[");
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
  var pre = L.k === "box" ? "[box=" + (L.tone || "info") + "] " : (L.k && L.k !== "p" ? "[" + L.k + "] " : "");
  var body = _yzRtSerRuns_(L.runs || []);
  if (L.k === "p" && !body) return "";
  return ind + pre + body;
}
function _yzRtSerialize_(lines) { return (lines || []).map(_yzRtSerLine_).join("\n"); }

// ── 不要標記的版本（搜尋、關鍵字、字數用）──
function _yzRtPlainLines_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) {
    var L = _yzRtParseLine_(ln); if (L.k === "hr" || L.k === "go") return;
    var t = _yzRtRunsText_(L.runs).replace(/^\s+|\s+$/g, ""); if (t) out.push(t);
  });
  return out;
}
function _yzRtPlain_(text) { return _yzRtPlainLines_(text).join("\n"); }
// 這段字有沒有用到格式標記（LINE 裡改字時，要提醒「請保留標記」）
function _yzRtHas_(text) { return /\[(?:\/?(?:b|i|u|s)|\/(?:c|z)|(?:c|z)=[a-z0-9]+|(?:h[1-4]|hr|q|box|go)(?:=[A-Za-z0-9_-]+)?)\]/.test(String(text === null || text === undefined ? "" : text)); }

// ── 給畫面（網頁、LINE）用：一行一行的「種類」。網頁和 LINE 共用這一份，兩邊排出來才會一樣。
//   plain＝一般行　item＝有記號的行（編號、圓點、核對框）　head＝標題　hr＝分隔線　box＝標註　quote＝引用　go＝連結到標題　gap＝空行
//   runs＝這一行的字（每段有自己的格式）；text＝不含格式的字；lv＝縮排層數；indent＝有沒有縮排（舊欄位）
function _yzParseLines_(text, plain) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) {
    var L = _yzRtParseLine_(ln, plain);
    if (L.k === "hr") { out.push({ k: "hr", lv: L.lv }); return; }
    if (L.k === "go") { out.push({ k: "go", go: L.go, lv: L.lv }); return; }
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

// 一段文字 → LINE 的幾行。編號行做成「記號＋內文」（內文換行時對齊內文，不會縮回記號下面）。
// 連續的「標註」（同一種）、連續的「引用」各合成一個框。o.go(標題代號)→{label}：「連結到標題」的行要用（找不到就不顯示）；o.plain：整段當一般文字（備註用，不看標記）
function _yzTextLines_(text, o) {
  o = o || {};
  var size = o.size || "sm", color = o.color || "#1F1F1F", out = [], ls = _yzParseLines_(text, o.plain), i = 0, first = true;
  while (i < ls.length) {
    var L = ls[i], pad = (L.lv || 0) * 18, j, node = null;
    if (L.k === "gap") { out.push({ type: "spacer", size: "xs" }); i++; continue; }
    if (L.k === "hr") { out.push({ type: "separator", margin: "md", color: "#D5DAE1" }); i++; first = false; continue; }
    if (L.k === "go") {
      var tg = o.go ? o.go(L.go) : null;
      if (tg && tg.label) {
        out.push({
          type: "box", layout: "horizontal", spacing: "sm", backgroundColor: "#F1F7F6", cornerRadius: "8px", paddingAll: "9px", paddingStart: (9 + pad) + "px",
          action: _yzPB_("yz=t&t=" + L.go, String(tg.label).slice(0, 20)),
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
    if (L.k === "box") {
      var T = YZ_RT_TONES[L.tone] || YZ_RT_TONES.info, kids = [];
      for (j = i; j < ls.length && ls[j].k === "box" && ls[j].tone === L.tone; j++) { var bn = _yzRtTextNode_(ls[j].runs, { size: size, color: T.ink }); if (bn) kids.push(bn); }
      out.push({
        type: "box", layout: "horizontal", spacing: "sm", backgroundColor: T.bg, borderColor: T.bd, borderWidth: "1px", cornerRadius: "8px", paddingAll: "9px",
        contents: [{ type: "text", text: T.icon, size: size, flex: 0 }, { type: "box", layout: "vertical", flex: 1, spacing: "xs", contents: kids }]
      });
      i = j; first = false; continue;
    }
    if (L.k === "quote") {
      var qk = [];
      for (j = i; j < ls.length && ls[j].k === "quote"; j++) { var qn = _yzRtTextNode_(ls[j].runs, { size: size, color: "#4A5565" }); if (qn) qk.push(qn); }
      // 左邊那條線：外框塗灰色、只留 3px，裡面的白底蓋掉其餘的（比「單邊框線」可靠，LINE 沒有單邊框線）
      out.push({ type: "box", layout: "horizontal", backgroundColor: "#B8C2CC", paddingStart: "3px", contents: [{ type: "box", layout: "vertical", backgroundColor: "#FFFFFF", paddingStart: "10px", spacing: "xs", contents: qk }] });
      i = j; first = false; continue;
    }
    if (L.k === "item") {
      var body = _yzRtTextNode_(L.runs, { size: size, color: color, flex: 1 });
      if (body) out.push({ type: "box", layout: "horizontal", spacing: "sm", paddingStart: pad ? pad + "px" : undefined, contents: [{ type: "text", text: L.mark, size: size, color: o.markColor || "#4A5565", flex: 0 }, body] });
      i++; first = false; continue;
    }
    if (L.k === "head") {
      var H = YZ_RT_HEAD["h" + L.h];
      node = _yzRtTextNode_(L.runs, { size: H.line, color: H.color, weight: "bold", margin: first ? undefined : (L.h <= 2 ? "lg" : "md") });
    } else node = _yzRtTextNode_(L.runs, { size: size, color: color });
    if (node) {
      out.push(pad && L.k !== "head" ? { type: "box", layout: "vertical", paddingStart: pad + "px", contents: [node] } : node);
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

function _yzNote_(note, page) {
  var lines = _yzTextLines_(note, { size: "xs", color: "#5B4300", markColor: "#8A6D00", plain: true });
  var pg = _yzPageText_(page);
  if (!lines.length && !pg) return null;
  var c = [{ type: "text", text: "備註", size: "xxs", weight: "bold", color: "#8A6D00" }].concat(lines);
  // 頁數：放在備註框裡面，自己一個小框（青綠色，跟黃色的備註框不同色）；備註有文字的話，文字和小框中間空一行
  if (pg) {
    if (lines.length) c.push({ type: "text", text: " ", size: "xs", wrap: true });
    c.push({
      type: "box", layout: "vertical", backgroundColor: YZ_PG_BG, borderColor: YZ_PG_BD, borderWidth: "1px", cornerRadius: "8px", paddingAll: "6px",
      contents: [{ type: "text", size: "xs", wrap: true, contents: [
        { type: "span", text: "📖 藥戰手冊頁數　", color: YZ_PG_INK }, { type: "span", text: pg, weight: "bold", color: YZ_PG_STRONG }
      ] }]
    });
  }
  return { type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#FFF8E1", cornerRadius: "8px", paddingAll: "8px", contents: c };
}

function _yzFoot_() {
  if (!YZ_CFG.footer) return { type: "spacer", size: "xs" };
  return { type: "text", text: YZ_NOTICE, size: "xxs", color: "#9AA0A6", align: "center", margin: "sm" };
}

function _yzHead_(top, title, sub) {
  var c = [{ type: "text", text: top, size: "xs", color: YZ_ACCENT_SOFT, wrap: true }];
  if (title) c.push({ type: "text", text: title, size: "lg", weight: "bold", color: "#FFFFFF", wrap: true, margin: "xs" });
  if (sub) c.push({ type: "text", text: sub, size: "xs", color: YZ_ACCENT_SOFT, wrap: true, margin: "xs" });
  return { type: "box", layout: "vertical", paddingAll: "12px", backgroundColor: YZ_ACCENT, contents: c };
}

function _yzPB_(data, label, display) { var a = { type: "postback", label: label, data: data }; if (display) a.displayText = display; return a; }

// ── 章元：一章一張（圖＋文字），10 個一排左右滑 ──
function _yzChapterBubble_(ch, nTitles) {
  var open = _yzPB_("yz=c&c=" + ch.id, "打開");
  var body = [{ type: "text", text: "第 " + ch.no + " 章", size: "xs", weight: "bold", color: YZ_ACCENT }];
  body.push({ type: "text", text: ch.name, size: "md", weight: "bold", wrap: true, color: "#1F1F1F", margin: "xs" });
  var intro = _yzT_(ch.intro, { size: "xs", color: "#5F6B7A", margin: "sm", maxLines: 3 });
  if (intro) body.push(intro);
  body.push({ type: "text", text: nTitles + " 個標題", size: "xxs", color: "#7B8696", margin: "sm" });
  var b = { type: "bubble", size: ch.size || "kilo" };
  if (ch.img && YZ_CFG.imgDirect) b.hero = { type: "image", url: ch.img, size: "full", aspectRatio: "20:13", aspectMode: "cover", action: open };
  else b.hero = { type: "box", layout: "vertical", backgroundColor: YZ_ACCENT, paddingAll: "18px", action: open, contents: [{ type: "text", text: "第 " + ch.no + " 章", size: "xl", weight: "bold", color: "#FFFFFF", align: "center" }] };
  b.body = { type: "box", layout: "vertical", paddingAll: "12px", contents: body, action: open };
  b.footer = { type: "box", layout: "vertical", paddingAll: "10px", spacing: "xs", contents: [
    { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", action: _yzPB_("yz=c&c=" + ch.id, "打開這一章") },
    _yzFoot_()
  ] };
  return b;
}
function _yzChapterList_(chapters, counts) {
  var bs = chapters.slice(0, YZ_CAROUSEL_MAX).map(function (c) { return _yzChapterBubble_(c, counts[c.id] || 0); });
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
function _yzMapToInfo_(to, hb) {   // 連到哪裡：{ ok, kind:"c"|"t", name:"第 3 章　藥品補充與藥品請領", short:"藥品補充與藥品請領" }
  var m = /^([ct]):(.+)$/.exec(String(to === null || to === undefined ? "" : to)), i;
  if (m && m[1] === "c") { var cs = (hb && hb.chapters) || []; for (i = 0; i < cs.length; i++) if (cs[i].id === m[2]) return { ok: true, kind: "c", name: "第 " + cs[i].no + " 章　" + cs[i].name, short: cs[i].name }; }
  if (m && m[1] === "t") { var f = hb ? _yzFindTitle_(hb, m[2]) : null; if (f) return { ok: true, kind: "t", name: "第 " + f.ch.no + " 章　" + f.t.name, short: f.t.name }; }
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
function _yzMapNorm_(s) {   // 把一個地點整理乾淨（不管能不能用）
  var r = _yzMapRect_(s);
  var o = { id: s.id, label: _yzMapStr_(s.label), to: s.to, x: r.x, y: r.y, w: r.w, h: r.h, pos: _yzMapPos_(s.pos), ico: _yzMapStr_(s.ico).replace(/\s/g, ""), desc: _yzMapStr_(s.desc), st: _yzMapSt_(s.st) };
  if (s.empty === true) o.empty = true;
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
    b.layout = "horizontal"; b.paddingTop = pv + "px"; b.paddingBottom = pv + "px"; dot.gravity = "center"; if (pill) pill.gravity = "center";   // 上下置中用 gravity（比 alignItems 舊，舊版 LINE 也認得）
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
  if (cv.uncovered.length && all.length) G("warn", "有 " + cv.uncovered.length + " 章在圖上沒有地方可以點：" + cv.uncovered.slice(0, 4).map(function (c) { return "第 " + c.no + " 章"; }).join("、") + (cv.uncovered.length > 4 ? "…" : "") + "。（LINE 的「📚 全部章元」按鈕、網頁首頁的「☰ 章元」，還是找得到它們。）");
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
function _yzTitleListBubble_(ch, titles) {
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
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊　第 " + ch.no + " 章", ch.name, titles.length + " 個標題，點一個看內容"),
    body: { type: "box", layout: "vertical", paddingAll: "4px", contents: rows },
    footer: { type: "box", layout: "vertical", paddingAll: "8px", contents: [
      { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=home", "🏠 回首頁") },
      _yzFoot_()
    ] }
  };
}

// ── 階梯式內容（像法條：一層一層縮排，編號自動算）──
// 每一行只存「第幾層（lv）＋文字（v）」，編號是算出來的：加一行、搬一行，後面的編號自己跟著變。
var YZ_LADDER_MAX = 5;   // 最多 5 層
var YZ_LADDER_IMG_MAX = 20;   // 一段階梯式內容最多放幾張圖（編輯器的 🖼 按鈕到這個數就停用）
var YZ_LADDER_STYLES = {
  law: { name: "法條式", ex: "第一條／一、／（一）／1.／(1)" },
  cn:  { name: "條列式", ex: "一、／（一）／1.／(1)／①" },
  num: { name: "數字層級", ex: "1.／1.1／1.1.1／…" },
  dot: { name: "圓點縮排（不編號）", ex: "•／◦／▪／…" }
};
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
  return { items: items, marks: _yzLadderMarks_(items, b && b.style) };
}
// 這一段裡「會畫出來的圖片行」，照順序。「看大圖」按鈕用它的第幾張來找圖。
function _yzLadderImgs_(b) { return _yzLadderRows_(b).items.filter(_yzLadderIsImg_); }
function _yzLadderMarks_(items, style) {
  var st = YZ_LADDER_STYLES[style] ? style : "law", cnt = [0, 0, 0, 0, 0, 0], out = [];
  items.forEach(function (it) {
    if (_yzLadderIsImg_(it)) { out.push(""); return; }
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
  r.items.forEach(function (it, i) { if (_yzLadderIsImg_(it)) return; var w = _yzMarkW_(r.marks[i], px); if (!mw[it.lv] || w > mw[it.lv]) mw[it.lv] = w; });
  var step = YZ_LADDER_STEP[o.bs || "giga"] || 14, chunks = [], cur = null, rows = 0, imgN = 0;
  r.items.forEach(function (it, i) {
    if (!cur || it.lv === 1 || (it.lv === 2 && rows >= 14)) { cur = { type: "box", layout: "vertical", spacing: "sm", contents: [] }; chunks.push(cur); rows = 0; }
    if (_yzLadderIsImg_(it)) {   // 圖片：縮排跟同一層的文字對齊（沒有文字的那一層，就只照層級縮）
      var inner = _yzImage_({ url: it.img.url, ar: it.img.ar, cap: it.img.cap }, o.act ? o.act(imgN) : null);
      imgN++;
      if (inner) { cur.contents.push({ type: "box", layout: "vertical", paddingStart: (step * (it.lv - 1) + (mw[it.lv] ? mw[it.lv] + 4 : 0)) + "px", contents: [inner] }); rows++; }
      return;
    }
    var strong = st === "law" && it.lv === 1;
    cur.contents.push({
      type: "box", layout: "horizontal", spacing: "sm", paddingStart: (step * (it.lv - 1)) + "px",
      contents: [
        { type: "box", layout: "vertical", flex: 0, width: mw[it.lv] + "px", contents: [{ type: "text", text: r.marks[i], size: size, color: strong ? YZ_ACCENT : "#4A5565", weight: strong ? "bold" : "regular" }] },
        { type: "text", text: it.v, size: size, color: "#1F1F1F", wrap: true, flex: 1 }
      ]
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
// 階梯 → 一整段文字（編號＋縮排）。LINE 裡改整段、編輯器的「整段文字」都用它。
function _yzLadderToText_(items, style) {
  var r = _yzLadderRows_({ items: items, style: style }), dot = style === "dot";
  return r.items.map(function (it, i) {
    var pad = ""; for (var k = 1; k < it.lv; k++) pad += "　";
    if (_yzLadderIsImg_(it)) return pad + "［圖" + (String(it.img.cap || "").trim() ? "：" + String(it.img.cap).trim().replace(/[\r\n］\]]+/g, " ") : "") + "］";
    var m = r.marks[i];
    return pad + m + (/條$/.test(m) || dot ? " " : "") + it.v.replace(/\n/g, "\n" + pad + "　");   // 圓點後面要空一格，讀回來才分得出「記號」和「文字」
  }).join("\n");
}

// ── 內容：一個標題一張（文字、表格、圖片、備註）；太長就自動拆成幾張 ──
function _yzBlockNodes_(b, act, bs, ctx) {
  ctx = ctx || {};
  if (b.t === "text") return _yzTextLines_(b.v, { go: ctx.go });
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
  if (nav.length) foot.push({ type: "box", layout: "horizontal", spacing: "sm", contents: nav });
  foot.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=c&c=" + ch.id, "📚 這一章的標題") });
  if (o.dev) foot.push({ type: "box", layout: "horizontal", spacing: "sm", contents: [
    { type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=ed&t=" + ti.id, "✏️ 修改") },
    o.editUrl ? { type: "button", style: "secondary", height: "sm", flex: 1, action: { type: "uri", label: "🌐 網頁編輯", uri: o.editUrl } } : null
  ].filter(Boolean) });
  foot.push(_yzFoot_());
  var part = o.parts > 1 ? "（第 " + o.part + "／" + o.parts + " 張）" : "";
  return {
    type: "bubble", size: o.size || ti.size || "giga",
    header: _yzHead_("📘 藥戰手冊　第 " + ch.no + " 章　" + ch.name, ti.name, part || null),
    body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "13px", contents: body.length ? body : [{ type: "text", text: "（這個標題還沒有內容）", size: "sm", color: "#7B8696" }] },
    footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "10px", contents: foot }
  };
}
// blocks → 一則或多則訊息。回傳 {bubbles:[…], bytes:[每則多大], parts:n, kinds:["bubble"|"carousel"…], anim:n}
// 文字、表格、圖片、階梯式、動畫檔：塞進同一張卡片，太長就拆成下一張；分步動畫：自己一則（一排左右滑的卡片）。
function _yzContentBubbles_(ch, ti, blocks, note, o) {
  o = o || {};
  var act = function (b, s) { return _yzPB_("yz=img&t=" + ti.id + "&i=" + (b.i === undefined ? 0 : b.i) + (s === undefined ? "" : "&s=" + s), "看大圖"); };
  var segs = [{ nodes: [] }], used = { n: 0 };   // used：已經放了幾張「會自己動」的圖（LINE 一則訊息最多 10 張，整個標題一起算比較保守）
  var cur = function () { return segs[segs.length - 1]; };
  var hasNote = !!_yzNote_(note, ti.page);
  var probe = function (nodes, last) { return _yzBytes_(_yzContentBubble_(ch, ti, nodes, note, { size: o.size, dev: o.dev, editUrl: o.editUrl, prev: o.prev, next: o.next, parts: 9, part: 9, noteOn: !!last })); };
  var bs = o.size || ti.size || "giga";
  // 「連結到標題」的行：用標題代號找到標題，按鈕上寫「第 N 章　標題名」（同一章就只寫標題名）；找不到（被刪了）就不顯示
  var goFn = o.hb ? function (id) { var f = _yzFindTitle_(o.hb, id); return f ? { label: (f.ch.id === ch.id ? "" : "第 " + f.ch.no + " 章　") + f.t.name } : null; } : null;
  blocks.forEach(function (b, i) {
    b = Object.assign({}, b, { i: i });
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
    var nodes = _yzBlockNodes_(b, act, bs, { used: used, tid: ti.id, go: goFn });
    // 一個內容塊平常整塊放；階梯式內容常常很長，可以在「一條」和「一條」之間拆開；
    // 文字塊只有「自己一個就放不下」才一行一行拆。
    var units = [nodes];
    if (nodes.length > 1 && (b.t === "ladder" || (b.t === "text" && probe(nodes, false) > YZ_BUBBLE_SAFE))) units = nodes.map(function (n) { return [n]; });
    units.forEach(function (u) {
      var c = cur(), next = c.nodes.concat(u);
      if (c.nodes.length && probe(next, false) > YZ_BUBBLE_SAFE) segs.push({ nodes: u }); else c.nodes = next;
    });
  });
  // 最後一段是空的（動畫後面沒有別的內容）：有備註就放備註；沒有就放一句收尾，「上一個／下一個」按鈕才有地方放
  var last = cur();
  if (!last.nodes.length && segs.length > 1 && !hasNote) last.nodes = [{ type: "text", text: "（動畫到這裡結束）", size: "sm", color: "#7B8696", wrap: true }];
  // 備註放最後一張；放不下就單獨一張
  if (hasNote && last.nodes.length && probe(last.nodes, true) > YZ_BUBBLE_SAFE) segs.push({ nodes: [] });
  var parts = segs.length, out = [], bytes = [], kinds = [];
  segs.forEach(function (sg, i) {
    var lastOne = i === parts - 1;
    if (sg.steps) {
      var el = sg.steps.length > 1 ? { type: "carousel", contents: sg.steps } : sg.steps[0];
      out.push(el); bytes.push(_yzBytes_(el)); kinds.push(sg.steps.length > 1 ? "carousel" : "bubble");
      return;
    }
    var b = _yzContentBubble_(ch, ti, sg.nodes, note, { size: o.size, dev: o.dev && lastOne, editUrl: o.editUrl, prev: i === 0 ? o.prev : null, next: lastOne ? o.next : null, parts: parts, part: i + 1, noteOn: lastOne });
    out.push(b); bytes.push(_yzBytes_(b)); kinds.push("bubble");
  });
  return { bubbles: out, bytes: bytes, parts: parts, kinds: kinds, anim: used.n };
}

// ── 搜尋 ＋ 關鍵字重點整理 ──
// 資料長這樣（hb）：{ chapters:[…], titles:{ 章id:[標題…] }, kws:[關鍵字…] }
//   標題 ＝ { id, ch, name, page(藥戰手冊頁數), blocks:[…], note, … }
//   關鍵字 ＝ { id, name, alias:[別名…], pts:[ { v:重點, t:來源標題id, url:外部網址(選填) } ] }
// 重點是開發者自己整理的（不用 AI、不外傳）；來源連結 ＝ 點了跳到原本那一段，並顯示藥戰手冊頁數。
var YZ_WHERE = { name: "標題", text: "內文", ladder: "條文", table: "表格", img: "圖說", note: "備註", page: "頁數" };
var YZ_WEIGHT = { name: 50, text: 10, ladder: 10, table: 8, img: 5, note: 6 };
var YZ_KW_PER = 5;   // 一張關鍵字卡放幾個重點

function _yzTokens_(q) { return _yzNorm_(q).replace(/\s+/g, " ").trim().split(" ").filter(function (x) { return x; }); }
// 一小段字裡，哪些地方是搜尋的字：[{t:"文字", h:是不是搜尋的字}]。網頁用 <mark>，LINE 用粗體＋顏色。
function _yzHL_(text, toks) {
  text = String(text === null || text === undefined ? "" : text);
  var ns = _yzNorm_(text), mark = [], i;
  for (i = 0; i < ns.length; i++) mark.push(false);
  (toks || []).forEach(function (tk) {
    if (!tk) return;
    var at = 0, k;
    while ((k = ns.indexOf(tk, at)) >= 0) { for (i = k; i < k + tk.length; i++) mark[i] = true; at = k + tk.length; }
  });
  var out = [], cur = null;
  for (i = 0; i < text.length; i++) {
    if (!cur || cur.h !== mark[i]) { cur = { t: "", h: mark[i] }; out.push(cur); }
    cur.t += text.charAt(i);
  }
  return out;
}
function _yzFindTitle_(hb, tid) {
  var cs = hb.chapters || [];
  for (var i = 0; i < cs.length; i++) {
    var ts = (hb.titles || {})[cs[i].id] || [];
    for (var j = 0; j < ts.length; j++) if (ts[j].id === tid) return { ch: cs[i], t: ts[j] };
  }
  return null;
}
function _yzSrcLabel_(f) {   // 第 3 章　二、藥品請領…　｜藥戰手冊 第 14 頁
  var pg = _yzPageText_(f.t.page);
  return "第 " + f.ch.no + " 章　" + f.t.name + (pg ? "｜藥戰手冊 " + pg : "");
}
// 一個標題裡「找得到的字」攤平成一行一行（標題、每行文字、階梯每條、表格每列、圖說、備註）
function _yzUnits_(t) {
  var u = [{ k: "name", v: String(t.name || ""), b: -1 }];
  (t.blocks || []).forEach(function (b, i) {
    if (b.t === "text") _yzRtPlainLines_(b.v).forEach(function (ln) { u.push({ k: "text", v: ln, b: i }); });
    else if (b.t === "ladder") { var r = _yzLadderRows_(b); r.items.forEach(function (it, j) { if (_yzLadderIsImg_(it)) { if (String(it.img.cap || "").trim()) u.push({ k: "img", v: String(it.img.cap).trim(), b: i }); return; } u.push({ k: "ladder", v: r.marks[j] + " " + String(it.v).replace(/\n/g, " "), b: i }); }); }
    else if (b.t === "table") (b.rows || []).forEach(function (row, ri) {
      var s = (row || []).map(function (c) { return String(c === null || c === undefined ? "" : c).trim(); }).filter(Boolean).join(" ｜ ");
      if (s) u.push({ k: "table", v: s, b: i, h: ri === 0 && b.head !== false });   // h＝這一列是表頭
    });
    else if (b.t === "img" && b.cap) u.push({ k: "img", v: String(b.cap), b: i });
    else if (b.t === "anim") {
      if (b.kind === "steps") (b.steps || []).forEach(function (st) { if (st && String(st.cap || "").trim()) u.push({ k: "img", v: String(st.cap).trim(), b: i }); });
      else if (b.cap) u.push({ k: "img", v: String(b.cap), b: i });
    }
  });
  String(t.note || "").split("\n").forEach(function (ln) { if (ln.trim()) u.push({ k: "note", v: ln.trim(), b: -2 }); });
  return u;
}
function _yzSearchTitle_(t, toks) {
  var us = _yzUnits_(t), ns = us.map(function (u) { return _yzNorm_(u.v); }), score = 0, ok = true, i;
  toks.forEach(function (tk) {
    var found = false;
    for (i = 0; i < us.length; i++) if (ns[i].indexOf(tk) >= 0) { score += found ? 1 : (YZ_WEIGHT[us[i].k] || 5); found = true; }
    if (!found) ok = false;
  });
  if (!ok) return null;
  var best = 0, bs = -1;   // 摘錄的那一句：含最多關鍵字、而且最重要的
  for (i = 0; i < us.length; i++) {
    var n = 0; toks.forEach(function (tk) { if (ns[i].indexOf(tk) >= 0) n++; });
    if (!n) continue;
    var sc = n * 100 + (YZ_WEIGHT[us[i].k] || 5);
    if (sc > bs) { bs = sc; best = i; }
  }
  var u0 = us[best], v = u0.v, at = 0;
  if (u0.k === "name" && us.length > 1) { v = us[1].v; u0 = { k: "name" }; } else {
    at = ns[best].length; toks.forEach(function (tk) { var k = ns[best].indexOf(tk); if (k >= 0 && k < at) at = k; });
  }
  var from = Math.max(0, at - 14), to = Math.min(v.length, from + 46);
  var snip = (from > 0 ? "…" : "") + v.slice(from, to) + (to < v.length ? "…" : "");
  return { score: score, where: u0.k, snip: snip, segs: _yzHL_(snip, toks) };
}
function _yzKwMatch_(hb, q) {
  var nq = _yzNorm_(q).replace(/\s+/g, ""), out = [];
  if (!nq) return out;
  (hb.kws || []).forEach(function (k) {
    var best = 0;
    [k.name].concat(k.alias || []).forEach(function (x) {
      var n = _yzNorm_(x).replace(/\s+/g, "");
      if (!n) return;
      if (n === nq) best = Math.max(best, 100);
      else if (nq.length >= 2 && n.length >= 2 && (n.indexOf(nq) >= 0 || nq.indexOf(n) >= 0)) best = Math.max(best, 60);
    });
    if (best) out.push({ k: k, s: best, o: out.length });
  });
  out.sort(function (a, b) { return b.s - a.s || a.o - b.o; });
  return out.map(function (x) { return x.k; });
}
function _yzSearch_(hb, q) {
  var toks = _yzTokens_(q), pg = _yzPageQuery_(q), res = { q: String(q), toks: toks, page: pg, kws: [], hits: [] };
  if (!toks.length) return res;
  if (!pg) res.kws = _yzKwMatch_(hb, q);
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
// 這個關鍵字的來源（有哪些標題，照重點的順序、去重複）
function _yzKwSources_(hb, k) {
  var seen = {}, out = [];
  (k.pts || []).forEach(function (p) {
    if (!p || !p.t || seen[p.t]) return;
    var f = _yzFindTitle_(hb, p.t); if (!f) return;
    seen[p.t] = 1; out.push(f);
  });
  return out;
}
function _yzKwPts_(k) { return (k.pts || []).filter(function (p) { return p && String(p.v === null || p.v === undefined ? "" : p.v).trim(); }); }
// 開發者在編輯器裡用：幫這個關鍵字「找句子」（內文裡有它或它的別名的那幾行），按＋就能採用成重點
function _yzKwSuggest_(hb, k, limit) {
  var names = [k.name].concat(k.alias || []).map(function (x) { return _yzNorm_(x).replace(/\s+/g, ""); }).filter(Boolean);
  var haves = _yzKwPts_(k).map(function (p) { return _yzNorm_(String(p.v)).replace(/\s+/g, ""); }), seen = {}, out = [];
  (hb.chapters || []).forEach(function (c) {
    ((hb.titles || {})[c.id] || []).forEach(function (t) {
      _yzUnits_(t).forEach(function (u) {
        if (u.k === "name" || u.h) return;     // 標題、表頭不當成「重點」
        var n = _yzNorm_(u.v), key = n.replace(/\s+/g, ""), hit = names.some(function (nm) { return n.indexOf(nm) >= 0; });
        if (!hit || seen[key]) return;
        // 已經有的重點（或幾乎一樣的句子）就不再建議
        var dup = haves.some(function (hv) { return hv === key || (hv.length >= 6 && key.length >= 6 && (hv.indexOf(key) >= 0 || key.indexOf(hv) >= 0)); });
        if (dup) return;
        seen[key] = 1;
        out.push({ v: u.v.replace(/^\s*(?:\d{1,2}[.、)）]|\(\d{1,2}\)|（\d{1,2}）)\s*/, ""), t: t.id, ch: c, ti: t });
      });
    });
  });
  return out.slice(0, limit || 8);
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
      { type: "text", text: "第 " + h.ch.no + " 章　" + h.ch.name, size: "xxs", color: YZ_ACCENT, weight: "bold", wrap: true },
      { type: "text", text: h.t.name, size: "sm", weight: "bold", wrap: true, color: "#1F1F1F" }
    ];
    if (meta) c.push({ type: "text", text: meta, size: "xxs", color: "#8A6D00", wrap: true });
    if (h.segs && h.where !== "page") c.push(_yzSpans_(h.segs, { size: "xs", color: "#5F6B7A", maxLines: 2 }));
    rows.push({ type: "box", layout: "vertical", paddingAll: "9px", spacing: "xs", action: _yzPB_("yz=t&t=" + h.t.id, "打開"), contents: c });
  });
  if (more > 0) rows.push({ type: "text", text: "還有 " + more + " 筆，請把關鍵字打得更精確。", size: "xs", color: "#7B8696", margin: "md", wrap: true });
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊　搜尋", o.page ? "藥戰手冊 第 " + o.page + " 頁" : "「" + q + "」", (hits.length + more) + " 筆" + (o.page ? "" : "（符合的字會用顏色標出來）")),
    body: { type: "box", layout: "vertical", paddingAll: "4px", contents: rows },
    footer: { type: "box", layout: "vertical", paddingAll: "8px", contents: [
      { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=kws", "🔑 關鍵字清單") },
      _yzFoot_()
    ] }
  };
}
// 關鍵字重點整理卡：重點一條一條，每一條下面有「來源連結」（點了跳到原文），並顯示藥戰手冊頁數
function _yzKwBubbles_(hb, k, o) {
  o = o || {};
  var pts = _yzKwPts_(k), chunks = [], i;
  for (i = 0; i < pts.length; i += YZ_KW_PER) chunks.push(pts.slice(i, i + YZ_KW_PER));
  if (!chunks.length) chunks.push([]);
  var alias = (k.alias || []).filter(function (x) { return String(x || "").trim(); }), nsrc = _yzKwSources_(hb, k).length;
  return chunks.map(function (chunk, ci) {
    var body = [];
    if (!chunk.length) body.push({ type: "text", text: "這個關鍵字還沒有整理重點。按下面「看全部提到的地方」，會列出手冊裡有這個字的標題。", size: "sm", color: "#7B8696", wrap: true });
    chunk.forEach(function (p, j) {
      var n = ci * YZ_KW_PER + j + 1, f = p.t ? _yzFindTitle_(hb, p.t) : null;
      var links = [];
      if (f) links.push({ type: "text", text: "📖 " + _yzSrcLabel_(f) + " ›", size: "xxs", color: YZ_ACCENT, wrap: true, decoration: "underline", action: _yzPB_("yz=t&t=" + f.t.id, "看原文") });
      if (p.url) links.push({ type: "text", text: "🔗 原始出處（開網頁） ›", size: "xxs", color: "#1F6FD0", decoration: "underline", action: { type: "uri", label: "原始出處", uri: p.url } });
      var col = [{ type: "box", layout: "horizontal", spacing: "sm", contents: [
        { type: "text", text: _yzCirc_(n), size: "sm", color: YZ_ACCENT, weight: "bold", flex: 0 },
        { type: "text", text: String(p.v), size: "sm", color: "#1F1F1F", wrap: true, flex: 1 }
      ] }];
      if (links.length) col.push({ type: "box", layout: "vertical", spacing: "xs", paddingStart: "20px", contents: links });
      if (j > 0) body.push({ type: "separator", margin: "md", color: "#E3E7EC" });
      body.push({ type: "box", layout: "vertical", spacing: "xs", margin: j > 0 ? "md" : "none", contents: col });
    });
    var sub = pts.length + " 點重點　" + nsrc + " 個來源" + (alias.length ? "｜也可以搜：" + alias.join("、") : "") + (chunks.length > 1 ? "（第 " + (ci + 1) + "／" + chunks.length + " 張）" : "");
    return {
      type: "bubble", size: o.size || "mega",
      header: _yzHead_("📘 藥戰手冊　🔑 關鍵字重點", k.name, sub),
      body: { type: "box", layout: "vertical", paddingAll: "13px", contents: body },
      footer: { type: "box", layout: "vertical", spacing: "xs", paddingAll: "8px", contents: [
        { type: "button", style: "secondary", height: "sm", action: _yzPB_("yz=s&k=" + encodeURIComponent(k.id), "🔍 看全部提到「" + (k.name.length > 6 ? k.name.slice(0, 6) + "…" : k.name) + "」的地方") },
        { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=kws", "🔑 關鍵字清單") },
        _yzFoot_()
      ] }
    };
  });
}
// 關鍵字清單（輸入框上面「🔑 關鍵字」按下去的樣子）
function _yzKwListBubbles_(hb, o) {
  o = o || {};
  var ks = (hb.kws || []).filter(function (k) { return k && String(k.name || "").trim(); }), per = 10, out = [], i;
  for (i = 0; i < Math.max(1, ks.length); i += per) {
    var part = ks.slice(i, i + per), rows = [];
    if (!ks.length) rows.push({ type: "text", text: "還沒有建立關鍵字。", size: "sm", color: "#7B8696", margin: "md" });
    part.forEach(function (k, j) {
      if (j > 0) rows.push({ type: "separator", color: "#E3E7EC" });
      var alias = (k.alias || []).filter(function (x) { return String(x || "").trim(); });
      var left = [{ type: "text", text: "🔑 " + k.name, size: "sm", weight: "bold", color: "#1F1F1F", wrap: true }];
      if (alias.length) left.push({ type: "text", text: "也叫：" + alias.join("、"), size: "xxs", color: "#7B8696", wrap: true });
      rows.push({ type: "box", layout: "horizontal", paddingAll: "10px", spacing: "sm", action: _yzPB_("yz=k&k=" + k.id, "看重點"), contents: [
        { type: "box", layout: "vertical", flex: 1, contents: left },
        { type: "text", text: _yzKwPts_(k).length + " 點", size: "xxs", color: "#7B8696", flex: 0, gravity: "center" },
        { type: "text", text: "›", size: "lg", color: YZ_ACCENT, flex: 0, gravity: "center" }
      ] });
    });
    out.push({
      type: "bubble", size: "mega",
      header: _yzHead_("📘 藥戰手冊", "🔑 關鍵字", ks.length + " 個，點一個看重點整理；也可以直接打字搜尋"),
      body: { type: "box", layout: "vertical", paddingAll: "4px", contents: rows },
      footer: { type: "box", layout: "vertical", paddingAll: "8px", contents: [_yzFoot_()] }
    });
  }
  return out;
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
    var a = [m("💊 補藥神器", "補藥神器"), m("🏠 首頁", "首頁"), m("🔑 關鍵字", "關鍵字"), { label: "🌐 網頁", web: "yz" }];
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
  if (name === "edit") renderEdit(); else if (typeof pvSync === "function") pvSync();
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
/* ═══════════════ view.js：看手冊（目錄、章、標題、搜尋、關鍵字）＋畫內容的零件（編輯器的網頁預覽也用）═══════════════ */

/* ───────── 畫「內容」的零件 ───────── */
function hlNodes(text, hl) {   // 搜尋的字用 <mark> 標出來
  text = String(text === undefined || text === null ? "" : text);
  if (!hl || !hl.length) return [text];
  return _yzHL_(text, hl).map(function (g) { return g.h ? h("mark", {}, [g.t]) : g.t; });
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
  while (i < ls.length) {
    var L = ls[i];
    if (L.k === "gap") { box.appendChild(h("div", { style: "height:.45em" })); i++; continue; }
    if (L.k === "hr") { box.appendChild(h("hr", { class: "rt-hr" })); i++; continue; }
    if (L.k === "go") {
      var tg = o.go ? o.go(L.go) : null;
      if (tg && tg.label) box.appendChild(h("a", { class: "rt-go", href: "#", style: ind(L), onclick: function (id) { return function (e) { e.preventDefault(); if (o.onTitle) o.onTitle(id); }; }(L.go) }, [h("span", {}, ["→"]), h("b", {}, [tg.label]), h("span", {}, ["›"])]));
      i++; continue;
    }
    if (L.k === "box") {
      var T = YZ_RT_TONES[L.tone] || YZ_RT_TONES.info, lines = [];
      for (j = i; j < ls.length && ls[j].k === "box" && ls[j].tone === L.tone; j++) lines.push(h("div", { class: "rt-bl" }, rtKids(ls[j].runs, hl)));
      box.appendChild(h("div", { class: "rt-box", "data-tone": L.tone, style: "background:" + T.bg + ";border-color:" + T.bd + ";color:" + T.ink }, [h("span", { class: "rt-ic" }, [T.icon]), h("div", { class: "rt-bb" }, lines)]));
      i = j; continue;
    }
    if (L.k === "quote") {
      var qs = [];
      for (j = i; j < ls.length && ls[j].k === "quote"; j++) qs.push(h("div", { class: "rt-bl" }, rtKids(ls[j].runs, hl)));
      box.appendChild(h("div", { class: "rt-quote" }, qs));
      i = j; continue;
    }
    if (L.k === "head") {
      var H = YZ_RT_HEAD["h" + L.h];
      box.appendChild(h("div", { class: "rt-h rt-h" + L.h, style: "font-size:" + H.em + "em;color:" + H.color }, rtKids(L.runs, hl)));
    } else if (L.k === "item") {
      box.appendChild(h("div", { class: "li", style: ind(L) }, [h("span", { class: "mkr" }, [L.mark]), h("span", {}, rtKids(L.runs, hl))]));
    } else box.appendChild(h("div", { class: "txt", style: ind(L) }, rtKids(L.runs, hl)));
    i++;
  }
  return box;
}
// 表格：欄寬預設自動（照內容分）；開發者指定了比例（b.w）才照比例。太寬時外面那層有左右拉條
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
// 階梯式內容：編號跟 LINE 用同一份程式算（_yzLadderRows_），兩邊一定一樣
function webLadder(b, hl, o) {
  var r = _yzLadderRows_(b), st = YZ_LADDER_STYLES[b.style] ? b.style : "law", mw = {}, box = h("div", { class: "lad" });
  r.items.forEach(function (it, i) { if (_yzLadderIsImg_(it)) return; var w = _yzMarkW_(r.marks[i], 14); if (!mw[it.lv] || w > mw[it.lv]) mw[it.lv] = w; });
  r.items.forEach(function (it, i) {
    if (_yzLadderIsImg_(it)) {
      var im = h("img", { src: it.img.url, alt: it.img.cap || "", loading: "lazy" });
      im.onclick = function () { if (o && o.onImg) o.onImg(it.img.url); };
      box.appendChild(h("figure", { class: "lim lv" + it.lv, style: "margin-left:" + ((it.lv - 1) * 1.7 + (mw[it.lv] ? mw[it.lv] / 14 + 0.45 : 0)).toFixed(2) + "em" }, [im, it.img.cap ? h("figcaption", {}, hlNodes(it.img.cap, hl)) : null]));
      return;
    }
    var strong = st === "law" && it.lv === 1;
    box.appendChild(h("div", { class: "lr lv" + it.lv + (strong ? " strong" : ""), style: "padding-left:" + ((it.lv - 1) * 1.7).toFixed(1) + "em" }, [
      h("span", { class: "lm", style: "width:" + (mw[it.lv] / 14).toFixed(2) + "em" }, [r.marks[i]]),
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
  var fig = h("figure", { class: "stepsfig" }, [box, cap, h("div", { class: "animbar" }, [pv, tog, nx, dots, auto || n < 2 ? null : h("span", { class: "muted animnote" }, [animWhyStopped()])])]);
  if (n > 1) { var timer = setInterval(function () {
    if (!fig.isConnected) { clearInterval(timer); return; }
    if (!playing) return;
    if (i < n - 1) i++; else if (loop) i = 0; else playing = false;
    paint();
  }, sec * 1000); }
  return fig;
}
function webAnim(b, o) { return b.kind === "steps" ? webSteps(b, o) : (b.url ? webAnimFile(b, o) : h("div")); }
function webFig(b, o) {
  var im = h("img", { src: b.url, alt: b.cap || "", loading: "lazy" });
  im.onclick = function () { if (o && o.onImg) o.onImg(b.url); };
  return h("figure", {}, [im, b.cap ? h("figcaption", {}, hlNodes(b.cap, o && o.hl)) : null]);
}
function kwsForTitle(kws, tid) { return (kws || []).filter(function (k) { return _yzKwPts_(k).some(function (p) { return p.t === tid; }); }); }
function extLink(url, label) {   // 外部網址：只收 https，開新分頁、不帶來源
  return /^https:\/\/[^\s"'<>]+$/.test(url || "") ? h("a", { class: "src ext", href: url, target: "_blank", rel: "noopener noreferrer" }, [label]) : null;
}
function webArticle(ch, t, o) {
  o = o || {};
  var a = h("article", { class: "art" });
  if (o.width) a.style.setProperty("--aw", o.width + "px");
  a.appendChild(h("div", { class: "crumb" }, ["第 " + ch.no + " 章　" + ch.name]));
  a.appendChild(h("h2", {}, hlNodes(t.name || "（還沒有標題）", o.hl)));
  var ks = o.kws ? kwsForTitle(o.kws, t.id) : [];
  if (ks.length) a.appendChild(h("div", { class: "kwrow" }, [h("span", { class: "muted" }, ["🔑 關鍵字　"])].concat(ks.map(function (k) {
    return h("button", { class: "kwchip", type: "button", onclick: function () { if (o.onKw) o.onKw(k.id); } }, [k.name]);
  }))));
  var goFn = o.hb ? function (id) { var f = _yzFindTitle_(o.hb, id); return f ? { label: (f.ch.id === ch.id ? "" : "第 " + f.ch.no + " 章　") + f.t.name } : null; } : null;
  (t.blocks || []).forEach(function (b) {
    if (b.t === "text") a.appendChild(webText(b.v, o.hl, { go: goFn, onTitle: o.onTitle }));
    else if (b.t === "ladder") a.appendChild(webLadder(b, o.hl, o));
    else if (b.t === "table") a.appendChild(webTable(b, o.hl));
    else if (b.t === "img" && b.url) a.appendChild(webFig(b, o));
    else if (b.t === "anim") a.appendChild(webAnim(b, o));
  });
  var pg = _yzPageText_(t.page);
  if (t.note || pg) {
    var nb = h("div", { class: "note" }, [h("b", { class: "nl" }, ["備註"])]);
    if (t.note) nb.appendChild(webText(t.note, o.hl, { plain: true }));
    if (pg) nb.appendChild(h("div", { class: "pgline" + (t.note ? " gap" : "") }, [h("span", { class: "pgtag" }, [h("span", {}, ["📖 藥戰手冊頁數　"]), h("b", {}, [pg])])]));
    a.appendChild(nb);
  }
  if (YZ_CFG.footer) a.appendChild(h("div", { class: "foot" }, [YZ_NOTICE]));
  return a;
}
// 關鍵字重點整理（網頁版）：重點一條一條，每條下面有來源連結（點了開原文），並顯示藥戰手冊頁數
function webKwPanel(hb, k, o) {
  o = o || {};
  var pts = _yzKwPts_(k), alias = (k.alias || []).filter(Boolean), srcs = _yzKwSources_(hb, k);
  var box = h("div", { class: "kwp" });
  box.appendChild(h("div", { class: "kwh" }, [h("span", {}, ["🔑 "]), h("b", {}, [k.name || "（還沒有名稱）"]), alias.length ? h("span", { class: "muted" }, ["　也可以搜：" + alias.join("、")]) : null, h("span", { class: "muted", style: "margin-left:auto" }, [pts.length + " 點重點・" + srcs.length + " 個來源"])]));
  if (!pts.length) box.appendChild(h("div", { class: "muted", style: "padding:6px 0" }, ["這個關鍵字還沒有整理重點。"]));
  pts.forEach(function (p, i) {
    var f = p.t ? _yzFindTitle_(hb, p.t) : null, links = [];
    if (f) links.push(h("a", { class: "src", href: "#", onclick: function (e) { e.preventDefault(); if (o.onTitle) o.onTitle(f.t.id); } }, ["📖 " + _yzSrcLabel_(f) + " ›"]));
    var ex = p.url ? extLink(p.url, "🔗 原始出處（開網頁） ›") : null; if (ex) links.push(ex);
    box.appendChild(h("div", { class: "kwpt" }, [h("span", { class: "kwn" }, [_yzCirc_(i + 1)]), h("div", { style: "flex:1;min-width:0" }, [h("div", {}, [p.v])].concat(links))]));
  });
  if (o.onSearch) box.appendChild(h("div", { style: "margin-top:8px" }, [btn("🔍 看全部提到「" + k.name + "」的地方", function () { o.onSearch(k.name); })]));
  if (YZ_CFG.footer) box.appendChild(h("div", { class: "foot", style: "text-align:left;margin-top:10px" }, [YZ_NOTICE]));
  return box;
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
// 平面目錄圖（不能 3D 的時候）：圖＋標籤＋圓點。滑過：標籤變色、鏡頭靠近、底下說明卡；手機第一下選到、第二下進去
function webCatalogMap(cat, hb, o) {
  o = o || {};
  var spots = _yzMapSpots_(cat).slice(0, YZ_MAP_MAX), fx = cat.fx !== false && o.fx !== false;
  // o.full：滿版（首頁）＝整張圖放進畫面裡（不裁掉），左右或上下留深色邊
  var touch = !!(window.matchMedia && window.matchMedia("(hover: none)").matches), still = reduceMotion();
  var box = h("div", { class: "catmap" + (fx ? " fx" : "") });
  if (o.width) box.style.maxWidth = o.width + "px";
  if (o.full) { var arN = (function () { var a = String(cat.ar || "20:13").split(":"); return (Number(a[0]) || 20) / (Number(a[1]) || 13); })(); box.classList.add("full"); box.style.width = "min(100%, calc(var(--hsh, 80vh) * " + arN.toFixed(4) + "))"; }
  var stage = h("div", { class: "catstage", style: "aspect-ratio:" + arCss(cat.ar) });
  var cam = h("div", { class: "catcam", "aria-hidden": "true" }, [h("img", { src: o.img || cat.img, alt: "", draggable: "false" })]);
  var hit = h("div", { class: "cathit" }), vis = {}, info = null, cur = null, leaveT = 0, lastPT = "";
  stage.appendChild(cam);
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
  function pick(s) {
    clearTimeout(leaveT); cur = s;
    Object.keys(vis).forEach(function (id) { vis[id].classList.toggle("on", id === s.id); });
    if (!fx) return;
    fill(s); info.classList.add("show");
    if (!still) aim(s);
  }
  function unpick() { cur = null; Object.keys(vis).forEach(function (id) { vis[id].classList.remove("on"); }); if (fx) { info.classList.remove("show"); cam.style.transform = ""; } }
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
    img: o.img, ar: cat.ar, spots: spots, theta: cat.theta || 70, labels: cat.labels !== false, fx: cat.fx !== false, title: cat.title || "目錄", float: !!o.float, avoid: o.avoid,
    onOpen: function (s) { if (o.onSpot) o.onSpot(s.to, s); },
    onLock: function (s) { if (o.onLock) o.onLock(s); else toast("🔒 「" + (s.label || "這裡") + "」還在整理，開放以後就能看"); },
    onError: function () { if (o.onError) o.onError(); }
  });
  if (!api) { wrap.remove(); return null; }
  wrap._api = api;
  return wrap;
}
function webChapterCard(c, n, o) {
  o = o || {};
  var el = h("div", { class: "gch", role: "button", tabindex: "0", onclick: o.onclick, onkeydown: function (e) { if ((e.key === "Enter" || e.key === " ") && o.onclick) { e.preventDefault(); o.onclick(); } } }, [
    c.img ? h("img", { src: c.img, alt: "", loading: "lazy" }) : h("div", { class: "gch-noimg" }, ["第 " + c.no + " 章"]),
    h("div", { class: "gb" }, [h("div", { class: "n" }, ["第 " + c.no + " 章"]), h("div", { class: "nm" }, [c.name || "（還沒有章名）"]), c.intro ? h("div", { class: "it" }, [c.intro]) : null, h("div", { class: "it" }, [n + " 個標題"])])
  ]);
  if (o.width) { el.style.width = o.width + "px"; el.style.cursor = "default"; }
  return el;
}

/* ───────── 看手冊 ───────── */
// view：""＝目錄／章／內容、"search"＝搜尋結果、"kw"＝一個關鍵字的重點整理、"kwlist"＝關鍵字清單
var WV = { cid: null, tid: null, view: "", q: "", qv: "", kwid: null, hl: null, pano: null, side: false, flat: false };
function buildView() { WV = { cid: null, tid: null, view: "", q: "", qv: "", kwid: null, hl: null, pano: null, side: false, flat: false }; }
function seen(kind, label) { if (CFG && CFG.viewLog === false) return; call("hbSeen", [kind, String(label || "").slice(0, 80)]).then(function (x) { if (x && x.st === "lock") logout("expired"); }, function () { /* 記不到就算了 */ }); }
function topOfView() { try { window.scrollTo(0, 0); } catch (e) { /* 沒關係 */ } }
function openChapter(cid) {
  var c = chapterOf(cid); if (!c) { toast("找不到這一章（可能被刪掉了）"); return; }
  var ts = titlesOf(cid);
  if (ts.length === 1) { openTitle(ts[0].id); return; }
  WV.cid = cid; WV.tid = null; WV.view = ""; WV.hl = null; WV.side = false; drawWeb(); topOfView();
  seen("開啟章", "第 " + c.no + " 章　" + c.name);
}
function openTitle(tid, hl) {
  var t = titleOf(tid); if (!t) { toast("找不到這個標題（可能被刪掉了）"); return; }
  var c = chapterOf(t.ch);
  WV.cid = t.ch; WV.tid = tid; WV.view = ""; WV.hl = hl && hl.length ? hl : null; WV.side = false; drawWeb();
  var m = $("#pane-view mark"); if (m) m.scrollIntoView({ block: "center" }); else topOfView();
  seen("看標題", "第 " + (c ? c.no : "?") + " 章　" + t.name);
}
function openKw(id) {
  var k = HB.kws.filter(function (x) { return x.id === id; })[0]; if (!k) return;
  WV.kwid = id; WV.view = "kw"; WV.tid = null; WV.side = false; drawWeb(); topOfView();
  seen("看關鍵字重點", k.name);
}
function openKwList() { WV.view = "kwlist"; WV.tid = null; WV.side = false; drawWeb(); topOfView(); }
function webSearch(q) {
  q = String(q || "").trim().slice(0, 60); WV.qv = q;
  if (!q) { WV.view = ""; drawWeb(); return; }
  WV.q = q; WV.view = "search"; WV.tid = null; WV.side = false; drawWeb(); topOfView();
  var r = _yzSearch_(HB, q); if (r.kws.length) seen("看關鍵字重點", r.kws[0].name);   // 不記搜尋的字，只記看了哪個關鍵字
}
function kwPanelOpts() { return { onTitle: function (tid) { openTitle(tid); }, onSearch: webSearch }; }
function goHome() { WV.cid = null; WV.tid = null; WV.view = ""; WV.side = false; drawWeb(); topOfView(); }
function goHomeTab() { if (TAB !== "view") showTab("view"); goHome(); }   // 左上角的標誌、右下角的「🏠 首頁」

function drawWeb() {
  var root = $("#pane-view"); if (!root || !HB) return;
  if (WV.pano) { try { WV.pano.destroy(); } catch (e) { /* 沒關係 */ } WV.pano = null; }
  root.innerHTML = "";
  var atHome = !WV.cid && !WV.tid && !WV.view;
  if (atHome && homeMapOn()) { drawHomeFull(root); return; }   // 首頁＝滿版調劑台
  homeClass(false);
  if (!atHome) root.appendChild(h("button", { class: "hhome", type: "button", onclick: goHome, title: "回首頁（手冊目錄）" }, ["🏠 首頁"]));
  var qin = h("input", { class: "in", type: "search", enterkeyhint: "search", placeholder: "🔎 搜尋手冊（關鍵字，或打「第14頁」）", value: WV.qv, "aria-label": "搜尋手冊" });
  root.appendChild(h("div", { class: "vbar" }, [
    h("button", { class: "btn sm sidebtn", type: "button", "aria-expanded": WV.side ? "true" : "false", onclick: function () { WV.side = !WV.side; drawWeb(); } }, ["☰ 章元"]),
    h("form", { class: "wsearch", role: "search", onsubmit: function (e) { e.preventDefault(); qin.blur(); webSearch(qin.value); } }, [qin, h("button", { class: "btn sm pri", type: "submit" }, ["搜尋"])]),
    btn("🔑 關鍵字", openKwList)
  ]));
  var body = h("div", { class: "wbody" + (WV.side ? " side-on" : "") });
  var side = h("nav", { class: "side", "aria-label": "章元" }), main = h("div", { class: "main" });
  body.appendChild(side); body.appendChild(main); root.appendChild(body);
  // 左邊：章元
  side.appendChild(h("h4", {}, ["章元（" + HB.chapters.length + "）"]));
  side.appendChild(h("div", { class: "chI" + (!WV.cid && !WV.view ? " on" : ""), role: "button", tabindex: "0", onclick: goHome, onkeydown: function (e) { if (e.key === "Enter") goHome(); } }, [
    h("div", { class: "th thi" }, ["🏠"]), h("div", {}, [h("div", { class: "t2" }, ["首頁（手冊目錄）"])])
  ]));
  HB.chapters.forEach(function (c) {
    var go = function () { openChapter(c.id); };
    side.appendChild(h("div", { class: "chI" + (WV.cid === c.id && !WV.tid && !WV.view ? " on" : ""), role: "button", tabindex: "0", onclick: go, onkeydown: function (e) { if (e.key === "Enter") go(); } }, [
      c.img ? h("img", { class: "th", src: c.img, alt: "", loading: "lazy" }) : h("div", { class: "th thi" }, [c.no]),
      h("div", {}, [h("div", { class: "t1" }, ["第 " + c.no + " 章"]), h("div", { class: "t2" }, [c.name])])
    ]));
    if (WV.cid === c.id) titlesOf(c.id).forEach(function (t) {
      side.appendChild(h("div", { class: "chT" + (WV.tid === t.id ? " on" : ""), role: "button", tabindex: "0", onclick: function () { openTitle(t.id); }, onkeydown: function (e) { if (e.key === "Enter") openTitle(t.id); } }, [t.name]));
    });
  });
  side.appendChild(h("h4", { style: "margin-top:12px" }, ["關鍵字（" + HB.kws.length + "）"]));
  side.appendChild(h("div", { class: "chT" + (WV.view === "kwlist" ? " on" : ""), role: "button", tabindex: "0", style: "padding-left:12px", onclick: openKwList, onkeydown: function (e) { if (e.key === "Enter") openKwList(); } }, ["🔑 全部關鍵字"]));
  // 右邊：目錄／標題清單／內容／搜尋結果／關鍵字
  if (WV.view === "search") drawSearchResults(main);
  else if (WV.view === "kwlist") drawKwList(main);
  else if (WV.view === "kw") {
    var k = HB.kws.filter(function (x) { return x.id === WV.kwid; })[0];
    if (k) { main.appendChild(h("div", { class: "crumb2" }, ["關鍵字重點整理"])); main.appendChild(webKwPanel(HB, k, kwPanelOpts())); }
    else { WV.view = ""; drawWeb(); return; }
  } else if (WV.tid && titleOf(WV.tid)) {
    var t = titleOf(WV.tid), ch = chapterOf(t.ch), ts = titlesOf(ch.id), i = ts.indexOf(t);
    main.appendChild(webArticle(ch, t, { width: t.ww || 760, onImg: lightbox, hl: WV.hl, kws: HB.kws, onKw: openKw, hb: HB, onTitle: openTitle }));
    main.appendChild(h("div", { class: "tnav", style: "max-width:" + (t.ww || 760) + "px" }, [
      i > 0 ? btn("‹ " + ts[i - 1].name, function () { openTitle(ts[i - 1].id); }, "") : null,
      i < ts.length - 1 ? btn(ts[i + 1].name + " ›", function () { openTitle(ts[i + 1].id); }, "") : null,
      h("span", { style: "flex:1" }),
      IS_DEV ? btn("✏️ 在編輯器打開這個標題", function () { gotoEdit(t.id); }, "") : null
    ]));
  } else if (WV.cid && chapterOf(WV.cid)) {
    var c = chapterOf(WV.cid);
    main.appendChild(h("div", { class: "chhead" }, [
      c.img ? h("img", { src: c.img, alt: "" }) : null,
      h("div", {}, [h("div", { class: "crumb2" }, ["第 " + c.no + " 章"]), h("h2", {}, [c.name]), c.intro ? h("div", { class: "muted" }, [c.intro]) : null])
    ]));
    var list = h("div", { class: "tlist" }), tts = titlesOf(c.id);
    if (!tts.length) list.appendChild(h("div", { class: "muted" }, [IS_DEV ? "這一章還沒有標題（藥師在目錄圖上看到的是🔒）。到「✏️ 編輯」新增第一個標題，就會自動打開。" : "這一章還在整理，還沒有內容。"]));
    tts.forEach(function (tt) {
      var pg = _yzPageShort_(tt.page);
      list.appendChild(h("div", { class: "trow", role: "button", tabindex: "0", onclick: function () { openTitle(tt.id); }, onkeydown: function (e) { if (e.key === "Enter") openTitle(tt.id); } }, [h("span", {}, [tt.name]), h("span", { class: "trr" }, [pg ? h("span", { class: "pgs" }, [pg]) : null, h("span", { class: "chev" }, ["›"])])]));
    });
    main.appendChild(list);
    if (YZ_CFG.footer) main.appendChild(h("div", { class: "foot", style: "text-align:left" }, [YZ_NOTICE]));
  } else drawHome(main);
}
function drawHome(main) {   // 還沒有目錄圖（或「開啟目錄圖」關著）的首頁：章元卡片
  WV.cid = null; WV.tid = null;
  main.appendChild(h("h2", { class: "h2" }, ["手冊目錄"]));
  main.appendChild(h("div", { class: "muted", style: "margin-bottom:12px" }, ["共 " + HB.chapters.length + " 章，點一章開始看；或用上面的搜尋、「🔑 關鍵字」。"]));
  main.appendChild(h("div", { class: "grid10" }, HB.chapters.map(function (c) { return webChapterCard(c, titlesOf(c.id).length, { onclick: function () { openChapter(c.id); } }); })));
  if (YZ_CFG.footer) main.appendChild(h("div", { class: "foot", style: "text-align:left" }, [YZ_NOTICE]));
}
/* ───────── 首頁：滿版調劑台（照參考網站：一打開整個畫面就是調劑台）─────────
   最上面一條跑馬燈；左上角「藥戰手冊」標誌＋提示；右上角名字、閒置倒數、登出（開發者多「編輯」「管理」）；
   左下角 🔍 搜尋、☰ 章元、🔑 關鍵字；右下角是 3D 的按鍵。還沒有目錄圖（或「開啟目錄圖」關著）：照舊用章元卡片當首頁。 */
function homeMapOn() { var c = HB && HB.cat; return !!(c && c.on && c.img); }
function homeClass(on) { if (APP) APP.classList.toggle("home-on", !!on); }
function homeLockToast(name) { toast("🔒 「" + (name || "這一章") + "」還在整理，開放以後就能看"); }
function marquee(cat) {
  var words = ["藥戰手冊", (cat && cat.title) || "藥師調劑台"];
  if (YZ_CFG.footer) words.push(YZ_NOTICE.replace(/[。.]$/, ""));
  var group = function () {
    var g = h("span", { class: "mq-g" });
    for (var i = 0; i < 6; i++) words.forEach(function (w) { g.appendChild(h("i", { class: "mq-ar" }, ["→"])); g.appendChild(h("b", {}, [w])); });
    return g;
  };
  return h("div", { class: "mq", "aria-hidden": "true" }, [h("div", { class: "mq-track" }, [group(), group()])]);   // 兩組一樣的接在一起，往左跑一組的寬度＝接得起來
}
function drawHomeFull(root) {
  WV.cid = null; WV.tid = null;
  homeClass(true);
  var cat = _yzMapLive_(HB.cat, HB, IS_DEV);
  var goTo = function (to) { var m = /^([ct]):(.+)$/.exec(to || ""); if (!m) return; if (m[1] === "c") openChapter(m[2]); else openTitle(m[2]); };
  var onLock = function (s) { homeLockToast(s && s.label); };
  var home = h("section", { class: "home", "aria-label": "首頁（手冊目錄）" });
  var stage = h("div", { class: "hstage" }), scene = h("div", { class: "hscene" });
  home.appendChild(marquee(cat)); home.appendChild(stage); stage.appendChild(scene); root.appendChild(home);
  var flat = function () {
    if (WV.pano) { try { WV.pano.destroy(); } catch (e) { /* 沒關係 */ } WV.pano = null; }
    scene.innerHTML = ""; scene.classList.add("flat");
    scene.appendChild(webCatalogMap(cat, HB, { full: true, onSpot: goTo, onLock: onLock }));
  };
  if (panoOk(cat) && !WV.flat) {
    var u = catBlob(cat, function () { if (MAIN && TAB === "view" && !WV.tid && !WV.cid && !WV.view) drawWeb(); });
    if (u) {
      var pw = webCatalogPano(scene, cat, HB, { img: u, float: true, onSpot: goTo, onLock: onLock, onError: function () { WV.flat = true; flat(); },
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
  // 左下：搜尋、章元、關鍵字
  stage.appendChild(h("div", { class: "hdock" }, [
    btn("🔍 搜尋", function () { homeSearch(stage); }, "hfab"),
    btn("☰ 章元", function () { homeDrawer(stage); }, "hfab"),
    btn("🔑 關鍵字", openKwList, "hfab")
  ]));
  idleTick();
  if (WV.pano && WV.pano.refreshAvoid) WV.pano.refreshAvoid();
}
function homeSearch(stage) {
  var old = $(".hsearch", stage); if (old) { old.remove(); return; }
  var qin = h("input", { class: "in", type: "search", enterkeyhint: "search", placeholder: "搜尋手冊（關鍵字，或打「第14頁」）", "aria-label": "搜尋手冊" });
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
  HB.chapters.forEach(function (c) {
    var n = titlesOf(c.id).length, lock = !n && !IS_DEV;
    var go = function () { if (lock) { homeLockToast(c.name); return; } close(); openChapter(c.id); };
    list.appendChild(h("div", { class: "chI" + (lock ? " lock" : ""), role: "button", tabindex: "0", "aria-label": "第 " + c.no + " 章　" + c.name + (lock ? "（還在整理）" : ""), onclick: go, onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } } }, [
      c.img && !lock ? h("img", { class: "th", src: c.img, alt: "", loading: "lazy" }) : h("div", { class: "th thi" }, [lock ? "🔒" : c.no]),
      h("div", {}, [h("div", { class: "t1" }, ["第 " + c.no + " 章　" + (lock ? "還在整理" : n ? n + " 個標題" : "還沒有標題（藥師看到🔒）")]), h("div", { class: "t2" }, [c.name])])
    ]));
  });
  list.appendChild(h("div", { class: "chT", role: "button", tabindex: "0", onclick: function () { close(); openKwList(); }, onkeydown: function (e) { if (e.key === "Enter") { close(); openKwList(); } } }, ["🔑 全部關鍵字（" + HB.kws.length + "）"]));
  list.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  stage.appendChild(h("div", { class: "hshade", onclick: close }));
  stage.appendChild(list);
  var f = $(".chI", list); if (f) try { f.focus(); } catch (e) { /* 沒關係 */ }
}
function drawSearchResults(main) {
  var r = _yzSearch_(HB, WV.q);
  main.appendChild(h("h2", { class: "h2" }, [r.page ? "藥戰手冊 第 " + r.page + " 頁" : "搜尋「" + WV.q + "」"]));
  if (r.kws.length) {
    main.appendChild(h("div", { class: "sect" }, ["🔑 關鍵字重點整理（重點＋來源連結）"]));
    r.kws.slice(0, 3).forEach(function (k) { main.appendChild(webKwPanel(HB, k, { onTitle: function (tid) { openTitle(tid, r.toks); } })); });
  }
  main.appendChild(h("div", { class: "sect" }, [(r.page ? "對應這一頁的標題" : "手冊裡提到「" + WV.q + "」的地方") + "（" + r.hits.length + "）"]));
  if (!r.hits.length) main.appendChild(h("div", { class: "muted" }, [r.page ? "標題有填「藥戰手冊頁數」才找得到。" : "手冊裡沒有「" + WV.q + "」。這裡只查手冊，不查藥。"]));
  r.hits.forEach(function (hit) {
    var pg = _yzPageText_(hit.t.page), label = YZ_WHERE[hit.where] && hit.where !== "page" ? YZ_WHERE[hit.where] + "有符合" : "";
    var go = function () { openTitle(hit.t.id, r.toks); };
    main.appendChild(h("div", { class: "hit", role: "button", tabindex: "0", onclick: go, onkeydown: function (e) { if (e.key === "Enter") go(); } }, [
      h("div", { class: "crumb2" }, ["第 " + hit.ch.no + " 章　" + hit.ch.name]),
      h("div", { style: "font-weight:700" }, hlNodes(hit.t.name, r.toks)),
      label || pg ? h("div", { class: "pgs", style: "margin:1px 0" }, [[label, pg ? "📖 藥戰手冊 " + pg : ""].filter(Boolean).join("　")]) : null,
      hit.where !== "page" ? h("div", { class: "muted" }, hlNodes(hit.snip, r.toks)) : null
    ]));
  });
  if (YZ_CFG.footer) main.appendChild(h("div", { class: "foot", style: "text-align:left" }, [YZ_NOTICE]));
}
function drawKwList(main) {
  main.appendChild(h("h2", { class: "h2" }, ["🔑 關鍵字"]));
  main.appendChild(h("div", { class: "muted", style: "margin-bottom:12px" }, ["共 " + HB.kws.length + " 個。點一個看「重點整理」，每個重點下面有來源連結。"]));
  if (!HB.kws.length) main.appendChild(h("div", { class: "muted" }, ["還沒有建立關鍵字。"]));
  var g = h("div", { class: "kwgrid" });
  HB.kws.forEach(function (k) {
    var go = function () { openKw(k.id); };
    g.appendChild(h("div", { class: "kwcard", role: "button", tabindex: "0", onclick: go, onkeydown: function (e) { if (e.key === "Enter") go(); } }, [h("b", {}, ["🔑 " + k.name]), (k.alias || []).length ? h("div", { class: "muted", style: "font-size:12px" }, ["也叫：" + k.alias.join("、")]) : null, h("div", { class: "muted", style: "font-size:12px;margin-top:2px" }, [_yzKwPts_(k).length + " 點重點"])]));
  });
  main.appendChild(g);
  if (YZ_CFG.footer) main.appendChild(h("div", { class: "foot", style: "text-align:left" }, [YZ_NOTICE]));
}

/* ════════ rte.js ════════ */
/* rte.js — 文字編輯器（網頁編輯用）。像 Notion 那樣「看到什麼就是什麼」，格式用最上面那一排按鍵（沒有「/」選單）。
 * 內容存成「格式文字」（rt.js 的標記）；這裡只管畫面和操作：選字 → 按鍵、按 Enter 換行、Backspace 合併、貼上、復原。
 * 做法：打字交給瀏覽器（中文輸入法不會被打斷）；按格式鍵、Enter、Backspace、貼上這些，才改「資料」再重畫。
 * 資料的單位是「一行」：{k:種類, lv:縮排, tone:標註顏色, go:連結的標題, runs:[{t:字, b,i,u,s,c,z}]}。 */
var RTE = { cur: null, pop: null, bar: null, lastColor: "red" };
var RTE_EMOJI = ["⚠️", "❗", "❓", "✅", "❌", "➡️", "⬆️", "⬇️", "📌", "📖", "📞", "⏰", "🔒", "💊", "💉", "🌡️", "❄️", "🔥", "⭐", "🔴", "🟡", "🟢", "🔵", "👍"];

function rteTxt(runs) { return _yzRtRunsText_(runs); }
function rteLen(L) { return L && L.runs ? rteTxt(L.runs).length : 0; }
function rteIsBlock(L) { return !!L && (L.k === "hr" || L.k === "go"); }        // 沒有字的行（分隔線、連結到標題）
function rteMarkClass(m) { return /^[☐☑]$/.test(m) ? "todo" : /^[•・●-]$/.test(m) ? "ul" : "ol"; }
function rteNewLine() { return { k: "p", lv: 0, runs: [] }; }
function rteCopyLines(ls) {
  return ls.map(function (L) {
    var o = { k: L.k, lv: L.lv || 0, runs: (L.runs || []).map(_yzRtCopy_) };
    if (L.tone) o.tone = L.tone;
    if (L.go !== undefined) o.go = L.go;
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
      var sel = h("select", { class: "in rl-gosel", "aria-label": "要連結到哪個標題" }, [h("option", { value: "" }, ["（選一個標題）"])].concat(opts.map(function (x) { return h("option", { value: x.id }, [x.label]); })));
      sel.value = L.go || "";
      var gh = h("span", { class: "muted rl-gohint" });
      var paintGo = function () {
        var ok = !!sel.value, gone = !ok && !!d.getAttribute("data-go");
        d.classList.toggle("warn", !ok);
        gh.textContent = ok ? "LINE 上是一個可以點的按鈕列；標題改名，這裡自動跟著變" : gone ? "⚠ 原本連結的標題找不到了（可能被刪掉），請重新選一個" : "⚠ 還沒選標題：沒選的話，LINE 和網頁上都不會顯示這一行";
      };
      sel.onchange = function () { d.setAttribute("data-go", sel.value); paintGo(); lines = readLines(); emit(); histPush(); syncBar(); };
      paintGo();
      d.appendChild(h("span", { class: "rl-goic" }, ["↗ 連結到標題"]));
      d.appendChild(sel);
      d.appendChild(gh);
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這個連結", "aria-label": "刪除這個連結", onclick: function () { removeLine(d); } }, ["✕"]));
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
        if (pv && pv.k === "box" && pv.tone === L.tone) d.setAttribute("data-cont", "1");
        if (nx && nx.k === "box" && nx.tone === L.tone) d.setAttribute("data-more", "1");
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
      if (!/^(p|h[1-4]|hr|q|box|go)$/.test(k)) k = "p";
      var L = { k: k, lv: Math.min(YZ_RT_MAXLV, +(n.getAttribute("data-lv") || 0) || 0), runs: [] };
      if (k === "hr") { out.push(L); return; }
      if (k === "go") { L.go = n.getAttribute("data-go") || ""; out.push(L); return; }
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
      var k = lns[i].getAttribute("data-k"); if (k === "hr" || k === "go") continue;
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
  function cmdInsertLine(kind) {   // 分隔線、連結到標題：整行；游標在空行就直接變成它，不然插在這一行後面；後面一定留一行可以打字
    run(function (ls, s) {
      var li = s.b.li, L = ls[li], empty = L && L.k === "p" && !rteTxt(L.runs || []).trim();
      var nl = kind === "hr" ? { k: "hr", lv: 0, runs: [] } : { k: "go", lv: 0, go: "", runs: [] }, at;
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
      if (!rteIsBlock(L)) {
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === to && to === s.b.li ? s.b.o : len;
        c.runs = _yzRtSlice_(L.runs, a, b);
        if (s.a.li === to) { c.k = "p"; c.lv = 0; delete c.tone; }   // 只選了半行：只帶字的格式，不帶「這一行是標題」
      }
      part.push(c);
    }
    e.clipboardData.setData("text/plain", part.map(function (L) { return rteIsBlock(L) ? "" : rteTxt(L.runs); }).join("\n"));
    e.clipboardData.setData("application/x-yz-rt", _yzRtSerialize_(part));
    e.preventDefault();
    if (cut) run(function (ls2, s2) { var p = deleteSel(ls2, s2); return caret(p.li, p.o); });
  }
  body.addEventListener("copy", function (e) { copySel(e, false); });
  body.addEventListener("cut", function (e) { copySel(e, true); });
  body.addEventListener("paste", function (e) {
    e.preventDefault();
    var cd = e.clipboardData || window.clipboardData, own = cd && cd.getData ? cd.getData("application/x-yz-rt") : "", tx = cd && cd.getData ? cd.getData("text/plain") : "";
    if (own) cmdText(own, "markup");
    else if (tx) cmdText(tx, _yzRtHas_(tx) ? "markup" : "plain");   // 貼上的字：長得像標記的（從 LINE 裡改字複製來的）就還原格式；其他一律當一般字，外面的格式不會跟進來
    else toast("剪貼簿裡沒有文字");
  });
  body.addEventListener("dragstart", function (e) { e.preventDefault(); });
  body.addEventListener("drop", function (e) { e.preventDefault(); });
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
  inst.cmd = { inline: cmdInline, clear: cmdClear, kind: cmdKind, list: cmdList, line: cmdInsertLine, indent: cmdIndent, text: cmdText, undo: undo, redo: redo, raw: function () { setRaw(!rawMode); } };
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
    { id: "box-info", h: "💡", tip: "標註：提示（藍）。再按一次＝變回文字", a: ["kind", "box", "info"] },
    { id: "box-warn", h: "⚠️", tip: "標註：注意（黃）。再按一次＝變回文字", a: ["kind", "box", "warn"] },
    { id: "box-bad", h: "⛔", tip: "標註：警告（紅）。再按一次＝變回文字", a: ["kind", "box", "bad"] },
    { id: "box-ok", h: "✅", tip: "標註：完成（綠）。再按一次＝變回文字", a: ["kind", "box", "ok"] },
    { id: "hr", h: "— 分隔線", tip: "在這一行後面放一條分隔線", a: ["line", "hr"] },
    { id: "go", h: "↗ 連結到標題", tip: "在這一行後面放一個「連結到手冊裡另一個標題」（LINE 上是一個可以點的按鈕列）", a: ["line", "go"] },
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

/* ════════ edit.js ════════ */
/* ═══════════════ edit.js：編輯（開發者）：最上面一排工具列、左邊章節／關鍵字／目錄圖、中間表單、預覽（浮動視窗）═══════════════
 * 圖片：放進來就在瀏覽器縮好、馬上上傳（檔名換成亂碼、原檔名不留）；上傳完才算放好。
 * 儲存：整本存回去；在你編輯的時候別人（或 LINE 裡）改過，會先問你要不要蓋掉。 */
var ED = null;
var PV = { open: (typeof innerWidth === "undefined" || innerWidth > 900), x: null, y: null, w: 420, h: 680, max: false };   // 窄螢幕（手機、小視窗）一開始先關著，會把編輯區蓋住   // 預覽視窗的狀態（開／關、位置、大小、是否放到最大）
function edFirst(chs, tts) {   // 一開始選哪一個：第一個標題；沒有標題就第一章；連章都沒有就目錄圖
  chs = chs || ED.chapters; tts = tts || ED.titles;
  for (var i = 0; i < chs.length; i++) { var ts = tts[chs[i].id] || []; if (ts.length) return { kind: "title", id: ts[0].id }; }
  return chs.length ? { kind: "ch", id: chs[0].id } : { kind: "map", id: "" };
}
function edReset() {
  var cat = clone(HB.cat || {}); if (!Array.isArray(cat.spots)) cat.spots = []; if (!Array.isArray(cat.parts)) cat.parts = [];
  var titles = clone(HB.titles || {}), chs = clone(HB.chapters || []);
  chs.forEach(function (c) { if (!titles[c.id]) titles[c.id] = []; });
  var cur = edFirst(chs, titles);
  ED = { chapters: chs, titles: titles, kws: clone(HB.kws || []), cat: cat, rev: HB.rev, base: HB, catLocal: null, mapUi: null, lastCh: null, cfg: { chSize: (chs[0] && chs[0].size) || "kilo", chWeb: 200 }, cur: cur, mode: cur.kind === "map" ? "map" : "ch", view: "line", dirty: false, saving: false, ab: null, warners: [] };
}
function edHb() { return { chapters: ED.chapters, titles: ED.titles, kws: ED.kws, cat: ED.cat }; }
function edCh(id) { return ED.chapters.filter(function (c) { return c.id === id; })[0]; }
function edTitle(id) { for (var k in ED.titles) { var r = ED.titles[k].filter(function (t) { return t.id === id; })[0]; if (r) return r; } return null; }
function edKw(id) { return ED.kws.filter(function (k) { return k.id === id; })[0]; }
function edCounts() { var o = {}; ED.chapters.forEach(function (c) { o[c.id] = (ED.titles[c.id] || []).length; }); return o; }
function renumber() { ED.chapters.forEach(function (c, i) { c.no = String(i + 1); }); }
function markDirty() { ED.dirty = true; dirtyPaint(); }
function dirtyPaint() {
  var d = $("#edDirty"); if (!d || !ED) return;
  d.textContent = ED.saving ? "儲存中…" : UPL ? "⏳ 圖片上傳中（" + UPL + "）…" : ED.dirty ? "● 有還沒儲存的修改" : "";
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
function shrinkImage(blob, cb, max) {
  var fr = new FileReader();
  fr.onload = function () {
    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth || 1, hh = img.naturalHeight || 1, M = max || 1600, s = Math.min(1, M / Math.max(w, hh));
      var cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(w * s)); cv.height = Math.max(1, Math.round(hh * s));
      var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
      var uri = cv.toDataURL("image/jpeg", 0.85);
      cb(uri, { w: cv.width, h: cv.height, ow: w, oh: hh, bytes: Math.round((uri.length - 23) * 0.75), obytes: blob.size || 0 });
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

/* ───────── 最上面的工具列 ───────── */
// 還沒放好的圖（上傳失敗、還是 data: 網址）：存的時候後端會丟掉，先提醒
function edLocalImgs() { var n = 0; JSON.stringify(edHb(), function (k, v) { if (typeof v === "string" && v.indexOf("data:") === 0) n++; return v; }); return n; }
function saveEd(force) {
  if (!ED || ED.saving) return;
  if (UPL) { toast("還有圖片在上傳，等上傳好再存"); return; }
  var nl = edLocalImgs();
  if (nl && !force) { modal({ title: "有 " + nl + " 張圖沒有放好", lines: ["那幾張圖沒有上傳成功，存的時候會被拿掉。要先重新放一次嗎？"], buttons: [{ label: "先不存", cls: "sm" }, { label: "照樣儲存", cls: "sm pri", fn: function () { saveEd(true); } }] }); return; }
  ED.saving = true; dirtyPaint();
  var cur = ED.cur, mode = ED.mode, sent = JSON.stringify(edHb());
  call("hbSave", [sent, ED.rev, !!force]).then(function (r) {
    if (!ED) return;
    ED.saving = false; dirtyPaint();
    if (r && r.st === "lock") { logout("expired"); return; }
    if (r && r.conflict) {
      modal({ title: "存不進去：手冊剛剛被改過", lines: ["在你編輯的時候，手冊被改過了（可能是別的開發者，或在 LINE 裡改的）。", "「用我的蓋掉」：別人剛改的會不見。「放棄我的」：重新載入最新的內容，你這次的修改不見。"], buttons: [
        { label: "先不要", cls: "sm" }, { label: "放棄我的、重新載入", cls: "sm", fn: function () { refreshForEdit(); } }, { label: "用我的蓋掉", cls: "sm bad", fn: function () { saveEd(true); } }] });
      return;
    }
    if (!r || !r.ok || !r.data) { toast("❌ 沒有存進去：" + (r && r.err || "後端沒有回應")); return; }
    var still = JSON.stringify(edHb()) !== sent;   // 存的時候又改了：那些修改保留在編輯器裡
    HB = r.data;
    if (still) { ED.rev = HB.rev; ED.base = HB; markDirty(); toast("已儲存（存的時候你又改了一些，那些還沒存）"); }
    else { edReset(); edPick(cur, mode); renderEdit(); toast("✅ 已儲存：LINE 和網頁都會看到新的內容"); }
    if (TAB !== "edit") drawWeb();
  }, function (e) { if (!ED) return; ED.saving = false; dirtyPaint(); toast("❌ 沒有存進去：" + e.message); });
}
function edPick(cur, mode) {   // 存完、重新載入以後，盡量停在原本選的地方
  var gone = !cur || (cur.kind === "title" ? !edTitle(cur.id) : cur.kind === "ch" ? !edCh(cur.id) : cur.kind === "map" ? !!(cur.id && !edSpot(cur.id)) : !edKw(cur.id));
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
    var cur = ED.cur, mode = ED.mode; edReset(); edPick(cur, mode); renderEdit(); toast("已還原成上一次儲存的內容");
  } }] });
}
function renderToolbar() {
  var tb = $("#edtb"); tb.innerHTML = "";
  var isT = ED.cur.kind === "title";
  var sb = btn("儲存", function () { saveEd(false); }, "pri"); sb.id = "edSave";
  tb.appendChild(sb);
  tb.appendChild(btn("放棄修改", discardEd));
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

/* ───────── 左：章節／關鍵字清單 ───────── */
function renderTree() {
  var c1 = $("#edc1"); c1.innerHTML = "";
  var seg = h("div", { class: "seg", style: "display:flex;margin-bottom:8px" });
  [["ch", "章節"], ["kw", "🔑 關鍵字"], ["map", "🖼 目錄圖"]].forEach(function (p) {
    var b = h("button", { class: ED.mode === p[0] ? "on" : "", style: "flex:1;padding-left:4px;padding-right:4px;white-space:nowrap", "data-m": p[0] }, [p[1]]);
    b.onclick = function () {
      if (ED.mode === p[0]) return;
      if (ED.mode === "ch") ED.lastCh = ED.cur;   // 離開「章節」前，記住看到哪裡，回來時接著看
      ED.mode = p[0]; ED.ab = null;
      if (p[0] === "kw") ED.cur = ED.kws.length ? { kind: "kw", id: ED.kws[0].id } : ED.cur;
      else if (p[0] === "map") ED.cur = { kind: "map", id: "" };
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
  if (ED.mode === "kw") {
    c1.appendChild(lbl("", "關鍵字 " + ED.kws.length + " 個（打這些字，或它們的別名，就會跳出重點整理）"));
    ED.kws.forEach(function (k) {
      c1.appendChild(h("div", { class: "chT kwi" + (ED.cur.kind === "kw" && ED.cur.id === k.id ? " on" : ""), onclick: function () { selectNode("kw", k.id); } }, ["🔑 " + (k.name || "（還沒有名稱）"), h("span", { class: "muted", style: "margin-left:6px;font-size:12px" }, [_yzKwPts_(k).length + " 點"])]));
    });
    c1.appendChild(h("div", { style: "padding-top:8px" }, [btn("＋新增關鍵字", addKw)]));
    return;
  }
  c1.appendChild(lbl("", "章元（" + ED.chapters.length + " ／ 一排最多 12 張）"));
  ED.chapters.forEach(function (c) {
    var chosen = ED.cur.kind === "ch" ? ED.cur.id === c.id : (edTitle(ED.cur.id) || {}).ch === c.id;
    c1.appendChild(h("div", { class: "chI" + (ED.cur.kind === "ch" && ED.cur.id === c.id ? " on" : ""), onclick: function () { selectNode("ch", c.id); } }, [
      c.img ? h("img", { class: "th", src: c.img, alt: "" }) : h("div", { class: "th thi" }, [c.no]),
      h("div", {}, [h("div", { class: "t1" }, ["第 " + c.no + " 章"]), h("div", { class: "t2" }, [c.name || "（還沒有章名）"])])
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
function selectNode(kind, id) { ED.cur = { kind: kind, id: id }; ED.mode = kind === "kw" ? "kw" : kind === "map" ? "map" : "ch"; ED.ab = null; renderEdit(); }
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
function addKw() {
  var k = { id: "k" + Date.now(), name: "（新關鍵字）", alias: [], pts: [] };
  ED.kws.push(k); markDirty(); selectNode("kw", k.id);
}

/* ───────── 中：表單 ───────── */
function renderForm() {
  var f = $("#edc2"); f.innerHTML = ""; ED.warners = [];
  RTE.cur = null; rteClosePop(); rteBarSync();   // 舊的文字框都被換掉了：格式列先熄掉，點進新的文字框才又亮起來
  ED.mapUi = null;
  if (ED.cur.kind === "map") return renderMapForm(f);
  if (ED.cur.kind === "ch") return renderChForm(f, edCh(ED.cur.id));
  if (ED.cur.kind === "kw") { var k = edKw(ED.cur.id); if (k) renderKwForm(f, k); return; }
  var t = edTitle(ED.cur.id);
  if (!t) return;
  renderTitleForm(f, t, edCh(t.ch));
}
function renderChForm(f, c) {
  var ts = ED.titles[c.id] || [];
  f.appendChild(h("h3", { style: "font-size:16px" }, ["章元　第 " + c.no + " 章"]));
  f.appendChild(hint("章元可以放一張圖（可以不放）。圖：拖進來、選檔案，或複製後在下面框裡按 Ctrl+V 貼上。圖裡面不要有醫院名稱、人臉、病人資料。"));
  f.appendChild(lbl("三", "章元圖"));
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
  f.appendChild(h("div", { class: "muted", style: "font-size:12.5px" }, ["第 " + ch.no + " 章　" + ch.name + " ›"]));
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

  f.appendChild(lbl("六", "備註（會用淡黃色框，放在內容最下面）"));
  var nt = h("textarea", { class: "ta", style: "min-height:60px" }); nt.value = t.note || ""; nt.oninput = function () { t.note = nt.value; changed(); }; f.appendChild(nt);
  var pgOut = h("span", { class: "muted", id: "pgOut" });
  function pgNote() { var x = _yzPageText_(t.page); pgOut.textContent = x ? "→ 備註框裡會多一個青綠色小框：📖 藥戰手冊頁數　" + x + "（LINE 上，備註文字和小框中間空一行）" : "（不填，就不會顯示這個小框）"; }
  var pgIn = h("input", { class: "in", id: "pgIn", value: t.page || "", placeholder: "例：14　或　14–15　或　12、15", style: "max-width:230px" });
  pgIn.oninput = function () { t.page = pgIn.value; pgNote(); changed(); };
  pgNote();
  f.appendChild(h("div", { class: "pgbox" }, [
    h("div", { class: "lbl", style: "margin-top:6px" }, ["📖 藥戰手冊頁數", h("span", { class: "tag warn", style: "margin-left:6px" }, ["備註裡新增的欄位"]), mkEl(15)]),
    h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, [pgIn, pgOut]),
    hint("這一段對應紙本「藥戰手冊」的第幾頁。LINE 卡片、網頁的備註框、搜尋結果、關鍵字的來源連結都會帶出來；也可以在 LINE 打「第14頁」反過來找。")
  ]));

  f.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:14px" }, [
    btn("▲ 往前移", function () { moveTitle(t, -1); }), btn("▼ 往後移", function () { moveTitle(t, 1); }),
    confirmBtn("刪除這個標題", function () { var a = ED.titles[ch.id], i = a.indexOf(t); a.splice(i, 1); markDirty(); a.length ? selectNode("title", a[Math.min(i, a.length - 1)].id) : selectNode("ch", ch.id); })
  ]));
}
function moveTitle(t, d) { var a = ED.titles[t.ch], i = a.indexOf(t), j = i + d; if (j < 0 || j >= a.length) return; a[i] = a[j]; a[j] = t; markDirty(); renderEdit(); }

/* ───────── 內容塊（文字／階梯式／表格／圖片） ───────── */
var KIND_NAME = { text: "文字", ladder: "階梯式內容", table: "表格", img: "圖片", anim: "動畫" };
function blockEditor(t, b, i) {
  var del = function () { t.blocks.splice(i, 1); ED.ab = null; renderForm(); changed(); };
  var delBtn = (b.t === "ladder" || b.t === "table" || b.t === "anim") ? confirmBtn("✕", del, "sm bad") : btn("✕", del, "sm bad");
  var head = h("div", { class: "bh" }, [KIND_NAME[b.t] + "　#" + (i + 1), b.t === "ladder" || b.t === "anim" ? h("span", { class: "newb" }, ["新"]) : null, h("span", { class: "sp" }),
    btn("▲", function () { moveBlock(t, i, -1); }), btn("▼", function () { moveBlock(t, i, 1); }), delBtn]);
  var body = h("div", { class: "bb2" });
  var rte = null;
  if (b.t === "text") {
    rte = rteCreate({ value: b.v || "", titles: edTitleChoices, onChange: function (v) { b.v = v; changed(); } });
    body.appendChild(rte.el);
    body.appendChild(hint("選取文字 → 按最上面第二排的按鍵（粗體、顏色、大小）。整行的變化（標題、項目符號、編號、標註、分隔線…）：游標放在那一行，按對應的鍵，再按一次就取消。Enter 換行，清單會自動接下一個符號；Ctrl+Z 復原。要做像法條那樣一層一層的編號，請用「＋階梯式內容」。"));
  } else if (b.t === "ladder") body.appendChild(ladderEditor(t, b));
  else if (b.t === "table") body.appendChild(tableEditor(b, t));
  else if (b.t === "anim") body.appendChild(animEditor(t, b));
  else {
    var dz = dropZone({
      kind: "圖片",
      get: function () { return b.url; }, info: function () { return b.info; }, fname: function () { return b.fname; },
      set: function (r, info) { b.url = r.url; b.fid = r.fid; b.fname = r.fname; b.info = info; b.ar = _yzAR_(info.w, info.h); changed(); },
      clear: function () { b.url = ""; b.fid = ""; b.info = null; changed(); }
    });
    body.appendChild(dz.el);
    var cap = h("input", { class: "in", value: b.cap || "", placeholder: "圖說（可以不填）", style: "margin-top:6px" });
    cap.oninput = function () { b.cap = cap.value; changed(); };
    body.appendChild(cap);
  }
  var blk = h("div", { class: "blk" + (ED.ab === i ? " act" : ""), "data-i": String(i) }, [head, body]);
  if (rte) blk._rte = rte;
  return blk;
}
function edTitleChoices() {   // 「連結到標題」可以選的標題（全部章元的全部標題）
  var out = [];
  ED.chapters.forEach(function (c) { (ED.titles[c.id] || []).forEach(function (t) { out.push({ id: t.id, label: "第 " + c.no + " 章 › " + (t.name || "（還沒有標題）") }); }); });
  return out;
}
function moveBlock(t, i, d) { var j = i + d; if (j < 0 || j >= t.blocks.length) return; var x = t.blocks[i]; t.blocks[i] = t.blocks[j]; t.blocks[j] = x; ED.ab = j; renderForm(); changed(); }
function addBlock(kind) {
  if (ED.cur.kind !== "title") return;
  var t = edTitle(ED.cur.id); if (!t) return;
  var nb = kind === "text" ? { t: "text", v: "" } : kind === "ladder" ? { t: "ladder", style: "law", items: [{ lv: 1, v: "" }] } : kind === "table" ? { t: "table", head: true, rows: [["", ""], ["", ""]] } : kind === "anim" ? { t: "anim", kind: "file", url: "", poster: "", fmt: "", bytes: 0, w: 0, h: 0, frames: 0, dur: 0, ar: "4:3", cap: "", steps: [], sec: 2, loop: true } : { t: "img", url: "", cap: "", ar: "4:3" };
  var at = (ED.ab === null || ED.ab === undefined) ? t.blocks.length : Math.min(t.blocks.length, ED.ab + 1);
  // 游標在某一個文字塊裡：表格／圖片／動畫／階梯式放在游標那一行的後面，文字從那裡切成上下兩塊（不用先自己拆）
  var cur = RTE.cur, cb = cur && cur.el && cur.el.closest ? cur.el.closest(".blk") : null, bi = cb ? +cb.getAttribute("data-i") : -1, tb = bi >= 0 ? t.blocks[bi] : null;
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
function edMarks(b) {   // 編輯器每一行前面的編號；空白的行不會顯示出去，所以也不佔編號（跟 LINE、網頁一樣）。圖片行沒有編號（回傳 ""）
  var idx = [], vis = [];
  b.items.forEach(function (it, i) { if (_yzLadderShown_(it)) { idx.push(i); vis.push(it); } });
  var marks = _yzLadderMarks_(_yzLadderFix_(vis), b.style), out = b.items.map(function () { return ""; });
  idx.forEach(function (i, k) { out[i] = marks[k]; });
  return out;
}
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
  function refreshMarks() { var m = edMarks(b); $$(".lmk", rowsBox).forEach(function (el, i) { if (b.items[i] && isImg(b.items[i])) return; el.textContent = m[i] || "—"; el.classList.toggle("empty", !m[i]); }); stat(); }
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
          set: function (r, info) { im.url = r.url; im.fid = r.fid; im.fname = r.fname; im.info = info; im.ar = _yzAR_(info.w, info.h); changed(); stat(); },
          clear: function () { im.url = ""; im.fid = ""; im.info = null; changed(); stat(); },
          empty: "把圖拖進來　／　點這裡之後按 Ctrl+V 貼上"
        });
        var cap = h("input", { class: "in", value: im.cap || "", placeholder: "圖說（可以不填）" });
        cap.oninput = function () { im.cap = cap.value; changed(); };
        row = h("div", { class: "lrow limg lv" + it.lv }, [ind, h("span", { class: "lmk", title: "圖片：不佔編號" }, ["🖼"]), h("div", { class: "limgb" }, [dz.el, cap]), btns]);
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
        row = h("div", { class: "lrow lv" + it.lv }, [ind, h("span", { class: "lmk" + (marks[i] ? "" : " empty") }, [marks[i] || "—"]), ta, btns]);
        setTimeout(fit, 0);
      }
      rowsBox.appendChild(row);
    });
    stat();
  }
  // 樣式
  var sel = h("select", { class: "in", style: "width:auto;max-width:100%" }, Object.keys(YZ_LADDER_STYLES).map(function (k) { return h("option", { value: k }, [YZ_LADDER_STYLES[k].name + "　" + YZ_LADDER_STYLES[k].ex]); }));
  sel.value = b.style; sel.onchange = function () { b.style = sel.value; draw(); changed(); };
  wrap.appendChild(h("div", { class: "ladtop" }, [h("span", { class: "muted" }, ["編號樣式"]), sel, mkEl(11)]));
  // 貼上整段條文（文字裡單獨一行的 ［圖］ 會變成一個空的圖片列，貼進來以後再放圖）
  var pta = h("textarea", { class: "ta", style: "min-height:96px", placeholder: "把條文從 Word 或 PDF 複製貼在這裡（行首有「第一條」「一、」「（一）」「1.」「(1)」都看得懂，編號會重新自動排）" });
  var pinfo = h("div", { class: "hint" }, ["貼上後，這裡會告訴你看懂了幾行。"]), parsed = null;
  pta.oninput = function () {
    parsed = _yzLadderParse_(pta.value, "");
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
        set: function (r, info) { s.url = r.url; s.fid = r.fid; s.fname = r.fname; s.info = info; s.ar = _yzAR_(info.w, info.h); changed(); },
        clear: function () { s.url = ""; s.fid = ""; s.info = null; changed(); }
      });
      var ta = h("textarea", { class: "ta", rows: "2", placeholder: "這一步的說明（可以不填）" }); ta.value = s.cap || "";
      ta.oninput = function () { s.cap = ta.value; changed(); };
      var mv = function (d) { var j = i + d; if (j < 0 || j >= b.steps.length) return; var x = b.steps[i]; b.steps[i] = b.steps[j]; b.steps[j] = x; drawSteps(); changed(); };
      list.appendChild(h("div", { class: "steprow" }, [
        h("div", { class: "stepno" }, ["步驟 " + (i + 1)]),
        h("div", { class: "stepmain" }, [dz.el, ta]),
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

/* ───────── 關鍵字（重點整理＋來源連結） ───────── */
function titleOptions(sel, cur) {
  sel.appendChild(h("option", { value: "" }, ["（不指定來源）"]));
  ED.chapters.forEach(function (c) {
    (ED.titles[c.id] || []).forEach(function (t) {
      var pg = _yzPageShort_(t.page);
      var o = h("option", { value: t.id }, ["第 " + c.no + " 章｜" + t.name + (pg ? "　" + pg : "")]);
      sel.appendChild(o);
    });
  });
  sel.value = cur || "";
}
function renderKwForm(f, k) {
  f.appendChild(h("h3", { style: "font-size:16px" }, ["🔑 關鍵字重點整理", mkEl(13), mkEl(14)]));
  f.appendChild(hint("在 LINE 或網頁打這個字（或它的別名），會先跳出這一張「重點整理」。每個重點下面有「來源連結」，點了跳到手冊原文，並顯示藥戰手冊頁數。重點由你自己整理，不用 AI，也不會送到外面。"));
  f.appendChild(lbl("", "關鍵字（名稱）"));
  var nm = h("input", { class: "in", id: "kwName", value: k.name, placeholder: "例：請領單" });
  nm.oninput = function () { k.name = nm.value; markDirty(); renderTree(); refreshPreview(); paintSug(); };
  f.appendChild(nm);
  f.appendChild(lbl("", "別名（打這些字也找得到；用逗號或頓號分開）"));
  var al = h("input", { class: "in", id: "kwAlias", value: (k.alias || []).join("、"), placeholder: "例：請領、領藥單" });
  al.oninput = function () { k.alias = al.value.split(/[,，、]/).map(function (x) { return x.trim(); }).filter(Boolean); changed(); paintSug(); };
  f.appendChild(al);
  f.appendChild(lbl("", "重點整理（一個重點一條，每條可以指定「來源」）"));
  var ptsBox = h("div", { id: "kwPts" }); f.appendChild(ptsBox);
  f.appendChild(h("div", { class: "addrow" }, [btn("＋新增重點", function () { k.pts.push({ v: "", t: "", url: "" }); drawPts(); changed(); var tas = $$("#kwPts textarea"); if (tas.length) tas[tas.length - 1].focus(); })]));
  f.appendChild(lbl("", "系統找到的句子（手冊裡有這個字的地方；按「＋採用」就變成一個重點，可以再改字）"));
  var sugBox = h("div", { id: "kwSug" }); f.appendChild(sugBox);
  f.appendChild(lbl("", "來源一覽（LINE、網頁的「來源連結」就是這些）"));
  var srcBox = h("div", { id: "kwSrc" }); f.appendChild(srcBox);
  f.appendChild(h("div", { style: "margin-top:14px" }, [confirmBtn("刪除這個關鍵字", function () {
    var i = ED.kws.indexOf(k); ED.kws.splice(i, 1); markDirty();
    if (ED.kws.length) selectNode("kw", ED.kws[Math.min(i, ED.kws.length - 1)].id); else { ED.cur = edFirst(); ED.mode = ED.cur.kind === "map" ? "map" : "ch"; renderEdit(); }
  })]));

  function drawPts() {
    ptsBox.innerHTML = "";
    if (!k.pts.length) ptsBox.appendChild(h("div", { class: "muted", style: "padding:8px;border:1px dashed #C7CED7;border-radius:10px;text-align:center" }, ["還沒有重點。按「＋新增重點」自己寫，或從下面「系統找到的句子」按＋採用。"]));
    k.pts.forEach(function (p, i) {
      var ta = h("textarea", { class: "ta", style: "min-height:48px", placeholder: "這個關鍵字的一個重點" }); ta.value = p.v || "";
      ta.oninput = function () { p.v = ta.value; changed(); paintSug(); };
      var sel = h("select", { class: "in", style: "flex:1;min-width:0" }); titleOptions(sel, p.t);
      var pg = h("span", { class: "pgs" });
      var upd = function () { var f2 = p.t ? _yzFindTitle_(edHb(), p.t) : null; pg.textContent = f2 ? (_yzPageText_(f2.t.page) ? "📖 藥戰手冊 " + _yzPageText_(f2.t.page) + "（自動帶入）" : "（這個標題還沒填藥戰手冊頁數）") : ""; };
      sel.onchange = function () { p.t = sel.value; upd(); changed(); paintSrc(); };
      upd();
      var url = h("input", { class: "in", value: p.url || "", placeholder: "https://…（選填：原始出處的網址）" });
      url.oninput = function () { p.url = url.value.trim(); changed(); };
      var mv = function (d) { var j = i + d; if (j < 0 || j >= k.pts.length) return; var x = k.pts[i]; k.pts[i] = k.pts[j]; k.pts[j] = x; drawPts(); changed(); };
      ptsBox.appendChild(h("div", { class: "kpt" }, [
        h("span", { class: "kwn" }, [_yzCirc_(i + 1)]),
        h("div", { style: "flex:1;min-width:0" }, [ta, h("div", { class: "kpr" }, [h("span", { class: "muted" }, ["來源"]), sel]), h("div", { class: "kpr" }, [h("span", { class: "muted" }, ["　"]), pg]), h("div", { class: "kpr" }, [h("span", { class: "muted" }, ["外部網址"]), url])]),
        h("div", { class: "kbt" }, [btn("▲", function () { mv(-1); }), btn("▼", function () { mv(1); }), btn("✕", function () { k.pts.splice(i, 1); drawPts(); changed(); paintSug(); paintSrc(); }, "sm bad")])
      ]));
    });
    paintSrc();
  }
  function paintSug() {
    sugBox.innerHTML = "";
    var toks = [k.name].concat(k.alias || []).map(function (x) { return _yzNorm_(x).replace(/\s+/g, ""); }).filter(Boolean);
    if (!toks.length) { sugBox.appendChild(h("div", { class: "muted" }, ["先填上面的關鍵字，我才找得到句子。"])); return; }
    var sg = _yzKwSuggest_(edHb(), k, 8);
    if (!sg.length) { sugBox.appendChild(h("div", { class: "muted" }, ["手冊裡沒有別的句子提到它了（或都已經採用）。"])); return; }
    sg.forEach(function (s) {
      sugBox.appendChild(h("div", { class: "sug" }, [
        h("div", { style: "flex:1;min-width:0" }, [h("div", {}, hlNodes(s.v, toks)), h("div", { class: "muted", style: "font-size:12px" }, ["📖 " + _yzSrcLabel_({ ch: s.ch, t: s.ti })])]),
        btn("＋採用", function () { k.pts.push({ v: s.v, t: s.t, url: "" }); drawPts(); paintSug(); changed(); }, "sm pri")
      ]));
    });
  }
  function paintSrc() {
    srcBox.innerHTML = "";
    var ss = _yzKwSources_(edHb(), k), none = _yzKwPts_(k).filter(function (p) { return !p.t; }).length;
    if (!ss.length) srcBox.appendChild(h("div", { class: "muted" }, ["還沒有來源。每個重點選一個「來源」，就會有來源連結。"]));
    ss.forEach(function (x) { srcBox.appendChild(h("div", { class: "srcl" }, ["📖 " + _yzSrcLabel_(x)])); });
    if (none) srcBox.appendChild(hint("⚠ 有 " + none + " 個重點沒有指定來源：它們下面不會有來源連結。"));
  }
  drawPts(); paintSug();
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
  if (ED.cur.kind === "kw" || (!isCh && !t)) return;
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
  if (ED.cur.kind === "kw") {
    var k = edKw(ED.cur.id); if (!k) return;
    if (ED.view === "line") {
      var bs = _yzKwBubbles_(edHb(), k);
      body.appendChild(stackOf(bs));
      bs.forEach(function (b, i) { meter.appendChild(meterRow("第 " + (i + 1) + " 張", _yzBytes_(b), YZ_BUBBLE_SAFE)); });
      meter.appendChild(hint("一張卡片放 " + YZ_KW_PER + " 個重點，超過就多一張（左右滑）。LINE 上點來源連結會跳到手冊原文。"));
    } else {
      var kbox = h("div", { class: "pvweb", style: "width:620px;max-width:none" }, [webKwPanel(edHb(), k, {})]);
      var kz = Math.min(1, (pvw - 28) / 640); if (kz < 1) kbox.style.zoom = kz.toFixed(3);
      body.appendChild(h("div", { class: "pvwebwrap" }, [kbox]));
    }
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
      var lc = lineChapter(c, n);
      body.appendChild(h("div", { class: "pvwrap" }, [FlexView.render(lc.bubble, {})]));
      meter.appendChild(meterRow("這一張", lc.bytes, YZ_BUBBLE_SAFE));
      var fakeAll = ED.chapters.map(function (x) { return Object.assign({}, x, { img: x.img ? fakeUrl(0) : "" }); });
      meter.appendChild(meterRow(ED.chapters.length + " 張一排", _yzBytes_(_yzChapterList_(fakeAll, edCounts())), YZ_MSG_SAFE));
      meter.appendChild(hint("LINE：一排最多 12 張、一則訊息不能超過 50 KB。"));
    } else body.appendChild(h("div", { class: "pvwebwrap" }, [webChapterCard(c, n, { width: ED.cfg.chWeb })]));
    return;
  }
  var t = edTitle(ED.cur.id); if (!t) return;
  var ch = edCh(t.ch), ts = ED.titles[ch.id], i = ts.indexOf(t);
  if (ED.view === "line") {
    var r = lineCards(ch, t, { hb: edHb(), size: t.size, dev: true, editUrl: YZ_CFG.webUrl + "?edit=1", prev: i > 0 ? "x" : null, next: i < ts.length - 1 ? "x" : null });
    body.appendChild(stackOf(r.bubbles));
    r.bytes.forEach(function (by, kk) {
      var car = r.kinds && r.kinds[kk] === "carousel";
      meter.appendChild(meterRow(car ? "第 " + (kk + 1) + " 則（分步動畫，一排）" : "第 " + (kk + 1) + " 張", by, car ? YZ_MSG_SAFE : YZ_BUBBLE_SAFE));
    });
    var tot2 = 0; r.bytes.forEach(function (x) { tot2 += x; });
    meter.appendChild(hint("這個標題 ＝ " + r.parts + " 則訊息（共 " + kb(tot2) + "）。一張卡片的上限 LINE 是約 30 KB，我抓 27 KB 留空，超過就自動拆成下一張。" + (r.parts > YZ_REPLY_MAX ? " ⚠ LINE 一次回覆最多 5 則，第 6 張以後會被截掉，請把內容分到別的標題。" : "")));
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
    var art = webArticle(ch, t, { width: wd, onImg: lightbox, kws: ED.kws, hb: edHb(), onTitle: function () { toast("（預覽：這裡會跳到那個標題）"); } });
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
  var box = h("div", { class: "pvweb", style: "width:" + (w + 26) + "px;max-width:none;max-height:none;margin:0 auto" }, [webArticle(ch, t, { width: w, onImg: lightbox, kws: ED.kws, hb: edHb(), onTitle: function () { toast("（預覽：這裡會跳到那個標題）"); } })]);
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
function edKeep() { return { chapters: ED.chapters, titles: ED.titles, kws: ED.kws, cat: ED.cat, rev: ED.rev, cur: ED.cur, mode: ED.mode, cfg: ED.cfg }; }
function edRestore(k) { edReset(); ED.chapters = k.chapters; ED.titles = k.titles; ED.kws = k.kws; ED.cat = k.cat; ED.rev = k.rev; ED.cfg = k.cfg; ED.dirty = true; edPick(k.cur, k.mode); }
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
  pane.innerHTML = '<p class="sub">最上面一排是工具列（儲存、新增內容，捲到哪裡都在）；左邊選章元／標題／關鍵字（或「🖼 目錄圖」）；中間填內容；預覽是浮動視窗。<b>改完要按「儲存」</b>，LINE 和網頁才會看到。</p>' +
    '<div class="edwrap"><div class="edtbw" id="edtbw"><div class="edtb" id="edtb"></div><div class="edfmt" id="edfmt"></div></div><div class="edgrid"><div class="c1" id="edc1"></div><div class="c2" id="edc2"></div></div></div>';
  RTE.cur = null; RTE.pop = null; RTE.bar = null;
  $("#edfmt").appendChild(rteBuildBar());
  buildPvWin();
  renderEdit();
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
          syncOn(); markDirty(); drawCanvas(); changed(); renderTree();
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
    chkBox("網頁：滑過的動態效果", function () { return cat.fx !== false; }, function (v) { cat.fx = v; }, "標籤變色、畫面靠過去、底下的說明卡、飄浮光點、圓點光圈。只有網頁有，LINE 沒有「滑過」"),
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
    markIssues();
  }
  function markIssues() {
    var chk = _yzMapCheck_(cat, edHb());
    $$(".mbx", cv).forEach(function (bx) { var lv = mapIssueLv(chk, bx.getAttribute("data-id")); bx.classList.toggle("bad", lv === "bad"); bx.classList.toggle("warn", lv === "warn"); });
    mapTreeBadges();
  }
  function paintSel() { $$(".mbx", cv).forEach(function (bx) { bx.classList.toggle("sel", bx.getAttribute("data-id") === ED.cur.id); }); }

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
      if (s.x !== st.x || s.y !== st.y || s.w !== st.w || s.h !== st.h) { changed(); markIssues(); renderTree(); }
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
    paintBox(bx, s); syncNums(); changed(); markIssues(); renderTree();
  });
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
      var g = h("optgroup", { label: "第 " + c.no + " 章　" + (c.name || "") });
      g.appendChild(h("option", { value: "c:" + c.id }, ["整章：第 " + c.no + " 章　" + (c.name || "")]));
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
          syncNums(); changed(); markIssues();
        };
        inp.onchange = function () { inp.value = String(s[p[0]]); mapTreeBadges(); };
        wrap.appendChild(h("label", { class: "mnum" }, [h("span", {}, [p[1]]), inp]));
      });
      return wrap;
    })(), (function () { ui.nums.px = h("div", { class: "muted", style: "font-size:12px;margin-top:3px" }); return ui.nums.px; })()])]));
    pn.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:10px" }, [
      btn("複製這個地點", function () {
        var c = clone(s); c.id = "p" + Date.now() + cat.spots.length; c.x = Math.min(100 - c.w, c.x + 3); c.y = Math.min(100 - c.h, c.y + 3); c.label = (s.label || "") + "2";
        cat.spots.push(c); markDirty(); ED.cur = { kind: "map", id: c.id }; renderEdit();
      }),
      confirmBtn("刪除這個地點", function () { var k = cat.spots.indexOf(s); cat.spots.splice(k, 1); markDirty(); ED.cur = { kind: "map", id: "" }; renderEdit(); })
    ]));
    syncNums();
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
  ui.onPick = function () { paintSel(); drawPanel(); };
  ED.warners.push(drawChecks);
  drawCanvas(); drawPanel(); drawChecks();
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
  var fc = Object.assign({}, ch, { img: ch.img ? fakeUrl(0) : "" });
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
  box.appendChild(h("div", { class: "hint" }, ["只記「誰、何時、從 LINE 或網頁、看了哪一章／哪個標題／哪個關鍵字」。不記內容，也不記搜尋的字。超過 6000 筆會自動刪掉最舊的。"]));
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
