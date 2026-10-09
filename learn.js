/* 補藥神器教學 v11.22.2 beta：不用登入、不連任何網站；畫面上的藥全是編出來的示範。這個檔沒有任何秘密。 */
(function() {
  "use strict";
  /* ═══ 補藥神器教學網頁（v11.22.2 beta 第 13 批；第 15 批改版）═══
     不登入、不連任何網站：沒有 fetch、沒有外部網址，畫面上的藥全是編的示範。藥品卡片、列表卡、平面圖都是用元素＋CSS 畫出來的（五張小圖放在最上面 :root 的 --i-* 變數）。
     只有兩樣東西會「記」在這支手機裡：學習進度、從 LINE「教學」帶進來的「回聊天室」資訊（見最下面 boot）。
     排法照氛圍學院：目錄頁（#/）＝章節分組、一課一列；一課的頁（#/l/課名）＝白底區塊一塊接一塊往下捲，最後有「重點回顧」「隨堂檢測」，最下面固定「上一課／下一課」。 */
  var root = document.getElementById("main"), topEl = document.getElementById("top"), botEl = document.getElementById("bot");
  var NS = "buyao_learn_", mem = {};
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
  var CH = [{ n: "基本查藥" }, { n: "換個方式查" }, { n: "一次看多支、按鈕" }];
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
    { id: "card", ch: 0, name: "卡片介紹", secs: [
      { t: "最上面：這支藥叫什麼", p: "查到的每一支藥，都會變成一張卡片，長得跟下面這張一模一樣（藥名是編的）。先看最上面：點一個名稱，看它是什麼。",
        d: { k: "anat", w: "top" } },
      { t: "中間和最下面：外觀、去哪裡拿", p: "往下看：灰底框裡有外觀、適應症、照片；再下面是去哪裡拿，最下面有時還有一個紫色的框。點一個名稱，看它是什麼。",
        d: { k: "anat", w: "low" } },
      { t: "黃色的提醒框", p: "有些藥的卡片上，會多一個黃色的框，就在名字的下面。選一種看看。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "改包裝", m: [me("90101"), dc("90101", { note: N1 })],
            n: "框裡寫的是這支藥的**通知**（停止供貨、改包裝、缺貨、換廠…）。先讀完，再去拿藥。想一次看完所有藥的通知，按輸入框上面的「📢 藥品通知」（第 9 課）。" },
          { l: "停止供貨", m: [me("90106"), dc("90106", { note: N2 })], n: "不管是停止供貨還是改包裝，**黃框都在名字的下面**，先讀完再拿藥。" },
          { l: "沒有通知", m: [me("90103"), dc("90103")], n: "**沒有黃框**，就是目前沒有通知。" }
        ] } }
    ], tryp: { kind: "code", p: "回 LINE 查一支真的藥，對照上面學到的每一塊。", label: "在 LINE 查一支真的藥", hint: "會回到 LINE 聊天室，查一支真的藥，對照上面的說明。" },
    recap: ["**最上面**是這支藥叫什麼：CODE、商品名、中文名；灰色小字是學名（成分）。", "**中間**是外觀和適應症，**粉紅色的框**是「去哪裡拿」（位置），旁邊的小圖是平面圖。", "卡片上有**黃色的框**，先讀完通知，再去拿藥。"],
    quiz: { q: "卡片上那個粉紅色的框，是在告訴你什麼？", h: "提示：拿藥最需要先知道什麼？", o: ["這支藥是治什麼的", "去哪裡拿（位置）", "這支藥的成分", "這支藥有沒有缺貨"], a: 1, why: "粉紅色的框是位置，也就是去哪裡拿。也可以直接打位置（例如「K2」），那一格的藥會整批列出來。" } },

    { id: "map", ch: 0, name: "看平面圖", secs: [
      { t: "平面圖上有什麼", p: "卡片最下面，位置的右邊有一張小圖，就是這一區的**平面圖**：用紅框告訴你，這支藥放在這一區的哪裡。點一個名稱，看圖上的每一塊是什麼。",
        d: { k: "plan" },
        note: "圖上**沒有**標「你在這裡」，所以要靠**大門處或是出入口**來對方向，下一段教你怎麼做。" },
      { t: "先看大門處或是出入口在哪", p: "看平面圖的三個步驟：站在藥局裡，先看一眼**大門處或是出入口**在你的哪一邊；再到圖上找「大門」兩個字；最後把圖轉一轉，讓圖上的「大門」跟大門處或是出入口在**同一邊**。",
        tips: [{ b: "站好，看大門處或是出入口", s: "它在你的前面、右手邊、後面，還是左手邊" }, { b: "圖上找「大門」", s: "寫著「大門」，旁邊有箭頭" }, { b: "轉圖，對齊", s: "圖上的「大門」跟大門處或是出入口同一邊" }], tipsFirst: true,
        d: { k: "turn" },
        note: "不管圖上的「大門」本來在哪一邊，做法都一樣：**轉到圖上的「大門」，跟大門處或是出入口在同一邊**。不用真的轉手機，在腦中轉就好。",
        warn: "圖上沒有「你在這裡」，一定要先用大門處或是出入口對方向；不要直接照圖上的左右走。" },
      { t: "轉好之後，照紅框走", p: "轉好以後，圖的方向就跟你眼前的藥局一樣：**圖的上面是前面、下面是後面、左右也一樣**。看紅框在圖的哪一邊，就往藥局的那一側走；走到附近，再對一下卡片上的位置名稱。",
        d: { k: "chat", ttl: "點平面圖，看大圖", ch: [
          { l: "點一下小圖", m: [dc("90104"), act("👆 點一下卡片上的平面圖"), bigplan("K2")],
            n: "小圖看不清楚的時候，**點一下小圖**，聊天室會再傳一張**大圖**；點大圖，兩指撐開還能再放大。" }
        ] },
        note: "有些位置**沒有平面圖**（例如公藥區），卡片上就不會有小圖。照粉紅框裡的位置文字找就好。" },
      { t: "一支藥放好幾個地方", p: "有的藥放在好幾個地方，粉紅框裡就會有**幾顆按鍵**：亮的那一顆，是現在看的地方，右邊的平面圖也是那一個地方。按另一顆，會再傳一張新的卡片，亮的換成你按的那一顆，平面圖也跟著換。",
        d: { k: "chat", ttl: "按按看", ch: [
          { l: "按 B1", m: [dc("90104", { spots: SPOTS, on: 0 }), act("👆 按「B1」"), dc("90104", { spots: SPOTS, on: 1 })],
            n: "按了 **B1**：亮的換成 B1，平面圖也換成 B1 那一區。" },
          { l: "按 棧一", m: [dc("90104", { spots: SPOTS, on: 0 }), act("👆 按「棧一」"), dc("90104", { spots: SPOTS, on: 2 })],
            n: "按了 **棧一**：亮的換成棧一，平面圖也換成棧一那一區。" }
        ] } }
    ], tryp: { kind: "code", p: "回 LINE，查一支真的藥，找找卡片上的平面圖，照上面的三個步驟對方向。", label: "在 LINE 查一支真的藥", hint: "會回到 LINE 聊天室，查一支真的藥，再看它的平面圖。" },
    recap: ["**平面圖上的紅框**，就是這支藥放的那一格；點小圖會再傳一張大圖。", "**先看大門處或是出入口在哪**，再轉動平面圖，讓圖上的「大門」跟它在同一邊。", "轉好以後，**圖的上面就是前面**，照紅框的位置走過去。"],
    quiz: { q: "你站在藥局裡，大門處或是出入口在你的右手邊。看平面圖時，怎麼做才對？", h: "提示：圖上沒有「你在這裡」，要靠大門處或是出入口來對方向。", o: ["不用轉，直接照圖走", "把圖轉到圖上的「大門」也在右手邊", "把圖轉到圖上的「大門」在上面", "找圖上「你在這裡」的記號"], a: 1, why: "圖上沒有標你站的位置，要靠大門處或是出入口對方向：它在你右手邊，就把圖轉到圖上的「大門」也在右手邊。轉好後，圖的上面就是你面對的方向。" } },

    { id: "search", ch: 0, name: "打字查藥", secs: [
      { t: "什麼都能查，打了就找", p: "「CODE」「商品名」「中文名」「學名」「位置」，想到什麼就打什麼。不用先按功能、不用選分類，一秒就出結果。",
        d: { k: "chat", ttl: "點一種，看結果", ch: [
          { l: "CODE", m: [me("90101"), C1], n: "打 **CODE** 最準，不會抓到別支藥。紙條上有寫 CODE，就直接打，一個字都不用多打。" },
          { l: "商品名", m: [me("DEMOSYRUP"), dc("90102")], n: "打 **商品名**（藥盒上印的英文名）前面幾個字就查得到。" },
          { l: "中文名", m: [me("測試洛爾"), C1], n: "想不起英文名的時候，打 **中文名** 一樣查得到。" },
          { l: "學名", m: [me("samplexin"), car(["90111", "90112", "90102"])], n: "打 **學名**（卡片上灰色的小字），同成分的藥會一起出來，**往左滑**看下一張。" },
          { l: "位置", m: [me("K2"), ll(L_K2)], n: "直接打 **位置**，那一格的藥整批列出來（第 7 課）。" }
        ] },
        note: "想用**適應症**找（例如咳嗽的藥），要在前面加一個符號，看第 8 課。" },
      { t: "打前面幾個字就好", p: "不用打全名。中文 2 個字、英文 3 個字母就開始找；字越多，找得越準。",
        d: { k: "chat", ttl: "選一種打法", list: true, ch: [
          { l: "打「測試」（2 個字）→ 有 3 支，一張一張往左滑", m: [me("測試"), car(["90101", "90105", "90106"])], n: "只記得開頭也沒關係：打幾個字，符合的藥會排成一排卡片，**往左滑**看下一張。" },
          { l: "打「測試洛爾」（4 個字）→ 只剩 1 支，一張卡片", m: [me("測試洛爾"), C1], n: "字打得越多，剩下的越少，**最多打到只剩一支，就只有一張卡片**。" }
        ] } },
      { t: "打錯字也沒關係", p: "打錯一兩個字也找得到：系統會直接找**最接近的藥**，把卡片帶出來，不用重打。拿藥前，**核對卡片上的名稱**。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "錯一個字", m: [me("測試落爾"), C1], n: "打成「測試**落**爾」（正確是「洛」），系統**直接**帶出最接近的那支藥，**不會先問你**。不是你要的，就換個字再查。" },
          { l: "CODE 打錯", m: [me("09101"), bot("⚠️ 找不到 CODE「09101」\n\n下面列出的是「CODE 相近」的品項,\n不是你輸入的那一支藥。\n請務必核對卡片上的 CODE 再補藥 🙏"), C1],
            n: "打錯 **CODE** 要特別小心：系統先寫「⚠️ 找不到 CODE」，再列出 **CODE 相近**的藥——**不是你輸入的那一支**。一定要核對卡片上的 CODE 再補藥。" },
          { l: "查不到", m: [me("abcxyz"), nf("abcxyz")], n: "真的找不到的時候，會出一張**黃框**的卡片：請翻閱紙本『藥品位置查詢表』；下面還有幾個小技巧。有相近的藥時，卡片裡還會問「有相符的藥品嗎？」，輸入框上面的按鈕點一個就查。" }
        ] } }
    ], tryp: { kind: "typo", p: "回 LINE，故意打錯一個字，看它怎麼接住你。", label: "在 LINE 試試看", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**什麼都能打**：CODE、藥名、學名、位置，都查得到。", "**打前面幾個字就好**：中文 2 個字、英文 3 個字母開始找。", "**打錯字沒關係**：系統直接帶出最接近的藥；打錯 CODE 要核對卡片上的 CODE；真的查不到，翻『藥品位置查詢表』。"],
    quiz: { q: "手上的紙條寫著 CODE 90101，怎麼查最準？", h: "提示：CODE 是每一支藥獨一無二的編號。", o: ["打「90101」", "打藥名的前兩個字", "打位置「K2」", "拍一張包裝照"], a: 0, why: "CODE 是每一支藥獨一無二的編號，打它不會抓到別支藥。" } },

    { id: "photo", ch: 1, name: "拍照查藥", secs: [
      { t: "包裝拍起來，直接傳", p: "包裝、鋁箔、瓶身都可以，不用打半個字。",
        d: { k: "chat", ttl: "選一種拍法", ch: [
          { l: "藥盒", m: [pic("藥盒包裝", "t"), bot(WARN), C1], n: "字面朝上、光線夠、一張一盒，出卡片最快。回覆最前面會先提醒一句：**AI 可能讀錯，核對 CODE 再拿藥**。" },
          { l: "鋁箔／瓶身", m: [pic("鋁箔或瓶身", "w"), bot(WARN), dc("90102")], n: "鋁箔、瓶身上有印字的，一樣拍起來就傳。" },
          { l: "好幾盒", m: [pic("三盒一起拍", "three"), bot(WARN), car(["90101", "90102", "90103"])],
            n: "一次拍好幾盒也可以，**全部一起出卡片**，往左滑看下一張；超過 5 個品項會變成一張總表，點一列出卡片。" }
        ] } },
      { t: "拍得清楚，出得最快", p: "字面朝上、對到焦、避開反光；拍好再按快門。",
        d: { k: "chat", ttl: "比比看", ch: [
          { l: "拍得清楚", m: [pic("清楚的包裝", "t"), bot(WARN), C1], n: "對得上藥名的，**直接出卡片**。" },
          { l: "拍得模糊", m: [pic("模糊的包裝", "blur"), bot(WARN), ask(["90101", "90105"], "TESTO", "用「TESTO」這個字找到的"), act("👆 按「是這個藥品？」"), me("90101"), C1],
            n: "對不上的，會列出很像的藥，按「是這個藥品？」就出卡片（按下去，會幫你把那支的 CODE 打出來）。**都不是的話，直接打字查最快。**" }
        ] },
        warn: "⚠️ AI 可能讀錯，請核對 CODE 再拿藥。" }
    ], tryp: { kind: "open", p: "回 LINE，拍一盒藥傳傳看。", label: "回 LINE 拍一張試試", hint: "會回到 LINE 聊天室，點輸入框旁邊的相機拍一盒藥。" },
    recap: ["**包裝、鋁箔、瓶身都能拍**，不用打半個字。", "**一次可以拍好幾盒**；超過 5 個品項會變成一張總表，點一列出卡片。", "**拍清楚、避開反光**；AI 可能讀錯，拿藥前核對 CODE；對不上就直接打字查。"],
    quiz: { q: "拍照後，系統列出幾支「很像的藥」，但都不是你要的。接下來怎麼做最快？", h: "提示：這時候不要再猜，換最直接的辦法。", o: ["把照片重傳十次", "選最上面那支", "直接打字查（CODE 或藥名）", "不用管它"], a: 2, why: "都不是的話，直接打字查最快；也不要硬選最像的，拿藥前一定要核對 CODE。" } },

    { id: "voice", ch: 1, name: "語音查藥", secs: [
      { t: "講一句就查", p: "按住 LINE 的麥克風講藥名，放開就查——手上忙、戴手套的時候最好用。",
        d: { k: "chat", ttl: "選一種講法", ch: [
          { l: "講藥名", m: [voice(), bot("🎤 聽到「測試洛爾」"), C1], n: "回覆最前面會先寫「🎤 聽到「…」」，**聽錯了一眼就看得出來**。" },
          { l: "講 CODE", m: [voice(), bot("🎤 聽到「九零一零一」→ 查「90101」"), C1], n: "講 **CODE** 也可以：「九零一零一」，唸數字就好；回覆會寫成「聽到…→ 查…」。聽錯字的時候，改講 CODE 最準。" },
          { l: "講指令", m: [voice(), bot("🎤 聽到「公告」"), ll(L_NOTICE)], n: "講「公告」「教學」也會執行，**跟打字一樣**。" }
        ] } },
      { t: "麥克風在這裡", p: "按住右下角的 🎤 講話，放開就送出。",
        d: { k: "qbar", hot: "mic", cmd: "👆 圈起來這顆就是麥克風（按住不放）" },
        tips: [{ e: "📏", b: "靠近一點", s: "手機拿到嘴巴前約 10 公分" }, { e: "💬", b: "只講藥名", s: "不用講「請問…在哪裡」" }, { e: "⏸", b: "停半秒再放", s: "講完停半秒再放開" }],
        note: "真的太吵 → 改用**鍵盤上的 🎤**（手機自己會去背景音），成功率最高。" }
    ], tryp: { kind: "open", p: "回 LINE，按住麥克風講一個藥名。", label: "回 LINE 講一句試試", hint: "會回到 LINE 聊天室，按住麥克風講一個藥名。" },
    recap: ["**按住 🎤 講藥名，放開就查**，手上忙的時候最好用。", "回覆最前面會寫「🎤 聽到…」，**聽錯了一眼看得出來**。", "聽錯字或太吵：**改講 CODE（唸數字）**，或用鍵盤上的 🎤。"],
    quiz: { q: "語音查藥時，系統聽成別的字了，最準的補救方法是？", h: "提示：數字比藥名好唸，也比較不會聽錯。", o: ["講大聲一點", "多講幾次藥名", "講「請問這支藥在哪裡」", "改講 CODE（唸數字）"], a: 3, why: "回覆最前面會先告訴你「聽到什麼」，聽錯字的時候，改講 CODE 最準。" } },

    { id: "hand", ch: 1, name: "手寫", secs: [
      { t: "手寫菜單直接拍", p: "手寫的菜單拍起來傳，一行一個品項，讀到的直接出卡片。",
        d: { k: "chat", ttl: "選一種情況", ch: [
          { l: "字寫清楚", m: [hand(["示範康糖漿", "測試洛爾", "模擬普利"]), bot(WARN), car(["90102", "90101", "90103"])],
            n: "讀到的直接出卡片，往左滑看下一張。**一張 10 行以內**最準、最快；紙條長就分兩張拍。" },
          { l: "有一行看不清", m: [hand(["示範康糖漿", "測試洛■", "模擬普利"]), bot(WARN), car(["90102", "90103"]), ask(["90101", "90105"], "測試洛■", "拼法相近的")],
            n: "看不清的行，會列出很像的藥讓你點；**都不是，就直接打字查**。" },
          { l: "超過 5 行", m: [hand(["示範康糖漿", "測試洛爾", "模擬普利", "測試寧", "測試醇", "示範卡錠"]), sheet(["90102", "90101", "90103", "90105", "90106", "90107"])],
            n: "超過 5 個品項，會變成**一張總表**，一列一支藥（「⚠️ AI 可能讀錯」那句寫在表的標題下面）。**點一列**，就出那支藥的完整卡片。" }
        ] } }
    ], tryp: { kind: "open", p: "回 LINE，拍一張手寫的藥名傳傳看。", label: "回 LINE 拍一張試試", hint: "會回到 LINE 聊天室，拍一張手寫的藥名試試。" },
    recap: ["**手寫的藥名也能拍**：一行一個品項。", "**一張 10 行以內**最準；太長就分兩張拍；超過 5 個品項會變成一張總表。", "看不清的行會列出很像的藥讓你點；**都不是就直接打字查**。"],
    quiz: { q: "手上的紙條有 20 行藥名，怎麼拍最好？", h: "提示：一張 10 行以內最準、最快。", o: ["一張全部拍進去，字小一點沒關係", "分兩張拍，每張 10 行以內", "拍遠一點，一次拍完", "改用語音一行一行講"], a: 1, why: "一張 10 行以內最準、最快；紙條長就分兩張拍。" } },

    { id: "agg", ch: 2, name: "彙整卡片", secs: [
      { t: "一格的藥，一張卡看完", p: "打位置，這一格的藥就整批列出來；品項多的時候會自動分頁，往左滑。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "K2", m: [me("K2"), ll(L_K2)], n: "打**位置**就好，不用一支一支查。" },
          { l: "B1（品項很多）", m: [me("B1"), ll(L_B1)], n: "品項多的時候會**自動分頁，往左滑**看下一頁。（示意圖：第一頁中間幾列省略沒畫。）" }
        ] } },
      { t: "按一列，出完整卡片", p: "列表只列名字和位置；想看哪一支，按那一列就出完整的卡片。",
        d: { k: "chat", ttl: "看一次", ch: [
          { l: "K2", m: [me("K2"), ll(L_K2), act("👆 按第 2 列（等於幫你打那支藥的 CODE）"), me("90111"), dc("90111")], n: "按任何一列，出完整卡片，跟打 CODE 查到的一樣。" }
        ] } }
    ], tryp: { kind: "loc", p: "回 LINE，打一個真的位置，看那一格的藥。", label: "在 LINE 查一個真的位置", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**打位置**，這一格的藥整批列出來。", "品項多會**自動分頁，往左滑**。", "**按任何一列**，出完整卡片。"],
    quiz: { q: "想一次看到 K2 這一格裡所有的藥，怎麼做？", h: "提示：位置也可以直接當關鍵字打。", o: ["一支一支查 CODE", "拍 K2 那一格的照片", "直接打位置「K2」", "打「.K2」"], a: 2, why: "直接打位置，那一格的藥就整批列出來；品項多會自動分頁，往左滑。" } },

    { id: "family", ch: 2, name: "藥品家族", secs: [
      { t: "卡片上的紫色框", p: "有些藥的卡片最下面，有一個紫色的**藥品家族**框：院內同成分的其他藥（換劑量、換劑型、換廠牌）。平常收起來，一類一行。",
        d: { k: "chat", ttl: "按「▸ 打開」", ch: [
          { l: "打開看看", m: [dc("90101", { fam: FAM1 }), act("👆 按卡片上的「▸ 打開」"), me("▸ 打開"), dc("90101", { fam: FAM1, opened: 1 })],
            n: "按「▸ 打開」，會再傳一張卡片，這次家族**全部攤開**：一類一組，一列一支藥，按任何一列就出那支藥的卡片。" }
        ] } },
      { t: "加個符號，整批列出來", p: "想找同成分的所有藥，在**學名**前面加一個符號（. ＃ ／ 任何一個都可以）；也可以在符號後面打**適應症**，同一類的藥全列出來。",
        d: { k: "chat", ttl: "選一種打法", ch: [
          { l: ".samplexin", m: [me(".samplexin"), ll(L_SAM)], n: "例：**.samplexin**（學名，卡片上灰色的小字）。學名裡有這個字的藥，不管劑量、劑型、廠牌，院內全部列出來。" },
          { l: ".咳嗽", m: [me(".咳嗽"), ll(L_COUGH)], n: "例：**.咳嗽**（適應症）。**適應症有咳嗽**的藥一次列出來，想不起藥名、只知道病名的時候最好用。適應症有填的藥才找得到。" }
        ] } },
      { t: "跟一般查詢差在哪", p: "不加符號，找的是「名字像」的藥（CODE、商品名、中文名、學名），一張一張卡片往左滑；加了符號，變成一張總表，一列一支。",
        d: { k: "chat", ttl: "比比看", ch: [
          { l: "samplexin", m: [me("samplexin"), car(["90111", "90112", "90102"])], n: "**不加符號**：名字有這幾個字的藥，一張一張卡片，往左滑。" },
          { l: ".samplexin", m: [me(".samplexin"), ll(L_SAM)], n: "**加了符號**：變成一張總表，一列一支，按一列出卡片。" }
        ] } }
    ], tryp: { kind: "fam", p: "回 LINE，在一支真的藥的學名前面加一個點，看全家。", label: "在 LINE 查一個真的家族", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**卡片最下面的紫色框**＝藥品家族：院內同成分的其他藥，按「▸ 打開」全部攤開。", "**學名或適應症前面加 . ＃ ／** 任何一個，同成分（或同適應症）的整批列出來。", "**換規格、換廠牌、想不起藥名**的時候最好用。"],
    quiz: { q: "想一次看到同一個成分的所有規格和廠牌，怎麼打？", h: "提示：在學名（卡片上灰色的小字）前面加一個小符號。", o: ["打藥名兩次", "打藥名加位置", "打藥名，後面加「？」", "在學名前面加「.」"], a: 3, why: "學名前面加 . ＃ ／ 任何一個符號，學名裡有這個字的藥就全列出來；符號後面打適應症也行。" } },

    { id: "pin", ch: 2, name: "釘住的按鈕", secs: [
      { t: "不用記指令，按就好", p: "輸入框上面那排按鈕永遠都在，點一下就等於幫你打好那個字。按按看下面這四顆。",
        d: { k: "qbar", chips: true, pick: true },
        note: "按鈕不見的話，直接打「教學」「公告」「bug」也一樣。" },
      { t: "🌐 網頁", p: "按它，直接開補藥神器網頁版——在 LINE 裡面開，不用另外登入。想用比較大的畫面看清單、查藥、看藥品通知的時候，就按它。",
        d: { k: "qbar", chips: true, hot: "web", cmd: "按「🌐 網頁」＝開網頁版（不是打字）" },
        note: "用 **LINE 以外的瀏覽器**（例如電腦）開網頁版：畫面上會有一組**代號**，把代號打在這個一對一的 LINE 聊天室（不是群組），我會回你 **6 位數驗證碼**，再打回網頁就登入了。驗證碼 5 分鐘內有效。",
        warn: "沒看到這顆？可能是網頁版目前沒有開，請問管理者。" },
      { t: "📖 教學", p: "就是這一份教學。忘記怎麼用、想看某一課，按它就回來。",
        d: { k: "qbar", chips: true, hot: "guide", cmd: "按「📖 教學」＝打「教學」" },
        note: "任何時候都可以按，**不會影響你剛才查的東西**。" },
      { t: "📢 藥品通知", p: "停止供貨、改包裝、缺貨……一次看完，一類一疊，往左滑。",
        d: { k: "chat", ttl: "按下去會怎樣", ch: [
          { l: "按「📢 藥品通知」", m: [act("👆 按輸入框上面的「📢 藥品通知」"), me("公告"), ll(L_NOTICE)], n: "按下去，等於幫你打「公告」。有通知的藥，查到它的時候，**卡片上也會有黃色的 ⚠️ 框**（第 1 課）。" }
        ] } },
      { t: "🛠 BUG", p: "位置錯、照片不對、查不到——按它，再照提示寫一句話，開發者就會收到。",
        d: { k: "chat", ttl: "回報一次", ch: [
          { l: "回報", m: [act("👆 按輸入框上面的「🛠 BUG」"), me("bug"), bot("要回報什麼？寫在後面就好 🙏\n\n例：\n　bug 22975 位置不對，實際在 K2\n　/bug 23661 照片是別支藥的\n　．bug 這支查不到\n\n（前面打不打符號都可以，半形全形都認得。）"), me("bug 90101 位置不對，實際在 K5"), bot("收到了，謝謝您 🙏\n\n「90101 位置不對，實際在 K5」\n\n已經記下來，開發者會看到。\n\n如果是位置不對，麻煩補藥時先以實際位置為準。")],
            n: "按「🛠 BUG」＝幫你打「bug」。機器人會問你要回報什麼：照它的例子，**連「bug」一起打**，後面寫一句話就好。" }
        ] } }
    ], tryp: { kind: "text", text: "教學", p: "回 LINE，按一顆按鈕，或打「教學」「公告」「bug」試試。", label: "在 LINE 試試看", hint: "會回到 LINE 聊天室，已經幫你填好「教學」，按送出就行。" },
    recap: ["**輸入框上面那排按鈕永遠都在**，按一下就好，不用記指令。", "**🌐 網頁**開大畫面、**📖 教學**回到這裡、**📢 藥品通知**一次看完通知。", "發現位置錯、照片不對，按**「🛠 BUG」**，再照提示寫一句話（連「bug」一起打）。"],
    quiz: { q: "發現某支藥的位置寫錯了，怎麼回報給開發者？", h: "提示：輸入框上面那排按鈕有答案。", o: ["按「🛠 BUG」，再照提示寫一句話", "按「📢 藥品通知」", "按「📖 教學」", "按「🌐 網頁」"], a: 0, why: "按「🛠 BUG」（等於打「bug」），再照提示連「bug」一起打、後面寫一句話，開發者會收到。例：bug 90101 位置不對，實際在 K5。" } }
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
  var WIDE = { dc: 1, car: 1, ll: 1, ask: 1, nf: 1, tb: 1 };
  function firstFlags(msgs) {
    var prev = "";
    return msgs.map(function(m) {
      if (m.w === "act") return false;
      var side = m.w === "me" ? "me" : "bot", f = side !== prev;
      prev = side;
      return f;
    });
  }
  function bubble(m, animated, first) {
    var w = m.w, inner = bubble0(m), cls = first ? " first" : "", b;
    if (w === "act") b = inner;
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
    return el("div", { class: "pho pp", role: "img", "aria-label": "傳了一張手寫的照片：" + m.note.join("、") }, [el("div", { class: "pa", "aria-hidden": "true" }, m.note.map(function(t) { return el("div", { text: t }); }))]);
  }
  function bubble0(m) {
    var w = m.w;
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
    stage.appendChild(el("p", { class: "capn", text: "示意畫面：藥名、位置都是編的。" }));
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
    var parts = k === "anat" ? demoAnat(s.d) : k === "plan" ? demoPlan() : k === "turn" ? demoTurn() : k === "qbar" ? demoQbar(s.d) : demoChat(s.d);
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
    setTop([el("div", { class: "ttl" }, [el("span", { class: "t", text: "補藥神器 教學" })])]);
    botEl.hidden = true;
    root.className = "wrap";
    var fill = el("i");
    fill.style.width = pct + "%";
    var cta = nx
      ? el("a", { class: "cta", href: "#/l/" + nx.id, text: (n ? "繼續學：" : "開始學：") + nx.name })
      : el("a", { class: "cta sec2", href: "#/l/" + LESSONS[0].id, text: "全部學完了！從頭複習" });
    var kids = [
      el("section", { class: "hero" }, [
        el("h1", { text: "看一遍，就會用補藥神器" }),
        el("p", { class: "sub", text: N + " 課。一課一個重點，點哪一課都可以，學到哪裡都記得。" }),
        el("div", { class: "prog" }, [
          el("div", { class: "prog-r" }, [el("span", { text: "已學 " + n + " / " + N + " 課" }), el("b", { text: pct + "%" })]),
          el("div", { class: "track", role: "progressbar", "aria-label": "學習進度", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) }, [fill])
        ]),
        cta
      ]),
      el("h2", { class: "all", text: "全部課程" }),
      chapters(done, nx ? nx.id : "", "ol"),
      el("div", { class: "foot" }, "學習進度只記在這支手機裡，不會傳給別人。示範用的藥都是編出來的，不是真的藥品資料。"),
      resetBox()
    ];
    return { title: "補藥神器 教學", kids: kids };
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
    return { title: L.name + "・補藥神器 教學", kids: kids };
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
