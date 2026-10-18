/* 補藥神器開發者教學 v11.22.2 beta：開發者專用；不登入、不連任何網站；畫面上的藥、CODE、代號全是編出來的示範。這個檔沒有任何秘密。 */
(function() {
  "use strict";
  /* ═══ 補藥神器開發者教學網頁（第 16 批；從藥師版教學改出來，只放開發者用的功能）═══
     不登入、不連任何網站：沒有 fetch、沒有外部網址，畫面上的藥全是編的示範。藥品卡片、列表卡、平面圖都是用元素＋CSS 畫出來的（五張小圖放在最上面 :root 的 --i-* 變數）。
     只有兩樣東西會「記」在這支手機裡：學習進度、從 LINE「教學」帶進來的「回聊天室」資訊（見最下面 boot）。
     排法照氛圍學院：目錄頁（#/）＝章節分組、一課一列；一課的頁（#/l/課名）＝白底區塊一塊接一塊往下捲，最後有「重點回顧」，最下面固定「上一課／下一課」。 */
  var root = document.getElementById("main"), topEl = document.getElementById("top"), botEl = document.getElementById("bot");
  var NS = "buyao_learndev_", mem = {};
  var store = {
    get: function(k) { try { var v = localStorage.getItem(NS + k); if (v !== null) return v; } catch (e) {} return mem[k] === undefined ? null : mem[k]; },
    set: function(k, v) { mem[k] = v; try { localStorage.setItem(NS + k, v); } catch (e) {} },
    del: function(k) { delete mem[k]; try { localStorage.removeItem(NS + k); } catch (e) {} }
  };
  var REDUCE = false, escFn = null;   /* escFn：目前這一頁「按 Esc 要關掉的東西」（一課的頁＝展開的課名目錄） */
  try { REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}
  /* 網頁版的網址：跟這份教學放在 GitHub 的同一個資料夾（教學是 …/learn.html，網頁版是 …/）。只有 http(s) 才算；本機直接開檔案就空著。教「用電腦開網頁版」那一步會寫出來，不用再去問人網址 */
  var APP_URL = "";
  try { if (/^https?:$/.test(location.protocol)) APP_URL = location.origin + location.pathname.replace(/[^\/]*$/, ""); } catch (e) {}
  var APP_HOST = "";   /* 這一頁的網址列（示範畫面上的網址：LINE 內建瀏覽器的標題下面那一行） */
  try { if (/^https?:$/.test(location.protocol)) APP_HOST = location.host; } catch (e) {}

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
     b＝官方帳號的 ID（@xxxx，給「在 LINE 試試看」開聊天室用）；c／n／l／f＝LINE 那邊挑的一個真的品項藥品的 CODE／中文名／位置／家族字。
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
     keys（示範區下面灰底的「記住 n 件事」）、tryp（動手試試）、recap（重點回顧）。
     示範區 d：chat＝LINE 聊天的假畫面（ch＝可以點選的幾種情況；每種有 m 聊天內容、n 下面的說明；一種就只有重播鍵）、anat＝在真的卡片上點名稱看每一塊、
     plan＝平面圖上點名稱看每一塊、turn＝「大門在你哪一邊，圖要怎麼轉」、qbar＝LINE 輸入列、sim＝練習聊天室（自己打字、按送出，深色框說明機器人怎麼找；pre 只打前幾個字的範例字（第一個也是自動示範的那個）、ex 其他查法的範例字、bad 故意打錯的字）。
     聊天內容 m：me 自己說的、bot 官方帳號回的、dc 一張藥品卡片、car 一排卡片（往左滑）、ll 列表卡、ask「是這個藥品？」卡、pl 大張平面圖、
     act 一句動作說明、pic 照片、voice 語音、hand 手寫。卡片都是照真的卡片畫的示意，藥名、位置全是編的。 */
  function me(t) { return { w: "me", t: t }; }
  function bot(t) { return { w: "bot", t: t }; }
  /* act：一句動作說明（👆 按「…」）。示範的時候，這句一出來，會有一隻手指在上一張卡片（或畫面）裡「按」那一顆按鍵：
     tap 不寫＝照句子裡第一個「」裡的字，在前面的卡片找一樣寫著這幾個字的那一塊；寫一個選擇器（字串）＝在前面的卡片找這個；寫 [選擇器, 第幾個] ＝同樣的選擇器找到好幾個，要第幾個；寫 false ＝這句不按（按的東西不在聊天室裡）。 */
  function act(t, tap) { return { w: "act", t: t, tap: tap }; }
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
  function cdc() { return { w: "cd" }; }   /* LINE 回的「🔐 補藥神器 網頁驗證碼」卡片（用電腦開網頁版那一段） */
  function br(o) { return { w: "br", o: o || {} }; }   /* 電腦的瀏覽器視窗（網頁的代號登入畫面）。o.st：load 剛打開、code 有代號、copied 按了複製、type 打好 6 位數、ok 登入成功；o.hot：code／copy／input／go 圈起來的那一塊 */
  function lp(o) { return { w: "lp", o: o || {} }; }   /* LINE 內建瀏覽器裡的這份教學。o.pg：toc 目錄頁、lesson 一課的頁；o.hot：row／stage／next／title／close */
  function qb(k) { return { w: "qb", k: k }; }   /* LINE 的輸入框（上面一排小按鈕＋下面的輸入框），k＝圈起來的那顆按鈕（web／guide／notice／bug）：「按輸入框上面的…」那一步，先畫出它在哪裡，手指再去按 */
  function gd(o) { return { w: "gd", o: o || {} }; }   /* LINE 回的「📖 補藥神器　教學」卡片（有藍色的「開始學習」）。o.hot：圈起「開始學習」 */
  function jn(k) { return { w: "jn", k: k }; }
  function sc(k, hot) { return { w: "sc", k: k, hot: !!hot }; }   /* 第 21 批：同事手機的截圖（page＝LINE 聊天頁整頁、scan＝掃描畫面）；hot＝畫面上有手指要按的地方（掃描鈕） */
  function fr(o) { return { w: "fr", o: o || {} }; }   /* 第 21 批：掃到 QR 之後 LINE 跳出的「補藥神器」小視窗（綠色的「加入」）。o.hot：圈起「加入」 */
  /* 第 21 批：同事一加入，官方帳號自己送的歡迎文字（字照 07_操作.gs 的 _followWelcomeText_(false, true)；AI 提醒那句照 02 的 PHOTO_AI_WARN_SHORT）。放在課程資料前面，課程資料才拿得到 */
  var FW = "👋 歡迎使用補藥神器！\n\n這裡可以查藥品放在哪裡：\n・打字：CODE、藥名（中文或英文前幾個字）、學名或位置（例如 K2）\n・拍照：藥盒、鋁箔、瓶身，或手寫的藥名\n・語音：按住麥克風，講藥名或 CODE\n\n⚠️ AI 可能讀錯，請核對藥櫃標籤紙。\n\n輸入框上面那排按鈕一直都在：\n・🌐 網頁：開網頁版\n・📖 教學：功能教學\n・📢 藥品通知：停止供貨、改包裝、缺貨\n・🛠 BUG：回報問題\n・👥 加入補藥神器：邀請同事一起用\n\n第一次用，先按下面卡片的「開始學習」。";   /* LINE 回的「加入補藥神器」兩則（照 07_操作.gs 的 _joinQrCard_、_joinStepsCard_）。k：qr＝「👥 邀請同事一起用」（QR）、steps＝「加入只要 3 步」（第 21 批起：左右滑的 4 張圖卡） */
  var DEMO_SIX = "482915";   /* 編的 6 位數驗證碼（跟 cdEl 那張卡片是同一組） */
  var DEMO_CODE = "Kd7mPq4Xr";   /* 編的示範代號：9 個英數字（沒有 I O l o 0 1），真的代號是網頁每次向後端要的，這一組領不到任何東西 */
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
    "90114": { b: "TESTBETA* 50MG TAB", z: "示範貝他錠 50 毫克", g: "TESTOLOL HCL", f: "錠劑", w: 0, ind: "高血壓、心絞痛", loc: "K3", ph: 1 },
    "90115": { b: "TESTLOL-X* 25MG TAB", z: "示範洛得 X 錠 25 毫克", g: "TESTOLOL HCL", f: "錠劑", w: 0, ind: "高血壓", loc: "A3", ph: 0 },
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
     文字還可以：mono 等寬字、ls 字距（em）、u 底線、rich（字裡面 **這樣** 的地方變粗體）；直排 gx([…], {bg 底色, r 圓角, p 內距（px／py 只有左右／上下）, bd 框線顏色（bs＝線的樣子，例 "dashed"；bw＝線的粗細，預設 1.5）, hh 固定高度（例 34）, op 透明度, sp 子項之間的距離, m, f, w 寬（wp＝佔上一層的百分比）, jc, ai, ar 長寬比（例 "3 / 4"）, pos 讓裡面有 abs 的子項浮在上面, abs 浮在角落 {t 上, r 右, b 下, l 左}, cls 多加一個 class 名})；橫排 gh 同上；
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
  /* 練習聊天室（_learn_dev_sim.js 的畫面）裡的卡片是「活的」：有 send 的那一格（格子的每一列、「👀 預覽、存檔」、「✏️ 修改」的欄位按鈕…）可以點、可以用鍵盤按（Tab 走過去、Enter 或空白鍵），
     點下去 = 跟真的 LINE 上點那顆按鈕一樣，丟給練習聊天室的機器人。gAct＝畫這一串訊息的時候「點下去要找誰」（練習聊天室畫之前才設、畫完就清掉）；課文裡靜態的示範沒有設，卡片就只是畫面。
     send＝{ m: 送出的字 }（message 按鈕）或 { p: postback 的字, d: 聊天室多出來的那句字（沒有就不多）, fill: 輸入框要先填好的字 }。 */
  var gAct = null;
  function gwire(e, n) {
    var h = gAct, lab = n.al || gtexts(n, []).join("，"), send = n.send;
    e.className += " gact";
    e.setAttribute("role", "button");
    e.setAttribute("tabindex", "0");
    e.setAttribute("aria-label", lab);
    e.setAttribute("data-send", send.p !== undefined ? "p:" + send.p : send.web !== undefined ? "web:" + send.web : "m:" + send.m);   /* 測試用：這顆按鈕按下去送的是什麼（p:＋postback 的字，或 m:＋打出去的字） */
    on(e, "click", function() { h(send, lab); });
    on(e, "keydown", function(ev) { if (ev.key === "Enter" || ev.key === " " || ev.keyCode === 13 || ev.keyCode === 32) { ev.preventDefault(); h(send, lab); } });
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
      if (n.bd) e.style.border = gu(n.bw === undefined ? 1.5 : n.bw) + " solid " + n.bd;
    } else {
      e = el("div", { class: "gx" + (n.h ? " h" : "") });
      if (n.bg) e.style.background = n.bg;
      if (n.r !== undefined) e.style.borderRadius = gu(gnum(n.r, GR, 0));
      if (n.p !== undefined) e.style.padding = gu(gnum(n.p, GP, 0));
      if (n.pt !== undefined) e.style.paddingTop = gu(gnum(n.pt, GP, 0));
      if (n.pb !== undefined) e.style.paddingBottom = gu(gnum(n.pb, GP, 0));
      if (n.px !== undefined) { e.style.paddingLeft = gu(gnum(n.px, GP, 0)); e.style.paddingRight = gu(gnum(n.px, GP, 0)); }
      if (n.py !== undefined) { e.style.paddingTop = gu(gnum(n.py, GP, 0)); e.style.paddingBottom = gu(gnum(n.py, GP, 0)); }
      if (n.bd) e.style.border = gu(n.bw === undefined ? 1.5 : n.bw) + " " + (n.bs || "solid") + " " + n.bd;
      if (n.op !== undefined) e.style.opacity = n.op;
      if (n.jc) e.style.justifyContent = n.jc;
      if (n.ai) e.style.alignItems = n.ai;
      if (n.pos) { e.style.position = "relative"; e.style.overflow = "hidden"; }
      var g = n.sp === undefined ? 0 : gnum(n.sp, GP, 0);
      (n.kids || []).forEach(function(c, i) { e.appendChild(gnode(c, !!n.h, g, i === 0)); });
    }
    if (n.ar) e.style.aspectRatio = n.ar;
    if (n.hh !== undefined) e.style.height = gu(n.hh);   /* 固定高度（Flex 的 height；例：位置查核每一列的打勾框 34、照片 52）*/
    if (n.cls) e.className += " " + n.cls;
    if (n.send && gAct) gwire(e, n);
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
    card = el("div", { class: "gk", role: gAct ? "group" : "img", "aria-label": m.alt || ((m.bar ? "網頁畫面示意：" : gAct ? "LINE 卡片：" : "LINE 卡片示意：") + all.join("；")) });   /* 活的卡片裡有按鈕，不能是 img（讀屏軟體會把裡面的按鈕當成圖的一部分，讀不到） */
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
  /* Google 試算表：m.tabs 全部分頁、m.tab 現在這一頁、m.cols 欄名、m.rows 每一列（第一列＝標題列；m.nohd＝這一頁沒有標題列，第一列也是資料）、m.bad 紅底的列（從 0 算）、m.nt 有註解的格 [列, 欄]、m.note 下面的說明、m.cap 給讀屏的一句話 */
  function shEl(m) {
    var cols = m.cols || m.rows[0].map(function(x, i) { return "ABCDEFGHIJ".charAt(i); });
    var bad = m.bad || [], nts = m.nt || [];
    var tabs = el("div", { class: "sh-tabs", "aria-hidden": "true" }, (m.tabs || [m.tab]).map(function(t) { return el("span", { class: "sh-tab" + (t === m.tab ? " on" : ""), text: t }); }));
    var head = el("tr", {}, [el("th", { scope: "col", class: "sr", text: "列" })].concat(cols.map(function(c) { return el("th", { scope: "col", text: c }); })));
    var body = m.rows.map(function(r, i) {
      var tds = r.map(function(v, j) {
        var isNote = nts.some(function(p) { return p[0] === i && p[1] === j; });
        return el("td", { class: (i === 0 && !m.nohd ? "hd" : "") + (isNote ? " nt" : ""), text: v === null || v === undefined ? "" : String(v) });
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
    if (d.k === "dsim") return demoDsim(d);   /* 練習聊天室（_learn_dev_sim.js） */
    var body = d.k === "sh" ? shEl(d) : cmdsEl(d.items);
    var stage = el("div", { class: "stage" }, [
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: d.ttl || (d.k === "sh" ? "試算表長這樣" : "指令") })]),
      body,
      el("p", { class: "capn", text: d.capn || (d.k === "sh" ? "示意圖：Google 試算表的樣子，資料是編的。" : "照真的指令整理的；打在跟補藥神器的一對一聊天室，只有開發者有用。") })
    ]);
    return [stage, noteBox("")];
  }
  /* ───── 練習聊天室的藥品卡片（o.row）灰底框裡的東西：照真的卡片的順序（01 的 extraBox_）─────
     ⚠️ 注意（紅框）→ 曾用藥品（試算表裡用換行分的，卡片上也一行一個）→ 適應症 → 藥品特徵（沒有照片：一列；有照片：特徵超過 12 個字、或不是水劑，放在照片上面的藍框，不然放在照片旁邊的小框）→ 照片。
     全部都沒有、也沒有照片，就沒有這個灰底框。回 { el: 灰底框, said: 給讀屏的幾句話 }；沒有回 null。 */
  function devBr(v) { return String(v === null || v === undefined ? "" : v).replace(/<br\s*\/?>/gi, "\n").replace(/\r\n?/g, "\n"); }
  function devOldOf(v) {
    var s = devBr(v).trim(), list = s ? s.split(/\s*[»>,、\n]\s*/).filter(function(x) { return x !== ""; }) : [];
    return { list: list, nl: list.length > 1 && s.indexOf("\n") >= 0 };
  }
  function devExtras(r, hasNote) {
    var pair = devBr(r.pair).trim(), ind = devBr(r.ind).trim(), feat = devBr(r.feat).trim(), ol = devOldOf(r.old), photo = !!r.ph, liq = !!r.w;
    var rows = [], said = [], pan, row, col, pw, spans, top, tile;
    if (pair) {
      rows.push(el("div", { class: "lc-pair", "data-part": "pair" }, [el("div", { class: "lc-pl", text: "⚠️ 注意" }), el("div", { class: "lc-pt", text: pair })]));
      said.push("紅框「注意」寫著 " + pair.replace(/\s*\n\s*/g, "，"));
    }
    if (ol.list.length) {
      rows.push(el("div", { class: "lc-xl" + (rows.length ? " m" : ""), text: "曾用藥品" }));
      if (ol.nl) rows.push(el("div", { class: "lc-xt", "data-part": "old", text: ol.list.join("\n") }));
      else {
        spans = [];
        ol.list.forEach(function(n, i) { if (i > 0) spans.push(el("span", { class: "s", text: "、" })); spans.push(el("span", { text: n })); });
        rows.push(el("div", { class: "lc-xt", "data-part": "old" }, spans));
      }
      said.push("曾用藥品 " + ol.list.join("、"));
    }
    if (ind) {
      rows.push(el("div", { class: "lc-xl" + (rows.length ? " m" : ""), text: "適應症" }));
      rows.push(el("div", { class: "lc-xt", "data-part": "ind", text: ind }));
      said.push("適應症 " + ind.replace(/\s*\n\s*/g, "，"));
    }
    top = !!feat && photo && (feat.length > 12 || !liq);
    tile = feat && photo && !top ? feat : "";
    if (feat && !photo) {
      rows.push(el("div", { class: "lc-xl f" + (rows.length ? " m" : ""), text: "🔍 藥品特徵" }));
      rows.push(el("div", { class: "lc-xt f", "data-part": "feat", text: feat }));
    }
    if (feat) said.push("藥品特徵 " + feat.replace(/\s*\n\s*/g, "，"));
    if (photo) said.push("有藥品照片");
    if (!rows.length && !photo) return null;
    pan = el("div", { class: "lc-pan" + (hasNote ? "" : " fst") + (photo ? "" : " lc-rows") });
    if (!photo) {
      rows.forEach(function(x) { pan.appendChild(x); });
      return { el: pan, said: said };
    }
    row = el("div", { class: "lc-pr" + (rows.length ? "" : " end") });
    if (rows.length) {
      col = el("div", { class: "lc-col" });
      rows.forEach(function(x) { col.appendChild(x); });
      row.appendChild(col);
    }
    pw = el("div", { class: "lc-pw", "data-part": "photo" });
    if (tile) pw.appendChild(el("div", { class: "lc-pf" }, [el("div", { text: "🔍 特徵" }), el("div", { text: tile })]));
    pw.appendChild(el("div", { class: "lc-ph" + (liq ? " w" : "") }));
    row.appendChild(pw);
    if (top) pan.appendChild(el("div", { class: "lc-feat", "data-part": "feat" }, [el("div", { class: "lc-fl", text: "🔍 藥品特徵" }), el("div", { class: "lc-ft", text: feat })]));
    pan.appendChild(row);
    return { el: pan, said: said };
  }
  /* 一張開發者版的藥品卡片。o.over＝只在畫這一張的時候，把這支藥的幾個欄位換成別的（例：改位置之後的那張卡）；o.row＝練習聊天室裡這支藥現在的樣子（新建的、改過的；課文裡畫的藥不用）：
     灰底框改用 devExtras 畫（多了「注意」「曾用藥品」，順序照真的）、位置沒有平面圖（這一頁的示意圖只有 K2、B1、棧一）就不畫地圖（真的卡片：位置沒有登記平面圖，就只有粉紅色的位置框）；
     o.edit＝最下面多一顆「✏️ 修改」（跟真的卡片一樣：footer 留白 10、按鈕內距 9）；練習聊天室（gAct）裡那顆是真的按鈕（postback edit=CODE） */
  function devPlanHits() {   /* 平面圖指定「棧左」「棧中」「棧右」：紅框亮在棧板最上面那一排（PBLK 的前三塊）。藥師版那一頁只有 K2、B1、棧一三個紅框；PHIT 在這一段之後才建好，所以用到的時候才補 */
    if (!PHIT["棧左"]) { PHIT["棧左"] = PBLK[0].slice(0, 4); PHIT["棧中"] = PBLK[1].slice(0, 4); PHIT["棧右"] = PBLK[2].slice(0, 4); }
  }
  function devLc(code, o) {
    var saved = DR[code], had = Object.prototype.hasOwnProperty.call(DR, code), cd, ed, ex = null, base, lr, gen, lt, lb, lz, loc, map, mp = o.map || "", oo = o;
    devPlanHits();
    if (mp && PHIT[mp]) { oo = gmix({}, o); oo.hit = mp; }   /* 平面圖指定棧左／棧中／棧右：紅框亮在棧板最上面那一排的那一塊 */
    if (o.row) {
      base = gmix({}, o.row);
      ex = devExtras(base, !!o.note);
      base.feat = ""; base.ind = ""; base.ph = 0;   /* 灰底框自己畫，不用藥師版 lcCard 那一套 */
      DR[code] = gmix(base, o.over || {});
    } else if (o.over) DR[code] = gmix(gmix({}, saved), o.over);
    try { cd = lcCard(code, oo); } finally { if (had) DR[code] = saved; else delete DR[code]; }
    if (o.row) {
      lr = cd.querySelector(".lc-lr");
      if (ex && lr) cd.insertBefore(ex.el, lr);
      if (ex && ex.said.length) cd.setAttribute("aria-label", cd.getAttribute("aria-label") + "；" + ex.said.join("；"));
      gen = cd.querySelector(".lc-gen");
      if (gen && !gen.textContent) gen.textContent = "\u00a0";   /* 學名是空的：真的卡片寫一個空白字，還是佔一行的高度 */
      lt = cd.querySelector(".lc-lt");
      if (lt && !lt.textContent) lt.textContent = "-";   /* 位置是空的：真的卡片寫「-」（locationBox_ 的 r.location || "-"） */
      lb = cd.querySelector(".lc-brand");
      if (lb && !lb.textContent) lb.textContent = "-";   /* 商品名、中文名是空的（批次匯入的新藥可以只有其中一個）：真的卡片也寫「-」（r.brand || "-"、r.chName || "-"） */
      lz = cd.querySelector(".lc-zh");
      if (lz && !lz.textContent) lz.textContent = "-";
      if (mp === "none" || (!mp && !o.hit && !o.spots && !PHIT[o.row.loc])) {
        map = cd.querySelector(".lc-map");
        loc = cd.querySelector(".lc-loc");
        if (map && map.parentNode) map.parentNode.removeChild(map);
        if (loc) loc.className += " solo";
        if (mp === "none") cd.setAttribute("aria-label", cd.getAttribute("aria-label") + "；這支藥設成沒有平面圖，卡片上沒有地圖");
      } else if (mp) {
        /* 開發者指定了平面圖（「平面圖 CODE 櫃名」或 ✏️ 修改 → 🗺 平面圖）：這一頁的示意圖只畫得出棧板最上面一排（棧左、棧中、棧右）；其他櫃名只能在示意圖上標一個名字 */
        map = cd.querySelector(".lc-map");
        if (map) map.appendChild(el("div", { class: "lc-mcap", "data-part": "mapcap", text: PHIT[mp] ? "🗺 " + mp : "🗺 " + mp + "（示意）" }));
        cd.setAttribute("aria-label", cd.getAttribute("aria-label") + "；平面圖指定為「" + mp + "」" + (PHIT[mp] ? "" : "（這張示意圖不會換，真的卡片會換成那張平面圖）"));
      }
    }
    if (o.edit) {
      ed = el("div", { class: "lc-edit", "aria-hidden": "true", text: "✏️ 修改" });
      if (gAct) { ed.removeAttribute("aria-hidden"); gwire(ed, { send: { p: "edit=" + code }, al: "✏️ 修改 " + code }); }
      cd.appendChild(ed);
      cd.setAttribute("aria-label", cd.getAttribute("aria-label") + "；最下面有一顆「✏️ 修改」按鈕（只有開發者看得到）");
    }
    return cd;
  }
  /* 貨架照片（位置查核傳的）：一張拍起來的貨架——上面一條位置牌（AI 讀到的字；空的＝牌子被擋住）、下面一排藥盒（盒子上的藥名）、最下面是木板；
     dark＝光線太暗，整張暗暗的、盒子上的字看不清楚。畫面是 CSS 畫的，不是照片；m.what＝讀屏用的「貨架」 */
  function rkEl(m) {
    var boxes = m.shelf || [], said;
    said = m.dark ? "光線太暗，看不清楚" : (m.sign ? "架上的位置牌寫著「" + m.sign + "」" : "位置牌被擋住了，看不到") + "，架上有：" + boxes.join("、");
    return el("div", { class: "pho rk" + (m.dark ? " dk" : ""), role: "img", "aria-label": "傳了一張" + (m.what || "貨架") + "的照片：" + said }, [
      el("div", { class: "rki", "aria-hidden": "true" }, [
        el("div", { class: "rkp" + (m.sign ? "" : " no"), text: m.sign || "" }),
        el("div", { class: "rkr" }, boxes.map(function(t) { return el("span", { class: "rkx", text: t }); }))
      ])
    ]);
  }
  function devIsEd(o) { return !!o && !!(o.edit || o.over || o.row); }
  /* bubble0 的外掛：認得 gc／qr，以及「帶 ✏️ 修改 的藥品卡片」（一張、或一排）；不認得就回 null，照原本的畫 */
  function devBubble(m) {
    var w = m.w;
    if (w === "gc") return el("div", { class: "lcw" }, [gcEl(m)]);
    if (w === "wp") return el("div", { class: "lcw wpw" }, [gcEl(m)]);
    if (w === "qr") return qrEl(m);
    if (w === "gcar") return carEl(m.cs.map(gcEl), m.cs.length + " 張卡片，往左滑看下一張");   /* 位置查核一格超過 12 個品項：一頁一張卡片，往左滑 */
    if (m.shelf) return rkEl(m);
    if (w === "dc" && devIsEd(m.o)) return el("div", { class: "lcw" }, [devLc(m.c, m.o)]);
    if (w === "car" && m.cs.some(function(x) { return devIsEd(x.o); })) return carEl(m.cs.map(function(x) { return devLc(x.c, x.o || {}); }), m.cs.length + " 張藥品卡片，往左滑看下一張");
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
    if (code === "90101" && !o2.fam && !o2.row) o2.fam = FAM1;   /* 練習聊天室（o.row）的藥品家族是現場照試算表排的（dsFam） */
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
      kids.push(gh([gt(s.n, { z: "sm", b: 1, c: on_ ? "#B26A00" : GREEN, f: 2 }), right], { m: i === 0 ? "md" : "sm", bg: on_ ? "#FFF1CC" : "#EFF3F0", r: "md", p: 11, ai: "center", send: { p: "wizfill=" + s.k, a: "「" + s.n + "」那一格" }, al: s.n + "：" + (v || (has ? "不填" : s.skip ? "可不填" : "必填")) + (on_ ? "，現在填這一格" : "") + "。點一下，改填這一格" }));
    });
    bottom = [
      need ? gx([gt("還差 " + need + " 格必填", { z: "sm", c: "#AAAAAA", a: "center" })], { f: 1, bg: "#F2F2F2", r: "md", p: 11 })
           : gx([gt("👀 預覽、存檔", { z: "sm", b: 1, c: "#FFFFFF", a: "center" })], { f: 1, bg: GREEN, r: "md", p: 11, send: { p: "wiz=preview", d: "👀 預覽、存檔" } }),
      gx([gt("✕ 取消", { z: "sm", b: 1, c: "#C62828", a: "center" })], { f: 1, bg: "#FFE9E9", r: "md", p: 11, send: { m: "取消" } })
    ];
    kids.push(gh(bottom, { m: "lg", sp: "sm" }));
    return { w: "gc", pad: 14, kids: kids, alt: "新增藥品的格子：已填 " + filled + "／8" + (need ? "，必填還差 " + need + " 格" : "，必填都填好了") + (cur ? "，黃色的是「" + WZS.filter(function(s) { return s.k === cur; })[0].n + "」那一格" : "") };
  }

  /* ② ✏️ 改（點卡片下面的「✏️ 修改」）：18 顆欄位按鈕，兩顆一排 ─────────────────────────
     o＝練習聊天室才有：o.row 這支藥現在的樣子、o.kinds 每一顆按下去送 effill（手機先把「欄位名＋現在的內容」填進輸入框）還是 ef（位置、劑型有快速按鈕；公告類別、照片…各走各的）；
     有 o.kinds 的卡片是活的（每一顆都能點），課文裡畫的沒有。 */
  var EFL = ["曾用藥品", "商品名", "注意", "小藥庫位置", "適應症", "劑型", "藥品外觀", "📷 換照片", "中文", "藥品特徵", "學名", "公告類別", "藥品查詢參考網站", "公告補充說明", "📷 公告照片", "📍 各區位置", "🗺 平面圖", "📖 縮寫"];
  var EFK = ["old", "brand", "pair", "loc", "note", "form", "photo", "pic", "zh", "feat", "gen", "nk", "ref", "nm", "npic", "zones", "map", "abbr"];
  function editMenuCard(code, notice, o) {
    o = o || {};
    var r = o.row || DR[code], kids, i, live = !!o.kinds;
    function fb(i) {
      var k = EFK[i];
      return gfld(EFL[i], live ? { box: { send: { p: (o.kinds[k] === "effill" ? "effill=" : "ef=") + code + "|" + k, a: "選單的「" + EFL[i] + "」" }, al: EFL[i] + (o.kinds[k] === "effill" ? "：點一下，輸入框先填好「欄位名＋現在的內容」" : k === "loc" || k === "form" ? "：點一下，出現常用選項的小按鈕" : "：點一下") } } : {});
    }
    kids = [
      gt("✏️ 改 " + code, { z: "lg", b: 1, c: "#1F1F1F" }),
      gt((r.b || "") + (r.z ? "　" + r.z : ""), { z: "xs", c: "#8A8A8A", m: "xs" }),
      gt("點一個欄位 → 直接打新內容，不用打 CODE 也不用打欄位名", { z: "xxs", c: "#AAAAAA", m: "sm" }),
      gsep({ m: "md" })
    ];
    if (notice) kids.push(gx([gt("目前的公告", { z: "xxs", c: "#B26A00" }), gt(notice, { z: "sm", b: 1, c: "#B26A00" })], { m: "md", bg: "#FFF6E0", r: "md", p: "sm" }));
    kids.push(gx([gt("📝 一次改多項", { z: "sm", b: 1, c: GREEN, a: "center" }), gt("換廠那種要改五六欄的，走這條比較快", { z: "xxs", c: "#6B8A7C", a: "center", m: "xs" })], gmix({ m: "md", bg: "#E8F5EE", r: "md", p: 12 }, live ? { send: { p: "mef=" + code, a: "選單的「📝 一次改多項」" }, al: "📝 一次改多項：點一下，出現 A～J 十列的卡片" } : null)));
    for (i = 0; i < EFL.length; i += 2) kids.push(gh([fb(i), fb(i + 1)], { sp: "sm", m: i === 0 ? "md" : "sm" }));
    kids.push(gt("點一個欄位 → 直接打新內容送出（手機會先把現在的內容填進輸入框）；多行的欄位可以一句一句加。改完會馬上把新的卡片給您看", { z: "xxs", c: "#AAAAAA", a: "center", m: "md" }));
    return { w: "gc", pad: 14, kids: kids, alt: "「✏️ 改 " + code + "」的選單：最上面一顆「📝 一次改多項」，下面 18 顆欄位按鈕（" + EFL.join("、") + "）" };
  }

  /* ③ 📝 一次改多項：A～J 十列，每一列右邊一顆「改」；改過的列變綠、寫「✅ 已寫進去」＋「原本：…」 ───────────────────────── */
  var MEFR = [["A", "商品名", "brand"], ["B", "中文", "zh"], ["C", "小藥庫位置", "loc"], ["D", "藥品特徵", "feat"], ["E", "學名", "gen"], ["F", "藥品照片", "pic"], ["G", "公告類別", "nk"], ["H", "公告補充說明", "nm"], ["I", "曾用藥品", "old"], ["J", "縮寫", "abbr"]];
  /* vals＝每一欄現在的值、was＝這一輪改過的欄位 → 原本的值、head＝上面的一行說明；o＝練習聊天室才有：o.row 這支藥現在的樣子、o.live 每一顆「改」都能點 */
  function mefCard(code, vals, was, head, o) {
    o = o || {};
    var r = o.row || DR[code], n = 0, kids, k, row, live = !!o.live;
    function sd(p, lab, what) { return live ? { send: { p: p, a: what }, al: lab } : null; }
    for (k in was) n++;
    kids = [
      gt("📝 一次改 " + code, { z: "lg", b: 1, c: "#1F1F1F" }),
      gt(o.row ? (r.b || "") + (r.z ? "　" + r.z : "") : (vals.brand || r.b) + "　" + (vals.zh || r.z), { z: "xs", c: "#8A8A8A", m: "xs" }),
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
      var ch = was[f[2]] !== undefined, now = gcut(vals[f[2]]) || "（空的）", left, btns, kk = f[2], one = null, two = null;
      left = [
        gh([gx([gt(f[0], { z: "xxs", b: 1, c: ch ? "#FFFFFF" : "#4A6B5C", a: "center", nw: 1 })], { f: 0, w: 17, bg: ch ? GREEN : "#DCE8E2", r: 3, jc: "center" }), gt(f[1], { z: "xxs", c: ch ? GREEN : "#8A8A8A", f: 0 })].concat(ch ? [gt("✅ 已寫進去", { z: "xxs", b: 1, c: GREEN, f: 0 })] : []), { sp: "xs" }),
        gt(now, { z: "sm", c: ch ? GREEN : "#1F1F1F", b: ch, m: "xs" })
      ];
      if (ch && was[f[2]]) left.push(gt("原本：" + gcut(was[f[2]], 40), { z: "xxs", c: "#AAAAAA", m: "xs" }));
      if (live) {
        if (kk === "pic") { one = sd("meffill=" + code + "|photo", f[0] + " " + f[1] + " 那一列的「網址」：點一下，輸入框先填好「照片 現在的網址」", "「" + f[1] + "」那一列的「網址」"); two = sd("mefk=" + code + "|pic", f[0] + " " + f[1] + " 那一列的「📷 傳」：點一下，換照片", "「" + f[1] + "」那一列的「📷 傳」"); }
        else if (kk === "nk") one = sd("mefnk=" + code, f[0] + " " + f[1] + " 那一列的「" + (ch ? "再改" : "改") + "」：點一下，出現五種公告的卡片", "「" + f[1] + "」那一列的「" + (ch ? "再改" : "改") + "」");
        else one = sd("meffill=" + code + "|" + kk, f[0] + " " + f[1] + " 那一列的「" + (ch ? "再改" : "改") + "」：點一下，輸入框先填好「欄位名＋現在的內容」", "「" + f[1] + "」那一列的「" + (ch ? "再改" : "改") + "」");
      }
      btns = kk === "pic" ? [gfld("網址", { z: "sm", box: gmix({ w: 56, f: 0 }, one), p: 9 }), gfld("📷 傳", { z: "sm", box: gmix({ w: 64, f: 0 }, two), p: 9 })] : [gfld(ch ? "再改" : "改", { z: "sm", box: gmix({ w: ch ? 58 : 52, f: 0, cls: "mefb" }, one), p: 9 })];   /* cls：課文要讓手指按第幾列的「改」（藥品照片那一列是「網址」「📷 傳」，沒有這個 class） */
      row = gx([gh([gx(left, { f: 1 })].concat(btns), { sp: "sm", pt: 10, pb: 10, ai: "center" }), gsep({ m: "none" })], { m: i === 0 && !head && n === 0 ? "md" : "none" });
      kids.push(row);
    });
    kids.push(gh([gfld("＋ 其他欄位", { z: "xs", box: gmix({ f: 1 }, sd("mefmore=" + code, "＋ 其他欄位：點一下，出現注意、適應症、劑型、網站四顆", "「＋ 其他欄位」")) }), gfld("✅ 看新卡片", { z: "xs", box: gmix({ f: 1 }, sd("mefend=" + code, "✅ 看新卡片：這一輪收工，出一張新的藥品卡", "「✅ 看新卡片」")) })], { m: "lg", sp: "sm" }));
    return { w: "gc", size: "mega", pad: 16, kids: kids, alt: "「📝 一次改 " + code + "」的卡片：A 到 J 十列（" + MEFR.map(function(f) { return f[0] + " " + f[1]; }).join("、") + "），每一列右邊一顆「改」；改過的列變綠色" };
  }

  /* ④ 📢 公告類別（從「一次改多項」進來的那張）：五顆按鈕，現在掛著的那顆是綠底；o.live＝練習聊天室裡每一顆都能點 ───────────────────────── */
  var NKS = { "1": "停止供貨", "2": "改包裝通知", "3": "製廠缺貨", "4": "換廠", "5": "給慢箋" };
  function nkCard(code, cur, o) {
    var live = !!(o && o.live);
    function sd(p, lab, what) { return live ? { send: { p: p, a: what }, al: lab } : null; }
    var kids = [
      gt("📢 " + code + " 的公告", { z: "lg", b: 1, c: "#1F1F1F" }),
      gt(cur ? "現在掛著：" + cur + " " + NKS[cur] : "現在：沒有公告", { z: "xs", c: cur ? "#B26A00" : "#8A8A8A", m: "xs" }),
      gt("按一顆就好，馬上生效。補充說明在卡片上另外改。", { z: "xxs", c: "#AAAAAA", m: "sm" }),
      gsep({ m: "md" })
    ];
    ["1", "2", "3", "4", "5"].forEach(function(n, i) {
      var on_ = n === cur;
      kids.push(gx([gt((on_ ? "✅ " : "") + n + "　" + NKS[n], { z: "sm", b: 1, c: on_ ? "#FFFFFF" : GREEN, a: "center", nw: 1 })], gmix({ m: i === 0 ? "md" : "sm", bg: on_ ? GREEN : GBG, r: "md", p: 12 }, sd("mefnkset=" + code + "|" + n, n + " " + NKS[n] + "：點一下，馬上掛上這一種公告", "「" + n + " " + NKS[n] + "」"))));
    });
    kids.push(gh([gfld("🗑 移除公告", { z: "xs", c: "#C0392B", bg: "#FDECEC", box: sd("mefnkset=" + code + "|0", "🗑 移除公告：點一下，公告和補充說明都清掉", "「🗑 移除公告」") }), gfld("← 不改，回去", { z: "xs", c: "#8A8A8A", box: sd("mef=" + code, "← 不改，回去：回到一次改多項的卡片", "「← 不改，回去」") })], { m: "lg", sp: "sm" }));
    return { w: "gc", size: "mega", pad: 16, kids: kids, alt: "「📢 " + code + " 的公告」：五顆按鈕（1 停止供貨、2 改包裝通知、3 製廠缺貨、4 換廠、5 給慢箋），" + (cur ? "現在掛著的是 " + cur + " " + NKS[cur] : "現在沒有公告") + "，最下面「🗑 移除公告」和「← 不改，回去」" };
  }
  /* ④-2 ＋ 其他欄位（一次改多項那張卡的「＋ 其他欄位」）：剩下四欄（注意、適應症、劑型、藥品查詢參考網站），兩顆一排，最下面「← 回「一次改多項」」。練習聊天室才用得到 */
  function mefMoreCard(code, o) {
    var live = !!(o && o.live), more = [["pair", "注意"], ["note", "適應症"], ["form", "劑型"], ["ref", "藥品查詢參考網站"]], kids, i;
    function fb(x) { return gfld(x[1], live ? { box: { send: { p: "meffill=" + code + "|" + x[0], a: "「" + x[1] + "」" }, al: x[1] + "：點一下，輸入框先填好「欄位名＋現在的內容」" } } : {}); }
    kids = [
      gt("＋ 其他欄位　" + code, { z: "lg", b: 1, c: "#1F1F1F" }),
      gt("這幾欄也可以直接打，例如「注意 冰箱冷藏 2–8℃，不可冷凍」", { z: "xxs", c: "#AAAAAA", m: "sm" }),
      gsep({ m: "md" })
    ];
    for (i = 0; i < more.length; i += 2) kids.push(gh([fb(more[i]), more[i + 1] ? fb(more[i + 1]) : gx([gt(" ", { z: "sm" })], { f: 1 })], { sp: "sm", m: i === 0 ? "md" : "sm" }));
    kids.push(gx([gt("← 回「一次改多項」", { z: "xs", b: 1, c: GREEN, a: "center", nw: 1 })], gmix({ m: "lg", bg: GBG, r: "md", p: 11 }, live ? { send: { p: "mef=" + code, a: "「← 回一次改多項」" }, al: "← 回「一次改多項」：回到 A～J 十列的卡片" } : null)));
    return { w: "gc", size: "mega", pad: 16, kids: kids, alt: "「＋ 其他欄位 " + code + "」：" + more.map(function(x) { return x[1]; }).join("、") + " 四顆按鈕，最下面「← 回「一次改多項」」" };
  }

  /* ⑤ 匯入：總覽卡、逐筆確認卡（08_匯入.gs 的 _impOverviewBubble_、_impRowBubble_）───────────────────────── */
  function impCnt(n, label, c, bg) {
    return gx([gt(String(n), { z: "lg", b: 1, c: c, a: "center" }), gt(label, { z: "xxs", c: "#4B5563", a: "center" })], { f: 1, bg: bg, r: "md", p: 6 });
  }
  function impBtn(label, pri, send) { return gbtn(label, gmix(pri ? { pri: 1 } : {}, send ? { send: { m: send }, al: label } : null)); }   /* send＝練習聊天室裡這顆是真的按鈕：按下去等於打那句字（真的 LINE 的 message 按鈕） */
  /* o：{ b 批次、total 讀了幾列、add、upd、nc、pb、how 怎麼對欄的（不寫＝第一列的欄位名稱）、map 對欄那句、warns 有問題的列（寫好的一句一句，最多 4 句）、more 還有幾筆有問題沒列出來、cut 這批太大先做前幾筆之後還有幾筆留著、count 接下來幾筆、live 練習聊天室裡的按鈕是活的 } */
  function impOverview(o) {
    var kids = [
      gt("匯入總覽　批次 #" + o.b, { z: "md", b: 1, c: "#1F2933" }),
      gt("讀了「待匯入」" + o.total + " 列。什麼都還沒寫。", { z: "xs", c: "#6B7684" }),
      gh([impCnt(o.add, "新增", "#1E8E5A", "#E3F4EA"), impCnt(o.upd, "修改", "#1E5C86", "#E1EDF6"), impCnt(o.nc, "沒變", "#4B5563", "#F3F5F8"), impCnt(o.pb, "有問題", "#BE3F38", "#F9E4E2")], { m: "md", sp: "sm" }),
      gt("對欄（" + (o.how || "第一列的欄位名稱") + "）：" + o.map, { z: "xs", c: "#4B5563" })
    ];
    if (o.nc) kids.push(gt("沒變的 " + o.nc + " 筆已從待匯入清掉。", { z: "xs", c: "#6B7684" }));
    o.warns.forEach(function(w) { kids.push(gt("⚠️ " + w + " → 留在待匯入（紅底）", { z: "xs", c: "#8A4B00" })); });
    if (o.more) kids.push(gt("…還有 " + o.more + " 筆有問題，待匯入裡紅底的都是。", { z: "xs", c: "#8A4B00" }));
    if (o.cut) kids.push(gt("這批太大，先做前 " + o.count + " 筆；剩下 " + o.cut + " 筆留在待匯入，做完再打「匯入」。", { z: "xs", c: "#8A4B00" }));
    kids.push(gt("接下來 " + o.count + " 筆會一筆一筆給您看，按「對」才寫入。", { z: "xs", c: "#6B7684" }));
    return { w: "gc", size: "mega", pad: 13, sp: "sm", kids: kids, foot: [impBtn("開始逐筆確認（第 1／" + o.count + "）", 1, o.live ? "開始逐筆確認" : ""), impBtn("取消（什麼都不寫）", 0, o.live ? "取消匯入" : "")], alt: "匯入總覽卡：讀了 " + o.total + " 列，新增 " + o.add + "、修改 " + o.upd + "、沒變 " + o.nc + "、有問題 " + o.pb + "；最下面兩顆按鈕「開始逐筆確認」「取消」" };
  }
  /* o：{ i 第幾筆、total 共幾筆、add 新增還是修改、code、title（商品名或中文名）、head 右上角那句（不寫＝照真的：新增寫「工作表1 沒有這支 → 新增」、修改寫「改 N 格」）、
        kv: [[標籤, 原本或 "", 現在, 有沒有整理過]]（新增：照真的順序 商品名、中文名、學名、位置、劑型、參考網站、公告類別、公告補充，只列有值的；修改：只列要改的格，原本是空的也要把第 4 個寫 1）、cur 現在（修改才有，例：商品名　位置　劑型）、warns、live 練習聊天室裡的按鈕是活的 } */
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
    return { w: "gc", size: "mega", pad: 13, sp: "sm", kids: kids, foot: [impBtn("✅ 對，寫入", 1, o.live ? "對" : ""), impBtn("✏️ 改一格", 0, o.live ? "改一格" : ""), impBtn("⏭ 跳過（留在待匯入）", 0, o.live ? "跳過" : ""), impBtn("⏹ 先停（其餘留在待匯入）", 0, o.live ? "先停" : "")], alt: "逐筆確認卡：第 " + o.i + "／" + o.total + " 筆，" + (o.add ? "新增 " : "修改 ") + o.code + " " + o.title + "；最下面四顆按鈕「對，寫入」「改一格」「跳過」「先停」" };
  }

  /* ⑥ 🔧 開發者功能（輸入框上面的「🔧 開發者」按下去）：9 顆，兩顆一排，綠色的兩顆是最常用的 ───────────────────────── */
  /* live＝練習聊天室裡的活的選單：每一顆按下去等於送出 it[2]（真的 LINE 上那一顆按鈕送的字，08 的 _devMenu_）*/
  function devMenuCard(ocrOn, newOn, v2On, live) {
    var items = [["➕ 新增藥品", 1, "新藥"], ["📮 回覆回報", 1, "回報"], ["🩺 體檢", 0, "體檢"], ["⏱ 速度", 0, "速度"], [ocrOn ? "🔬 OCR接手 ✅全院" : "🔬 OCR接手（已關）", 0, ocrOn ? "OCR接手 關" : "OCR接手"], ["📋 清單校對", 0, "清單校對"], [newOn ? "🎴 新卡片 ✅全院" : "🎴 新卡片（已關）", 0, newOn ? "舊卡片" : "新卡片"], [v2On ? "🎤 語音V2 ✅全院" : "🎤 語音V2（已關）", 0, v2On ? "語音V2 關" : "語音V2"], ["👥 開發者", 0, "開發者 管理"]], kids, i;
    function b(it) { return gx([gt(it[0], { z: "sm", b: 1, c: it[1] ? "#FFFFFF" : "#1F2933", a: "center" })], gmix({ f: 1, bg: it[1] ? "#06C755" : "#F1F3F6", r: "md", p: 11 }, live ? { send: { m: it[2] } } : {})); }
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
  /* LINE 的連結卡：o.dev＝開發者版（不寫就是開發者版）、o.force＝剛打過「重發」（多一句「已換新連結」）、o.days＝還剩幾天（不寫＝30）；
     o.live＝練習聊天室裡這張是活的：值是這條連結的鑰匙編號，「打開網頁」按下去會在練習的瀏覽器打開它，「🔑 拿綁定碼」等於打「開發者網頁 綁定」 */
  function webLinkCard(o) {
    o = o || {};
    var dev = o.dev !== false, f = o.force ? "\n（已換新連結，舊的已失效）" : "", days = o.days || 30, kids, L;
    L = dev ? [
      "跟藥師版一樣能查，多了藥品卡片右上角的 ✏️：直接改工作表1／工作表2（跟 LINE 的 ✏️ 修改同一支）。",
      "平常直接按下面那排的「🌐 補藥神器網頁」就好（開發者按到的就是這一版）。連結只要有在用就不會過期（" + days + " 天沒開才會失效）。" + f,
      "這條連結能改資料，只能自己用，別給藥師。打「開發者網頁 重發」會換一條新的，舊的立刻失效。",
      "🔒 開發者網頁每一台都要先綁定：在要用的地方（LINE 裡、瀏覽器、手機主畫面）打開後，回 LINE 打「開發者網頁 綁定」拿 6 位數碼輸入（最多 3 處）。連結外流，沒有碼也綁不上、改不了資料。綁滿了或要換地方，打「開發者網頁 重發」重來。"
    ] : [
      "電腦、手機都能開；打字、📷 拍照都在裡面，首頁有公告和所有藥品。",
      "平常直接按下面那排的「🌐 補藥神器網頁」就好；加到手機主畫面更方便。連結只要有在用就不會過期（" + days + " 天沒開才會失效）。" + f,
      "連結等於你的鑰匙，別轉給院外的人。打「網頁 重發」會換一條新的，舊的立刻失效。"
    ];
    L.push("後端代號 " + WBC.id + "（網頁跳出「不同的後端」的視窗時，結尾跟這個一樣的才是補藥神器）");
    kids = [gt(dev ? "🛠 補藥神器 開發者網頁" : "🌐 補藥神器 網頁版", { z: "lg", b: 1 })];
    L.forEach(function(s, i) { kids.push(gt(s, { z: "sm", c: i === 0 ? "#1F2933" : "#666666", m: i === 0 ? "md" : "sm" })); });
    return { w: "gc", pad: 13, kids: kids, foot: [gbtn("打開網頁", gmix({ pri: 1, bg: WBC.blue }, o.live ? { send: { web: (dev ? "dev:" : "app:") + o.live }, al: "打開網頁：在你選的那一台打開這條連結" } : null))].concat(dev ? [gbtn("🔑 拿綁定碼", o.live ? { send: { m: "開發者網頁 綁定" }, al: "🔑 拿綁定碼：等於幫你打「開發者網頁 綁定」" } : null)] : []),
      alt: "「" + (dev ? "🛠 補藥神器 開發者網頁" : "🌐 補藥神器 網頁版") + "」卡片：" + (dev ? "開發者網頁多了藥品卡片右上角的 ✏️、連結只能自己用、每一台要先綁定（最多 3 處）" : "藥師版網頁，電腦手機都能開") + "；最下面" + (dev ? "兩顆按鈕「打開網頁」「🔑 拿綁定碼」" : "一顆按鈕「打開網頁」") };
  }
  /* 「開發者網頁 綁定」：6 位數綁定碼 */
  function wbBindCard(code, o) {
    o = o || {};
    var L = ["在要綁的那台（LINE 裡、手機瀏覽器、電腦、主畫面捷徑）打開開發者網頁，把這 6 位數打進去。", "10 分鐘內有效、只能用一次（再拿新的，這組就作廢），只對你現在這條開發者連結有效；最多綁 3 處。", "⚠️ 這組碼只打在補藥神器網頁上，不要傳給任何人（包括自稱開發者、客服的人）。"];
    var kids = [gt("🔑 開發者網頁綁定碼", { z: "lg", b: 1 }), gt(code, { z: "3xl", b: 1, c: WBC.blue, m: "md" })];
    L.forEach(function(s, i) { kids.push(gt(s, { z: "sm", c: i === 2 ? WBC.red : "#666666", m: "sm" })); });
    return { w: "gc", pad: 13, kids: kids, foot: [gbtn("打開開發者網頁", gmix({ pri: 1, bg: WBC.blue }, o.live ? { send: { web: "dev:" + o.live }, al: "打開開發者網頁：在你選的那一台打開這條連結" } : null))],
      alt: "「🔑 開發者網頁綁定碼」卡片：6 位數的碼 " + code + "，10 分鐘內有效、只能用一次、最多綁 3 處；最下面一顆按鈕「打開開發者網頁」" };
  }
  /* 把代號貼進 LINE 之後回的「驗證碼」卡（像銀行簡訊；開發者版是藍色）：v＝6 位數驗證碼、code＝網頁上的代號、lab＝網頁自己報的名稱 */
  function wbCodeCard(v, code, lab, devV) {
    var dev = devV !== false, warn = dev ? "⚠️ 這組碼進得了開發者版（能改資料）。請只打在剛剛那個網頁上，不要告訴任何人（包括自稱客服、開發者的人）。" : "⚠️ 請只打在剛剛那個網頁上，不要告訴任何人（包括自稱客服的人）。";
    var L = ["給「代號 " + code + "」那個網頁用的" + (lab ? "（網頁自己報的名稱：" + lab + "）" : "") + "：回到那個網頁輸入，換別的瀏覽器打沒用。", "從網頁上出現代號那一刻起算，要在網頁的倒數歸零前輸入完；超過了，網頁會自己換一組新的代號，到時把新的代號再貼進來就好。", "不是你自己剛在網頁上看到這組代號的？不要輸入。", warn];
    var kids = [gt(dev ? "🛠 開發者版 網頁驗證碼" : "🔐 補藥神器 網頁驗證碼", { z: "lg", b: 1 }), gt(v, { z: "3xl", b: 1, a: "center", c: dev ? WBC.blue : "#1F2933", m: "lg" }), gt("限時 5 分鐘・只能用一次", { z: "sm", b: 1, a: "center", c: WBC.red, m: "md" })];
    L.forEach(function(s) { kids.push(gt(s, { z: "sm", c: s === warn ? WBC.red : "#666666", m: "sm" })); });
    return { w: "gc", pad: 13, kids: kids, alt: "「" + (dev ? "🛠 開發者版 網頁驗證碼" : "🔐 補藥神器 網頁驗證碼") + "」卡片：6 位數的驗證碼 " + v + "，限時 5 分鐘、只能用一次；只能打回出現代號 " + code + " 的那個網頁，換別的瀏覽器打沒用；沒有按鈕" };
  }
  /* 有新裝置登入開發者網頁，LINE 推播給開發者的通知卡 */
  function wbNewDevCard(at, lab, n, o) {
    o = o || {};
    var L = ["剛剛 " + at + "，有一台新裝置用驗證碼登入了開發者網頁（能改資料）。", "裝置（瀏覽器自己報的，不一定是真的）：" + lab + "\n已綁裝置：" + n + "／3 台", "是你自己 → 不用理會。\n不是你 → 按下面的按鈕：舊連結和所有已綁的裝置馬上失效（要再用開發者網頁，重新拿連結或驗證碼）。"];
    var kids = [gt("🔔 開發者網頁有新裝置登入", { z: "lg", b: 1 })];
    L.forEach(function(s, i) { kids.push(gt(s, { z: "sm", c: i === 2 ? WBC.red : "#444444", m: "sm" })); });
    return { w: "gc", pad: 13, kids: kids, foot: [gbtn("不是我，全部作廢", gmix({ pri: 1, bg: WBC.red }, o.live ? { send: { m: "開發者網頁 重發" }, al: "不是我，全部作廢：等於幫你打「開發者網頁 重發」" } : null))],
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

  /* ⑨ 位置查核的網頁分頁（lst.html 的第二個分頁「📍 位置查核」；第 4 課後半）：照 _lst_page.html 的 .tabs／.lcq／.lcsum／.lcr／.lce 畫。
     一列 x＝{ code, brand, zh, form, ph（有藥品照片）, water, tick（打勾）, moved（改去哪了，例 "K3"）, ed（這一列下面開著改位置的框：{ cur 現在在哪、sel 選單選了什麼、inp 輸入框裡的字、ce 確認那句、ok 按鍵的字 }）} */
  function lstLcRow(x) {
    var mv = !!x.moved, on = !!x.tick || mv, ck, thumb, txt, head, e = x.ed, kids = [], ed;
    ck = gx(on ? [gt(mv ? "→" : "✓", { z: 18, b: 1, c: mv ? "#B26B00" : "#FFFFFF", a: "center" })] : [], { w: 30, hh: 30, r: 8, bw: 2, bd: mv ? "#D98E04" : on ? LSC.g : "#9AA7A6", bg: mv ? "#FFF3D6" : on ? LSC.g : "#FFFFFF", jc: "center", cls: "lkt" });
    thumb = x.ph ? gx([], { w: 48, hh: 48, r: 6, cls: "gph" + (x.water ? " w" : "") }) : gx([gt("無照片", { z: 11, c: "#566867", a: "center" })], { w: 48, hh: 48, bg: LSC.soft, r: 6, jc: "center" });
    txt = [gt(x.brand, { z: 14.5, b: 1, c: LSC.ink })];
    if (x.zh && x.zh !== x.brand) txt.push(gt(x.zh, { z: 12.5, c: "#4A5C5B" }));
    txt.push(gt((x.form || "") + "　" + x.code, { z: 11.5, c: "#566867", mono: 1 }));
    if (mv) txt.push(gt("→ 已改到 " + x.moved, { z: 11.5, b: 1, c: "#9A5B00" }));
    head = gh([
      gh([ck, thumb, gx(txt, { f: 1, sp: 1 })], { sp: 10, ai: "center", f: 1 }),
      gx([gt(mv ? "再改" : "修改", { z: 14, c: "#C0392B", a: "center" })], { w: 58, hh: 44, r: 8, bw: 1.5, bd: "#C0392B", jc: "center", cls: "lkm" })
    ], { sp: 8, ai: "center", px: 12, py: 8, bg: mv ? "#FFF8E6" : on ? "#EEF7F2" : "#FFFFFF" });
    kids.push(gsep({ c: "#E4EAEA", m: "none" }), head);
    if (e) {
      ed = [
        gt(x.code + "　現在在「" + e.cur + "」→ 要改到哪裡？", { z: 13, c: "#4A5C5B" }),
        gh([
          gh([gt(e.sel || "從清單選一個…", { z: 16, c: e.sel ? LSC.ink : LSC.mute, nw: 1, f: 1 }), gt("▾", { z: 14, c: LSC.mute, f: 0 })], { f: 1, bg: "#FFFFFF", bd: LSC.edge, bw: 1, r: 8, px: 8, py: 10, ai: "center", sp: 4 }),
          gx([gt(e.inp || "或打字，例 A2", { z: 16, c: e.inp ? LSC.ink : "#9AA8A8", nw: 1 })], { f: 1, bg: "#FFFFFF", bd: LSC.edge, bw: 1, r: 8, px: 8, py: 10 })
        ], { sp: 8, m: 6 })
      ];
      if (e.ce) ed.push(gt(e.ce, { z: 13, b: 1, c: "#C0392B", m: 8 }));
      ed.push(gh([lstBtn(e.ok || "改成這個位置", "y", { f: 1 }), lstBtn("取消", "sk", { f: 1 })], { sp: 8, m: 8 }));
      kids.push(gx([gx(ed, { bg: "#FFFBF1", bd: "#D98E04", r: 10, px: 12, py: 10 })], { px: 12, pb: 6 }));
    }
    return gx(kids, {});
  }
  /* 整個分頁：o＝{ q 查詢框裡的字（沒寫＝提示字）、msg 查詢框下面那一行 { t, k "ok"｜"bad"｜"" }（沒寫＝不畫）、
       loc 這一格（沒寫＝只畫上面查詢的部分）、seen 已看幾支、total 這一格一共幾支（顯示的）、sub 「這一格有…」那一行、rows 每一列（lstLcRow）、alt } */
  function lstLcPage(o) {
    var tab = function(t, on) { return gx([gt(t, { z: 14, b: 1, c: on ? "#FFFFFF" : LSC.ink2, a: "center" })], { f: 1, bg: on ? LSC.b : undefined, bd: on ? LSC.b : LSC.edge, bw: 1, r: 8, py: 12, jc: "center" }); };
    var kids = [
      gt("📋 清單校對", { z: 20, b: 1, c: LSC.ink }),
      gh([tab("📋 表格校對", false), tab("📍 位置查核", true)], { sp: 8, m: 12 }),
      gt("去貨架查某一格：打位置或傳貨架照片，把這一格的藥列出來，一支一支打勾；不在這一格的，按那一列的「修改」當場改位置。", { z: 13, c: LSC.mute, m: 8 }),
      gx([
        gt("① 查哪一格", { z: 12, c: LSC.mute, ls: 0.1, mono: 1 }),
        gh([
          gx([gt(o.q || "位置，例如 A1", o.q ? { z: 21, b: 1, c: LSC.ink, mono: 1 } : { z: 16, c: "#9AA8A8" })], { f: 1, bg: "#FFFFFF", bd: LSC.edge, r: 10, px: 12, py: 8 }),
          gx([gt("查這一格", { z: 15.5, b: 1, c: "#FFFFFF", a: "center" })], { f: 0, bg: LSC.g, r: 8, px: 18, jc: "center" })
        ], { sp: 8, m: 7 }),
        gh([lstBtn("📷 傳貨架照片（讀位置牌＋認藥）", "sk", { f: 1 })], { m: 10 }),
        gt("照片要拍到架上的「位置牌」和藥品；電腦上也可以把照片拖進來、或截圖後貼上。打勾只留在這個頁面（重新整理就沒了），不寫進工作表1。「修改」只改位置：改完馬上生效、藥師查到的就是新位置，不記進匯入紀錄（沒有 7 天內復原）。", { z: 13, c: LSC.mute, m: 9 })
      ], { bg: "#FFFFFF", bd: LSC.line, r: 10, px: 15, py: 14, m: 12 })
    ], all, groups = [], tabR = [], watR = [], res, i;
    if (o.msg) kids.push(gt(o.msg.t, { z: 13.5, b: o.msg.k ? 1 : 0, c: o.msg.k === "ok" ? LSC.g : o.msg.k === "bad" ? LSC.r : LSC.ink2, m: 10, rich: 1 }));
    if (o.loc) {
      all = o.seen >= o.total && o.total > 0;
      res = [
        gx([
          gh([gt(o.loc, { z: 22, b: 1, c: LSC.b, mono: 1 }), gt((all ? "✅ 全部看完了　" : "已看 ") + o.seen + "/" + o.total, { z: 13.5, b: 1, c: all ? LSC.g : LSC.b, a: "end", f: 1 })], { ai: "center", sp: 10 }),
          gt(o.sub, { z: 12.5, c: "#55696A", m: 3 })
        ], { px: 14, py: 11 })
      ];
      for (i = 0; i < o.rows.length; i++) (o.rows[i].water ? watR : tabR).push(o.rows[i]);
      [[tabR, "錠劑類　"], [watR, "水劑類　"]].forEach(function(g) {
        if (!g[0].length) return;
        res.push(gx([gt(g[1] + g[0].length + " 個品項", { z: 14, b: 1, c: LSC.b })], { px: 14, pt: 10, pb: 4 }));
        g[0].forEach(function(x) { res.push(lstLcRow(x)); });
      });
      res.push(gsep({ c: "#E4EAEA", m: "none" }));
      res.push(gx([gh([gt("點左邊的框＝打勾　·　不在這格＝修改", { z: 12, c: "#566867", f: 0 }), gx([gt("↺ 清掉勾選", { z: 12.5, c: LSC.ink2, a: "center" })], { f: 0, bg: "#FFFFFF", bd: LSC.edge, bw: 1, r: 8, px: 10, py: 6 })], { jc: "center", ai: "center", sp: 8 })], { px: 12, py: 10 }));
      kids.push(gx(res, { bg: "#FFFFFF", bd: LSC.line, r: 10, m: 12 }));
    }
    return gmix({ w: "wp", bar: LSC.url, bg: LSC.bg, pad: 14, kids: kids, alt: o.alt }, {});
  }

  /* ───────── 開發者練習聊天室：機器人的「引擎」（第 17 批）─────────
     開發者教學每一課最後的「換你打打看」：自己在輸入框打字、或點輸入框上面的小按鈕、卡片上的按鈕，機器人就照真的 LINE 程式碼回；
     這一頁的「機器人」是一支純函式（SIMDEV 標記之間，沒有碰畫面、沒有碰網路），測試會單獨拿出來跑，也會把同一串輸入同時丟給真的 LINE 程式碼，逐則比對回的字和小按鈕。
     dsNew()＝一個全新的練習世界（編的藥品表、沒有任何待匯入、沒有改過的紀錄）；dsRun(S, ev)＝送出一個動作，回 { msgs, q, fill, trail, sheet, reply }：
       ev＝{ t: "text", v: 打的字 } 或 { t: "pb", v: postback 的字, d: 按下去聊天室會多出來的那句字（沒有就不多）}，
       或練習專用的兩種：{ t: "img" }（傳一張照片給機器人）、{ t: "sim", v: 代號 }（在雲端硬碟上做一件事，沒有傳給機器人；代號見 dsActs）；
       msgs＝聊天室多出來的訊息（我打的字、機器人回的字和卡片，跟課文裡畫的是同一種）；q＝輸入框上面的小按鈕 [{ l: 字, m: 送出的字 } 或 { l, p: postback, d: 聊天室多出來的字 }]；
       fill＝按下去之後輸入框要先填好的字（手機的 fillInText）；trail／sheet／reply＝深色框「背後發生的事」要寫的三樣（機器人一步一步看了什麼、試算表動了沒有、機器人回了什麼）。
     這裡面的每一句機器人說的話，都照 06_行動指令.gs（新藥格子、✏️ 修改）、08_匯入.gs（匯入、復原、開發者指令）裡拼字串的那一句寫；練習的是「編的」試算表，什麼都不會真的寫。 */
  /*SIMDEV*/
  var DS_CANCEL = ["取消", "不用了", "算了", "cancel"], DS_BACK = ["上一步", "回上一步", "上一題", "返回"], DS_SKIP = ["跳過", "略過", "沒有", "不填", "-", "－"];
  var DS_FORMS = ["錠劑", "膠囊", "口服液", "注射劑", "藥膏", "眼藥水", "栓劑", "貼片", "粉劑"];
  var DS_NEWCODES = { "90120": 1, "90121": 1 };   /* 課文畫面用的新藥（DR 裡有，但練習的試算表一開始沒有；要自己用「新藥」建） */
  var DS_LCK_MORE = 4;   /* 清單校對那一課（dsNew 的第二個參數）：K2 多出來的備用藥（真的試算表的測試世界也加同樣 4 支：tools/learn_dev_line.js 的 buildWorld o.lckBig） */
  var DS_FILL = [["K2", 5], ["K3", 5]];   /* 備用藥 90201～90210（跟真的試算表一樣）：墊在課文那幾支藥後面，K2、K3 各 5 支，所以常用位置、新建的那一列是第幾列，都跟真的 LINE 一樣 */
  var DS_STEPS = [
    { key: "code", name: "CODE", ask: "CODE 是多少？", hint: "例：22975" },
    { key: "brand", name: "商品名", ask: "商品名（英文）？", hint: "例：CURAM" },
    { key: "loc", name: "位置", ask: "放在哪一格？", hint: "例：K2、棧板A區", quick: "loc" },
    { key: "form", name: "劑型", ask: "劑型？", hint: "點下面的按鈕最快", quick: "form" },
    { key: "zh", name: "中文名", ask: "中文名？", hint: "例：諾快寧膜衣錠" },
    { key: "gen", name: "學名", ask: "學名？", hint: "例：Amoxicillin + Clavulanate 375mg", skip: 1 },
    { key: "note", name: "適應症", ask: "適應症？", hint: "例：抗生素", skip: 1 },
    { key: "feat", name: "特徵", ask: "藥品特徵？", hint: "例：白色橢圓 有刻痕", skip: 1 }
  ];
  var DS_ALIAS = { "code": "code", "CODE": "code", "Code": "code", "代碼": "code", "商品名": "brand", "英文名": "brand", "英文": "brand", "位置": "loc", "小藥庫位置": "loc", "藥位": "loc", "劑型": "form", "中文名": "zh", "中文": "zh", "學名": "gen", "成分": "gen", "特徵": "feat", "藥品特徵": "feat", "適應症": "note" };
  var DS_BAR = [{ l: "🔧 開發者", m: "開發者" }];   /* 每一則回覆最下面「標準那排」小按鈕裡，練習聊天室做得到的只有這一顆（網頁、教學、藥品通知、BUG 在練習裡不做） */
  function dsIn(text, list) {
    var t = String(text === null || text === undefined ? "" : text).trim().replace(/\s+/g, ""), i;
    for (i = 0; i < list.length; i++) if (list[i] === t) return true;
    return false;
  }
  function dsNorm(v) {   /* 01 的 normCode：去頭尾空白；有小數點就拿掉結尾的 .0 */
    var s = v === null || v === undefined ? "" : String(v).trim();
    if (s.indexOf(".") >= 0) s = s.replace(/\.0+$/, "");
    return s;
  }
  function dsStep(k) { var i; for (i = 0; i < DS_STEPS.length; i++) if (DS_STEPS[i].key === k) return DS_STEPS[i]; return null; }
  function dsHas(d, k) { return Object.prototype.hasOwnProperty.call(d || {}, k); }
  function dsIsWater(r) { var f = String(r.f || ""); return f.indexOf("水") >= 0 || f.indexOf("液") >= 0; }   /* 圖示（藥丸／水滴）和藥品特徵放哪裡，真的卡片只看劑型（01 的 formIconUrl、featOnTop_） */
  function dsPhotoUrl(c) { return "https://drive.google.com/thumbnail?id=p" + c + "abcdefghij123&sz=w1000"; }   /* 練習用的假照片網址（有照片的藥，「工作表2」藥品外觀那格長這樣；編的，打不開） */
  function dsPhOk(photo) { return /^https?:\/\/\S/i.test(String(photo === null || photo === undefined ? "" : photo).trim()); }   /* 01 的 photoUrlByCode_：https:// 開頭才當照片 */
  /* 一支藥一列：b 商品名、z 中文、g 學名、f 劑型、w 水劑圖示、ind 適應症、feat 特徵、loc 位置、ph 有沒有照片（photo 是 https 網址才算）、
     nk 公告類別（1~5）、nm 公告補充說明、old 曾用藥品、pair 注意、ref 藥品查詢參考網站、photo 藥品外觀那一格（照片網址）、npic 公告照片那一格（網址）。試算表兩張工作表的欄，合在一起放 */
  function dsRowOf(b, z, g, f, ind, feat, loc, photo) {
    var r = { b: b, z: z, g: g, f: f, w: 0, ind: ind || "", feat: feat || "", loc: loc, ph: 0, nk: "", nm: "", old: "", pair: "", ref: "", photo: photo || "", npic: "" };
    r.w = dsIsWater(r) ? 1 : 0;
    r.ph = dsPhOk(r.photo) ? 1 : 0;
    return r;
  }
  function dsNew(pendKey, lck) {
    var rows = {}, order = [], c, k, n, i, j;
    for (c in DR) {
      if (DS_NEWCODES[c]) continue;
      rows[c] = dsRowOf(DR[c].b, DR[c].z, DR[c].g, DR[c].f, DR[c].ind, DR[c].feat, DR[c].loc, DR[c].ph ? dsPhotoUrl(c) : "");
    }
    for (k in rows) order.push(k);
    n = 90201;
    for (i = 0; i < DS_FILL.length; i++) for (j = 0; j < DS_FILL[i][1]; j++) {
      c = String(n++);
      rows[c] = dsRowOf("FILLER* " + n, "備用藥" + n, "", "錠劑", "", "", DS_FILL[i][0], "");
      order.push(c);
    }
    if (lck) for (j = 0; j < DS_LCK_MORE; j++) {   /* 清單校對那一課（位置查核）：K2 再多 4 支備用藥（90211～90214）→ 這一格 14 支，一頁放不下（一頁 12 列），示範「第 1/2 頁、往左滑」 */
      c = String(n++);
      rows[c] = dsRowOf("FILLER* " + n, "備用藥" + n, "", "錠劑", "", "", "K2", "");
      order.push(c);
    }
    /* wiz＝新藥的格子、fld＝「正在改某一格」、mef＝一次改多項這一輪改過哪幾項、mefOpen＝一次改多項那張卡開著（記 CODE）、imp＝匯入／復原的狀態、log＝匯入紀錄、seq＝批次號用的假時鐘、day＝假日期（09/15）往後過了幾天（只有「清單校對」那一課的「時間過了 3 天」會動它）、abbr＝開發者加的縮寫、pend＝「待匯入」分頁（_learn_dev_sim_imp.js）、ops＝開發者的維護指令用的（全院開關、雲端資料夾、平面圖設定、開發者名單、待審清單…；_learn_dev_sim_ops.js 起頭的幾個檔） */
    return { rows: rows, order: order, wiz: null, fld: null, mef: null, mefOpen: "", imp: null, log: [], seq: 0, day: 0, abbr: {}, pend: dsPendLoad(pendKey), ops: dsoNew(rows, order) };
  }
  /* 試算表「工作表1」裡這支藥在第幾列（第 1 列是標題）；沒有回 -1（04 的 _findRowByCode_） */
  function dsRowNo(S, code) { var c = dsNorm(code), i; if (!c) return -1; for (i = 0; i < S.order.length; i++) if (S.order[i] === c) return i + 2; return -1; }
  /* 輸入框上面「常用位置」：試算表裡出現最多次的（同票照字排），最多 9 個、字數不超過 20（06 的 _commonLocs_）；K2、K3 加上真的試算表裡那些沒畫出來的藥 */
  function dsLocCount(S) {
    var cnt = {}, i, l;
    for (i = 0; i < S.order.length; i++) { if (!S.order[i]) continue; l = String(S.rows[S.order[i]].loc || "").trim(); if (!l) continue; cnt[l] = (cnt[l] || 0) + 1; }   /* order 裡的空字串＝被「復原」清空的那一列（列還在，只是空的） */
    return cnt;
  }
  /* 「索引快取」＝某個時間點試算表的樣子（01 的 getIndex_：先看快取，沒有才從試算表重讀，讀完存回快取）。
     批次匯入直接寫格子，不會清快取（08 的 _impApply_），所以匯入進行中，快取裡還是舊的樣子，要等整批做完才重建（_impFinish_）。
     S.idxSnap 三種狀態：沒有（null）＝跟試算表一樣新（平常都是這樣）；物件＝匯入進行中拍下來的舊樣子（rows、order 跟 S 一樣的形狀）；
     false＝匯入進行中被清空了（_efWrite_ 每寫一格就 clearDrugCache），下一次有人讀索引才從試算表重建、再記住。 */
  function dsSnap(S) {
    var rows = {}, k, f, o;
    for (k in S.rows) { o = {}; for (f in S.rows[k]) o[f] = S.rows[k][f]; rows[k] = o; }
    return { rows: rows, order: S.order.slice() };
  }
  function dsIdx(S) {
    if (S.idxSnap === false) S.idxSnap = dsSnap(S);
    return S.idxSnap || S;
  }
  /* 輸入框上面的「常用位置」讀的是索引快取（06 的 _commonLocs_） */
  function dsCommonLocs(S, n) {
    var cnt = dsLocCount(dsIdx(S)), arr = [], out = [], i, l;
    for (l in cnt) arr.push([l, cnt[l]]);
    arr.sort(function(a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); });
    for (i = 0; i < arr.length && out.length < (n || 9); i++) if (arr[i][0].length <= 20) out.push(arr[i][0]);
    return out;
  }
  /* 真的程式寫一格就 clearDrugCache()（06 的 _efWrite_、新藥存檔）。匯入進行中清空＝空的（false），平常清空→下一次讀就重建＝跟試算表一樣新（null）；clearDrugCache＋warmCache（匯入收尾、復原）＝馬上重建＝null */
  function dsCacheClear(S) { S.idxSnap = S.imp ? false : null; }
  function dsCacheWarm(S) { S.idxSnap = null; }
  function dsQuick(S, kind) {
    var q = [], a, i;
    a = kind === "form" ? DS_FORMS : kind === "loc" ? dsCommonLocs(S, 9) : [];
    for (i = 0; i < a.length; i++) q.push({ l: a[i], m: a[i] });
    return q;
  }
  /* 聊天室裡「我自己動作的回聲」（👆 點了…、👥 假裝在群組）：不是機器人回的話，只是告訴你剛剛做了什麼。echo 這個記號讓 dwbReplied 分得出「機器人真的回了話」和「只有回聲」；
     「練習不示範」那種說明（act）不是回聲：真的機器人在那裡會回一則話，所以算有回話 */
  function dsEcho(t) { var m = act(t); m.echo = 1; return m; }
  function dsX() { return { msgs: [], q: null, fill: null, trail: [], sheet: "", reply: "", wrote: 0, efLog: [], lb: "", mefOn: "", keep: 0, say: "", qKeep: 0 }; }
  function dsT(X, ok, t) { X.trail.push({ ok: ok, t: t }); }
  function dsSend(X, msgs, q) { var i; for (i = 0; i < msgs.length; i++) X.msgs.push(msgs[i]); X.q = q === undefined ? null : q; }
  function dsBar(X) { if (!X.q) X.q = DS_BAR.slice(); return X; }

  /* ───── ① 新藥：8 格（06 的 _wizXxx_）───── */
  function dsWizNext(st) { var i; for (i = 0; i < DS_STEPS.length; i++) if (!dsHas(st.data, DS_STEPS[i].key)) return DS_STEPS[i].key; return ""; }
  function dsWizCur(st) { if (st.cur && dsStep(st.cur)) return st.cur; return dsWizNext(st); }
  function dsWizNeed(st) { var out = [], i; for (i = 0; i < DS_STEPS.length; i++) if (!DS_STEPS[i].skip && !st.data[DS_STEPS[i].key]) out.push(DS_STEPS[i].name); return out; }
  function dsWizQuick(S, st) {
    var s = dsStep(dsWizCur(st)), q = s && s.quick ? dsQuick(S, s.quick) : [];
    if (s && s.skip && !st.data[s.key]) q.push({ l: "跳過", m: "跳過" });
    q.push({ l: "取消", m: "取消" });
    return q.slice(0, 13);
  }
  function dsWizGrid(S, st) { return wizCard(st.data, dsWizCur(st)); }
  /* 送格子（lead＝格子上面先說的一句）；dup＝CODE 已經有了的那個 CODE（先給那支藥的卡片再給格子） */
  function dsWizAsk(S, X, lead, dup) {
    var ms = [];
    if (lead) ms.push(bot(String(lead).substring(0, 4900)));
    if (dup && S.rows[dup]) ms.push(dsCard(S, dup));
    ms.push(dsWizGrid(S, S.wiz));
    dsSend(X, ms, dsWizQuick(S, S.wiz));
  }
  function dsWizFieldOf(text) {   /* 「位置 K2」「中文名：煩多閃」→ { key, value, bare }；開頭不是欄位名回 null */
    var t = String(text || "").trim(), m = t.match(/^(\S+?)(?:[\s:：]+([\s\S]*))?$/), key, rest;
    if (!m) return null;
    key = DS_ALIAS[m[1]];
    if (!key) return null;
    rest = (m[2] || "").trim();
    return { key: key, value: rest, bare: !rest };
  }
  /* 一格填進去（CODE 要檢查）。好了回 null；不行回 { lead, dup } */
  function dsWizPut(S, st, key, val) {
    var cur = dsStep(key), c, digits, dup;
    if (!cur) return { lead: "" };
    if (dsIn(val, DS_SKIP)) {
      if (!cur.skip) return { lead: "「" + cur.name + "」不能跳過 🙏\n" + cur.ask + (cur.hint ? "\n　" + cur.hint : "") };
      st.data[key] = "";
      return null;
    }
    if (!val) return { lead: "" };
    if (key === "code") {
      c = dsNorm(val);
      digits = (c.match(/[0-9]/g) || []).length;
      if (c.length > 10 || digits < 3 || /^[=+\-@]/.test(c) || /[\t\r\n]/.test(c)) return { lead: "「" + val + "」不太像 CODE 🤔\n院內的 CODE 通常是 4~6 位數字，例如 22975。\n再給我一次？（真的有非數字的 CODE，請直接在試算表上加）" };
      dup = dsRowNo(S, c);
      if (dup > 0) return { lead: "⚠️ CODE " + c + " 已經有了（工作表1 第 " + dup + " 列），就是下面這張。\n・要改它的內容：點這張卡片的「✏️ 修改」（這一筆新增就取消）\n・要新增別支藥：改打別的 CODE（其他格都還在）", dup: c };
      st.data.code = c;
      return null;
    }
    st.data[key] = String(val).substring(0, 200);
    return null;
  }
  function dsWizPreviewRow(d) { return dsRowOf(d.brand || "", d.zh || "", d.gen || "", d.form || "", d.note || "", d.feat || "", d.loc || "", ""); }
  function dsWizPreview(S, X) {
    var st = S.wiz, d = st.data, r = dsWizPreviewRow(d), warn = [], fam;
    if (!d.loc) warn.push("・位置是空的，卡片上不會有位置");
    if (!d.zh) warn.push("・中文名是空的");
    fam = dsFam(S, d.code, r);
    dsSend(X, [dc(d.code, fam ? { row: r, fam: fam } : { row: r }), bot("☝️ 存進去之後長這樣。\n\n" + (warn.length ? warn.join("\n") + "\n\n" : "") + "沒問題的話按「✅ 存檔」（或打「存檔」）。\n要改哪一項：按「✏️ 回格子」（或打「回格子」）點那一格，或直接打「位置 K9」這樣。")], [{ l: "✅ 存檔", p: "wiz=save" }, { l: "✏️ 回格子", m: "回格子" }, { l: "取消", m: "取消" }]);
    dsT(X, 1, "必填的格子都填好了，把整張卡片先組出來給你看");
    X.sheet = "沒動（要按「✅ 存檔」才會寫）";
    X.reply = "預覽卡片＋三顆小按鈕（✅ 存檔、✏️ 回格子、取消）";
  }
  function dsWizGoPreview(S, X) {
    var st = S.wiz, need;
    if (!st || !st.data) { dsSend(X, [bot("這一筆已經過期了 😥\n請重新打「新藥」開始。")]); return; }
    need = dsWizNeed(st);
    if (need.length) {
      st.stage = "ask"; st.cur = "";
      dsT(X, 0, "必填的格子都填好了嗎？還沒，還差：" + need.join("、"));
      dsWizAsk(S, X, "還有必填的沒填：" + need.join("、"));
      X.sheet = "沒動";
      X.reply = "說差哪幾格，再給格子";
      return;
    }
    st.stage = "preview"; st.cur = ""; st.pv = false;
    dsWizPreview(S, X);
  }
  /* 填完之後：有要說的話 → 說＋格子；每一格都答過了、或是從預覽過來改的（st.pv）→ 出預覽；不然回格子 */
  function dsWizAfter(S, X, lead, dup) {
    var st = S.wiz;
    if (!lead && (!dsWizNext(st) || (st.pv && !dsWizNeed(st).length))) {
      st.stage = "preview"; st.cur = ""; st.pv = false;
      dsWizPreview(S, X);
      return true;
    }
    st.stage = "ask";
    dsWizAsk(S, X, lead, dup);
    return true;
  }
  function dsWizStart(S, X) {
    S.fld = null;
    S.wiz = { stage: "ask", cur: "", data: {}, pv: false };
    dsT(X, 1, "是「新藥」→ 開一張新的格子，8 格都是空的");
    dsT(X, 1, "黃色的是現在要填的那一格：第一個還沒填的，CODE");
    dsWizAsk(S, X);
    X.sheet = "沒動（存檔之前什麼都不會寫）";
    X.reply = "8 格的格子（CODE 那一格是黃色），輸入框上面只有「取消」";
  }
  function dsWizSave(S, X) {
    var st = S.wiz, d, code, row, ex, ms, b;
    if (!st || !st.data || !st.data.code) { dsSend(X, [bot("這一筆已經過期了 😥\n請重新打「新藥」開始。")]); return; }
    d = st.data; code = dsNorm(d.code);
    if (dsRowNo(S, code) > 0) {
      S.wiz = null;
      dsSend(X, [bot("CODE " + code + " 剛才已經被建進去了 🤔\n打「" + code + "」看一下，要改內容就點卡片下面的「✏️ 修改」。")]);
      return;
    }
    row = dsRowOf(d.brand || "", d.zh || "", d.gen || "", d.form || "", d.note || "", d.feat || "", d.loc || "", "");   /* 新藥的位置照打的字存（跟真的 _wizSave_ 一樣；「✏️ 修改」才會統一成半形大寫）*/
    S.rows[code] = row; S.order.push(code);
    dsCacheClear(S);
    ex = d.note || d.feat ? "（適應症／特徵也一起寫進「工作表2」了）" : "";
    /* 記進「匯入紀錄」：新增是「整列」一筆（復原會把這一列清空），適應症、特徵各一筆（復原改回空的）；這一則回覆完一起寫 */
    X.efLog.push({ act: "新增", code: code, label: "整列", before: "", after: [d.brand, d.zh, d.loc, d.form, d.gen].map(function(v) { return v || ""; }).join("｜") });
    if (d.note) X.efLog.push({ code: code, label: "適應症", before: "", after: d.note });
    if (d.feat) X.efLog.push({ code: code, label: "藥品特徵", before: "", after: d.feat });
    b = dsBatchFor(S, X, code);
    S.wiz = null;
    ms = [bot("✅ 已新增 " + code + "　" + (d.brand || d.zh || "") + "\n" + (ex ? ex + "\n" : "") + "\n現在打「" + code + "」就查得到了。"), dsCard(S, code)];
    dsSend(X, ms, dsEfUndo(S, X, code, DS_BAR.slice(), b));
    dsT(X, 1, "按了「✅ 存檔」→ 把這一列加到「工作表1」最後面" + (ex ? "，適應症、特徵加到「工作表2」" : ""));
    dsT(X, 1, "記進「匯入紀錄」（批次 #" + b + "），7 天內可以復原");
    X.sheet = "新增 1 列（" + code + "）";
    X.wrote = 1;
    X.reply = "「已新增」那句＋這支藥的卡片（開發者的卡片多一顆「✏️ 修改」）＋第一顆小按鈕「↩️ 復原 " + code + "」";
  }
  /* 「改 位置」「位置 K9」「好幾行」「預覽」「存檔」「取消」…（06 的 _wizStep_）*/
  function dsWizStep(S, X, text) {
    var st = S.wiz, t = String(text || "").trim(), flat = t.replace(/\s+/g, ""), body, lines, multi, multiOk, pf, key, val, r, leads, dupCode, i, steps = DS_STEPS, at;
    if (dsIn(t, DS_CANCEL)) {
      S.wiz = null;
      dsSend(X, [bot("好，取消了，一個字都沒寫進去 👍")]);
      dsT(X, 1, "是「取消」→ 把這張格子丟掉");
      X.sheet = "沒動";
      X.reply = "「好，取消了，一個字都沒寫進去」";
      return true;
    }
    body = t.replace(/^改\s*/, "");
    lines = body.split(/\r?\n/).map(function(x) { return x.trim(); }).filter(String);
    multi = lines.length > 1 ? lines.map(dsWizFieldOf) : null;
    multiOk = !!multi && multi.every(function(f) { return f && !f.bare; });
    pf = dsWizFieldOf(body);
    if (st.stage === "preview") {
      if (dsIn(t, DS_BACK) || /^回?格子$/.test(flat)) {
        st.stage = "ask"; st.cur = ""; st.pv = false;
        dsT(X, 1, "「回格子」→ 回到格子，黃色是第一個還沒填的");
        dsWizAsk(S, X);
        X.sheet = "沒動"; X.reply = "格子";
        return true;
      }
      if (/^(存檔|存|儲存|確定|好|ok|要)$/i.test(flat)) { dsWizSave(S, X); return true; }
      if (!multiOk && !pf) {
        dsT(X, 0, "這句不是「存檔」「回格子」，也不是「欄位名 內容」→ 再給你看一次預覽");
        dsWizPreview(S, X);
        return true;
      }
      st.stage = "ask"; st.pv = true;
    }
    if (/^回?格子$/.test(flat)) { dsWizAsk(S, X); X.sheet = "沒動"; X.reply = "格子"; return true; }
    if (/^(預覽|存檔|儲存)$/.test(flat) || (!dsWizNeed(st).length && /^(確定|好|ok|要|存)$/i.test(flat))) { dsWizGoPreview(S, X); return true; }
    if (multiOk) {
      leads = []; dupCode = "";
      for (i = 0; i < multi.length; i++) {
        r = dsWizPut(S, st, multi[i].key, multi[i].value);
        if (r) { if (r.lead) leads.push(r.lead); if (r.dup) dupCode = r.dup; st.cur = multi[i].key; }
      }
      if (!leads.length) st.cur = "";
      dsT(X, 1, "好幾行、每一行都是「欄位名 內容」→ 一次填 " + multi.length + " 格");
      X.sheet = "沒動"; X.reply = "更新後的格子";
      return dsWizAfter(S, X, leads.join("\n\n"), dupCode);
    }
    key = dsWizCur(st); val = t;
    if (pf) {
      if (pf.bare) {
        st.cur = pf.key;
        dsT(X, 1, "只打了欄位名「" + (dsStep(pf.key).name) + "」→ 黃色換到那一格");
        dsWizAsk(S, X);
        X.sheet = "沒動"; X.reply = "格子（黃色換到「" + dsStep(pf.key).name + "」）";
        return true;
      }
      key = pf.key; val = pf.value;
    } else if (dsIn(t, DS_BACK)) {
      at = steps.length;
      for (i = 0; i < steps.length; i++) if (steps[i].key === key) at = i;
      st.cur = steps[Math.max(0, at - 1)].key;
      dsT(X, 1, "「上一步」→ 黃色往上一格");
      dsWizAsk(S, X);
      X.sheet = "沒動"; X.reply = "格子（黃色往上一格）";
      return true;
    }
    if (!dsStep(key)) {
      dsWizAsk(S, X, "每一格都填好了 👍\n要改哪一格就點那一格；沒問題就按「👀 預覽、存檔」（或打「預覽」）。");
      X.sheet = "沒動"; X.reply = "提醒＋格子";
      return true;
    }
    r = dsWizPut(S, st, key, val);
    X.sheet = "沒動（存檔之前什麼都不會寫）";
    if (r) {
      st.cur = key;
      dsT(X, 0, "填「" + dsStep(key).name + "」這一格：不行" + (r.dup ? "（CODE 已經有了）" : r.lead ? "" : ""));
      X.reply = r.dup ? "提醒＋那支藥的卡片＋格子" : "提醒＋格子";
      return dsWizAfter(S, X, r.lead || "", r.dup || "");
    }
    dsT(X, 1, "填進「" + dsStep(key).name + "」這一格" + (dsIn(val, DS_SKIP) ? "（跳過）" : ""));
    st.cur = "";
    X.reply = "更新後的格子（黃色跳到下一個還沒填的）";
    return dsWizAfter(S, X, "", "");
  }
  function dsWizFillPick(S, X, key) {
    var st = S.wiz;
    if (!st || !st.data) { dsSend(X, [bot("這一筆已經過期了 😥\n請重新打「新藥」開始。")]); return; }
    if (!dsStep(key)) { dsWizAsk(S, X); return; }
    if (st.stage === "preview") st.pv = true;
    st.stage = "ask"; st.cur = key;
    dsT(X, 1, "點了「" + dsStep(key).name + "」那一格 → 黃色換過去；手機的輸入框會先填好「欄位名＋現在的內容」");
    dsWizAsk(S, X);
    X.sheet = "沒動"; X.reply = "格子（黃色在「" + dsStep(key).name + "」）";
    X.fill = (dsStep(key).name + " " + (st.data[key] || "")).substring(0, 290);
  }

  /* ───── ② 查一支藥（開發者的卡片多一顆「✏️ 修改」）───── */
  /* 卡片上黃色的公告框要寫什麼（01 的 _noticeText_）：公告類別（1~5 或中文）＋補充說明；只有補充沒有類別就只寫補充 */
  function dsNoteOf(r) {
    var k = r.nk === null || r.nk === undefined ? "" : String(r.nk).trim(), m = r.nm === null || r.nm === undefined ? "" : dsBrNl(r.nm).trim(), one, name, n;
    if (!k && !m) return "";
    if (!m) {
      one = k.match(/^([1-5])[\s、,，:：-]+(.+)$/);
      if (one) { k = one[1]; m = one[2].trim(); }
    }
    name = dsOwn(DS_NK, k) ? DS_NK[k] : "";
    if (!name) { for (n in DS_NK) if (DS_NK[n] === k) { name = k; break; } }
    if (!name) {
      if (!k) return m;
      if (m === k) m = "";
      return (k + (m ? "，" + m : "")).trim();
    }
    if (m === name) m = "";
    if (m && m.indexOf(name) >= 0) return m;
    return name + (m ? "，" + m : "");
  }
  function dsCardO(S, code) { var r = S.rows[code], o = { edit: 1, row: r, fam: dsFam(S, code) }, n = dsNoteOf(r), m = dsaMapOf(S, code); if (n) o.note = n; if (m) o.map = m; if (!o.fam) delete o.fam; return o; }
  function dsCard(S, code) { return dc(code, dsCardO(S, code)); }
  function dsLocNorm(v) {   /* 06 的 _locNorm_：全形轉半形、英文字母大寫、空白合成一個 */
    return String(v === null || v === undefined ? "" : v).replace(/[！-～]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }).replace(/[a-z]/g, function(ch) { return ch.toUpperCase(); }).replace(/\s+/g, " ").trim();
  }
  /* 匯入紀錄：新增的一筆（復原會把這一列清空）；回批次號（月日-時分秒毫秒，練習用假時鐘一次加 1 秒） */
  function dsP2(x) { return (x < 10 ? "0" : "") + x; }
  function dsMD(S, sep) {   /* 練習用假日期的「月日」（預設 09/15；S.day＝往後過了幾天）；sep 是月日中間的字 */
    var d = new Date(Date.UTC(2026, 8, 15 + (S && S.day ? S.day : 0)));
    return dsP2(d.getUTCMonth() + 1) + (sep || "") + dsP2(d.getUTCDate());
  }
  function dsBatchId(S) {
    var n = ++S.seq, sec = 45 * 60 + 30 + n;
    return dsMD(S) + "-10" + dsP2(Math.floor(sec / 60) % 60) + dsP2(sec % 60) + "123";
  }
  function dsClock(S) {   /* 「匯入紀錄」的時間欄（月/日 時:分:秒）；練習用假時鐘，跟批次號同一個秒數 */
    var sec = 45 * 60 + 30 + S.seq;
    return dsMD(S, "/") + " 10:" + dsP2(Math.floor(sec / 60) % 60) + ":" + dsP2(sec % 60);
  }
  /* ───── ② 查一支藥 ─────
     找藥照藥師教學那一課的搜尋（_learn_page.html 的 SIMSEARCH：CODE 一模一樣 → 名字有這幾個字 → 空格符號拿掉再比 → 容許打錯字），只是「藥」換成這個練習的試算表（新建的、改過的都算）。
     查位置（K2、B1…整格列出來）、加符號的整批查詢、一次查好幾個 CODE、藥師的指令（教學、公告…）是藥師教學教的，這裡只回一句說明。 */
  function dsIndex(S) {   /* 排成真的那份索引的樣子（試算表的順序；新建的在最後面） */
    return S.order.filter(Boolean).map(function(c) {
      var r = S.rows[c], b = String(r.b).toUpperCase(), z = String(r.z).toUpperCase(), g = String(r.g).toUpperCase(), l = String(r.loc).toUpperCase();
      return { c: c, b: b, z: z, g: g, loc: l, hay: [c, b, z, g].join("\t"), all: [c, b, z, g, l, String(r.f).toUpperCase()].join("\t") };
    });
  }
  function dsQuery(S, t) {
    var saved = SIM_ROWS, r;
    SIM_ROWS = dsIndex(S);
    try { r = dsaAbbrFix(S, simQuery(t)); } finally { SIM_ROWS = saved; }   /* 縮寫展開（01 的 searchDrug 的 _expandAbbr_／_abbrDevFirst_）：_learn_dev_sim_adv.js */
    return r;
  }
  function dsSearch(S, X, t) {
    var r = dsQuery(S, t), shown = t.trim(), n, cs, ms = [];
    X.sheet = "沒動（只是查）";
    if (!r) { dsSend(X, [bot("要查什麼？打 CODE、藥名都可以。")]); X.reply = "一句提醒"; return X; }
    dsT(X, 0, "是指令嗎？" + (r.kind === "cmd" ? "是，「" + r.cmd[0] + "」是藥師的指令" : "不是"));
    if (r.kind === "cmd" || r.kind === "agg" || r.kind === "multi") {
      dsSend(X, [act("練習聊天室不示範" + (r.kind === "cmd" ? "指令「" + r.cmd[0] + "」：真的 LINE 會" + r.cmd[1] : r.kind === "agg" ? "加符號的整批查詢（藥師版教學有）" : "一次查好幾個 CODE（藥師版教學有）") + "。這裡請打 CODE 或藥名，或照課文打開發者的指令。")]);
      X.reply = "（這個練習不示範）";
      return X;
    }
    if (r.kind === "none") {
      dsT(X, 0, "是 CODE 嗎？不是，沒有一支藥的 CODE 是「" + shown + "」");
      dsT(X, 0, "商品名、中文名、學名、位置裡有「" + shown + "」嗎？沒有，容許打錯一兩個字也沒有");
      dsSend(X, [nf(r.q)]);
      X.reply = "「查無」卡";
      return X;
    }
    if (r.kind === "code") dsT(X, 1, "是 CODE 嗎？是，「" + r.q + "」剛好是一支藥的 CODE，直接找到");
    else {
      dsT(X, 0, "是 CODE 嗎？不是，沒有一支藥的 CODE 是「" + shown + "」");
      if (r.kind === "loc" || r.kind === "locText") dsT(X, 1, "是位置嗎？是，「" + shown + "」是位置（英文字母加數字），有藥放在這一格");
      else if (r.kind === "name") dsT(X, 1, "商品名、中文名、學名裡有「" + shown + "」嗎？有，找到 " + r.total + " 支");
      else if (r.kind === "sq") dsT(X, 2, "空格、符號拿掉再比，找到 " + r.total + " 支");
      else dsT(X, 2, "照原樣找不到，容許打錯一兩個字再找，找到 " + r.total + " 支");
    }
    if (r.abbr) dsT(X, 1, r.abbr.first ? "「" + r.abbr.k + "」剛好是開發者加的縮寫（指到「" + r.abbr.to + "」）→ 縮寫指到的藥排最前面，後面接原本查到的" : "「" + r.abbr.k + "」是縮寫（" + (r.abbr.builtin ? "內建的" : "開發者加的") + "）→ 展開成「" + r.abbr.to + "」再找");
    if (r.list) {
      dsSend(X, [act("練習聊天室不示範查位置（藥師版教學有）：真的 LINE 會把放在這一格的 " + r.total + " 支藥整格列出來。這裡請打 CODE 或藥名。")]);
      X.reply = "（這個練習不示範）";
      return X;
    }
    cs = r.codes;
    if (r.kind === "fuzzyCode") ms.push(bot(codeWarn(r.q)));
    ms.push(cs.length === 1 ? dsCard(S, cs[0]) : { w: "car", cs: cs.map(function(c) { return { c: c, o: dsCardO(S, c) }; }) });
    dsSend(X, ms);
    n = r.total;
    X.reply = (r.kind === "fuzzyCode" ? "「CODE 相近」的警告＋" : "") + (cs.length === 1 ? "這支藥的卡片（開發者的卡片多一顆「✏️ 修改」）" : (n > cs.length ? "前 " + cs.length + " 張" : cs.length + " 張") + "藥品卡片排成一排（往左滑看下一張）");
    return X;
  }

  /* ───── 這一步「可以這樣打」的範例字（畫面上點一下，就幫你打好、直接送出）─────
     填新藥的途中：黃色那一格的例子；預覽的時候：存檔、改位置；改某一欄的途中：那一欄的新內容；一次改多項的卡片開著：「中文 …」「A …」；
     沒有進行中的流程回 []，畫面改用這一課自己的起手字（d.ex）。 */
  var DS_EX = { brand: "NEWTESTIN* 10MG TAB", loc: "K9", zh: "新測寧錠 10 毫克", gen: "Newtestin 10mg", note: "高血壓", feat: "白色圓形 有刻痕" };
  var DS_MULTI = "商品名 NEWTESTIN* 10MG TAB\n位置 K2\n劑型 錠劑\n中文名 新測寧錠 10 毫克";
  /* 改某一欄的時候，輸入框裡打的範例（值就好，欄位名手機會先幫你填） */
  var DS_FEX = { brand: "TESTOLOL* 50MG TAB", zh: "測試洛爾錠 50 毫克", loc: "k9", form: "膠囊", gen: "TESTOLOL HCL 50MG", feat: "白色圓形 有刻痕", note: "高血壓", pair: "不可和 XX 併用", old: "舊藥名 TESTOLOL*", nm: "新包裝 8/1 起", ref: "https://example.org/drug/90101" };
  var DS_MEX = "中文 測試洛爾錠 50 毫克";
  var DS_MEX3 = "A TESTOLOL* 50MG TAB\nB 測試洛爾錠 50 毫克\nC k9";
  /* 匯入進行中，輸入框上面的範例字：總覽 → 開始／取消；逐筆確認 → 對、改一格、跳過、先停；改一格 → 那一欄的新內容（08 的 _impFlow_ 這三關會把每一句話都接走） */
  var DS_IMP_EX = { brand: "NEWTESTIN* 20MG TAB", zh: "新測寧錠 20 毫克", loc: "B1", form: "膠囊", gen: "Newtestin 20mg", ref: "https://example.org/drug/90130", nk: "4 換廠", nm: "新包裝 8/1 起" };
  function dsImpSug(im) {
    var q, i, pick = "", row;
    if (im.stage === "overview") return ["開始逐筆確認", "取消匯入"];
    if (im.stage === "edit") return [DS_IMP_EX[im.edit] || "新內容", "清空", "不改了"];
    row = im.rows[im.i];
    if (!row) return ["取消匯入"];
    q = dsImpRowQuick(im);
    for (i = 1; i < q.length; i++) if (q[i].m.indexOf("改 ") === 0 && (!pick || q[i].m === "改 位置")) pick = q[i].m;
    return pick ? ["對", pick, "跳過", "先停"] : ["對", "跳過", "先停"];
  }
  function dsSug(S) {
    var st = S.wiz, k, out = [], f = S.fld;
    if (S.imp && (S.imp.stage === "overview" || S.imp.stage === "confirm" || S.imp.stage === "edit")) return dsImpSug(S.imp);
    if (f) {
      if (f.k === "nk") return ["4 換廠", "2 改包裝通知 新包裝 8/1 起", "移除"];
      if (f.fromNotice) return ["新包裝 8/1 起", "不用"];
      if (f.k === "map") return f.step === "name" ? ["錠A", "水棧一", "取消"] : ["棧中", "平", "沒平", "自動"];
      if (DS_FEX[f.k]) return [DS_FEX[f.k], "清空", "取消"];
      return ["取消"];
    }
    if (!st) {
      if (S.imp && S.imp.stage === "undo") return ["取消"];
      if (S.mefOpen) return [DS_MEX, DS_MEX3, "G 4 換廠", "I 舊藥名 TESTOLOL*"];
      if (S.ops.lstUi && dskSug(S).length) return dskSug(S);
      return S.ops.webUi ? dwbSug(S) : out;
    }
    if (st.stage === "preview") return ["存檔", "位置 K9", "回格子"];
    k = dsWizCur(st);
    if (k === "code") out = ["90120", "90101", "ABC"];
    else if (DS_EX[k]) out = [DS_EX[k]];
    if (k === "brand") out.push(DS_MULTI);
    if (!dsWizNeed(st).length) out.unshift("預覽");
    return out;
  }

  /* ───── 動作進來的總入口 ───── */
  /* 還沒有做的功能（匯入、開發者選單、體檢…）：說一聲在哪一課，不動任何東西 */
  function dsLater(X, what, where) {
    dsSend(X, [act("練習聊天室這一課沒有做「" + what + "」：" + where)]);
    X.sheet = "沒動"; X.reply = "（這一課不示範）";
    dsT(X, 1, "「" + what + "」是別課的功能，這一課的練習聊天室沒有做，不會改任何東西");
  }
  var DS_DEVWORDS = "藥品家族|備用卡片|健檢|體檢|版本更新|速度|照片型號|照片速度|語音速度|文字速度|OCR辨識|ocr辨識|OCR接手|ocr接手|清單校對|位置查核|平面圖|縮圖|雙軌|清暫存|語音嚴格|語音寬鬆|語音狀態|語音V2|新卡片|舊卡片|多筆查詢|單筆查詢|同步平面圖|平面圖設定|語音v2|縮寫|清快取|同步照片|觸發器|平面圖診斷|圖文選單";
  var DS_DEVRE = new RegExp("^(" + DS_DEVWORDS + ")");
  var DS_IMPWORD_RE = new RegExp("^(匯入|開始匯入|復原|" + DS_DEVWORDS + "|開發者|我的代號|我的ID|我的id)");
  /* 08 的 _impFlow_：匯入、復原、開發者指令。回 true＝這句話處理掉了 */
  function dsImpFlow(S, X, t, flat) {
    var st = S.imp, isWord = DS_IMPWORD_RE.test(flat), joinM;
    if (dsMefLooks(S, t)) return false;   /* 「一次改」卡片開著，打「縮寫 HCTZ」是改那支藥的縮寫，不是叫開發者指令 */
    if (dskText(S, X, t, flat, st)) return true;   /* 第 17 批 13 的 _lckText_：「位置查核」指令、等新位置的那一句、在清單校對／位置查核裡打一個位置（沒有位置查核的旗標、也不是「位置查核」開頭的話一進來就放行）*/
    if (!st && !isWord) return false;
    if (/^(我的代號|我的ID|我的id)$/.test(flat)) return dsaMyId(S, X);
    joinM = flat.match(/^開發者碼(\d{4,8})$/);   /* 打邀請碼：每個人都可以打（對方還不是開發者也能打）；你自己打，只會說「本來就在名單裡」 */
    if (joinM) return dsaJoin(S, X, DSA_SELF, joinM[1]);
    if (st && st.stage === "edit") return dsImpEditStage(S, X, st, t, flat);   /* 等新內容的時候，打什麼都算新內容 */
    if (st && st.stage === "undo") {
      if (/^確定復原/.test(flat)) { S.imp = null; dsUndoRun(S, X, st.target); return true; }
      S.imp = null;
      if (/^(取消|不用了|算了)$/.test(flat)) {
        dsSend(X, [bot("沒有復原任何東西。")]);
        dsT(X, 1, "是「取消」→ 什麼都沒還原");
        X.sheet = "沒動"; X.reply = "「沒有復原任何東西」";
        return true;
      }
    }
    if (/^(匯入|開始匯入)$/.test(flat)) {
      if (st && st.stage === "confirm" && st.i < st.rows.length) {   /* 逐筆確認做到一半又打「匯入」：回到停的那一筆，不重讀 */
        dsT(X, 1, "是「匯入」，而且上次逐筆確認還沒做完（停在第 " + (st.i + 1) + " 筆）→ 不重新讀，回到那一筆");
        X.sheet = "沒動";
        dsImpShowRow(S, X, st, "上次停在這一筆（第 " + (st.i + 1) + "／" + st.rows.length + "）：");
        X.reply = "「上次停在這一筆」＋那一筆的卡片";
        return true;
      }
      S.imp = null;
      return dsImpStart(S, X);
    }
    if (/^復原/.test(flat)) { S.imp = null; return dsUndoCmd(S, X, t); }
    if (/^開發者$/.test(flat)) return dsoMenu(S, X);
    if (/^開發者(邀請|名單|移除|加|刪|刪除|管理|退出|結束|離開)/.test(flat)) return dsaDevCmd(S, X, t, flat);
    if (DS_DEVRE.test(flat) && dsoDevCmd(S, X, t, flat)) return true;
    if (!st) return false;
    return dsImpStep(S, X, st, t, flat);
  }
  /* 06 的 _mobileFlow_：改某一欄 → 新藥的格子 → 新藥 → 怎麼改 → 一次改多項那張卡開著 */
  function dsMobileFlow(S, X, raw, t, flat) {
    if ((S.wiz || S.fld) && t.charAt(0) === "/") { S.wiz = null; S.fld = null; return false; }
    if (S.fld) return dsEfApply(S, X, t);
    if (S.wiz) { dsWizStep(S, X, t); return true; }
    if (/^(新藥|新增藥品|加藥|建藥|新增)$/.test(flat) || /^\/(新藥|new)$/i.test(flat)) { dsWizStart(S, X); return true; }
    if (/^(怎麼改|如何修改|改資料)$/.test(flat)) { dsHowEdit(S, X); return true; }
    return dsMefTypeIn(S, X, raw);
  }
  /* 06 的 _mobilePostback_：卡片上的按鈕、輸入框上面的小按鈕（postback）按下去 */
  function dsPostback(S, X, v) {
    var p;
    if (v.indexOf("lck=") === 0) return dskPostback(S, X, v);   /* 位置查核卡片上的按鈕（打勾、修改、選新位置…）*/
    if (v.indexOf("wizfill=") === 0) { dsWizFillPick(S, X, v.replace(/^wizfill=/, "")); return true; }
    if (v === "wiz=preview") { dsWizGoPreview(S, X); return true; }
    if (v === "wiz=save") { dsWizSave(S, X); return true; }
    if (v.indexOf("edit=") === 0) { dsEfMenu(S, X, v.replace(/^edit=/, "")); return true; }
    if (v.indexOf("ef=") === 0) { p = v.replace(/^ef=/, "").split("|"); dsEfPick(S, X, p[0] || "", p[1] || "", false); return true; }
    if (v.indexOf("effill=") === 0) { p = v.replace(/^effill=/, "").split("|"); dsEfFillPick(S, X, p[0] || "", p[1] || ""); return true; }
    if (v.indexOf("efapp=") === 0) { p = v.replace(/^efapp=/, "").split("|"); dsEfAppPick(S, X, p[0] || "", p[1] || ""); return true; }
    if (v.indexOf("mefk=") === 0) { p = v.replace(/^mefk=/, "").split("|"); dsEfPick(S, X, p[0] || "", p[1] || "", true); return true; }
    if (v.indexOf("mefmore=") === 0) { dsMefMore(S, X, v.replace(/^mefmore=/, "")); return true; }
    if (v.indexOf("meffill=") === 0) { p = v.replace(/^meffill=/, "").split("|"); dsMefFillPick(S, X, p[0] || "", p[1] || ""); return true; }
    if (v.indexOf("mefnkset=") === 0) { p = v.replace(/^mefnkset=/, "").split("|"); dsMefNkSet(S, X, p[0] || "", p[1] || ""); return true; }
    if (v.indexOf("mefnk=") === 0) { dsMefNkCard(S, X, v.replace(/^mefnk=/, "")); return true; }
    if (v.indexOf("mefend=") === 0) { dsMefEnd(S, X, v.replace(/^mefend=/, "")); return true; }
    if (v.indexOf("mef=") === 0) { dsMefStart(S, X, v.replace(/^mef=/, "")); return true; }
    return false;
  }
  function dsRun0(S, ev) {
    var X = dsX(), raw, t, flat, v;
    if (ev.t === "pb") {
      v = String(ev.v || "");
      if (ev.d) X.msgs.push(me(ev.d)); else X.msgs.push(dsEcho("👆 點了" + (ev.a || "一顆按鈕")));
      if (dsPostback(S, X, v)) return X;
      dsSend(X, [bot("這個按鈕練習聊天室沒有做。")]);
      return dsBar(X);
    }
    if (ev.t === "img") {   /* 傳一張照片（練習專用的按鈕）：我說的是一張照片，機器人先看有沒有在等照片（02 的 _picFlow_） */
      if (ev.v && S.ops.lstUi) { dslImg(S, X, String(ev.v)); return X; }   /* 清單校對那一課傳的是一張印出來的清單，不是一瓶藥 */
      X.msgs.push(pic("一瓶藥的照片", "w"));
      dspRecv(S, X);
      return X;
    }
    if (ev.t === "web") { dslWeb(S, X, ev); return X; }   /* 在清單校對的網頁上做的事（練習專用的畫面）：沒有傳給機器人，聊天室原樣留著 */
    if (ev.t === "dwb") { dwbEvent(S, X, ev); return X; }   /* 在開發者網頁上做的事、開發者網頁那一課的練習專用按鈕（_learn_dev_sim_web.js）：網頁那一頭沒有傳給機器人 */
    if (ev.t === "sim") {
      v = String(ev.v || "");
      if (v.indexOf("oth:") === 0) dsaOth(S, X, v); else if (v.indexOf("lst:") === 0) dslTime(S, X, v); else dspSim(S, X, v);
      return X;
    }   /* 在雲端硬碟上做的事（練習專用的按鈕）：沒有傳給機器人 */
    raw = String(ev.v === null || ev.v === undefined ? "" : ev.v);
    t = raw.trim();
    flat = t.replace(/\s+/g, "");
    X.msgs.push(me(String(ev.v)));
    if (dsImpFlow(S, X, t, flat)) return X;
    if (dsMobileFlow(S, X, raw, t, flat)) return X;
    if (dwbLine(S, X, raw, t, flat)) return X;   /* 開發者網頁：「開發者網頁」「…重發」「…綁定」、貼代號、「驗證碼登入 關／開」、「開發者網頁 設定」 */
    return dsSearch(S, X, t);
  }
  /* 每一則回覆最下面，機器人自己沒有放小按鈕的，會接上「標準那排」（練習聊天室做得到的只有「🔧 開發者」）；
     這一則改過的格子，回覆完一次記進「匯入紀錄」（真的是 doPost 回覆完才寫，不讓人多等）。keep＝這一則機器人什麼都沒回（只有輸入框被填好字），聊天室、小按鈕都留著；qKeep＝這一則是「對方」（另一個人）看到的，輸入框上面的小按鈕是你的，不動 */
  function dsRun(S, ev) {
    var X = dsRun0(S, ev);
    dsEfFlush(S, X);
    if (S.ops.oth || S.ops.lstUi) dsaStamp(S);   /* 進階指令那一課：記下「做到哪」每一份暫存最後一次變動的時間，「時間過了…」才知道哪些要過期 */
    dsStdBar(S, ev, X);
    return X;
  }
  /* 每一則回覆最下面接「標準那排」（自己沒有放小按鈕的才接，真的 _attachQuickBar_：if (last.quickReply) return）。
     開發者網頁那一課：那排的「🌐 網頁」要帶你的鑰匙（_appQuickTok_），順手把鑰匙的 30 天往後推（_learn_dev_sim_web.js 的 dwbQuick）。自己放了小按鈕的回覆（例如「你是不是要找…」）不會去算。
     獨立成一個函式，是為了測試（tools/learn_dev_sim_h.js）可以直接呼叫它，跟真的 LINE 專案比「這一則話之後，標準那排接了沒、鑰匙有沒有被發或續期」 */
  function dsStdBar(S, ev, X) {
    if (!X.q && !X.keep && !X.qKeep) {
      X.q = DS_BAR.slice();
      if (S.ops.webUi && (ev.t === "text" || ev.t === "pb") && dwbReplied(X)) dwbQuick(S.ops.web, DWB_ME);
    }
    return X;
  }
  /*/SIMDEV*/

  /* ───────── 練習聊天室的畫面（第 17 批）─────────
     輸入框（<textarea>：Enter 送出、Shift＋Enter 或旁邊的「↵」換行；輸入法選字中的 Enter 不算送出）在最上面，下面依序：這一步輸入框上面會出現的小按鈕、範例字、聊天室（只放最新這一輪：我說的／點的、機器人回的）。
     聊天室裡的卡片是活的（gAct）：格子的每一列、「👀 預覽、存檔」、「✏️ 修改」…都是真的按鈕（Tab 走得到，Enter／空白鍵按得下去），點下去等於在真的 LINE 上點那一顆。
     深色的框「背後發生的事」把引擎給的每一步寫成白話；「重播」把聊天室、練習用的試算表、輸入框全部清空，再自動示範一遍。
     不用 <form>、打的字只用 textContent 放進畫面，不存、不傳（頁面本來就不連網）。裝置設定「減少動態」：不等、不跳動畫，一次全出。 */
  var dsN = 0;
  function demoDsim(d) {
    var hid = "dsh" + (++dsN), timers = [], curKey = d.pend || "sample", S = dsNew(curKey, !!d.lst);
    var chat = el("div", { class: "chat sim-chat", role: "group", "aria-label": "練習用的假聊天室", tabindex: "-1" });
    var net = el("div", { class: "net", "aria-live": "polite" });
    var hint = el("p", { class: "sim-hint", id: hid, role: "status" });
    var input = el("textarea", { class: "sim-in dsin", rows: "1", maxlength: "600", autocomplete: "off", autocapitalize: "off", autocorrect: "off", spellcheck: "false", enterkeyhint: "send", placeholder: "例：" + d.ex[0], "aria-label": "練習用的輸入框：打指令、CODE 或要填的內容。Enter 送出，Shift 加 Enter 換行", "aria-describedby": hid });
    var qbar = el("div", { class: "dsq", role: "group", "aria-label": "輸入框上面的小按鈕" });
    var sgl = el("div", { class: "simgl", "aria-hidden": "true" });
    var sgr = el("div", { class: "picks", role: "group", "aria-label": "範例字" });
    var shBox = null, shTbl = null, shPre = null, shBtns = [];   /* 練習用的試算表（d.sheet＝匯入那一課才有）：換資料的按鈕、「待匯入」分頁現在的樣子 */
    var actRow = el("div", { class: "dsact", role: "group", "aria-label": "練習專用的按鈕（真的 LINE 沒有這些）" });   /* 練習專用的按鈕：現在需要「傳一張照片」、或這一課有「假裝另一個人」的時候才出現（dsActs） */
    var actLab = el("div", { class: "simgl", "aria-hidden": "true", text: "練習專用的按鈕（真的 LINE 沒有這個，要自己拍照、選照片）：" });
    var actBox = el("div", { class: "simg dsactg" }, [actLab, actRow]);
    var drBox = null, drList = null, drActs = null;   /* 練習用的雲端照片資料夾（d.drive＝日常維護那一課才有）：資料夾裡現在有什麼、「在雲端硬碟上做的事」的按鈕 */
    var webP = d.lst ? dswMake(function() { return S; }, function(ev) { run(ev); }) : d.web ? dwbMake(function() { return S; }, function(ev) { run(ev); }) : null;   /* 練習用的網頁（d.lst＝清單校對那一課才有：聊天室裡按「📤 多張上傳」「📋 待審清單」才打開；d.web＝開發者網頁那一課：四台裝置的瀏覽器，一開始就在聊天室下面） */
    function webDraw() { if (webP) webP.draw(); }
    function clearTimers() { timers.forEach(function(t) { clearTimeout(t.id); }); timers = []; }
    function after(ms, fn, anim) {
      var t = { fn: fn, anim: !!anim };
      t.id = setTimeout(function() { timers = timers.filter(function(x) { return x !== t; }); fn(); }, ms);
      timers.push(t);
    }
    /* 機器人這一輪的回覆還在一則一則出現（動畫）時，又點了前面那張卡片上的按鈕、而且機器人這次什麼都沒回：先讓還沒出現的那幾則一次出完，再處理這一下 */
    function flushAnim() {
      var run_ = timers.filter(function(t) { return t.anim; });
      timers = timers.filter(function(t) { return !t.anim; });
      run_.forEach(function(t) { clearTimeout(t.id); });
      run_.forEach(function(t) { t.fn(); });
    }
    function say(t) { hint.textContent = t || ""; }
    function coarse() { try { return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches); } catch (e) { return false; } }
    function grow() {
      var bd;
      input.style.height = "auto";
      if (!input.offsetHeight) return;
      bd = input.offsetHeight - input.clientHeight;
      input.style.height = Math.min(input.scrollHeight + bd, 168) + "px";
    }
    function netHead() { return el("div", { class: "net-h" }, ["背後發生的事", el("span", { text: "機器人一步一步做了什麼" })]); }
    function netIdle() {
      net.setAttribute("data-kind", "idle");
      net.removeAttribute("aria-busy");
      net.textContent = "";
      net.appendChild(netHead());
      net.appendChild(el("p", { class: "net-idle", text: "還沒送出東西。打一句話、點小按鈕、或點卡片上的按鈕，這裡會一步一步寫給你看：機器人收到之後先判斷什麼、試算表動了沒有、最後回了什麼。" }));
    }
    function netShow(X, who) {
      net.setAttribute("data-kind", "ds");
      net.removeAttribute("aria-busy");
      net.textContent = "";
      net.appendChild(netHead());
      net.appendChild(el("p", { class: "net-q" }, [who.pre, el("b", { text: who.t })]));
      net.appendChild(el("ol", { class: "net-l" }, (X.trail.length ? X.trail : [{ ok: 1, t: "收到了，照指令做" }]).map(function(x) {
        return el("li", { class: x.ok ? "y" : "n" }, [el("span", { class: "ni", "aria-hidden": "true", text: x.ok ? "✓" : "✕" }), el("span", { text: x.t })]);
      })));
      net.appendChild(el("dl", { class: "net-r" }, [el("dt", { text: "試算表" }), el("dd", { text: (X.wrote ? "✍️ 寫了：" : "") + X.sheet }), el("dt", { text: "機器人回" }), el("dd", { text: X.reply })]));
    }
    function qBtns(q, first) {
      qbar.textContent = "";
      if (!q || !q.length) { qbar.appendChild(el("span", { class: "dsq-none", text: first ? "（機器人回了之後，這裡會出現小按鈕）" : "（這一步沒有小按鈕）" })); return; }
      q.forEach(function(x) {
        qbar.appendChild(on(el("button", { type: "button", class: "dq", text: x.l }), "click", function() {
          if (x.web) run({ t: "web", w: "open", v: x.web, a: "小按鈕「" + x.l + "」（開網頁）" });
          else if (x.p) run({ t: "pb", v: x.p, d: x.d, a: "小按鈕「" + x.l + "」" });
          else run({ t: "text", v: x.m });
        }));
      });
    }
    function chips() {
      var list = dsSug(S), flow = list.length > 0;
      if (!flow) list = d.ex;
      sgl.textContent = flow ? "這一步可以這樣打（點一下，幫你打好、直接送出）：" : "點一下範例字，幫你打好、直接送出：";
      sgr.textContent = "";
      list.forEach(function(w) {
        var multi = String(w).indexOf("\n") >= 0;
        sgr.appendChild(on(el("button", { type: "button", class: "pk", text: String(w).replace(/\s*\n\s*/g, " ⏎ "), "aria-label": multi ? "範例（好幾行）：" + String(w).replace(/\n/g, "，") : null }), "click", function() { fill(w); }));
      });
    }
    function emptyChat() {
      chat.textContent = "";
      chat.style.minHeight = "";
      chat.appendChild(el("p", { class: "sim-empty", text: "👆 在上面的輸入框打字，按「送出」（或點下面的範例字）。機器人的回覆會出現在這裡。" + (d.lst ? "按了「📤 多張上傳」或「📋 待審清單」，聊天室下面的練習網頁就會打開。" : "") + (d.sheet ? "聊天室下面有練習用的試算表，也可以換一份貼進去的資料。" : "") + (d.web ? "聊天室下面有練習用的瀏覽器：四台裝置各自開網頁，LINE 卡片上的「打開網頁」按下去，就在你選的那一台打開。" : "") }));
    }
    /* 「待匯入」分頁現在的樣子：S.pend 一列一列畫出來（沒有的列補空白，至少 4 列）；紅底＝機器人說有問題的列，A 欄那一格有註解（原因寫在表格下面，手機上沒有「把游標移上去」） */
    function sheetDraw() {
      var rows, pv, width, n, i, j, r, cells, cols = [], vals = [], bad = [], nts = [], nots = [], label = "", w;
      if (!shBox) return;
      rows = S.pend.rows;
      pv = dsPendValues(S);
      width = Math.max(pv.width, 5);
      n = Math.max(rows.length, 4);
      for (j = 0; j < width; j++) cols.push(dsColLetter(j));
      for (i = 0; i < n; i++) {
        r = rows[i];
        cells = [];
        for (j = 0; j < width; j++) cells.push(r ? dsCol(r.c[j]) : "");
        vals.push(cells);
        if (r && r.bad) { bad.push(i); nts.push([i, 0]); nots.push("第 " + (i + 1) + " 列、A 欄那一格的註解：⚠️ " + r.bad + "（補藥神器匯入）"); }
      }
      for (i = 0; i < DS_IMP_PRESETS.length; i++) if (DS_IMP_PRESETS[i].key === S.pend.key) label = DS_IMP_PRESETS[i].label;
      w = shEl({ tabs: ["工作表1", "待匯入", "匯入紀錄"], tab: "待匯入", cols: cols, rows: vals, bad: bad, nt: nts, nohd: S.pend.hd === 0, cap: "練習用的試算表「待匯入」分頁，貼進去的是「" + label + "」，有字的有 " + pv.last + " 列" + (bad.length ? "，其中 " + bad.length + " 列是紅底（有問題）" : "") });
      nots.forEach(function(t) { w.appendChild(el("div", { class: "sh-n", text: t })); });
      shTbl.textContent = "";
      shTbl.appendChild(w);
      shBtns.forEach(function(b) { b.b.setAttribute("aria-pressed", b.k === S.pend.key ? "true" : "false"); });
    }
    /* 練習專用的按鈕（傳一張照片）：現在用不到就整排藏起來 */
    function actDraw(focusId) {
      var ln = dsActs(S).filter(function(a) { return a.w === "line" || a.w === "oth" || a.w === "web"; }), hit = null;
      actRow.textContent = "";
      ln.forEach(function(a) {
        var b = on(el("button", { type: "button", class: "dq dq-sim", "data-act": a.id, text: a.l }), "click", function() { if (a.w === "oth") run({ t: "sim", v: a.id, a: a.l }); else if (a.w === "web") run({ t: "dwb", w: "act", v: a.id.replace(/^web:/, ""), a: a.l }); else run({ t: "img", a: a.l, v: a.v }); });
        if (focusId && a.id === focusId) hit = b;
        actRow.appendChild(b);
      });
      actLab.textContent = d.web ? "練習專用的按鈕（真的 LINE 沒有這個）：換「你在哪裡打字」、假裝「藥師」做的事；聊天室裡畫的是藥師看到的，不是你的聊天室：" : d.oth ? "練習專用的按鈕（真的 LINE 沒有這個）：用來假裝「另一個人」做的事，聊天室裡畫的是他看到的，不是你的聊天室：" : d.lst ? "練習專用的按鈕（真的 LINE 沒有這個，要自己拍清單、拍貨架、等時間過去）：傳一張編好的清單或貨架照片、讓時間往前走：" : "練習專用的按鈕（真的 LINE 沒有這個，要自己拍照、選照片）：";
      actBox.hidden = !ln.length;
      if (hit) { try { hit.focus({ preventScroll: true }); } catch (e) {} }   /* 剛按的那顆（機器人這一則什麼都沒回，像「時間過了」）還在，焦點留在它身上 */
    }
    /* 雲端照片資料夾現在的樣子：每個檔案和它跟試算表對得上沒有（字寫出來，不只靠顏色）；子資料夾（舊照片、公告照片）和裡面的檔案；下面是「在雲端硬碟上做的事」 */
    var DR_BD = { ok: "試算表已對上", "new": "還沒對上試算表", dup: "重複：同一支藥兩個檔案", bad: "檔名不是 CODE", none: "試算表沒有這支藥" };
    function driveDraw(focusId) {
      var v, ul, hit = null, first = null;
      if (!drBox) return;
      v = dspView(S);
      drList.textContent = "";
      ul = el("ul", { class: "dsdr-ul", "aria-label": "雲端照片資料夾裡的檔案" });
      if (!v.files.length) ul.appendChild(el("li", { class: "dsdr-none", text: "（資料夾是空的）" }));
      v.files.forEach(function(f) {
        ul.appendChild(el("li", { class: "dsdr-f st-" + f.st, "data-name": f.name }, [el("span", { class: "nm", text: f.name }), el("span", { class: "bd", text: DR_BD[f.st] })]));
      });
      v.subs.forEach(function(sf) {
        var inner = el("ul", { class: "dsdr-ul in", "aria-label": "「" + sf.name + "」裡的檔案" });
        sf.files.forEach(function(n) { inner.appendChild(el("li", { class: "dsdr-f", "data-sub": sf.name, "data-name": n }, [el("span", { class: "nm", text: n })])); });
        if (sf.old) {
          sf.old.forEach(function(n) { inner.appendChild(el("li", { class: "dsdr-f", "data-sub": sf.name + "/舊照片", "data-name": n }, [el("span", { class: "nm", text: "舊照片／" + n })])); });
        }
        ul.appendChild(el("li", { class: "dsdr-sub", "data-folder": sf.name }, [el("span", { class: "nm", text: "📁 " + sf.name + "（" + (sf.files.length + (sf.old ? sf.old.length : 0)) + " 個檔案）" }), inner]));
      });
      drList.appendChild(ul);
      drActs.textContent = "";
      dsActs(S).filter(function(a) { return a.w === "drive"; }).forEach(function(a) {
        var b = on(el("button", { type: "button", class: "dq dq-sim", "data-act": a.id, text: a.l }), "click", function() { run({ t: "sim", v: a.id, a: a.l }); });
        if (!first) first = b;
        if (focusId && a.id === focusId) hit = b;
        drActs.appendChild(b);
      });
      if (focusId !== undefined) { try { (hit || first || drBox).focus({ preventScroll: true }); } catch (e) {} }
    }
    function reset(key) {
      if (key) curKey = key;
      clearTimers();
      S = dsNew(curKey, !!d.lst);
      S.ops.oth = d.oth ? 1 : 0;
      S.ops.lstUi = d.lst ? 1 : 0;
      S.ops.webUi = d.web ? 1 : 0;
      input.value = "";
      grow();
      say("");
      emptyChat();
      qBtns(null, true);
      chips();
      netIdle();
      sheetDraw();
      actDraw();
      driveDraw();
      if (webP) webP.reset();
    }
    /* 聊天室裡卡片上的按鈕：{ m } 是 message 按鈕（等於打那句字，不動輸入框裡打到一半的字）；{ p, d, a } 是 postback（d＝聊天室多出來的那句字，a＝給「背後發生的事」的名稱） */
    function card(send, lab) {
      if (send.web !== undefined) run({ t: "dwb", w: "link", v: send.web, a: "LINE 卡片上的「" + String(lab).split("：")[0] + "」" });
      else if (send.m !== undefined) run({ t: "text", v: send.m });
      else run({ t: "pb", v: send.p, d: send.d, a: send.a || (send.d ? "" : "「" + lab + "」") });
    }
    function run(ev, fromInput) {
      var X, msgs, fl, rows, tp, i, last, who, focused = document.activeElement, hold, fin, inDr, drId, inAct, actId;
      if (ev.t === "text" && !String(ev.v).trim()) {
        say("先在上面的輸入框打幾個字（或點下面的範例字），再按「送出」。");
        try { input.focus(); } catch (e) {}
        return;
      }
      say("");
      hold = !!focused && focused !== document.body && (chat.contains(focused) || qbar.contains(focused) || sgr.contains(focused) || actBox.contains(focused));   /* 按的那顆按鈕馬上會被換掉：焦點要接住 */
      inDr = !!drBox && !!focused && drBox.contains(focused);
      drId = inDr && focused.getAttribute ? focused.getAttribute("data-act") || "" : "";
      inAct = !!focused && actBox.contains(focused);
      actId = inAct && focused.getAttribute ? focused.getAttribute("data-act") || "" : "";
      X = dsRun(S, ev);
      who = ev.t === "text" ? { pre: "你送出：", t: "「" + String(ev.v).replace(/\s*\n\s*/g, " ⏎ ").substring(0, 60) + "」" } : ev.t === "img" ? { pre: "你傳了：", t: ev.v ? (String(ev.a || "").replace(/^📷\s*傳/, "") || "一張清單的照片") : "一張照片" } : ev.t === "sim" ? { pre: "你做了：", t: ev.a || "一件事" } : ev.t === "dwb" ? (ev.w === "act" ? { pre: "你做了：", t: ev.a || "一件事" } : { pre: "你在網頁上：", t: ev.a || "做了一件事" }) : { pre: "你點了：", t: ev.a || (ev.d ? "「" + ev.d + "」" : "一顆按鈕") };
      if (X.keep) {
        /* 機器人什麼都沒回（一次改多項那張卡上按「改」：手機的輸入框已經先填好字了）：聊天室、輸入框上面的小按鈕原樣留著，只有「背後發生的事」和輸入框動 */
        flushAnim();
        netShow(X, who);
        sheetDraw();
        actDraw(inAct ? actId : undefined);
        driveDraw(inDr ? drId : undefined);
        webDraw();
        if (X.fill !== null && X.fill !== undefined) {
          input.value = X.fill;
          grow();
          try { input.focus({ preventScroll: true }); input.setSelectionRange(X.fill.length, X.fill.length); } catch (e) {}
          say("輸入框先填好了「" + X.fill.replace(/\s*\n\s*/g, " ⏎ ") + "」，游標在最後面：改好按「送出」。卡片還開著，直接打「欄位名 內容」也可以。");
        } else if (X.say) say(X.say);
        return;
      }
      clearTimers();
      msgs = X.msgs;
      fl = firstFlags(msgs);
      gAct = card;
      try { rows = msgs.map(function(m, j) { return bubble(m, !REDUCE, fl[j]); }); } finally { gAct = null; }
      last = rows.length - 1;
      if (ev.t === "text" && fromInput) { input.value = ""; grow(); }
      chat.style.minHeight = chat.offsetHeight + "px";   /* 換內容的時候先撐住原本的高度，下面的東西不會先縮上去再長下來 */
      chat.textContent = "";
      chat.appendChild(rows[0]);
      net.setAttribute("aria-busy", "true");
      if (X.fill !== null && X.fill !== undefined) {   /* 點了卡片上的一格：手機的輸入框先填好「欄位名＋現在的內容」，游標在最後面（跟真的 LINE 一樣會開鍵盤） */
        input.value = X.fill;
        grow();
        try { input.focus({ preventScroll: true }); input.setSelectionRange(X.fill.length, X.fill.length); } catch (e) {}
      } else if (hold) {
        try { (coarse() ? chat : input).focus({ preventScroll: true }); } catch (e) {}
      } else if (coarse() && document.activeElement === input) {
        try { input.blur(); } catch (e) {}   /* 手機：收起鍵盤，結果才看得到 */
      }
      fin = function() { if (!X.qKeep) qBtns(X.q); chips(); netShow(X, who); sheetDraw(); actDraw(); driveDraw(); webDraw(); if (X.say) say(X.say); chat.style.minHeight = ""; };
      if (REDUCE || last === 0) {
        for (i = 1; i <= last; i++) chat.appendChild(rows[i]);
        fin();
        return;
      }
      tp = simTyping();
      after(260, function() { chat.appendChild(tp); }, true);
      after(800, function() {
        if (tp.parentNode) tp.parentNode.removeChild(tp);
        chat.appendChild(rows[1]);
        fin();
        if (last === 1) chat.style.minHeight = "";
      }, true);
      for (i = 2; i <= last; i++) {
        (function(row, k) {
          after(800 + (k - 1) * 420, function() {
            chat.appendChild(row);
            if (k === last) chat.style.minHeight = "";
          }, true);
        })(rows[i], i);
      }
    }
    function sendInput() { run({ t: "text", v: input.value }, true); }
    function fill(w) {
      clearTimers();
      input.value = w;
      grow();
      if (REDUCE) sendInput(); else after(260, sendInput);   /* 先讓你看到字被填進輸入框，再送出 */
    }
    on(input, "keydown", function(ev) {
      if ((ev.key === "Enter" || ev.keyCode === 13) && !ev.shiftKey && !ev.isComposing && ev.keyCode !== 229) { ev.preventDefault(); sendInput(); }   /* 輸入法選字中按 Enter 是「選好字」，不是「送出」 */
    });
    on(input, "input", grow);
    var nl = on(el("button", { type: "button", class: "dsnl", "aria-label": "換行（在輸入框裡多一行）", text: "↵" }), "click", function() {
      var v = input.value, a = input.selectionStart, b = input.selectionEnd;
      if (typeof a !== "number") { a = v.length; b = a; }
      input.value = v.substring(0, a) + "\n" + v.substring(b);
      try { input.setSelectionRange(a + 1, a + 1); input.focus({ preventScroll: true }); } catch (e) {}
      grow();
    });
    var go = on(el("button", { type: "button", class: "sim-go", text: "送出" }), "click", sendInput);
    var head = el("div", { class: "stage-h" }, [
      el("span", { class: "stage-t", text: d.ttl || "練習聊天室" }),
      replayBtn("重播：清空練習聊天室，再自動示範一遍", function() { reset(); })
    ]);
    if (d.sheet) {
      shPre = el("div", { class: "dssh-pre", role: "group", "aria-label": "換一份貼進「待匯入」的資料" });
      DS_IMP_PRESETS.forEach(function(p) {
        var b = on(el("button", { type: "button", class: "dspre", "aria-pressed": "false", text: p.label }), "click", function() {
          reset(p.key);
          say("已換成「" + p.label + "」：聊天室清空了，從頭練習。");
        });
        shBtns.push({ k: p.key, b: b });
        shPre.appendChild(b);
      });
      shTbl = el("div", { class: "dssh-t" });
      shBox = el("div", { class: "dssh" }, [
        el("div", { class: "dssh-h", text: "📋 練習用的試算表：「待匯入」分頁" }),
        el("p", { class: "dssh-p", text: "上面打「匯入」，機器人就來讀這一頁。下面的按鈕可以換一份貼進去的資料（換了之後聊天室會清空、從頭練習）；機器人說有問題的列會變紅底，格子右上角的小黑三角是註解。" }),
        shPre,
        shTbl
      ]);
    }
    if (d.drive) {
      drList = el("div", { class: "dsdr-l" });
      drActs = el("div", { class: "dsdr-a", role: "group", "aria-label": "在雲端硬碟上做的事（練習專用）" });
      drBox = el("div", { class: "dsdr", tabindex: "-1" }, [
        el("div", { class: "dssh-h", text: "☁️ 練習用的雲端照片資料夾" }),
        el("p", { class: "dssh-p", text: "這是機器人看的那個雲端硬碟資料夾（藥品照片，檔名＝CODE）。每 2 小時自動對一次；急的話在聊天室打「同步照片 CODE」。下面的按鈕是你在 Google 雲端硬碟上做的事，不是傳給機器人的。" }),
        drList,
        el("div", { class: "simgl", "aria-hidden": "true", text: "在雲端硬碟上做的事（練習專用，機器人不會知道）：" }),
        drActs
      ]);
    }
    var stage = el("div", { class: "stage sim dsim", "data-sim": "dev" }, [
      head,
      el("div", { class: "simrow" }, [input, nl, go]),
      hint,
      el("div", { class: "simg" }, [el("div", { class: "simgl", "aria-hidden": "true", text: "輸入框上面的小按鈕（點一下＝幫你打那個字）：" }), qbar]),
      actBox,
      el("div", { class: "simg" }, [sgl, sgr]),
      chat,
      webP ? webP.el : null,
      drBox,
      shBox,
      el("p", { class: "capn", text: "練習用的假聊天室：藥名、位置、代號都是編的；打的字不會存，也不會傳到任何地方，練習的試算表什麼都不會真的寫。按「重播」或重新整理，就回到一開始。" })
    ]);
    reset();
    return [stage, net, { max: 1, note: net, ms: function() { return 2600; } }];   /* 同藥師版：點範例字之後，字填進輸入框、查詢中、回覆一則一則跳出來，大約這麼久 */
  }

  /* ───────── 開發者練習聊天室：✏️ 修改、一次改多項、復原（第 17 批）─────────
     這一段接在 _learn_dev_sim.js 後面，也是一支沒碰畫面的純函式（SIMDEV 標記之間）：dsRun0 照真的 LINE 的順序，把進來的字／按鈕交給這裡。
     每一句機器人說的話、每一顆小按鈕、每一個判斷，都照 06_行動指令.gs（_efMenu_、_efPick_、_efPrompt_、_efApply_、_efWrite_、_efDone_、一次改多項 _mefXxx_）、
     08_匯入.gs（_impUndoCmd_、_impUndoPlan_、_impUndoRun_）、01_程式碼.gs（_noticeText_）寫；練習的是「編的」試算表，什麼都不會真的寫。
     X（一次進來的動作的結果）多的三樣，跟真的程式裡的「這一則訊息」變數一樣：X.efLog（_EF_LOG：這一則改了哪幾格，回覆完一起記進「匯入紀錄」）、X.lb（_EF_LOG_B：這一則的批次號）、
     X.mefOn（_MEF_ON：這一趟是從「一次改多項」那張卡進來的，寫完回卡片）；X.keep＝這一則機器人什麼都沒回（只有輸入框被填好字），聊天室裡上一張卡片要留著。 */
  /*SIMDEV*/
  var DS_NK = { "1": "停止供貨", "2": "改包裝通知", "3": "製廠缺貨", "4": "換廠", "5": "給慢箋" };
  /* ✏️ 改 選單的 18 顆（06 的 _efFields_；sheet＝改的是工作表幾，0＝不在試算表裡；multi＝可以好幾行）—— 順序就是卡片上由左到右、由上到下 */
  var DS_EF = [
    { k: "old", label: "曾用藥品", sheet: 2, multi: 1 },
    { k: "brand", label: "商品名", sheet: 1 },
    { k: "pair", label: "注意", sheet: 2, multi: 1 },
    { k: "loc", label: "小藥庫位置", sheet: 1, quick: "loc" },
    { k: "note", label: "適應症", sheet: 2, multi: 1 },
    { k: "form", label: "劑型", sheet: 1, quick: "form" },
    { k: "photo", label: "藥品外觀", sheet: 2 },
    { k: "pic", label: "📷 換照片", sheet: 2, pic: 1 },
    { k: "zh", label: "中文", sheet: 1 },
    { k: "feat", label: "藥品特徵", sheet: 2, multi: 1 },
    { k: "gen", label: "學名", sheet: 1, multi: 1 },
    { k: "nk", label: "公告類別", sheet: 2, notice: 1 },
    { k: "ref", label: "藥品查詢參考網站", sheet: 1 },
    { k: "nm", label: "公告補充說明", sheet: 2, multi: 1 },
    { k: "npic", label: "📷 公告照片", sheet: 2, npic: 1 },
    { k: "zones", label: "📍 各區位置", sheet: 0, zones: 1 },
    { k: "map", label: "🗺 平面圖", sheet: 0, map: 1 },
    { k: "abbr", label: "📖 縮寫", sheet: 0, abbr: 1 }
  ];
  var DS_EFCOL = { brand: "b", zh: "z", gen: "g", form: "f", loc: "loc", note: "ind", feat: "feat", pair: "pair", photo: "photo", npic: "npic", nm: "nm", nk: "nk", old: "old", ref: "ref" };
  var DS_ABBR = { "APAP": "acetaminophen", "ASA": "aspirin", "HCTZ": "hydrochlorothiazide", "MTX": "methotrexate", "NTG": "nitroglycerin", "KCL": "potassium chloride", "MGO": "magnesium oxide", "MGSO4": "magnesium sulfate", "MSO4": "morphine sulfate", "MS": "morphine sulfate", "FESO4": "ferrous sulfate", "ZNSO4": "zinc sulfate", "DM": "dextromethorphan", "IBU": "ibuprofen", "DIG": "digoxin", "PDN": "prednisone", "HC": "hydrocortisone", "COD": "codeine", "INH": "isoniazid", "PCN": "penicillin", "EES": "erythromycin ethylsuccinate", "ISDN": "isosorbide dinitrate", "ISMN": "isosorbide mononitrate", "NAC": "acetylcysteine", "AZT": "zidovudine", "SMZTMP": "sulfamethoxazole trimethoprim", "TMPSMX": "sulfamethoxazole trimethoprim", "VPA": "valproic acid", "CBZ": "carbamazepine", "PHT": "phenytoin", "DPH": "phenytoin", "PB": "phenobarbital", "LEV": "levetiracetam", "GBP": "gabapentin", "LTG": "lamotrigine", "MPH": "methylphenidate", "MMF": "mycophenolate mofetil", "CSA": "cyclosporine", "TAC": "tacrolimus", "CTX": "cyclophosphamide", "5FU": "fluorouracil", "6MP": "mercaptopurine", "CDDP": "cisplatin", "CBDCA": "carboplatin", "VCR": "vincristine", "VBL": "vinblastine", "ARAC": "cytarabine", "BLM": "bleomycin", "VP16": "etoposide", "PTX": "paclitaxel", "GEM": "gemcitabine", "TAM": "tamoxifen", "MVI": "multivitamin", "MOM": "magnesium hydroxide", "ORS": "oral rehydration solution" };   /* 01 的 DRUG_ABBR（內建的藥品縮寫） */
  /* 開發者加的縮寫（06 的 _efAbbrAll_／_efAbbrMine_／_abbrWrite_／_efAbbrApply_）：存在 S.abbr（縮寫 → 商品名），跟著商品名走、不在試算表裡（所以改完沒有「↩️ 復原」） */
  function dsAbbrBrand(S, c) { var r = S.rows[dsNorm(c)]; return r ? String(r.b === null || r.b === undefined ? "" : r.b).trim() : ""; }
  function dsAbbrMine(S, brand) {
    var out = [], k;
    if (!brand) return out;
    for (k in S.abbr) if (dsOwn(S.abbr, k) && String(S.abbr[k] || "").trim().toUpperCase() === brand.toUpperCase()) out.push(k);
    return out.sort();
  }
  function dsAbbrCount(S) { var n = 0, k; for (k in S.abbr) if (dsOwn(S.abbr, k)) n++; return n; }
  function dsAbbrWrite(S, code, text) {
    var c = dsNorm(code), brand = dsAbbrBrand(S, c), before, flat, toks, good = [], bad = [], i, count, notes = [], kk;
    if (!brand) return { err: "找不到 " + c + " 的商品名" };
    before = dsAbbrMine(S, brand);
    flat = String(text === null || text === undefined ? "" : text).replace(/\s+/g, "");
    if (/^(刪除|刪|移除|清空|全部刪除|沒有)$/.test(flat)) {
      for (i = 0; i < before.length; i++) delete S.abbr[before[i]];
      return { label: "縮寫", before: before.join("、") || "沒有", after: "沒有" };
    }
    toks = String(text === null || text === undefined ? "" : text).toUpperCase().split(/[\s,，、;；\/／]+/);
    for (i = 0; i < toks.length; i++) {
      if (!toks[i]) continue;
      (/^[A-Z0-9]{1,12}$/.test(toks[i]) ? good : bad).push(toks[i]);
    }
    if (!good.length) return { err: "縮寫只能是英數字、最多 12 個字，例如 HCTZ" };
    count = dsAbbrCount(S);
    for (i = 0; i < good.length; i++) if (!S.abbr[good[i]]) count++;
    if (count > 60) return { err: "縮寫最多 60 個，現在放不下。打「縮寫」看清單、刪掉不用的再來" };
    for (i = 0; i < good.length; i++) {
      kk = good[i];
      if (S.abbr[kk] && String(S.abbr[kk]).toUpperCase() !== brand.toUpperCase()) notes.push(kk + " 原本是 " + S.abbr[kk] + "，已覆蓋");
      if (dsOwn(DS_ABBR, kk) && DS_ABBR[kk]) notes.push(kk + " 內建就有（" + DS_ABBR[kk] + "），查詢會先用內建的");
      S.abbr[kk] = brand;
    }
    return { label: "縮寫", before: before.join("、") || "沒有", after: dsAbbrMine(S, brand).join("、"), notes: notes, bad: bad };
  }
  /* 縮寫那一格送出（06 的 _efAbbrApply_）：回 true */
  function dsEfAbbrApply(S, X, t) {
    var st = S.fld, c = st.code, r, d;
    if (dsIn(t, DS_CANCEL)) {
      S.fld = null;
      dsT(X, 1, "是「取消」→ 縮寫不改了");
      X.sheet = "沒動";
      if (X.mefOn && dsNorm(X.mefOn) === c) { dsMefCard(S, X, c, null, "好，縮寫沒改。"); return true; }
      dsSend(X, [bot("好，取消了，一個字都沒動 👍")]);
      X.reply = "「好，取消了，一個字都沒動」";
      return true;
    }
    r = dsAbbrWrite(S, c, t);
    if (r.err) {
      dsSend(X, [bot("📖 " + r.err + "。什麼都沒有改。")], [{ l: "取消", m: "取消" }]);
      dsT(X, 0, "縮寫不合格 → 什麼都沒改，再問一次");
      X.sheet = "沒動"; X.reply = "「📖 …。什麼都沒有改。」＋「取消」";
      return true;
    }
    S.fld = null;
    if (X.mefOn && dsNorm(X.mefOn) === c) dsMefNote(S, X, c, "abbr", r.before);
    dsT(X, 1, "縮寫存在「縮寫表」裡（跟著商品名走），不在試算表 → 不會記進「匯入紀錄」、也沒有「↩️ 復原」");
    dsEfDone(S, X, c, { label: "縮寫", before: r.before, after: r.after + (r.notes && r.notes.length ? "\n（" + r.notes.join("；") + "）" : "") + (r.bad && r.bad.length ? "\n（略過：" + r.bad.join("、") + "）" : ""), ns: 1 });
    X.sheet = "改縮寫表（不在試算表裡）";
    return true;
  }
  /* 一次改多項：卡片上 A～J 十列的欄位（MEF_FIELDS）、直接打字用的欄位名（MEF_ALIAS）、按「改」先填進輸入框的欄位名（MEF_WORD） */
  var DS_MEF_FIELDS = ["brand", "zh", "loc", "feat", "gen", "pic", "nk", "nm", "old", "abbr"];
  var DS_MEF_LABEL = { brand: "商品名", zh: "中文", loc: "小藥庫位置", feat: "藥品特徵", gen: "學名", pic: "藥品照片", nk: "公告類別", nm: "公告補充說明", old: "曾用藥品", abbr: "縮寫" };
  var DS_MEF_ALIAS = {
    "商品名": "brand", "英文名": "brand", "英文": "brand", "中文": "zh", "中文名": "zh", "位置": "loc", "小藥庫位置": "loc", "藥位": "loc", "劑型": "form", "學名": "gen", "成分": "gen",
    "特徵": "feat", "藥品特徵": "feat", "外觀": "photo", "藥品外觀": "photo", "照片": "photo", "藥品照片": "photo", "注意": "pair", "禁忌": "pair", "曾用": "old", "曾用藥品": "old", "舊名": "old",
    "公告": "nk", "公告類別": "nk", "補充": "nm", "公告補充": "nm", "公告補充說明": "nm", "網站": "ref", "參考網站": "ref", "藥品查詢參考網站": "ref", "適應症": "note", "縮寫": "abbr",
    "成錠": "z1", "兒錠": "z2", "兒水": "z3", "急診": "z4", "UD1": "z5", "UD2": "z6", "ＵＤ1": "z5", "ＵＤ2": "z6", "ud1": "z5", "ud2": "z6",
    A: "brand", B: "zh", C: "loc", D: "feat", E: "gen", F: "photo", G: "nk", H: "nm", I: "old", J: "abbr"
  };
  var DS_MEF_CODE = { brand: "A", zh: "B", loc: "C", feat: "D", gen: "E", photo: "F", nk: "G", nm: "H", old: "I", abbr: "J" };
  var DS_MEF_WORD = { brand: "商品名", zh: "中文", loc: "位置", form: "劑型", gen: "學名", feat: "藥品特徵", photo: "照片", pair: "注意", note: "適應症", old: "曾用", nk: "公告", nm: "補充", ref: "網站", abbr: "縮寫", z1: "成錠", z2: "兒錠", z3: "兒水", z4: "急診", z5: "UD1", z6: "UD2" };
  function dsOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function dsAlias(w) { return dsOwn(DS_MEF_ALIAS, w) ? DS_MEF_ALIAS[w] : ""; }
  function dsHalf(s) { return String(s).replace(/[！-～]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }); }
  function dsBrNl(v) { return String(v === null || v === undefined ? "" : v).replace(/<br\s*\/?>/gi, "\n").replace(/\r\n?/g, "\n"); }
  function dsEfFind(k) { var i; for (i = 0; i < DS_EF.length; i++) if (DS_EF[i].k === k) return DS_EF[i]; return null; }
  function dsEfMulti(k) { var f = dsEfFind(k === "pic" ? "photo" : k); return !!(f && f.multi); }
  /* 改了劑型 → 圖示（藥丸／水滴）跟著換；改了藥品外觀那一格 → 是 https 網址才算有照片（01 的 photoUrlByCode_） */
  function dsRowFix(r, k) {
    if (k === "form") r.w = dsIsWater(r) ? 1 : 0;
    if (k === "photo") r.ph = dsPhOk(r.photo) ? 1 : 0;
  }
  /* 這支藥現在這一格的值（06 的 _efNow_） */
  function dsEfNow(S, c, k) {
    var r = S.rows[c], col = DS_EFCOL[k], v;
    if (!r || !col) return "";
    v = r[col];
    return v === null || v === undefined ? "" : String(v);
  }
  function dsMefNow(S, c, k) { return k === "abbr" ? dsAbbrMine(S, dsAbbrBrand(S, c)).join("、") : dsEfNow(S, c, k === "pic" ? "photo" : k); }
  /* 按鍵按下去先填進輸入框的字：「欄位名 現在的值」（06 的 _mefFill_）；沒有欄位名的（📷 換照片、各區位置…）回 null */
  function dsMefFill(S, c, k) {
    var w = DS_MEF_WORD[k], v;
    if (!w) return null;
    v = dsBrNl(dsMefNow(S, c, k)).replace(/[ \t]+\n/g, "\n").trim();
    if (k === "nk") v = v && DS_NK[v] ? DS_NK[v] : v;
    return (w + " " + v).substring(0, 288);
  }
  function dsEfFillOk(f) { return !!f && !f.pic && !f.notice && !f.map && f.k !== "loc" && f.k !== "form"; }
  /* 「✏️ 改」選單每一顆按下去送什麼：有欄位名可以先填的走 effill=，其他走 ef= */
  function dsEfKinds(S, c) {
    var o = {}, i, f;
    for (i = 0; i < DS_EF.length; i++) { f = DS_EF[i]; o[f.k] = dsEfFillOk(f) && dsMefFill(S, c, f.k) ? "effill" : "ef"; }
    return o;
  }
  /* 送出的字前面還帶著自動填進去的欄位名（「商品名 XXX」）→ 拿掉只留值（06 的 _efStripWord_） */
  function dsEfStrip(text, k) {
    var t = String(text === null || text === undefined ? "" : text), kk = k === "pic" ? "photo" : k, m = t.match(/^([^\s:：]+)(?:[\s:：]+([\s\S]*))?$/), a;
    if (!m) return { t: t, hit: false };
    a = dsAlias(m[1]) || dsAlias(dsHalf(m[1]).toUpperCase());
    if (a !== kk) return { t: t, hit: false };
    return { t: (m[2] || "").trim(), hit: true };
  }
  /* 寫一格（06 的 _efWrite_）：位置統一成半形大寫；改了的記在這一則的 X.efLog；從「一次改多項」進來的，記一筆讓卡片上那一項打得出勾 */
  function dsEfWrite(S, X, c, k, value) {
    var f = dsEfFind(k), r = S.rows[c], col = DS_EFCOL[k], before, v = value;
    if (!f) return { err: "認不出這個欄位" };
    if (!r) return { err: "「工作表1」裡沒有 CODE " + c + "，請先用「新藥」建立。" };
    if (!col) return { err: "這一欄練習聊天室沒有做" };
    if (k === "loc") v = dsLocNorm(v);
    before = dsEfNow(S, c, k);
    r[col] = v === null || v === undefined ? "" : String(v);
    dsRowFix(r, k);
    dsCacheClear(S);
    if (before !== String(v === null || v === undefined ? "" : v)) X.efLog.push({ code: c, label: f.label, before: before, after: String(v === null || v === undefined ? "" : v) });
    if (X.mefOn && dsNorm(X.mefOn) === c) { dsMefNote(S, X, c, k, before); dsMefBatch(S, X, c); }
    return { label: f.label, before: before, after: v, row: dsRowNo(S, c) };
  }
  /* 這一則有記到這支藥 → 批次號（第一次要的時候才編一個，同一則共用）；沒有 → 空字串（06 的 _efLogBatchFor_） */
  function dsBatchFor(S, X, code) {
    var c = dsNorm(code), i, hit = false;
    for (i = 0; i < X.efLog.length; i++) if (X.efLog[i].code === c) hit = true;
    if (!hit) return "";
    if (!X.lb) X.lb = dsBatchId(S);
    return X.lb;
  }
  /* 改完那一則最下面放「↩️ 復原 CODE」，後面接原本那排小按鈕（06 的 _efUndoAttach_） */
  function dsEfUndo(S, X, code, items, batch) {
    var b = batch || dsBatchFor(S, X, code);
    if (!b) return items;
    return [{ l: "↩️ 復原 " + dsNorm(code), m: "復原 #" + b }].concat(items).slice(0, 13);
  }
  /* 回覆完，這一則改過的格子一次記進「匯入紀錄」（06 的 _efLogFlush_）：同一則共用一個批次號；一次改多項那一輪用同一個 */
  function dsEfFlush(S, X) {
    var i, x, b, at;
    if (!X.efLog.length) return 0;
    b = X.lb || dsBatchId(S);
    at = dsClock(S);
    for (i = 0; i < X.efLog.length; i++) {
      x = X.efLog[i];
      S.log.push({ b: b, at: at, u: "示範甲", act: x.act || "修改", code: x.code, field: x.label, oldV: x.before, newV: x.after, how: "LINE ✏️" });
    }
    return X.efLog.length;
  }
  /* 一次改多項「這一輪改過哪幾項」只是拿來打勾（純快取）；這一輪的批次號也記在這裡，最後那顆「↩️ 復原」一次改回整輪 */
  function dsMefNote(S, X, c, k, before) {
    var d = S.mef && S.mef.code === c ? S.mef : null;
    if (!d) d = S.mef = { code: c, b: {}, ord: [], lb: "" };
    if (d.ord.indexOf(k) < 0) d.ord.push(k);
    if (!dsOwn(d.b, k)) d.b[k] = before;
    return d;
  }
  function dsMefBatch(S, X, c) {
    var d = S.mef && S.mef.code === c ? S.mef : null;
    if (!d) return "";
    if (!d.lb) d.lb = dsBatchId(S);
    X.lb = d.lb;
    return d.lb;
  }
  function dsMefCut(s, n) {
    var t = String(s === null || s === undefined ? "" : s).replace(/\s+/g, " ").trim(), cap = n || 58;
    return t.length > cap ? t.substring(0, cap) + "…" : t;
  }
  function dsMefShow(k, v) {
    var s = String(v === null || v === undefined ? "" : v);
    if (k === "nk" && s) return DS_NK[s] ? s + " " + DS_NK[s] : s;
    if (k === "photo") return s ? "已有照片" : "";
    return s;
  }
  function dsMefNoticeNum(word) {   /* 公告類別：打「換廠」也要認得，不是只認 1~5 */
    var w = String(word || "").replace(/\s+/g, ""), n;
    if (/^[1-5]$/.test(w)) return w;
    for (n in DS_NK) if (DS_NK[n] === w) return n;
    return "";
  }

  /* ───── 點「✏️ 修改」→ 18 顆欄位的選單（06 的 _efMenu_）───── */
  function dsEfMenu(S, X, code) {
    var c = dsNorm(code), r = S.rows[c], n;
    if (!r) { dsSend(X, [bot("找不到 CODE " + c + " 😥")]); X.sheet = "沒動"; X.reply = "「找不到 CODE」"; dsT(X, 0, "「工作表1」裡有 CODE " + c + " 嗎？沒有"); return; }
    n = dsNoteOf(r);
    dsSend(X, [editMenuCard(c, n, { row: r, kinds: dsEfKinds(S, c) })]);
    dsT(X, 1, "是「✏️ 修改」→ 查這支藥（" + c + "）現在的名字和公告");
    dsT(X, 1, n ? "有公告 → 選單上多一個黃色的「目前的公告」框" : "沒有公告 → 沒有黃色的公告框");
    X.sheet = "沒動（只是列選單）";
    X.reply = "✏️ 選單卡片：最上面「📝 一次改多項」，下面 18 顆欄位按鈕";
  }
  /* 「現在是：…」那一則（06 的 _efPrompt_）：多行的欄位多教「一句一句」的打法；append＝按了「↵ 再加一句」 */
  function dsEfPrompt(S, X, c, f, mode) {
    var k = f.k, now = dsBrNl(dsMefNow(S, c, k)).trim(), multi = dsEfMulti(k), text, q = [];
    text = (mode === "append" ? "↵ " : "✏️ ") + c + "　" + f.label + "\n\n現在是：" + (now ? (multi && now.indexOf("\n") >= 0 ? "\n" + now : now) : "（空的）") + "\n\n";
    if (mode === "append") text += "打下一句送出，會接在最後面新的一行。";
    else {
      text += "請直接打新的內容送出就好。";
      if (multi) text += "\n一句一行：打一句送出，再按「↵ 再加一句」接著打下一句；一次打好幾行也可以。";
    }
    if (mode !== "append") {
      if (multi && now) q.push({ l: "↵ 再加一句", p: "efapp=" + c + "|" + k, d: "↵ 再加一句" });
      q.push({ l: "🗑 清空這一欄", m: "清空" });
    }
    q.push({ l: "取消", m: "取消" });
    dsSend(X, [bot(text)], q);
  }
  /* 沒做的欄位（各區位置）：說一聲，什麼都不動 */
  function dsEfLater(S, X, f) {
    S.fld = null;
    dsSend(X, [act("練習聊天室這一課沒有做「" + f.label + "」：真的 LINE 會給你六區位置的小卡。其他欄位都可以點點看。")]);
    X.sheet = "沒動"; X.reply = "（這一格練習不示範）";
    dsT(X, 1, "這一格（" + f.label + "）練習聊天室沒有做，不會改任何東西");
  }
  /* ef=CODE|k：點一顆欄位（位置、劑型走這條：現在是…＋常用選項；公告類別：5 種＋移除；其他沒有欄位名可以填的） */
  function dsEfPick(S, X, code, k, mef) {
    var c = dsNorm(code), f = dsEfFind(k), q, now, i, ns = [];
    if (!f) { dsSend(X, [bot("認不出這個欄位 🤔")]); X.sheet = "沒動"; X.reply = "「認不出這個欄位」"; return; }
    if (f.pic) { dspPicAsk(S, X, c, mef); return; }
    if (f.npic) { dspNpicAsk(S, X, c); return; }
    if (f.zones) { dsEfLater(S, X, f); return; }
    if (f.map) { dsaMapAsk(S, X, c); return; }   /* 🗺 平面圖（06 的 _efMapAsk_）：_learn_dev_sim_adv.js */
    if (f.abbr) { dsEfFillPick(S, X, c, k); return; }   /* 📖 縮寫的按鈕真的卡片上是 effill（先填欄位名）；ef= 那條（_efAbbrAsk_）卡片上沒有按鈕送它，這裡一樣走先填欄位名的做法 */
    S.wiz = null;
    S.fld = { code: c, k: k };
    if (mef) S.fld.mef = 1;

    dsT(X, 1, "點了「" + f.label + "」→ 記住現在要改這一格（接下來打的字都算新內容）");
    X.sheet = "沒動（還沒打新內容）";
    if (f.notice) {
      for (i in DS_NK) ns.push(i);
      ns.sort();
      q = ns.map(function(n) { return { l: n + " " + DS_NK[n], m: n + " " + DS_NK[n] }; });
      q.push({ l: "🗑 移除公告", m: "移除" });
      q.push({ l: "取消", m: "取消" });
      dsSend(X, [bot("📢 " + c + " 要掛哪一種公告？\n\n點下面的按鈕就好。\n（掛完會再問您要不要加一句補充說明）")], q);
      X.reply = "問要掛哪一種公告；輸入框上面有 5 種、「🗑 移除公告」、「取消」";
      return;
    }
    q = f.quick ? dsQuick(S, f.quick) : [];
    q.push({ l: "🗑 清空這一欄", m: "清空" });
    q.push({ l: "取消", m: "取消" });
    now = dsEfNow(S, c, k);
    dsSend(X, [bot("✏️ " + c + "　" + f.label + "\n\n現在是：" + (now ? now : "（空的）") + "\n\n請直接打新的內容送出就好。")], q);
    X.reply = "「現在是：…」＋輸入框上面" + (f.quick ? "常用的" + (f.quick === "loc" ? "位置" : "劑型") + "選項、" : "") + "「🗑 清空這一欄」「取消」";
  }
  /* effill=CODE|k：輸入框已經先填好「欄位名 現在的值」→ 記住現在改哪一欄，再回「現在是：…」（電腦版 LINE 不會自動填，所以還是回） */
  function dsEfFillPick(S, X, code, k) {
    var c = dsNorm(code), f = dsEfFind(k), fill;
    if (!f || !c) { X.keep = 1; return; }
    if (f.pic) { dspPicAsk(S, X, c, false); return; }
    if (f.npic) { dspNpicAsk(S, X, c); return; }
    if (f.zones) { S.wiz = null; dsEfLater(S, X, f); return; }
    if (f.map) { dsaMapAsk(S, X, c); return; }
    S.wiz = null;
    S.fld = { code: c, k: k, fill: 1 };
    fill = dsMefFill(S, c, k);
    dsT(X, 1, "點了「" + f.label + "」→ 手機的輸入框先填好「欄位名＋現在的內容」，游標在後面");
    dsT(X, 1, "記住現在改這一格；接下來送出的字，前面的欄位名會自動拿掉");
    X.sheet = "沒動（還沒送出新內容）";
    X.reply = "「現在是：…」（多行的欄位多一句教你一句一句加）";
    if (fill !== null) X.fill = fill;
    dsEfPrompt(S, X, c, f, "fill");
  }
  /* efapp=CODE|k：「↵ 再加一句」→ 接下來打的那一句接在現在內容後面新的一行 */
  function dsEfAppPick(S, X, code, k) {
    var c = dsNorm(code), f = dsEfFind(k);
    if (!f || !c || !dsEfMulti(k)) { X.keep = 1; return; }
    S.wiz = null;
    S.fld = { code: c, k: k, append: 1 };
    dsT(X, 1, "按了「↵ 再加一句」→ 接下來打的那一句，會接在現在內容的後面、新的一行");
    X.sheet = "沒動"; X.reply = "「現在是：…」＋「打下一句送出」";
    dsEfPrompt(S, X, c, f, "append");
  }
  /* 改完（06 的 _efDone_）：一次改多項進來的回那張卡；不然「✅ CODE 欄位 改前 改後」＋新卡片＋小按鈕（多行的欄位最前面多一顆「↵ 再加一句」，改錯了多一顆「↩️ 復原」） */
  function dsEfDone(S, X, code, res) {
    var c = dsNorm(code), msgs = [], q;
    if (X.mefOn && dsNorm(X.mefOn) === c) { dsMefCard(S, X, c, res); return; }
    msgs.push(bot(res ? "✅ " + c + "　" + res.label + "\n　改前：" + (res.before === "" ? "（空）" : res.before) + "\n　改後：" + (res.after === "" ? "（空）" : res.after) : "✅ " + c + " 已更新"));
    if (S.rows[c]) msgs.push(dsCard(S, c));
    q = dsEfUndo(S, X, c, DS_BAR.slice());
    if (res && res.k && dsEfMulti(res.k)) q = [{ l: "↵ 再加一句", p: "efapp=" + c + "|" + res.k, d: "↵ 再加一句" }].concat(q).slice(0, 13);
    dsSend(X, msgs, q);
    X.wrote = X.efLog.length ? 1 : 0;
    X.sheet = X.efLog.length ? "改 1 格（" + c + "　" + (res ? res.label : "") + "）" : "沒動（跟原本一樣）";
    X.reply = "「✅ 已改」那句（改前、改後）＋這支藥的新卡片" + (X.efLog.length ? "＋第一顆小按鈕「↩️ 復原 " + c + "」" : "");
    if (!(res && res.ns)) dsT(X, 1, X.efLog.length ? "寫進「工作表" + (res && dsEfFind(res.k || "") && dsEfFind(res.k).sheet === 1 ? "1" : "2") + "」，記進「匯入紀錄」（批次 #" + (X.lb || dsBatchFor(S, X, c)) + "），7 天內可以復原" : "新舊一樣，沒有寫");   /* ns＝這一項不在試算表裡（縮寫、平面圖）：呼叫的人自己寫過那一行說明了 */
  }
  /* 打字進來的內容（06 的 _efApply_）：回 true＝這句話處理掉了；false＝不是在改欄位，照一般查藥 */
  function dsEfApply(S, X, text) {
    var st = S.fld, t = String(text || "").trim(), c = st.code, f = dsEfFind(st.k), sw, nowV, flatN, a, byName, m, extra, kindName, res, value, q, ns, i;
    if (st.mef) X.mefOn = c;
    if (!f) { S.fld = null; return false; }
    if (st.fill && !f.map && !f.pic) {
      sw = dsEfStrip(t, st.k);
      if (sw.hit) {
        t = sw.t;
        if (!t) {
          nowV = dsMefNow(S, c, st.k);
          dsSend(X, [bot("✏️ " + c + "　" + f.label + "\n\n現在是：" + (nowV ? nowV : "（空的）") + "\n\n您送出的只有欄位名、沒有內容。\n要清空這一欄就按「🗑 清空這一欄」；要改就直接打新的內容；不改就按「取消」。")], [{ l: "🗑 清空這一欄", m: "清空" }, { l: "取消", m: "取消" }]);
          dsT(X, 0, "送出的只有欄位名、沒有內容 → 不當成清空，先問一次");
          X.sheet = "沒動"; X.reply = "「您送出的只有欄位名、沒有內容」＋清空／取消";
          return true;
        }
      }
    }
    if (f.map) return dsaMapApply(S, X, t, st);
    if (f.abbr) return dsEfAbbrApply(S, X, t);
    if (f.pic) return dspPicText(S, X, t, st);
    if (f.npic) return dspNpicText(S, X, t, st);
    if (f.zones) { dsEfLater(S, X, f); return true; }
    if (dsIn(t, DS_CANCEL)) {
      S.fld = null;
      dsT(X, 1, "是「取消」→ 這一格不改了");
      X.sheet = "沒動";
      if (st.fromNotice) { dsEfDone(S, X, c, { label: "公告", before: st.nb || "（無）", after: st.na || "" }); return true; }
      if (X.mefOn && dsNorm(X.mefOn) === c) { dsMefCard(S, X, c, null, "好，這一項沒改。"); return true; }
      dsSend(X, [bot("好，取消了，一個字都沒動 👍")]);
      X.reply = "「好，取消了，一個字都沒動」";
      return true;
    }
    value = t;
    if (f.notice) {
      byName = dsMefNoticeNum(t.split(/\s+/)[0]);
      m = byName ? [byName, byName] : t.match(/^([1-5])/);
      if (/^(移除|刪除|拿掉|清空|沒有)$/.test(t.replace(/\s+/g, ""))) {
        a = dsEfWrite(S, X, c, "nk", "");
        dsEfWrite(S, X, c, "nm", "");
        S.fld = null;
        dsT(X, 1, "是「移除」→ 公告類別、補充說明都清空");
        dsEfDone(S, X, c, { label: "公告", before: a.before || "（無）", after: "（已移除）" });
        return true;
      }
      if (!m) {
        dsSend(X, [bot("請點下面的按鈕，或直接打 1~5、或打中文（停止供貨／改包裝通知／製廠缺貨／換廠／給慢箋）🙏")], [{ l: "1 停止供貨", m: "1" }, { l: "2 改包裝通知", m: "2" }, { l: "3 製廠缺貨", m: "3" }, { l: "4 換廠", m: "4" }, { l: "5 給慢箋", m: "5" }, { l: "取消", m: "取消" }]);
        dsT(X, 0, "認不出是哪一種公告 → 再問一次");
        X.sheet = "沒動"; X.reply = "請點按鈕或打 1~5 的提醒＋5 顆按鈕";
        return true;
      }
      value = m[1];
      extra = (byName ? t.substring(t.split(/\s+/)[0].length) : t.substring(m[1].length)).replace(/^[\s、,，:：-]+/, "").trim();
      kindName = DS_NK[value] || "";
      if (kindName && extra.indexOf(kindName) === 0) extra = extra.substring(kindName.length).replace(/^[\s、,，:：-]+/, "").trim();
      res = dsEfWrite(S, X, c, "nk", value);
      if (res.err) { S.fld = null; dsSend(X, [bot(res.err)]); return true; }
      dsT(X, 1, "認得是「" + value + " " + DS_NK[value] + "」→ 寫進公告類別");
      if (extra) {
        dsEfWrite(S, X, c, "nm", extra);
        S.fld = null;
        dsEfDone(S, X, c, { label: "公告", before: res.before || "（無）", after: value + " " + DS_NK[value] + "，" + extra });
        return true;
      }
      S.fld = { code: c, k: "nm", fromNotice: true, mef: st.mef ? 1 : 0, na: value + " " + DS_NK[value], nb: res.before || "（無）" };
      dsSend(X, [bot("✅ " + c + " 已掛上「" + DS_NK[value] + "」\n\n要再加一句補充說明嗎？（例：新包裝 8/1 起）\n不用的話按「取消」，公告一樣掛好。")], [{ l: "取消（不加補充）", m: "不用" }, { l: "🗑 清空補充", m: "清空" }]);
      X.wrote = 1; X.sheet = "公告類別改成「" + DS_NK[value] + "」（" + c + "）"; X.reply = "「已掛上」＋問要不要加補充說明（輸入框上面：取消（不加補充）、🗑 清空補充）";
      return true;
    }
    if (/^(清空|清除|刪除|移除|空白)$/.test(t.replace(/\s+/g, ""))) { value = ""; dsT(X, 1, "是「清空」→ 把這一格清掉"); }
    if (st.append && value) {
      nowV = dsBrNl(dsMefNow(S, c, st.k)).replace(/\s+$/, "");
      value = nowV ? nowV + "\n" + value : value;
      dsT(X, 1, "「↵ 再加一句」→ 接在現在內容的後面、新的一行");
    }
    if (st.fromNotice && /^(不用|不用了|沒有|免|不需要)$/.test(t.replace(/\s+/g, ""))) {
      S.fld = null;
      dsT(X, 1, "「不用」→ 不加補充說明，公告一樣掛好");
      dsEfDone(S, X, c, { label: "公告", before: st.nb || "（無）", after: st.na || "" });
      return true;
    }
    if (st.k === "ref" && value && !/^https?:\/\/\S+$/i.test(value)) {
      dsSend(X, [bot("這不像網址 🤔\n要以 http:// 或 https:// 開頭、中間不能有空格。\n\n請把院內網站那一頁的網址整串貼過來，或打「清空」拿掉。")], [{ l: "清空", m: "清空" }, { l: "取消", m: "取消" }]);
      dsT(X, 0, "網站要以 http:// 或 https:// 開頭，這句不像網址");
      X.sheet = "沒動"; X.reply = "「這不像網址」＋清空／取消";
      return true;
    }
    res = dsEfWrite(S, X, c, st.k, String(value).substring(0, st.k === "ref" ? 500 : 300));
    S.fld = null;
    if (res.err) { dsSend(X, [bot(res.err)]); return true; }
    res.k = st.k;
    dsEfDone(S, X, c, res);
    return true;
  }
  function dsHowEdit(S, X) {
    dsSend(X, [bot("✏️ 怎麼改資料（手機上最快的方式）\n\n① 先把那支藥查出來\n　 直接打 CODE 或藥名，例：22975\n\n② 卡片最下面有「✏️ 修改」，點它\n\n③ 選要改哪一欄，然後直接打新內容\n　 全程不用打 CODE，也不用打欄位名\n\n公告更簡單 —— 1~5 和「移除」全部是按鈕，一個字都不用打。\n\n（v10.3.0 起 /new1 /new2 /fix 已移除 —— 上面這條路全包了，\n　欄位還多一個「公告類別」。）")]);
    X.sheet = "沒動"; X.reply = "怎麼改資料的說明";
  }

  /* ───── 一次改多項（06 的 _mefXxx_）───── */
  function dsMefVals(S, c) {
    var v = {}, i, k, dk;
    for (i = 0; i < DS_MEF_FIELDS.length; i++) { k = DS_MEF_FIELDS[i]; dk = k === "pic" ? "photo" : k; v[k] = dsMefShow(dk, dsMefNow(S, c, dk)); }
    return v;
  }
  function dsMefCard(S, X, code, res, headNote) {
    var c = dsNorm(code), r = S.rows[c], d, was = {}, i, k, msgs = [];
    if (!r) { dsSend(X, [bot("找不到 CODE " + c + " 😥")]); X.sheet = "沒動"; X.reply = "「找不到 CODE」"; return; }
    S.mefOpen = c;   /* 記住「這張卡開著」，接下來直接打「中文 XXX」就收 */
    d = S.mef && S.mef.code === c ? S.mef : null;
    if (d) for (i = 0; i < d.ord.length; i++) { k = d.ord[i]; was[k === "photo" ? "pic" : k] = d.b[k]; }
    if (res) msgs.push(bot("✅ " + c + "　" + res.label + "\n　改前：" + (res.before === "" ? "（空）" : dsMefCut(res.before, 80)) + "\n　改後：" + (res.after === "" ? "（空）" : dsMefCut(res.after, 80))));
    msgs.push(mefCard(c, dsMefVals(S, c), was, headNote, { row: r, live: 1 }));
    dsSend(X, msgs);
    X.wrote = X.efLog.length ? 1 : 0;
  }
  function dsMefStart(S, X, code) {
    var c = dsNorm(code), r = S.rows[c];
    if (!r) { dsSend(X, [bot("找不到 CODE " + c + " 😥")]); X.sheet = "沒動"; X.reply = "「找不到 CODE」"; return; }
    dsT(X, 1, "點了「📝 一次改多項」→ 送出 A～J 十列的卡片，並記住「這張卡開著」");
    dsT(X, 1, "卡片開著的時候，直接打「中文 XXX」或「A 新名字」就會改，不用先按「改」");
    dsMefCard(S, X, c, null);
    X.sheet = "沒動（只是開卡片）";
    X.reply = "📝 一次改多項的卡片（A～J 十列，每一列右邊一顆「改」）";
  }
  /* meffill=CODE|k：一次改多項那張卡上按「改」——手機的輸入框已經先填好「欄位名 現在的內容」，機器人不回話（回了只會把卡片擠上去）。接下來直接打、或改好送出，卡片開著就會收 */
  function dsMefFillPick(S, X, code, k) {
    var c = dsNorm(code), fill = c && k ? dsMefFill(S, c, k) : null;
    X.keep = 1;
    if (fill === null) return;
    X.fill = fill;
    dsT(X, 1, "按了「改」→ 手機的輸入框先填好「欄位名＋現在的內容」，游標在後面（電腦版不會自動填，直接打也一樣）");
    dsT(X, 1, "這一步機器人不回話：輸入框已經填好了，回了只會把卡片擠上去");
    X.sheet = "沒動（還沒送出新內容）";
    X.reply = "（不回話）卡片留在聊天室，輸入框先填好字";
  }
  /* 卡片開著、每一行都是「欄位名 內容」→ 回 { code, jobs }；不然 null（照一般查藥）（06 的 _mefParse_） */
  function dsMefParse(S, raw) {
    var c = S.mefOpen, lines, jobs = [], i, ln, m, k;
    if (!c) return null;
    lines = String(raw || "").split(/[\r\n]+/);
    for (i = 0; i < lines.length; i++) {
      ln = lines[i].trim();
      if (!ln) continue;
      m = ln.match(/^([^\s:：]+)[\s:：]+([\s\S]+)$/);
      k = m ? dsAlias(m[1]) : "";
      if (m && !k) k = dsAlias(dsHalf(m[1]).toUpperCase());
      if (!k) {
        if (jobs.length && dsEfMulti(jobs[jobs.length - 1][0])) { jobs[jobs.length - 1][1] += "\n" + ln; continue; }
        return null;
      }
      jobs.push([k, m[2].trim()]);
    }
    return jobs.length ? { code: c, jobs: jobs } : null;
  }
  /* 06 的 _mefTypeInLooks_：這句是不是在改欄位（一次改多項開著，或按了 ✏️ 的按鍵把欄位名填進輸入框送回來） */
  function dsMefLooks(S, raw) {
    if (dsMefParse(S, raw)) return true;
    if (S.fld && S.fld.fill && S.fld.k && dsEfStrip(raw, S.fld.k).hit) return true;
    return false;
  }
  function dsMefTypeIn(S, X, raw) {
    var parsed = dsMefParse(S, raw), c, jobs, done = [], fail = [], i, k, v, parts, num, extra, r1, r2, r, ra, nm, head;
    if (!parsed) return false;
    c = parsed.code; jobs = parsed.jobs;
    S.fld = null;
    X.mefOn = c;
    for (i = 0; i < jobs.length; i++) {
      k = jobs[i][0]; v = jobs[i][1];
      if (k === "nk") {
        parts = v.split(/\s+/);
        num = dsMefNoticeNum(parts[0]);
        if (!num) { fail.push("・公告類別「" + parts[0] + "」認不出來（可以打 停止供貨／改包裝通知／製廠缺貨／換廠／給慢箋，或 1~5）"); continue; }
        extra = parts.slice(1).join(" ").trim();
        r1 = dsEfWrite(S, X, c, "nk", num);
        if (r1 && r1.err) fail.push("・公告類別：" + r1.err); else done.push("・公告類別：" + num + " " + DS_NK[num]);
        if (extra) {
          r2 = dsEfWrite(S, X, c, "nm", extra.substring(0, 300));
          if (r2 && r2.err) fail.push("・公告補充說明：" + r2.err); else done.push("・公告補充說明：" + dsMefCut(extra, 40));
        }
        continue;
      }
      if (k === "abbr") {
        ra = dsAbbrWrite(S, c, v);
        if (ra.err) fail.push("・縮寫：" + ra.err);
        else {
          dsMefNote(S, X, c, "abbr", ra.before);
          done.push("・縮寫：" + ra.before + " → " + ra.after + (ra.bad && ra.bad.length ? "（略過：" + ra.bad.join("、") + "）" : ""));
        }
        continue;
      }
      if (/^(清空|清除|刪除|移除|空白)$/.test(v.replace(/\s+/g, ""))) v = "";
      if (k === "ref" && v && !/^https?:\/\/\S+$/i.test(v)) { fail.push("・網站：這不像網址，要以 http:// 或 https:// 開頭"); continue; }
      r = dsEfWrite(S, X, c, k, v.substring(0, k === "ref" ? 500 : 300));
      nm = DS_MEF_LABEL[k === "photo" ? "pic" : k] || (dsEfFind(k) ? dsEfFind(k).label : k);
      if (!r || r.err) fail.push("・" + nm + "：" + (r && r.err ? r.err : "沒寫成"));
      else done.push("・" + nm + "：" + (r.before === "" ? "（空）" : dsMefCut(r.before, 30)) + " → " + (r.after === "" ? "（空）" : dsMefCut(r.after, 30)));
    }
    head = fail.length ? (done.length ? "⚠️ " + c + " 寫好 " + done.length + " 項，有 " + fail.length + " 項沒過" : "❌ " + c + " 一項都沒寫成") : "✅ " + c + " 寫好了（" + done.length + " 項）";
    dsT(X, 1, "「一次改多項」那張卡開著，這句每一行都是「欄位名 內容」→ 一次改 " + jobs.length + " 項，每一項直接寫進試算表");
    dsMefCard(S, X, c, null, head + (done.length ? "\n" + done.join("\n") : "") + (fail.length ? "\n" + fail.join("\n") : ""));
    X.sheet = done.length ? "改 " + done.length + " 格（" + c + "）" : "沒動";
    X.reply = "更新後的 📝 一次改多項卡片（上面一行寫「寫好了」和每一項的改前改後，改過的列變綠色）";
    return true;
  }
  function dsMefNkCard(S, X, code) {
    var c = dsNorm(code), r = S.rows[c], cur = r ? String(r.nk || "").trim() : "";
    dsSend(X, [nkCard(c, cur && DS_NK[cur] ? cur : "", { live: 1 })]);
    dsT(X, 1, "點了公告類別那一列的「改」→ 送出五顆按鈕的卡片（現在掛著的那顆是綠底）");
    X.sheet = "沒動"; X.reply = "📢 公告類別卡片（五顆按鈕、🗑 移除公告、← 不改，回去）";
  }
  function dsMefNkSet(S, X, code, n) {
    var c = dsNorm(code), a, r;
    X.mefOn = c;
    if (n === "0") {
      dsEfWrite(S, X, c, "nk", "");
      dsEfWrite(S, X, c, "nm", "");
      dsT(X, 1, "點了「🗑 移除公告」→ 公告類別、補充說明都清空");
      dsMefCard(S, X, c, null, "✅ " + c + " 公告移除了（連補充說明一起）。");
      X.sheet = "公告拿掉（" + c + "）"; X.reply = "更新後的一次改多項卡片（上面寫「公告移除了」）";
      return;
    }
    if (!DS_NK[n]) { dsMefCard(S, X, c, null, "認不出這個公告類別 🤔"); return; }
    r = dsEfWrite(S, X, c, "nk", n);
    if (r && r.err) { dsMefCard(S, X, c, null, "❌ " + r.err); return; }
    dsT(X, 1, "點了「" + n + " " + DS_NK[n] + "」→ 馬上寫進公告類別");
    dsMefCard(S, X, c, null, "✅ " + c + " 掛上「" + DS_NK[n] + "」了。要加一句說明就按「公告補充說明」那一排的「改」。");
    X.sheet = "公告類別改成「" + DS_NK[n] + "」（" + c + "）"; X.reply = "更新後的一次改多項卡片（上面寫「掛上了」）";
  }
  function dsMefMore(S, X, code) {
    var c = dsNorm(code), r = S.rows[c];
    if (!r) { dsSend(X, [bot("找不到 CODE " + c + " 😥")]); return; }
    dsSend(X, [mefMoreCard(c, { row: r, live: 1 })]);
    dsT(X, 1, "點了「＋ 其他欄位」→ 送出剩下那幾欄（注意、適應症、劑型、網站）");
    X.sheet = "沒動"; X.reply = "＋ 其他欄位的小卡（四顆）";
  }
  function dsMefEnd(S, X, code) {
    var c = dsNorm(code), d = S.mef && S.mef.code === c ? S.mef : null, n = d ? d.ord.length : 0, lb = d && d.lb ? d.lb : "", msgs = [], q;
    S.mef = null; S.mefOpen = ""; S.fld = null;
    if (n > 0) msgs.push(bot("✅ " + c + " 這一輪改了 " + n + " 項，都改好了。" + (lb ? "\n改錯了？按下面的「↩️ 復原 " + c + "」（7 天內都可以）。" : "")));
    if (S.rows[c]) msgs.push(dsCard(S, c));
    q = lb ? dsEfUndo(S, X, c, DS_BAR.slice(), lb) : null;
    if (!msgs.length) msgs.push(bot("好，結束了 👍"));
    dsSend(X, msgs, q);
    dsT(X, 1, "點了「✅ 看新卡片」→ 這一輪收工：" + (n > 0 ? "共改了 " + n + " 項（早就寫進試算表了）" : "這一輪沒有改任何東西"));
    X.sheet = "沒動（改的早就寫進去了）";
    X.reply = (n > 0 ? "「這一輪改了 " + n + " 項」那句＋" : "") + "這支藥的新卡片" + (lb ? "＋第一顆小按鈕「↩️ 復原 " + c + "」（一次改回整輪）" : "");
  }

  /* ───── 復原（08 的 _impUndoCmd_、_impUndoPlan_、_impUndoRun_）───── */
  function dsImpNorm(v) {
    if (v === null || v === undefined) return "";
    return String(v).replace(/[！-～]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }).replace(/　/g, " ").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  }
  /* 匯入紀錄「欄位」那一欄的字 → 是哪一欄（08 的 _impFieldByLabel_）：匯入用的名稱（CODE、中文名、商品名、位置…）先找；找不到再找 ✏️ 改 的欄位名（藥品特徵、適應症、小藥庫位置…）。
     raw＝匯入用的名稱而且有對到試算表的一欄（寫回去不經過「位置統一成半形大寫」） */
  var DS_UNDO_LABEL = { "CODE": "code", "中文名": "zh", "商品名": "brand", "位置": "loc", "劑型": "form", "學名": "gen", "參考網站": "ref", "公告類別": "nk", "公告補充": "nm" };
  var DS_UNDO_RAW = { code: 1, zh: 1, brand: 1, loc: 1, form: 1, gen: 1, ref: 1 };
  function dsUndoField(label) {
    var t = String(label || "").trim(), i;
    if (dsOwn(DS_UNDO_LABEL, t)) return { k: DS_UNDO_LABEL[t], raw: DS_UNDO_RAW[DS_UNDO_LABEL[t]] ? 1 : 0 };
    for (i = 0; i < DS_EF.length; i++) if (DS_EF[i].label === t && !DS_EF[i].pic && (DS_EF[i].sheet === 1 || DS_EF[i].sheet === 2)) return { k: DS_EF[i].k, raw: 0 };
    return null;
  }
  function dsUndoCmd(S, X, text) {
    var t = String(text || "").trim(), m = t.match(/^復原\s*(#?\S+)?$/), target = m && m[1] ? m[1].replace(/^#/, "") : "", log = S.log, batches = [], seen = {}, i, j, e, n, codes, x, msg, quick, plan, cs, src;
    if (!target) {
      for (i = log.length - 1; i >= 0 && batches.length < 5; i--) {
        e = log[i];
        if (!e.b || e.act === "復原" || seen[e.b]) continue;
        seen[e.b] = true;
        n = 0; codes = [];
        for (j = 0; j < log.length; j++) if (log[j].b === e.b && log[j].act !== "復原") { n++; if (log[j].code && codes.indexOf(log[j].code) < 0) codes.push(log[j].code); }
        batches.push({ b: e.b, at: e.at, n: n, codes: codes, how: e.how });
      }
      dsT(X, 1, "是「復原」→ 看「匯入紀錄」最近改過的批次（最多 5 批）");
      X.sheet = "沒動（只是看紀錄）";
      if (!batches.length) { dsSend(X, [bot("「匯入紀錄」裡沒有可以復原的批次。")]); X.reply = "「沒有可以復原的批次」"; return true; }
      src = function(h) { return h === "對" ? "匯入" : h === "網頁✏️" ? "網頁" : h || ""; };
      msg = "↩️ 最近改過的（點一個看要還原什麼）：\n";
      quick = [];
      for (i = 0; i < batches.length; i++) {
        x = batches[i];
        cs = x.codes.slice(0, 2).join("、") + (x.codes.length > 2 ? " 等 " + x.codes.length + " 支" : "");
        msg += "　#" + x.b + "　" + x.at + "　" + (cs ? cs + "　" : "") + x.n + " 筆" + (src(x.how) ? "（" + src(x.how) + "）" : "") + "\n";
        quick.push({ l: "復原 #" + x.b, m: "復原 #" + x.b });
      }
      msg += "\n也可以打「復原 CODE」只還原某一支藥。";
      dsSend(X, [bot(msg)], quick);
      X.reply = "最近改過的批次清單（每一批一顆小按鈕）";
      return true;
    }
    plan = dsUndoPlan(S, target);
    X.sheet = "沒動（先給你看要還原什麼）";
    if (plan.err) { dsSend(X, [bot(plan.err)]); dsT(X, 0, "這個批次／CODE 找得到嗎？找不到"); X.reply = "「" + plan.err.substring(0, 16) + "…」"; return true; }
    S.imp = { stage: "undo", target: target };
    msg = "↩️ 復原 " + (plan.isBatch ? "批次 #" : "CODE ") + target + "：\n　會把 " + plan.restore.length + " 格改回舊值、清空 " + plan.clear.length + " 列（新增的那幾個品項）\n";
    for (i = 0; i < plan.restore.length && i < 6; i++) msg += "　" + plan.restore[i].code + "　" + plan.restore[i].field + "：" + (plan.restore[i].now || "空") + " → " + (plan.restore[i].oldV || "空") + "\n";
    if (plan.restore.length > 6) msg += "　…還有 " + (plan.restore.length - 6) + " 格\n";
    for (i = 0; i < plan.clear.length && i < 6; i++) msg += "　清空 " + plan.clear[i].code + "\n";
    if (plan.skipped.length) msg += "　⚠️ " + plan.skipped.length + " 格後來又被改過，不動：" + plan.skipped.slice(0, 4).join("、") + "\n";
    msg += "\n確定嗎？";
    dsSend(X, [bot(msg.substring(0, 4900))], [{ l: "確定復原", m: "確定復原 " + target }, { l: "取消", m: "取消" }]);
    dsT(X, 1, "在「匯入紀錄」找到這一批改過的格子，逐格比對：現在的值還是當時改成的值，才會改回去");
    dsT(X, plan.skipped.length ? 0 : 1, plan.skipped.length ? "有 " + plan.skipped.length + " 格後來又被改過 → 不動" : "每一格都還是當時改的樣子");
    X.reply = "要還原什麼的清單＋「確定復原」「取消」兩顆小按鈕";
    return true;
  }
  function dsUndoPlan(S, target) {
    var isBatch = /^(\d{4}-\d+|校對\d{4})$/.test(target), code = isBatch ? "" : dsImpCode(target), entries = [], i, e, restore = [], clear = [], skipped = [], done = {}, key, f, now;
    if (!isBatch && !/^\d{4,6}$/.test(code)) return { err: "看不懂「" + target + "」。打「復原」看批次清單，或「復原 CODE」。" };
    for (i = S.log.length - 1; i >= 0; i--) {
      e = S.log[i];
      if (e.act === "復原") continue;
      if (isBatch ? e.b !== target : e.code !== code) continue;
      entries.push(e);
    }
    if (!entries.length) return { err: "找不到 " + (isBatch ? "批次 #" : "CODE ") + target + " 的匯入紀錄（只保留 7 天）。" };
    for (i = 0; i < entries.length; i++) {
      e = entries[i];
      key = e.code + "|" + e.field;
      if (done[key]) continue;
      done[key] = true;
      if (e.act === "新增") { clear.push({ code: e.code }); continue; }
      f = dsUndoField(e.field);
      if (!f) continue;
      now = S.rows[e.code] ? dsImpNorm(dsEfNow(S, e.code, f.k)) : "";
      if (dsImpNorm(now) !== dsImpNorm(e.newV)) { skipped.push(e.code + " " + e.field); continue; }
      restore.push({ code: e.code, field: e.field, k: f.k, raw: f.raw, oldV: e.oldV, now: now });
    }
    return { isBatch: isBatch, restore: restore, clear: clear, skipped: skipped };
  }
  function dsImpCode(v) {
    var s = dsImpNorm(v).replace(/\s+/g, "");
    if (/^\d+\.0+$/.test(s)) s = s.replace(/\.0+$/, "");
    return s;
  }
  function dsUndoRun(S, X, target) {
    var plan = dsUndoPlan(S, target), done = 0, cleared = 0, i, x, c, at, bid, idx, r;
    if (plan.err) { dsSend(X, [bot(plan.err)]); return; }
    at = dsClock(S);
    bid = "復原" + dsMD(S) + "-1045";
    for (i = 0; i < plan.restore.length; i++) {
      x = plan.restore[i];
      r = S.rows[x.code];
      if (!r) continue;
      dsEfPut(S, x.code, x.k, x.k === "loc" && !x.raw ? dsLocNorm(x.oldV) : x.oldV);   /* ✏️ 改的欄位名走 _efWrite_（位置統一成半形大寫）；匯入用的名稱直接寫那一格 */
      done++;
      S.log.push({ b: bid, at: at, u: "示範甲", act: "復原", code: x.code, field: x.field, oldV: x.now, newV: x.oldV, how: "復原 " + target });
    }
    for (i = 0; i < plan.clear.length; i++) {
      c = plan.clear[i].code;
      idx = S.order.indexOf(c);
      if (idx < 0) continue;
      r = S.rows[c];
      S.log.push({ b: bid, at: at, u: "示範甲", act: "復原", code: c, field: "整列", oldV: [c, r.b, r.loc, r.f, r.z, r.g, r.ref].join("｜"), newV: "", how: "復原 " + target });
      delete S.rows[c];
      S.order[idx] = "";
      cleared++;
    }
    dsTrimOrder(S);
    dsCacheWarm(S);   /* 08 的 _impUndoRun_ 最後 clearDrugCache＋warmCache */
    dsSend(X, [bot("↩️ 復原完成：改回 " + done + " 格、清空 " + cleared + " 列" + (plan.skipped.length ? "、" + plan.skipped.length + " 格因為後來又改過而沒動" : "") + "。\n快取已更新。")]);
    dsT(X, 1, "按了「確定復原」→ 把每一格改回舊值" + (cleared ? "，新增的那幾列清空" : ""));
    dsT(X, 1, "復原也記進「匯入紀錄」（動作＝復原），快取更新");
    X.wrote = done + cleared > 0 ? 1 : 0;
    X.sheet = "改回 " + done + " 格、清空 " + cleared + " 列";
    X.reply = "「↩️ 復原完成：改回 " + done + " 格、清空 " + cleared + " 列」";
  }
  /* 復原時直接把舊值放回那一格（不再記一筆 ✏️ 的紀錄；位置用同一套統一寫法） */
  function dsEfPut(S, c, k, v) {
    var r = S.rows[c], col = DS_EFCOL[k];
    if (!r || !col) return;
    r[col] = v === null || v === undefined ? "" : String(v);
    dsRowFix(r, k);
  }
  function dsTrimOrder(S) { while (S.order.length && !S.order[S.order.length - 1]) S.order.pop(); }
  /*/SIMDEV*/

  /* ───────── 開發者練習聊天室：藥品家族（第 17 批）─────────
     藥品卡片上紫色的「藥品家族」框：院內其他「同成分」的藥，分「💊 同成分不同劑量」「🔁 同成分不同劑型」「🏷 同成分同劑量」，複方還有「➕ … 的成分」「🧩 … 的成分」。
     照 01_程式碼.gs 的 _ingToks_、_formLabel_、_doseKey_、_sameIngredient_、_sameSections_ 一個字一個字搬過來（整套搬，不是簡化版）：成分看學名（拿掉括號、鹽類、劑型字、數字單位，再排序）、
     劑型先看中文名（有「錠」就是錠）、再看商品名的英文（TAB、CAP…）、最後才看劑型那一格；劑量看商品名（沒有再看中文名）的「25MG」「60ML」。
     所以改了學名、商品名、中文名、劑型，家族框就跟真的一樣跟著變。成分字、劑型字的字表是從原始碼直接複製的。 */
  /*SIMDEV*/
  var DS_SAME_DROP = [ "prolonged", "release", "extended", "modified", "delayed", "sustained", "controlled", "slow", "enteric", "coated", "film", "chewable", "dispersible", "effervescent", "orodispersible", "sublingual", "retard", "eq", "to", "as", "base", "equivalent", "equal", "micronised", "micronized", "concentrate", "vial", "amp", "ampoule", "ampule", "bottle", "bag", "premix", "premixed", "for", "of", "and", "with", "in", "the", "usp", "bp", "ph", "eur", "jp", "dry", "lyophilized", "lyophilised", "sterile", "compound", "complex", "extract", "emulsion", "emul", "spray", "inhaler", "inhalation", "inh", "nasal", "ophthalmic", "ophth", "oph", "eye", "ear", "otic", "topical", "rectal", "vaginal", "enema", "suppository", "supp", "lotion", "shampoo", "foam", "aerosol", "mdi", "dpi", "pen", "prefilled", "syringe", "kit", "sachet", "packet", "lozenge", "troche", "gum", "elixir", "tincture", "drop", "chewing", "freshmint", "mediated", "coated", "od", "odt", "plus", "forte", "mite", "junior", "kids", "pediatric", "paediatric", "adult" ];
  var DS_SAME_SYN = { amoxycillin: "amoxicillin", mesalamine: "mesalazine", paracetamol: "acetaminophen", albuterol: "salbutamol", cyclosporine: "ciclosporin", cyclosporin: "ciclosporin", rifampicin: "rifampin", epinephrine: "adrenaline", norepinephrine: "noradrenaline", frusemide: "furosemide", glyburide: "glibenclamide", lignocaine: "lidocaine", cefalexin: "cephalexin", oestradiol: "estradiol", ethinyloestradiol: "ethinylestradiol", beclometasone: "beclomethasone", indometacin: "indomethacin", thiamin: "thiamine", sulphasalazine: "sulfasalazine", salazosulphapyridine: "sulfasalazine", sulphamethoxazole: "sulfamethoxazole", acetylsalicylic: "aspirin", hctz: "hydrochlorothiazide", hct: "hydrochlorothiazide", vit: "vitamin", nacl: "sodiumchloride", kcl: "potassiumchloride", nahco3: "sodiumbicarbonate", caco3: "calciumcarbonate", mgso4: "magnesiumsulfate", mgo: "magnesiumoxide", dextrose: "glucose" };
  var DS_SAME_ABBR = [ "inah", "inh", "mtx", "emb", "pza", "rif", "rmp", "atra", "hpmc", "asa", "ldt", "cfu", "hdm", "ppm", "ftu", "vp16", "sq", "usp" ];
  var DS_SAME_SALT_EXTRA = [ "hydrogen", "hemihydrate", "sesquihydrate", "hydrate", "pentahydrate", "hexahydrate", "heptahydrate", "dimaleate", "dimesylate", "dimesilate", "tosilate", "tosylate", "hyclate", "hemisuccinate", "hemifumarate", "hemitartrate", "monohydrochloride", "trihydrochloride", "esylate", "edisylate", "napsylate", "pamoate", "embonate", "decanoate", "enanthate", "undecanoate", "palmitate", "benzoate", "medoxomil", "cilexetil", "pivoxil", "axetil", "proxetil", "hexetil", "dipivoxil", "trifenatate", "resinate", "digluconate", "ethanolate", "salt", "salts", "dihydrogen", "trisodium", "tripotassium", "monosodium", "monopotassium", "silver" ];
  var DS_SAME_ANION = [ "oxide", "hydroxide", "chloride", "sulfate", "sulphate", "carbonate", "bicarbonate", "phosphate", "citrate", "gluconate", "acetate", "lactate", "fluoride", "iodide", "bromide", "nitrate", "permanganate", "hypochlorite", "peroxide", "silicate", "trisilicate", "oleate", "stearate", "glycerophosphate", "pidolate", "aspartate", "orotate", "dobesilate", "picosulfate", "docusate", "sulfosuccinate", "thiosulfate", "selenite", "molybdate", "chromate" ];
  var DS_FORM_WORDS = [ [ "注射", "注射" ], [ "點眼", "眼藥" ], [ "眼藥", "眼藥" ], [ "眼用", "眼藥" ], [ "眼科", "眼藥" ], [ "鼻", "噴劑" ], [ "吸入", "吸入" ], [ "貼片", "貼片" ], [ "貼布", "貼片" ], [ "栓劑", "栓劑" ], [ "浣腸", "浣腸" ], [ "灌腸", "浣腸" ], [ "陰道", "陰道" ], [ "噴", "噴劑" ], [ "漱口", "漱口" ], [ "含漱", "漱口" ], [ "滴劑", "滴劑" ], [ "糖漿", "糖漿" ], [ "口服液", "口服液" ], [ "懸液", "懸液" ], [ "懸浮", "懸液" ], [ "液劑", "液劑" ], [ "乳膏", "乳膏" ], [ "軟膏", "軟膏" ], [ "藥膏", "軟膏" ], [ "凝膠", "凝膠" ], [ "洗髮", "洗髮精" ], [ "膠囊", "膠囊" ], [ "錠", "錠" ], [ "顆粒", "顆粒" ], [ "粉", "粉劑" ], [ "散", "粉劑" ] ];
  var DS_FORM_WORDS_EN = [ [ /\bINJ/, "注射" ], [ /\bEYE\b|OPHTH|\bOPH\b/, "眼藥" ], [ /\bNASAL|\bSPRAY/, "噴劑" ], [ /\bINHAL|\bMDI\b|\bDPI\b|\bEVOHALER|\bTURBUHALER|\bHFA\b/, "吸入" ], [ /\bPATCH|\bTDDS|\bTTS\b/, "貼片" ], [ /\bSUPP/, "栓劑" ], [ /\bENEMA|\bEMEMA/, "浣腸" ], [ /\bVAG/, "陰道" ], [ /\bGARGLE|\bMOUTHWASH/, "漱口" ], [ /\bDROPS?\b/, "滴劑" ], [ /\bSYR(UP)?\b/, "糖漿" ], [ /\bSOLN?\b|\bSOLUTION\b/, "液劑" ], [ /\bSUSP/, "懸液" ], [ /\bCREAM\b/, "乳膏" ], [ /\bOINT/, "軟膏" ], [ /\bGEL\b|\bJELLY\b/, "凝膠" ], [ /\bSHAMPOO/, "洗髮精" ], [ /\bCAPS?(ULES?)?\b/, "膠囊" ], [ /\bTABS?(LETS?)?\b|\bF\.?C\.?\b/, "錠" ], [ /\bGRAN/, "顆粒" ], [ /\bPOWDER|\bPOWD\b/, "粉劑" ] ];
  var DS_FORM_ORDER = [ "錠", "膠囊", "顆粒", "粉劑", "糖漿", "口服液", "懸液", "液劑", "滴劑", "注射", "眼藥", "噴劑", "吸入", "乳膏", "軟膏", "凝膠", "貼片", "栓劑", "浣腸", "陰道", "漱口", "洗髮精", "水" ];
  var DS_AGG_DROP = [ "tablet", "tablets", "tab", "tabs", "cap", "caps", "capsule", "capsules", "injection", "inj", "syrup", "solution", "soln", "suspension", "susp", "cream", "ointment", "gel", "patch", "drops", "powder", "granule", "granules", "oral", "iv", "im", "sc", "er", "sr", "xr", "cr", "la", "fc", "ec" ];
  var DS_SALT_WORDS = [ "besylate", "besilate", "maleate", "mesylate", "mesilate", "tartrate", "bitartrate", "succinate", "fumarate", "citrate", "acetate", "gluconate", "lactate", "malate", "oxalate", "salicylate", "stearate", "valerate", "propionate", "pivalate", "dipropionate", "furoate", "xinafoate", "hydrochloride", "hydrobromide", "hcl", "hbr", "dihydrate", "monohydrate", "trihydrate", "anhydrous", "sulfate", "sulphate", "phosphate", "nitrate", "carbonate", "bicarbonate", "chloride", "bromide", "iodide", "sodium", "potassium", "calcium", "magnesium", "zinc", "disodium", "dipotassium", "dihydrochloride" ];
  var DS_AGG_ZH_FORM_RE = /(持續性藥效錠|持續性藥效膠囊|口崩錠|口溶錠|膜衣錠|糖衣錠|發泡錠|咀嚼錠|舌下錠|腸溶錠|緩釋錠|長效錠|錠劑|膠囊劑|軟膠囊|硬膠囊|膠囊|口服液劑|口服懸液劑|內服液劑|外用液劑|口服液|懸浮液|注射劑|注射液|乳膏劑|乳膏|軟膏|藥膏|凝膠|貼片|眼藥水|眼藥膏|栓劑|散劑|顆粒劑|粉劑|錠|散|粉|液|針|膏)/g;

  function dsStripParen(s) {
    var t = String(s === null || s === undefined ? "" : s), prev;
    do {
      prev = t;
      t = t.replace(/[(（\[【][^()（）\[\]【】]*[)）\]】]/g, " ");
    } while (t !== prev);
    return t.replace(/[()（）\[\]【】]/g, " ");
  }
  /* 學名 → 成分字（排好序、去重複）：AMOXYCILLIN (TRIHYDRATE)⏎CLAVULANATE POTASSIUM → ["amoxicillin","clavulanate"]（01 的 _ingToks_） */
  function dsIngToks(generic) {
    var g = dsBrNl(generic).replace(/\n+/g, " \n ").trim(), segs, toks = [], fin = [], i, j, k, raw, kept, base, w, onlyIons, x;
    if (!g) return [];
    g = dsStripParen(g);
    if (/[A-Za-z]{3}/.test(g)) g = g.replace(/[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]+/g, " "); else g = g.replace(DS_AGG_ZH_FORM_RE, "");
    segs = g.toLowerCase().split(/[\n+;／/,，、]/);
    for (i = 0; i < segs.length; i++) {
      raw = segs[i].replace(/[*®™.。:：=＝"'“”~`!?&#%$^|<>{}]/g, " ").replace(/-/g, " ").split(/\s+/).filter(String);
      kept = []; base = [];
      for (j = 0; j < raw.length; j++) {
        w = raw[j];
        if (/^\d+(\.\d+)?(mg|mcg|ug|gm|g|ml|l|iu|u|meq|mmol|x|mcg\/ml|mg\/ml|ug\/ml|g\/ml|mg\/g)?$/.test(w)) continue;
        if (/^(mg|mcg|ug|gm|ml|iu|meq|mmol|units?|w\/v|w\/w)$/.test(w) || /^\d/.test(w)) continue;
        w = dsOwn(DS_SAME_SYN, w) ? DS_SAME_SYN[w] : w;
        if (DS_SAME_DROP.indexOf(w) >= 0 || DS_AGG_DROP.indexOf(w) >= 0) continue;
        if (/hydrat|hydrous/.test(w) || DS_SAME_SALT_EXTRA.indexOf(w) >= 0) continue;
        base.push(w);
        if (DS_SALT_WORDS.indexOf(w) >= 0) continue;
        kept.push(w);
      }
      onlyIons = base.length > 0;
      for (j = 0; j < kept.length; j++) if (DS_SAME_ANION.indexOf(kept[j]) < 0) onlyIons = false;
      if (onlyIons) {
        base.sort();
        kept.length = 0;
        kept.push(base.join(""));
      }
      for (j = 0; j < kept.length; j++) if (toks.indexOf(kept[j]) < 0) toks.push(kept[j]);
    }
    for (k = 0; k < toks.length; k++) {
      x = toks[k].replace(/[^a-z0-9\u3400-\u9fff]/g, "");
      if (x && !/^[a-z]{2}$/.test(x) && DS_SAME_ABBR.indexOf(x) < 0 && fin.indexOf(x) < 0) fin.push(x);
    }
    fin.sort();
    return fin.join("").length >= 3 ? fin : [];
  }
  function dsIngNormWord(w) {
    var x = String(w === null || w === undefined ? "" : w).toLowerCase().replace(/[^a-z0-9]/g, "");
    return dsOwn(DS_SAME_SYN, x) ? DS_SAME_SYN[x] : x;
  }
  /* 成分字 → 用那支藥學名裡原本的寫法顯示（01 的 _ingShowMany_）：clavulanate → CLAVULANATE；polymyxin＋b → POLYMYXIN B */
  function dsIngShowMany(toks, generic) {
    var left = toks.slice(), out = [], g, segs, i, j, k, words, norm, base, bi, ws, w;
    function clean(x) { return x.replace(/[^A-Za-z0-9\u3400-\u9fff]/g, "").toUpperCase(); }
    g = dsStripParen(dsBrNl(generic).replace(/\n+/g, " \n "));
    segs = g.split(/[\n+;／/,，、]/);
    for (i = 0; i < segs.length && left.length; i++) {
      words = segs[i].replace(/[*®™.。:：=＝"'“”~`!?&#%$^|<>{}]/g, " ").replace(/-/g, " ").split(/\s+/).filter(String);
      norm = [];
      for (j = 0; j < words.length; j++) norm.push(dsIngNormWord(words[j]));
      base = [];
      for (j = 0; j < words.length; j++) {
        w = norm[j];
        if (w && !/hydrat|hydrous/.test(w) && DS_SAME_SALT_EXTRA.indexOf(w) < 0 && DS_SAME_DROP.indexOf(w) < 0 && DS_AGG_DROP.indexOf(w) < 0 && !/^\d/.test(w)) base.push(w);
      }
      bi = base.length ? left.indexOf(base.slice().sort().join("")) : -1;
      if (bi >= 0) {
        ws = [];
        for (j = 0; j < words.length; j++) if (base.indexOf(norm[j]) >= 0) ws.push(clean(words[j]));
        out.push(ws.join(" "));
        left.splice(bi, 1);
        continue;
      }
      ws = [];
      for (j = 0; j < words.length; j++) {
        k = left.indexOf(norm[j]);
        if (k >= 0) {
          ws.push(clean(words[j]));
          left.splice(k, 1);
        }
      }
      if (ws.length) out.push(ws.join(" "));
    }
    for (i = 0; i < left.length; i++) out.push(left[i].toUpperCase());
    return out;
  }
  function dsTokDiff(a, b) { var out = [], i; for (i = 0; i < a.length; i++) if (b.indexOf(a[i]) < 0) out.push(a[i]); return out; }
  function dsCmpStr(a, b) {
    var x = String(a === null || a === undefined ? "" : a).toUpperCase(), y = String(b === null || b === undefined ? "" : b).toUpperCase();
    return x < y ? -1 : x > y ? 1 : 0;
  }
  function dsIngGroups(map) {
    var out = [], keys = Object.keys(map), i, g;
    for (i = 0; i < keys.length; i++) {
      g = map[keys[i]];
      g.rows.sort(function(a, b) { return dsCmpStr(a.brand, b.brand); });
      out.push(g);
    }
    out.sort(function(a, b) { return b.rows.length - a.rows.length || a.n - b.n || dsCmpStr(a.name, b.name); });
    return out;
  }
  /* 劑量：從商品名抓「數字＋單位」（5MG、0.15%、100MG/ML）或「70/5600」這種；商品名沒寫就看中文名；都沒有就空字串（01 的 _doseKey_） */
  function dsDoseKeyOf(brand) {
    var b = String(brand === null || brand === undefined ? "" : brand).toUpperCase().replace(/[０-９．％／]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }), out = [], re = /(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)*)\s*(MG\/ML|MCG\/ML|UG\/ML|G\/ML|MG\/G|MG|MCG|UG|GM|G|ML|IU|U|MEQ|MMOL|%)?/g, m;
    while ((m = re.exec(b)) !== null) {
      if (!m[2] && m[1].indexOf("/") < 0) continue;
      out.push(m[1] + (m[2] || ""));
    }
    return out.join(" ");
  }
  function dsDoseKey(brand, chName) {
    var k = dsDoseKeyOf(brand), zh;
    if (k || !chName) return k;
    zh = String(chName).replace(/微公克|微克/g, "MCG").replace(/毫克|公絲/g, "MG").replace(/公克/g, "G").replace(/毫升/g, "ML").replace(/公升/g, "L").replace(/國際單位/g, "IU").replace(/單位/g, "U");
    return dsDoseKeyOf(zh);
  }
  function dsDoseNum(x) {
    var k = dsDoseKey(x.brand, x.chName), m = k.match(/(\d+(?:\.\d+)?)\s*(MCG|UG|MG|G|GM|%|IU|U|ML|L|MEQ|MMOL)?/), v, u;
    if (!m) return 1e12;
    v = parseFloat(m[1]);
    u = m[2] || "";
    if (u === "MCG" || u === "UG") v /= 1000; else if (u === "G" || u === "GM") v *= 1000; else if (u === "%") v *= 10;
    return v;
  }
  /* 劑型：先看中文名、再看英文（TAB、CAP、SOLN…）、最後用工作表的劑型欄（01 的 _formLabel_、_isWater_） */
  function dsWaterReal(r) {
    var f = String(r && r.form || ""), l = String(r && r.location || "");
    return f.indexOf("水") >= 0 || f.indexOf("液") >= 0 || l.indexOf("水") === 0;
  }
  function dsFormLabel(r) {
    var zh = String(r && r.chName || ""), en, f, i;
    for (i = 0; i < DS_FORM_WORDS.length; i++) if (zh.indexOf(DS_FORM_WORDS[i][0]) >= 0) return DS_FORM_WORDS[i][1];
    en = String(r && r.brand || "").toUpperCase();
    for (i = 0; i < DS_FORM_WORDS_EN.length; i++) if (DS_FORM_WORDS_EN[i][0].test(en)) return DS_FORM_WORDS_EN[i][1];
    f = String(r && r.form || "").trim();
    if (f) return f;
    return dsWaterReal(r) ? "水" : "錠";
  }
  function dsFormRank(label) { var i = DS_FORM_ORDER.indexOf(String(label || "")); return i < 0 ? DS_FORM_ORDER.length : i; }
  /* 其他同成分的藥 → { dose, form, brand, combo, part }（01 的 _sameIngredient_）；list＝全部的藥（試算表的順序），每一個是 { code, brand, chName, generic, form, location, toks } */
  function dsSameIngredient(r, list) {
    var out = { dose: [], form: [], brand: [], combo: [], part: [] }, myToks = r.toks, key, code, myForm, myDose, seen = {}, i, j, x, cand = {}, codes, comboG = {}, partG = {}, xt, mine, theirs, name, t;
    if (!myToks.length) return out;
    key = myToks.join("");
    code = dsNorm(r.code);
    myForm = dsFormLabel(r);
    myDose = dsDoseKey(r.brand, r.chName);
    seen[code] = true;
    for (i = 0; i < list.length; i++) {
      x = list[i];
      if (x.toks.join("") !== key) continue;
      if (seen[x.code]) continue;
      seen[x.code] = true;
      if (dsFormLabel(x) !== myForm) out.form.push(x); else if (myDose && dsDoseKey(x.brand, x.chName) === myDose) out.brand.push(x); else out.dose.push(x);
    }
    for (t = 0; t < myToks.length; t++) {
      for (i = 0; i < list.length; i++) {
        x = list[i];
        if (x.toks.indexOf(myToks[t]) >= 0 && !seen[x.code] && !cand[x.code]) cand[x.code] = x;
      }
    }
    codes = Object.keys(cand);
    for (i = 0; i < codes.length; i++) {
      x = cand[codes[i]]; xt = x.toks;
      mine = dsTokDiff(myToks, xt); theirs = dsTokDiff(xt, myToks);
      if (mine.length === 0 && theirs.length > 0) {
        name = dsIngShowMany(theirs, x.generic).join("、");
        if (!comboG[name]) comboG[name] = { name: name, n: theirs.length, rows: [] };
        comboG[name].rows.push(x);
      } else if (theirs.length === 0 && mine.length > 0) {
        name = dsIngShowMany(xt, r.generic).join("、");
        if (!partG[name]) partG[name] = { name: name, n: mine.length, rows: [] };
        partG[name].rows.push(x);
      }
    }
    out.combo = dsIngGroups(comboG);
    out.part = dsIngGroups(partG);
    out.dose.sort(function(a, b) { return dsDoseNum(a) - dsDoseNum(b) || dsCmpStr(a.brand, b.brand); });
    out.form.sort(function(a, b) { return dsFormRank(dsFormLabel(a)) - dsFormRank(dsFormLabel(b)) || dsCmpStr(a.brand, b.brand); });
    out.brand.sort(function(a, b) { return dsCmpStr(a.brand, b.brand); });
    return out;
  }
  /* 卡片要畫的段：固定三段 ＋ 一個多出來的成分一段 ＋ 一個少掉的成分一段 → [{ title, rows, rest }]（01 的 _sameSections_；一個方向最多 6 段，再多算在最後一段的「另外還有」） */
  function dsSameSections(same) {
    var secs = [], t = [["dose", "💊 同成分不同劑量"], ["form", "🔁 同成分不同劑型"], ["brand", "🏷 同成分同劑量"]], dirs = [["combo", "➕ ", " 的成分"], ["part", "🧩 ", " 的成分"]], s, d, i, list, groups, rest;
    for (s = 0; s < t.length; s++) {
      list = same[t[s][0]];
      if (list && list.length) secs.push({ title: t[s][1], rows: list });
    }
    for (d = 0; d < dirs.length; d++) {
      groups = same[dirs[d][0]] || [];
      rest = 0;
      for (i = 0; i < groups.length; i++) {
        if (i < 6) secs.push({ title: dirs[d][1] + groups[i].name + dirs[d][2], rows: groups[i].rows }); else rest += groups[i].rows.length;
      }
      if (rest > 0 && secs.length) secs[secs.length - 1].rest = rest;
    }
    return secs;
  }
  function dsRealRow(c, r) {
    var x = { code: c, brand: r.b, chName: r.z, generic: r.g, form: r.f, location: r.loc };
    x.toks = dsIngToks(x.generic);
    return x;
  }
  /* 藥品家族（藥品卡片上紫色、收起來的框）：回 { cats: [[段名, [CODE…]], …], rest } 或 null（沒有同成分的藥＝沒有這個框）。row＝這支藥還沒存進試算表（新藥預覽）時，拿暫時的那一列來比 */
  function dsFam(S, code, row) {
    var list = [], i, c, secs, cats = [], rest = 0, total = 0, me_;
    for (i = 0; i < S.order.length; i++) {
      c = S.order[i];
      if (!c || !S.rows[c]) continue;
      list.push(dsRealRow(c, S.rows[c]));
    }
    me_ = dsRealRow(code, row || S.rows[code]);
    secs = dsSameSections(dsSameIngredient(me_, list));
    for (i = 0; i < secs.length; i++) {
      total += secs[i].rows.length + (secs[i].rest || 0);
      rest += secs[i].rest || 0;
      cats.push([secs[i].title, secs[i].rows.map(function(x) { return x.code; })]);
    }
    return total ? { cats: cats, rest: rest } : null;
  }
  /*/SIMDEV*/

  /* ───────── 開發者練習聊天室：批次匯入（第 17 批）─────────
     這一段接在 _learn_dev_sim_edit.js 後面，也是一支沒碰畫面的純函式（SIMDEV 標記之間）：dsImpFlow（在 _learn_dev_sim.js）把「匯入」「開始逐筆確認」「對」「改一格」「跳過」「先停」…交給這裡。
     每一句機器人說的話、每一顆小按鈕、每一個判斷，都照 08_匯入.gs（_impMapCols_、_impRead_、_impStart_、_impOverviewBubble_、_impRowBubble_、_impApply_、_impFlow_…）寫；
     練習的是「編的」試算表：S.pend＝「待匯入」分頁（一列一個 { c: 這一列每一格的字, bad: 紅底那一列的註解（沒有＝空字串） }），貼什麼進去由畫面上方的按鈕換（DS_IMP_PRESETS）；
     寫進去的是 S.rows／S.order（工作表1、2）和 S.log（匯入紀錄），都是練習用的，什麼都不會真的寫。
     S.imp＝匯入的狀態（真的存在快取裡 30 分鐘）：{ b 批次、stage overview／confirm／edit、rows 要確認的列、i 現在第幾筆、ok／okAdd／okUpd／cells 寫了多少、sk 跳過的、nc 沒變幾筆、pb 有問題幾筆、cut 太大留下幾筆… }。 */
  /*SIMDEV*/
  var DS_IMP_MAX = 300, DS_IMP_USER = "…9a2c4f";
  var DS_IMP_HEAD = ["CODE", "商品名", "位置", "劑型", "中文名", "學名", "參考網站", "公告類別", "公告補充"];
  var DS_IMP_FIELDS = [
    { k: "code", label: "CODE", col: 0, re: /代碼|CODE|代号|藥碼|院內碼|^code$/i },
    { k: "zh", label: "中文名", col: 4, re: /中文/ },
    { k: "brand", label: "商品名", col: 1, re: /商品名|英文名|英文品名|brand|品名|藥名/i },
    { k: "loc", label: "位置", col: 2, re: /位置|儲位|櫃位|storage|^loc/i },
    { k: "form", label: "劑型", col: 3, re: /劑型|^form$/i },
    { k: "gen", label: "學名", col: 5, re: /學名|成分|generic/i },
    { k: "ref", label: "參考網站", col: 6, re: /參考網站|網站|網址|連結|url|link/i },
    { k: "nk", label: "公告類別", col: -1, re: /公告類別|^公告$/ },
    { k: "nm", label: "公告補充", col: -1, re: /公告補充|補充說明/ }
  ];
  var DS_IMP_FORM_MAP = [
    [/^(F\.?C\.?\s*)?TAB(LET)?S?$|^F\.?C\.?$|錠|TABLET/i, "錠劑"],
    [/CAP(SULE)?S?|膠囊/i, "膠囊"],
    [/SYR(UP)?|SOL(UTION)?|SUSP|ORAL\s*LIQ|口服液|糖漿|懸液|口服溶液|藥水/i, "口服液"],
    [/INJ(ECTION)?|VIAL|AMP(OULE)?|注射|針劑|針/i, "注射劑"],
    [/OINT(MENT)?|CREAM|GEL|藥膏|軟膏|乳膏|凝膠/i, "藥膏"],
    [/EYE|OPH(TH)?|眼藥|點眼/i, "眼藥水"],
    [/SUPP(OSITORY)?|栓/i, "栓劑"],
    [/PATCH|貼片|貼布/i, "貼片"],
    [/POWDER|PWD|GRANULE|粉|散劑|顆粒/i, "粉劑"]
  ];
  /* 練習用的「待匯入」分頁，畫面上方的按鈕可以換：第一份跟課文第 1 節畫的一模一樣（5 列：2 支新藥、1 支改位置、1 列 CODE 打錯、1 列跟工作表1 一模一樣） */
  var DS_IMP_SAMPLE = [
    ["CODE", "商品名", "位置", "劑型", "中文名"],
    ["90130.0", "NEWTESTIN* 20MG TAB", "k2", "F.C. TAB", "新測寧錠 20 毫克"],
    ["90131", "DEMOLIDE* 5MG TAB 示範利得錠 5 毫克", "B1", "錠劑", ""],
    ["90101", "TESTOLOL* 25MG TAB", "K3", "", ""],
    ["12A45", "NEWSAMPLE* 5MG TAB", "K2", "錠劑", "新樣本錠 5 毫克"],
    ["90103", "MODELPRIL* 5MG TAB", "B1", "錠劑", ""]
  ];
  /* 各種有問題的列：CODE 不對、CODE 是空的、同一批 CODE 出現第 2 次、新藥商品名和中文名都空、參考網站不像網址；另外有 2 支新藥（劑型自動對、新位置、公告）、1 列修改（公告）、1 列沒變 */
  var DS_IMP_BAD = [
    ["CODE", "商品名", "位置", "劑型", "中文名", "參考網站", "公告類別", "公告補充"],
    ["90140", "PRESETOL* 10MG CAP", "c3", "CAP", "預設醇膠囊 10 毫克", "https://example.org/drug/90140", "3", "廠商缺貨，預計下月到"],
    ["90141", "SYRUPTEST* 100ML", "水棧三", "糖漿", "", "", "", ""],
    ["AB123", "BADCODE* 5MG TAB", "K2", "錠劑", "壞代碼錠", "", "", ""],
    ["", "NOCODE* 5MG TAB", "K2", "錠劑", "", "", "", ""],
    ["90140", "PRESETOL* 10MG CAP", "C3", "膠囊", "", "", "", ""],
    ["90142", "", "B1", "錠劑", "", "", "", ""],
    ["90143", "REFTEST* 5MG TAB", "B1", "錠劑", "參考測試錠", "example.org/abc", "", ""],
    ["90102", "DEMOSYRUP* 60ML", "水棧一", "口服液", "示範康糖漿 60 毫升", "", "", ""],
    ["90104", "SAMPLESPOT* 20MG TAB", "k2", "TAB", "", "", "4", "換新包裝"]
  ];
  /* 沒有第一列欄位名稱：機器人看每一欄的內容猜（全是數字的是 CODE、像 K2 的是位置、劑型的字、中文、英文…） */
  var DS_IMP_GUESS = [
    ["90144", "GUESSIT* 10MG TAB", "B1", "錠劑", "猜猜看錠 10 毫克"],
    ["90145", "GUESSAGAIN* 5MG CAP", "C3", "膠囊", "再猜膠囊 5 毫克"],
    ["90146", "GUESSMORE* 20MG TAB", "D1", "錠劑", "猜更多錠 20 毫克"]
  ];
  var DS_IMP_NOMAP = [["今天", "天氣"], ["很好", "謝謝"]];
  var DS_IMP_PRESETS = [
    { key: "sample", label: "課文的 5 列範例", hd: 1, rows: DS_IMP_SAMPLE },
    { key: "bad", label: "有問題的各種列", hd: 1, rows: DS_IMP_BAD },
    { key: "guess", label: "沒寫欄位名稱", hd: 0, rows: DS_IMP_GUESS },
    { key: "nomap", label: "亂寫的（對不出欄位）", hd: 0, rows: DS_IMP_NOMAP },
    { key: "empty", label: "空的分頁", hd: 0, rows: [] }
  ];
  function dsPendLoad(key) {
    var i, p = DS_IMP_PRESETS[0], rows = [];
    for (i = 0; i < DS_IMP_PRESETS.length; i++) if (DS_IMP_PRESETS[i].key === key) p = DS_IMP_PRESETS[i];
    for (i = 0; i < p.rows.length; i++) rows.push({ c: p.rows[i].slice(), bad: "" });
    return { key: p.key, hd: p.hd, rows: rows };
  }
  function dsCol(v) { return v === null || v === undefined ? "" : String(v); }
  /* 試算表 getLastRow／getLastColumn／getValues：最後一個有字的列、欄；values 是補成長方形的字（08 的 _impRead_ 開頭） */
  function dsPendValues(S) {
    var rows = S.pend.rows, last = 0, width = 1, i, j, out = [], row;
    for (i = 0; i < rows.length; i++) for (j = 0; j < rows[i].c.length; j++) if (dsCol(rows[i].c[j]) !== "") { if (i + 1 > last) last = i + 1; if (j + 1 > width) width = j + 1; }
    for (i = 0; i < last; i++) {
      row = [];
      for (j = 0; j < width; j++) row.push(dsCol(rows[i].c[j]));
      out.push(row);
    }
    return { values: out, last: last, width: width };
  }
  function dsPendLast(S) { return dsPendValues(S).last; }
  function dsImpFieldByKey(k) { var i; for (i = 0; i < DS_IMP_FIELDS.length; i++) if (DS_IMP_FIELDS[i].k === k) return DS_IMP_FIELDS[i]; return null; }
  /* 08 的 _impFieldByLabel_：匯入用的名稱先找；找不到再找 ✏️ 改 的欄位名（復原要用，工作表1／2 的欄才算） */
  function dsImpFieldByLabel(label) {
    var t = String(label === null || label === undefined ? "" : label).trim(), i, f;
    for (i = 0; i < DS_IMP_FIELDS.length; i++) if (DS_IMP_FIELDS[i].label === t) return DS_IMP_FIELDS[i];
    for (i = 0; i < DS_EF.length; i++) {
      f = DS_EF[i];
      if (f.label !== t || f.k === "pic" || !(f.sheet === 1 || f.sheet === 2)) continue;
      return { k: f.k, label: f.label, col: -1, ef: true };
    }
    return null;
  }
  function dsImpCodeOk(code) { return /^\d{4,6}$/.test(code); }
  function dsColLetter(i) {
    var n = Number(i), s = "", r;
    if (!(n >= 0)) return "?";
    n = n + 1;
    while (n > 0) { r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }
  function dsImpForm(v) {
    var s = dsImpNorm(v), i;
    if (!s) return { v: "", sure: true };
    for (i = 0; i < DS_FORMS.length; i++) if (DS_FORMS[i] === s) return { v: s, sure: true };
    for (i = 0; i < DS_IMP_FORM_MAP.length; i++) if (DS_IMP_FORM_MAP[i][0].test(s)) return { v: DS_IMP_FORM_MAP[i][1], sure: false };
    return { v: s, sure: false, unknown: true };
  }
  /* 工作表1 裡出現過的位置（大小寫、空白不分）→ 第一次出現的寫法 */
  function dsImpKnownLocs(S) {
    var known = {}, i, l, key;
    for (i = 0; i < S.order.length; i++) {
      if (!S.order[i]) continue;
      l = dsCol(S.rows[S.order[i]].loc).trim();
      if (!l) continue;
      key = l.toUpperCase().replace(/\s+/g, "");
      if (!known[key]) known[key] = l;
    }
    return known;
  }
  function dsImpLoc(v, known) {
    var s = dsImpNorm(v), key;
    if (!s) return { v: "", sure: true };
    key = s.toUpperCase().replace(/\s+/g, "");
    if (known[key]) return { v: known[key], sure: true };
    if (/^[A-Za-z]{1,2}\s*\d{1,2}$/.test(s)) s = s.toUpperCase().replace(/\s+/g, "");
    return { v: s, sure: false, isNew: true };
  }
  function dsImpSplitBrand(brand, zh) {
    var b = dsImpNorm(brand), z = dsImpNorm(zh), m;
    if (z || !b) return { brand: b, zh: z, split: false };
    m = b.match(/^([^一-鿿]+?)\s*([一-鿿][\s\S]*)$/);
    if (!m) return { brand: b, zh: z, split: false };
    return { brand: m[1].trim(), zh: m[2].trim(), split: true };
  }
  /* 對欄：第一列有 2 個以上認得的欄位名稱（而且有 CODE）→ 照名稱；不然看每一欄的內容猜（08 的 _impMapCols_） */
  function dsImpMapCols(values) {
    var width = values[0] ? values[0].length : 0, map = {}, hits = 0, head = values[0] || [], guess = {}, stat = [], c, h, i, r, s, f, n, digit, loc, cjk, latin, lower, form;
    for (c = 0; c < width; c++) {
      h = dsImpNorm(head[c]);
      if (!h) continue;
      for (i = 0; i < DS_IMP_FIELDS.length; i++) {
        if (map[DS_IMP_FIELDS[i].k] !== undefined) continue;
        if (DS_IMP_FIELDS[i].re.test(h)) { map[DS_IMP_FIELDS[i].k] = c; hits++; break; }
      }
    }
    if (hits >= 2 && map.code !== undefined) return { map: map, hasHeader: true, how: "第一列的欄位名稱" };
    for (c = 0; c < width; c++) {
      n = 0; digit = 0; loc = 0; cjk = 0; latin = 0; lower = 0; form = 0;
      for (r = 0; r < values.length && r < 60; r++) {
        s = dsImpNorm(values[r][c]);
        if (!s) continue;
        n++;
        if (/^\d{4,6}(\.0+)?$/.test(s)) digit++;
        if (/^[A-Za-z]{1,2}\s*\d{1,2}$|棧板|藥櫃|水棧|冰箱/.test(s)) loc++;
        if (/[一-鿿]/.test(s)) cjk++;
        if (/[A-Za-z]/.test(s)) latin++;
        if (/[a-z]/.test(s.replace(/\b(mg|ml|mcg|g)\b/gi, ""))) lower++;
        f = dsImpForm(s);
        if (f.v && !f.unknown) form++;
      }
      stat.push({ c: c, n: n, digit: digit, loc: loc, cjk: cjk, latin: latin, lower: lower, form: form });
    }
    function pick(k, test) {
      var best = -1, bestScore = 0, j, st, used, kk, sc;
      for (j = 0; j < stat.length; j++) {
        st = stat[j];
        if (st.n === 0) continue;
        used = false;
        for (kk in guess) if (guess[kk] === st.c) used = true;
        if (used) continue;
        sc = test(st);
        if (sc > bestScore) { bestScore = sc; best = st.c; }
      }
      if (best >= 0) guess[k] = best;
    }
    pick("code", function(x) { return x.digit / x.n >= 0.8 ? x.digit / x.n : 0; });
    pick("loc", function(x) { return x.loc / x.n >= 0.6 ? x.loc / x.n : 0; });
    pick("form", function(x) { return x.form / x.n >= 0.6 ? x.form / x.n : 0; });
    pick("zh", function(x) { return x.cjk / x.n >= 0.8 && x.latin / x.n < 0.5 ? x.cjk / x.n : 0; });
    pick("gen", function(x) { return x.latin / x.n >= 0.8 && x.lower / x.n >= 0.5 ? x.lower / x.n : 0; });
    pick("brand", function(x) { return x.latin / x.n >= 0.6 ? x.latin / x.n : 0; });
    if (guess.code === undefined || guess.brand === undefined && guess.zh === undefined) return { map: guess, hasHeader: false, how: "", fail: true };
    return { map: guess, hasHeader: false, how: "內容長相（沒有標題列）" };
  }
  function dsImpMapText(m) {
    var parts = [], i, c;
    for (i = 0; i < DS_IMP_FIELDS.length; i++) {
      c = m.map[DS_IMP_FIELDS[i].k];
      if (c === undefined) continue;
      parts.push(DS_IMP_FIELDS[i].label + " ← " + dsColLetter(c) + " 欄");
    }
    return parts.join("　");
  }
  /* 今天的第幾批：匯入紀錄最近 400 列裡，「月日-」開頭的批次號有幾種，加 1（✏️ 改的批次號也是月日開頭，一起算）（08 的 _impBatchId_） */
  function dsImpBatchId(S) {
    var day = dsMD(S), n = 0, seen = {}, from, i, v, k;
    if (S.log.length > 0) {
      from = Math.max(0, S.log.length - 401);
      for (i = from; i < S.log.length; i++) {
        v = dsCol(S.log[i].b);
        if (v.indexOf(day + "-") === 0) seen[v] = true;
      }
      for (k in seen) n++;
    }
    return day + "-" + (n + 1);
  }

  /* ───── ① 讀「待匯入」、一列一列分類（08 的 _impRead_）───── */
  /* 「現在是什麼」是從索引來的（01 的 _buildIndex_ 讀工作表1 的 G 欄）：不是 http:// 或 https:// 開頭的網址（例如亂打的字）索引裡不收，當成空的；最多 500 字 */
  function dsImpCurRef(v) { var s = String(v === null || v === undefined ? "" : v).replace(/^\s+|\s+$/g, ""); return /^https?:\/\/\S+$/i.test(s) ? s.substring(0, 500) : ""; }
  function dsImpRead(S) {
    var pv = dsPendValues(S), values = pv.values, width = pv.width, any = false, rows = [], problems = [], nochange = [], seenCode = {}, total = 0;
    var m, ix, known, start, r, c, blank, n, rawCode, code, sb, fm, lc, refRaw, refOk, vals, flags, rawOf, cur, curMap, fixes, chg, k, want, to;
    function cellOf(rr, kk) { var cc = m.map[kk]; return cc === undefined ? "" : values[rr][cc]; }
    if (pv.last < 1) return { err: "empty" };
    for (r = 0; r < values.length && !any; r++) for (c = 0; c < width; c++) if (dsImpNorm(values[r][c])) { any = true; break; }
    if (!any) return { err: "empty" };
    m = dsImpMapCols(values);
    if (m.fail) return { err: "nomap", map: m };
    ix = dsIdx(S);   /* 「工作表1 有沒有這支」「現在是什麼」「見過的位置」都是讀索引快取（getIndex_），不是直接讀試算表 */
    known = dsImpKnownLocs(ix);
    start = m.hasHeader ? 1 : 0;
    for (r = start; r < values.length; r++) {
      blank = true;
      for (c = 0; c < width; c++) if (dsImpNorm(values[r][c])) { blank = false; break; }
      if (blank) continue;
      total++;
      n = r + 1;
      rawCode = cellOf(r, "code");
      code = dsImpCode(rawCode);
      if (!dsImpCodeOk(code)) { problems.push({ n: n, code: dsImpNorm(rawCode), why: code ? "CODE「" + dsImpNorm(rawCode) + "」不是 4～6 位數字" : "CODE是空的" }); continue; }
      if (seenCode[code]) { problems.push({ n: n, code: code, why: "CODE " + code + " 在這批出現第 2 次（第 " + seenCode[code] + " 列已經有）" }); continue; }
      seenCode[code] = n;
      sb = dsImpSplitBrand(cellOf(r, "brand"), cellOf(r, "zh"));
      fm = dsImpForm(cellOf(r, "form"));
      lc = dsImpLoc(cellOf(r, "loc"), known);
      refRaw = dsImpNorm(cellOf(r, "ref"));
      refOk = !refRaw || refRaw === "清空" || /^https?:\/\/\S+$/i.test(refRaw);
      vals = { brand: sb.brand, loc: lc.v, form: fm.v, zh: sb.zh, gen: dsImpNorm(cellOf(r, "gen")), ref: refOk ? refRaw.substring(0, 500) : "", nk: dsImpNorm(cellOf(r, "nk")), nm: dsImpNorm(cellOf(r, "nm")) };
      flags = [];
      chg = [];
      rawOf = { brand: dsImpNorm(cellOf(r, "brand")), loc: dsImpNorm(cellOf(r, "loc")), form: dsImpNorm(cellOf(r, "form")), zh: dsImpNorm(cellOf(r, "zh")) };
      if (sb.split) flags.push("商品名和中文名擠在同一格，我拆成兩格，請看對不對");
      if (fm.unknown) flags.push("劑型「" + fm.v + "」不在 9 種裡（錠劑、膠囊、口服液、注射劑、藥膏、眼藥水、栓劑、貼片、粉劑）");
      else if (!fm.sure) flags.push("劑型「" + rawOf.form + "」是自動對成「" + fm.v + "」的");
      if (lc.isNew) flags.push("位置「" + lc.v + "」在工作表1 裡沒看過（新位置？）");
      if (!refOk) { problems.push({ n: n, code: code, why: "CODE " + code + " 的參考網站「" + refRaw.substring(0, 30) + "」不像網址（要 http:// 或 https:// 開頭）；改成網址或把那一格清掉再匯入" }); continue; }
      cur = ix.rows[code] && dsRowNo(ix, code) > 0 ? ix.rows[code] : null;
      if (!cur) {
        if (!vals.brand && !vals.zh) { problems.push({ n: n, code: code, why: "CODE " + code + " 是新的，但商品名和中文名都是空的" }); continue; }
        fixes = [];
        for (k in rawOf) if (rawOf[k] && rawOf[k] !== vals[k] && !(k === "brand" && sb.split)) fixes.push([k, rawOf[k], vals[k]]);
        rows.push({ n: n, kind: "add", code: code, v: vals, fx: fixes, w: flags });
        continue;
      }
      curMap = { brand: dsImpNorm(cur.b), loc: dsImpNorm(cur.loc), form: dsImpNorm(cur.f), zh: dsImpNorm(cur.z), gen: dsImpNorm(cur.g), ref: dsImpNorm(dsImpCurRef(cur.ref)), nk: dsImpNorm(cur.nk), nm: dsImpNorm(cur.nm) };
      for (k in vals) {
        want = vals[k];
        if (!want) continue;
        to = want === "清空" ? "" : want;
        if (to === curMap[k]) continue;
        chg.push([k, curMap[k], to, rawOf[k] !== undefined && rawOf[k] !== want ? "自動整理" : ""]);
      }
      if (chg.length === 0) { nochange.push({ n: n, code: code }); continue; }
      rows.push({ n: n, kind: "upd", code: code, v: vals, cur: curMap, chg: chg, w: flags });
    }
    return { map: m, rows: rows, problems: problems, nochange: nochange, total: total };
  }
  /* 沒變的列從「待匯入」刪掉（由下往上刪，列號才不會跑掉）；有問題的列塗紅底、CODE 那一格加註解 */
  function dsImpDeleteRows(S, ns) {
    var sorted = ns.slice().sort(function(a, b) { return b - a; }), i;
    for (i = 0; i < sorted.length; i++) if (sorted[i] >= 1 && sorted[i] <= S.pend.rows.length) S.pend.rows.splice(sorted[i] - 1, 1);
  }
  function dsImpShift(st, deletedN) { var i; for (i = 0; i < st.rows.length; i++) if (st.rows[i].n > deletedN) st.rows[i].n--; }
  function dsImpMark(S, problems) {
    var i, row;
    for (i = 0; i < problems.length; i++) {
      row = S.pend.rows[problems[i].n - 1];
      if (row) row.bad = problems[i].why;
    }
  }

  /* ───── ② 總覽卡、逐筆確認卡、輸入框上面的小按鈕（08 的 _impOverviewBubble_、_impRowBubble_、_impRowQuick_）───── */
  function dsImp400(s) { return (s === null || s === undefined || s === "" ? "-" : String(s)).substring(0, 400); }
  function dsImpOverviewCard(st, read, addN, updN) {
    var warns = [], i;
    for (i = 0; i < read.problems.length && i < 4; i++) warns.push(dsImp400("第 " + read.problems[i].n + " 列　" + read.problems[i].why));
    return impOverview({ b: st.b, total: read.total, add: addN, upd: updN, nc: st.nc, pb: st.pb, how: read.map.how, map: dsImp400(dsImpMapText(read.map)), warns: warns, more: read.problems.length > 4 ? read.problems.length - 4 : 0, cut: st.cut, count: st.rows.length, live: 1 });
  }
  function dsImpRowCard(st) {
    var row = st.rows[st.i], isAdd = row.kind === "add", kv = [], keys = ["brand", "zh", "gen", "loc", "form", "ref", "nk", "nm"], i, j, k, v, fixed, c, cur = "";
    if (isAdd) {
      for (i = 0; i < keys.length; i++) {
        k = keys[i]; v = row.v[k];
        if (!v) continue;
        fixed = null;
        for (j = 0; j < (row.fx || []).length; j++) if (row.fx[j][0] === k) fixed = row.fx[j];
        kv.push([dsImpFieldByKey(k).label, fixed ? dsImp400(fixed[1]) : "", dsImp400(v), fixed ? 1 : 0]);
      }
    } else {
      cur = dsImp400((row.cur.brand || row.cur.zh || "") + "　" + (row.cur.loc || "") + "　" + (row.cur.form || ""));
      for (i = 0; i < row.chg.length; i++) { c = row.chg[i]; kv.push([dsImpFieldByKey(c[0]).label, dsImp400(c[1] || "（空的）"), dsImp400(c[2] || "（清空）"), 1]); }
    }
    return impRow({ i: st.i + 1, total: st.rows.length, add: isAdd ? 1 : 0, code: row.code, title: (row.v.brand || row.v.zh || "").substring(0, 396 - row.code.length), cur: cur, kv: kv, warns: (row.w || []).slice(0, 4).map(dsImp400), live: 1 });
  }
  function dsImpRowQuick(st) {
    var row = st.rows[st.i], q = [{ l: "對", m: "對" }], keys, i, f;
    keys = row.kind === "add" ? ["brand", "zh", "loc", "form", "gen", "ref"] : row.chg.map(function(c) { return c[0]; });
    for (i = 0; i < keys.length && q.length < 9; i++) {
      f = dsImpFieldByKey(keys[i]);
      if (f) q.push({ l: "改 " + f.label, m: "改 " + f.label });
    }
    q.push({ l: "跳過", m: "跳過" });
    q.push({ l: "先停", m: "先停" });
    return q;
  }
  function dsImpShowRow(S, X, st, prefix) {
    var ms = [];
    if (prefix) ms.push(bot(String(prefix).substring(0, 4900)));
    ms.push(dsImpRowCard(st));
    dsSend(X, ms, dsImpRowQuick(st));
  }

  /* ───── ③ 開始：打「匯入」（08 的 _impStart_）───── */
  function dsImpStart(S, X) {
    var read = dsImpRead(S), rows, cut = 0, ncN, shiftOf, i, addN = 0, updN = 0, st, t, marked = 0;
    X.sheet = "沒動";
    dsT(X, 1, "是「匯入」→ 把「待匯入」分頁整頁讀進來");
    if (read.err === "empty") {
      dsT(X, 0, "分頁裡有資料嗎？沒有，是空的");
      dsSend(X, [bot("📥 「待匯入」分頁是空的。\n\n把要新增或修改的藥貼進去（欄位順序隨意，第一列可以是欄位名稱），再打「匯入」。\n已經幫您建好分頁了，打開試算表就看得到。")]);
      X.reply = "「分頁是空的」＋貼資料的說明";
      return true;
    }
    if (read.err === "nomap") {
      dsT(X, 0, "第一列看得出欄位名稱嗎？不行；看每一欄的內容猜呢？也猜不出哪一欄是 CODE、哪一欄是藥名");
      dsSend(X, [bot("📥 讀到了，但對不出哪一欄是什麼 😥\n\n請在「待匯入」第一列填欄位名稱，例如：\n" + DS_IMP_HEAD.slice(0, 6).join("、") + "\n（順序隨意；公告類別、公告補充可有可無）\n\n填好再打「匯入」。什麼都還沒寫入。")]);
      X.reply = "「對不出哪一欄」＋請你補第一列欄位名稱";
      return true;
    }
    dsT(X, 1, read.map.hasHeader ? "第一列是欄位名稱 → 照名稱對欄（" + dsImpMapText(read.map) + "）" : "第一列不像欄位名稱 → 看每一欄的內容猜是哪一欄（" + dsImpMapText(read.map) + "）");
    dsT(X, 1, "一列一列檢查：CODE 對不對、工作表1 有沒有這支藥、哪幾格跟現在不一樣 → 新增 " + dsImpCount(read.rows, "add") + "、修改 " + dsImpCount(read.rows, "upd") + "、沒變 " + read.nochange.length + "、有問題 " + read.problems.length);
    dsImpMark(S, read.problems);
    marked = read.problems.length;
    rows = read.rows;
    if (rows.length > DS_IMP_MAX) { cut = rows.length - DS_IMP_MAX; rows = rows.slice(0, DS_IMP_MAX); }
    ncN = read.nochange.map(function(x) { return x.n; });
    if (ncN.length > 0) {
      dsImpDeleteRows(S, ncN);
      shiftOf = function(n) { var shift = 0, j; for (j = 0; j < ncN.length; j++) if (ncN[j] < n) shift++; return shift; };
      for (i = 0; i < rows.length; i++) rows[i].n -= shiftOf(rows[i].n);
      for (i = 0; i < read.problems.length; i++) read.problems[i].n -= shiftOf(read.problems[i].n);
    }
    for (i = 0; i < rows.length; i++) if (rows[i].kind === "add") addN++; else updN++;
    st = { b: dsImpBatchId(S), stage: "overview", rows: rows, i: 0, ok: 0, okAdd: 0, okUpd: 0, cells: 0, sk: [], u: DS_IMP_USER, codeCol: read.map.map.code, nc: read.nochange.length, pb: read.problems.length, cut: cut };
    while (JSON.stringify(st).length > 9e4 && st.rows.length > 20) { st.cut += 20; st.rows = st.rows.slice(0, st.rows.length - 20); }
    X.sheet = "「待匯入」分頁：清掉 " + read.nochange.length + " 列（沒變）、塗紅底 " + marked + " 列（有問題）；工作表1 沒動";
    dsT(X, 1, "沒變的 " + read.nochange.length + " 列直接從「待匯入」清掉；有問題的 " + marked + " 列塗成紅底，CODE 那一格加註解寫原因");
    if (st.rows.length === 0) {
      S.imp = null;
      t = "📥 讀了「待匯入」" + read.total + " 列：沒有要寫的東西。\n";
      if (read.nochange.length) t += "・沒變 " + read.nochange.length + " 筆（已從待匯入清掉）\n";
      if (read.problems.length) {
        t += "・有問題 " + read.problems.length + " 筆（留在待匯入，紅底，CODE格有註解說原因）：\n";
        for (i = 0; i < read.problems.length && i < 8; i++) t += "　第 " + read.problems[i].n + " 列　" + read.problems[i].why + "\n";
      }
      dsT(X, 0, "有要新增或修改的嗎？沒有 → 不用逐筆確認");
      dsSend(X, [bot(t.trim())]);
      X.reply = "「沒有要寫的東西」＋沒變、有問題各幾筆";
      return true;
    }
    S.imp = st;
    dsT(X, 1, "還沒寫任何東西 → 先送「匯入總覽」，等你按「開始逐筆確認」");
    dsSend(X, [dsImpOverviewCard(st, read, addN, updN)], [{ l: "開始逐筆確認", m: "開始逐筆確認" }, { l: "取消", m: "取消匯入" }]);
    X.reply = "匯入總覽卡（四格數字、怎麼對欄、有問題的列）＋輸入框上面「開始逐筆確認」「取消」";
    return true;
  }
  function dsImpCount(rows, kind) { var n = 0, i; for (i = 0; i < rows.length; i++) if (rows[i].kind === kind) n++; return n; }

  /* ───── ④ 按「對」：真的寫進工作表1、2，記進「匯入紀錄」（08 的 _impApply_、_impRemoveStagingRow_）───── */
  function dsImpSafe(v) { return v === null || v === undefined ? "" : String(v); }
  function dsImpApply(S, X, st, row) {
    var prev = S.idxSnap, res;
    if (prev === null || prev === undefined) S.idxSnap = dsSnap(S);   /* 快取是熱的、跟試算表一樣新 → 先拍下來：這一批直接寫的格子，索引裡要等快取重建才看得到 */
    res = dsImpApply0(S, X, st, row);
    if (res.err) S.idxSnap = prev;
    return res;
  }
  function dsImpApply0(S, X, st, row) {
    var when = dsClock(S), logs = [], cells = 0, i, j, c, f, k, want, before, r, extras = [["nk", "公告類別"], ["nm", "公告補充"]], v = row.v;
    if (row.kind === "add") {
      if (dsRowNo(S, row.code) > 0) return { err: "CODE " + row.code + " 剛才已經被建進去了（可能別人同時在加）。這一筆跳過。" };
      r = dsRowOf(dsImpSafe(v.brand), dsImpSafe(v.zh), dsImpSafe(v.gen), dsImpSafe(v.form), "", "", dsImpSafe(v.loc), "");
      r.ref = dsImpSafe(v.ref);
      S.rows[row.code] = r;
      S.order.push(row.code);
      cells += 6;
      logs.push({ act: "新增", code: row.code, field: "整列", oldV: "", newV: (v.brand || "") + "｜" + (v.zh || "") + "｜" + (v.loc || "") + "｜" + (v.form || "") + "｜" + (v.gen || "") + (v.ref ? "｜" + v.ref : ""), how: "對" });
    } else {
      if (!S.rows[row.code] || dsRowNo(S, row.code) < 0) return { err: "工作表1 裡找不到 " + row.code + " 了（可能剛被刪掉）。這一筆跳過。" };
      for (i = 0; i < row.chg.length; i++) {
        c = row.chg[i];
        f = dsImpFieldByKey(c[0]);
        if (!f || f.col < 0) continue;
        dsEfPut(S, row.code, c[0], dsImpSafe(c[2]));
        cells++;
        logs.push({ act: "修改", code: row.code, field: f.label, oldV: c[1], newV: c[2], how: c[3] === "手" ? "改" : "對" });
      }
    }
    for (i = 0; i < extras.length; i++) {
      k = extras[i][0];
      want = null;
      if (row.kind === "add") { if (v[k]) want = v[k]; }
      else for (j = 0; j < row.chg.length; j++) if (row.chg[j][0] === k) want = row.chg[j][2];
      if (want === null) continue;
      before = dsEfNow(S, row.code, k);
      dsEfPut(S, row.code, k, dsImpSafe(want));
      dsCacheClear(S);   /* 公告類別、公告補充走 _efWrite_，寫完就 clearDrugCache（上面直接寫格子的不會） */
      cells++;
      logs.push({ act: "修改", code: row.code, field: extras[i][1], oldV: before, newV: want, how: "對" });
    }
    for (i = 0; i < logs.length; i++) S.log.push({ b: st.b, at: when, u: st.u, act: logs[i].act, code: logs[i].code, field: logs[i].field, oldV: logs[i].oldV, newV: logs[i].newV, how: logs[i].how });
    return { ok: true, cells: cells };
  }
  function dsImpRemoveStaging(S, st, row) {
    var rows = S.pend.rows, n = row.n, codeCol = st.codeCol !== undefined ? st.codeCol : -1, last, rr;
    function codeAt(x) {
      var vals, c;
      if (x < 1 || x > dsPendLast(S)) return "";
      vals = rows[x - 1].c;
      if (codeCol >= 0) return dsImpCode(vals[codeCol]);
      for (c = 0; c < vals.length; c++) if (dsImpCode(vals[c]) === row.code) return row.code;
      return "";
    }
    if (codeAt(n) !== row.code) {
      n = -1;
      last = dsPendLast(S);
      for (rr = 1; rr <= last; rr++) if (codeAt(rr) === row.code) { n = rr; break; }
    }
    if (n < 0) return;
    rows.splice(n - 1, 1);
    dsImpShift(st, n);
  }

  /* ───── ⑤ 做完了／先停：完工報告（08 的 _impSummary_、_impFinish_、_impNext_）───── */
  function dsImpSummary(st, stopped) {
    var t = (stopped ? "⏹ 先停在第 " + (st.i + 1) + " 筆。" : "🏁 批次 #" + st.b + " 完成。") + "\n";
    t += "　寫入 " + st.ok + " 筆（新增 " + st.okAdd + "、修改 " + st.okUpd + "，共 " + st.cells + " 格）\n";
    if (st.sk.length) t += "　跳過 " + st.sk.length + " 筆（留在待匯入）：" + st.sk.slice(0, 8).join("、") + (st.sk.length > 8 ? "…" : "") + "\n";
    if (stopped) t += "　還沒看的 " + (st.rows.length - st.i) + " 筆留在待匯入，之後再打「匯入」接著。\n";
    if (st.nc) t += "　沒變 " + st.nc + " 筆（已從待匯入清掉）\n";
    if (st.pb) t += "　有問題 " + st.pb + " 筆（待匯入裡紅底，CODE格的註解有原因）\n";
    if (st.cut) t += "　這批太大，還有 " + st.cut + " 筆留在待匯入，再打一次「匯入」。\n";
    if (st.ok) t += "　快取已更新，藥師現在查就是新資料。\n\n紀錄在「匯入紀錄」；7 天內打「復原」可以整批或單筆還原。";
    return t.trim();
  }
  function dsImpFinish(S, X, st, stopped) {
    var q = [];
    S.imp = null;
    if (st.ok) dsCacheWarm(S);   /* 08 的 _impFinish_：寫了東西，clearDrugCache＋warmCache，索引重建 */
    if (st.last) q.push({ l: "查一下 " + st.last, m: st.last });
    if (st.ok) q.push({ l: "復原這一批", m: "復原 #" + st.b });
    q.push({ l: "健檢", m: "健檢" });
    dsSend(X, [bot(dsImpSummary(st, stopped))], q);
    dsT(X, 1, stopped ? "按了「先停」→ 寫了的算數，沒看的、跳過的都留在「待匯入」" : "最後一筆處理完了 → 回完工報告，這一批結束");
    if (st.ok) dsT(X, 1, "寫進去的每一格都記在「匯入紀錄」（批次 #" + st.b + "），7 天內可以整批或單筆復原；快取更新，藥師下一句查就是新資料");
    X.reply = "完工報告（寫了幾筆、跳過幾筆…）＋輸入框上面" + (st.last ? "「查一下 " + st.last + "」" : "") + (st.ok ? "「復原這一批」" : "") + "「健檢」";
  }
  function dsImpNext(S, X, st, prefix) {
    if (st.i >= st.rows.length) { dsImpFinish(S, X, st, false); return; }
    st.stage = "confirm";
    dsImpShowRow(S, X, st, prefix);
  }
  function dsImpDescribe(row) {
    var parts = [], i;
    if (row.kind === "add") return "新增 " + row.code + "　" + (row.v.brand || row.v.zh || "");
    for (i = 0; i < row.chg.length; i++) parts.push(dsImpFieldByKey(row.chg[i][0]).label + " " + (row.chg[i][1] || "空") + " → " + (row.chg[i][2] || "空"));
    return row.code + "　" + parts.join("、");
  }

  /* ───── ⑥ 改一格（08 的 _impEditAsk_、_impEditApply_）───── */
  function dsImpEditAsk(S, X, st, field) {
    var row = st.rows[st.i], now = "", q = [], i, locs, n;
    st.edit = field.k;
    st.stage = "edit";
    if (row.kind === "add") now = row.v[field.k] || "";
    else {
      now = row.cur[field.k] || "";
      for (i = 0; i < row.chg.length; i++) if (row.chg[i][0] === field.k) now = row.chg[i][2];
    }
    if (field.k === "form") for (i = 0; i < DS_FORMS.length; i++) q.push({ l: DS_FORMS[i], m: DS_FORMS[i] });
    if (field.k === "loc") { locs = dsCommonLocs(S, 6); for (i = 0; i < locs.length; i++) q.push({ l: locs[i], m: locs[i] }); }
    if (field.k === "nk") for (n in DS_NK) q.push({ l: n + " " + DS_NK[n], m: n + " " + DS_NK[n] });
    q.push({ l: "清空這一格", m: "清空" });
    q.push({ l: "不改了", m: "不改了" });
    dsSend(X, [bot("✏️ 第 " + (st.i + 1) + " 筆 " + row.code + "　" + field.label + "\n現在是：" + (now || "（空的）") + "\n\n請直接打新的內容（打「清空」就清空）。")], q);
    dsT(X, 1, "點了「改 " + field.label + "」→ 記住現在改這一格（接下來打的字都算新內容）");
    X.sheet = "沒動（還沒打新內容）";
    X.reply = "「現在是：…」＋輸入框上面" + (field.k === "form" ? "9 種劑型、" : field.k === "loc" ? "常用位置、" : field.k === "nk" ? "5 種公告、" : "") + "「清空這一格」「不改了」";
  }
  function dsImpEditApply(S, X, st, text) {
    var row = st.rows[st.i], k = st.edit, f, val, before, fm, m;
    st.edit = null;
    st.stage = "confirm";
    f = dsImpFieldByKey(k);
    val = dsImpNorm(text);
    if (val === "清空") val = "";
    if (k === "form" && val) { fm = dsImpForm(val); val = fm.v; }
    if (k === "nk" && val) { m = val.match(/^([1-5])/); if (m) val = m[1]; }
    if (row.kind === "add") {
      row.v[k] = val;
      row.fx = (row.fx || []).filter(function(x) { return x[0] !== k; });
    } else {
      before = row.cur[k] || "";
      row.chg = row.chg.filter(function(c) { return c[0] !== k; });
      if (val !== before) row.chg.push([k, before, val, "手"]);
      if (row.chg.length === 0) {
        st.sk.push(row.code + "（改回原樣）");
        st.i++;
        dsT(X, 1, "你打的跟工作表1 現在的一樣 → 這一筆不用寫，先留在「待匯入」");
        X.sheet = "沒動";
        dsImpNext(S, X, st, "這一筆改完跟工作表1 一樣了，不用寫，先留在待匯入。");
        X.reply = "提醒＋下一筆的卡片（或完工報告）";
        return;
      }
    }
    row.w = (row.w || []).filter(function(w) { return w.indexOf(f.label) < 0 && w.indexOf("擠在同一格") < 0; });
    dsT(X, 1, "把這一筆的「" + f.label + "」改成你打的（" + (val || "清空") + "）；還沒寫進工作表1，要按「對」才寫");
    X.sheet = "沒動（要按「對」才寫）";
    dsImpShowRow(S, X, st, "已改 " + f.label + " → " + (val || "（空的）") + "，請再看一次：");
    X.reply = "「已改…請再看一次」＋這一筆更新後的卡片（你自己改的不再標成整理過）";
  }

  /* ───── ⑦ 匯入進行中，每一句話怎麼分派（08 的 _impFlow_ 後半）：st＝進行中的匯入狀態；回 true＝這句處理掉了 ───── */
  /* 正在「改一格」（等新內容）：除了「不改了」「取消」，打什麼都算新內容（連「匯入」「復原」都是；跟真的一樣，這一關在最前面） */
  function dsImpEditStage(S, X, st, t, flat) {
    if (/^(不改了|取消)$/.test(flat)) {
      st.edit = null;
      st.stage = "confirm";
      dsT(X, 1, "是「" + flat + "」→ 這一格不改了，回到這一筆");
      X.sheet = "沒動";
      dsImpShowRow(S, X, st, "沒改。");
      X.reply = "「沒改。」＋這一筆的卡片";
      return true;
    }
    dsImpEditApply(S, X, st, t);
    return true;
  }
  /* 總覽、逐筆確認（取消、開始逐筆確認、對、跳過、先停、改一格…）；其他情況回 false */
  function dsImpStep(S, X, st, t, flat) {
    var row, res, prefix, q, em, f, i;
    if (/^取消(匯入)?$/.test(flat)) {
      if (st.stage === "confirm" && st.ok) {
        dsImpFinish(S, X, st, true);
        X.sheet = "沒動";
      } else {
        S.imp = null;
        dsSend(X, [bot("已取消，什麼都沒寫。待匯入的資料都還在。")]);
        dsT(X, 1, "是「取消」→ 把這一批丟掉，什麼都沒寫");
        X.sheet = "沒動"; X.reply = "「已取消，什麼都沒寫」";
      }
      return true;
    }
    if (st.stage === "overview") {
      if (/^(開始逐筆確認|開始|好)$/.test(flat)) {
        st.i = 0;
        dsT(X, 1, "是「開始逐筆確認」→ 給你看第 1 筆（每一筆都要你按「對」才寫）");
        X.sheet = "沒動";
        dsImpNext(S, X, st, null);
        X.reply = "第 1 筆的確認卡＋這一筆能做的小按鈕";
        return true;
      }
      dsSend(X, [bot("現在在匯入總覽。按「開始逐筆確認」開始，或「取消匯入」。")]);
      dsT(X, 0, "現在在匯入總覽，這句不是「開始逐筆確認」也不是「取消」→ 提醒你");
      X.sheet = "沒動"; X.reply = "一句提醒（現在在匯入總覽）";
      return true;
    }
    if (st.stage === "confirm") {
      row = st.rows[st.i];
      if (!row) { dsImpFinish(S, X, st, false); return true; }
      if (/^(對|對寫入|對，寫入|寫入|ok|OK|yes)$/.test(flat)) {
        res = dsImpApply(S, X, st, row);
        if (res.err) {
          st.sk.push(row.code);
          prefix = "⚠️ 第 " + (st.i + 1) + " 筆 " + row.code + " 沒寫：" + res.err;
          dsT(X, 0, "要寫進工作表1：不行（" + res.err + "）");
          X.sheet = "沒動";
        } else {
          st.ok++;
          if (row.kind === "add") st.okAdd++; else st.okUpd++;
          st.cells += res.cells;
          st.last = row.code;
          dsImpRemoveStaging(S, st, row);
          prefix = "✅ 第 " + (st.i + 1) + "／" + st.rows.length + " 筆 " + dsImpDescribe(row) + "　已寫入";
          dsT(X, 1, "是「對」→ " + (row.kind === "add" ? "把 " + row.code + " 加到工作表1 最後面（" + res.cells + " 格）" : "把 " + row.code + " 要改的格子寫進工作表1（" + res.cells + " 格）"));
          dsT(X, 1, "記進「匯入紀錄」（批次 #" + st.b + "），這一列從「待匯入」拿掉");
          X.wrote = 1;
          X.sheet = (row.kind === "add" ? "工作表1 新增 1 列（" + row.code + "）" : "工作表1 改 " + res.cells + " 格（" + row.code + "）") + "；「待匯入」拿掉那一列";
        }
        st.i++;
        dsImpNext(S, X, st, prefix);
        X.reply = st.stage === "confirm" && S.imp ? "「✅ 已寫入」那句＋下一筆的卡片" : "完工報告（最後一筆按「對」，不再另外回「已寫入」）";
        return true;
      }
      if (/^跳過/.test(flat)) {
        st.sk.push(row.code);
        st.i++;
        dsT(X, 1, "是「跳過」→ 這一筆原封不動留在「待匯入」，下次打「匯入」會再出現");
        X.sheet = "沒動";
        dsImpNext(S, X, st, "⏭ 第 " + st.i + " 筆 " + row.code + " 跳過，留在待匯入。");
        X.reply = "「跳過，留在待匯入」那句＋下一筆的卡片（或完工報告）";
        return true;
      }
      if (/^(先停|停|暫停)$/.test(flat)) {
        dsImpFinish(S, X, st, true);
        X.sheet = "沒動（寫了的已經寫了，其餘留在「待匯入」）";
        return true;
      }
      if (/^改一格$/.test(flat)) {
        q = dsImpRowQuick(st).filter(function(x) { return x.m.indexOf("改 ") === 0; });
        q.push({ l: "不改了", m: "不改了" });
        dsSend(X, [bot("要改哪一格？點下面的按鈕。")], q);
        dsT(X, 1, "是「改一格」→ 列出這一筆能改的欄位");
        X.sheet = "沒動"; X.reply = "「要改哪一格？」＋輸入框上面每一個能改的欄位";
        return true;
      }
      em = t.match(/^改\s*(\S+)$/);
      if (em) {
        f = dsImpFieldByLabel(em[1]);
        if (!f || f.k === "code" || !dsImpFieldByKey(f.k)) {
          q = [];
          for (i = 1; i < DS_IMP_FIELDS.length; i++) q.push(DS_IMP_FIELDS[i].label);
          dsSend(X, [bot("認不出「" + em[1] + "」這一欄。可以改：" + q.join("、"))]);
          dsT(X, 0, "「" + em[1] + "」是匯入的哪一欄？認不出來");
          X.sheet = "沒動"; X.reply = "「認不出…這一欄」＋能改的欄位";
          return true;
        }
        dsImpEditAsk(S, X, st, f);
        return true;
      }
      if (/^不改了$/.test(flat)) {
        dsImpShowRow(S, X, st, null);
        dsT(X, 1, "是「不改了」→ 再給你看這一筆");
        X.sheet = "沒動"; X.reply = "這一筆的卡片";
        return true;
      }
      dsImpShowRow(S, X, st, "正在逐筆確認中（打「先停」可以先離開，其餘會留在待匯入）：");
      dsT(X, 0, "匯入進行中，這句不是「對」「跳過」「先停」「改…」→ 提醒你，再給你看這一筆");
      X.sheet = "沒動"; X.reply = "「正在逐筆確認中」＋這一筆的卡片";
      return true;
    }
    return false;
  }
  /*/SIMDEV*/

  /* ───────── 開發者的維護指令（第 17 批；第 4～6 課「日常維護」「進階指令」「清單校對」的練習聊天室）─────────
     這一個檔放「指令怎麼分」和最常用的幾組：🔧 開發者選單、全院開關（新卡片、語音、OCR、多筆查詢、平面圖設定）、🩺 體檢、⏱ 速度、⏰ 觸發器、清快取。
     照片（同步、換照片）、縮寫／平面圖／開發者管理、清單校對各有自己的檔（_learn_dev_sim_photo.js、_learn_dev_sim_adv.js、_learn_dev_sim_lst.js）。
     這裡每一句機器人說的話，都照 08_匯入.gs 的 _impDevCmd_（和它用到的小函式）拼字串的那一句寫；
     「數字會變的」（版本、各段花幾秒、最近幾次查詢）是編的固定一份「一切正常」的樣子，tools/learn_dev_sim_test.js 對這幾則只比第一行和下面的小按鈕。
     開發者指令的回覆最後都多一行「⏱ 這一句花了幾秒」（08 的 _devReply_）；沒有帶小按鈕的，下面接「標準那排」（練習聊天室只有「🔧 開發者」那一顆）。 */
  /*SIMDEV*/
  var DSO_SPEED_CHIPS = [["⏱ 速度", "速度"], ["⌨️ 文字速度", "文字速度"], ["📷 照片速度", "照片速度"], ["🎤 語音速度", "語音速度"], ["🔬 速度 詳細", "速度 詳細"]];
  var DSO_CHK_CHIPS = [["📦 版本更新＋清快取", "版本更新＋清快取"], ["🩺 開始體檢", "健檢"]];
  var DSO_SPEED_EXIT = "🚪 已離開速度。\n要再看：按「🔧 開發者」→「⏱ 速度」，或直接打「速度」。";
  var DSO_CHK_EXIT = "🚪 已離開體檢。\n要再用：按「🔧 開發者」→「🩺 體檢」，或直接打「體檢」。";
  var DSO_CHK_MENU = "🩺 體檢　要做哪一個？\n・📦 版本更新＋清快取：先清快取（清掉馬上重建），再列 LINE 四個檔、網頁專案兩個檔的版本對不對，和 GitHub 網頁打不打得開（不測 AI，換完程式按一下就知道有沒有貼齊）；第一次會把程式自己寫的搬到使用者屬性\n・🩺 開始體檢：上面那些全部＋所有項目檢查一次（約 10～20 秒）";
  /* 一排小按鈕（08 的 _groupQuick_）：這一顆自己（here）不放，最後一顆「🚪 退出」 */
  function dsoGroupQ(chips, exitText, here) {
    var q = [], i;
    for (i = 0; i < chips.length; i++) if (chips[i][1] !== here) q.push({ l: chips[i][0], m: chips[i][1] });
    q.push({ l: "🚪 退出", m: exitText });
    return q;
  }
  function dsoTail(a, b) { return "\n\n⏱ " + a + " 秒（＋程式外 " + b + " 秒）"; }
  /* 開發者指令的一則回覆（08 的 _devReply_）：字＋最後那一行「⏱」，小按鈕 q（沒給＝標準那排） */
  function dsoRep(X, text, q, a, b) { dsSend(X, [bot(String(text).substring(0, 4800) + dsoTail(a, b))], q || null); }
  /* 深色框「背後發生的事」：trail 幾句（都是「做到了」）、試算表動了沒有、機器人回了什麼 */
  function dsoNet(X, trail, sheet, reply) {
    var i;
    for (i = 0; i < trail.length; i++) dsT(X, 1, trail[i]);
    X.sheet = sheet;
    X.reply = reply;
  }
  function dsoNew(rows, order) {
    /* 全院開關的現在狀態（跟真的一開始一樣：新卡片、OCR接手、多筆查詢、平面圖設定、語音嚴格都是開的；語音V2 是關的）；drive＝練習用的雲端照片資料夾（_learn_dev_sim_photo.js）；
       maps＝平面圖設定（CODE → 櫃名／公藥）、dev＝開發者名單和邀請碼（_learn_dev_sim_adv.js）、oth＝這一課要不要出現「假裝另一個人」的練習專用按鈕（畫面在 reset 時設）、
       lst＝清單校對的狀態（校對模式開著嗎、待審清單、網頁現在的樣子；_learn_dev_sim_lst.js、_learn_dev_sim_lw.js）、lstUi＝這一課要不要出現「傳清單照片」「網頁」（畫面在 reset 時設）、
       web＝開發者網頁那一課的狀態（鑰匙、綁定、代號、四台裝置的瀏覽器；_learn_dev_sim_web.js）、webUi＝這一課要不要出現網頁面板（畫面在 reset 時設；沒設的課，打網頁的指令只說一聲在哪一課） */
    return { card: 1, ocr: 1, v2: 0, strict: 1, multi: 1, mapfix: 1, drive: dspDriveNew(rows, order), maps: {}, dev: dsaDevNew(), oth: 0, lst: dslNew(), lstUi: 0, web: dwbNew(), webUi: 0 };
  }

  /* ───── 🔧 開發者（輸入框上面那一顆）：九顆按鈕的選單 ───── */
  function dsoMenu(S, X) {
    var o = S.ops;
    dsSend(X, [devMenuCard(!!o.ocr, !!o.card, !!o.v2, true)]);
    dsoNet(X, ["是「開發者」→ 回一張選單卡片，九顆按鈕；按一顆＝幫你打那個字", "「OCR接手」「新卡片」「語音V2」那三顆後面的字，是這三個開關現在的狀態（開著寫 ✅全院，關著寫（已關））"], "沒動（只是看選單）", "🔧 開發者功能的選單卡片（藥師看不到）");
    return true;
  }

  /* ───── 全院開關（打一次開、再打一次換回去；立刻生效，不用重新部署）───── */
  var DSO_FLAGS = [
    { re: /^(語音嚴格|語音寬鬆)/, key: "strict", lab: "語音嚴格／寬鬆", tm: ["0.7", "0.2"] },
    { re: /^(多筆查詢|單筆查詢)/, key: "multi", lab: "多筆查詢／單筆查詢", tm: ["0.8", "0.2"] },
    { re: /^(語音V2|語音v2)/i, key: "v2", lab: "語音V2", tm: ["0.7", "0.2"] },
    { re: /^(新卡片|舊卡片)/, key: "card", lab: "新卡片／舊卡片", tm: ["0.7", "0.2"] },
    { re: /^(OCR辨識|ocr辨識|OCR接手|ocr接手)/i, key: "ocr", lab: "OCR接手", tm: ["0.7", "0.2"] }
  ];
  var DSO_TXT = {
    strictOn: "🎤 語音改成**嚴格**（全院）\n\n聽到的字要跟院內清單**完全一樣**才出卡片，\n差一個同音字就列候選讓藥師點（＝ v10.14.0 訂的規矩）。\n\n打「語音寬鬆」換回去。",
    strictOff: "🎤 語音改成**寬鬆**（全院）\n\n容錯率跟**打字查詢一模一樣**：完全比對沒中，\n就用最接近的字再比一次（酷魯化 → 庫魯化）。\n\n・卡片上方會註明「沒有完全一樣的，改用最接近的字比對」\n・⚠️ 這會蓋過 v10.14.0 的「聽錯不自動改字」\n・⚠️ 「字典再聽」那一段會幾乎跑不到（答案先被找出來了）\n\n打「語音嚴格」換回去。",
    multiOn: "🔎 **多筆查詢**（全院，含藥師）\n\n一次貼多個 CODE 就一次出多張卡，\n換行、空格、逗號、頓號、句點、斜線都當分隔：\n\n　23670 25205 24936\n　23670.25205.24936\n　一行一個也可以（藥名也行）\n\n・一次最多 12 筆（LINE 輪播上限）\n・查不到的不會硬湊，會列在最上面那則\n・「aspirin 100」這種縮小範圍完全沒受影響\n\n打「單筆查詢」可以整院關掉。",
    multiOff: "🔎 改回**單筆查詢**（全院）\n\n貼多個 CODE 會回到原本的行為：空格＝縮小範圍，\n所以「23670 25205」會查無。\n\n打「多筆查詢」換回去。",
    v2On: "🎤 語音 V2：**全院開啟**（含藥師）\n\n⚠️ **還沒設 DEEPGRAM_API_KEY —— 所以現在跟原本一模一樣，一個字都不會變。**\n　要真的用 Deepgram：專案設定 → 指令碼屬性 → 加一列 DEEPGRAM_API_KEY\n\n打「語音V2 關」可以全院退回原本的。",
    v2Off: "🎤 語音 V2：**全院關閉**，所有人（含藥師）回到原本的 Gemini 聽寫。\n打「語音V2」再開回來。",
    cardOn: "🎴 **全院使用新版卡片**（含藥師），立刻生效。\nCODE 當大標、位置整條、平面圖嵌在卡片裡。\n打「舊卡片」可以整院退回原本那張。",
    cardOff: "🎴 **全院回到原本那張卡片**（含藥師），立刻生效。\n打「新卡片」換回新版。",
    ocrOn: "🔬 OCR 接手：**全院開啟**（含藥師），立刻生效。\n\n照片 → AI 看圖（順利就 2～5 秒，完全不碰 OCR）\n　└ AI 全部沒讀到 → 最後一步才用 OCR（約 5 秒）：看 OCR 抄到的字，確定的直接回；不確定的把字交給 AI 認（只給字，1～2 秒）\n　└ OCR 不跟 AI 一起送，也不因為 AI 慢就先改用（雲端硬碟沒有時間上限，實測 9～100 秒忽快忽慢）\n\n三道保險，OCR 拖不住藥師：\n・照片超過 2 MB 不用 OCR（雲端硬碟官方上限）\n・OCR 花了 15 秒以上、或出錯 → 冷卻 30 分鐘不用（「照片速度 重設」「照片型號 清塞車」可以馬上解除）\n・AI 已經用掉 10 秒以上就不再從頭跑 OCR\n\nOCR 怎麼判斷：包裝上的中文名、商品名、學名一段一段查，同一個品項被 2 個以上不同的名字對到＝就是它，只給這一張卡片；有劑量就用來挑含量。\n比對不出確定的：把 OCR 的字交給 AI 認出藥名再查（整張照片超過 12 秒就不試）；還是不行，AI 都沒讀到才列只對到一個名字的，請藥師核對。\nOCR 查到的，卡片上面會寫「AI 這次沒讀到，改用照片上的印刷字…」；字交給 AI 認出來的寫「AI 沒讀到照片，改用照片上的字認出：…」。\n手寫紙條 OCR 讀不太出來（手寫還是靠 AI）。OCR 用雲端硬碟，不花 AI 額度（字交給 AI 那一次算 1 次），暫存檔讀完就刪。\n\n打「OCR接手 關」全院關掉。",
    ocrOff: "🔬 OCR 接手：**全院關閉**（含藥師），立刻生效。\n照片回到只用 AI 看圖；AI 塞車時會等比較久。\n打「OCR接手」打開。",
    mapOn: function(n) { return "🗺 「修改 → 平面圖」的設定**全院生效**（含藥師）\n\n您在卡片上按「✏️ 修改 → 🗺 平面圖」設完，\n藥師下一則訊息就看得到，不用出版本。\n\n目前已設定 " + n + " 個品項。\n打「平面圖」看是哪些；打「平面圖設定 關」可以整院停用。"; },
    mapOff: "🗺 「修改 → 平面圖」的設定**全部停用**（全院）\n\n所有藥品都回到自動判斷（跟著小藥庫位置走）。\n您設過的內容沒有被刪掉，只是暫時不吃。\n\n打「平面圖設定 開」恢復。"
  };
  /* 一個開關：照打的字決定開還是關，記起來，回「現在是開還是關」那一段（08 的 _impDevCmd_ 裡 _flagSet_ 那幾段）*/
  function dsoFlag(S, X, f, flat) {
    var o = S.ops, on, text, name;
    if (f.key === "strict") { on = /^語音嚴格/.test(flat); text = on ? DSO_TXT.strictOn : DSO_TXT.strictOff; }
    else if (f.key === "multi") { on = !/^單筆查詢/.test(flat); text = on ? DSO_TXT.multiOn : DSO_TXT.multiOff; }
    else if (f.key === "v2") { on = !/關|停|off|舊/i.test(flat); text = on ? DSO_TXT.v2On : DSO_TXT.v2Off; }
    else if (f.key === "card") { on = !(/^舊卡片/.test(flat) || /關|停|off/i.test(flat)); text = on ? DSO_TXT.cardOn : DSO_TXT.cardOff; }
    else { on = !/關|停|off/i.test(flat); text = on ? DSO_TXT.ocrOn : DSO_TXT.ocrOff; }
    o[f.key] = on ? 1 : 0;
    name = f.key === "strict" ? (on ? "嚴格" : "寬鬆") : f.key === "multi" ? (on ? "多筆查詢" : "單筆查詢") : f.key === "card" ? (on ? "新卡片" : "舊卡片") : (on ? "開" : "關");
    dsoRep(X, text, null, f.tm[0], f.tm[1]);
    dsoNet(X, ["是開發者的全院開關指令「" + f.lab + "」→ 這一次是「" + name + "」", "把開關記起來（全院，含藥師；不用重新部署，藥師下一則訊息就照這個）"], "沒動（開關記在機器人的設定裡，不在試算表）", "一段說明：現在是" + (on ? "開" : "關") + "，最後一句教你怎麼換回去");
    if (f.key === "card") dsT(X, 0, "（練習聊天室的卡片長相不會跟著換；真的 LINE 的藥品卡片會馬上換成" + (on ? "新" : "舊") + "版）");
    return true;
  }
  function dsoMapSwitch(S, X, flat) {
    var o = S.ops, off = /關|停|off/i.test(flat), n = 0, k;
    for (k in (o.maps || {})) n++;
    o.mapfix = off ? 0 : 1;
    dsoRep(X, off ? DSO_TXT.mapOff : DSO_TXT.mapOn(n), null, "0.7", "0.2");
    dsoNet(X, ["是「平面圖設定」→ " + (off ? "整院停用「✏️ 修改 → 🗺 平面圖」設過的內容（不刪，只是暫時不吃）" : "整院啟用「✏️ 修改 → 🗺 平面圖」設的內容"), "把開關記起來（全院）"], "沒動（設過的平面圖也沒刪）", "一段說明：" + (off ? "全部停用" : "全院生效，目前已設定 " + n + " 個品項"));
    return true;
  }

  /* ───── 🩺 體檢、📦 版本更新＋清快取 ───── */
  function dsoChkMenu(S, X) {
    dsSend(X, [bot(DSO_CHK_MENU)], dsoGroupQ(DSO_CHK_CHIPS, "體檢 退出", "體檢"));
    dsoNet(X, ["是「體檢」→ 先問要做哪一個，下面換成一排小按鈕（版本更新＋清快取、開始體檢、退出）"], "沒動", "一段說明＋三顆小按鈕");
    return true;
  }
  function dsoVerUpd(S, X) {
    dsCacheWarm(S);
    dsoRep(X, "📦 版本更新＋清快取\n\n🧹 快取：全部清掉（索引＋10 格設定鏡射），索引重建中，設定會預熱。藥師下一句查詢就是新資料。\n\n" + VERTXT + "\n\n🗂 指令碼屬性（超過 50 個，專案設定就只能看、不能改）\nLINE：18 個 ✅\n網頁專案：14 個 ✅\n\n🕘 自動清快取：今天 06:00、09:00 清過（下一次 13 點）\n🔄 自動更新：這一版已經更新完了（09/15 09:05 自動做的，03 換新，2 秒，索引 28 筆，網頁專案 ✅）", dsoGroupQ(DSO_CHK_CHIPS, "體檢 退出", "版本更新＋清快取"), "2.6", "0.4");
    dsoNet(X, ["是「版本更新」→ 先把快取全部清掉、馬上重建（藥師下一句查詢就是新資料）", "再去看 LINE 四個檔、網頁專案兩個檔、GitHub 網頁的版本對不對（這裡編的都是一樣的）"], "沒動（清的是機器人的快取，不是試算表）", "版本表（哪一行後面有「←」就是那個檔沒貼到最新版）＋指令碼屬性＋自動清快取，下面一排小按鈕");
    return true;
  }
  function dsoHealth(S, X) {
    dsCacheWarm(S);
    dsSend(X, [bot("🩺 健檢　13.2 秒\n🧹 快取：全部清掉（索引＋10 格設定鏡射），體檢會順便重讀試算表把索引建回來。\n\n" + VERTXT + "\n🗂 指令碼屬性：LINE：18 個 ✅　網頁專案：14 個 ✅\n🕘 自動清快取：今天 06:00、09:00 清過（下一次 13 點）\n🔄 自動更新：這一版已經更新完了（09/15 09:05 自動做的，03 換新，2 秒，索引 28 筆，網頁專案 ✅）\n\n🩺 體檢：沒有 ❌ 也沒有 ⚠️ ✅\n\n速度看「⏱ 速度」那顆；只清快取、看版本：按下面的「📦 版本更新＋清快取」。\n\n（完整內容在 Apps Script 的執行記錄）" + dsoTail("13.5", "0.3"))], dsoGroupQ(DSO_CHK_CHIPS, "體檢 退出", "健檢"));
    dsoNet(X, ["是「健檢」（按「🩺 開始體檢」就是它）→ 清快取，再把所有項目檢查一次（約 10～20 秒）", "全部正常：只有一行「沒有 ❌ 也沒有 ⚠️ ✅」；有問題的會一條一條列在它下面"], "沒動（只是檢查）", "體檢報告（練習聊天室這一份是「一切正常」的樣子），下面一排小按鈕");
    return true;
  }
  function dsoChkExit(S, X) {
    dsSend(X, [bot(DSO_CHK_EXIT)]);
    dsoNet(X, ["是「體檢 退出」→ 離開體檢，回一句話；這一則沒有帶小按鈕，所以輸入框上面換回平常那排"], "沒動", "「已離開體檢」");
    return true;
  }
  function dsoClearCache(S, X) {
    dsoRep(X, "🧹 清快取併進「📦 版本更新＋清快取」了：按下面那顆，或打「版本更新」。\n（先清快取、馬上重建，再列 LINE、網頁專案、GitHub 全部的版本）", dsoGroupQ(DSO_CHK_CHIPS, "體檢 退出", ""), "0.6", "0.2");
    dsoNet(X, ["是「清快取」→ 現在只提醒一句，不清（清快取併進「版本更新＋清快取」了）"], "沒動", "一句提醒＋體檢那一排小按鈕");
    return true;
  }

  /* ───── ⏱ 速度（LINE 上實際的時間；練習聊天室這幾份是編的一份「最近幾次」）───── */
  var DSO_SPD = {
    all: "⏱ 速度（LINE 上實際的時間，新的在上）\n\n⌨️ 打字（目標 2 秒）　最近 2 次　平均 465 ms　超過 2 秒 0 次\n　【09/15 10:12】「90101」 410 ms ✅　程式外 180 ms　索引 記憶體\n　【09/15 10:09】「testolol」 520 ms ✅　程式外 210 ms　索引 快取\n\n📷 照片（印刷目標 6 秒、手寫 8 秒）　最近 1 張\n　【09/15 10:05】 藥師等 4.2 秒　印刷　AI 1 次 3.1 秒　程式外 220 ms\n\n🎤 語音（目標 6 秒）　最近 1 句\n　【09/15 09:58】 3.4 秒　✅ 查到　程式外 150 ms\n\n怎麼看：超過目標幾乎都是「程式外」（Google 冷啟動，靠保溫觸發器）或 AI 那一趟。照片的「藥師等」＝回覆送出去那一刻；「全部做完」多出來的是回覆之後才做的清暫存、記帳。\n每段細節：按下面的小按鍵，或打「文字速度」「照片速度」「語音速度」「速度 詳細」。",
    text: "⌨️ 文字速度（最近 2 次，新的在上；目標 2 秒）\n\n【09/15 10:12】0.4 秒　「90101」→ 1 筆　程式外 180 ms\n　查詢比對 0.0s\n\n【09/15 10:09】0.5 秒　「testolol」→ 1 筆　程式外 210 ms\n　查詢比對 0.0s\n\n怎麼看：取索引大＝那次重讀試算表（保溫沒跑）；查詢比對大＝跟關鍵字有關；回覆LINE 大＝LINE 那頭慢；程式外大（>1.5 秒）＝冷啟動、排隊；📮＝回覆 LINE 失敗、改用推播（括號裡是原因）。",
    photo: "📷 照片速度（最近 1 張，新的在上）\n\n【09/15 10:05】藥師等 4.2 秒　印刷　照片 800 KB　程式外 220 ms　思考 level　提示詞 900 字\n　AI 1 次 共 3.1 秒（佔 74%）\n　🔎 讀出 1 行、查到 1 支\n\n🧠 型號狀態（🤒＝塞車中，排到最後；❌＝不能用）\n　🟢 現在：一次送一個\n　🔬 OCR：待命（AI 全部沒讀到才用，是最後一步；照片超過 2 MB 不用）\n　快速組 3.5-flash-lite ✅／3.1-flash-lite ✅／flash-lite-latest ✅\n　準確組 3.6-flash ✅／3-flash-preview ✅／3.8-flash ✅／flash-latest ✅\n　準確組 3.1-pro-preview ✅／pro-latest ✅\n\n怎麼看：🔀 那一行是這一張怎麼送的；「藥師等」＝回覆送出去那一刻，「全部做完」多出來的是回覆之後才做的清暫存、記帳。HTTP 503／500／504／499 → Google 那邊過載，跟照片無關，那個型號記塞車 30 分鐘、排到最後；超過 12 秒被斷（真的逾時）→ 快速組整組休息 30 分鐘，這段時間照片一開始就送兩個準確型號；讀得出來但超過 8 秒 → 只排到最後。OCR 只在 AI 全部沒讀到才用，慢過 15 秒或出錯就冷卻 30 分鐘。想看下一張怎麼送、換先試的型號：打「照片型號」。換了 AI 金鑰、或 ❌ 的型號想馬上再試 → 按下面的「🔁 重設 AI 記憶」。「程式外」很大 → 冷啟動，看保溫觸發器。",
    voice: "🎤 語音速度（最近 1 句，新的在上）\n\n【09/15 09:58】3.4 秒　✅ 查到 1 個品項　錄音 30 KB　程式外 150 ms\n　聽到「安寧」\n　AI 1 趟 共 2.5 秒（佔 74%）　用「Groq（院內命中）」那一軌　Deepgram 語言 auto→判成 zh　Groq 0.9 秒\n\n⚙️ 設定　雙軌 開（每句送兩趟）　思考 budget ✅ 已關掉\n　快軌 gemini-3.5-flash-lite：可用 ✅\n　準軌 gemini-3.6-flash：可用 ✅\n\n怎麼看：「聽寫」那一段就是 AI 那一趟，佔掉大半是正常的。錄音 > 300 KB → 句子太長，只講藥名或 CODE 就好。\n同一句一直「🔇 沒聽出字」或聽到的字差很多 → 環境太吵，改用鍵盤上的 🎤（手機自己會去背景音），成功率最高。"
  };
  function dsoDeepText() {
    return "⏱ 速度體檢（合成）　1.4 秒\n════ 速度體檢 " + VERV + " ════\n（在編輯器裡直接量各段要多久；LINE 上實際的時間看最下面「最近幾次」）\n① 讀指令碼屬性（每次執行 1 趟）… 12 ms（共 20 個屬性）\n② 讀快取（藥品索引＋補充資料，每次查詢 1 趟）… 8 ms ✅（索引 5 K 字、補充資料 4 筆）\n③ 重讀試算表（只有快取空了才會發生）… 310 ms\n④ 寫快取 … 25 ms ✅\n⑤ 建立比對用索引（每次執行 1 次）… 3 ms（28 筆）\n⑥ 查詢比對＋組卡片：\n   CODE「90101」 → 1 筆　比對 2 ms　組卡片 14 ms（4 KB）\n   藥名前四字「TEST」 → 5 筆　比對 3 ms　組卡片 40 ms（17 KB）\n   位置「K2」 → 10 筆　比對 2 ms　組卡片 66 ms（25 KB）\n   打錯字「ETST」（模糊比對） → 5 筆　比對 9 ms　組卡片 38 ms（17 KB）\n════ LINE 上實際的時間 ════\n打字 【09/15 10:12】「90101」 共 410 ms ✅　程式外 180 ms　索引 記憶體　查詢比對 3\n打字 【09/15 10:09】「testolol」 共 520 ms ✅　程式外 210 ms　索引 快取　查詢比對 5\n拍照 【09/15 10:05】 共 4.2 秒　印刷　AI 1 次 3.1 秒　程式外 220 ms\n語音 【09/15 09:58】 共 3.4 秒　hit　程式外 150 ms\n════ 2 秒怎麼算 ════\n  程式外（LINE送出→程式開始：Google 排隊／冷啟動，程式碼管不到，靠 pingSelf 每 1 分鐘保溫）\n  ＋ ① 讀屬性 ＋ ② 讀快取 ＋ ⑤ 建索引 ＋ ⑥ 比對／組卡片 ＋ 送回 LINE（約 0.3～0.6 秒）\n  快取是熱的時候程式本身大約 0.5～1 秒；超過 2 秒幾乎都是「程式外」那一段，或快取空了（②）。\n  拍照：印刷目標 6 秒、手寫 8 秒；語音目標 6 秒。大頭都是 AI 那一趟（照片越大越慢，>3 MB 請裁切）。\n\n（完整內容在 Apps Script 的執行記錄）";
  }
  function dsoSpeed(S, X, flat) {
    var kind, text, here, q, tm, say;
    if (/^語音速度/.test(flat)) { kind = "voice"; here = "語音速度"; tm = ["0.8", "0.2"]; say = "語音（錄音 → 聽寫 → 查藥）最近幾句各花在哪一段"; }
    else if (/^文字速度/.test(flat)) { kind = "text"; here = "文字速度"; tm = ["0.8", "0.2"]; say = "打字查藥最近幾次各花在哪一段"; }
    else if (/^照片速度/.test(flat)) { kind = "photo"; here = "照片速度"; tm = ["0.9", "0.2"]; say = "拍照最近幾張各花在哪一段，和 AI 型號現在的狀態"; }
    else if (/詳細|完整|體檢|deep/i.test(flat)) { kind = "deep"; here = "速度 詳細"; tm = ["1.6", "0.2"]; say = "合成一份：現場量一遍各段 ＋ LINE 上實際的時間"; }
    else { kind = "all"; here = "速度"; tm = ["0.9", "0.2"]; say = "打字、照片、語音最近幾次的時間，和各自的目標"; }
    if (kind === "photo" && /重設|清除|reset/i.test(flat)) return dsoPhotoReset(S, X);
    text = kind === "deep" ? dsoDeepText() : DSO_SPD[kind];
    q = dsoGroupQ(DSO_SPEED_CHIPS, "速度 退出", here);
    if (kind === "photo") q.splice(q.length - 1, 0, { l: "🔁 重設 AI 記憶", m: "照片速度 重設" });
    if (kind === "deep") dsSend(X, [bot(text + dsoTail(tm[0], tm[1]))], q); else dsoRep(X, text, q, tm[0], tm[1]);
    dsoNet(X, ["是「" + here + "」→ " + say, "只是讀紀錄，不改任何東西；下面換成速度那一排小按鈕（自己這一顆不放）"], "沒動（只是看紀錄）", "一份報告（數字是編的）＋小按鈕");
    return true;
  }
  function dsoPhotoReset(S, X) {
    dsSend(X, [bot("🔁 重設 AI 記憶　0.3 秒\n════ 已清掉所有型號的記憶（含塞車記號、OCR 冷卻） ════\n   [快速組] gemini-3.5-flash-lite → 下次會用 thinking「level」重新試\n   [快速組] gemini-3.1-flash-lite → 下次會用 thinking「level」重新試\n   [快速組] gemini-flash-lite-latest → 下次會用 thinking「level」重新試\n   [準確組] gemini-3.6-flash → 下次會用 thinking「level」重新試\n   [準確組] gemini-3-flash-preview → 下次會用 thinking「level」重新試\n   [準確組] gemini-3.8-flash → 下次會用 thinking「low」重新試\n   [準確組] gemini-flash-latest → 下次會用 thinking「low」重新試\n   [準確組] gemini-3.1-pro-preview → 下次會用 thinking「low」重新試\n   [準確組] gemini-pro-latest → 下次會用 thinking「low」重新試\n接下來：用 LINE 傳一張照片，再跑 photoTiming 看「🔎 第一關」那一行。\n要確認每個型號現在通不通，跑 quotaCheck。\n→ 現在再傳一張照片，然後打「照片速度」看「思考」那一格。\n\n（完整內容在 Apps Script 的執行記錄）" + dsoTail("0.4", "0.2"))], dsoGroupQ(DSO_SPEED_CHIPS, "速度 退出", "照片速度 重設"));
    dsoNet(X, ["是「照片速度 重設」→ 把 AI 型號的塞車記號、思考記憶清掉（換了 AI 金鑰、或 ❌ 的型號想馬上再試時用）"], "沒動", "一句結果＋速度那一排小按鈕");
    return true;
  }
  function dsoSpeedExit(S, X) {
    dsSend(X, [bot(DSO_SPEED_EXIT)]);
    dsoNet(X, ["是「速度 退出」→ 離開速度，回一句話；這一則沒有帶小按鈕，所以輸入框上面換回平常那排"], "沒動", "「已離開速度」");
    return true;
  }

  /* ───── ⏰ 觸發器（部署新版本之後打一次：重新建好 6 個定時工作）───── */
  var DSO_TRIG = "⏰ 觸發器　1.9 秒\n✅ 6 項觸發器都建好了\n   ・autoSyncPhotos　每 2 小時　自動同步新照片\n   ・warmCache　　　 每 15 分鐘　保持快取是熱的\n   ・pingSelf　　　　每 1 分鐘　　保持網頁環境是熱的、順便看有沒有新版\n   ・dailyCleanup　　每天凌晨 3 點　清語音紀錄與 OCR 殘留暫存檔\n   ・autoClean　　　 每天 6、9、13、17、21 點　自動清快取（清完馬上重建）、速度紀錄、AI 塞車記號\n   ・onSheetChange　 改試算表時　改完下一句查詢就是新資料\n以後新照片丟進雲端硬碟就好，不用再執行任何東西。\n※ pingSelf 需要「網頁應用程式」已經部署過，否則記錄會說取不到網址。\n\n（完整內容在 Apps Script 的執行記錄）";
  function dsoTrig(S, X) {
    dsoRep(X, DSO_TRIG, null, "2.1", "0.2");
    dsoNet(X, ["是「觸發器」→ 把舊的定時工作先刪掉，再重新建好 6 個（重複打是安全的）"], "沒動（建的是 Google 的定時工作，不在試算表）", "「6 項觸發器都建好了」＋每一項多久跑一次");
    return true;
  }

  /* ───── 指令分派（照 08 的 _impDevCmd_ 的順序：前面的字先中；開頭是這些字就算，「速度很慢」也是速度）───── */
  function dsoLaterWord(X, what, where) { dsLater(X, what, where); return true; }
  function dsoDevCmd(S, X, t, flat) {
    var i;
    if (/^速度(退出|結束|離開)$/.test(flat)) return dsoSpeedExit(S, X);
    if (/^體檢(退出|結束|離開)$/.test(flat)) return dsoChkExit(S, X);
    if (/^體檢/.test(flat)) return dsoChkMenu(S, X);
    if (/^圖文選單/.test(flat)) return dsoLaterWord(X, "圖文選單", "輸入框下面那塊四格選單是 LINE 官方帳號後台的設定，練習聊天室沒有。");
    if (/^版本更新/.test(flat)) return dsoVerUpd(S, X);
    if (/^縮寫/.test(flat)) return dsaAbbr(S, X, t, flat);
    if (/^清單校對/.test(flat)) return dslCmd(S, X, t, flat);
    if (/^清快取/.test(flat)) return dsoClearCache(S, X);
    if (/^縮圖/.test(flat)) return dsoLaterWord(X, "縮圖", "平面圖縮圖（一次做 12 張）練習聊天室沒有做。");
    if (/^雙軌/.test(flat)) return dsoLaterWord(X, "雙軌", "照片一次送一個還是兩個型號，練習聊天室沒有做。");
    if (/^平面圖診斷/.test(flat)) return dsoLaterWord(X, "平面圖診斷", "公藥區平面圖的檢查，練習聊天室沒有做。");
    if (/^平面圖設定/.test(flat)) return dsoMapSwitch(S, X, flat);
    if (/^平面圖/.test(flat)) return dsaMapCmd(S, X, t, flat);
    if (/^藥品家族/.test(flat) || /^備用卡片/.test(flat)) return dsoLaterWord(X, "藥品家族", "藥品家族的開關（收起來的紫色框），練習聊天室沒有做。");
    if (/^同步平面圖/.test(flat)) return dsoLaterWord(X, "同步平面圖", "公藥區平面圖從雲端資料夾同步，練習聊天室沒有做。");
    if (/^清暫存/.test(flat)) return dsoLaterWord(X, "清暫存", "清暫存（每天凌晨 3 點會自動做），練習聊天室沒有做。");
    if (/^語音狀態/.test(flat)) return dsoLaterWord(X, "語音狀態", "語音設定的總覽，練習聊天室沒有做。");
    for (i = 0; i < DSO_FLAGS.length; i++) if (DSO_FLAGS[i].re.test(flat)) return dsoFlag(S, X, DSO_FLAGS[i], flat);
    if (/^語音速度/.test(flat) || /^文字速度/.test(flat)) return dsoSpeed(S, X, flat);
    if (/^健檢/.test(flat)) return dsoHealth(S, X);
    if (/^照片型號/.test(flat)) return dsoLaterWord(X, "照片型號", "照片先試哪個 AI 型號，練習聊天室沒有做。");
    if (/^照片速度/.test(flat) || /^速度/.test(flat)) return dsoSpeed(S, X, flat);
    if (/^同步照片/.test(flat)) return dspSync(S, X, t, flat);
    if (/^觸發器/.test(flat)) return dsoTrig(S, X);
    return false;
  }
  /*/SIMDEV*/

  /* ───────── 照片：☁️ 雲端照片資料夾、「同步照片」、「📷 換照片」、「📷 公告照片」（第 17 批；第 5 課「日常維護」的練習聊天室，第 2 課「✏️ 修改」點到 📷 也會走這裡）─────────
     練習用的雲端資料夾（S.ops.drive）是一份編的清單：
       files＝照片資料夾本身的檔案 [{ name, id }]；hasOld／old＝裡面有沒有「舊照片」子資料夾、裡面放了哪些；
       nz＝「公告照片」子資料夾（沒有就是 null）{ files, hasOld, old }；n＝編新檔案代號用的計數。
     每一句機器人說的話、每一個判斷，都照 03_維護工具.gs（syncOnePhoto_、syncDrivePhotos、_listDriveFolder_、_codeFromFileName_）、
     06_行動指令.gs（_picAsk_、_picFlow_、_npicAsk_、_npicFlow_、_picSave_、_efApply_ 裡 pic／npic 那兩段）、08_匯入.gs（_impDevCmd_ 的「同步照片」）寫；
     練習的是「編的」資料夾，什麼都不會真的寫到雲端硬碟。
     「在雲端硬碟上做的事」（放進一張照片、再放一個、刪掉）和「傳一張照片給機器人」是練習聊天室專用的按鈕（真的 LINE 沒有這些按鈕，要自己去雲端硬碟、自己拍照），
     由 dsActs 列出來；dsRun 收到 { t: "sim", v: 代號 }（雲端上做的事）或 { t: "img" }（傳照片）就接到這裡。 */
  /*SIMDEV*/
  var DSP_EXTS = ["jpeg", "jpg", "png", "JPG", "JPEG", "PNG", "webp", "gif", "heic"];   /* 06 的 _picSave_：搬舊照片時找的副檔名，照這個順序 */
  var DSP_BAD = "藥盒照片1.jpeg";   /* 練習專用：檔名不是 CODE 的檔案 */
  function dspUrl(id) { return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1000"; }   /* 03 的 _driveUrl_ */
  function dspIdOf(url) { var m = String(url === null || url === undefined ? "" : url).match(/[?&]id=([A-Za-z0-9_-]+)/); return m ? m[1] : ""; }
  function dspCode(name) {   /* 03 的 _codeFromFileName_：拿掉最後的副檔名，剩下 3～8 位數字才算 CODE */
    var base = String(name === null || name === undefined ? "" : name).replace(/\.[^.]+$/, "").trim();
    return /^\d{3,8}$/.test(base) ? base : "";
  }
  /* 一開始的資料夾：每一支「有照片」的藥一個檔案（檔名＝CODE.jpeg，編號跟試算表那一格的網址對得上）；
     只有 90101 例外——雲端那一張是比較新的（有人刪掉舊的、重傳了一張），試算表那一格還是舊網址，所以第一次「同步照片 90101」是「已更新」 */
  function dspDriveNew(rows, order) {
    var files = [], i, c, id;
    for (i = 0; i < order.length; i++) {
      c = order[i];
      if (!rows[c] || !rows[c].ph) continue;
      id = dspIdOf(rows[c].photo);
      if (c === "90101") id = "n90101abcdefghij123";
      files.push({ name: c + ".jpeg", id: id });
    }
    return { files: files, hasOld: false, old: [], nz: null, n: 0 };
  }
  function dspNewId(S, c, kind) {   /* 新檔案的編號：只要跟舊的不一樣，而且是英數字、15 個字以上（03 的解析認得）*/
    var d = S.ops.drive;
    d.n++;
    return (kind === "npic" ? "m" : "q") + c + "x" + (d.n < 10 ? "0" : "") + d.n + "abcdefghij";
  }
  function dspHits(S, code) {
    var fs = S.ops.drive.files, out = [], i;
    for (i = 0; i < fs.length; i++) if (dspCode(fs[i].name) === code) out.push(fs[i]);
    return out;
  }
  function dspTag(S) { return dsMD(S) + "-10" + dsClock(S).substring(9, 11); }   /* 搬到「舊照片」時加在檔名裡的時間（MMdd-HHmm；練習用假時鐘，跟批次號同一個鐘）*/

  /* 06 的 _picSave_：存進照片資料夾（公告照片＝照片資料夾底下的「公告照片」子資料夾，檔名 CODE_公告）；同名的舊檔改名成 CODE_舊_MMdd-HHmm.副檔名、搬到「舊照片」；回 { name, url, moved } */
  function dspSave(S, c, kind) {
    var d = S.ops.drive, base = kind === "npic" ? c + "_公告" : c, box, e, i, f, nn, id, name, moved = [], tag = dspTag(S);
    if (kind === "npic") {
      if (!d.nz) d.nz = { files: [], hasOld: false, old: [] };
      box = d.nz;
    } else box = d;
    for (e = 0; e < DSP_EXTS.length; e++) {
      for (i = 0; i < box.files.length; i++) {
        f = box.files[i];
        if (f.name !== base + "." + DSP_EXTS[e]) continue;
        nn = base + "_舊_" + tag + "." + DSP_EXTS[e];
        box.hasOld = true;
        box.old.push({ name: nn, id: f.id });
        moved.push(nn);
        box.files.splice(i, 1);
        i--;
      }
    }
    id = dspNewId(S, c, kind);
    name = base + ".jpeg";
    box.files.push({ name: name, id: id });
    return { name: name, url: dspUrl(id), moved: moved };
  }

  /* ───── 同步照片 CODE：只同步這一支（08 的 _impDevCmd_ 裡 /^同步照片(\d{3,8})$/；03 的 syncOnePhoto_）───── */
  function dspSyncOne(S, X, code) {
    var hits = dspHits(S, code), why = "", url, changed, row = S.rows[code], ms;
    dsT(X, 1, "是「同步照片 " + code + "」→ 只同步這一支（後面接 3～8 位數字）");
    if (!hits.length) why = "雲端資料夾裡沒有檔名是 " + code + " 的照片（檔名要是「" + code + ".jpeg」這種）";
    else if (hits.length > 1) why = "雲端資料夾裡有 " + hits.length + " 個 " + code + " 的檔案，請刪到只剩一個";
    dsT(X, why ? 0 : 1, "去雲端照片資料夾找檔名是 " + code + " 的照片：找到 " + hits.length + " 個" + (hits.length ? "（" + hits.map(function(h) { return h.name; }).join("、") + "）" : ""));
    if (why) {
      dsoRep(X, "🖼 " + code + " 沒同步：" + why, null, "0.8", "0.2");
      dsT(X, 0, hits.length ? "同一支藥有兩個以上的檔案，不知道要用哪一個 → 不寫，要你先刪到只剩一個" : "沒有這支藥的照片 → 不寫");
      X.sheet = "沒動"; X.reply = "「🖼 " + code + " 沒同步：…」（開發者指令的回覆，最後有一行 ⏱）";
      return true;
    }
    url = dspUrl(hits[0].id);
    if (row) {
      changed = String(row.photo === null || row.photo === undefined ? "" : row.photo) !== url;
      row.photo = url;
      dsRowFix(row, "photo");
    } else changed = true;
    dsCacheClear(S);   /* 改了格子或沒改，都清快取（03 的 syncOnePhoto_ 最後一步）；這一條不是 ✏️ 的入口，所以不記進「匯入紀錄」、也沒有「↩️ 復原」*/
    dsT(X, 1, changed ? "把它的網址寫進「工作表2」的藥品外觀（跟原本不一樣，換成新的）" : "它的網址跟試算表上的一樣 → 格子不用改，只是把快取清掉重建");
    if (changed) dsT(X, 1, "這一種不記進「匯入紀錄」（✏️ 修改、📷 換照片才會記），所以不能用「復原」");
    ms = [bot("🖼 " + code + " 照片已更新（雲端 " + hits[0].name + "）" + (changed ? "" : "\n（網址跟原本一樣，只是重新整理了快取）") + "\n新照片要幾秒鐘才會出現，卡片上還是舊圖的話再查一次就好。")];
    if (row) ms.push(dsCard(S, code));
    dsSend(X, ms);
    X.wrote = changed && row ? 1 : 0;
    X.sheet = changed && row ? "改 1 格（" + code + "　藥品外觀；沒有記進「匯入紀錄」）" : "沒動（網址跟原本一樣）";
    X.reply = "「🖼 照片已更新」＋這支藥的卡片（新照片的那一格）";
    return true;
  }

  /* ───── 同步照片／同步照片 全部：整個資料夾對一遍（03 的 syncDrivePhotos；寫整欄，不記進「匯入紀錄」）───── */
  function dspListing(S) {   /* 資料夾裡看得到的東西：檔案＋子資料夾（Drive API 不分檔案或資料夾，子資料夾也會列進來）*/
    var d = S.ops.drive, out = d.files.slice();
    if (d.hasOld) out.push({ name: "舊照片", id: "oldfolder" });
    if (d.nz) out.push({ name: "公告照片", id: "noticefolder" });
    return out;
  }
  function dspSyncAll(S, X, flat) {
    var force = /全部|強制/.test(flat), list = dspListing(S), map = {}, order = [], seen = {}, dupes = {}, dupCodes = [], badName = [], lines = [], i, f, c, r, cur, updated = 0, kept = 0, appends = 0, changed, msg, k;
    for (i = 0; i < list.length; i++) {
      f = list[i]; c = dspCode(f.name);
      if (!c) { badName.push(f.name); continue; }
      if (seen[c]) { dupes[c] = (dupes[c] || 1) + 1; continue; }
      seen[c] = true;
      map[c] = dspUrl(f.id);
      order.push(c);
    }
    for (c in dupes) dupCodes.push(c);
    lines.push("讀取資料夾…", "清單來源：Drive API ✅（正式 API，不用抽驗）");
    for (i = 0; i < dupCodes.length; i++) { delete map[dupCodes[i]]; k = order.indexOf(dupCodes[i]); if (k >= 0) order.splice(k, 1); }
    if (dupCodes.length) lines.push("❌ 這些 CODE 有重複檔案，已跳過（請到雲端硬碟刪到只剩一個）：", "   " + dupCodes.slice(0, 20).join("、") + (dupCodes.length > 20 ? " …共 " + dupCodes.length + " 個" : ""));
    lines.push("資料夾 " + list.length + " 個檔案 → " + order.length + " 個品項");
    if (badName.length) lines.push("檔名不是 CODE、已跳過 " + badName.length + " 個：" + badName.slice(0, 8).join("、") + (badName.length > 8 ? " …" : ""));
    if (!order.length) lines.push("沒有可以寫入的資料。");
    else {
      for (i = 0; i < order.length; i++) {
        c = order[i]; r = S.rows[c];
        if (!r) { appends++; continue; }
        cur = String(r.photo === null || r.photo === undefined ? "" : r.photo).trim();
        if (cur && !force) { kept++; continue; }
        if (cur === map[c]) { kept++; continue; }
        if (cur && force && cur.indexOf("drive.google.com/thumbnail?id=") < 0) { kept++; continue; }
        r.photo = map[c];
        dsRowFix(r, "photo");
        updated++;
      }
      changed = updated + appends;
      lines.push("✅ 更新 " + updated + " ／ 新增 " + appends + " ／ 不動 " + kept + (force ? "（強制模式）" : ""));
      lines.push(changed > 0 ? "   下一步：執行 clearDrugCache 讓它生效。" : "   沒有變動，不用做別的。");
      lines.push("這次寫入／更新 " + changed + " 個品項");
    }
    dsCacheClear(S);
    msg = "🖼 同步照片" + (force ? "（全部強制覆蓋）" : "") + "　1.2 秒\n" + lines.slice(-14).join("\n") + "\n\n（完整內容在 Apps Script 的執行記錄）";
    dsoRep(X, msg, null, "1.9", "0.3");
    dsT(X, 1, "是「同步照片" + (force ? " 全部" : "") + "」→ 整個資料夾對一遍" + (force ? "（強制：試算表已經有照片的，也換成雲端那一張）" : "（試算表已經有照片的不動，只補沒有的）"));
    dsT(X, 1, "讀雲端資料夾：" + list.length + " 個項目，其中 " + order.length + " 個檔名是 CODE" + (badName.length ? "，" + badName.length + " 個檔名不是 CODE（子資料夾也算）→ 跳過" : ""));
    if (dupCodes.length) dsT(X, 0, "這些 CODE 有兩個以上的檔案：" + dupCodes.join("、") + " → 不知道用哪一個，整支跳過");
    dsT(X, 1, order.length ? "對試算表：更新 " + updated + "、新增 " + appends + "、不動 " + kept : "沒有可以寫入的資料");
    if (updated) dsT(X, 1, "整欄一次寫進去，不記進「匯入紀錄」（所以這一種不能用「復原」）");
    X.wrote = updated ? 1 : 0;
    X.sheet = updated ? "改 " + updated + " 格（藥品外觀）" : "沒動";
    X.reply = "「🖼 同步照片…」＋讀到幾個檔案、更新幾格（最後有一行 ⏱）";
    return true;
  }
  function dspSync(S, X, t, flat) {
    var one = flat.match(/^同步照片(\d{3,8})$/);
    if (one) return dspSyncOne(S, X, one[1]);
    return dspSyncAll(S, X, flat);
  }

  /* ───── 📷 換照片、📷 公告照片：問（06 的 _picAsk_、_npicAsk_）───── */
  function dspPicAsk(S, X, c, mef) {
    var r = S.rows[c], name = r ? String(r.b || r.z || "") : "";
    S.fld = { code: c, k: "pic" };
    if (mef) S.fld.mef = 1;
    dsSend(X, [bot("📷 請直接傳一張 " + c + (name ? "（" + name + "）" : "") + " 的照片給我\n（拍瓶身或鋁箔，字面朝上、光線夠；電腦版把照片檔拖進來或 Ctrl+V 貼上也可以）\n\n傳來的照片會存進雲端硬碟的照片資料夾（檔名 " + c + ".jpeg），舊的會移到「舊照片」；卡片馬上換成新照片。\n15 分鐘內有效，不換了就按「取消」。")], [{ l: "取消", m: "取消" }]);
    dsT(X, 1, "點了「📷 換照片」→ 記住現在在等 " + c + " 的照片（15 分鐘內有效）；接下來傳來的照片不是拿來查藥，是拿來換這支藥的照片");
    X.sheet = "沒動（還沒傳照片）";
    X.reply = "「請直接傳一張 " + c + " 的照片給我」＋輸入框上面只有「取消」";
    X.say = "輸入框下面多了一顆「📷 傳一張照片給機器人」（練習專用：真的 LINE 要自己拍照、或選一張照片傳）。";
  }
  function dspNpicAsk(S, X, c) {
    var r = S.rows[c], has = !!(r && String(r.npic || "") !== "");
    S.wiz = null;
    S.fld = { code: c, k: "npic" };
    dsSend(X, [bot("📷 請直接傳一張 " + c + " 的公告照片給我（例如新包裝、新廠牌的外盒；電腦版把照片檔拖進來或 Ctrl+V 貼上也可以）\n\n" + (has ? "現在已經有一張，傳新的會換掉（舊的移到「公告照片／舊照片」）。\n" : "") + "照片會顯示在藥品卡片的公告框裡（公告移除時一起拿掉）。\n15 分鐘內有效。")], [{ l: "🗑 移除公告照片", m: "移除" }, { l: "取消", m: "取消" }]);
    dsT(X, 1, "點了「📷 公告照片」→ 記住現在在等 " + c + " 的公告照片（15 分鐘內有效）");
    X.sheet = "沒動（還沒傳照片）";
    X.reply = "「請直接傳一張 " + c + " 的公告照片給我」＋輸入框上面「🗑 移除公告照片」「取消」";
    X.say = "輸入框下面多了一顆「📷 傳一張照片給機器人」（練習專用）。";
  }

  /* ───── 等照片的時候打了字（06 的 _efApply_ 裡 pic／npic 那兩段）───── */
  function dspPicText(S, X, t, st) {
    var c = st.code, flat = String(t).replace(/\s+/g, "");
    if (dsIn(t, DS_CANCEL) || /^(不換了|不換|不用了)$/.test(flat)) {
      S.fld = null;
      dsT(X, 1, "是「取消」→ 這一張照片不換了");
      X.sheet = "沒動";
      if (X.mefOn && dsNorm(X.mefOn) === c) { dsMefCard(S, X, c, null, "好，照片沒換。"); X.reply = "一次改多項那張卡（上面寫著「好，照片沒換。」）"; return true; }
      dsSend(X, [bot("好，照片沒換 👍")]);
      X.reply = "「好，照片沒換」";
      return true;
    }
    dsSend(X, [bot("📷 請直接「傳一張照片」給我（不是打字）。\n不換了就按「取消」。")], [{ l: "取消", m: "取消" }]);
    dsT(X, 0, "現在在等照片，打字不算 → 再提醒一次");
    X.sheet = "沒動"; X.reply = "「請直接傳一張照片給我（不是打字）」＋「取消」";
    return true;
  }
  function dspNpicText(S, X, t, st) {
    var c = st.code, flat = String(t).replace(/\s+/g, ""), rn;
    if (dsIn(t, DS_CANCEL) || /^(不換了|不換|不用了)$/.test(flat)) {
      S.fld = null;
      dsT(X, 1, "是「取消」→ 公告照片不動");
      dsSend(X, [bot("好，公告照片沒動 👍")]);
      X.sheet = "沒動"; X.reply = "「好，公告照片沒動」";
      return true;
    }
    if (/^(移除|刪除|拿掉|清空|沒有)$/.test(flat)) {
      rn = dsEfWrite(S, X, c, "npic", "");
      S.fld = null;
      if (rn.err) { dsSend(X, [bot(rn.err)]); X.sheet = "沒動"; X.reply = "（錯誤說明）"; return true; }
      dsT(X, 1, "是「移除」→ 把公告照片那一格清空（雲端資料夾裡的檔案不動）");
      dsEfDone(S, X, c, { label: "公告照片", before: rn.before ? "（有照片）" : "（空）", after: "（已移除）" });
      return true;
    }
    dsSend(X, [bot("📷 請直接「傳一張照片」給我（不是打字）。\n要拿掉現在的公告照片打「移除」；不換了就按「取消」。")], [{ l: "🗑 移除公告照片", m: "移除" }, { l: "取消", m: "取消" }]);
    dsT(X, 0, "現在在等公告照片，打字不算（只有「移除」「取消」會處理）→ 再提醒一次");
    X.sheet = "沒動"; X.reply = "「請直接傳一張照片給我（不是打字）」＋「🗑 移除公告照片」「取消」";
    return true;
  }

  /* ───── 傳來一張照片（02 的 _picFlow_ 先看有沒有在等；沒有才是平常的拍照查藥）───── */
  function dspRecv(S, X) {
    var st = S.fld, c, wasMef, saved, w, ok, ms, kind, q;
    if (!st || (st.k !== "pic" && st.k !== "npic")) {
      dsSend(X, [act("練習聊天室不示範「傳照片查藥」：真的 LINE 會用 AI 讀照片、找出是哪一支藥（藥師版教學第 3 課有）。這裡的傳照片只用在「📷 換照片」「📷 公告照片」。")]);
      X.sheet = "沒動"; X.reply = "（這個練習不示範）";
      dsT(X, 1, "沒有在等照片 → 平常的「拍照查藥」，這一課的練習聊天室沒有做，不會改任何東西");
      return true;
    }
    kind = st.k; c = st.code; wasMef = !!st.mef;
    S.fld = null;
    dsT(X, 1, "有在等 " + c + " 的" + (kind === "npic" ? "公告" : "") + "照片 → 這張照片不是拿來查藥，是拿來換它的" + (kind === "npic" ? "公告" : "") + "照片");
    saved = dspSave(S, c, kind);
    dsT(X, 1, "存進雲端硬碟的" + (kind === "npic" ? "「公告照片」子資料夾" : "照片資料夾") + "：" + saved.name + (saved.moved.length ? "；舊的改名搬到「舊照片」（" + saved.moved.join("、") + "）" : "（原本沒有舊的）"));
    w = dsEfWrite(S, X, c, kind === "npic" ? "npic" : "photo", saved.url);
    if (w.err) {
      dsSend(X, [bot((kind === "npic" ? "公告照片" : "照片") + "存進雲端了（" + saved.name + "），但寫工作表2 失敗：" + w.err + (kind === "npic" ? "" : "\n請打「同步照片 " + c + "」再試一次。"))]);
      X.sheet = "沒動（雲端多了檔案，試算表沒寫）"; X.reply = "（寫試算表失敗的說明）";
      return true;
    }
    dsT(X, 1, "把新檔案的網址寫進「工作表2」的" + (kind === "npic" ? "公告照片" : "藥品外觀") + "，記進「匯入紀錄」");
    ok = kind === "npic"
      ? "✅ " + c + " 公告照片換好了（雲端 公告照片／" + saved.name + (saved.moved.length ? "；舊的移到「舊照片」" : "") + "）\n新照片要幾秒鐘才會出現，卡片上還是舊圖的話再查一次就好。" + (S.rows[c] && String(S.rows[c].nk || "") !== "" ? "" : "\n⚠️ 這支藥現在沒掛公告，照片要等掛上公告才會顯示在公告框。")
      : "✅ " + c + " 照片換好了（雲端 " + saved.name + (saved.moved.length ? "；舊的移到「舊照片」：" + saved.moved.join("、") : "") + "）\n新照片要幾秒鐘才會出現，卡片上還是舊圖的話再查一次就好。";
    X.wrote = 1;
    X.sheet = "改 1 格（" + c + "　" + (kind === "npic" ? "公告照片" : "藥品外觀") + "）；雲端資料夾多一個檔案";
    if (kind === "pic" && wasMef) {
      dsMefBatch(S, X, c);
      dsMefCard(S, X, c, null, ok + "\n（其他項打完送出，也都是直接寫進試算表）");
      X.reply = "一次改多項那張卡（上面寫著「照片換好了」）";
      return true;
    }
    ms = [bot(ok)];
    if (S.rows[c]) ms.push(dsCard(S, c));
    dsSend(X, ms, dsEfUndo(S, X, c, DS_BAR.slice()));
    X.reply = "「✅ 照片換好了」＋這支藥的新卡片＋第一顆小按鈕「↩️ 復原 " + c + "」";
    return true;
  }

  /* ───── 練習專用的按鈕（真的 LINE 沒有）：w＝line（聊天室裡的動作）／drive（在雲端硬碟上做的事）───── */
  function dspNextNew(S) {   /* 下一支「試算表沒照片、雲端也沒檔案」的藥 */
    var cands = ["90103", "90104", "90106", "90107", "90109"], i;
    for (i = 0; i < cands.length; i++) if (S.rows[cands[i]] && !S.rows[cands[i]].ph && !dspHits(S, cands[i]).length) return cands[i];
    return "";
  }
  function dsActs(S) {
    var out = [], f = S.fld, d = S.ops.drive, c, i, has = {}, one;
    if (f && (f.k === "pic" || f.k === "npic")) out.push({ id: "img", w: "line", l: "📷 傳一張照片給機器人" });
    if (S.ops.oth) out = out.concat(dsaOthActs(S));   /* 進階指令那一課：假裝「另一個人」做的事（打「我的代號」、打邀請碼） */
    if (S.ops.lstUi) out = out.concat(dslActs(S));   /* 清單校對那一課：傳一張清單的照片、讓時間過去 */
    if (S.ops.webUi) out = out.concat(dwbActs(S));   /* 開發者網頁那一課：換在哪裡打字、假裝藥師做的事 */
    for (i = 0; i < d.files.length; i++) has[d.files[i].name] = d.files[i];
    c = dspNextNew(S);
    if (c) out.push({ id: "put:" + c, w: "drive", l: "＋ 放進 " + c + ".jpeg" });
    if (has["90105.jpeg"] && !has["90105.jpg"]) out.push({ id: "dup:90105", w: "drive", l: "＋ 再放一個 90105.jpg" });
    if (!has[DSP_BAD]) out.push({ id: "bad", w: "drive", l: "＋ 放進 " + DSP_BAD });
    one = has["90102.jpeg"] ? "90102" : "";
    if (one) out.push({ id: "del:" + one, w: "drive", l: "🗑 刪掉 " + one + ".jpeg" });
    return out;
  }
  /* 雲端硬碟上做的事：機器人不知道（沒有傳給它），所以 X.keep＝聊天室原樣留著，只有「雲端資料夾」那一塊和深色框動 */
  function dspSim(S, X, id) {
    var d = S.ops.drive, p = id.split(":"), kind = p[0], c = p[1] || "", name, f, i, say = "";
    X.keep = 1;
    if (kind === "put" && c && S.rows[c]) {
      name = c + ".jpeg"; d.files.push({ name: name, id: dspNewId(S, c, "pic") });
      say = "☁️ 在雲端資料夾放進了 " + name + "（機器人還不知道）。打「同步照片 " + c + "」它才會去對。";
      dsT(X, 1, "你在 Google 雲端硬碟的照片資料夾放進一個檔案：" + name);
    } else if (kind === "dup" && c) {
      name = c + ".jpg"; d.files.push({ name: name, id: dspNewId(S, c, "pic") });
      say = "☁️ 在雲端資料夾又放進了 " + name + "：現在 " + c + " 有兩個檔案。打「同步照片 " + c + "」看機器人怎麼說。";
      dsT(X, 1, "你在雲端資料夾又放進一個檔案：" + name + "（同一支藥，兩個檔案）");
    } else if (kind === "bad") {
      d.files.push({ name: DSP_BAD, id: dspNewId(S, "0", "pic") });
      say = "☁️ 在雲端資料夾放進了 " + DSP_BAD + "（檔名不是 CODE）。打「同步照片」整個資料夾對一遍，看它怎麼說。";
      dsT(X, 1, "你在雲端資料夾放進一個檔案：" + DSP_BAD + "（檔名不是 CODE）");
    } else if (kind === "del" && c) {
      for (i = d.files.length - 1; i >= 0; i--) if (dspCode(d.files[i].name) === c) { f = d.files[i]; d.files.splice(i, 1); }
      say = "☁️ 從雲端資料夾刪掉了 " + c + " 的照片檔（試算表上那一格還是舊網址）。打「同步照片 " + c + "」看機器人怎麼說。";
      dsT(X, 1, "你把雲端資料夾裡 " + c + " 的照片檔刪掉了");
    } else {
      say = "這個動作現在做不到。";
      dsT(X, 0, "這個動作現在做不到");
    }
    dsT(X, 1, "這是你在 Google 雲端硬碟上做的事，沒有傳給機器人；機器人要等你叫它「同步照片」（或每 2 小時自動同步）才會知道");
    X.sheet = "沒動（只動了雲端資料夾）";
    X.reply = "（不回話）這一步是你在雲端硬碟上做的，沒有傳給機器人";
    X.say = say;
  }
  /* 畫面上「雲端資料夾」那一塊要畫的東西：每個檔案和它跟試算表對得上沒有（ok 已對上／new 還沒對上／dup 同一支藥兩個檔案／bad 檔名不是 CODE／none 試算表沒有這支藥），和子資料夾 */
  function dspView(S) {
    var d = S.ops.drive, files = [], subs = [], i, f, c, r, st;
    for (i = 0; i < d.files.length; i++) {
      f = d.files[i]; c = dspCode(f.name); r = c ? S.rows[c] : null;
      if (!c) st = "bad";
      else if (dspHits(S, c).length > 1) st = "dup";
      else if (!r) st = "none";
      else if (dsPhOk(r.photo) && dspIdOf(r.photo) === f.id) st = "ok";
      else st = "new";
      files.push({ name: f.name, st: st });
    }
    if (d.hasOld) subs.push({ name: "舊照片", files: d.old.map(function(x) { return x.name; }) });
    if (d.nz) subs.push({ name: "公告照片", files: d.nz.files.map(function(x) { return x.name; }), old: d.nz.hasOld ? d.nz.old.map(function(x) { return x.name; }) : null });
    return { files: files, subs: subs };
  }
  /*/SIMDEV*/

  /* ───────── 開發者的進階指令（第 17 批；第 6 課「進階指令」的練習聊天室）─────────
     這一個檔放四組：📖 縮寫（08 的 _abbrCmd_，加上查詢時真的展開縮寫：01 的 _expandAbbr_／_abbrDevFirst_／_abbrMergeFirst_）、
     🗺 平面圖（08 的 _mapFixCmd_、06 的 _efMapAsk_／_efMapApply_；設定完卡片上的地圖跟著變）、🪪 我的代號、
     👥 開發者 管理／邀請／名單／移除／加／碼（08 的 _devCmd_、_devJoin_、_devAdd_、_devListText_、_devRmList_）。
     這裡每一句機器人說的話，都照上面那些函式拼字串的那一句寫；tools/learn_dev_sim_test.js 把同一串輸入丟給真的 LINE 程式碼逐句比對。
     「另一個人」做的事（對方打「我的代號」、對方打邀請碼）：真的要請另一個人用他的手機做，練習聊天室用「練習專用的按鈕」假裝（_learn_dev_sim_photo.js 的 dsActs 把按鈕列出來），
     聊天室裡畫的是「對方看到的」，輸入框上面的小按鈕不動（那是你的）。 */
  /*SIMDEV*/
  var DSA_SELF = "Udemo0001practice", DSA_INV = "Udemo0002invitee";   /* 練習用的假 LINE 代號：你自己、被邀請的對方（真的是 U 開頭加 32 個英數字） */
  var DSA_CODES = ["482913", "715306", "260847", "938521", "174069", "603152", "829470", "351986"];   /* 邀請碼：真的是亂數 6 位數，這裡編幾組輪流用 */
  var DSA_FAIL_MAX = 3;
  var DSA_DEVG_CHIPS = [["➕ 邀請開發者", "開發者 邀請"], ["👥 開發者名單", "開發者 名單"], ["➖ 開發者移除", "開發者 移除"]];
  var DSA_DEVG_EXIT = "開發者 退出";
  var DSA_DEVG_EXIT_TEXT = "🚪 已離開開發者。\n要再用：按「🔧 開發者」→「👥 開發者」。";
  var DSA_DEVG_MENU = "👥 開發者　要做哪一個？\n・➕ 邀請開發者：給一組 6 位數邀請碼（10 分鐘內有效、只能用一次）\n・👥 開發者名單：現在有誰、最近的異動\n・➖ 開發者移除：從名單挑一位移除（會先問一次）";
  var DSA_NOSHEET = "沒動（開發者名單存在機器人的「指令碼屬性」，不在試算表裡）";
  /* 平面圖的櫃名（01 的 MAPS 的鍵；網址不用）：錠櫃、水櫃的單字母，和名字比較長的其他櫃 */
  var DSA_MAP_TAB = "A C D E F G H I J K L M N O P Q R S T".split(" ");
  var DSA_MAP_WAT = "A B C D G H I J K L M N O P".split(" ");
  var DSA_MAP_OTH = ["上鎖藥櫃", "撥補品項", "庫鐵架", "A棧", "棧板A區", "棧板B區", "棧板C區", "棧板門口", "棧板（靠近門口）", "棧左", "棧中", "棧右", "水棧一", "水棧二", "水棧三", "水棧四", "水棧五", "麻藥後面冰", "麻藥後棧板"];
  var DSA_MAPSET = (function() {
    var o = {}, i;
    o.DEFAULT = 1;
    for (i = 0; i < DSA_MAP_TAB.length; i++) o["錠_" + DSA_MAP_TAB[i]] = 1;
    for (i = 0; i < DSA_MAP_WAT.length; i++) o["水_" + DSA_MAP_WAT[i]] = 1;
    for (i = 0; i < 12; i++) o["錠_" + DSA_MAP_OTH[i]] = 1;
    for (i = 12; i < DSA_MAP_OTH.length; i++) o["水_" + DSA_MAP_OTH[i]] = 1;
    return o;
  })();
  var DSA_MAP_HOW = "用法：\n　平面圖 27211 錠A　指定用小藥庫錠A櫃那張\n　平面圖 27211 公藥　設成沒有平面圖\n　平面圖 27211 自動　取消設定，回到跟著工作表1 的位置走\n　平面圖 清空　　　全部取消";
  function dsaMapNames() {   /* 08 的 _mapFixNamesText_（雲端硬碟資料夾裡的圖練習聊天室沒有，所以沒有「雲端」那一行） */
    return "可以用的櫃名：\n　錠櫃　" + DSA_MAP_TAB.map(function(x) { return "錠" + x; }).join(" ") + "\n　水櫃　" + DSA_MAP_WAT.map(function(x) { return "水" + x; }).join(" ") + "\n　其他　" + DSA_MAP_OTH.join(" ") + "\n　沒有平面圖　公藥";
  }
  function dsaPerson(id) { return id === DSA_SELF ? "示範甲" : id === DSA_INV ? "示範乙" : "示範丙"; }   /* LINE 查得到的顯示名稱（練習用編的；不認得的代號一律叫示範丙） */
  /* now＝練習用的「經過幾秒」（邀請碼 10 分鐘、打錯 3 次鎖 1 小時都靠它算；只有「⏰ 時間過了…」的按鈕會讓它往前走）；invs＝還有效的邀請碼 [{ code, by, exp }]；fails＝每個人打錯的次數 { n, exp } */
  function dsaDevNew() { return { list: [DSA_SELF], meta: {}, log: [], invs: [], fails: {}, n: 0, now: 0, sig: {}, at: {} }; }
  function dsaExpire(d) {   /* 過了時間的邀請碼、打錯的次數，拿掉（真的是快取自己過期） */
    var k;
    d.invs = d.invs.filter(function(v) { return v.exp > d.now; });
    for (k in d.fails) if (dsOwn(d.fails, k) && d.fails[k].exp <= d.now) delete d.fails[k];
  }
  /* 「做到哪」的暫存（新藥填到一半、改某一格、一次改多項、匯入）：真的是存在快取裡，過了時間自己消失（06 的 WIZ_TTL_SEC／FLD_TTL_SEC／MEF_OPEN_SEC、08 的 IMP_TTL_SEC）。
     練習聊天室的「時間過了…」按鈕要讓它們一起過期：每一則動作做完，記下每一份暫存最後一次變動是在練習時鐘的哪一秒（dsaStamp）；時間往前走的時候，超過的就清掉（dsaAge） */
  var DSA_TTL = { wiz: 1800, fld: 900, mef: 900, mefOpen: 900, imp: 1800 };
  function dsaSig(v) { return v === null || v === undefined || v === "" ? "" : JSON.stringify(v); }
  function dsaStamp(S) {
    var d = S.ops.dev, k, sg;
    for (k in DSA_TTL) if (dsOwn(DSA_TTL, k)) {
      sg = dsaSig(S[k]);
      if (sg !== (d.sig[k] || "")) { d.sig[k] = sg; d.at[k] = d.now; }
    }
  }
  function dsaAge(S) {
    var d = S.ops.dev, k;
    for (k in DSA_TTL) if (dsOwn(DSA_TTL, k) && dsaSig(S[k]) && d.now - (d.at[k] || 0) >= DSA_TTL[k]) S[k] = k === "mefOpen" ? "" : null;
  }
  function dsaSay(X, text, q) { dsSend(X, [bot(String(text).substring(0, 4900))], q || null); }   /* 開發者管理那幾句是直接回字（replyText），不像別的開發者指令後面多一行「⏱」 */
  function dsaDevQ(here) { return dsoGroupQ(DSA_DEVG_CHIPS, DSA_DEVG_EXIT, here); }
  function dsaNow(S) { return dsClock(S).substring(0, 11); }   /* 「月/日 時:分」 */
  function dsaImul(a, b) {
    var ah = (a >>> 16) & 0xffff, al = a & 0xffff, bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
  }
  /* 移除確認用的記號（08 的 _devTag_）：從這個人的代號算出 4 個字 */
  function dsaTag(id) {
    var s = String(id === null || id === undefined ? "" : id), h = 2166136261, i;
    for (i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = dsaImul(h, 16777619) >>> 0;
    }
    return ("0000" + (h % 1679616).toString(36)).slice(-4);
  }
  /* 小按鍵上的字最多 20 個（08 的 _chipLabel_；表情符號不切一半） */
  function dsaChip(s) {
    var out = "", i = 0, ch;
    s = String(s === null || s === undefined ? "" : s);
    while (i < s.length) {
      ch = s.charAt(i);
      if (/[\ud800-\udbff]/.test(ch) && i + 1 < s.length) ch += s.charAt(i + 1);
      if ((out + ch).length > 20) break;
      out += ch;
      i += ch.length;
    }
    return out;
  }
  /* 名單上沒有名字的人，補上 LINE 的顯示名稱（08 的 _devFillNames_） */
  function dsaFill(S) {
    var d = S.ops.dev, i, id;
    for (i = 0; i < d.list.length; i++) {
      id = d.list[i];
      if (d.meta[id] && d.meta[id].name) continue;
      d.meta[id] = d.meta[id] || {};
      d.meta[id].name = dsaPerson(id);
    }
  }
  /* 「由誰邀請」「最近的異動」要顯示的名字（08 的 _devWho_）：紀錄裡有名字就用；沒有就先照完整的找、再找開頭相同的那一位；都沒有才顯示代號前面幾個字 */
  function dsaWho(S, short, nm) {
    var meta = S.ops.dev.meta, s = String(short === null || short === undefined ? "" : short), k;
    if (nm) return nm;
    if (!s) return "";
    if (meta[s] && meta[s].name) return meta[s].name;
    for (k in meta) if (dsOwn(meta, k) && k.indexOf(s) === 0 && meta[k] && meta[k].name) return meta[k].name;
    return s + "…";
  }
  function dsaLog(S, act, who, by, nm) {   /* 08 的 _devLog_：最近的異動，最多留 20 筆 */
    var d = S.ops.dev, ent = { at: dsaNow(S), act: act, who: String(who || "").substring(0, 10), by: String(by || "").substring(0, 10) };
    if (nm) ent.nm = String(nm).substring(0, 30);
    d.log.unshift(ent);
    d.log = d.log.slice(0, 20);
  }
  /* 把一個人加進開發者名單（08 的 _devAdd_）：回 { ok, why } 或 { ok, name } */
  function dsaAdd(S, id, by) {
    var d = S.ops.dev, nm;
    if (d.list.indexOf(id) >= 0) return { ok: false, why: "這個人已經在名單裡了" };
    if (by && d.list.indexOf(by) < 0) d.list.push(by);
    d.list.push(id);
    nm = dsaPerson(id);
    d.meta[id] = { name: nm, at: dsaNow(S), by: String(by || "").substring(0, 10) };
    dsaLog(S, "加入", id, by, nm);
    return { ok: true, name: nm };
  }
  /* 名單那一段字（08 的 _devListText_） */
  function dsaListText(S, userId) {
    var d = S.ops.dev, i, id, m, who, t;
    dsaFill(S);
    t = "👥 開發者名單（" + d.list.length + " 位）\n";
    for (i = 0; i < d.list.length; i++) {
      id = d.list[i];
      m = d.meta[id] || {};
      who = m.name || id.substring(0, 8) + "…";
      t += "\n" + (i + 1) + ". " + who + (id === userId ? "（您）" : "") + (m.at ? "\n　　" + m.at + " 加入" + (m.by ? "・由 " + dsaWho(S, m.by) + " 邀請" : "") : "\n　　（在編輯器加的，沒有紀錄）");
    }
    if (d.log.length) {
      t += "\n\n最近的異動：";
      for (i = 0; i < d.log.length && i < 5; i++) t += "\n　" + d.log[i].at + "　" + d.log[i].act + "　" + dsaWho(S, d.log[i].who, d.log[i].nm);
    }
    t += "\n\n移除：按「➖ 開發者移除」（或打「開發者 移除 2」，用上面的編號）\n邀請：按「➕ 邀請開發者」";
    return t;
  }
  /* ➖ 開發者移除 的名單（08 的 _devRmList_）：每個人一顆「➖ 移除 2 王小明」（自己沒有）；head＝最前面多一句（編號打錯） */
  function dsaRmList(S, X, head) {
    var d = S.ops.dev, i, id, m, who, self, canRm, L, q = [];
    dsaFill(S);
    canRm = d.list.length > 1;
    L = [(head || "") + "➖ 開發者移除：要移除誰？"];
    for (i = 0; i < d.list.length; i++) {
      id = d.list[i];
      m = d.meta[id] || {};
      who = m.name || id.substring(0, 8) + "…";
      self = id === DSA_SELF;
      L.push("　" + (i + 1) + "　" + who + (self ? "（您，不能移除自己）" : m.at ? "　" + m.at.split(" ")[0] + " 加入" : ""));
      if (canRm && !self && q.length < 12) q.push({ l: dsaChip("➖ 移除 " + (i + 1) + " " + who), m: "開發者 移除 " + (i + 1) });
    }
    L.push("");
    L.push(canRm ? "按下面那一顆（會先問一次），或打「開發者 移除 2」。" : "🛟 名單只剩一位，不能移除（不然就沒有人是開發者了）。");
    if (!q.length) { dsaSay(X, L.join("\n"), dsaDevQ("開發者 移除")); return; }
    q.push({ l: "🚪 退出", m: DSA_DEVG_EXIT });
    dsaSay(X, L.join("\n"), q);
  }
  /* 打「開發者 碼 482913」（08 的 _devJoin_）：誰打的、打哪一組。對方還不是開發者也能打；連續打錯 3 次鎖 1 小時 */
  function dsaJoin(S, X, who, code) {
    var d = S.ops.dev, fails = dsOwn(d.fails, who) ? d.fails[who].n : 0, inv = null, i, r, nm = dsaPerson(who);
    for (i = 0; i < d.invs.length; i++) if (d.invs[i].code === code) inv = d.invs[i];
    if (fails >= DSA_FAIL_MAX) {
      dsaSay(X, "🔒 這組CODE試太多次了，請 1 小時後再試，或請開發者重新給您一組。");
      dsT(X, 0, "「" + nm + "」連續打錯邀請碼 " + DSA_FAIL_MAX + " 次了 → 鎖 1 小時，這一組也不理");
      dsoNet(X, [], DSA_NOSHEET, "「🔒 這組CODE試太多次了」");
      return true;
    }
    if (!inv) {
      d.fails[who] = { n: fails + 1, exp: d.now + 3600 };
      dsaSay(X, "❌ 這組邀請碼不對、或已經過期／被用過了。\n請開發者重新打「開發者 邀請」給您一組新的。");
      dsT(X, 0, "邀請碼對得上嗎？對不上（打錯、過了 10 分鐘、或已經被用掉）→ 記一次失敗（累積 " + DSA_FAIL_MAX + " 次就鎖 1 小時；現在是第 " + d.fails[who].n + " 次）");
      dsoNet(X, [], DSA_NOSHEET, "「❌ 這組邀請碼不對、或已經過期／被用過了」");
      return true;
    }
    d.invs.splice(d.invs.indexOf(inv), 1);
    delete d.fails[who];
    dsT(X, 1, "邀請碼對得上（10 分鐘內、還沒用過）→ 這一組馬上作廢，不能再用");
    r = dsaAdd(S, who, inv.by);
    if (!r.ok) {
      dsaSay(X, "🔧 " + r.why + "，您本來就可以用開發者功能。打「開發者」看選單。");
      dsT(X, 0, "「" + nm + "」本來就在開發者名單裡 → 不用再加");
      dsoNet(X, [], DSA_NOSHEET, "「這個人已經在名單裡了，您本來就可以用開發者功能」");
      return true;
    }
    dsaSay(X, "✅ " + (r.name ? r.name + "，" : "") + "您現在是開發者了\n\n多了這些：新增藥品、回覆回報、匯入、同步照片、換照片、健檢、速度…\n輸入框上面會多一顆「🔧 開發者」，按下去是選單（下一則訊息就會出現）。\n\n先打「教學」，按卡片最下面的「🔒 開發者專用教學」，看一遍就會用。");
    dsT(X, 1, "把「" + nm + "」加進開發者名單，記下是誰、幾點、誰邀請的");
    dsoNet(X, [], "改「指令碼屬性」的開發者名單（不在試算表裡）", "「✅ …您現在是開發者了」＋多了哪些功能");
    return true;
  }
  /* 打「我的代號」（08 的 _impFlow_ 最前面那一段；每個人都可以打，不用是開發者） */
  function dsaMyIdText(id) { return "🪪 您的代號（LINE ID）\n" + id + "\n\n把這一串傳給開發者，他打「開發者 加 " + id + "」就能把您加進開發者。"; }
  function dsaMyId(S, X) {
    dsaSay(X, dsaMyIdText(DSA_SELF));
    dsT(X, 1, "是「我的代號」→ 把您的 LINE 代號回給您（練習聊天室的代號是編的）");
    dsoNet(X, [], "沒動", "「🪪 您的代號（LINE ID）」＋那一串代號＋怎麼把它交給開發者");
    return true;
  }
  /* 08 的 _devCmd_：開發者 管理／邀請／名單／加／移除／退出 */
  function dsaDevCmd(S, X, t, flat) {
    var d = S.ops.dev, m, r, i, code, gone, goneName, who, tag, list, k;
    if (/^開發者(退出|結束|離開)$/.test(flat)) {
      dsaSay(X, DSA_DEVG_EXIT_TEXT);
      dsT(X, 1, "是「開發者 退出」→ 離開「👥 開發者」那一排小按鈕，回平常那排");
      dsoNet(X, [], "沒動", "「🚪 已離開開發者」（沒帶小按鈕，輸入框上面換回平常那排）");
      return true;
    }
    if (/^開發者管理$/.test(flat)) {
      dsaSay(X, DSA_DEVG_MENU, dsaDevQ("開發者 管理"));
      dsT(X, 1, "是「開發者 管理」→ 一句說明，下面換成一排小按鈕（邀請、名單、移除、退出）");
      dsoNet(X, [], "沒動", "一段說明＋四顆小按鈕");
      return true;
    }
    if (/^開發者(邀請|invite)$/i.test(flat)) {
      for (k = 0; k < DSA_CODES.length; k++) {
        code = DSA_CODES[(d.n + k) % DSA_CODES.length];
        for (i = 0; i < d.invs.length; i++) if (d.invs[i].code === code) code = "";
        if (code) break;
      }
      d.n++;
      d.invs.push({ code: code, by: DSA_SELF, exp: d.now + 600 });
      dsaSay(X, "🔑 邀請碼 " + code + "\n10 分鐘內有效，只能用一次。\n\n把下面這句傳給對方，請他在補藥神器裡打：\n　開發者 碼 " + code + "\n\n（他打完就是開發者了，您可以按「👥 開發者名單」確認。）\n\n⚠️ 只傳給你認識、要當開發者的人。補藥神器（LINE 或網頁）永遠不會叫你產生邀請碼、或把邀請碼傳給誰；有人這樣要求就是詐騙。", dsaDevQ("開發者 邀請"));
      dsT(X, 1, "是「開發者 邀請」→ 產生一組 6 位數邀請碼");
      dsT(X, 1, "存進機器人的暫存，10 分鐘後自己消失；對方打對一次就作廢");
      dsoNet(X, [], "沒動（邀請碼只在暫存裡 10 分鐘）", "「🔑 邀請碼 " + code + "」＋要傳給對方的那一句＋防詐騙提醒");
      return true;
    }
    if (/^開發者(名單|list)$/i.test(flat)) {
      dsaSay(X, dsaListText(S, DSA_SELF).substring(0, 4900), dsaDevQ("開發者 名單"));
      dsT(X, 1, "是「開發者 名單」→ 列出現在有誰、誰邀請的、最近的異動");
      dsoNet(X, [], DSA_NOSHEET, "「👥 開發者名單（" + d.list.length + " 位）」＋每個人一行＋最近的異動");
      return true;
    }
    m = t.match(/^開發者\s*加\s*(U[A-Za-z0-9]{3,63}|[A-Za-z0-9]{10,64})$/);
    if (m) {
      r = dsaAdd(S, m[1], DSA_SELF);
      if (!r.ok) {
        dsaSay(X, "🔧 " + r.why + "。\n" + dsaListText(S, DSA_SELF), dsaDevQ(""));
        dsT(X, 0, "這個代號本來就在名單裡 → 不用再加");
        dsoNet(X, [], DSA_NOSHEET, "「🔧 這個人已經在名單裡了」＋名單");
        return true;
      }
      dsaSay(X, "✅ 已加入" + (r.name ? "：" + r.name : "") + "\n\n" + dsaListText(S, DSA_SELF), dsaDevQ(""));
      dsT(X, 1, "是「開發者 加 代號」→ 把這個代號加進開發者名單，記下是誰、幾點、誰加的");
      dsoNet(X, [], "改「指令碼屬性」的開發者名單（不在試算表裡）", "「✅ 已加入」＋最新的名單");
      return true;
    }
    if (/^開發者加/.test(flat)) {
      dsaSay(X, "要加誰？請他在補藥神器打「我的代號」，把回覆那一串 U 開頭的字傳給您，再打：\n　開發者 加 U…\n\n或直接按「➕ 邀請開發者」用 6 位數CODE，比較快。", dsaDevQ(""));
      dsT(X, 0, "「開發者 加」後面要接對方的代號（U 開頭或 10 個字以上的英數字）→ 教你怎麼拿到代號");
      dsoNet(X, [], "沒動", "教你請對方打「我的代號」，或用邀請碼");
      return true;
    }
    if (/^開發者(?:移除|刪除|刪)$/.test(flat)) {
      dsaRmList(S, X, "");
      dsT(X, 1, "是「開發者 移除」→ 列出名單，每個人（除了您自己）一顆「➖ 移除 N 名字」");
      dsoNet(X, [], DSA_NOSHEET, "「➖ 開發者移除：要移除誰？」＋名單＋每個人一顆小按鈕");
      return true;
    }
    m = flat.match(/^開發者(?:移除|刪除|刪)(\d{1,2})(?:確定([0-9a-z]{4})?)?$/);
    if (m) {
      list = d.list;
      i = parseInt(m[1], 10) - 1;
      tag = m[2] || "";
      if (!(i >= 0 && i < list.length)) {
        dsaRmList(S, X, "沒有第 " + m[1] + " 位。\n\n");
        dsT(X, 0, "名單上有第 " + m[1] + " 位嗎？沒有 → 重新列名單");
        dsoNet(X, [], DSA_NOSHEET, "「沒有第 " + m[1] + " 位」＋名單");
        return true;
      }
      if (list[i] === DSA_SELF) {
        dsaSay(X, "🛟 不能移除自己（避免把自己鎖在外面）。\n請另一位開發者移除，或在編輯器的指令碼屬性改 DEV_USERS。", dsaDevQ(""));
        dsT(X, 0, "要移除的是您自己嗎？是 → 不行，免得把自己鎖在外面");
        dsoNet(X, [], DSA_NOSHEET, "「🛟 不能移除自己」");
        return true;
      }
      if (list.length <= 1) {
        dsaSay(X, "🛟 名單只剩一位，不能移除（不然就沒有人是開發者了）。", dsaDevQ(""));
        dsoNet(X, [], DSA_NOSHEET, "「🛟 名單只剩一位，不能移除」");
        return true;
      }
      gone = list[i];
      goneName = (d.meta[gone] || {}).name || "";
      who = goneName || gone.substring(0, 8) + "…";
      if (tag !== dsaTag(gone)) {
        dsaSay(X, (tag ? "⚠️ 名單剛剛有人改過，第 " + (i + 1) + " 位現在是「" + who + "」，再確認一次。\n\n" : "") + "確定要移除「" + (i + 1) + " " + who + "」嗎？\n移除之後他就用不了開發者功能（藥師的功能照舊）。", [{ l: "✅ 確定移除", m: "開發者 移除 " + (i + 1) + " 確定 " + dsaTag(gone) }, { l: "↩️ 不要", m: "開發者 管理" }]);
        dsT(X, tag ? 0 : 1, tag ? "確定那一顆帶的記號跟現在第 " + (i + 1) + " 位對不上（名單中間變過）→ 不移除，重問一次" : "是「開發者 移除 " + (i + 1) + "」→ 先問一次，不會馬上移除");
        dsoNet(X, [], "沒動", "「確定要移除嗎？」＋✅ 確定移除／↩️ 不要");
        return true;
      }
      list.splice(i, 1);
      delete d.meta[gone];
      dsaLog(S, "移除", gone, DSA_SELF, goneName);
      dsaSay(X, ("🗑 已移除：" + who + "\n（他下一則訊息起就沒有開發者功能了）\n\n" + dsaListText(S, DSA_SELF)).substring(0, 4900), dsaDevQ(""));
      dsT(X, 1, "按「✅ 確定移除」→ 記號對得上 → 把「" + who + "」從名單拿掉");
      dsoNet(X, [], "改「指令碼屬性」的開發者名單（不在試算表裡）", "「🗑 已移除：" + who + "」＋最新的名單");
      return true;
    }
    if (/^開發者(移除|刪除|刪)/.test(flat)) {
      dsaRmList(S, X, "移除要用名單上的編號，例如「開發者 移除 2」。\n\n");
      dsT(X, 0, "移除要接名單上的編號 → 重新列名單");
      dsoNet(X, [], DSA_NOSHEET, "「移除要用名單上的編號」＋名單");
      return true;
    }
    return false;   /* 認不得的（例：「開發者 邀請 abc」）→ 不是這一組指令，照一般查藥 */
  }

  /* ───── 練習專用：假裝是「另一個人」做的事（真的要請對方用他的手機）─────
     oth:me　對方打「我的代號」　oth:join　對方打你剛給的邀請碼　oth:bad　對方打一組錯的碼　oth:time　時間過了 1 小時（碼過期、打錯的次數歸零）
     畫在聊天室裡的是「對方看到的」；輸入框上面的小按鈕不動（那是你的） */
  function dsaOthActs(S) {
    var d = S.ops.dev, last = d.invs.length ? d.invs[d.invs.length - 1] : null, out = [], k, anyFail = false;
    for (k in d.fails) if (dsOwn(d.fails, k)) anyFail = true;
    out.push({ id: "oth:me", w: "oth", l: "📲 假裝對方打「我的代號」" });
    if (last) out.push({ id: "oth:join", w: "oth", l: "📲 假裝對方打邀請碼 " + last.code });
    out.push({ id: "oth:bad", w: "oth", l: "📲 假裝對方打一組錯的邀請碼" });
    if (d.invs.length) out.push({ id: "oth:t10", w: "oth", l: "⏰ 時間過了 10 分鐘" });
    if (d.invs.length || anyFail) out.push({ id: "oth:time", w: "oth", l: "⏰ 時間過了 1 小時" });
    return out;
  }
  function dsaOthNote() { return act("📲 假裝是另一個人：下面是「對方」（示範乙）在他自己跟補藥神器的聊天室裡看到的，不是你的聊天室。"); }
  function dsaOth(S, X, id) {
    var d = S.ops.dev, last = d.invs.length ? d.invs[d.invs.length - 1] : null, code;
    X.qKeep = 1;   /* 輸入框上面的小按鈕是你的，不動 */
    if (id === "oth:me") {
      X.msgs.push(dsaOthNote());
      X.msgs.push(me("我的代號"));
      dsaSay(X, dsaMyIdText(DSA_INV));
      dsT(X, 1, "對方（不是您）打了「我的代號」→ 機器人把他的 LINE 代號回給他（每個人都可以打，不用是開發者）");
      dsT(X, 1, "他把這一串傳給您，您再打「開發者 加 " + DSA_INV + "」就能把他加進來（練習的代號是編的，可以直接複製）");
      dsoNet(X, [], "沒動", "（回給對方）「🪪 您的代號（LINE ID）」＋那一串代號");
    } else if ((id === "oth:join" && last) || id === "oth:bad") {
      code = id === "oth:bad" ? "000000" : last.code;
      X.msgs.push(dsaOthNote());
      X.msgs.push(me("開發者 碼 " + code));
      dsaJoin(S, X, DSA_INV, code);
      if (id === "oth:bad") dsT(X, 1, "（練習專用）對方打了一組錯的碼");
      X.reply = "（回給對方）" + X.reply;
      X.say = "";
    } else if (id === "oth:t10" || id === "oth:time") {
      d.now += id === "oth:t10" ? 600 : 3600;
      dsaExpire(d);
      dsaAge(S);
      X.keep = 1;
      X.say = id === "oth:t10" ? "時間過了 10 分鐘：邀請碼只有 10 分鐘有效，沒用掉的都過期了（打錯的次數還在，要 1 小時才歸零）。" : "時間過了 1 小時：沒用掉的邀請碼都過期了（只有 10 分鐘），打錯的次數也歸零了。";
      dsT(X, 1, id === "oth:t10" ? "過了 10 分鐘：邀請碼只有 10 分鐘有效，沒用掉的全部過期" : "過了 1 小時：邀請碼早就過期了；「打錯 3 次鎖 1 小時」的鎖也解開了");
      X.sheet = "沒動";
      X.reply = "（不回話）這一步是時間過去，沒有傳給機器人";
    } else {
      X.keep = 1;
      X.say = "這個動作現在做不到。";
      dsT(X, 0, "這個動作現在做不到");
      X.sheet = "沒動";
      X.reply = "（不回話）";
    }
    return X;
  }

  /* ───── 📖 縮寫（08 的 _abbrCmd_）─────
     縮寫存在 S.abbr（縮寫 → 全名），跟 ✏️ → 📖 縮寫 是同一份（_learn_dev_sim_edit.js 的 dsAbbrWrite）。 */
  function dsaAbbrList(S) {
    var keys = [], k, i, out = [];
    for (k in S.abbr) if (dsOwn(S.abbr, k)) keys.push(k);
    keys.sort();
    if (!keys.length) return "（還沒有開發者加的縮寫）";
    for (i = 0; i < keys.length; i++) out.push("　" + keys[i] + " = " + S.abbr[keys[i]]);
    return out.join("\n");
  }
  function dsaAbbr(S, X, t, flat) {
    var s = String(t).trim().replace(/^縮寫\s*/, "").trim(), del, add, k, v, msg, trail = [], sheet = "沒動";
    del = s.match(/^(?:刪|刪除|移除)\s*([A-Za-z0-9]+)$/);
    add = s.match(/^([A-Za-z0-9]{1,12})\s*[=＝:：]\s*(.+)$/);
    if (del) {
      k = del[1].toUpperCase();
      if (!S.abbr[k]) {
        msg = "📖 沒有「" + k + "」這個縮寫。\n" + dsaAbbrList(S);
        trail.push([0, "縮寫表裡有「" + k + "」嗎？沒有 → 什麼都沒刪"]);
      } else {
        delete S.abbr[k];
        dsCacheClear(S);
        msg = "📖 已刪掉 " + k + "。現在的縮寫：\n" + dsaAbbrList(S);
        trail.push([1, "是「縮寫 刪 " + k + "」→ 從縮寫表拿掉，並清掉查藥的快取（下一句查詢就不會再展開它）"]);
        sheet = "改縮寫表（不在試算表裡）";
      }
    } else if (add) {
      k = add[1].toUpperCase();
      v = add[2].trim().substring(0, 60);
      if (dsaAbbrCount(S) >= 60 && !S.abbr[k]) {
        msg = "📖 最多 60 個，先刪掉不用的。";
        trail.push([0, "縮寫表已經 60 個了 → 先刪掉不用的"]);
      } else {
        S.abbr[k] = v;
        dsCacheClear(S);
        msg = "📖 已加 " + k + " = " + v + "（下一張手寫紙條就會用到）。現在的縮寫：\n" + dsaAbbrList(S);
        trail.push([1, "是「縮寫 縮寫=全名」→ 英文字母轉大寫，記進縮寫表，並清掉查藥的快取"]);
        trail.push([1, "從現在起，打「" + k + "」就會查到「" + v + "」那幾支藥；AI 讀紙條時也會拿它還原"]);
        sheet = "改縮寫表（不在試算表裡）";
      }
    } else {
      msg = "📖 開發者加的手寫縮寫（查詢會展開、AI 讀紙條時會用來還原）\n" + dsaAbbrList(S) + "\n\n★ 最快的加法：查那支藥 → ✏️ 修改 → 📖 縮寫 → 打 HCTZ\n打字也行：縮寫 HCTZ=hydrochlorothiazide\n刪：縮寫 刪 HCTZ";
      trail.push([1, s ? "看不懂「縮寫」後面這串（不是「縮寫=全名」，也不是「刪 縮寫」）→ 什麼都沒改，列出現有的縮寫和用法" : "只打「縮寫」→ 列出現有的縮寫和用法"]);
    }
    dsoRep(X, msg, null, "0.8", "0.2");
    dsoNet(X, [], sheet, "縮寫表的現況（" + dsaAbbrCount(S) + " 個）" + (del || add ? "，最前面一句說做了什麼" : "＋怎麼加、怎麼刪"));
    X.trail = trail.map(function(p) { return { ok: p[0], t: p[1] }; }).concat(X.trail);
    return true;
  }
  function dsaAbbrCount(S) { return dsAbbrCount(S); }
  /* 查詢時展開縮寫（01 的 searchDrug：把縮寫指到的全名當成最後一次「一模一樣」的比對；整句剛好是「開發者加的縮寫」→ 它指到的藥排最前面，見 _abbrDevFirst_）。
     r＝simQuery 的結果；回新的結果（加了 abbr：{ k 縮寫, to 展開成什麼, first 是排最前面還是改查它 }），不用展開就原樣回 */
  function dsaAbbrKey(s) { return String(s === null || s === undefined ? "" : s).toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function dsaAbbrFirst(S, norm, k) {   /* _abbrDevFirst_：只有整句是英數字、是開發者加的（不是內建的）縮寫、不是全數字才算；回它指到的那幾支（沒有就空的） */
    var brand, one;
    if (!/^[A-Za-z0-9]+$/.test(norm)) return [];
    if (/^\d+$/.test(k)) return [];
    if (dsOwn(DS_ABBR, k) && DS_ABBR[k]) return [];
    brand = dsOwn(S.abbr, k) ? String(S.abbr[k] || "").trim() : "";
    if (!brand) return [];
    one = simOnce(brand, "exact");
    if (!one || one.how === "loc" || (one.how === "locText" && one.key)) return [];
    return one.all;
  }
  function dsaAbbrFix(S, r) {
    var norm, k, ex, first, exact, one, out, merged, seen, i, builtin;
    if (!r || r.kind === "cmd" || r.kind === "agg" || r.kind === "multi") return r;
    norm = simNorm(r.q);
    k = dsaAbbrKey(norm);
    if (!k) return r;
    builtin = dsOwn(DS_ABBR, k) && !!DS_ABBR[k];
    ex = builtin ? DS_ABBR[k] : (dsOwn(S.abbr, k) ? String(S.abbr[k] || "") : "");
    if (!ex) return r;
    exact = r.kind === "code" || r.kind === "loc" || r.kind === "locText" || r.kind === "name";
    first = dsaAbbrFirst(S, norm, k);
    if (exact) {   /* 前面「一模一樣」的比對就有結果了：除非是位置查詢，縮寫指到的藥排在最前面，後面接原本查到的（最多 12 筆） */
      if (!first.length || r.kind === "code" || r.kind === "loc" || (r.kind === "locText" && r.kws && r.kws.length === 1)) return r;
      merged = [];
      seen = {};
      for (i = 0; i < first.length && merged.length < SIM_MAX; i++) { seen[first[i]] = 1; merged.push(first[i]); }
      for (i = 0; i < r.all.length && merged.length < SIM_MAX; i++) if (!seen[r.all[i]]) { seen[r.all[i]] = 1; merged.push(r.all[i]); }
      out = {};
      for (i in r) if (dsOwn(r, i)) out[i] = r[i];
      out.all = merged;
      out.total = merged.length;
      out.codes = merged.slice(0, SIM_MAX);
      out.abbr = { k: k, to: ex, first: 1 };
      return out;
    }
    one = simOnce(ex, "exact");   /* 照原樣找不到：展開後的全名是最後一次「一模一樣」的比對（放在拿掉符號、容許打錯字之前） */
    if (!one || (one.how !== "code" && one.how !== "name")) return r;
    out = one;
    out.q = r.q;
    out.attempt = ex;
    out.total = out.all.length;
    out.codes = out.all.slice(0, SIM_MAX);
    out.kind = one.how;
    out.abbr = { k: k, to: ex, first: 0, builtin: builtin };
    return out;
  }

  /* ───── 🗺 平面圖（08 的 _mapFixCmd_、06 的 _efMapAsk_／_efMapApply_）───── */
  function dsaMapNone(v) { return /^(公藥|無|沒有|沒圖|無圖|none|x)$/i.test(String(v === null || v === undefined ? "" : v).trim()); }
  function dsaMapOk(v) {   /* 01 的 _mapFixUrl_：櫃名對得上 MAPS 才算（練習聊天室沒有雲端硬碟資料夾的圖） */
    var n = String(v === null || v === undefined ? "" : v).trim(), m;
    if (!n) return false;
    if (DSA_MAPSET[n]) return true;
    m = n.match(/^(錠|水)\s*(.+)$/);
    if (m && DSA_MAPSET[m[1] + "_" + m[2].trim()]) return true;
    return !!(DSA_MAPSET["錠_" + n] || DSA_MAPSET["水_" + n]);
  }
  function dsaMapList(S) {
    var o = S.ops.maps, keys = [], k, i, out = [];
    for (k in o) if (dsOwn(o, k)) keys.push(k);
    keys.sort();
    if (!keys.length) return "（還沒有設定任何一個品項）";
    for (i = 0; i < keys.length; i++) out.push("　" + keys[i] + " → " + o[keys[i]] + (dsaMapNone(o[keys[i]]) ? "（沒有平面圖）" : ""));
    return out.join("\n");
  }
  function dsaMapCount(S) { var n = 0, k; for (k in S.ops.maps) if (dsOwn(S.ops.maps, k)) n++; return n; }
  /* 卡片上要畫什麼地圖：沒指定（或整院停用了）回 ""；指定「沒有平面圖」回 "none"；指定某一櫃回櫃名 */
  function dsaMapOf(S, c) {
    var v;
    if (!S.ops.mapfix || !S.ops.maps || !dsOwn(S.ops.maps, c)) return "";
    v = S.ops.maps[c];
    if (!v) return "";
    return dsaMapNone(v) ? "none" : v;
  }
  function dsaMapCmd(S, X, t, flat) {
    var s = String(t).trim().replace(/^平面圖\s*/, "").trim(), o = S.ops.maps, m, code, val, msg, sheet = "沒動", trail = [];
    if (!s) {
      msg = "🗺 平面圖設定（只有您看得到，藥師不受影響）\n\n目前設定：\n" + dsaMapList(S) + "\n\n" + DSA_MAP_HOW + "\n\n" + dsaMapNames();
      trail.push([1, "只打「平面圖」→ 列出現在設定了哪些品項，和用法、可以用的櫃名"]);
    } else if (/^(清空|全部刪|全刪|重來)$/.test(s)) {
      S.ops.maps = {};
      msg = "🗺 平面圖設定：已全部清空，所有藥品回到自動判斷（跟著工作表1 的位置走）。";
      trail.push([1, "是「平面圖 清空」→ 所有品項的指定都拿掉，回到跟著小藥庫位置自動判斷"]);
      sheet = "改平面圖設定（不在試算表裡）";
    } else {
      m = s.match(/^(\d{3,8})\s*(.*)$/);
      if (!m) {
        msg = "🗺 看不懂「" + s.substring(0, 20) + "」，什麼都沒有改。\n\n" + DSA_MAP_HOW + "\n\n" + dsaMapNames();
        trail.push([0, "「平面圖」後面接的是 CODE 嗎？不是（要 3～8 位數字）→ 什麼都沒改，列出用法"]);
      } else {
        code = dsNorm(m[1]);
        val = (m[2] || "").trim();
        if (!val || /^(自動|取消|刪|刪除|移除|恢復|還原)$/.test(val)) {
          if (!o[code]) {
            msg = "🗺 " + code + " 本來就沒有設定，現在就是自動判斷。\n\n目前設定：\n" + dsaMapList(S);
            trail.push([0, code + " 有指定過嗎？沒有 → 本來就是自動判斷，不用改"]);
          } else {
            delete o[code];
            msg = "🗺 " + code + " 的設定拿掉了，回到自動判斷（跟著工作表1 的位置走）。\n\n目前設定：\n" + dsaMapList(S);
            trail.push([1, "是「平面圖 " + code + " 自動」→ 拿掉這支藥的指定，回到跟著小藥庫位置自動判斷（全院立刻生效）"]);
            sheet = "改平面圖設定（不在試算表裡）";
          }
        } else if (!o[code] && dsaMapCount(S) >= 300) {
          msg = "🗺 最多 300 個品項，先用「平面圖 代號 自動」拿掉不用的。";
          trail.push([0, "平面圖設定已經 300 個了 → 先拿掉不用的"]);
        } else if (dsaMapNone(val)) {
          o[code] = "公藥";
          msg = "🗺 " + code + " 設成「沒有平面圖」了。\n地標圖案會自動換成「沒有圖」那一顆，卡片也不會有平面圖那一格。\n\n目前設定：\n" + dsaMapList(S);
          trail.push([1, "是「平面圖 " + code + " 公藥」→ 設成沒有平面圖，卡片上不畫地圖（全院立刻生效）"]);
          sheet = "改平面圖設定（不在試算表裡）";
        } else if (!dsaMapOk(val)) {
          msg = "🗺 沒有「" + val + "」這張平面圖，什麼都沒有改。\n\n" + dsaMapNames();
          trail.push([0, "櫃名「" + val + "」對得上嗎？對不上 → 什麼都沒改，列出可以用的櫃名"]);
        } else {
          o[code] = val;
          msg = "🗺 " + code + " → " + val + "，設定好了。\n再查一次這支藥就會看到那張平面圖。\n\n目前設定：\n" + dsaMapList(S);
          trail.push([1, "是「平面圖 " + code + " " + val + "」→ 指定這支藥用「" + val + "」那張平面圖（全院立刻生效）"]);
          sheet = "改平面圖設定（不在試算表裡）";
        }
      }
    }
    dsoRep(X, msg.substring(0, 4900), null, "0.8", "0.2");
    dsoNet(X, [], sheet, "平面圖設定的現況（" + dsaMapCount(S) + " 個品項）或用法");
    X.trail = trail.map(function(p) { return { ok: p[0], t: p[1] }; }).concat(X.trail);
    return true;
  }
  /* ✏️ 修改 → 🗺 平面圖：問（06 的 _efMapAsk_）*/
  function dsaMapAsk(S, X, c) {
    var now = S.ops.maps[c] || "", cur = now ? (dsaMapNone(now) ? "現在設成：沒有平面圖" : "現在設成：" + now) : "現在：自動判斷（跟著小藥庫位置走）";
    S.wiz = null;
    S.fld = { code: c, k: "map" };
    dsT(X, 1, "點了「🗺 平面圖」→ 記住現在要改這支藥的平面圖（接下來打的字都算新內容）");
    X.sheet = "沒動（還沒選）";
    X.reply = "「🗺 " + c + " 的平面圖」＋現在是什麼＋輸入框上面 7 顆（棧左、棧中、棧右、平、沒平、自動、取消）";
    dsSend(X, [bot("🗺 " + c + " 的平面圖\n\n" + cur + "\n\n・「棧左」「棧中」「棧右」＝直接指定棧板哪一塊（按一下就好）\n・「平」＝其他櫃位，我再問您哪一櫃\n・「沒平」＝公藥那種，沒有平面圖\n・「自動」＝取消設定，跟著小藥庫位置自己判斷\n\n★ 設完**全院立刻生效**，藥師馬上看得到。")], [{ l: "棧左", m: "棧左" }, { l: "棧中", m: "棧中" }, { l: "棧右", m: "棧右" }, { l: "平", m: "平" }, { l: "沒平", m: "沒平" }, { l: "自動", m: "自動" }, { l: "取消", m: "取消" }]);
  }
  /* 打字進來（06 的 _efMapApply_）：回 true */
  function dsaMapApply(S, X, t, st) {
    var c = st.code, flat = String(t || "").replace(/\s+/g, ""), o = S.ops.maps, before, q, name;
    if (dsIn(t, DS_CANCEL)) {
      S.fld = null;
      dsT(X, 1, "是「取消」→ 平面圖不改了");
      X.sheet = "沒動";
      dsSend(X, [bot("好，取消了，一個字都沒動 👍")]);
      X.reply = "「好，取消了，一個字都沒動」";
      return true;
    }
    before = o[c] ? (dsaMapNone(o[c]) ? "沒有平面圖" : o[c]) : "自動判斷";
    if (/^(自動|恢復|還原|清空|取消設定)$/.test(flat)) {
      if (o[c]) delete o[c];
      S.fld = null;
      dsT(X, 1, "是「自動」→ 拿掉這支藥的平面圖指定，回到跟著小藥庫位置判斷（全院立刻生效）");
      dsaMapDone(S, X, c, before, "自動判斷（跟著小藥庫位置走）");
      return true;
    }
    if (/^(沒平|沒有平面圖|沒圖|無圖|公藥|無|沒有)$/.test(flat)) {
      o[c] = "公藥";
      S.fld = null;
      dsT(X, 1, "是「沒平」→ 設成沒有平面圖，卡片上不畫地圖（全院立刻生效）");
      dsaMapDone(S, X, c, before, "沒有平面圖");
      return true;
    }
    q = flat.match(/^(棧左|棧中|棧右)$/);
    if (q) {
      o[c] = q[1];
      S.fld = null;
      dsT(X, 1, "是「" + q[1] + "」→ 指定這支藥用棧板的「" + q[1] + "」那一塊（全院立刻生效）");
      dsaMapDone(S, X, c, before, q[1] + "（全院已生效）");
      return true;
    }
    if (/^(平|有平面圖|有圖)$/.test(flat)) {
      S.fld = { code: c, k: "map", step: "name" };
      dsT(X, 1, "是「平」→ 其他櫃位，再問是哪一櫃");
      X.sheet = "沒動"; X.reply = "「🗺 " + c + " 在哪一櫃？」＋可以用的櫃名＋「取消」";
      dsSend(X, [bot("🗺 " + c + " 在哪一櫃？直接打櫃名，例如：錠A\n\n" + dsaMapNames())], [{ l: "取消", m: "取消" }]);
      return true;
    }
    name = String(t || "").trim();
    if (!dsaMapOk(name)) {
      dsT(X, 0, "櫃名「" + name.substring(0, 20) + "」對得上嗎？對不上 → 什麼都沒改，再問一次");
      X.sheet = "沒動"; X.reply = "「沒有…這張平面圖」＋可以用的櫃名＋「取消」";
      dsSend(X, [bot("🗺 沒有「" + name.substring(0, 20) + "」這張平面圖，什麼都沒有改。\n\n" + dsaMapNames())], [{ l: "取消", m: "取消" }]);
      return true;
    }
    o[c] = name;
    S.fld = null;
    dsT(X, 1, "櫃名「" + name + "」對得上 → 指定這支藥用那張平面圖（全院立刻生效）");
    dsaMapDone(S, X, c, before, name);
    return true;
  }
  function dsaMapDone(S, X, c, before, after) {
    dsEfDone(S, X, c, { label: "平面圖", before: before, after: after, ns: 1 });
    dsT(X, 1, "平面圖的設定存在機器人的「平面圖設定」裡，不在試算表 → 不會記進「匯入紀錄」、也沒有「↩️ 復原」");
    X.sheet = "改平面圖設定（不在試算表裡）";
  }
  /*/SIMDEV*/

  /* ───────── 開發者的清單校對（第 17 批；第 4 課「清單校對」的練習聊天室，LINE 這一半）─────────
     這一個檔放：假的「印出來的清單」（練習用的五張紙，每一張是 AI 看照片讀出來的樣子）、拿清單去對工作表1 的演算法（08 的 _lstParse_／_lstDiff_／_lstSim_）、
     待審清單（08 的 _lstGet_／_lstAdd_／_lstSave_）、聊天室裡的 LINE 這一半：打「清單校對」「清單校對 保留」「清單校對 清空」「清單校對 結束」（08 的 _impDevCmd_ 裡 /^清單校對/ 那一段）、
     傳一張清單的照片（08 的 _lstFlow_），和網頁那一半背後的函式（08 的 lstData／lstUpload／lstApply／lstDrop／lstDropAll）。
     網頁畫面本身（上傳、一筆一筆審、全部寫進、全部刪除）在 _learn_dev_sim_lw.js。
     每一句機器人說的話都照上面那些函式拼字串的那一句寫；tools/learn_dev_sim_test.js 的 G 段把同一串輸入丟給真的 LINE 程式碼（AI 那一趟換成這幾張紙的內容）逐句比對。
     練習的是「編的」試算表和「編的」紙：什麼都不會真的寫；AI 讀照片的那一趟，練習聊天室直接給這張紙上的內容。 */
  /*SIMDEV*/
  var DSL_SAME = 0.8, DSL_SUSPECT = 0.4, DSL_SHIFT_MIN = 8, DSL_SHIFT_RATE = 0.5, DSL_KEEP_DAYS = 3;
  var DSL_USER = "示範甲";   /* 網頁「寫進工作表1」記進「匯入紀錄」的操作者是開發者的名字；批次號是「校對＋月日」（dslBatch：練習用的假日期是 09/15，「時間過了 3 天」會往後走） */
  function dslBatch(S) { return "校對" + dsMD(S); }
  /* 五張練習用的紙。lines＝AI 把照片讀成的字（一行一個品項：code、商品名、位置，用 Tab 隔開；最後多一個 H＝紅筆手改的）；show＝聊天室裡那張照片上看得到的幾行；
     kb／sec＝照片大小、AI 花的秒數（真的是量出來的，練習用編的）；err＝AI 那一趟失敗的原因（沒有就是讀得出來） */
  var DSL_PAPERS = [
    { key: "A", label: "清單 A（一般的一張）", file: "清單A.jpg", kb: 312, sec: 4.8, show: ["K3　90101", "C3　90105", "B1　90131", "⋮"], lines: [
      "90101\tTESTOLOL* 25MG TAB\tK3\tH",
      "90102\tDEMOSYRUP* 60ML\t水棧一",
      "90103\tMODELPRIL* 5MG TAB\tB1",
      "90105\tTESTONIN-PLUS* 50MG CAP\tC3",
      "90106\tTESTAMOL* 500MG TAB\tD1",
      "90108\tEXAMPLIDE* 20MG TAB\tK2",
      "90110\tBREATHEZ* 10MG TAB\tD4",
      "90112\tSAMPLEXIN* 500MG TAB\tK3",
      "90114\tTESTBETA* 50MG TAB\tK3",
      "90116\tSAMPLECOR* 10MG TAB\tB1",
      "90117\tMODELTAB* 25MG TAB\tB1",
      "90131\tEXAMPLEX* 10MG TAB\tB1"
    ] },
    { key: "B", label: "清單 B（另一頁）", file: "清單B.jpg", kb: 287, sec: 5.2, show: ["K3　90107", "水棧一　90109", "D1　90104", "⋮"], lines: [
      "90102\tDEMOSYRUP* 60ML\t水棧一",
      "90103\tMODELPRIL* 5MG TAB\tB1",
      "90104\tSAMPLESPOT* 20MG TAB\tD1",
      "90107\tDEMOCARD* 10MG TAB\tK3\tH",
      "90109\tCOUGHLESS* 100ML\t水棧一",
      "90111\tSAMPLEXIN* 250MG CAP\tK2",
      "90115\tTESTLOL-X* 25MG TAB\tA3",
      "90118\tEXAMPLOL* 40MG TAB\tB1",
      "90119\tSAMPLEGEL* 20MG CAP\tB1",
      "90132\tDEMOQUIN* 5MG TAB\tK2"
    ] },
    { key: "C", label: "清單 C（紙有點彎）", file: "清單C.jpg", kb: 298, sec: 5.1, show: ["水棧一　90101", "B1　90102", "K2　90103", "⋮"], lines: [
      "90101\tTESTOLOL* 25MG TAB\t水棧一",
      "90102\tDEMOSYRUP* 60ML\tB1",
      "90103\tMODELPRIL* 5MG TAB\tK2",
      "90104\tSAMPLESPOT* 20MG TAB\tC3",
      "90105\tTESTONIN* 100MG CAP\tD1",
      "90106\tTESTAMOL* 500MG TAB\tK2",
      "90108\tEXAMPLIDE* 20MG TAB\tD4",
      "90110\tBREATHEZ* 10MG TAB\tK3",
      "90112\tSAMPLEXIN* 500MG TAB\tK3",
      "90114\tTESTBETA* 50MG TAB\tB1",
      "90116\tSAMPLECOR* 10MG TAB\tB1",
      "90117\tMODELTAB* 25MG TAB\tB1"
    ] },
    { key: "D", label: "清單 D（有看不懂的行）", file: "清單D.jpg", kb: 305, sec: 4.6, show: ["水棧一　90109", "K2　9O104", "B7　90116", "⋮"], lines: [
      "90109\tCOUGHLESS* 100ML\t水棧一",
      "9O104\tSAMPLESPOT* 20MG TAB\tK2",
      "90110\tBREATHEZ* 10MG TA8\tD4",
      "90116\tSAMPLECOR* 10MG TAB\tB7",
      "90107\tTESTJELLY* 2% GEL\tK2",
      "90112\tSAMPLEXIN* 500MG TAB\tK3"
    ] },
    { key: "E", label: "清單 E（AI 剛好塞車）", file: "清單E.jpg", kb: 301, sec: 0, show: ["K3　90112", "K3　90114", "⋮"], err: "HTTP 503", lines: [] }
  ];
  function dslPaper(key) { var i; for (i = 0; i < DSL_PAPERS.length; i++) if (DSL_PAPERS[i].key === key) return DSL_PAPERS[i]; return null; }
  /* ───── 拿清單去對工作表1（08 的 _lstParse_、_lstNorm_、_lstSim_、_lstDiff_）───── */
  function dslParse(text) {
    var rows = [], bad = [], lines = String(text === null || text === undefined ? "" : text).split(/\r?\n/), i, ln, f, code, brand, loc, hand;
    for (i = 0; i < lines.length; i++) {
      ln = lines[i].replace(/^[\s\-•]+/, "").trim();
      if (!ln) continue;
      if (/^code\b/i.test(ln)) continue;
      f = ln.split("\t");
      code = (f[0] || "").replace(/\s+/g, "");
      brand = (f[1] || "").replace(/\s+/g, " ").trim();
      loc = (f[2] || "").replace(/\s+/g, " ").trim();
      hand = /^H$/i.test((f[3] || "").trim());
      if (!/^\d{4,6}$/.test(code)) {
        if (ln.length > 3) bad.push(ln.substring(0, 60));
        continue;
      }
      rows.push({ code: code, brand: brand, loc: loc, hand: hand });
    }
    return { rows: rows, bad: bad };
  }
  function dslNorm(s) {   /* 全形轉半形、大寫，拿掉空白和 * · ・ ． . - _ */
    return String(s === null || s === undefined || s === "" ? "" : s).toUpperCase().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 65248); }).replace(/[\s*·・．.\-_]/g, "");
  }
  function dslNe(a, b) { return dslNorm(a) !== dslNorm(b); }
  function dslSim(a, b) {   /* 1 － 編輯距離 ÷ 較長那串：1＝一模一樣 */
    var x = dslNorm(a), y = dslNorm(b), n = x.length, m = y.length, prev = [], cur = [], i, j;
    if (!x && !y) return 1;
    if (!x || !y) return 0;
    if (x === y) return 1;
    for (j = 0; j <= m; j++) prev[j] = j;
    for (i = 1; i <= n; i++) {
      cur = [i];
      for (j = 1; j <= m; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x.charCodeAt(i - 1) === y.charCodeAt(j - 1) ? 0 : 1));
      prev = cur;
    }
    return 1 - prev[m] / Math.max(n, m);
  }
  function dslSheetIdx(S) {   /* 工作表1 現在的樣子：CODE → { brand, loc }，和出現過的位置（_lstDiff_ 是直接讀試算表，不是讀快取）*/
    var byCode = {}, locSet = {}, i, c, r, L;
    for (i = 0; i < S.order.length; i++) {
      c = S.order[i];
      if (!c) continue;
      r = S.rows[c];
      L = String(r.loc === null || r.loc === undefined ? "" : r.loc).trim();
      if (L) locSet[dslNorm(L)] = L;
      byCode[dsNorm(c)] = { brand: String(r.b === null || r.b === undefined ? "" : r.b).trim(), loc: L };
    }
    return { byCode: byCode, locSet: locSet };
  }
  function dslDiff(S, rows) {
    var out = [], odd = [], suspect = [], same = 0, ix = dslSheetIdx(S), i, p, cur, chg, both, sim, locDiff, matched, shifted;
    for (i = 0; i < rows.length; i++) {
      p = { code: rows[i].code, brand: rows[i].brand, loc: rows[i].loc, hand: rows[i].hand };
      cur = ix.byCode[p.code];
      if (!cur) { out.push({ kind: "new", code: p.code, brand: p.brand, loc: p.loc, hand: p.hand }); continue; }
      chg = [];
      both = !!(p.brand && cur.brand);
      sim = both ? dslSim(cur.brand, p.brand) : 0;
      if (both && sim < DSL_SUSPECT) { suspect.push(p.code + " 清單上是「" + p.brand + "」，但工作表1 的 " + p.code + " 是「" + cur.brand + "」→ code 可能讀錯"); continue; }
      if (p.loc && !ix.locSet[dslNorm(p.loc)]) { odd.push(p.code + " 讀到位置「" + p.loc + "」（工作表1 沒有這個位置）"); p.loc = ""; }
      if (p.loc && dslNe(cur.loc, p.loc)) chg.push(["loc", "位置", cur.loc, p.loc]);
      if (p.brand && dslNe(cur.brand, p.brand) && !(both && sim >= DSL_SAME)) chg.push(["brand", "商品名", cur.brand, p.brand]);
      if (!chg.length) { same++; continue; }
      out.push({ kind: "edit", code: p.code, brand: cur.brand, chg: chg, hand: p.hand });
    }
    locDiff = out.filter(function(d) { return d.kind === "edit" && d.chg.some(function(c) { return c[0] === "loc"; }); }).length;
    matched = same + out.filter(function(d) { return d.kind === "edit"; }).length;
    shifted = matched >= DSL_SHIFT_MIN && locDiff / matched > DSL_SHIFT_RATE;
    return { diffs: shifted ? [] : out, same: same, odd: odd, suspect: suspect, matched: matched, locDiff: locDiff, shifted: shifted };
  }
  /* AI 看照片那一趟（08 的 _lstRead_）：練習聊天室直接給這張紙上的字；每一個 code 只留第一次出現的 */
  function dslRead(P) {
    var got, seen = {}, uniq = [], i;
    if (P.err) return { rows: [], bad: [], passes: 1, err: P.err, fr: "" };
    got = dslParse(P.lines.join("\n"));
    for (i = 0; i < got.rows.length; i++) {
      if (seen[got.rows[i].code]) continue;
      seen[got.rows[i].code] = 1;
      uniq.push(got.rows[i]);
    }
    return { rows: uniq, bad: got.bad, passes: 1, err: "", fr: "STOP" };
  }

  /* ───── 待審清單（08 的 _lstGet_、_lstAdd_、_lstSave_、_lstPn_）───── */
  /* st＝清單校對的狀態：mode＝校對模式開著嗎（真的是快取裡的 lsttry 旗標，30 分鐘）、pend＝待審清單（新的在最前面）、pn＝LINE 這邊傳到第幾張（真的是快取裡的計數，6 小時）、
     page＝網頁現在的樣子（_learn_dev_sim_lw.js）、add＝最近一次存進待審的結果 { add 新增幾筆, rep 換掉原本幾筆 } */
  function dslNew() { return { mode: 0, pend: [], pn: 0, page: dslPageNew(), add: { add: 0, rep: 0 }, lck: dskNew() }; }
  function dslGet(S) {   /* 待審超過 3 天的自動清掉 */
    var L = S.ops.lst, keep = [], i;
    for (i = 0; i < L.pend.length; i++) if ((L.pend[i].age || 0) < DSL_KEEP_DAYS) keep.push(L.pend[i]);
    L.pend = keep;
    return keep;
  }
  function dslCount(S) { return dslGet(S).length; }
  function dslClear(S) { var n = dslGet(S).length; S.ops.lst.pend = []; return n; }
  function dslCopy(o) { return JSON.parse(JSON.stringify(o)); }
  /* 存進待審：同一支藥同一種（code|kind）已經在待審裡的，原地換成新的；沒有的才放到最前面。回待審總共幾筆 */
  function dslAdd(S, diffs, when, pn) {
    var L = S.ops.lst, arr = dslGet(S), add = 0, rep = 0, i, j, d, k, at;
    for (i = 0; i < diffs.length; i++) {
      d = dslCopy(diffs[i]);
      k = d.code + "|" + d.kind;
      d.when = when;
      d.age = 0;
      d.id = d.code + "_" + d.kind;
      if (pn) d.pn = pn;
      at = -1;
      for (j = 0; j < arr.length; j++) if (arr[j].code + "|" + arr[j].kind === k) { at = j; break; }
      if (at >= 0) { arr[at] = d; rep++; } else { arr.unshift(d); add++; }
    }
    L.add = { add: add, rep: rep };
    return arr.length;
  }
  function dslPn(S) { return ++S.ops.lst.pn; }
  function dslOn(S) { return !!S.ops.lst.mode; }

  /* ───── 聊天室裡的 LINE 這一半 ───── */
  var DSL_QCHIPS = [["📤 多張上傳", "up"], ["📋 待審清單", "rv"], ["📍 位置查核", "位置查核"], ["💾 保留清單", "清單校對 保留"], ["🗑 不保留清單", "清單校對 清空"], ["🚪 退出", "清單校對 結束"]];
  function dslQuick() {   /* 08 的 _lstQuick_：前兩顆是開網頁（練習聊天室打開下面那一塊網頁），後四顆是打字（📍 位置查核＝打「位置查核」） */
    var q = [], i, c;
    for (i = 0; i < DSL_QCHIPS.length; i++) {
      c = DSL_QCHIPS[i];
      q.push(i < 2 ? { l: c[0], web: c[1] } : { l: c[0], m: c[1] });
    }
    return q;
  }
  function dslMenuText(n, ni) {
    return "📋 清單校對：三種都可以 ——\n\n" + "📤 多張上傳（建議）：按下面的按鍵開網頁，一次選好幾張一起送，跑完直接在同一頁審。\n" + "📷 一張一張：直接在這裡傳照片（位置清單那種表格），我會累積。\n" + "📍 位置查核：去貨架查某一格，按「📍 位置查核」，打位置（例如 A1）或傳貨架照片，逐支打勾、不在的當場改位置。\n\n" + "每張我會用 code 逐列對工作表1，回「讀到幾筆／一樣幾筆／不一樣幾筆」，\n" + "然後按「待審網站」在網頁上一筆一筆按「寫進工作表1」。\n\n" + "・整張兩欄也讀得出來，但一次拍一欄會更準\n" + "・紅筆手改的會標出來（劃掉的算舊的）\n" + "・「表上沒有」的可以直接按「匯入工作表1」新增\n" + "・寫進去的都記在「匯入紀錄」，7 天內打「復原」可還原\n\n" + (n ? "目前待審 " + n + " 筆（3 天後自動清掉）。\n" : "目前沒有待審。\n") + (ni ? "📥 待匯入分頁有 " + ni + " 筆，也在「待審網站」裡。\n" : "") + "★ 這 30 分鐘內您傳的照片一律走校對，就算 OCR辨識 開著也不會出卡片（v10.22.1 修）。\n\n" + "🔒 下面兩個網頁按鍵用的是你的開發者連結：只在綁定過的地方打得開（最多 3 處）。新的地方打開後，打「開發者網頁 綁定」拿 6 位數碼輸入。";
  }
  function dslImpCount(S) {   /* 待匯入分頁有幾列要審（08 的 _lstImpRows_().rows.length） */
    var rd = dsImpRead(S);
    return rd.err ? 0 : rd.rows.length;
  }
  /* 08 的 _impDevCmd_ 裡 /^清單校對/ 那一段 */
  function dslCmd(S, X, t, flat) {
    var L = S.ops.lst, n, ni, nc, lckHad;
    dsT(X, 1, "是「清單校對」這個開發者指令（藥師打沒有用）");
    X.sheet = "沒動（清單校對只動機器人的暫存，不動試算表）";
    if (/結束|停|關/.test(flat)) {
      L.mode = 0;
      lckHad = dskLeave(S);
      dsT(X, 1, "有「結束」→ 把校對模式關掉（之後傳的照片又是平常的查藥）");
      dsT(X, 1, "位置查核的模式和打勾的暫存一起清掉" + (lckHad ? "（這次有東西被清掉）" : "（這次本來就沒有）"));
      if (/清空|不保留|丟掉/.test(flat)) {
        n = dslClear(S);
        dsT(X, 1, "有「清空」→ 待審清單也一起清掉：" + n + " 筆（還沒寫進工作表1 的，不能找回）");
        dsoRep(X, "📋 清單校對：已結束，待審 " + n + " 筆已清掉。", null, "0.7", "0.2");
        X.reply = "「已結束，待審 " + n + " 筆已清掉」（最後有一行 ⏱）";
        return true;
      }
      n = dslCount(S);
      dsT(X, 1, "待審清單留著：" + n + " 筆（3 天後自動清掉）");
      dsoRep(X, "🚪 已退出清單校對。\n待審 " + n + " 筆還留著，網址開著就能繼續審；不要了就再進來按「🗑 不保留清單」。" + (lckHad ? "\n📍 位置查核的勾選暫存也清掉了。" : ""), null, "0.6", "0.2");
      X.reply = "「已退出清單校對」＋待審還留著幾筆" + (lckHad ? "＋位置查核的暫存也清掉了" : "") + "（這一則沒有帶小按鈕，輸入框上面換回平常那排）";
      return true;
    }
    if (/^清單校對(保留|留著|留)$/.test(flat)) {
      L.mode = 1;
      nc = dslCount(S);
      dsT(X, 1, "是「保留」→ 只管清單：待審留著，還在校對模式（再算 30 分鐘）");
      dsoRep(X, "💾 待審 " + nc + " 筆留著。\n還在校對模式，可以繼續傳照片；要走按「🚪 退出」。", dslQuick(), "0.7", "0.2");
      X.reply = "「待審 " + nc + " 筆留著」＋下面六顆小按鈕（前兩顆開網頁）";
      return true;
    }
    if (/清空|重來|不保留/.test(flat)) {
      L.mode = 1;
      nc = dslClear(S);
      dsT(X, 1, "是「清空」→ 待審清單全部清掉：" + nc + " 筆；還在校對模式（再算 30 分鐘）");
      dsoRep(X, "🗑 待審 " + nc + " 筆全部清掉了。\n還在校對模式，可以繼續傳照片；要走按「🚪 退出」。", dslQuick(), "0.7", "0.2");
      X.reply = "「待審 " + nc + " 筆全部清掉了」＋下面六顆小按鈕";
      return true;
    }
    L.mode = 1;
    dskBackToList(S);
    n = dslCount(S);
    ni = dslImpCount(S);
    dsT(X, 1, "進入校對模式：接下來 30 分鐘內你傳的照片，一律當成清單去校對（不會出藥品卡片）");
    dsT(X, 1, "如果剛才在位置查核：貨架照片的模式、等新位置的那一句關掉；已經打的勾還留著（要走按「🚪 退出」才清）");
    dsT(X, 1, "數一下現在待審幾筆：" + n + " 筆" + (ni ? "；「待匯入」分頁另有 " + ni + " 筆" : ""));
    dsoRep(X, dslMenuText(n, ni), dslQuick(), "0.8", "0.2");
    X.reply = "說明（三種做法：網頁多張上傳、聊天室一張一張傳、位置查核）＋下面六顆小按鈕（前兩顆開網頁，「📍 位置查核」進位置查核，後三顆管清單和校對模式）";
    return true;
  }
  /* 聊天室裡看到的那張紙（您傳的照片，上面一行一個品項） */
  function dslBubble(P) { return prn(P.show.slice()); }
  /* 傳一張照片（練習專用的按鈕：五張清單 A～E、六張貨架照片 S1～S6）：02 的 _picFlow_ 先看有沒有在等某支藥的照片；再看是不是位置查核（13 的 _lckFlow_）；
     再看是不是校對模式（08 的 _lstFlow_）；都不是才是平常的拍照查藥 */
  function dslImg(S, X, key) {
    var P = dslPaper(key), SH = P ? null : dskShelf(key), L = S.ops.lst, rd, df, left, kb, ln, show, i, d, cg, nEdit, nNew, w, t;
    X.msgs.push(SH ? dskShelfMsg(SH) : dslBubble(P));
    if (S.fld && (S.fld.k === "pic" || S.fld.k === "npic")) { dspRecv(S, X); return true; }   /* 在等某支藥的照片：這張照片就是那支藥的照片 */
    dsT(X, 1, "收到一張照片 → 先看有沒有在等某支藥的照片（📷 換照片）：沒有");
    if (L.lck.mode) return dskPhotoFlow(S, X, SH || dskPaperAsShelf(P));   /* 位置查核模式（30 分鐘內按過「📍 位置查核」或打過位置）：不管是貨架還是紙，都交給位置查核 */
    dsT(X, 0, "再看是不是在位置查核裡（30 分鐘內按過「📍 位置查核」或打過一個位置）：不是");
    if (!L.mode) {
      dsT(X, 0, "再看是不是在校對模式（30 分鐘內打過「清單校對」）：不是 → 這張照片會當成平常的「拍照查藥」");
      dsSend(X, [act(SH ? "練習聊天室不示範「傳照片查藥」：真的 LINE 會用 AI 讀照片、找出是哪一支藥（藥師版教學第 3 課有）。想查貨架，先按「📍 位置查核」（或打「位置查核」，30 分鐘內有效），再傳一次。" : "練習聊天室不示範「傳照片查藥」：真的 LINE 會用 AI 讀照片、找出是哪一支藥（藥師版教學第 3 課有）。要把照片當清單校對，先打「清單校對」進入校對模式（30 分鐘內有效），再傳一次。")]);
      X.sheet = "沒動"; X.reply = "（這個練習不示範）";
      return true;
    }
    dsT(X, 1, "再看是不是在校對模式（30 分鐘內打過「清單校對」）：是 → 這張照片當成清單，不查藥");
    if (SH) {
      dsT(X, 2, "這張是貨架照片，不是印出來的清單：沒有 code、商品名的表格 → 讀不到東西（要查貨架，先按「📍 位置查核」）");
      P = dskAsPaper(SH);
    }
    kb = P.kb;
    rd = dslRead(P);
    if (rd.err) {
      dsT(X, 0, "請 AI 把照片讀成一行一個品項：失敗（" + rd.err + "）→ 這一張什麼都沒存");
      dsSend(X, [bot("📋 清單校對：讀不出來 😥\n" + rd.err + "\n\n（照片 " + kb + " KB、送了 " + rd.passes + " 趟）")]);
      X.sheet = "沒動"; X.reply = "「讀不出來」＋原因（沒有帶小按鈕，輸入框上面換回平常那排）";
      return true;
    }
    df = dslDiff(S, rd.rows);
    dsT(X, 1, "請 AI 把照片讀成一行一個品項（code、商品名、位置）：讀到 " + rd.rows.length + " 筆" + (rd.bad.length ? "，另有 " + rd.bad.length + " 行 code 讀不出來（不拿去比對）" : ""));
    nEdit = df.diffs.filter(function(x) { return x.kind === "edit"; }).length;
    nNew = df.diffs.filter(function(x) { return x.kind === "new"; }).length;
    dsT(X, 1, "用 code 逐列去對工作表1：一樣 " + df.same + "、不一樣 " + nEdit + "、表上沒有 " + nNew);
    if (df.shifted) dsT(X, 0, "對到 " + df.matched + " 列，其中 " + df.locDiff + " 列位置不一樣（超過一半）→ 幾乎一定是紙彎了、位置整批對錯行 → 整批擋下，一筆都不進待審");
    if (df.odd.length) dsT(X, 0, df.odd.length + " 列的位置在工作表1 從來沒出現過 → 位置不拿去比（那一列其他格照比）");
    if (df.suspect.length) dsT(X, 0, df.suspect.length + " 列的 code 對到的是別支藥（商品名差太多）→ code 可能讀錯，沒進待審");
    left = dslAdd(S, df.diffs, dsaNow(S), dslPn(S));
    if (df.diffs.length) dsT(X, 1, "把差異存進待審清單：新增 " + L.add.add + " 筆" + (L.add.rep ? "、換掉原本同一支藥的 " + L.add.rep + " 筆（同一支藥同一種差異只留最新一張）" : "") + "；待審共 " + left + " 筆");
    else dsT(X, 1, "沒有差異可以存；待審清單不變，共 " + left + " 筆");
    ln = ["📋 清單校對　這一張"];
    ln.push("讀到 " + rd.rows.length + " 筆　一樣 " + df.same + "　不一樣 " + nEdit + "　表上沒有 " + nNew);
    ln.push(P.sec + " 秒　照片 " + kb + " KB　AI " + rd.passes + " 趟");
    if (rd.bad.length) ln.push("⚠️ 有 " + rd.bad.length + " 行 code 讀不出來（沒拿去比對）：\n　" + rd.bad.slice(0, 3).join("\n　"));
    if (df.shifted) {
      ln.push("");
      ln.push("🚫 這張整批擋下來了，一筆都沒進待審。");
      ln.push("對到 " + df.matched + " 列，其中 " + df.locDiff + " 列位置不一樣（超過一半）——");
      ln.push("這通常不是資料真的變了，是**紙彎了或斜了，位置那一欄整批對錯行**。");
      ln.push("請把紙壓平、正面拍，或一次只拍一欄，再傳一次。");
    }
    if (df.odd.length) {
      ln.push("");
      ln.push("⚠️ 有 " + df.odd.length + " 列的位置在工作表1 從來沒出現過（沒拿去比對）：");
      ln.push("　" + df.odd.slice(0, 4).join("\n　"));
    }
    if (df.suspect.length) {
      ln.push("");
      ln.push("🚫 有 " + df.suspect.length + " 列 code 可能讀錯（對到的是別支藥，沒進待審）：");
      ln.push("　" + df.suspect.slice(0, 4).join("\n　"));
    }
    show = df.diffs.slice(0, 5);
    if (show.length) {
      ln.push("");
      ln.push("這一張的差異（前 " + show.length + " 筆）：");
      for (i = 0; i < show.length; i++) {
        d = show[i];
        if (d.kind === "new") ln.push("🔵 " + d.code + "　表上沒有（" + (d.brand || "") + (d.loc ? "／" + d.loc : "") + "）");
        else for (w = 0; w < d.chg.length; w++) {
          cg = d.chg[w];
          ln.push("🟡 " + d.code + "　" + cg[1] + "：" + (cg[2] || "—") + " → " + cg[3] + (d.hand ? "　✍️" : ""));
        }
      }
    }
    ln.push("");
    ln.push("待審總共 " + left + " 筆（3 天後自動清掉）。可以再傳下一張累積，或按「📋 待審清單」一筆一筆審。");
    ln.push("★ 一次要傳好幾張的話，按「📤 多張上傳」在網頁上一起送比較快。");
    t = ln.join("\n").substring(0, 4900);
    dsSend(X, [bot(t)], dslQuick());
    X.sheet = "沒動（只是比對；要寫進工作表1，到網頁上一筆一筆按「寫進工作表1」）";
    X.reply = (df.shifted ? "「這張整批擋下來了」" : "「這一張」的結果（讀到幾筆、一樣、不一樣、表上沒有）＋差異") + "＋下面六顆小按鈕（網頁要按「📋 待審清單」或重新整理才看得到新的）";
    return true;
  }

  /* ───── 網頁那一半背後的函式（08 的 lstData／lstUpload／lstApply／lstDrop／lstDropAll；網頁用「開發者網頁」的鑰匙呼叫，練習聊天室略過驗證）───── */
  function dslImpRows(S) {   /* 08 的 _lstImpRows_：「待匯入」分頁上要審的列 */
    var rd = dsImpRead(S), out = [], i, j, r, c, f, chg;
    if (rd.err) return { rows: [], problems: rd.err !== "empty" ? [{ n: "-", why: rd.err === "nomap" ? "待匯入分頁的標題列認不出來（要有 CODE／商品名／位置…）" : rd.err }] : [] };
    for (i = 0; i < rd.rows.length; i++) {
      r = rd.rows[i];
      chg = [];
      for (j = 0; j < (r.chg || []).length; j++) {
        c = r.chg[j];
        f = dsImpFieldByKey(c[0]);
        chg.push([c[0], c[1], c[2], c[3] || "", f ? f.label : c[0]]);
      }
      out.push({ id: "imp_" + r.code, n: r.n, kind: r.kind, code: r.code, v: dslCopy(r.v), chg: chg, w: (r.w || []).slice() });
    }
    return { rows: out, problems: dslCopy(rd.problems || []) };
  }
  function dslWebData(S) { return { rows: dslCopy(dslGet(S)), imp: dslImpRows(S) }; }
  function dslWebUpload(S, key, pn) {
    var P = dslPaper(key), rd, df, edit = 0, neu = 0, i, left;
    if (!P) return { err: "讀不出來：沒有這張照片" };
    rd = dslRead(P);
    if (rd.err) return { err: rd.err };
    df = dslDiff(S, rd.rows);
    if (df.shifted) return { err: "整批對錯行了，紙壓平再拍一次" };
    for (i = 0; i < df.diffs.length; i++) { if (df.diffs[i].kind === "new") neu++; else edit++; }
    left = dslAdd(S, df.diffs, dsaNow(S), Math.max(0, Math.min(999, parseInt(pn, 10) || 0)));
    return { read: rd.rows.length, edit: edit, neu: neu, bad: rd.bad.length, left: left, full: left >= 500, passes: rd.passes, sec: P.sec };
  }
  /* 在「待匯入」分頁上找這個 CODE 的那一列（08 的 lstApply／lstDrop 的 imp_ 那一段） */
  function dslImpFind(S, code) {
    var rd = dsImpRead(S), i, row = null;
    if (rd.err) return { rd: null, row: null };
    for (i = 0; i < rd.rows.length; i++) if (rd.rows[i].code === code) row = rd.rows[i];
    return { rd: rd, row: row };
  }
  function dslWebApply(S, id, vals) {
    var st = { b: dslBatch(S), u: DSL_USER }, sid = String(id || ""), code, f, row, rd, apply, v, ks, i, chg, c, nv, res, arr, hit = null, at = -1, left;
    if (sid.indexOf("imp_") === 0) {
      code = sid.substring(4);
      f = dslImpFind(S, code);
      rd = f.rd; row = f.row;
      if (!rd) return { err: "讀不到待匯入分頁" };
      if (!row) return { err: "待匯入分頁裡已經沒有 " + code + " 這一列了" };
      if (row.kind === "add") {
        v = dslCopy(row.v);
        ks = ["brand", "loc", "form", "zh", "gen"];
        for (i = 0; i < ks.length; i++) if (vals && vals[ks[i]] !== undefined) v[ks[i]] = dsImpNorm(vals[ks[i]]);
        if (!v.brand && !v.zh) return { err: "商品名和中文名至少要填一個" };
        apply = { kind: "add", code: code, v: v };
      } else {
        chg = [];
        for (i = 0; i < row.chg.length; i++) {
          c = row.chg[i];
          nv = vals && vals[c[0]] !== undefined ? dsImpNorm(vals[c[0]]) : c[2];
          if (nv === c[1]) continue;
          chg.push([c[0], c[1], nv, "對"]);
        }
        if (!chg.length) return { err: "沒有要改的欄位" };
        apply = { kind: "edit", code: code, chg: chg };
      }
      res = dsImpApply(S, null, st, apply);
      if (res && res.err) return { err: res.err };
      dsImpRemoveStaging(S, { codeCol: rd.map && rd.map.map ? rd.map.map.code : -1, rows: [] }, { n: row.n, code: code });
      dsCacheWarm(S);
      return { ok: true, cells: res.cells || 0, msg: (apply.kind === "add" ? "已新增到工作表1" : "已寫入 " + (res.cells || 0) + " 格") + "，並從待匯入分頁移掉", sync: 1 };
    }
    arr = dslGet(S);
    for (i = 0; i < arr.length; i++) if (arr[i].id === sid) { hit = arr[i]; at = i; }
    if (!hit) return { err: "這一筆已經不在待審清單裡了" };
    if (hit.kind === "new") {
      v = { brand: dsImpNorm(vals && vals.brand !== undefined ? vals.brand : hit.brand), loc: dsImpNorm(vals && vals.loc !== undefined ? vals.loc : hit.loc), form: dsImpNorm(vals && vals.form), zh: dsImpNorm(vals && vals.zh), gen: dsImpNorm(vals && vals.gen), ref: "", nk: "", nm: "" };
      if (!v.brand && !v.zh) return { err: "商品名和中文名至少要填一個" };
      apply = { kind: "add", code: hit.code, v: v };
    } else {
      chg = [];
      for (i = 0; i < hit.chg.length; i++) {
        c = hit.chg[i];
        nv = vals && vals[c[0]] !== undefined ? vals[c[0]] : c[3];
        if (nv === c[2]) continue;
        chg.push([c[0], c[2], nv, "對"]);
      }
      if (!chg.length) return { err: "沒有要改的欄位" };
      apply = { kind: "edit", code: hit.code, chg: chg };
    }
    res = dsImpApply(S, null, st, apply);
    if (res && res.err) return { err: res.err };
    arr.splice(at, 1);
    dsCacheWarm(S);
    left = arr.length;
    return { ok: true, cells: res.cells || 0, left: left, msg: apply.kind === "add" ? "已新增到工作表1" : "已寫入 " + (res.cells || 0) + " 格", sync: 1 };
  }
  function dslWebDrop(S, id) {
    var sid = String(id || ""), code, f, arr, keep = [], i;
    if (sid.indexOf("imp_") === 0) {
      code = sid.substring(4);
      f = dslImpFind(S, code);
      if (!f.rd) return { err: "讀不到待匯入分頁" };
      if (!f.row) return { ok: true, msg: "待匯入分頁裡已經沒有這一列" };
      dsImpRemoveStaging(S, { codeCol: f.rd.map && f.rd.map.map ? f.rd.map.map.code : -1, rows: [] }, { n: f.row.n, code: code });
      return { ok: true, msg: "已從待匯入分頁移掉（沒有寫進工作表1）" };
    }
    arr = dslGet(S);
    for (i = 0; i < arr.length; i++) if (arr[i].id !== sid) keep.push(arr[i]);
    S.ops.lst.pend = keep;
    return { ok: true, left: keep.length };
  }
  function dslWebDropAll(S, ids) {
    var list = ids || [], impIds = [], want = {}, wantN = 0, n = 0, left = 0, bad = [], keep, arr, i, id, r;
    for (i = 0; i < list.length; i++) {
      id = String(list[i] || "");
      if (!id) continue;
      if (id.indexOf("imp_") === 0) impIds.push(id); else if (!want[id]) { want[id] = 1; wantN++; }
    }
    if (wantN) {
      arr = dslGet(S);
      keep = [];
      for (i = 0; i < arr.length; i++) { if (want[arr[i].id]) n++; else keep.push(arr[i]); }
      S.ops.lst.pend = keep;
      left = keep.length;
    } else left = dslGet(S).length;
    for (i = 0; i < impIds.length; i++) {
      r = dslWebDrop(S, impIds[i]);
      if (r && r.err) bad.push(impIds[i].substring(4) + "：" + r.err); else n++;
    }
    return { ok: true, n: n, left: left, bad: bad };
  }

  /* ───── 練習專用的按鈕（真的 LINE 沒有）：傳一張清單的照片、讓時間過去 ───── */
  var DSL_SHORT = { A: "一般", B: "另一頁", C: "紙彎了", D: "有看不懂的行", E: "AI 塞車" };
  function dslActs(S) {
    var L = S.ops.lst, K = L.lck, out = [], i, p;
    for (i = 0; i < DSL_PAPERS.length; i++) {
      p = DSL_PAPERS[i];
      out.push({ id: "lst:" + p.key, w: "line", l: "📷 傳清單 " + p.key + "（" + DSL_SHORT[p.key] + "）", v: p.key });
    }
    out = out.concat(dskActs(S));   /* 六張貨架照片（位置查核）*/
    if (L.mode || K.mode || K.edit || K.pend) out.push({ id: "lst:min30", w: "oth", l: "⏰ 時間過了 30 分鐘" });
    if (dskHasSt(K) || L.pn) out.push({ id: "lst:hour7", w: "oth", l: "⏰ 時間過了 7 小時" });
    if (dslCount(S) || L.mode || L.pn || dskAny(S)) out.push({ id: "lst:day3", w: "oth", l: "⏰ 時間過了 3 天" });
    return out;
  }
  /* 做到一半的事（新藥填到一半、改某一格、一次改多項、匯入／復原確認）有幾件還在 */
  function dslHalf(S) {
    var out = [];
    if (S.wiz) out.push("新藥填到一半");
    if (S.fld) out.push("改某一格");
    if (S.mef || S.mefOpen) out.push("一次改多項");
    if (S.imp) out.push("匯入／復原確認");
    return out;
  }
  /* 時間往前走 sec 秒（練習時鐘是 _learn_dev_sim_adv.js 那一個）：邀請碼、「做到一半」的暫存（新藥 30 分鐘、改某一格 15 分鐘、一次改多項 15 分鐘、匯入 30 分鐘）跟著過期；回過期的有哪幾件 */
  function dslClockGo(S, sec) {
    var d = S.ops.dev, before = dslHalf(S), after, out = [], i;
    d.now += sec;
    dsaExpire(d);
    dsaAge(S);
    dskAge(S);   /* 位置查核的旗標（30 分鐘）、等新位置（10 分鐘）、打勾的暫存（6 小時）*/
    after = dslHalf(S);
    for (i = 0; i < before.length; i++) if (after.indexOf(before[i]) < 0) out.push(before[i]);
    return out;
  }
  function dslTime(S, X, id) {
    var L = S.ops.lst, before, i, lost, tail, snap, lk, hour = id === "lst:hour7", flags = [];
    X.keep = 1;
    X.sheet = "沒動";
    X.reply = "（不回話）這一步是時間過去，沒有傳給機器人";
    if (id === "lst:min30" || hour) {
      snap = dskSnap(S);
      lost = dslClockGo(S, hour ? 7 * 3600 : 31 * 60);
      lk = dskLost(snap, dskSnap(S));
      if (L.mode) { L.mode = 0; flags.push("「正在校對」的旗標（30 分鐘）"); }
      if (hour) L.pn = 0;   /* LINE 這邊「傳到第幾張」的計數只留 6 小時 */
      tail = lost.length ? "另外，" + lost.join("、") + "的暫存也過期了（新藥 30 分鐘、改某一格 15 分鐘、匯入 30 分鐘）。" : "";
      if (lk.length || flags.length) {
        X.say = "時間過了 " + (hour ? "7 小時" : "30 分鐘") + "：" + flags.concat(lk).join("、") + "過期了。現在傳照片又是平常的「拍照查藥」；待審清單不受影響。" + (!hour && dskHasSt(dskK(S)) ? "位置查核打的勾還留著（要 6 小時才過期）。" : "") + tail;
        if (flags.length) dsT(X, 1, "過了 " + (hour ? "7 小時" : "30 分鐘") + "：「正在校對」這個旗標過期了（每次打「清單校對」「清單校對 保留」「清單校對 清空」都重新算 30 分鐘）");
        if (lk.length) dsT(X, 1, "位置查核過期的有：" + lk.join("、") + "（每次打位置、按鍵都重新算）");
        dsT(X, 1, "待審清單不會跟著不見：它存在另一個地方，要 3 天才會清");
        if (!hour && dskHasSt(dskK(S))) dsT(X, 1, "位置查核打的勾還在：暫存留 6 小時，這時候再按卡片上的打勾框，還接得上");
      } else {
        X.say = "時間過了 " + (hour ? "7 小時" : "30 分鐘") + "。" + (tail || "沒有什麼東西過期。");
        dsT(X, 1, "過了 " + (hour ? "7 小時" : "30 分鐘") + "：" + (tail || "沒有什麼東西過期"));
      }
      if (hour && L.pn === 0) dsT(X, 1, "LINE 這邊「傳到第幾張」的計數（6 小時）從頭算");
      if (lost.length) dsT(X, 1, lost.join("、") + "的暫存過期了（真的是存在快取裡，過了時間自己消失）");
    } else if (id === "lst:day3") {
      lost = dslClockGo(S, 3 * 86400 + 60);
      before = L.pend.length;
      for (i = 0; i < L.pend.length; i++) L.pend[i].age = (L.pend[i].age || 0) + 3;
      i = before - dslGet(S).length;
      L.mode = 0;
      L.pn = 0;   /* LINE 這邊「傳到第幾張」的計數只留 6 小時，「正在校對」的旗標只留 30 分鐘：3 天後都沒了 */
      S.day = (S.day || 0) + 3;   /* 假日期往後走 3 天：之後寫進工作表1 的批次號是新的那一天（「校對MMdd」） */
      X.say = "時間過了 3 天：待審清單裡超過 3 天的都清掉了（" + i + " 筆）；「正在校對」的旗標早就過期，位置查核打的勾（6 小時）也不見了，LINE 這邊「傳到第幾張」也從頭算。" + (lost.length ? lost.join("、") + "的暫存也過期了。" : "");
      dsT(X, 1, "過了 3 天：待審清單裡超過 3 天的，下一次有人讀待審清單的時候順便清掉（這裡清了 " + i + " 筆；還沒寫進工作表1 的，不能找回）");
      dsT(X, 1, "「正在校對」的旗標（30 分鐘）、位置查核打的勾（6 小時）和 LINE 這邊「傳到第幾張」的計數（6 小時）早就過期了");
      if (lost.length) dsT(X, 1, lost.join("、") + "的暫存過期了");
    } else {
      X.say = "這個動作現在做不到。";
      dsT(X, 0, "這個動作現在做不到");
    }
    return X;
  }
  /*/SIMDEV*/

  /* ───────── 開發者的位置查核（第 17 批；第 4 課「清單校對」的練習聊天室，位置查核這一半：LINE）─────────
     開發者定期去貨架查「這支藥是不是真的放在這一格」：在「清單校對」裡按「📍 位置查核」，打一個位置（例如 K2）或傳一張貨架照片（要拍到架上的「位置牌」和藥品），
     機器人把這一格的藥列成一張卡（跟藥師打位置查到的是同一批、同一個順序），開發者邊看邊一支一支打勾；不在這一格的，按那一列的「修改」當場改位置。
     這一個檔放：假的「貨架照片」（練習用的六張，每一張是 AI 看照片讀出來的樣子）、這一格的藥怎麼找（13_位置查核.gs 的 _lckKey_／_lckAllLocs_／_lckCanon_／_lckRowsAt_）、
     改位置（_lckMove_，只改「位置」那一格、不記匯入紀錄）、打勾的暫存（_lckStGet_／_lckStSet_／_lckStart_／_lckView_）、LINE 的卡片（_lckRowBox_／_lckBubbleOf_／_lckMsgs_／_lckPickMsg_）、
     文字、按鍵、照片三個入口（_lckText_／_lckPostback_／_lckFlow_）。網頁那一半（清單校對網頁的「位置查核」分頁）在 _learn_dev_sim_lw.js，兩邊共用這裡的找藥、改位置、認照片。
     每一句機器人說的話都照 13_位置查核.gs 拼字串的那一句寫；tools/learn_dev_sim_test.js 的 L 段把同一串輸入丟給真的 LINE 程式碼（AI 那兩趟換成這幾張照片的內容）逐句比對。
     練習的是「編的」試算表和「編的」照片：改位置只改練習的試算表，什麼都不會真的寫；AI 看照片那兩趟，練習聊天室直接給這張照片上的內容。 */
  /*SIMDEV*/
  var DSK_MODE_SEC = 1800, DSK_STATE_SEC = 21600, DSK_EDIT_SEC = 600, DSK_PEND_SEC = 600;   /* 位置查核的旗標 30 分鐘、打勾的暫存 6 小時、等新位置那一句 10 分鐘、照片先記著的藥 10 分鐘（13 的 LCK_MODE_SEC…） */
  var DSK_STATE_LOCS = 12, DSK_SHOW_MAX = 60, DSK_OTHER_MAX = 12, DSK_PICK_PER = 36, DSK_PICK_BUBBLES = 6, DSK_COLS = 4, DSK_PAGE = 12, DSK_LOC_MAX = 200;
  var DSK_CAR_BYTES = 45000, DSK_BASE_BYTES = 600, DSK_ROW_BYTES = 1650;   /* 一則訊息的輪播不超過 45 KB（AGG_CAR_BYTES）；練習聊天室沒有真的 JSON，用「一張卡 ≈ 600 ＋ 每列 1650 位元組」估（真的量過 5～36 列，差在 5% 以內） */
  var DSK_GREEN = "#1B7A5A", DSK_AMBER = "#B26B00";
  var DSK_LOC_RE = /^(水)?[A-Z]{1,2}[0-9]{1,3}$/;   /* 01 的 LOC_CODE_RE：像 K2、B1、水A3 的位置，比的時候要「完全一樣」；其他名稱（棧中、水棧一）是「包含」 */
  var DSK_ERR_DARK = "這張照片讀不出藥品：光線亮一點、字對焦清楚再拍一次", DSK_ERR_BUSY = "AI 那邊剛才塞車了，等十幾秒再傳一次";
  var DSK_MENU_TEXT = "📍 位置查核\n\n" + "打一個位置（例如 A1），或傳一張貨架照片（要拍到架上的「位置牌」和藥品）。\n" + "我會把這一格的藥列出來，你邊看邊一支一支打勾；不在這格的，按那一列的「修改」當場改位置。\n\n" + "・打勾只放在暫存，不寫進工作表1，也不記日期\n" + "・改位置不記進匯入紀錄（沒有 7 天內復原），改完馬上更新快取，藥師現在查就是新位置\n" + "・照片裡認出來、工作表1 也寫這一格的，會先幫你打勾";
  /* 六張練習用的貨架照片。sign＝架上位置牌的字（AI 讀到的；空字串＝牌子被擋住／太暗沒讀到）、rec＝AI 在架上認出來的藥（CODE；認藥失敗就是空的）、recErr＝認藥失敗的原因（沒有＝認得出來）、
     sec＝AI 花的秒數（量出來的，練習用編的）、kb＝照片大小、show＝聊天室裡那張照片上看得到的幾個藥盒 */
  var DSK_SHELF = [
    { key: "S1", short: "K2 整格", sign: "K2", sec: 6.8, kb: 418, rec: ["90101", "90104", "90108", "90111", "90112"], show: ["TESTOLOL*", "SAMPLESPOT*", "EXAMPLIDE*", "SAMPLEXIN* 250", "SAMPLEXIN* 500"] },
    { key: "S2", short: "B1", sign: "B1", sec: 6.1, kb: 392, rec: ["90103", "90116", "90117"], show: ["MODELPRIL*", "SAMPLECOR*", "MODELTAB*"] },
    { key: "S3", short: "牌子被擋住", sign: "", sec: 5.9, kb: 371, rec: ["90101", "90107"], show: ["TESTOLOL*", "DEMOCARD*"] },
    { key: "S4", short: "牌子是 Z9", sign: "Z9", sec: 6.4, kb: 405, rec: ["90106"], show: ["TESTAMOL*"] },
    { key: "S5", short: "AI 塞車", sign: "K3", sec: 5.2, kb: 388, rec: [], recErr: DSK_ERR_BUSY, show: ["SAMPLEXIN* 500", "TESTBETA*"] },
    { key: "S6", short: "太暗了", sign: "", sec: 4.7, kb: 296, rec: [], recErr: DSK_ERR_DARK, show: ["▒▒▒", "▒▒▒"], dark: 1 }
  ];
  function dskShelf(key) { var i; for (i = 0; i < DSK_SHELF.length; i++) if (DSK_SHELF[i].key === key) return DSK_SHELF[i]; return null; }
  /* 聊天室裡那張貨架照片（您傳的照片）：牌子上的字、架上的幾個藥盒；rkEl 在 _learn_dev_ui.js 畫 */
  function dskShelfMsg(P) { return { w: "me", shelf: P.show.slice(), sign: P.sign, dark: !!P.dark, what: "貨架" }; }
  /* 在「清單校對」模式（不是位置查核）傳了貨架照片：機器人把它當清單讀，這種照片上沒有 code 表格，讀到 0 筆（02 的 _lstFlow_）。回一張「清單」的樣子給 dslImg 用 */
  function dskAsPaper(P) { return { key: P.key, kb: P.kb, sec: 3.4, lines: [], show: P.show.slice() }; }
  /* 在位置查核模式傳了一張清單的紙：沒有位置牌，也認不出藥（紙上是字，不是架上的藥盒） */
  function dskPaperAsShelf(P) { return { key: P.key, kb: P.kb, sign: "", sec: P.sec, rec: [], recErr: DSK_ERR_DARK }; }

  /* ───── 狀態：st＝打勾的暫存（13 的 lckst_，6 小時）、mode／edit／pend＝三個旗標（lckmode_ 30 分鐘、lckedit_ 10 分鐘、lckpend_ 10 分鐘）─────
     at 都是練習時鐘（S.ops.dev.now，秒）。時間只會因為「⏰ 時間過了…」的按鈕往前走（dslClockGo 叫 dskAge）。 */
  function dskNew() { return { mode: 0, modeAt: 0, edit: null, editAt: 0, pend: null, pendAt: 0, st: {}, stAt: 0, seq: 0 }; }
  function dskK(S) { return S.ops.lst.lck; }
  function dskNow(S) { return S.ops.dev.now; }
  function dskHasSt(K) { return Object.keys(K.st).length > 0; }
  function dskAny(S) { var K = dskK(S); return !!(K.mode || K.edit || K.pend || dskHasSt(K)); }
  function dskAge(S) {   /* 過了時間的旗標、暫存拿掉（真的是快取自己過期） */
    var K = dskK(S), now = dskNow(S);
    if (K.mode && now - K.modeAt >= DSK_MODE_SEC) K.mode = 0;
    if (K.edit && now - K.editAt >= DSK_EDIT_SEC) K.edit = null;
    if (K.pend && now - K.pendAt >= DSK_PEND_SEC) K.pend = null;
    if (dskHasSt(K) && now - K.stAt >= DSK_STATE_SEC) K.st = {};
  }
  /* 這個動作做到哪（時間過去要說「哪些東西過期了」）：旗標三個、暫存一份 */
  function dskSnap(S) { var K = dskK(S); return { mode: !!K.mode, edit: !!K.edit, pend: !!K.pend, st: dskHasSt(K) }; }
  function dskLost(a, b) {
    var out = [];
    if (a.mode && !b.mode) out.push("位置查核的模式（30 分鐘）");
    if (a.edit && !b.edit) out.push("等新位置的那一句（10 分鐘）");
    if (a.pend && !b.pend) out.push("照片先記著的藥（10 分鐘）");
    if (a.st && !b.st) out.push("位置查核打的勾（6 小時）");
    return out;
  }
  function dskTouch(S) { var K = dskK(S); K.mode = 1; K.modeAt = dskNow(S); S.ops.lst.mode = 1; }   /* 13 的 _lckTouch_：位置查核和清單校對兩個旗標一起重新算 30 分鐘 */
  /* 打「清單校對 結束」「位置查核 結束」：旗標、暫存、等新位置、照片先記著的藥全部清掉；有清到東西回 true（13 的 _lckLeave_） */
  function dskLeave(S) {
    var K = dskK(S), had = !!(K.mode || K.edit || K.pend) || dskHasSt(K);
    S.ops.lst.lck = dskNew();
    return had;
  }
  /* 回到「表格照片」模式（打「清單校對」）：貨架照片模式、等新位置、照片先記著的藥關掉；打勾的暫存還留著 */
  function dskBackToList(S) { var K = dskK(S); K.mode = 0; K.edit = null; K.pend = null; }
  function dskStGet(S) { return dslCopy(dskK(S).st); }
  function dskStSet(S, all) {   /* 13 的 _lckStSet_：最多留最近用過的 12 個位置；每寫一次，6 小時重新算 */
    var K = dskK(S), ks = Object.keys(all), i;
    if (ks.length > DSK_STATE_LOCS) {
      ks.sort(function(a, b) { return (all[b].t || 0) - (all[a].t || 0); });
      for (i = DSK_STATE_LOCS; i < ks.length; i++) delete all[ks[i]];
    }
    K.st = dslCopy(all);
    K.stAt = dskNow(S);
  }
  function dskArr(x) { return Object.prototype.toString.call(x) === "[object Array]" ? x.slice() : []; }
  function dskStOf(all, key) {
    var s = all[key] || {};
    return { a: dskArr(s.a), k: dskArr(s.k), o: dskArr(s.o), m: s.m && typeof s.m === "object" ? s.m : {}, t: s.t || 0 };
  }

  /* ───── 找這一格的藥、改位置（兩邊共用）───── */
  /* 打進來的位置整理成「一個鍵」：全形轉半形、英文大寫、空白拿掉（a 1 → A1）。不能當位置的（空的、超過 20 字、有「|」、控制字元、開頭是 = + - @ 會被試算表當公式）回空字串 */
  function dskKey(v) {
    var s = dsLocNorm(v === null || v === undefined ? "" : v).replace(/\s+/g, "");
    if (!s || s.length > 20) return "";
    if (/[|\u0000-\u001f]/.test(s) || /^[=+\-@]/.test(s)) return "";
    return s;
  }
  /* 位置的排法（01 的 _buyLocKey_）：A1、A2…B1…（g=1 代碼樣式），再來是其他名稱（g=2，照字排） */
  function dskBuyKey(loc) {
    var v = String(loc === null || loc === undefined ? "" : loc).trim(), m;
    if (!v) return { g: 3, a: "", n: 0, name: "（位置未登錄）" };
    m = v.toUpperCase().match(/^([A-Z]{1,2})\s*([0-9]{1,3})$/);
    if (m) return { g: 1, a: m[1], n: parseInt(m[2], 10), name: m[1] + " 區" };
    return { g: 2, a: v, n: 0, name: v };
  }
  function dskFind(ix, c) {   /* 01 的 findByCode_：這支藥現在在不在（索引快取裡） */
    var i;
    if (!c) return null;
    for (i = 0; i < ix.order.length; i++) if (ix.order[i] === c) return ix.rows[c] || null;
    return null;
  }
  /* 工作表1 裡所有出現過的位置：[{ loc（最常見的寫法）, key, n（幾支藥）}]，照 dskBuyKey 排。讀的是索引快取（_lckAllLocs_ 的 getIndex_） */
  function dskAllLocs(S) {
    var ix = dsIdx(S), map = {}, out = [], i, c, loc, key, m, k, s, best, bn;
    for (i = 0; i < ix.order.length; i++) {
      c = ix.order[i];
      if (!c) continue;
      loc = String(ix.rows[c].loc === null || ix.rows[c].loc === undefined ? "" : ix.rows[c].loc).trim();
      if (!loc) continue;
      key = dskKey(loc);
      if (!key) continue;
      m = map[key] || (map[key] = { key: key, n: 0, sp: {} });
      m.n++;
      m.sp[loc] = (m.sp[loc] || 0) + 1;
    }
    for (k in map) {
      best = "";
      bn = -1;
      for (s in map[k].sp) if (map[k].sp[s] > bn) { best = s; bn = map[k].sp[s]; }
      out.push({ loc: best, key: k, n: map[k].n });
    }
    out.sort(function(a, b) {
      var x = dskBuyKey(a.loc), y = dskBuyKey(b.loc);
      if (x.g !== y.g) return x.g - y.g;
      if (x.a !== y.a) return x.a < y.a ? -1 : 1;
      if (x.n !== y.n) return x.n - y.n;
      return a.loc < b.loc ? -1 : a.loc > b.loc ? 1 : 0;
    });
    return out;
  }
  /* 這個鍵是不是工作表1 出現過的位置：先照字面比；比不到再把 - . · 之類的符號去掉比（A-1 當作 A1）。回 {loc, key, n} 或 null */
  function dskCanon(S, key) {
    var all, i, lk;
    if (!key) return null;
    all = dskAllLocs(S);
    for (i = 0; i < all.length; i++) if (all[i].key === key) return all[i];
    lk = dslNorm(key);
    if (!lk) return null;
    for (i = 0; i < all.length; i++) if (dslNorm(all[i].key) === lk) return all[i];
    return null;
  }
  /* 這一格的藥：跟藥師打位置查到的是同一批、同一個順序（代碼樣式的位置要完全一樣，後面接括號的不算；其他名稱是「包含」） */
  function dskLocHit(kw, locUp) {
    if (!locUp) return false;
    if (DSK_LOC_RE.test(kw)) return locUp === kw || locUp.replace(/[（(].*$/, "").trim() === kw;
    return locUp.indexOf(kw) >= 0;
  }
  function dskRowsAt(S, key) {
    var ix = dsIdx(S), kw = String(key || "").toUpperCase(), out = [], i, c, loc;
    if (!kw) return out;
    for (i = 0; i < ix.order.length && out.length < DSK_LOC_MAX; i++) {
      c = ix.order[i];
      if (!c) continue;
      loc = String(ix.rows[c].loc === null || ix.rows[c].loc === undefined ? "" : ix.rows[c].loc).trim().toUpperCase();
      if (dskLocHit(kw, loc)) out.push({ code: c, r: ix.rows[c] });
    }
    return out;
  }
  /* 把一支藥的位置改掉（兩邊共用）。回 {ok, code, before, after, known, same?}、{err}，或 {confirm, key}（新位置工作表1 還沒有人用，要呼叫的人先問過）。
     oldLoc＝呼叫的人畫面上看到的舊位置（不給就不檢查）：不一樣表示別人剛改過，不蓋過去。只改「位置」那一格，走 ✏️ 修改同一支（dsEfWrite：自動大寫、改完清快取），但不記進匯入紀錄 */
  function dskMove(S, X, code, newLoc, oldLoc, allowNew) {
    var c = dsNorm(code), row, before, key, canon, want, keep, res;
    if (!c || c.length > 30) return { err: "CODE 不對" };
    row = dskFind(dsIdx(S), c);
    if (!row) return { err: "工作表1 裡找不到 " + c + "（可能剛被刪掉）" };
    before = String(row.loc === null || row.loc === undefined ? "" : row.loc).trim();
    key = dskKey(newLoc);
    if (!key) return { err: "新的位置不能是空的，最多 20 個字，也不能有「|」" };
    if (/^\d{4,6}$/.test(key)) return { err: "「" + key + "」看起來是 CODE，不是位置" };
    if (oldLoc !== undefined && oldLoc !== null && dskKey(oldLoc) !== dskKey(before)) return { err: "這支藥剛剛已經被改過了（現在是「" + (before || "空的") + "」），請重新查一次再改", cur: before };
    canon = dskCanon(S, key);
    want = canon ? canon.loc : key;
    if (dskKey(before) === dskKey(want)) return { ok: true, same: true, code: c, before: before, after: before, known: !!canon };
    if (!canon && !allowNew) return { confirm: true, key: key };
    keep = X.efLog;   /* 這一次不記匯入紀錄：LINE 的 ✏️ 修改把改過的格子先記在 X.efLog、回覆完才寫進「匯入紀錄」，這裡先放掉再還回去 */
    X.efLog = [];
    res = dsEfWrite(S, X, c, "loc", want);
    X.efLog = keep;
    if (!res || res.err) return { err: res && res.err || "寫入失敗" };
    return { ok: true, code: c, before: before, after: want, known: !!canon };
  }

  /* ───── 這一格怎麼排：原料 → 要畫的東西 ───── */
  function dskRaw(S, key) {
    var all = dskStGet(S), st = dskStOf(all, key), cur = dskRowsAt(S, key), ix = dsIdx(S), byCode = {}, more, i, c, r;
    for (i = 0; i < cur.length; i++) byCode[cur[i].code] = cur[i].r;
    more = st.a.concat(st.k, st.o, Object.keys(st.m));
    for (i = 0; i < more.length; i++) {
      c = more[i];
      if (!c || byCode[c]) continue;
      r = dskFind(ix, c);
      if (r) byCode[c] = r;
    }
    return { key: key, all: all, st: st, cur: cur, byCode: byCode };
  }
  function dskRowName(e) { return String(e.r.b || e.r.z || e.code || ""); }
  /* 原料＋勾選狀態 → list（這一格的藥，改走的留在原位；後面接「照片認出但寫在別格」）、數字 */
  function dskView(raw) {
    var st = raw.st, curSet = {}, main = [], got = {}, oth = [], shown, seen = 0, moved = 0, movedAll = 0, dropped = [], i, c, r;
    function add(code) {
      var row;
      if (!code || got[code]) return;
      row = raw.byCode[code];
      if (!row) return;
      if (curSet[code]) { main.push({ r: row, code: code, tick: st.k.indexOf(code) >= 0 }); got[code] = 1; }
      else if (st.m[code]) { main.push({ r: row, code: code, moved: st.m[code] }); got[code] = 1; }
    }
    for (i = 0; i < raw.cur.length; i++) curSet[raw.cur[i].code] = 1;
    for (i = 0; i < st.a.length; i++) add(st.a[i]);
    for (i = 0; i < raw.cur.length; i++) add(raw.cur[i].code);
    for (i = 0; i < st.o.length; i++) {
      c = st.o[i];
      r = raw.byCode[c];
      if (r && !curSet[c] && !got[c]) oth.push({ r: r, code: c, tick: st.k.indexOf(c) >= 0, other: true });
    }
    shown = main.slice(0, DSK_SHOW_MAX);
    for (i = 0; i < main.length; i++) if (main[i].moved) movedAll++;
    for (i = 0; i < shown.length; i++) {
      if (shown[i].moved) moved++;
      if (shown[i].moved || shown[i].tick) seen++;
    }
    for (i = DSK_SHOW_MAX; i < main.length; i++) dropped.push(dskRowName(main[i]));
    return { key: raw.key, list: shown.concat(oth), total: shown.length, cur: main.length - movedAll, moved: moved, seen: seen, dropped: dropped, otherN: oth.length };
  }
  /* 第一次打開這一格（或又打了一次位置）：把「現在這一格有哪些藥」記成原本的樣子；打勾的留著（只留還在這一格的）、改走的清掉 */
  function dskStart(S, key, cur, extra) {
    var K = dskK(S), all = dskStGet(S), st = dskStOf(all, key), codes = [], here = {}, i, c;
    for (i = 0; i < cur.length; i++) { c = cur[i].code; codes.push(c); here[c] = 1; }
    st.a = codes;
    st.m = {};
    st.k = st.k.filter(function(x) { return here[x]; });
    st.o = st.o.filter(function(x) { return !here[x]; });
    if (extra) {
      for (i = 0; i < (extra.yes || []).length; i++) if (st.k.indexOf(extra.yes[i]) < 0) st.k.push(extra.yes[i]);
      for (i = 0; i < (extra.other || []).length; i++) if (st.o.indexOf(extra.other[i]) < 0) st.o.push(extra.other[i]);
      st.o = st.o.slice(0, DSK_OTHER_MAX);
    }
    st.t = ++K.seq;
    all[key] = st;
    dskStSet(S, all);
    return st;
  }
  /* 認出來的藥分成兩邊：工作表1 也寫這一格的（先打勾）、工作表1 寫在別格的（列在最後一段） */
  function dskClassify(S, key, recCodes) {
    var here = {}, rows = dskRowsAt(S, key), yes = [], other = [], seen = {}, i, c;
    for (i = 0; i < rows.length; i++) here[rows[i].code] = 1;
    for (i = 0; i < (recCodes || []).length; i++) {
      c = dsNorm(recCodes[i]);
      if (!c || seen[c]) continue;
      seen[c] = 1;
      if (here[c]) yes.push(c); else other.push(c);
    }
    return { yes: yes, other: other.slice(0, DSK_OTHER_MAX) };
  }

  /* ───── LINE 的卡片（13 的 _lckGroups_／_lckRowBox_／_lckBubbleOf_；跟藥師打位置查到的同一種版面，每一列多了打勾框和「修改」）───── */
  function dskIsWater(r) {   /* 13 的 _isWater_：劑型有「水」或「液」、或位置開頭是「水」→ 水劑類（改走到「水棧一」的藥也會跑到水劑類） */
    var f = String(r.f || ""), l = String(r.loc || "");
    return f.indexOf("水") >= 0 || f.indexOf("液") >= 0 || l.indexOf("水") === 0;
  }
  function dskGroups(ents) {
    var tab = [], water = [], g = [], i;
    for (i = 0; i < ents.length; i++) {
      if (ents[i].other) continue;
      if (dskIsWater(ents[i].r)) water.push(ents[i]); else tab.push(ents[i]);
    }
    if (tab.length) g.push({ name: "錠劑類　" + tab.length + " 個品項", water: 0, ents: tab });
    if (water.length) g.push({ name: "水劑類　" + water.length + " 個品項", water: 1, ents: water });
    return g;
  }
  function dskRowBox(e, key) {
    var r = e.r, code = e.code, moved = !!e.moved, on = !!e.tick || moved, loc = String(r.loc || "").trim(), brand = String(r.b || r.z || "-"), zh = String(r.z || ""), form = String(r.f || ""), mid = [], cells, chk, photo;
    chk = gx(on ? [gt(moved ? "→" : "✓", { z: "lg", b: 1, c: moved ? DSK_AMBER : "#FFFFFF", a: "center" })] : [], {
      w: 34, hh: 34, r: 8, bw: 2, bd: moved ? "#D98E04" : on ? DSK_GREEN : "#9AA7A6", bg: moved ? "#FFF3D6" : on ? DSK_GREEN : "#FFFFFF", jc: "center",
      cls: "lkt", send: { p: "lck=t|" + key + "|" + code, a: "「" + code + "」左邊的打勾框" }, al: code + "：" + (moved ? "已改位置" : on ? "取消打勾" : "打勾")
    });
    mid.push(gt(brand, { z: "sm", b: 1, c: "#1F1F1F" }));
    if (zh && zh !== r.b) mid.push(gt(zh, { z: "xs", c: "#4A4A4A" }));
    mid.push(gh([gx([], { w: 16, hh: 16, cls: "gic" + (/水|液/.test(form) ? " w" : "") }), gt((form || "　") + "　" + code, { z: "xxs", c: "#999999", f: 1 })], { sp: "xs", m: "xs", ai: "center" }));
    if (moved) mid.push(gt("→ 已改到 " + e.moved, { z: "xs", b: 1, c: DSK_AMBER, m: "xs" }));
    else if (e.other) mid.push(gt("工作表1 寫：" + (loc || "（空的）"), { z: "xs", b: 1, c: "#C0392B", m: "xs" }));
    photo = dsPhOk(r.photo)
      ? gx([], { w: 52, hh: 52, cls: "gph" + (/水|液/.test(form) ? " w" : "") })
      : gx([gt("無照片", { z: "xxs", c: "#AAAAAA", a: "center" })], { w: 52, hh: 52, bg: "#F0F0F0", r: 6, jc: "center" });
    cells = [chk, photo, gx(mid, { f: 1, cls: "lkn", send: { m: code }, al: code + " " + brand + "：點一下，查這支藥的卡片（等於打 " + code + "）" }),
      gx([gt(moved ? "再改" : "修改", { z: "xs", b: 1, c: "#C0392B", a: "center" })], { w: 50, hh: 34, r: 8, bw: 1, bd: "#C0392B", jc: "center", cls: "lkm", send: { p: "lck=m|" + key + "|" + code, a: "「" + code + "」右邊的「" + (moved ? "再改" : "修改") + "」" }, al: code + "：" + (moved ? "再改位置" : "修改位置") })];
    return gh(cells, { sp: "sm", p: 8, ai: "center", bg: moved ? "#FFF8E6" : on ? "#EEF7F2" : "#FFFFFF" });
  }
  /* 一頁的卡片（一頁 12 列；太大才一級一級縮的那幾層，練習用的假藥名短，用不到） */
  function dskBubbleOf(view, page, pages, ents, drop) {
    var key = view.key, last = page === pages - 1, sub = "這一格有 " + view.cur + " 個品項", done, body, groups, n = 0, g, i, oth;
    if (view.moved) sub += "（已改走 " + view.moved + "）";
    if (pages > 1) sub += "　·　第 " + (page + 1) + "/" + pages + " 頁";
    done = view.total > 0 && view.seen >= view.total;
    body = [
      gt(key, { z: "lg", b: 1, c: "#1F1F1F" }),
      gt(sub, { z: "xs", c: "#8A8A8A", m: "xs" }),
      gt(done ? "✅ 全部看完了　" + view.seen + "/" + view.total : "已看 " + view.seen + "/" + view.total, { z: "sm", b: 1, c: done ? DSK_GREEN : "#1D6FA5", m: "xs" })
    ];
    groups = dskGroups(ents);
    for (g = 0; g < groups.length; g++) {
      if (groups.length > 1) body.push(gh([gx([], { w: 30, hh: 30, cls: "gic" + (groups[g].water ? " w" : "") }), gt(groups[g].name, { z: "md", b: 1, c: "#1D6FA5", f: 1 })], { m: "xl", sp: "sm", ai: "center" }));
      else body.push(gt(groups[g].name, { z: "md", b: 1, c: "#1D6FA5", m: "xl" }));
      for (i = 0; i < groups[g].ents.length; i++) {
        if (n++ > 0) body.push(gsep({ m: "none", c: "#EFEFEF" }));
        body.push(dskRowBox(groups[g].ents[i], key));
      }
    }
    oth = ents.filter(function(x) { return x.other; });
    if (oth.length) {
      body.push(gt("📷 照片裡也認出（工作表1 寫在別格）", { z: "md", b: 1, c: DSK_AMBER, m: "xl" }));
      for (i = 0; i < oth.length; i++) {
        if (i > 0) body.push(gsep({ m: "none", c: "#EFEFEF" }));
        body.push(dskRowBox(oth[i], key));
      }
    }
    body.push(gsep({ m: "md", c: "#EFEFEF" }));
    body.push(gt(last ? "點左邊的框＝打勾　·　點藥名＝看卡片　·　不在這格＝修改" : "點左邊的框＝打勾　·　還有下一頁，往左滑 →", { z: "xxs", c: "#AAAAAA", a: "center", m: "sm" }));
    if (last && view.otherN === 0 && drop && drop.length > 0) body.push(gt("另有 " + drop.length + " 個品項這張卡片放不下，請個別查詢：\n　" + drop.join("\n　"), { z: "xxs", c: "#B0603A", m: "sm" }));
    return { w: "gc", pad: 14, kids: body, rows: ents.length, alt: "位置查核的卡片：" + key + "，" + sub + "，已看 " + view.seen + "/" + view.total + "；每一列左邊一個打勾框、中間藥名（點了查卡片）、右邊一顆「修改」" };
  }
  function dskPageCount(view) { return Math.max(1, Math.ceil(view.list.length / DSK_PAGE)); }
  function dskPageMsg(view, p) {   /* 第 p 頁（從 0 數）的卡片 */
    var pages = dskPageCount(view);
    return dskBubbleOf(view, p, pages, view.list.slice(p * DSK_PAGE, (p + 1) * DSK_PAGE), p === pages - 1 ? view.dropped.slice() : []);
  }
  function dskCarBytes(bs) { var n = 30, i; for (i = 0; i < bs.length; i++) n += DSK_BASE_BYTES + DSK_ROW_BYTES * bs[i].rows + 1; return n; }
  function dskPack(bubbles) {   /* 01 的 _packByBytes_：依位元組上限把卡片分成幾疊 */
    var packs = [], cur = [], i;
    for (i = 0; i < bubbles.length; i++) {
      cur.push(bubbles[i]);
      if (cur.length > 1 && dskCarBytes(cur) > DSK_CAR_BYTES) { cur.pop(); packs.push(cur); cur = [bubbles[i]]; }
    }
    if (cur.length) packs.push(cur);
    return packs;
  }
  /* 整格的輪播（每頁一張卡片，往左滑）：最多回 maxMsgs 則訊息 */
  function dskMsgs(view, maxMsgs) {
    var pages = dskPageCount(view), bubbles = [], p, packs, out = [], i;
    for (p = 0; p < pages; p++) bubbles.push(dskPageMsg(view, p));
    packs = dskPack(bubbles);
    for (i = 0; i < packs.length && out.length < maxMsgs; i++) out.push(packs[i].length === 1 ? packs[i][0] : { w: "gcar", cs: packs[i] });
    return out;
  }
  function dskPageOf(view, code) {
    var i;
    for (i = 0; i < view.list.length; i++) if (view.list[i].code === code) return Math.floor(i / DSK_PAGE);
    return 0;
  }
  /* 輸入框上面的小按鈕（13 的 _lckQuick_）：有指定的位置才有「📑 全部重送」「↺ 清掉勾選」；🌐 網頁版（練習聊天室打開下面那一塊網頁，帶著這一格） */
  function dskQuick(S, key) {
    var q = [];
    if (key) {
      q.push({ l: "📑 全部重送", p: "lck=a|" + key });
      q.push({ l: "↺ 清掉勾選", p: "lck=c|" + key });
    }
    q.push({ l: "🌐 網頁版", web: key ? "lc:" + key : "lc" });
    q.push({ l: "📋 回表格校對", m: "清單校對" });
    q.push({ l: "🚪 退出", m: "清單校對 結束" });
    return q;
  }
  function dskReply(S, X, msgs, key) { dsSend(X, msgs, dskQuick(S, key)); }

  /* ───── 動作：列出一格、重送、打勾、修改 ───── */
  /* 打了一個位置（或照片讀出位置牌）→ 列出這一格。o: { extra（照片：{yes, other}）, lead（卡片前面的一段話）} */
  function dskShow(S, X, key, o) {
    var cur = dskRowsAt(S, key), known, raw, view, msgs = [], cars, i;
    o = o || {};
    dskTouch(S);
    if (!cur.length) {
      known = dskCanon(S, key);
      dsT(X, 0, "查工作表1：沒有藥登記在「" + key + "」" + (known ? "（這個位置有人用，但寫法不一樣）" : "（工作表1 從來沒出現過這個位置，可能打錯了）"));
      dsSend(X, [bot((o.lead ? o.lead + "\n\n" : "") + "📍 " + key + "：工作表1 裡沒有藥登記在這個位置。\n" + (known ? "" : "（確定位置沒打錯？打「位置查核」看說明。）"))], dskQuick(S, ""));
      X.sheet = "沒動（只是查）";
      X.reply = "「📍 " + key + "：工作表1 裡沒有藥登記在這個位置」" + (known ? "" : "＋「確定位置沒打錯？」") + "＋下面三顆小按鈕";
      return;
    }
    dsT(X, 1, "查工作表1：寫「" + key + "」的藥有 " + cur.length + " 支（跟藥師打「" + key + "」查到的同一批、同一個順序）");
    dskStart(S, key, cur, o.extra);
    dsT(X, 1, "把這 " + cur.length + " 支記成這一格「原本的樣子」，放在機器人的暫存（6 小時）；打勾也放這裡，不寫進工作表1、不記日期");
    raw = dskRaw(S, key);
    view = dskView(raw);
    if (o.lead) msgs.push(bot(o.lead.substring(0, 4800)));
    cars = dskMsgs(view, 5 - msgs.length);
    for (i = 0; i < cars.length; i++) msgs.push(cars[i]);
    dsT(X, 1, "排成卡片：" + (dskPageCount(view) > 1 ? "一頁 12 列，共 " + dskPageCount(view) + " 頁（往左滑）；" : "") + "錠劑類、水劑類分段，每一列左邊打勾框、中間藥名（點了看那支藥的卡片）、右邊「修改」");
    dskReply(S, X, msgs, key);
    X.sheet = "沒動（打勾只放在機器人的暫存，不寫進工作表1、不記日期）";
    X.reply = (o.lead ? "一段說明＋" : "") + "這一格的卡片（" + view.list.length + " 列，已看 " + view.seen + "/" + view.total + "）＋下面小按鈕（📑 全部重送、↺ 清掉勾選、🌐 網頁版、📋 回表格校對、🚪 退出）";
  }
  /* 重送卡片（打勾、改位置、全部重送之後）：只送動到的那一頁；all＝整格 */
  function dskResend(S, X, key, code, o) {
    var raw, view, msgs = [], cars, i;
    o = o || {};
    dskTouch(S);
    raw = dskRaw(S, key);
    view = dskView(raw);
    if (o.lead) msgs.push(bot(o.lead.substring(0, 4800)));
    if (!view.list.length) msgs.push(bot("📍 " + key + "：這一格已經沒有藥了。"));
    else if (o.all) {
      cars = dskMsgs(view, 5 - msgs.length);
      for (i = 0; i < cars.length; i++) msgs.push(cars[i]);
    } else msgs.push(dskPageMsg(view, dskPageOf(view, code)));
    dskReply(S, X, msgs, key);
    return view;
  }
  /* 按「打勾」：打勾 ⇄ 取消（改走的不能打勾，只能「再改」） */
  function dskToggle(S, X, key, code) {
    var all = dskStGet(S), st = dskStOf(all, key), at, view;
    if (!st.a.length && !st.k.length) {   /* 暫存過期了（超過 6 小時）→ 重新開這一格 */
      dsT(X, 0, "這一格的暫存已經不見了（打勾的暫存只留 6 小時）→ 不能接著勾，重新開這一格");
      dskShow(S, X, key, { lead: "（勾選的暫存已經過期，這一格重新開始）" });
      return;
    }
    if (st.m[code]) dsT(X, 0, code + " 已經改去別的位置了（列上寫「→ 已改到 " + st.m[code] + "」）→ 打勾框不動，只能按「再改」");
    else {
      at = st.k.indexOf(code);
      if (at >= 0) st.k.splice(at, 1); else st.k.push(code);
      st.t = ++dskK(S).seq;
      all[key] = st;
      dskStSet(S, all);
      dsT(X, 1, (at >= 0 ? "取消 " : "打勾 ") + code + "（只放在暫存：" + key + " 這一格的「看過」名單）");
    }
    view = dskResend(S, X, key, code);
    dsT(X, 1, "只重送動到的那一頁：已看 " + view.seen + "/" + view.total);
    X.sheet = "沒動（打勾只放在機器人的暫存）";
    X.reply = "動到的那一頁卡片（已看 " + view.seen + "/" + view.total + (view.seen >= view.total && view.total > 0 ? "，全部看完了" : "") + "）＋下面小按鈕";
  }
  /* 「選新位置」的清單：每個位置一顆小按鍵（一排 4 顆），按 A 區、B 區…分段；一張卡片最多 36 顆，多的往左滑 */
  function dskPickMsg(locs, key, code) {
    var seq = [], lastG = "", shown = locs.slice(0, DSK_PICK_PER * DSK_PICK_BUBBLES), bubbles = [], body = null, chips = 0, rowCells = [], curG = "", i, bk, g, x;
    for (i = 0; i < shown.length; i++) {
      bk = dskBuyKey(shown[i].loc);
      g = bk.g === 1 ? bk.a + " 區" : "其他位置";
      if (g !== lastG) { seq.push({ h: g }); lastG = g; }
      seq.push({ loc: shown[i].loc, g: g });
    }
    function chip(c) {
      return gx([gt(c.loc, { z: "sm", b: 1, c: "#1D6FA5", a: "center" })], { f: 1, p: 7, r: 6, bg: "#E8F1F8", jc: "center", send: { p: ("lck=s|" + key + "|" + code + "|" + c.loc).substring(0, 290), a: "新位置「" + c.loc + "」" }, al: "新位置 " + c.loc + "：點一下，馬上改" });
    }
    function flush() {
      if (!rowCells.length) return;
      while (rowCells.length < DSK_COLS) rowCells.push(gx([], { f: 1 }));
      body.push(gh(rowCells, { m: "sm", sp: "sm" }));
      rowCells = [];
    }
    function open() { body = [gt("選新位置", { z: "md", b: 1, c: "#1F1F1F" })]; chips = 0; }
    function close() {
      flush();
      if (body && chips > 0) bubbles.push({ w: "gc", pad: 14, kids: body, alt: "選新位置：每個位置一顆小按鍵，點一個就改" });
      body = null;
    }
    for (i = 0; i < seq.length; i++) {
      x = seq[i];
      if (x.h !== undefined) {
        flush();
        curG = x.h;
        if (body && chips >= DSK_PICK_PER) close();
        if (!body) open();
        body.push(gt(x.h, { z: "xs", b: 1, c: "#8A8A8A", m: "lg" }));
        continue;
      }
      if (!body || chips >= DSK_PICK_PER) {
        close();
        open();
        body.push(gt(curG + (bubbles.length ? "（續）" : ""), { z: "xs", b: 1, c: "#8A8A8A", m: "lg" }));
      }
      rowCells.push(chip(x));
      chips++;
      if (rowCells.length >= DSK_COLS) flush();
    }
    close();
    if (!bubbles.length) return null;
    return bubbles.length === 1 ? bubbles[0] : { w: "gcar", cs: bubbles };
  }
  /* 按「修改」：出一張「選新位置」的清單（所有位置，點一個就改），也可以直接打字 */
  function dskAskMove(S, X, key, code) {
    var K = dskK(S), row = dskFind(dsIdx(S), code), now, nowKey, locs, here, at, msgs, pk;
    if (!row) {
      dsT(X, 0, "工作表1 裡找不到 " + code);
      dsSend(X, [bot("工作表1 裡找不到 " + code + "（可能剛被刪掉）。")], dskQuick(S, key));
      X.sheet = "沒動"; X.reply = "「工作表1 裡找不到 " + code + "」＋下面小按鈕";
      return;
    }
    dskTouch(S);
    K.edit = { k: key, c: code };
    K.editAt = dskNow(S);
    dsT(X, 1, "按了 " + code + " 的「修改」→ 記下「正在改 " + code + "」（10 分鐘內，打什麼字都算新位置）");
    now = String(row.loc === null || row.loc === undefined ? "" : row.loc).trim();
    nowKey = dskKey(now);
    locs = dskAllLocs(S).filter(function(x) { return x.key !== nowKey; });
    here = dskCanon(S, key);
    if (here && here.key !== nowKey) {   /* 從別格拉進這一格的（照片認出來寫在別格的）：這一格排第一個 */
      at = -1;
      locs.forEach(function(x, i) { if (at < 0 && x.key === here.key) at = i; });
      if (at > 0) locs.unshift(locs.splice(at, 1)[0]);
    }
    dsT(X, 1, "把工作表1 出現過的位置列成一排小按鍵（" + locs.length + " 個，不含它現在的「" + (now || "空的") + "」），點一個就改");
    msgs = [bot("✏️ 修改位置\n" + code + "　" + (row.b || row.z || "") + (row.z && row.z !== row.b ? "\n" + row.z : "") + "\n現在：" + (now || "（空的）") + "\n\n👇 點一個新位置，或直接打字（例如 A2）。\n（不記進匯入紀錄，改完馬上生效）")];
    pk = dskPickMsg(locs, key, code);
    if (pk) msgs.push(pk);
    dsSend(X, msgs, [{ l: "取消，不改了", p: "lck=x|" + key }]);
    X.sheet = "沒動（還沒選新位置）";
    X.reply = "「✏️ 修改位置」說明＋「選新位置」的小按鍵清單＋下面一顆「取消，不改了」";
  }
  /* 真的改（LINE）：改完把這一格重排、清快取；新位置工作表1 沒人用過 → 先問一次 */
  function dskDoMove(S, X, key, code, newLoc, allowNew) {
    var K = dskK(S), row0 = dskFind(dsIdx(S), code), res, all, st, inHere, ki, oi, brand, lead, q, view;
    res = dskMove(S, X, code, newLoc, undefined, allowNew);
    if (res.err) {
      dsT(X, 0, "改位置：不行（" + res.err + "）");
      dsSend(X, [bot("⚠️ 沒改：" + res.err)], dskQuick(S, key));
      X.sheet = "沒動"; X.reply = "「⚠️ 沒改：…」＋下面小按鈕";
      return;
    }
    if (res.confirm) {
      K.edit = { k: key, c: code };
      K.editAt = dskNow(S);
      dsT(X, 2, "「" + res.key + "」是工作表1 從來沒出現過的位置（可能打錯了）→ 先問一次，不直接改");
      q = [{ l: ("✅ 確定改成 " + res.key).substring(0, 20), p: ("lck=y|" + key + "|" + code + "|" + res.key).substring(0, 290) }, { l: "重新選／打", p: "lck=m|" + key + "|" + code }, { l: "取消，不改了", p: "lck=x|" + key }];
      dsSend(X, [bot("「" + res.key + "」目前工作表1 裡沒有任何藥放在這裡（可能是打錯了）。\n確定把 " + code + " 改成「" + res.key + "」嗎？")], q);
      X.sheet = "沒動（等你按「確定」）"; X.reply = "「確定把 " + code + " 改成「" + res.key + "」嗎？」＋三顆小按鈕（確定改成、重新選／打、取消）";
      return;
    }
    K.edit = null;
    all = dskStGet(S);
    st = dskStOf(all, key);
    if (!res.same) {
      inHere = dskKey(res.after) === dskKey(key);
      ki = st.k.indexOf(code);
      if (inHere) {   /* 從別格拉進這一格：現在它確實在這一格，也看過了 → 打勾，加進原本的清單 */
        if (st.o.indexOf(code) >= 0) st.o.splice(st.o.indexOf(code), 1);
        if (ki < 0) st.k.push(code);
        if (st.a.indexOf(code) < 0) st.a.push(code);
        delete st.m[code];
      } else {
        if (ki >= 0) st.k.splice(ki, 1);
        oi = st.o.indexOf(code);
        if (oi >= 0) st.o.splice(oi, 1); else st.m[code] = res.after;
      }
      st.t = ++K.seq;
      all[key] = st;
      dskStSet(S, all);
    }
    brand = row0 ? row0.b || row0.z || "" : "";
    lead = res.same ? "👌 " + code + " 本來就在「" + res.after + "」，沒有動。" : "✅ 位置改好了\n" + code + "　" + brand + "\n" + (res.before || "（空的）") + " → " + res.after + "\n快取已更新，藥師現在查就是新位置。\n（這個修改不記進匯入紀錄）";
    if (res.same) dsT(X, 1, code + " 本來就在「" + res.after + "」→ 什麼都沒改");
    else {
      dsT(X, 1, "只改「位置」那一格：" + code + "　" + (res.before || "（空的）") + " → " + res.after + "（自動統一成半形大寫；不記進「匯入紀錄」，所以沒有 7 天內的「復原」）");
      dsT(X, 1, "改完馬上清快取：藥師現在查 " + code + " 或 " + res.after + "，看到的就是新位置");
      dsT(X, 1, inHere ? "它現在在這一格：打勾，算看過" : "它不在這一格了：留在原位，打勾框換成「→」，列上寫「→ 已改到 " + res.after + "」");
    }
    view = dskResend(S, X, key, code, { lead: lead });
    X.sheet = res.same ? "沒動" : "改了 1 格（" + code + " 的位置：" + (res.before || "空的") + " → " + res.after + "）；不記進匯入紀錄";
    X.wrote = res.same ? 0 : 1;
    X.reply = "「" + (res.same ? "👌 本來就在…" : "✅ 位置改好了") + "」＋動到的那一頁卡片（已看 " + view.seen + "/" + view.total + "）＋下面小按鈕";
  }
  /* 按鍵（postback）：lck=動作|位置|CODE|… */
  function dskPostback(S, X, v) {
    var K = dskK(S), p, act_, key, code, all, st, nm;
    if (String(v).indexOf("lck=") !== 0) return false;
    p = String(v).replace(/^lck=/, "").split("|");
    act_ = p[0] || "";
    key = dskKey(p[1] || "");
    code = dsNorm(p[2] || "");
    dsT(X, 1, "是位置查核的按鍵（lck=）；你是開發者，放行");
    if (act_ === "x") {
      K.edit = null;
      dsT(X, 1, "「取消，不改了」→ 把「正在改」的記號丟掉");
      dsSend(X, [bot("好，沒改。")], dskQuick(S, key));
      X.sheet = "沒動"; X.reply = "「好，沒改。」＋下面小按鈕";
      return true;
    }
    if (!key) {
      dsT(X, 0, "按鍵上的位置認不得");
      dsSend(X, [bot("這個按鍵過期了，請重新打一次位置（例如 A1）。")], dskQuick(S, ""));
      X.sheet = "沒動"; X.reply = "「這個按鍵過期了」";
      return true;
    }
    if (act_ === "t" && code) dskToggle(S, X, key, code);
    else if (act_ === "m" && code) dskAskMove(S, X, key, code);
    else if (act_ === "s" && code) dskDoMove(S, X, key, code, p.slice(3).join("|"), false);
    else if (act_ === "y" && code) dskDoMove(S, X, key, code, p.slice(3).join("|"), true);
    else if (act_ === "a") {
      dsT(X, 1, "「📑 全部重送」→ 把這一格整個重排再送一次（打勾、改走的狀態都在）");
      dskResend(S, X, key, "", { all: true });
      X.sheet = "沒動"; X.reply = "這一格整個卡片＋下面小按鈕";
    } else if (act_ === "c") {
      all = dskStGet(S);
      st = dskStOf(all, key);
      st.k = [];
      st.t = ++K.seq;
      all[key] = st;
      dskStSet(S, all);
      dsT(X, 1, "「↺ 清掉勾選」→ " + key + " 的打勾全部清掉（改走的不動）");
      dskResend(S, X, key, "", { all: true, lead: "↺ " + key + " 的勾選清掉了。" });
      X.sheet = "沒動"; X.reply = "「↺ " + key + " 的勾選清掉了。」＋這一格整個卡片＋下面小按鈕";
    } else {
      nm = act_ || "?";
      dsT(X, 0, "認不得的動作 " + nm);
      dsSend(X, [bot("這個按鍵過期了，請重新打一次位置（例如 A1）。")], dskQuick(S, key));
      X.sheet = "沒動"; X.reply = "「這個按鍵過期了」";
    }
    return true;
  }

  /* ───── 文字：「位置查核」指令、等新位置的那一句、在清單校對／位置查核裡打了一個位置（13 的 _lckText_）───── */
  function dskEnter(S, X) {
    dskTouch(S);
    dsT(X, 1, "進入位置查核：接下來 30 分鐘內，你打一個位置就列出那一格，傳的照片當成貨架照片（旗標跟清單校對的一起算）");
    dsSend(X, [bot(DSK_MENU_TEXT)], [{ l: "🌐 網頁版", web: "lc" }, { l: "📋 回表格校對", m: "清單校對" }, { l: "🚪 退出", m: "清單校對 結束" }]);
    X.sheet = "沒動";
    X.reply = "位置查核的說明＋下面三顆小按鈕（🌐 網頁版、📋 回表格校對、🚪 退出）";
  }
  /* st＝匯入逐筆確認的狀態：確認到一半不搶字（打「位置查核」開頭的指令才算）。處理掉回 true；不是位置查核的事回 false（照原本往下走） */
  function dskText(S, X, t, flat, st) {
    var K = dskK(S), isCmd = /^位置查核/.test(flat), editRaw = K.edit, inMode = !!K.mode || !!S.ops.lst.mode, rest, key, key2, had, extra, pc;
    if (!isCmd && !editRaw && !inMode) return false;
    if (st && !isCmd) return false;
    if (isCmd) {
      rest = flat.replace(/^位置查核/, "");
      dsT(X, 1, "是「位置查核」開頭的指令（藥師打沒有用）");
      if (/^(結束|退出|離開|關閉|停止)$/.test(rest)) {
        had = dskLeave(S);
        S.ops.lst.mode = 0;
        dsT(X, 1, "有「" + rest + "」→ 位置查核的模式、打勾的暫存、等新位置的那一句、照片先記著的藥，一起清掉" + (had ? "" : "（這次本來就沒有）"));
        dsT(X, 1, "清單校對的旗標也關掉（之後傳的照片又是平常的查藥）");
        dsSend(X, [bot("🚪 已退出位置查核。" + (had ? "\n勾選的暫存已經清掉。" : ""))]);
        X.sheet = "沒動";
        X.reply = "「🚪 已退出位置查核。」" + (had ? "＋「勾選的暫存已經清掉」" : "") + "（沒有帶小按鈕，輸入框上面換回平常那排）";
        return true;
      }
      key = dskKey(String(t).replace(/^\s*位置查核\s*/, ""));
      if (!key) {
        dsT(X, 1, "後面沒有接位置（或位置不能用：空的、超過 20 個字、有「|」、開頭是 = + - @）→ 回說明");
        dskEnter(S, X);
        return true;
      }
      dsT(X, 1, "後面接的位置是「" + key + "」→ 直接列出那一格");
      dskShow(S, X, key, {});
      return true;
    }
    if (editRaw) {
      dsT(X, 1, "有在等新位置（按過 " + editRaw.c + " 的「修改」，10 分鐘內）→ 這句話先給位置查核看");
      if (/^(取消|不改了|不改|算了)$/.test(flat)) {
        K.edit = null;
        dsT(X, 1, "是「取消」→ 不改了，「正在改」的記號丟掉");
        dsSend(X, [bot("好，沒改。")], dskQuick(S, editRaw.k));
        X.sheet = "沒動"; X.reply = "「好，沒改。」＋下面小按鈕";
        return true;
      }
      if (/^\d{4,6}$/.test(flat)) {   /* 打了 CODE 之類（不像位置）→ 當成要查別的：等新位置的狀態取消，免得之後隨手打的位置被當成「新位置」把藥改走 */
        K.edit = null;
        dsT(X, 0, "打的是 CODE（不像位置）→ 當成要查別的藥，「正在改」的記號丟掉，免得之後隨手打的字被當成新位置");
        return false;
      }
      dsT(X, 1, "不是「取消」也不是 CODE → 把這句話當成 " + editRaw.c + " 的新位置");
      dskDoMove(S, X, editRaw.k, editRaw.c, t, false);
      return true;
    }
    key2 = dskKey(t);
    if (key2 && (DSK_LOC_RE.test(key2) || dskCanon(S, key2))) {   /* 在清單校對／位置查核裡打了一個位置 */
      extra = null;
      dsT(X, 1, "正在清單校對／位置查核裡（30 分鐘內）→ 這句話先給位置查核看");
      dsT(X, 1, "「" + key2 + "」像一個位置（英文字母加數字，或工作表1 出現過的名稱）→ 列出那一格");
      if (K.pend) {
        pc = K.pend.c.slice();
        extra = dskClassify(S, key2, pc);
        K.pend = null;
        dsT(X, 1, "剛才那張貨架照片認出的 " + pc.length + " 支藥還記著 → 用它們先打勾，記著的用掉就清掉");
      }
      dskShow(S, X, key2, { extra: extra, lead: extra ? "📷 用剛才那張照片認出的 " + (extra.yes.length + extra.other.length) + " 支藥：工作表1 也寫「" + key2 + "」的 " + extra.yes.length + " 支先幫你打勾" + (extra.other.length ? "，另有 " + extra.other.length + " 支工作表1 寫在別格（列在最後一段）" : "") + "。" : "" });
      return true;
    }
    return false;
  }

  /* ───── 照片（13 的 _lckFlow_）：ph＝{ sign, rec, recErr, sec }（一張貨架照片 AI 讀出來的樣子，DSK_SHELF 的一格，或 dskPaperAsShelf）───── */
  function dskPhotoFlow(S, X, ph) {
    var K = dskK(S), label = ph.sign || "", key = dskKey(label), canon = key ? dskCanon(S, key) : null, ix = dsIdx(S), recCodes = [], codes = [], cls, i, c, rec;
    for (i = 0; i < (ph.rec || []).length; i++) if (dskFind(ix, ph.rec[i])) recCodes.push(ph.rec[i]);
    dsT(X, 1, "在位置查核模式 → 這張照片先給位置查核看（不是平常的拍照查藥，也不是清單校對）");
    dsT(X, ph.recErr && !label ? 0 : 1, "請 AI 看照片兩件事：①架上的位置牌寫什麼：" + (label ? "「" + label + "」" : "沒讀到") + "　②架上認出哪些藥：" + (ph.recErr ? "失敗（" + ph.recErr + "）" : recCodes.length + " 支"));
    if (ph.recErr && !label) {
      dsT(X, 0, "牌子沒讀到、藥也認不出來 → 這張沒辦法用，請重拍");
      dsSend(X, [bot("📍 位置查核：" + ph.recErr)], dskQuick(S, ""));
      X.sheet = "沒動"; X.reply = "「📍 位置查核：…」＋下面三顆小按鈕";
      return true;
    }
    rec = recCodes;
    if (!canon) {   /* 牌子沒讀到、或牌子上的字工作表1 沒有人用 → 請開發者打位置，認出來的藥先記著 */
      for (i = 0; i < rec.length; i++) { c = dsNorm(rec[i]); if (c && codes.indexOf(c) < 0) codes.push(c); }
      K.pend = { c: codes.slice(0, 40) };
      K.pendAt = dskNow(S);
      dskTouch(S);
      dsT(X, 2, label ? "位置牌上的「" + label + "」，工作表1 沒有藥放在這裡 → 不能自己決定是哪一格" : "沒讀到位置牌 → 不能自己決定是哪一格");
      dsT(X, 1, codes.length ? "認出的 " + codes.length + " 支藥先記著（10 分鐘）；你接著打這一格的位置，就用它們先打勾" : "沒有認出的藥；你接著打位置就好");
      dsSend(X, [bot("📍 " + (label ? "位置牌讀到「" + label + "」，但工作表1 裡沒有藥放在這個位置。" : "這張照片裡沒讀到位置牌。") + "\n" + (codes.length ? "藥品認出了 " + codes.length + " 支，先記著。\n" : "") + "請直接打這一格的位置（例如 A1），我就" + (codes.length ? "用這張照片認出的藥幫你打勾" : "列出那一格的藥") + "。")], dskQuick(S, ""));
      X.sheet = "沒動";
      X.reply = "請你打這一格的位置" + (codes.length ? "（認出的藥先記著）" : "") + "＋下面三顆小按鈕";
      return true;
    }
    cls = dskClassify(S, canon.key, rec);
    dsT(X, 1, "位置牌「" + canon.loc + "」是工作表1 有人用的位置；認出的 " + rec.length + " 支裡，工作表1 也寫這一格的 " + cls.yes.length + " 支先打勾" + (cls.other.length ? "，工作表1 寫在別格的 " + cls.other.length + " 支放在卡片最後一段" : ""));
    dskShow(S, X, canon.key, { extra: cls, lead: "📷 位置牌讀到「" + canon.loc + "」（" + ph.sec + " 秒）。\n照片裡認出 " + rec.length + " 支藥：工作表1 也寫這一格的 " + cls.yes.length + " 支先幫你打勾" + (cls.other.length ? "，另有 " + cls.other.length + " 支工作表1 寫在別格（列在最後一段）" : "") + "。\n其餘的請對照架上一支一支確認。" + (ph.recErr ? "\n⚠️ 藥品辨識沒成功（" + ph.recErr + "），這張只用到位置牌。" : "") });
    return true;
  }

  /* 輸入框下面「這一步可以這樣打」的範例字：等新位置 → 挑一個有的位置、一個沒有的（會問一次）、取消；照片先記著 → 打一格；在位置查核／清單校對裡 → 打一格、或退出 */
  function dskSug(S) {
    var K = dskK(S);
    if (K.edit) return ["A3", "Z9", "取消"];
    if (K.pend) return ["K2", "B1"];
    if (K.mode || S.ops.lst.mode) return ["K2", "B1", "位置查核 結束"];
    return [];
  }
  /* ───── 練習專用的按鈕（真的 LINE 沒有）：傳一張貨架照片 ───── */
  function dskActs(S) {
    var out = [], i, p;
    for (i = 0; i < DSK_SHELF.length; i++) {
      p = DSK_SHELF[i];
      out.push({ id: "lst:" + p.key, w: "line", l: "📷 傳貨架照 " + p.key.substring(1) + "（" + p.short + "）", v: p.key });
    }
    return out;
  }
  /*/SIMDEV*/

  /* ───────── 開發者的清單校對：網頁那一半（第 17 批；真的網頁是 GitHub 上的 lst.html，原始碼 _lst_page.html）─────────
     分兩段：
     ① 網頁現在的樣子（頁面狀態）和每一個動作。照 _lst_page.html 的全域變數 A、PICK、FILT、CUR、PN、PICKN、RETRY、PROB 和函式 load、draw、act、res、run 一個一個對：
        　・「待審清單」是網頁打開（或重新整理）那一刻讀回來的一份複本，之後 LINE 這邊再傳的照片，網頁要重新整理才看得到；
        　・畫面上的卡片是 draw() 那一刻排好的；按「✅ 寫進」「❌ 不要」只在那張卡片下面加一行結果、把卡片變淡，不會重排（所以上面的「待審 N 筆」也不會馬上變）；
        　・「⏭ 跳過」只把卡片在這個網頁裡藏起來，沒有告訴後端——待審清單裡還在，重新整理又會出現；
        　・真的網頁用瀏覽器的 confirm()／alert() 視窗，這裡畫成頁面裡的一個框（教學頁面不用跳出視窗）。
        純函式（SIMDEV 之間），Node 測試也直接跑它，和真的網頁專案（lstData、lstUpload、lstApply、lstDrop、lstDropAll）、真的網頁逐步比對。
     ②′ 同一個網頁的第二個分頁「📍 位置查核」（第 17 批；真的網頁的 TAB、LC、LCM、LCPEND 和函式 setTab、lcGo、lcShow、lcDraw、lcTick、lcOpen、lcSubmit、lcMoved、lcPhoto 一個一個對）：
        　・這一格的藥、打的勾、「改走了」都只放在網頁的記憶體（LCM，一個位置一份）：重新整理、關掉網頁就沒了；打勾不寫進工作表1、不寫日期；
        　・每查一次（lcGo），這一格的藥重新問後端（lstLocFind）；勾選留著（只留還在這一格的）、「改走」的標記清掉；
        　・「修改」呼叫後端 lstLocMove，只改「位置」那一格、不記進匯入紀錄；新位置工作表1 從來沒出現過 → 後端先不改，網頁問你一次；
        　・貨架照片呼叫後端 lstLocPhoto（AI 讀位置牌＋認出架上的藥），認出的藥先打勾；牌子沒讀到 → 認出的藥先記著（LCPEND），等你打位置；
        　・和 LINE 位置查核共用 _learn_dev_sim_lck.js 的找藥（dskRowsAt）、改位置（dskMove）、六張練習用的貨架照片（DSK_SHELF）。
     ② 畫面（dswMake）：用真的按鈕、輸入格畫出來，點下去就是上面的動作。選照片不是真的選檔，是從五張編好的清單（位置查核那一頁是六張貨架照片）挑。 */
  /*SIMDEV*/
  var DSL_CHIPS = [["all", "全部"], ["edit", "🟡 不一樣"], ["new", "🔵 表上沒有"], ["hand", "✍️ 手寫改的"]];
  var DSL_FIELDS = [["brand", "商品名"], ["loc", "位置"], ["form", "劑型"], ["zh", "中文名"], ["gen", "學名"]];
  var DSL_LC_FOOT = "點左邊的框＝打勾　·　不在這格＝修改";
  function dslPageNew() {
    /* open＝網頁打開了嗎、v＝從哪顆按鈕開的（up＝多張上傳、rv＝待審清單、lc＝位置查核）、hv／hl＝網址 # 後面帶的 v 和 l（重新整理會再用一次）、loaded＝讀回待審清單了嗎、A＝讀回來的複本（每一筆多一個 src：lst＝LINE 傳照片累積的、imp＝「待匯入」分頁）、
       shown＝畫面上排出來的是 A 的第幾筆、heads＝每一段的標題（第幾筆卡片前面）、curDraw＝畫面排出來那一刻「目前這一筆」、drawId＝畫面重排了幾次、
       pick＝選好還沒送的照片、pickn＝選過幾張（編號不重複）、pn＝這個網頁送到第幾張、retry＝上一輪有沒成功的、prog＝辨識進度、ask＝等你回答的確認框、alert＝跳出來的提醒。
       位置查核：tab＝現在是哪個分頁（tb＝表格校對、lc＝位置查核）、lcq／lcqRev＝查詢框裡的字（lcqRev 變了才把字寫進框）、lcmsg＝查詢框下面那一行話、LC＝現在查的這一格（TAB 的 LC）、LCM＝每一格各一份「打的勾、改走的、照片認出寫在別格的」、
       lcpend＝照片先記著的藥（LCPEND）、lcDrawId／lcEd＝這一塊重畫了幾次、這一次重畫之後改位置那個框的樣子 */
    return { open: 0, v: "", hv: "", hl: "", loaded: 0, A: [], prob: [], shown: [], heads: {}, nl: 0, ni: 0, filt: "all", cur: -1, curDraw: -1, drawId: 0, pick: [], pickn: 0, pn: 0, retry: 0, prog: null, ask: null, alert: "",
      tab: "tb", lcq: "", lcqRev: 0, lcmsg: null, LC: null, LCM: {}, lcpend: null, lcDrawId: 0, lcRev: 0, lcEd: { val: "", rev: 0, em: null } };
  }
  function dslIsNew(d) { return (d.src === "lst" && d.kind === "new") || (d.src === "imp" && d.kind === "add"); }
  function dslPass(P, d) {
    if (d.gone) return false;
    if (P.filt === "all") return true;
    if (P.filt === "hand") return !!d.hand;
    if (P.filt === "new") return dslIsNew(d);
    return !dslIsNew(d);
  }
  function dslNextCur(P) { var n = -1; P.A.forEach(function(d, i) { if (n < 0 && dslPass(P, d)) n = i; }); P.cur = n; }
  /* 畫面重排（draw）：重新數「待審幾筆、待匯入分頁幾筆」、排出要顯示哪幾張卡片、分段標題；重排之後每張卡片都是新的（上一輪的結果行、打到一半的字都不見） */
  function dslDraw(P) {
    var nl = 0, ni = 0, shown = [], secId = "", heads = {};
    P.A.forEach(function(d) { if (!d.gone) { if (d.src === "lst") nl++; else ni++; } });
    P.A.forEach(function(d, i) { if (dslPass(P, d)) shown.push(i); });
    shown.forEach(function(i) {
      var d = P.A[i], sid = d.src === "imp" ? "imp" : "p" + (d.pn || 0);
      if (sid !== secId) {
        secId = sid;
        heads[i] = d.src === "imp" ? { t: "📥 待匯入分頁", c: "" } : { t: "📷 " + (d.pn ? "第 " + d.pn + " 張" : "之前傳的"), c: d.when || "" };
      }
    });
    P.A.forEach(function(d) { d.res = null; });
    P.nl = nl; P.ni = ni; P.shown = shown; P.heads = heads; P.curDraw = P.cur; P.drawId++;
  }
  /* 網頁向後端要待審清單（lstData）：複本放進 A，排一次畫面 */
  function dslLoad(S) {
    var P = S.ops.lst.page, r = dslWebData(S);
    P.A = [];
    r.rows.forEach(function(d) { d.src = "lst"; P.A.push(d); });
    ((r.imp && r.imp.rows) || []).forEach(function(d) { d.src = "imp"; P.A.push(d); });
    P.prob = (r.imp && r.imp.problems instanceof Array) ? r.imp.problems : [];
    P.loaded = 1;
    dslDraw(P);
    return r;
  }
  /* 一張卡片上每一格「綠框裡可以改的字」原本是什麼（真的網頁 inputs()／chgRows() 一開始填的字） */
  function dslCardVals(d) {
    var out = {}, i, c;
    if (dslIsNew(d)) {
      for (i = 0; i < DSL_FIELDS.length; i++) {
        c = DSL_FIELDS[i][0];
        out[c] = (d.v && d.v[c]) || "";
        if (c === "brand" && !out[c]) out[c] = d.brand || "";
        if (c === "loc" && !out[c]) out[c] = d.loc || "";
      }
    } else {
      for (i = 0; i < (d.chg || []).length; i++) { c = d.chg[i]; out[c[0]] = d.src === "lst" ? c[3] : c[2]; }
    }
    return out;
  }
  function dslMerge(base, over) { var k, out = {}; for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k]; if (over) for (k in over) if (Object.prototype.hasOwnProperty.call(over, k)) out[k] = over[k]; return out; }
  function dslManyText(P) {
    var n = P.pick.length;
    return n ? n + " 張，同時跑 3 張，大約要 " + Math.max(1, Math.ceil(n / 3 * 40 / 60)) + " 分鐘" + (n > 12 ? "　★ 超過 12 張建議分批，中途關掉頁面會停在一半" : "") : "";
  }
  function dslGoText(P) { return (P.retry ? "🔁 重試這 " : "🔍 開始辨識（") + P.pick.length + (P.retry ? " 張" : " 張）"); }
  function dslRes(d, cls, txt) { d.res = { cls: cls, txt: txt }; }
  /* 這一次後端寫進了哪些格子（匯入紀錄新多的幾列）：給「背後發生的事」用 */
  function dslLogSince(S, n) {
    var out = [], i, e;
    for (i = n; i < S.log.length; i++) {
      e = S.log[i];
      out.push(e.act === "新增" ? "新增一列 " + e.code : e.code + " " + e.field + "：" + (e.oldV === "" ? "（空）" : e.oldV) + " → " + (e.newV === "" ? "（空）" : e.newV));
    }
    return out;
  }
  /* 按一下「✅ 寫進工作表1／📥 匯入工作表1」：真的網頁把這張卡片上綠框裡的字一起送給 lstApply */
  function dslDoOk(S, X, P, d, vals, all) {
    var n0 = S.log.length, r = dslWebApply(S, d.id, dslMerge(dslCardVals(d), vals)), w;
    dsT(X, 1, "網頁呼叫後端 lstApply：" + d.code + (d.src === "imp" ? "（「待匯入」分頁那一列）" : "（待審清單那一筆）") + "，連同這張卡片上綠框裡的字（你改過的就用你改的）");
    if (r && r.err) {
      dsT(X, 0, "後端回：" + r.err + " → 這一筆沒寫，卡片下面寫「❌ " + r.err + "」");
      dslRes(d, "bad", "❌ " + r.err);
      return r;
    }
    w = dslLogSince(S, n0);
    dsT(X, 1, "後端照著改工作表1：" + (w.length ? w.join("；") : "（沒有格子變）") + "，共 " + (r.cells || 0) + " 格");
    dsT(X, 1, "每一格都記進「匯入紀錄」（批次 " + dslBatch(S) + "，來源「對」）；7 天內打「復原」可以還原");
    dsT(X, 1, d.src === "imp" ? "把「待匯入」分頁那一列移掉；清快取、馬上重建（藥師下一句查詢就是新資料）" : "從待審清單拿掉這一筆；清快取、馬上重建（藥師下一句查詢就是新資料）");
    dslRes(d, "ok", all ? "✅ 已寫入" : "✅ " + (r.msg ? r.msg : "已寫入") + "　打「復原」可還原");
    d.gone = true;
    X.wrote = 1;
    return r;
  }
  function dslDoDrop(S, X, P, d) {
    var r = dslWebDrop(S, d.id);
    dsT(X, 1, d.src === "imp" ? "網頁呼叫後端 lstDrop：把「待匯入」分頁上 " + d.code + " 那一列刪掉（分頁上的列，不能復原；沒有寫進工作表1）" : "網頁呼叫後端 lstDrop：把 " + d.code + " 這一筆從待審清單拿掉（沒有寫進工作表1，工作表1 不會變）");
    dslRes(d, "bad", (r && r.msg) || "已移掉");   /* 真的網頁就是這樣：成功也用紅字「已移掉」 */
    d.gone = true;
    dslNextCur(P);
  }
  function dslLiveIdx(P) { var out = []; P.A.forEach(function(d, i) { if (dslPass(P, d)) out.push(i); }); return out; }
  function dslSheetTail(X, text) { X.sheet = text; }

  /* ───── 位置查核分頁：後端三支（13 的 lstLocFind、lstLocMove、lstLocPhoto；和 LINE 的位置查核共用找藥、改位置）───── */
  /* 後端回給網頁的一列（_lckRowOut_＝_appLite_）：thumb＝有照片就有縮圖（真的是照片網址，練習用 1／0） */
  function dslLcRowOut(code, r) {
    return { code: code, brand: String(r.b || ""), chName: String(r.z || ""), location: String(r.loc === null || r.loc === undefined ? "" : r.loc), form: String(r.f || ""), kind: dskIsWater(r) ? "水" : "錠", thumb: dsPhOk(r.photo) ? 1 : 0 };
  }
  function dslLocFind(S, text) {
    var key = dskKey(text), canon, rows, out = [], i;
    if (!key) return { err: "請輸入位置（例如 A1）" };
    canon = dskCanon(S, key);
    rows = dskRowsAt(S, key);
    for (i = 0; i < rows.length; i++) out.push(dslLcRowOut(rows[i].code, rows[i].r));
    return { key: key, loc: canon ? canon.loc : key, known: !!canon, n: out.length, capped: rows.length >= DSK_LOC_MAX, rows: out, locs: dskAllLocs(S).map(function(x) { return { loc: x.loc, n: x.n }; }) };
  }
  /* 改位置：只改位置那一格，不記匯入紀錄；改完馬上清快取、馬上重建（_lstRefresh_），回 sync:1（網頁在背景再叫 LINE 專案清一次） */
  function dslLocMove(S, code, newLoc, oldLoc, allowNew) {
    var X0 = dsX(), res = dskMove(S, X0, code, newLoc, oldLoc, !!allowNew);
    if (res.err || res.confirm) return res;
    if (!res.same) { dsCacheWarm(S); res.sync = 1; }      /* 一樣（沒寫任何東西）就沒有 sync：真的 _webSyncTail_ 只有寫過才帶 sync:1 */
    return res;
  }
  /* 貨架照片（練習用的六張，DSK_SHELF）：位置牌上的字、工作表1 認得的位置、照片裡認出的藥。牌子沒讀到、藥也認不出來 → { err }（lstLocPhoto 的 ph.err） */
  function dslLocPhoto(S, key) {
    var p = dskShelf(key), label, k, canon, ix, rec = [], seen = {}, i, c, row;
    if (!p) return { err: "照片資料讀不出來，請再選一次" };
    label = p.sign || "";
    if (p.recErr && !label) return { err: p.recErr };
    k = label ? dskKey(label) : "";
    canon = k ? dskCanon(S, k) : null;
    ix = dsIdx(S);
    if (!p.recErr) {
      for (i = 0; i < (p.rec || []).length; i++) {
        c = dsNorm(p.rec[i]);
        row = c ? dskFind(ix, c) : null;
        if (!row || seen[c]) continue;
        seen[c] = 1;
        rec.push(dslLcRowOut(c, row));
      }
    }
    return { label: label, key: canon ? canon.key : "", loc: canon ? canon.loc : "", rec: rec, recErr: p.recErr || "", sec: p.sec };
  }

  /* ───── 位置查核分頁：網頁自己的事（lcMsg、lcGo、lcShow、lcDraw、lcTick、lcOpen、lcSubmit、lcMoved、lcPhoto）───── */
  /* 查詢框下面那一行話：parts＝一段一段的字（字串裡的換行就是 <br>；{ b: 字 } 是粗體），cls＝"ok"／"bad"／""；沒有字＝收起來 */
  function dslLcMsg(P, parts, cls) { P.lcmsg = parts && parts.length ? { parts: parts, cls: cls || "" } : null; }
  function dslLcMsgText(P) { var s = "", i; if (!P.lcmsg) return ""; for (i = 0; i < P.lcmsg.parts.length; i++) s += typeof P.lcmsg.parts[i] === "string" ? P.lcmsg.parts[i] : P.lcmsg.parts[i].b; return s; }
  function dslLcDraw(P) { P.lcDrawId++; P.lcEd = { val: "", rev: ++P.lcRev, em: null }; }   /* lcDraw：這一塊整個重畫，改位置的框也是新的（選單回到第一項、輸入框是空的、狀態那一行沒字） */
  function dslLcEdMsg(P, t, cls) { P.lcEd.em = t ? { t: t, cls: cls || "" } : null; }
  function dslLcSeen(m, rows) { var n = 0, t = 0; rows.forEach(function(x) { t++; if (m.tick[x.code] || m.moved[x.code]) n++; }); return { n: n, t: t }; }
  function dslLcRows(m) { return m.a.map(function(c) { return m.by[c]; }).filter(Boolean); }
  function dslLcRowOf(m, code) {
    var i;
    if (m.by[code]) return m.by[code];
    for (i = 0; i < m.other.length; i++) if (m.other[i].code === code) return m.other[i];
    return null;
  }
  /* 查一格：text＝打的位置；opt.rec＝照片認出的藥（要先打勾的）；opt.lead＝卡片上面那一段話 */
  function dslLcGo(S, X, text, opt) {
    var P = S.ops.lst.page, rec, lead, r;
    opt = opt || {};
    text = String(text === null || text === undefined ? "" : text).replace(/^\s+|\s+$/g, "");
    if (!text) {
      dslLcMsg(P, ["請輸入位置，例如 A1"], "bad");
      dsT(X, 0, "輸入框是空的就按了「查這一格」：網頁自己提醒「請輸入位置，例如 A1」，沒有問後端");
      X.sheet = "沒動"; X.reply = "（網頁畫面）查詢框下面紅字「請輸入位置，例如 A1」";
      return;
    }
    rec = opt.rec || null;
    lead = opt.lead || "";
    if (!rec && P.lcpend) {
      rec = P.lcpend;
      lead = "📷 用剛才那張照片認出的藥。";
      dsT(X, 1, "剛才那張貨架照片認出的 " + rec.length + " 支藥網頁還記著 → 這一次查出來的這一格，用它們先打勾");
    }
    r = dslLocFind(S, text);
    dsT(X, 1, "網頁呼叫後端 lstLocFind：" + (r.err ? "「" + text + "」" : "「" + text + "」→ 整理成「" + r.key + "」（全形轉半形、英文大寫、空白拿掉）") + "，跟藥師打位置查藥、LINE 的位置查核用同一套找法");
    if (r.err) {
      dslLcMsg(P, [r.err], "bad");
      dsT(X, 0, "後端回：" + r.err + " → 查詢框下面紅字，不動畫面上原本那一格");
      X.sheet = "沒動"; X.reply = "（網頁畫面）查詢框下面紅字「" + r.err + "」";
      return;
    }
    P.lcpend = null;
    dslLcShow(S, X, r, rec, lead);
  }
  function dslLcShow(S, X, r, rec, lead) {
    var P = S.ops.lst.page, key = r.key, m = P.LCM[key] || { tick: {}, moved: {}, other: [], a: [], by: {} }, here = {}, codes = [], tk = {}, yes = 0, oth = 0, seen = {}, i, j, c, x, dup, lastTick = 0, keptTick = 0;
    for (i = 0; i < r.rows.length; i++) { here[r.rows[i].code] = 1; codes.push(r.rows[i].code); }
    for (c in m.tick) if (Object.prototype.hasOwnProperty.call(m.tick, c)) { lastTick++; if (here[c]) { tk[c] = 1; keptTick++; } }
    m.tick = tk;
    m.moved = {};
    m.a = codes;
    m.by = {};
    for (i = 0; i < r.rows.length; i++) m.by[r.rows[i].code] = r.rows[i];
    m.other = (m.other || []).filter(function(y) { return !here[y.code]; });
    if (rec) {
      for (i = 0; i < rec.length; i++) {
        x = rec[i];
        if (!x || !x.code || seen[x.code]) continue;
        seen[x.code] = 1;
        if (here[x.code]) { m.tick[x.code] = 1; yes++; }
        else {
          dup = false;
          for (j = 0; j < m.other.length; j++) if (m.other[j].code === x.code) dup = true;
          if (!dup) m.other.push(x);
          oth++;
        }
      }
      m.other = m.other.slice(0, 12);
      lead = (lead ? lead + "\n" : "") + "照片裡認出 " + (yes + oth) + " 支藥：工作表1 也寫這一格的 " + yes + " 支先幫你打勾" + (oth ? "，另有 " + oth + " 支工作表1 寫在別格（列在最後一段）" : "") + "。\n其餘的請對照架上一支一支確認。";
    }
    P.LCM[key] = m;
    P.LC = { key: key, loc: r.loc || key, known: !!r.known, n: r.n, capped: !!r.capped, locs: r.locs || [], edit: "", confirm: "" };
    P.lcq = P.LC.loc;
    P.lcqRev++;
    dslLcMsg(P, lead ? [lead] : null, "");
    dslLcDraw(P);
    dsT(X, 1, "後端回：「" + P.LC.loc + "」這一格有 " + r.n + " 支藥" + (r.known ? "" : "（工作表1 從來沒出現過這個位置）") + (r.capped ? "（超過 200 支，只回前 200）" : "") + "，另外附上工作表1 出現過的所有位置 " + P.LC.locs.length + " 個（給「修改」的下拉選單用）");
    dsT(X, 1, "網頁把這一格記在自己的記憶體裡（打的勾、改走的標記都放這裡）" + (lastTick ? "；上一次在這一格打的勾留下 " + keptTick + " 個（只留還在這一格的）" : "") + "。重新整理、關掉網頁就沒了，不寫進工作表1、不寫日期");
    if (rec) dsT(X, 1, "照片認出 " + (yes + oth) + " 支：工作表1 也寫這一格的 " + yes + " 支先打勾" + (oth ? "；寫在別格的 " + oth + " 支放在最後一段「📷 照片裡也認出」" : ""));
    X.sheet = "沒動（只是查；打勾只放在網頁的記憶體）";
    X.reply = "（網頁畫面）" + (lead ? "一段說明＋" : "") + "「" + P.LC.loc + "」這一格的卡片：已看 " + dslLcSeen(m, dslLcRows(m)).n + "/" + dslLcRows(m).length + "，每一列左邊打勾框、右邊「修改」";
  }
  function dslLcTick(S, X, code, on) {
    var P = S.ops.lst.page, m = P.LC && P.LCM[P.LC.key], sn, rows;
    if (!m || m.moved[code] || !dslLcRowOf(m, code)) return;
    if (on) m.tick[code] = 1; else delete m.tick[code];
    rows = dslLcRows(m);
    sn = dslLcSeen(m, rows);
    dsT(X, 1, (on ? "打勾 " : "取消打勾 ") + code + "：只改網頁記憶體裡的「看過」名單，沒有問後端，不寫進工作表1、不寫日期");
    dsT(X, 1, "只更新這一列的顏色和上面的「已看」，卡片不重畫：" + (sn.t > 0 && sn.n >= sn.t ? "✅ 全部看完了　" : "已看 ") + sn.n + "/" + sn.t);
    X.sheet = "沒動（打勾只放在網頁的記憶體）";
    X.reply = "（網頁畫面）這一列" + (on ? "變綠、框裡打勾" : "變回白色") + "，上面「已看 " + sn.n + "/" + sn.t + "」";
  }
  function dslLcOpen(S, X, code) {
    var P = S.ops.lst.page, LC = P.LC, m = LC && P.LCM[LC.key], x = m && dslLcRowOf(m, code);
    if (!LC || !x) return;
    LC.edit = LC.edit === code ? "" : code;
    LC.confirm = "";
    dslLcDraw(P);
    if (LC.edit) {
      dsT(X, 1, "按了 " + code + " 的「" + (m.moved[code] ? "再改" : "修改") + "」：這一列底下展開改位置的框（下拉選單列出工作表1 出現過的位置，不含它現在的「" + (x.location || "空的") + "」；也可以直接打字）。還沒問後端");
      X.reply = "（網頁畫面）這一列底下多一個改位置的框，輸入框在等你";
    } else {
      dsT(X, 1, "又按了一次同一列的按鈕：改位置的框收起來");
      X.reply = "（網頁畫面）改位置的框收起來";
    }
    X.sheet = "沒動";
  }
  function dslLcSel(S, X, val) {
    var P = S.ops.lst.page, LC = P.LC;
    if (!LC || !LC.edit || !val) return;
    P.lcEd.val = val;
    P.lcEd.rev = ++P.lcRev;
    LC.confirm = "";
    dslLcEdMsg(P, "", "");
    dsT(X, 1, "從下拉選單選了「" + val + "」：網頁把它填進下面的輸入框（還沒送出），「請再確認一次」的提醒收起來");
    X.sheet = "沒動"; X.reply = "（網頁畫面）輸入框填入「" + val + "」，按鈕寫「改成這個位置」";
  }
  function dslLcInp(S, X) {
    var P = S.ops.lst.page, LC = P.LC;
    if (!LC || !LC.edit || !LC.confirm) return;
    LC.confirm = "";
    dsT(X, 1, "改了輸入框裡的字：剛才「確定改成…」的提醒收起來，按鈕換回「改成這個位置」");
    X.sheet = "沒動"; X.reply = "（網頁畫面）提醒收起來";
  }
  function dslLcCancel(S, X) {
    var P = S.ops.lst.page, LC = P.LC;
    if (!LC) return;
    LC.edit = "";
    LC.confirm = "";
    dslLcDraw(P);
    dsT(X, 1, "按了「取消」：改位置的框收起來，什麼都沒改");
    X.sheet = "沒動"; X.reply = "（網頁畫面）改位置的框收起來";
  }
  function dslLcClear(S, X) {
    var P = S.ops.lst.page, LC = P.LC, m = LC && P.LCM[LC.key], n = 0, c;
    if (!m) return;
    for (c in m.tick) if (Object.prototype.hasOwnProperty.call(m.tick, c)) n++;
    m.tick = {};
    dslLcDraw(P);
    dslLcMsg(P, ["↺ " + LC.loc + " 的勾選清掉了。"], "");
    dsT(X, 1, "按了「↺ 清掉勾選」：" + LC.loc + " 這一格網頁記憶體裡的 " + n + " 個勾清掉（改走的標記不動）；這一塊重畫，改位置的框如果開著，裡面打到一半的字也會不見");
    X.sheet = "沒動"; X.reply = "（網頁畫面）「↺ " + LC.loc + " 的勾選清掉了。」，每一列都變回沒勾";
  }
  function dslLcSubmit(S, X, typed) {
    var P = S.ops.lst.page, LC = P.LC, m = LC && P.LCM[LC.key], code = LC && LC.edit, x = code && m && dslLcRowOf(m, code), val, allow, r;
    if (!x) return;
    val = LC.confirm || String(typed === null || typed === undefined ? "" : typed).replace(/^\s+|\s+$/g, "");
    if (!val) {
      dslLcEdMsg(P, "請從清單選一個，或打新的位置。", "bad");
      dsT(X, 0, "下拉選單沒選、輸入框也是空的就按了「改成這個位置」：網頁自己提醒「請從清單選一個，或打新的位置。」，沒有問後端");
      X.sheet = "沒動"; X.reply = "（網頁畫面）改位置的框裡紅字「請從清單選一個，或打新的位置。」";
      return;
    }
    allow = !!LC.confirm;
    dsT(X, 1, "網頁呼叫後端 lstLocMove：" + code + " 改成「" + val + "」，連同畫面上看到的舊位置「" + (x.location || "空的") + "」" + (allow ? "，並說明「這個新位置我確定」" : "") + "（後端核對：舊位置跟工作表1 現在的不一樣＝別人剛改過，不蓋過去）");
    r = dslLocMove(S, code, val, x.location || "", allow);
    if (r.err) {
      dslLcEdMsg(P, r.err, "bad");
      dsT(X, 0, "後端回：" + r.err);
      X.sheet = "沒動"; X.reply = "（網頁畫面）改位置的框裡紅字「" + r.err + "」";
      return;
    }
    if (r.confirm) {
      LC.confirm = r.key || val;
      dslLcDraw(P);
      P.lcEd.val = LC.confirm;
      P.lcEd.rev = ++P.lcRev;
      dsT(X, 2, "後端回：「" + LC.confirm + "」是工作表1 從來沒出現過的位置（可能打錯了）→ 先不改，網頁問你一次：按「✅ 確定改成 " + LC.confirm + "」才真的改");
      X.sheet = "沒動（等你按「確定」）"; X.reply = "（網頁畫面）改位置的框裡多一行提醒「「" + LC.confirm + "」目前工作表1 裡沒有任何藥放在這裡（可能是打錯了）。確定改成它嗎？」，按鈕變「✅ 確定改成 " + LC.confirm + "」";
      return;
    }
    dslLcMoved(S, X, code, r);
  }
  /* 改好了：改走的那一列留在原位（顯示「→ 已改到 X」，算看過）；拉進這一格的（照片認出、工作表1 寫在別格）排進清單、打勾 */
  function dslLcMoved(S, X, code, r) {
    var P = S.ops.lst.page, LC = P.LC, m = P.LCM[LC.key], x = dslLcRowOf(m, code), k = String(r.after || "").replace(/\s+/g, "").toUpperCase(), here = k === String(LC.key || "").toUpperCase(), i, oi = -1, sn;
    LC.edit = "";
    LC.confirm = "";
    if (r.same) {
      dslLcMsg(P, ["👌 " + code + " 本來就在「" + r.after + "」，沒有動。"], "");
      dslLcDraw(P);
      dsT(X, 1, code + " 本來就在「" + r.after + "」→ 後端什麼都沒改，網頁收起改位置的框，上面寫「👌 …本來就在…，沒有動。」");
      X.sheet = "沒動"; X.reply = "（網頁畫面）「👌 " + code + " 本來就在「" + r.after + "」，沒有動。」";
      return;
    }
    if (x) x.location = r.after;
    if (here) {
      for (i = 0; i < m.other.length; i++) if (m.other[i].code === code) { m.by[code] = m.other[i]; m.other.splice(i, 1); break; }
      if (m.a.indexOf(code) < 0) m.a.push(code);
      m.tick[code] = 1;
      delete m.moved[code];
    } else {
      delete m.tick[code];
      for (i = 0; i < m.other.length; i++) if (m.other[i].code === code) oi = i;
      if (oi >= 0) m.other.splice(oi, 1); else m.moved[code] = r.after;
    }
    dslLcMsg(P, ["✅ 位置改好了：", { b: code }, "　" + (r.before || "（空的）") + " → " + r.after + "\n快取已更新，藥師現在查就是新位置。（這個修改不記進匯入紀錄）"], "ok");
    dslLcDraw(P);
    sn = dslLcSeen(m, dslLcRows(m));
    dsT(X, 1, "只改「位置」那一格：" + code + "　" + (r.before || "（空的）") + " → " + r.after + "（自動統一成半形大寫；不記進「匯入紀錄」，所以沒有 7 天內的「復原」）");
    dsT(X, 1, "後端改完馬上清快取、馬上重建：藥師現在查 " + code + " 或 " + r.after + "，看到的就是新位置；網頁隔一下再在背景通知 LINE 專案清一次快取");
    dsT(X, 1, here ? "它現在在這一格：排進清單、打勾，算看過" : "它不在這一格了：留在原位，打勾框換成「→」，列上寫「→ 已改到 " + r.after + "」，算看過；上面「已看 " + sn.n + "/" + sn.t + "」");
    X.sheet = "改了 1 格（" + code + " 的位置：" + (r.before || "空的") + " → " + r.after + "）；不記進匯入紀錄";
    X.wrote = 1;
    X.reply = "（網頁畫面）「✅ 位置改好了：" + code + "　" + (r.before || "（空的）") + " → " + r.after + "」，" + (here ? "這一列打勾" : "這一列顯示「→ 已改到 " + r.after + "」");
  }
  /* 貨架照片：網頁把照片送給後端（lstLocPhoto）→ AI 讀位置牌＋認出架上的藥 */
  function dslLcPhoto(S, X, key) {
    var P = S.ops.lst.page, p = dskShelf(key), ph, rec;
    if (!p) return;
    dsT(X, 1, "在手機上選了貨架照片「" + p.short + "」（" + p.kb + " KB）：網頁把照片送給後端（lstLocPhoto），請 AI 看兩件事：①架上的位置牌寫什麼 ②架上認出哪些藥");
    ph = dslLocPhoto(S, key);
    if (ph.err) {
      dslLcMsg(P, [ph.err], "bad");
      dsT(X, 0, "牌子沒讀到、藥也認不出來 → 後端回：" + ph.err + "（網頁在查詢框下面寫紅字，請重拍）");
      X.sheet = "沒動"; X.reply = "（網頁畫面）查詢框下面紅字「" + ph.err + "」";
      return;
    }
    rec = ph.rec;
    dsT(X, ph.recErr ? 2 : 1, "後端回：位置牌" + (ph.label ? "「" + ph.label + "」" : "沒讀到") + (ph.key ? "（工作表1 有人用的位置「" + ph.loc + "」）" : ph.label ? "（但工作表1 沒有藥放在這個位置）" : "") + "；認出 " + rec.length + " 支藥" + (ph.recErr ? "（認藥沒成功：" + ph.recErr + "）" : "") + "，花 " + ph.sec + " 秒");
    if (ph.key) {
      dsT(X, 1, "位置牌是工作表1 認得的位置 → 網頁接著用這個位置問後端（lstLocFind），把這一格列出來；認出的藥先打勾");
      dslLcGo(S, X, ph.key, { rec: rec, lead: "📷 位置牌讀到「" + (ph.loc || ph.label) + "」（" + (+ph.sec || 0) + " 秒）。" + (ph.recErr ? "\n⚠️ 藥品辨識沒成功（" + ph.recErr + "），這張只用到位置牌。" : "") });
      return;
    }
    P.lcpend = rec;
    dslLcMsg(P, [(ph.label ? "位置牌讀到「" + ph.label + "」，但工作表1 裡沒有藥放在這個位置。" : "這張照片裡沒讀到位置牌。") + "\n" + (rec.length ? "藥品認出了 " + rec.length + " 支，先記著。\n" : "") + "請在上面打這一格的位置（例如 A1），我就" + (rec.length ? "用這張照片認出的藥幫你打勾" : "列出那一格的藥") + "。"], "bad");
    dsT(X, 2, ph.label ? "位置牌上的「" + ph.label + "」，工作表1 沒有藥放在這裡 → 不能自己決定是哪一格" : "沒讀到位置牌 → 不能自己決定是哪一格");
    dsT(X, 1, rec.length ? "認出的 " + rec.length + " 支藥先記在網頁的記憶體；你接著在上面打這一格的位置，就用它們先打勾" : "沒有認出的藥；你接著打位置就好");
    X.sheet = "沒動"; X.reply = "（網頁畫面）查詢框下面紅字請你打這一格的位置" + (rec.length ? "（認出的藥先記著）" : "");
  }
  /* 網頁上的一個動作。ev.w＝動作；i＝第幾張卡片；vals＝卡片上綠框現在的字；key＝挑哪一張紙。回的一律是「網頁自己的事」，聊天室不動（X.keep） */
  function dslWeb(S, X, ev) {
    var L = S.ops.lst, w = String(ev.w || ""), P = L.page, d, i, p, r, ids, n0, imp, fail, rows, all, ask, hv, hl, vp;
    X.keep = 1;
    X.sheet = "沒動"; X.reply = "（網頁畫面）";
    if (w === "open" || w === "reload") {
      /* 網址 # 後面帶的 v（up＝多張上傳、rv＝待審清單、lc＝位置查核）和 l（位置查核要查哪一格）：重新整理會再用一次同樣的網址 */
      if (w === "reload" && P.open) { hv = P.hv; hl = P.hl; }
      else { vp = String(ev.v || "").split(":"); hv = vp[0] === "up" || vp[0] === "lc" ? vp[0] : "rv"; hl = hv === "lc" && vp.length > 1 ? vp.slice(1).join(":") : ""; }
      L.page = dslPageNew();
      P = L.page;
      P.open = 1;
      P.hv = hv; P.hl = hl;
      P.v = hv;
      r = dslLoad(S);
      if (w === "reload") dsT(X, 1, "按了瀏覽器的重新整理：整個網頁重新載入，網頁裡記著的東西（選好的照片、跳過的卡片、打到一半的字、位置查核打的勾）全部不見" + (hv === "lc" ? "；網址後面還帶著 v=lc，所以又是停在「📍 位置查核」" + (hl ? "，而且又自動查一次「" + hl + "」" : "") : "；網址後面的 v=" + hv + " 還在，所以又回到這個位置"));
      else dsT(X, 1, "手機（或電腦）的瀏覽器開了 GitHub 上的網頁 lst.html：網址後面帶著你的開發者鑰匙，只有綁定過的地方打得開（最多 3 處）" + (hv === "lc" ? "，還有 v=lc" + (hl ? "、l=" + hl : "") + "（要開「📍 位置查核」" + (hl ? "、查哪一格" : "") + "）" : ""));
      dsT(X, 1, "網頁向後端要待審清單（lstData）：LINE 傳照片累積的 " + r.rows.length + " 筆" + (r.imp && r.imp.rows.length ? "，加上「待匯入」分頁的 " + r.imp.rows.length + " 筆" : "") + "；這是" + (w === "reload" ? "重新" : "") + "讀回來的一份複本");
      dsT(X, 1, "LINE 那邊之後再傳的照片，網頁要「重新整理」或再按聊天室的「📋 待審清單」才看得到");
      X.sheet = "沒動（只是讀）";
      X.reply = "（網頁畫面）上面是上傳照片的區塊，下面是待審 " + P.nl + " 筆、待匯入分頁 " + P.ni + " 筆的卡片";
      if (hv === "lc") {
        P.tab = "lc";
        dsT(X, 1, "網址帶 v=lc → 網頁切到「📍 位置查核」分頁（「表格校對」那一塊還是讀好了，切回去就看得到）");
        X.reply = "（網頁畫面）停在「📍 位置查核」分頁";
        if (hl) {
          P.lcq = hl;
          P.lcqRev++;
          dsT(X, 1, "網址帶 l=" + hl + " → 查詢框填入「" + hl + "」，馬上查這一格");
          dslLcGo(S, X, hl);
        }
      }
      return;
    }
    if (w === "close") {   /* 關掉網頁（瀏覽器的分頁關掉）：網頁裡記著的東西全部不見；後端的待審清單還在 */
      L.page = dslPageNew();
      dsT(X, 1, "關掉網頁：網頁裡記著的東西（選好的照片、跳過的卡片、打到一半的字）全部不見；後端的待審清單還在，下次打開又讀得回來");
      X.sheet = "沒動"; X.reply = "（網頁畫面）網頁關掉了";
      return;
    }
    if (!P.open) {
      dsT(X, 0, "網頁還沒打開：要先在聊天室按「📤 多張上傳」或「📋 待審清單」");
      X.sheet = "沒動"; X.reply = "（沒有反應）";
      return;
    }
    ask = w === "yes" ? P.ask : null;
    if (w !== "yes") P.ask = null;   /* 確認框沒回答、去按別的＝當作取消 */
    P.alert = "";
    if (w === "ack") { dsT(X, 1, "關掉提醒"); X.sheet = "沒動"; X.reply = "（網頁畫面）提醒收起來"; return; }
    if (w === "no") { dsT(X, 1, "按了「取消」：什麼都沒做"); X.sheet = "沒動"; X.reply = "（網頁畫面）確認框收起來"; return; }
    if (w === "tab") {   /* 換分頁（setTab）：表格校對那一塊換回來時會重新排一次（draw） */
      P.tab = ev.tab === "lc" ? "lc" : "tb";
      if (P.tab === "tb" && P.loaded) dslDraw(P);
      dsT(X, 1, "按了「" + (P.tab === "lc" ? "📍 位置查核" : "📋 表格校對") + "」分頁：網頁自己換一塊畫面，沒有問後端" + (P.tab === "tb" && P.loaded ? "；「表格校對」那一塊重新排一次（卡片上打到一半的字、寫過的結果那一行都不見了，寫過的卡片也不會再出現）" : "；查詢框拿到焦點"));
      X.sheet = "沒動"; X.reply = "（網頁畫面）換到「" + (P.tab === "lc" ? "📍 位置查核" : "📋 表格校對") + "」分頁";
      return;
    }
    if (w === "lcgo") { dslLcGo(S, X, ev.text); return; }
    if (w === "lcphoto") { dslLcPhoto(S, X, ev.key); return; }
    if (w === "lctick") { dslLcTick(S, X, String(ev.c || ""), !!ev.on); return; }
    if (w === "lcopen") { dslLcOpen(S, X, String(ev.c || "")); return; }
    if (w === "lcsel") { dslLcSel(S, X, String(ev.val || "")); return; }
    if (w === "lcinp") { dslLcInp(S, X); return; }
    if (w === "lcsubmit") { dslLcSubmit(S, X, ev.text); return; }
    if (w === "lccx") { dslLcCancel(S, X); return; }
    if (w === "lcclr") { dslLcClear(S, X); return; }
    if (w === "pick") {
      p = dslPaper(ev.key);
      if (!p) return;
      P.retry = 0;
      P.pick.push({ k: ++P.pickn, key: p.key, name: p.file, kb: p.kb });
      dsT(X, 1, "在手機上選了照片「" + p.file + "」（" + p.kb + " KB）：網頁先在自己這邊做一張小縮圖放在畫面上，還沒送去辨識，也沒傳給機器人");
      X.reply = "（網頁畫面）縮圖多一張，下面的按鈕寫「" + dslGoText(P) + "」";
      return;
    }
    if (w === "unpick") {
      i = parseInt(ev.i, 10);
      if (!(i >= 0 && i < P.pick.length)) return;
      p = P.pick.splice(i, 1)[0];
      dsT(X, 1, "把「" + p.name + "」從選好的照片拿掉（只在網頁裡）");
      X.reply = "（網頁畫面）縮圖少一張";
      return;
    }
    if (w === "clr") {
      if (!P.pick.length) return;
      P.ask = { k: "clr", text: "要把選好的 " + P.pick.length + " 張照片全部清掉嗎？\n（還沒送去辨識，清掉不影響下面已經讀進來的）" };
      dsT(X, 1, "按了「🗑 全部清掉」：真的網頁會先跳出確認視窗（這裡畫成框）");
      X.reply = "（網頁畫面）確認框：「要把選好的 " + P.pick.length + " 張照片全部清掉嗎？」";
      return;
    }
    if (w === "yes" && ask && ask.k === "clr") {
      n0 = P.pick.length;
      P.pick = []; P.retry = 0;
      dsT(X, 1, "確定：選好的 " + n0 + " 張照片全部清掉（只在網頁裡；已經讀進來的待審不受影響）");
      X.reply = "（網頁畫面）縮圖清空，「開始辨識」收起來";
      return;
    }
    if (w === "go") {
      if (!P.pick.length) return;
      rows = []; fail = []; n0 = P.pick.length;
      P.pick.slice().forEach(function(pk) {
        var rr = dslWebUpload(S, pk.key, ++P.pn), t, add = S.ops.lst.add;
        if (!rr || rr.err) {
          fail.push(pk);
          rows.push({ k: pk.k, name: pk.name, st: "bad", txt: (rr && rr.err) || "失敗" });
          dsT(X, 0, "第 " + P.pn + " 張「" + pk.name + "」：網頁把照片送給後端（lstUpload）→ " + ((rr && rr.err) || "失敗") + " → 這一張什麼都沒存，留在上面等你「重試」");
        } else {
          rows.push({ k: pk.k, name: pk.name, st: "ok", txt: "讀到 " + rr.read + "　不一樣 " + rr.edit + "　新 " + rr.neu + "　" + rr.sec + "s" + (rr.full ? "　⚠️ 待審已滿" : "") });
          t = "第 " + P.pn + " 張「" + pk.name + "」：送給後端（lstUpload）→ AI 把照片讀成 " + rr.read + " 筆 → 逐列對工作表1：不一樣 " + rr.edit + "、表上沒有 " + rr.neu + (rr.bad ? "、有 " + rr.bad + " 行 code 讀不出來" : "") + " → 差異存進待審清單（新增 " + add.add + " 筆" + (add.rep ? "、換掉原本同一支藥的 " + add.rep + " 筆" : "") + "），待審共 " + rr.left + " 筆";
          dsT(X, 1, t);
        }
      });
      P.pick = fail; P.retry = fail.length > 0 ? 1 : 0;
      P.prog = { rows: rows, fill: 100, end: fail.length ? { s: "⚠️", t: "有 " + fail.length + " 張沒成功，按上面「重試這 " + fail.length + " 張」再送一次" } : { s: "🎉", t: "全部 " + n0 + " 張都讀完了，往下審" } };
      dsT(X, 1, "全部送完：網頁再向後端要一次待審清單（lstData），重新排畫面");
      dslLoad(S);
      X.sheet = "沒動（只是比對；要寫進工作表1，要在下面的卡片上按「✅ 寫進工作表1」）";
      X.reply = "（網頁畫面）每一張一行結果；" + (fail.length ? "有 " + fail.length + " 張失敗" : "全部讀完了") + "；下面待審 " + P.nl + " 筆";
      return;
    }
    if (w === "filt") {
      p = null;
      for (i = 0; i < DSL_CHIPS.length; i++) if (DSL_CHIPS[i][0] === ev.f) p = DSL_CHIPS[i];
      if (!p) return;
      P.filt = p[0];
      dslNextCur(P);
      dslDraw(P);
      dsT(X, 1, "按了篩選「" + p[1] + "」：網頁自己把畫面重排，只留這一類（不問後端，也不動資料）");
      X.reply = "（網頁畫面）畫面上剩 " + P.shown.length + " 張卡片";
      return;
    }
    if (w === "skip" || w === "drop" || w === "ok") {
      i = parseInt(ev.i, 10);
      d = P.A[i];
      if (!d) return;
      if (w === "skip") {
        d.gone = true;
        dslNextCur(P);
        dslDraw(P);
        dsT(X, 1, "按了「⏭ 跳過」：只是把 " + d.code + " 這張卡片在這個網頁裡藏起來，沒有告訴後端");
        dsT(X, 1, "所以待審清單裡這一筆還在；網頁重新整理（或下次再開）又會出現");
        X.reply = "（網頁畫面）這張卡片不見了，上面的數字重算";
        return;
      }
      if (w === "drop") {
        if (d.src === "imp") {
          P.ask = { k: "drop", i: i, text: "這一列會從「待匯入」分頁刪掉（分頁那一列不能復原）。確定不需要？" };
          dsT(X, 1, "按了「❌ 不需要」：這一筆是「待匯入」分頁上的列，真的網頁會先跳出確認視窗（這裡畫成框）：刪掉就不能復原");
          X.reply = "（網頁畫面）確認框";
          return;
        }
        dslDoDrop(S, X, P, d);
        X.reply = "（網頁畫面）這張卡片變淡，下面寫「已移掉」";
        X.sheet = "沒動（工作表1 不會有任何改變）";
        return;
      }
      r = dslDoOk(S, X, P, d, ev.vals, false);
      X.sheet = r && r.err ? "沒動" : "寫了 " + (r.cells || 0) + " 格";
      X.reply = "（網頁畫面）這張卡片變淡，下面寫「" + (r && r.err ? "❌ " + r.err : "✅ " + (r.msg || "已寫入")) + "」";
      return;
    }
    if (w === "yes" && ask && ask.k === "drop") {
      d = P.A[ask.i];
      if (!d) return;
      dslDoDrop(S, X, P, d);
      X.reply = "（網頁畫面）這張卡片變淡，下面寫「已從待匯入分頁移掉（沒有寫進工作表1）」";
      X.sheet = "「待匯入」分頁那一列刪掉了（工作表1 不會變）";
      return;
    }
    if (w === "all") {
      ids = dslLiveIdx(P);
      if (!ids.length) return;
      P.ask = { k: "all", text: "要把這 " + ids.length + " 筆全部寫進工作表1 嗎？\n（7 天內打「復原」可以還原）" };
      dsT(X, 1, "按了「✅ 全部寫進」：真的網頁會先跳出確認視窗（這裡畫成框）");
      X.reply = "（網頁畫面）確認框：「要把這 " + ids.length + " 筆全部寫進工作表1 嗎？」";
      return;
    }
    if (w === "yes" && ask && ask.k === "all") {
      ids = dslLiveIdx(P);
      n0 = 0; fail = [];
      all = ev.all || {};
      ids.forEach(function(j) {
        var dd = P.A[j], rr = dslDoOk(S, X, P, dd, all[String(j)] || null, true);
        if (rr && rr.err) fail.push(dd.code + "：" + rr.err); else n0++;
      });
      dslDraw(P);
      dsT(X, 1, "全部呼叫完：網頁把這一批重排，成功的卡片不見，沒成功的又會出現");
      X.sheet = n0 ? "寫了工作表1 的 " + n0 + " 筆" : "沒動";
      X.reply = "（網頁畫面）成功 " + n0 + " 筆" + (fail.length ? "；沒成功 " + fail.length + " 筆（" + fail.join("、") + "）" : "");
      return;
    }
    if (w === "delall") {
      ids = dslLiveIdx(P);
      if (!ids.length) return;
      imp = 0;
      ids.forEach(function(j) { if (P.A[j].src === "imp") imp++; });
      P.ask = { k: "delall", text: "要把這 " + ids.length + " 筆全部刪掉嗎？\n不會寫進工作表1，工作表1 不會有任何改變。" + (imp ? "\n\n⚠️ 其中 " + imp + " 筆是「待匯入分頁」的，那幾列會從分頁上刪掉，不能復原。" : "") };
      dsT(X, 1, "按了「🗑 全部刪除」：真的網頁會先跳出確認視窗（這裡畫成框）");
      X.reply = "（網頁畫面）確認框：「要把這 " + ids.length + " 筆全部刪掉嗎？」";
      return;
    }
    if (w === "yes" && ask && ask.k === "delall") {
      ids = dslLiveIdx(P);
      r = dslWebDropAll(S, ids.map(function(j) { return P.A[j].id; }));
      dsT(X, 1, "網頁呼叫後端 lstDropAll：一次丟掉畫面上這 " + ids.length + " 筆（沒有寫進工作表1）");
      if (r.err) {
        P.alert = "刪不掉：" + r.err;
        dsT(X, 0, "後端回：" + r.err);
        return;
      }
      ids.forEach(function(j) { P.A[j].gone = true; });
      P.cur = -1;
      dslDraw(P);
      if (r.bad && r.bad.length) P.alert = "有 " + r.bad.length + " 筆刪不掉：\n" + r.bad.join("\n");
      dsT(X, 1, "後端回：刪掉 " + r.n + " 筆，待審清單剩 " + r.left + " 筆" + (r.bad && r.bad.length ? "；有 " + r.bad.length + " 筆「待匯入」那幾列刪不掉" : ""));
      X.sheet = "沒動（工作表1 不會有任何改變）" + (imp ? "；「待匯入」分頁刪掉 " + imp + " 列" : "");
      X.reply = "（網頁畫面）卡片全部不見，剩 " + P.shown.length + " 張";
      return;
    }
  }
  /* 畫面要畫的東西（純資料）：UI 照這個畫，Node 測試也拿它跟真的網頁比 */
  function dslCardView(P, i) {
    var d = P.A[i], nw = dslIsNew(d), vals = dslCardVals(d), c, f;
    c = { i: i, id: d.id, code: d.code, brand: d.brand || (d.v && d.v.brand) || "", src: d.src, isNew: nw, tag: nw ? "🔵 表上沒有" : "🟡 不一樣", hand: !!d.hand, warns: (d.w || []).slice(), note: "", fields: [], head: P.heads[i] || null,
      cur: i === P.curDraw, res: d.res ? { cls: d.res.cls, txt: d.res.txt } : null, ok: nw ? "📥 匯入工作表1" : "✅ 寫進工作表1", drop: nw ? "❌ 不需要" : "❌ 不要", skip: "⏭ 跳過" };
    if (nw) {
      c.note = d.src === "lst" ? "工作表1 沒有這個 code。填好按「匯入工作表1」就新增（7 天內可復原）。" : "待匯入分頁上的新藥。按「匯入工作表1」新增並從分頁移掉。";
      DSL_FIELDS.forEach(function(ff) { c.fields.push({ key: ff[0], label: ff[1], val: vals[ff[0]], ph: ff[0] === "brand" || ff[0] === "zh" ? "至少填一個" : "可空", input: 1 }); });
    } else {
      (d.chg || []).forEach(function(cc) {
        var lab = cc[4] || cc[0], old = cc[1];
        if (d.src === "lst") { lab = cc[1]; old = cc[2]; }
        f = { key: cc[0], label: lab, old: old || "—", val: vals[cc[0]], newLab: d.src === "lst" ? "清單讀到（可改）" : "待匯入分頁（可改）", pair: 1 };
        c.fields.push(f);
      });
    }
    return c;
  }
  /* 位置查核分頁要畫的東西（lcDraw、lcRow、lcEditor）*/
  function dslLcEditorView(P, x) {
    var LC = P.LC, cur = String(x.location || "").replace(/\s+/g, "").toUpperCase(), byA = {}, order = [], opts = [], groups = [];
    (LC.locs || []).forEach(function(l) {
      var g;
      if (String(l.loc).replace(/\s+/g, "").toUpperCase() === cur) return;
      g = /^[A-Za-z]/.test(l.loc) ? l.loc.charAt(0).toUpperCase() + " 區" : "其他位置";
      if (!byA[g]) { byA[g] = []; order.push(g); }
      byA[g].push(l);
    });
    opts.push({ v: "", t: "從清單選一個…" });
    if (cur !== String(LC.key).toUpperCase()) opts.push({ v: LC.loc, t: "📍 這一格（" + LC.loc + "）" });
    order.forEach(function(g) { groups.push({ label: g, opts: byA[g].map(function(l) { return { v: l.loc, t: l.loc + "（" + (+l.n || 0) + " 支）" }; }) }); });
    return { code: x.code, head: x.code + "　現在在「" + (x.location || "（空的）") + "」→ 要改到哪裡？", opts: opts, groups: groups,
      banner: LC.confirm ? "「" + LC.confirm + "」目前工作表1 裡沒有任何藥放在這裡（可能是打錯了）。確定改成它嗎？" : "", ok: LC.confirm ? "✅ 確定改成 " + LC.confirm : "改成這個位置",
      em: P.lcEd.em ? { t: P.lcEd.em.t, cls: P.lcEd.em.cls } : null, val: P.lcEd.val, rev: P.lcEd.rev };
  }
  function dslLcRowView(P, m, x, isOther) {
    var mv = m.moved[x.code], on = !!m.tick[x.code] || !!mv;
    return { code: x.code, cls: mv ? "mv" : on ? "on" : "", checked: on, disabled: !!mv, thumb: !!x.thumb, water: x.kind === "水", brand: x.brand || x.chName || x.code,
      chName: x.chName && x.chName !== x.brand ? x.chName : "", em: (x.form || "") + "　" + x.code,
      u: mv ? { cls: "mvt", t: "→ 已改到 " + mv } : isOther ? { cls: "otht", t: "工作表1 寫：" + (x.location || "（空的）") } : null,
      btn: mv ? "再改" : "修改", ed: P.LC.edit === x.code ? dslLcEditorView(P, x) : null };
  }
  function dslLcView(P) {
    var v = { q: { val: P.lcq, rev: P.lcqRev }, msg: P.lcmsg ? { parts: P.lcmsg.parts.slice(), cls: P.lcmsg.cls } : null, drawId: P.lcDrawId, res: null }, LC = P.LC, m, rows, tab = [], wat = [], sn, all, mvN = 0, c, res, items = [];
    if (!LC) return v;
    m = P.LCM[LC.key];
    rows = dslLcRows(m);
    rows.forEach(function(x) { (x.kind === "水" ? wat : tab).push(x); });
    sn = dslLcSeen(m, rows);
    all = sn.t > 0 && sn.n >= sn.t;
    for (c in m.moved) if (Object.prototype.hasOwnProperty.call(m.moved, c)) mvN++;
    res = { loc: LC.loc, seen: (all ? "✅ 全部看完了　" : "已看 ") + sn.n + "/" + sn.t, all: all,
      sub: "這一格有 " + (rows.length - mvN) + " 個品項" + (mvN ? "（已改走 " + mvN + "）" : "") + (LC.capped ? "　★ 超過 200 支，只列前 200" : "") + (LC.known ? "" : "　※ 工作表1 沒有藥登記在這個位置"),
      empty: !rows.length && !m.other.length ? "工作表1 裡沒有藥登記在「" + LC.loc + "」。\n確定位置沒打錯？" : "", items: items, foot: rows.length || m.other.length ? DSL_LC_FOOT : "" };
    if (tab.length) { items.push({ g: "錠劑類　" + tab.length + " 個品項", cls: "" }); tab.forEach(function(x) { items.push({ row: dslLcRowView(P, m, x, false) }); }); }
    if (wat.length) { items.push({ g: "水劑類　" + wat.length + " 個品項", cls: "" }); wat.forEach(function(x) { items.push({ row: dslLcRowView(P, m, x, false) }); }); }
    if (m.other.length) { items.push({ g: "📷 照片裡也認出（工作表1 寫在別格）", cls: "oth" }); m.other.forEach(function(x) { items.push({ row: dslLcRowView(P, m, x, true) }); }); }
    v.res = res;
    return v;
  }
  function dslView(S) {
    var P = S.ops.lst.page, v = { open: P.open, v: P.v, loaded: P.loaded, drawId: P.drawId, tab: P.tab };
    v.lc = dslLcView(P);
    v.chips = DSL_CHIPS.map(function(c) { return { f: c[0], t: c[1], on: c[0] === P.filt }; });
    v.cnt = P.loaded ? { nl: P.nl, ni: P.ni } : null;
    v.cards = P.shown.map(function(i) { return dslCardView(P, i); });
    v.empty = P.loaded && !P.shown.length;
    v.prob = P.shown.length ? P.prob.map(function(x) { return { n: x.n, why: x.why }; }) : [];
    v.alln = P.shown.length;
    v.sticky = P.shown.length > 0 && P.tab === "tb";   /* 「全部寫進」那一排只在「表格校對」分頁（TAB!=="tb" 就藏起來） */
    v.up = { picks: P.pick.map(function(x, j) { return { i: j, k: x.k, key: x.key, name: x.name, kb: x.kb }; }), many: dslManyText(P), go: dslGoText(P), hasPick: P.pick.length > 0, retry: !!P.retry, prog: P.prog };
    v.ask = P.ask ? { k: P.ask.k, text: P.ask.text, i: P.ask.i } : null;
    v.alert = P.alert;
    return v;
  }
  /*/SIMDEV*/

  /* ───────── ② 畫面（dswMake）─────────
     getS()＝現在的練習世界（重播會換一份）；send(ev)＝把網頁上做的事交給練習聊天室（ev＝{ t: "web", w: 動作, … }，a＝給「背後發生的事」看的名稱）。
     回傳 { el, draw, reset }：draw() 照 dslView(S) 把網頁畫出來——
       ・畫面重排（drawId 變了、或整個網頁是新的）才重畫待審的卡片；沒重排的時候只在卡片下面加「結果」那一行、把卡片變淡（打到一半的字原樣留著），跟真的網頁的 draw()／res() 一樣；
       ・按的那顆按鈕被換掉的時候，焦點接給下一張卡片（或原本打開確認框的那顆）；確認框、提醒框長在按下去的地方旁邊，開出來焦點就在「確定」上、按 Esc 等於取消；
       ・選照片不是真的選檔：「📷 選照片」展開一排編好的清單照片（虛線框＝練習專用）。
     不存、不傳：打的字只用 value／textContent 放進畫面。 */
  var dswSeq = 0;
  var DSW_URL = "demo.github.io/buyao/lst.html";
  function dswMake(getS, send) {
    var uid = ++dswSeq, ui = { P: null, did: -1, pk: 1, up: "", end: "", from: "", was: 0, lcP: null, lcdid: -1, qrev: -1, msg: "", edrev: -1, tab: "", lcpk: 0, focusEd: 0, focusQ: 0 }, askNode = null, askSig = "", alertNode = null, alertSig = "";
    var root = el("div", { class: "dsw", tabindex: "-1", role: "region", "aria-label": "練習用的網頁：清單校對。這是手機或電腦的瀏覽器裡開的網頁，不是 LINE 聊天室" });
    var idle = el("div", { class: "dsw-idle", text: "🌐 網頁還沒打開。在上面的聊天室打「清單校對」，按輸入框上面的「📤 多張上傳」或「📋 待審清單」，網頁就會在這裡打開。" });
    var win = el("div", { class: "dsw-win" });
    var pg = el("div", { class: "dsw-pg" });
    var upBox = el("div", { class: "dsw-c dsw-up" });
    var bar = el("div", { class: "dsw-bar" });
    var listEl = el("div", { class: "dsw-l", tabindex: "-1" });
    var endEl = el("div", { class: "dsw-end" });
    var rowEl = null;
    function btn(txt, cls, fk, fn, extra) {
      var a = { type: "button", class: cls, "data-fk": fk, text: txt }, k;
      if (extra) for (k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) a[k] = extra[k];
      return on(el("button", a), "click", fn);
    }
    function go(ev) { send(ev); }
    function valsOf(card) {
      var o = {}, ins = card.querySelectorAll("input[data-key]"), k;
      for (k = 0; k < ins.length; k++) o[ins[k].getAttribute("data-key")] = ins[k].value;
      return o;
    }
    function allVals() {
      var o = {}, cs = listEl.querySelectorAll(".dsw-c[data-i]"), k;
      for (k = 0; k < cs.length; k++) o[cs[k].getAttribute("data-i")] = valsOf(cs[k]);
      return o;
    }
    /* 瀏覽器上面那一條：網址、重新整理、關掉（真的瀏覽器才有，網頁自己沒有；練習才放在這裡） */
    var chrome = el("div", { class: "dsw-chrome" }, [
      el("span", { class: "dsw-url" }, [el("span", { "aria-hidden": "true", text: "🔒" }), el("span", { text: DSW_URL })]),
      btn("↻ 重新整理", "dsw-cb", "reload", function() { go({ t: "web", w: "reload", a: "瀏覽器的「重新整理」" }); }, { "aria-label": "瀏覽器的重新整理：網頁整個重新載入" }),
      btn("✕ 關掉網頁", "dsw-cb", "close", function() { go({ t: "web", w: "close", a: "「關掉網頁」" }); }, { "aria-label": "關掉這個網頁（瀏覽器的分頁關掉）" })
    ]);
    /* 兩個分頁（真的網頁的 .tabs）：📋 表格校對（原本整個網頁）、📍 位置查核（第 17 批）。方向鍵左右換分頁，沒選到的那個 tabindex=-1（Tab 鍵只停在選到的） */
    var tabsEl = el("div", { class: "dsw-tabs", role: "tablist", "aria-label": "清單校對的功能" });
    var pnTb = el("div", { class: "dsw-pn", id: "dswp-tb" + uid, role: "tabpanel", "aria-labelledby": "dswt-tb" + uid });
    var pnLc = el("div", { class: "dsw-pn", id: "dswp-lc" + uid, role: "tabpanel", "aria-labelledby": "dswt-lc" + uid, hidden: true });
    var tabBtns = {};
    function tabBtn(key, txt, sel) {
      var b = btn(txt, "dsw-tab" + (sel ? " on" : ""), "tab-" + key, function() { ui.focusQ = key === "lc" ? 1 : 0; go({ t: "web", w: "tab", tab: key, a: "網頁上的「" + txt + "」分頁" }); },
        { role: "tab", id: "dswt-" + key + uid, "aria-selected": sel ? "true" : "false", "aria-controls": "dswp-" + key + uid, tabindex: sel ? null : "-1" });
      on(b, "keydown", function(e) {
        var k = e.key, to;
        if (k !== "ArrowLeft" && k !== "ArrowRight") return;
        to = key === "tb" ? "lc" : "tb";
        e.preventDefault();
        ui.focusQ = 0;
        go({ t: "web", w: "tab", tab: to, a: "網頁上的方向鍵換到「" + (to === "lc" ? "📍 位置查核" : "📋 表格校對") + "」分頁" });
        focusFk("tab-" + to);
      });
      tabBtns[key] = b;
      return b;
    }
    tabsEl.appendChild(tabBtn("tb", "📋 表格校對", true));
    tabsEl.appendChild(tabBtn("lc", "📍 位置查核", false));
    pg.appendChild(el("div", { class: "dsw-t", role: "heading", "aria-level": "4", text: "📋 清單校對" }));
    pg.appendChild(tabsEl);
    pnTb.appendChild(el("p", { class: "dsw-sub", text: "多張一起上傳、一起辨識，下面直接審。按「寫進工作表1」「匯入工作表1」才寫入，7 天內打「復原」可還原。待審 3 天後自動清掉。" }));
    pnTb.appendChild(upBox);
    pnTb.appendChild(bar);
    pnTb.appendChild(listEl);
    pnTb.appendChild(endEl);
    /* 📍 位置查核那一頁：查詢框、貨架照片、查詢框下面那一行話、這一格的藥 */
    var lcCard = el("div", { class: "dsw-c dsw-up" });
    var lcIn = el("input", { type: "text", class: "dsw-lcin", "data-fk": "lcq", maxlength: "20", placeholder: "位置，例如 A1", "aria-label": "位置", enterkeyhint: "search", autocapitalize: "characters", autocomplete: "off", spellcheck: "false" });
    var lcPkBox = el("div", { class: "dsw-pk", id: "dswlcpk" + uid, role: "group", "aria-label": "練習專用：挑一張編好的貨架照片", hidden: true });
    var lcMsgEl = el("p", { class: "dsw-lcmsg", role: "status", "aria-live": "polite", hidden: true });
    var lcRes = el("div", { class: "dsw-lcres", tabindex: "-1" });
    pnLc.appendChild(el("p", { class: "dsw-sub", text: "去貨架查某一格：打位置或傳貨架照片，把這一格的藥列出來，一支一支打勾；不在這一格的，按那一列的「修改」當場改位置。" }));
    pnLc.appendChild(lcCard);
    pnLc.appendChild(lcMsgEl);
    pnLc.appendChild(lcRes);
    pg.appendChild(pnTb);
    pg.appendChild(pnLc);
    win.appendChild(chrome);
    win.appendChild(pg);
    root.appendChild(el("div", { class: "dssh-h", text: "🌐 練習用的網頁：清單校對" }));
    root.appendChild(el("p", { class: "dssh-p", text: "這是手機（或電腦）瀏覽器開出來的網頁，跟上面的聊天室是兩個地方：在網頁上做的事，聊天室不會多出訊息；網頁上的「待審清單」是打開那一刻讀回來的一份複本。" }));
    root.appendChild(idle);
    root.appendChild(win);

    /* ① 上傳照片那一張白卡：選好的照片（縮圖）、按鈕、辨識進度 */
    function upDraw(v) {
      var u = v.up, row, pk, th, fill, pl, tr;
      upBox.textContent = "";
      upBox.appendChild(el("p", { class: "dsw-f", text: "① 上傳照片" }));
      upBox.appendChild(el("div", { class: "dsw-drop" }, [el("b", { text: "把照片拖進來，或按下面選檔" }), "位置清單那種表格，一次可以選好幾張。一次拍一欄會更準。", el("br"), "電腦上截圖後直接 ", el("kbd", { text: "Ctrl" }), "＋", el("kbd", { text: "V" }), " 貼上也可以。"]));
      row = el("div", { class: "dsw-row" }, [
        btn("📷 選照片", "dsw-y", "toggle", function() { ui.pk = ui.pk ? 0 : 1; draw(); }, { "aria-expanded": ui.pk ? "true" : "false", "aria-controls": "dswpk" + uid }),
        u.hasPick ? btn("🗑 全部清掉", "dsw-sk", "clr", function() { go({ t: "web", w: "clr", a: "網頁上的「🗑 全部清掉」" }); }) : null
      ]);
      upBox.appendChild(row);
      pk = el("div", { class: "dsw-pk", id: "dswpk" + uid, role: "group", "aria-label": "練習專用：挑一張編好的清單照片", hidden: ui.pk ? null : true }, [
        el("p", { class: "dsw-pkl", text: "練習專用（真的是跳出手機的相簿、電腦的檔案視窗）：挑一張編好的清單照片，可以挑好幾張。" }),
        el("div", { class: "dsw-pkb" }, DSL_PAPERS.map(function(p) {
          return btn("清單 " + p.key + "（" + DSL_SHORT[p.key] + "）", "dsw-pb", "pick-" + p.key, function() { go({ t: "web", w: "pick", key: p.key, a: "網頁上選照片「" + p.file + "」" }); });
        }))
      ]);
      upBox.appendChild(pk);
      if (u.picks.length) {
        th = el("ul", { class: "dsw-thumbs", "aria-label": "選好的照片" });
        u.picks.forEach(function(p, j) {
          var paper = el("div", { class: "dsw-paper", "aria-hidden": "true" }), k, r, x;
          for (k = 0; k < 9; k++) {
            r = el("div", { class: "dsw-pr" + (k === 0 ? " h" : "") }, [el("i"), el("i", { class: "m" }), el("i")]);
            r.firstChild.style.width = (14 + ((j * 3 + k * 2) % 6)) + "px";
            r.lastChild.style.width = (13 + ((j * 2 + k) % 5)) + "px";
            paper.appendChild(r);
          }
          x = btn("", "dsw-x", "unpick-" + p.k, function() { go({ t: "web", w: "unpick", i: j, a: "網頁上拿掉第 " + (j + 1) + " 張縮圖「" + p.name + "」" }); }, { "aria-label": "把第 " + (j + 1) + " 張「" + p.name + "」拿掉（" + p.kb + " KB）" });
          x.appendChild(el("span", { "aria-hidden": "true", text: "✕" }));
          th.appendChild(el("li", { class: "dsw-th" }, [paper, x, el("span", { class: "dsw-n", "aria-hidden": "true" }, [el("span", { text: String(j + 1) }), el("span", { text: p.kb + "K" })])]));
        });
        upBox.appendChild(th);
        upBox.appendChild(el("p", { class: "dsw-note", text: u.many }));
        upBox.appendChild(el("div", { class: "dsw-row" }, [btn(u.go, "dsw-y", "go", function() { go({ t: "web", w: "go", a: "網頁上的「" + u.go + "」" }); })]));
      }
      if (u.prog) {
        fill = el("div", { class: "dsw-fill" });
        fill.style.width = u.prog.fill + "%";
        tr = el("div", { class: "dsw-track", "aria-hidden": "true" }, [fill]);
        pl = el("div", { class: "dsw-plist" });
        u.prog.rows.forEach(function(r) {
          pl.appendChild(el("div", { class: "dsw-p " + r.st }, [el("span", { class: "s", role: "img", "aria-label": r.st === "ok" ? "成功" : "沒成功", text: r.st === "ok" ? "✅" : "⚠️" }), el("span", { class: "t", text: r.name }), el("span", { class: "r", text: r.txt })]));
        });
        pl.appendChild(el("div", { class: "dsw-p e" }, [el("span", { class: "s", "aria-hidden": "true", text: u.prog.end.s }), el("span", { class: "t", text: u.prog.end.t })]));
        upBox.appendChild(el("div", { class: "dsw-prog", role: "group", "aria-label": "辨識進度" }, [tr, pl]));
      }
    }
    /* 結果那一行（真的網頁的 res()）：拿掉按鈕、加一行字、整張變淡 */
    function annot(card, r) {
      var a = card.querySelector(".dsw-acts"), x = card.querySelector(".dsw-res");
      if (a) a.parentNode.removeChild(a);
      if (!x) { x = el("div", { class: "dsw-res" }); card.appendChild(x); }
      x.className = "dsw-res " + r.cls;
      x.textContent = r.txt;
      if ((" " + card.className + " ").indexOf(" done ") < 0) card.className += " done";
    }
    function inp(c, f, cls) {
      var a = { type: "text", class: cls, "data-key": f.key, value: f.val, autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": c.code + " " + f.label + (c.isNew ? "" : "：清單讀到的值，可以改") };
      if (f.ph) a.placeholder = f.ph;
      return el("input", a);
    }
    function cardEl(c) {
      var card = el("div", { class: "dsw-c" + (c.cur ? " cur" : ""), "data-i": String(c.i), "data-code": c.code, role: "group", "aria-label": c.code + " " + c.brand + "：" + c.tag.replace(/^\S+\s/, "") }), body = el("div", { class: "dsw-b" });
      card.appendChild(el("div", { class: "dsw-h" }, [el("div", {}, [el("div", { class: "dsw-code", text: c.code }), el("div", { class: "dsw-nm", text: c.brand })]), el("span", { class: "dsw-tag" + (c.isNew ? " n" : ""), text: c.tag })]));
      if (c.hand) body.appendChild(el("p", { class: "dsw-hand", text: "✍️ 清單上這一筆是手寫改的" }));
      c.warns.forEach(function(w) { body.appendChild(el("p", { class: "dsw-hand", text: "⚠️ " + w })); });
      if (c.isNew) {
        body.appendChild(el("p", { class: "dsw-cnote", text: c.note }));
        c.fields.forEach(function(f) { body.appendChild(el("div", { class: "dsw-fi" }, [el("span", { class: "l", "aria-hidden": "true", text: f.label }), inp(c, f, "dsw-in")])); });
      } else {
        c.fields.forEach(function(f) {
          body.appendChild(el("p", { class: "dsw-f", text: f.label }));
          body.appendChild(el("div", { class: "dsw-vs" }, [
            el("div", { class: "dsw-v o" }, [el("span", { class: "l", text: "工作表1" }), el("span", { class: "x", text: f.old })]),
            el("div", { class: "dsw-ar", "aria-hidden": "true" }, [el("span", { class: "w", text: "→" }), el("span", { class: "s", text: "↓" })]),
            el("div", { class: "dsw-v n" }, [el("span", { class: "l", "aria-hidden": "true", text: f.newLab }), inp(c, f, "dsw-in")])
          ]));
        });
      }
      card.appendChild(body);
      card.appendChild(el("div", { class: "dsw-acts" }, [
        btn(c.ok, "dsw-y fu", "ok-" + c.i, function() { go({ t: "web", w: "ok", i: c.i, vals: valsOf(card), a: "網頁上 " + c.code + " 的「" + c.ok + "」" }); }),
        btn(c.drop, "dsw-no", "drop-" + c.i, function() { go({ t: "web", w: "drop", i: c.i, a: "網頁上 " + c.code + " 的「" + c.drop + "」" }); }),
        btn(c.skip, "dsw-sk", "skip-" + c.i, function() { go({ t: "web", w: "skip", i: c.i, a: "網頁上 " + c.code + " 的「" + c.skip + "」" }); })
      ]));
      if (c.res) annot(card, c.res);
      return card;
    }
    /* 篩選＋計數那一條、待審的卡片（畫面重排時才整個重畫） */
    function listDraw(v) {
      bar.textContent = "";
      listEl.textContent = "";
      bar.appendChild(el("span", {}, v.cnt ? ["待審 ", el("b", { text: String(v.cnt.nl) }), " 筆　待匯入分頁 ", el("b", { text: String(v.cnt.ni) }), " 筆"] : ["讀取中…"]));
      bar.appendChild(el("div", { class: "dsw-chips", role: "group", "aria-label": "篩選" }, v.chips.map(function(ch) {
        return btn(ch.t, "dsw-chip", "chip-" + ch.f, function() { go({ t: "web", w: "filt", f: ch.f, a: "網頁上的篩選「" + ch.t + "」" }); }, { "aria-pressed": ch.on ? "true" : "false" });
      })));
      if (v.empty) {
        listEl.appendChild(el("div", { class: "dsw-empty" }, ["目前沒有待審、也沒有待匯入 🎉", el("br"), "上面選照片就可以開始，或在「待匯入」分頁填資料。"]));
        return;
      }
      v.cards.forEach(function(c) {
        if (c.head) listEl.appendChild(el("div", { class: "dsw-sec", role: "heading", "aria-level": "5" }, [c.head.t, c.head.c ? el("span", { class: "c", text: c.head.c }) : null]));
        listEl.appendChild(cardEl(c));
      });
      if (v.prob.length) {
        listEl.appendChild(el("div", { class: "dsw-c" }, [el("div", { class: "dsw-b" }, [el("p", { class: "dsw-f", text: "待匯入分頁有 " + v.prob.length + " 列讀不進來" })].concat(v.prob.map(function(x) { return el("p", { class: "dsw-cnote", text: "第 " + x.n + " 列：" + x.why }); })))]));
      }
    }
    function annotAll(v) {
      v.cards.forEach(function(c) {
        var card;
        if (!c.res) return;
        card = listEl.querySelector('.dsw-c[data-i="' + c.i + '"]');
        if (card) annot(card, c.res);
      });
    }
    /* 最下面「全部寫進」「全部刪除」（真的網頁釘在螢幕最下面；這裡跟在最後一張卡片後面） */
    function endDraw(v) {
      var sg = v.sticky ? String(v.alln) : "";
      if (sg === ui.end && (rowEl ? rowEl.parentNode === endEl : !sg)) return;
      if (rowEl && rowEl.parentNode) rowEl.parentNode.removeChild(rowEl);
      rowEl = null;
      ui.end = sg;
      if (!v.sticky) return;
      rowEl = el("div", { class: "dsw-row" }, [
        btn("✅ 全部寫進（" + v.alln + "）", "dsw-y dsw-w2", "all", function() { go({ t: "web", w: "all", a: "網頁上的「✅ 全部寫進」" }); }),
        btn("🗑 全部刪除", "dsw-no", "delall", function() { go({ t: "web", w: "delall", a: "網頁上的「🗑 全部刪除」" }); })
      ]);
      endEl.appendChild(rowEl);
    }
    /* 確認框、提醒框：真的網頁是瀏覽器跳出來的視窗，這裡長在按下去的地方旁邊；開出來焦點在「確定」，按 Esc 等於取消 */
    function dropNode(n) { if (n && n.parentNode) n.parentNode.removeChild(n); }
    function overlays(v) {
      var sg = v.ask ? v.ask.k + "|" + (v.ask.i === undefined ? "" : v.ask.i) + "|" + v.ask.text : "", host, ref, y, a;
      if (!sg) { dropNode(askNode); askNode = null; askSig = ""; }
      else if (!askNode || askSig !== sg || !win.contains(askNode)) {
        dropNode(askNode);
        a = v.ask;
        askNode = el("div", { class: "dsw-ask", role: "group", "aria-label": "確認（真的網頁會跳出一個確認視窗）" }, [
          el("p", { text: a.text }),
          el("div", { class: "dsw-row" }, [
            btn("確定", "dsw-y", "yes", function() { go({ t: "web", w: "yes", all: a.k === "all" ? allVals() : undefined, a: "確認框的「確定」" }); }),
            btn("取消", "dsw-sk", "no", function() { go({ t: "web", w: "no", a: "確認框的「取消」" }); })
          ])
        ]);
        on(askNode, "keydown", function(e) { if (e.key === "Escape" || e.keyCode === 27) { e.preventDefault(); e.stopPropagation(); go({ t: "web", w: "no", a: "確認框的「取消」（按 Esc）" }); } });
        askSig = sg;
        if (a.k === "clr") { ref = upBox.querySelector(".dsw-row"); upBox.insertBefore(askNode, ref ? ref.nextSibling : null); }
        else if (a.k === "drop" && (host = listEl.querySelector('.dsw-c[data-i="' + a.i + '"]'))) { askNode.className += " dsw-card-ask"; ref = host.querySelector(".dsw-acts"); host.insertBefore(askNode, ref ? ref.nextSibling : null); }
        else endEl.insertBefore(askNode, endEl.firstChild);
        y = askNode.querySelector('[data-fk="yes"]');
        try { y.focus({ preventScroll: true }); } catch (e) {}
      }
      sg = v.alert || "";
      if (!sg) { dropNode(alertNode); alertNode = null; alertSig = ""; }
      else if (!alertNode || alertSig !== sg || !win.contains(alertNode)) {
        dropNode(alertNode);
        alertNode = el("div", { class: "dsw-alert", role: "alert" }, [el("p", { text: sg }), el("div", { class: "dsw-row" }, [btn("確定", "dsw-y", "ack", function() { go({ t: "web", w: "ack", a: "提醒框的「確定」" }); })])]);
        alertSig = sg;
        endEl.insertBefore(alertNode, endEl.firstChild);
        try { alertNode.querySelector("button").focus({ preventScroll: true }); } catch (e) {}
      }
    }
    /* ───── 📍 位置查核那一頁的畫面 ───── */
    var lcPickBtn = null;
    function clip12(t) { t = String(t === null || t === undefined ? "" : t).replace(/\s+/g, " ").trim(); return t.length > 12 ? t.substring(0, 12) + "…" : t; }
    function brText(parent, t) {   /* 字串裡的換行＝<br>（真的網頁那一行話裡的 <br>；textContent 裡沒有空白，兩邊才對得起來） */
      var parts = String(t).split("\n"), i;
      for (i = 0; i < parts.length; i++) {
        if (i > 0) parent.appendChild(el("br"));
        if (parts[i]) parent.appendChild(document.createTextNode(parts[i]));
      }
    }
    function lcQuery() { go({ t: "web", w: "lcgo", text: lcIn.value, a: "網頁上的「查這一格」（位置框裡是「" + clip12(lcIn.value) + "」）" }); }
    (function buildCard() {
      var ex = btn("📷 傳貨架照片（讀位置牌＋認藥）", "dsw-sk", "lcpick", function() { ui.lcpk = ui.lcpk ? 0 : 1; draw(); }, { "aria-expanded": "false", "aria-controls": "dswlcpk" + uid });
      lcCard.appendChild(el("p", { class: "dsw-f", text: "① 查哪一格" }));
      lcCard.appendChild(el("div", { class: "dsw-lcq" }, [lcIn, btn("查這一格", "dsw-y", "lcgo", lcQuery)]));
      on(lcIn, "keydown", function(e) {
        if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        lcQuery();
      });
      lcCard.appendChild(el("div", { class: "dsw-row" }, [ex]));
      lcPkBox.appendChild(el("p", { class: "dsw-pkl", text: "練習專用（真的是跳出手機的相簿、電腦的檔案視窗）：挑一張編好的貨架照片，一次一張。照片要拍到架上的「位置牌」和藥品。" }));
      lcPkBox.appendChild(el("div", { class: "dsw-pkb" }, DSK_SHELF.map(function(p) {
        return btn("貨架照 " + p.key.substring(1) + "（" + p.short + "）", "dsw-pb", "lcpk-" + p.key, function() { ui.lcpk = 0; go({ t: "web", w: "lcphoto", key: p.key, a: "網頁上選貨架照片「" + p.short + "」" }); });
      })));
      lcCard.appendChild(lcPkBox);
      lcCard.appendChild(el("p", { class: "dsw-note", text: "照片要拍到架上的「位置牌」和藥品；電腦上也可以把照片拖進來、或截圖後貼上。打勾只留在這個頁面（重新整理就沒了），不寫進工作表1。「修改」只改位置：改完馬上生效、藥師查到的就是新位置，不記進匯入紀錄（沒有 7 天內復原）。" }));
      lcPickBtn = ex;
    })();
    function lcMsgDraw(v) {
      var sg = v.msg ? v.msg.cls + "|" + JSON.stringify(v.msg.parts) : "";
      if (sg === ui.msg) return;
      ui.msg = sg;
      lcMsgEl.textContent = "";
      if (!v.msg) { lcMsgEl.hidden = true; lcMsgEl.className = "dsw-lcmsg"; return; }
      lcMsgEl.hidden = false;
      lcMsgEl.className = "dsw-lcmsg" + (v.msg.cls ? " " + v.msg.cls : "");
      v.msg.parts.forEach(function(p) { if (typeof p === "string") brText(lcMsgEl, p); else lcMsgEl.appendChild(el("b", { text: p.b })); });
    }
    /* 改位置的框（lcEditor＋lcWire）：下拉選單選一個＝填進輸入框；打字；按「改成這個位置」或在輸入框按 Enter；「取消」 */
    function edEl(ed) {
      var sel = el("select", { class: "dsw-sel", "data-fk": "lcsel", "aria-label": "從清單選一個新位置" }), inp = el("input", { type: "text", class: "dsw-lcn", "data-fk": "lcnew", maxlength: "20", autocomplete: "off", autocapitalize: "characters", spellcheck: "false", placeholder: "或打字，例 A2", "aria-label": "新位置" }), box, okb, cxb;
      ed.opts.forEach(function(o) { sel.appendChild(el("option", { value: o.v, text: o.t })); });
      ed.groups.forEach(function(g) {
        var og = el("optgroup", { label: g.label });
        g.opts.forEach(function(o) { og.appendChild(el("option", { value: o.v, text: o.t })); });
        sel.appendChild(og);
      });
      function submit() { ui.edFor = ed.code; go({ t: "web", w: "lcsubmit", text: inp.value, a: "網頁上 " + ed.code + " 改位置的「" + okb.textContent + "」（輸入框裡是「" + clip12(inp.value) + "」）" }); }
      okb = btn(ed.ok, "dsw-y", "lcok", submit);
      cxb = btn("取消", "dsw-sk", "lccx", function() { ui.edFor = ed.code; go({ t: "web", w: "lccx", a: "網頁上 " + ed.code + " 改位置的「取消」" }); });
      on(sel, "change", function() { if (sel.value) { ui.edFor = ed.code; go({ t: "web", w: "lcsel", val: sel.value, a: "網頁上 " + ed.code + " 的下拉選單選了「" + sel.value + "」" }); } });
      on(inp, "input", function() {
        var S = getS(), P = S.ops.lst.page;
        if (P.LC && P.LC.confirm) go({ t: "web", w: "lcinp", a: "網頁上改 " + ed.code + " 新位置那一格的字" });
      });
      on(inp, "keydown", function(e) {
        if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        submit();
      });
      box = el("div", { class: "dsw-lce", role: "group", "aria-label": "修改 " + ed.code + " 的位置", "data-ed": ed.code }, [
        el("p", { class: "dsw-f", text: ed.head }),
        el("div", { class: "dsw-lce2" }, [sel, inp]),
        el("p", { class: "dsw-hand", role: "alert", "data-role": "ban", hidden: true }),
        el("div", { class: "dsw-row" }, [okb, cxb]),
        el("p", { class: "dsw-note", role: "status", "data-role": "em" })
      ]);
      box.inp = inp;
      box.okb = okb;
      return box;
    }
    function edPatch(box, ed) {
      var ban = box.querySelector('[data-role="ban"]'), em = box.querySelector('[data-role="em"]');
      ban.hidden = !ed.banner;
      if (ban.textContent !== ed.banner) ban.textContent = ed.banner;
      if (box.okb.textContent !== ed.ok) box.okb.textContent = ed.ok;
      em.className = "dsw-note" + (ed.em && ed.em.cls ? " " + ed.em.cls : "");
      em.textContent = ed.em ? ed.em.t : "";
      if (box.edrev !== ed.rev) { box.inp.value = ed.val; box.edrev = ed.rev; }
    }
    function lcRowEl(rw) {
      var row = el("div", { class: "dsw-lcr" + (rw.cls ? " " + rw.cls : ""), "data-r": rw.code }), ck, ed;
      ck = el("input", { type: "checkbox", class: "dsw-ck", "data-c": rw.code, "data-fk": "lcck-" + rw.code, checked: rw.checked, disabled: rw.disabled });
      on(ck, "change", function() { go({ t: "web", w: "lctick", c: rw.code, on: ck.checked, a: "網頁上 " + rw.code + " 左邊的打勾框" }); });
      row.appendChild(el("label", { class: "dsw-lcl" }, [ck, rw.thumb ? el("span", { class: "dsw-lcp" + (rw.water ? " w" : ""), "aria-hidden": "true" }) : el("span", { class: "dsw-lcp none", text: "無照片" }),
        el("span", { class: "dsw-lct" }, [el("b", { text: rw.brand }), rw.chName ? el("i", { text: rw.chName }) : null, el("em", { text: rw.em }), rw.u ? el("u", { class: rw.u.cls, text: rw.u.t }) : null])]));
      row.appendChild(btn(rw.btn, "dsw-ed", "lced-" + rw.code, function() { ui.focusEd = 1; ui.edFor = rw.code; go({ t: "web", w: "lcopen", c: rw.code, a: "網頁上 " + rw.code + " 的「" + rw.btn + "」" }); }, { "aria-label": rw.btn + " " + rw.code + " 的位置" }));
      if (rw.ed) {
        ed = edEl(rw.ed);
        row.appendChild(ed);
        edPatch(ed, rw.ed);
      }
      return row;
    }
    /* 這一格整個重畫（lcDraw）：摘要、分段標題、每一列、最下面「↺ 清掉勾選」 */
    function lcResDraw(v) {
      var r = v.res, card;
      lcRes.textContent = "";
      if (!r) return;
      card = el("div", { class: "dsw-c dsw-lcc" });
      card.appendChild(el("div", { class: "dsw-lcsum" }, [el("span", { class: "dsw-code", text: r.loc }), el("span", { class: "dsw-seen" + (r.all ? " all" : ""), "data-role": "seen", text: r.seen }), el("span", { class: "dsw-lcsub", text: r.sub })]));
      if (r.empty) { card.appendChild(el("div", { class: "dsw-empty" })); brText(card.lastChild, r.empty); }
      r.items.forEach(function(it) {
        if (it.g) card.appendChild(el("span", { class: "dsw-lcgrp" + (it.cls ? " " + it.cls : ""), text: it.g }));
        else card.appendChild(lcRowEl(it.row));
      });
      card.appendChild(el("div", { class: "dsw-lcfoot" }, [r.foot, "　", btn("↺ 清掉勾選", "dsw-sk dsw-sm", "lcclr", function() { go({ t: "web", w: "lcclr", a: "網頁上的「↺ 清掉勾選」" }); })]));
      lcRes.appendChild(card);
    }
    /* 打勾不重畫（lcTick）：只換這一列的顏色、框的打勾、上面的「已看」；改位置的框的提醒、按鈕字、狀態那一行也是原地換 */
    function lcPatch(v) {
      var r = v.res, rows, k, sn, rw, byCode = {};
      if (!r) return;
      r.items.forEach(function(it) { if (it.row) byCode[it.row.code] = it.row; });
      rows = lcRes.querySelectorAll(".dsw-lcr");
      for (k = 0; k < rows.length; k++) {
        rw = byCode[rows[k].getAttribute("data-r")];
        if (!rw) continue;
        rows[k].className = "dsw-lcr" + (rw.cls ? " " + rw.cls : "");
        sn = rows[k].querySelector(".dsw-ck");
        if (sn.checked !== rw.checked) sn.checked = rw.checked;
        if (sn.disabled !== rw.disabled) sn.disabled = rw.disabled;
        if (rw.ed) {
          sn = rows[k].querySelector(".dsw-lce");
          if (sn) edPatch(sn, rw.ed);
        }
      }
      sn = lcRes.querySelector('[data-role="seen"]');
      if (sn) { sn.className = "dsw-seen" + (r.all ? " all" : ""); sn.textContent = r.seen; }
    }
    function lcDrawAll(v, P) {
      var lc = v.lc, pk = ui.lcpk ? 1 : 0, rebuilt = false, k;
      for (k in tabBtns) if (Object.prototype.hasOwnProperty.call(tabBtns, k)) {
        tabBtns[k].className = "dsw-tab" + (k === v.tab ? " on" : "");
        tabBtns[k].setAttribute("aria-selected", k === v.tab ? "true" : "false");
        if (k === v.tab) tabBtns[k].removeAttribute("tabindex"); else tabBtns[k].setAttribute("tabindex", "-1");
      }
      pnTb.hidden = v.tab !== "tb";
      pnLc.hidden = v.tab !== "lc";
      lcPkBox.hidden = !pk;
      lcPickBtn.setAttribute("aria-expanded", pk ? "true" : "false");
      if (ui.lcP !== P || ui.qrev !== lc.q.rev) { lcIn.value = lc.q.val; ui.qrev = lc.q.rev; }
      lcMsgDraw(lc);
      if (ui.lcP !== P || ui.lcdid !== lc.drawId) {
        lcResDraw(lc);
        ui.lcP = P; ui.lcdid = lc.drawId;
        rebuilt = true;
      } else lcPatch(lc);
      return rebuilt;
    }
    function focusFk(fk) {
      var t = fk ? root.querySelector('[data-fk="' + fk + '"]') : null;
      if (!t) return false;
      try { t.focus({ preventScroll: true }); } catch (e) { return false; }
      return document.activeElement === t;
    }
    /* 按的那顆按鈕被換掉了（卡片拿掉按鈕、畫面重排、確認框收起來）：焦點接給「下一張還沒處理的卡片」或原本打開確認框的那顆，最後才是整個網頁 */
    function restoreFocus(fk) {
      var m, i, k, cs, nxt = null, b;
      if (!fk) return;
      if (document.activeElement && document.activeElement !== document.body && root.contains(document.activeElement)) return;
      if (focusFk(fk)) return;
      m = /^(ok|drop|skip)-(\d+)$/.exec(fk);
      if (m) {
        i = parseInt(m[2], 10);
        cs = listEl.querySelectorAll(".dsw-c[data-i]");
        for (k = 0; k < cs.length && !nxt; k++) if (parseInt(cs[k].getAttribute("data-i"), 10) > i && cs[k].querySelector(".dsw-acts")) nxt = cs[k];
        for (k = cs.length - 1; k >= 0 && !nxt; k--) if (parseInt(cs[k].getAttribute("data-i"), 10) < i && cs[k].querySelector(".dsw-acts")) nxt = cs[k];
        b = nxt ? nxt.querySelector(".dsw-y") : null;
        if (b) { try { b.focus({ preventScroll: true }); } catch (e) {} return; }
        try { listEl.focus({ preventScroll: true }); } catch (e) {}
        return;
      }
      if ((fk === "yes" || fk === "no" || fk === "ack") && focusFk(ui.from)) return;
      if (/^unpick-|^go$|^clr$/.test(fk) && focusFk("toggle")) return;
      /* 📍 位置查核：改位置的框收起來（改好了、取消）→ 焦點回到那一列的「修改」；那一列沒有了 → 這一塊結果 */
      if (/^lc(ok|cx|sel|new)$/.test(fk)) {
        if (ui.edFor && focusFk("lced-" + ui.edFor)) return;
        try { lcRes.focus({ preventScroll: true }); } catch (e) {}
        return;
      }
      if (/^lced-|^lcck-|^lcclr$/.test(fk)) {
        try { lcRes.focus({ preventScroll: true }); } catch (e) {}
        return;
      }
      if (/^lcpk-/.test(fk) && focusFk("lcpick")) return;
      try { root.focus({ preventScroll: true }); } catch (e) {}
    }
    function draw() {
      var S = getS(), v = dslView(S), P = S.ops.lst.page, act = document.activeElement, fk = "", opened, hadAsk = !!askNode, hadAlert = !!alertNode, sg, ed;
      if (act && act !== document.body && root.contains(act) && act.getAttribute) fk = act.getAttribute("data-fk") || "";
      idle.hidden = !!v.open;
      win.hidden = !v.open;
      if (!v.open) {
        ui.P = null; ui.did = -1; ui.up = ""; ui.end = ""; ui.was = 0; ui.pk = 1;
        ui.lcP = null; ui.lcdid = -1; ui.qrev = -1; ui.msg = ""; ui.lcpk = 0; ui.edFor = ""; ui.focusEd = 0; ui.focusQ = 0;
        dropNode(askNode); dropNode(alertNode); askNode = null; alertNode = null; askSig = ""; alertSig = ""; rowEl = null;
        upBox.textContent = ""; bar.textContent = ""; listEl.textContent = ""; endEl.textContent = "";
        lcRes.textContent = ""; lcMsgEl.textContent = ""; lcMsgEl.hidden = true; lcIn.value = "";
        pnTb.hidden = false; pnLc.hidden = true; lcPkBox.hidden = true;
        restoreFocus(fk);
        return;
      }
      opened = !ui.was;
      ui.was = 1;
      sg = JSON.stringify(v.up) + "|" + ui.pk;
      if (sg !== ui.up || opened) { upDraw(v); ui.up = sg; }
      if (ui.P !== P || ui.did !== v.drawId) {
        listDraw(v);
        ui.P = P; ui.did = v.drawId;
        rowEl = null; ui.end = "\u0000";
        endEl.textContent = "";
      } else annotAll(v);
      endDraw(v);
      lcDrawAll(v, P);
      if (v.ask || v.alert) { if (!hadAsk && !hadAlert) ui.from = fk || ui.from; }
      overlays(v);
      /* 按了「修改」展開改位置的框：焦點進輸入框（真的網頁的 lcOpen 也是）；按了「📍 位置查核」分頁：焦點進查詢框（setTab） */
      if (ui.focusEd) {
        ui.focusEd = 0;
        ed = lcRes.querySelector(".dsw-lce .dsw-lcn");
        if (ed) { try { ed.focus({ preventScroll: true }); } catch (e) {} }
      }
      if (ui.focusQ) {
        ui.focusQ = 0;
        if (v.tab === "lc") { try { lcIn.focus({ preventScroll: true }); } catch (e) {} }
      }
      restoreFocus(fk);
      if (opened) { try { root.focus(); } catch (e) {} }
    }
    function reset() {
      ui.P = null; ui.did = -1; ui.up = ""; ui.end = ""; ui.from = ""; ui.was = 0; ui.pk = 1;
      ui.lcP = null; ui.lcdid = -1; ui.qrev = -1; ui.msg = ""; ui.lcpk = 0; ui.edFor = ""; ui.focusEd = 0; ui.focusQ = 0;
      dropNode(askNode); dropNode(alertNode); askNode = null; alertNode = null; askSig = ""; alertSig = ""; rowEl = null;
      draw();
    }
    return { el: root, draw: draw, reset: reset, panel: win };
  }

  /* ───────── 開發者網頁的練習（第 17 批；「開發者網頁」那一課）─────────
     真的程式分三處：LINE 專案（09_網頁版.gs：連結、綁定碼、代號→驗證碼、重發、開關）、網頁專案（10_網頁專案.gs：appHome、appBind、appCodeStart、appCodeLogin、appLogout）、
     GitHub 上的網頁（_app_page.html：開頁判斷、綁定框、代號登入畫面、登出）。這一頁把三處合在一起，分四段：
       ① 後端：鑰匙（發、沿用、續期、換新、過期）、綁定碼、綁定的裝置（最多 3 台）、代號和驗證碼的紀錄（領、兌換、猜太多次）、各種次數上限（10 分鐘一輪）；
       ② 瀏覽器那一頭：4 台裝置各有「這台記住的東西」（鑰匙、後端在哪、代號）和「現在開著的網頁」，網頁開頁怎麼判斷、怎麼出綁定框或代號畫面、倒數到 0 自動換新代號、登出；
       ③ LINE 那一頭：打「開發者網頁」「…重發」「…綁定」、貼代號、「驗證碼登入 關／開」「開發者網頁 設定」，藥師那邊的幾句（練習專用的按鈕）；
       ④ 畫面（dwbMake）：用真的按鈕和輸入格畫出「瀏覽器裡的網頁」。
     純函式（SIMDEV 之間），Node 測試也直接跑它，和真的 LINE 專案、網頁專案逐步比對。
     這裡的時鐘不會自己走（練習專用的按鈕才會讓時間過去），所以倒數是「按了按鈕才變」；鑰匙、裝置碼、暗鑰匙都用短短的編號（t1、d1、s1）代替，真的是 32 位的亂碼。 */
  /*SIMDEV*/
  var DWB_ME = "me", DWB_PH = "ph";
  var DWB_ID = "AKfycbxDEMODEMODEMODEMODEMODEMODEMODEMODEMOdemo01";   /* 練習用的假「網頁專案部署 ID」；後端代號＝最後 6 個字 */
  var DWB_URL = "demo.github.io/buyao/";
  var DWB_T0 = Date.UTC(2026, 8, 15, 2, 30, 0);   /* 練習的時鐘從 09/15 10:30（台灣時間）開始 */
  var DWB_DAY = 864e5;
  var DWB_TOKEN_DAYS = 30, DWB_RENEW_DAYS = 7;   /* 鑰匙 30 天；剩不到 20 天有在用就推回 30 天（_appSession_）；剩不到 7 天才換新（_appIssue_，其實永遠碰不到） */
  var DWB_LC_SEC = 300, DWB_LC_GET_MAX = 10, DWB_LC_GET_SEC = 600, DWB_LC_MISS_MAX = 20, DWB_LC_TRY_MAX = 20;
  var DWB_BIND_SEC = 600, DWB_BIND_MAX = 3, DWB_BIND_FAIL = 5, DWB_BIND_LOCK = 3600;
  var DWB_START_DEV_MAX = 8, DWB_START_MAX = 30, DWB_CALL_MAX = 30, DWB_AUTO_MAX = 2;
  var DWB_DEVS = [
    { id: "d1", name: "手機的 LINE 裡面", lab: "Chrome / Android" },
    { id: "d2", name: "辦公室電腦", lab: "Chrome / Windows" },
    { id: "d3", name: "手機的瀏覽器", lab: "Safari / iOS" },
    { id: "d4", name: "另一台電腦", lab: "Edge / Windows" }
  ];
  /* 練習用的「亂數」：照順序拿，不是真的亂（每次練習都一樣，教學才好對）。代號的樣子照真的：藥師 9 個英數字（沒有 I O l o 0 1，大寫、小寫、數字各至少 2 個）、開發者 6 個數字 */
  var DWB_AN = ["Kd7mPq4Xr", "Mx3Tb9Wnf", "Hp6Ra2Zcd", "Qw8Ys5Jke", "Bn4Gv7Uta", "Fz9Lc3Dhs", "Rj2Xe6Pmw", "Tc5Wa8Nqk"];
  var DWB_NUM = ["257391", "804516", "390274", "716082", "145937", "628450", "903165", "472809"];
  var DWB_VER = ["615273", "048217", "392846", "771405", "250689", "836194"];
  var DWB_BIND = ["304718", "582049", "719356", "260483", "941825", "137602"];
  /* 後端回的錯誤字（10_網頁專案.gs、09_網頁版.gs 的常數，一個字都不改） */
  var DWB_E = {
    tok: "連結已失效（超過 30 天或換過新連結），回 LINE 打「網頁」再開一次",
    need: "🔒 這台還沒綁定開發者版。\n在 LINE 打「開發者網頁 綁定」，把拿到的 6 位數碼打在下面：",
    full: "🔒 這條開發者連結已經綁了 3 個地方，不能再多。\n要換地方：回 LINE 打「開發者網頁 重發」（舊的綁定全部清掉），再在要用的地方各綁一次。",
    locked: "錯太多次了，1 小時後再試（或回 LINE 打「開發者網頁 重發」）",
    notdev: "只有開發者連結要綁定",
    six: "請輸入 6 位數字",
    fmt: "請輸入 6 位數的驗證碼（LINE 卡片上那一組數字）",
    gone: "代號過期了（出現後只有 5 分鐘），或已經作廢。按「重新取得代號」，再到 LINE 貼新的代號。",
    wait: "LINE 還沒收到這組代號。到 LINE 補藥神器把畫面上的代號貼進去，拿到驗證碼再回來輸入。",
    bad: "驗證碼不對，再輸入一次。（要照 LINE 卡片上現在這一張；不確定就按「重新取得代號」換一組。）",
    dead: "這組代號已經用不了了。按「重新取得代號」，再到 LINE 貼新的代號。",
    nodev: "這組驗證碼已經不能用了。按「重新取得代號」，再到 LINE 貼新的代號。",
    budget: "現在有很多人在登入，等幾分鐘再試（這次不算）",
    fast: "這台拿代號拿得太頻繁了，等幾分鐘再試（這次不算）",
    cfull: "🔒 開發者版最多只能登入 3 個地方，現在已經滿了（這組驗證碼已經用掉了）。\n要換地方：在不用的那台按首頁最下面的「登出這台」，或回 LINE 打「開發者網頁 重發」（所有已登入的地方全部清掉）；然後按「重新取得代號」再來一次。",
    off: "🔒 驗證碼登入目前暫停了（開發者關掉的）。請從 LINE 的「🌐 補藥神器網頁」按鈕開。"
  };
  /* 網頁自己的字（_app_page.html） */
  var DWB_P = {
    hint0: ["點左上 logo 回首頁", "🎤 用講的", "📷 拍包裝"],
    bound: "✅ 這台綁好了，以後在這裡直接開就好（不用再輸入）。",
    none: "🌐 請從 LINE 按下面那排的「🌐 補藥神器網頁」開這個網頁。\n（想直接打網址、用代號登入：這個瀏覽器要先從 LINE 的「🌐 補藥神器網頁」開過一次（或由開發者在 GitHub 放好 cfg.js，LINE 打「開發者網頁 設定」有步驟），之後直接打網址，畫面上就會出現代號。\n主畫面的圖示也要先從 LINE 開過一次，之後才能直接開。）",
    auto: "⌛ 超過 5 分鐘沒有登入，已經自動換成新的代號。把下面這組新的代號再傳給 LINE 補藥神器就好。",
    fail: "⌛ 超過 5 分鐘沒有登入，原來的代號已經不能用了。",
    bad: "❌ 驗證碼不對，再輸入一次。（要照 LINE 卡片上現在這一張；不確定就按「重新取得代號」換新的一組）",
    same: "這裡要打 LINE 回給你的 6 位數驗證碼，不是上面的開發者代號（開發者代號是要打進 LINE 的）。",
    more: "（超過會自動換新的代號）",
    last: "（超過要按「重新取得代號」）",
    head: "🔐 登入補藥神器",
    foot: "代號和驗證碼都只能在這個網頁用，換別的瀏覽器打沒用。\n代號出現後 5 分鐘內要完成登入，超過了這裡會自己換一組新的代號；驗證碼只能用一次，不要傳給任何人。",
    tokMore: "\n可以回 LINE 按「🌐 補藥神器網頁」再開，或用代號登入：",
    outMore: "\n要再用：照下面的步驟拿代號、到 LINE 換驗證碼，或從 LINE 的「🌐 補藥神器網頁」按鈕開。"
  };
  function dwbP2(n) { return (n < 10 ? "0" : "") + n; }
  function dwbTw(ms) { return new Date(ms + 8 * 36e5); }   /* 台灣時間（UTC+8）；用 getUTC* 讀 */
  function dwbMD(ms) { var d = dwbTw(ms); return dwbP2(d.getUTCMonth() + 1) + "/" + dwbP2(d.getUTCDate()); }
  function dwbHM(ms) { var d = dwbTw(ms); return dwbP2(d.getUTCHours()) + ":" + dwbP2(d.getUTCMinutes()); }
  function dwbClock(ms) { return dwbMD(ms) + " " + dwbHM(ms); }
  function dwbMS(s) { s = Math.max(0, s); return Math.floor(s / 60) + ":" + dwbP2(s % 60); }
  function dwbLabClean(s, n) { return String(s === null || s === undefined ? "" : s).replace(/[^A-Za-z0-9 \-\/\(\)・·一-鿿]/g, "").trim().substring(0, n); }
  /* 驗證碼輸入格（_code_input.js 的 decode）：全形數字轉半形、看不見的字和空白、橫線當沒看到；夾著別的字（多半是把代號貼錯格）就不收 */
  var DWB_INV, DWB_GAP = /[\s​-‍⁠﻿­\-‐-―−﹣－]/g;
  try { DWB_INV = new RegExp("[\\p{Cf}\\u034f\\u115f\\u1160\\u3164\\uffa0\\ufe00-\\ufe0f\\u{e0100}-\\u{e01ef}]", "gu"); } catch (e) { DWB_INV = /[­؀-؅؜۝܏᠎​-‏‪-‮⁠-⁤⁦-⁯͏ᅟᅠㅤﾠ︀-️﻿￹-￻]/g; }
  function dwbDecode(raw) {
    var s = String(raw === null || raw === undefined ? "" : raw), digits, junk, res;
    try { if (s.normalize) s = s.normalize("NFKC"); } catch (e) {}
    s = s.replace(DWB_INV, "").replace(DWB_GAP, "");
    digits = s.replace(/[^0-9]/g, "");
    junk = s.replace(/[0-9]/g, "");
    res = { s: digits, n: digits.length, junk: junk, code: "", hint: "" };
    if (!junk && digits.length === 6) res.code = digits;
    if (!res.s && !res.junk) res.hint = "";
    else if (res.junk) res.hint = /[A-Za-z]/.test(res.junk) ? "這裡要打 LINE 回給你的 6 位數驗證碼，不是代號（代號是要貼進 LINE 的）" : "驗證碼只有數字，請看 LINE 卡片上那一組 6 位數";
    else if (res.n > 6) res.hint = "多打了，驗證碼只有 6 個數字";
    else if (res.n < 6) res.hint = "還差 " + (6 - res.n) + " 個數字";
    else res.hint = "確認跟 LINE 卡片上的一樣，再按「登入」";
    return res;
  }

  /* ───── ① 後端 ───── */
  /* t＝現在的時間（毫秒；練習的時鐘）、off＝「驗證碼登入 關」、src＝你現在在哪裡打字（user＝一對一、group＝群組）、cfg＝GitHub 上有沒有放 cfg.js、sel＝現在用哪一台、
     tok／cur／qc／links＝鑰匙（編號、每個人每個身分現在那一把、輸入框上面「🌐 網頁」按鈕記著的那一把（快取 6 小時）、LINE 給過你的連結的順序）、bc／bcu＝綁定碼、bound／bt＝每把鑰匙綁了哪幾台、猜綁定碼猜了幾次、
     recs／pend／ul／rv＝代號紀錄、等人領的代號、每個人手上還沒用掉的驗證碼、每個人按「全部作廢」的時間、ctr／bk＝各種次數（每人 10 分鐘、每台／全院每 10 分鐘一格）、push＝LINE 要主動推播的通知（網頁登入會用到）、n＝各種編號 */
  function dwbNew() {
    var W = { t: DWB_T0, off: 0, src: "user", cfg: 0, sel: "d1", devs: {}, tok: {}, cur: {}, qc: {}, links: { dev: [], usr: [] }, bc: {}, bcu: {}, bound: {}, bt: {}, recs: {}, pend: {}, ul: {}, rv: {}, ctr: {}, bk: {}, push: [], n: { tok: 0, sec: 0, an: 0, num: 0, ver: 0, bind: 0 }, dev: {}, last: null };
    W.devs[DWB_ME] = 1;
    DWB_DEVS.forEach(function(d) { W.dev[d.id] = dwbDevNew(d); });
    return W;
  }
  function dwbDevNew(d) { return { id: d.id, name: d.name, lab: d.lab, dh: "dh_" + d.id, ls: { bk: null, bx: "" }, ss: { pair: null }, vis: 1, tab: dwbTabNew() }; }
  /* 一個「開了的網頁」：hash＝網址 # 後面帶的鑰匙（{ k: dev／app, t }；鑰匙存好之後網頁自己把它藏掉）、x／t／fs＝網頁用的後端、鑰匙、鑰匙是不是這台記著的、scr＝畫面（none／bind／code／home）、
     後面幾個照 _app_page.html 的變數名：role＝ROLE、pair＝PAIR、pst／why／big／extra＝代號區塊（live／gone／err）、note＝PNOTE、auto＝AUTO、cmsg／cwait＝驗證碼框下面那行字、six＝SIXMSG、bound＝BOUND */
  function dwbTabNew() { return { open: 0, hash: null, x: "", t: "", fs: 0, scr: "", head: "", bmsg: "", bval: "", role: "", pair: null, pst: "", why: "", big: "", extra: "", note: "", auto: 0, cmsg: "", cval: "", cwait: 0, six: 0, dev: 0, bound: 0, hint: "", ask: 0, probe: "" }; }
  function dwbIsDev(W, uid) { return !!W.devs[uid]; }
  function dwbWho(uid) { return uid === DWB_ME ? "你（開發者）" : "藥師"; }
  /* 鑰匙 → 還有效的那一筆（_appSession_）；過期的順手刪掉，有在用、剩不到 20 天就推回 30 天後 */
  function dwbSess(W, id) {
    var s = W.tok[id];
    if (!s) return null;
    if (!(s.exp > W.t)) { delete W.tok[id]; return null; }
    if (s.exp - W.t < (DWB_TOKEN_DAYS - 10) * DWB_DAY) s.exp = W.t + DWB_TOKEN_DAYS * DWB_DAY;
    return s;
  }
  /* 發鑰匙（_appIssue_）：每個人每個身分（開發者／藥師）一把；沒要求換新、現在這把還有效就沿用；否則發新的、舊的作廢（連同它底下綁的裝置名單，一起沒用）。新發的一把順手記進「輸入框上面那顆『🌐 網頁』按鈕」用的快取（6 小時） */
  var DWB_QUICK_SEC = 6 * 36e5;
  function dwbIssue(W, uid, force, dev) {
    var key = uid + "|" + (dev ? 1 : 0), cur = W.cur[key] || "", s, id, exp;
    dev = !!dev;
    if (cur && !force) {
      s = dwbSess(W, cur);
      if (s && s.uid === uid && !!s.dev === dev && s.exp - W.t > DWB_RENEW_DAYS * DWB_DAY) return { token: cur, exp: s.exp, reused: true, old: "" };
    }
    id = "t" + (++W.n.tok);
    exp = W.t + DWB_TOKEN_DAYS * DWB_DAY;
    W.tok[id] = { uid: uid, exp: exp, at: W.t, dev: dev };
    W.cur[key] = id;
    W.qc[key] = { t: id, exp: W.t + DWB_QUICK_SEC };
    if (cur && cur !== id) delete W.tok[cur];
    return { token: id, exp: exp, reused: false, old: cur && cur !== id ? cur : "" };
  }
  /* LINE 卡片把這把鑰匙交到你手上（連結卡、綁定碼卡）：面板上「LINE 給你的連結」才列得出來（只記你自己的；舊的也留著，才看得到「換過新連結之後舊的失效」）。網頁登入拿到的、按鈕悄悄用掉的，不算 LINE 給你的連結 */
  function dwbGive(W, uid, dev, id) {
    var l;
    if (uid !== DWB_ME) return;
    l = W.links[dev ? "dev" : "usr"];
    if (l[l.length - 1] !== id) l.push(id);
  }
  /* 機器人每回一則話，輸入框上面那排固定的按鈕有一顆「🌐 網頁」，網址裡要帶這個人的鑰匙（_quickBarItems_ → _appQuickTok_）：先看快取（6 小時）有沒有，有就直接用，不查鑰匙；
     沒有就走 _appIssue_ 的老路——還有效就沿用（順手把剩不到 20 天的推回 30 天，所以「有在聊天」鑰匙就不會過期）、過期了或從來沒有就悄悄發一把新的。每一則回覆都會做，不分是什麼指令 */
  /* 這一趟機器人有沒有回話：只有自己的話（我說的、「👆 點了…」「👥 假裝在群組」那種回聲）不算；真的 handleText 遇到空白訊息 `if (!keyword) return;` 什麼都不回，也就不會去算那顆按鈕。
     「練習不示範」的說明（沒有機器人的訊息，但真的機器人會回一則）算有回話。練習聊天室裡每一句話都有回（空白會被「要查什麼？」接住，tools/learn_dev_sim_h.js 的 secStd 在檢查），所以這道門目前走不到「沒回話」 */
  function dwbReplied(X) {
    var i;
    if (X.keep) return false;
    for (i = 0; i < X.msgs.length; i++) if (X.msgs[i].w !== "me" && !X.msgs[i].echo) return true;
    return false;
  }
  function dwbQuick(W, uid) {
    var dev = dwbIsDev(W, uid), key = uid + "|" + (dev ? 1 : 0), c = W.qc[key];
    if (c && c.exp > W.t) return;
    dwbIssue(W, uid, false, dev);
    if (!W.qc[key] || !(W.qc[key].exp > W.t)) { c = W.cur[key]; if (c) W.qc[key] = { t: c, exp: W.t + DWB_QUICK_SEC }; }
  }
  function dwbDays(W, r) { return Math.max(1, Math.round((r.exp - W.t) / DWB_DAY)); }
  /* 每人 10 分鐘一輪的次數（_lcCounter_）：從第一次算起，滿 10 分鐘就重算；取出來是一份複本，要改了再 dwbCtrPut */
  function dwbCtr(W, key) {
    var g = W.ctr[key];
    if (!g || !(W.t - g.t < DWB_LC_GET_SEC * 1e3)) return { n: 0, t: W.t };
    return { n: g.n, t: g.t };
  }
  function dwbCtrPut(W, key, g) { W.ctr[key] = { n: g.n, t: g.t }; }
  /* 這個人手上還沒用掉的驗證碼：按「全部作廢」（重發）時一起清；也記下作廢的時間，萬一名單漏列也擋得住（_lcDrop_） */
  function dwbDrop(W, uid) {
    var l = W.ul[uid] || [], i, n = 0;
    W.rv[uid] = W.t;
    for (i = 0; i < l.length; i++) if (W.recs[l[i].k]) { delete W.recs[l[i].k]; n++; }
    delete W.ul[uid];
    return n;
  }
  function dwbRvOf(W, uid) { var v = W.rv[uid]; return v && W.t - v < (DWB_LC_SEC + 30) * 1e3 ? v : 0; }
  function dwbRecRemove(W, sec, o) {
    delete W.recs[sec];
    if (o && o.st === 0 && o.cd) delete W.pend[String(o.cd).toLowerCase()];
  }
  function dwbPending(W, code) {
    var k = String(code).toLowerCase(), p = W.pend[k];
    if (p && !(p.exp > W.t)) { delete W.pend[k]; p = null; }
    return p ? p.sec : "";
  }
  /* 一格一格的次數（10 分鐘一格：網頁專案的 _codeCallOk_／_codeDevOk_ 用 Math.floor(現在 / 6e5)） */
  function dwbBucketOk(W, name, max) {
    var k = name + "_" + Math.floor(W.t / 6e5), n = W.bk[k] || 0;
    if (n >= max) return false;
    W.bk[k] = n + 1;
    return true;
  }
  /* 拿下一個練習用的「亂數」：照順序、跳過現在還在等人領的。清單用完了（同時等人領的代號比清單還多），照真的規則用一個固定的小亂數接著產生，練習才不會莫名其妙說「忙線」 */
  function dwbRnd(n) { var x = (n * 2654435761 + 12345) >>> 0; x ^= x << 13; x >>>= 0; x ^= x >>> 17; x >>>= 0; x ^= x << 5; x >>>= 0; return x; }
  function dwbGenAn(n) {
    var UP = "ABCDEFGHJKLMNPQRSTUVWXYZ", LO = "abcdefghijkmnpqrstuvwxyz", DG = "23456789", all = UP + LO + DG, a = [], i, j, t, k = n * 31 + 7;
    function ch(set) { k++; return set.charAt(dwbRnd(k) % set.length); }
    for (i = 0; i < 2; i++) { a.push(ch(UP)); a.push(ch(LO)); a.push(ch(DG)); }
    for (i = 0; i < 3; i++) a.push(ch(all));
    for (i = a.length - 1; i > 0; i--) { k++; j = dwbRnd(k) % (i + 1); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a.join("");
  }
  function dwbGenNum(n) { return String(100000 + dwbRnd(n * 17 + 3) % 900000); }
  function dwbPick(W, list, key, taken, gen) {
    var i, c, n;
    for (i = 0; i < 80; i++) {
      n = W.n[key]++;
      c = n < list.length || !gen ? list[n % list.length] : gen(n);
      if (!taken(c)) return c;
    }
    return "";
  }
  /* ── 綁定碼（LINE：_cmdWebBind_；兌換：11_專案連線.gs 的 bindcode）── */
  function dwbBcGet(W, code) {
    var o = W.bc[code];
    if (o && !(o.exp > W.t)) { delete W.bc[code]; o = null; }
    return o || null;
  }
  function dwbBcLast(W, uid) {
    var o = W.bcu[uid];
    if (o && !(o.exp > W.t)) { delete W.bcu[uid]; o = null; }
    return o ? o.code : null;
  }
  function dwbBindMake(W, uid, tok) {
    var code = dwbPick(W, DWB_BIND, "bind", function(c) { return !!dwbBcGet(W, c); }, dwbGenNum), old = dwbBcLast(W, uid);
    if (old && old !== code) delete W.bc[old];
    W.bc[code] = { t: tok, uid: uid, exp: W.t + DWB_BIND_SEC * 1e3 };
    W.bcu[uid] = { code: code, exp: W.t + DWB_BIND_SEC * 1e3 };
    return { code: code, old: old && old !== code ? old : "" };
  }
  function dwbBindCheck(W, tq, code) {
    var o = dwbBcGet(W, code), last = o && o.uid ? dwbBcLast(W, o.uid) : null;
    if (!o || o.t !== tq || last !== code) return false;
    delete W.bc[code];
    delete W.bcu[o.uid];
    return true;
  }
  /* ── 這把開發者鑰匙綁了哪幾台（網頁專案的 _bindCheck_／_bindAdd_／_bindRemove_；存的是裝置碼的指紋）── */
  function dwbBoundList(W, tid) { return W.bound[tid] || []; }
  function dwbBindAdd(W, tid, dh) {
    var l = W.bound[tid] || [], fresh = false;
    if (l.indexOf(dh) < 0) {
      if (l.length >= DWB_BIND_MAX) return { ok: false, err: DWB_E.full };
      l = l.concat([dh]);
      fresh = true;
    }
    W.bound[tid] = l;
    return { ok: true, n: l.length, fresh: fresh };
  }
  function dwbBindRemove(W, tid, dh) {
    var l = W.bound[tid] || [], i = l.indexOf(dh);
    if (i < 0) return true;
    l = l.slice();
    l.splice(i, 1);
    W.bound[tid] = l;
    return true;
  }
  /* 猜綁定碼猜了幾次（_bindTries_）：每把鑰匙一個，最後一次猜之後 1 小時內最多 5 次；d＝1 加一次、0 歸零 */
  function dwbTries(W, tid, d) {
    var o = W.bt[tid], n = o && W.t - (o.t || 0) < DWB_BIND_LOCK * 1e3 ? o.n : 0;
    if (d > 0) {
      if (n >= DWB_BIND_FAIL) return { took: false, n: n };
      W.bt[tid] = { n: n + 1, t: W.t };
      return { took: true, n: n + 1 };
    }
    if (o) delete W.bt[tid];
    return { took: false, n: 0 };
  }
  /* ── 代號和驗證碼（LINE：_lcStart_、_lcClaim_、_lcRedeem_）── */
  function dwbLcStart(W, dh, lab, old, role) {
    var dev = role === "dev", oo, code, sec;
    if (W.off) return { ok: false, off: 1 };
    lab = dwbLabClean(lab, 24);
    oo = old ? W.recs[old] : null;
    if (oo && oo.dh === dh) dwbRecRemove(W, old, oo);
    code = dev ? dwbPick(W, DWB_NUM, "num", function(c) { return !!dwbPending(W, c); }, dwbGenNum) : dwbPick(W, DWB_AN, "an", function(c) { return !!dwbPending(W, c); }, dwbGenAn);
    if (!code) return { ok: false, busy: 1 };
    sec = "s" + (++W.n.sec);
    W.recs[sec] = { dh: dh, lab: lab, st: 0, at: W.t, cd: code, dv: dev ? 1 : 0 };
    W.pend[code.toLowerCase()] = { sec: sec, exp: W.t + (DWB_LC_SEC + 30) * 1e3 };
    return { ok: true, code: code, sec: sec, ttl: DWB_LC_SEC, dv: dev ? 1 : 0 };
  }
  /* 領：這組代號還在等人領 → 發 6 位數驗證碼。找不到、過期、已經領過、是開發者版但領的人不是開發者 → null */
  function dwbClaim(W, code, uid, isDev) {
    var ik = String(code).toLowerCase(), p = W.pend[ik], sec, o, v, l;
    if (p && !(p.exp > W.t)) { delete W.pend[ik]; p = null; }
    if (!p) return null;
    sec = p.sec;
    o = W.recs[sec];
    if (!o || o.st !== 0 || !(W.t - (o.at || 0) < DWB_LC_SEC * 1e3)) { delete W.pend[ik]; return null; }
    if (o.dv && !isDev) return null;
    v = dwbPick(W, DWB_VER, "ver", function() { return false; });
    o.st = 1; o.who = uid; o.dev = o.dv ? 1 : 0; o.vh = v; o.tr = 0; o.cl = W.t;
    delete W.pend[ik];
    l = (W.ul[uid] || []).filter(function(x) { return x && x.k !== sec && W.t - (x.at || 0) < DWB_LC_SEC * 1e3 + 5e3; });
    l.push({ k: sec, at: W.t });
    W.ul[uid] = l.slice(-DWB_LC_GET_MAX);
    return { v: v, rec: o, sec: sec };
  }
  /* 兌換：網頁拿「暗鑰匙＋驗證碼＋這台的裝置碼」來換鑰匙。順序照 _lcRedeem_：開關 → 找不到／不是這一台 → 還沒領（等／過期）→ 領了之後超過 5 分 5 秒 → 按過全部作廢 → 驗證碼對不對 → 還是不是開發者 → 發鑰匙 */
  function dwbRedeem(W, sec, v, dh) {
    var o, age, rv, r;
    if (W.off) return { ok: false, off: 1 };
    o = W.recs[sec];
    if (!o || o.dh !== dh) return { ok: false, gone: 1 };
    age = W.t - (o.at || 0);
    if (o.st !== 1) {
      if (!(age < DWB_LC_SEC * 1e3)) { dwbRecRemove(W, sec, o); return { ok: false, gone: 1 }; }
      return { ok: false, wait: 1 };
    }
    if (!(age < DWB_LC_SEC * 1e3 + 5e3)) { dwbRecRemove(W, sec, o); return { ok: false, gone: 1 }; }
    rv = dwbRvOf(W, o.who);
    if (rv && (o.cl || 0) < rv) { dwbRecRemove(W, sec, o); return { ok: false, gone: 1 }; }
    if (o.vh !== v) {
      o.tr = (o.tr || 0) + 1;
      if (o.tr >= DWB_LC_TRY_MAX) { dwbRecRemove(W, sec, o); return { ok: false, dead: 1 }; }
      return { ok: false, bad: 1 };
    }
    if (o.dev && !dwbIsDev(W, o.who)) { dwbRecRemove(W, sec, o); return { ok: false, nodev: 1 }; }
    r = dwbIssue(W, o.who, false, !!o.dev);
    dwbRecRemove(W, sec, o);
    return { ok: true, t: r.token, dev: !!o.dev, exp: r.exp, at: W.t, uid: o.who };
  }
  /* ── 網頁專案的入口（_apiServe_ 和 appXxx）：回 { ok: 1, r } 或 { ok: 0, code, err, need }。D＝送出請求的那台裝置；t＝網頁帶的鑰匙；a＝參數 ── */
  function dwbCodeStart(W, D, lab, old, role) {
    var dev = role === "dev", r;
    if (W.off) return { err: DWB_E.off, off: 1 };
    if (!dwbBucketOk(W, "wcd_" + D.dh, DWB_START_DEV_MAX)) return { err: DWB_E.fast, busy: 1 };
    if (!dwbBucketOk(W, "wcc_s", DWB_START_MAX)) return { err: DWB_E.budget, busy: 1 };
    r = dwbLcStart(W, D.dh, String(lab || "").replace(/\s+/g, " ").substring(0, 40), String(old || ""), dev ? "dev" : "");
    if (r.off) return { err: DWB_E.off, off: 1 };
    if (!r.ok) return { err: "現在有點忙，等幾秒再按一次（這次不算）", busy: 1 };
    return { ok: true, code: r.code, sec: r.sec, ttl: Math.max(30, Math.min(900, +r.ttl || 300)), dev: dev };
  }
  function dwbCodeLogin(W, D, sec, code, lab) {
    var v = typeof code === "string" ? code.replace(/[０-９]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }).replace(/[\s\-]/g, "") : "", r, a, isDev, fresh = false, nb = 0;
    if (!/^\d{6}$/.test(v)) return { err: DWB_E.fmt, fmt: 1 };
    if (typeof sec !== "string" || !/^s\d+$/.test(sec)) return { err: DWB_E.gone, gone: 1 };
    if (W.off) return { err: DWB_E.off, off: 1 };
    if (!dwbBucketOk(W, "wcc_l", DWB_CALL_MAX)) return { err: DWB_E.budget, busy: 1 };
    r = dwbRedeem(W, sec, v, D.dh);
    if (r.off) return { err: DWB_E.off, off: 1 };
    if (r.gone) return { err: DWB_E.gone, gone: 1 };
    if (r.wait) return { err: DWB_E.wait, wait: 1 };
    if (r.nodev) return { err: DWB_E.nodev, gone: 1 };
    if (r.dead) return { err: DWB_E.dead, dead: 1 };
    if (!r.ok) return r.bad ? { err: DWB_E.bad, bad: 1 } : { err: DWB_E.gone, gone: 1 };
    isDev = !!r.dev;
    if (isDev) {
      a = dwbBindAdd(W, r.t, D.dh);
      if (!a.ok) return a.err === DWB_E.full ? { err: DWB_E.cfull, gone: 1, full: 1 } : { err: a.err, gone: 1 };
      fresh = !!a.fresh;
      nb = a.n || 0;
    }
    if (isDev && fresh) W.push.push({ kind: "note", t: r.t, n: nb, lab: String(lab || "").replace(/\s+/g, " ").substring(0, 40), at: W.t, uid: r.uid });
    return { ok: true, t: r.t, dev: isDev, exp: r.exp };
  }
  function dwbBindApi(W, D, tok, code) {
    var s = dwbSess(W, tok), cd, g, a;
    if (!s) return { err: DWB_E.tok };
    if (!s.dev) return { err: DWB_E.notdev };
    cd = String(code === null || code === undefined ? "" : code).replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cd)) return { err: DWB_E.six };
    g = dwbTries(W, tok, 1);
    if (!g.took) return { err: DWB_E.locked, locked: 1 };
    if (!dwbBindCheck(W, tok, cd)) {
      return { err: DWB_BIND_FAIL - g.n > 0 ? "碼不對、過期了、或已經用過（還可以再試 " + (DWB_BIND_FAIL - g.n) + " 次）" : DWB_E.locked, locked: DWB_BIND_FAIL - g.n > 0 ? 0 : 1 };
    }
    dwbTries(W, tok, 0);
    a = dwbBindAdd(W, tok, D.dh);
    if (!a.ok) return { err: a.err };
    return { ok: true };
  }
  function dwbApi(W, D, fn, tok, a) {
    var s, r;
    a = a || [];
    if (!/^(appCodeStart|appCodeLogin|appBind|appLogout|appHome|appSearch)$/.test(String(fn))) return { ok: 0, code: "bad", err: "看不懂的請求" };   /* 不認得的函式名稱：不看鑰匙，先回這句（_apiServe_） */
    if (fn === "appCodeStart") return { ok: 1, r: dwbCodeStart(W, D, a[0], a[1], a[2]) };
    if (fn === "appCodeLogin") return { ok: 1, r: dwbCodeLogin(W, D, a[0], a[1], a[2]) };
    if (!tok || !/^t\d+$/.test(tok)) return { ok: 0, code: "tok", err: DWB_E.tok };
    s = dwbSess(W, tok);
    if (!s) return { ok: 0, code: "tok", err: DWB_E.tok };
    if (s.dev && fn !== "appBind" && fn !== "appLogout") {
      if (dwbBoundList(W, tok).indexOf(D.dh) < 0) return { ok: 0, code: "bind", need: 1, err: DWB_E.need };
    }
    if (fn === "appBind") return { ok: 1, r: dwbBindApi(W, D, tok, a[0]) };
    if (fn === "appLogout") {
      r = s.dev ? dwbBindRemove(W, tok, D.dh) : true;
      return { ok: 1, r: { ok: true, released: !!r } };
    }
    if (fn === "appHome") return { ok: 1, r: { info: { dev: !!s.dev, days: Math.max(0, Math.round((s.exp - W.t) / DWB_DAY)) } } };   /* _appInfoOf_：剩幾天（連結卡上的「N 天沒開才會失效」另外算，最少 1 天） */
    if (fn === "appSearch") return { ok: 1, r: { rows: [{ code: "90101" }] } };
    return { ok: 0, code: "bad", err: "看不懂的請求" };
  }
  /* ───── ② 瀏覽器那一頭（_app_page.html）：每一台裝置各自記著東西（ls＝localStorage：bk＝記著的鑰匙 { x, t }、bx＝記著後端在哪；ss＝sessionStorage：bpair＝記著的代號，只在這個分頁，關掉就沒了），
     和「現在開著的網頁」（tab）。動作都同步（沒有網路的等待）；「背後發生的事」一句一句記在 W.tr，事件那邊再拿去給深色框 ───── */
  function dwbSay(W, ok, t) { W.tr = W.tr || []; W.tr.push({ ok: ok ? 1 : 0, t: t }); }
  function dwbCodeOk(c, dev) { return (dev ? /^\d{6}$/ : /^[A-HJ-NP-Za-kmnp-z2-9]{9}$/).test(String(c || "")); }
  function dwbStrOf(a, b) { return typeof a === "string" && a ? a.slice(0, 300) : typeof b === "string" && b ? b.slice(0, 300) : ""; }
  function dwbKeySave(D, tb) { if (tb.x && tb.t) { D.ls.bk = { x: tb.x, t: tb.t }; D.ls.bx = tb.x; } }   /* keySave：鑰匙和後端記在這台（之後直接打網址進得去） */
  function dwbKeyOk(D, tb) { var o = D.ls.bk; return !!(o && o.x === tb.x && o.t === tb.t); }
  function dwbHideKey(D, tb) { if (tb.hash && dwbKeyOk(D, tb)) tb.hash = null; }   /* 鑰匙已經記在這台了，網址列上的就藏起來（沒記成功就不藏，不然重新整理就進不來） */
  function dwbResetSession(tb) { tb.t = ""; tb.fs = 0; tb.dev = 0; tb.bound = 0; }
  function dwbPairSave(D, tb) { D.ss.pair = tb.pair && !tb.pair.dead ? { x: tb.pair.x, code: tb.pair.code, sec: tb.pair.sec, ex: tb.pair.ex, dev: tb.pair.dev ? 1 : 0 } : null; }
  function dwbPairLoad(W, D) {
    var tb = D.tab, o = D.ss.pair, p;
    if (tb.pair && !tb.pair.dead && tb.pair.x === tb.x && tb.pair.ex > W.t + 3000) return tb.pair;
    if (o && o.x === tb.x && dwbCodeOk(o.code, !!o.dev) && /^s\d+$/.test(String(o.sec || "")) && +o.ex > 0) {
      p = { x: tb.x, code: String(o.code), sec: String(o.sec), ex: +o.ex, dev: !!o.dev };
      if (p.ex > W.t + 3000 && p.ex <= W.t + 900000) return p;
      p.stale = 1;
      return p;
    }
    return null;
  }
  /* 向後端要一組代號（打開代號畫面、按「重新取得代號」「再試一次」、倒數到 0 自動換、按「開發者登入」「回藥師登入」換身分）。舊的暗鑰匙一起帶去，LINE 會把舊的作廢 */
  function dwbPairStart(W, D, note, role) {
    var tb = D.tab, t0 = W.t, dev, old, j, r;
    if (role === "dev" || role === "") tb.role = role;
    dev = tb.role === "dev";
    old = tb.pair && tb.pair.sec ? tb.pair.sec : "";
    if (typeof note !== "string") tb.auto = 0;
    tb.note = typeof note === "string" ? note : "";
    tb.pair = null;
    dwbPairSave(D, tb);
    tb.cmsg = ""; tb.cwait = 0; tb.cval = "";   /* 畫「正在向後端要代號…」的時候，驗證碼那一塊收起來、清掉 */
    j = dwbApi(W, D, "appCodeStart", "", [D.lab, old, tb.role]);
    r = j && j.ok === 1 ? j.r : null;
    if (r && r.ok && dwbCodeOk(r.code, dev) && /^s\d+$/.test(String(r.sec || ""))) {
      tb.pair = { x: tb.x, code: String(r.code), sec: String(r.sec), ex: t0 + Math.max(30, Math.min(900, +r.ttl || 300)) * 1000, dev: dev };
      dwbPairSave(D, tb);
      tb.pst = "live"; tb.why = ""; tb.big = ""; tb.extra = "";
      dwbSay(W, 1, "網頁向後端要一組代號（appCodeStart）：後端轉給 LINE 專案，LINE 專案產一組" + (dev ? "6 位數字的開發者代號" : "9 個英數字的藥師代號") + "（" + tb.pair.code + "），同時給網頁一把只存在這個分頁的暗鑰匙；這組代號 5 分鐘內有效，網頁開始倒數");
    } else {
      tb.pst = "err";
      tb.why = dwbStrOf(r && r.err, j && j.err) || "沒拿到代號，再試一次";
      tb.big = ""; tb.extra = "";
      dwbSay(W, 0, "網頁向後端要代號（appCodeStart）→ 沒拿到：" + tb.why + " → 畫面上寫「① 沒拿到代號」，下面一顆「再試一次」");
    }
  }
  /* 這組代號沒有了（過期、作廢、被用掉、開發者名額滿）：PAIR 留著（標記 dead）讓「重新取得」帶舊暗鑰匙，不再記在 sessionStorage */
  function dwbPairGone(W, D, why, big, extra) {
    var tb = D.tab;
    if (tb.pair) tb.pair.dead = 1;
    tb.note = "";
    dwbPairSave(D, tb);
    tb.pst = "gone"; tb.why = why; tb.big = big; tb.extra = extra || "";
    tb.cmsg = ""; tb.cwait = 0; tb.cval = "";
  }
  /* 倒數到 0：自動換一組新的。看不到的分頁不換（人回來才換）；連續換了 2 次、中間人都沒碰過，就停在「代號過期了」 */
  function dwbPairExpire(W, D) {
    var tb = D.tab;
    if (!D.vis) return false;
    if (tb.auto >= DWB_AUTO_MAX) {
      dwbSay(W, 1, D.name + "的網頁倒數到 0：已經連續自動換過 " + tb.auto + " 次、中間都沒人碰過 → 不再換了（免得一直用後端的額度），停在「代號過期了」，要按「重新取得代號」");
      dwbPairGone(W, D, "這組代號已經過期（5 分鐘）", "⌛ 代號過期了");
      return true;
    }
    tb.auto++;
    dwbSay(W, 1, D.name + "的網頁倒數到 0：自動換一組新的代號（舊的作廢），畫面上方留一句說明");
    dwbPairStart(W, D, DWB_P.auto);
    return true;
  }
  /* 登入沒成功：依後端說的分類。字留著的（還沒收到代號、忙線、暫停）不是打錯；打錯的清掉重打（只說不對，不說剩幾次）；代號沒有了就換成「重新取得」 */
  function dwbPairFail(W, D, r, j) {
    var tb = D.tab, em = dwbStrOf(r && r.err, j && j.err);
    if (r && r.dead) {
      dwbSay(W, 0, "後端回：這組代號猜太多次了（每一組代號後端自己有一個看不見的上限），已經作廢 → 畫面換成「🔒 請重新取得代號」");
      dwbPairGone(W, D, "這組代號已經用不了了", "🔒 請重新取得代號", "重新取得後，再把新的代號傳給 LINE 補藥神器，拿新的驗證碼。");
      return;
    }
    if (r && r.gone) {
      if (r.full) {
        dwbSay(W, 0, "驗證碼是對的（已經用掉了），但開發者版已經綁了 3 台，這一台進不去 → 畫面換成「🔒 開發者版名額滿了」");
        dwbPairGone(W, D, "驗證碼對了，但這台登不進去", "🔒 開發者版名額滿了", em.replace(/^🔒\s*/, ""));
      } else if (tb.pair && !tb.pair.dead && tb.pair.ex - W.t <= 8000) {
        dwbSay(W, 1, "後端說這組代號沒有了，而且網頁的倒數也剛好（差不多）到了 → 就是時間到：跟倒數到 0 一樣，自動換新的");
        dwbPairStart(W, D, DWB_P.auto);
      } else {
        dwbSay(W, 0, "後端回：這組代號沒有了（過期、用掉了，或已經作廢）→ 畫面換成「⌛ 請重新取得代號」");
        dwbPairGone(W, D, "這組代號已經不能用了（過期、用掉了，或已經作廢）", "⌛ 請重新取得代號", "");
      }
      return;
    }
    if (r && r.wait) {
      tb.cmsg = "⏳ LINE 還沒收到這組代號。到 LINE 補藥神器" + (tb.pair && tb.pair.dev ? "打 " : "貼上 ") + (tb.pair ? tb.pair.code : "畫面上的代號") + "，拿到驗證碼再回來輸入。";
      tb.cwait = 1;
      dwbSay(W, 0, "後端回：LINE 還沒收到這組代號（還沒有人在 LINE 貼它）→ 不是你打錯，也不算猜錯的次數；字留著，先去 LINE 貼代號");
      return;
    }
    if (r && r.bad) {
      tb.cmsg = DWB_P.bad; tb.cwait = 0; tb.cval = "";
      dwbSay(W, 0, "後端回：驗證碼不對 → 網頁只說「不對，再輸入一次」，不說還剩幾次；這一次算進這組代號的猜碼次數（累積到上限，這組代號就整個作廢）");
      return;
    }
    tb.cmsg = (em.indexOf("🔒") === 0 ? "" : "❌ ") + (em || "沒登入成功，再試一次");
    tb.cwait = 0;
    dwbSay(W, 0, "後端回：" + (em || "沒登入成功") + " → 這一次沒有登入，也沒有用掉驗證碼");
  }
  /* 代號登入的畫面（codeForm）：先看這個分頁有沒有記著還沒到期的代號（重新整理、手機切去 LINE 再切回來），沒有才向後端要新的 */
  function dwbCodeForm(W, D, msg) {
    var tb = D.tab, p;
    tb.scr = "code"; tb.head = msg || DWB_P.head; tb.note = ""; tb.auto = 0; tb.six = 0; tb.cmsg = ""; tb.cwait = 0; tb.cval = ""; tb.bmsg = ""; tb.probe = "";
    p = dwbPairLoad(W, D);
    tb.role = p && p.dev ? "dev" : "";
    if (p && p.stale) {
      tb.pair = p;
      dwbSay(W, 1, "這個分頁記著一組代號，但已經到期了（離開太久才回來）→ 自動換一組新的並說明");
      dwbPairStart(W, D, DWB_P.auto);
    } else if (p) {
      tb.pair = p; tb.pst = "live";
      dwbSay(W, 1, "這個分頁還記著剛才那組代號（" + p.code + "，倒數還在走）→ 接著用同一組，不另外向後端要");
    } else dwbPairStart(W, D);
  }
  function dwbBindForm(W, D, msg) {
    var tb = D.tab;
    tb.scr = "bind"; tb.head = msg; tb.bmsg = ""; tb.bval = ""; tb.probe = "";
  }
  /* 後端說「不行」：鑰匙壞了／過期了／換過了（tok）→ 這台記著的那把清掉，知道後端在哪就直接出代號畫面；這台還沒綁定（bind）→ 出輸入綁定碼的框 */
  function dwbStop(W, D, j) {
    var tb = D.tab, code = j && j.code, msg = (j && j.err) || "", sk;
    if (code === "bind" && j.need) {
      dwbSay(W, 0, "後端回：鑰匙是對的，但這一台不在綁定名單裡（開發者版每一台都要先綁定）→ 網頁出現輸入綁定碼的框");
      dwbBindForm(W, D, msg);
      return;
    }
    if (code === "tok") {
      sk = D.ls.bk;
      if (!sk || (sk.x === tb.x && (tb.fs || sk.t === tb.t))) D.ls.bk = null;
      if (sk && sk.x === tb.x) D.ls.bx = tb.x;
      dwbSay(W, 0, "後端回：這把鑰匙已經失效（超過 30 天沒開，或換過新連結）→ 網頁把這台記著的鑰匙清掉，只留「後端在哪」");
      dwbResetSession(tb);
      dwbSay(W, 1, "因為知道後端在哪，不用卡在錯誤畫面：直接出代號登入的畫面（上面寫「可以回 LINE 按『🌐 補藥神器網頁』再開，或用代號登入」）");
      dwbCodeForm(W, D, msg + DWB_P.tokMore);
      return;
    }
    tb.scr = "none"; tb.head = msg || "";
  }
  /* 開頁後向後端要首頁（start → appHome）。成功＝進首頁（開發者版：標題下面有「開發者版」小標籤）；鑰匙記在這台、網址列上的藏起來 */
  function dwbStart(W, D) {
    var tb = D.tab, j = dwbApi(W, D, "appHome", tb.t, [1]), info;
    if (j.ok !== 1) { dwbStop(W, D, j); return; }
    info = j.r && j.r.info ? j.r.info : { dev: false };
    tb.dev = info.dev ? 1 : 0;
    dwbKeySave(D, tb);
    dwbHideKey(D, tb);
    tb.scr = "home"; tb.ask = 0; tb.probe = ""; tb.bmsg = ""; tb.cmsg = ""; tb.cval = "";
    tb.hint = tb.bound ? "bound" : "0";
    tb.bound = 0;
    dwbSay(W, 1, "網頁向後端要首頁（appHome），帶著鑰匙和這台的裝置碼 → 後端認得鑰匙" + (tb.dev ? "、這一台也在綁定名單裡" : "") + " → 進首頁（" + (tb.dev ? "開發者版" : "藥師版") + "）；網頁把鑰匙記在這台瀏覽器裡（之後直接打網址進得去）");
  }
  /* 打開網頁（boot）：網址帶鑰匙 → 用它；沒帶 → 用這台記著的那一條；都沒有 → 看知不知道後端在哪（記著的、或 GitHub 有 cfg.js）→ 出代號畫面；連後端都不知道 → 請你從 LINE 的按鈕開 */
  function dwbBoot(W, D, hash) {
    var tb = dwbTabNew(), sk = D.ls.bk;
    D.tab = tb;
    D.vis = 1;   /* 新開的分頁、重新整理：人正看著它 */
    tb.open = 1;
    tb.hash = hash ? { k: hash.k, t: hash.t } : null;
    tb.x = hash ? DWB_ID : "";
    tb.t = hash ? hash.t : "";
    if (hash) dwbSay(W, 1, D.name + "的瀏覽器打開網頁，網址後面帶著" + (hash.k === "dev" ? "開發者" : "藥師") + "鑰匙（放在 # 後面，瀏覽器不會把 # 後面的東西送給任何伺服器）");
    if (!tb.t && sk && (!tb.x || sk.x === tb.x)) {
      tb.x = sk.x; tb.t = sk.t; tb.fs = 1;
      dwbSay(W, 1, D.name + "的瀏覽器打開網頁，網址沒帶鑰匙 → 用這台瀏覽器記著的那一條（上一次從 LINE 開、後端說 OK 的）");
    }
    if (!tb.x && !tb.t) {
      tb.x = (W.cfg ? DWB_ID : "") || D.ls.bx;
      if (!hash) dwbSay(W, 1, D.name + "的瀏覽器直接打網址，沒帶連結、這台也沒記著可用的鑰匙");
      if (tb.x) dwbSay(W, 1, "但知道後端在哪（" + (W.cfg ? "GitHub 上有 cfg.js" : "這台之前從 LINE 開過，記住了") + "）→ 可以走代號登入");
    }
    if (!tb.x && !tb.t) {
      tb.scr = "none";
      dwbSay(W, 0, "這台瀏覽器不知道要連哪個後端（沒開過連結，GitHub 上也沒有 cfg.js）→ 網頁只能請你從 LINE 的「🌐 補藥神器網頁」按鈕開");
      return;
    }
    if (tb.t) dwbStart(W, D);
    else dwbCodeForm(W, D, "");
  }
  /* 輸入綁定碼（bindForm）：先在網頁上檢查是 6 位數字，再送給後端（appBind）；後端問 LINE 專案這組碼是不是發給這把鑰匙的 */
  function dwbBindGo(W, D, raw) {
    var tb = D.tab, c = String(raw === null || raw === undefined ? "" : raw).replace(/\D/g, ""), j, r;
    if (tb.scr !== "bind") return false;
    if (!/^\d{6}$/.test(c)) {
      tb.bmsg = DWB_E.six;
      dwbSay(W, 0, "網頁先檢查：不是 6 位數字 → 沒有送給後端，也不算猜錯的次數");
      return true;
    }
    j = dwbApi(W, D, "appBind", tb.t, [c]);
    r = j && j.ok === 1 ? j.r : null;
    if (r && r.ok) {
      dwbSay(W, 1, "網頁把 6 位數碼送給後端（appBind）：後端先把「猜過幾次」加 1，再問 LINE 專案「這組碼是不是發給這把鑰匙的、而且是最新的一組」→ 對 → 這組碼用掉了，這一台記進這把鑰匙的綁定名單（現在 " + dwbBoundList(W, tb.t).length + "／3 台）");
      tb.bmsg = ""; tb.bval = ""; tb.bound = 1;
      dwbStart(W, D);
      return true;
    }
    tb.bmsg = "❌ " + ((r && r.err) || (j && j.err) || "沒綁成功，再試一次");
    tb.bval = "";
    dwbSay(W, 0, "網頁把 6 位數碼送給後端（appBind）→ " + ((r && r.err) || (j && j.err) || "沒綁成功") + "；輸入框清掉，要重打");
    return true;
  }
  /* 驗證碼對了：後端給了鑰匙 → 記在這台（之後直接打網址就進得去）、開始用 */
  function dwbLoginOk(W, D, r) {
    var tb = D.tab;
    tb.note = "";
    dwbResetSession(tb);
    tb.t = String(r.t);
    tb.dev = r.dev ? 1 : 0;
    dwbKeySave(D, tb);
    tb.bound = r.dev ? 1 : 0;
    tb.cmsg = ""; tb.cval = "";
    dwbStart(W, D);
  }
  /* 按「登入」（onGo）。raw＝輸入框裡的字；沒有剛好 6 位數字，登入鍵是灰的，不會送 */
  function dwbLoginGo(W, D, raw) {
    var tb = D.tab, d = dwbDecode(raw), code = d.code, P = tb.pair, j, r;
    if (tb.scr !== "code" || !code) return false;
    tb.auto = 0;
    if (!P || P.dead) {
      dwbSay(W, 0, "這組代號已經不能用了，網頁不用問後端 → 畫面換成「⌛ 代號過期了」");
      dwbPairGone(W, D, "這組代號已經不能用了", "⌛ 代號過期了");
      return true;
    }
    if (P.ex <= W.t) {
      dwbSay(W, 1, "倒數剛好到 0 的瞬間按了登入 → 自動換一組新的代號");
      dwbPairStart(W, D, DWB_P.auto);
      return true;
    }
    if (P.dev && code === P.code) {
      tb.six = 1; tb.cwait = 1; tb.cmsg = DWB_P.same;
      dwbSay(W, 0, "你打的是上面那組開發者代號（它是要打進 LINE 的），網頁攔下來，沒有送給後端（送了只會白白用掉一次猜碼）");
      return true;
    }
    j = dwbApi(W, D, "appCodeLogin", "", [P.sec, code, D.lab]);
    r = j && j.ok === 1 ? j.r : null;
    if (r && r.ok && /^t\d+$/.test(String(r.t || ""))) {
      dwbSay(W, 1, "網頁把「暗鑰匙＋你打的 6 位數＋這台的裝置碼」送給後端（appCodeLogin）→ 後端問 LINE 專案：這組代號領過了、沒過期、驗證碼對、而且是出這組代號的這一台 → 對 → 驗證碼當場作廢（只能用一次），給網頁一把" + (r.dev ? "開發者" : "藥師") + "鑰匙");
      if (r.dev) dwbSay(W, 1, "開發者版：這一台同時記進綁定名單（現在 " + dwbBoundList(W, r.t).length + "／3 台）；如果是新加的一台，LINE 會推播通知給開發者");
      tb.cmsg = "";
      tb.pair = null;
      dwbPairSave(D, tb);
      dwbLoginOk(W, D, r);
      return true;
    }
    dwbSay(W, 1, "網頁把「暗鑰匙＋你打的 6 位數＋這台的裝置碼」送給後端（appCodeLogin）");
    dwbPairFail(W, D, r, j);
    return true;
  }
  /* 「登出這台」：開發者 → 先請後端把這台從綁定名單拿掉（名額還回去）；藥師 → 這台把鑰匙忘掉就好。之後這台直接打網址會出現代號登入的畫面 */
  function dwbLogoutDo(W, D) {
    var tb = D.tab, wasDev = !!tb.dev, j, r, sent = true, released;
    if (wasDev) {
      j = dwbApi(W, D, "appLogout", tb.t, []);
      r = j && j.ok === 1 && j.r;
      sent = !!(r && r.ok);
      released = r ? r.released : undefined;
      dwbSay(W, sent ? 1 : 0, sent ? "網頁請後端把這一台從綁定名單拿掉（appLogout）→ 名額還回去（現在 " + dwbBoundList(W, tb.t).length + "／3 台）" : "網頁請後端把這一台從綁定名單拿掉（appLogout）→ 後端說這把鑰匙已經失效，沒拿成（要等後端回應）");
    } else dwbSay(W, 1, "藥師版沒有「綁定名單」：後端沒有這一台的紀錄，網頁只要把這台記著的鑰匙忘掉就好");
    D.ls.bk = null;
    D.ls.bx = tb.x;
    dwbResetSession(tb);
    if (tb.hash) tb.hash = null;
    dwbCodeForm(W, D, "✅ 已登出這台。" + (wasDev && (!sent || released === false) ? "\n（開發者名額可能沒能還回去：" + (sent ? "後端正忙" : "連不上後端") + "。回 LINE 打「開發者網頁 重發」可以全部清掉重來）" : "") + DWB_P.outMore);
    tb.ask = 0;
  }
  /* 在網頁上做一件事（練習用的「查一支藥」）：帶著鑰匙和裝置碼問後端。這是為了看「這一台現在還能不能用」——鑰匙被換掉、被移出綁定名單，網頁自己不知道，要等下一次問後端才發現 */
  function dwbProbe(W, D) {
    var tb = D.tab, j;
    if (tb.scr !== "home") return false;
    j = dwbApi(W, D, "appSearch", tb.t, ["90101"]);
    if (j.ok === 1) {
      tb.probe = "ok";
      if (tb.hint === "bound") { tb.hint = "0"; dwbSay(W, 1, "（真的網頁查完一支藥，再點 logo 回首頁，提示行就回到平常的三句；「✅ 這台綁好了」只在綁好後的第一個首頁出現）"); }
      dwbSay(W, 1, "網頁向後端查一支藥（appSearch），帶著鑰匙和這台的裝置碼 → 後端認得鑰匙" + (tb.dev ? "、這一台也還在綁定名單裡" : "") + " → 照常回結果");
    } else {
      tb.probe = "";
      dwbSay(W, 0, "網頁向後端查一支藥（appSearch）→ 後端不收");
      dwbStop(W, D, j);
    }
    return true;
  }
  /* 輸入框裡打字（網頁的 input 事件）：只動網頁自己的記錄，不問後端。有人在動＝AUTO 歸零；把開發者代號打進驗證碼格要說一聲 */
  function dwbTouch(W, text) {
    var D = W.dev[W.sel], tb = D ? D.tab : null, d;
    if (!tb || !tb.open) return false;
    if (tb.scr === "bind") { tb.bval = String(text); return true; }
    if (tb.scr !== "code" || tb.pst !== "live") return false;
    tb.auto = 0;
    tb.cval = String(text);
    d = dwbDecode(text);
    if (d.code && tb.pair && !tb.pair.dead && tb.pair.dev && d.code === tb.pair.code) { tb.cwait = 1; tb.cmsg = DWB_P.same; tb.six = 1; }
    else if (tb.six) { tb.six = 0; tb.cmsg = ""; tb.cwait = 0; }
    return true;
  }
  /* 看不到的分頁（切去 LINE、螢幕關了）：倒數到了也不換，人回來（看得到了）才換 */
  function dwbVis(W, D, on) {
    var tb = D.tab;
    D.vis = on ? 1 : 0;
    if (on && tb.open && tb.scr === "code") {
      tb.auto = 0;
      if (tb.pst === "live" && tb.pair && !tb.pair.dead && tb.pair.ex <= W.t) dwbPairExpire(W, D);
    }
  }
  /* 時間往前走：網頁的倒數到 0 要照時間順序一個一個處理（自動換新的代號，換出來的新代號可能在這一段時間裡又到期） */
  function dwbAdvance(W, ms) {
    var target = W.t + ms, guard = 0, id, D, tb, best, bestD;
    while (guard++ < 40) {
      best = -1; bestD = null;
      for (id in W.dev) {
        if (!Object.prototype.hasOwnProperty.call(W.dev, id)) continue;
        D = W.dev[id]; tb = D.tab;
        if (D.vis && tb.open && tb.scr === "code" && tb.pst === "live" && tb.pair && !tb.pair.dead && tb.pair.ex <= target && (best < 0 || tb.pair.ex < best)) { best = tb.pair.ex; bestD = D; }
      }
      if (!bestD) break;
      W.t = Math.max(W.t, best);
      dwbPairExpire(W, bestD);
    }
    W.t = target;
  }
  /* ───── ③ LINE 那一頭（09_網頁版.gs）：打什麼字算什麼 ───── */
  var DWB_CMD_RE = /^(開發者\s*|藥師\s*)?(網頁|網頁版|網站|web)(?:\s*(開發者|藥師))?(?:\s*(重發|重新|新連結|new|綁定|綁裝置|bind))?$/i;
  var DWB_PAIR_RE = /^((?:代號|代碼)\s*[:：]?\s*)?([A-Za-z0-9]{9}|\d{3}[\s\-]?\d{3})$/;
  var DWB_CODE_RE = /^(開發者\s*|藥師\s*)?(?:(網頁|網頁版|網站|web)\s*)?(驗證碼登入|驗證碼|驗證)$/i;
  var DWB_CFG_RE = /^開發者\s*(?:網頁|網頁版|網站|web)\s*(?:設定|cfg|cfg\.js)$/i;
  var DWB_SW_RE = /^驗證碼登入\s*(關閉|關掉|關|停用|暫停|停|開啟|開|啟用|恢復|on|off)$/i;
  var DWB_EX = ["開發者網頁", "開發者網頁 綁定", "開發者網頁 重發", "驗證碼登入 關"];
  function dwbWebMatch(text) {
    var t = String(text === null || text === undefined ? "" : text).trim(), m = t.match(DWB_CMD_RE), w, bind;
    if (!m) return null;
    w = ((m[1] || "") + (m[3] || "")).replace(/\s+/g, "");
    bind = /^(綁定|綁裝置|bind)$/i.test(m[4] || "");
    return { dev: w.indexOf("開發者") >= 0, user: w.indexOf("藥師") >= 0, force: !!m[4] && !bind, bind: bind };
  }
  /* 單純打 9 個英數字／6 個數字：只有「現在真的有這組在等人領」、這個人 10 分鐘內也還沒猜錯太多次，才算代號；6 個數字只有開發者才算 */
  function dwbBareOk(W, uid, code) {
    var key = "b|" + uid, g;
    if (/^\d{6}$/.test(code) && !dwbIsDev(W, uid)) return false;
    g = dwbCtr(W, key);
    if (g.n >= DWB_LC_MISS_MAX) return false;
    if (dwbPending(W, code)) return true;
    g.n++;
    dwbCtrPut(W, key, g);
    return false;
  }
  function dwbCodeMatch(W, text, uid) {
    var t = String(text === null || text === undefined ? "" : text).replace(/[​-‍⁠﻿]/g, "").trim().replace(/[！-～]/g, function(ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }), m, code, num, explicit;
    m = t.match(DWB_PAIR_RE);
    if (m) {
      code = m[2].replace(/[\s\-]/g, "");
      num = /^\d{6}$/.test(code);
      explicit = !!m[1];
      if (!num && !(/[A-Za-z]/.test(code) && /\d/.test(code))) return null;
      if (!explicit && (W.src !== "user" || !dwbBareOk(W, uid, code))) return null;
      return { kind: "pair", code: code, dev: num, explicit: explicit };
    }
    m = t.match(DWB_CODE_RE);
    if (m) return !m[2] && m[3] === "驗證" ? null : { kind: "code" };
    if (t.match(DWB_CFG_RE)) return { kind: "cfg" };
    m = t.match(DWB_SW_RE);
    return m ? { kind: "sw", off: /^(關閉|關掉|關|停用|暫停|停|off)$/i.test(m[1]) } : null;
  }
  function dwbLooksWeb(t) { var s = String(t).trim(); return !!(dwbWebMatch(s) || s.match(DWB_CODE_RE) && !(/^(開發者\s*|藥師\s*)?驗證$/.test(s)) || s.match(DWB_CFG_RE) || s.match(DWB_SW_RE)); }
  function dwbRoleName(dev) { return dev ? "開發者" : "藥師"; }
  /* 「開發者網頁」「網頁」「藥師網頁」＋「重發」：發連結（_cmdWeb_） */
  function dwbCmdWeb(S, X, W, m, uid) {
    var isDev = dwbIsDev(W, uid), wantDev = !!m.dev || (isDev && !m.user), force = !!m.force, r, old = "", nBound = 0, dropped = 0, who = dwbWho(uid), key;
    if (m.bind) return dwbCmdBind(S, X, W, uid);
    if (wantDev && !isDev) {
      dsSend(X, [bot("🛠 開發者網頁只有開發者（DEV_USERS）拿得到。\n藥師版請打「網頁」。")]);
      dsT(X, 0, "是「開發者網頁」，但" + who + "不在開發者名單裡 → 只回一句話，不發鑰匙");
      X.sheet = "沒動"; X.reply = "「🛠 開發者網頁只有開發者拿得到。藥師版請打『網頁』」";
      return true;
    }
    key = uid + "|" + (wantDev ? 1 : 0);
    if (force) {
      old = W.cur[key] || "";
      nBound = old ? dwbBoundList(W, old).length : 0;
      dropped = dwbDrop(W, uid);
      r = dwbIssue(W, uid, true, wantDev);
    } else r = dwbIssue(W, uid, false, wantDev);
    dwbGive(W, uid, wantDev, r.token);
    if (isDev && !m.dev && !m.user && !force) dsT(X, 1, "是「網頁」，你是開發者 → 預設給開發者版（想看藥師看到的，打「藥師網頁」）");
    else if (!wantDev && isDev) dsT(X, 1, "是「藥師網頁」→ 開發者也拿藥師版（拿來看藥師看到的樣子）");
    else dsT(X, 1, "是「" + (wantDev ? "開發者網頁" : "網頁") + (force ? " 重發" : "") + "」→ " + (wantDev ? "你在開發者名單裡，給你開發者版" : who + "拿的是藥師版"));
    if (force) {
      dsT(X, 1, "先把" + who + "手上還沒用掉的驗證碼全部作廢（" + dropped + " 組），再發一把全新的" + dwbRoleName(wantDev) + "鑰匙，舊的立刻失效");
      if (wantDev) dsT(X, 1, "舊鑰匙底下綁的 " + nBound + " 台裝置跟著失效；新鑰匙從 0 台開始，每一台要重新綁（舊連結、已經開著的網頁，下一次問後端就會被擋）");
    } else if (r.reused) dsT(X, 1, "拿" + who + "的" + dwbRoleName(wantDev) + "鑰匙：已經有一把、還能用 → 沿用同一把，不換新的（連結有在用就不會過期；30 天沒開才會失效）");
    else dsT(X, 1, "拿" + who + "的" + dwbRoleName(wantDev) + "鑰匙：" + (r.old ? "上一把已經過期了" : "還沒有") + " → 發一把新的（30 天）" + (r.old ? "，舊的作廢" : ""));
    dsT(X, 1, "把鑰匙放進連結（網址 # 後面，瀏覽器不會把 # 後面的東西送給任何伺服器）→ 回連結卡" + (wantDev ? "：「打開網頁」是這條連結，「🔑 拿綁定碼」等於幫你打「開發者網頁 綁定」" : "：「打開網頁」是這條連結"));
    dsSend(X, [webLinkCard({ dev: wantDev, force: force, days: dwbDays(W, r), live: uid === DWB_ME ? r.token : "" })]);
    X.sheet = "沒動";
    X.reply = "「" + (wantDev ? "🛠 補藥神器 開發者網頁" : "🌐 補藥神器 網頁版") + "」連結卡＋" + (wantDev ? "「打開網頁」「🔑 拿綁定碼」兩顆按鈕" : "「打開網頁」一顆按鈕") + (force ? "（多一句「已換新連結，舊的已失效」）" : "");
    return true;
  }
  /* 「開發者網頁 綁定」：6 位數綁定碼（10 分鐘、只能用一次、只對現在這把開發者鑰匙有效；再拿一組，上一組作廢） */
  function dwbCmdBind(S, X, W, uid) {
    var isDev = dwbIsDev(W, uid), r, b;
    if (!isDev) {
      dsSend(X, [bot("🔒 綁定碼只有開發者（DEV_USERS）拿得到；藥師版的網頁不用綁定。")]);
      dsT(X, 0, "是「綁定」，但" + dwbWho(uid) + "不在開發者名單裡 → 只回一句話；藥師版的網頁本來就不用綁定");
      X.sheet = "沒動"; X.reply = "「🔒 綁定碼只有開發者拿得到；藥師版的網頁不用綁定」";
      return true;
    }
    r = dwbIssue(W, uid, false, true);
    dwbGive(W, uid, true, r.token);
    b = dwbBindMake(W, uid, r.token);
    dsT(X, 1, "是「開發者網頁 綁定」→ 先確定你有一把開發者鑰匙（" + (r.reused ? "已經有，沿用" : "沒有，先發一把新的") + "）");
    dsT(X, 1, "產生一組 6 位數綁定碼（" + b.code + "）：只對這把鑰匙有效、10 分鐘內有效、只能用一次" + (b.old ? "；你上一組（" + b.old + "）同時作廢" : ""));
    dsT(X, 1, "到要綁的那一台打開開發者網頁，把這 6 位數打進綁定框；一把鑰匙最多綁 3 台");
    dsSend(X, [wbBindCard(b.code, { live: uid === DWB_ME ? r.token : "" })]);
    X.sheet = "沒動";
    X.reply = "「🔑 開發者網頁綁定碼」卡片：6 位數的碼＋一顆「打開開發者網頁」";
    return true;
  }
  /* 代號貼進 LINE（_cmdWebPair_）：換一組 6 位數驗證碼 */
  function dwbCmdPair(S, X, W, m, uid) {
    var isDev = dwbIsDev(W, uid), who = dwbWho(uid), gk = "g|" + uid, mk = "m|" + uid, g, ms, got, wantDev;
    if (m.dev && !isDev) {
      dsSend(X, [bot("🛠 6 位數字的代號是開發者版，只有開發者（DEV_USERS）領得到。\n藥師版的代號是 9 個英文＋數字（例如 JA0025AiP），打開網頁就看得到。")]);
      dsT(X, 0, "6 個數字的代號是開發者版，但" + who + "不在開發者名單裡 → 不管現在有沒有這組代號在等，都回同一句（不讓人拿來試）");
      X.sheet = "沒動"; X.reply = "「🛠 6 位數字的代號是開發者版，只有開發者領得到」";
      return true;
    }
    if (W.src !== "user") {
      dsSend(X, [bot("🔐 代號要貼在跟補藥神器的「一對一聊天室」裡：群組裡別人也看得到，就等於借給別人用。\n（點補藥神器的名字進一對一聊天室，再貼一次代號。）")]);
      dsT(X, 0, "這句話是在群組裡打的 → 代號會被裡面所有人看到，不發驗證碼");
      X.sheet = "沒動"; X.reply = "「🔐 代號要貼在一對一聊天室裡」";
      return true;
    }
    if (W.off) {
      dsSend(X, [bot(isDev ? "⏸ 「驗證碼登入」目前是關閉的（您關的）。打「驗證碼登入 開」恢復。\n（LINE 連結「🌐 補藥神器網頁」照常能用。）" : "⏸ 驗證碼登入目前暫停了。請按下面那排的「🌐 補藥神器網頁」直接開。")]);
      dsT(X, 0, "「驗證碼登入」的緊急開關關著 → 不發驗證碼（免得拿了碼卻輸不進去）；LINE 連結照常能用");
      X.sheet = "沒動"; X.reply = "「⏸ 驗證碼登入目前暫停了」";
      return true;
    }
    g = dwbCtr(W, gk);
    ms = dwbCtr(W, mk);
    if (g.n >= DWB_LC_GET_MAX) {
      dsSend(X, [bot("⏳ 驗證碼 " + Math.round(DWB_LC_GET_SEC / 60) + " 分鐘內最多領 " + DWB_LC_GET_MAX + " 次，等一下再貼代號。\n（網頁上已經登入過的瀏覽器，下次直接打網址就進得去，不用再領。）")]);
      dsT(X, 0, who + "這 10 分鐘已經領了 " + g.n + " 次驗證碼（上限 " + DWB_LC_GET_MAX + " 次）→ 不發");
      X.sheet = "沒動"; X.reply = "「⏳ 驗證碼 10 分鐘內最多領 10 次」";
      return true;
    }
    if (ms.n >= DWB_LC_MISS_MAX) {
      dsSend(X, [bot("⏳ 貼錯代號的次數太多了，等 " + Math.round(DWB_LC_GET_SEC / 60) + " 分鐘再試。\n（先回網頁看清楚代號再貼。）")]);
      dsT(X, 0, who + "這 10 分鐘貼錯代號已經 " + ms.n + " 次（上限 " + DWB_LC_MISS_MAX + " 次）→ 不查");
      X.sheet = "沒動"; X.reply = "「⏳ 貼錯代號的次數太多了」";
      return true;
    }
    got = dwbClaim(W, m.code, uid, isDev);
    if (got) { g.n++; dwbCtrPut(W, gk, g); }
    if (!got) {
      ms.n++;
      dwbCtrPut(W, mk, ms);
      dsSend(X, [bot("❓ 找不到這組代號（貼錯了、超過 " + Math.round(DWB_LC_SEC / 60) + " 分鐘過期了，或已經領過驗證碼）。\n回網頁看一下現在的代號（超過時間網頁會自己換新的），或按網頁上的「重新取得代號」，再貼一次。")]);
      dsT(X, 0, "找這組代號（" + m.code + "）：沒有人在等它（貼錯了、出現後超過 5 分鐘過期了，或已經領過驗證碼）→ 記一次「貼錯代號」（" + ms.n + "／" + DWB_LC_MISS_MAX + "，10 分鐘一輪）");
      X.sheet = "沒動"; X.reply = "「❓ 找不到這組代號」";
      return true;
    }
    wantDev = !!got.rec.dv;
    dsT(X, 1, "是代號的樣子（" + (m.dev ? "6 個數字＝開發者版" : "9 個英數字＝藥師版") + "）→ 在一對一聊天室、「驗證碼登入」沒關");
    dsT(X, 1, "這組代號（" + m.code + "）是網頁幾分鐘前向後端拿的，還在等人領、也沒過 5 分鐘 → 發一組 6 位數驗證碼，綁在這組代號上；代號記成「已領」，同一組不能領第二次");
    dsT(X, 1, who + "這 10 分鐘領了 " + g.n + "／" + DWB_LC_GET_MAX + " 次驗證碼" + (wantDev ? "；這張驗證碼進得了開發者版（能改資料），所以卡片是藍色、警告更重" : ""));
    dsT(X, 1, "驗證碼卡片沒有按鈕：它只能打回「出現這組代號的那個網頁」（後端會核對那一台的裝置碼），換別的瀏覽器打沒用");
    dsSend(X, [wbCodeCard(got.v, m.code, got.rec.lab, wantDev)]);
    X.sheet = "沒動";
    X.reply = "「" + (wantDev ? "🛠 開發者版 網頁驗證碼" : "🔐 補藥神器 網頁驗證碼") + "」卡片：6 位數驗證碼、「限時 5 分鐘・只能用一次」、沒有按鈕";
    return true;
  }
  var DWB_HELP = "🔐 登入網頁的做法：\n1. 先在電腦（或手機瀏覽器）打開補藥神器網頁，畫面上會出現一組代號（英文＋數字，例如 JA0025AiP）\n2. 把那組代號貼（或打）在這裡（要在跟我的一對一聊天室，不是群組）\n3. 我會回你 6 位數的驗證碼，打回網頁就登入\n※ 要在 5 分鐘內做完（網頁上有倒數）；超過了網頁會自己換一組新的代號，把新的代號再貼進來就好。\n（沒看到代號？直接按下面那排的「🌐 補藥神器網頁」也能開。）";
  function dwbCmdHelp(S, X, W, uid) {
    var isDev = dwbIsDev(W, uid);
    dsSend(X, [bot(DWB_HELP + (isDev ? "\n\n開發者：在網頁上按「開發者登入」會拿到 6 位數字的代號，打在這裡拿到的是開發者版。" : ""))]);
    dsT(X, 1, "是舊的說法（「驗證碼」「網頁 驗證」…）→ 現在是網頁先給代號，這裡只回怎麼做，不發任何碼");
    X.sheet = "沒動"; X.reply = "「🔐 登入網頁的做法」三個步驟";
    return true;
  }
  function dwbCfgLine() { return "window.BUYAO_X=\"" + DWB_ID + "\";"; }
  function dwbCfgText() {
    return "📄 只做一次：讓「直接打網址」也能用代號登入\n\n1. 開 GitHub 放網頁的那個專案 → Add file → Create new file\n2. 檔名打 cfg.js\n3. 內容貼下一則訊息那一行（整行複製）\n4. Commit changes\n5. 等 1～10 分鐘，回 LINE 打「健檢」（或「版本更新」）：「GitHub 網頁」那一行後面會多一句「cfg.js ✅（後端代號 " + DWB_ID.slice(-6) + "）」。沒出現的話，檢查檔名是不是剛好 cfg.js、有沒有跟 index.html 放在同一層（不能放進資料夾裡）\n\n這一行只寫「後端在哪」，不是鑰匙：沒有 LINE 給的驗證碼進不去。\n⚠️ 但 GitHub 上的檔案是公開的，等於把後端網址公開了：陌生人拿它看不到任何藥品資料，也拿不到驗證碼（沒有人在 LINE 打他的代號），只能不斷向後端「拿代號」，把額度（10 分鐘 30 次）用光，讓這條路暫時說「忙線」（LINE 的連結、已經登入的瀏覽器不受影響）。有人這樣做你會收到警示信；想先關掉就在 LINE 打「驗證碼登入 關」。\n不想公開就不要放：沒有 cfg.js 的話，每台瀏覽器第一次要先從 LINE 的「🌐 補藥神器網頁」按鈕開一次，之後這台直接打網址就會出現代號。\n（後端代號 " + DWB_ID.slice(-6) + "）";
  }
  function dwbCmdCfg(S, X, W, uid) {
    if (!dwbIsDev(W, uid)) {
      dsSend(X, [bot("🔒 這個設定只有開發者（DEV_USERS）看得到。")]);
      dsT(X, 0, dwbWho(uid) + "不在開發者名單裡 → 只回一句話");
      X.sheet = "沒動"; X.reply = "「🔒 這個設定只有開發者看得到」";
      return true;
    }
    dsSend(X, [bot(dwbCfgText()), bot(dwbCfgLine())]);
    dsT(X, 1, "是「開發者網頁 設定」→ 回兩則：第一則是 5 個步驟，第二則就是要貼進 GitHub 上 cfg.js 的那一行（只寫「後端在哪」，不是鑰匙）");
    dsT(X, 1, "放不放 cfg.js 是你的選擇：放了，沒從 LINE 開過的瀏覽器直接打網址也會出代號；不放，每台瀏覽器要先從 LINE 按鈕開一次（練習的網頁面板可以切換看差別）");
    X.sheet = "沒動"; X.reply = "兩則文字：cfg.js 的做法，和 window.BUYAO_X=… 那一行";
    return true;
  }
  var DWB_OFFTXT = "⏸ 「驗證碼登入」已關閉（全院，立刻生效）：\n・網頁拿不到代號，LINE 打代號也不會發驗證碼（都會說「暫停了」）。\n・已經發出去、還沒用掉的驗證碼，網頁也兌換不了。\n・LINE 連結（🌐 補藥神器網頁）和已經登入的瀏覽器不受影響。\n\n打「驗證碼登入 開」恢復。";
  function dwbCmdSwitch(S, X, W, uid, m) {
    if (!dwbIsDev(W, uid)) {
      dsSend(X, [bot("🔒 這個開關只有開發者（DEV_USERS）能動。")]);
      dsT(X, 0, dwbWho(uid) + "不在開發者名單裡 → 只回一句話，開關沒動");
      X.sheet = "沒動"; X.reply = "「🔒 這個開關只有開發者能動」";
      return true;
    }
    W.off = m.off ? 1 : 0;
    dsSend(X, [bot(m.off ? DWB_OFFTXT : "▶️ 「驗證碼登入」已恢復（全院，立刻生效）。")]);
    dsT(X, 1, m.off ? "是「驗證碼登入 關」→ 緊急開關關起來（全院、立刻生效）：網頁拿不到代號、LINE 不發驗證碼、已經發出去的驗證碼也兌換不了；LINE 連結和已經登入的瀏覽器不受影響" : "是「驗證碼登入 開」→ 開關打開，代號登入恢復（全院、立刻生效）");
    X.sheet = "沒動（開關是全院的設定，不在試算表）";
    X.reply = m.off ? "「⏸ 『驗證碼登入』已關閉」＋三句說明" : "「▶️ 『驗證碼登入』已恢復」";
    return true;
  }
  /* 「開發者」開頭的字，非開發者先被擋在 _impFlow_（08_匯入.gs）那道門外：整句拿掉空白，開頭是「開發者」→ 只回這一句，後面的網頁指令根本沒有跑（「網頁 開發者」這種寫法不是「開發者」開頭，過得了門，才會碰到 _cmdWeb_ 自己的那句） */
  var DWB_GATE = "這是開發者指令 🔒\n有資料要新增或修改，把 CODE 和內容傳給開發者就好。";
  function dwbGate(t) { return /^開發者/.test(String(t === null || t === undefined ? "" : t).trim().replace(/\s+/g, "")); }
  /* 某一個人打的一句話（uid＝你或藥師）：回 true＝這句話處理掉了；回 false＝跟網頁無關，呼叫的人往下當一般訊息（例如藥品查詢） */
  function dwbLineAs(S, X, W, t, uid) {
    var m, pm;
    if (!dwbIsDev(W, uid) && dwbGate(t)) {
      dsSend(X, [bot(DWB_GATE)]);
      dsT(X, 0, "開頭是「開發者」的字，機器人先過一道門：" + dwbWho(uid) + "不在開發者名單裡 → 只回一句「這是開發者指令」，後面的網頁指令沒有跑");
      X.sheet = "沒動"; X.reply = "「這是開發者指令 🔒」";
      return true;
    }
    m = dwbWebMatch(t);
    if (m) return dwbCmdWeb(S, X, W, m, uid);
    pm = dwbCodeMatch(W, t, uid);
    if (!pm) return false;
    if (pm.kind === "pair") return dwbCmdPair(S, X, W, pm, uid);
    if (pm.kind === "code") return dwbCmdHelp(S, X, W, uid);
    if (pm.kind === "cfg") return dwbCmdCfg(S, X, W, uid);
    return dwbCmdSwitch(S, X, W, uid, pm);
  }
  /* 練習聊天室的 LINE 那一頭：回 true＝這句話處理掉了。別課的練習聊天室沒做網頁，說一聲在哪一課 */
  function dwbLine(S, X, raw, t, flat) {
    var W = S.ops.web;
    if (!S.ops.webUi) {
      if (dwbLooksWeb(t)) { dsLater(X, "開發者網頁", "「開發者網頁」那一課才有。"); return true; }
      return false;
    }
    W.t += 1;
    W.tr = [];
    if (W.src !== "user") X.msgs.unshift(dsEcho("👥 （練習專用的假裝）你現在在群組聊天室裡打字，不是跟補藥神器的一對一聊天室"));
    return dwbLineAs(S, X, W, t, DWB_ME);
  }
  /* ───── ④ 事件（網頁上做的事、練習專用的按鈕）、畫面資料 ───── */
  /* 練習專用的「時間往後撥」：1 分鐘到 31 天（"low"＝撥到這一台的倒數剩 20 秒，另外算） */
  var DWB_TIMES = [
    { v: 60000, l: "1 分鐘" }, { v: 240000, l: "4 分鐘" }, { v: 300000, l: "5 分鐘" }, { v: 3600000, l: "1 小時" },
    { v: DWB_DAY, l: "1 天" }, { v: 25 * DWB_DAY, l: "25 天" }, { v: 31 * DWB_DAY, l: "31 天" }
  ];
  function dwbLeft(W, tb) { return tb.pair && !tb.pair.dead ? Math.max(0, Math.ceil((tb.pair.ex - W.t) / 1000)) : 0; }
  function dwbLive(W, tb) { return !!(tb.open && tb.scr === "code" && tb.pst === "live" && tb.pair && !tb.pair.dead); }
  function dwbDevBrief(D) {
    var tb = D.tab;
    if (!tb.open) return "沒開網頁";
    if (tb.scr === "home") return tb.dev ? "開發者版首頁" : "藥師版首頁";
    if (tb.scr === "code") return tb.pst === "live" ? "代號登入" : tb.pst === "err" ? "沒拿到代號" : "代號沒有了";
    if (tb.scr === "bind") return "等你綁定";
    return "請從 LINE 開";
  }
  /* 網頁現在的畫面，一句話（「背後發生的事」最下面「機器人回」那一格用，也給畫面的說明用） */
  function dwbScreenText(W, D) {
    var tb = D.tab;
    if (!tb.open) return "「" + D.name + "」沒有開著補藥神器的網頁";
    if (tb.scr === "none") return "「" + D.name + "」：請從 LINE 按「🌐 補藥神器網頁」開（網頁不知道要連哪個後端）";
    if (tb.scr === "bind") return "「" + D.name + "」：「這台還沒綁定開發者版」＋6 位數的綁定框";
    if (tb.scr === "home") return "「" + D.name + "」：" + (tb.dev ? "開發者版" : "藥師版") + "首頁";
    if (tb.scr === "code") {
      if (dwbLive(W, tb)) return "「" + D.name + "」：代號登入，" + (tb.pair.dev ? "開發者代號 " : "代號 ") + tb.pair.code + "，倒數 " + dwbMS(Math.max(1, dwbLeft(W, tb)));
      return "「" + D.name + "」：代號登入，" + (tb.pst === "err" ? "「① 沒拿到代號」＋「再試一次」" : "「" + (tb.big || "請重新取得代號") + "」＋「重新取得代號」");
    }
    return "「" + D.name + "」的網頁";
  }
  function dwbKeyLine(W, uid, dev) {
    var id = W.cur[uid + "|" + (dev ? 1 : 0)], s = id ? W.tok[id] : null, out, l, names, i, j;
    if (!id) return "（還沒有）";
    if (!s || !(s.exp > W.t)) return id + "（已經失效）";
    out = id + "（還有 " + Math.max(1, Math.round((s.exp - W.t) / DWB_DAY)) + " 天）";
    if (dev) {
      l = dwbBoundList(W, id); names = [];
      for (i = 0; i < l.length; i++) for (j = 0; j < DWB_DEVS.length; j++) if (W.dev[DWB_DEVS[j].id].dh === l[i]) names.push(DWB_DEVS[j].name);
      out += "　已綁 " + l.length + "／" + DWB_BIND_MAX + " 台" + (names.length ? "：" + names.join("、") : "");
    }
    return out;
  }
  /* 畫面資料（純函式，不改任何東西）：面板整個照這份畫；內容一樣就不重畫 */
  function dwbView(S) {
    var W = S.ops.web, D = W.dev[W.sel], tb = D.tab, v, i, x, kinds, k, j, tid, st, left, d, own = DWB_ME;
    v = { clock: dwbClock(W.t), sel: W.sel, name: D.name, lab: D.lab, vis: D.vis ? 1 : 0, off: W.off ? 1 : 0, cfg: W.cfg ? 1 : 0, src: W.src, devs: [], links: [], times: [], facts: [], open: tb.open ? 1 : 0, scr: tb.open ? tb.scr : "" };
    for (i = 0; i < DWB_DEVS.length; i++) {
      x = W.dev[DWB_DEVS[i].id];
      v.devs.push({ id: x.id, name: x.name, lab: x.lab, on: x.id === W.sel ? 1 : 0, brief: dwbDevBrief(x) });
    }
    kinds = [["dev", 1], ["app", 0]];
    for (k = 0; k < kinds.length; k++) {
      tid = kinds[k][0] === "dev" ? W.links.dev : W.links.usr;
      for (j = Math.max(0, tid.length - 3); j < tid.length; j++) {
        st = W.tok[tid[j]];
        v.links.push({ k: kinds[k][0], t: tid[j], st: W.cur[own + "|" + kinds[k][1]] === tid[j] ? (st && st.exp > W.t ? "最新" : "已過期") : "換過新的了，已作廢" });
      }
    }
    for (i = 0; i < DWB_TIMES.length; i++) v.times.push({ v: DWB_TIMES[i].v, l: DWB_TIMES[i].l });
    v.live = dwbLive(W, tb) ? 1 : 0;   /* 有倒數在走（「撥到剩 20 秒」那顆鍵要不要出現）；v.low 是倒數剩 20 秒以內（紅字），兩件事 */
    v.low = 0;
    v.mem = D.ls.bk ? "鑰匙 " + D.ls.bk.t + "＋後端在哪" : D.ls.bx ? "只記得後端在哪（沒有鑰匙）" : "什麼都沒記";
    v.facts = [
      ["現在的時間", dwbClock(W.t) + "（練習的時鐘：只有按「時間往後撥」才會走）"],
      ["你的開發者鑰匙", dwbKeyLine(W, own, 1)],
      ["你的藥師鑰匙", dwbKeyLine(W, own, 0)],
      ["「驗證碼登入」", W.off ? "⏸ 關著（全院）" : "開著"],
      ["GitHub 上的 cfg.js", W.cfg ? "有" : "沒有"],
      ["這一台瀏覽器記著", v.mem]
    ];
    if (W.cur[DWB_PH + "|0"]) v.facts.splice(3, 0, ["藥師的鑰匙", dwbKeyLine(W, DWB_PH, 0)]);
    if (!tb.open) return v;
    v.url = DWB_URL + (tb.hash ? "#x=AKfycb…demo01&" + (tb.hash.k === "dev" ? "dev" : "app") + "=" + tb.hash.t : "");
    if (tb.scr === "none") v.msg = tb.head || DWB_P.none;
    else if (tb.scr === "bind") { v.head = tb.head; v.bval = tb.bval; v.bmsg = tb.bmsg; }
    else if (tb.scr === "home") { v.dev = tb.dev ? 1 : 0; v.bound = tb.hint === "bound" ? 1 : 0; v.ask = tb.ask ? 1 : 0; v.probe = tb.probe; v.hint0 = DWB_P.hint0.join("　"); v.bmsgOk = DWB_P.bound; }
    else if (tb.scr === "code") {
      v.head = tb.head || DWB_P.head;
      v.role = tb.role === "dev" ? 1 : 0;
      v.note = tb.note ? (tb.pst === "err" ? DWB_P.fail : tb.note) : "";
      v.pst = tb.pst;
      if (dwbLive(W, tb)) {
        left = dwbLeft(W, tb);
        v.dev = tb.pair.dev ? 1 : 0;
        v.code = tb.pair.code;
        v.shown = v.dev ? v.code.slice(0, 3) + " " + v.code.slice(3) : v.code;
        /* 看不到的分頁過了時間（真的 pairExpire 遇到 hidden 就什麼都不做）：畫面停在最後畫的那一秒「0:01」，不是 0:00 */
        v.cd = dwbMS(Math.max(1, left)); v.low = left <= 20 ? 1 : 0;
        v.auto = tb.auto >= DWB_AUTO_MAX ? DWB_P.last : DWB_P.more;
        d = dwbDecode(tb.cval);
        v.cval = tb.cval; v.can = d.code ? 1 : 0; v.chint = d.hint; v.cmsg = tb.cmsg; v.cwait = tb.cwait ? 1 : 0;
      } else {
        /* 沒有代號可以用：沒拿到（err）→ 「① 沒拿到代號」＋原因＋「再試一次」；代號沒有了（gone）→ 「① 原因」＋大字＋「重新取得代號」（renderPair 的 pairHtml） */
        v.l1 = tb.pst === "err" ? "① 沒拿到代號" : "① " + (tb.why || "這組代號已經不能用了");
        v.l2 = tb.pst === "err" ? (tb.why || "沒拿到代號，再試一次") : (tb.big || "請重新取得代號");
        v.extra = tb.extra;
        v.btn = tb.pst === "err" ? "再試一次" : "重新取得代號";
      }
    }
    return v;
  }
  /* 把這一步網頁做的事（W.tr）一句一句交給「背後發生的事」；LINE 主動傳來的通知（W.push）變成聊天室裡的訊息 */
  function dwbFlush(X, W) {
    var i, tr = W.tr || [];
    for (i = 0; i < tr.length; i++) dsT(X, tr[i].ok, tr[i].t);
    W.tr = [];
  }
  function dwbPushOut(X, W) {
    var i, p;
    if (!W.push.length) return false;
    for (i = 0; i < W.push.length; i++) {
      p = W.push[i];
      if (i === 0) X.msgs.push(act("🔔 LINE 主動傳給你的通知（不是你打字問的）："));
      X.msgs.push(wbNewDevCard(dwbClock(p.at), p.lab || "（瀏覽器沒報名稱）", p.n, { live: 1 }));
      dsT(X, 1, "有一台新裝置用驗證碼登入了開發者網頁 → LINE 專案主動傳一張通知卡給開發者：「" + (p.lab || "沒報名稱") + "」，已綁 " + p.n + "／" + DWB_BIND_MAX + " 台；不是你自己的話，按卡片最下面的紅色按鈕「不是我，全部作廢」（等於打「開發者網頁 重發」）");
    }
    W.push = [];
    X.keep = 0;
    X.qKeep = 1;
    return true;
  }
  function dwbBadEv(X, text) {
    dsT(X, 0, text);
    X.say = text;
    X.sheet = "沒動";
    X.reply = "（沒有動作）" + text;
    return X;
  }
  function dwbPhNote() { return act("📲 假裝是另一個人：下面是「藥師」在他自己跟補藥神器的聊天室裡看到的，不是你的聊天室。"); }
  /* 練習專用的按鈕（聊天室那一排）：切換「我在哪裡打字」、假裝藥師做的事 */
  function dwbActEv(S, X, ev) {
    var W = S.ops.web, id = String(ev.v || ""), p = id.split(":"), keepSrc = W.src, m, code, D, tb;
    X.sheet = "沒動";
    if (id === "src") {
      W.src = W.src === "user" ? "group" : "user";
      X.keep = 1;
      X.reply = "（不回話）這一步只是換「你在哪裡打字」，沒有傳給機器人";
      X.say = W.src === "group" ? "好，現在假裝你在「群組」裡打字。代號貼在群組裡，別人也看得到，機器人不發驗證碼。" : "回到跟補藥神器的一對一聊天室。";
      dsT(X, 1, W.src === "group" ? "（練習專用）假裝你換到一個群組聊天室打字：之後你打的每一句，機器人都當作是在群組裡打的" : "（練習專用）回到跟補藥神器的一對一聊天室");
      dsT(X, 1, "機器人分得出這句話是在哪裡打的（LINE 會附上來源）：代號只能貼在一對一聊天室，群組裡貼的，整個群組的人都看得到");
      return X;
    }
    if (p[0] !== "ph") return dwbBadEv(X, "這個動作現在做不到");
    X.keep = 0;
    X.qKeep = 1;
    X.msgs.push(dwbPhNote());
    W.src = "user";
    try {
      if (p[1] === "link") { X.msgs.push(me("網頁")); dwbLineAs(S, X, W, "網頁", DWB_PH); }
      else if (p[1] === "dev") { X.msgs.push(me("開發者網頁")); dwbLineAs(S, X, W, "開發者網頁", DWB_PH); }
      else if (p[1] === "bind") { X.msgs.push(me("開發者網頁 綁定")); dwbLineAs(S, X, W, "開發者網頁 綁定", DWB_PH); }
      else if (p[1] === "pair" || p[1] === "num") {
        D = W.dev[p[2]];
        tb = D ? D.tab : null;
        code = tb && dwbLive(W, tb) && !!tb.pair.dev === (p[1] === "num") ? tb.pair.code : "";
        if (!code) { W.src = keepSrc; X.msgs = []; X.keep = 1; X.qKeep = 0; return dwbBadEv(X, "那一台現在沒有這種代號可以貼"); }
        X.msgs.push(me(code));
        if (!dwbLineAs(S, X, W, code, DWB_PH)) dsSearch(S, X, code);
      } else { W.src = keepSrc; X.msgs = []; X.keep = 1; X.qKeep = 0; return dwbBadEv(X, "這個動作現在做不到"); }
    } finally { W.src = keepSrc; }
    dwbQuick(W, DWB_PH);   /* 藥師那邊也收到機器人的回覆，輸入框上面那顆「🌐 網頁」一樣要帶他的鑰匙 */
    X.reply = "（回給藥師）" + X.reply;
    X.say = "";
    return X;
  }
  /* 網頁上做的事（面板送來的）。w＝做什麼：sel 換一台、link 按 LINE 卡片上的「打開網頁」、url 直接打網址、reload 重新整理、close 關掉、bind 按「綁定」、login 按「登入」、
     new 重新取得代號（再試一次）、role 換藥師／開發者登入、copy 複製代號、outAsk／outYes／outNo 登出這台、probe 查一支藥、vis 看得到／看不到、time 時間往後撥、cfg 有沒有 cfg.js、act 聊天室那一排練習專用的按鈕 */
  function dwbEvent(S, X, ev) {
    var W = S.ops.web, w = String(ev.w || ""), v = ev.v, D = W.dev[W.sel], tb = D.tab, m, ms, label, pushed, i, n, s;
    W.t += 1;
    W.tr = [];
    X.keep = 1;
    X.sheet = "沒動";
    X.reply = "";
    if (w === "act") return dwbActEv(S, X, ev);
    if (w === "sel") {
      if (!W.dev[v]) return dwbBadEv(X, "沒有這一台");
      W.sel = v; D = W.dev[v]; tb = D.tab;
      dsT(X, 1, "換成看「" + D.name + "」（" + D.lab + "）。每一台是不同的瀏覽器：各自記著自己的鑰匙、後端在哪、代號，也各有一個自己的裝置碼（後端認的是「這一台」，不是「你這個人」）");
    } else if (w === "cfg") {
      W.cfg = v ? 1 : 0;
      dsT(X, 1, W.cfg ? "（練習專用）假裝 GitHub 放網頁的專案裡有 cfg.js（只寫「後端在哪」，不是鑰匙）→ 之後任何瀏覽器直接打網址，都知道後端在哪，可以用代號登入" : "（練習專用）假裝 GitHub 上沒有 cfg.js → 沒從 LINE 的按鈕開過的瀏覽器，直接打網址只會說「請從 LINE 開」");
      dsT(X, 1, "已經開著的網頁不會因此改變；重新整理或重新打開，才看得到差別");
    } else if (w === "time") {
      if (v === "low") {
        if (!dwbLive(W, tb)) return dwbBadEv(X, "這一台現在沒有倒數可以撥");
        ms = Math.max(0, tb.pair.ex - 20000 - W.t);
        label = "到倒數剩 20 秒";
      } else {
        ms = +v;
        label = "";
        for (i = 0; i < DWB_TIMES.length; i++) if (DWB_TIMES[i].v === ms) label = DWB_TIMES[i].l;
        if (!label) return dwbBadEv(X, "沒有這種時間");
        label = "過了 " + label;
      }
      dwbAdvance(W, ms);
      dsT(X, 1, "（練習專用）時間往後撥：" + label + "，現在是 " + dwbClock(W.t) + "。練習的時鐘不會自己走，只有按這排按鈕才會走");
      n = 0;
      for (s in W.cur) if (Object.prototype.hasOwnProperty.call(W.cur, s) && W.tok[W.cur[s]] && !(W.tok[W.cur[s]].exp > W.t)) n++;
      if (n) dsT(X, 1, "有 " + n + " 把鑰匙已經超過 30 天沒用，失效了；開著的網頁自己不知道，要等下一次問後端才會發現");
    } else if (w === "vis") {
      if (!tb.open) return dwbBadEv(X, "這一台沒有開著網頁");
      dsT(X, 1, v ? "回到「" + D.name + "」的網頁（看得到了）：網頁把「沒人理」的次數歸零；倒數如果已經到了，這時才自動換新的代號" : "把「" + D.name + "」的網頁藏起來（手機切去 LINE、螢幕關了、換了別的分頁）：看不到的分頁，倒數到 0 也不會自動換新的代號，人回來才換");
      dwbVis(W, D, v ? 1 : 0);
    } else if (w === "link") {
      m = String(v || "").match(/^(dev|app):(t\d+)$/);
      if (!m) return dwbBadEv(X, "這條連結看不懂");
      D.ss.pair = null;
      dsT(X, 1, "你按了連結（LINE 卡片上的「打開網頁」）→ 在「" + D.name + "」開一個新分頁，網址是：" + DWB_URL + "#x=…&" + m[1] + "=" + m[2]);
      dwbBoot(W, D, { k: m[1], t: m[2] });
    } else if (w === "url") {
      D.ss.pair = null;
      dsT(X, 1, "你在「" + D.name + "」開一個新分頁，直接打網址 " + DWB_URL + "（沒帶任何鑰匙）");
      dwbBoot(W, D, null);
    } else if (w === "reload") {
      if (!tb.open) return dwbBadEv(X, "這一台沒有開著網頁");
      dsT(X, 1, "在「" + D.name + "」按重新整理：網頁整個重新載入（記在網頁記憶體裡的東西沒了；記在瀏覽器裡的鑰匙、記在這個分頁裡的代號還在）");
      dwbBoot(W, D, tb.hash);
    } else if (w === "close") {
      if (!tb.open) return dwbBadEv(X, "這一台沒有開著網頁");
      D.tab = dwbTabNew();
      D.ss.pair = null;
      dsT(X, 1, "把「" + D.name + "」的網頁關掉：記在這個分頁裡的代號跟著沒了；瀏覽器記著的鑰匙、後端在哪還在（下次直接打網址用得到）");
    } else if (w === "bind") {
      if (!dwbBindGo(W, D, v)) return dwbBadEv(X, "這一台現在的畫面上沒有綁定框");
    } else if (w === "login") {
      if (!dwbLoginGo(W, D, v)) return dwbBadEv(X, "現在的畫面上沒有可以送出的驗證碼（要先有代號，而且打滿 6 位數字）");
    } else if (w === "new" || w === "role") {
      if (!tb.open || tb.scr !== "code") return dwbBadEv(X, "這一台現在的畫面不是代號登入");
      if (w === "new") {
        dsT(X, 1, "你按了「" + (tb.pst === "err" ? "再試一次" : "重新取得代號") + "」：網頁把舊的暗鑰匙一起交給後端，請 LINE 把舊的代號作廢，再要一組新的");
        dwbPairStart(W, D);
      } else {
        dsT(X, 1, "你按了最下面的小字「" + (v === "dev" ? "開發者登入" : "← 回藥師登入") + "」：換成" + (v === "dev" ? "開發者" : "藥師") + "這一邊，舊的代號作廢，向後端要一組" + (v === "dev" ? "6 位數字的開發者代號" : "9 個英數字的藥師代號"));
        dwbPairStart(W, D, undefined, v === "dev" ? "dev" : "");
      }
    } else if (w === "copy") {
      if (!dwbLive(W, tb)) return dwbBadEv(X, "這一台現在沒有代號可以複製");
      dsT(X, 1, "你按了「複製代號」：真的網頁會先用瀏覽器的剪貼簿複製，不行就換老方法，都不行就請你長按上面的代號（整串一點就會選起來）；複製的只有代號（" + tb.pair.code + "），不會有別的（練習專用：這裡只是假裝，不會真的動你電腦的剪貼簿）");
      dsT(X, 1, "接下來：到 LINE 補藥神器（一對一聊天室）貼上去送出，LINE 就會回你 6 位數的驗證碼");
    } else if (w === "outAsk" || w === "outNo" || w === "outYes") {
      if (!tb.open || tb.scr !== "home") return dwbBadEv(X, "這一台現在不在首頁");
      if (w === "outAsk") { tb.ask = 1; dsT(X, 1, "你按了首頁最下面的「登出這台」→ 網頁先問一次「登出這台？」（說明這台會從開發者版的綁定名單拿掉，名額還回去）"); }
      else if (w === "outNo") { tb.ask = 0; dsT(X, 1, "你按了「取消」→ 沒有登出，回到首頁"); }
      else { dsT(X, 1, "你按了「登出」"); dwbLogoutDo(W, D); }
    } else if (w === "probe") {
      if (!dwbProbe(W, D)) return dwbBadEv(X, "這一台現在不在首頁");
    } else return dwbBadEv(X, "這個動作現在做不到");
    dwbFlush(X, W);
    pushed = dwbPushOut(X, W);
    X.reply = (pushed ? "（機器人沒有回話；但 LINE 主動傳來一張「🔔 開發者網頁有新裝置登入」的通知卡）" : "（不回話）這一步是在瀏覽器裡做的，沒有傳給機器人") + "　網頁現在：" + dwbScreenText(W, W.dev[W.sel]);
    return X;
  }
  /* 輸入框上面「這一步可以這樣打」：現在有哪些代號在等人領，再加幾句常用的 */
  function dwbSug(S) {
    var W = S.ops.web, out = [], i, tb, c, seen = {};
    for (i = 0; i < DWB_DEVS.length; i++) {
      tb = W.dev[DWB_DEVS[i].id].tab;
      if (dwbLive(W, tb) && tb.pair.ex > W.t) {
        c = tb.pair.code;
        if (!seen[c]) { seen[c] = 1; out.push(W.src === "user" ? c : "代號 " + c); }
      }
    }
    return out.slice(0, 3).concat(["開發者網頁", "開發者網頁 綁定", "開發者網頁 重發", W.off ? "驗證碼登入 開" : "驗證碼登入 關", "開發者網頁 設定", "網頁"]);
  }
  /* 聊天室下面「練習專用的按鈕」：換在哪裡打字、假裝藥師做的事（真的要請藥師用他的手機） */
  function dwbActs(S) {
    var W = S.ops.web, out = [], i, tb, id;
    if (!S.ops.webUi) return out;
    out.push({ id: "web:src", w: "web", l: W.src === "user" ? "👥 假裝我在群組裡打字" : "💬 假裝回到一對一聊天室" });
    out.push({ id: "web:ph:link", w: "web", l: "📲 假裝藥師打「網頁」" });
    out.push({ id: "web:ph:dev", w: "web", l: "📲 假裝藥師打「開發者網頁」" });
    out.push({ id: "web:ph:bind", w: "web", l: "📲 假裝藥師打「開發者網頁 綁定」" });
    for (i = 0; i < DWB_DEVS.length; i++) {
      id = DWB_DEVS[i].id;
      tb = W.dev[id].tab;
      if (dwbLive(W, tb)) out.push({ id: "web:ph:" + (tb.pair.dev ? "num" : "pair") + ":" + id, w: "web", l: "📲 假裝藥師把「" + DWB_DEVS[i].name + "」的" + (tb.pair.dev ? "開發者代號 " : "代號 ") + tb.pair.code + " 貼進 LINE" });
    }
    return out;
  }
  /*/SIMDEV*/

  /* ───────── ⑤ 畫面（dwbMake）─────────
     getS()＝現在的練習世界（重播會換一份）；send(ev)＝把網頁上做的事交給練習聊天室（ev＝{ t: "dwb", w: 動作, … }，a＝給「背後發生的事」看的名稱）。
     回傳 { el, draw, reset }：draw() 照 dwbView(S) 把「四台裝置的瀏覽器」畫出來——
       ・上面一排選裝置、一排「在這一台打開網頁」（直接打網址、LINE 給過的連結）；中間是瀏覽器的視窗（網址列＋網頁）；下面是練習專用的按鈕（時間、看不看得到、有沒有 cfg.js）和「平常看不到的東西」；
       ・網頁的字、順序、按鈕照真的 _app_page.html：綁定框、代號登入（① 代號＋複製＋倒數 ② 驗證碼輸入＋登入）、首頁（開發者版小標籤、登出這台）；
       ・輸入框是真的 <input>（綁定碼、驗證碼）：打字只動網頁自己的記錄（dwbTouch），不問後端；按「綁定」「登入」才送出。重畫的時候輸入框原樣留著（打到一半的字、游標都不動）；
       ・按的那顆按鈕被換掉了（卡片收起來、畫面換了）：焦點接給下一個合理的地方。登出的確認框長在首頁裡，開出來焦點就在「登出」上，按 Esc 等於取消。
     不存、不傳：打的字只用 value／textContent 放進畫面。 */
  var dwbSeq = 0;
  var DWB_FINE_BIND = "碼 10 分鐘內有效、只能用一次；錯 5 次鎖 1 小時；最多綁 3 處。\n這組碼只打在這裡，不要傳給任何人。";
  function dwbMake(getS, send) {
    var uid = ++dwbSeq, ui = { scr: "", sig: {}, psig: {}, copy: null, ask: 0 }, B = null, C = null;
    var root = el("div", { class: "dwb", tabindex: "-1", role: "region", "aria-label": "練習用的瀏覽器：開發者網頁。這是手機或電腦的瀏覽器裡開的網頁，不是 LINE 聊天室" });
    var devsEl = el("div", { class: "dwb-devs", role: "group", "aria-label": "選一台裝置：每一台是不同的瀏覽器，各自記著自己的東西" });
    var opensEl = el("div", { class: "dwb-opens", role: "group", "aria-label": "在這一台打開網頁" });
    var idle = el("div", { class: "dwb-idle" });
    var urlTxt = el("span", { class: "dwb-urlt" });
    var pg = el("div", { class: "dwb-pg" });
    var ctl = el("div", { class: "dwb-ctl", role: "group", "aria-label": "練習專用的按鈕：時間往後撥、網頁看不看得到、GitHub 上有沒有 cfg.js" });
    var facts = el("dl", { class: "dwb-facts", "aria-label": "練習專用：平常看不到的東西" });
    function btn(txt, cls, fk, fn, extra) {
      var a = { type: "button", class: cls, "data-fk": fk, text: txt }, k;
      if (extra) for (k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) a[k] = extra[k];
      return on(el("button", a), "click", fn);
    }
    function go(ev) { ui.copy = null; send(ev); }
    var rb = btn("↻ 重新整理", "dwb-cb", "reload", function() { go({ t: "dwb", w: "reload", a: "瀏覽器的「重新整理」" }); }, { "aria-label": "瀏覽器的重新整理：網頁整個重新載入" });
    var cb = btn("✕ 關掉網頁", "dwb-cb", "close", function() { go({ t: "dwb", w: "close", a: "「關掉網頁」" }); }, { "aria-label": "關掉這個網頁（瀏覽器的分頁關掉）" });
    var win = el("div", { class: "dwb-win" }, [el("div", { class: "dwb-chrome" }, [el("span", { class: "dwb-url" }, [el("span", { "aria-hidden": "true", text: "🔒" }), urlTxt]), rb, cb]), pg]);
    root.appendChild(el("div", { class: "dssh-h", text: "🌐 練習用的瀏覽器：開發者網頁" }));
    root.appendChild(el("p", { class: "dssh-p", text: "這是四台裝置的瀏覽器（手機的 LINE 裡面、辦公室電腦…）。每一台各自記著自己的東西、各自開自己的網頁；在網頁上做的事，聊天室不會多出訊息（只有 LINE 主動通知你的時候才會）。LINE 卡片上的「打開網頁」，會在你選的那一台打開。" }));
    root.appendChild(devsEl);
    root.appendChild(opensEl);
    root.appendChild(idle);
    root.appendChild(win);
    root.appendChild(ctl);
    root.appendChild(facts);

    function enter(scr) {
      if (ui.scr === scr) return false;
      ui.scr = scr; ui.psig = {}; ui.ask = 0; B = null; C = null;
      pg.textContent = "";
      return true;
    }
    function focusFk(fk) {
      var t = fk ? root.querySelector('[data-fk="' + fk + '"]') : null;
      if (!t) return false;
      try { t.focus({ preventScroll: true }); } catch (e) { return false; }
      return true;
    }
    /* 按的那顆按鈕被換掉了：焦點接給下一個合理的地方（代號畫面 → 驗證碼框；進了首頁 → 「查一支藥」；確認框收起來 → 「登出這台」），最後才是整個面板 */
    function restoreFocus(fk) {
      var alt, l, i;
      if (!fk) return;
      if (document.activeElement && document.activeElement !== document.body && root.contains(document.activeElement)) return;
      if (focusFk(fk)) return;
      alt = { pcopy: ["ver-in", "pbtn"], pnew: ["ver-in", "pbtn"], pbtn: ["ver-in", "role"], "ver-go": ["probe", "pbtn", "ver-in"], "ver-in": ["pbtn", "probe"], "bind-go": ["probe", "bind-in"], "bind-in": ["probe"], "out-yes": ["out", "probe", "role"], "out-no": ["out", "probe"], out: ["probe"], probe: ["out"], close: ["url"], reload: ["url"], vis: ["url"], role: ["pbtn", "ver-in"] };
      l = alt[fk] || [];
      for (i = 0; i < l.length; i++) if (focusFk(l[i])) return;
      try { root.focus({ preventScroll: true }); } catch (e) {}
    }
    /* 複製代號：練習專用，只是假裝——鍵上寫「已複製 ✓」，不會真的動使用者電腦的剪貼簿（真的網頁 pairCopy 是先用瀏覽器的剪貼簿、不給用就換老方法、都不行就請人長按上面的代號） */
    function doCopy() {
      var c = dwbView(getS()).code;
      if (!c) return;
      go({ t: "dwb", w: "copy", a: "網頁上的「複製代號」" });
      ui.copy = { code: c, ok: true };
      draw();
    }
    function typed(inp) { dwbTouch(getS().ops.web, inp.value); draw(); }

    /* ── 上面兩排：選裝置、在這一台打開網頁 ── */
    function devsDraw(v) {
      devsEl.textContent = "";
      v.devs.forEach(function(d) {
        var b = btn("", "dwb-dev" + (d.on ? " on" : ""), "dev-" + d.id, function() { go({ t: "dwb", w: "sel", v: d.id, a: "換成「" + d.name + "」" }); }, { "aria-pressed": d.on ? "true" : "false", "aria-label": d.name + "（" + d.lab + "）：" + d.brief });
        b.appendChild(el("b", { text: d.name }));
        b.appendChild(el("small", { text: d.lab + "・" + d.brief }));
        devsEl.appendChild(b);
      });
    }
    function opensDraw(v) {
      opensEl.textContent = "";
      opensEl.appendChild(el("span", { class: "dwb-ol", text: "在「" + v.name + "」打開網頁：" }));
      opensEl.appendChild(btn("⌨️ 直接打網址（沒帶連結）", "dwb-open", "url", function() { go({ t: "dwb", w: "url", a: "在「" + v.name + "」直接打網址" }); }));
      v.links.forEach(function(l) {
        var who = l.k === "dev" ? "開發者" : "藥師";
        opensEl.appendChild(btn("🔗 " + who + "連結 " + l.t + "（" + l.st + "）", "dwb-open", "lk-" + l.t, function() { go({ t: "dwb", w: "link", v: l.k + ":" + l.t, a: "LINE 給你的" + who + "連結 " + l.t }); }));
      });
      if (!v.links.length) opensEl.appendChild(el("span", { class: "dwb-onone", text: "（LINE 還沒給你連結：先在上面的聊天室打「開發者網頁」）" }));
    }

    /* ── 網頁的幾種畫面 ── */
    function noneDraw(v) {
      enter("none");
      if (ui.psig.none === v.msg) return;
      ui.psig.none = v.msg;
      pg.textContent = "";
      pg.appendChild(el("div", { class: "dwb-box" }, [el("p", { class: "dwb-nt", text: v.msg })]));
    }
    function bindDraw(v) {
      var fresh = enter("bind");
      if (fresh) {
        B = {};
        B.t = el("p", { class: "dwb-bt" });
        B.m = el("span", { class: "dwb-bm", role: "status" });
        B.in = on(on(on(el("input", { type: "text", class: "dwb-in", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "6", placeholder: "6 位數碼", "aria-label": "綁定碼（6 位數字）", "data-fk": "bind-in", autocapitalize: "off", spellcheck: "false", enterkeyhint: "go" }), "input", function() { typed(B.in); }), "change", function() { typed(B.in); }), "keydown", function(e) { if ((e.key === "Enter" || e.keyCode === 13) && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); submit(); } });
        B.go = btn("綁定", "dwb-bgo", "bind-go", function() { submit(); });
        pg.appendChild(el("div", { class: "dwb-box" }, [B.t, el("div", { class: "dwb-brow" }, [B.in, B.go]), B.m, el("small", { class: "dwb-fine", text: DWB_FINE_BIND })]));
      }
      function submit() { go({ t: "dwb", w: "bind", v: B.in.value, a: "網頁上的「綁定」（輸入框裡是「" + B.in.value + "」）" }); }
      B.t.textContent = v.head;
      B.m.textContent = v.bmsg;
      if (B.in.value !== v.bval) B.in.value = v.bval;
    }
    function pairDraw(v) {
      var box = C.pair, lab, meta;
      box.textContent = "";
      if (v.role) box.appendChild(el("div", { class: "dwb-prole", text: "🛠 開發者登入" }));
      if (v.note) box.appendChild(el("div", { class: "dwb-pnote", role: "status", text: v.note }));
      if (v.pst === "live") {
        lab = ui.copy && ui.copy.code === v.code ? "已複製 ✓" : "複製代號";
        box.appendChild(el("div", { class: "dwb-pst", role: "status" }, ["① 打開 LINE 補藥神器（一對一，不是群組），把這組", el("b", { text: v.dev ? "開發者代號" : "代號" }), v.dev ? "打" : "貼", "進去"]));
        box.appendChild(el("div", { class: "dwb-pcode" + (v.dev ? " num" : ""), role: "img", "aria-label": (v.dev ? "開發者代號 " : "代號 ") + v.code.split("").join(" "), text: v.shown }));
        box.appendChild(btn(lab, "dwb-pcopy", "pcopy", doCopy));
        meta = el("div", { class: "dwb-pmeta" }, [v.dev ? null : "英文大小寫都可以", v.dev ? null : el("br"), "請在 ", el("b", { class: v.low ? "low" : "", text: v.cd }), " 內完成登入", el("span", { text: v.auto }), el("br"), "這台：" + v.lab + "　·　",
          btn("重新取得代號", "dwb-plink", "pnew", function() { go({ t: "dwb", w: "new", a: "網頁上的「重新取得代號」" }); })]);
        box.appendChild(meta);
        box.appendChild(el("div", { class: "dwb-pfake", text: "（練習的倒數不會自己走：按下面的「時間往後撥」才會變）" }));
      } else {
        box.appendChild(el("div", { class: "dwb-pst", role: "status", text: v.l1 }));
        box.appendChild(el("div", { class: "dwb-pcode gone", text: v.l2 }));
        if (v.extra) box.appendChild(el("div", { class: "dwb-pst", text: v.extra }));
        box.appendChild(btn(v.btn, "dwb-pbtn", "pbtn", function() { go({ t: "dwb", w: "new", a: "網頁上的「" + v.btn + "」" }); }));
      }
    }
    function codeDraw(v) {
      var fresh = enter("code"), psg, d;
      function submit() {
        var dd = dwbDecode(C.in.value);
        if (dd.code) go({ t: "dwb", w: "login", v: C.in.value, a: "網頁上的「登入」（驗證碼 " + dd.code + "）" });
      }
      if (fresh) {
        C = {};
        C.head = el("div", { class: "dwb-cdh" });
        C.pair = el("div", { class: "dwb-pair", id: "dwbp" + uid });
        C.in = on(on(on(el("input", { type: "text", class: "dwb-in", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "24", placeholder: "LINE 給你的 6 位數", "aria-label": "驗證碼（6 位數）", "data-fk": "ver-in", autocapitalize: "off", autocorrect: "off", spellcheck: "false", enterkeyhint: "go" }), "input", function() { typed(C.in); }), "change", function() { typed(C.in); }), "keydown", function(e) { if ((e.key === "Enter" || e.keyCode === 13) && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); submit(); } });
        C.hint = el("div", { class: "dwb-cdhint", "aria-live": "polite" });
        C.go = btn("登入", "dwb-cdgo", "ver-go", function() { submit(); });
        C.m = el("span", { class: "dwb-bm", role: "status" });
        C.in.setAttribute("aria-describedby", "dwbh" + uid);
        C.hint.id = "dwbh" + uid;
        C.ver = el("div", { class: "dwb-ver" }, [el("div", { class: "dwb-pst2" }, ["② LINE 會回你 6 位數的", el("b", { text: "驗證碼" }), "，打在這裡"]), C.in, C.hint, C.go, C.m]);
        C.role = btn("", "dwb-plink dwb-rolebtn", "role", function() { go({ t: "dwb", w: "role", v: dwbView(getS()).role ? "" : "dev", a: "網頁最下面的小字「" + C.role.textContent + "」" }); });
        pg.appendChild(el("div", { class: "dwb-box dwb-codebox" }, [C.head, C.pair, C.ver, el("small", { class: "dwb-fine", text: DWB_P.foot }), el("div", { class: "dwb-cdrole" }, [C.role])]));
      }
      C.head.textContent = v.head;
      C.role.textContent = v.role ? "← 回藥師登入" : "開發者登入";
      psg = JSON.stringify([v.role, v.note, v.pst, v.shown, v.cd, v.low, v.auto, v.l1, v.l2, v.extra, v.btn, v.lab, ui.copy]);
      if (psg !== ui.psig.pair) { pairDraw(v); ui.psig.pair = psg; }
      C.ver.hidden = v.pst !== "live";
      if (v.pst === "live") {
        if (C.in.value !== v.cval) C.in.value = v.cval;
        d = dwbDecode(C.in.value);
        C.hint.textContent = d.hint;
        C.go.disabled = !d.code;
        C.m.className = "dwb-bm" + (v.cwait ? " wait" : "");
        C.m.textContent = v.cmsg;
      } else { C.m.textContent = ""; C.hint.textContent = ""; C.go.disabled = true; if (C.in.value) C.in.value = ""; }
    }
    function homeDraw(v) {
      var fresh = enter("home"), sg = JSON.stringify([v.dev, v.bound, v.ask, v.probe]), hadAsk = ui.ask, hint, lo, ask;
      if (!fresh && sg === ui.psig.home) return;
      ui.psig.home = sg; ui.ask = v.ask;
      pg.textContent = "";
      hint = el("p", { class: "dwb-hint" });
      if (v.bound) hint.textContent = v.bmsgOk;
      else DWB_P.hint0.forEach(function(h, i) { hint.appendChild(el("span", { text: h })); if (i < DWB_P.hint0.length - 1) hint.appendChild(document.createTextNode(" ")); });
      pg.appendChild(el("div", { class: "dwb-home" }, [
        el("div", { class: "dwb-hh" }, [el("span", { class: "dwb-logo", "aria-hidden": "true", text: "💊" }), el("div", { class: "dwb-ht" }, [el("b", { text: "補藥神器" }), v.dev ? el("span", { class: "dwb-devtag", text: "開發者版" }) : null])]),
        el("div", { class: "dwb-sbox", "aria-hidden": "true", text: "輸入 CODE、藥名、中文或位置，再按 Enter 鍵查詢　🎤　📷" }),
        hint,
        el("div", { class: "dwb-probe" }, [
          btn("🔎 練習：向後端查一支藥", "dwb-pb", "probe", function() { go({ t: "dwb", w: "probe", a: "首頁查一支藥（向後端問一次）" }); }),
          v.probe === "ok" ? el("span", { class: "dwb-pok", role: "status", text: "✅ 後端照常回結果" }) : null
        ]),
        el("p", { class: "dwb-pfake", text: "（練習的首頁只畫了最上面一小塊：公告、所有藥品的清單省略。「查一支藥」是為了看這一台還進不進得去——鑰匙被換掉、被移出綁定名單，網頁自己不知道，要等下一次問後端才會發現。）" })
      ]));
      lo = el("div", { class: "dwb-lo" }, [btn("登出這台", "dwb-plink", "out", function() { go({ t: "dwb", w: "outAsk", a: "首頁最下面的「登出這台」" }); })]);
      pg.querySelector(".dwb-home").appendChild(lo);
      if (v.ask) {
        ask = el("div", { class: "dwb-ask", role: "group", "aria-label": "登出這台？" }, [
          el("b", { text: "登出這台？" }),
          el("p", { text: (v.dev ? "這台會從開發者版的綁定名單拿掉（名額還回去）。" : "這台會把登入忘掉。") + "\n之後要再用：直接打網址會出現代號，照畫面上的步驟登入；或從 LINE 的「🌐 補藥神器網頁」按鈕開。" }),
          el("div", { class: "dwb-row" }, [
            btn("登出", "dwb-y", "out-yes", function() { go({ t: "dwb", w: "outYes", a: "登出確認框的「登出」" }); }),
            btn("取消", "dwb-sk", "out-no", function() { go({ t: "dwb", w: "outNo", a: "登出確認框的「取消」" }); })
          ])
        ]);
        on(ask, "keydown", function(e) { if (e.key === "Escape" || e.keyCode === 27) { e.preventDefault(); e.stopPropagation(); go({ t: "dwb", w: "outNo", a: "登出確認框的「取消」（按 Esc）" }); } });
        pg.querySelector(".dwb-home").appendChild(ask);
        if (!hadAsk) focusFk("out-yes");
      }
    }
    /* ── 下面：練習專用的按鈕、平常看不到的東西 ── */
    function ctlDraw(v) {
      var sg = JSON.stringify([v.clock, v.live, v.vis, v.cfg, v.open, v.times]), row, row2;
      if (sg === ui.sig.ctl) return;
      ui.sig.ctl = sg;
      ctl.textContent = "";
      ctl.appendChild(el("div", { class: "dwb-cl", text: "練習專用的按鈕（真的瀏覽器沒有這些）。現在是 " + v.clock + "，練習的時鐘不會自己走，要按這排才會往後走：" }));
      row = el("div", { class: "dwb-trow", role: "group", "aria-label": "時間往後撥" });
      v.times.forEach(function(t) { row.appendChild(btn("⏰ 過 " + t.l, "dwb-tb", "t-" + t.v, function() { go({ t: "dwb", w: "time", v: t.v, a: "時間往後撥 " + t.l }); })); });
      if (v.live) row.appendChild(btn("⏩ 撥到倒數剩 20 秒", "dwb-tb", "t-low", function() { go({ t: "dwb", w: "time", v: "low", a: "時間撥到倒數剩 20 秒" }); }));
      ctl.appendChild(row);
      row2 = el("div", { class: "dwb-trow", role: "group", "aria-label": "網頁看不看得到、GitHub 上的 cfg.js" });
      row2.appendChild(btn(v.vis ? "🙈 把這一台的網頁藏起來（切去 LINE、螢幕關了）" : "👀 回到這一台的網頁", "dwb-tb", "vis", function() { go({ t: "dwb", w: "vis", v: v.vis ? 0 : 1, a: v.vis ? "把「" + v.name + "」的網頁藏起來" : "回到「" + v.name + "」的網頁" }); }, v.open ? null : { disabled: true }));
      row2.appendChild(btn("📄 GitHub 上有放 cfg.js：" + (v.cfg ? "有" : "沒有"), "dwb-tb", "cfg", function() { go({ t: "dwb", w: "cfg", v: v.cfg ? 0 : 1, a: "假裝 GitHub 上" + (v.cfg ? "拿掉" : "放了") + " cfg.js" }); }, { "aria-pressed": v.cfg ? "true" : "false" }));
      ctl.appendChild(row2);
    }
    function factsDraw(v) {
      var sg = JSON.stringify(v.facts);
      if (sg === ui.sig.facts) return;
      ui.sig.facts = sg;
      facts.textContent = "";
      facts.appendChild(el("div", { class: "dwb-fh", text: "平常看不到的東西（練習專用，現在後台是這個樣子）：" }));
      v.facts.forEach(function(f) { facts.appendChild(el("dt", { text: f[0] })); facts.appendChild(el("dd", { text: f[1] })); });
    }
    function draw() {
      var S = getS(), v = dwbView(S), act = document.activeElement, fk = "", sg;
      if (act && act !== document.body && root.contains(act) && act.getAttribute) fk = act.getAttribute("data-fk") || "";
      sg = JSON.stringify(v.devs); if (sg !== ui.sig.devs) { devsDraw(v); ui.sig.devs = sg; }
      sg = JSON.stringify([v.name, v.links]); if (sg !== ui.sig.opens) { opensDraw(v); ui.sig.opens = sg; }
      idle.hidden = !!v.open;
      win.hidden = !v.open;
      if (!v.open) {
        idle.textContent = "🌐 「" + v.name + "」的瀏覽器現在沒有開著補藥神器的網頁。按上面的「⌨️ 直接打網址」，或按聊天室裡 LINE 卡片上的「打開網頁」。";
        ui.scr = ""; ui.psig = {}; pg.textContent = ""; B = null; C = null;
      } else {
        urlTxt.textContent = v.url;
        if (v.scr === "bind") bindDraw(v);
        else if (v.scr === "code") codeDraw(v);
        else if (v.scr === "home") homeDraw(v);
        else noneDraw(v);
      }
      ctlDraw(v);
      factsDraw(v);
      restoreFocus(fk);
    }
    function reset() {
      ui.scr = ""; ui.sig = {}; ui.psig = {}; ui.copy = null; ui.ask = 0; B = null; C = null;
      pg.textContent = "";
      draw();
    }
    return { el: root, draw: draw, reset: reset, panel: win };
  }

  var TM = "上午 9:41";   /* 示範聊天室裡每一則的時間（編的） */
  var WARN = "⚠️ AI 可能讀錯，請核對藥櫃標籤紙";   /* 照片、手寫查藥：真的 LINE 回覆最前面那一句（見 02 的 PHOTO_AI_WARN） */
  /* CODE 打錯、系統帶出「CODE 相近」的藥時，卡片前面先傳的那一句（字照 01_程式碼.gs 的 replyResults；「品項,」是半形逗號，跟真的一樣） */
  function codeWarn(kw) { return "⚠️ 找不到 CODE「" + kw + "」\n\n下面列出的是「CODE 相近」的品項,\n不是你輸入的那一個品項藥品。\n請務必核對藥櫃標籤紙再補藥 🙏"; }
  var N1 = "改包裝通知，示範：這品項藥品換包裝了，瓶身標籤顏色不一樣";
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
  var BAR = ["🌐 網頁", "📖 教學", "📢 藥品通知", "🛠 BUG", "👥 加入補藥神器", "🔧 開發者"];
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
  /* 「預覽」那一步機器人回的三樣：藥品卡片（還沒存，沒有「✏️ 修改」）、說明、輸入框上面的三顆。下一步按「✅ 存檔」之前，畫面上就是這三樣 */
  var PVTXT = "☝️ 存進去之後長這樣。\n\n沒問題的話按「✅ 存檔」（或打「存檔」）。\n要改哪一項：按「✏️ 回格子」（或打「回格子」）點那一格，或直接打「位置 K9」這樣。";
  function PVMSGS() { return [dc("90120"), bot(PVTXT), qr(["✅ 存檔", "✏️ 回格子", "取消"])]; }
  /* 改完位置（打 k9）之後機器人回的三樣：改前改後、換好的新卡片、輸入框上面第一顆「↩️ 復原 90101」。下一步按「↩️ 復原 90101」之前，畫面上就是這三樣 */
  function LOCDONE() { return [bot("✅ 90101　小藥庫位置\n　改前：K2\n　改後：K9"), dc("90101", { edit: 1, over: { loc: "K9" } }), undoQ("90101")]; }
  /* 點「公告類別」之後，輸入框上面的 5 種公告＋「🗑 移除公告」＋「取消」 */
  var NKQ = ["1 停止供貨", "2 改包裝通知", "3 製廠缺貨", "4 換廠", "5 給慢箋", "🗑 移除公告", "取消"];
  /* 「📝 一次改多項」那張卡：MEF0＝剛打開（還沒改）、MEF2＝打了「B …／C …」兩項之後（改過的兩列變綠色） */
  var MEFV = { brand: "TESTOLOL* 25MG TAB", zh: "測試洛爾錠 25 毫克", loc: "K2", feat: "白色圓形錠，一面有刻痕", gen: "TESTOLOL HCL", pic: "已有照片", nk: "", nm: "", old: "", abbr: "" };
  function MEF0() { return mefCard("90101", MEFV, {}); }
  function MEF2() { return mefCard("90101", gmix(gmix({}, MEFV), { zh: "測試洛爾錠 50 毫克", loc: "K9" }), { zh: "測試洛爾錠 25 毫克", loc: "K2" }, "✅ 90101 寫好了（2 項）\n・中文：測試洛爾錠 25 毫克 → 測試洛爾錠 50 毫克\n・小藥庫位置：K2 → K9"); }
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
  /* 逐筆確認每一步機器人回的畫面（下一步要按卡片上的鍵，畫面上先有這一張，手指才有地方按）：
     IMPOVM＝總覽卡；IMP1M＝第 1 筆；IMP2M＝第 1 筆寫入了、接著第 2 筆；IMP3M＝第 2 筆跳過了、接著第 3 筆；IMPDONE＝全部做完的完工報告 */
  function IMPOVM() { return [IMPOV(), qr(["開始逐筆確認", "取消"])]; }
  function IMP1M() { return [IMPR1(), impQ("add")]; }
  function IMP2M() { return [bot("✅ 第 1／3 筆 新增 90130　NEWTESTIN* 20MG TAB　已寫入"), IMPR2(), impQ("add")]; }
  function IMP3M() { return [bot("⏭ 第 2 筆 90131 跳過，留在待匯入。"), IMPR3(), impQ("upd")]; }
  function IMPDONE() { return [bot("🏁 批次 #0915-2 完成。\n　寫入 2 筆（新增 1、修改 1，共 7 格）\n　跳過 1 筆（留在待匯入）：90131\n　沒變 1 筆（已從待匯入清掉）\n　有問題 1 筆（待匯入裡紅底，CODE格的註解有原因）\n" + IMPTAIL), qr(["查一下 90101", "復原這一批", "健檢"])]; }
  /* ───── 第 4 課（日常維護）用的 ───── */
  var VERV = "v11.23";
  var VERTXT = "LINE 四個檔：全部 " + VERV + " ✅\n　01_藥師端_查詢.gs　" + VERV + "\n　02_藥師端_照片語音.gs　" + VERV + "\n　03_開發端_資料與指令.gs　" + VERV + "\n　04_開發端_維護工具.gs　" + VERV + "\n網頁專案：全部 " + VERV + " ✅\n　01_網頁_資料與查詢.gs　" + VERV + "\n　02_網頁_照片語音與修改.gs　" + VERV + "\nGitHub 網頁：v6 ✅（網頁打得開、版本對）";
  var CHKQ = ["📦 版本更新＋清快取", "🩺 開始體檢", "🚪 退出"];
  /* 按「🩺 體檢」之後機器人回的：說明＋輸入框上面三顆（下面三個示範要按其中一顆，畫面上先有這一則） */
  function CHKMENU() { return [bot("🩺 體檢　要做哪一個？\n・📦 版本更新＋清快取：先清快取（清掉馬上重建），再列 LINE 四個檔、網頁專案兩個檔的版本對不對，和 GitHub 網頁打不打得開（不測 AI，換完程式按一下就知道有沒有貼齊）；第一次會把程式自己寫的搬到使用者屬性\n・🩺 開始體檢：上面那些全部＋所有項目檢查一次（約 10～20 秒）"), qr(CHKQ)]; }
  var SPDQ = ["⌨️ 文字速度", "📷 照片速度", "🎤 語音速度", "🔬 速度 詳細", "🚪 退出"];
  /* 開發者指令的回覆（程式裡的 _devReply_）最後多兩行：空一行，再一行「⏱ 這一句花了幾秒（＋程式外幾秒）」——
     程式外＝LINE 送出到程式開始的空檔（Google 冷啟動、排隊）。a＝這一句花的秒數，b＝程式外 */
  function tl(a, b) { return "\n\n⏱ " + a + " 秒（＋程式外 " + b + " 秒）"; }
  /* ───── 第 5 課（進階指令）用的 ───── */
  /* 「👥 開發者」那一排的三顆；devgQ(skip)＝這一則是哪一個，那一顆就不放，最後固定是「🚪 退出」 */
  var DEVG3 = ["➕ 邀請開發者", "👥 開發者名單", "➖ 開發者移除"];
  function devgQ(skip) { return qr(DEVG3.filter(function(x) { return !skip || x.indexOf(skip) < 0; }).concat(["🚪 退出"])); }
  var DEVGMENU = "👥 開發者　要做哪一個？\n・➕ 邀請開發者：給一組 6 位數邀請碼（10 分鐘內有效、只能用一次）\n・👥 開發者名單：現在有誰、最近的異動\n・➖ 開發者移除：從名單挑一位移除（會先問一次）";
  /* 按「👥 開發者」之後的那一則（說明＋三顆）、按「➕ 邀請開發者」之後的那一則（邀請碼＋剩下兩顆）：下面幾個示範要按其中一顆，畫面上先有這一則 */
  function GMENU() { return [bot(DEVGMENU), devgQ("")]; }
  function INVMSG() { return [bot("🔑 邀請碼 482913\n10 分鐘內有效，只能用一次。\n\n把下面這句傳給對方，請他在補藥神器裡打：\n　開發者 碼 482913\n\n（他打完就是開發者了，您可以按「👥 開發者名單」確認。）\n\n⚠️ 只傳給你認識、要當開發者的人。補藥神器（LINE 或網頁）永遠不會叫你產生邀請碼、或把邀請碼傳給誰；有人這樣要求就是詐騙。"), devgQ("邀請")]; }
  var DEVLIST_TAIL = "\n\n移除：按「➖ 開發者移除」（或打「開發者 移除 2」，用上面的編號）\n邀請：按「➕ 邀請開發者」";
  var DEVLIST2 = "👥 開發者名單（2 位）\n\n1. 示範甲（您）\n　　（在編輯器加的，沒有紀錄）\n2. 示範乙\n　　09/15 10:20 加入・由 示範甲 邀請\n\n最近的異動：\n　09/15 10:20　加入　示範乙" + DEVLIST_TAIL;
  var DEVLIST1 = "👥 開發者名單（1 位）\n\n1. 示範甲（您）\n　　（在編輯器加的，沒有紀錄）\n\n最近的異動：\n　09/15 10:31　移除　示範乙\n　09/15 10:20　加入　示範乙" + DEVLIST_TAIL;
  var MAPASK = "🗺 90101 的平面圖\n\n現在：自動判斷（跟著小藥庫位置走）\n\n・「棧左」「棧中」「棧右」＝直接指定棧板哪一塊（按一下就好）\n・「平」＝其他櫃位，我再問您哪一櫃\n・「沒平」＝公藥那種，沒有平面圖\n・「自動」＝取消設定，跟著小藥庫位置自己判斷\n\n★ 設完**全院立刻生效**，藥師馬上看得到。";
  var MAPQ = ["棧左", "棧中", "棧右", "平", "沒平", "自動", "取消"];
  /* 之前指定過的藥，再點一次「🗺 平面圖」：第二行換成「現在設成：棧中」 */
  function MAPASK2(cur) { return MAPASK.replace("現在：自動判斷（跟著小藥庫位置走）", "現在設成：" + cur); }
  /* ───── 第 4 課（清單校對）用的 ───── */
  /* 您傳的「印出來的清單」照片：一張紙，上面一行一個品項（跟手寫紙條同一種畫法，只是說明文字寫「印出來的清單」） */
  function prn(lines) { return { w: "me", note: lines, what: "印出來的清單" }; }
  /* 清單校對的小按鈕（跟 08_匯入.gs 的 _lstQuick_ 同一排：前兩顆開網頁、中間「📍 位置查核」、後三顆打字）和「清單校對」那一則：
     用練習聊天室的引擎現算（_learn_dev_sim_lst.js 的 DSL_QCHIPS、dslMenuText；跟 08_匯入.gs 打 清單校對 那一段同一句），這裡只接上最後的 ⏱；n＝目前待審幾筆 */
  var LSTQ = DSL_QCHIPS.map(function(c) { return c[0]; });
  function LSTMENU(n) { return dslMenuText(n, 0) + tl("0.8", "0.2"); }
  var LSTSAME_TAIL = "\n\n待審總共 3 筆（3 天後自動清掉）。可以再傳下一張累積，或按「📋 待審清單」一筆一筆審。\n★ 一次要傳好幾張的話，按「📤 多張上傳」在網頁上一起送比較快。";
  var LSTONE = "📋 清單校對　這一張\n讀到 12 筆　一樣 9　不一樣 2　表上沒有 1\n4.8 秒　照片 312 KB　AI 1 趟\n\n這一張的差異（前 3 筆）：\n🟡 90101　位置：K2 → K3　✍️\n🟡 90105　商品名：TESTONIN* 100MG CAP → TESTONIN-PLUS* 50MG CAP\n🔵 90131　表上沒有（EXAMPLEX* 10MG TAB／B1）" + LSTSAME_TAIL;
  var LSTSHIFT = "📋 清單校對　這一張\n讀到 12 筆　一樣 3　不一樣 0　表上沒有 0\n5.1 秒　照片 298 KB　AI 1 趟\n\n🚫 這張整批擋下來了，一筆都沒進待審。\n對到 12 列，其中 9 列位置不一樣（超過一半）——\n這通常不是資料真的變了，是**紙彎了或斜了，位置那一欄整批對錯行**。\n請把紙壓平、正面拍，或一次只拍一欄，再傳一次。\n\n待審總共 0 筆（3 天後自動清掉）。可以再傳下一張累積，或按「📋 待審清單」一筆一筆審。\n★ 一次要傳好幾張的話，按「📤 多張上傳」在網頁上一起送比較快。";
  var LSTPAPER = ["K3　90101", "C3　90105", "B1　90131", "⋮"];
  /* 第 3 張：有幾行看不懂的紙（跟練習聊天室「清單 D」同一張，回的字也一模一樣） */
  var LSTPAPERD = ["水棧一　90109", "K2　9O104", "B7　90116", "⋮"];
  var LSTWARN = "📋 清單校對　這一張\n讀到 5 筆　一樣 3　不一樣 1　表上沒有 0\n4.6 秒　照片 305 KB　AI 1 趟\n⚠️ 有 1 行 code 讀不出來（沒拿去比對）：\n　9O104\tSAMPLESPOT* 20MG TAB\tK2\n\n⚠️ 有 1 列的位置在工作表1 從來沒出現過（沒拿去比對）：\n　90116 讀到位置「B7」（工作表1 沒有這個位置）\n\n🚫 有 1 列 code 可能讀錯（對到的是別支藥，沒進待審）：\n　90107 清單上是「TESTJELLY* 2% GEL」，但工作表1 的 90107 是「DEMOCARD* 10MG TAB」→ code 可能讀錯\n\n這一張的差異（前 1 筆）：\n🟡 90109　位置：水棧二 → 水棧一" + LSTSAME_TAIL.replace("3 筆", "1 筆");
  /* 審核頁的三張卡（_lst_page.html）：位置改了（手寫）、商品名改了、表上沒有 */
  var LSTD1 = { code: "90101", nm: "TESTOLOL* 25MG TAB", hand: 1, chg: [["位置", "K2", "K3"]] };
  var LSTD2 = { code: "90105", nm: "TESTONIN* 100MG CAP", chg: [["商品名", "TESTONIN* 100MG CAP", "TESTONIN-PLUS* 50MG CAP"]] };
  var LSTD3 = { code: "90131", nm: "EXAMPLEX* 10MG TAB", isNew: 1, v: [["商品名", "EXAMPLEX* 10MG TAB"], ["位置", "B1"], ["劑型", ""], ["中文名", ""], ["學名", ""]] };
  /* 三筆待審的審核頁：「📋 待審清單」那一段幾個示範共用的第一個畫面（要按第一筆的「✅ 寫進工作表1」、點「🔵 表上沒有」篩選，畫面上先要有這一頁，手指才有地方按） */
  function LSTPG3() {
    return lstPage({ nl: 3, ni: 0, f: 0, photo: "📷 第 1 張　09/15 10:12", items: [LSTD1, LSTD2, LSTD3], alt: "網頁畫面（清單校對的待審清單）：上面「待審 3 筆　待匯入分頁 0 筆」和四個篩選（全部、🟡 不一樣、🔵 表上沒有、✍️ 手寫改的），下面三張卡：90101 位置 K2 改成 K3（手寫改的）、90105 商品名改了、90131 工作表1 沒有這支藥；每張下面有「✅ 寫進工作表1」「❌ 不要」「⏭ 跳過」，最底下「✅ 全部寫進（3）」「🗑 全部刪除」" });
  }
  /* 待審有 3 筆時，打「清單校對」機器人回的：說明＋輸入框上面 6 顆（後三顆管待審清單和校對模式）。第 6 段「校對完」的三個示範，要按其中一顆，畫面上先有這一則 */
  function LSTMENU3() { return [bot(LSTMENU(3)), qr(LSTQ)]; }
  /* ───── 第 4 課後半（位置查核）用的 ─────
     這幾段示範的卡片、字、小按鈕，是練習聊天室的引擎（_learn_dev_sim_lck.js）在一個全新的練習世界裡，照使用者的動作一步一步走出來的
     （跟「換你打打看」是同一支程式；tools/learn_dev_sim_test.js 已經逐句對過真的 LINE），tools/learn_dev_line.js 再把同一串動作丟給真的 LINE 逐句比一次。
     LCK(steps, from, cap)：steps 每一步是 打的字（字串，或 { t: "text", v, n: 旁白 }）、{ t: "pb", v: postback 的字, n: 旁白 }（按卡片上的按鈕）、{ t: "img", v: 貨架照片代號, n: 旁白 }（傳照片），可以加 q: 1（這一步下面也畫小按鈕）；
     前 from 步只是先走過去（把世界帶到那個畫面），不收；後面每一步收它的聊天室節點（引擎的旁白「👆 點了…」換成 n；沒給 n 就拿掉）；
     最後一步下面接一排輸入框上面的小按鈕（cap＝那排上面的說明；只有「標準那排」的就不畫）。 */
  function LCK(steps, from, cap) {
    var S = dsNew("empty", true), out = [], bar = DS_BAR.map(function(c) { return c.l; }).join("|"), X, i, j, st, m, labs;
    S.ops.lstUi = 1;
    for (i = 0; i < steps.length; i++) {
      st = typeof steps[i] === "string" ? { t: "text", v: steps[i] } : steps[i];
      if (st.t === "code") {          /* 打 CODE 查藥：搜尋引擎要等課程資料載完才初始化，這裡不能直接跑；開發者查到的就是那支藥的卡片（dsCard＝練習室打 CODE 查到一支時回的那一張），標準那排小按鈕不畫 */
        if (st.n) out.push(st.n);
        out.push(me(st.v), dsCard(S, st.v));
        continue;
      }
      X = dsRun(S, { t: st.t, v: st.v, a: "x" });
      if (i < from) continue;
      if (st.t !== "pb" && st.n) out.push(st.n);
      for (j = 0; j < X.msgs.length; j++) {
        m = X.msgs[j];
        if (m.echo) { if (st.n) out.push(st.n); } else out.push(m);
      }
      labs = X.q ? X.q.map(function(c) { return c.l; }) : [];
      if (labs.length && (i === steps.length - 1 || st.q) && labs.join("|") !== bar) out.push(qr(labs, i === steps.length - 1 ? cap : st.cap));
    }
    return out;
  }
  var LCKP = ["清單校對", "位置查核"];                       /* 先進清單校對、再進位置查核 */
  var LCKB1 = LCKP.concat(["B1"]);                         /* 打 B1：工作表1 寫 B1 的五支藥，卡片上由上而下是這個順序（手指要按第幾個框，照這個數） */
  var B1C = ["90103", "90116", "90117", "90118", "90119"];
  /* 按卡片上某一支藥的打勾框、「修改」：旁白照 tools/learn_dev_line.js 認得的寫法，tap＝手指要按的那一格（卡片上第幾個 .lkt、.lkm） */
  function lckTick(code, key) { return { t: "pb", v: "lck=t|" + (key || "B1") + "|" + code, n: act("👆 點「" + code + "」左邊的打勾框", [".lkt", (key === "A3" ? ["90115"] : B1C).indexOf(code)]) }; }
  function lckMod(code, noN) { var o = { t: "pb", v: "lck=m|B1|" + code }; if (!noN) o.n = act("👆 按「" + code + "」右邊的「修改」", [".lkm", B1C.indexOf(code)]); return o; }
  /* 位置查核網頁分頁（lstLcPage）的 B1 那幾列：跟 B1 那一格的卡片同一批藥、同一個順序（從引擎查）；ov＝{ 代號: { tick, moved, ed } } 改其中幾列的樣子 */
  function LCW_ROWS(ov) {
    var S = dsNew("empty", true), cur = dskRowsAt(S, "B1"), out = [], i, e;
    ov = ov || {};
    for (i = 0; i < cur.length; i++) {
      e = cur[i];
      out.push(gmix({ code: e.code, brand: e.r.b, zh: e.r.z, form: e.r.f, ph: e.r.ph, water: e.r.w }, ov[e.code]));
    }
    return out;
  }
  function LCW_K3() { return "K3（" + dskRowsAt(dsNew("empty", true), "K3").length + " 支）"; }   /* 網頁下拉選單上，K3 旁邊寫有幾支藥 */
  function lckPick(loc) { return { t: "pb", v: "lck=s|B1|90116|" + loc, n: act("👆 點「" + loc + "」") }; }
  /* ───── 第 7 課（開發者網頁）用的 ───── */
  var CFGTXT = "📄 只做一次：讓「直接打網址」也能用代號登入\n\n1. 開 GitHub 放網頁的那個專案 → Add file → Create new file\n2. 檔名打 cfg.js\n3. 內容貼下一則訊息那一行（整行複製）\n4. Commit changes\n5. 等 1～10 分鐘，回 LINE 打「健檢」（或「版本更新」）：「GitHub 網頁」那一行後面會多一句「cfg.js ✅（後端代號 demo01）」。沒出現的話，檢查檔名是不是剛好 cfg.js、有沒有跟 index.html 放在同一層（不能放進資料夾裡）\n\n這一行只寫「後端在哪」，不是鑰匙：沒有 LINE 給的驗證碼進不去。\n⚠️ 但 GitHub 上的檔案是公開的，等於把後端網址公開了：陌生人拿它看不到任何藥品資料，也拿不到驗證碼（沒有人在 LINE 打他的代號），只能不斷向後端「拿代號」，把額度（10 分鐘 30 次）用光，讓這條路暫時說「忙線」（LINE 的連結、已經登入的瀏覽器不受影響）。有人這樣做你會收到警示信；想先關掉就在 LINE 打「驗證碼登入 關」。\n不想公開就不要放：沒有 cfg.js 的話，每台瀏覽器第一次要先從 LINE 的「🌐 補藥神器網頁」按鈕開一次，之後這台直接打網址就會出現代號。\n（後端代號 demo01）";
  var CFGLINE = "window.BUYAO_X=\"AKfycbxDEMODEMODEMODEMODEMODEMODEMODEMODEMOdemo01\";";
  var CODEOFF = "⏸ 「驗證碼登入」已關閉（全院，立刻生效）：\n・網頁拿不到代號，LINE 打代號也不會發驗證碼（都會說「暫停了」）。\n・已經發出去、還沒用掉的驗證碼，網頁也兌換不了。\n・LINE 連結（🌐 補藥神器網頁）和已經登入的瀏覽器不受影響。\n\n打「驗證碼登入 開」恢復。";
  var PARTS = {
    code: { n: "CODE", t: "卡片最上面的大數字。打它查得最準，不會抓到別的品項藥品；紙條上有寫 CODE 就直接打，一個字都不用多打。" },
    brand: { n: "商品名", t: "大數字下面第一行，是藥盒上印的英文名。打前面幾個字就查得到。" },
    zh: { n: "中文名", t: "商品名下面那一行（綠色）。想不起英文名的時候，打中文名一樣查得到。" },
    icon: { n: "圖示", t: "右上角的小圖示：藥丸＝錠劑類、水滴＝水劑類，一眼看出是吃的還是喝的。部分藥的圖示點一下會開院內的藥品網頁（有設定的才有）。" },
    gen: { n: "學名", t: "灰色小字是成分。同成分不同廠牌、不同劑量，打學名就找得到；想不起商品名的時候，用成分找最快。" },
    feat: { n: "藥品特徵", t: "藍色那一塊是外觀特徵（顏色、形狀、刻字）。拿藥前對一下，最不會拿錯。有填才會出現；水劑類的特徵會放在照片的上面。" },
    ind: { n: "適應症", t: "灰底框裡左邊是適應症，也就是這品項藥品是治什麼的。有填才會出現。" },
    photo: { n: "藥品照片", t: "灰底框裡右邊的小圖是藥品照片，點一下看大圖。拿藥前對一下顏色、字樣；照片不對請按「🛠 BUG」。" },
    loc: { n: "位置", t: "粉紅色的框是「去哪裡拿」。也可以直接打位置（例如「K2」），那一格的藥會整批列出來。一個品項藥品放在好幾個地方的時候，這裡會變成幾顆按鍵（下一課最後一段）。" },
    map: { n: "平面圖", t: "位置右邊的小圖是那一區的平面圖，紅框就是這品項藥品放的那一格。點一下會再傳一張大圖。有平面圖的位置才會出現；怎麼看，下一課有詳細說明。" },
    fam: { n: "藥品家族", t: "紫色的框是「藥品家族」：院內同成分的其他藥（換劑量、換劑型、換廠牌）。平常收起來，一類一行；按「▸ 打開」會再傳一張卡片，家族全部攤開（第 8 課）。有同成分的藥才會出現。" }
  };
  var PLANP = {
    hit: { n: "紅框", t: "紅框是這品項藥品放的那一格。看圖的時候，先找紅框；其他的方塊都只是幫你認路的地標。" },
    b: { n: "藍色方塊", t: "藍色方塊是棧板（圖上寫「棧」）：放在地上的一塊一塊。看紅框在哪一塊旁邊，就知道要往哪裡找。" },
    bar: { n: "灰色長條", t: "灰色長條是一整排的區域，上面寫 L 2、L 3 這種字，也是很好用的地標。**L 3** 是第三線（奇數線）、**L 2** 是第二線（偶數線）、**L 1** 是第一線（兒線）。" },
    door: { n: "大門", t: "圖上寫著「大門」和一個箭頭，指的就是**大門處或是出入口**在這張圖的哪一邊。下一段教你用它來對方向。" }
  };
  /* 「大門處或是出入口在你哪一邊」：它在你的左手邊、前面、右手邊時，這張示範圖（圖上的「大門」在左邊）要怎麼轉、轉好後紅框在哪一側。（不示範「後面」：選項、地圖旁的字都拿掉了）
     deg＝順時針轉幾度；tn＝怎麼講；d＝大門處或是出入口在藥局的哪一邊（f 前、r 右、l 左）；red＝轉好後紅框在圖的哪一邊（也是藥局的哪一側） */
  var TURNS = [
    { d: "l", l: "左手邊", deg: 0, tn: "不用轉", red: "f", say: "大門處或是出入口在你**左手邊** → 這張圖的「大門」本來就在左邊，**不用轉**。**紅框在圖的上面**，就是藥局**前面**那一側。" },
    { d: "f", l: "前面", deg: 90, tn: "往右轉一格（90 度）", red: "r", say: "大門處或是出入口在你**前面** → 把圖**往右轉一格**（90 度），讓圖上的「大門」跑到上面。轉好後，**紅框在圖的右邊**，就是藥局**右手邊**那一側。" },
    { d: "r", l: "右手邊", deg: 180, tn: "轉半圈（180 度）", red: "b", say: "大門處或是出入口在你**右手邊** → 把圖**轉半圈**（180 度），讓圖上的「大門」跑到右邊。轉好後，**紅框在圖的下面**，就是藥局**後面**那一側。" }
  ];
  /* 怎麼操作這份教學（目錄頁最上面的「怎麼用這份教學」和「釘住的按鈕」那一課共用）。教學是 LINE 內建瀏覽器打開的網頁，不是聊天室 */
  var HOW = [
    { b: "點一課，進去學", s: "目錄一課一列，點哪一課都可以；學過的課前面會打 ✓。" },
    { b: "往下捲，看示範", s: "灰底的「示範區」捲到就會自己示範一遍；想自己玩，點裡面的選項就換你操作；按「重播 ↺」會從頭再自動示範一遍。" },
    { b: "學完按「下一課 ›」", s: "「‹ 上一課」「下一課 ›」固定在最下面；點最上面的課名，可以跳到任何一課。" },
    { b: "要回聊天室", s: "按左上角的「關閉」（叉叉）或「返回」；Android 也可以按手機的返回鍵。學到哪裡，這支手機都記得。" }
  ];
  var HOW_SCENES = [{ pg: "toc", hot: "row" }, { pg: "lesson", hot: "stage" }, { pg: "lesson", hot: "next" }, { pg: "lesson", hot: "close" }];   /* 上面 4 個動作，各配一張 LINE 內建瀏覽器的畫面（圈起來的是要點的那一塊） */
  var QCHIPS = [
    { k: "web", t: "🌐 網頁", n: "**🌐 網頁**：直接開補藥神器網頁版（不是幫你打字）。" },
    { k: "guide", t: "📖 教學", n: "**📖 教學**：幫你打「教學」，就是回到這一份教學。" },
    { k: "notice", t: "📢 藥品通知", n: "**📢 藥品通知**：幫你打「公告」，一次看完停止供貨、改包裝、缺貨的通知。" },
    { k: "bug", t: "🛠 BUG", n: "**🛠 BUG**：幫你打「bug」；再照提示，連「bug」一起打、後面寫一句話回報問題。" },
    { k: "join", t: "👥 加入補藥神器", n: "**👥 加入補藥神器**：幫你打「加入補藥神器」；機器人會傳一張 QR，請同事用 LINE 掃，就能加入（最後面那一顆，手機上要往左滑、電腦要拉按鈕下面的捲軸才看得到）。" }
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
          { l: "預覽", m: wizMsgs(7).concat([act("👆 按「👀 預覽、存檔」"), me("👀 預覽、存檔")], PVMSGS()),
            n: "預覽的卡片**沒有「✏️ 修改」**，因為還沒存。要改哪一項，按「✏️ 回格子」，或直接打「位置 K9」這樣。" },
          { l: "還沒填完就打「預覽」", m: [me("預覽"), bot("還有必填的沒填：位置、中文名"), wizCard({ code: "90120", brand: "NEWTESTIN* 10MG TAB", form: "錠劑" }, "loc"), wq("loc")],
            n: "必填還沒填完，機器人會說**差哪幾格**，再把格子給你。" },
          { l: "存檔", m: PVMSGS().concat([act("👆 按「✅ 存檔」"),
              bot("✅ 已新增 90120　NEWTESTIN* 10MG TAB\n（適應症／特徵也一起寫進「工作表2」了）\n\n現在打「90120」就查得到了。"),
              dc("90120", { edit: 1 }), undoQ("90120")]),
            n: "存檔之後，**馬上給你這支藥的卡片**（開發者的卡片最下面有「✏️ 修改」），輸入框上面第一顆是「↩️ 復原 90120」：建錯了，按它就把這一列清掉（第 2 課最後一段）。" }
        ] } },
      { t: "中途不做了，或打錯了", p: "填到一半不想做了，打「取消」（也可以打「不用了」「算了」「cancel」），**一個字都不會寫進去**。CODE 打得不像會被提醒；CODE 已經有了，會把那支藥的卡片給你看。**30 分鐘**沒有動作，這一筆就過期，要重打「新藥」。",
        d: { k: "chat", ttl: "選一種情況", list: true, ch: [
          { l: "取消", m: wizMsgs(1).concat([act("👆 按卡片上的「✕ 取消」"), me("取消"), bot("好，取消了，一個字都沒寫進去 👍")]),
            n: "取消就是取消，試算表**一個字都沒動**。" },
          { l: "CODE 打得不像", m: [me("ABC"), bot("「ABC」不太像 CODE 🤔\n院內的 CODE 通常是 4~6 位數字，例如 22975。\n再給我一次？（真的有非數字的 CODE，請直接在試算表上加）")].concat(wizMsgs(0)),
            n: "CODE 要有至少 3 個數字、不超過 10 個字。**真的有非數字的 CODE**，直接到試算表上加。" },
          { l: "CODE 已經有了", m: [me("90101"), bot("⚠️ CODE 90101 已經有了（工作表1 第 2 列），就是下面這張。\n・要改它的內容：點這張卡片的「✏️ 修改」（這一筆新增就取消）\n・要新增別支藥：改打別的 CODE（其他格都還在）"), dc("90101", { edit: 1 })].concat(wizMsgs(0)),
            n: "已經有的 CODE 不會被蓋掉：機器人把**現有的卡片**給你看。要改它，點卡片的「✏️ 修改」；要新增別支，改打別的 CODE，**其他格都還在**。" },
          { l: "必填不能跳過", m: [act("（CODE 已經填好了）"), me("跳過"), bot("「商品名」不能跳過 🙏\n商品名（英文）？\n　例：CURAM")].concat(wizMsgs(1)),
            n: "必填的格子打「跳過」會被擋下來，格子還在，繼續填就好。" },
          { l: "放太久（30 分鐘）", m: [act("⏰ 填到一半，離開超過 30 分鐘，回來按「✅ 存檔」"), bot("這一筆已經過期了 😥\n請重新打「新藥」開始。")],
            n: "過期的資料會自動清掉，重打「新藥」從頭來。" }
        ] } },
      { t: "換你打打看", p: "下面是一間**練習用的聊天室**：你是開發者，機器人照真的 LINE 程式回。打字、點輸入框上面的**小按鈕**、點**卡片上的格子**，都跟真的一樣；練習的試算表是編的，**什麼都不會真的寫**。先打「新藥」，填 CODE「90120」，一路填到「✅ 存檔」；再查一次 90120，看看是不是真的建好了。",
        d: { k: "dsim", ttl: "練習聊天室：新增一支藥", ex: ["新藥", "90120", "90101"] },
        keys: ["**打「新藥」**出現 8 格，黃色是現在要填的那一格；**直接打字**就填黃色那一格，也可以點卡片上的格子改填那一格。", "**位置、劑型有小按鈕**；學名、適應症、特徵可以跳過。**「✅ 存檔」才真的寫**，存檔前隨時能取消。", "存檔之後，**馬上打 CODE 查得到**，卡片最下面有「✏️ 修改」，輸入框上面第一顆是「↩️ 復原」。"] }
    ], tryp: DEVTRY("新藥", "會回到 LINE 聊天室，已經幫你填好「新藥」，按送出就會出現格子；不想建就按「取消」，什麼都不會寫進去。"),
    recap: ["**打「新藥」**出現 8 格的卡片：黃色是現在要填的那一格，**直接打字**就是填黃色那一格。", "**位置、劑型有小按鈕**，點一下就填好；學名、適應症、特徵可以**跳過**；想改哪一格就點那一格，或一次貼好幾行。", "必填填完按「👀 預覽、存檔」，看過卡片再按 **「✅ 存檔」才真的寫進試算表**；建錯了，存檔那一則下面有「↩️ 復原」。"] },

    { id: "devedit", ch: 0, name: "改一格（✏️ 修改）", secs: [
      { t: "點卡片下面的「✏️ 修改」", p: "開發者查到藥，卡片最下面會多一顆淺綠色的「✏️ 修改」（藥師看不到）。按它，出現一張選單：**18 個欄位**，點你要改的那一格。不用打 CODE，也不用打欄位名。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "點「✏️ 修改」", m: [me("90101"), dc("90101", { edit: 1 }), act("👆 點卡片最下面的「✏️ 修改」"), editMenuCard("90101")],
            n: "選單最上面是這支藥的名字；**最上面那顆「📝 一次改多項」**留到最後一段講。要換照片、改平面圖、改縮寫，也都在這 18 顆裡。" },
          { l: "這支藥掛著公告", m: [dc("90106", { edit: 1, note: "停止供貨，示範：預計下個月恢復供貨，這段時間先找替代藥" }), act("👆 點 90106 那張卡片下面的「✏️ 修改」"), editMenuCard("90106", "停止供貨，示範：預計下個月恢復供貨，這段時間先找替代藥")],
            n: "有掛公告的藥，選單上會多一個黃色的「目前的公告」框，改之前先看一眼現在掛的是什麼。" }
        ] } },
      { t: "位置、劑型：點按鈕選", p: "多數欄位按下去就直接打新內容；**小藥庫位置**和**劑型**例外：機器人先告訴你「現在是什麼」，輸入框上面有常用的選項，點一個就改好了。位置一律存成**半形大寫**（打 k9 會變成 K9）。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "改位置", m: [editMenuCard("90101"), act("👆 在選單點「小藥庫位置」"), bot("✏️ 90101　小藥庫位置\n\n現在是：K2\n\n請直接打新的內容送出就好。"), qr(LOCQ.concat(["🗑 清空這一欄", "取消"])), act("⌨️ 打「k9」送出"), me("k9")].concat(LOCDONE()),
            n: "打小寫 k9 也行，會自動轉成 **K9**。改完**馬上給你新的卡片**，位置已經換了；輸入框上面第一顆是「↩️ 復原 90101」。" },
          { l: "不改了：取消", m: [editMenuCard("90101"), act("👆 在選單點「劑型」"), bot("✏️ 90101　劑型\n\n現在是：錠劑\n\n請直接打新的內容送出就好。"), qr(FORMQ.concat(["🗑 清空這一欄", "取消"])), act("👆 點「取消」"), me("取消"), bot("好，取消了，一個字都沒動 👍")],
            n: "不想改了就按「取消」，**一個字都沒動**。" }
        ] } },
      { t: "其他欄位：改幾個字就好", p: "點商品名、中文、藥品特徵、學名…這些欄位，手機的輸入框會**先填好「欄位名＋現在的內容」**，游標在後面，改要改的幾個字送出就好；機器人同時回一則「現在是：…」。電腦版 LINE 不會自動填，就自己打新內容（不用打欄位名）。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "改中文名", m: [editMenuCard("90101"), act("👆 點「中文」（輸入框先填好「中文 測試洛爾錠 25 毫克」）"), bot("✏️ 90101　中文\n\n現在是：測試洛爾錠 25 毫克\n\n請直接打新的內容送出就好。"), qr(["🗑 清空這一欄", "取消"]),
              act("⌨️ 把 25 改成 50 送出"), me("中文 測試洛爾錠 50 毫克"), bot("✅ 90101　中文\n　改前：測試洛爾錠 25 毫克\n　改後：測試洛爾錠 50 毫克"), dc("90101", { edit: 1, over: { z: "測試洛爾錠 50 毫克" } }), undoQ("90101")],
            n: "送出的字前面帶著「中文」也沒關係，機器人會自己拿掉，只留內容。" },
          { l: "藥品特徵（多行）", m: [editMenuCard("90101"), act("👆 點「藥品特徵」"), bot("✏️ 90101　藥品特徵\n\n現在是：白色圓形錠，一面有刻痕\n\n請直接打新的內容送出就好。\n一句一行：打一句送出，再按「↵ 再加一句」接著打下一句；一次打好幾行也可以。"), qr(["↵ 再加一句", "🗑 清空這一欄", "取消"]),
              act("⌨️ 打新的特徵送出"), me("藥品特徵 白色圓形錠，一面有刻痕，另一面刻 25"), bot("✅ 90101　藥品特徵\n　改前：白色圓形錠，一面有刻痕\n　改後：白色圓形錠，一面有刻痕，另一面刻 25"), dc("90101", { edit: 1, over: { feat: "白色圓形錠，一面有刻痕，另一面刻 25" } }), undoQ("90101", 1)],
            n: "**學名、藥品特徵、適應症、公告補充、曾用藥品、注意**可以好幾行：改完輸入框上面多一顆「↵ 再加一句」，按了再打一句，會接在最後面新的一行。" },
          { l: "清空一欄", m: [editMenuCard("90101"), act("👆 點「藥品特徵」，機器人回「現在是：…」"), act("⌨️ 打「清空」送出"), me("清空"), bot("✅ 90101　藥品特徵\n　改前：白色圓形錠，一面有刻痕\n　改後：（空）"), dc("90101", { edit: 1, over: { feat: "" } }), undoQ("90101", 1)],
            n: "打「清空」（或按「🗑 清空這一欄」）就把那一格清掉。**只送出欄位名、沒有內容**不會當成清空，機器人會先問一次。" }
        ] } },
      { t: "公告：按按鈕選 1～5", p: "點「公告類別」，機器人問要掛哪一種公告，輸入框上面有 5 種加「🗑 移除公告」。選完會再問要不要加一句補充說明（不用就按「取消（不加補充）」）。掛上之後，藥師查到這支藥，卡片名字下面就有黃色的提醒框。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "掛公告＋補充說明", m: [editMenuCard("90101"), act("👆 在選單點「公告類別」"), bot("📢 90101 要掛哪一種公告？\n\n點下面的按鈕就好。\n（掛完會再問您要不要加一句補充說明）"), qr(NKQ),
              act("👆 點「2 改包裝通知」"), me("2 改包裝通知"), bot("✅ 90101 已掛上「改包裝通知」\n\n要再加一句補充說明嗎？（例：新包裝 8/1 起）\n不用的話按「取消」，公告一樣掛好。"), qr(["取消（不加補充）", "🗑 清空補充"]),
              act("⌨️ 打補充說明送出"), me("新包裝 8/1 起"), bot("✅ 90101　公告補充說明\n　改前：（空）\n　改後：新包裝 8/1 起"), dc("90101", { edit: 1, note: "改包裝通知，新包裝 8/1 起" }), undoQ("90101", 1)],
            n: "掛好之後，卡片名字下面就有**黃色的提醒框**：「改包裝通知，新包裝 8/1 起」。" },
          { l: "只掛公告，不加補充", m: [act("（已經選了「2 改包裝通知」）"), bot("✅ 90101 已掛上「改包裝通知」\n\n要再加一句補充說明嗎？（例：新包裝 8/1 起）\n不用的話按「取消」，公告一樣掛好。"), qr(["取消（不加補充）", "🗑 清空補充"]), act("👆 點「取消（不加補充）」"), me("不用"), bot("✅ 90101　公告\n　改前：（無）\n　改後：2 改包裝通知"), dc("90101", { edit: 1, note: "改包裝通知" }), qr(BAR)],
            n: "不用補充說明，按「取消（不加補充）」，**公告一樣掛好**。這個情況下機器人**不會**再給「↩️ 復原」；掛錯了就再選一次公告類別，或用「移除公告」。" },
          { l: "移除公告", m: [editMenuCard("90101", "改包裝通知"), act("👆 在選單點「公告類別」"), bot("📢 90101 要掛哪一種公告？\n\n點下面的按鈕就好。\n（掛完會再問您要不要加一句補充說明）"), qr(NKQ), act("👆 點「🗑 移除公告」"), me("移除"), bot("✅ 90101　公告\n　改前：2\n　改後：（已移除）"), dc("90101", { edit: 1 }), undoQ("90101")],
            n: "公告結束了，點「🗑 移除公告」，**黃色提醒框就不見了**（補充說明和公告照片也一起拿掉）。" }
        ] } },
      { t: "📝 一次改多項", p: "選單最上面那顆「📝 一次改多項」會送出一張 **A～J 十列**的卡片：每一列右邊有「改」，按它輸入框會先填好；改完那一列變**綠色**，寫著「✅ 已寫進去」和「原本：…」。也可以直接打字：「A 新名字」（A＝商品名、B＝中文、C＝位置…），或一次貼好幾行。**每改一格就已經寫進試算表**，不用最後再按存。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "打開卡片", m: [editMenuCard("90101"), act("👆 在選單點「📝 一次改多項」"), MEF0()],
            n: "A～J 十列，每一列左邊是**代號**（A 商品名、B 中文、C 位置、D 藥品特徵、E 學名、F 藥品照片、G 公告類別、H 公告補充說明、I 曾用藥品、J 縮寫）。" },
          { l: "直接打好幾行", m: [act("（卡片開著的時候）"), me("B 測試洛爾錠 50 毫克\nC k9"), MEF2()],
            n: "打「代號 內容」，一次打好幾行都行。卡片上面會寫「寫好了（2 項）」和每一項的改前改後；改過的列變**綠色**，寫著「✅ 已寫進去」和「原本：…」。" },
          { l: "收工，看新卡片", m: [MEF2(), act("👆 按卡片最下面的「✅ 看新卡片」"), bot("✅ 90101 這一輪改了 2 項，都改好了。\n改錯了？按下面的「↩️ 復原 90101」（7 天內都可以）。"), dc("90101", { edit: 1, over: { z: "測試洛爾錠 50 毫克", loc: "K9" } }), undoQ("90101")],
            n: "這一輪改的**一次復原**：按「↩️ 復原 90101」就整輪改回去。" },
          { l: "公告（G 那一列）", m: [MEF0(), act("👆 按 G「公告類別」那一列的「改」", [".mefb", 5]), nkCard("90101", "")],
            n: "公告類別是**五顆按鈕**，按一顆就生效；現在掛著的那顆是綠底。補充說明在卡片上另外改。" }
        ] } },
      { t: "改錯了：↩️ 復原", p: "改完那一則的下面，有一顆「↩️ 復原 90101」。按它會**先列出**要改回哪幾格，按「確定復原」才動。過了這一則也沒關係：打「復原」可以選最近改過的（**7 天內**）；打「復原 90101」只還原那一支藥。新藥存檔、匯入、網頁上改的，都能這樣復原。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "按「↩️ 復原 90101」", m: LOCDONE().concat([act("👆 按輸入框上面的「↩️ 復原 90101」"), me("復原 #0915-104530123"),
              bot("↩️ 復原 批次 #0915-104530123：\n　會把 1 格改回舊值、清空 0 列（新增的那幾個品項）\n　90101　小藥庫位置：K9 → K2\n\n確定嗎？"), qr(["確定復原", "取消"]),
              act("👆 點「確定復原」"), me("確定復原 0915-104530123"), bot("↩️ 復原完成：改回 1 格、清空 0 列。\n快取已更新。")]),
            n: "「確定復原」才真的動。**後來又被別人改過的格子不會動**，機器人會告訴你哪幾格沒動。" },
          { l: "打「復原」選一批", m: [me("復原"), bot("↩️ 最近改過的（點一個看要還原什麼）：\n　#0915-104530123　09/15 10:45:30　90101　1 筆（LINE ✏️）\n　#0914-3　09/14 16:20:05　90102、90103 等 7 支　12 筆（匯入）\n\n也可以打「復原 CODE」只還原某一支藥。"), qr(["復原 #0915-104530123", "復原 #0914-3"])],
            n: "最多列最近 **5 批**；點一個，看它要還原什麼，再按「確定復原」。批次號的 **0914-3** 是匯入（月日-第幾批），**0915-104530123** 是在 LINE 上改的（月日-時分秒）。" }
        ] } },
      { t: "換你打打看", p: "下面是一間**練習用的聊天室**：你是開發者，機器人照真的 LINE 程式回。先打 **90101** 查出那支藥，點卡片最下面的「**✏️ 修改**」，再一個欄位一個欄位點點看：位置點按鈕選、中文名改幾個字、掛一個公告、試試「📝 一次改多項」。改完卡片馬上換成新的；改錯了，按輸入框上面第一顆「↩️ 復原」。練習的試算表是編的，**什麼都不會真的寫**。",
        d: { k: "dsim", ttl: "練習聊天室：✏️ 修改", ex: ["90101", "90102", "復原", "怎麼改"] },
        keys: ["**查到藥 → 卡片最下面的「✏️ 修改」 → 點欄位**：不用打 CODE，也不用打欄位名。位置、劑型點小按鈕；其他欄位手機會先把現在的內容填進輸入框，改幾個字送出。", "**改完馬上換成新的卡片**：「注意」是紅框、「曾用藥品」「適應症」「藥品特徵」在灰底框裡、公告是名字下面的黃框。", "**改錯了：輸入框上面第一顆「↩️ 復原」**，先列出要改回哪幾格，按「確定復原」才動；打「復原」可以選最近 5 批。"] }
    ], tryp: { kind: "code", p: "回 LINE，查一支真的藥，再點卡片最下面的「✏️ 修改」看選單。", label: "在 LINE 查一支真的藥", hint: "會回到 LINE 聊天室（這裡不會先幫你填字）；自己打一支真的藥的 CODE 送出，就會出現卡片。只看選單、不點欄位，不會改到任何資料。" },
    recap: ["**查到藥 → 卡片最下面的「✏️ 修改」→ 點欄位 → 直接打新內容**，不用打 CODE，也不用打欄位名。", "**位置、劑型**用輸入框上面的按鈕選；**公告**按 1～5；其他欄位手機會先填好現在的內容，改幾個字就好。", "每次改完**馬上給新卡片**，輸入框上面有「↩️ 復原」；要改五六欄（換廠）走「📝 一次改多項」。"] },

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
          { l: "「待匯入」有資料", m: [me("匯入")].concat(IMPOVM()),
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
          { l: "開始逐筆確認", m: IMPOVM().concat([act("👆 按總覽卡上的「開始逐筆確認（第 1／3）」"), me("開始逐筆確認")], IMP1M()),
            n: "第 1 筆是**新增**。位置 k2 被整理成 **K2**、劑型 F.C. TAB 被整理成 **錠劑**，灰字是你貼的、藍字是整理後的；劑型是猜的，所以多一行 ⚠️。輸入框上面是這一筆能做的事。" },
          { l: "按「對」", m: IMP1M().concat([act("👆 按「✅ 對，寫入」"), me("對")], IMP2M()),
            n: "按「對」才真的寫進工作表1，那一列也從「待匯入」拿掉；接著就是下一筆。第 2 筆的 ⚠️ 是商品名和中文名**擠在同一格被拆開**了，看一下拆得對不對。" },
          { l: "改一格", m: [act("（現在是第 1 筆，位置想改成 B1）")].concat(IMP1M(), [act("👆 按「✏️ 改一格」"), me("改一格"), bot("要改哪一格？點下面的按鈕。"), qr(["改 商品名", "改 中文名", "改 位置", "改 劑型", "改 學名", "改 參考網站", "不改了"]),
              act("👆 點「改 位置」"), me("改 位置"), bot("✏️ 第 1 筆 90130　位置\n現在是：K2\n\n請直接打新的內容（打「清空」就清空）。"), qr(LOCQ.slice(0, 6).concat(["清空這一格", "不改了"])),
              act("⌨️ 打「B1」送出"), me("B1"), bot("已改 位置 → B1，請再看一次："), IMPR1("B1"), impQ("add")]),
            n: "改完**馬上再給你看一次**這一張，這次位置是 B1，不再有灰字（你自己打的，就不算「整理過」）。劑型那行 ⚠️ 還在，因為還沒處理。" },
          { l: "跳過", m: [act("（現在是第 2 筆）")].concat(IMP2M(), [act("👆 按「⏭ 跳過（留在待匯入）」"), me("跳過")], IMP3M()),
            n: "跳過的那一列**原封不動留在「待匯入」**，下次打「匯入」會再出現。第 3 筆是**修改**：位置 K2 → K3，只列要改的那一格，所以輸入框上面也只有「改 位置」。" },
          { l: "先停", m: [act("（現在是第 3 筆；第 1 筆按了「對」、第 2 筆跳過）")].concat(IMP3M(), [act("👆 按「⏹ 先停（其餘留在待匯入）」"), me("先停"),
              bot("⏹ 先停在第 3 筆。\n　寫入 1 筆（新增 1、修改 0，共 6 格）\n　跳過 1 筆（留在待匯入）：90131\n　還沒看的 1 筆留在待匯入，之後再打「匯入」接著。\n　沒變 1 筆（已從待匯入清掉）\n　有問題 1 筆（待匯入裡紅底，CODE格的註解有原因）\n" + IMPTAIL), qr(["查一下 90130", "復原這一批", "健檢"])]),
            n: "先停就是「今天做到這裡」：寫了的算數，**沒看的、跳過的都還在待匯入**，之後再打「匯入」重新來一遍。" }
        ] } },
      { t: "做完那一則，改錯了可以復原", p: "最後一筆處理完，機器人回一則**完工報告**：寫了幾筆（新增幾、修改幾、共幾格）、跳過幾筆、有問題幾筆。寫進去的每一格都記在試算表的「**匯入紀錄**」分頁，**7 天內**可以整批或單筆還原。下面三顆小按鈕：「查一下 CODE」、「復原這一批」、「健檢」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "全部做完", m: [act("（現在是第 3 筆；第 1 筆按了「對」、第 2 筆跳過）")].concat(IMP3M(), [act("👆 按「✅ 對，寫入」"), me("對")], IMPDONE()),
            n: "最後一筆按「對」，機器人直接給完工報告（不再另外回「已寫入」）。快取馬上更新，**藥師下一句查就是新資料**。" },
          { l: "復原這一批", m: IMPDONE().concat([act("👆 按「復原這一批」"), me("復原 #0915-2"), bot("↩️ 復原 批次 #0915-2：\n　會把 1 格改回舊值、清空 1 列（新增的那幾個品項）\n　90101　位置：K3 → K2\n　清空 90130\n\n確定嗎？"), qr(["確定復原", "取消"]), act("👆 點「確定復原」"), me("確定復原 0915-2"), bot("↩️ 復原完成：改回 1 格、清空 1 列。\n快取已更新。")]),
            n: "「確定復原」才真的動。**新增的那支藥，整列清空**（不是刪列）；改過的格子，改回舊的值。後來又被別人改過的格子不會動。" }
        ] } },
      { t: "換你打打看", p: "下面是一間**練習用的聊天室**：你是開發者，機器人照真的 LINE 程式回；聊天室下面還有一張**練習用的「待匯入」分頁**，機器人讀的就是它。先打「**匯入**」看總覽，按「開始逐筆確認」，再一筆一筆按「對」「改一格」「跳過」；做完看一下分頁和工作表1 變成什麼樣子，最後打「**復原**」把這一批還原。想看別種情況，用分頁上面的按鈕**換一份貼進去的資料**（有問題的各種列、沒寫欄位名稱、亂寫的、空的）。練習的試算表是編的，**什麼都不會真的寫**。",
        d: { k: "dsim", ttl: "練習聊天室：批次匯入", ex: ["匯入", "90101", "復原"], sheet: 1 },
        keys: ["**打「匯入」**先出總覽，這時候什麼都還沒寫；「待匯入」裡沒變的列會被清掉，有問題的列會塗成紅底（CODE 那一格有註解寫原因）。", "**一筆一筆按「對」才寫入**；「改一格」只改這一筆的這一格，「跳過」「先停」的都原封不動留在待匯入。", "**做完有完工報告**，輸入框上面有「查一下 CODE」「復原這一批」；寫進去的每一格都記在「匯入紀錄」，7 天內打「復原」可以整批還原。"] }
    ], tryp: DEVTRY("匯入", "會回到 LINE 聊天室，已經幫你填好「匯入」，按送出。要是「待匯入」沒有資料，機器人只會告訴你分頁是空的；有資料的話，也要逐筆按「對」才會寫入，按「取消」整批都不寫（沒變的列會從待匯入清掉，有問題的列會塗紅底）。"),
    recap: ["**貼到「待匯入」分頁 → 打「匯入」**，先出總覽卡，這時候什麼都還沒寫。", "**沒變的列自動清掉，有問題的列塗紅底**，CODE 那一格的註解寫著原因，改好再匯入。", "**一筆一筆按「對」才寫入**；跳過、先停的都留在待匯入；做錯了 7 天內打「復原」。"] },

    { id: "devlist", ch: 0, name: "清單校對（拍位置清單）", secs: [
      { t: "📋 拍位置清單，只挑「不一樣」的", p: "院裡印出來的**藥品位置清單**（那種表格）換新版時，一支一支對工作表1 很累。**清單校對**：把清單拍下來（或截圖）傳給機器人，它用 **CODE 逐列去對工作表1**，**只把不一樣的挑出來**：位置變了、商品名變了、工作表1 沒有的新藥。你一筆一筆審，按「寫進工作表1」才會改，不用自己手打。打「**清單校對**」進入，或按 🔧 開發者 →「📋 清單校對」。進去之後有**三種**做法：前面四段是**拍清單**（📤 多張上傳、📷 一張一張）和審核；後面四段是 **📍 位置查核**——人站在貨架前，一格一格看藥是不是放對位置。",
        d: { k: "chat", ttl: "打「清單校對」", ch: [
          { l: "打「清單校對」", m: [me("清單校對"), bot(LSTMENU(0)), qr(LSTQ, "輸入框上面會出現這幾顆（前兩顆是開網頁、第三顆是去貨架查位置）")],
            n: "進入之後的 **30 分鐘內**，你傳的照片**一律走校對**，就算「OCR接手」開著也不會出藥品卡片。前兩顆小按鈕是**開網頁**：用的是你的開發者連結，只在綁定過的地方打得開（還沒綁定，看「開發者網頁」那一課）；第三顆「**📍 位置查核**」是去貨架查位置（看後面的段落）。" }
        ] } },
      { t: "📷 一張一張傳：它回你「這一張」的結果", p: "直接在聊天室傳清單的照片，機器人讀完回一則：**讀到幾筆、一樣幾筆、不一樣幾筆、表上沒有幾筆**，再列出前 5 筆差異：**🟡** 是工作表1 有、但位置或商品名不一樣，**🔵** 是工作表1 沒有這個 CODE；後面的 ✍️ 是**清單上用紅筆手改的**。差異都先存進**待審清單**（3 天後自動清掉），可以接著傳下一張累積。**一次拍一欄，比整張兩欄準。**",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "一般的一張", m: [act("📷 傳一張清單的照片"), prn(LSTPAPER), bot(LSTONE), qr(LSTQ)],
            n: "「一樣」的不會列出來，只列有差的。這時候**還沒改到工作表1 的任何一格**；要改，按「📋 待審清單」到網頁上一筆一筆審。**商品名要差到一定程度才會標 🟡**：只差一兩個字（像 100MG 和 50MG）會當成 AI 讀歪，算「一樣」；差很多（像整個藥名都不一樣），機器人會覺得是 **code 讀錯**，不進待審（看「有看不懂的行」那一個）。" },
          { l: "紙彎了，整批擋下", m: [act("📷 傳一張紙有點彎的清單照片"), prn(LSTPAPER), bot(LSTSHIFT), qr(LSTQ)],
            n: "對到的列裡，**超過一半位置都不一樣**，幾乎不是資料真的變了，而是**紙彎了或斜了，位置那一欄整批對錯行**。機器人整批擋下，**一筆都不放進待審**，免得你把一整頁錯的位置寫進去。把紙壓平、正面拍，或一次只拍一欄，再傳一次。" },
          { l: "有看不懂的行", m: [act("📷 傳一張有幾行不太清楚的清單照片"), prn(LSTPAPERD), bot(LSTWARN), qr(LSTQ)],
            n: "機器人遇到不確定的**不硬猜**，在差異前面分三種警告列出來：**code 讀不出來**（像把數字 0 讀成英文 O，這一行整行不比）；**位置是工作表1 從來沒出現過的**（多半是讀歪了，這個位置不拿去比，只比其他的）；**code 可能讀錯**（清單上的藥名跟工作表1 那個 code 的藥名差太遠，八成是 code 讀錯，這一筆不進待審）。看到警告，把那幾行重拍，或自己去工作表1 對一下。" }
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
          { l: "三筆待審", m: [act("📋 按「📋 待審清單」，網頁打開"), LSTPG3()],
            n: "**先看有 ✍️ 的**：那是清單上紅筆手改的，表示有人剛改過位置，通常是對的。右邊綠框的值可以直接改，改完再按「✅ 寫進工作表1」。" },
          { l: "按「✅ 寫進工作表1」之後", m: [LSTPG3(), act("👆 按第一筆的「✅ 寫進工作表1」"),
              lstPage({ nl: 2, ni: 0, f: 0, photo: "📷 第 1 張　09/15 10:12", items: [gmix(gmix({}, LSTD1), { res: { t: "✅ 已寫入 1 格　打「復原」可還原", ok: 1 } }), LSTD2], alt: "網頁畫面（清單校對的待審清單）：第一張卡（90101）變淡，按鍵換成一行綠字「✅ 已寫入 1 格　打『復原』可還原」；第二張卡（90105）還在等" })],
            n: "寫進去的每一格都記在「**匯入紀錄**」，**7 天內打「復原」可以還原**。快取也會更新，藥師馬上查到新的位置。" },
          { l: "「表上沒有」的新藥", m: [LSTPG3(), act("👆 點上面的「🔵 表上沒有」篩選"),
              lstPage({ nl: 1, ni: 0, f: 2, photo: "📷 第 1 張　09/15 10:12", items: [LSTD3], alt: "網頁畫面（清單校對的待審清單）：只剩一張藍色「🔵 表上沒有」的卡：90131，下面有商品名、位置、劑型、中文名、學名五格可以填，按鍵是「📥 匯入工作表1」「❌ 不需要」「⏭ 跳過」" })],
            n: "商品名和中文名**至少填一個**才能匯入。填完按「📥 匯入工作表1」就新增一列（這一列也能「復原」）；不需要就按「❌ 不需要」。" }
        ] } },
      { t: "📍 位置查核：去貨架查某一格", p: "貨架上的藥有時會被搬動，工作表1 卻還寫著舊的位置。開發者要**定期去貨架看「這支藥真的在工作表1 寫的那一格嗎」**——這就是**位置查核**，做在「清單校對」裡：按輸入框上面的「**📍 位置查核**」（或直接打「位置查核」），然後**打一個位置**（例如 B1），或**傳一張貨架照片**（下一段）。機器人把工作表1 裡寫這一格的藥，**全部列成一張卡片**，讓你站在貨架前一支一支對。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "按「📍 位置查核」", m: [qr(LSTQ, "「清單校對」之後，輸入框上面有這 6 顆"), act("👆 按輸入框上面的「📍 位置查核」")].concat(LCK(LCKP, 1, "輸入框上面現在只剩這三顆")),
            n: "按下去等於打「位置查核」。進去之後的 **30 分鐘內**，你打的位置、傳的照片都走位置查核（離開按「🚪 退出」）。機器人先說三件事：**打勾只放在暫存**（不寫進工作表1、也不記日期）；**改位置不記進匯入紀錄**（所以沒有「7 天內復原」），但改完**馬上更新快取，藥師現在查就是新位置**；**照片裡認出來、工作表1 也寫這一格的，會先幫你打勾**。輸入框上面只剩三顆：「🌐 網頁版」（同一件事的網頁，看第四段）、「📋 回表格校對」（回到拍清單的校對）、「🚪 退出」。" },
          { l: "打一個位置：B1", m: LCK(LCKB1, 2, "輸入框上面多了這幾顆"),
            n: "跟藥師打「B1」查到的是**同一批、同一個順序**，只是每一列多了兩樣東西：左邊的**打勾框**（這支藥在這一格，而且你看到了），右邊的「**修改**」（它不在這一格）。上面的「已看 0/5」會隨你打勾往上加。點**藥名**＝等於打這支藥的 CODE，看它的卡片。錠劑和水劑會分成兩段。下面的「📑 全部重送」是把整格的卡片再送一遍，「↺ 清掉勾選」是這一格打的勾全部拿掉。" },
          { l: "一格有很多支：K2", m: LCK(LCKP.concat(["K2"]), 2, "輸入框上面多了這幾顆"),
            n: "一張卡片放 12 列，超過就**分頁**：卡片上寫「第 1/2 頁」，**往左滑**看下一頁；「已看 n/N」是整格一起算。一格最多列 60 支，再多的卡片最下面會列出名字，請個別查。" },
          { l: "打了沒有的位置：Z9", m: LCK(LCKP.concat(["Z9"]), 2),
            n: "工作表1 沒有藥登記在這個位置，機器人直接告訴你，不給一張空的卡片。位置要打對：像 K2、B1、水A3 這種要**完全一樣**；打「棧中」「水棧一」這種名稱，則是**包含這幾個字**的位置都算。" }
        ] } },
      { t: "✅ 邊看邊打勾；不在這格就「修改」", p: "站在貨架前，**一支一支對**。這支藥真的在這一格，就點左邊的**打勾框**，卡片上面的「已看 n/N」會往上加；**全部看完，會變成綠色的「✅ 全部看完了」**。打勾只是讓你知道「這支我看過了」，**只放在機器人的暫存**（6 小時），不寫進工作表1、不記日期。**不在這一格**的，按右邊的「**修改**」，當場改位置。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "點框打勾", m: LCK(LCKB1.concat([lckTick("90103"), lckTick("90116")]), 2, "輸入框上面還是這幾顆"),
            n: "點一下打勾、再點一下取消。機器人**只重送動到的那一頁**卡片，上面的「已看 2/5」跟著變，打了勾的那一列整列變淡綠色。" },
          { l: "整格看完：A3", m: LCK(LCKP.concat(["A3", lckTick("90115", "A3")]), 2, "輸入框上面還是這幾顆"),
            n: "A3 只有一支藥，勾了就**全部看完了**：「已看」變成綠色的「✅ 全部看完了　1/1」。" },
          { l: "按「修改」", m: LCK(LCKB1.concat([lckMod("90116")]), 2),
            n: "貨架上找不到、或發現它放在別格：按那一列右邊的「修改」。機器人問你新位置：**點下面卡片上的一個位置，或直接打字**（例如 A2）。選單裡是工作表1 現有的位置，一個一個列出來，按 A 區、B 區…分段。不想改按「取消，不改了」。" },
          { l: "點一個新位置", m: LCK(LCKB1.concat([lckMod("90116", true), lckPick("K3")]), 3, "輸入框上面還是這幾顆"),
            n: "點一個位置**就馬上改好**，機器人回報「B1 → K3」。**只改「位置」這一格**，不記進匯入紀錄（所以沒有 7 天內復原；改錯了再按「再改」改回來）。那一列留在原位，寫著「→ 已改到 K3」，算「看過了」；快取馬上更新。" },
          { l: "直接打新位置", m: LCK(LCKB1.concat([lckMod("90116", true), { t: "text", v: "A2", q: 1, cap: "輸入框上面出現這三顆" }, { t: "pb", v: "lck=y|B1|90116|A2", n: act("👆 按輸入框上面的「✅ 確定改成 A2」") }]), 3, "輸入框上面還是這幾顆"),
            n: "直接打字也可以。**打的是工作表1 從來沒人用過的位置**（A2），機器人**先問你一次**，因為多半是打錯了；真的要改，按「✅ 確定改成 A2」。打的是工作表1 已經有的位置（像 K3），就直接改好，不會再問。" },
          { l: "改完，藥師查就是新位置", m: LCK(LCKB1.concat([lckMod("90116", true), lckPick("K3"), { t: "code", v: "90116", n: act("👆 點藥名「SAMPLECOR* 10MG TAB」（等於打 90116）") }]), 3),
            n: "點**藥名**＝打那支藥的 CODE。藥品卡片上的位置已經是 K3；藥師現在打 90116，看到的也是 K3（改完當下快取就更新了）。" }
        ] } },
      { t: "📷 拍貨架上的位置牌", p: "不想打位置，也可以**站在貨架前拍一張照片**傳給機器人（要拍到架上的**位置牌**和藥盒）。機器人先看牌子寫哪個位置，再認架上有哪幾種藥，把那一格列成卡片；**認出來、而且工作表1 也寫這一格的藥，會先幫你打勾**，剩下的你自己對。照片是 AI 看的，要等幾秒；看不清楚、牌子被擋住的時候，它**不硬猜**，會告訴你怎麼補救。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "牌子和藥都讀到：B1", m: LCK(LCKP.concat([{ t: "img", v: "S2", n: act("📷 站在 B1 的貨架前，拍一張（要拍到位置牌和藥盒）") }]), 2, "輸入框上面多了這幾顆"),
            n: "位置牌讀到「B1」，**認出 3 支、工作表1 也寫 B1 的就先打勾**（卡片上有 ✓ 的）。沒打勾的 2 支（90118、90119）是照片上沒認到的，**要你自己看貨架**：可能真的不在了，也可能只是被擋住。" },
          { l: "整格很多支：K2", m: LCK(LCKP.concat([{ t: "img", v: "S1", n: act("📷 站在 K2 的貨架前，拍一張") }]), 2, "輸入框上面多了這幾顆"),
            n: "K2 有 14 支，卡片分兩頁。照片認出 5 支：其中 4 支工作表1 也寫 K2，先打勾；**另有 1 支工作表1 寫在別格**（SAMPLEXIN 500，工作表1 寫 K3），列在卡片最後一段「📷 照片裡也認出（工作表1 寫在別格）」，紅字寫著工作表1 現在寫的位置。這種藥多半是搬過來沒改位置的：按它的「修改」，把位置改成這一格。" },
          { l: "牌子被擋住了", m: LCK(LCKP.concat([{ t: "img", v: "S3", n: act("📷 拍一張，位置牌被擋住了") }, "K2"]), 2, "輸入框上面多了這幾顆"),
            n: "牌子沒讀到，機器人**不亂猜位置**：它把認出來的 2 支藥先記著（10 分鐘），請你**直接打這一格的位置**。你打了（例如 K2），它就用剛才那張照片認出的藥幫你打勾。" },
          { l: "牌子是沒有的位置：Z9", m: LCK(LCKP.concat([{ t: "img", v: "S4", n: act("📷 拍一張，位置牌上寫 Z9") }]), 2),
            n: "牌子讀到「Z9」，但工作表1 沒有藥寫在這個位置：可能牌子讀錯、也可能這個位置還沒有人用。認出的藥一樣先記著，請你自己打對的位置。" },
          { l: "AI 塞車了", m: LCK(LCKP.concat([{ t: "img", v: "S5", n: act("📷 站在 K3 的貨架前，拍一張（AI 那邊剛好塞車）") }]), 2, "輸入框上面多了這幾顆"),
            n: "位置牌還是讀到了（這一步沒失敗），只是**藥品辨識沒成功**：所以機器人只用位置牌，把 K3 這一格列出來，**一個勾也沒有**，你自己對貨架。等十幾秒再傳一次也可以。" },
          { l: "太暗了", m: LCK(LCKP.concat([{ t: "img", v: "S6", n: act("📷 拍一張，光線太暗") }]), 2),
            n: "照片太暗、看不出藥盒：機器人直接說讀不出來，什麼都不會動。光線亮一點、字對焦清楚再拍一次。" }
        ] } },
      { t: "🌐 網頁版：電腦上邊看邊勾更方便", p: "輸入框上面的「**🌐 網頁版**」（用的是你的開發者連結，要在綁定過的地方打開），或清單校對網頁上的第二個分頁「**📍 位置查核**」，就是**同一件事的網頁版**：打位置、傳貨架照片，列出同樣的一格藥，打勾、修改都一樣——差別是**電腦螢幕大，一眼看完整格**，修改位置也可以直接從清單選。打勾只留在這個網頁（重新整理就沒了），不寫進工作表1。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "打位置，列出這一格", m: [act("📋 按輸入框上面的「🌐 網頁版」，網頁打開，在「📍 位置查核」打 B1，按「查這一格」"),
              lstLcPage({ q: "B1", loc: "B1", seen: 0, total: 5, sub: "這一格有 5 個品項", rows: LCW_ROWS(), alt: "網頁畫面（清單校對的「📍 位置查核」分頁）：上面兩個分頁「📋 表格校對」「📍 位置查核」（後者是選中的藍色），下面「① 查哪一格」的卡片：輸入框寫著 B1、綠色的「查這一格」、「📷 傳貨架照片（讀位置牌＋認藥）」；再下面是 B1 這一格的卡片：已看 0/5，錠劑類 5 個品項，每一列左邊一個打勾框、中間藥名、右邊一顆「修改」，最底下「↺ 清掉勾選」" })],
            n: "網頁版跟 LINE 上的卡片是**同一批藥、同一個順序**。查詢框上面是兩個分頁，旁邊的「📷 傳貨架照片」就是 LINE 上傳貨架照片的那一步（電腦上也可以把照片拖進來、或截圖後貼上）。" },
          { l: "邊看邊勾", m: [lstLcPage({ q: "B1", loc: "B1", seen: 0, total: 5, sub: "這一格有 5 個品項", rows: LCW_ROWS(), alt: "網頁畫面（清單校對的「📍 位置查核」分頁）：B1 這一格，已看 0/5，五支藥的打勾框都是空的" }),
              act("👆 點「90103」「90116」左邊的框", [".lkt", 0]),
              lstLcPage({ q: "B1", loc: "B1", seen: 2, total: 5, sub: "這一格有 5 個品項", rows: LCW_ROWS({ "90103": { tick: 1 }, "90116": { tick: 1 } }), alt: "網頁畫面（清單校對的「📍 位置查核」分頁）：B1 這一格，上面變成已看 2/5，前兩列（90103、90116）的框打了勾、整列變淡綠色" })],
            n: "點框就打勾，上面的「已看 2/5」馬上跟著變，不用等、不用重新載入。全部看完會變綠色的「✅ 全部看完了」。" },
          { l: "按「修改」", m: [lstLcPage({ q: "B1", loc: "B1", seen: 2, total: 5, sub: "這一格有 5 個品項", rows: LCW_ROWS({ "90103": { tick: 1 }, "90116": { tick: 1, ed: { cur: "B1", sel: LCW_K3(), inp: "K3" } } }), alt: "網頁畫面（清單校對的「📍 位置查核」分頁）：B1 這一格，90116 這一列下面展開一個橘色框：「90116 現在在『B1』→ 要改到哪裡？」，左邊是下拉選單（選了 K3（7 支）），右邊是輸入框（已經填 K3），下面「改成這個位置」「取消」兩顆鍵" })],
            n: "按那一列右邊的「修改」，那一列下面展開一個框：左邊的下拉選單是工作表1 現有的位置（旁邊寫有幾支藥），選一個，右邊的輸入框就跟著填好；也可以自己打新位置（例如 A2）。按「改成這個位置」才真的改。" },
          { l: "改好了", m: [lstLcPage({ q: "B1", loc: "B1", seen: 2, total: 5, sub: "這一格有 4 個品項（已改走 1）", msg: { t: "✅ 位置改好了：**90116**　B1 → K3\n快取已更新，藥師現在查就是新位置。（這個修改不記進匯入紀錄）", k: "ok" }, rows: LCW_ROWS({ "90103": { tick: 1 }, "90116": { moved: "K3" } }), alt: "網頁畫面（清單校對的「📍 位置查核」分頁）：查詢框下面一行綠字「✅ 位置改好了：90116　B1 → K3，快取已更新，藥師現在查就是新位置。（這個修改不記進匯入紀錄）」；B1 這一格上面變成這一格有 4 個品項（已改走 1），90116 那一列變淡黃色，寫著「→ 已改到 K3」，右邊的鍵變成「再改」" })],
            n: "改好的那一列留在原位，淡黃色、寫「→ 已改到 K3」，算「看過了」，右邊的鍵變成「再改」。上面一行綠字回報改了什麼；快取已經更新，藥師現在查就是新位置。" }
        ] } },
      { t: "🚪 校對完：保留、清空、退出", p: "輸入框上面的後三顆管**待審清單和校對模式**：「💾 保留清單」（待審的留著，還在校對模式，可以繼續傳照片）、「🗑 不保留清單」（待審全部清掉，還在校對模式）、「**🚪 退出**」（離開校對模式；待審的留著，網址開著就能繼續審；**位置查核打的勾也一起清掉**）。**校對完記得退出**，不然 30 分鐘內傳的照片都會當成清單或貨架照片。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "💾 保留清單", m: LSTMENU3().concat([act("👆 按「💾 保留清單」"), me("清單校對 保留"), bot("💾 待審 3 筆留著。\n還在校對模式，可以繼續傳照片；要走按「🚪 退出」。" + tl("0.7", "0.2")), qr(LSTQ)]),
            n: "待審清單放 **3 天**，到期自動清掉。" },
          { l: "🗑 不保留清單", m: LSTMENU3().concat([act("👆 按「🗑 不保留清單」"), me("清單校對 清空"), bot("🗑 待審 3 筆全部清掉了。\n還在校對模式，可以繼續傳照片；要走按「🚪 退出」。" + tl("0.7", "0.2")), qr(LSTQ)]),
            n: "整批重來、或拍錯了要全部丟掉時用。清掉的**不能找回**（還沒寫進工作表1，所以工作表1 不會有任何改變）。" },
          { l: "🚪 退出", m: LSTMENU3().concat([act("👆 按「🚪 退出」"), me("清單校對 結束"), bot("🚪 已退出清單校對。\n待審 3 筆還留著，網址開著就能繼續審；不要了就再進來按「🗑 不保留清單」。" + tl("0.6", "0.2"))]),
            n: "這一則沒有帶小按鈕，輸入框上面**自動換回**平常那排。之後傳的照片又是平常的查藥。" },
          { l: "位置查核之後退出", m: LCK(LCKB1.concat([{ t: "pb", v: "lck=t|B1|90103" }, "清單校對 結束"]), 4),
            n: "進過位置查核的，退出時**打的勾也一起清掉**（多一行「📍 位置查核的勾選暫存也清掉了」）；沒進過位置查核的，這一行不會出現。要是只是想回去拍清單，按位置查核裡的「📋 回表格校對」就好：位置查核關掉，**勾選的暫存還留著**，要走再按「🚪 退出」才清。" }
        ] } },
      { t: "換你打打看", p: "下面是一間**練習用的聊天室**：你是開發者，機器人照真的 LINE 程式回。聊天室裡的「📤 多張上傳」「📋 待審清單」「🌐 網頁版」按下去，**練習用的網頁**就會在聊天室下面打開（真的是手機或電腦的瀏覽器開 GitHub 上的網頁）。先打「**清單校對**」進入，有兩條路可以走。**拍清單**：用**練習專用的按鈕**傳一張清單的照片（真的要自己拍；這裡有五張編好的：一般的、另一頁、紙彎了、有看不懂的行、AI 塞車），看機器人怎麼回；再開網頁，在卡片上改一改綠框裡的字，按「✅ 寫進工作表1」，回聊天室查那一支藥，最後打「**復原**」還原。**位置查核**：按「**📍 位置查核**」，打一個位置（B1、K2、A3），或用練習專用的按鈕傳一張貨架照片（也有六張編好的：K2 整格、B1、牌子被擋住、牌子是 Z9、AI 塞車、太暗了），邊看邊打勾，不在這格的按「修改」改位置，再點藥名看它的位置變成什麼。想看時間過去會怎樣，用「⏰ 時間過了…」。聊天室下面還有一張**練習用的「待匯入」分頁**，換一份資料貼進去，待審清單裡就會多出那幾列。練習的試算表和照片都是編的，**什麼都不會真的寫**。",
        d: { k: "dsim", ttl: "練習聊天室：清單校對", ex: ["清單校對", "位置查核", "B1", "90116", "復原", "清單校對 結束"], sheet: 1, lst: 1, pend: "empty" },
        keys: ["**傳照片只是比對，不會改工作表1**：差異先放進待審清單；在網頁上按「✅ 寫進工作表1」才會改，改的每一格都記在「匯入紀錄」，7 天內打「復原」可以還原。", "**網頁是打開那一刻讀回來的一份複本**：之後 LINE 這邊再傳的照片，網頁要「重新整理」才看得到；「⏭ 跳過」只是在這個網頁上先藏起來，重新整理又會出現。", "**校對模式只有 30 分鐘**：這段時間傳的照片都走校對；校對完按「🚪 退出」。待審清單 3 天後自動清掉。", "**位置查核的勾只放在暫存**，不寫進工作表1；「修改」只改「位置」那一格，**不記進匯入紀錄**（沒有 7 天內復原），改完藥師馬上查到新位置。"] }
    ], tryp: DEVTRY("清單校對", "會回到 LINE 聊天室，已經幫你填好「清單校對」，按送出只是進入校對模式（30 分鐘內傳的照片會走校對，不會出藥品卡片）；沒有傳照片，就不會改到任何資料。要離開按「🚪 退出」。想試位置查核，進去之後按輸入框上面的「📍 位置查核」。"),
    recap: ["**拍位置清單傳給機器人**，它用 CODE 逐列對工作表1，只挑不一樣的：🟡 位置或商品名變了、🔵 表上沒有；一次拍一欄最準。", "**紙彎了或斜了**，位置會整批對錯行，機器人會「整批擋下」、一筆都不進待審；把紙壓平、正面拍再傳。", "**審過按「✅ 寫進工作表1」才會改**，做錯了 7 天內打「復原」；校對完按「🚪 退出」，不然 30 分鐘內傳的照片都走校對。", "**📍 位置查核**：按「📍 位置查核」打一個位置（或拍貨架上的位置牌），邊看邊打勾；不在這格的按「修改」當場改位置，**不記匯入紀錄**、藥師馬上查到新位置。"] },

    { id: "devmaint", ch: 1, name: "日常維護", secs: [
      { t: "輸入框上面的「🔧 開發者」", p: "開發者的輸入框上面，比藥師多一顆「🔧 開發者」。按它會出現一張選單，**按一顆＝幫你打那個字**，不用背指令。綠色的兩顆最常用：「➕ 新增藥品」和「📮 回覆回報」；下面是體檢、速度、清單校對，和幾個全院的開關。藥師看不到這顆，打這些字也沒有用。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "按「🔧 開發者」", m: [qr(BAR, "開發者的輸入框上面，比藥師多一顆「🔧 開發者」"), act("👆 按輸入框上面的「🔧 開發者」"), me("開發者"), devMenuCard(true, true, false), qr(BAR, "輸入框上面還是這一排")],
            n: "選單最下面的小字提醒了兩件事：**換照片**要怎麼做、**改錯了**怎麼辦。「OCR接手」「新卡片」「語音V2」後面的字是現在的狀態（✅全院＝開著、已關＝關著）。" },
          { l: "藥師打「體檢」", m: [me("體檢"), bot("這是開發者指令 🔒\n有資料要新增或修改，把 CODE 和內容傳給開發者就好。")],
            n: "藥師打開發者才有的字，只會看到這一句，什麼都不會動。" }
        ] } },
      { t: "🩺 體檢：換完程式按一下", p: "按「🩺 體檢」，輸入框上面換成一排小按鈕：**「📦 版本更新＋清快取」**（先清快取，再列 LINE、網頁專案、GitHub 全部的版本對不對）和**「🩺 開始體檢」**（上面那些＋所有項目檢查一次，約 10～20 秒）。**換完程式**想確認有沒有貼齊、**改完試算表**想馬上看到新資料，按前者；平常每週按一次後者。**部署新版本之後不按也會更新**：下一則訊息處理完（沒人傳訊息的話，最慢 1 分鐘內），機器人自己清快取、重建索引，回覆裡「🔄 自動更新」那一行會寫最近一次是什麼時候。要離開按「🚪 退出」，輸入框上面就換回平常那排。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "按「🩺 體檢」", m: [devMenuCard(true, true, false), act("👆 按選單的「🩺 體檢」"), me("體檢")].concat(CHKMENU()),
            n: "這一排小按鈕**只在體檢這一段出現**，按「🚪 退出」就回到平常那排。" },
          { l: "📦 版本更新＋清快取", m: CHKMENU().concat([act("👆 按「📦 版本更新＋清快取」"), me("版本更新＋清快取"),
              bot("📦 版本更新＋清快取\n\n🧹 快取：全部清掉（索引＋10 格設定鏡射），索引重建中，設定會預熱。藥師下一句查詢就是新資料。\n\n" + VERTXT + "\n\n🗂 指令碼屬性（超過 50 個，專案設定就只能看、不能改）\nLINE：18 個 ✅\n網頁專案：14 個 ✅\n\n🕘 自動清快取：今天 06:00、09:00 清過（下一次 13 點）\n🔄 自動更新：這一版已經更新完了（09/15 09:05 自動做的，03 換新，2 秒，索引 28 筆，網頁專案 ✅）" + tl("2.6", "0.4")), qr(["🩺 開始體檢", "🚪 退出"])]),
            n: "**四個檔的版本要一樣**。哪一行後面有「←」，就是那個檔沒貼到最新版，或貼了還沒「部署 → 新版本」。清快取是先清再馬上重建；每天 6、9、13、17、21 點也會自動清一次。最下面「⏱」那一行是**這一句花的時間**（開發者指令的回覆大多有），「程式外」是 LINE 送出到程式開始之間的空檔。" },
          { l: "🩺 開始體檢", m: CHKMENU().concat([act("👆 按「🩺 開始體檢」"), me("健檢"),
              bot("🩺 健檢　13.2 秒\n🧹 快取：全部清掉（索引＋10 格設定鏡射），體檢會順便重讀試算表把索引建回來。\n\n" + VERTXT + "\n🗂 指令碼屬性：LINE：18 個 ✅　網頁專案：14 個 ✅\n🕘 自動清快取：今天 06:00、09:00 清過（下一次 13 點）\n🔄 自動更新：這一版已經更新完了（09/15 09:05 自動做的，03 換新，2 秒，索引 28 筆，網頁專案 ✅）\n\n🩺 體檢：沒有 ❌ 也沒有 ⚠️ ✅\n\n速度看「⏱ 速度」那顆；只清快取、看版本：按下面的「📦 版本更新＋清快取」。\n\n（完整內容在 Apps Script 的執行記錄）" + tl("13.5", "0.3")), qr(["📦 版本更新＋清快取", "🚪 退出"])]),
            n: "一切正常就是「沒有 ❌ 也沒有 ⚠️ ✅」那一行；有問題的會一條一條列在它下面（❌ 一定要處理，⚠️ 要看一下）。" },
          { l: "🚪 退出", m: CHKMENU().concat([act("👆 按「🚪 退出」"), me("體檢 退出"), bot("🚪 已離開體檢。\n要再用：按「🔧 開發者」→「🩺 體檢」，或直接打「體檢」。")]),
            n: "這一則沒有帶小按鈕，所以輸入框上面**自動換回**平常那排。" }
        ] } },
      { t: "⏱ 速度：藥師說很慢的時候", p: "藥師說「查很慢」「拍照等很久」，按「⏱ 速度」：LINE 上**實際的時間**，打字、照片、語音各列最近幾次，旁邊寫著目標（打字 2 秒、拍照 6～8 秒、語音 6 秒）。超過目標幾乎都是「**程式外**」（Google 的冷啟動，靠保溫觸發器）或 AI 那一趟。每一段花在哪裡，按下面的小按鈕看。",
        d: { k: "chat", ttl: "按「⏱ 速度」", ch: [
          { l: "⏱ 速度", m: [devMenuCard(true, true, false), act("👆 按選單的「⏱ 速度」"), me("速度"),
              bot("⏱ 速度（LINE 上實際的時間，新的在上）\n\n⌨️ 打字（目標 2 秒）　最近 2 次　平均 465 ms　超過 2 秒 0 次\n　【09/15 10:12】「90101」 410 ms ✅　程式外 180 ms　索引 記憶體\n　【09/15 10:09】「testolol」 520 ms ✅　程式外 210 ms　索引 快取\n\n📷 照片（印刷目標 6 秒、手寫 8 秒）　最近 1 張\n　【09/15 10:05】 藥師等 4.2 秒　印刷　AI 1 次 3.1 秒　程式外 220 ms\n\n🎤 語音（目標 6 秒）　最近 1 句\n　【09/15 09:58】 3.4 秒　✅ 查到　程式外 150 ms\n\n怎麼看：超過目標幾乎都是「程式外」（Google 冷啟動，靠保溫觸發器）或 AI 那一趟。照片的「藥師等」＝回覆送出去那一刻；「全部做完」多出來的是回覆之後才做的清暫存、記帳。\n每段細節：按下面的小按鍵，或打「文字速度」「照片速度」「語音速度」「速度 詳細」。" + tl("0.9", "0.2")), qr(SPDQ)],
            n: "小按鈕：**文字速度**（打字每一次花在哪一段）、**照片速度**、**語音速度**（藥師說「一直聽錯」先看這個）、**速度 詳細**（合成一份）。✅ 是在目標內，🟡 是超過 2 秒。**第一次按（或隔了很久沒按）**最後面可能多一行「🌐 網頁專案的紀錄還沒有存到，剛剛已經去要了，再按一次就會出現」：機器人正在去網頁專案要網頁那邊的紀錄，照它說的再按一次，網頁來的幾列（前面標 🌐）就會一起列出來。" }
        ] } },
      { t: "🖼 照片：同步、換照片", p: "雲端資料夾的新照片（檔名＝CODE）**每 2 小時自動同步一次**，平常不用管。急的話打「**同步照片 90101**」只同步那一支，馬上回新卡片；打「同步照片 全部」強制全部重對。要換單支的照片更直接：查那支藥 → ✏️ 修改 → **📷 換照片** → 傳一張照片，舊的會移到「舊照片」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "同步照片 90101", m: [me("同步照片 90101"), bot("🖼 90101 照片已更新（雲端 90101.jpeg）\n新照片要幾秒鐘才會出現，卡片上還是舊圖的話再查一次就好。"), dc("90101", { edit: 1 })],
            n: "同步完**馬上給你這支藥的新卡片**。如果網址跟原本一樣，會多一句「只是重新整理了快取」。" },
          { l: "📷 換照片", m: [editMenuCard("90101"), act("👆 在 ✏️ 選單點「📷 換照片」"),
              bot("📷 請直接傳一張 90101（TESTOLOL* 25MG TAB） 的照片給我\n（拍瓶身或鋁箔，字面朝上、光線夠；電腦版把照片檔拖進來或 Ctrl+V 貼上也可以）\n\n傳來的照片會存進雲端硬碟的照片資料夾（檔名 90101.jpeg），舊的會移到「舊照片」；卡片馬上換成新照片。\n15 分鐘內有效，不換了就按「取消」。"), qr(["取消"]),
              act("📷 傳一張照片給機器人"), bot("✅ 90101 照片換好了（雲端 90101.jpeg；舊的移到「舊照片」：90101_舊_0915-1045.jpeg）\n新照片要幾秒鐘才會出現，卡片上還是舊圖的話再查一次就好。"), dc("90101", { edit: 1 }), undoQ("90101")],
            n: "照片換好**馬上給新卡片**，輸入框上面第一顆是「↩️ 復原 90101」；15 分鐘內沒傳照片，這一次就過期。" }
        ] } },
      { t: "換你打打看", p: "下面是一間**練習用的聊天室**：你是開發者，機器人照真的 LINE 程式回。先按輸入框上面的「🔧 開發者」看選單，試「體檢」「速度」；再打「**同步照片 90101**」。聊天室下面有一個**練習用的雲端照片資料夾**（藥品照片，檔名＝CODE），資料夾下面的小按鈕是你在 Google 雲端硬碟上做的事：放一張新照片、再放一個同名的、放一個亂取名字的、刪掉一張。做完再打「同步照片」，看機器人怎麼說、卡片換了沒有。時間、版本、次數都是編的，**什麼都不會真的動**。",
        d: { k: "dsim", ttl: "練習聊天室：日常維護", drive: 1, ex: ["開發者", "體檢", "速度", "同步照片 90101"] },
        keys: ["**按「🔧 開發者」**開選單，按一顆等於打那個字；**換完程式**按「🩺 體檢」→「📦 版本更新＋清快取」看有沒有貼齊（部署之後，下一則訊息處理完就會自己更新；沒人傳訊息也最慢 1 分鐘內）。", "**藥師說很慢**按「⏱ 速度」：超過目標幾乎都是「程式外」（Google 冷啟動）或 AI 那一趟。", "**雲端資料夾的照片換了**，機器人要等你叫它「同步照片 CODE」（或每 2 小時自動對一次）才會知道；同一支藥放兩個檔案、檔名不是 CODE，它都會告訴你。"] }
    ], tryp: DEVTRY("速度", "會回到 LINE 聊天室，已經幫你填好「速度」，按送出就會列出最近幾次的時間；只是看紀錄，不會改到任何資料。"),
    recap: ["**輸入框上面的「🔧 開發者」**＝選單，按一顆等於打那個字；藥師看不到，打了也沒用。", "**換完程式、改完試算表**：「🩺 體檢」→「📦 版本更新＋清快取」，看四個檔的版本一不一樣；部署新版本之後不按也會自己更新（下一則訊息處理完；沒人傳訊息最慢 1 分鐘內）。", "**藥師說很慢**看「⏱ 速度」；**照片不對**打「同步照片 CODE」，或 ✏️ 修改 → 📷 換照片。"] },

    { id: "devmore", ch: 2, name: "進階指令", secs: [
      { t: "📖 縮寫：教機器人看懂手寫縮寫", p: "藥師拍的**手寫紙條**常有縮寫（例：HCTZ），AI 不一定認得。把縮寫加進「縮寫表」：之後**打縮寫就查得到那支藥**，AI 讀紙條時也會用它還原。打「**縮寫**」看現在有哪些；加：「縮寫 縮寫=全名」；刪：「縮寫 刪 縮寫」。縮寫只能是英文字母和數字（最多 12 個字），最多 60 個。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "打「縮寫」看全部", m: [me("縮寫"), bot("📖 開發者加的手寫縮寫（查詢會展開、AI 讀紙條時會用來還原）\n（還沒有開發者加的縮寫）\n\n★ 最快的加法：查那支藥 → ✏️ 修改 → 📖 縮寫 → 打 HCTZ\n打字也行：縮寫 HCTZ=hydrochlorothiazide\n刪：縮寫 刪 HCTZ" + tl("0.6", "0.2"))],
            n: "還沒有縮寫的時候，機器人把**兩種加法**都寫給你。有的話，會把全部列在中間。" },
          { l: "加一個：縮寫 縮寫=全名", m: [me("縮寫 TSL=TESTOLOL"), bot("📖 已加 TSL = TESTOLOL（下一張手寫紙條就會用到）。現在的縮寫：\n　TSL = TESTOLOL" + tl("0.8", "0.2"))],
            n: "縮寫會自動轉成**大寫**；「=」也可以打「＝」「:」「：」。加完立刻生效。" },
          { l: "刪一個：縮寫 刪 縮寫", m: [me("縮寫 刪 TSL"), bot("📖 已刪掉 TSL。現在的縮寫：\n（還沒有開發者加的縮寫）" + tl("0.7", "0.2"))],
            n: "「刪」也可以打「刪除」「移除」。打了沒有的縮寫，機器人會說「沒有…這個縮寫」，並列出現有的。" },
          { l: "從藥品加：✏️ → 📖 縮寫", m: [me("90101"), dc("90101", { edit: 1 }), act("👆 點卡片最下面的「✏️ 修改」"), editMenuCard("90101"), act("👆 在選單點「📖 縮寫」"),
              bot("✏️ 90101　📖 縮寫\n\n現在是：（空的）\n\n請直接打新的內容送出就好。"), qr(["🗑 清空這一欄", "取消"]),
              act("⌨️ 打「TSL」送出"), me("TSL"), bot("✅ 90101　縮寫\n　改前：沒有\n　改後：TSL"), dc("90101", { edit: 1 })],
            n: "這一種**不用打全名**：縮寫直接對到這支藥的商品名。一次要加好幾個，用逗號分開（機器人會排好，用「、」連起來）。縮寫不在試算表裡，所以改完**沒有「↩️ 復原」**；全部拿掉就按「🗑 清空這一欄」。" }
        ] } },
      { t: "🗺 平面圖：這支藥要指定放哪一塊", p: "藥品卡片上的平面圖，平常跟著**小藥庫位置**自動判斷。某一支藥要特別指定（例如放在棧板上），在 ✏️ 選單點「🗺 平面圖」。**設完全院立刻生效**，藥師下一則訊息就看得到，不用出新版。要改回去就選「自動」。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "點「🗺 平面圖」", m: [editMenuCard("90101"), act("👆 在 ✏️ 選單點「🗺 平面圖」"), bot(MAPASK), qr(MAPQ)],
            n: "輸入框上面有 7 顆。「棧左／棧中／棧右」按一下就好；「平」是其他櫃位，機器人會再問你是哪一櫃；「沒平」是公藥那種，不用顯示平面圖。" },
          { l: "指定「棧中」", m: [bot(MAPASK), qr(MAPQ), act("👆 點「棧中」"), me("棧中"), bot("✅ 90101　平面圖\n　改前：自動判斷\n　改後：棧中（全院已生效）"), act("（接著送出這支藥的新卡片，平面圖已經換了）")],
            n: "改完**馬上給新卡片**。平面圖不在試算表裡，所以沒有「↩️ 復原」；要改回去，再選一次。" },
          { l: "改回「自動」", m: [act("（這支藥之前指定過「棧中」，再點一次「🗺 平面圖」）"), bot(MAPASK2("棧中")), qr(MAPQ), act("👆 點「自動」"), me("自動"), bot("✅ 90101　平面圖\n　改前：棧中\n　改後：自動判斷（跟著小藥庫位置走）"), act("（接著送出這支藥的新卡片，平面圖回到自動判斷）")],
            n: "「自動」＝取消指定，回到跟著小藥庫位置走。想整院先停用所有指定，打「平面圖設定 關」（設過的內容不會被刪掉，打「平面圖設定 開」就回來）。" }
        ] } },
      { t: "👥 開發者管理：邀請、名單、移除", p: "要多一位開發者，**用邀請碼最簡單**：按 🔧 開發者 →「👥 開發者」，輸入框上面有三顆：**邀請**（給一組 6 位數碼）、**名單**、**移除**。按一顆＝幫你打那個字，不用背指令。",
        d: { k: "chat", ttl: "選一種看看", list: true, ch: [
          { l: "按「👥 開發者」", m: [qr(BAR, "開發者的輸入框上面，比藥師多一顆「🔧 開發者」"), act("👆 按輸入框上面的「🔧 開發者」"), me("開發者"), devMenuCard(true, true, false), act("👆 按選單的「👥 開發者」"), me("開發者 管理")].concat(GMENU()),
            n: "只有三件事。最下面「🚪 退出」，輸入框上面就換回平常那排。" },
          { l: "➕ 邀請開發者", m: GMENU().concat([act("👆 按「➕ 邀請開發者」"), me("開發者 邀請")], INVMSG()),
            n: "6 位數的邀請碼（這裡的 482913 是編的）**10 分鐘內有效、只能用一次**。把「開發者 碼 …」那一句傳給對方就好。**只傳給你認識、要當開發者的人。**" },
          { l: "對方打碼", m: [act("（對方在自己跟補藥神器的一對一聊天室）"), me("開發者 碼 482913"),
              bot("✅ 示範乙，您現在是開發者了\n\n多了這些：新增藥品、回覆回報、匯入、同步照片、換照片、健檢、速度…\n輸入框上面會多一顆「🔧 開發者」，按下去是選單（下一則訊息就會出現）。\n\n先打「教學」，按卡片最下面的「🔒 開發者專用教學」，看一遍就會用。")],
            n: "打完就是開發者。碼打錯、過期、或已經用過，對方會看到「❌ 這組邀請碼不對、或已經過期／被用過了。」，要你重新按「➕ 邀請開發者」；**同一個人連續打錯 3 次**，要等 1 小時。" },
          { l: "👥 開發者名單", m: INVMSG().concat([act("👆 按「👥 開發者名單」"), me("開發者 名單"), bot(DEVLIST2), devgQ("名單")]),
            n: "每個人一行：名字、哪一天加入、誰邀請的。下面「最近的異動」最多列 5 筆。**直接在編輯器加進去的人**沒有加入紀錄。" },
          { l: "➖ 開發者移除", m: INVMSG().concat([act("👆 按「➖ 開發者移除」"), me("開發者 移除"),
              bot("➖ 開發者移除：要移除誰？\n　1　示範甲（您，不能移除自己）\n　2　示範乙　09/15 加入\n\n按下面那一顆（會先問一次），或打「開發者 移除 2」。"), qr(["➖ 移除 2 示範乙", "🚪 退出"]),
              act("👆 點「➖ 移除 2 示範乙」"), me("開發者 移除 2"), bot("確定要移除「2 示範乙」嗎？\n移除之後他就用不了開發者功能（藥師的功能照舊）。"), qr(["✅ 確定移除", "↩️ 不要"]),
              act("👆 點「✅ 確定移除」"), me("開發者 移除 2 確定 k3f9"), bot("🗑 已移除：示範乙\n（他下一則訊息起就沒有開發者功能了）\n\n" + DEVLIST1), devgQ("")]),
            n: "**先問一次**，按「✅ 確定移除」才移除。**不能移除自己**，名單只剩一位也不能移除（不然就沒有人是開發者了）。移除後，對方下一則訊息起就沒有開發者功能，藥師的功能照舊。" }
        ] } },
      { t: "⏰ 觸發器：部署新版本之後按一次", p: "「觸發器」是 Google 定時自己跑的工作（保溫、同步照片、每天清快取…）。**部署新版本之後**打一次「**觸發器**」：機器人**重新建好 6 個**（重複打是安全的，舊的先刪再建）。「健檢」說觸發器不見了、或第一次查詢常常要等十幾秒，也打一次。",
        d: { k: "cmds", ttl: "觸發器會建好這 6 個", items: [
          ["autoSyncPhotos", "每 2 小時　自動同步新照片"],
          ["warmCache", "每 15 分鐘　保持快取是熱的"],
          ["pingSelf", "每 1 分鐘　保持網頁環境是熱的、順便看有沒有新版"],
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
        ] } },
      { t: "換你打打看", p: "下面是一間**練習用的聊天室**：你是開發者，機器人照真的 LINE 程式回。可以練三件事：打「**縮寫**」看表、「縮寫 TSL=TESTOLOL」加一個，再查 TSL 看是不是查得到那支藥；查一支藥，點「✏️ 修改」→「🗺 平面圖」指定放在「棧中」，再改回「自動」；按「🔧 開發者」→「👥 開發者」邀請、看名單、移除。聊天室下面有幾顆**練習專用的小按鈕**，用來假裝「**另一個人**」做的事：對方打「我的代號」、打你給的邀請碼、打錯碼、或是 10 分鐘過去。真的 LINE 沒有這些按鈕；按了之後，聊天室裡畫的是**他看到的**，不是你的聊天室。練習的試算表是編的，**什麼都不會真的寫**。",
        d: { k: "dsim", ttl: "練習聊天室：進階指令", oth: 1, ex: ["縮寫", "平面圖", "開發者 管理", "我的代號"] },
        keys: ["**縮寫**：「縮寫 縮寫=全名」加了馬上生效，之後打縮寫就查得到那支藥；也可以查藥 → ✏️ 修改 → 📖 縮寫，不用打全名。", "**🗺 平面圖**：棧左、棧中、棧右按一下就換；「自動」＝取消指定。設完全院立刻生效，卡片馬上換。", "**邀請碼 10 分鐘、只能用一次**；同一個人連續打錯 3 次要等 1 小時。移除會先問一次，不能移除自己，名單只剩一位也不能移除。"] }
    ], tryp: DEVTRY("縮寫", "會回到 LINE 聊天室，已經幫你填好「縮寫」，按送出只是列出縮寫表，不會改任何東西；要加再打「縮寫 縮寫=全名」。"),
    recap: ["**縮寫**：打「縮寫」看全部、「縮寫 縮寫=全名」加、「縮寫 刪 縮寫」刪；加了，下一張手寫紙條就會用。", "**開發者管理**：🔧 開發者 →「👥 開發者」→ ➕ 邀請（6 位數碼，10 分鐘、只能用一次）、👥 名單、➖ 移除（先問一次，不能移除自己）。", "**部署新版本後打「觸發器」一次**；全院開關（新卡片、語音嚴格、OCR接手…）打一次開、再打一次換回去，立刻生效。"] },

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
          { l: "② LINE：拿綁定碼", m: [webLinkCard({}), act("👆 回 LINE，按連結卡上的「🔑 拿綁定碼」"), me("開發者網頁 綁定"), wbBindCard("304718")],
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
        ] } },
      { t: "換你打打看", p: "下面是一間**練習用的聊天室**，聊天室下面接著**四台裝置的瀏覽器**（手機的 LINE 裡面、辦公室電腦、手機的瀏覽器、另一台電腦），每一台各自記著自己的東西。你是開發者，機器人照真的程式回。可以照這個順序練：**①** 打「**開發者網頁**」，按卡片上的「打開網頁」，在你選的那一台打開，會看到「這台還沒綁定」；回聊天室打「**開發者網頁 綁定**」，把 6 位數的碼打進網頁，按「綁定」，就進到首頁。**②** 換到「辦公室電腦」，按「⌨️ 直接打網址」：沒放 cfg.js、也沒從 LINE 開過，網頁只會請你從 LINE 開；按下面「📄 GitHub 上有放 cfg.js」再開一次，就出現代號登入。按最下面小小的「開發者登入」，把 6 位數字的代號打進聊天室，LINE 回驗證碼卡片，再把驗證碼打回網頁登入；聊天室會多一張「🔔 新裝置登入」的通知。**③** 一條連結最多綁 3 台，綁第 4 台會被擋；打「**開發者網頁 重發**」，舊連結和所有裝置馬上失效，到每一台按「查一支藥」就看得到。**④** 聊天室下面的**練習專用的按鈕**，可以假裝「在群組裡貼代號」、假裝「藥師」打「網頁」或「開發者網頁」，還可以讓**時間往後撥**（倒數到 0 自動換新代號、1 小時後鎖解開、31 天鑰匙過期）。練習的鑰匙、代號、驗證碼都是編的，**什麼都不會真的連出去**。",
        d: { k: "dsim", ttl: "練習聊天室：開發者網頁", web: 1, ex: ["開發者網頁", "開發者網頁 綁定", "開發者網頁 重發", "驗證碼登入 關"] },
        keys: ["**每一台都要先綁定才進得了開發者版**：綁定碼 10 分鐘、只能用一次，一條連結最多綁 3 台；用驗證碼登入的新裝置會自動綁好，LINE 還會通知你。", "**代號只能貼在一對一聊天室，5 分鐘內要做完**：超過了網頁會自己換新的，不用慌；驗證碼只能打回出現那組代號的網頁。", "**出事了先「開發者網頁 重發」**：舊連結、所有已綁的裝置、手上還沒用掉的驗證碼，全部馬上失效；有人亂試代號，再用「驗證碼登入 關」。"] }
    ], tryp: DEVTRY("開發者網頁", "會回到 LINE 聊天室，已經幫你填好「開發者網頁」，按送出會出現開發者網頁的連結卡（平常是同一條連結，不會換新）；只是拿連結，不會改到任何資料。"),
    recap: ["**輸入框上面的「🌐 網頁」＝開發者版**（藥師按到的是藥師版）；每一台第一次要**綁定**：連結卡「🔑 拿綁定碼」→ 6 位數 → 打回網頁（10 分鐘、只能用一次、最多 3 處）。", "**直接打網址**：網頁給代號 → 打進 LINE 一對一聊天室 → 拿 6 位數驗證碼 → 打回網頁，5 分鐘內做完；開發者按最下面的「開發者登入」。", "**出事了**：打「開發者網頁 重發」（舊連結和所有裝置馬上失效）；有人亂試代號就「驗證碼登入 關」，沒事了再「開」。"] }

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
  /* 超過 5 個品項的「總表」卡：一列一個品項藥品（小照片、商品名、中文名＋CODE、右邊位置），按一列出完整卡片；「⚠️ AI 可能讀錯」寫在標題底下 */
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
  /* 網頁驗證碼卡片（照 09 的 _lcCard_：標題、3xl 粗體的 6 位數、紅字「限時 5 分鐘・只能用一次」、四行小字）。6 位數是編的 */
  function cdEl() {
    return el("div", { class: "cdc", role: "img", "aria-label": "LINE 回的卡片「補藥神器 網頁驗證碼」：6 位數 4 8 2 9 1 5；限時 5 分鐘，只能用一次；只能打在剛剛出現代號的那個網頁上，不要告訴任何人" }, [
      el("div", { class: "cdc-t", "aria-hidden": "true", text: "🔐 補藥神器 網頁驗證碼" }),
      el("div", { class: "cdc-n", "aria-hidden": "true", text: "482915" }),
      el("div", { class: "cdc-l", "aria-hidden": "true", text: "限時 5 分鐘・只能用一次" }),
      el("div", { class: "cdc-x", "aria-hidden": "true", text: "給「代號 " + DEMO_CODE + "」那個網頁用的：回到那個網頁輸入，換別的瀏覽器打沒用。" }),
      el("div", { class: "cdc-x", "aria-hidden": "true", text: "從網頁上出現代號那一刻起算，要在網頁的倒數歸零前輸入完；超過了，網頁會自己換一組新的代號，到時把新的代號再貼進來就好。" }),
      el("div", { class: "cdc-x", "aria-hidden": "true", text: "不是你自己剛在網頁上看到這組代號的？不要輸入。" }),
      el("div", { class: "cdc-x w", "aria-hidden": "true", text: "⚠️ 請只打在剛剛那個網頁上，不要告訴任何人（包括自稱客服的人）。" })
    ]);
  }
  /* 電腦瀏覽器裡的「代號登入」畫面（照真的網頁 _app_page.html 的 codeForm／renderPair 畫）：上面是瀏覽器的標題列＋網址列；網頁裡：標誌＋「補藥神器」→「🔐 登入補藥神器」→
     ① 打開 LINE 補藥神器…把這組代號貼進去（大大的代號、「複製代號」鍵、倒數、這台）→ ② LINE 會回你 6 位數的驗證碼，打在這裡（輸入框、「登入」鍵）。
     st：load（剛打開，向後端要代號中）／code（有代號）／copied（按了「複製代號」）／type（6 位數打好了，「登入」亮了）／ok（登入成功，進到首頁）；hot：圈起來的那一塊（code／copy／input／go）。代號、6 位數都是編的。 */
  function brUrl() { return APP_URL ? APP_URL.replace(/^https?:\/\//, "") : "（你們的補藥神器網址）"; }   /* 網址列要寫的網址：這一頁自己的位置（打不出來就寫「（你們的補藥神器網址）」） */
  function brEl(o) {
    o = o || {};
    var st = o.st || "code", hot = o.hot || "", ld = st === "load", ok = st === "ok", ty = st === "type";
    var url = brUrl();
    if (st === "enter") return enterEl(url);   /* 第 21 批：剛開新分頁、網址列空的，示範的時候網址自己打進去（見 enterEl） */
    var say = {
      load: "電腦的瀏覽器剛打開補藥神器網頁版，網頁正在向後端要代號",
      code: "電腦的瀏覽器：網頁上有一組代號 " + DEMO_CODE.split("").join(" ") + "，下面有「複製代號」鍵和倒數，再下面是打 6 位數驗證碼的輸入框和「登入」鍵",
      copied: "電腦的瀏覽器：按了「複製代號」，鍵上寫「已複製 ✓」",
      type: "電腦的瀏覽器：6 位數 " + DEMO_SIX.split("").join(" ") + " 已經打在輸入框，「登入」鍵亮了",
      ok: "電腦的瀏覽器：登入成功，進到網頁版的首頁，上面有補藥神器的標誌和查藥的搜尋框"
    }[st] || "電腦的瀏覽器：補藥神器網頁版的代號登入畫面";
    var head = el("div", { class: "bw-hd" }, [el("i", { class: "bw-logo" }), el("b", { text: "補藥神器" })]);
    var pg;
    if (ok) {
      pg = [head, el("div", { class: "bw-sf" }, [el("span", { text: "輸入 CODE、藥名、中文或位置，再按 Enter 鍵查詢" }), el("i", { text: "🎤" }), el("i", { text: "📷" })]), el("div", { class: "bw-ph" }), el("div", { class: "bw-ph" })];
    } else {
      var b1 = el("div", { class: "bw-b1" }, ld ? [
        el("div", { class: "bw-st", text: "① 正在向後端要代號…" }),
        el("div", { class: "bw-code", text: "⏳" })
      ] : [
        el("div", { class: "bw-st" }, ["① 打開 LINE 補藥神器（一對一，不是群組），把這組", el("b", { text: "代號" }), "貼進去"]),
        el("div", { class: "bw-code" + (hot === "code" ? " hot" : ""), text: DEMO_CODE }),
        el("div", { class: "bw-copy" + (hot === "copy" ? " hot" : ""), text: st === "copied" ? "已複製 ✓" : "複製代號" }),
        el("div", { class: "bw-meta" }, ["英文大小寫都可以", el("br"), "請在 ", el("b", { text: "4:58" }), " 內完成登入", el("br"), "這台：Chrome / Windows　·　", el("u", { text: "重新取得代號" })])
      ]);
      pg = [head, el("div", { class: "bw-tt", text: "🔐 登入補藥神器" }), b1];
      if (!ld) pg.push(el("div", { class: "bw-b2" }, [
        el("div", { class: "bw-st" }, ["② LINE 會回你 6 位數的", el("b", { text: "驗證碼" }), "，打在這裡"]),
        ty ? el("div", { class: "bw-in v" + (hot === "input" ? " hot" : "") }, DEMO_SIX.split("").map(function(d) { return el("i", { text: d }); }))   /* 6 位數一個字一個 <i>：示範（.pop）的時候一個一個打出來，靜態畫面全部都在 */
           : el("div", { class: "bw-in" + (hot === "input" ? " hot" : ""), text: "LINE 給你的 6 位數" }),
        el("div", { class: "bw-h", text: ty ? "確認跟 LINE 卡片上的一樣，再按「登入」" : "" }),
        el("div", { class: "bw-go" + (ty ? "" : " d") + (hot === "go" ? " hot" : ""), text: "登入" })
      ]));
    }
    return el("div", { class: "bw", role: "img", "aria-label": say }, [
      el("div", { class: "bw-top", "aria-hidden": "true" }, [el("span", { class: "bw-dots" }, [el("i"), el("i"), el("i")]), el("span", { class: "bw-tab", text: "補藥神器" })]),
      el("div", { class: "bw-url", "aria-hidden": "true" }, [el("span", { text: "🔒" }), el("span", { class: "bw-addr", text: url })]),
      el("div", { class: "bw-pg", "aria-hidden": "true" }, pg)
    ]);
  }
  /* 第 21 批：同事手機的截圖（真的照片，放在教學網頁的資料夾，亂碼檔名；LINE 的「加入只要 3 步」卡片也用同一組圖）。hot＝掃描鈕那一點（手指要按的地方，.sc-hot 用百分比定位在搜尋列最右邊的紅圈上） */
  var SCS = {
    page: "同事的 LINE「聊天」頁：最上面是「聊天」「好友」和搜尋列，搜尋列最右邊的方框小圖示是掃描鈕（已經用紅圈圈起來），下面是聊天清單",
    scan: "按了掃描鈕之後的掃描畫面：鏡頭對著你手機上的 QR 卡片，把 QR 放進框裡，下面寫著「掃描行動條碼」"
  };
  function scEl(m) {
    return el("div", { class: "scp " + m.k, role: "img", "aria-label": SCS[m.k] || "截圖" }, m.hot ? [el("i", { class: "sc-hot", "aria-hidden": "true" })] : []);
  }
  /* 第 21 批：掃到 QR 之後，LINE 跳出來的小視窗（頭像、「補藥神器」、「官方帳號」、綠色的「加入」），照真的畫的 */
  function frEl(o) {
    o = o || {};
    return el("div", { class: "frs", role: "img", "aria-label": "LINE 跳出一個小視窗：補藥神器（官方帳號），下面有綠色的「加入」鍵" }, [
      el("i", { class: "fa", "aria-hidden": "true" }),
      el("div", { class: "fn", "aria-hidden": "true", text: "補藥神器" }),
      el("div", { class: "fo", "aria-hidden": "true", text: "官方帳號" }),
      el("div", { class: "fb" + (o.hot ? " hot" : ""), "aria-hidden": "true", text: "加入" })
    ]);
  }
  /* 第 21 批：「輸入網址」（「用電腦開網頁版」第 1 步）。電腦的瀏覽器剛開了一個新分頁、網址列是空的；示範的時候，網址一個字一個字打進網址列、按 Enter，網頁開始向後端要代號。
     全是 CSS 動畫（只有示範 .rw.pop 才動；每個字的延遲＝--d0 + --k × --per），不用計時器，也沒有要人點的東西（靜態畫面直接是最後的樣子，跟打 6 位數一樣）。
     enterPlan：n 網址幾個字；per 每個字幾毫秒（網址越長打越快，打完大約 2 秒）；d0 空的新分頁先放多久；tl 打完、按完 Enter、換成網頁的那一刻；ms 整段演完要多久（示範區算「這一步要放多久」用）。 */
  function enterPlan(url) {
    var n = url.length, per = Math.max(24, Math.min(60, Math.round(2000 / n))), d0 = 700, tl = d0 + n * per + 700;
    return { n: n, per: per, d0: d0, tl: tl, ms: tl + 400 };
  }
  function enterEl(url) {
    var p = enterPlan(url);
    var tx = el("span", { class: "bw-tx" }, url.split("").map(function(ch, i) {
      var c = el("i", { text: ch });
      c.style.setProperty("--k", String(i + 1));
      return c;
    }));
    var s1 = el("div", { class: "bw-s1" }, Array.prototype.slice.call(brEl({ st: "load" }).querySelector(".bw-pg").childNodes));
    var root = el("div", { class: "bw bwx", role: "img", "aria-label": "電腦的瀏覽器：開了一個新分頁，把補藥神器的網址打進網址列、按 Enter，網頁正在向後端要代號" }, [
      el("div", { class: "bw-top", "aria-hidden": "true" }, [el("span", { class: "bw-dots" }, [el("i"), el("i"), el("i")]), el("span", { class: "bw-tab" }, [el("span", { class: "t0", text: "新分頁" }), el("span", { class: "t1", text: "補藥神器" })])]),
      el("div", { class: "bw-url", "aria-hidden": "true" }, [
        el("span", { class: "bw-lk" }, [el("span", { class: "l0", text: "🔍" }), el("span", { class: "l1", text: "🔒" })]),
        el("span", { class: "bw-addr" }, [el("span", { class: "bw-ph0", text: "搜尋或輸入網址" }), el("span", { class: "bw-ln" }, [tx, el("span", { class: "bw-caret" })])]),
        el("span", { class: "bw-key", text: "Enter ⏎" })
      ]),
      el("div", { class: "bw-pg", "aria-hidden": "true" }, [s1])
    ]);
    root.style.setProperty("--n", String(p.n));
    root.style.setProperty("--per", String(p.per));
    root.style.setProperty("--d0", String(p.d0));
    root.style.setProperty("--tl", String(p.tl));
    root.setAttribute("data-ms", String(p.ms));
    return root;
  }
  /* 「📖 補藥神器　教學」卡片（照 07 的 _guideWebCard_：標題、「9 課，一課一個重點。」、藍色的「開始學習」） */
  function gdEl(o) {
    o = o || {};
    return el("div", { class: "gcard", role: "img", "aria-label": "LINE 回的卡片「補藥神器　教學」：" + N + " 課，一課一個重點；最下面有藍色的「開始學習」鍵" }, [
      el("div", { class: "gc-t", "aria-hidden": "true", text: "📖 補藥神器　教學" }),
      el("div", { class: "gc-s", "aria-hidden": "true", text: N + " 課，一課一個重點。" }),
      el("div", { class: "gc-f", "aria-hidden": "true" }, [el("div", { class: "gc-b" + (o.hot ? " hot" : ""), text: "開始學習" })])
    ]);
  }
  /* 「👥 加入補藥神器」按下去，官方帳號回的兩則（字照 07_操作.gs 的 _joinQrCard_、_joinStepsCard_：標題＋說明＋QR＋官方帳號 ID／「加入只要 3 步」左右滑的 4 張圖卡，照 07 的 JOIN_SLIDES：標題、說明、長寬比、會不會動、fit／cover 都一樣）。
     官方帳號 ID 是編的（@xxxxxxxx）；QR 是畫給你看的：三個角的定位方塊＋亂數排的小方塊，掃了沒有用（真的 QR 是你們官方帳號的加入好友連結）。 */
  var JN = { t: "👥 邀請同事一起用", p: "請同事用 LINE 掃下面的 QR，就能加入「補藥神器」。", id: "官方帳號 ID　@xxxxxxxx", h: "加入只要 3 步", sl: [{ k: "pt", r: "494/720", a: true, h: "① 點「聊天」，按搜尋列最右邊的掃描鈕", s: "紅圈那一顆（圖會動：手指去按的地方），然後掃上面的 QR", m: "fit" }, { k: "scan", r: "494/720", a: false, h: "① 把 QR 放進框裡", s: "對準你手機上的那張 QR，LINE 會跳出「補藥神器」", m: "cover" }, { k: "add", r: "484/392", a: true, h: "② 按「加入」", s: "按綠色的「加入」就加入了（圖會動）", m: "fit" }, { k: "welcome", r: "712/552", a: true, h: "③ 跟著歡迎訊息，先看一下教學", s: "一加入就會收到歡迎訊息和教學卡片，按「開始學習」（圖會動）", m: "fit" }] };
  function jnQrGrid() {
    var n = 29, seed = 20260929, r, c, dark, fin = [[0, 0], [0, n - 7], [n - 7, 0]], g = el("div", { class: "jc-g", "aria-hidden": "true" });
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) {
        dark = null;
        fin.forEach(function(f) {   /* 三個角的定位方塊：7×7（外框黑、裡面一圈白、正中間 3×3 黑），外面再空一圈 */
          var y = r - f[0], x = c - f[1];
          if (y >= -1 && y <= 7 && x >= -1 && x <= 7) dark = y >= 0 && y <= 6 && x >= 0 && x <= 6 && (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4));
        });
        if (dark === null && r === 6) dark = c % 2 === 0;   /* 橫的、直的虛線 */
        if (dark === null && c === 6) dark = r % 2 === 0;
        if (dark === null) {   /* 右下角的小定位方塊 */
          var ay = r - (n - 9), ax = c - (n - 9);
          if (ay >= 0 && ay <= 4 && ax >= 0 && ax <= 4) dark = ay === 0 || ay === 4 || ax === 0 || ax === 4 || (ay === 2 && ax === 2);
        }
        if (dark === null) dark = rnd() < 0.5;
        g.appendChild(el("i", { class: dark ? "k" : null }));   /* 整頁不放任何圖形或圖片（安全規則）：QR 用 29×29 個小方格排出來 */
      }
    }
    return g;
  }
  function jnEl(k) {
    if (k === "steps") {   /* 第 21 批：左右滑的 4 張圖卡（手機上往左滑、電腦拉捲軸），一張＝小灰字（第幾張、往左滑）＋圖＋標題＋說明 */
      var n = JN.sl.length;
      return el("div", { class: "lcar", role: "group", tabindex: "0", "aria-label": "LINE 回的第二則「" + JN.h + "」：左右滑的 " + n + " 張圖卡（往左滑看下一張）" }, JN.sl.map(function(p, i) {
        return el("div", { class: "jcard js sl", role: "img", "aria-label": "第 " + (i + 1) + " 張：" + p.h + "。" + p.s }, [
          el("div", { class: "jc-x", "aria-hidden": "true", text: JN.h + "　" + (i + 1) + " / " + n + (i < n - 1 ? "　往左滑 ›" : "") }),
          el("div", { class: "jc-ph " + p.k, "aria-hidden": "true" }),
          el("div", { class: "jc-h", "aria-hidden": "true", text: p.h }),
          el("div", { class: "jc-s", "aria-hidden": "true", text: p.s })
        ]);
      }));
    }
    var q = el("div", { class: "jc-q", "aria-hidden": "true" });
    q.appendChild(jnQrGrid());
    return el("div", { class: "jcard jq", role: "img", "aria-label": "LINE 回的卡片「" + JN.t + "」：" + JN.p + JN.id.replace("　", " ") + "（QR 是示意圖，掃了沒有用）" }, [
      el("div", { class: "jc-t", "aria-hidden": "true", text: JN.t }),
      el("div", { class: "jc-p", "aria-hidden": "true", text: JN.p }),
      q,
      el("div", { class: "jc-id", "aria-hidden": "true", text: JN.id })
    ]);
  }
  /* LINE 內建瀏覽器裡的這份教學：上面一條（✕ 關閉、頁面標題＋網址、⋯）；目錄頁（toc）＝標題、進度、「繼續學」、第一章的三課；一課的頁（lesson）＝課名 ▾／第 n 課、一塊白底區塊（裡面有灰底的示範區）、最下面的「‹ 上一課／下一課 ›」。
     hot：圈起來的那一塊（close 關閉、row 一課、stage 示範區、next 下一課、title 課名） */
  function lpEl(o) {
    o = o || {};
    var pg = o.pg === "lesson" ? "lesson" : "toc", hot = o.hot || "";
    var ls = LESSONS.filter(function(l) { return l.ch === 0; }), cur = lessonById("map") || LESSONS[1];
    var say = pg === "toc" ? "LINE 內建瀏覽器打開了這份教學的目錄頁：標題「補藥神器 教學」、學習進度、第一章的幾課" + (hot === "row" ? "，圈起來的一課是要點的" : "")
      : "LINE 內建瀏覽器裡的「" + cur.name + "」這一課：最上面是課名和第幾課，中間是一塊一塊的內容和灰底的示範區，最下面是「上一課」「下一課」";
    var top = el("div", { class: "lp-top", "aria-hidden": "true" }, [
      el("span", { class: "lp-x" + (hot === "close" ? " hot" : ""), text: "✕" }),
      el("span", { class: "lp-ti" }, [el("b", { text: "補藥神器 教學" }), el("small", { text: APP_HOST || "補藥神器教學網頁" })]),
      el("span", { class: "lp-mo", text: "⋯" })
    ]), body;
    if (pg === "toc") {
      body = el("div", { class: "lp-pg", "aria-hidden": "true" }, [
        el("b", { class: "lp-h1", text: "補藥神器 教學" }),
        el("div", { class: "lp-pr" }, [el("span", { text: "學習進度" }), el("span", { text: "2 / " + N + " 課" })]),
        el("div", { class: "lp-tr" }, [el("i")]),
        el("div", { class: "lp-cta", text: "繼續學：" + ls[2].name }),
        el("div", { class: "lp-ch" }, [
          el("div", { class: "lp-chh" }, [el("b", { text: CH[0].n }), el("span", { text: "2 / " + ls.length })]),
          el("div", { class: "lp-r dn" }, [el("i", { text: "✓" }), el("span", { text: ls[0].name })]),
          el("div", { class: "lp-r dn" }, [el("i", { text: "✓" }), el("span", { text: ls[1].name })]),
          el("div", { class: "lp-r" + (hot === "row" ? " hot" : "") }, [el("i", { text: "▷" }), el("span", { text: ls[2].name })])
        ])
      ]);
    } else {
      /* 第 21 批：hot:stage（「往下捲，看示範」）不只是圈起來——示範區自己演：頁面往下捲、「自動示範中」亮起來、手指點兩個選項、平面圖上的藍框和下面那句說明跟著換（動畫在 CSS，見 .lp-dm） */
      var demo = hot === "stage";
      function first(x) { return x.t.split("。")[0].replace(/\*\*/g, "") + "。"; }   /* 說明只放第一句 */
      var stKids = [
        el("div", { class: "lp-sth" }, [el("span", { text: "點一個，看它是什麼" }), el("em", { text: "自動示範中" }), el("span", { text: "↺ 重播" })]),
        el("div", { class: "lp-chips" }, [el("i", { class: demo ? "" : "on", text: PLANP.hit.n }), el("i", { text: PLANP.b.n }), el("i", { class: demo ? "on" : "", text: PLANP.bar.n }), el("i", { text: PLANP.door.n })])
      ];
      if (demo) {
        var pl = planEl("K2", false);
        Array.prototype.forEach.call(pl.querySelectorAll('[data-part="bar"]'), function(n) { n.classList.add("on"); });
        stKids.push(el("div", { class: "lp-pl" }, [pl]));
        stKids.push(el("div", { class: "lp-nt" }, [el("span", { class: "n1", text: first(PLANP.hit) }), el("span", { class: "n2", text: first(PLANP.b) }), el("span", { class: "n3", text: first(PLANP.bar) })]));
        stKids.push(el("span", { class: "lp-fg", text: "👆" }));
      }
      var sec = el("div", { class: "lp-sec" }, [el("h4", { text: cur.secs[0].t }), demo ? el("div", { class: "lp-ld" }, [el("i"), el("i"), el("i")]) : null, el("div", { class: "lp-st" + (demo ? " hot" : "") }, stKids)]);
      body = el("div", { "aria-hidden": "true" }, [
        el("div", { class: "lp-bar" + (hot === "title" ? " hot" : "") }, [el("b", { text: cur.name + " ▾" }), el("span", { text: "第 " + (lessonIdx(cur.id) + 1) + " 課 / " + N })]),
        el("div", { class: "lp-pg" + (demo ? " lp-dm" : "") }, [demo ? el("div", { class: "lp-scr" }, [sec]) : sec]),
        el("div", { class: "lp-nb" }, [el("b", { text: "‹ 上一課" }), el("span", { text: "0%" }), el("b", { class: "nx" + (hot === "next" ? " hot" : ""), text: "下一課 ›" })])
      ]);
      if (demo) say = "LINE 內建瀏覽器裡的「" + cur.name + "」這一課，往下捲到灰底的示範區：示範區自己示範——「自動示範中」亮起來，手指點「藍色方塊」，平面圖上的藍框跳到棧板、下面的說明跟著換；再點「灰色長條」，藍框跳到長條";
    }
    var root = el("div", { class: "lpf", role: "img", "aria-label": say }, [top, body]);
    if (hot === "stage") root.setAttribute("data-ms", "5000");   /* 整段演完要 5 秒（示範區換下一步之前會等它） */
    return root;
  }
  function nfEl(kw) {
    var b = el("div", { class: "nf", role: "img", "aria-label": "「查無」卡：最上面黃色框寫「如果查詢不到，請翻閱『藥品位置查詢表』。」；查無「" + kw + "」相關藥品；下面有幾個小技巧" });
    b.appendChild(el("div", { class: "lc-note" }, [el("div", { class: "lc-nw", text: "📋" }), el("div", { class: "lc-nt", text: "如果查詢不到，\n請翻閱『藥品位置查詢表』。" })]));
    b.appendChild(el("div", { class: "nf-t", text: "查無「" + kw + "」相關藥品 😥" }));
    b.appendChild(el("div", { class: "nf-x f", text: "小技巧:" }));
    NF_TIPS.forEach(function(t) { b.appendChild(el("div", { class: "nf-x", text: t })); });
    return b;
  }
  /* 看平面圖的三個步驟：一個圓圈數字＋一行粗體＋一行小字 */
  function stepsEl(items, cls) {
    return el("ol", { class: "steps" + (cls ? " " + cls : "") }, items.map(function(it, i) {
      return el("li", {}, [el("span", { class: "rn", "aria-hidden": "true", text: String(i + 1) }), el("div", { class: "st" }, [el("b", { text: it.b }), it.s ? el("span", { text: it.s }) : null, it.u ? el("span", { class: "urlt", text: it.u }) : null])]);
    }));
  }
  function urlRow() {
    return el("div", { class: "urlrow" }, [
      el("span", { text: APP_URL ? "電腦的瀏覽器要打開這個網址（點一下就整串選起來，可以複製）：" : "電腦要打開的網址，請問管理者。" }),
      APP_URL ? el("span", { class: "urlt", text: APP_URL }) : null
    ]);
  }
  function carEl(items, label) {
    return el("div", { class: "lcw" }, [el("div", { class: "lcar", role: "group", tabindex: "0", "aria-label": label }, items)]);
  }

  /* ───────── 示範區的小零件 ───────── */
  /* 聊天室的一列，照 LINE 排：您傳的靠右（左邊有「已讀＋時間」）；官方帳號回的靠左，一串回覆的第一則有官方帳號的頭像
     （卡片比整個聊天室還寬，頭像放在卡片的上面一行）；第一則的泡泡有一個尖角。act（👆 按…）只是旁白，不算一則訊息。 */
  var WIDE = { dc: 1, car: 1, ll: 1, ask: 1, nf: 1, tb: 1, cd: 1, gc: 1, gcar: 1 };
  WIDE.gd = 1;   /* 「📖 補藥神器　教學」卡片：官方帳號回的卡片，跟藥品卡片一樣在上面一行放頭像 */
  WIDE.jn = 1;   /* 「加入補藥神器」的兩張卡片：官方帳號回的卡片，跟藥品卡片一樣在上面一行放頭像 */
  var SCENE = { br: 1, lp: 1, qb: 1, sc: 1, fr: 1 };   /* 不是聊天的訊息：電腦的瀏覽器視窗、LINE 內建瀏覽器的畫面。一整列、置中、沒有頭像，跟 act 一樣不算「誰說的」 */
  function firstFlags(msgs) {
    var prev = "";
    return msgs.map(function(m) {
      if (m.w === "act" || m.w === "qr" || m.w === "wp") return false;
      if (SCENE[m.w]) return false;
      var side = m.w === "me" ? "me" : "bot", f = side !== prev;
      prev = side;
      return f;
    });
  }
  function bubble(m, animated, first) {
    var w = m.w, inner = bubble0(m), cls = first ? " first" : "", b;
    if (w === "act" || w === "qr" || w === "wp") b = inner;
    else if (SCENE[w]) b = el("div", { class: "rw scene" }, [inner]);
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
    if (w === "pl") return el("div", { class: "pimg", role: "img", "aria-label": "大張的平面圖：紅框是這品項藥品放的那一格，圖的左邊寫著「大門」" }, [planEl(m.hit)]);
    if (w === "cd") return el("div", { class: "lcw" }, [cdEl()]);
    if (w === "br") return el("div", { class: "lcw" }, [brEl(m.o)]);
    if (w === "lp") return el("div", { class: "lcw" }, [lpEl(m.o)]);
    if (w === "gd") return el("div", { class: "lcw" }, [gdEl(m.o)]);
    if (w === "jn") return el("div", { class: "lcw" }, [jnEl(m.k)]);
    if (w === "sc") return el("div", { class: "lcw" }, [scEl(m)]);
    if (w === "fr") return el("div", { class: "lcw" }, [frEl(m.o)]);
    if (w === "qb") return el("div", { class: "lcw" }, [qbarEl({ chips: true, hot: m.k })]);
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
  /* 示範區標題列右邊的「重播」鍵。按它：這個示範區自己先回到第一個狀態，同時（autoReg 在示範區上聽 click）從頭自動示範一遍——
     不管現在是什麼情況（學員動過、已經示範完、按過「停止」、目錄頁把自動示範關了、裝置設定減少動態），按「重播」就是要看示範。 */
  function replayBtn(label, fn) {
    return on(el("button", { type: "button", class: "replay", "aria-label": label || "重播" }, [el("span", { "aria-hidden": "true", text: "↺" }), "重播"]), "click", fn);
  }
  /* ───────── 手指（第 17 批）─────────
     示範的時候，畫面上會有一隻手指（👆）從右下角滑到要按的那一顆，按一下（縮一下、圈圈擴開），再淡出——點選項、點卡片上的按鍵、按「登入」都一樣。
     手指只是一個 position:absolute 的小零件，放在「示範區」或「聊天室」裡（兩個都是 position:relative），不佔位置、不擋人點（pointer-events:none）；動畫跑完（animationend）就自己拿掉，不用計時器。
     動畫總共 1 秒，按下去的那一刻在 70%（＝AUTO_TAP_MS 的 700 毫秒）。裝置設定「減少動態」：不畫手指（動畫也被全域關掉）。 */
  function tapAt(host, t) {
    if (REDUCE || !host || !t || !t.getBoundingClientRect) return null;
    var row = t.parentNode, rr, tr;
    if (row && row.classList && row.classList.contains("qrow") && row.scrollWidth > row.clientWidth) {   /* 輸入框上面那一排小按鈕，手機上放不下會左右滑：要按的那顆在看不見的地方，就先把那一排滑到它在正中間，手指才指得到（真的用手機也是先滑過去再按） */
      rr = row.getBoundingClientRect(); tr = t.getBoundingClientRect();
      row.scrollLeft += (tr.left + tr.width / 2) - (rr.left + rr.width / 2);
    }
    var hr = host.getBoundingClientRect(), r = t.getBoundingClientRect(), f = el("span", { class: "fg", "aria-hidden": "true", text: "👆" });
    f.style.setProperty("--x", Math.round(r.left - hr.left + r.width * 0.62) + "px");
    f.style.setProperty("--y", Math.round(r.top - hr.top + r.height * 0.5) + "px");
    on(f, "animationend", function(ev) { if (ev.target === f && ev.animationName === "fgtap" && f.parentNode) f.parentNode.removeChild(f); });
    host.appendChild(f);
    return f;
  }
  function tapDrop(host) { var k = host.children, i; for (i = k.length - 1; i >= 0; i--) if (k[i].classList && k[i].classList.contains("fg")) host.removeChild(k[i]); }
  /* 聊天示範裡「按」的動作怎麼演（照 act 那句旁白）：
     ① act 那一句出現的時候，手指去按前面卡片（或畫面）裡的那一顆；② 內建瀏覽器那張畫面（lp）有圈起來的地方，畫面一出來就去按那裡；③ 打 6 位數的畫面（br 的 type），6 位數一個一個打進去。
     兩則訊息之間隔多久：一般 MSG_GAP；有手指要按的（等手指按下去）TAP_GAP；打 6 位數的畫面（等 6 位數打完、「登入」亮起來）TYPE_GAP。
     一個情況全部放完要是超過 CHAT_CAP（4 秒），就只把「一般」的間隔縮短（最短 240），讓十幾則訊息的情況也在 4 秒內放完。 */
  var MSG_GAP = 480, TAP_GAP = 820, TYPE_GAP = 1300, CHAT_CAP = 4000;
  function tapTxt(s) { return String(s).replace(/\s+/g, " ").replace(/^ | $/g, ""); }
  function isType(m) { return m.w === "br" && !!m.o && m.o.st === "type"; }
  /* 第 21 批：會自己演一段的畫面（「輸入網址」的瀏覽器、「往下捲，看示範」的教學畫面）在最外層寫 data-ms＝整段演完要幾毫秒；這一列出來之後要等它演完，再換下一列 */
  function rowMs(row) { var e = row && row.querySelector ? row.querySelector("[data-ms]") : null; return e ? parseInt(e.getAttribute("data-ms"), 10) || 0 : 0; }
  /* 這句 act 要按的是前面哪一塊：找到回那個元素，找不到回 null。rows＝這個情況所有的列（畫好了，還沒放進畫面也行）、j＝這句是第幾列。
     act 的第二個參數 tap：不寫＝照句子裡第一個「」裡的字，找前面一樣寫著這幾個字的那一小塊；字串＝選擇器；[選擇器, 第幾個]；false＝這句不按。 */
  function tapFind(rows, j, m) {
    var spec = m.tap, label = "", q, k, i, all, found;
    if (m.w !== "act" || spec === false) return null;
    if (spec === undefined || spec === null) { q = /「([^」]+)」/.exec(m.t); if (!q) return null; label = q[1]; }
    for (k = j - 1; k >= 0; k--) {
      found = null;
      if (typeof spec === "string") found = rows[k].querySelector(spec);
      else if (spec && spec.length) found = rows[k].querySelectorAll(spec[0])[spec[1]];
      else {
        all = rows[k].querySelectorAll("*");
        for (i = 0; i < all.length; i++) if (!all[i].children.length && tapTxt(all[i].textContent) === label) { found = all[i]; break; }
      }
      if (found) return found;
    }
    return null;
  }
  /* 內建瀏覽器那張畫面（lp）有圈起來的地方，就是要按的：示範區那一種，按裡面第二個名稱（往下捲看示範、點裡面的選項） */
  function sceneTap(m, row) {
    if (m.w !== "lp" || !m.o || !m.o.hot) return null;
    if (m.o.hot === "stage") return null;   /* 第 21 批：「往下捲，看示範」那一張自己演（手指畫在畫面裡），不另外派手指 */
    return row.querySelector(".lp-st.hot .lp-chips i:nth-child(2)") || row.querySelector(".hot");
  }
  function chatPlan(msgs, tg, rows) {
    var n = msgs.length, g = [], at = [0], fixed = 0, plain = 0, base = MSG_GAP, i;
    for (i = 0; i < n - 1; i++) {
      g.push(tg[i] ? TAP_GAP : isType(msgs[i]) ? TYPE_GAP : rowMs(rows[i]) || 0);
      if (g[i]) fixed += g[i]; else plain++;
    }
    if (plain && fixed + plain * MSG_GAP > CHAT_CAP) base = Math.max(240, Math.floor((CHAT_CAP - fixed) / plain));
    for (i = 0; i < n - 1; i++) at.push(at[i] + (g[i] || base));
    return at;
  }
  /* 聊天示範：ch＝幾種情況；一種以上就有可以點的選項，一種就只有「重播」。第一次畫出來是完整的；點選項或按重播才一則一則跳出來（減少動態＝一次全出） */
  function demoChat(d) {
    var ch = d.ch, timers = [], btns = [], lastMs = 0;
    var chat = el("div", { class: "chat", role: "group", "aria-label": "LINE 聊天室的示意畫面" });
    var note = noteBox("");
    function stop() { timers.forEach(clearTimeout); timers = []; }
    function play(msgs, animate) {
      stop();
      var h = chat.offsetHeight, fl = firstFlags(msgs), last = msgs.length - 1, rows, tg, at;
      chat.textContent = "";
      lastMs = 0;
      if (!animate || REDUCE) {
        msgs.forEach(function(m, i) { chat.appendChild(bubble(m, false, fl[i])); });
        chat.style.minHeight = "";
        return;
      }
      rows = msgs.map(function(m, i) { return bubble(m, true, fl[i]); });
      tg = msgs.map(function(m, i) { return m.w === "act" ? tapFind(rows, i, m) : sceneTap(m, rows[i]); });
      at = chatPlan(msgs, tg, rows);
      lastMs = at[last] + (isType(msgs[last]) ? 900 : rowMs(rows[last]) || (tg[last] ? 1000 : 200));   /* 最後一則出來之後，還要等它自己的動畫：6 位數打完 0.9 秒、會自己演的畫面演完（data-ms：網址打進去換成網頁、往下捲看示範）、手指按完 1 秒、一般的跳出來 0.2 秒 */
      chat.style.minHeight = h + "px";
      rows.forEach(function(row, i) {
        timers.push(setTimeout(function() {
          chat.appendChild(row);
          if (tg[i]) tapAt(chat, tg[i]);
          if (i === last) chat.style.minHeight = "";
        }, at[i]));
      });
    }
    function pick(i, animate) {
      btns.forEach(function(b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      note.set(ch[i].n || "");
      play(ch[i].m, animate);
    }
    var head = el("div", { class: "stage-h" }, [
      el("span", { class: "stage-t", text: d.ttl || "看一次" }),
      replayBtn("重播（從第一個情況開始，自動示範一遍）", function() { pick(0, true); })
    ]);
    var stage = el("div", { class: "stage" + (d.seq ? " seq" : "") }, [head]);   /* seq：一步一步的示範（上面是 1 2 3 的步驟，下面是那一步的畫面）；電腦寬的畫面，步驟在左、畫面在右 */
    if (ch.length > 1) {
      var row = el("div", { class: "picks" + (d.list ? " list" : "") + (d.seq ? " seq" : ""), role: "group", "aria-label": d.ttl || "選一種" });
      ch.forEach(function(c, i) {
        var b = on(el("button", { type: "button", class: "pk", "aria-pressed": "false" }, d.list ? [el("span", { class: "n", "aria-hidden": "true", text: String(i + 1) }), el("span", { class: "pt" }, [c.l, c.s ? el("span", { class: "ps", text: c.s }) : null])] : [c.l]), "click", function() { pick(i, true); });
        btns.push(b);
        row.appendChild(b);
      });
      stage.appendChild(row);
    }
    stage.appendChild(chat);
    pick(0, false);
    stage.appendChild(el("p", { class: "capn", text: d.cap || "示意畫面：藥名、位置、代號、驗證碼都是編的。" }));
    return [stage, note, { ms: function() { return lastMs; } }];   /* ms：現在這個情況的動畫（訊息一則一則跳出來、手指按、6 位數打進去）要放多久，自動示範靠它決定什麼時候換下一個選項 */
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
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: "點一個，看它是什麼" }), replayBtn("重播（從第一個開始，自動示範一遍）", function() { show(keys[0]); })]),
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
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: "點一個，看它是什麼" }), replayBtn("重播（從第一個開始，自動示範一遍）", function() { show(keys[0]); })]),
      row,
      el("div", { class: "lcw act", role: "img", "aria-label": "平面圖示意：灰色長條、藍色方塊（棧）、一個有紅框的方塊，左邊寫著「大門」和一個向左的箭頭" }, [pl]),
      el("p", { class: "capn", text: "示意圖：照真的平面圖的畫法畫的，形狀是編的。" })
    ]);
    show(keys[0]);
    return [stage, note];
  }
  /* 「大門處或是出入口在你哪一邊，圖要怎麼轉」：中間是平面圖，四周是藥局的前、後、左、右；選大門處或是出入口在你的哪一邊，圖就轉到「大門」也在那一邊 */
  function demoTurn() {
    var btns = [], note = noteBox("");
    var tp = el("div", { class: "tp" }, [planEl("K2", true)]);
    var door = el("div", { class: "dch l", text: "🚪 大門處或是出入口" }), gap = el("div", { class: "dg l", "aria-hidden": "true" });
    var arena = el("div", { class: "arena", role: "img" }, [
      el("span", { class: "ax f", "aria-hidden": "true", text: "▲ 前面" }),
      el("span", { class: "ax l", "aria-hidden": "true", text: "左手邊" }), el("span", { class: "ax r", "aria-hidden": "true", text: "右手邊" }), gap, door, el("div", { class: "tpw" }, [tp])
    ]);
    var SIDE = { f: "上面", r: "右邊", b: "下面", l: "左邊" };   /* 轉好後紅框在圖的哪一邊（右手邊那一格，紅框轉到下面：b 只用在這裡的句子，不是示範的選項） */
    function pick(i) {
      var t = TURNS[i];
      tp.style.transform = "rotate(" + t.deg + "deg)";   /* 三個方向最多轉半圈（0、90、180 度），直接轉到那個角度就好 */
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
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: "翻轉你的手機來看位置在哪裡" }), replayBtn("重播（從第一個開始，自動示範一遍）", function() { pick(0); })]),
      el("p", { class: "capq", text: "大門處或是出入口在你的哪一邊？點一個，看圖怎麼轉。" }),
      row,
      arena,
      el("p", { class: "capn", text: "示意圖：你站在藥局中間，面對手機上方；虛線框是藥局的四面牆，粗線和小牌子是大門處或是出入口。圖是編的。" })
    ]);
    pick(0);
    return [stage, note];
  }
  /* LINE 輸入列的畫面本身：上面那排按鈕（chips）＋下面的輸入框；hot＝圈起來的那一顆（mic 或按鈕）；pick＝按鈕可以點（chipEls 收按鈕、onPick 是點了之後做什麼）。示範區（demoQbar）和聊天示範裡的 qb 畫面共用 */
  function qbarEl(d, chipEls, onPick) {
    var bar = el("div", { class: "qbar", role: d.pick ? "group" : "img", "aria-label": d.chips ? "LINE 的輸入框，上面有一排按鈕：網頁、教學、藥品通知、BUG、加入補藥神器" : "LINE 的輸入框，最右邊是麥克風" });
    chipEls = chipEls || {};
    if (d.chips) {
      var row = el("div", { class: "qrow" });
      if (d.pick) on(row, "focusin", function(e) {   /* 這一排放不下時（第 5 顆）：用 Tab 跳到哪一顆，就把那一排捲到看得到那一顆——這個框是「container-type」，瀏覽器不會自己幫忙捲 */
        var t = e.target, tr, rr, pad = 8;
        if (!t || !t.getBoundingClientRect) return;
        tr = t.getBoundingClientRect(); rr = row.getBoundingClientRect();
        if (tr.right > rr.right - pad) row.scrollLeft += tr.right - rr.right + pad;
        else if (tr.left < rr.left + pad) row.scrollLeft -= rr.left + pad - tr.left;
      });
      QCHIPS.forEach(function(c) {
        var on_ = d.hot === c.k;
        if (d.pick) {
          chipEls[c.k] = el("button", { type: "button", class: "qchip", "aria-pressed": "false", text: c.t });
          on(chipEls[c.k], "click", function() { onPick(c.k); });
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
    return bar;
  }
  function demoQbar(d) {
    var note = noteBox(""), chipEls = {};
    function showChip(k) {
      QCHIPS.forEach(function(c) { chipEls[c.k].setAttribute("aria-pressed", c.k === k ? "true" : "false"); if (c.k === k) note.set(c.n); });
    }
    var bar = qbarEl(d, chipEls, showChip);
    var kids = [bar];
    if (d.cmd) kids.push(el("div", { class: "cmd", text: d.cmd }));
    var stage = el("div", { class: "stage" }, [el("div", { class: "stage-h" }, d.pick ? [el("span", { class: "stage-t", text: "按按看" }), replayBtn("重播（從第一個開始，自動示範一遍）", function() { showChip(QCHIPS[0].k); })] : [el("span", { class: "stage-t", text: "在這裡" })])].concat(kids));
    if (d.pick) showChip(QCHIPS[0].k);
    return [stage, note];
  }
  function tipsEl(items) {
    return el("div", { class: "tiles" }, items.map(function(it) {
      return el("div", { class: "tile" }, [el("span", { class: "e", "aria-hidden": "true", text: it.e }), el("b", { text: it.b }), el("span", { class: "s", text: it.s })]);
    }));
  }
  /* ───────── 互動練習：打字查藥（第 17 批）─────────
     「打字查藥」那一課最後一段「換你打打看」：自己在輸入框打字（或點範例字），送出後先看到「機器人查詢中…」→ 聊天室裡出現官方帳號回的卡片 → 下面深色的框一步一步講機器人是怎麼找到的。
     「找」照真的機器人（01_程式碼.gs 的 handleText → searchDrug → replyResults）的順序，在這一頁編的藥（DR）裡找：
       是不是指令？→ 是不是一個品項藥品的 CODE？→ 是不是位置？→ 商品名／中文名／學名有這幾個字？→ 位置的字？→ 空格、符號拿掉再比 → 容許打錯一兩個字 → 都沒有就查無。
     只做這一課教的查法：指令（教學、公告、bug…）、加符號的整批查詢（第 8 課）、一次打好幾個 CODE 只在聊天室旁白、深色框說明，不示範結果；縮寫、中文跳字、「有相符的藥品嗎？」的猜名字都沒做。
     這一段（SIMSEARCH 標記之間）是純函式、沒有碰畫面，測試會單獨拿出來跑。打的字不存、不傳（頁面本來就不連網）。 */
  /*SIMSEARCH*/
  var SIM_MAX = 12, SIM_SQ_MIN = 3, SIM_LOC_RE = /^(水)?[A-Z]{1,2}[0-9]{1,3}$/;   /* 一次最多 12 張卡片（01 的 MAX_RESULTS）；打幾個字以上才「拿掉符號再比」（SQ_MIN）；長得像位置的字（LOC_CODE_RE） */
  var SIM_O = { "90104": { spots: SPOTS, on: 0 } };   /* 這品項藥品放好幾個地方（看平面圖那一課），卡片上就有那幾顆位置按鍵 */
  var SIM_LOCS = { "K2": { spec: L_K2, n: 4 }, "B1": { spec: L_B1, n: 14, pages: 2 } };   /* K2、B1 用前面「彙整卡片」那一課的列表（K2 有 4 個品項、B1 有 14 個品項分 2 頁），兩邊看到的才一樣 */
  var SIM_SYM = "[^\\w\\s\\u4e00-\\u9fff\\u3040-\\u30ff\\uff10-\\uff19\\uff21-\\uff3a\\uff41-\\uff5a]|_";   /* 01 的 SYM_CLASS：不是字母、數字、空白、中日文的，就算「符號」 */
  var SIM_RE_AGG = new RegExp("^(?:" + SIM_SYM + ")+\\s*([\\s\\S]*)$");   /* 01 的 RE_AGG_SYM：開頭是符號＝整批查詢 */
  var SIM_RE_BUG = new RegExp("^(?:" + SIM_SYM + ")*\\s*(?:bug|回報|report|問題)\\s*([\\s\\S]*)$", "i");   /* 01 的 RE_BUG */
  var SIM_RE_NOTICE = /^(?:公告|公佈|公布|藥品通知|通知)(?:\s+[\s\S]+)?$/;   /* 04 的 _noticeCmd_ */
  var SIM_RE_WEB = /^(?:開發者\s*|藥師\s*)?(?:網頁|網頁版|網站|web)(?:\s*(?:開發者|藥師))?(?:\s*(?:重發|重新|新連結|new|綁定|綁裝置|bind))?$/i;   /* 09 的 APP_CMD_RE */
  var SIM_RE_MULTI = /^\d{4,6}(?:[\s,，、;；\/／|｜.。]+\d{4,6})+$/;   /* 01 的 _multiParts_：用空格、逗號…隔開、每一段都是 4～6 位數字＝一次查好幾個 CODE */
  var SIM_ROWS = null;
  /* 是不是指令（順序照真的：功能導覽 → /用量 → 回報 → /指令 → 網頁 → 公告）：是就回 [指令名, 機器人會做的事]，不是回 null */
  function simCmd(s) {
    var t = s.replace(/　/g, " ").replace(/^\s+|\s+$/g, ""), m, k = t.replace(/\s+/g, "").toLowerCase();
    if (/^(教學|功能|操作)$/.test(t)) return [t, "回「📖 補藥神器　教學」卡片"];
    if (k === "/用量" || k === "用量報表" || k === "usage" || k === "/usage") return [k, "回最近幾天的使用量"];
    m = t.match(SIM_RE_BUG);
    if (m) return ["bug", m[1] ? "把你的回報記下來，通知開發者" : "問你要回報什麼"];
    if (/^\/(?:指令|help|說明)(?:\s|$)/i.test(t)) return [t.split(/\s+/)[0], "回指令一覽"];
    if (SIM_RE_WEB.test(t)) return [t, "回「打開網頁」的卡片"];
    if (SIM_RE_NOTICE.test(t)) return [t.split(/\s+/)[0], "回藥品通知"];
    return null;
  }
  function simFull(s) { return s.replace(/[！-～]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 65248); }); }   /* 全形英數、符號 → 半形 */
  function simNorm(s) { return simFull(s).replace(/　/g, " ").replace(/[，、；;,\/／\-－+＋]/g, " ").replace(/\s+/g, " ").replace(/^ | $/g, ""); }   /* 01 的 normKeyword_：逗號、斜線、減號、加號都當空格 */
  /* 01 的 splitAlnum_：英數字和中文黏在一起的，拆開再找（TESTOLOL25 → TESTOLOL 25） */
  function simSplit(s) {
    var out = s.replace(/([A-Za-z])(\d)/g, "$1 $2").replace(/(\d)([A-Za-z])/g, "$1 $2").replace(/([一-鿿])([A-Za-z0-9])/g, "$1 $2").replace(/([A-Za-z0-9])([一-鿿])/g, "$1 $2").replace(/\s+/g, " ").replace(/^ | $/g, ""), parts = out.split(" ").filter(String), longest = 0, i;
    if (parts.length < 2) return "";
    for (i = 0; i < parts.length; i++) {
      if (parts[i].length < 2) return "";
      if (parts[i].length > longest) longest = parts[i].length;
    }
    return longest >= 3 ? out : "";
  }
  /* 這一頁編的藥，排成真的那份索引的樣子：CODE、商品名、中文名、學名（找名字只看這四個）＋位置、劑型 */
  function simRows() {
    if (SIM_ROWS) return SIM_ROWS;
    SIM_ROWS = Object.keys(DR).sort().map(function(c) {
      var r = DR[c], b = r.b.toUpperCase(), z = r.z.toUpperCase(), g = r.g.toUpperCase(), l = r.loc.toUpperCase();
      return { c: c, b: b, z: z, g: g, loc: l, hay: [c, b, z, g].join("\t"), all: [c, b, z, g, l, r.f.toUpperCase()].join("\t") };
    });
    return SIM_ROWS;
  }
  function simLocHit(r, kw) {   /* 01 的 locHit_：長得像位置的字要整個一樣（括號後面不算）；其他字有出現就算 */
    if (!r.loc) return false;
    if (SIM_LOC_RE.test(kw)) return r.loc === kw || r.loc.replace(/[（(].*$/, "").replace(/^\s+|\s+$/g, "") === kw;
    return r.loc.indexOf(kw) >= 0;
  }
  function simRank(r, kw) {   /* 01 的 _rankScore_：名字一模一樣 0、商品名或中文名開頭一樣 1、學名開頭一樣 2、其他 3 */
    if (r.b === kw || r.z === kw) return 0;
    if (r.b.indexOf(kw) === 0 || r.z.indexOf(kw) === 0) return 1;
    if (r.g.indexOf(kw) === 0) return 2;
    return 3;
  }
  /* 01 的 searchOnce_（exact）：一個 CODE 一模一樣 → 位置 → 每個字都在 CODE／商品名／中文名／學名裡 → 每個字都在位置裡 */
  function simOnce(text, mode) {
    var kws = text.toUpperCase().split(/\s+/).filter(String), rows = simRows(), i, hits;
    if (!kws.length) return null;
    if (mode === "fuzzy") return simFuzzy(kws, rows);
    if (kws.length === 1) {
      for (i = 0; i < rows.length; i++) if (rows[i].c === kws[0]) return { how: "code", all: [rows[i].c], kws: kws };
      if (SIM_LOC_RE.test(kws[0])) {
        hits = rows.filter(function(r) { return simLocHit(r, kws[0]); });
        if (hits.length) return { how: "loc", all: hits.map(function(r) { return r.c; }), kws: kws, key: kws[0] };
      }
    }
    hits = [];
    rows.forEach(function(r, n) { if (kws.every(function(k) { return r.hay.indexOf(k) >= 0; })) hits.push({ c: r.c, n: n, s: simRank(r, kws[0]) }); });
    if (hits.length) {
      hits.sort(function(a, b) { return a.s - b.s || a.n - b.n; });
      return { how: "name", all: hits.map(function(h) { return h.c; }), kws: kws };
    }
    hits = rows.filter(function(r) { return kws.every(function(k) { return simLocHit(r, k); }); });
    if (hits.length) return { how: "locText", all: hits.map(function(r) { return r.c; }), kws: kws, key: kws.length === 1 ? kws[0] : "" };
    return null;
  }
  function simSqz(s, keepTab) { return simFull(s).toUpperCase().replace(keepTab ? /[^A-Z0-9\t一-鿿]/g : /[^A-Z0-9一-鿿]/g, ""); }
  /* 01 的 _sqScan_：空格、符號全部拿掉再比（打 sample xin、SAMPLE-XIN 都找得到）；從哪一欄的開頭對起來的排前面 */
  function simSq(raw) {
    var sq = simSqz(raw, false), cand = [];
    if (sq.length < SIM_SQ_MIN || /^\d+$/.test(sq)) return null;
    simRows().forEach(function(r, n) {
      var h = simSqz(r.hay, true), p = h.indexOf(sq);
      if (p >= 0) cand.push({ c: r.c, n: n, s: p === 0 || h.charAt(p - 1) === "\t" ? 0 : 1 });
    });
    if (!cand.length) return null;
    cand.sort(function(a, b) { return a.s - b.s || a.n - b.n; });
    return { how: "sq", all: cand.map(function(x) { return x.c; }), kws: [sq] };
  }
  /* 容許打錯字（01 的 fuzzyMaxDist_／fuzzyPieces_／fuzzyDistEn／fuzzyDistZh／editDist／_fuzzyScan_，照搬）：英數字 3 個字以上容許錯 1 個（6 個字以上 2 個）；中文 2 個字以上容許錯 1 個（5 個字以上 2 個）；相鄰兩個字顛倒算錯 1 個 */
  function simFuzzyMax(kw) {
    if (/^[A-Z0-9]+$/.test(kw)) return kw.length < 3 ? 0 : (kw.length >= 6 ? 2 : 1);
    if (/[一-鿿]/.test(kw)) return kw.length < 2 ? 0 : (kw.length >= 5 ? 2 : 1);
    return 0;
  }
  function simPieces(kw) {
    var maxDist = simFuzzyMax(kw), n, size, out = [], i, s, b, m, sw;
    if (maxDist < 1) return null;
    n = maxDist + 1;
    size = Math.floor(kw.length / n);
    if (size < 1) return [kw];
    for (i = 0; i < n; i++) {
      s = i * size;
      out.push(kw.substring(s, i === n - 1 ? kw.length : s + size));
    }
    for (b = 1; b < n; b++) {
      m = b * size;
      if (m < 1 || m >= kw.length) continue;
      sw = kw.substring(0, m - 1) + kw.charAt(m) + kw.charAt(m - 1) + kw.substring(m + 1);
      out.push(sw.substring((b - 1) * size, m));
      out.push(sw.substring(m, Math.min(m + size, kw.length)));
    }
    return out;
  }
  function simEdit(a, b, max) {
    var la = a.length, lb = b.length, prev2 = null, prev = [], cur, i, j, cost, v, t, rowMin;
    if (Math.abs(la - lb) > max) return max + 1;
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur = [i];
      rowMin = i;
      for (j = 1; j <= lb; j++) {
        cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
          t = prev2[j - 2] + 1;
          if (t < v) v = t;
        }
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev;
      prev = cur;
    }
    return prev[lb];
  }
  function simDistEn(hay, kw) {
    var maxDist = simFuzzyMax(kw), tokens, best = 99, i, t, d;
    if (maxDist < 1) return 99;
    tokens = hay.split(/[^A-Z0-9]+/);
    for (i = 0; i < tokens.length; i++) {
      t = tokens[i];
      if (t.length < 3) continue;
      if (Math.abs(t.length - kw.length) > maxDist) continue;
      d = simEdit(kw, t, maxDist);
      if (d < best) {
        best = d;
        if (best === 0) break;
      }
    }
    return best;
  }
  function simDistZh(target, kw) {
    var maxDist = simFuzzyMax(kw), best = 99, win, s, d;
    if (maxDist < 1 || !target) return 99;
    for (win = kw.length - 1; win <= kw.length + 1; win++) {
      if (win < 2 || win > target.length) continue;
      for (s = 0; s + win <= target.length; s++) {
        d = simEdit(kw, target.substring(s, s + win), maxDist);
        if (d < best) {
          best = d;
          if (best === 0) return 0;
        }
      }
    }
    return best;
  }
  function simFuzzy(kws, rows) {
    var pieces = [], kinds = [], limits = [], shortKw = false, cand = [], best = 0, k, pc, i, r, p, maybe, total, ok, d, d2, bestD, tight, use, cap;
    for (k = 0; k < kws.length; k++) {
      pc = simPieces(kws[k]);
      if (!pc) return null;
      pieces.push(pc);
      kinds.push(/^[A-Z0-9]+$/.test(kws[k]) ? "EN" : "ZH");
      limits.push(simFuzzyMax(kws[k]));
      if (kws[k].length <= 2) shortKw = true;
    }
    cap = shortKw ? 120 : 300;
    for (i = 0; i < rows.length; i++) {
      r = rows[i];
      maybe = false;
      for (p = 0; p < pieces[0].length; p++) if (r.all.indexOf(pieces[0][p]) >= 0) { maybe = true; break; }
      if (!maybe) continue;
      total = 0;
      ok = true;
      for (k = 0; k < kws.length; k++) {
        if (kinds[k] === "EN") d = simDistEn(r.hay, kws[k]);
        else {
          d = simDistZh(r.z, kws[k]);
          if (d > limits[k]) {
            d2 = simDistZh(r.b, kws[k]);
            if (d2 <= limits[k]) d = d2 + 0.5;
          }
        }
        if (d > limits[k]) { ok = false; break; }
        total += d;
      }
      if (!ok) continue;
      cand.push({ c: r.c, n: i, d: total });
      if (total <= kws.length) best++;
      if (best >= SIM_MAX || cand.length >= cap) break;
    }
    if (!cand.length) return null;
    cand.sort(function(a, b) { return a.d - b.d || a.n - b.n; });
    use = cand;
    bestD = cand[0].d;
    tight = 0;
    while (tight < cand.length && cand[tight].d === bestD) tight++;
    if (tight >= 3) use = cand.slice(0, tight);   /* 最接近的有 3 個品項藥品以上並列，只留並列第一的（01 的 FUZZY_MIX_MIN） */
    return { how: "fuzzy", all: use.map(function(x) { return x.c; }), kws: kws, codeLike: /^\d{4,6}$/.test(kws[0]) };
  }
  /* 一個位置的列表卡（K2、B1 用前面那一課編好的；其他位置照 DR 現場排） */
  function simLocSpec(key, codes) {
    return { t: key, s: "這一格有 " + codes.length + " 個品項", hide: 1, ft: "按任何一列 → 出完整卡片", g: [{ n: "", rows: codes }] };
  }
  /* 送出一串字，回「機器人會怎麼找、找到什麼」：kind＝cmd 指令／agg 加符號的整批查詢／multi 一次查好幾個 CODE／code／loc／locText／name／sq／fuzzy／fuzzyCode／none；打的字是空的就回 null */
  function simQuery(raw) {
    var q = String(raw === null || raw === undefined ? "" : raw).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ").substring(0, 40).replace(/\s+$/, ""), tried = {}, attempts = [], norm, cmd, am, rest, i, r, out;
    function plan(k) { var s = String(k || "").replace(/^\s+|\s+$/g, ""); if (!s || tried[s]) return; tried[s] = true; attempts.push(s); }
    if (!q) return null;
    cmd = simCmd(q);
    if (cmd) return { kind: "cmd", q: q, cmd: cmd };
    am = q.match(SIM_RE_AGG);
    if (am) {
      rest = (am[1] || "").replace(/^\s+|\s+$/g, "");
      if (SIM_RE_NOTICE.test(rest)) return { kind: "cmd", q: q, cmd: [rest.split(/\s+/)[0], "回藥品通知"] };
      return { kind: "agg", q: q, sym: q.charAt(0), rest: rest };
    }
    if (SIM_RE_MULTI.test(q)) return { kind: "multi", q: q, n: q.split(/[\s,，、;；\/／|｜.。]+/).filter(String).length };
    norm = simNorm(q);
    plan(q);
    plan(simSplit(q));
    plan(norm);
    plan(simSplit(norm));
    plan(norm.replace(/\s+/g, ""));
    for (i = 0; i < attempts.length; i++) {
      r = simOnce(attempts[i], "exact");
      if (r) { out = r; out.attempt = attempts[i]; break; }
    }
    if (!out) {
      r = simSq(q);
      if (r) out = r;
    }
    if (!out) {
      for (i = 0; i < attempts.length; i++) {
        r = simOnce(attempts[i], "fuzzy");
        if (r) { out = r; out.attempt = attempts[i]; break; }
      }
    }
    if (!out) return { kind: "none", q: q, codes: [], total: 0 };
    out.q = q;
    out.total = out.all.length;
    out.codes = out.all.slice(0, SIM_MAX);
    out.kind = out.how === "fuzzy" ? (out.codeLike ? "fuzzyCode" : "fuzzy") : out.how;
    if (out.kind === "loc" && SIM_LOCS[out.key]) { out.list = SIM_LOCS[out.key].spec; out.total = SIM_LOCS[out.key].n; out.pages = SIM_LOCS[out.key].pages || 1; }
    else if ((out.kind === "loc" || out.kind === "locText") && out.key && out.all.length >= 2) { out.list = simLocSpec(out.key, out.all); out.pages = 1; }
    return out;
  }
  /* 聊天室裡的這一串：我打的字，接著機器人回的（卡片、列表卡、查無卡，CODE 打錯的話前面多一句警告）；指令、整批查詢只放一行旁白 */
  function simMsgs(r) {
    var ms = [me(r.q)];
    if (r.kind === "cmd") ms.push(act("練習不示範指令「" + r.cmd[0] + "」：真的 LINE 會" + r.cmd[1]));
    else if (r.kind === "agg") ms.push(act("練習不示範加符號的整批查詢（第 8 課）"));
    else if (r.kind === "multi") ms.push(act("練習不示範一次查好幾個 CODE：真的 LINE 會每個都查，把找到的卡片一起傳回來"));
    else if (r.kind === "none") ms.push(nf(r.q));
    else if (r.list) ms.push(ll(r.list));
    else {
      if (r.kind === "fuzzyCode") ms.push(bot(codeWarn(r.q)));
      ms.push(r.codes.length === 1 ? dc(r.codes[0], SIM_O[r.codes[0]]) : { w: "car", cs: r.codes.map(function(c) { return { c: c, o: SIM_O[c] || {} }; }) });
    }
    return ms;
  }
  function simDesc(c, full) { var r = DR[c]; return r.z + "（" + (full ? "CODE " + c + "，位置 " + r.loc : c) + "）"; }
  function simCols(codes, kw) {   /* 這幾個品項藥品是在哪一欄找到的，例：商品名 2 個品項藥品、學名 1 個品項藥品 */
    var n = { "商品名": 0, "中文名": 0, "學名": 0, "CODE": 0 }, out = [];
    codes.forEach(function(c) {
      var r = DR[c];
      if (r.b.toUpperCase().indexOf(kw) >= 0) n["商品名"]++;
      else if (r.z.toUpperCase().indexOf(kw) >= 0) n["中文名"]++;
      else if (r.g.toUpperCase().indexOf(kw) >= 0) n["學名"]++;
      else n["CODE"]++;
    });
    ["商品名", "中文名", "學名", "CODE"].forEach(function(k) { if (n[k]) out.push(k + " " + n[k] + " 個品項藥品"); });
    return out.join("、");
  }
  /* 深色框「背後發生的事」的內容：trail＝機器人一步一步看了什麼（ok 1＝就是這個、0＝不是、2＝換個寫法或放寬才找到），found＝找到什麼，reply＝回了哪一種卡片，tip＝提醒（字太少、查無才有） */
  function simSteps(r) {
    var kind = r.kind, kws = r.kws || r.q.toUpperCase().split(/\s+/).filter(String), many = kws.length > 1, shown = r.attempt || r.q, qs = "「" + shown + "」", n = r.total || 0, list = r.list, tr = [], found = "", reply = "", tip = "", names, locLike;
    function t(ok, s) { tr.push({ ok: ok, t: s }); }
    function done() { return { trail: tr, found: found, reply: reply, tip: tip }; }
    if (kind === "cmd") {
      t(1, "是指令嗎？是，「" + r.cmd[0] + "」是指令，機器人不查藥");
      found = "指令不查藥";
      reply = "機器人直接" + r.cmd[1] + "。這個練習只示範查藥，所以這裡不回。";
      return done();
    }
    t(0, "是指令嗎？不是");
    if (kind === "agg") {
      t(1, "開頭有符號「" + r.sym + "」嗎？有，這是「整批列出來」的查法（第 8 課）");
      found = "學名（或適應症）有這個字的藥";
      reply = "整批列成一張表。這個練習只示範這一課教的查法，所以這裡不回。";
      return done();
    }
    if (kind === "multi") {
      t(1, "是好幾個 CODE 嗎？是，用空格或逗號隔開的 " + r.n + " 個 CODE");
      found = "每個 CODE 各查一次";
      reply = "把找到的藥一起回。這個練習只示範查一個品項藥品，所以這裡不回。";
      return done();
    }
    if (r.attempt && r.attempt !== r.q && kind !== "sq" && kind !== "fuzzy" && kind !== "fuzzyCode") t(2, "照原樣找不到，把空格、符號整理一下，換成" + qs + "再找");
    if (kind === "code") {
      t(1, "是 CODE 嗎？是，" + qs + "剛好是一個品項藥品的 CODE，直接找到");
      found = "1 個品項藥品：" + simDesc(r.codes[0], true);
      reply = "1 張藥品卡片";
      return done();
    }
    t(0, many ? "是 CODE 嗎？不是，空格隔開的是好幾個字一起找" : "是 CODE 嗎？不是，沒有一個品項藥品的 CODE 是" + qs);
    locLike = kws.length === 1 && SIM_LOC_RE.test(kws[0]);
    if (kind === "loc") {
      t(1, "是位置嗎？是，" + qs + "是位置（英文字母加數字），有藥放在這一格");
      if (list) {
        found = "這一格有 " + n + " 個品項藥品";
        reply = "1 張列表卡：一列一個品項藥品，按一列出那品項藥品的完整卡片" + (r.pages > 1 ? "；品項多會分頁，往左滑" : "");
      } else {
        found = "這一格只有 1 個品項藥品：" + simDesc(r.codes[0], true);
        reply = "1 張藥品卡片";
      }
      return done();
    }
    if (locLike) t(0, "是位置嗎？長得像位置（英文字母加數字），但沒有藥放在" + qs);
    if (kind === "name") {
      t(1, many ? "商品名、中文名、學名裡有這幾個字嗎？每個字都有的，找到 " + n + " 個品項藥品" : "商品名、中文名、學名裡有" + qs + "嗎？有，找到 " + n + " 個品項藥品");
      if (n === 1) {
        found = "1 個品項藥品：" + simDesc(r.codes[0], true);
        if (!many) found += "，是在「" + simCols(r.codes, kws[0]).replace(/ 1 個品項藥品$/, "") + "」這一欄找到的";
      } else {
        names = r.codes.slice(0, 5).map(function(c) { return simDesc(c, false); }).join("、") + (r.codes.length > 5 ? "…" : "");
        found = "共 " + n + " 個品項藥品" + (!many ? "（" + simCols(r.all, kws[0]) + "）" : "") + "：" + names;
      }
      reply = n === 1 ? "1 張藥品卡片" : r.codes.length + " 張藥品卡片，排成一排，往左滑；名字一模一樣、開頭一樣的排前面" + (n > SIM_MAX ? "（最多 " + SIM_MAX + " 張）" : "");
      if (n > SIM_MAX) tip = "符合的藥太多了，這裡只回前 " + SIM_MAX + " 張。多打幾個字，結果會更少、更準。";
      return done();
    }
    if (kind === "locText") {
      t(0, many ? "商品名、中文名、學名裡有這幾個字嗎？沒有" : "商品名、中文名、學名裡有" + qs + "嗎？沒有");
      t(1, "位置的字裡有" + qs + "嗎？有，找到 " + n + " 個品項藥品");
      found = list ? "這一格有 " + n + " 個品項藥品" : n + " 個品項藥品：" + r.codes.slice(0, 5).map(function(c) { return simDesc(c, true); }).join("、");
      reply = list ? "1 張列表卡：一列一個品項藥品，按一列出那品項藥品的完整卡片" : r.codes.length === 1 ? "1 張藥品卡片" : r.codes.length + " 張藥品卡片，排成一排，往左滑";
      return done();
    }
    t(0, many ? "商品名、中文名、學名、位置裡有這幾個字嗎？沒有，一模一樣的找不到" : "商品名、中文名、學名、位置裡有" + qs + "嗎？沒有，一模一樣的找不到");
    if (kind === "sq") {
      t(2, "把空格、符號都拿掉再比：找到 " + n + " 個品項藥品");
      names = r.codes.slice(0, 5).map(function(c) { return simDesc(c, n === 1); }).join("、") + (r.codes.length > 5 ? "…" : "");
      found = n === 1 ? "1 個品項藥品：" + names : "共 " + n + " 個品項藥品：" + names;
      reply = n === 1 ? "1 張藥品卡片" : r.codes.length + " 張藥品卡片，排成一排，往左滑";
      return done();
    }
    t(0, "把空格、符號都拿掉再比：也沒有");
    if (kind === "fuzzy" || kind === "fuzzyCode") {
      t(2, kind === "fuzzyCode" ? "放寬一點，找「CODE 相近」的：找到 " + n + " 個品項藥品" : "放寬一點，容許錯一、兩個字：找到最接近的 " + n + " 個品項藥品");
      names = r.codes.slice(0, 5).map(function(c) { return simDesc(c, r.codes.length === 1); }).join("、") + (r.codes.length > 5 ? "…" : "");
      found = (kind === "fuzzyCode" ? "CODE 相近的 " : "最接近的 ") + n + " 個品項藥品：" + names;
      if (kind === "fuzzyCode") reply = "先傳一句「⚠️ 找不到 CODE」，再傳 " + r.codes.length + " 張藥品卡片。這不是你輸入的那一個品項藥品，要核對藥櫃標籤紙";
      else reply = (r.codes.length === 1 ? "1 張藥品卡片，直接帶出來，不會先問你" : r.codes.length + " 張藥品卡片，往左滑") + "。不是你要的，就換個字再查";
      return done();
    }
    t(0, "放寬一點，容許錯一、兩個字：也找不到");
    found = "0 個品項藥品";
    reply = "1 張「查無」卡：黃框寫「請翻閱『藥品位置查詢表』」，下面還有幾個小技巧";
    tip = "練習用的藥都是編的，打真的藥名一定查無；想查真的藥，回 LINE 打。";
    return done();
  }
  /*/SIMSEARCH*/

  /* ───────── 互動練習的畫面（第 17 批）─────────
     輸入框＋「送出」在最上面（結果往下長，手指不用跟著結果跑）；範例字點一下就「幫你打好、直接送出」；送出後依序：我打的字 → 機器人查詢中（三個點）→ 機器人回的卡片 → 最後一行旁白請你往下看深色的框。
     深色框「背後發生的事」把 simSteps 算出來的每一步寫成白話；「重來」把聊天室、深色框、輸入框全部清空。
     不用 <form>：Enter 自己接（輸入法選字中不算送出）；打的字只用 textContent 放進畫面，不存、不傳。裝置設定「減少動態」：不等、不跳動畫，一次全出。 */
  var simN = 0;
  function simTyping() {
    return el("div", { class: "rw bot first pop" }, [el("span", { class: "ava", "aria-hidden": "true" }), el("div", { class: "bub bot typing", role: "status", "aria-label": "機器人查詢中" }, [el("i", { "aria-hidden": "true" }), el("i", { "aria-hidden": "true" }), el("i", { "aria-hidden": "true" })])]);
  }
  function keysEl(items) {
    return el("div", { class: "keys" }, [
      el("h3", { text: "這一段，記住 " + items.length + " 件事" }),
      el("ol", {}, items.map(function(t, i) { return el("li", {}, [el("span", { class: "rn", "aria-hidden": "true", text: String(i + 1) }), el("div", {}, [rich(t)])]); }))
    ]);
  }
  function demoSim(d) {
    var hid = "simh" + (++simN), timers = [];
    var chat = el("div", { class: "chat sim-chat", role: "group", "aria-label": "練習用的假聊天室" });
    var net = el("div", { class: "net", "aria-live": "polite" });
    var hint = el("p", { class: "sim-hint", id: hid, role: "status" });
    var input = el("input", { type: "text", class: "sim-in", maxlength: "40", autocomplete: "off", autocapitalize: "off", autocorrect: "off", spellcheck: "false", enterkeyhint: "send", placeholder: "例：" + (d.pre || d.ex)[0], "aria-label": "練習用的輸入框：打一個藥名、CODE 或位置", "aria-describedby": hid });
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function after(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function say(t) { hint.textContent = t || ""; }
    function netHead() { return el("div", { class: "net-h" }, ["背後發生的事", el("span", { text: "機器人一步一步做了什麼" })]); }
    function netIdle() {
      net.setAttribute("data-kind", "idle");
      net.removeAttribute("aria-busy");
      net.textContent = "";
      net.appendChild(netHead());
      net.appendChild(el("p", { class: "net-idle", text: "還沒送出東西。送出一個字，這裡會一步一步寫給你看：機器人收到之後先做什麼、再做什麼、最後找到什麼。" }));
    }
    function netShow(r) {
      var s = simSteps(r);
      net.setAttribute("data-kind", r.kind);
      net.removeAttribute("aria-busy");
      net.textContent = "";
      net.appendChild(netHead());
      net.appendChild(el("p", { class: "net-q" }, ["你送出：", el("b", { text: "「" + r.q + "」" })]));
      net.appendChild(el("ol", { class: "net-l" }, s.trail.map(function(x) {
        return el("li", { class: x.ok === 1 ? "y" : x.ok === 2 ? "r" : "n" }, [el("span", { class: "ni", "aria-hidden": "true", text: x.ok === 1 ? "✓" : x.ok === 2 ? "≈" : "✕" }), el("span", { text: x.t })]);
      })));
      net.appendChild(el("dl", { class: "net-r" }, [el("dt", { text: "找到" }), el("dd", { text: s.found }), el("dt", { text: "機器人回" }), el("dd", { text: s.reply })]));
      if (s.tip) net.appendChild(el("p", { class: "net-t", text: s.tip }));
    }
    function emptyChat() {
      chat.textContent = "";
      chat.style.minHeight = "";
      chat.appendChild(el("p", { class: "sim-empty", text: "👆 在上面的輸入框打字，按「送出」。機器人的回覆會出現在這裡。" }));
    }
    function reset() {
      clearTimers();
      input.value = "";
      say("");
      emptyChat();
      netIdle();
    }
    function run(text) {
      var r = simQuery(text), msgs, fl, rows, h, tp, i, last;
      clearTimers();
      if (!r) {
        say("先在上面的輸入框打幾個字（或點下面的範例字），再按「送出」。");
        try { input.focus(); } catch (e) {}
        return;
      }
      say("");
      input.value = "";
      try { if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches && document.activeElement === input) input.blur(); } catch (e) {}   /* 手機：收起鍵盤，結果才看得到 */
      msgs = simMsgs(r);
      msgs.push(act("👇 往下捲，看深色的框：機器人是怎麼找到的"));
      fl = firstFlags(msgs);
      rows = msgs.map(function(m, j) { return bubble(m, !REDUCE, fl[j]); });
      last = rows.length - 1;
      h = chat.offsetHeight;
      chat.textContent = "";
      chat.style.minHeight = h + "px";   /* 換內容的時候先撐住原本的高度，下面的東西不會先縮上去再長下來 */
      chat.appendChild(rows[0]);
      net.setAttribute("aria-busy", "true");
      if (REDUCE) {
        for (i = 1; i <= last; i++) chat.appendChild(rows[i]);
        chat.style.minHeight = "";
        netShow(r);
        return;
      }
      tp = simTyping();
      after(420, function() { chat.appendChild(tp); });
      after(1250, function() {
        if (tp.parentNode) tp.parentNode.removeChild(tp);
        chat.appendChild(rows[1]);
        netShow(r);
        if (last === 1) chat.style.minHeight = "";
      });
      for (i = 2; i <= last; i++) {
        (function(row, k) {
          after(1250 + (k - 1) * 480, function() {
            chat.appendChild(row);
            if (k === last) chat.style.minHeight = "";
          });
        })(rows[i], i);
      }
    }
    function fill(w) {
      clearTimers();
      input.value = w;
      if (REDUCE) run(w); else after(260, function() { run(w); });   /* 先讓你看到字被填進輸入框，再送出 */
    }
    function chips(list, label, cls) {
      var row = el("div", { class: "picks" + (cls ? " " + cls : ""), role: "group", "aria-label": label });
      list.forEach(function(w) { row.appendChild(on(el("button", { type: "button", class: "pk", text: w }), "click", function() { fill(w); })); });
      return el("div", { class: "simg" }, [el("div", { class: "simgl", "aria-hidden": "true", text: label }), row]);
    }
    on(input, "keydown", function(ev) {
      if ((ev.key === "Enter" || ev.keyCode === 13) && !ev.isComposing && ev.keyCode !== 229) { ev.preventDefault(); run(input.value); }   /* 輸入法選字中按 Enter 是「選好字」，不是「送出」 */
    });
    var go = on(el("button", { type: "button", class: "sim-go", text: "送出" }), "click", function() { run(input.value); });
    var head = el("div", { class: "stage-h" }, [
      el("span", { class: "stage-t", text: d.ttl || "練習聊天室" }),
      replayBtn("重播：清空練習聊天室，再自動示範一遍", reset)
    ]);
    var stage = el("div", { class: "stage sim" }, [
      head,
      el("div", { class: "simrow" }, [input, go]),
      hint,
      d.pre ? chips(d.pre, "只打前幾個字就好（英文 3 個字母、中文 2 個字）。點一下，幫你打好、直接送出：", "") : null,
      chips(d.ex, d.pre ? "也可以這樣查：CODE、學名、位置" : "點一下範例字，幫你打好、直接送出：", ""),
      chips(d.bad, "故意打錯、打不存在的字，看看會怎樣：", "bad"),
      chat,
      el("p", { class: "capn", text: "練習用的假聊天室：藥名、位置都是編的；打的字不會存，也不會傳到任何地方。" })
    ]);
    reset();
    return [stage, net, { max: 1, note: net, ms: function() { return 2600; } }];   /* ms：點範例字之後，字填進輸入框（0.26 秒）、機器人查詢中、卡片一張一張跳出來，大約這麼久；自動示範只點一個範例字，放完就結束 */
  }

  /* ───────── 自動示範（第 17 批）─────────
     捲到哪一塊示範區（灰底的 .stage），它就自己照順序把裡面的選項點一遍，一邊捲一邊看；點任何一個選項、按任何鍵、或按「停止」就換你操作。
     每一個選項：先有一隻手指（👆）滑過去、按下去（AUTO_TAP_MS＝0.7 秒，按下去那一刻才真的點），內容才換；換了之後，動畫放完（或說明讀完）再停一下（最短 2.5 秒），就換下一個。
     從這個選項點下去，到下一個選項點下去，最多 6 秒（AUTO_MAX_MS）：說明很長也不會等更久；訊息很多的聊天示範，把訊息跳出來的間隔縮短，4 秒內放完。
     做法：不改每種示範自己的程式——直接對示範區裡的選項按鈕呼叫 click()（跟真的點一樣：一樣有動畫、一樣換下面的說明）。
     真人點的 click 是 isTrusted、程式呼叫的不是，靠這個分辨「誰點的」（用 pointerdown 不行：手指在示範區上捲動也會算）。
     不動的時候：裝置設定「減少動態」（REDUCE）、示範區沒有露出 60%、分頁在背景、已經被人動過（按「停止」也算）、這一次停留已經示範滿 3 遍。（目錄頁不再有「自動示範」的開關：一律是開的。）
     ★ 第 21 批：學員停在哪一個示範區，它就在那裡一遍一遍自己示範（一遍放完停 AUTO_LOOP_MS，再從第一個選項重來），最多 AUTO_LOOPS＝3 遍才停；捲走再捲回來算新的一次停留，又可以放 3 遍。按「重播」也從 3 遍重新算。
     捲走了（露出不到 25%）就暫停，捲回來接著做；換頁（render）一律全部停掉重來。
     「露出多少」是跟「示範區自己的高度、畫面能看的高度」比較小的那個比：示範區比畫面還高（手機橫著拿、很長的聊天示範）的時候，只要畫面被它占滿六成就算，不然永遠到不了六成、就永遠不會動。
     手指（或兩指／滑鼠橫向捲）正在示範區裡滑動：先不換示範的內容（輪播、輸入列正在手指底下，換掉會跳），手放開、或最後一次滑動過了 1.2 秒才接著示範；手指一直壓著超過 10 秒就當作卡住，照常往下做。 */
  var AUTO_ON_VIS = 0.6, AUTO_OFF_VIS = 0.25, AUTO_START_MS = 900, AUTO_TAP_MS = 700, AUTO_MIN_MS = 2500, AUTO_MAX_MS = 6000, AUTO_AFTER_MS = 1200, AUTO_LOOPS = 3, AUTO_LOOP_MS = 1200, AUTO_LIST = [], autoIO = null;
  var AUTO_STEPS = (function() { var a = [], i; for (i = 0; i <= 100; i++) a.push(i / 100); return a; })();   /* IntersectionObserver 的門檻：0、0.01、0.02 … 1 */
  function autoPref() { return !REDUCE; }
  /* 點下去之後停多久（毫秒）：說明越長停越久（1.2 秒＋每個字 30 毫秒，讀得完），動畫（ms）放完還要再留 1.2 秒；最短 2.5 秒；最長 5.3 秒（加上手指的 0.7 秒＝6 秒）。最後一個選項後面沒有下一個了，不用等讀說明：動畫放完就結束 */
  function autoHold(len, ms, last) {
    var read = 1200 + 30 * len, play = ms + AUTO_AFTER_MS;
    return Math.max(AUTO_MIN_MS, Math.min(AUTO_MAX_MS - AUTO_TAP_MS, last ? play : Math.max(read, play)));
  }
  function autoOf(stage) { for (var i = 0; i < AUTO_LIST.length; i++) if (AUTO_LIST[i].stage === stage) return AUTO_LIST[i]; return null; }
  function autoReg(stage, opt) {
    opt = opt || {};   /* opt.max：最多自己點幾個選項（練習聊天室只示範 1 個）；opt.note：「說明」放在別的地方的時候，指給它 */
    var hd = stage.querySelector(".stage-h");
    function targets() {
      var ts = Array.prototype.slice.call(stage.querySelectorAll(".picks .pk, .qrow button.qchip"));
      return ts.length ? ts : Array.prototype.slice.call(stage.querySelectorAll(".replay"));   /* 沒有選項、只有一種情況的聊天示範：自動按一次「重播」 */
    }
    if (!hd || !targets().length) return;
    function noteEl() { if (opt.note) return opt.note; var n = stage.nextElementSibling; while (n && !n.classList.contains("note")) n = n.nextElementSibling; return n; }   /* 示範區下面「點了哪個、說明就換哪個」的那一格 */
    var c = { stage: stage, idx: 0, timer: 0, running: false, arm: false, done: false, took: false, forced: false, seen: 0, hold: 0, loops: 0 }, grp = null;   /* loops：這一次停留已經放完幾遍 */
    /* 「自動示範中」的小標和「停止」只在示範的時候才放進示範區的標題列（不示範的時候整個不在畫面裡，焦點、讀屏都碰不到） */
    function show(v) {
      if (v && !grp) {
        var stop = on(el("button", { type: "button", class: "astop", "aria-label": "停止這個示範，換我自己操作（按「重播」可以再看一遍）", text: "停止" }), "click", function() {
          var f = stage.querySelector(".picks .pk, .qrow button.qchip") || stage.querySelector(".replay");   /* 先接到第一個選項（「重播」在標題列、排在選項前面，但鍵盤使用者剛按完「停止」，不該一不小心按到「重播」又重來）；沒有選項才接到「重播」 */
          c.take();   /* 只停這一個示範區；捲到別的示範區，它還是會自己示範 */
          if (f) { try { f.focus(); } catch (e) {} }   /* 按鍵盤的人按了「停止」，按鈕會消失：焦點接到示範區裡的第一個按鈕，不要掉回網頁最上面 */
        });
        grp = el("span", { class: "autog" }, [el("span", { class: "autob", "aria-hidden": "true", text: "自動示範中" }), stop]);
        hd.insertBefore(grp, hd.querySelector(".replay"));
      } else if (!v && grp) {
        if (grp.parentNode) grp.parentNode.removeChild(grp);
        grp = null;
      }
      stage.classList.toggle("auto", v);
      var n = noteEl();
      if (n) n.setAttribute("aria-live", v ? "off" : "polite");   /* 自動換說明的時候，讀屏軟體不要一直念 */
    }
    function later(ms) { c.timer = setTimeout(tick, ms); }
    function total() { var ts = targets(); return opt.max ? Math.min(opt.max, ts.length) : ts.length; }
    /* 點下去（或「重播」那一下）之後停多久，再換下一個。聊天示範、練習聊天室：訊息一則一則跳出來、手指按按鍵、6 位數一位一位打，opt.ms() 是這些動畫要放多久；點名稱換圈圈的示範（卡片、平面圖、轉圖、輸入列）一點就換，是 0 */
    function rest() { var n = noteEl(); later(autoHold(n ? n.textContent.length : 0, opt.ms ? opt.ms() : 0, c.idx >= total())); }
    /* 一個選項要分兩步：① 手指滑過去（tapAt）、等 AUTO_TAP_MS；② 手指按下去，這時候才真的 click()，再等「點下去之後停多久」。c.arm＝①做完了、正在等②。 */
    function tick() {
      c.timer = 0;
      if (!c.running) return;
      if (Date.now() < c.hold) { c.arm = false; tapDrop(stage); later(Math.max(150, Math.min(1000, c.hold - Date.now()))); return; }   /* 學員的手指還在示範區裡滑：等一下再換（我們的手指先收起來，等一下重來） */
      var ts = targets();
      if (c.idx >= total()) {   /* 一遍放完：還沒滿 3 遍就停一下、從第一個選項重來；滿了才收起來 */
        c.loops++;
        if (c.loops >= AUTO_LOOPS) { c.done = true; c.pause(); return; }
        c.idx = 0; c.arm = false; tapDrop(stage);
        later(AUTO_LOOP_MS);
        return;
      }
      if (!c.arm) {
        c.arm = true;
        if (tapAt(stage, ts[c.idx])) { later(AUTO_TAP_MS); return; }   /* 手指滑過去、按下去要 0.7 秒；沒有畫手指（減少動態）就不用等，直接點 */
      }
      c.arm = false;
      try { ts[c.idx++].click(); } catch (e) {}
      rest();
    }
    c.start = function() {
      if (c.running || c.done || c.took || !(autoPref() || c.forced) || document.hidden) return;   /* forced：按過「重播」的示範區，裝置設定了「減少動態」也照做 */
      c.running = true;
      show(true);
      later(AUTO_START_MS);
    };
    c.pause = function() {
      if (c.timer) { clearTimeout(c.timer); c.timer = 0; }
      c.running = false;
      c.arm = false;
      tapDrop(stage);   /* 手指還在半路上就被停掉：手指也拿掉 */
      show(false);
    };
    c.take = function() { c.took = true; c.pause(); };
    /* 按「重播」＝從第一個選項重新自動示範（不管學員動過、示範完、按過「停止」都一樣）：狀態全部歸零，馬上開始，不用等 */
    c.restart = function() {
      var ts = targets();
      if (c.timer) { clearTimeout(c.timer); c.timer = 0; }
      c.idx = 0; c.done = false; c.took = false; c.forced = true; c.running = true; c.arm = false; c.hold = 0; c.loops = 0;
      tapDrop(stage);
      show(true);
      /* 每一種示範的「重播」鍵，按下去它自己就回到第一個選項、放了一遍（單一情況的聊天示範：就是放那一遍）。學員按的那一下就是第一個動作：不用手指再按一次（再按一次，動畫會從頭再來，看起來像卡了一下），停一下就換第二個。練習聊天室的重播鍵只是清空，要手指去點第一顆範例字 */
      if (ts.length && (ts[0].classList.contains("replay") || ts[0].getAttribute("aria-pressed") === "true")) { c.idx = 1; rest(); }
      else tick();
    };
    function isReplay(t) { for (var n = t; n && n !== stage; n = n.parentNode) if (n.classList && n.classList.contains("replay")) return true; return false; }
    on(stage, "click", function(ev) { if (ev.isTrusted) { if (isReplay(ev.target)) c.restart(); else c.take(); } });   /* 程式自己按的 click（自動示範）不算；人按的：「重播」＝重來，其他＝換你操作 */
    on(stage, "keydown", function(ev) { if (!(ev.target && ev.target.className === "astop")) c.take(); });   /* 按「停止」的那一下鍵盤不算（不然按鈕在 click 之前就被拿掉了，「停止」自己的 click 收不到） */
    /* 手指（或滑鼠橫向捲）在示範區裡滑動：先不換內容。touchstart 到 touchend 之間一直算（最多 10 秒），放開後再等 1.2 秒；手指在螢幕上滑的時候瀏覽器會送 pointercancel，所以不用 pointer 事件 */
    function holdTo(ms) { var t = Date.now() + ms; if (t > c.hold) c.hold = t; }
    on(stage, "touchstart", function() { c.hold = Date.now() + 10000; });
    on(stage, "touchend", function() { c.hold = Date.now() + 1200; });
    on(stage, "touchcancel", function() { c.hold = Date.now() + 1200; });
    on(stage, "wheel", function(ev) { if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) holdTo(1200); });
    AUTO_LIST.push(c);
  }
  function autoClear() {
    AUTO_LIST.forEach(function(c) { c.pause(); });
    AUTO_LIST = [];
    if (autoIO) { try { autoIO.disconnect(); } catch (e) {} autoIO = null; }
  }
  function autoMount() {
    if (!AUTO_LIST.length || REDUCE || typeof IntersectionObserver !== "function") return;
    try {
      autoIO = new IntersectionObserver(function(es) {
        es.forEach(function(e) {
          var c = autoOf(e.target);
          if (!c) return;
          var vh = e.rootBounds ? e.rootBounds.height : (window.innerHeight || 0);
          c.seen = e.isIntersecting ? e.intersectionRect.height / Math.max(1, Math.min(e.boundingClientRect.height, vh)) : 0;
          if (c.seen >= AUTO_ON_VIS) c.start();
          else if (c.seen < AUTO_OFF_VIS) { c.pause(); if (c.done) { c.done = false; c.loops = 0; c.idx = 0; } }   /* 捲走＝這一次停留結束：放滿 3 遍的，下次捲回來可以再放（沒放完的，捲回來接著做） */
        });
      }, { rootMargin: "-56px 0px -72px 0px", threshold: AUTO_STEPS });   /* 上面那條、下面那排會蓋住一些：算進去。門檻切得很細（每 1%）：示範區比畫面高很多的時候，露出的比例最多只有一點點（例如 12%），門檻太稀就剛好跳過「六成畫面」那一刻 */
      AUTO_LIST.forEach(function(c) { autoIO.observe(c.stage); });
    } catch (e) { autoIO = null; }
  }
  document.addEventListener("visibilitychange", function() {
    AUTO_LIST.forEach(function(c) { if (document.hidden) c.pause(); else if (c.seen >= AUTO_ON_VIS) c.start(); });
  });
  function secView(s) {
    var sec = el("section", { class: "sec" }, [
      el("div", { class: "sec-h" }, [el("h2", { text: s.t })]),
      el("p", { class: "lead" }, [rich(s.p)])
    ]);
    var k = s.d ? s.d.k : "";
    var parts = !s.d ? [null, null] : k === "sh" || k === "cmds" || k === "dsim" ? devDemo(s.d) : k === "anat" ? demoAnat(s.d) : k === "plan" ? demoPlan() : k === "turn" ? demoTurn() : k === "qbar" ? demoQbar(s.d) : k === "sim" ? demoSim(s.d) : demoChat(s.d);   /* d 可以沒有：只有說明和步驟的小節 */
    if (s.tips && s.tipsFirst) sec.appendChild(stepsEl(s.tips));   /* tipsFirst：放在示範區前面、編號 1 2 3 的「步驟」（看平面圖的三個步驟） */
    if (parts[0]) { sec.appendChild(parts[0]); autoReg(parts[0], parts[2]); }
    if (s.tips && !s.tipsFirst) sec.appendChild(tipsEl(s.tips));
    if (parts[1]) sec.appendChild(parts[1]);
    if (s.keys) sec.appendChild(keysEl(s.keys));   /* keys：示範區下面灰底的「記住 n 件事」 */
    if (s.flow) {   /* flow：示範區下面再接一個「一步一個按鈕」的示範（h＝小標題；d＝跟上面的 d 一樣） */
      var fp = demoChat(s.flow.d);
      if (s.flow.h) sec.appendChild(el("h3", { class: "sub-h", text: s.flow.h }));
      sec.appendChild(fp[0]); autoReg(fp[0], fp[2]);
      if (fp[1]) sec.appendChild(fp[1]);
    }
    if (s.url) sec.appendChild(urlRow());   /* url：電腦要打開的網址（網址是這個網頁自己的位置推出來的，打不出來就請人問管理者） */
    if (s.steps) { if (s.steps.h) sec.appendChild(el("h3", { class: "sub-h", text: s.steps.h })); sec.appendChild(stepsEl(s.steps.items, "long")); }   /* steps：示範下面編號 1 2 3 的步驟（h＝小標題，可以沒有；items＝[{b 粗體一行, s 小字一行, u 網址一行}]） */
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
    else if (t.kind === "code" && S.c) { text = S.c; cap = "會回到 LINE 聊天室，已經幫你填好一個真的品項藥品的 CODE「" + text + "」，按送出就行。"; }
    else if (t.kind === "name" && S.n) { text = S.n; cap = "會回到 LINE 聊天室，已經幫你填好一個真的品項藥品「" + text + "」，按送出就行。"; }
    else if (t.kind === "typo" && S.n) { text = S.n; cap = "會回到 LINE 聊天室，已經幫你填好一個真的品項藥品的藥名「" + text + "」；先把其中一個字改成別的字，再按送出。"; }
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
  /* 目錄頁最上面：怎麼用這份教學（第一次來＝展開；學過了＝收起來） */
  function howBox(open) {
    return el("details", { class: "how", open: open ? true : null }, [
      el("summary", { text: "怎麼用這份教學（4 個動作）" }),
      el("div", { class: "how-b" }, [stepsEl(HOW, "long")])
    ]);
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
        el("p", { class: "sub", text: N + " 課。新增藥品、改資料、批次匯入、清單校對、維護指令、開發者網頁，點哪一課都可以。" }),
        el("div", { class: "prog" }, [
          el("div", { class: "prog-r" }, [el("span", { text: "已學 " + n + " / " + N + " 課" }), el("b", { text: pct + "%" })]),
          el("div", { class: "track", role: "progressbar", "aria-label": "學習進度", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) }, [fill])
        ]),
        cta
      ]),
      howBox(n === 0),
      el("h2", { class: "all", text: "全部課程" }),
      chapters(done, nx ? nx.id : "", "ol"),
      el("div", { class: "foot" }, "這一頁只講怎麼用，不含任何帳號、密碼或金鑰；指令只有開發者的 LINE 帳號打了才有用。學習進度只記在這支手機裡，不會傳給別人。在課裡按「回課程目錄」（或最後一課的「回目錄」），學習進度會清空，下次從頭開始。示範用的藥、CODE、代號、驗證碼都是編的，不是真的資料。")
    ];
    return { title: "補藥神器 開發者教學", kids: kids };
  }
  function lessonView(id) {
    var L = lessonById(id), li = lessonIdx(id), done = getDone();
    var ttl = on(el("button", { type: "button", class: "ttl", "aria-expanded": "false", "aria-controls": "toc", "aria-label": L.name + "，點一下看全部課程" }, [el("span", { class: "t", text: L.name }), el("span", { class: "ar", "aria-hidden": "true", text: "▾" })]), "click", function() { toggleToc(); });
    /* 按「回課程目錄」＝學習進度清空（每一課變回「還沒學」，下次從頭開始）；目錄頁不再有開關，一律這樣 */
    var toc = el("div", { class: "toc", id: "toc", hidden: true }, [el("div", { class: "toc-in" }, [on(el("a", { class: "toc-back", href: "#/", text: "‹ 回課程目錄" }), "click", function() { store.del("done"); }), chapters(done, L.id, "toc")])]);
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
      : on(el("a", { class: "nav go", href: "#/" }, ["回目錄 ›"]), "click", function() { ok(); store.del("done"); });   /* 最後一課的「回目錄」也一樣：先記下這一課，再整個清空 */
    botEl.textContent = "";
    botEl.appendChild(el("div", { class: "bot-in" }, [prev, pct, next]));
    botEl.hidden = false;
    return { title: L.name + "・補藥神器 開發者教學", kids: kids };
  }

  /* ───────── 換頁 ───────── */
  function render() {
    var h = location.hash || "", m, v;
    autoClear();   /* 上一頁的自動示範全部停掉；新的一頁在建的時候（secView）重新登記 */
    if ((m = h.match(/^#\/l\/([a-z]+)(?:\/\d+)?$/)) && lessonById(m[1])) v = lessonView(m[1]);
    else v = outlineView();
    root.textContent = "";
    v.kids.forEach(function(k) { root.appendChild(k); });
    autoMount();
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
