/* 補藥神器開發者教學 v11.22.2 beta：開發者專用；不登入、不連任何網站；畫面上的藥、CODE、代號全是編出來的示範。這個檔沒有任何秘密。 */
(function() {
  "use strict";
  /* ═══ 補藥神器開發者教學網頁（第 16 批；從藥師版教學改出來，只放開發者用的功能）═══
     不登入、不連任何網站：沒有 fetch、沒有外部網址，畫面上的藥全是編的示範。藥品卡片、列表卡、平面圖都是用元素＋CSS 畫出來的（五張小圖放在最上面 :root 的 --i-* 變數）。
     只有兩樣東西會「記」在這支手機裡：學習進度、從 LINE「教學」帶進來的「回聊天室」資訊（見最下面 boot）。
     排法照氛圍學院：目錄頁（#/）＝章節分組、一課一列；一課的頁（#/l/課名）＝白底區塊一塊接一塊往下捲，最後有「重點回顧」「隨堂檢測」，最下面固定「上一課／下一課」。 */
  var root = document.getElementById("main"), topEl = document.getElementById("top"), botEl = document.getElementById("bot");
  var NS = "buyao_learndev_", mem = {};
  var store = {
    get: function(k) { try { var v = localStorage.getItem(NS + k); if (v !== null) return v; } catch (e) {} return mem[k] === undefined ? null : mem[k]; },
    set: function(k, v) { mem[k] = v; try { localStorage.setItem(NS + k, v); } catch (e) {} },
    del: function(k) { delete mem[k]; try { localStorage.removeItem(NS + k); } catch (e) {} }
  };
  var REDUCE = false, escFn = null;   /* escFn：目前這一頁「按 Esc 要關掉的東西」（一課的頁＝展開的課名目錄） */
  try { REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}

  /* ───────── 小工具 ───────── */
  /* html 這個欄位不用；所有字都走 text／文字節點。**粗體** 用 rich() 拆開再一段一段接，不會把任何東西當成網頁碼 */
  function el(tag, attrs, kids) {
    var e = document.createElement(tag), k, v;
    attrs = attrs || {};
    for (k in attrs) {
      v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    if (kids !== null && kids !== undefined && !Array.isArray(kids)) kids = [kids];
    (kids || []).forEach(function(c) {
      if (c === null || c === undefined || c === false) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }
  function on(e, ev, fn) { e.addEventListener(ev, fn); return e; }
  function rich(s) {
    var f = document.createDocumentFragment(), parts = String(s === null || s === undefined ? "" : s).split("**"), i;
    for (i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      f.appendChild(i % 2 ? el("b", { text: parts[i] }) : document.createTextNode(parts[i]));
    }
    return f;
  }

  /* ───────── 從 LINE 帶進來的資訊（網址 # 後面；讀完就從網址列拿掉）─────────
     b＝官方帳號的 ID（@xxxx，給「在 LINE 試試看」開聊天室用）；c／n／l／f＝LINE 那邊挑的一支真藥的 CODE／中文名／位置／家族字。
     都只用來組「回 LINE 聊天室」的連結和顯示一句話；不合格式的一律當沒有。 */
  var S = { b: "", c: "", n: "", l: "", f: "" };
  function clean(k, v) {
    v = String(v === null || v === undefined ? "" : v);
    if (k === "b") return /^@[A-Za-z0-9._-]{2,40}$/.test(v) ? v : "";
    if (k === "c") return /^[A-Za-z0-9._-]{1,16}$/.test(v) ? v : "";
    return v.length >= 1 && v.length <= 16 && !/[\u0000-\u001F<>"'\\]/.test(v) ? v : "";
  }
  function loadS() {
    var j = {};
    try { j = JSON.parse(store.get("s") || "{}") || {}; } catch (e) { j = {}; }
    Object.keys(S).forEach(function(k) { S[k] = clean(k, j[k]); });
  }
  function saveS() { store.set("s", JSON.stringify(S)); }
  function parseParams(h) {
    var o = {};
    String(h || "").replace(/^#/, "").split("&").forEach(function(kv) {
      var i = kv.indexOf("=");
      if (i < 1) return;
      try { o[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " ")); } catch (e) {}
    });
    return o;
  }
  function lineUrl(text) {
    if (!S.b) return "";
    return text ? "https://line.me/R/oaMessage/" + S.b + "/?" + encodeURIComponent(text) : "https://line.me/R/ti/p/" + S.b;
  }

  /* ───────── 學習進度（哪幾課學過了）───────── */
  function getDone() {
    var o = {};
    try { o = JSON.parse(store.get("done") || "{}") || {}; } catch (e) { o = {}; }
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  }
  function markDone(id) {
    var o = getDone();
    if (o[id]) return false;
    o[id] = 1;
    store.set("done", JSON.stringify(o));
    return true;
  }

  /* ───────── 課程內容 ─────────
     每一課：id、ch（第幾章）、name、secs（一塊一塊的白底區塊：t 標題、p 說明、d 示範區、note 淺藍說明框、warn 黃色提醒、tips 三個小提醒；tipsFirst＝改成放在示範區前面的「步驟 1、2、3」）、
     tryp（動手試試）、recap（重點回顧）、quiz（隨堂檢測：q 題目、h 提示、o 四個選項、a 正確的是第幾個、why 為什麼）。
     示範區 d：chat＝LINE 聊天的假畫面（ch＝可以點選的幾種情況；每種有 m 聊天內容、n 下面的說明；一種就只有重播鍵）、anat＝在真的卡片上點名稱看每一塊、
     plan＝平面圖上點名稱看每一塊、turn＝「大門在你哪一邊，圖要怎麼轉」、qbar＝LINE 輸入列。
     聊天內容 m：me 自己說的、bot 官方帳號回的、dc 一張藥品卡片、car 一排卡片（往左滑）、ll 列表卡、ask「是這個藥品？」卡、pl 大張平面圖、
     act 一句動作說明、pic 照片、voice 語音、hand 手寫。卡片都是照真的卡片畫的示意，藥名、位置全是編的。 */
  function me(t) { return { w: "me", t: t }; }
  function bot(t) { return { w: "bot", t: t }; }
  function act(t) { return { w: "act", t: t }; }
  function pic(label, kind) { return { w: "me", pic: label, k: kind || "t" }; }   /* 您傳的照片：kind t 藥盒、w 瓶身、three 好幾盒、blur 模糊的 */
  function voice() { return { w: "me", voice: "0:03" }; }
  function hand(lines) { return { w: "me", note: lines }; }
  function dc(code, o) { return { w: "dc", c: code, o: o || {} }; }
  function car(codes, o) { return { w: "car", cs: codes.map(function(c) { return { c: c, o: o || {} }; }) }; }
  function ll(spec) { return { w: "ll", s: spec }; }
  function ask(codes, shown, how) { return { w: "ask", cs: codes, shown: shown, how: how || "" }; }
  function sheet(codes) { return { w: "tb", cs: codes }; }   /* 超過 5 個品項的「總表」卡（照片、手寫讀到太多行的時候） */
  function nf(kw) { return { w: "nf", kw: kw }; }   /* 「查無」卡：最上面黃色框 */
  function bigplan(hit) { return { w: "pl", hit: hit || "K2" }; }
  /* 編出來的藥（b 商品名、z 中文名、g 學名、f 劑型、w 水劑、ind 適應症、feat 藥品特徵、loc 位置、ph 有沒有照片） */
  var DR = {
    "90101": { b: "TESTOLOL* 25MG TAB", z: "測試洛爾錠 25 毫克", g: "TESTOLOL HCL", f: "錠劑", w: 0, ind: "高血壓、心絞痛", feat: "白色圓形錠，一面有刻痕", loc: "K2", ph: 1 },
    "90102": { b: "DEMOSYRUP* 60ML", z: "示範康糖漿 60 毫升", g: "SAMPLEXIN", f: "口服液", w: 1, ind: "咳嗽、化痰", feat: "透明棕色瓶", loc: "水棧一", ph: 1 },
    "90103": { b: "MODELPRIL* 5MG TAB", z: "模擬普利錠 5 毫克", g: "MODELPRIL MALEATE", f: "錠劑", w: 0, ind: "高血壓", loc: "B1", ph: 0 },
    "90104": { b: "SAMPLESPOT* 20MG TAB", z: "示範多處錠 20 毫克", g: "SAMPLESPOT", f: "錠劑", w: 0, ind: "過敏", loc: "K2", ph: 0 },
    "90105": { b: "TESTONIN* 100MG CAP", z: "測試寧膠囊 100 毫克", g: "TESTONIN", f: "膠囊", w: 0, ind: "退燒、止痛", loc: "C3", ph: 1 },
    "90106": { b: "TESTAMOL* 500MG TAB", z: "測試醇錠 500 毫克", g: "TESTAMOL", f: "錠劑", w: 0, ind: "發炎、關節痛", loc: "D1", ph: 0 },
    "90107": { b: "DEMOCARD* 10MG TAB", z: "示範卡錠 10 毫克", g: "DEMOCARD", f: "錠劑", w: 0, ind: "心律不整", loc: "K2", ph: 0 },
    "90108": { b: "EXAMPLIDE* 20MG TAB", z: "範例利錠 20 毫克", g: "EXAMPLIDE", f: "錠劑", w: 0, ind: "水腫", loc: "K2", ph: 1 },
    "90109": { b: "COUGHLESS* 100ML", z: "示範咳停糖漿 100 毫升", g: "COUGHLESS", f: "口服液", w: 1, ind: "咳嗽、喉嚨痛", loc: "水棧二", ph: 0 },
    "90110": { b: "BREATHEZ* 10MG TAB", z: "範例舒錠 10 毫克", g: "BREATHEZ", f: "錠劑", w: 0, ind: "過敏性鼻炎、咳嗽", loc: "D4", ph: 1 },
    "90111": { b: "SAMPLEXIN* 250MG CAP", z: "示範寧膠囊 250 毫克", g: "SAMPLEXIN", f: "膠囊", w: 0, ind: "細菌感染", loc: "K2", ph: 0 },
    "90112": { b: "SAMPLEXIN* 500MG TAB", z: "示範寧錠 500 毫克", g: "SAMPLEXIN", f: "錠劑", w: 0, ind: "細菌感染", loc: "K3", ph: 1 },
    "90114": { b: "TESTBETA* 50MG TAB", z: "測試貝他錠 50 毫克", g: "TESTOLOL HCL", f: "錠劑", w: 0, ind: "高血壓、心絞痛", loc: "K3", ph: 1 },
    "90115": { b: "TESTLOL-X* 25MG TAB", z: "測試洛得 X 錠 25 毫克", g: "TESTOLOL HCL", f: "錠劑", w: 0, ind: "高血壓", loc: "A3", ph: 0 },
    "90116": { b: "SAMPLECOR* 10MG TAB", z: "示範可錠 10 毫克", g: "SAMPLECOR", f: "錠劑", w: 0, ind: "心絞痛", loc: "B1", ph: 1 },
    "90117": { b: "MODELTAB* 25MG TAB", z: "模擬他錠 25 毫克", g: "MODELTAB", f: "錠劑", w: 0, ind: "高血脂", loc: "B1", ph: 0 },
    "90118": { b: "EXAMPLOL* 40MG TAB", z: "範例洛錠 40 毫克", g: "EXAMPLOL", f: "錠劑", w: 0, ind: "高血脂", loc: "B1", ph: 0 },
    "90119": { b: "SAMPLEGEL* 20MG CAP", z: "示範凝膠囊 20 毫克", g: "SAMPLEGEL", f: "膠囊", w: 0, ind: "胃潰瘍", loc: "B1", ph: 1 }
  };
  /* ───────── 開發者教學：幾種新畫面（第 16 批）─────────
     ① gc＝LINE 卡片（Flex 訊息）：跟真的卡片同一套尺寸（文字 xxs 11、xs 13、sm 14、md 16、lg 19…；留白 xs 2、sm 4、md 8、lg 12…），
       --u＝卡片寬度的 1/374（跟藥品卡片同一個單位，放在多窄的畫面裡都等比例縮放）；giga（大張，開發者的格子、✏️ 選單）＝374 份，
       mega（小張，一次改多項、公告、匯入的總覽和逐筆確認）＝300 份；用「節點」一層一層描述（文字 gt、直排 gx、橫排 gh、按鈕 gbtn、分隔線 gsep）。
     ② qr＝輸入框上面那一排小按鈕（quick reply）：畫在聊天室的最下面，長得跟「釘住的按鈕」那一課的輸入列一樣（一排、放不下就左右滑），
       下面有輸入框；旁邊寫「輸入框上面會出現」。
     ③ sh＝Google 試算表（手機 App 的樣子）：分頁、欄名、列號、格子；紅底＝有問題的列，右上角的黑三角＝這一格有註解。
     ④ cmds＝指令清單（維護、進階兩課）：一行「指令」＋「做什麼」。
     全部用 el()／文字節點畫，不拼網頁碼。範例資料（藥名、代號、驗證碼）全是編的。 */
  var GZ = { xxs: 11, xs: 13, sm: 14, md: 16, lg: 19, xl: 22, xxl: 29, "3xl": 35 };
  var GP = { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 20 };
  var GR = { none: 0, xs: 2, sm: 4, md: 6, lg: 10, xl: 14 };
  function gu(px) { return "calc(" + px + " * var(--u))"; }
  function gnum(v, tbl, d) { return typeof v === "number" ? v : (tbl[v] === undefined ? d : tbl[v]); }
  function gmix(a, b) { var k; if (b) for (k in b) a[k] = b[k]; return a; }
  /* 節點的寫法：文字 gt("字", {z 字級, b 粗體, c 顏色, m 上面留白, a 對齊, f 比例, nw 不換行})；
     文字還可以：mono 等寬字、ls 字距（em）、u 底線、rich（字裡面 **這樣** 的地方變粗體）；直排 gx([…], {bg 底色, r 圓角, p 內距（px／py 只有左右／上下）, bd 框線顏色（bs＝線的樣子，例 "dashed"）, op 透明度, sp 子項之間的距離, m, f, w 寬（wp＝佔上一層的百分比）, jc, ai, ar 長寬比（例 "3 / 4"）, pos 讓裡面有 abs 的子項浮在上面, abs 浮在角落 {t 上, r 右, b 下, l 左}, cls 多加一個 class 名})；橫排 gh 同上；
     按鈕 gbtn("字", {pri 綠底、bg／c 自己指定顏色、bd 框線；畫出來的 class 叫 g1／g2，不能叫 sec——藥師版有一個 .sec 是整個「一節」的樣式})；分隔線 gsep({m, c}) */
  function gt(text, o) { return gmix({ k: "t", t: text }, o); }
  function gx(kids, o) { return gmix({ k: "b", kids: kids }, o); }
  function gh(kids, o) { var n = gx(kids, o); n.h = 1; return n; }
  function gbtn(text, o) { return gmix({ k: "btn", t: text }, o); }
  function gsep(o) { return gmix({ k: "hr" }, o); }
  function gtexts(n, out) {
    if (!n) return out;
    if (n.k === "t") { var s = String(n.t === null || n.t === undefined ? "" : n.t).replace(/\*\*/g, "").replace(/\s+/g, " ").trim(); if (s) out.push(s); }
    else if (n.k === "btn") out.push(String(n.t).replace(/\s+/g, " ").trim() + "（按鈕）");
    else if (n.kids) n.kids.forEach(function(c) { gtexts(c, out); });
    return out;
  }
  function gnode(n, parentH, gap, first) {
    var e, fl, mg;
    if (n.k === "hr") {
      e = el("div", { class: "gs" });
      e.style.background = n.c || "#EFEFEF";
    } else if (n.k === "t") {
      e = el("div", { class: "gt" + (n.nw ? " nw" : ""), text: n.rich ? undefined : n.t });
      if (n.rich) e.appendChild(rich(n.t));
      e.style.fontSize = gu(gnum(n.z, GZ, 16));
      if (n.b) e.style.fontWeight = "700";
      if (n.c) e.style.color = n.c;
      if (n.a) e.style.textAlign = n.a === "end" ? "right" : n.a;
      if (n.mono) e.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Noto Sans Mono CJK TC", monospace';
      if (n.ls !== undefined) e.style.letterSpacing = n.ls + "em";
      if (n.u) e.style.textDecoration = "underline";
    } else if (n.k === "btn") {
      e = el("div", { class: "gbtn " + (n.pri ? "g1" : "g2"), text: n.t });
      e.style.minHeight = gu(40);
      e.style.padding = gu(6) + " " + gu(10);
      e.style.borderRadius = gu(6);
      e.style.fontSize = gu(14);
      if (n.bg) e.style.background = n.bg;
      if (n.c) e.style.color = n.c;
      if (n.bd) e.style.border = gu(1.5) + " solid " + n.bd;
    } else {
      e = el("div", { class: "gx" + (n.h ? " h" : "") });
      if (n.bg) e.style.background = n.bg;
      if (n.r !== undefined) e.style.borderRadius = gu(gnum(n.r, GR, 0));
      if (n.p !== undefined) e.style.padding = gu(gnum(n.p, GP, 0));
      if (n.pt !== undefined) e.style.paddingTop = gu(gnum(n.pt, GP, 0));
      if (n.pb !== undefined) e.style.paddingBottom = gu(gnum(n.pb, GP, 0));
      if (n.px !== undefined) { e.style.paddingLeft = gu(gnum(n.px, GP, 0)); e.style.paddingRight = gu(gnum(n.px, GP, 0)); }
      if (n.py !== undefined) { e.style.paddingTop = gu(gnum(n.py, GP, 0)); e.style.paddingBottom = gu(gnum(n.py, GP, 0)); }
      if (n.bd) e.style.border = gu(1.5) + " " + (n.bs || "solid") + " " + n.bd;
      if (n.op !== undefined) e.style.opacity = n.op;
      if (n.jc) e.style.justifyContent = n.jc;
      if (n.ai) e.style.alignItems = n.ai;
      if (n.pos) { e.style.position = "relative"; e.style.overflow = "hidden"; }
      var g = n.sp === undefined ? 0 : gnum(n.sp, GP, 0);
      (n.kids || []).forEach(function(c, i) { e.appendChild(gnode(c, !!n.h, g, i === 0)); });
    }
    if (n.ar) e.style.aspectRatio = n.ar;
    if (n.cls) e.className += " " + n.cls;
    fl = n.f !== undefined ? n.f : (parentH ? 1 : 0);
    e.style.flex = fl ? fl + " 1 0%" : "0 0 auto";
    if (n.w !== undefined) { e.style.width = gu(n.w); e.style.flex = "0 0 auto"; }
    if (n.wp !== undefined) { e.style.width = n.wp + "%"; e.style.flex = "0 0 auto"; }
    if (n.abs) {
      /* 浮在上一層（要有 pos）的角落：abs＝{ t 上, r 右, b 下, l 左 }（單位同 --u；沒寫的那一邊不管）。不佔位置，所以不留白 */
      e.style.position = "absolute";
      e.style.flex = "none";
      ["t:top", "r:right", "b:bottom", "l:left"].forEach(function(kv) { var p = kv.split(":"); if (n.abs[p[0]] !== undefined) e.style[p[1]] = gu(n.abs[p[0]]); });
      return e;
    }
    if (!first) {
      mg = n.m !== undefined ? gnum(n.m, GP, 0) : gap;
      if (mg) { if (parentH) e.style.marginLeft = gu(mg); else e.style.marginTop = gu(mg); }
    }
    return e;
  }
  /* 訊息的種類 w：gc＝LINE 卡片（跟機器人的訊息一樣，帶頭像）、wp＝瀏覽器裡的網頁畫面（照 gc 的畫法，但不帶頭像——那不是 LINE 的訊息，要有 m.bar 網址列）、qr＝輸入框上面的小按鈕。
     一張卡片：m.kids＝上面（body）、m.foot＝最下面（footer，通常是按鈕）、m.pad＝body 的內距、m.sp＝body 裡每一項的距離、
     m.size＝"mega"（小張，300 份寬；不寫就是 giga，整個聊天室那麼寬）、m.alt＝給讀屏的一句話；
     畫「瀏覽器裡的網頁」也用這個：m.bar＝上面一條網址列的字（有的話，卡片上面多一條灰色的）、m.bg＝整張的底色（網頁的底色） */
  function gcEl(m) {
    var all = [], card, body;
    (m.kids || []).forEach(function(n) { gtexts(n, all); });
    (m.foot || []).forEach(function(n) { gtexts(n, all); });
    if (m.bar) all.unshift("瀏覽器的網址列：" + m.bar);
    card = el("div", { class: "gk", role: "img", "aria-label": m.alt || ((m.bar ? "網頁畫面示意：" : "LINE 卡片示意：") + all.join("；")) });
    if (m.size === "mega") card.style.width = gu(300);
    if (m.bg) card.style.background = m.bg;
    if (m.bar) card.appendChild(el("div", { class: "gk-bar", "aria-hidden": "true" }, [el("span", { text: "🔒" }), el("span", { text: m.bar })]));
    body = gnode(gx(m.kids || [], { p: m.pad === undefined ? 13 : m.pad, sp: m.sp }), false, 0, true);
    card.appendChild(body);
    if (m.foot && m.foot.length) card.appendChild(gnode(gx(m.foot, { p: 13, sp: "sm" }), false, 0, true));
    return card;
  }
  /* 輸入框上面的小按鈕（LINE 的 quick reply）：照「釘住的按鈕」那一課的輸入列畫——一排小按鈕（放不下就左右滑），下面是輸入框；
     items 每一項是字，或 { t: 字, on: 1 }（粉紅色＝這一顆值得注意）；cap＝上面那一行小字（不寫就是「輸入框上面會出現這幾顆小按鈕」） */
  function qrEl(m) {
    var names = m.items.map(function(x) { return typeof x === "string" ? x : x.t; });
    var cap = m.cap || "輸入框上面會出現這幾顆小按鈕";
    var row = el("div", { class: "qrow" }, m.items.map(function(x) {
      return el("span", { class: "qchip" + (typeof x !== "string" && x.on ? " on" : ""), text: typeof x === "string" ? x : x.t });
    }));
    var bar = el("div", { class: "qbar", role: "img", "aria-label": cap + "（一排，放不下就往左滑）：" + names.join("、") }, [
      row,
      el("div", { class: "inbar", "aria-hidden": "true" }, [
        el("span", { class: "inic", text: "＋" }), el("span", { class: "inic", text: "📷" }), el("span", { class: "inic g", text: "🖼" }),
        el("span", { class: "inbox" }, [el("span", { text: "Aa" }), el("span", { text: "☺" })]),
        el("span", { class: "inic", text: "🎤" })
      ])
    ]);
    row.setAttribute("aria-hidden", "true");
    return el("div", { class: "qrw" }, [el("div", { class: "qrl", "aria-hidden": "true", text: "⬇ " + cap }), bar]);
  }
  /* Google 試算表：m.tabs 全部分頁、m.tab 現在這一頁、m.cols 欄名、m.rows 每一列（第一列＝標題列）、m.bad 紅底的列（從 0 算）、m.nt 有註解的格 [列, 欄]、m.note 下面的說明、m.cap 給讀屏的一句話 */
  function shEl(m) {
    var cols = m.cols || m.rows[0].map(function(x, i) { return "ABCDEFGHIJ".charAt(i); });
    var bad = m.bad || [], nts = m.nt || [];
    var tabs = el("div", { class: "sh-tabs", "aria-hidden": "true" }, (m.tabs || [m.tab]).map(function(t) { return el("span", { class: "sh-tab" + (t === m.tab ? " on" : ""), text: t }); }));
    var head = el("tr", {}, [el("th", { scope: "col", class: "sr", text: "列" })].concat(cols.map(function(c) { return el("th", { scope: "col", text: c }); })));
    var body = m.rows.map(function(r, i) {
      var tds = r.map(function(v, j) {
        var isNote = nts.some(function(p) { return p[0] === i && p[1] === j; });
        return el("td", { class: (i === 0 ? "hd" : "") + (isNote ? " nt" : ""), text: v === null || v === undefined ? "" : String(v) });
      });
      return el("tr", { class: bad.indexOf(i) >= 0 ? "bad" : "" }, [el("th", { scope: "row", text: String(i + 1) })].concat(tds));
    });
    var tbl = el("table", {}, [el("caption", { class: "sr", text: m.cap || ("試算表「" + m.tab + "」分頁，共 " + m.rows.length + " 列") }), el("thead", {}, [head]), el("tbody", {}, body)]);
    var kids = [tabs, el("div", { class: "sh-sc", role: "region", tabindex: "0", "aria-label": "試算表「" + m.tab + "」，可以左右捲動" }, [tbl])];
    if (m.note) kids.push(el("div", { class: "sh-n", text: m.note }));
    return el("div", { class: "shw" }, kids);
  }
  /* 指令清單：每一項 [指令, 做什麼] */
  function cmdsEl(items) {
    return el("ul", { class: "cmds" }, items.map(function(it) { return el("li", {}, [el("b", { text: it[0] }), el("span", { text: it[1] })]); }));
  }
  /* 示範區（secView 用）：試算表（d.k＝sh）、指令清單（d.k＝cmds）；回傳 [示範區, 下面的說明框]，跟別的示範區一樣 */
  function devDemo(d) {
    var body = d.k === "sh" ? shEl(d) : cmdsEl(d.items);
    var stage = el("div", { class: "stage" }, [
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: d.ttl || (d.k === "sh" ? "試算表長這樣" : "指令") })]),
      body,
      el("p", { class: "capn", text: d.capn || (d.k === "sh" ? "示意圖：Google 試算表的樣子，資料是編的。" : "照真的指令整理的；打在跟補藥神器的一對一聊天室，只有開發者有用。") })
    ]);
    return [stage, noteBox("")];
  }
  /* bubble0 的外掛：認得 gc／qr，以及「帶 ✏️ 修改 的藥品卡片」；不認得就回 null，照原本的畫。
     藥品卡片的 o.over＝只在畫這一張的時候，把這支藥的幾個欄位換成別的（例：改位置之後的那張卡）；o.edit＝最下面多一顆「✏️ 修改」（跟真的卡片一樣：footer 留白 10、按鈕內距 9） */
  function devBubble(m) {
    var w = m.w, cd, saved;
    if (w === "gc") return el("div", { class: "lcw" }, [gcEl(m)]);
    if (w === "wp") return el("div", { class: "lcw wpw" }, [gcEl(m)]);
    if (w === "qr") return qrEl(m);
    if (w === "dc" && m.o && (m.o.edit || m.o.over)) {
      saved = DR[m.c];
      if (m.o.over) { DR[m.c] = gmix(gmix({}, saved), m.o.over); }
      try { cd = lcCard(m.c, m.o); } finally { DR[m.c] = saved; }
      if (m.o.edit) {
        cd.appendChild(el("div", { class: "lc-edit", "aria-hidden": "true", text: "✏️ 修改" }));
        cd.setAttribute("aria-label", cd.getAttribute("aria-label") + "；最下面有一顆「✏️ 修改」按鈕（只有開發者看得到）");
      }
      return el("div", { class: "lcw" }, [cd]);
    }
    return null;
  }

  /* ───────── 開發者教學：照 LINE 上真的開發者卡片畫（第 16 批）─────────
     每一張都是照程式裡組卡片的那一段（06_行動指令.gs 的新藥格子、✏️ 修改、一次改多項、公告；08_匯入.gs 的匯入總覽、逐筆確認、🔧 開發者功能）的文字、顏色、字級、順序畫的；
     示範用的藥、CODE、位置全是編的，也不會真的改到任何資料。 */
  DR["90120"] = { b: "NEWTESTIN* 10MG TAB", z: "新測寧錠 10 毫克", g: "", f: "錠劑", w: 0, ind: "高血壓", feat: "", loc: "K2", ph: 0 };
  DR["90121"] = { b: "NEWSAMPLE* 5MG TAB", z: "新樣本錠 5 毫克", g: "", f: "錠劑", w: 0, ind: "", feat: "", loc: "B1", ph: 0 };
  var GREEN = "#1B7F5C", GBG = "#EFF3F0";
  /* 90101 有同成分的 90114、90115 → 真的藥品卡片上有紫色、收起來的「藥品家族」框（打開才看得到裡面）。開發者課裡每一張 90101 的卡片都照這樣畫 */
  var dcBase = dc;
  dc = function(code, o) {
    var o2 = {}, k;
    for (k in (o || {})) o2[k] = o[k];
    if (code === "90101" && !o2.fam) o2.fam = FAM1;
    return dcBase(code, o2);
  };
  function gcut(s, n) {
    var t = String(s === null || s === undefined ? "" : s).replace(/\s+/g, " ").trim();
    return t.length > (n || 58) ? t.substring(0, n || 58) + "…" : t;
  }
  /* 一顆「欄位按鈕」（✏️ 修改選單、一次改多項、新藥格子底下那種淺綠色的方塊） */
  function gfld(label, o) {
    o = o || {};
    return gx([gt(label, { z: o.z || (label.length > 6 ? "xs" : "sm"), b: 1, c: o.c || GREEN, a: "center", nw: 1 })], gmix({ f: 1, bg: o.bg || GBG, r: "md", p: o.p || 11 }, o.box));
  }

  /* ① 新藥：8 格 ───────────────────────── */
  var WZS = [
    { k: "code", n: "CODE", hint: "例：22975" },
    { k: "brand", n: "商品名", hint: "例：CURAM" },
    { k: "loc", n: "位置", hint: "例：K2、棧板A區" },
    { k: "form", n: "劑型", hint: "點下面的按鈕最快" },
    { k: "zh", n: "中文名", hint: "例：諾快寧膜衣錠" },
    { k: "gen", n: "學名", hint: "例：Amoxicillin + Clavulanate 375mg", skip: 1 },
    { k: "note", n: "適應症", hint: "例：抗生素", skip: 1 },
    { k: "feat", n: "特徵", hint: "例：白色橢圓 有刻痕", skip: 1 }
  ];
  /* d＝已經答過的格子（有這個 key＝答過了，空字串＝跳過）、cur＝黃色的那一格 */
  function wizCard(d, cur) {
    var filled = 0, need = 0, kids, bottom;
    WZS.forEach(function(s) { if (d[s.k]) filled++; if (!s.skip && !d[s.k]) need++; });
    kids = [
      gt("➕ 新增藥品" + (d.code ? "　" + d.code : ""), { z: "lg", b: 1, c: "#1F1F1F" }),
      gt("已填 " + filled + "／" + WZS.length + (need ? "　必填還差 " + need + " 格" : "　必填都填好了 ✅"), { z: "xs", c: need ? "#8A8A8A" : GREEN, m: "xs" }),
      gt("點一格 → 輸入框先填好欄位名，接著打內容送出。直接打字＝填黃色那一格。", { z: "xxs", c: "#AAAAAA", m: "sm" }),
      gsep({ m: "md" })
    ];
    WZS.forEach(function(s, i) {
      var on_ = s.k === cur, has = d[s.k] !== undefined, v = d[s.k] || "", right;
      if (on_ && !v) right = gx([gt("← 現在填這一格", { z: "sm", b: 1, c: "#B26A00" }), gt(s.hint, { z: "xxs", c: "#A08050", m: "xs" })], { f: 5 });
      else right = gt(v ? v : has ? "（不填）" : s.skip ? "（可不填）" : "（必填）", { z: "sm", c: v ? "#1F1F1F" : has || s.skip ? "#BBBBBB" : "#C9894F", f: 5 });
      kids.push(gh([gt(s.n, { z: "sm", b: 1, c: on_ ? "#B26A00" : GREEN, f: 2 }), right], { m: i === 0 ? "md" : "sm", bg: on_ ? "#FFF1CC" : "#EFF3F0", r: "md", p: 11, ai: "center" }));
    });
    bottom = [
      need ? gx([gt("還差 " + need + " 格必填", { z: "sm", c: "#AAAAAA", a: "center" })], { f: 1, bg: "#F2F2F2", r: "md", p: 11 })
           : gx([gt("👀 預覽、存檔", { z: "sm", b: 1, c: "#FFFFFF", a: "center" })], { f: 1, bg: GREEN, r: "md", p: 11 }),
      gx([gt("✕ 取消", { z: "sm", b: 1, c: "#C62828", a: "center" })], { f: 1, bg: "#FFE9E9", r: "md", p: 11 })
    ];
    kids.push(gh(bottom, { m: "lg", sp: "sm" }));
    return { w: "gc", pad: 14, kids: kids, alt: "新增藥品的格子：已填 " + filled + "／8" + (need ? "，必填還差 " + need + " 格" : "，必填都填好了") + (cur ? "，黃色的是「" + WZS.filter(function(s) { return s.k === cur; })[0].n + "」那一格" : "") };
  }

  /* ② ✏️ 改（點卡片下面的「✏️ 修改」）：18 顆欄位按鈕，兩顆一排 ───────────────────────── */
  var EFL = ["曾用藥品", "商品名", "注意", "小藥庫位置", "適應症", "劑型", "藥品外觀", "📷 換照片", "中文", "藥品特徵", "學名", "公告類別", "藥品查詢參考網站", "公告補充說明", "📷 公告照片", "📍 各區位置", "🗺 平面圖", "📖 縮寫"];
  function editMenuCard(code, notice) {
    var r = DR[code], kids, i;
    kids = [
      gt("✏️ 改 " + code, { z: "lg", b: 1, c: "#1F1F1F" }),
      gt(r.b + "　" + r.z, { z: "xs", c: "#8A8A8A", m: "xs" }),
      gt("點一個欄位 → 直接打新內容，不用打 CODE 也不用打欄位名", { z: "xxs", c: "#AAAAAA", m: "sm" }),
      gsep({ m: "md" })
    ];
    if (notice) kids.push(gx([gt("目前的公告", { z: "xxs", c: "#B26A00" }), gt(notice, { z: "sm", b: 1, c: "#B26A00" })], { m: "md", bg: "#FFF6E0", r: "md", p: "sm" }));
    kids.push(gx([gt("📝 一次改多項", { z: "sm", b: 1, c: GREEN, a: "center" }), gt("換廠那種要改五六欄的，走這條比較快", { z: "xxs", c: "#6B8A7C", a: "center", m: "xs" })], { m: "md", bg: "#E8F5EE", r: "md", p: 12 }));
    for (i = 0; i < EFL.length; i += 2) kids.push(gh([gfld(EFL[i]), gfld(EFL[i + 1])], { sp: "sm", m: i === 0 ? "md" : "sm" }));
    kids.push(gt("點一個欄位 → 直接打新內容送出（手機會先把現在的內容填進輸入框）；多行的欄位可以一句一句加。改完會馬上把新的卡片給您看", { z: "xxs", c: "#AAAAAA", a: "center", m: "md" }));
    return { w: "gc", pad: 14, kids: kids, alt: "「✏️ 改 " + code + "」的選單：最上面一顆「📝 一次改多項」，下面 18 顆欄位按鈕（" + EFL.join("、") + "）" };
  }

  /* ③ 📝 一次改多項：A～J 十列，每一列右邊一顆「改」；改過的列變綠、寫「✅ 已寫進去」＋「原本：…」 ───────────────────────── */
  var MEFR = [["A", "商品名", "brand"], ["B", "中文", "zh"], ["C", "小藥庫位置", "loc"], ["D", "藥品特徵", "feat"], ["E", "學名", "gen"], ["F", "藥品照片", "pic"], ["G", "公告類別", "nk"], ["H", "公告補充說明", "nm"], ["I", "曾用藥品", "old"], ["J", "縮寫", "abbr"]];
  /* vals＝每一欄現在的值、was＝這一輪改過的欄位 → 原本的值、head＝上面的一行說明 */
  function mefCard(code, vals, was, head) {
    var r = DR[code], n = 0, kids, k, row;
    for (k in was) n++;
    kids = [
      gt("📝 一次改 " + code, { z: "lg", b: 1, c: "#1F1F1F" }),
      gt((vals.brand || r.b) + "　" + (vals.zh || r.z), { z: "xs", c: "#8A8A8A", m: "xs" }),
      gsep({ m: "md" }),
      gx([
        gt("⌨️ 按「改」→ 現在的內容會自動填進輸入框", { z: "xxs", b: 1, c: GREEN }),
        gt("游標就在後面，改要改的那幾個字送出就好。", { z: "xxs", c: "#6B8A7C", m: "xs" }),
        gt("也可以不按，直接打「中文 樂復得膜衣錠 50mg」，一次打好幾行都行。", { z: "xxs", c: "#AAAAAA", m: "xs" }),
        gt("⌨️ 打左邊那個代號更快：「A 小小錠」＝改商品名。一次打好幾行：A 新名字 / B 新中文 / C k2", { z: "xxs", c: GREEN, m: "sm" }),
        gt("💻 電腦版 LINE 按鍵可能不會自動填 —— 直接打代號那種格式一樣有效。", { z: "xxs", c: "#AAAAAA", m: "xs" })
      ], { m: "md", bg: "#F4F8F6", r: "md", p: "sm" })
    ];
    if (head) kids.push(gt(head, { z: "xs", c: "#8A8A8A", m: "md" }));
    if (n > 0) kids.push(gx([gt("✅ 這一輪改了 " + n + " 項，都已經寫進試算表了", { z: "xxs", b: 1, c: GREEN })], { m: "md", bg: "#E8F5EE", r: "md", p: "sm" }));
    MEFR.forEach(function(f, i) {
      var ch = was[f[2]] !== undefined, now = gcut(vals[f[2]]) || "（空的）", left, btns;
      left = [
        gh([gx([gt(f[0], { z: "xxs", b: 1, c: ch ? "#FFFFFF" : "#4A6B5C", a: "center", nw: 1 })], { f: 0, w: 17, bg: ch ? GREEN : "#DCE8E2", r: 3, jc: "center" }), gt(f[1], { z: "xxs", c: ch ? GREEN : "#8A8A8A", f: 0 })].concat(ch ? [gt("✅ 已寫進去", { z: "xxs", b: 1, c: GREEN, f: 0 })] : []), { sp: "xs" }),
        gt(now, { z: "sm", c: ch ? GREEN : "#1F1F1F", b: ch, m: "xs" })
      ];
      if (ch && was[f[2]]) left.push(gt("原本：" + gcut(was[f[2]], 40), { z: "xxs", c: "#AAAAAA", m: "xs" }));
      btns = f[2] === "pic" ? [gfld("網址", { z: "sm", box: { w: 56, f: 0 }, p: 9 }), gfld("📷 傳", { z: "sm", box: { w: 64, f: 0 }, p: 9 })] : [gfld(ch ? "再改" : "改", { z: "sm", box: { w: ch ? 58 : 52, f: 0 }, p: 9 })];
      row = gx([gh([gx(left, { f: 1 })].concat(btns), { sp: "sm", pt: 10, pb: 10, ai: "center" }), gsep({ m: "none" })], { m: i === 0 && !head && n === 0 ? "md" : "none" });
      kids.push(row);
    });
    kids.push(gh([gfld("＋ 其他欄位", { z: "xs", box: { f: 1 } }), gfld("✅ 看新卡片", { z: "xs", box: { f: 1 } })], { m: "lg", sp: "sm" }));
    return { w: "gc", size: "mega", pad: 16, kids: kids, alt: "「📝 一次改 " + code + "」的卡片：A 到 J 十列（" + MEFR.map(function(f) { return f[0] + " " + f[1]; }).join("、") + "），每一列右邊一顆「改」；改過的列變綠色" };
  }

  /* ④ 📢 公告類別（從「一次改多項」進來的那張）：五顆按鈕，現在掛著的那顆是綠底 ───────────────────────── */
  var NKS = { "1": "停止供貨", "2": "改包裝通知", "3": "製廠缺貨", "4": "換廠", "5": "給慢箋" };
  function nkCard(code, cur) {
    var kids = [
      gt("📢 " + code + " 的公告", { z: "lg", b: 1, c: "#1F1F1F" }),
      gt(cur ? "現在掛著：" + cur + " " + NKS[cur] : "現在：沒有公告", { z: "xs", c: cur ? "#B26A00" : "#8A8A8A", m: "xs" }),
      gt("按一顆就好，馬上生效。補充說明在卡片上另外改。", { z: "xxs", c: "#AAAAAA", m: "sm" }),
      gsep({ m: "md" })
    ];
    ["1", "2", "3", "4", "5"].forEach(function(n, i) {
      var on_ = n === cur;
      kids.push(gx([gt((on_ ? "✅ " : "") + n + "　" + NKS[n], { z: "sm", b: 1, c: on_ ? "#FFFFFF" : GREEN, a: "center", nw: 1 })], { m: i === 0 ? "md" : "sm", bg: on_ ? GREEN : GBG, r: "md", p: 12 }));
    });
    kids.push(gh([gfld("🗑 移除公告", { z: "xs", c: "#C0392B", bg: "#FDECEC" }), gfld("← 不改，回去", { z: "xs", c: "#8A8A8A" })], { m: "lg", sp: "sm" }));
    return { w: "gc", size: "mega", pad: 16, kids: kids, alt: "「📢 " + code + " 的公告」：五顆按鈕（1 停止供貨、2 改包裝通知、3 製廠缺貨、4 換廠、5 給慢箋），" + (cur ? "現在掛著的是 " + cur + " " + NKS[cur] : "現在沒有公告") + "，最下面「🗑 移除公告」和「← 不改，回去」" };
  }

  /* ⑤ 匯入：總覽卡、逐筆確認卡（08_匯入.gs 的 _impOverviewBubble_、_impRowBubble_）───────────────────────── */
  function impCnt(n, label, c, bg) {
    return gx([gt(String(n), { z: "lg", b: 1, c: c, a: "center" }), gt(label, { z: "xxs", c: "#4B5563", a: "center" })], { f: 1, bg: bg, r: "md", p: 6 });
  }
  function impBtn(label, pri) { return gbtn(label, pri ? { pri: 1 } : {}); }
  /* o：{ b 批次、total 讀了幾列、add、upd、nc、pb、map 對欄那句、warns 有問題的列（寫好的一句一句）、count 接下來幾筆 } */
  function impOverview(o) {
    var kids = [
      gt("匯入總覽　批次 #" + o.b, { z: "md", b: 1, c: "#1F2933" }),
      gt("讀了「待匯入」" + o.total + " 列。什麼都還沒寫。", { z: "xs", c: "#6B7684" }),
      gh([impCnt(o.add, "新增", "#1E8E5A", "#E3F4EA"), impCnt(o.upd, "修改", "#1E5C86", "#E1EDF6"), impCnt(o.nc, "沒變", "#4B5563", "#F3F5F8"), impCnt(o.pb, "有問題", "#BE3F38", "#F9E4E2")], { m: "md", sp: "sm" }),
      gt("對欄（第一列的欄位名稱）：" + o.map, { z: "xs", c: "#4B5563" })
    ];
    if (o.nc) kids.push(gt("沒變的 " + o.nc + " 筆已從待匯入清掉。", { z: "xs", c: "#6B7684" }));
    o.warns.forEach(function(w) { kids.push(gt("⚠️ " + w + " → 留在待匯入（紅底）", { z: "xs", c: "#8A4B00" })); });
    kids.push(gt("接下來 " + o.count + " 筆會一筆一筆給您看，按「對」才寫入。", { z: "xs", c: "#6B7684" }));
    return { w: "gc", size: "mega", pad: 13, sp: "sm", kids: kids, foot: [impBtn("開始逐筆確認（第 1／" + o.count + "）", 1), impBtn("取消（什麼都不寫）")], alt: "匯入總覽卡：讀了 " + o.total + " 列，新增 " + o.add + "、修改 " + o.upd + "、沒變 " + o.nc + "、有問題 " + o.pb + "；最下面兩顆按鈕「開始逐筆確認」「取消」" };
  }
  /* o：{ i 第幾筆、total 共幾筆、add 新增還是修改、code、title（商品名或中文名）、head 右上角那句（不寫＝照真的：新增寫「工作表1 沒有這支 → 新增」、修改寫「改 N 格」）、
        kv: [[標籤, 原本或 "", 現在, 有沒有整理過]]（新增：照真的順序 商品名、中文名、學名、位置、劑型、參考網站、公告類別、公告補充，只列有值的；修改：只列要改的格，原本是空的也要把第 4 個寫 1）、cur 現在（修改才有，例：商品名　位置　劑型）、warns } */
  function impRow(o) {
    var kids = [
      gh([gt("第 " + o.i + "／" + o.total + " 筆", { z: "xs", c: "#6B7684", f: 3 }), gt(o.head || (o.add ? "工作表1 沒有這支 → 新增" : "改 " + o.kv.length + " 格"), { z: "xs", c: o.add ? "#1E8E5A" : "#1E5C86", a: "end", f: 4 })]),
      gt((o.add ? "新增" : "修改") + "　" + o.code + "　" + o.title, { z: "md", b: 1, c: "#1F2933" })
    ];
    if (o.cur) kids.push(gh([gt("現在", { z: "sm", c: "#6B7684", f: 2 }), gx([gt(o.cur, { z: "xs", c: "#6B7684" })], { f: 5 })], { sp: "sm" }));
    o.kv.forEach(function(x) {
      var nodes = x[1] || x[3] ? [gt(x[1] || "（空的）", { z: "xs", c: "#9AA5B1" }), gt("→ " + x[2], { z: "sm", b: 1, c: "#1E5C86" })] : [gt(x[2], { z: "sm", c: "#1F2933" })];
      kids.push(gh([gt(x[0], { z: "sm", c: "#6B7684", f: 2 }), gx(nodes, { f: 5 })], { sp: "sm" }));
    });
    o.warns.forEach(function(w) { kids.push(gt("⚠️ " + w, { z: "xs", c: "#8A4B00" })); });
    kids.push(gt("藍字是整理過的；按「對」才會寫入。", { z: "xxs", c: "#6B7684" }));
    return { w: "gc", size: "mega", pad: 13, sp: "sm", kids: kids, foot: [impBtn("✅ 對，寫入", 1), impBtn("✏️ 改一格"), impBtn("⏭ 跳過（留在待匯入）"), impBtn("⏹ 先停（其餘留在待匯入）")], alt: "逐筆確認卡：第 " + o.i + "／" + o.total + " 筆，" + (o.add ? "新增 " : "修改 ") + o.code + " " + o.title + "；最下面四顆按鈕「對，寫入」「改一格」「跳過」「先停」" };
  }

  /* ⑥ 🔧 開發者功能（輸入框上面的「🔧 開發者」按下去）：9 顆，兩顆一排，綠色的兩顆是最常用的 ───────────────────────── */
  function devMenuCard(ocrOn, newOn, v2On) {
    var items = [["➕ 新增藥品", 1], ["📮 回覆回報", 1], ["🩺 體檢"], ["⏱ 速度"], [ocrOn ? "🔬 OCR接手 ✅全院" : "🔬 OCR接手（已關）"], ["📋 清單校對"], [newOn ? "🎴 新卡片 ✅全院" : "🎴 新卡片（已關）"], [v2On ? "🎤 語音V2 ✅全院" : "🎤 語音V2（已關）"], ["👥 開發者"]], kids, i;
    function b(it) { return gx([gt(it[0], { z: "sm", b: 1, c: it[1] ? "#FFFFFF" : "#1F2933", a: "center" })], { f: 1, bg: it[1] ? "#06C755" : "#F1F3F6", r: "md", p: 11 }); }
    kids = [
      gt("🔧 開發者功能", { z: "lg", b: 1 }),
      gt("按一顆＝幫您打那個字。藥師看不到這張。", { z: "xxs", c: "#AAAAAA", m: "xs" })
    ];
    for (i = 0; i < items.length; i += 2) kids.push(gh(items[i + 1] ? [b(items[i]), b(items[i + 1])] : [b(items[i])], { sp: "sm", m: i === 0 ? "md" : "sm" }));
    kids.push(gt("換照片：查那支藥 → ✏️ 修改 → 📷 換照片（雲端資料夾的新照片每 2 小時自動同步，急的話打「同步照片」）　｜　改錯了：按改完那一則下面的「↩️ 復原」，或打「復原」", { z: "xxs", c: "#AAAAAA", m: "md" }));
    return { w: "gc", pad: 14, kids: kids, alt: "「🔧 開發者功能」選單，9 顆按鈕：" + items.map(function(x) { return x[0]; }).join("、") };
  }


  /* ⑦ 開發者網頁（第 6 課）：LINE 這邊四張卡（連結卡、綁定碼卡、驗證碼卡、新裝置通知卡）＋瀏覽器裡的畫面（還沒綁定、代號登入、登入之後）
        LINE 的卡：文字照 09_網頁版.gs 的 _cmdWeb_／_cmdWebBind_／_lcCard_／_lcNote_；網頁：照 _app_page.html 的 bindForm／renderPair／codeForm 和它的顏色。
        網頁的畫面是另一種訊息（w:"wp"）：不帶機器人頭像——那不是 LINE 的訊息，是換到瀏覽器看到的；上面一條灰色的是網址列。 */
  var WBC = { blue: "#1F6FD0", red: "#B0392B", bg: "#EEF2F6", edge: "#708392", line: "#D1DBE5", ink: "#14202B", ink2: "#3F5566", mute: "#7A8C9A", hint: "#566B7B", soft: "#E4EEFA", url: "demo.github.io/buyao/", id: "demo01" };
  /* LINE 的連結卡：o.dev＝開發者版（不寫就是開發者版）、o.force＝剛打過「重發」（多一句「已換新連結」） */
  function webLinkCard(o) {
    o = o || {};
    var dev = o.dev !== false, f = o.force ? "\n（已換新連結，舊的已失效）" : "", kids, L;
    L = dev ? [
      "跟藥師版一樣能查，多了藥品卡片右上角的 ✏️：直接改工作表1／工作表2（跟 LINE 的 ✏️ 修改同一支）。",
      "平常直接按下面那排的「🌐 補藥神器網頁」就好（開發者按到的就是這一版）。連結只要有在用就不會過期（30 天沒開才會失效）。" + f,
      "這條連結能改資料，只能自己用，別給藥師。打「開發者網頁 重發」會換一條新的，舊的立刻失效。",
      "🔒 開發者網頁每一台都要先綁定：在要用的地方（LINE 裡、瀏覽器、手機主畫面）打開後，回 LINE 打「開發者網頁 綁定」拿 6 位數碼輸入（最多 3 處）。連結外流，沒有碼也綁不上、改不了資料。綁滿了或要換地方，打「開發者網頁 重發」重來。"
    ] : [
      "電腦、手機都能開；打字、📷 拍照都在裡面，首頁有公告和所有藥品。",
      "平常直接按下面那排的「🌐 補藥神器網頁」就好；加到手機主畫面更方便。連結只要有在用就不會過期（30 天沒開才會失效）。" + f,
      "連結等於你的鑰匙，別轉給院外的人。打「網頁 重發」會換一條新的，舊的立刻失效。"
    ];
    L.push("後端代號 " + WBC.id + "（網頁跳出「不同的後端」的視窗時，結尾跟這個一樣的才是補藥神器）");
    kids = [gt(dev ? "🛠 補藥神器 開發者網頁" : "🌐 補藥神器 網頁版", { z: "lg", b: 1 })];
    L.forEach(function(s, i) { kids.push(gt(s, { z: "sm", c: i === 0 ? "#1F2933" : "#666666", m: i === 0 ? "md" : "sm" })); });
    return { w: "gc", pad: 13, kids: kids, foot: [gbtn("打開網頁", { pri: 1, bg: WBC.blue })].concat(dev ? [gbtn("🔑 拿綁定碼")] : []),
      alt: "「" + (dev ? "🛠 補藥神器 開發者網頁" : "🌐 補藥神器 網頁版") + "」卡片：" + (dev ? "開發者網頁多了藥品卡片右上角的 ✏️、連結只能自己用、每一台要先綁定（最多 3 處）" : "藥師版網頁，電腦手機都能開") + "；最下面" + (dev ? "兩顆按鈕「打開網頁」「🔑 拿綁定碼」" : "一顆按鈕「打開網頁」") };
  }
  /* 「開發者網頁 綁定」：6 位數綁定碼 */
  function wbBindCard(code) {
    var L = ["在要綁的那台（LINE 裡、手機瀏覽器、電腦、主畫面捷徑）打開開發者網頁，把這 6 位數打進去。", "10 分鐘內有效、只能用一次（再拿新的，這組就作廢），只對你現在這條開發者連結有效；最多綁 3 處。", "⚠️ 這組碼只打在補藥神器網頁上，不要傳給任何人（包括自稱開發者、客服的人）。"];
    var kids = [gt("🔑 開發者網頁綁定碼", { z: "lg", b: 1 }), gt(code, { z: "3xl", b: 1, c: WBC.blue, m: "md" })];
    L.forEach(function(s, i) { kids.push(gt(s, { z: "sm", c: i === 2 ? WBC.red : "#666666", m: "sm" })); });
    return { w: "gc", pad: 13, kids: kids, foot: [gbtn("打開開發者網頁", { pri: 1, bg: WBC.blue })],
      alt: "「🔑 開發者網頁綁定碼」卡片：6 位數的碼 " + code + "，10 分鐘內有效、只能用一次、最多綁 3 處；最下面一顆按鈕「打開開發者網頁」" };
  }
  /* 把代號貼進 LINE 之後回的「驗證碼」卡（像銀行簡訊；開發者版是藍色）：v＝6 位數驗證碼、code＝網頁上的代號、lab＝網頁自己報的名稱 */
  function wbCodeCard(v, code, lab) {
    var warn = "⚠️ 這組碼進得了開發者版（能改資料）。請只打在剛剛那個網頁上，不要告訴任何人（包括自稱客服、開發者的人）。";
    var L = ["給「代號 " + code + "」那個網頁用的" + (lab ? "（網頁自己報的名稱：" + lab + "）" : "") + "：回到那個網頁輸入，換別的瀏覽器打沒用。", "從網頁上出現代號那一刻起算，要在網頁的倒數歸零前輸入完；超過了，網頁會自己換一組新的代號，到時把新的代號再貼進來就好。", "不是你自己剛在網頁上看到這組代號的？不要輸入。", warn];
    var kids = [gt("🛠 開發者版 網頁驗證碼", { z: "lg", b: 1 }), gt(v, { z: "3xl", b: 1, a: "center", c: WBC.blue, m: "lg" }), gt("限時 5 分鐘・只能用一次", { z: "sm", b: 1, a: "center", c: WBC.red, m: "md" })];
    L.forEach(function(s) { kids.push(gt(s, { z: "sm", c: s === warn ? WBC.red : "#666666", m: "sm" })); });
    return { w: "gc", pad: 13, kids: kids, alt: "「🛠 開發者版 網頁驗證碼」卡片：6 位數的驗證碼 " + v + "，限時 5 分鐘、只能用一次；只能打回出現代號 " + code + " 的那個網頁，換別的瀏覽器打沒用；沒有按鈕" };
  }
  /* 有新裝置登入開發者網頁，LINE 推播給開發者的通知卡 */
  function wbNewDevCard(at, lab, n) {
    var L = ["剛剛 " + at + "，有一台新裝置用驗證碼登入了開發者網頁（能改資料）。", "裝置（瀏覽器自己報的，不一定是真的）：" + lab + "\n已綁裝置：" + n + "／3 台", "是你自己 → 不用理會。\n不是你 → 按下面的按鈕：舊連結和所有已綁的裝置馬上失效（要再用開發者網頁，重新拿連結或驗證碼）。"];
    var kids = [gt("🔔 開發者網頁有新裝置登入", { z: "lg", b: 1 })];
    L.forEach(function(s, i) { kids.push(gt(s, { z: "sm", c: i === 2 ? WBC.red : "#444444", m: "sm" })); });
    return { w: "gc", pad: 13, kids: kids, foot: [gbtn("不是我，全部作廢", { pri: 1, bg: WBC.red })],
      alt: "「🔔 開發者網頁有新裝置登入」卡片：" + at + " 有一台新裝置（" + lab + "）登入，已綁 " + n + "／3 台；是自己就不用理會；最下面一顆紅色按鈕「不是我，全部作廢」" };
  }
  /* 瀏覽器裡的畫面共用的外框：灰色網址列＋網頁的底色 */
  function wbPage(kids, alt, o) { return gmix({ w: "wp", bar: WBC.url, bg: WBC.bg, pad: 16, kids: kids, alt: alt }, o); }
  /* 網頁：開發者版這台還沒綁定（bindForm）。o.typed＝輸入框裡已經打的字、o.err＝紅字（"❌ " 是網頁自己加的）、o.wait＝灰字（確認中…） */
  function wbBind(o) {
    o = o || {};
    var kids = [
      gt("🔒 這台還沒綁定開發者版。\n在 LINE 打「開發者網頁 綁定」，把拿到的 6 位數碼打在下面：", { z: 15.5, b: 1, c: WBC.ink2, a: "center", m: 8 }),
      gh([
        gx([gt(o.typed || "6 位數碼", o.typed ? { z: 22, c: WBC.ink, a: "center", ls: 0.3 } : { z: 16, c: WBC.hint, a: "center" })], { w: 190, bg: "#FFFFFF", bd: WBC.line, r: 12, px: 12, py: 10 }),
        gx([gt("綁定", { z: 16, b: 1, c: "#FFFFFF", a: "center" })], { w: 78, bg: WBC.blue, r: 12, jc: "center" })
      ], { sp: 8, m: 16, jc: "center" })
    ];
    if (o.err) kids.push(gt("❌ " + o.err, { z: 14, c: WBC.red, a: "center", m: 8 }));
    if (o.wait) kids.push(gt(o.wait, { z: 14, c: WBC.ink2, a: "center", m: 8 }));
    kids.push(gt("碼 10 分鐘內有效、只能用一次；錯 5 次鎖 1 小時；最多綁 3 處。\n這組碼只打在這裡，不要傳給任何人。", { z: 12.5, c: WBC.mute, a: "center", m: 10 }));
    return wbPage(kids, "網頁畫面：「🔒 這台還沒綁定開發者版。在 LINE 打『開發者網頁 綁定』，把拿到的 6 位數碼打在下面」，一個輸入框（" + (o.typed ? "已打 " + o.typed : "寫著 6 位數碼") + "）和藍色的「綁定」鍵" + (o.err ? "，下面紅字：" + o.err : "") + (o.wait ? "，下面灰字：" + o.wait : "") + "；最下面小字：碼 10 分鐘內有效、只能用一次，錯 5 次鎖 1 小時，最多綁 3 處", { pad: 20 });
  }
  /* 網頁：代號登入（codeForm＋renderPair）。o.dev 開發者版（6 位數字代號，上面多一個「🛠 開發者登入」小標籤）、o.code 代號、o.left 倒數、o.typed 驗證碼輸入框裡的字、o.err 紅字 */
  function wbLogin(o) {
    var dev = o.dev !== false, shown = dev ? o.code.slice(0, 3) + " " + o.code.slice(3) : o.code, pair, step2, kids;
    pair = gx((dev ? [gx([gt("🛠 開發者登入", { z: 13, b: 1, c: WBC.ink })], { bg: WBC.soft, r: 20, px: 12, py: 2, m: 0 })] : []).concat([
      gt("① 打開 LINE 補藥神器（一對一，不是群組），把這組**" + (dev ? "開發者代號" : "代號") + "**" + (dev ? "打" : "貼") + "進去", { z: 14, c: WBC.ink2, a: "center", rich: 1, m: dev ? 6 : 0 }),
      gt(shown, { z: 40, b: 1, c: WBC.ink, a: "center", mono: 1, ls: dev ? 0.18 : 0.1, m: 6 }),
      gx([gt("複製代號", { z: 14, b: 1, c: WBC.blue, a: "center" })], { bd: WBC.blue, bg: "#FFFFFF", r: 10, px: 18, py: 8, m: 4 }),
      gt((dev ? "" : "英文大小寫都可以\n") + "請在 **" + o.left + "** 內完成登入（超過會自動換新的代號）", { z: 12.5, c: WBC.ink2, a: "center", rich: 1, m: 6 }),
      gh([gt("這台：Chrome / Windows　·　", { z: 12.5, c: WBC.ink2, f: 0 }), gt("重新取得代號", { z: 13.5, b: 1, c: WBC.blue, u: 1, f: 0 })], { jc: "center", ai: "center", m: 2 })
    ]), { bg: "#FFFFFF", bd: WBC.edge, r: 14, p: 12, ai: "center" });
    step2 = [
      gt("② LINE 會回你 6 位數的**驗證碼**，打在這裡", { z: 14, c: WBC.ink2, a: "center", rich: 1, m: 16 }),
      gx([gt(o.typed || "LINE 給你的 6 位數", o.typed ? { z: 28, b: 1, c: WBC.ink, a: "center", mono: 1, ls: 0.32 } : { z: 16, c: WBC.hint, a: "center" })], { bg: "#FFFFFF", bd: WBC.edge, r: 12, px: 14, py: 12, m: 12 }),
      gx([gt("登入", { z: 17, b: 1, c: "#FFFFFF", a: "center" })], { bg: WBC.blue, r: 12, py: 13, m: 12 })
    ];
    if (o.err) step2.push(gt(o.err, { z: 14, c: WBC.red, a: "center", m: 8 }));
    kids = [gt("🔐 登入補藥神器", { z: 15.5, b: 1, c: WBC.ink2, a: "center" }), gx([pair], { m: 14 })].concat(o.noStep2 ? [] : step2, [
      gt("代號和驗證碼都只能在這個網頁用，換別的瀏覽器打沒用。\n代號出現後 5 分鐘內要完成登入，超過了這裡會自己換一組新的代號；驗證碼只能用一次，不要傳給任何人。", { z: 12.5, c: WBC.ink2, a: "center", m: 12 }),
      gt(dev ? "← 回藥師登入" : "開發者登入", { z: 13, c: WBC.ink2, a: "center", u: 1, m: 8 })
    ]);
    return wbPage(kids, "網頁畫面：代號登入。" + (dev ? "上面一個「🛠 開發者登入」小標籤，" : "") + "①把這組" + (dev ? "開發者代號 " : "代號 ") + o.code + " 打進 LINE 補藥神器（一對一，不是群組），下面有「複製代號」鍵和倒數 " + o.left + "；" + (o.noStep2 ? "" : "②LINE 回的 6 位數驗證碼打在輸入框（" + (o.typed ? "已打 " + o.typed : "寫著 LINE 給你的 6 位數") + "），按藍色的「登入」鍵" + (o.err ? "，下面紅字：" + o.err : "") + "；") + "最下面小字說明 5 分鐘內要完成，小連結「" + (dev ? "← 回藥師登入" : "開發者登入") + "」", { pad: 16 });
  }
  /* 網頁：登入／綁定好了，回到首頁（開發者版：標題下面多一個「開發者版」小標籤） */
  function wbHome(hint) {
    var kids = [
      gh([
        gx([gt("💊", { z: 30, a: "center" })], { w: 52, bg: WBC.soft, r: 12, py: 8 }),
        gx([gt("補藥神器", { z: 22, b: 1, c: WBC.ink }), gx([gt("開發者版", { z: 11.5, b: 1, c: WBC.blue })], { bg: WBC.soft, r: 6, px: 8, py: 2 })], { sp: 2, ai: "flex-start", jc: "center" })
      ], { sp: 11, ai: "center" }),
      gh([
        gx([gt("輸入 CODE、藥名、中文或位置，再按 Enter 鍵查詢", { z: 14, c: WBC.hint, nw: 1 })], { f: 1, bg: "#FFFFFF", bd: WBC.line, r: 12, px: 14, py: 11 }),
        gx([gt("🎤", { z: 20, a: "center" })], { w: 46, bg: "#FFFFFF", bd: WBC.line, r: 12, jc: "center" }),
        gx([gt("📷", { z: 20, a: "center" })], { w: 46, bg: "#FFFFFF", bd: WBC.line, r: 12, jc: "center" })
      ], { sp: 7, m: 10 }),
      gt(hint || "✅ 這台綁好了，以後在這裡直接開就好（不用再輸入）。", { z: 12.5, c: WBC.mute, m: 8 })
    ];
    return wbPage(kids, "網頁畫面：登入好了，回到開發者版首頁。左上「補藥神器」下面有「開發者版」小標籤，一個搜尋框（可以打字，右邊有 🎤 和 📷 兩個鍵），下面一行小字「" + (hint || "✅ 這台綁好了，以後在這裡直接開就好（不用再輸入）。") + "」", { pad: 14 });
  }

  /* ⑧ 清單校對的網頁（lst.html；第 4 課）：照 _lst_page.html 的樣子和顏色（底 #F2F5F5、藍綠 #1B5C74、綠 #1B7A5A、紅 #B33E2E）。也是瀏覽器裡的畫面（w:"wp"） */
  var LSC = { bg: "#F2F5F5", ink: "#152020", ink2: "#3E5150", mute: "#6B807F", line: "#D6DFDF", edge: "#BCCACA", g: "#1B7A5A", b: "#1B5C74", r: "#B33E2E", soft: "#E8EDED", newbg: "#DCEFE7", url: "demo.github.io/buyao/lst.html" };
  function lstBtn(t, k, o) {
    var st = k === "y" ? { bg: LSC.g, c: "#FFFFFF", bd: LSC.g } : k === "no" ? { bg: "#FFFFFF", c: LSC.r, bd: LSC.r } : { bg: "#FFFFFF", c: LSC.ink2, bd: LSC.edge };
    return gx([gt(t, { z: 15.5, b: k !== "sk", c: st.c, a: "center" })], gmix({ bg: st.bg, bd: st.bd, r: 8, py: 12, jc: "center" }, o));
  }
  function lstChip(t, on) { return gx([gt(t, { z: 12.5, c: on ? "#FFFFFF" : LSC.mute, nw: 1 })], { bg: on ? LSC.b : "#FFFFFF", bd: on ? LSC.b : LSC.edge, r: 20, px: 11, py: 5, f: 0 }); }
  /* 一張要審的卡：d＝{ code, nm, isNew（true＝表上沒有）, hand（手寫改的）, chg: [[欄位, 工作表1 原本的, 清單讀到的]], v: [[欄位, 值]]（表上沒有的才有，下面幾格可以改） }；
     d.res＝按完之後那一行結果 { t 字, ok 綠字還是紅字 }（卡片會變淡、按鈕拿掉） */
  function lstItem(d) {
    var isNew = !!d.isNew, body = [], card = [];
    card.push(gh([
      gx([gt(d.code, { z: 17, b: 1, c: LSC.b, mono: 1 }), gt(d.nm, { z: 14, c: LSC.ink2 })], { f: 1 }),
      gx([gt(isNew ? "🔵 表上沒有" : "🟡 不一樣", { z: 11.5, b: 1, c: isNew ? LSC.b : "#9A6210", nw: 1 })], { bg: isNew ? "#DFEEF4" : "#F7EBD8", r: 5, px: 9, py: 3, f: 0 })
    ], { px: 15, pt: 12, pb: 10, sp: 10, ai: "flex-start" }));
    card.push(gsep({ c: LSC.line }));
    if (d.hand) body.push(gt("✍️ 清單上這一筆是手寫改的", { z: 13, b: 1, c: "#C0392B" }));
    (d.chg || []).forEach(function(c) {
      body.push(gt(c[0], { z: 12, c: LSC.mute, ls: 0.1, mono: 1 }));
      body.push(gh([
        gx([gt("工作表1", { z: 11, c: LSC.mute }), gt(c[1] || "—", { z: 18, b: 1, c: LSC.mute, mono: 1 })], { bg: LSC.soft, bd: LSC.line, r: 7, px: 11, py: 8, f: 1 }),
        gt("→", { z: 14, c: LSC.mute, w: 16, a: "center" }),
        gx([gt("清單讀到（可改）", { z: 11, c: LSC.g }), gx([gt(c[2], { z: 17, b: 1, c: LSC.ink, mono: 1 })], { bg: "#FFFFFF", bd: LSC.g, r: 5, px: 7, py: 4 })], { bg: LSC.newbg, bd: LSC.g, r: 7, px: 11, py: 8, f: 1, sp: 2 })
      ], { sp: 10, ai: "center" }));
    });
    if (isNew) {
      body.push(gt("工作表1 沒有這個 code。填好按「匯入工作表1」就新增（7 天內可復原）。", { z: 13, c: LSC.mute }));
      (d.v || []).forEach(function(x) {
        body.push(gh([gt(x[0], { z: 12, c: LSC.mute, w: 56 }), gx([gt(x[1] || (x[0] === "商品名" || x[0] === "中文名" ? "至少填一個" : "可空"), { z: 15, c: x[1] ? LSC.ink : "#9AA8A8" })], { f: 1, bg: "#FFFFFF", bd: LSC.edge, r: 6, px: 8, py: 6 })], { sp: 8, ai: "center" }));
      });
    }
    card.push(gx(body, { px: 15, py: 13, sp: 8 }));
    if (d.res) {
      card.push(gsep({ c: LSC.line }));
      card.push(gx([gt(d.res.t, { z: 13.5, b: 1, c: d.res.ok ? LSC.g : LSC.r })], { px: 15, py: 11 }));
    } else {
      card.push(gx([lstBtn(isNew ? "📥 匯入工作表1" : "✅ 寫進工作表1", "y"), gh([lstBtn(isNew ? "❌ 不需要" : "❌ 不要", "no", { f: 1 }), lstBtn("⏭ 跳過", "sk", { f: 1 })], { sp: 8 })], { px: 15, pb: 14, sp: 8 }));
    }
    return gx(card, { bg: "#FFFFFF", bd: LSC.line, r: 10, op: d.res ? 0.55 : undefined });
  }
  /* 審核頁（📋 待審清單）：o＝{ nl 待審幾筆、ni 待匯入分頁幾筆、f 選的篩選（0 全部、1 不一樣、2 表上沒有）、photo 那一張的標題（例：📷 第 1 張　09/15 10:12）、items 要畫的卡、alt } */
  function lstPage(o) {
    var kids = [
      gt("📋 清單校對", { z: 20, b: 1, c: LSC.ink }),
      gt("多張一起上傳、一起辨識，下面直接審。按「寫進工作表1」「匯入工作表1」才寫入，7 天內打「復原」可還原。待審 3 天後自動清掉。", { z: 13, c: LSC.mute, m: 2 }),
      gt("待審 **" + o.nl + "** 筆　待匯入分頁 **" + (o.ni || 0) + "** 筆", { z: 13, c: LSC.mute, rich: 1, m: 12 }),
      gh(["全部", "🟡 不一樣", "🔵 表上沒有", "✍️ 手寫改的"].map(function(t, i) { return lstChip(t, i === (o.f || 0)); }), { sp: 6, m: 8 }),
      gt(o.photo, { z: 15, c: LSC.ink2, m: 14 })
    ];
    o.items.forEach(function(d, i) { kids.push(gmix(lstItem(d), { m: i === 0 ? 6 : 12 })); });
    kids.push(gx([gh([lstBtn("✅ 全部寫進（" + o.items.filter(function(d) { return !d.res; }).length + "）", "y", { f: 2 }), lstBtn("🗑 全部刪除", "no", { f: 1 })], { sp: 8 })], { m: 14 }));
    return gmix({ w: "wp", bar: LSC.url, bg: LSC.bg, pad: 14, kids: kids, alt: o.alt }, {});
  }
  /* 縮圖一格（lst.html 的 .th）：淺灰底、3:4、右上角圓形的 ✕（拿掉這一張）、左下角第幾張、右下角檔案大小 K；
     照片的地方畫成一張印出來的表格（淺色的線），因為真的是拿手機拍下來的那一張。i＝第幾張（從 0）、kb＝大小 */
  function lstThumb(i, kb) {
    var rows = [], k;
    for (k = 0; k < 9; k++) {
      rows.push(gh([gx([], { bg: k === 0 ? "#AEB9B9" : "#CDD4D4", py: 1.2, w: 14 + ((i * 3 + k * 2) % 6) }), gx([], { bg: k === 0 ? "#AEB9B9" : "#D5DADA", py: 1.2, f: 1 }), gx([], { bg: k === 0 ? "#AEB9B9" : "#CDD4D4", py: 1.2, w: 13 + ((i * 2 + k) % 5) })], { sp: 4 }));
    }
    return gx([
      gx(rows, { bg: "#F7F6F0", px: 8, pt: 22, pb: 26, sp: 6, f: 1 }),
      gx([gt("✕", { z: 13, c: "#FFFFFF", a: "center" })], { abs: { t: 3, r: 3 }, w: 22, ar: "1 / 1", r: 11, bg: "rgba(20,32,32,.72)", jc: "center", cls: "lx" }),
      gh([gt(String(i + 1), { z: 11, c: "#FFFFFF", mono: 1, f: 0 }), gt(kb + "K", { z: 11, c: "#FFFFFF", mono: 1, f: 0 })], { abs: { l: 0, r: 0, b: 0 }, bg: "rgba(20,32,32,.72)", px: 5, py: 3.6, jc: "space-between", sp: 4 })
    ], { pos: 1, ar: "3 / 4", bg: LSC.soft, bd: LSC.line, r: 7, f: 1 });
  }
  /* 多張上傳頁（lst.html 的「① 上傳照片」那一張白卡）：
     o.pick＝選好、還沒送出的照片，每一張的大小（K）[246, 231, …]，沒有就不畫縮圖；o.retry＝按鈕寫「🔁 重試這 N 張」（上次有失敗）；
     o.rows＝進度列 [[圖示, 檔名, 右邊那段字, "ok"｜"bad"｜""], …]（沒寫＝還沒按「開始辨識」）；o.pct＝進度條走到幾 %；o.end＝最後一行 [圖示, 字]。
     在跑的時候，縮圖和「開始辨識」都還在（按鍵不能按了，看起來一樣）；全部成功之後縮圖就清空，只剩進度列。 */
  function lstUpPage(o) {
    var pick = o.pick || [], n = pick.length, inner = [
      gt("① 上傳照片", { z: 12, c: LSC.mute, ls: 0.1, mono: 1 }),
      gx([gt("把照片拖進來，或按下面選檔", { z: 15, b: 1, c: LSC.mute, a: "center" }), gt("位置清單那種表格，一次可以選好幾張。一次拍一欄會更準。\n電腦上截圖後直接 Ctrl＋V 貼上也可以。", { z: 13.5, c: LSC.mute, a: "center" })], { bd: LSC.edge, bs: "dashed", r: 9, px: 14, py: 20, sp: 3, m: 7 }),
      gh(n ? [lstBtn("📷 選照片", "y", { f: 1 }), lstBtn("🗑 全部清掉", "sk", { f: 1 })] : [lstBtn("📷 選照片", "y", { f: 1 })], { sp: 8, m: 10 })
    ];
    if (n) {
      var cells = [], c;
      for (c = 0; c < Math.max(3, n); c++) cells.push(c < n ? lstThumb(c, pick[c]) : gx([], { f: 1 }));
      inner.push(gh(cells, { sp: 8, m: 11, ai: "flex-start" }));
      inner.push(gt(n + " 張，同時跑 3 張，大約要 " + Math.max(1, Math.ceil(n / 3 * 40 / 60)) + " 分鐘", { z: 13, c: LSC.mute, m: 3 }));
      inner.push(gh([lstBtn((o.retry ? "🔁 重試這 " : "🔍 開始辨識（") + n + (o.retry ? " 張" : " 張）"), "y", { f: 1 })], { m: 10 }));
    }
    if (o.rows) {
      inner.push(gx([gx([], { bg: LSC.g, wp: o.pct, py: 2 })], { bg: LSC.soft, r: 3, m: 12, pos: 1 }));
      o.rows.forEach(function(r, i) {
        inner.push(gh([gt(r[0], { z: 13, w: 19, a: "center" }), gt(r[1], { z: 13, c: LSC.ink2, nw: 1, f: 1 }), gt(r[2], { z: 12, c: r[3] === "ok" ? LSC.g : r[3] === "bad" ? LSC.r : LSC.mute, mono: 1, nw: 1, f: 0 })], { sp: 9, ai: "center", m: i === 0 ? 11 : 7 }));
      });
      if (o.end) inner.push(gh([gt(o.end[0], { z: 13, w: 19, a: "center" }), gt(o.end[1], { z: 13, c: LSC.ink2, f: 1 })], { sp: 9, ai: "center", m: 7 }));
    }
    var kids = [
      gt("📋 清單校對", { z: 20, b: 1, c: LSC.ink }),
      gt("多張一起上傳、一起辨識，下面直接審。按「寫進工作表1」「匯入工作表1」才寫入，7 天內打「復原」可還原。待審 3 天後自動清掉。", { z: 13, c: LSC.mute, m: 2 }),
      gx(inner, { bg: "#FFFFFF", bd: LSC.line, r: 10, px: 15, py: 14, m: 12 })
    ];
    return gmix({ w: "wp", bar: LSC.url, bg: LSC.bg, pad: 14, kids: kids, alt: o.alt }, {});
  }

  var TM = "上午 9:41";   /* 示範聊天室裡每一則的時間（編的） */
  var WARN = "⚠️ AI 可能讀錯，請核對 CODE 再拿藥";   /* 照片、手寫查藥：真的 LINE 回覆最前面那一句（見 02 的 PHOTO_AI_WARN） */
  var N1 = "改包裝通知，示範：這支藥換包裝了，瓶身標籤顏色不一樣";
  var N2 = "停止供貨，示範：預計下個月恢復供貨，這段時間先找替代藥";
  /* 藥品家族（紫色框）：cats＝每一類的標題和裡面的藥 */
  var FAM1 = { cats: [["💊 同成分不同劑量", ["90114"]], ["🏷 同成分同劑量", ["90115"]]] };
  var FAM2 = { cats: [["🔁 同成分不同劑型", ["90111", "90112"]]] };
  var SPOTS = ["K2", "B1", "棧一"];
  /* 列表卡：t 標題、s 小標、g 分組（n 組名、ic 圖示 t／w、rows 這組的藥；一列可以是 CODE 或 { c, n: 通知的字 }）、hide＝不寫位置、cut＝中間省略幾列、ft 最下面的字 */
  var L_K2 = { t: "K2", s: "這一格有 4 個品項", hide: 1, ft: "按任何一列 → 出完整卡片", g: [{ n: "", rows: ["90101", "90111", "90107", "90108"] }] };
  var L_B1 = [
    { t: "B1", s: "這一格有 14 個品項　·　第 1/2 頁", hide: 1, ft: "還有下一頁，往左滑 →", g: [{ n: "", rows: ["90103", "90116", "90117"], cut: 9 }] },
    { t: "B1", s: "這一格有 14 個品項　·　第 2/2 頁", hide: 1, ft: "按任何一列 → 出完整卡片", g: [{ n: "", rows: ["90118", "90119"] }] }
  ];
  var L_SAM = { t: "samplexin", s: "院內 3 個品項", ft: "按任何一列 → 出完整卡片", g: [{ n: "", rows: ["90102", "90111", "90112"] }] };
  var L_COUGH = { t: "咳嗽", s: "院內 3 個品項", ft: "按任何一列 → 出完整卡片", g: [{ n: "SAMPLEXIN", rows: ["90102"] }, { n: "COUGHLESS", rows: ["90109"] }, { n: "BREATHEZ", rows: ["90110"] }] };
  var L_NOTICE = [
    { t: "📢 藥品通知　停止供貨", s: "2 個品項有通知", ft: "往左滑看下一類 →", g: [{ n: "", rows: [{ c: "90106", n: "示範：預計下個月恢復供貨" }, { c: "90108", n: "示範：這個月底停止供貨" }] }] },
    { t: "📢 藥品通知　改包裝通知", s: "1 個品項有通知", ft: "按任何一列 → 出完整卡片", g: [{ n: "", rows: [{ c: "90101", n: "示範：瓶身標籤顏色不一樣" }] }] }
  ];
  var C1 = dc("90101");
  /* ───────── 開發者教學的課程內容（第 16 批）─────────
     接在 DR（編的藥）和所有畫面零件的後面，換掉藥師版的 CH 和 LESSONS。
     每一則「機器人回的字」都照 LINE 上真的那一句寫（出處：06_行動指令.gs 的新藥格子和 ✏️ 修改、08_匯入.gs 的匯入和維護指令、09_網頁版.gs 的開發者網頁），
     只有「藥名、CODE、位置、批次號」這幾個會變的地方換成編的；tools/learn_dev_page_test.js 會把每一則字拿去對 .gs 原始檔，對不上就不過。
     qr(…)＝這一則訊息下面，輸入框上面會出現的小按鈕（照真的有哪幾顆寫）。 */
  var CH = [{ n: "改資料" }, { n: "日常維護" }, { n: "進階與網頁" }];
  function qr(items, cap) { return { w: "qr", items: items, cap: cap || "" }; }
  /* 釘住的那排按鈕：訊息自己沒有小按鈕時，接在最後一則下面（開發者多一顆「🔧 開發者」） */
  var BAR = ["🌐 網頁", "📖 教學", "📢 藥品通知", "🛠 BUG", "🔧 開發者"];
  /* 改完一格／存檔之後，最後一則下面：「↩️ 復原 CODE」排在最前面，後面接釘住的那排（多行的欄位再多一顆「↵ 再加一句」排最前面） */
  function undoQ(code, multi) { return qr((multi ? ["↵ 再加一句"] : []).concat(["↩️ 復原 " + code], BAR), "輸入框上面會出現（第一顆可以復原）"); }
  /* 新藥格子：小按鈕＝黃色那一格的常用選項（位置：常用位置；劑型：9 種），可以跳過的多一顆「跳過」，最後一定有「取消」 */
  var LOCQ = ["K2", "K3", "B1", "A3", "C3", "D1", "D4", "水棧一", "水棧二"];
  var FORMQ = ["錠劑", "膠囊", "口服液", "注射劑", "藥膏", "眼藥水", "栓劑", "貼片", "粉劑"];
  var WKEYS = ["code", "brand", "loc", "form", "zh", "gen", "note", "feat"];
  var WVALS = ["90120", "NEWTESTIN* 10MG TAB", "K2", "錠劑", "新測寧錠 10 毫克", "", "高血壓", ""];
  /* wz(n)＝前 n 格已經答過的狀態（學名、特徵是「跳過」＝空字串） */
  function wz(n) { var o = {}, i; for (i = 0; i < n; i++) o[WKEYS[i]] = WVALS[i]; return o; }
  function wq(cur) {
    var q = [];
    if (cur === "loc") q = LOCQ.slice();
    else if (cur === "form") q = FORMQ.slice();
    else if (cur === "gen" || cur === "note" || cur === "feat") q = ["跳過"];
    return qr(q.concat(["取消"]));
  }
  /* 一張新藥格子＋它下面的小按鈕：n＝已經答過幾格（黃色是下一格），或給 d＋cur */
  function wizMsgs(n) { var cur = WKEYS[n] || ""; return [wizCard(wz(n), cur), wq(cur)]; }
  function DEVTRY(text, hint) { return { kind: "text", text: text, p: "回 LINE，打「" + text + "」看看。", label: "在 LINE 試試看", hint: hint }; }
  /* ───── 第 3 課（批次匯入）用的：同一批貼上去的 5 列，總覽卡和三張逐筆確認卡 ───── */
  var IMPADD = ["對", "改 商品名", "改 中文名", "改 位置", "改 劑型", "改 學名", "改 參考網站", "跳過", "先停"];
  function impQ(kind) { return qr(kind === "add" ? IMPADD : ["對", "改 位置", "跳過", "先停"]); }
  function IMPOV() {
    return impOverview({ b: "0915-2", total: 5, add: 2, upd: 1, nc: 1, pb: 1, map: "CODE ← A 欄　中文名 ← E 欄　商品名 ← B 欄　位置 ← C 欄　劑型 ← D 欄", warns: ["第 5 列　CODE「12A45」不是 4～6 位數字"], count: 3 });
  }
  /* 第 1 筆＝新增 90130（loc 不給＝原本的樣子：位置 k2 被整理成 K2；給了＝用「改 位置」改過之後） */
  function IMPR1(loc) {
    return impRow({ i: 1, total: 3, add: 1, code: "90130", title: "NEWTESTIN* 20MG TAB", kv: [["商品名", "", "NEWTESTIN* 20MG TAB"], ["中文名", "", "新測寧錠 20 毫克"], loc ? ["位置", "", loc] : ["位置", "k2", "K2"], ["劑型", "F.C. TAB", "錠劑"]], warns: ["劑型「F.C. TAB」是自動對成「錠劑」的"] });
  }
  function IMPR2() {
    return impRow({ i: 2, total: 3, add: 1, code: "90131", title: "DEMOLIDE* 5MG TAB", kv: [["商品名", "", "DEMOLIDE* 5MG TAB"], ["中文名", "", "示範利得錠 5 毫克"], ["位置", "", "B1"], ["劑型", "", "錠劑"]], warns: ["商品名和中文名擠在同一格，我拆成兩格，請看對不對"] });
  }
  function IMPR3() {
    return impRow({ i: 3, total: 3, add: 0, code: "90101", title: "TESTOLOL* 25MG TAB", cur: "TESTOLOL* 25MG TAB　K2　錠劑", kv: [["位置", "K2", "K3"]], warns: [] });
  }
  var IMPTAIL = "　快取已更新，藥師現在查就是新資料。\n\n紀錄在「匯入紀錄」；7 天內打「復原」可以整批或單筆還原。";
  /* ───── 第 4 課（日常維護）用的 ───── */
  var VERV = "v11.22.2 beta";
  var VERTXT = "LINE 四個檔：全部 " + VERV + " ✅\n　01_藥師端_查詢.gs　" + VERV + "\n　02_藥師端_照片語音.gs　" + VERV + "\n　03_開發端_資料與指令.gs　" + VERV + "\n　04_開發端_維護工具.gs　" + VERV + "\n網頁專案：全部 " + VERV + " ✅\n　01_網頁_資料與查詢.gs　" + VERV + "\n　02_網頁_照片語音與修改.gs　" + VERV + "\nGitHub 網頁：" + VERV + " ✅（網頁打得開、版本對）";
  var CHKQ = ["📦 版本更新＋清快取", "🩺 開始體檢", "🚪 退出"];
  var SPDQ = ["⌨️ 文字速度", "📷 照片速度", "🎤 語音速度", "🔬 速度 詳細", "🚪 退出"];
  /* 開發者指令的回覆（程式裡的 _devReply_）最後多兩行：空一行，再一行「⏱ 這一句花了幾秒（＋程式外幾秒）」——
     程式外＝LINE 送出到程式開始的空檔（Google 冷啟動、排隊）。a＝這一句花的秒數，b＝程式外 */
  function tl(a, b) { return "\n\n⏱ " + a + " 秒（＋程式外 " + b + " 秒）"; }
  /* ───── 第 5 課（進階指令）用的 ───── */
  /* 「👥 開發者」那一排的三顆；devgQ(skip)＝這一則是哪一個，那一顆就不放，最後固定是「🚪 退出」 */
  var DEVG3 = ["➕ 邀請開發者", "👥 開發者名單", "➖ 開發者移除"];
  function devgQ(skip) { return qr(DEVG3.filter(function(x) { return !skip || x.indexOf(skip) < 0; }).concat(["🚪 退出"])); }
  var DEVGMENU = "👥 開發者　要做哪一個？\n・➕ 邀請開發者：給一組 6 位數邀請碼（10 分鐘內有效、只能用一次）\n・👥 開發者名單：現在有誰、最近的異動\n・➖ 開發者移除：從名單挑一位移除（會先問一次）";
  var DEVLIST_TAIL = "\n\n移除：按「➖ 開發者移除」（或打「開發者 移除 2」，用上面的編號）\n邀請：按「➕ 邀請開發者」";
  var DEVLIST2 = "👥 開發者名單（2 位）\n\n1. 示範甲（您）\n　　（在編輯器加的，沒有紀錄）\n2. 示範乙\n　　09/15 10:20 加入・由 示範甲 邀請\n\n最近的異動：\n　09/15 10:20　加入　示範乙" + DEVLIST_TAIL;
  var DEVLIST1 = "👥 開發者名單（1 位）\n\n1. 示範甲（您）\n　　（在編輯器加的，沒有紀錄）\n\n最近的異動：\n　09/15 10:31　移除　示範乙\n　09/15 10:20　加入　示範乙" + DEVLIST_TAIL;
  var MAPASK = "🗺 90101 的平面圖\n\n現在：自動判斷（跟著小藥庫位置走）\n\n・「棧左」「棧中」「棧右」＝直接指定棧板哪一塊（按一下就好）\n・「平」＝其他櫃位，我再問您哪一櫃\n・「沒平」＝公藥那種，沒有平面圖\n・「自動」＝取消設定，跟著小藥庫位置自己判斷\n\n★ 設完**全院立刻生效**，藥師馬上看得到。";
  var MAPQ = ["棧左", "棧中", "棧右", "平", "沒平", "自動", "取消"];
  /* ───── 第 4 課（清單校對）用的 ───── */
  /* 您傳的「印出來的清單」照片：一張紙，上面一行一個品項（跟手寫紙條同一種畫法，只是說明文字寫「印出來的清單」） */
  function prn(lines) { return { w: "me", note: lines, what: "印出來的清單" }; }
  var LSTQ = ["📤 多張上傳", "📋 待審清單", "💾 保留清單", "🗑 不保留清單", "🚪 退出"];
  /* 打「清單校對」回的那一則（08_匯入.gs：打 清單校對 那一段）；n＝目前待審幾筆 */
  function LSTMENU(n) {
    return "📋 清單校對：兩種都可以 ——\n\n📤 多張上傳（建議）：按下面的按鍵開網頁，一次選好幾張一起送，跑完直接在同一頁審。\n📷 一張一張：直接在這裡傳照片（位置清單那種表格），我會累積。\n\n每張我會用 code 逐列對工作表1，回「讀到幾筆／一樣幾筆／不一樣幾筆」，\n然後按「待審網站」在網頁上一筆一筆按「寫進工作表1」。\n\n・整張兩欄也讀得出來，但一次拍一欄會更準\n・紅筆手改的會標出來（劃掉的算舊的）\n・「表上沒有」的可以直接按「匯入工作表1」新增\n・寫進去的都記在「匯入紀錄」，7 天內打「復原」可還原\n\n" + (n ? "目前待審 " + n + " 筆（3 天後自動清掉）。\n" : "目前沒有待審。\n") + "★ 這 30 分鐘內您傳的照片一律走校對，就算 OCR辨識 開著也不會出卡片（v10.22.1 修）。\n\n🔒 下面兩個網頁按鍵用的是你的開發者連結：只在綁定過的地方打得開（最多 3 處）。新的地方打開後，打「開發者網頁 綁定」拿 6 位數碼輸入。" + tl("0.8", "0.2");
  }
  var LSTSAME_TAIL = "\n\n待審總共 3 筆（3 天後自動清掉）。可以再傳下一張累積，或按「📋 待審清單」一筆一筆審。\n★ 一次要傳好幾張的話，按「📤 多張上傳」在網頁上一起送比較快。";
  var LSTONE = "📋 清單校對　這一張\n讀到 12 筆　一樣 9　不一樣 2　表上沒有 1\n4.8 秒　照片 312 KB　AI 1 趟\n\n這一張的差異（前 3 筆）：\n🟡 90101　位置：K2 → K3　✍️\n🟡 90105　商品名：TESTONIN* 100MG CAP → TESTONIN* 50MG CAP\n🔵 90131　表上沒有（EXAMPLEX* 10MG TAB／B1）" + LSTSAME_TAIL;
  var LSTSHIFT = "📋 清單校對　這一張\n讀到 12 筆　一樣 3　不一樣 0　表上沒有 0\n5.1 秒　照片 298 KB　AI 1 趟\n\n🚫 這張整批擋下來了，一筆都沒進待審。\n對到 12 列，其中 9 列位置不一樣（超過一半）——\n這通常不是資料真的變了，是**紙彎了或斜了，位置那一欄整批對錯行**。\n請把紙壓平、正面拍，或一次只拍一欄，再傳一次。\n\n待審總共 0 筆（3 天後自動清掉）。可以再傳下一張累積，或按「📋 待審清單」一筆一筆審。\n★ 一次要傳好幾張的話，按「📤 多張上傳」在網頁上一起送比較快。";
  var LSTPAPER = ["K3　90101", "C3　90105", "B1　90131", "⋮"];
  /* 審核頁的三張卡（_lst_page.html）：位置改了（手寫）、商品名改了、表上沒有 */
  var LSTD1 = { code: "90101", nm: "TESTOLOL* 25MG TAB", hand: 1, chg: [["位置", "K2", "K3"]] };
  var LSTD2 = { code: "90105", nm: "TESTONIN* 100MG CAP", chg: [["商品名", "TESTONIN* 100MG CAP", "TESTONIN* 50MG CAP"]] };
  var LSTD3 = { code: "90131", nm: "EXAMPLEX* 10MG TAB", isNew: 1, v: [["商品名", "EXAMPLEX* 10MG TAB"], ["位置", "B1"], ["劑型", ""], ["中文名", ""], ["學名", ""]] };
  /* ───── 第 7 課（開發者網頁）用的 ───── */
  var CFGTXT = "📄 只做一次：讓「直接打網址」也能用代號登入\n\n1. 開 GitHub 放網頁的那個專案 → Add file → Create new file\n2. 檔名打 cfg.js\n3. 內容貼下一則訊息那一行（整行複製）\n4. Commit changes\n5. 等 1～10 分鐘，回 LINE 打「健檢」（或「版本更新」）：「GitHub 網頁」那一行後面會多一句「cfg.js ✅（後端代號 demo01）」。沒出現的話，檢查檔名是不是剛好 cfg.js、有沒有跟 index.html 放在同一層（不能放進資料夾裡）\n\n這一行只寫「後端在哪」，不是鑰匙：沒有 LINE 給的驗證碼進不去。\n⚠️ 但 GitHub 上的檔案是公開的，等於把後端網址公開了：陌生人拿它看不到任何藥品資料，也拿不到驗證碼（沒有人在 LINE 打他的代號），只能不斷向後端「拿代號」，把額度（10 分鐘 30 次）用光，讓這條路暫時說「忙線」（LINE 的連結、已經登入的瀏覽器不受影響）。有人這樣做你會收到警示信；想先關掉就在 LINE 打「驗證碼登入 關」。\n不想公開就不要放：沒有 cfg.js 的話，每台瀏覽器第一次要先從 LINE 的「🌐 補藥神器網頁」按鈕開一次，之後這台直接打網址就會出現代號。\n（後端代號 demo01）";
  var CFGLINE = "window.BUYAO_X=\"AKfycbxDEMODEMODEMODEMODEMODEMODEMODEMODEMOdemo01\";";
  var CODEOFF = "⏸ 「驗證碼登入」已關閉（全院，立刻生效）：\n・網頁拿不到代號，LINE 打代號也不會發驗證碼（都會說「暫停了」）。\n・已經發出去、還沒用掉的驗證碼，網頁也兌換不了。\n・LINE 連結（🌐 補藥神器網頁）和已經登入的瀏覽器不受影響。\n\n打「驗證碼登入 開」恢復。";
  var PARTS = {
    code: { n: "CODE", t: "卡片最上面的大數字。打它查得最準，不會抓到別支藥；紙條上有寫 CODE 就直接打，一個字都不用多打。" },
    brand: { n: "商品名", t: "大數字下面第一行，是藥盒上印的英文名。打前面幾個字就查得到。" },
    zh: { n: "中文名", t: "商品名下面那一行（綠色）。想不起英文名的時候，打中文名一樣查得到。" },
    icon: { n: "圖示", t: "右上角的小圖示：藥丸＝錠劑類、水滴＝水劑類，一眼看出是吃的還是喝的。部分藥的圖示點一下會開院內的藥品網頁（有設定的才有）。" },
    gen: { n: "學名", t: "灰色小字是成分。同成分不同廠牌、不同劑量，打學名就找得到；想不起商品名的時候，用成分找最快。" },
    feat: { n: "藥品特徵", t: "藍色那一塊是外觀特徵（顏色、形狀、刻字）。拿藥前對一下，最不會拿錯。有填才會出現；水劑類的特徵會放在照片的上面。" },
    ind: { n: "適應症", t: "灰底框裡左邊是適應症，也就是這支藥是治什麼的。有填才會出現。" },
    photo: { n: "藥品照片", t: "灰底框裡右邊的小圖是藥品照片，點一下看大圖。拿藥前對一下顏色、字樣；照片不對請按「🛠 BUG」。" },
    loc: { n: "位置", t: "粉紅色的框是「去哪裡拿」。也可以直接打位置（例如「K2」），那一格的藥會整批列出來。一支藥放在好幾個地方的時候，這裡會變成幾顆按鍵（下一課最後一段）。" },
    map: { n: "平面圖", t: "位置右邊的小圖是那一區的平面圖，紅框就是這支藥放的那一格。點一下會再傳一張大圖。有平面圖的位置才會出現；怎麼看，下一課有詳細說明。" },
    fam: { n: "藥品家族", t: "紫色的框是「藥品家族」：院內同成分的其他藥（換劑量、換劑型、換廠牌）。平常收起來，一類一行；按「▸ 打開」會再傳一張卡片，家族全部攤開（第 8 課）。有同成分的藥才會出現。" }
  };
  var PLANP = {
    hit: { n: "紅框", t: "紅框是這支藥放的那一格。看圖的時候，先找紅框；其他的方塊都只是幫你認路的地標。" },
    b: { n: "藍色方塊", t: "藍色方塊是棧板（圖上寫「棧」）：放在地上的一塊一塊。看紅框在哪一塊旁邊，就知道要往哪裡找。" },
    bar: { n: "灰色長條", t: "灰色長條是一整排的區域，上面寫 L 2、L 3 這種字，也是很好用的地標。**L 3** 是第三線（奇數線）、**L 2** 是第二線（偶數線）、**L 1** 是第一線（兒線）。" },
    door: { n: "大門", t: "圖上寫著「大門」和一個箭頭，指的就是**大門處或是出入口**在這張圖的哪一邊。下一段教你用它來對方向。" }
  };
  /* 「大門處或是出入口在你哪一邊」：它在你的前面、右手邊、後面、左手邊時，這張示範圖（圖上的「大門」在左邊）要怎麼轉、轉好後紅框在哪一側。
     deg＝順時針轉幾度；tn＝怎麼講；d＝大門處或是出入口在藥局的哪一邊（f 前、r 右、b 後、l 左）；red＝轉好後紅框在圖的哪一邊（也是藥局的哪一側） */
  var TURNS = [
    { d: "l", l: "左手邊", deg: 0, tn: "不用轉", red: "f", say: "大門處或是出入口在你**左手邊** → 這張圖的「大門」本來就在左邊，**不用轉**。**紅框在圖的上面**，就是藥局**前面**那一側。" },
    { d: "f", l: "前面", deg: 90, tn: "往右轉一格（90 度）", red: "r", say: "大門處或是出入口在你**前面** → 把圖**往右轉一格**（90 度），讓圖上的「大門」跑到上面。轉好後，**紅框在圖的右邊**，就是藥局**右手邊**那一側。" },
    { d: "r", l: "右手邊", deg: 180, tn: "轉半圈（180 度）", red: "b", say: "大門處或是出入口在你**右手邊** → 把圖**轉半圈**（180 度），讓圖上的「大門」跑到右邊。轉好後，**紅框在圖的下面**，就是藥局**後面**那一側。" },
    { d: "b", l: "後面", deg: 270, tn: "往左轉一格（90 度）", red: "l", say: "大門處或是出入口在你**後面** → 把圖**往左轉一格**（90 度），讓圖上的「大門」跑到下面。轉好後，**紅框在圖的左邊**，就是藥局**左手邊**那一側。" }
  ];
  var QCHIPS = [
    { k: "web", t: "🌐 網頁", n: "**🌐 網頁**：直接開補藥神器網頁版（不是幫你打字）。" },
    { k: "guide", t: "📖 教學", n: "**📖 教學**：幫你打「教學」，就是回到這一份教學。" },
    { k: "notice", t: "📢 藥品通知", n: "**📢 藥品通知**：幫你打「公告」，一次看完停止供貨、改包裝、缺貨的通知。" },
    { k: "bug", t: "🛠 BUG", n: "**🛠 BUG**：幫你打「bug」；再照提示，連「bug」一起打、後面寫一句話回報問題。" }
  ];

  var LESSONS = [
    { id: "devadd", ch: 0, name: "新增一支藥", secs: [
      { t: "打「新藥」，出現一張格子", p: "新增藥品只有開發者能用。打「新藥」（打「新增藥品」「加藥」「建藥」「新增」也可以），機器人會送出一張有 **8 格**的卡片，**黃色**的是現在要填的那一格。藥師打同樣的字，會被擋下來。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "開發者打「新藥」", m: [me("新藥")].concat(wizMsgs(0)),
            n: "一開始 8 格都是空的，**CODE 那一格是黃色**，旁邊寫著例子。輸入框上面只有「取消」。**直接打 CODE 送出**就好，不用先打「CODE」兩個字。" },
          { l: "藥師打「新藥」", m: [me("新藥"), bot("新增藥品只有開發者能用 🔒\n有新藥要建的話，把 CODE 和藥名傳給開發者就好。")],
            n: "不是開發者的人打，只會看到這一句，什麼都不會寫。" }
        ] } },
      { t: "一格一格往下填", p: "打完一格，黃色就跳到下一個還沒填的格子。**位置**和**劑型**輸入框上面有小按鈕，點一下就填好；**學名、適應症、特徵**可以按「跳過」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "填 CODE", m: wizMsgs(0).concat([act("⌨️ 打「90120」送出"), me("90120")], wizMsgs(1)),
            n: "CODE 送出，**黃色就跳到商品名**；最上面那一行也多了這支藥的 CODE。商品名、中文名沒有小按鈕，直接打。" },
          { l: "填位置", m: wizMsgs(2).concat([act("👆 點「K2」"), me("K2")], wizMsgs(3)),
            n: "位置的小按鈕是**院內最常用的位置**，沒有要的就自己打（例：K9、棧板A區）。填好之後，黃色跳到劑型。" },
          { l: "填劑型", m: wizMsgs(3).concat([act("👆 點「錠劑」"), me("錠劑")], wizMsgs(4)),
            n: "劑型有 9 個選項，點一下最快。" },
          { l: "跳過", m: wizMsgs(5).concat([act("👆 點「跳過」"), me("跳過")], wizMsgs(6)),
            n: "**學名、適應症、特徵**可以跳過，跳過的那一格會寫「（不填）」。CODE、商品名、位置、劑型、中文名是**必填**，不能跳過。" }
        ] } },
      { t: "點一格改，或一次貼好幾行", p: "每一格都可以點：手機的輸入框會先填好「欄位名＋現在的內容」，改完送出就好。也可以不點，直接打「位置 K9」，或**一次貼好幾行**，每行一個欄位。欄位名可以打：CODE、商品名、位置、劑型、中文名、學名、適應症、特徵（「中文」「成分」「藥位」這些別名也認得）。",
        d: { k: "chat", ttl: "選一種打法", list: true, ch: [
          { l: "點一格（例：位置）", m: wizMsgs(6).concat([act("👆 點「位置」那一格（手機的輸入框先填好「位置 K2」）"), wizCard(wz(6), "loc"), wq("loc")]),
            n: "點了之後，**黃色換到那一格**，輸入框上面出現那一格的小按鈕。電腦版 LINE 不會自動填輸入框，點了之後直接打新的內容就好。" },
          { l: "直接打「位置 K9」", m: [act("（位置原本是 K2，其他格都填好了）"), me("位置 K9"), wizCard(gmix(wz(6), { loc: "K9" }), "note"), wq("note")],
            n: "不用點，直接打「欄位名 內容」，就改那一格；改完黃色回到第一個還沒填的格子。" },
          { l: "一次貼好幾行", m: [act("（CODE 已經填好了）"), me("商品名 NEWTESTIN* 10MG TAB\n位置 K2\n劑型 錠劑\n中文名 新測寧錠 10 毫克")].concat(wizMsgs(5)),
            n: "每一行都是「欄位名 內容」，**一次填好幾格**。從試算表、紙條抄來的資料，這樣貼最快。" }
        ] } },
      { t: "預覽，「✅ 存檔」才寫入", p: "必填的格子都填好，下面的綠色鍵「👀 預覽、存檔」才會亮；沒填完只會顯示「還差 N 格必填」。按預覽會先給你看**存進去之後的藥品卡片**，下面有三顆小按鈕：**「✅ 存檔」才真的寫**，「✏️ 回格子」回去改，「取消」整筆不寫。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "預覽", m: wizMsgs(7).concat([act("👆 按「👀 預覽、存檔」"), me("👀 預覽、存檔"), dc("90120"),
              bot("☝️ 存進去之後長這樣。\n\n沒問題的話按「✅ 存檔」（或打「存檔」）。\n要改哪一項：按「✏️ 回格子」（或打「回格子」）點那一格，或直接打「位置 K9」這樣。"),
              qr(["✅ 存檔", "✏️ 回格子", "取消"])]),
            n: "預覽的卡片**沒有「✏️ 修改」**，因為還沒存。要改哪一項，按「✏️ 回格子」，或直接打「位置 K9」這樣。" },
          { l: "還沒填完就打「預覽」", m: [me("預覽"), bot("還有必填的沒填：位置、中文名"), wizCard({ code: "90120", brand: "NEWTESTIN* 10MG TAB", form: "錠劑" }, "loc"), wq("loc")],
            n: "必填還沒填完，機器人會說**差哪幾格**，再把格子給你。" },
          { l: "存檔", m: [act("👆 按「✅ 存檔」"),
              bot("✅ 已新增 90120　NEWTESTIN* 10MG TAB\n（適應症／特徵也一起寫進「工作表2」了）\n\n現在打「90120」就查得到了。"),
              dc("90120", { edit: 1 }), undoQ("90120")],
            n: "存檔之後，**馬上給你這支藥的卡片**（開發者的卡片最下面有「✏️ 修改」），輸入框上面第一顆是「↩️ 復原 90120」：建錯了，按它就把這一列清掉（第 2 課最後一段）。" }
        ] } },
      { t: "中途不做了，或打錯了", p: "填到一半不想做了，打「取消」（也可以打「不用了」「算了」「cancel」），**一個字都不會寫進去**。CODE 打得不像會被提醒；CODE 已經有了，會把那支藥的卡片給你看。**30 分鐘**沒有動作，這一筆就過期，要重打「新藥」。",
        d: { k: "chat", ttl: "選一種情況", list: true, ch: [
          { l: "取消", m: [act("👆 按卡片上的「✕ 取消」"), me("取消"), bot("好，取消了，一個字都沒寫進去 👍")],
            n: "取消就是取消，試算表**一個字都沒動**。" },
          { l: "CODE 打得不像", m: [me("ABC"), bot("「ABC」不太像 CODE 🤔\n院內的 CODE 通常是 4~6 位數字，例如 22975。\n再給我一次？（真的有非數字的 CODE，請直接在試算表上加）")].concat(wizMsgs(0)),
            n: "CODE 要有至少 3 個數字、不超過 10 個字。**真的有非數字的 CODE**，直接到試算表上加。" },
          { l: "CODE 已經有了", m: [me("90101"), bot("⚠️ CODE 90101 已經有了（工作表1 第 7 列），就是下面這張。\n・要改它的內容：點這張卡片的「✏️ 修改」（這一筆新增就取消）\n・要新增別支藥：改打別的 CODE（其他格都還在）"), dc("90101", { edit: 1 })].concat(wizMsgs(0)),
            n: "已經有的 CODE 不會被蓋掉：機器人把**現有的卡片**給你看。要改它，點卡片的「✏️ 修改」；要新增別支，改打別的 CODE，**其他格都還在**。" },
          { l: "必填不能跳過", m: [act("（CODE 已經填好了）"), me("跳過"), bot("「商品名」不能跳過 🙏\n商品名（英文）？\n　例：CURAM")].concat(wizMsgs(1)),
            n: "必填的格子打「跳過」會被擋下來，格子還在，繼續填就好。" },
          { l: "放太久（30 分鐘）", m: [act("⏰ 填到一半，離開超過 30 分鐘，回來按「✅ 存檔」"), bot("這一筆已經過期了 😥\n請重新打「新藥」開始。")],
            n: "過期的資料會自動清掉，重打「新藥」從頭來。" }
        ] } }
    ], tryp: DEVTRY("新藥", "會回到 LINE 聊天室，已經幫你填好「新藥」，按送出就會出現格子；不想建就按「取消」，什麼都不會寫進去。"),
    recap: ["**打「新藥」**出現 8 格的卡片：黃色是現在要填的那一格，**直接打字**就是填黃色那一格。", "**位置、劑型有小按鈕**，點一下就填好；學名、適應症、特徵可以**跳過**；想改哪一格就點那一格，或一次貼好幾行。", "必填填完按「👀 預覽、存檔」，看過卡片再按 **「✅ 存檔」才真的寫進試算表**；建錯了，存檔那一則下面有「↩️ 復原」。"],
    quiz: { q: "新藥填完、按了「👀 預覽、存檔」之後，資料什麼時候才真的寫進試算表？", h: "提示：預覽那一則下面有三顆小按鈕。", o: ["按「👀 預覽、存檔」的那一刻", "每填完一格就寫一格", "按預覽那一則的「✅ 存檔」之後", "過 30 分鐘自動寫入"], a: 2, why: "預覽只是給你看存進去之後長什麼樣子；按「✅ 存檔」（或打「存檔」）才會寫進試算表。填到一半取消、或放著超過 30 分鐘，都一個字也不會寫。" } },

    { id: "devedit", ch: 0, name: "改一格（✏️ 修改）", secs: [
      { t: "點卡片下面的「✏️ 修改」", p: "開發者查到藥，卡片最下面會多一顆淺綠色的「✏️ 修改」（藥師看不到）。按它，出現一張選單：**18 個欄位**，點你要改的那一格。不用打 CODE，也不用打欄位名。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "點「✏️ 修改」", m: [me("90101"), dc("90101", { edit: 1 }), act("👆 點卡片最下面的「✏️ 修改」"), editMenuCard("90101")],
            n: "選單最上面是這支藥的名字；**最上面那顆「📝 一次改多項」**留到最後一段講。要換照片、改平面圖、改縮寫，也都在這 18 顆裡。" },
          { l: "這支藥掛著公告", m: [act("👆 點 90106 那張卡片下面的「✏️ 修改」"), editMenuCard("90106", "停止供貨，示範：預計下個月恢復供貨，這段時間先找替代藥")],
            n: "有掛公告的藥，選單上會多一個黃色的「目前的公告」框，改之前先看一眼現在掛的是什麼。" }
        ] } },
      { t: "位置、劑型：點按鈕選", p: "多數欄位按下去就直接打新內容；**小藥庫位置**和**劑型**例外：機器人先告訴你「現在是什麼」，輸入框上面有常用的選項，點一個就改好了。位置一律存成**半形大寫**（打 k9 會變成 K9）。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "改位置", m: [act("👆 在選單點「小藥庫位置」"), bot("✏️ 90101　小藥庫位置\n\n現在是：K2\n\n請直接打新的內容送出就好。"), qr(LOCQ.concat(["🗑 清空這一欄", "取消"])), act("⌨️ 打「k9」送出"), me("k9"),
              bot("✅ 90101　小藥庫位置\n　改前：K2\n　改後：K9"), dc("90101", { edit: 1, over: { loc: "K9" } }), undoQ("90101")],
            n: "打小寫 k9 也行，會自動轉成 **K9**。改完**馬上給你新的卡片**，位置已經換了；輸入框上面第一顆是「↩️ 復原 90101」。" },
          { l: "不改了：取消", m: [act("👆 在選單點「劑型」"), bot("✏️ 90101　劑型\n\n現在是：錠劑\n\n請直接打新的內容送出就好。"), qr(FORMQ.concat(["🗑 清空這一欄", "取消"])), act("👆 點「取消」"), me("取消"), bot("好，取消了，一個字都沒動 👍")],
            n: "不想改了就按「取消」，**一個字都沒動**。" }
        ] } },
      { t: "其他欄位：改幾個字就好", p: "點商品名、中文、藥品特徵、學名…這些欄位，手機的輸入框會**先填好「欄位名＋現在的內容」**，游標在後面，改要改的幾個字送出就好；機器人同時回一則「現在是：…」。電腦版 LINE 不會自動填，就自己打新內容（不用打欄位名）。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "改中文名", m: [act("👆 點「中文」（輸入框先填好「中文 測試洛爾錠 25 毫克」）"), bot("✏️ 90101　中文\n\n現在是：測試洛爾錠 25 毫克\n\n請直接打新的內容送出就好。"), qr(["🗑 清空這一欄", "取消"]),
              act("⌨️ 把 25 改成 50 送出"), me("中文 測試洛爾錠 50 毫克"), bot("✅ 90101　中文\n　改前：測試洛爾錠 25 毫克\n　改後：測試洛爾錠 50 毫克"), dc("90101", { edit: 1, over: { z: "測試洛爾錠 50 毫克" } }), undoQ("90101")],
            n: "送出的字前面帶著「中文」也沒關係，機器人會自己拿掉，只留內容。" },
          { l: "藥品特徵（多行）", m: [act("👆 點「藥品特徵」"), bot("✏️ 90101　藥品特徵\n\n現在是：白色圓形錠，一面有刻痕\n\n請直接打新的內容送出就好。\n一句一行：打一句送出，再按「↵ 再加一句」接著打下一句；一次打好幾行也可以。"), qr(["↵ 再加一句", "🗑 清空這一欄", "取消"]),
              act("⌨️ 打新的特徵送出"), me("藥品特徵 白色圓形錠，一面有刻痕，另一面刻 25"), bot("✅ 90101　藥品特徵\n　改前：白色圓形錠，一面有刻痕\n　改後：白色圓形錠，一面有刻痕，另一面刻 25"), dc("90101", { edit: 1, over: { feat: "白色圓形錠，一面有刻痕，另一面刻 25" } }), undoQ("90101", 1)],
            n: "**學名、藥品特徵、適應症、公告補充、曾用藥品、注意**可以好幾行：改完輸入框上面多一顆「↵ 再加一句」，按了再打一句，會接在最後面新的一行。" },
          { l: "清空一欄", m: [act("👆 點「藥品特徵」，機器人回「現在是：…」"), act("⌨️ 打「清空」送出"), me("清空"), bot("✅ 90101　藥品特徵\n　改前：白色圓形錠，一面有刻痕\n　改後：（空）"), dc("90101", { edit: 1, over: { feat: "" } }), undoQ("90101", 1)],
            n: "打「清空」（或按「🗑 清空這一欄」）就把那一格清掉。**只送出欄位名、沒有內容**不會當成清空，機器人會先問一次。" }
        ] } },
      { t: "公告：按按鈕選 1～5", p: "點「公告類別」，機器人問要掛哪一種公告，輸入框上面有 5 種加「🗑 移除公告」。選完會再問要不要加一句補充說明（不用就按「取消（不加補充）」）。掛上之後，藥師查到這支藥，卡片名字下面就有黃色的提醒框。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "掛公告＋補充說明", m: [act("👆 在選單點「公告類別」"), bot("📢 90101 要掛哪一種公告？\n\n點下面的按鈕就好。\n（掛完會再問您要不要加一句補充說明）"), qr(["1 停止供貨", "2 改包裝通知", "3 製廠缺貨", "4 換廠", "5 給慢箋", "🗑 移除公告", "取消"]),
              act("👆 點「2 改包裝通知」"), me("2 改包裝通知"), bot("✅ 90101 已掛上「改包裝通知」\n\n要再加一句補充說明嗎？（例：新包裝 8/1 起）\n不用的話按「取消」，公告一樣掛好。"), qr(["取消（不加補充）", "🗑 清空補充"]),
              act("⌨️ 打補充說明送出"), me("新包裝 8/1 起"), bot("✅ 90101　公告補充說明\n　改前：（空）\n　改後：新包裝 8/1 起"), dc("90101", { edit: 1, note: "改包裝通知，新包裝 8/1 起" }), undoQ("90101", 1)],
            n: "掛好之後，卡片名字下面就有**黃色的提醒框**：「改包裝通知，新包裝 8/1 起」。" },
          { l: "只掛公告，不加補充", m: [act("（已經選了「2 改包裝通知」）"), bot("✅ 90101 已掛上「改包裝通知」\n\n要再加一句補充說明嗎？（例：新包裝 8/1 起）\n不用的話按「取消」，公告一樣掛好。"), qr(["取消（不加補充）", "🗑 清空補充"]), act("👆 點「取消（不加補充）」"), me("不用"), bot("✅ 90101　公告\n　改前：（無）\n　改後：2 改包裝通知"), dc("90101", { edit: 1, note: "改包裝通知" }), qr(BAR)],
            n: "不用補充說明，按「取消（不加補充）」，**公告一樣掛好**。這個情況下機器人**不會**再給「↩️ 復原」；掛錯了就再選一次公告類別，或用「移除公告」。" },
          { l: "移除公告", m: [act("👆 在選單點「公告類別」，輸入框上面出現 5 種公告"), act("👆 點「🗑 移除公告」"), me("移除"), bot("✅ 90101　公告\n　改前：2\n　改後：（已移除）"), dc("90101", { edit: 1 }), undoQ("90101")],
            n: "公告結束了，點「🗑 移除公告」，**黃色提醒框就不見了**（補充說明和公告照片也一起拿掉）。" }
        ] } },
      { t: "📝 一次改多項", p: "選單最上面那顆「📝 一次改多項」會送出一張 **A～J 十列**的卡片：每一列右邊有「改」，按它輸入框會先填好；改完那一列變**綠色**，寫著「✅ 已寫進去」和「原本：…」。也可以直接打字：「A 新名字」（A＝商品名、B＝中文、C＝位置…），或一次貼好幾行。**每改一格就已經寫進試算表**，不用最後再按存。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "打開卡片", m: [act("👆 在選單點「📝 一次改多項」"), mefCard("90101", { brand: "TESTOLOL* 25MG TAB", zh: "測試洛爾錠 25 毫克", loc: "K2", feat: "白色圓形錠，一面有刻痕", gen: "TESTOLOL HCL", pic: "已有照片", nk: "", nm: "", old: "", abbr: "" }, {})],
            n: "A～J 十列，每一列左邊是**代號**（A 商品名、B 中文、C 位置、D 藥品特徵、E 學名、F 藥品照片、G 公告類別、H 公告補充說明、I 曾用藥品、J 縮寫）。" },
          { l: "直接打好幾行", m: [act("（卡片開著的時候）"), me("B 測試洛爾錠 50 毫克\nC k9"),
              mefCard("90101", { brand: "TESTOLOL* 25MG TAB", zh: "測試洛爾錠 50 毫克", loc: "K9", feat: "白色圓形錠，一面有刻痕", gen: "TESTOLOL HCL", pic: "已有照片", nk: "", nm: "", old: "", abbr: "" }, { zh: "測試洛爾錠 25 毫克", loc: "K2" },
                "✅ 90101 寫好了（2 項）\n・中文：測試洛爾錠 25 毫克 → 測試洛爾錠 50 毫克\n・小藥庫位置：K2 → K9")],
            n: "打「代號 內容」，一次打好幾行都行。卡片上面會寫「寫好了（2 項）」和每一項的改前改後；改過的列變**綠色**，寫著「✅ 已寫進去」和「原本：…」。" },
          { l: "收工，看新卡片", m: [act("👆 按卡片最下面的「✅ 看新卡片」"), bot("✅ 90101 這一輪改了 2 項，都改好了。\n改錯了？按下面的「↩️ 復原 90101」（7 天內都可以）。"), dc("90101", { edit: 1, over: { z: "測試洛爾錠 50 毫克", loc: "K9" } }), undoQ("90101")],
            n: "這一輪改的**一次復原**：按「↩️ 復原 90101」就整輪改回去。" },
          { l: "公告（G 那一列）", m: [act("👆 按 G「公告類別」那一列的「改」"), nkCard("90101", "")],
            n: "公告類別是**五顆按鈕**，按一顆就生效；現在掛著的那顆是綠底。補充說明在卡片上另外改。" }
        ] } },
      { t: "改錯了：↩️ 復原", p: "改完那一則的下面，有一顆「↩️ 復原 90101」。按它會**先列出**要改回哪幾格，按「確定復原」才動。過了這一則也沒關係：打「復原」可以選最近改過的（**7 天內**）；打「復原 90101」只還原那一支藥。新藥存檔、匯入、網頁上改的，都能這樣復原。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "按「↩️ 復原 90101」", m: [act("👆 按輸入框上面的「↩️ 復原 90101」"), me("復原 #0915-104530123"),
              bot("↩️ 復原 批次 #0915-104530123：\n　會把 1 格改回舊值、清空 0 列（新增的那幾個品項）\n　90101　小藥庫位置：K9 → K2\n\n確定嗎？"), qr(["確定復原", "取消"]),
              act("👆 點「確定復原」"), me("確定復原 0915-104530123"), bot("↩️ 復原完成：改回 1 格、清空 0 列。\n快取已更新。")],
            n: "「確定復原」才真的動。**後來又被別人改過的格子不會動**，機器人會告訴你哪幾格沒動。" },
          { l: "打「復原」選一批", m: [me("復原"), bot("↩️ 最近改過的（點一個看要還原什麼）：\n　#0915-104530123　09/15 10:45:30　90101　1 筆（LINE ✏️）\n　#0914-3　09/14 16:20:05　90102、90103 等 7 支　12 筆（匯入）\n\n也可以打「復原 CODE」只還原某一支藥。"), qr(["復原 #0915-104530123", "復原 #0914-3"])],
            n: "最多列最近 **5 批**；點一個，看它要還原什麼，再按「確定復原」。批次號的 **0914-3** 是匯入（月日-第幾批），**0915-104530123** 是在 LINE 上改的（月日-時分秒）。" }
        ] } }
    ], tryp: { kind: "code", p: "回 LINE，查一支真的藥，再點卡片最下面的「✏️ 修改」看選單。", label: "在 LINE 查一支真的藥", hint: "會回到 LINE 聊天室（這裡不會先幫你填字）；自己打一支真的藥的 CODE 送出，就會出現卡片。只看選單、不點欄位，不會改到任何資料。" },
    recap: ["**查到藥 → 卡片最下面的「✏️ 修改」→ 點欄位 → 直接打新內容**，不用打 CODE，也不用打欄位名。", "**位置、劑型**用輸入框上面的按鈕選；**公告**按 1～5；其他欄位手機會先填好現在的內容，改幾個字就好。", "每次改完**馬上給新卡片**，輸入框上面有「↩️ 復原」；要改五六欄（換廠）走「📝 一次改多項」。"],
    quiz: { q: "改完一格，發現改錯了，最快怎麼還原？", h: "提示：改完那一則的下面有一顆小按鈕。", o: ["重新打一次舊的內容", "按改完那一則下面的「↩️ 復原 CODE」", "請藥師幫忙改回來", "刪掉那一列重建"], a: 1, why: "改完那一則下面有「↩️ 復原 CODE」，按了會先列出要改回哪幾格，按「確定復原」才動（7 天內都可以）。" } },

    { id: "devimp", ch: 0, name: "批次匯入（待匯入）", secs: [
      { t: "先貼到「待匯入」分頁", p: "要新增、要修改的藥很多支，不用一支一支打。用手機的 Google 試算表 App，打開最下面的**「待匯入」分頁**（沒有的話，打一次「匯入」就會幫你建好），把資料貼進去。**第一列寫欄位名稱最好**：CODE、商品名、位置、劑型、中文名、學名、參考網站、公告類別、公告補充，**順序隨意**，不一定每欄都要有；沒寫欄位名稱，機器人會看內容猜。**一批最多 300 列**。",
        d: { k: "sh", ttl: "試算表「待匯入」分頁", tabs: ["工作表1", "工作表2", "待匯入", "匯入紀錄"], tab: "待匯入",
          rows: [
            ["CODE", "商品名", "位置", "劑型", "中文名"],
            ["90130.0", "NEWTESTIN* 20MG TAB", "k2", "F.C. TAB", "新測寧錠 20 毫克"],
            ["90131", "DEMOLIDE* 5MG TAB 示範利得錠 5 毫克", "B1", "錠劑", ""],
            ["90101", "TESTOLOL* 25MG TAB", "K3", "", ""],
            ["12A45", "NEWSAMPLE* 5MG TAB", "K2", "錠劑", "新樣本錠 5 毫克"],
            ["90103", "MODELPRIL* 5MG TAB", "B1", "錠劑", ""]
          ],
          note: "例：從別的系統匯出的資料，CODE 後面多了「.0」、位置打小寫、劑型寫「F.C. TAB」、商品名和中文名擠在同一格，都沒關係，機器人會整理，整理過的地方會標給你看。" } },
      { t: "打「匯入」，先看總覽", p: "貼好之後，回 LINE 打「**匯入**」（打「開始匯入」也可以）。機器人先把整頁讀一遍，送出一張**匯入總覽**：新增幾筆、修改幾筆、沒變幾筆、有問題幾筆，和它怎麼對欄的。**這時候什麼都還沒寫進去**：按「開始逐筆確認」才開始，按「取消」就整批不寫。",
        d: { k: "chat", ttl: "選一種情況", ch: [
          { l: "「待匯入」有資料", m: [me("匯入"), IMPOV(), qr(["開始逐筆確認", "取消"])],
            n: "四格數字一眼看完：**新增 2、修改 1、沒變 1、有問題 1**。最後一行說「接下來 3 筆會一筆一筆給您看」，3 ＝ 新增＋修改。" },
          { l: "分頁是空的", m: [me("匯入"), bot("📥 「待匯入」分頁是空的。\n\n把要新增或修改的藥貼進去（欄位順序隨意，第一列可以是欄位名稱），再打「匯入」。\n已經幫您建好分頁了，打開試算表就看得到。")],
            n: "還沒有「待匯入」分頁也是這一句，而且**分頁已經幫你建好**了。" },
          { l: "對不出哪一欄", m: [me("匯入"), bot("📥 讀到了，但對不出哪一欄是什麼 😥\n\n請在「待匯入」第一列填欄位名稱，例如：\nCODE、商品名、位置、劑型、中文名、學名\n（順序隨意；公告類別、公告補充可有可無）\n\n填好再打「匯入」。什麼都還沒寫入。")],
            n: "沒有欄位名稱、內容又猜不出來的時候，會請你補上第一列。" },
          { l: "藥師打「匯入」", m: [me("匯入"), bot("這是開發者指令 🔒\n有資料要新增或修改，把 CODE 和內容傳給開發者就好。")],
            n: "藥師打開發者才有的字，只會看到這一句，什麼都不會動。" }
        ] } },
      { t: "紅底的列：留著，不會寫", p: "總覽卡出來的同時，機器人已經整理過「待匯入」：**跟工作表1 一模一樣的列（沒變）直接清掉**；**有問題的列塗成紅底**，留在原處，CODE 那一格的註解寫著原因。會被擋下來的有：CODE 不是 4～6 位數字或是空的、同一批 CODE 出現第 2 次、新藥但商品名和中文名都是空的、參考網站不像網址。把那一列改好，下次再打「匯入」就好。",
        d: { k: "sh", ttl: "打過「匯入」之後的「待匯入」", tabs: ["工作表1", "工作表2", "待匯入", "匯入紀錄"], tab: "待匯入",
          rows: [
            ["CODE", "商品名", "位置", "劑型", "中文名"],
            ["90130.0", "NEWTESTIN* 20MG TAB", "k2", "F.C. TAB", "新測寧錠 20 毫克"],
            ["90131", "DEMOLIDE* 5MG TAB 示範利得錠 5 毫克", "B1", "錠劑", ""],
            ["90101", "TESTOLOL* 25MG TAB", "K3", "", ""],
            ["12A45", "NEWSAMPLE* 5MG TAB", "K2", "錠劑", "新樣本錠 5 毫克"]
          ],
          bad: [4], nt: [[4, 0]],
          note: "「90103」跟工作表1 一模一樣，已經被清掉了；「12A45」不是 4～6 位數字，塗成紅底，CODE 那一格右上角的黑三角就是註解：CODE「12A45」不是 4～6 位數字。" } },
      { t: "一筆一筆看，按「對」才寫入", p: "按「開始逐筆確認」，機器人一次給你一張卡。**新增**的列出每一格要寫什麼；**修改**的只列要改的格，灰字是現在的、藍字是要改成的。**機器人整理過的地方用藍字標出來**，需要你看一下的地方用 ⚠️ 提醒。每張卡四個選擇：**「對」才寫入**、「改一格」、「跳過」（留在待匯入）、「先停」（其餘留在待匯入）。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "開始逐筆確認", m: [act("👆 按總覽卡上的「開始逐筆確認（第 1／3）」"), me("開始逐筆確認"), IMPR1(), impQ("add")],
            n: "第 1 筆是**新增**。位置 k2 被整理成 **K2**、劑型 F.C. TAB 被整理成 **錠劑**，灰字是你貼的、藍字是整理後的；劑型是猜的，所以多一行 ⚠️。輸入框上面是這一筆能做的事。" },
          { l: "按「對」", m: [act("👆 按「✅ 對，寫入」"), me("對"), bot("✅ 第 1／3 筆 新增 90130　NEWTESTIN* 20MG TAB　已寫入"), IMPR2(), impQ("add")],
            n: "按「對」才真的寫進工作表1，那一列也從「待匯入」拿掉；接著就是下一筆。第 2 筆的 ⚠️ 是商品名和中文名**擠在同一格被拆開**了，看一下拆得對不對。" },
          { l: "改一格", m: [act("（現在是第 1 筆，位置想改成 B1）"), act("👆 按「✏️ 改一格」"), me("改一格"), bot("要改哪一格？點下面的按鈕。"), qr(["改 商品名", "改 中文名", "改 位置", "改 劑型", "改 學名", "改 參考網站", "不改了"]),
              act("👆 點「改 位置」"), me("改 位置"), bot("✏️ 第 1 筆 90130　位置\n現在是：K2\n\n請直接打新的內容（打「清空」就清空）。"), qr(LOCQ.slice(0, 6).concat(["清空這一格", "不改了"])),
              act("⌨️ 打「B1」送出"), me("B1"), bot("已改 位置 → B1，請再看一次："), IMPR1("B1"), impQ("add")],
            n: "改完**馬上再給你看一次**這一張，這次位置是 B1，不再有灰字（你自己打的，就不算「整理過」）。劑型那行 ⚠️ 還在，因為還沒處理。" },
          { l: "跳過", m: [act("（現在是第 2 筆）"), act("👆 按「⏭ 跳過（留在待匯入）」"), me("跳過"), bot("⏭ 第 2 筆 90131 跳過，留在待匯入。"), IMPR3(), impQ("upd")],
            n: "跳過的那一列**原封不動留在「待匯入」**，下次打「匯入」會再出現。第 3 筆是**修改**：位置 K2 → K3，只列要改的那一格，所以輸入框上面也只有「改 位置」。" },
          { l: "先停", m: [act("（現在是第 3 筆；第 1 筆按了「對」、第 2 筆跳過）"), act("👆 按「⏹ 先停（其餘留在待匯入）」"), me("先停"),
              bot("⏹ 先停在第 3 筆。\n　寫入 1 筆（新增 1、修改 0，共 6 格）\n　跳過 1 筆（留在待匯入）：90131\n　還沒看的 1 筆留在待匯入，之後再打「匯入」接著。\n　沒變 1 筆（已從待匯入清掉）\n　有問題 1 筆（待匯入裡紅底，CODE格的註解有原因）\n" + IMPTAIL), qr(["查一下 90130", "復原這一批", "健檢"])],
            n: "先停就是「今天做到這裡」：寫了的算數，**沒看的、跳過的都還在待匯入**，之後再打「匯入」重新來一遍。" }
        ] } },
      { t: "做完那一則，改錯了可以復原", p: "最後一筆處理完，機器人回一則**完工報告**：寫了幾筆（新增幾、修改幾、共幾格）、跳過幾筆、有問題幾筆。寫進去的每一格都記在試算表的「**匯入紀錄**」分頁，**7 天內**可以整批或單筆還原。下面三顆小按鈕：「查一下 CODE」、「復原這一批」、「健檢」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "全部做完", m: [act("（現在是第 3 筆；第 1 筆按了「對」、第 2 筆跳過）"), act("👆 按「✅ 對，寫入」"), me("對"),
              bot("🏁 批次 #0915-2 完成。\n　寫入 2 筆（新增 1、修改 1，共 7 格）\n　跳過 1 筆（留在待匯入）：90131\n　沒變 1 筆（已從待匯入清掉）\n　有問題 1 筆（待匯入裡紅底，CODE格的註解有原因）\n" + IMPTAIL), qr(["查一下 90101", "復原這一批", "健檢"])],
            n: "最後一筆按「對」，機器人直接給完工報告（不再另外回「已寫入」）。快取馬上更新，**藥師下一句查就是新資料**。" },
          { l: "復原這一批", m: [act("👆 按「復原這一批」"), me("復原 #0915-2"), bot("↩️ 復原 批次 #0915-2：\n　會把 1 格改回舊值、清空 1 列（新增的那幾個品項）\n　90101　位置：K3 → K2\n　清空 90130\n\n確定嗎？"), qr(["確定復原", "取消"]), act("👆 點「確定復原」"), me("確定復原 0915-2"), bot("↩️ 復原完成：改回 1 格、清空 1 列。\n快取已更新。")],
            n: "「確定復原」才真的動。**新增的那支藥，整列清空**（不是刪列）；改過的格子，改回舊的值。後來又被別人改過的格子不會動。" }
        ] } }
    ], tryp: DEVTRY("匯入", "會回到 LINE 聊天室，已經幫你填好「匯入」，按送出。要是「待匯入」沒有資料，機器人只會告訴你分頁是空的；有資料的話，也要逐筆按「對」才會寫入，按「取消」整批都不寫（沒變的列會從待匯入清掉，有問題的列會塗紅底）。"),
    recap: ["**貼到「待匯入」分頁 → 打「匯入」**，先出總覽卡，這時候什麼都還沒寫。", "**沒變的列自動清掉，有問題的列塗紅底**，CODE 那一格的註解寫著原因，改好再匯入。", "**一筆一筆按「對」才寫入**；跳過、先停的都留在待匯入；做錯了 7 天內打「復原」。"],
    quiz: { q: "打「匯入」之後，看到匯入總覽那張卡，資料已經寫進工作表1 了嗎？", h: "提示：卡片上有一句「什麼都還沒寫」。", o: ["已經全部寫進去了", "只有「新增」的已經寫了", "按「取消」才會寫", "還沒，要一筆一筆按「對」才寫入"], a: 3, why: "總覽只是先讓你看數字；按「開始逐筆確認」之後，每一筆都要按「對」才寫入。按「取消」或「先停」，沒按「對」的就一個字都不會進工作表1。" } },

    { id: "devlist", ch: 0, name: "清單校對（拍位置清單）", secs: [
      { t: "📋 拍位置清單，只挑「不一樣」的", p: "院裡印出來的**藥品位置清單**（那種表格）換新版時，一支一支對工作表1 很累。**清單校對**：把清單拍下來（或截圖）傳給機器人，它用 **CODE 逐列去對工作表1**，**只把不一樣的挑出來**：位置變了、商品名變了、工作表1 沒有的新藥。你一筆一筆審，按「寫進工作表1」才會改，不用自己手打。打「**清單校對**」進入，或按 🔧 開發者 →「📋 清單校對」。",
        d: { k: "chat", ttl: "打「清單校對」", ch: [
          { l: "打「清單校對」", m: [me("清單校對"), bot(LSTMENU(0)), qr(LSTQ, "輸入框上面會出現這幾顆（前兩顆是開網頁）")],
            n: "進入之後的 **30 分鐘內**，你傳的照片**一律走校對**，就算「OCR接手」開著也不會出藥品卡片。前兩顆小按鈕是**開網頁**：用的是你的開發者連結，只在綁定過的地方打得開（還沒綁定，看「開發者網頁」那一課）。" }
        ] } },
      { t: "📷 一張一張傳：它回你「這一張」的結果", p: "直接在聊天室傳清單的照片，機器人讀完回一則：**讀到幾筆、一樣幾筆、不一樣幾筆、表上沒有幾筆**，再列出前 5 筆差異：**🟡** 是工作表1 有、但位置或商品名不一樣，**🔵** 是工作表1 沒有這個 CODE；後面的 ✍️ 是**清單上用紅筆手改的**。差異都先存進**待審清單**（3 天後自動清掉），可以接著傳下一張累積。**一次拍一欄，比整張兩欄準。**",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "一般的一張", m: [act("📷 傳一張清單的照片"), prn(LSTPAPER), bot(LSTONE), qr(LSTQ)],
            n: "「一樣」的不會列出來，只列有差的。這時候**還沒改到工作表1 的任何一格**；要改，按「📋 待審清單」到網頁上一筆一筆審。" },
          { l: "紙彎了，整批擋下", m: [act("📷 傳一張紙有點彎的清單照片"), prn(LSTPAPER), bot(LSTSHIFT), qr(LSTQ)],
            n: "對到的列裡，**超過一半位置都不一樣**，幾乎不是資料真的變了，而是**紙彎了或斜了，位置那一欄整批對錯行**。機器人整批擋下，**一筆都不放進待審**，免得你把一整頁錯的位置寫進去。把紙壓平、正面拍，或一次只拍一欄，再傳一次。" }
        ] } },
      { t: "📤 多張上傳：網頁上一次送好幾張", p: "清單有好幾頁，按「**📤 多張上傳**」（開網頁，要用綁定過的地方）：按「📷 選照片」一次選好幾張，或把圖**拖進來**，電腦上截圖後直接 **Ctrl＋V** 貼上也可以。選好會出現縮圖，按「🔍 開始辨識」，**最多同時辨識 3 張**；每一張跑完，旁邊會寫「讀到、不一樣、新、花了幾秒」。全部跑完，**直接在同一頁往下審**，不用回 LINE。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "選好 3 張", m: [act("📤 按「📤 多張上傳」，網頁打開，選好 3 張清單的照片"),
              lstUpPage({ pick: [246, 231, 318], alt: "網頁畫面（清單校對）：白色卡片「① 上傳照片」，一個虛線框寫著把照片拖進來或按下面選檔，下面兩顆鍵「📷 選照片」「🗑 全部清掉」，再下面是 3 張照片的縮圖（每張右上角有一顆圓形的叉叉、左下角是第幾張、右下角是檔案大小），縮圖下面一行小字「3 張，同時跑 3 張，大約要 1 分鐘」，最下面綠色的「🔍 開始辨識（3 張）」" })],
            n: "縮圖左下角是第幾張、右下角是檔案大小（K），右上角那顆圓形的叉叉可以把那一張拿掉；縮圖下面那行小字會算大約要跑多久，一次超過 12 張會提醒你分批（中途關掉頁面會停在一半）。**一次拍一欄會更準**，所以一頁分成左右兩張拍，比整頁拍一張好。" },
          { l: "辨識中", m: [act("🔍 按「開始辨識」"),
              lstUpPage({ pick: [246, 231, 318], pct: 67, rows: [["✅", "清單1.jpg", "讀到 12　不一樣 2　新 1　4.8s", "ok"], ["✅", "清單2.jpg", "讀到 14　不一樣 0　新 0　5.2s", "ok"], ["🔍", "清單3.jpg", "辨識中…", ""]], alt: "網頁畫面（清單校對）：縮圖和「🔍 開始辨識（3 張）」還在，下面多了一條進度條（走了三分之二）和三列進度：清單1.jpg「✅ 讀到 12　不一樣 2　新 1　4.8s」、清單2.jpg「✅ 讀到 14　不一樣 0　新 0　5.2s」、清單3.jpg「🔍 辨識中…」" })],
            n: "最多同時跑 3 張，所以 3 張會一起開始；先跑完的先打勾 ✅，還在跑的是 🔍「辨識中…」，超過 3 張時排在後面的是 ⏳「排隊中」。進度條是「跑完幾張 ÷ 總共幾張」。右邊那段字：**讀到 12** 是這一張讀到 12 列，**不一樣 2** 是其中 2 列跟工作表1 不一樣，**新 1** 是有 1 列工作表1 沒有，最後是花了幾秒。" },
          { l: "跑完了", m: [act("⏳ 等它全部跑完"),
              lstUpPage({ pct: 100, rows: [["✅", "清單1.jpg", "讀到 12　不一樣 2　新 1　4.8s", "ok"], ["✅", "清單2.jpg", "讀到 14　不一樣 0　新 0　5.2s", "ok"], ["✅", "清單3.jpg", "讀到 13　不一樣 1　新 0　4.6s", "ok"]], end: ["🎉", "全部 3 張都讀完了，往下審"], alt: "網頁畫面（清單校對）：縮圖清空了，只剩「📷 選照片」一顆鍵；進度條走滿，三張都打勾 ✅（清單1.jpg 讀到 12　不一樣 2　新 1，清單2.jpg 讀到 14　不一樣 0　新 0，清單3.jpg 讀到 13　不一樣 1　新 0），最後一行「🎉 全部 3 張都讀完了，往下審」" })],
            n: "全部讀完，縮圖就清空，只剩進度列和最後一行「🎉 全部 3 張都讀完了，往下審」。往下捲，辨識出來的差異就排在下面的待審清單裡；這時候**還沒有寫進工作表1**，要一筆一筆審。" },
          { l: "有一張失敗", m: [act("⚠️ 其中一張紙彎了，被擋下來"),
              lstUpPage({ pick: [231], retry: 1, pct: 100, rows: [["✅", "清單1.jpg", "讀到 12　不一樣 2　新 1　4.8s", "ok"], ["⚠️", "清單2.jpg", "整批對錯行了，紙壓平再拍一次", "bad"], ["✅", "清單3.jpg", "讀到 13　不一樣 1　新 0　4.6s", "ok"]], end: ["⚠️", "有 1 張沒成功，按上面「重試這 1 張」再送一次"], alt: "網頁畫面（清單校對）：縮圖只剩失敗的那一張，按鍵變成「🔁 重試這 1 張」；進度條走滿，清單1.jpg 和清單3.jpg 打勾 ✅，清單2.jpg 是 ⚠️ 紅字「整批對錯行了，紙壓平再拍一次」，最後一行「⚠️ 有 1 張沒成功，按上面「重試這 1 張」再送一次」" })],
            n: "失敗的那一張會留在縮圖裡，按鈕變成「🔁 重試這 1 張」，**只重傳這一張**，成功的不會重跑。失敗原因寫在那一列旁邊：這一張是**紙彎了**（超過一半位置都不一樣，整批擋下）；把紙壓平再拍，或一次只拍一欄，重試就好。" }
        ] } },
      { t: "📋 待審清單：一筆一筆審，按了才寫", p: "每一筆差異是一張卡：上面是 CODE、商品名和「**🟡 不一樣**」或「**🔵 表上沒有**」，中間左邊灰底是**工作表1 現在的值**，右邊綠框是**清單讀到的值（可以直接改）**。三顆鍵：**✅ 寫進工作表1**（寫入，這一格才真的改）、**❌ 不要**（這一筆丟掉）、**⏭ 跳過**（先放著，不寫也不丟，下次進來還在）。「🔵 表上沒有」的要先把商品名、位置這幾格填好，按「📥 匯入工作表1」才會新增一支藥。「待匯入」分頁還沒處理的資料也一起列在這裡。最下面「✅ 全部寫進」是一次全寫，要先確認一次。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "三筆待審", m: [act("📋 按「📋 待審清單」，網頁打開"),
              lstPage({ nl: 3, ni: 0, f: 0, photo: "📷 第 1 張　09/15 10:12", items: [LSTD1, LSTD2, LSTD3], alt: "網頁畫面（清單校對的待審清單）：上面「待審 3 筆　待匯入分頁 0 筆」和四個篩選（全部、🟡 不一樣、🔵 表上沒有、✍️ 手寫改的），下面三張卡：90101 位置 K2 改成 K3（手寫改的）、90105 商品名改了、90131 工作表1 沒有這支藥；每張下面有「✅ 寫進工作表1」「❌ 不要」「⏭ 跳過」，最底下「✅ 全部寫進（3）」「🗑 全部刪除」" })],
            n: "**先看有 ✍️ 的**：那是清單上紅筆手改的，表示有人剛改過位置，通常是對的。右邊綠框的值可以直接改，改完再按「✅ 寫進工作表1」。" },
          { l: "按「✅ 寫進工作表1」之後", m: [act("👆 按第一筆的「✅ 寫進工作表1」"),
              lstPage({ nl: 2, ni: 0, f: 0, photo: "📷 第 1 張　09/15 10:12", items: [gmix(gmix({}, LSTD1), { res: { t: "✅ 已寫入 1 格　打「復原」可還原", ok: 1 } }), LSTD2], alt: "網頁畫面（清單校對的待審清單）：第一張卡（90101）變淡，按鍵換成一行綠字「✅ 已寫入 1 格　打『復原』可還原」；第二張卡（90105）還在等" })],
            n: "寫進去的每一格都記在「**匯入紀錄**」，**7 天內打「復原」可以還原**。快取也會更新，藥師馬上查到新的位置。" },
          { l: "「表上沒有」的新藥", m: [act("👆 看第三筆（🔵 表上沒有）"),
              lstPage({ nl: 1, ni: 0, f: 2, photo: "📷 第 1 張　09/15 10:12", items: [LSTD3], alt: "網頁畫面（清單校對的待審清單）：只剩一張藍色「🔵 表上沒有」的卡：90131，下面有商品名、位置、劑型、中文名、學名五格可以填，按鍵是「📥 匯入工作表1」「❌ 不需要」「⏭ 跳過」" })],
            n: "商品名和中文名**至少填一個**才能匯入。填完按「📥 匯入工作表1」就新增一列（這一列也能「復原」）；不需要就按「❌ 不需要」。" }
        ] } },
      { t: "🚪 校對完：保留、清空、退出", p: "輸入框上面的後三顆管**待審清單和校對模式**：「💾 保留清單」（待審的留著，還在校對模式，可以繼續傳照片）、「🗑 不保留清單」（待審全部清掉，還在校對模式）、「**🚪 退出**」（離開校對模式；待審的留著，網址開著就能繼續審）。**校對完記得退出**，不然 30 分鐘內傳的照片都會當成清單。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "💾 保留清單", m: [act("👆 按「💾 保留清單」"), me("清單校對 保留"), bot("💾 待審 3 筆留著。\n還在校對模式，可以繼續傳照片；要走按「🚪 退出」。" + tl("0.7", "0.2")), qr(LSTQ)],
            n: "待審清單放 **3 天**，到期自動清掉。" },
          { l: "🗑 不保留清單", m: [act("👆 按「🗑 不保留清單」"), me("清單校對 清空"), bot("🗑 待審 3 筆全部清掉了。\n還在校對模式，可以繼續傳照片；要走按「🚪 退出」。" + tl("0.7", "0.2")), qr(LSTQ)],
            n: "整批重來、或拍錯了要全部丟掉時用。清掉的**不能找回**（還沒寫進工作表1，所以工作表1 不會有任何改變）。" },
          { l: "🚪 退出", m: [act("👆 按「🚪 退出」"), me("清單校對 結束"), bot("🚪 已退出清單校對。\n待審 3 筆還留著，網址開著就能繼續審；不要了就再進來按「🗑 不保留清單」。" + tl("0.6", "0.2"))],
            n: "這一則沒有帶小按鈕，輸入框上面**自動換回**平常那排。之後傳的照片又是平常的查藥。" }
        ] } }
    ], tryp: DEVTRY("清單校對", "會回到 LINE 聊天室，已經幫你填好「清單校對」，按送出只是進入校對模式（30 分鐘內傳的照片會走校對，不會出藥品卡片）；沒有傳照片，就不會改到任何資料。要離開按「🚪 退出」。"),
    recap: ["**拍位置清單傳給機器人**，它用 CODE 逐列對工作表1，只挑不一樣的：🟡 位置或商品名變了、🔵 表上沒有；一次拍一欄最準。", "**紙彎了或斜了**，位置會整批對錯行，機器人會「整批擋下」、一筆都不進待審；把紙壓平、正面拍再傳。", "**審過按「✅ 寫進工作表1」才會改**，做錯了 7 天內打「復原」；校對完按「🚪 退出」，不然 30 分鐘內傳的照片都走校對。"],
    quiz: { q: "傳了一張清單照片，機器人說「🚫 這張整批擋下來了，一筆都沒進待審」，最可能的原因和做法是？", h: "提示：看那一句「超過一半」位置不一樣。", o: ["資料真的全部變了，要全部改", "照片太大，要改成文字再傳", "紙彎了或斜了，位置整批對錯行；壓平、正面拍，或一次只拍一欄再傳", "要先打「匯入」"], a: 2, why: "超過一半的列「位置不一樣」，通常不是資料真的變了，而是紙彎了或斜了，位置那一欄整批對錯行，所以機器人整批擋下，一筆都不放進待審。把紙壓平、正面拍，或一次只拍一欄，再傳一次。" } },

    { id: "devmaint", ch: 1, name: "日常維護", secs: [
      { t: "輸入框上面的「🔧 開發者」", p: "開發者的輸入框上面，比藥師多一顆「🔧 開發者」。按它會出現一張選單，**按一顆＝幫你打那個字**，不用背指令。綠色的兩顆最常用：「➕ 新增藥品」和「📮 回覆回報」；下面是體檢、速度、清單校對，和幾個全院的開關。藥師看不到這顆，打這些字也沒有用。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "按「🔧 開發者」", m: [act("👆 按輸入框上面的「🔧 開發者」"), me("開發者"), devMenuCard(true, true, false), qr(BAR, "輸入框上面還是這一排")],
            n: "選單最下面的小字提醒了兩件事：**換照片**要怎麼做、**改錯了**怎麼辦。「OCR接手」「新卡片」「語音V2」後面的字是現在的狀態（✅全院＝開著、已關＝關著）。" },
          { l: "藥師打「體檢」", m: [me("體檢"), bot("這是開發者指令 🔒\n有資料要新增或修改，把 CODE 和內容傳給開發者就好。")],
            n: "藥師打開發者才有的字，只會看到這一句，什麼都不會動。" }
        ] } },
      { t: "🩺 體檢：換完程式按一下", p: "按「🩺 體檢」，輸入框上面換成一排小按鈕：**「📦 版本更新＋清快取」**（先清快取，再列 LINE、網頁專案、GitHub 全部的版本對不對）和**「🩺 開始體檢」**（上面那些＋所有項目檢查一次，約 10～20 秒）。**換完程式、改完試算表**按前者；平常每週按一次後者。要離開按「🚪 退出」，輸入框上面就換回平常那排。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "按「🩺 體檢」", m: [act("👆 按選單的「🩺 體檢」"), me("體檢"),
              bot("🩺 體檢　要做哪一個？\n・📦 版本更新＋清快取：先清快取（清掉馬上重建），再列 LINE 四個檔、網頁專案兩個檔的版本對不對，和 GitHub 網頁打不打得開（不測 AI，換完程式按一下就知道有沒有貼齊）；第一次會把程式自己寫的搬到使用者屬性\n・🩺 開始體檢：上面那些全部＋所有項目檢查一次（約 10～20 秒）"), qr(CHKQ)],
            n: "這一排小按鈕**只在體檢這一段出現**，按「🚪 退出」就回到平常那排。" },
          { l: "📦 版本更新＋清快取", m: [act("👆 按「📦 版本更新＋清快取」"), me("版本更新＋清快取"),
              bot("📦 版本更新＋清快取\n\n🧹 快取：全部清掉（索引＋8 格設定鏡射），索引重建中，設定會預熱。藥師下一句查詢就是新資料。\n\n" + VERTXT + "\n\n🗂 指令碼屬性（超過 50 個，專案設定就只能看、不能改）\nLINE：18 個 ✅\n網頁專案：14 個 ✅\n\n🕘 自動清快取：今天 06:00、09:00 清過（下一次 13 點）" + tl("2.6", "0.4")), qr(["🩺 開始體檢", "🚪 退出"])],
            n: "**四個檔的版本要一樣**。哪一行後面有「←」，就是那個檔沒貼到最新版，或貼了還沒「部署 → 新版本」。清快取是先清再馬上重建；每天 6、9、13、17、21 點也會自動清一次。最下面「⏱」那一行是**這一句花的時間**（開發者指令的回覆大多有），「程式外」是 LINE 送出到程式開始之間的空檔。" },
          { l: "🩺 開始體檢", m: [act("👆 按「🩺 開始體檢」"), me("健檢"),
              bot("🩺 健檢　13.2 秒\n🧹 快取：全部清掉（索引＋8 格設定鏡射），體檢會順便重讀試算表把索引建回來。\n\n" + VERTXT + "\n🗂 指令碼屬性：LINE：18 個 ✅　網頁專案：14 個 ✅\n🕘 自動清快取：今天 06:00、09:00 清過（下一次 13 點）\n\n🩺 體檢：沒有 ❌ 也沒有 ⚠️ ✅\n\n速度看「⏱ 速度」那顆；只清快取、看版本：按下面的「📦 版本更新＋清快取」。\n\n（完整內容在 Apps Script 的執行記錄）" + tl("13.5", "0.3")), qr(["📦 版本更新＋清快取", "🚪 退出"])],
            n: "一切正常就是「沒有 ❌ 也沒有 ⚠️ ✅」那一行；有問題的會一條一條列在它下面（❌ 一定要處理，⚠️ 要看一下）。" },
          { l: "🚪 退出", m: [act("👆 按「🚪 退出」"), me("體檢 退出"), bot("🚪 已離開體檢。\n要再用：按「🔧 開發者」→「🩺 體檢」，或直接打「體檢」。")],
            n: "這一則沒有帶小按鈕，所以輸入框上面**自動換回**平常那排。" }
        ] } },
      { t: "⏱ 速度：藥師說很慢的時候", p: "藥師說「查很慢」「拍照等很久」，按「⏱ 速度」：LINE 上**實際的時間**，打字、照片、語音各列最近幾次，旁邊寫著目標（打字 2 秒、拍照 6～8 秒、語音 6 秒）。超過目標幾乎都是「**程式外**」（Google 的冷啟動，靠保溫觸發器）或 AI 那一趟。每一段花在哪裡，按下面的小按鈕看。",
        d: { k: "chat", ttl: "按「⏱ 速度」", ch: [
          { l: "⏱ 速度", m: [act("👆 按選單的「⏱ 速度」"), me("速度"),
              bot("⏱ 速度（LINE 上實際的時間，新的在上）\n\n⌨️ 打字（目標 2 秒）　最近 2 次　平均 465 ms　超過 2 秒 0 次\n　【09/15 10:12】「90101」 410 ms ✅　程式外 180 ms　索引 記憶體\n　【09/15 10:09】「testolol」 520 ms ✅　程式外 210 ms　索引 快取\n\n📷 照片（印刷目標 6 秒、手寫 8 秒）　最近 1 張\n　【09/15 10:05】 藥師等 4.2 秒　印刷　AI 1 次 3.1 秒　程式外 220 ms\n\n🎤 語音（目標 6 秒）　最近 1 句\n　【09/15 09:58】 3.4 秒　✅ 查到　程式外 150 ms\n\n怎麼看：超過目標幾乎都是「程式外」（Google 冷啟動，靠保溫觸發器）或 AI 那一趟。照片的「藥師等」＝回覆送出去那一刻；「全部做完」多出來的是回覆之後才做的清暫存、記帳。\n每段細節：按下面的小按鍵，或打「文字速度」「照片速度」「語音速度」「速度 詳細」。" + tl("0.9", "0.2")), qr(SPDQ)],
            n: "小按鈕：**文字速度**（打字每一次花在哪一段）、**照片速度**、**語音速度**（藥師說「一直聽錯」先看這個）、**速度 詳細**（合成一份）。✅ 是在目標內，🟡 是超過 2 秒。**第一次按（或隔了很久沒按）**最後面可能多一行「🌐 網頁專案的紀錄還沒有存到，剛剛已經去要了，再按一次就會出現」：機器人正在去網頁專案要網頁那邊的紀錄，照它說的再按一次，網頁來的幾列（前面標 🌐）就會一起列出來。" }
        ] } },
      { t: "🖼 照片：同步、換照片", p: "雲端資料夾的新照片（檔名＝CODE）**每 2 小時自動同步一次**，平常不用管。急的話打「**同步照片 90101**」只同步那一支，馬上回新卡片；打「同步照片 全部」強制全部重對。要換單支的照片更直接：查那支藥 → ✏️ 修改 → **📷 換照片** → 傳一張照片，舊的會移到「舊照片」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "同步照片 90101", m: [me("同步照片 90101"), bot("🖼 90101 照片已更新（雲端 90101.jpeg）\n新照片要幾秒鐘才會出現，卡片上還是舊圖的話再查一次就好。"), dc("90101", { edit: 1 })],
            n: "同步完**馬上給你這支藥的新卡片**。如果網址跟原本一樣，會多一句「只是重新整理了快取」。" },
          { l: "📷 換照片", m: [act("👆 在 ✏️ 選單點「📷 換照片」"),
              bot("📷 請直接傳一張 90101（TESTOLOL* 25MG TAB） 的照片給我\n（拍瓶身或鋁箔，字面朝上、光線夠；電腦版把照片檔拖進來或 Ctrl+V 貼上也可以）\n\n傳來的照片會存進雲端硬碟的照片資料夾（檔名 90101.jpeg），舊的會移到「舊照片」；卡片馬上換成新照片。\n15 分鐘內有效，不換了就按「取消」。"), qr(["取消"]),
              act("📷 傳一張照片給機器人"), bot("✅ 90101 照片換好了（雲端 90101.jpeg；舊的移到「舊照片」：90101_舊_0915-1045.jpeg）\n新照片要幾秒鐘才會出現，卡片上還是舊圖的話再查一次就好。"), dc("90101", { edit: 1 }), undoQ("90101")],
            n: "照片換好**馬上給新卡片**，輸入框上面第一顆是「↩️ 復原 90101」；15 分鐘內沒傳照片，這一次就過期。" }
        ] } }
    ], tryp: DEVTRY("速度", "會回到 LINE 聊天室，已經幫你填好「速度」，按送出就會列出最近幾次的時間；只是看紀錄，不會改到任何資料。"),
    recap: ["**輸入框上面的「🔧 開發者」**＝選單，按一顆等於打那個字；藥師看不到，打了也沒用。", "**換完程式、改完試算表**：「🩺 體檢」→「📦 版本更新＋清快取」，看四個檔的版本一不一樣。", "**藥師說很慢**看「⏱ 速度」；**照片不對**打「同步照片 CODE」，或 ✏️ 修改 → 📷 換照片。"],
    quiz: { q: "貼了新版程式、部署完，想最快確認版本有沒有貼齊，按哪一顆？", h: "提示：先按「🔧 開發者」→「🩺 體檢」，輸入框上面會有兩顆。", o: ["⏱ 速度", "🩺 開始體檢（約 10～20 秒）", "📦 版本更新＋清快取", "📋 清單校對"], a: 2, why: "「📦 版本更新＋清快取」先清快取、馬上重建，再列 LINE 四個檔、網頁專案、GitHub 的版本，有「←」的那一行就是沒貼到最新版。「🩺 開始體檢」是全部項目檢查一次，比較久。" } },

    { id: "devmore", ch: 2, name: "進階指令", secs: [
      { t: "📖 縮寫：教機器人看懂手寫縮寫", p: "藥師拍的**手寫紙條**常有縮寫（例：HCTZ），AI 不一定認得。把縮寫加進「縮寫表」：之後**打縮寫就查得到那支藥**，AI 讀紙條時也會用它還原。打「**縮寫**」看現在有哪些；加：「縮寫 縮寫=全名」；刪：「縮寫 刪 縮寫」。縮寫只能是英文字母和數字（最多 12 個字），最多 60 個。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "打「縮寫」看全部", m: [me("縮寫"), bot("📖 開發者加的手寫縮寫（查詢會展開、AI 讀紙條時會用來還原）\n（還沒有開發者加的縮寫）\n\n★ 最快的加法：查那支藥 → ✏️ 修改 → 📖 縮寫 → 打 HCTZ\n打字也行：縮寫 HCTZ=hydrochlorothiazide\n刪：縮寫 刪 HCTZ" + tl("0.6", "0.2"))],
            n: "還沒有縮寫的時候，機器人把**兩種加法**都寫給你。有的話，會把全部列在中間。" },
          { l: "加一個：縮寫 縮寫=全名", m: [me("縮寫 TSL=TESTOLOL"), bot("📖 已加 TSL = TESTOLOL（下一張手寫紙條就會用到）。現在的縮寫：\n　TSL = TESTOLOL" + tl("0.8", "0.2"))],
            n: "縮寫會自動轉成**大寫**；「=」也可以打「＝」「:」「：」。加完立刻生效。" },
          { l: "刪一個：縮寫 刪 縮寫", m: [me("縮寫 刪 TSL"), bot("📖 已刪掉 TSL。現在的縮寫：\n（還沒有開發者加的縮寫）" + tl("0.7", "0.2"))],
            n: "「刪」也可以打「刪除」「移除」。打了沒有的縮寫，機器人會說「沒有…這個縮寫」，並列出現有的。" },
          { l: "從藥品加：✏️ → 📖 縮寫", m: [act("👆 查到 90101，點「✏️ 修改」→「📖 縮寫」"),
              bot("✏️ 90101　📖 縮寫\n\n現在是：（空的）\n\n請直接打新的內容送出就好。"), qr(["🗑 清空這一欄", "取消"]),
              act("⌨️ 打「TSL」送出"), me("TSL"), bot("✅ 90101　縮寫\n　改前：沒有\n　改後：TSL"), dc("90101", { edit: 1 })],
            n: "這一種**不用打全名**：縮寫直接對到這支藥的商品名。一次要加好幾個，用逗號分開（機器人會排好，用「、」連起來）。縮寫不在試算表裡，所以改完**沒有「↩️ 復原」**；全部拿掉就按「🗑 清空這一欄」。" }
        ] } },
      { t: "🗺 平面圖：這支藥要指定放哪一塊", p: "藥品卡片上的平面圖，平常跟著**小藥庫位置**自動判斷。某一支藥要特別指定（例如放在棧板上），在 ✏️ 選單點「🗺 平面圖」。**設完全院立刻生效**，藥師下一則訊息就看得到，不用出新版。要改回去就選「自動」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "點「🗺 平面圖」", m: [act("👆 在 ✏️ 選單點「🗺 平面圖」"), bot(MAPASK), qr(MAPQ)],
            n: "輸入框上面有 7 顆。「棧左／棧中／棧右」按一下就好；「平」是其他櫃位，機器人會再問你是哪一櫃；「沒平」是公藥那種，不用顯示平面圖。" },
          { l: "指定「棧中」", m: [act("👆 點「棧中」"), me("棧中"), bot("✅ 90101　平面圖\n　改前：自動判斷\n　改後：棧中（全院已生效）"), act("（接著送出這支藥的新卡片，平面圖已經換了）")],
            n: "改完**馬上給新卡片**。平面圖不在試算表裡，所以沒有「↩️ 復原」；要改回去，再選一次。" },
          { l: "改回「自動」", m: [act("（這支藥之前指定過「棧中」，再點一次「🗺 平面圖」）"), act("👆 點「自動」"), me("自動"), bot("✅ 90101　平面圖\n　改前：棧中\n　改後：自動判斷（跟著小藥庫位置走）"), act("（接著送出這支藥的新卡片，平面圖回到自動判斷）")],
            n: "「自動」＝取消指定，回到跟著小藥庫位置走。想整院先停用所有指定，打「平面圖設定 關」（設過的內容不會被刪掉，打「平面圖設定 開」就回來）。" }
        ] } },
      { t: "👥 開發者管理：邀請、名單、移除", p: "要多一位開發者，**用邀請碼最簡單**：按 🔧 開發者 →「👥 開發者」，輸入框上面有三顆：**邀請**（給一組 6 位數碼）、**名單**、**移除**。按一顆＝幫你打那個字，不用背指令。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "按「👥 開發者」", m: [act("👆 按「🔧 開發者」→「👥 開發者」"), me("開發者 管理"), bot(DEVGMENU), devgQ("")],
            n: "只有三件事。最下面「🚪 退出」，輸入框上面就換回平常那排。" },
          { l: "➕ 邀請開發者", m: [act("👆 按「➕ 邀請開發者」"), me("開發者 邀請"),
              bot("🔑 邀請碼 482913\n10 分鐘內有效，只能用一次。\n\n把下面這句傳給對方，請他在補藥神器裡打：\n　開發者 碼 482913\n\n（他打完就是開發者了，您可以按「👥 開發者名單」確認。）\n\n⚠️ 只傳給你認識、要當開發者的人。補藥神器（LINE 或網頁）永遠不會叫你產生邀請碼、或把邀請碼傳給誰；有人這樣要求就是詐騙。"), devgQ("邀請")],
            n: "6 位數的邀請碼（這裡的 482913 是編的）**10 分鐘內有效、只能用一次**。把「開發者 碼 …」那一句傳給對方就好。**只傳給你認識、要當開發者的人。**" },
          { l: "對方打碼", m: [act("（對方在自己跟補藥神器的一對一聊天室）"), me("開發者 碼 482913"),
              bot("✅ 示範乙，您現在是開發者了\n\n多了這些：新增藥品、回覆回報、匯入、同步照片、換照片、健檢、速度…\n輸入框上面會多一顆「🔧 開發者」，按下去是選單（下一則訊息就會出現）。\n\n先打「教學」，按卡片最下面的「🔒 開發者專用教學」，看一遍就會用。")],
            n: "打完就是開發者。碼打錯、過期、或已經用過，對方會看到「❌ 這組邀請碼不對、或已經過期／被用過了。」，要你重新按「➕ 邀請開發者」；**同一個人連續打錯 3 次**，要等 1 小時。" },
          { l: "👥 開發者名單", m: [act("👆 按「👥 開發者名單」"), me("開發者 名單"), bot(DEVLIST2), devgQ("名單")],
            n: "每個人一行：名字、哪一天加入、誰邀請的。下面「最近的異動」最多列 5 筆。**直接在編輯器加進去的人**沒有加入紀錄。" },
          { l: "➖ 開發者移除", m: [act("👆 按「➖ 開發者移除」"), me("開發者 移除"),
              bot("➖ 開發者移除：要移除誰？\n　1　示範甲（您，不能移除自己）\n　2　示範乙　09/15 加入\n\n按下面那一顆（會先問一次），或打「開發者 移除 2」。"), qr(["➖ 移除 2 示範乙", "🚪 退出"]),
              act("👆 點「➖ 移除 2 示範乙」"), me("開發者 移除 2"), bot("確定要移除「2 示範乙」嗎？\n移除之後他就用不了開發者功能（藥師的功能照舊）。"), qr(["✅ 確定移除", "↩️ 不要"]),
              act("👆 點「✅ 確定移除」"), me("開發者 移除 2 確定 k3f9"), bot("🗑 已移除：示範乙\n（他下一則訊息起就沒有開發者功能了）\n\n" + DEVLIST1), devgQ("")],
            n: "**先問一次**，按「✅ 確定移除」才移除。**不能移除自己**，名單只剩一位也不能移除（不然就沒有人是開發者了）。移除後，對方下一則訊息起就沒有開發者功能，藥師的功能照舊。" }
        ] } },
      { t: "⏰ 觸發器：部署新版本之後按一次", p: "「觸發器」是 Google 定時自己跑的工作（保溫、同步照片、每天清快取…）。**部署新版本之後**打一次「**觸發器**」：機器人**重新建好 6 個**（重複打是安全的，舊的先刪再建）。「健檢」說觸發器不見了、或第一次查詢常常要等十幾秒，也打一次。",
        d: { k: "cmds", ttl: "觸發器會建好這 6 個", items: [
          ["autoSyncPhotos", "每 2 小時　自動同步新照片"],
          ["warmCache", "每 15 分鐘　保持快取是熱的"],
          ["pingSelf", "每 5 分鐘　保持網頁環境是熱的"],
          ["dailyCleanup", "每天凌晨 3 點　清語音紀錄與 OCR 殘留暫存檔"],
          ["autoClean", "每天 6、9、13、17、21 點　自動清快取（清完馬上重建）、速度紀錄、AI 塞車記號"],
          ["onSheetChange", "改試算表時　改完下一句查詢就是新資料"]
        ], capn: "照機器人回的清單整理；打「觸發器」，機器人會回「✅ 6 項觸發器都建好了」和這幾行。" } },
      { t: "🎛 全院開關：立刻生效", p: "有幾個功能是**全院一起開關**的（含藥師）：打那個字就生效，**不用重新部署**，藥師下一則訊息就是新的樣子。開關的字**成對**：機器人每次回你現在是開還是關，最後一句告訴你怎麼換回去。這些也都在 🔧 開發者選單裡。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "新卡片／舊卡片", m: [me("新卡片"), bot("🎴 **全院使用新版卡片**（含藥師），立刻生效。\nCODE 當大標、位置整條、平面圖嵌在卡片裡。\n打「舊卡片」可以整院退回原本那張。" + tl("0.7", "0.2")), me("舊卡片"), bot("🎴 **全院回到原本那張卡片**（含藥師），立刻生效。\n打「新卡片」換回新版。" + tl("0.6", "0.2"))],
            n: "新版卡片可以隨時退回去；換過去、換回來都**立刻生效**。" },
          { l: "語音嚴格", m: [me("語音嚴格"), bot("🎤 語音改成**嚴格**（全院）\n\n聽到的字要跟院內清單**完全一樣**才出卡片，\n差一個同音字就列候選讓藥師點（＝ v10.14.0 訂的規矩）。\n\n打「語音寬鬆」換回去。" + tl("0.6", "0.2"))],
            n: "「語音寬鬆」是反過來：容錯率跟打字查詢一樣，完全比對沒中，就用最接近的字再比一次。" },
          { l: "OCR接手 關", m: [me("OCR接手 關"), bot("🔬 OCR 接手：**全院關閉**（含藥師），立刻生效。\n照片回到只用 AI 看圖；AI 塞車時會等比較久。\n打「OCR接手」打開。" + tl("0.7", "0.2"))],
            n: "OCR 是 AI 讀不出照片時**最後才用**的一步。打「OCR接手」打開，後面加「關」關掉。" }
        ] } }
    ], tryp: DEVTRY("縮寫", "會回到 LINE 聊天室，已經幫你填好「縮寫」，按送出只是列出縮寫表，不會改任何東西；要加再打「縮寫 縮寫=全名」。"),
    recap: ["**縮寫**：打「縮寫」看全部、「縮寫 縮寫=全名」加、「縮寫 刪 縮寫」刪；加了，下一張手寫紙條就會用。", "**開發者管理**：🔧 開發者 →「👥 開發者」→ ➕ 邀請（6 位數碼，10 分鐘、只能用一次）、👥 名單、➖ 移除（先問一次，不能移除自己）。", "**部署新版本後打「觸發器」一次**；全院開關（新卡片、語音嚴格、OCR接手…）打一次開、再打一次換回去，立刻生效。"],
    quiz: { q: "想請同事也成為開發者，最安全的做法是？", h: "提示：邀請碼有時限，也只能用一次。", o: ["把邀請碼貼在群組，誰先打誰就是", "請同事打「教學」，就會自動變成開發者", "按「➕ 邀請開發者」，把 6 位數的碼傳給他，請他打「開發者 碼 …」", "把自己的 LINE 帳號借給同事用"], a: 2, why: "邀請碼 10 分鐘內有效、只能用一次，只傳給你認識、要當開發者的人。貼在群組誰都看得到；機器人也永遠不會叫你把邀請碼傳給別人，有人這樣要求就是詐騙。" } },

    { id: "devweb", ch: 2, name: "開發者網頁", secs: [
      { t: "🌐 開發者網頁：跟藥師版差在哪", p: "輸入框上面那顆「🌐 網頁」，**開發者按到的就是開發者版**（藥師按到的是藥師版）。開發者版跟藥師版一樣能查，**多了藥品卡片右上角的 ✏️**：直接改工作表1／工作表2，跟 LINE 的「✏️ 修改」是同一支（欄位一樣，都能改、也能換照片），電腦上改資料最順手。連結只要有在用就不會過期（30 天沒開才失效）。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "打「開發者網頁」", m: [me("開發者網頁"), webLinkCard({})],
            n: "平常不用打這個，**直接按輸入框上面的「🌐 網頁」就開了**。這張卡是要**拿綁定碼、重發連結、看後端代號**的時候才用。**這條連結能改資料，只能自己用，別給藥師。**" },
          { l: "打「藥師網頁」", m: [me("藥師網頁"), webLinkCard({ dev: false })],
            n: "想看藥師看到的樣子，打「藥師網頁」：只有「打開網頁」一顆，沒有 ✏️，也不用綁定。" },
          { l: "藥師打「開發者網頁」", m: [act("（藥師打）"), me("開發者網頁"), bot("這是開發者指令 🔒\n有資料要新增或修改，把 CODE 和內容傳給開發者就好。")],
            n: "不是開發者打這個，**只會看到這一句**，拿不到開發者版的連結。藥師要用網頁，打「網頁」或按輸入框上面的「🌐 網頁」就好。" }
        ] } },
      { t: "🔑 每一台都要先綁定（最多 3 處）", p: "開發者網頁**會改資料**，所以**每一台第一次要綁定**：在要用的地方（LINE 裡、手機瀏覽器、電腦、主畫面捷徑）打開，會看到「這台還沒綁定開發者版」。回 LINE 按連結卡上的「**🔑 拿綁定碼**」（或打「開發者網頁 綁定」），拿到一組 **6 位數的碼**，打回網頁，按「綁定」。碼 **10 分鐘內有效、只能用一次**，**最多綁 3 處**。連結外流的人沒有碼，綁不上、改不了資料。",
        d: { k: "chat", ttl: "照順序看", list: true, ch: [
          { l: "① 網頁：還沒綁定", m: [act("🌐 在新的地方（例：另一台電腦）打開開發者網頁"), wbBind({})],
            n: "沒綁定的地方，**網頁只會出現輸入綁定碼的框**，看不到任何藥品，也改不了任何資料。" },
          { l: "② LINE：拿綁定碼", m: [act("👆 回 LINE，按連結卡上的「🔑 拿綁定碼」"), me("開發者網頁 綁定"), wbBindCard("304718")],
            n: "6 位數的碼（這裡的 304718 是編的）。**拿新的碼，舊的那組就作廢。**碼**只打在補藥神器網頁上**，不要傳給任何人，包括自稱開發者、客服的人。" },
          { l: "③ 網頁：打碼，綁好了", m: [act("🌐 回網頁，把 6 位數打進去，按「綁定」"), wbBind({ typed: "304718", wait: "確認中…" }), act("✅ 綁好了，自動進到首頁"), wbHome()],
            n: "綁好之後，**這一台以後直接開就好，不用再輸入**。最多綁 3 處（例：手機 LINE 裡、電腦、手機主畫面各一）。" },
          { l: "打錯、鎖住、綁滿了", m: [wbBind({ typed: "718304", err: "碼不對、過期了、或已經用過（還可以再試 4 次）" }),
              act("…連續打錯 5 次"), wbBind({ err: "錯太多次了，1 小時後再試（或回 LINE 打「開發者網頁 重發」）" }),
              act("（這條連結已經綁了 3 個地方，要綁第 4 個）"), wbBind({ typed: "304718", err: "🔒 這條開發者連結已經綁了 3 個地方，不能再多。\n要換地方：回 LINE 打「開發者網頁 重發」（舊的綁定全部清掉），再在要用的地方各綁一次。" })],
            n: "打錯會告訴你還剩幾次；**連續錯 5 次鎖 1 小時**。名額滿了，要換地方，打「開發者網頁 重發」：舊的綁定全部清掉，再到要用的地方各綁一次。" }
        ] } },
      { t: "🔐 直接打網址：用代號登入", p: "不是從 LINE 的按鈕進來（例如電腦直接打網址、無痕視窗），網頁會出現**代號登入**畫面。開發者按最下面小小的「**開發者登入**」，換成 **6 位數字的開發者代號**，然後三步：**①** 把代號打進跟補藥神器的**一對一聊天室**（不是群組）；**②** LINE 回一張「🛠 開發者版 網頁驗證碼」，上面有 **6 位數的驗證碼**；**③** 把驗證碼打回網頁，按「登入」。**5 分鐘內做完**（網頁上有倒數）；超過了，網頁會自己換一組新的代號。登入的這一台會**自動綁定**。",
        d: { k: "chat", ttl: "照順序看", list: true, ch: [
          { l: "① 網頁：開發者登入", m: [act("🌐 電腦的瀏覽器直接打網址，看到的是藥師版代號"), wbLogin({ dev: false, code: "Kd7mPq4Xr", left: "4:58" }),
              act("👆 按最下面小小的「開發者登入」"), wbLogin({ dev: true, code: "257391", left: "4:52" })],
            n: "藥師版的代號是 9 個英數字，**開發者版是 6 個數字**，上面還有一個「🛠 開發者登入」的小標籤。（這裡的代號都是編的。）" },
          { l: "② LINE：打代號", m: [act("📱 到 LINE 補藥神器（一對一聊天室），把代號打進去"), me("257391"), wbCodeCard("615273", "257391", "Chrome / Windows")],
            n: "**要在一對一聊天室打**；在群組打，機器人只會提醒你換地方，不會給驗證碼。驗證碼卡片沒有按鈕，**只能打回出現那組代號的那個網頁**，換別的瀏覽器打沒用。" },
          { l: "③ 網頁：打驗證碼", m: [act("🌐 回網頁，把 6 位數驗證碼打進去，按「登入」"), wbLogin({ dev: true, code: "257391", left: "4:21", typed: "615273" }), act("✅ 登入成功，這一台自動綁好了"), wbHome()],
            n: "**不要把上面那組 6 位數的開發者代號打進這一格**（那是要打進 LINE 的），網頁會提醒你。驗證碼打錯只會說「驗證碼不對」，每一組代號自己有一個看不見的猜碼上限，到了就作廢，按「重新取得代號」換新的。" },
          { l: "④ LINE：新裝置通知", m: [act("🔔 同時，LINE 推播一則通知給開發者"), wbNewDevCard("09/15 10:42", "Chrome / Windows", 1)],
            n: "每當有**新的一台**用驗證碼登入開發者網頁，LINE 都會通知你。是你自己 → 不用理會；**不是你 → 按「不是我，全部作廢」**。" }
        ] } },
      { t: "📄 cfg.js（選用，只做一次）", p: "沒有 cfg.js 的話，每台瀏覽器**第一次要先從 LINE 的「🌐 網頁」按鈕開一次**，之後直接打網址才會出現代號。想讓**沒開過的瀏覽器直接打網址也出代號**，在放網頁的 GitHub 專案放一個 **cfg.js**（只有一行，只寫「後端在哪」，**不是鑰匙**）。打「**開發者網頁 設定**」，機器人一步一步教，並給你要貼的那一行。**GitHub 上的檔案是公開的**，不想公開就不要放。",
        d: { k: "chat", ttl: "打「開發者網頁 設定」", ch: [
          { l: "打「開發者網頁 設定」", m: [me("開發者網頁 設定"), bot(CFGTXT), bot(CFGLINE)],
            n: "第二則就是要貼進 cfg.js 的那一行（這裡的後端代號 demo01 是編的）。放好以後打「健檢」，「GitHub 網頁」那一行會多一句「cfg.js ✅」。**更新 GitHub 時別把它清掉。**" }
        ] } },
      { t: "🛡 出事了：重發、暫停登入", p: "連結外流、手機掉了、或收到「新裝置登入」通知卻不是你：打「**開發者網頁 重發**」（或按通知卡的「不是我，全部作廢」）：**換一條新連結，舊連結和所有已綁的裝置馬上失效**，你手上還沒用掉的驗證碼也一起作廢；之後每一台要重新綁。有人在亂試代號（收到警示信，或健檢說驗證碼額度被用光）：打「**驗證碼登入 關**」，代號登入整個暫停（LINE 的連結和已經登入的瀏覽器不受影響）；沒事了打「驗證碼登入 開」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "開發者網頁 重發", m: [me("開發者網頁 重發"), webLinkCard({ force: true })],
            n: "卡片上多一句「（已換新連結，舊的已失效）」。**舊的綁定全部清掉**，要再到每一個要用的地方各綁一次。" },
          { l: "驗證碼登入 關／開", m: [me("驗證碼登入 關"), bot(CODEOFF), me("驗證碼登入 開"), bot("▶️ 「驗證碼登入」已恢復（全院，立刻生效）。")],
            n: "關著的時候，網頁拿不到代號，LINE 打代號也不發驗證碼，都會說「暫停了」。**這是緊急開關**：平常不用關。" }
        ] } }
    ], tryp: DEVTRY("開發者網頁", "會回到 LINE 聊天室，已經幫你填好「開發者網頁」，按送出會出現開發者網頁的連結卡（平常是同一條連結，不會換新）；只是拿連結，不會改到任何資料。"),
    recap: ["**輸入框上面的「🌐 網頁」＝開發者版**（藥師按到的是藥師版）；每一台第一次要**綁定**：連結卡「🔑 拿綁定碼」→ 6 位數 → 打回網頁（10 分鐘、只能用一次、最多 3 處）。", "**直接打網址**：網頁給代號 → 打進 LINE 一對一聊天室 → 拿 6 位數驗證碼 → 打回網頁，5 分鐘內做完；開發者按最下面的「開發者登入」。", "**出事了**：打「開發者網頁 重發」（舊連結和所有裝置馬上失效）；有人亂試代號就「驗證碼登入 關」，沒事了再「開」。"],
    quiz: { q: "你在電腦直接打網址，網頁出現一組 6 位數的開發者代號，下一步是？", h: "提示：代號是要「打進 LINE」的。", o: ["把代號打在網頁下面的輸入框", "把代號打進跟補藥神器的一對一聊天室，再把 LINE 回的 6 位數驗證碼打回網頁", "把代號貼到群組，請別人幫忙拿驗證碼", "回 LINE 打「開發者網頁 綁定」，把綁定碼打在網頁上"], a: 1, why: "代號是要打進 LINE 的，網頁下面那一格要打的是 LINE 回給你的驗證碼（把代號打進去，網頁還會提醒你打錯地方）。要在一對一聊天室，群組裡別人也看得到。綁定碼是另一條路，給從 LINE 連結進來的新地方用。" } }

  ];
  var N = LESSONS.length;
  function lessonIdx(id) {
    for (var i = 0; i < N; i++) if (LESSONS[i].id === id) return i;
    return -1;
  }
  function lessonById(id) { var i = lessonIdx(id); return i < 0 ? null : LESSONS[i]; }
  function doneCount(done) { return LESSONS.filter(function(l) { return done[l.id]; }).length; }
  function nextLesson(done) {
    for (var i = 0; i < N; i++) if (!done[LESSONS[i].id]) return LESSONS[i];
    return null;
  }
  function pctOf(done) { return Math.round(doneCount(done) * 100 / N); }

  /* ───────── 藥品卡片示意（照真的卡片畫；一律用 el()／文字節點，不拼網頁碼）───────── */
  /* 平面圖：座標是一張 674×521 的圖（照真的平面圖的比例），方塊的位置、大小都用百分比，字用 cqw（圖寬的 1%），所以圖放多大都一樣 */
  var PW = 674, PH = 521;
  var PBLK = [   /* 棧：[左, 上, 右, 下, 字級（cqw）] */
    [82, 26, 156, 75, 3.9], [246, 26, 388, 75, 3.9], [489, 22, 632, 70, 3.9],
    [318, 195, 372, 255, 5.2], [262, 257, 372, 297, 3.3], [262, 310, 372, 350, 3.3], [318, 352, 372, 416, 5.2],
    [194, 278, 249, 342, 5.2], [389, 280, 444, 344, 5.2], [445, 262, 648, 308, 3.3], [445, 311, 648, 358, 3.3],
    [373, 465, 517, 512, 3.9]
  ];
  var PBAR = [[76, 144, 674, 195, "L 3"], [76, 417, 674, 462, "L 2"]];   /* 灰色長條：[左, 上, 右, 下, 字] */
  var PHIT = { "K2": [246, 90, 388, 142], "B1": [194, 278, 249, 342], "棧一": [373, 465, 517, 512] };   /* 紅框：哪一個位置亮在哪裡 */
  function pbox(e, r, fs) {
    e.style.left = (r[0] * 100 / PW) + "%";
    e.style.top = (r[1] * 100 / PH) + "%";
    e.style.width = ((r[2] - r[0]) * 100 / PW) + "%";
    e.style.height = ((r[3] - r[1]) * 100 / PH) + "%";
    if (fs) e.style.fontSize = fs + "cqw";
    return e;
  }
  /* em＝大門那一塊畫成黃色、放大（轉圖示範用，比較好認） */
  function planEl(hit, em) {
    var p = el("div", { class: "pl" + (em ? " em" : ""), "aria-hidden": "true" });
    p.appendChild(pbox(el("i", { class: "pl-w" }), [76, 0, 78.4, PH]));
    p.appendChild(pbox(el("i", { class: "pl-d", "data-part": "door", text: "大門" }), em ? [3, 20, 74, 62] : [10, 28, 72, 58], em ? 4.6 : 3.4));
    p.appendChild(pbox(el("i", { class: "pl-a", "data-part": "door" }), em ? [8, 70, 70, 70] : [12, 66, 70, 66]));
    PBLK.forEach(function(r) { p.appendChild(pbox(el("i", { class: "pl-b", "data-part": "b", text: "棧" }), r, r[4])); });
    PBAR.forEach(function(r) { p.appendChild(pbox(el("i", { class: "pl-g", "data-part": "bar", text: r[4] }), r, 4.4)); });
    p.appendChild(pbox(el("i", { class: "pl-h", "data-part": "hit", text: "棧" }), PHIT[PHIT[hit] ? hit : "K2"], 3.9));
    return p;
  }
  function cardLabel(code, o) {
    var r = DR[code], s = "藥品卡片示意" + (o.crop === "top" ? "（上半部）" : o.crop ? "（下半部）" : "") + "：";
    if (o.crop !== "low" && o.crop !== "loc") s += "CODE " + code + "，" + r.b + "，" + r.z + "；";
    if (o.note) s += "黃色提醒框寫著「" + o.note + "」；";
    if (o.crop !== "top") s += "位置 " + (o.spots ? o.spots.join("、") + "（亮的是 " + o.spots[o.on || 0] + "）" : r.loc);
    if (o.fam) s += "；紫色的藥品家族框，" + (o.opened ? "已打開" : "收起來");
    return s;
  }
  function famEl(f, open) {
    var n = 0;
    f.cats.forEach(function(k) { n += k[1].length; });
    var box = el("div", { class: "lc-fam", "data-part": "fam" });
    box.appendChild(el("div", { class: "lc-fh" }, [el("i", { class: "lc-fi" }), el("div", { class: "lc-fn", text: "藥品家族　" + n + " 個品項" }), el("div", { class: "lc-fo", text: open ? "▾ 收起" : "▸ 打開" })]));
    if (!open) {
      var k = el("div", { class: "lc-fk" });
      f.cats.forEach(function(c) { k.appendChild(el("div", {}, [el("span", { text: c[0] }), el("b", { text: String(c[1].length) })])); });
      box.appendChild(k);
    } else {
      f.cats.forEach(function(c) {
        box.appendChild(el("div", { class: "lc-fs", text: c[0] + "　" + c[1].length + " 個品項" }));
        c[1].forEach(function(code) { box.appendChild(listRow(code, {})); });
      });
    }
    return box;
  }
  /* 一張藥品卡片。o.crop：top 只畫上半、low 只畫下半（灰底框以下）；o.noPan 不畫灰底框；o.note 黃框的字；o.fam 藥品家族（o.opened 打開）；
     o.spots 多地點按鍵、o.on 亮哪一顆 */
  function lcCard(code, o) {
    o = o || {};
    var r = DR[code], liq = !!r.w, crop = o.crop || "", hasNote = !!o.note && !crop;
    var c = el("div", { class: "lc" + (crop === "top" ? " ct" : crop ? " cb" : ""), role: "img", "aria-label": cardLabel(code, o) });
    if (!crop || crop === "top") {
      c.appendChild(el("div", { class: "lc-h" }, [
        el("div", { class: "lc-hl" }, [
          el("div", { class: "lc-code", "data-part": "code", text: code }),
          el("div", { class: "lc-brand", "data-part": "brand", text: r.b }),
          el("div", { class: "lc-zh", "data-part": "zh", text: r.z })
        ]),
        el("div", { class: "lc-ico" }, [el("i", { class: liq ? "w" : "", "data-part": "icon" })])
      ]));
      c.appendChild(el("div", { class: "lc-gen", "data-part": "gen", text: r.g }));
    }
    if (crop === "top") return c;
    if (hasNote) c.appendChild(el("div", { class: "lc-note", "data-part": "note" }, [el("div", { class: "lc-nw", text: "⚠️" }), el("div", { class: "lc-nt", text: o.note })]));
    if (!o.noPan && (r.feat || r.ind || r.ph)) {
      var pan = el("div", { class: "lc-pan" + (hasNote ? "" : " fst") }), row = el("div", { class: "lc-pr" });
      if (r.feat && !liq) pan.appendChild(el("div", { class: "lc-feat", "data-part": "feat" }, [el("div", { class: "lc-fl", text: "🔍 藥品特徵" }), el("div", { class: "lc-ft", text: r.feat })]));
      if (r.ind) row.appendChild(el("div", { class: "lc-in", "data-part": "ind" }, [el("div", { class: "lc-il", text: "適應症" }), el("div", { class: "lc-it", text: r.ind })]));
      if (r.ph) {
        var pw = el("div", { class: "lc-pw", "data-part": "photo" });
        if (liq && r.feat) pw.appendChild(el("div", { class: "lc-pf" }, [el("div", { text: "🔍 特徵" }), el("div", { text: r.feat })]));
        pw.appendChild(el("div", { class: "lc-ph" + (liq ? " w" : "") }));
        row.appendChild(pw);
      }
      pan.appendChild(row);
      c.appendChild(pan);
    }
    var on_ = o.on || 0, hitKey = o.hit || (o.spots ? o.spots[on_] : (PHIT[r.loc] ? r.loc : "K2"));
    var loc = el("div", { class: "lc-loc" + (!o.spots && r.loc.length > 4 ? " long" : ""), "data-part": "loc" }, [el("i", { class: "lc-pin" })]);
    if (o.spots) {
      var sp = el("div", { class: "lc-sp" });
      o.spots.forEach(function(s, i) { sp.appendChild(el("div", { class: "lc-sb" + (i === on_ ? " on" : ""), text: s })); });
      loc.appendChild(sp);
    } else loc.appendChild(el("div", { class: "lc-lt", text: r.loc }));
    c.appendChild(el("div", { class: "lc-lr" }, [loc, el("div", { class: "lc-map", "data-part": "map" }, [planEl(hitKey)])]));
    if (o.fam) c.appendChild(famEl(o.fam, !!o.opened));
    return c;
  }
  /* 列表卡的一列：小照片（沒照片寫「無照片」）、商品名、中文名、（通知）、劑型圖示＋劑型＋CODE、右邊位置 */
  function listRow(row, o) {
    var code = typeof row === "string" ? row : row.c, r = DR[code];
    var mid = [el("div", { class: "lb-b", text: r.b })];
    if (r.z && r.z !== r.b) mid.push(el("div", { class: "lb-z", text: r.z }));
    if (row.n) mid.push(el("div", { class: "lb-n", text: row.n }));
    mid.push(el("div", { class: "lb-f" }, [el("i", { class: r.w ? "w" : "" }), el("span", { text: r.f + "　" + code })]));
    var kids = [el("div", { class: "lb-p" + (r.ph ? (r.w ? " w" : " t") : ""), text: r.ph ? "" : "無照片" }), el("div", { class: "lb-x" }, mid)];
    if (!o.hide) kids.push(el("div", { class: "lb-l", text: r.loc }));
    return el("div", { class: "lb-r" }, kids);
  }
  function listEl(s) {
    var names = [];
    s.g.forEach(function(g) { g.rows.forEach(function(row) { names.push(DR[typeof row === "string" ? row : row.c].b); }); });
    var b = el("div", { class: "lb", role: "img", "aria-label": "列表卡：" + s.t + "，" + s.s + "；有 " + names.join("、") + "；最下面寫「" + s.ft + "」" });
    b.appendChild(el("div", { class: "lb-t", text: s.t }));
    b.appendChild(el("div", { class: "lb-s", text: s.s }));
    var n = 0;   /* 第幾列：除了第一列，每一列上面都有一條細線（跟真的列表卡一樣） */
    s.g.forEach(function(g) {
      if (g.n) b.appendChild(el("div", { class: "lb-g" }, [g.ic ? el("i", { class: g.ic === "w" ? "w" : "" }) : null, el("span", { text: g.n })]));
      g.rows.forEach(function(row, i) {
        if (g.cut && i === 1) b.appendChild(el("div", { class: "lb-dots", text: "⋮　（中間 " + g.cut + " 列省略沒畫）" }));
        var r = listRow(row, { hide: s.hide });
        if (n > 0) r.classList.add("sp");
        b.appendChild(r);
        n++;
      });
    });
    b.appendChild(el("div", { class: "lb-ft", text: s.ft }));
    return b;
  }
  /* 照片認不準的時候：「是這個藥品？」卡（how＝這幾個是怎麼找到的，寫在標題下面的小字；沒有就不寫） */
  function askEl(codes, shown, how) {
    var b = el("div", { class: "lk", role: "img", "aria-label": "「是這個藥品？」卡：「" + shown + "」有 " + codes.length + " 個品項很像" + (how ? "（" + how + "）" : "") + "，每一個後面都有一顆「是這個藥品？」按鈕" });
    b.appendChild(el("div", { class: "lk-t", text: "❓ 「" + shown + "」有 " + codes.length + " 個品項很像，是哪一個？" }));
    if (how) b.appendChild(el("div", { class: "lk-h", text: how }));
    codes.forEach(function(code, i) {
      var r = DR[code], mid = [el("div", { class: "lk-b", text: r.b })];
      if (r.g && r.g.toUpperCase() !== r.b.toUpperCase()) mid.push(el("div", { class: "lk-g", text: r.g }));
      mid.push(el("div", { class: "lk-c", text: r.z + "　" + code + "　" + r.loc }));
      b.appendChild(el("div", { class: "lk-r" }, [el("div", { class: "lb-p" + (r.ph ? (r.w ? " w" : " t") : ""), text: r.ph ? "" : "無圖" }), el("div", { class: "lk-m" }, mid), el("div", { class: "lk-y", text: "是這個藥品？" })]));
      if (i < codes.length - 1) b.appendChild(el("div", { class: "lk-s" }));
    });
    b.appendChild(el("div", { class: "lk-ft", text: "都不是 → 直接打字查（CODE 最準）" }));
    return b;
  }
  /* 超過 5 個品項的「總表」卡：一列一支藥（小照片、商品名、中文名＋CODE、右邊位置），按一列出完整卡片；「⚠️ AI 可能讀錯」寫在標題底下 */
  function tbEl(m) {
    var names = m.cs.map(function(c) { return DR[c].b; });
    var b = el("div", { class: "lb tb", role: "img", "aria-label": "總表卡：讀到 " + m.cs.length + " 個品項，標題底下寫「" + WARN + "」；有 " + names.join("、") + "；每一列右邊是位置；最下面寫「點一列 → 完整卡片」" });
    b.appendChild(el("div", { class: "sl-t", text: "📝 讀到 " + m.cs.length + " 個品項" }));
    b.appendChild(el("div", { class: "sl-s warn", text: WARN + "　·　點一列 → 完整卡片" }));
    m.cs.forEach(function(code) {
      var r = DR[code];
      b.appendChild(el("div", { class: "sl-r" }, [
        el("div", { class: "lb-p s44" + (r.ph ? (r.w ? " w" : " t") : ""), text: r.ph ? "" : "無圖" }),
        el("div", { class: "sl-m" }, [el("div", { class: "sl-b", text: r.b }), el("div", { class: "sl-z", text: r.z + "　" + code })]),
        el("div", { class: "sl-l", text: r.loc })
      ]));
    });
    b.appendChild(el("div", { class: "lb-ft", text: "點一列 → 完整卡片" }));
    return b;
  }
  /* 「查無」卡：最上面黃色框（📋 請翻閱『藥品位置查詢表』），再來是「查無「…」相關藥品 😥」和幾個小技巧（字照 LINE 真的那張） */
  var NF_TIPS = ["・只打前面幾個字就好, 例「CURA」「諾快寧」", "・空格多關鍵字縮小範圍, 例「aspirin 100」", "・輸入位置名稱可查該位置藥品, 例「棧板」「A2」", "・打錯一兩個字也找得到, 認不出來時再換個關鍵字", "・打「公告」看所有藥品通知（停供、改包裝等）"];
  function nfEl(kw) {
    var b = el("div", { class: "nf", role: "img", "aria-label": "「查無」卡：最上面黃色框寫「如果查詢不到，請翻閱『藥品位置查詢表』。」；查無「" + kw + "」相關藥品；下面有幾個小技巧" });
    b.appendChild(el("div", { class: "lc-note" }, [el("div", { class: "lc-nw", text: "📋" }), el("div", { class: "lc-nt", text: "如果查詢不到，\n請翻閱『藥品位置查詢表』。" })]));
    b.appendChild(el("div", { class: "nf-t", text: "查無「" + kw + "」相關藥品 😥" }));
    b.appendChild(el("div", { class: "nf-x f", text: "小技巧:" }));
    NF_TIPS.forEach(function(t) { b.appendChild(el("div", { class: "nf-x", text: t })); });
    return b;
  }
  /* 看平面圖的三個步驟：一個圓圈數字＋一行粗體＋一行小字 */
  function stepsEl(items) {
    return el("ol", { class: "steps" }, items.map(function(it, i) {
      return el("li", {}, [el("span", { class: "rn", "aria-hidden": "true", text: String(i + 1) }), el("div", { class: "st" }, [el("b", { text: it.b }), el("span", { text: it.s })])]);
    }));
  }
  function carEl(items, label) {
    return el("div", { class: "lcw" }, [el("div", { class: "lcar", role: "group", tabindex: "0", "aria-label": label }, items)]);
  }

  /* ───────── 示範區的小零件 ───────── */
  /* 聊天室的一列，照 LINE 排：您傳的靠右（左邊有「已讀＋時間」）；官方帳號回的靠左，一串回覆的第一則有官方帳號的頭像
     （卡片比整個聊天室還寬，頭像放在卡片的上面一行）；第一則的泡泡有一個尖角。act（👆 按…）只是旁白，不算一則訊息。 */
  var WIDE = { dc: 1, car: 1, ll: 1, ask: 1, nf: 1, tb: 1, gc: 1 };
  function firstFlags(msgs) {
    var prev = "";
    return msgs.map(function(m) {
      if (m.w === "act" || m.w === "qr" || m.w === "wp") return false;
      var side = m.w === "me" ? "me" : "bot", f = side !== prev;
      prev = side;
      return f;
    });
  }
  function bubble(m, animated, first) {
    var w = m.w, inner = bubble0(m), cls = first ? " first" : "", b;
    if (w === "act" || w === "qr" || w === "wp") b = inner;
    else if (w === "me") b = el("div", { class: "rw me" + cls }, [el("div", { class: "mt", "aria-hidden": "true" }, [el("span", { text: "已讀" }), el("span", { text: TM })]), inner]);
    else if (WIDE[w]) b = el("div", { class: "rw card" + cls }, first ? [el("span", { class: "ava", "aria-hidden": "true" }), inner] : [inner]);
    else b = el("div", { class: "rw bot" + cls }, [el("span", { class: "ava" + (first ? "" : " sp"), "aria-hidden": "true" }), inner]);
    if (animated) b.classList.add("pop");
    return b;
  }
  /* 您傳的照片：就是一張圖（沒有泡泡）。k：t 藥盒、w 瓶身、three 好幾盒、blur 拍糊了 */
  function phEl(m) {
    var k = m.k || "t";
    return el("div", { class: "pho" + (k === "w" ? " w" : k === "three" ? " three" : k === "blur" ? " blur" : ""), role: "img", "aria-label": "傳了一張照片：" + m.pic }, [el("i", { "aria-hidden": "true" })]);
  }
  /* 語音：綠色泡泡，左邊白色圓形播放鍵，中間聲波，右邊長度 */
  function voEl(m) {
    return el("div", { class: "vo", role: "img", "aria-label": "傳了一段語音，長度 " + m.voice }, [
      el("span", { class: "vp", "aria-hidden": "true" }),
      el("span", { class: "bars", "aria-hidden": "true" }, [6, 11, 16, 9, 14, 19, 12, 7, 15, 10, 17, 8].map(function(h) { var i = el("i"); i.style.height = h + "px"; return i; })),
      el("span", { "aria-hidden": "true", text: m.voice })
    ]);
  }
  /* 手寫的紙條：一張拍起來的紙（小張的照片，上面一行一個品項） */
  function ppEl(m) {
    return el("div", { class: "pho pp", role: "img", "aria-label": "傳了一張" + (m.what || "手寫的") + "照片：" + m.note.join("、") }, [el("div", { class: "pa", "aria-hidden": "true" }, m.note.map(function(t) { return el("div", { text: t }); }))]);
  }
  function bubble0(m) {
    var w = m.w, dv = devBubble(m);
    if (dv) return dv;
    if (w === "act") return el("div", { class: "gapm", text: m.t });
    if (w === "dc") return el("div", { class: "lcw" }, [lcCard(m.c, m.o)]);
    if (w === "car") return carEl(m.cs.map(function(x) { return lcCard(x.c, x.o); }), m.cs.length + " 張藥品卡片，往左滑看下一張");
    if (w === "ll") {
      var ss = Array.isArray(m.s) ? m.s : [m.s];
      return ss.length > 1 ? carEl(ss.map(listEl), ss.length + " 張列表卡，往左滑看下一張") : el("div", { class: "lcw" }, [listEl(ss[0])]);
    }
    if (w === "ask") return el("div", { class: "lcw" }, [askEl(m.cs, m.shown, m.how)]);
    if (w === "tb") return el("div", { class: "lcw" }, [tbEl(m)]);
    if (w === "nf") return el("div", { class: "lcw" }, [nfEl(m.kw)]);
    if (w === "pl") return el("div", { class: "pimg", role: "img", "aria-label": "大張的平面圖：紅框是這支藥放的那一格，圖的左邊寫著「大門」" }, [planEl(m.hit)]);
    if (w === "bot") return el("div", { class: "bub bot", text: m.t });
    if (m.pic) return phEl(m);
    if (m.voice) return voEl(m);
    if (m.note) return ppEl(m);
    return el("div", { class: "bub me", text: m.t });
  }
  function noteBox(s) {
    var n = el("div", { class: "note", "aria-live": "polite" });
    function set(t) { n.textContent = ""; if (t) n.appendChild(rich(t)); n.hidden = !t; }
    set(s);
    n.set = set;
    return n;
  }
  /* 聊天示範：ch＝幾種情況；一種以上就有可以點的選項，一種就只有「重播」。第一次畫出來是完整的；點選項或按重播才一則一則跳出來（減少動態＝一次全出） */
  function demoChat(d) {
    var ch = d.ch, cur = 0, timers = [], btns = [];
    var chat = el("div", { class: "chat", role: "group", "aria-label": "LINE 聊天室的示意畫面" });
    var note = noteBox("");
    function stop() { timers.forEach(clearTimeout); timers = []; }
    function play(msgs, animate) {
      stop();
      var h = chat.offsetHeight, fl = firstFlags(msgs);
      chat.textContent = "";
      if (!animate || REDUCE) {
        msgs.forEach(function(m, i) { chat.appendChild(bubble(m, false, fl[i])); });
        chat.style.minHeight = "";
        return;
      }
      chat.style.minHeight = h + "px";
      msgs.forEach(function(m, i) {
        timers.push(setTimeout(function() {
          chat.appendChild(bubble(m, true, fl[i]));
          if (i === msgs.length - 1) chat.style.minHeight = "";
        }, i * 480));
      });
    }
    function pick(i, animate) {
      cur = i;
      btns.forEach(function(b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      note.set(ch[i].n || "");
      play(ch[i].m, animate);
    }
    var head = el("div", { class: "stage-h" }, [
      el("span", { class: "stage-t", text: d.ttl || "看一次" }),
      on(el("button", { type: "button", class: "replay", "aria-label": "重播" }, [el("span", { "aria-hidden": "true", text: "↺" }), "重播"]), "click", function() { pick(cur, true); })
    ]);
    var stage = el("div", { class: "stage" }, [head]);
    if (ch.length > 1) {
      var row = el("div", { class: "picks" + (d.list ? " list" : ""), role: "group", "aria-label": d.ttl || "選一種" });
      ch.forEach(function(c, i) {
        var b = on(el("button", { type: "button", class: "pk", "aria-pressed": "false" }, d.list ? [el("span", { class: "n", "aria-hidden": "true", text: String(i + 1) }), el("span", { text: c.l })] : [c.l]), "click", function() { pick(i, true); });
        btns.push(b);
        row.appendChild(b);
      });
      stage.appendChild(row);
    }
    stage.appendChild(chat);
    pick(0, false);
    stage.appendChild(el("p", { class: "capn", text: "示意畫面：藥名、位置、代號、驗證碼都是編的。" }));
    return [stage, note];
  }
  /* 在真的卡片上點名稱：圈起來（藍框）並說明，其他的變淡。top＝卡片最上面那一段、low＝灰底框以下 */
  function demoAnat(d) {
    var top = d.w === "top", keys = top ? ["code", "brand", "zh", "icon", "gen"] : ["feat", "ind", "photo", "loc", "map", "fam"];
    var chips = {}, note = noteBox("");
    var card = lcCard("90101", top ? { crop: "top" } : { crop: "low", fam: FAM1 });
    function partEl(k) { return card.querySelector('[data-part="' + k + '"]'); }
    function show(k) {
      keys.forEach(function(x) {
        var n = partEl(x);
        if (n) n.classList.toggle("on", x === k);
        chips[x].setAttribute("aria-pressed", x === k ? "true" : "false");
      });
      note.set("**" + PARTS[k].n + "**：" + PARTS[k].t);
    }
    var row = el("div", { class: "picks", role: "group", "aria-label": "卡片上的各個部分" });
    keys.forEach(function(k) {
      chips[k] = on(el("button", { type: "button", class: "pk", "aria-pressed": "false", text: PARTS[k].n }), "click", function() { show(k); });
      row.appendChild(chips[k]);
      var n = partEl(k);
      if (n) on(n, "click", function() { show(k); });
    });
    var stage = el("div", { class: "stage" }, [
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: "點一個，看它是什麼" })]),
      row,
      el("div", { class: "chat" }, [el("div", { class: "lcw act" }, [card])]),
      el("p", { class: "capn", text: "示意圖：照真的藥品卡片畫的，藥名、位置、照片都是編的。" })
    ]);
    show(keys[0]);
    return [stage, note];
  }
  /* 平面圖上點名稱：紅框、藍色方塊、灰色長條、大門 */
  function demoPlan() {
    var keys = ["hit", "b", "bar", "door"], chips = {}, note = noteBox("");
    var pl = planEl("K2", false);
    function show(k) {
      keys.forEach(function(x) {
        Array.prototype.forEach.call(pl.querySelectorAll('[data-part="' + x + '"]'), function(n) { n.classList.toggle("on", x === k); });
        chips[x].setAttribute("aria-pressed", x === k ? "true" : "false");
      });
      note.set("**" + PLANP[k].n + "**：" + PLANP[k].t);
    }
    var row = el("div", { class: "picks", role: "group", "aria-label": "平面圖上的各個部分" });
    keys.forEach(function(k) {
      chips[k] = on(el("button", { type: "button", class: "pk", "aria-pressed": "false", text: PLANP[k].n }), "click", function() { show(k); });
      row.appendChild(chips[k]);
      Array.prototype.forEach.call(pl.querySelectorAll('[data-part="' + k + '"]'), function(n) { on(n, "click", function() { show(k); }); });
    });
    var stage = el("div", { class: "stage" }, [
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: "點一個，看它是什麼" })]),
      row,
      el("div", { class: "lcw act", role: "img", "aria-label": "平面圖示意：灰色長條、藍色方塊（棧）、一個有紅框的方塊，左邊寫著「大門」和一個向左的箭頭" }, [pl]),
      el("p", { class: "capn", text: "示意圖：照真的平面圖的畫法畫的，形狀是編的。" })
    ]);
    show(keys[0]);
    return [stage, note];
  }
  /* 「大門處或是出入口在你哪一邊，圖要怎麼轉」：中間是平面圖，四周是藥局的前、後、左、右；選大門處或是出入口在你的哪一邊，圖就轉到「大門」也在那一邊 */
  function demoTurn() {
    var ang = 0, btns = [], note = noteBox("");
    var tp = el("div", { class: "tp" }, [planEl("K2", true)]);
    var door = el("div", { class: "dch l", text: "🚪 大門處或是出入口" }), gap = el("div", { class: "dg l", "aria-hidden": "true" });
    var arena = el("div", { class: "arena", role: "img" }, [
      el("span", { class: "ax f", "aria-hidden": "true", text: "▲ 前面" }), el("span", { class: "ax b", "aria-hidden": "true", text: "後面" }),
      el("span", { class: "ax l", "aria-hidden": "true", text: "左手邊" }), el("span", { class: "ax r", "aria-hidden": "true", text: "右手邊" }), gap, door, el("div", { class: "tpw" }, [tp])
    ]);
    var SIDE = { f: "上面", r: "右邊", b: "下面", l: "左邊" };
    function pick(i) {
      var t = TURNS[i];
      ang += ((t.deg - ang) % 360 + 540) % 360 - 180;   /* 走最短的那一邊：從 270 度回 0 度，是再轉 90 度，不是倒轉一大圈 */
      tp.style.transform = "rotate(" + ang + "deg)";
      door.className = "dch " + t.d;
      gap.className = "dg " + t.d;
      arena.setAttribute("data-door", t.d);
      arena.setAttribute("aria-label", "示意圖：大門處或是出入口在你的" + t.l + "；平面圖" + t.tn + "，圖上的「大門」也在" + t.l + "；紅框在圖的" + SIDE[t.red]);
      btns.forEach(function(b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      note.set(t.say);
    }
    var row = el("div", { class: "picks", role: "group", "aria-label": "大門處或是出入口在你的哪一邊" });
    TURNS.forEach(function(t, i) {
      var b = on(el("button", { type: "button", class: "pk", "aria-pressed": "false", text: t.l }), "click", function() { pick(i); });
      btns.push(b);
      row.appendChild(b);
    });
    var stage = el("div", { class: "stage" }, [
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: "大門處或是出入口在你的…（點一個）" })]),
      row,
      arena,
      el("p", { class: "capn", text: "示意圖：你站在藥局中間，面對手機上方；虛線框是藥局的四面牆，粗線和小牌子是大門處或是出入口。圖是編的。" })
    ]);
    pick(0);
    return [stage, note];
  }
  /* LINE 輸入列：上面那排按鈕（chips）＋下面的輸入框；hot＝圈起來的那一顆（mic 或按鈕）；pick＝按鈕可以點，點了換下面的說明 */
  function demoQbar(d) {
    var note = noteBox(""), chipEls = {};
    var bar = el("div", { class: "qbar", role: d.pick ? "group" : "img", "aria-label": d.chips ? "LINE 的輸入框，上面有一排按鈕：網頁、教學、藥品通知、BUG" : "LINE 的輸入框，最右邊是麥克風" });
    if (d.chips) {
      var row = el("div", { class: "qrow" });
      QCHIPS.forEach(function(c) {
        var on_ = d.hot === c.k;
        if (d.pick) {
          chipEls[c.k] = el("button", { type: "button", class: "qchip", "aria-pressed": "false", text: c.t });
          on(chipEls[c.k], "click", function() { showChip(c.k); });
        } else chipEls[c.k] = el("span", { class: "qchip" + (on_ ? " on" : ""), "aria-hidden": "true", text: c.t });
        row.appendChild(chipEls[c.k]);
      });
      bar.appendChild(row);
    }
    bar.appendChild(el("div", { class: "inbar", "aria-hidden": "true" }, [
      el("span", { class: "inic", text: "＋" }), el("span", { class: "inic", text: "📷" }), el("span", { class: "inic g", text: "🖼" }),
      el("span", { class: "inbox" }, [el("span", { text: "Aa" }), el("span", { text: "☺" })]),
      el("span", { class: "inic" + (d.hot === "mic" ? " on" : ""), text: "🎤" })
    ]));
    function showChip(k) {
      QCHIPS.forEach(function(c) { chipEls[c.k].setAttribute("aria-pressed", c.k === k ? "true" : "false"); if (c.k === k) note.set(c.n); });
    }
    var kids = [bar];
    if (d.cmd) kids.push(el("div", { class: "cmd", text: d.cmd }));
    var stage = el("div", { class: "stage" }, [el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: d.pick ? "按按看" : "在這裡" })])].concat(kids));
    if (d.pick) showChip(QCHIPS[0].k);
    return [stage, note];
  }
  function tipsEl(items) {
    return el("div", { class: "tiles" }, items.map(function(it) {
      return el("div", { class: "tile" }, [el("span", { class: "e", "aria-hidden": "true", text: it.e }), el("b", { text: it.b }), el("span", { class: "s", text: it.s })]);
    }));
  }
  function secView(s) {
    var sec = el("section", { class: "sec" }, [
      el("div", { class: "sec-h" }, [el("h2", { text: s.t })]),
      el("p", { class: "lead" }, [rich(s.p)])
    ]);
    var k = s.d.k;
    var parts = k === "sh" || k === "cmds" ? devDemo(s.d) : k === "anat" ? demoAnat(s.d) : k === "plan" ? demoPlan() : k === "turn" ? demoTurn() : k === "qbar" ? demoQbar(s.d) : demoChat(s.d);
    if (s.tips && s.tipsFirst) sec.appendChild(stepsEl(s.tips));   /* tipsFirst：放在示範區前面、編號 1 2 3 的「步驟」（看平面圖的三個步驟） */
    sec.appendChild(parts[0]);
    if (s.tips && !s.tipsFirst) sec.appendChild(tipsEl(s.tips));
    sec.appendChild(parts[1]);
    if (s.note) sec.appendChild(noteBox(s.note));
    if (s.warn) sec.appendChild(el("div", { class: "warnbox" }, [rich(s.warn)]));
    return sec;
  }

  /* 「動手試試」：回 LINE 聊天室並先填好字（按送出才會送）。沒有從 LINE 帶來官方帳號 ID 就只留一句說明 */
  function trySec(t) {
    var sec = el("section", { class: "sec" }, [el("div", { class: "sec-h" }, [el("h2", { text: "動手試試" })]), el("p", { class: "lead" }, [rich(t.p)])]);
    var text = "", cap = "";
    if (!S.b) {
      sec.appendChild(el("p", { class: "cap", text: "想馬上試？回 LINE 聊天室，照上面的說明做做看。（從 LINE 的「📖 教學」點進來，這裡就會有一鍵回聊天室的按鈕。）" }));
      return sec;
    }
    if (t.kind === "text") { text = t.text; cap = t.hint; }
    else if (t.kind === "code" && S.c) { text = S.c; cap = "會回到 LINE 聊天室，已經幫你填好一支真的藥的 CODE「" + text + "」，按送出就行。"; }
    else if (t.kind === "name" && S.n) { text = S.n; cap = "會回到 LINE 聊天室，已經幫你填好一支真的藥「" + text + "」，按送出就行。"; }
    else if (t.kind === "typo" && S.n) { text = S.n; cap = "會回到 LINE 聊天室，已經幫你填好一支真的藥名「" + text + "」；先把其中一個字改成別的字，再按送出。"; }
    else if (t.kind === "loc" && S.l) { text = S.l; cap = "會回到 LINE 聊天室，已經幫你填好一個真的位置「" + text + "」，按送出就行。"; }
    else if (t.kind === "fam" && (S.f || S.n)) { text = "." + (S.f || S.n); cap = "會回到 LINE 聊天室，已經幫你填好「" + text + "」，按送出就行。"; }
    else cap = t.hint || "會回到 LINE 聊天室，照上面的說明做做看。";
    sec.appendChild(el("a", { class: "btn", href: lineUrl(text), rel: "noopener noreferrer", text: t.label || "在 LINE 試試看" }));
    sec.appendChild(el("p", { class: "cap", text: cap }));
    return sec;
  }
  function recapSec(items) {
    return el("section", { class: "sec" }, [
      el("div", { class: "sec-h" }, [el("h2", { text: "重點回顧" })]),
      el("ol", { class: "rc" }, items.map(function(t, i) { return el("li", {}, [el("span", { class: "rn", "aria-hidden": "true", text: String(i + 1) }), el("div", {}, [rich(t)])]); }))
    ]);
  }
  function quizSec(Q, onOk) {
    var res = el("div", { class: "res", role: "status" }), btns = [];
    var sec = el("section", { class: "sec", "aria-labelledby": "quiz-h" }, [
      el("div", { class: "sec-h" }, [el("h2", { id: "quiz-h", text: "隨堂檢測" })]),
      el("p", { class: "q", text: Q.q }),
      el("p", { class: "hint", text: Q.h })
    ]);
    var box = el("div", { role: "group", "aria-label": "選一個答案" });
    Q.o.forEach(function(t, i) {
      var b = on(el("button", { type: "button", class: "opt" }, [el("span", { class: "ol", "aria-hidden": "true", text: "ABCD".charAt(i) }), el("span", { text: t })]), "click", function() {
        res.textContent = "";
        if (i === Q.a) {
          btns.forEach(function(x) { x.disabled = true; });
          b.classList.add("ok");
          res.className = "res ok";
          res.appendChild(document.createTextNode("✓ 答對了！"));
          res.appendChild(el("span", { text: Q.why }));
          onOk();
        } else {
          b.classList.add("no");
          b.disabled = true;
          res.className = "res no";
          res.appendChild(document.createTextNode("還不是這個，再選一次。"));
        }
      });
      btns.push(b);
      box.appendChild(b);
    });
    sec.appendChild(box);
    sec.appendChild(res);
    return sec;
  }

  /* ───────── 目錄（章節分組、一課一列）───────── */
  function lessonRow(l, done, curId, kind) {
    var st = done[l.id] ? "done" : "";
    if (curId === l.id) st = st ? st + " cur" : "cur";
    var cls = "lrow" + (st ? " " + st : "");
    return el("a", { class: cls, href: "#/l/" + l.id, "aria-current": curId === l.id ? (kind === "toc" ? "page" : "step") : null }, [
      el("span", { class: "li", "aria-hidden": "true", text: done[l.id] ? "✓" : "▷" }),
      el("span", { class: "ln" }, [l.name, done[l.id] ? el("span", { class: "sr", text: "（已學）" }) : null])
    ]);
  }
  function chapters(done, curId, kind) {
    var wrap = el("div", { class: "chaps" });
    CH.forEach(function(c, ci) {
      var ls = LESSONS.filter(function(l) { return l.ch === ci; });
      var dn = ls.filter(function(l) { return done[l.id]; }).length;
      var lid = kind + "-ch" + ci;
      var chev = el("span", { class: "chev", "aria-hidden": "true", text: "▾" });
      var head = el("button", { type: "button", class: "chap-h", "aria-expanded": "true", "aria-controls": lid }, [chev, el("span", { text: c.n }), el("span", { class: "chap-c", text: dn + " / " + ls.length })]);
      var ol = el("ol", { class: "lessons", id: lid }, ls.map(function(l) { return el("li", {}, [lessonRow(l, done, curId, kind)]); }));
      on(head, "click", function() {
        var open = head.getAttribute("aria-expanded") === "true";
        head.setAttribute("aria-expanded", open ? "false" : "true");
        ol.hidden = open;
        chev.textContent = open ? "▸" : "▾";
      });
      wrap.appendChild(el("section", { class: "chap" }, [head, ol]));
    });
    return wrap;
  }

  /* ───────── 畫面 ───────── */
  function setTop(kids) { topEl.textContent = ""; topEl.appendChild(el("div", { class: "bar-in" }, kids)); }
  function resetBox() {
    var box = el("div", { class: "reset" });
    /* 按鈕換掉的時候，鍵盤焦點要跟著：問的時候落在「不要」（比較安全的那顆），按「不要」就回到「清除學習進度」 */
    function ask(refocus) {
      box.textContent = "";
      var b0 = on(el("button", { type: "button", class: "link", text: "清除學習進度" }), "click", function() {
        box.textContent = "";
        box.appendChild(el("p", { role: "alert", text: "確定要清除嗎？每一課會變回「還沒學」，不能復原。" }));
        var no = on(el("button", { type: "button", class: "sbtn", text: "不要" }), "click", function() { ask(true); });
        box.appendChild(el("div", { class: "row" }, [
          no,
          on(el("button", { type: "button", class: "sbtn danger", text: "清除" }), "click", function() { store.del("done"); render(); })
        ]));
        try { no.focus(); } catch (e) {}
      });
      box.appendChild(b0);
      if (refocus === true) { try { b0.focus(); } catch (e) {} }
    }
    ask(false);
    return box;
  }
  function outlineView() {
    var done = getDone(), nx = nextLesson(done), n = doneCount(done), pct = pctOf(done);
    escFn = null;
    setTop([el("div", { class: "ttl" }, [el("span", { class: "t", text: "補藥神器 開發者教學" })])]);
    botEl.hidden = true;
    root.className = "wrap";
    var fill = el("i");
    fill.style.width = pct + "%";
    var cta = nx
      ? el("a", { class: "cta", href: "#/l/" + nx.id, text: (n ? "繼續學：" : "開始學：") + nx.name })
      : el("a", { class: "cta sec2", href: "#/l/" + LESSONS[0].id, text: "全部學完了！從頭複習" });
    var kids = [
      el("section", { class: "hero" }, [
        el("span", { class: "tag-dev", text: "🔒 開發者專用" }),
        el("h1", { text: "開發者功能，看一遍就會用" }),
        el("p", { class: "sub", text: N + " 課。新增藥品、改資料、批次匯入、清單校對、維護指令、開發者網頁，點哪一課都可以，學到哪裡都記得。" }),
        el("div", { class: "prog" }, [
          el("div", { class: "prog-r" }, [el("span", { text: "已學 " + n + " / " + N + " 課" }), el("b", { text: pct + "%" })]),
          el("div", { class: "track", role: "progressbar", "aria-label": "學習進度", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) }, [fill])
        ]),
        cta
      ]),
      el("h2", { class: "all", text: "全部課程" }),
      chapters(done, nx ? nx.id : "", "ol"),
      el("div", { class: "foot" }, "這一頁只講怎麼用，不含任何帳號、密碼或金鑰；指令只有開發者的 LINE 帳號打了才有用。學習進度只記在這支手機裡，不會傳給別人。示範用的藥、CODE、代號、驗證碼都是編的，不是真的資料。"),
      resetBox()
    ];
    return { title: "補藥神器 開發者教學", kids: kids };
  }
  function lessonView(id) {
    var L = lessonById(id), li = lessonIdx(id), done = getDone();
    var ttl = on(el("button", { type: "button", class: "ttl", "aria-expanded": "false", "aria-controls": "toc", "aria-label": L.name + "，點一下看全部課程" }, [el("span", { class: "t", text: L.name }), el("span", { class: "ar", "aria-hidden": "true", text: "▾" })]), "click", function() { toggleToc(); });
    var toc = el("div", { class: "toc", id: "toc", hidden: true }, [el("div", { class: "toc-in" }, [el("a", { class: "toc-back", href: "#/", text: "‹ 回課程目錄" }), chapters(done, L.id, "toc")])]);
    on(toc, "click", function(ev) { var t = ev.target; while (t && t !== toc) { if (t.tagName === "A") { closeToc(); return; } t = t.parentNode; } });
    setTop([ttl, el("span", { class: "tag", text: "第 " + (li + 1) + " 課 / " + N })]);
    topEl.appendChild(toc);
    function closeToc() { toc.hidden = true; ttl.setAttribute("aria-expanded", "false"); }
    function toggleToc() { var open = toc.hidden; toc.hidden = !open; ttl.setAttribute("aria-expanded", open ? "true" : "false"); }
    escFn = function() { if (toc.hidden) return false; closeToc(); try { ttl.focus(); } catch (e) {} return true; };

    root.className = "wrap bot";
    var kids = [];
    L.secs.forEach(function(s) { kids.push(secView(s)); });
    kids.push(trySec(L.tryp));
    kids.push(recapSec(L.recap));
    var pct = el("span", { class: "pct", text: pctOf(done) + "%", "aria-label": "已學 " + pctOf(done) + "%" });
    function ok() { if (markDone(L.id)) { var d2 = getDone(); pct.textContent = pctOf(d2) + "%"; pct.setAttribute("aria-label", "已學 " + pctOf(d2) + "%"); } }
    kids.push(quizSec(L.quiz, ok));
    var end = el("div", { class: "end", "aria-hidden": "true" });
    kids.push(end);
    /* 往下捲到最後（看完整課）也算學過 */
    if (typeof IntersectionObserver === "function") {
      try {
        var io = new IntersectionObserver(function(es) { es.forEach(function(e) { if (e.isIntersecting) { ok(); io.disconnect(); } }); });
        io.observe(end);
      } catch (e) {}
    }
    var prev = li > 0
      ? el("a", { class: "nav", href: "#/l/" + LESSONS[li - 1].id }, ["‹ 上一課"])
      : el("a", { class: "nav", "aria-disabled": "true", tabindex: "-1" }, ["‹ 上一課"]);
    var next = li + 1 < N
      ? on(el("a", { class: "nav go", href: "#/l/" + LESSONS[li + 1].id }, ["下一課 ›"]), "click", ok)
      : on(el("a", { class: "nav go", href: "#/" }, ["回目錄 ›"]), "click", ok);
    botEl.textContent = "";
    botEl.appendChild(el("div", { class: "bot-in" }, [prev, pct, next]));
    botEl.hidden = false;
    return { title: L.name + "・補藥神器 開發者教學", kids: kids };
  }

  /* ───────── 換頁 ───────── */
  function render() {
    var h = location.hash || "", m, v;
    if ((m = h.match(/^#\/l\/([a-z]+)(?:\/\d+)?$/)) && lessonById(m[1])) v = lessonView(m[1]);
    else v = outlineView();
    root.textContent = "";
    v.kids.forEach(function(k) { root.appendChild(k); });
    document.title = v.title;
    try { window.scrollTo(0, 0); } catch (e) {}
    try { root.focus({ preventScroll: true }); } catch (e) {}
  }

  /* 開頭：讀 LINE 帶進來的資訊（#b=…），存起來、從網址列拿掉；之後的換頁用 #/… */
  (function boot() {
    loadS();
    var h = location.hash, go = "";
    if (h && h.length > 1 && h.charAt(1) !== "/") {
      var o = parseParams(h), got = false;
      Object.keys(S).forEach(function(k) { if (o[k] !== undefined) { S[k] = clean(k, o[k]); got = true; } });
      if (got) saveS();
      if (o.go && lessonById(o.go)) go = o.go;
      var clear = location.pathname + location.search + (go ? "#/l/" + go : "");
      try { history.replaceState(null, "", clear); } catch (e) { location.hash = go ? "#/l/" + go : "#/"; }
    }
    window.addEventListener("hashchange", render);
    document.addEventListener("keydown", function(ev) { if (ev.key === "Escape" && escFn) escFn(); });
    render();
  })();
})();
