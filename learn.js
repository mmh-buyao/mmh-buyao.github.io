(function() {
  "use strict";
  var root = document.getElementById("main"), topEl = document.getElementById("top"), botEl = document.getElementById("bot");
  var NS = "buyao_learn_", mem = {};
  var store = {
    get: function(k) { try { var v = localStorage.getItem(NS + k); if (v !== null) return v; } catch (e) {} return mem[k] === undefined ? null : mem[k]; },
    set: function(k, v) { mem[k] = v; try { localStorage.setItem(NS + k, v); } catch (e) {} },
    del: function(k) { delete mem[k]; try { localStorage.removeItem(NS + k); } catch (e) {} }
  };
  var REDUCE = false, escFn = null;
  try { REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}
  var APP_URL = "";
  try { if (/^https?:$/.test(location.protocol)) APP_URL = location.origin + location.pathname.replace(/[^\/]*$/, ""); } catch (e) {}
  var APP_HOST = "";
  try { if (/^https?:$/.test(location.protocol)) APP_HOST = location.host; } catch (e) {}

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

  function me(t) { return { w: "me", t: t }; }
  function bot(t) { return { w: "bot", t: t }; }
  function act(t, tap) { return { w: "act", t: t, tap: tap }; }
  function pic(label, kind) { return { w: "me", pic: label, k: kind || "t" }; }
  function voice() { return { w: "me", voice: "0:03" }; }
  function hand(lines) { return { w: "me", note: lines }; }
  function dc(code, o) { return { w: "dc", c: code, o: o || {} }; }
  function car(codes, o) { return { w: "car", cs: codes.map(function(c) { return { c: c, o: o || {} }; }) }; }
  function ll(spec) { return { w: "ll", s: spec }; }
  function ask(codes, shown, how) { return { w: "ask", cs: codes, shown: shown, how: how || "" }; }
  function sheet(codes) { return { w: "tb", cs: codes }; }
  function nf(kw) { return { w: "nf", kw: kw }; }
  function bigplan(hit) { return { w: "pl", hit: hit || "K2" }; }
  function cdc() { return { w: "cd" }; }
  function br(o) { return { w: "br", o: o || {} }; }
  function lp(o) { return { w: "lp", o: o || {} }; }
  function qb(k) { return { w: "qb", k: k }; }
  function gd(o) { return { w: "gd", o: o || {} }; }
  function jn(k) { return { w: "jn", k: k }; }
  function sc(k, hot) { return { w: "sc", k: k, hot: !!hot }; }
  function fr(o) { return { w: "fr", o: o || {} }; }
  var FW = "👋 歡迎使用補藥神器！\n\n這裡可以查藥品放在哪裡：\n・打字：CODE、藥名（中文或英文前幾個字）、學名或位置（例如 K2）\n・拍照：藥盒、鋁箔、瓶身，或手寫的藥名\n・語音：按住麥克風，講藥名或 CODE\n\n⚠️ AI 可能讀錯，請核對藥櫃標籤紙。\n\n輸入框上面那排按鈕一直都在：\n・🌐 網頁：開網頁版\n・📖 教學：功能教學\n・📢 藥品通知：停止供貨、改包裝、缺貨\n・🛠 BUG：回報問題\n・👥 加入補藥神器：邀請同事一起用\n\n第一次用，先按下面卡片的「開始學習」。";
  var DEMO_SIX = "482915";
  var DEMO_CODE = "Kd7mPq4Xr";
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
  var TM = "上午 9:41";
  var WARN = "⚠️ AI 可能讀錯，請核對藥櫃標籤紙";
  function codeWarn(kw) { return "⚠️ 找不到 CODE「" + kw + "」\n\n下面列出的是「CODE 相近」的品項,\n不是你輸入的那一個品項藥品。\n請務必核對藥櫃標籤紙再補藥 🙏"; }
  var N1 = "改包裝通知，示範：這品項藥品換包裝了，瓶身標籤顏色不一樣";
  var N2 = "停止供貨，示範：預計下個月恢復供貨，這段時間先找替代藥";
  var FAM1 = { cats: [["💊 同成分不同劑量", ["90114"]], ["🏷 同成分同劑量", ["90115"]]] };
  var FAM2 = { cats: [["🔁 同成分不同劑型", ["90111", "90112"]]] };
  var SPOTS = ["K2", "B1", "棧一"];
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
  var CH = [{ n: "基本查藥" }, { n: "換個方式查" }, { n: "一次看多個品項藥品、按鈕" }];
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
  var TURNS = [
    { d: "l", l: "左手邊", deg: 0, tn: "不用轉", red: "f", say: "大門處或是出入口在你**左手邊** → 這張圖的「大門」本來就在左邊，**不用轉**。**紅框在圖的上面**，就是藥局**前面**那一側。" },
    { d: "f", l: "前面", deg: 90, tn: "往右轉一格（90 度）", red: "r", say: "大門處或是出入口在你**前面** → 把圖**往右轉一格**（90 度），讓圖上的「大門」跑到上面。轉好後，**紅框在圖的右邊**，就是藥局**右手邊**那一側。" },
    { d: "r", l: "右手邊", deg: 180, tn: "轉半圈（180 度）", red: "b", say: "大門處或是出入口在你**右手邊** → 把圖**轉半圈**（180 度），讓圖上的「大門」跑到右邊。轉好後，**紅框在圖的下面**，就是藥局**後面**那一側。" }
  ];
  var HOW = [
    { b: "點一課，進去學", s: "目錄一課一列，點哪一課都可以；學過的課前面會打 ✓。" },
    { b: "往下捲，看示範", s: "灰底的「示範區」捲到就會自己示範一遍；想自己玩，點裡面的選項就換你操作；按「重播 ↺」會從頭再自動示範一遍。" },
    { b: "學完按「下一課 ›」", s: "「‹ 上一課」「下一課 ›」固定在最下面；點最上面的課名，可以跳到任何一課。" },
    { b: "要回聊天室", s: "按左上角的「關閉」（叉叉）或「返回」；Android 也可以按手機的返回鍵。學到哪裡，這支手機都記得。" }
  ];
  var HOW_SCENES = [{ pg: "toc", hot: "row" }, { pg: "lesson", hot: "stage" }, { pg: "lesson", hot: "next" }, { pg: "lesson", hot: "close" }];
  var QCHIPS = [
    { k: "web", t: "🌐 網頁", n: "**🌐 網頁**：直接開補藥神器網頁版（不是幫你打字）。" },
    { k: "guide", t: "📖 教學", n: "**📖 教學**：幫你打「教學」，就是回到這一份教學。" },
    { k: "notice", t: "📢 藥品通知", n: "**📢 藥品通知**：幫你打「公告」，一次看完停止供貨、改包裝、缺貨的通知。" },
    { k: "bug", t: "🛠 BUG", n: "**🛠 BUG**：幫你打「bug」；再照提示，連「bug」一起打、後面寫一句話回報問題。" },
    { k: "join", t: "👥 加入補藥神器", n: "**👥 加入補藥神器**：幫你打「加入補藥神器」；機器人會傳一張 QR，請同事用 LINE 掃，就能加入（最後面那一顆，手機上要往左滑、電腦要拉按鈕下面的捲軸才看得到）。" }
  ];

  var LESSONS = [
    { id: "card", ch: 0, name: "卡片介紹", secs: [
      { t: "最上面：這品項藥品叫什麼", p: "查到的每一個品項藥品，都會變成一張卡片，長得跟下面這張一模一樣（藥名是編的）。先看最上面：點一個名稱，看它是什麼。",
        d: { k: "anat", w: "top" } },
      { t: "中間和最下面：外觀、去哪裡拿", p: "往下看：灰底框裡有外觀、適應症、照片；再下面是去哪裡拿，最下面有時還有一個紫色的框。點一個名稱，看它是什麼。",
        d: { k: "anat", w: "low" } },
      { t: "黃色的提醒框", p: "有些藥的卡片上，會多一個黃色的框，就在名字的下面。選一種看看。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "改包裝", m: [me("90101"), dc("90101", { note: N1 })],
            n: "框裡寫的是這品項藥品的**通知**（停止供貨、改包裝、缺貨、換廠…）。先讀完，再去拿藥。想一次看完所有藥的通知，按輸入框上面的「📢 藥品通知」（第 9 課）。" },
          { l: "停止供貨", m: [me("90106"), dc("90106", { note: N2 })], n: "不管是停止供貨還是改包裝，**黃框都在名字的下面**，先讀完再拿藥。" },
          { l: "沒有通知", m: [me("90103"), dc("90103")], n: "**沒有黃框**，就是目前沒有通知。" }
        ] } }
    ], tryp: { kind: "code", p: "回 LINE 查一個真的品項藥品，對照上面學到的每一塊。", label: "在 LINE 查一個真的品項藥品", hint: "會回到 LINE 聊天室，查一個真的品項藥品，對照上面的說明。" },
    recap: ["**最上面**是這品項藥品叫什麼：CODE、商品名、中文名；灰色小字是學名（成分）。", "**中間**是外觀和適應症，**粉紅色的框**是「去哪裡拿」（位置），旁邊的小圖是平面圖。", "卡片上有**黃色的框**，先讀完通知，再去拿藥。"] },

    { id: "map", ch: 0, name: "看平面圖", secs: [
      { t: "平面圖上有什麼", p: "卡片最下面，位置的右邊有一張小圖，就是這一區的**平面圖**：用紅框告訴你，這品項藥品放在這一區的哪裡。點一個名稱，看圖上的每一塊是什麼。",
        d: { k: "plan" },
        note: "圖上**沒有**標「你在這裡」，所以要靠**大門處或是出入口**來對方向，下一段教你怎麼做。" },
      { t: "先看大門處或是出入口在哪", p: "看平面圖的三個步驟：站在藥局裡，先看一眼**大門處或是出入口**在你的哪一邊；再到圖上找「大門」兩個字；最後**翻轉你的手機**，讓圖上的「大門」跟大門處或是出入口在**同一邊**。",
        tips: [{ b: "站好，看大門處或是出入口", s: "它在你的前面、右手邊，還是左手邊" }, { b: "圖上找「大門」", s: "寫著「大門」，旁邊有箭頭" }, { b: "翻轉手機，對齊", s: "圖上的「大門」跟大門處或是出入口同一邊" }], tipsFirst: true,
        d: { k: "turn" },
        note: "不管圖上的「大門」本來在哪一邊，做法都一樣：**轉到圖上的「大門」，跟大門處或是出入口在同一邊**。可以真的**翻轉手機**（像轉一張紙本地圖）；手機的畫面自己轉回來、或邊走邊轉不方便的時候，在腦中轉也行。",
        warn: "圖上沒有「你在這裡」，一定要先用大門處或是出入口對方向；不要直接照圖上的左右走。" },
      { t: "轉好之後，照紅框走", p: "轉好以後，圖的方向就跟你眼前的藥局一樣：**圖的上面是前面、下面是後面、左右也一樣**。看紅框在圖的哪一邊，就往藥局的那一側走；走到附近，再對一下卡片上的位置名稱。",
        d: { k: "chat", ttl: "點平面圖，看大圖", ch: [
          { l: "點一下小圖", m: [dc("90104"), act("👆 點一下卡片上的平面圖", ".lc-map"), bigplan("K2")],
            n: "小圖看不清楚的時候，**點一下小圖**，聊天室會再傳一張**大圖**；點大圖，兩指撐開還能再放大。" }
        ] },
        note: "有些位置**沒有平面圖**（例如公藥區），卡片上就不會有小圖。照粉紅框裡的位置文字找就好。" },
      { t: "一個品項藥品放好幾個地方", p: "有的藥放在好幾個地方，粉紅框裡就會有**幾顆按鍵**：亮的那一顆，是現在看的地方，右邊的平面圖也是那一個地方。按另一顆，會再傳一張新的卡片，亮的換成你按的那一顆，平面圖也跟著換。",
        d: { k: "chat", ttl: "按按看", ch: [
          { l: "按 B1", m: [dc("90104", { spots: SPOTS, on: 0 }), act("👆 按「B1」", ".lc-sb:nth-child(2)"), dc("90104", { spots: SPOTS, on: 1 })],
            n: "按了 **B1**：亮的換成 B1，平面圖也換成 B1 那一區。" },
          { l: "按 棧一", m: [dc("90104", { spots: SPOTS, on: 0 }), act("👆 按「棧一」", ".lc-sb:nth-child(3)"), dc("90104", { spots: SPOTS, on: 2 })],
            n: "按了 **棧一**：亮的換成棧一，平面圖也換成棧一那一區。" }
        ] } }
    ], tryp: { kind: "code", p: "回 LINE，查一個真的品項藥品，找找卡片上的平面圖，照上面的三個步驟對方向。", label: "在 LINE 查一個真的品項藥品", hint: "會回到 LINE 聊天室，查一個真的品項藥品，再看它的平面圖。" },
    recap: ["**平面圖上的紅框**，就是這品項藥品放的那一格；點小圖會再傳一張大圖。", "**先看大門處或是出入口在哪**，再**翻轉手機**（或在腦中轉），讓圖上的「大門」跟它在同一邊。", "轉好以後，**圖的上面就是前面**，照紅框的位置走過去。"] },

    { id: "search", ch: 0, name: "打字查藥", secs: [
      { t: "什麼都能查，打了就找", p: "「CODE」「商品名」「中文名」「學名」「位置」，想到什麼就打什麼。不用先按功能、不用選分類，一秒就出結果。",
        d: { k: "chat", ttl: "點一種，看結果", ch: [
          { l: "CODE", m: [me("90101"), C1], n: "打 **CODE** 最準，不會抓到別的品項藥品。紙條上有寫 CODE，就直接打，一個字都不用多打。" },
          { l: "商品名", m: [me("DEMOSYRUP"), dc("90102")], n: "打 **商品名**（藥盒上印的英文名）前面幾個字就查得到。" },
          { l: "中文名", m: [me("測試洛爾"), C1], n: "想不起英文名的時候，打 **中文名** 一樣查得到。" },
          { l: "學名", m: [me("samplexin"), car(["90111", "90112", "90102"])], n: "打 **學名**（卡片上灰色的小字），同成分的藥會一起出來，**往左滑**看下一張。" },
          { l: "位置", m: [me("K2"), ll(L_K2)], n: "直接打 **位置**，那一格的藥整批列出來（第 7 課）。" }
        ] },
        note: "想用**適應症**找（例如咳嗽的藥），要在前面加一個符號，看第 8 課。" },
      { t: "打前面幾個字就好", p: "不用打全名。中文 2 個字、英文 3 個字母就開始找；字越多，找得越準。",
        d: { k: "chat", ttl: "選一種打法", list: true, ch: [
          { l: "打「測試」（2 個字）→ 有 3 個品項藥品，一張一張往左滑", m: [me("測試"), car(["90101", "90105", "90106"])], n: "只記得開頭也沒關係：打幾個字，符合的藥會排成一排卡片，**往左滑**看下一張。" },
          { l: "打「測試洛爾」（4 個字）→ 只剩 1 個品項藥品，一張卡片", m: [me("測試洛爾"), C1], n: "字打得越多，剩下的越少，**最多打到只剩一個品項藥品，就只有一張卡片**。" },
          { l: "打「dem」（3 個字母）→ 有 2 個品項藥品，一張一張往左滑", m: [me("dem"), car(["90102", "90107"])], n: "英文也一樣：**只打前 3 個字母**就開始找了，名字裡有這幾個字母的藥排成一排，**往左滑**看下一張。大小寫都可以。" },
          { l: "打「demos」（5 個字母）→ 只剩 1 個品項藥品，一張卡片", m: [me("demos"), dc("90102")], n: "多打幾個字母，剩下的就更少：**打到只剩一個品項藥品，就是一張卡片**，不用打完整的「DEMOSYRUP」（9 個字母）。" }
        ] } },
      { t: "打錯字也沒關係", p: "打錯一兩個字也找得到：系統會直接找**最接近的藥**，把卡片帶出來，不用重打。拿藥前，**核對藥櫃標籤紙**。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "錯一個字", m: [me("測試落爾"), C1], n: "打成「測試**落**爾」（正確是「洛」），系統**直接**帶出最接近的那品項藥品，**不會先問你**。不是你要的，就換個字再查。" },
          { l: "CODE 打錯", m: [me("09101"), bot(codeWarn("09101")), C1],
            n: "打錯 **CODE** 要特別小心：系統先寫「⚠️ 找不到 CODE」，再列出 **CODE 相近**的藥——**不是你輸入的那一個品項藥品**。一定要核對藥櫃標籤紙再補藥。" },
          { l: "查不到", m: [me("abcxyz"), nf("abcxyz")], n: "真的找不到的時候，會出一張**黃框**的卡片：請翻閱紙本『藥品位置查詢表』；下面還有幾個小技巧。有相近的藥時，卡片裡還會問「有相符的藥品嗎？」，輸入框上面的按鈕點一個就查。" }
        ] } },
      { t: "換你打打看", p: "前面都是看別人打，這一段**換你打**。下面是練習用的假聊天室：打什麼都不會傳到任何地方，不用怕打錯。照三個步驟做：",
        tips: [{ b: "在輸入框打字", s: "只打前幾個字：英文 3 個字母（例：dem）、中文 2 個字。也可以點範例字（幫你打好、直接送出）" }, { b: "按「送出」", s: "跟在 LINE 按送出一樣" }, { b: "看機器人怎麼回", s: "聊天室裡是機器人回的卡片；下面深色的框，寫它是怎麼找到的" }], tipsFirst: true,
        d: { k: "sim", ttl: "練習聊天室", pre: ["dem", "demos", "測試", "測試洛爾"], ex: ["90101", "samplexin", "K2"], bad: ["測試落爾", "09101", "abcxyz"] },
        keys: ["**機器人一步一步找**：先看是不是指令、CODE、位置，再找名字；都找不到，才放寬（拿掉空格符號、容許打錯）。", "**打前面幾個字就好，不用打全名**：中文 2 個字、英文 3 個字母就開始找；字越多，找得越準。有 CODE 就打 CODE，只會出一張卡片，最準。", "**看到「CODE 相近」或查無，別硬拿**：核對藥櫃標籤紙；真的找不到，換個字再查，或翻紙本『藥品位置查詢表』。"] }
    ], tryp: { kind: "typo", p: "回 LINE，故意打錯一個字，看它怎麼接住你。", label: "在 LINE 試試看", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**什麼都能打**：CODE、藥名、學名、位置，都查得到。", "**打前面幾個字就好**：中文 2 個字、英文 3 個字母開始找。", "**打錯字沒關係**：系統直接帶出最接近的藥；打錯 CODE 要核對藥櫃標籤紙；真的查不到，翻『藥品位置查詢表』。"] },

    { id: "photo", ch: 1, name: "拍照查藥", secs: [
      { t: "包裝拍起來，直接傳", p: "包裝、鋁箔、瓶身都可以，不用打半個字。",
        d: { k: "chat", ttl: "選一種拍法", ch: [
          { l: "藥盒", m: [pic("藥盒包裝", "t"), bot(WARN), C1], n: "字面朝上、光線夠、一張一盒，出卡片最快。回覆最前面會先提醒一句：**AI 可能讀錯，請核對藥櫃標籤紙**。" },
          { l: "鋁箔／瓶身", m: [pic("鋁箔或瓶身", "w"), bot(WARN), dc("90102")], n: "鋁箔、瓶身上有印字的，一樣拍起來就傳。" },
          { l: "好幾盒", m: [pic("三盒一起拍", "three"), bot(WARN), car(["90101", "90102", "90103"])],
            n: "一次拍好幾盒也可以，**全部一起出卡片**，往左滑看下一張；超過 5 個品項會變成一張總表，點一列出卡片。" }
        ] } },
      { t: "拍得清楚，出得最快", p: "字面朝上、對到焦、避開反光；拍好再按快門。",
        d: { k: "chat", ttl: "比比看", ch: [
          { l: "拍得清楚", m: [pic("清楚的包裝", "t"), bot(WARN), C1], n: "對得上藥名的，**直接出卡片**。" },
          { l: "拍得模糊", m: [pic("模糊的包裝", "blur"), bot(WARN), ask(["90101", "90105"], "TESTO", "用「TESTO」這個字找到的"), act("👆 按「是這個藥品？」", ".lk-y"), me("90101"), C1],
            n: "對不上的，會列出很像的藥，按「是這個藥品？」就出卡片（按下去，會幫你把那品項藥品的 CODE 打出來）。**都不是的話，直接打字查最快。**" }
        ] },
        warn: "⚠️ AI 可能讀錯，請核對藥櫃標籤紙。" }
    ], tryp: { kind: "open", p: "回 LINE，拍一盒藥傳傳看。", label: "回 LINE 拍一張試試", hint: "會回到 LINE 聊天室，點輸入框旁邊的相機拍一盒藥。" },
    recap: ["**包裝、鋁箔、瓶身都能拍**，不用打半個字。", "**一次可以拍好幾盒**；超過 5 個品項會變成一張總表，點一列出卡片。", "**拍清楚、避開反光**；AI 可能讀錯，拿藥前核對藥櫃標籤紙；對不上就直接打字查。"] },

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
    recap: ["**按住 🎤 講藥名，放開就查**，手上忙的時候最好用。", "回覆最前面會寫「🎤 聽到…」，**聽錯了一眼看得出來**。", "聽錯字或太吵：**改講 CODE（唸數字）**，或用鍵盤上的 🎤。"] },

    { id: "hand", ch: 1, name: "手寫", secs: [
      { t: "手寫菜單直接拍", p: "手寫的菜單拍起來傳，一行一個品項，讀到的直接出卡片。",
        d: { k: "chat", ttl: "選一種情況", ch: [
          { l: "字寫清楚", m: [hand(["示範康糖漿", "測試洛爾", "模擬普利"]), bot(WARN), car(["90102", "90101", "90103"])],
            n: "讀到的直接出卡片，往左滑看下一張。**一張 10 行以內**最準、最快；紙條長就分兩張拍。" },
          { l: "有一行看不清", m: [hand(["示範康糖漿", "測試洛■", "模擬普利"]), bot(WARN), car(["90102", "90103"]), ask(["90101", "90105"], "測試洛■", "拼法相近的")],
            n: "看不清的行，會列出很像的藥讓你點；**都不是，就直接打字查**。" },
          { l: "超過 5 行", m: [hand(["示範康糖漿", "測試洛爾", "模擬普利", "測試寧", "測試醇", "示範卡錠"]), sheet(["90102", "90101", "90103", "90105", "90106", "90107"])],
            n: "超過 5 個品項，會變成**一張總表**，一列一個品項藥品（「⚠️ AI 可能讀錯」那句寫在表的標題下面）。**點一列**，就出那品項藥品的完整卡片。" }
        ] } }
    ], tryp: { kind: "open", p: "回 LINE，拍一張手寫的藥名傳傳看。", label: "回 LINE 拍一張試試", hint: "會回到 LINE 聊天室，拍一張手寫的藥名試試。" },
    recap: ["**手寫的藥名也能拍**：一行一個品項。", "**一張 10 行以內**最準；太長就分兩張拍；超過 5 個品項會變成一張總表。", "看不清的行會列出很像的藥讓你點；**都不是就直接打字查**。"] },

    { id: "agg", ch: 2, name: "彙整卡片", secs: [
      { t: "一格的藥，一張卡看完", p: "打位置，這一格的藥就整批列出來；品項多的時候會自動分頁，往左滑。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "K2", m: [me("K2"), ll(L_K2)], n: "打**位置**就好，不用一個一個品項藥品查。" },
          { l: "B1（品項很多）", m: [me("B1"), ll(L_B1)], n: "品項多的時候會**自動分頁，往左滑**看下一頁。（示意圖：第一頁中間幾列省略沒畫。）" }
        ] } },
      { t: "按一列，出完整卡片", p: "列表只列名字和位置；想看哪一個品項藥品，按那一列就出完整的卡片。",
        d: { k: "chat", ttl: "看一次", ch: [
          { l: "K2", m: [me("K2"), ll(L_K2), act("👆 按第 2 列（等於幫你打那品項藥品的 CODE）", [".lb-r", 1]), me("90111"), dc("90111")], n: "按任何一列，出完整卡片，跟打 CODE 查到的一樣。" }
        ] } }
    ], tryp: { kind: "loc", p: "回 LINE，打一個真的位置，看那一格的藥。", label: "在 LINE 查一個真的位置", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**打位置**，這一格的藥整批列出來。", "品項多會**自動分頁，往左滑**。", "**按任何一列**，出完整卡片。"] },

    { id: "family", ch: 2, name: "藥品家族", secs: [
      { t: "卡片上的紫色框", p: "有些藥的卡片最下面，有一個紫色的**藥品家族**框：院內同成分的其他藥（換劑量、換劑型、換廠牌）。平常收起來，一類一行。",
        d: { k: "chat", ttl: "按「▸ 打開」", ch: [
          { l: "打開看看", m: [dc("90101", { fam: FAM1 }), act("👆 按卡片上的「▸ 打開」", ".lc-fo"), me("▸ 打開"), dc("90101", { fam: FAM1, opened: 1 })],
            n: "按「▸ 打開」，會再傳一張卡片，這次家族**全部攤開**：一類一組，一列一個品項藥品，按任何一列就出那品項藥品的卡片。" }
        ] } },
      { t: "加個符號，整批列出來", p: "想找同成分的所有藥，在**學名**前面加一個符號（. ＃ ／ 任何一個都可以）；也可以在符號後面打**適應症**，同一類的藥全列出來。",
        d: { k: "chat", ttl: "選一種打法", ch: [
          { l: ".samplexin", m: [me(".samplexin"), ll(L_SAM)], n: "例：**.samplexin**（學名，卡片上灰色的小字）。學名裡有這個字的藥，不管劑量、劑型、廠牌，院內全部列出來。" },
          { l: ".咳嗽", m: [me(".咳嗽"), ll(L_COUGH)], n: "例：**.咳嗽**（適應症）。**適應症有咳嗽**的藥一次列出來，想不起藥名、只知道病名的時候最好用。適應症有填的藥才找得到。" }
        ] } },
      { t: "跟一般查詢差在哪", p: "**不加符號＝一般查詢**：拿你打的字去比對 CODE、商品名、中文名、學名，對得上的藥一個品項藥品一張卡片，往左滑。**加了符號＝查整個家族**：同學名（或同適應症）的藥全部列成一張總表，一列一個品項藥品。",
        d: { k: "chat", ttl: "比比看", ch: [
          { l: "samplexin", m: [me("samplexin"), car(["90111", "90112", "90102"])], n: "**不加符號**（一般查詢）：商品名、中文名或學名裡有這幾個字的藥，一個品項藥品一張卡片，往左滑。" },
          { l: ".samplexin", m: [me(".samplexin"), ll(L_SAM)], n: "**加了符號**（查家族）：變成一張總表，一列一個品項藥品，按一列出卡片。" }
        ] } }
    ], tryp: { kind: "fam", p: "回 LINE，在一個真的品項藥品的學名前面加一個點，看全家。", label: "在 LINE 查一個真的家族", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**卡片最下面的紫色框**＝藥品家族：院內同成分的其他藥，按「▸ 打開」全部攤開。", "**學名或適應症前面加 . ＃ ／** 任何一個，同成分（或同適應症）的整批列出來。", "**換規格、換廠牌、想不起藥名**的時候最好用。"] },

    { id: "pin", ch: 2, name: "釘住的按鈕", secs: [
      { t: "不用記指令，按就好", p: "機器人**每一次回覆**的下面，輸入框上面，都會有一排按鈕。點一下，就等於幫你打好那個字。按按看下面這五顆。這一排放不下，手機往左滑、電腦拉下面的捲軸，後面還有。",
        d: { k: "qbar", chips: true, pick: true },
        note: "按鈕不見了？它只出現在**機器人最新傳的那一則**下面。隨便傳個字（例如「教學」）等它回，按鈕就回來了；直接打「教學」「公告」「bug」也一樣。" },
      { t: "🌐 網頁", p: "按它，直接開補藥神器網頁版——在 LINE 裡面開，不用另外登入。想用比較大的畫面看清單、查藥、看藥品通知的時候，就按它。",
        d: { k: "qbar", chips: true, hot: "web", cmd: "按「🌐 網頁」＝開網頁版（不是打字）" },
        note: "網頁版裡面也能打字查藥、📷 拍照，首頁有公告和所有藥品。要在**電腦**上用，看下一段。",
        warn: "沒看到這顆？可能是網頁版目前沒有開，請問管理者。" },
      { t: "用電腦（LINE 以外的瀏覽器）開網頁版", p: "LINE 裡面按「🌐 網頁」就開了。想在**電腦**，或手機的 Chrome、Safari 這類 **LINE 以外的瀏覽器**開，要多一個登入的步驟：網頁給你一組**代號**，貼到 LINE，LINE 回你 **6 位數驗證碼**，再打回網頁。",
        d: { k: "chat", ttl: "5 個步驟，點一步看一步", list: true, seq: true, cap: "示意畫面：電腦的瀏覽器和 LINE 都照真的畫的；代號、6 位數驗證碼都是編的。", ch: [
          { l: "電腦打開瀏覽器，輸入網址", s: "用 Chrome、Edge、Safari 都可以。網址在下面（點一下就整串選起來，方便複製）。", m: [act("💻 電腦的瀏覽器：開一個新分頁，網址列是空的"), br({ st: "enter" })],
            n: "自己用的時候：把下面那串網址整串選起來、複製，貼到瀏覽器的網址列，按 **Enter**。網頁一打開，會**自己向後端要一組代號**，要等一下下（後端剛睡醒的時候會久一點）。" },
          { l: "網頁上會出現一組「代號」", s: "9 個英文＋數字，按「複製代號」。英文大小寫都可以。", m: [act("💻 網頁上出現一組代號。按「複製代號」，鍵上會寫「已複製 ✓」"), br({ st: "copied", hot: "code" })],
            n: "**代號是從這裡來的：電腦瀏覽器裡的網頁。** 真的代號每次打開、或按「重新取得代號」都會換一組；圖上這一組是編的。" },
          { l: "回 LINE，把代號貼進去、送出", s: "要貼在跟補藥神器的一對一聊天室，不是群組。", m: [act("📱 回到 LINE，在跟補藥神器的一對一聊天室，貼上代號、送出"), me(DEMO_CODE)], n: "" },
          { l: "LINE 回一張「🔐 補藥神器 網頁驗證碼」", s: "上面有 6 位數的驗證碼。", m: [me(DEMO_CODE), cdc()],
            n: "圖上的 6 位數是編的。真的那一組，只能打在**剛剛出現代號的那個網頁**。" },
          { l: "回到電腦的網頁，打 6 位數，按「登入」", s: "驗證碼只能用一次，不要傳給任何人。", m: [act("💻 回到電腦的網頁，把 6 位數打進去"), br({ st: "type", hot: "go" }), act("👆 按「登入」", ".bw-go"), br({ st: "ok" })],
            n: "進去了：這就是網頁版的首頁，可以打字查藥、📷 拍照。" }
        ] }, url: true,
        note: "要在 **5 分鐘內**做完，網頁上有倒數；超過了，網頁會自己換一組新的代號，把新的再貼一次就好。代號和驗證碼都只能用在**出現代號的那個網頁**，換別的瀏覽器打沒用。",
        warn: "網頁上寫的是「請從 LINE 按…開這個網頁」，沒有代號？表示這個瀏覽器還沒設定好，請問管理者。" },
      { t: "📖 教學", p: "就是現在看的這一份教學。忘記怎麼用、想看某一課，按它就回來。",
        d: { k: "qbar", chips: true, hot: "guide", cmd: "按「📖 教學」＝打「教學」" },
        flow: { h: "按下去之後會到哪裡", d: { k: "chat", ttl: "3 個步驟，點一步看一步", list: true, seq: true, cap: "示意畫面：LINE 的聊天室、卡片和內建瀏覽器都照真的畫的。", ch: [
          { l: "按「📖 教學」", s: "等於幫你打「教學」。", m: [qb("guide"), act("👆 按輸入框上面的「📖 教學」", ".qchip.on"), me("教學")], n: "" },
          { l: "機器人傳一張「📖 補藥神器　教學」卡片", s: "卡片最下面有藍色的「開始學習」。", m: [me("教學"), gd()], n: "" },
          { l: "按「開始學習」", s: "LINE 會用它內建的瀏覽器打開這份教學，就是你現在看的這一頁。", m: [gd({ hot: 1 }), act("👆 按卡片上的「開始學習」", ".gc-b"), lp({ pg: "toc" })], n: "" }
        ] } },
        note: "任何時候都可以按，**不會影響你剛才查的東西**。學到哪一課，這支手機都記得；下次按「開始學習」，目錄最上面的大按鈕會寫「繼續學：○○」。" },
      { t: "這份教學怎麼操作", p: "這份教學是**一個網頁**，不是聊天室，所以操作跟查藥不一樣。4 個動作就夠了：",
        d: { k: "chat", ttl: "4 個動作，點一個看一個", list: true, seq: true, cap: "示意畫面：LINE 內建瀏覽器裡的這份教學，縮小的樣子。", ch: HOW.map(function(h, i) {
          return { l: h.b, s: h.s, m: [lp(HOW_SCENES[i])], n: "" };
        }) },
        note: "捲到最下面（看完整課），這一課就算學過。每一課的「動手試試」有一顆按鈕，會直接回聊天室、字都幫你填好，按送出才會送。" },
      { t: "📢 藥品通知", p: "停止供貨、改包裝、缺貨……一次看完，一類一疊，往左滑。",
        d: { k: "chat", ttl: "按下去會怎樣", ch: [
          { l: "按「📢 藥品通知」", m: [qb("notice"), act("👆 按輸入框上面的「📢 藥品通知」", ".qchip.on"), me("公告"), ll(L_NOTICE)], n: "按下去，等於幫你打「公告」。有通知的藥，查到它的時候，**卡片上也會有黃色的 ⚠️ 框**（第 1 課）。" }
        ] } },
      { t: "🛠 BUG", p: "位置錯、照片不對、查不到——按它，再照提示寫一句話，開發者就會收到。",
        d: { k: "chat", ttl: "回報一次", ch: [
          { l: "回報", m: [qb("bug"), act("👆 按輸入框上面的「🛠 BUG」", ".qchip.on"), me("bug"), bot("要回報什麼？寫在後面就好 🙏\n\n例：\n　bug 22975 位置不對，實際在 K2\n　/bug 23661 照片是別的品項藥品的\n　．bug 這品項藥品查不到\n\n（前面打不打符號都可以，半形全形都認得。）"), me("bug 90101 位置不對，實際在 K5"), bot("收到了，謝謝您 🙏\n\n「90101 位置不對，實際在 K5」\n\n已經記下來，開發者會看到。\n\n如果是位置不對，麻煩補藥時先以實際位置為準。")],
            n: "按「🛠 BUG」＝幫你打「bug」。機器人會問你要回報什麼：照它的例子，**連「bug」一起打**，後面寫一句話就好。" }
        ] } },
      { t: "👥 加入補藥神器", p: "想請同事一起用？按它，機器人會傳一張 **QR**，請同事用 LINE 掃，就能加入。它在那排按鈕的**最後面**，手機上要往左滑、電腦要拉按鈕下面的捲軸才看得到。",
        d: { k: "chat", ttl: "邀請同事", cap: "示意畫面：官方帳號 ID 是編的；QR 是畫給你看的，掃了沒有用，真的 QR 是你們官方帳號的。", ch: [
          { l: "邀請同事", m: [qb("join"), act("👆 按輸入框上面的「👥 加入補藥神器」", ".qchip.on"), me("加入補藥神器"), jn("qr"), jn("steps")],
            n: "按「👥 加入補藥神器」＝幫你打「加入補藥神器」。機器人傳**兩則**：第一則是 **QR**，請同事用 LINE 掃；第二則是「**加入只要 3 步**」——左右滑的 4 張圖卡，一步一張圖（三張會動），同事不知道怎麼掃的話，照著做。" }
        ] },
        flow: { h: "同事不知道怎麼掃？照這幾張圖做", d: { k: "chat", ttl: "4 個步驟，點一步看一步", seq: true, list: true, cap: "示意畫面：聊天頁和掃描畫面是真的截圖；「加入」那個小視窗和歡迎訊息是照真的畫的。", ch: [
          { l: "LINE 點「聊天」，按搜尋列最右邊的掃描鈕", s: "紅圈圈起來的就是掃描鈕。", m: [sc("page", true), act("👆 按搜尋列最右邊的掃描鈕（紅圈那一顆）", ".sc-hot")],
            n: "同事的手機：LINE 下面點「聊天」。最上面搜尋列**最右邊**的方框小圖示就是掃描鈕（紅圈那一顆）。" },
          { l: "把 QR 放進框裡", s: "對準你手機上的那張 QR（第一則卡片）。", m: [sc("scan"), act("📷 對準你手機上的那張 QR，放進框裡", false)],
            n: "請同事把手機對準**你手機上的那張 QR**（第一張卡片）。掃到之後，LINE 會跳出「補藥神器」。" },
          { l: "按「加入」", s: "LINE 跳出「補藥神器」，按綠色的「加入」。", m: [fr({ hot: true }), act("👆 按「加入」", ".fb")],
            n: "LINE 跳出「補藥神器」的小視窗，按綠色的**「加入」**就加入了。" },
          { l: "跟著歡迎訊息，按「開始學習」", s: "一加入就會自動收到歡迎訊息和教學卡片。", m: [bot(FW), gd({ hot: 1 }), act("👆 按卡片上的「開始學習」", ".gc-b")],
            n: "一加入，機器人就**自己傳歡迎訊息和一張教學卡片**，下面那排按鈕也跟著出現；按「開始學習」就是這個教學網頁。" }
        ] } },
        warn: "這個 QR 任何人掃了都能加入，**只給院內的同事**，不要貼在公開的地方。" }
    ], tryp: { kind: "text", text: "教學", p: "回 LINE，按一顆按鈕，或打「教學」「公告」「bug」試試。", label: "在 LINE 試試看", hint: "會回到 LINE 聊天室，已經幫你填好「教學」，按送出就行。" },
    recap: ["**機器人每次回覆的下面，都有那排按鈕**，按一下就好，不用記指令；不見了就隨便傳個字，等它回覆。", "**🌐 網頁**開大畫面（用電腦開：貼**代號**、拿 **6 位數驗證碼**）、**📖 教學**回到這裡、**📢 藥品通知**一次看完通知、**🛠 BUG**回報位置錯、照片不對（連「bug」一起打，後面寫一句話）。", "想請同事一起用，按最後面的**「👥 加入補藥神器」**，給他一張 QR 掃；掃了、按「加入」就加入了。"] }
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

  var PW = 674, PH = 521;
  var PBLK = [
    [82, 26, 156, 75, 3.9], [246, 26, 388, 75, 3.9], [489, 22, 632, 70, 3.9],
    [318, 195, 372, 255, 5.2], [262, 257, 372, 297, 3.3], [262, 310, 372, 350, 3.3], [318, 352, 372, 416, 5.2],
    [194, 278, 249, 342, 5.2], [389, 280, 444, 344, 5.2], [445, 262, 648, 308, 3.3], [445, 311, 648, 358, 3.3],
    [373, 465, 517, 512, 3.9]
  ];
  var PBAR = [[76, 144, 674, 195, "L 3"], [76, 417, 674, 462, "L 2"]];
  var PHIT = { "K2": [246, 90, 388, 142], "B1": [194, 278, 249, 342], "棧一": [373, 465, 517, 512] };
  function pbox(e, r, fs) {
    e.style.left = (r[0] * 100 / PW) + "%";
    e.style.top = (r[1] * 100 / PH) + "%";
    e.style.width = ((r[2] - r[0]) * 100 / PW) + "%";
    e.style.height = ((r[3] - r[1]) * 100 / PH) + "%";
    if (fs) e.style.fontSize = fs + "cqw";
    return e;
  }
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
    var n = 0;
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
  var NF_TIPS = ["・只打前面幾個字就好, 例「CURA」「諾快寧」", "・空格多關鍵字縮小範圍, 例「aspirin 100」", "・輸入位置名稱可查該位置藥品, 例「棧板」「A2」", "・打錯一兩個字也找得到, 認不出來時再換個關鍵字", "・打「公告」看所有藥品通知（停供、改包裝等）"];
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
  function brUrl() { return APP_URL ? APP_URL.replace(/^https?:\/\//, "") : "（你們的補藥神器網址）"; }
  function brEl(o) {
    o = o || {};
    var st = o.st || "code", hot = o.hot || "", ld = st === "load", ok = st === "ok", ty = st === "type";
    var url = brUrl();
    if (st === "enter") return enterEl(url);
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
        ty ? el("div", { class: "bw-in v" + (hot === "input" ? " hot" : "") }, DEMO_SIX.split("").map(function(d) { return el("i", { text: d }); }))
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
  var SCS = {
    page: "同事的 LINE「聊天」頁：最上面是「聊天」「好友」和搜尋列，搜尋列最右邊的方框小圖示是掃描鈕（已經用紅圈圈起來），下面是聊天清單",
    scan: "按了掃描鈕之後的掃描畫面：鏡頭對著你手機上的 QR 卡片，把 QR 放進框裡，下面寫著「掃描行動條碼」"
  };
  function scEl(m) {
    return el("div", { class: "scp " + m.k, role: "img", "aria-label": SCS[m.k] || "截圖" }, m.hot ? [el("i", { class: "sc-hot", "aria-hidden": "true" })] : []);
  }
  function frEl(o) {
    o = o || {};
    return el("div", { class: "frs", role: "img", "aria-label": "LINE 跳出一個小視窗：補藥神器（官方帳號），下面有綠色的「加入」鍵" }, [
      el("i", { class: "fa", "aria-hidden": "true" }),
      el("div", { class: "fn", "aria-hidden": "true", text: "補藥神器" }),
      el("div", { class: "fo", "aria-hidden": "true", text: "官方帳號" }),
      el("div", { class: "fb" + (o.hot ? " hot" : ""), "aria-hidden": "true", text: "加入" })
    ]);
  }
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
  function gdEl(o) {
    o = o || {};
    return el("div", { class: "gcard", role: "img", "aria-label": "LINE 回的卡片「補藥神器　教學」：" + N + " 課，一課一個重點；最下面有藍色的「開始學習」鍵" }, [
      el("div", { class: "gc-t", "aria-hidden": "true", text: "📖 補藥神器　教學" }),
      el("div", { class: "gc-s", "aria-hidden": "true", text: N + " 課，一課一個重點。" }),
      el("div", { class: "gc-f", "aria-hidden": "true" }, [el("div", { class: "gc-b" + (o.hot ? " hot" : ""), text: "開始學習" })])
    ]);
  }
  var JN = { t: "👥 邀請同事一起用", p: "請同事用 LINE 掃下面的 QR，就能加入「補藥神器」。", id: "官方帳號 ID　@xxxxxxxx", h: "加入只要 3 步", sl: [{ k: "pt", r: "494/720", a: true, h: "① 點「聊天」，按搜尋列最右邊的掃描鈕", s: "紅圈那一顆（圖會動：手指去按的地方），然後掃上面的 QR", m: "fit" }, { k: "scan", r: "494/720", a: false, h: "① 把 QR 放進框裡", s: "對準你手機上的那張 QR，LINE 會跳出「補藥神器」", m: "cover" }, { k: "add", r: "484/392", a: true, h: "② 按「加入」", s: "按綠色的「加入」就加入了（圖會動）", m: "fit" }, { k: "welcome", r: "712/552", a: true, h: "③ 跟著歡迎訊息，先看一下教學", s: "一加入就會收到歡迎訊息和教學卡片，按「開始學習」（圖會動）", m: "fit" }] };
  function jnQrGrid() {
    var n = 29, seed = 20260929, r, c, dark, fin = [[0, 0], [0, n - 7], [n - 7, 0]], g = el("div", { class: "jc-g", "aria-hidden": "true" });
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    for (r = 0; r < n; r++) {
      for (c = 0; c < n; c++) {
        dark = null;
        fin.forEach(function(f) {
          var y = r - f[0], x = c - f[1];
          if (y >= -1 && y <= 7 && x >= -1 && x <= 7) dark = y >= 0 && y <= 6 && x >= 0 && x <= 6 && (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4));
        });
        if (dark === null && r === 6) dark = c % 2 === 0;
        if (dark === null && c === 6) dark = r % 2 === 0;
        if (dark === null) {
          var ay = r - (n - 9), ax = c - (n - 9);
          if (ay >= 0 && ay <= 4 && ax >= 0 && ax <= 4) dark = ay === 0 || ay === 4 || ax === 0 || ax === 4 || (ay === 2 && ax === 2);
        }
        if (dark === null) dark = rnd() < 0.5;
        g.appendChild(el("i", { class: dark ? "k" : null }));
      }
    }
    return g;
  }
  function jnEl(k) {
    if (k === "steps") {
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
      var demo = hot === "stage";
      function first(x) { return x.t.split("。")[0].replace(/\*\*/g, "") + "。"; }
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
    if (hot === "stage") root.setAttribute("data-ms", "5000");
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

  var WIDE = { dc: 1, car: 1, ll: 1, ask: 1, nf: 1, tb: 1, cd: 1 };
  WIDE.gd = 1;
  WIDE.jn = 1;
  var SCENE = { br: 1, lp: 1, qb: 1, sc: 1, fr: 1 };
  function firstFlags(msgs) {
    var prev = "";
    return msgs.map(function(m) {
      if (m.w === "act") return false;
      if (SCENE[m.w]) return false;
      var side = m.w === "me" ? "me" : "bot", f = side !== prev;
      prev = side;
      return f;
    });
  }
  function bubble(m, animated, first) {
    var w = m.w, inner = bubble0(m), cls = first ? " first" : "", b;
    if (w === "act") b = inner;
    else if (SCENE[w]) b = el("div", { class: "rw scene" }, [inner]);
    else if (w === "me") b = el("div", { class: "rw me" + cls }, [el("div", { class: "mt", "aria-hidden": "true" }, [el("span", { text: "已讀" }), el("span", { text: TM })]), inner]);
    else if (WIDE[w]) b = el("div", { class: "rw card" + cls }, first ? [el("span", { class: "ava", "aria-hidden": "true" }), inner] : [inner]);
    else b = el("div", { class: "rw bot" + cls }, [el("span", { class: "ava" + (first ? "" : " sp"), "aria-hidden": "true" }), inner]);
    if (animated) b.classList.add("pop");
    return b;
  }
  function phEl(m) {
    var k = m.k || "t";
    return el("div", { class: "pho" + (k === "w" ? " w" : k === "three" ? " three" : k === "blur" ? " blur" : ""), role: "img", "aria-label": "傳了一張照片：" + m.pic }, [el("i", { "aria-hidden": "true" })]);
  }
  function voEl(m) {
    return el("div", { class: "vo", role: "img", "aria-label": "傳了一段語音，長度 " + m.voice }, [
      el("span", { class: "vp", "aria-hidden": "true" }),
      el("span", { class: "bars", "aria-hidden": "true" }, [6, 11, 16, 9, 14, 19, 12, 7, 15, 10, 17, 8].map(function(h) { var i = el("i"); i.style.height = h + "px"; return i; })),
      el("span", { "aria-hidden": "true", text: m.voice })
    ]);
  }
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
  function replayBtn(label, fn) {
    return on(el("button", { type: "button", class: "replay", "aria-label": label || "重播" }, [el("span", { "aria-hidden": "true", text: "↺" }), "重播"]), "click", fn);
  }
  function tapAt(host, t) {
    if (REDUCE || !host || !t || !t.getBoundingClientRect) return null;
    var row = t.parentNode, rr, tr;
    if (row && row.classList && row.classList.contains("qrow") && row.scrollWidth > row.clientWidth) {
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
  var MSG_GAP = 480, TAP_GAP = 820, TYPE_GAP = 1300, CHAT_CAP = 4000;
  function tapTxt(s) { return String(s).replace(/\s+/g, " ").replace(/^ | $/g, ""); }
  function isType(m) { return m.w === "br" && !!m.o && m.o.st === "type"; }
  function rowMs(row) { var e = row && row.querySelector ? row.querySelector("[data-ms]") : null; return e ? parseInt(e.getAttribute("data-ms"), 10) || 0 : 0; }
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
  function sceneTap(m, row) {
    if (m.w !== "lp" || !m.o || !m.o.hot) return null;
    if (m.o.hot === "stage") return null;
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
      lastMs = at[last] + (isType(msgs[last]) ? 900 : rowMs(rows[last]) || (tg[last] ? 1000 : 200));
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
    var stage = el("div", { class: "stage" + (d.seq ? " seq" : "") }, [head]);
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
    stage.appendChild(el("p", { class: "capn", text: d.cap || "示意畫面：藥名、位置都是編的。" }));
    return [stage, note, { ms: function() { return lastMs; } }];
  }
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
  function demoTurn() {
    var btns = [], note = noteBox("");
    var tp = el("div", { class: "tp" }, [planEl("K2", true)]);
    var door = el("div", { class: "dch l", text: "🚪 大門處或是出入口" }), gap = el("div", { class: "dg l", "aria-hidden": "true" });
    var arena = el("div", { class: "arena", role: "img" }, [
      el("span", { class: "ax f", "aria-hidden": "true", text: "▲ 前面" }),
      el("span", { class: "ax l", "aria-hidden": "true", text: "左手邊" }), el("span", { class: "ax r", "aria-hidden": "true", text: "右手邊" }), gap, door, el("div", { class: "tpw" }, [tp])
    ]);
    var SIDE = { f: "上面", r: "右邊", b: "下面", l: "左邊" };
    function pick(i) {
      var t = TURNS[i];
      tp.style.transform = "rotate(" + t.deg + "deg)";
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
  function qbarEl(d, chipEls, onPick) {
    var bar = el("div", { class: "qbar", role: d.pick ? "group" : "img", "aria-label": d.chips ? "LINE 的輸入框，上面有一排按鈕：網頁、教學、藥品通知、BUG、加入補藥神器" : "LINE 的輸入框，最右邊是麥克風" });
    chipEls = chipEls || {};
    if (d.chips) {
      var row = el("div", { class: "qrow" });
      if (d.pick) on(row, "focusin", function(e) {
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
  var SIM_MAX = 12, SIM_SQ_MIN = 3, SIM_LOC_RE = /^(水)?[A-Z]{1,2}[0-9]{1,3}$/;
  var SIM_O = { "90104": { spots: SPOTS, on: 0 } };
  var SIM_LOCS = { "K2": { spec: L_K2, n: 4 }, "B1": { spec: L_B1, n: 14, pages: 2 } };
  var SIM_SYM = "[^\\w\\s\\u4e00-\\u9fff\\u3040-\\u30ff\\uff10-\\uff19\\uff21-\\uff3a\\uff41-\\uff5a]|_";
  var SIM_RE_AGG = new RegExp("^(?:" + SIM_SYM + ")+\\s*([\\s\\S]*)$");
  var SIM_RE_BUG = new RegExp("^(?:" + SIM_SYM + ")*\\s*(?:bug|回報|report|問題)\\s*([\\s\\S]*)$", "i");
  var SIM_RE_NOTICE = /^(?:公告|公佈|公布|藥品通知|通知)(?:\s+[\s\S]+)?$/;
  var SIM_RE_WEB = /^(?:開發者\s*|藥師\s*)?(?:網頁|網頁版|網站|web)(?:\s*(?:開發者|藥師))?(?:\s*(?:重發|重新|新連結|new|綁定|綁裝置|bind))?$/i;
  var SIM_RE_MULTI = /^\d{4,6}(?:[\s,，、;；\/／|｜.。]+\d{4,6})+$/;
  var SIM_ROWS = null;
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
  function simFull(s) { return s.replace(/[！-～]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 65248); }); }
  function simNorm(s) { return simFull(s).replace(/　/g, " ").replace(/[，、；;,\/／\-－+＋]/g, " ").replace(/\s+/g, " ").replace(/^ | $/g, ""); }
  function simSplit(s) {
    var out = s.replace(/([A-Za-z])(\d)/g, "$1 $2").replace(/(\d)([A-Za-z])/g, "$1 $2").replace(/([一-鿿])([A-Za-z0-9])/g, "$1 $2").replace(/([A-Za-z0-9])([一-鿿])/g, "$1 $2").replace(/\s+/g, " ").replace(/^ | $/g, ""), parts = out.split(" ").filter(String), longest = 0, i;
    if (parts.length < 2) return "";
    for (i = 0; i < parts.length; i++) {
      if (parts[i].length < 2) return "";
      if (parts[i].length > longest) longest = parts[i].length;
    }
    return longest >= 3 ? out : "";
  }
  function simRows() {
    if (SIM_ROWS) return SIM_ROWS;
    SIM_ROWS = Object.keys(DR).sort().map(function(c) {
      var r = DR[c], b = r.b.toUpperCase(), z = r.z.toUpperCase(), g = r.g.toUpperCase(), l = r.loc.toUpperCase();
      return { c: c, b: b, z: z, g: g, loc: l, hay: [c, b, z, g].join("\t"), all: [c, b, z, g, l, r.f.toUpperCase()].join("\t") };
    });
    return SIM_ROWS;
  }
  function simLocHit(r, kw) {
    if (!r.loc) return false;
    if (SIM_LOC_RE.test(kw)) return r.loc === kw || r.loc.replace(/[（(].*$/, "").replace(/^\s+|\s+$/g, "") === kw;
    return r.loc.indexOf(kw) >= 0;
  }
  function simRank(r, kw) {
    if (r.b === kw || r.z === kw) return 0;
    if (r.b.indexOf(kw) === 0 || r.z.indexOf(kw) === 0) return 1;
    if (r.g.indexOf(kw) === 0) return 2;
    return 3;
  }
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
    if (tight >= 3) use = cand.slice(0, tight);
    return { how: "fuzzy", all: use.map(function(x) { return x.c; }), kws: kws, codeLike: /^\d{4,6}$/.test(kws[0]) };
  }
  function simLocSpec(key, codes) {
    return { t: key, s: "這一格有 " + codes.length + " 個品項", hide: 1, ft: "按任何一列 → 出完整卡片", g: [{ n: "", rows: codes }] };
  }
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
  function simCols(codes, kw) {
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
      try { if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches && document.activeElement === input) input.blur(); } catch (e) {}
      msgs = simMsgs(r);
      msgs.push(act("👇 往下捲，看深色的框：機器人是怎麼找到的"));
      fl = firstFlags(msgs);
      rows = msgs.map(function(m, j) { return bubble(m, !REDUCE, fl[j]); });
      last = rows.length - 1;
      h = chat.offsetHeight;
      chat.textContent = "";
      chat.style.minHeight = h + "px";
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
      if (REDUCE) run(w); else after(260, function() { run(w); });
    }
    function chips(list, label, cls) {
      var row = el("div", { class: "picks" + (cls ? " " + cls : ""), role: "group", "aria-label": label });
      list.forEach(function(w) { row.appendChild(on(el("button", { type: "button", class: "pk", text: w }), "click", function() { fill(w); })); });
      return el("div", { class: "simg" }, [el("div", { class: "simgl", "aria-hidden": "true", text: label }), row]);
    }
    on(input, "keydown", function(ev) {
      if ((ev.key === "Enter" || ev.keyCode === 13) && !ev.isComposing && ev.keyCode !== 229) { ev.preventDefault(); run(input.value); }
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
    return [stage, net, { max: 1, note: net, ms: function() { return 2600; } }];
  }

  var AUTO_ON_VIS = 0.6, AUTO_OFF_VIS = 0.25, AUTO_START_MS = 900, AUTO_TAP_MS = 700, AUTO_MIN_MS = 2500, AUTO_MAX_MS = 6000, AUTO_AFTER_MS = 1200, AUTO_LOOPS = 3, AUTO_LOOP_MS = 1200, AUTO_LIST = [], autoIO = null;
  var AUTO_STEPS = (function() { var a = [], i; for (i = 0; i <= 100; i++) a.push(i / 100); return a; })();
  function autoPref() { return !REDUCE; }
  function autoHold(len, ms, last) {
    var read = 1200 + 30 * len, play = ms + AUTO_AFTER_MS;
    return Math.max(AUTO_MIN_MS, Math.min(AUTO_MAX_MS - AUTO_TAP_MS, last ? play : Math.max(read, play)));
  }
  function autoOf(stage) { for (var i = 0; i < AUTO_LIST.length; i++) if (AUTO_LIST[i].stage === stage) return AUTO_LIST[i]; return null; }
  function autoReg(stage, opt) {
    opt = opt || {};
    var hd = stage.querySelector(".stage-h");
    function targets() {
      var ts = Array.prototype.slice.call(stage.querySelectorAll(".picks .pk, .qrow button.qchip"));
      return ts.length ? ts : Array.prototype.slice.call(stage.querySelectorAll(".replay"));
    }
    if (!hd || !targets().length) return;
    function noteEl() { if (opt.note) return opt.note; var n = stage.nextElementSibling; while (n && !n.classList.contains("note")) n = n.nextElementSibling; return n; }
    var c = { stage: stage, idx: 0, timer: 0, running: false, arm: false, done: false, took: false, forced: false, seen: 0, hold: 0, loops: 0 }, grp = null;
    function show(v) {
      if (v && !grp) {
        var stop = on(el("button", { type: "button", class: "astop", "aria-label": "停止這個示範，換我自己操作（按「重播」可以再看一遍）", text: "停止" }), "click", function() {
          var f = stage.querySelector(".picks .pk, .qrow button.qchip") || stage.querySelector(".replay");
          c.take();
          if (f) { try { f.focus(); } catch (e) {} }
        });
        grp = el("span", { class: "autog" }, [el("span", { class: "autob", "aria-hidden": "true", text: "自動示範中" }), stop]);
        hd.insertBefore(grp, hd.querySelector(".replay"));
      } else if (!v && grp) {
        if (grp.parentNode) grp.parentNode.removeChild(grp);
        grp = null;
      }
      stage.classList.toggle("auto", v);
      var n = noteEl();
      if (n) n.setAttribute("aria-live", v ? "off" : "polite");
    }
    function later(ms) { c.timer = setTimeout(tick, ms); }
    function total() { var ts = targets(); return opt.max ? Math.min(opt.max, ts.length) : ts.length; }
    function rest() { var n = noteEl(); later(autoHold(n ? n.textContent.length : 0, opt.ms ? opt.ms() : 0, c.idx >= total())); }
    function tick() {
      c.timer = 0;
      if (!c.running) return;
      if (Date.now() < c.hold) { c.arm = false; tapDrop(stage); later(Math.max(150, Math.min(1000, c.hold - Date.now()))); return; }
      var ts = targets();
      if (c.idx >= total()) {
        c.loops++;
        if (c.loops >= AUTO_LOOPS) { c.done = true; c.pause(); return; }
        c.idx = 0; c.arm = false; tapDrop(stage);
        later(AUTO_LOOP_MS);
        return;
      }
      if (!c.arm) {
        c.arm = true;
        if (tapAt(stage, ts[c.idx])) { later(AUTO_TAP_MS); return; }
      }
      c.arm = false;
      try { ts[c.idx++].click(); } catch (e) {}
      rest();
    }
    c.start = function() {
      if (c.running || c.done || c.took || !(autoPref() || c.forced) || document.hidden) return;
      c.running = true;
      show(true);
      later(AUTO_START_MS);
    };
    c.pause = function() {
      if (c.timer) { clearTimeout(c.timer); c.timer = 0; }
      c.running = false;
      c.arm = false;
      tapDrop(stage);
      show(false);
    };
    c.take = function() { c.took = true; c.pause(); };
    c.restart = function() {
      var ts = targets();
      if (c.timer) { clearTimeout(c.timer); c.timer = 0; }
      c.idx = 0; c.done = false; c.took = false; c.forced = true; c.running = true; c.arm = false; c.hold = 0; c.loops = 0;
      tapDrop(stage);
      show(true);
      if (ts.length && (ts[0].classList.contains("replay") || ts[0].getAttribute("aria-pressed") === "true")) { c.idx = 1; rest(); }
      else tick();
    };
    function isReplay(t) { for (var n = t; n && n !== stage; n = n.parentNode) if (n.classList && n.classList.contains("replay")) return true; return false; }
    on(stage, "click", function(ev) { if (ev.isTrusted) { if (isReplay(ev.target)) c.restart(); else c.take(); } });
    on(stage, "keydown", function(ev) { if (!(ev.target && ev.target.className === "astop")) c.take(); });
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
          else if (c.seen < AUTO_OFF_VIS) { c.pause(); if (c.done) { c.done = false; c.loops = 0; c.idx = 0; } }
        });
      }, { rootMargin: "-56px 0px -72px 0px", threshold: AUTO_STEPS });
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
    var parts = !s.d ? [null, null] : k === "anat" ? demoAnat(s.d) : k === "plan" ? demoPlan() : k === "turn" ? demoTurn() : k === "qbar" ? demoQbar(s.d) : k === "sim" ? demoSim(s.d) : demoChat(s.d);
    if (s.tips && s.tipsFirst) sec.appendChild(stepsEl(s.tips));
    if (parts[0]) { sec.appendChild(parts[0]); autoReg(parts[0], parts[2]); }
    if (s.tips && !s.tipsFirst) sec.appendChild(tipsEl(s.tips));
    if (parts[1]) sec.appendChild(parts[1]);
    if (s.keys) sec.appendChild(keysEl(s.keys));
    if (s.flow) {
      var fp = demoChat(s.flow.d);
      if (s.flow.h) sec.appendChild(el("h3", { class: "sub-h", text: s.flow.h }));
      sec.appendChild(fp[0]); autoReg(fp[0], fp[2]);
      if (fp[1]) sec.appendChild(fp[1]);
    }
    if (s.url) sec.appendChild(urlRow());
    if (s.steps) { if (s.steps.h) sec.appendChild(el("h3", { class: "sub-h", text: s.steps.h })); sec.appendChild(stepsEl(s.steps.items, "long")); }
    if (s.note) sec.appendChild(noteBox(s.note));
    if (s.warn) sec.appendChild(el("div", { class: "warnbox" }, [rich(s.warn)]));
    return sec;
  }

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

  function setTop(kids) { topEl.textContent = ""; topEl.appendChild(el("div", { class: "bar-in" }, kids)); }
  function howBox(open) {
    return el("details", { class: "how", open: open ? true : null }, [
      el("summary", { text: "怎麼用這份教學（4 個動作）" }),
      el("div", { class: "how-b" }, [stepsEl(HOW, "long")])
    ]);
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
        el("p", { class: "sub", text: N + " 課。一課一個重點，點哪一課都可以。" }),
        el("div", { class: "prog" }, [
          el("div", { class: "prog-r" }, [el("span", { text: "已學 " + n + " / " + N + " 課" }), el("b", { text: pct + "%" })]),
          el("div", { class: "track", role: "progressbar", "aria-label": "學習進度", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) }, [fill])
        ]),
        cta
      ]),
      howBox(n === 0),
      el("h2", { class: "all", text: "全部課程" }),
      chapters(done, nx ? nx.id : "", "ol"),
      el("div", { class: "foot" }, "學習進度只記在這支手機裡，不會傳給別人。在課裡按「回課程目錄」（或最後一課的「回目錄」），學習進度會清空，下次從頭開始。示範用的藥都是編出來的，不是真的藥品資料。")
    ];
    return { title: "補藥神器 教學", kids: kids };
  }
  function lessonView(id) {
    var L = lessonById(id), li = lessonIdx(id), done = getDone();
    var ttl = on(el("button", { type: "button", class: "ttl", "aria-expanded": "false", "aria-controls": "toc", "aria-label": L.name + "，點一下看全部課程" }, [el("span", { class: "t", text: L.name }), el("span", { class: "ar", "aria-hidden": "true", text: "▾" })]), "click", function() { toggleToc(); });
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
      : on(el("a", { class: "nav go", href: "#/" }, ["回目錄 ›"]), "click", function() { ok(); store.del("done"); });
    botEl.textContent = "";
    botEl.appendChild(el("div", { class: "bot-in" }, [prev, pct, next]));
    botEl.hidden = false;
    return { title: L.name + "・補藥神器 教學", kids: kids };
  }

  function render() {
    var h = location.hash || "", m, v;
    autoClear();
    if ((m = h.match(/^#\/l\/([a-z]+)(?:\/\d+)?$/)) && lessonById(m[1])) v = lessonView(m[1]);
    else v = outlineView();
    root.textContent = "";
    v.kids.forEach(function(k) { root.appendChild(k); });
    autoMount();
    document.title = v.title;
    try { window.scrollTo(0, 0); } catch (e) {}
    try { root.focus({ preventScroll: true }); } catch (e) {}
  }

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
