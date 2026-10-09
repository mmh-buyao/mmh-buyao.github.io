/* 補藥神器教學 v11.22.2 beta：不用登入、不連任何網站；畫面上的藥全是編出來的示範。這個檔沒有任何秘密。 */
(function() {
  "use strict";
  /* ═══ 補藥神器教學網頁（v11.22.2 beta 第 13 批）═══
     不登入、不連任何網站：沒有 fetch、沒有外部圖和字型，畫面上的藥全是編的示範。
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
     每一課：id、ch（第幾章）、name、secs（一塊一塊的白底區塊：t 標題、min 分鐘、p 說明、d 示範區、note 淺藍說明框、warn 黃色提醒、tips 三個小提醒）、
     tryp（動手試試）、recap（重點回顧）、quiz（隨堂檢測：q 題目、h 提示、o 四個選項、a 正確的是第幾個、why 為什麼）。
     示範區 d：chat＝LINE 聊天的假畫面（ch＝可以點選的幾種情況；每種有 m 聊天內容、n 下面的說明；一種就只有重播鍵）、anat＝卡片各部分的位置圖、qbar＝LINE 輸入列。
     聊天內容 m：me 自己說的、bot 官方帳號回的、card／list 藍色色塊（代替藥品卡片，不放真的卡片）、act 一句動作說明、pic 照片、voice 語音、hand 手寫。 */
  function me(t) { return { w: "me", t: t }; }
  function bot(t) { return { w: "bot", t: t }; }
  function card(t, s, warn) { return { w: "card", t: t, s: s || "", warn: warn || "" }; }
  function lst(t, s) { return { w: "list", t: t, s: s || "" }; }
  function act(t) { return { w: "act", t: t }; }
  function pic(c) { return { w: "me", pic: c }; }
  function voice() { return { w: "me", voice: "0:03" }; }
  function hand(lines) { return { w: "me", note: lines }; }
  var C1 = card("這支藥的卡片", "藥名、位置、照片都在裡面");
  var CH = [{ n: "基本查藥" }, { n: "換個方式查" }, { n: "一次看多支、按鈕" }];
  var PARTS = {
    code: { n: "CODE", t: "卡片最上面的大數字。打它查得最準，不會抓到別支藥；紙條上有寫 CODE 就直接打，一個字都不用多打。" },
    brand: { n: "商品名", t: "大數字下面第一行，是藥盒上印的英文名。打前面幾個字就查得到。" },
    zh: { n: "中文名", t: "商品名下面那一行。想不起英文名的時候，打中文名一樣查得到。" },
    icon: { n: "圖示", t: "右上角的小圖示：藥丸＝錠劑類、水滴＝水劑類，一眼看出是吃的還是喝的。部分藥的圖示點一下會開院內的藥品網頁（有設定的才有）。" },
    gen: { n: "學名", t: "灰色小字是成分。同成分不同廠牌、不同劑量，打學名會一次全列出來；想不起商品名的時候，用成分找最快。" },
    feat: { n: "藥品特徵", t: "藍色那一塊是外觀特徵（顏色、形狀、刻字）。拿藥前對一下，最不會拿錯。有填才會出現。" },
    ind: { n: "適應症", t: "灰底框裡左邊是適應症，也就是這支藥是治什麼的。有填才會出現。" },
    photo: { n: "藥品照片", t: "灰底框裡右邊的小圖是藥品照片，點一下看大圖。拿藥前對一下顏色、字樣；照片不對請按「🛠 BUG」。" },
    loc: { n: "位置", t: "粉紅色的框是「去哪裡拿」。也可以直接打位置（例如「K2」），那一格的藥會整批列出來。" },
    map: { n: "平面圖", t: "位置右邊的小圖是那一區的平面圖，點一下看大圖。有平面圖的位置才會出現。" }
  };
  var QCHIPS = [
    { k: "web", t: "🌐 網頁", n: "**🌐 網頁**：直接開補藥神器網頁版（不是幫你打字）。" },
    { k: "guide", t: "📖 教學", n: "**📖 教學**：幫你打「教學」，就是回到這一份教學。" },
    { k: "notice", t: "📢 藥品通知", n: "**📢 藥品通知**：幫你打「公告」，一次看完停止供貨、改包裝、缺貨的通知。" },
    { k: "bug", t: "🛠 BUG", n: "**🛠 BUG**：幫你打「bug」，然後寫一句話回報問題。" }
  ];

  var LESSONS = [
    { id: "card", ch: 0, name: "卡片介紹", secs: [
      { t: "最上面：這支藥叫什麼", min: 1, p: "查到的每一支藥，都會變成一張卡片。先看最上面這一塊：點一個名稱，看它是什麼。",
        d: { k: "anat", w: "top" } },
      { t: "中間和最下面：外觀、去哪裡拿", min: 1, p: "往下看：灰底框裡有外觀、適應症、照片；最下面是去哪裡拿。點一個名稱，看它是什麼。",
        d: { k: "anat", w: "low" } },
      { t: "黃色的提醒框", min: 1, p: "有些藥的卡片上，會多一個黃色的框。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "有通知", m: [me("90101"), card("這支藥的卡片", "藥名、位置、照片都在裡面", "⚠️ 示範：這支藥換包裝了，瓶身標籤顏色不一樣")],
            n: "框裡寫的是這支藥的**通知**（例如停止供貨、改包裝、缺貨）。先讀完，再去拿藥。想一次看完所有藥的通知，按輸入框上面的「📢 藥品通知」（第 8 課）。" },
          { l: "沒有通知", m: [me("90102"), C1], n: "**沒有黃框**，就是目前沒有通知。" }
        ] } }
    ], tryp: { kind: "code", p: "回 LINE 查一支真的藥，對照上面學到的每一塊。", label: "在 LINE 查一支真的藥", hint: "會回到 LINE 聊天室，查一支真的藥，對照上面的說明。" },
    recap: ["**最上面**是這支藥叫什麼：CODE、商品名、中文名；灰色小字是學名（成分）。", "**中間**是外觀和適應症，**最下面粉紅色的框**是「去哪裡拿」（位置）。", "卡片上有**黃色的框**，先讀完通知，再去拿藥。"],
    quiz: { q: "卡片最下面那個粉紅色的框，是在告訴你什麼？", h: "提示：拿藥最需要先知道什麼？", o: ["這支藥是治什麼的", "去哪裡拿（位置）", "這支藥的成分", "這支藥有沒有缺貨"], a: 1, why: "粉紅色的框是位置，也就是去哪裡拿。也可以直接打位置（例如「K2」），那一格的藥會整批列出來。" } },

    { id: "search", ch: 0, name: "打字查藥", secs: [
      { t: "什麼都能查，打了就找", min: 1, p: "「CODE」「商品名」「中文名」「學名」「位置」「適應症」，想到什麼就打什麼。不用先按功能、不用選分類，一秒就出結果。",
        d: { k: "chat", ttl: "點一種，看結果", ch: [
          { l: "CODE", m: [me("90101"), C1], n: "打 **CODE** 最準，不會抓到別支藥。紙條上有寫 CODE，就直接打，一個字都不用多打。" },
          { l: "商品名", m: [me("DEMOSYRUP"), card("DEMOSYRUP 的卡片", "藥盒上印的英文名")], n: "打 **商品名**（藥盒上印的英文名）前面幾個字就查得到。" },
          { l: "中文名", m: [me("測試洛爾"), card("測試洛爾的卡片", "想不起英文名，打中文名也行")], n: "想不起英文名的時候，打 **中文名** 一樣查得到。" },
          { l: "學名", m: [me("samplexin"), lst("列表：3 個品項", "同成分的都列出來")], n: "打 **學名**（成分），同成分不同廠牌、不同劑量，會一次全列出來。" },
          { l: "位置", m: [me("K2"), lst("列表：這一格的藥", "按任何一列，出完整卡片")], n: "直接打 **位置**，那一格的藥整批列出來（第 6 課）。" },
          { l: "適應症", m: [me("咳嗽"), lst("列表：咳嗽的藥", "按任何一列，出完整卡片")], n: "打 **適應症**（這支藥治什麼），同一類的藥會列出來。" }
        ] } },
      { t: "打前面幾個字就好", min: 1, p: "不用打全名。中文 2 個字、英文 3 個字母就開始找；字越多，找得越準。",
        d: { k: "chat", ttl: "選一種打法", list: true, ch: [
          { l: "打「測試」（2 個字）列出 3 個，最像的排最前面", m: [me("測試"), lst("列表：3 個品項", "按任何一列，出完整卡片")], n: "只記得開頭也沒關係：打幾個字，看列表，再點一下就好。" },
          { l: "打「測試洛爾」（4 個字）只剩 1 個，直接出卡片", m: [me("測試洛爾"), card("測試洛爾的卡片", "只剩一個，直接出卡片")], n: "字打得越多，剩下的越少，**最多打到只剩一個，直接出卡片**。" }
        ] } },
      { t: "打錯字也沒關係", min: 1, p: "打錯一兩個字，系統會核對最接近的藥，問你「您是不是要找…」，並直接把卡片帶出來，不用重打。",
        d: { k: "chat", ttl: "故意打錯一個字", ch: [
          { l: "測試落爾", m: [me("測試落爾"), bot("您是不是要找 測試洛爾？"), card("測試洛爾的卡片", "已經幫你帶出來了")], n: "" }
        ] } }
    ], tryp: { kind: "typo", p: "回 LINE，故意打錯一個字，看它怎麼接住你。", label: "在 LINE 試試看", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**什麼都能打**：CODE、藥名、學名、位置，都查得到。", "**打前面幾個字就好**：中文 2 個字、英文 3 個字母開始找。", "**打錯字沒關係**：系統會問「您是不是要找…」，並直接帶出卡片。"],
    quiz: { q: "手上的紙條寫著 CODE 90101，怎麼查最準？", h: "提示：CODE 是每一支藥獨一無二的編號。", o: ["打「90101」", "打藥名的前兩個字", "打位置「K2」", "拍一張包裝照"], a: 0, why: "CODE 是每一支藥獨一無二的編號，打它不會抓到別支藥。" } },

    { id: "photo", ch: 1, name: "拍照查藥", secs: [
      { t: "包裝拍起來，直接傳", min: 1, p: "包裝、鋁箔、瓶身都可以，不用打半個字。",
        d: { k: "chat", ttl: "選一種拍法", ch: [
          { l: "藥盒", m: [pic("藥盒包裝"), C1], n: "字面朝上、光線夠、一張一盒，出卡片最快。" },
          { l: "鋁箔／瓶身", m: [pic("鋁箔或瓶身"), C1], n: "鋁箔、瓶身上有印字的，一樣拍起來就傳。" },
          { l: "好幾盒", m: [pic("三盒一起拍"), card("第 1 支的卡片", "藥名、位置、照片都在裡面"), card("第 2 支的卡片", "藥名、位置、照片都在裡面"), card("第 3 支的卡片", "藥名、位置、照片都在裡面")],
            n: "一次拍好幾盒也可以，**全部一起出卡片**；超過 5 個品項會變成一張總表，點一列出卡片。" }
        ] } },
      { t: "拍得清楚，出得最快", min: 1, p: "字面朝上、對到焦、避開反光；拍好再按快門。",
        d: { k: "chat", ttl: "比比看", ch: [
          { l: "拍得清楚", m: [pic("清楚的包裝"), card("這支藥的卡片", "對得上藥名，直接出卡片")], n: "對得上藥名的，**直接出卡片**。" },
          { l: "拍得模糊", m: [pic("模糊的包裝"), lst("列表：很像的藥", "按「是這個藥品？」就出卡片")], n: "對不上的，會列出很像的藥，按「是這個藥品？」就出卡片。**都不是的話，直接打字查最快。**" }
        ] },
        warn: "⚠️ AI 可能讀錯，請核對 CODE 再拿藥。" }
    ], tryp: { kind: "open", p: "回 LINE，拍一盒藥傳傳看。", label: "回 LINE 拍一張試試", hint: "會回到 LINE 聊天室，點輸入框旁邊的相機拍一盒藥。" },
    recap: ["**包裝、鋁箔、瓶身都能拍**，不用打半個字。", "**一次可以拍好幾盒**；超過 5 個品項會變成一張總表，點一列出卡片。", "**拍清楚、避開反光**；AI 可能讀錯，拿藥前核對 CODE；對不上就直接打字查。"],
    quiz: { q: "拍照後，系統列出幾支「很像的藥」，但都不是你要的。接下來怎麼做最快？", h: "提示：這時候不要再猜，換最直接的辦法。", o: ["把照片重傳十次", "選最上面那支", "直接打字查（CODE 或藥名）", "不用管它"], a: 2, why: "都不是的話，直接打字查最快；也不要硬選最像的，拿藥前一定要核對 CODE。" } },

    { id: "voice", ch: 1, name: "語音查藥", secs: [
      { t: "講一句就查", min: 1, p: "按住 LINE 的麥克風講藥名，放開就查——手上忙、戴手套的時候最好用。",
        d: { k: "chat", ttl: "選一種講法", ch: [
          { l: "講藥名", m: [voice(), bot("🎤 聽到「測試洛爾」"), card("測試洛爾的卡片", "藥名、位置、照片都在裡面")], n: "回覆最前面會先寫「🎤 聽到「…」」，**聽錯了一眼就看得出來**。" },
          { l: "講 CODE", m: [voice(), bot("🎤 聽到「90104」"), card("這支藥的卡片", "藥名、位置、照片都在裡面")], n: "講 **CODE** 也可以：「九零一零四」，唸數字就好。聽錯字的時候，改講 CODE 最準。" },
          { l: "講指令", m: [voice(), bot("🎤 聽到「公告」"), lst("藥品通知", "停止供貨、改包裝、缺貨")], n: "講「公告」「教學」也會執行，**跟打字一樣**。" }
        ] } },
      { t: "麥克風在這裡", min: 1, p: "按住右下角的 🎤 講話，放開就送出。",
        d: { k: "qbar", hot: "mic", cmd: "👆 圈起來這顆就是麥克風（按住不放）" },
        tips: [{ e: "📏", b: "靠近一點", s: "手機拿到嘴巴前約 10 公分" }, { e: "💬", b: "只講藥名", s: "不用講「請問…在哪裡」" }, { e: "⏸", b: "停半秒再放", s: "講完停半秒再放開" }],
        note: "真的太吵 → 改用**鍵盤上的 🎤**（手機自己會去背景音），成功率最高。" }
    ], tryp: { kind: "open", p: "回 LINE，按住麥克風講一個藥名。", label: "回 LINE 講一句試試", hint: "會回到 LINE 聊天室，按住麥克風講一個藥名。" },
    recap: ["**按住 🎤 講藥名，放開就查**，手上忙的時候最好用。", "回覆最前面會寫「🎤 聽到…」，**聽錯了一眼看得出來**。", "聽錯字或太吵：**改講 CODE（唸數字）**，或用鍵盤上的 🎤。"],
    quiz: { q: "語音查藥時，系統聽成別的字了，最準的補救方法是？", h: "提示：數字比藥名好唸，也比較不會聽錯。", o: ["講大聲一點", "多講幾次藥名", "講「請問這支藥在哪裡」", "改講 CODE（唸數字）"], a: 3, why: "回覆最前面會先告訴你「聽到什麼」，聽錯字的時候，改講 CODE 最準。" } },

    { id: "hand", ch: 1, name: "手寫", secs: [
      { t: "手寫菜單直接拍", min: 1, p: "手寫的菜單拍起來傳，一行一個品項，讀到的直接出卡片。",
        d: { k: "chat", ttl: "選一種情況", ch: [
          { l: "字寫清楚", m: [hand(["示範康糖漿", "測試洛爾", "模擬普利"]), card("示範康糖漿的卡片", "藥名、位置、照片都在裡面"), card("測試洛爾的卡片", "藥名、位置、照片都在裡面"), card("模擬普利的卡片", "藥名、位置、照片都在裡面")],
            n: "讀到的直接出卡片。**一張 10 行以內**最準、最快；紙條長就分兩張拍。" },
          { l: "有一行看不清", m: [hand(["示範康糖漿", "測試洛■", "模擬普利"]), card("示範康糖漿的卡片", "藥名、位置、照片都在裡面"), lst("列表：很像的藥", "按「是這個藥品？」就出卡片"), card("模擬普利的卡片", "藥名、位置、照片都在裡面")],
            n: "看不清的行，會列出很像的藥讓你點；**都不是，就直接打字查**。超過 5 個品項會變成一張總表，一列一個。" }
        ] } }
    ], tryp: { kind: "open", p: "回 LINE，拍一張手寫的藥名傳傳看。", label: "回 LINE 拍一張試試", hint: "會回到 LINE 聊天室，拍一張手寫的藥名試試。" },
    recap: ["**手寫的藥名也能拍**：一行一個品項。", "**一張 10 行以內**最準；太長就分兩張拍。", "看不清的行會列出很像的藥讓你點；**都不是就直接打字查**。"],
    quiz: { q: "手上的紙條有 20 行藥名，怎麼拍最好？", h: "提示：一張 10 行以內最準、最快。", o: ["一張全部拍進去，字小一點沒關係", "分兩張拍，每張 10 行以內", "拍遠一點，一次拍完", "改用語音一行一行講"], a: 1, why: "一張 10 行以內最準、最快；紙條長就分兩張拍。" } },

    { id: "agg", ch: 2, name: "彙整卡片", secs: [
      { t: "一格的藥，一張卡看完", min: 1, p: "打位置，這一格的藥就整批列出來；品項多的時候會自動分頁，往左滑。",
        d: { k: "chat", ttl: "選一種看看", ch: [
          { l: "K2", m: [me("K2"), lst("📍 K2：這一格有 4 個品項", "按任何一列，出完整卡片")], n: "打**位置**就好，不用一支一支查。" },
          { l: "B1（品項很多）", m: [me("B1"), lst("📍 B1：這一格有 14 個品項", "品項多：自動分頁，往左滑看下一頁")], n: "品項多的時候會**自動分頁，往左滑**看下一頁。" }
        ] } },
      { t: "按一列，出完整卡片", min: 1, p: "列表只列名字和位置；想看哪一支，按那一列就出完整的卡片。",
        d: { k: "chat", ttl: "看一次", ch: [
          { l: "K2", m: [me("K2"), lst("📍 K2：這一格有 4 個品項", "按任何一列，出完整卡片"), act("👆 按第 2 列"), card("第 2 列那支藥的卡片", "藥名、位置、照片都在裡面")], n: "按任何一列，出完整卡片，跟打 CODE 查到的一樣。" }
        ] } }
    ], tryp: { kind: "loc", p: "回 LINE，打一個真的位置，看那一格的藥。", label: "在 LINE 查一個真的位置", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**打位置**，這一格的藥整批列出來。", "品項多會**自動分頁，往左滑**。", "**按任何一列**，出完整卡片。"],
    quiz: { q: "想一次看到 K2 這一格裡所有的藥，怎麼做？", h: "提示：位置也可以直接當關鍵字打。", o: ["一支一支查 CODE", "拍 K2 那一格的照片", "直接打位置「K2」", "打「.K2」"], a: 2, why: "直接打位置，那一格的藥就整批列出來；品項多會自動分頁，往左滑。" } },

    { id: "family", ch: 2, name: "藥品家族", secs: [
      { t: "同成分的，全家一起看", min: 1, p: "藥名前面加一個符號（.、＃、／都可以），同學名的全列出來；換規格、換廠牌時最好用。",
        d: { k: "chat", ttl: "選一種打法", ch: [
          { l: ".示範寧", m: [me(".示範寧"), lst("示範寧　家族", "同學名共 3 個品項，按任何一列出卡片")], n: "例：**.示範寧**（中文名前面加一個點）。" },
          { l: ".samplexin", m: [me(".samplexin"), lst("SAMPLEXIN　家族", "同學名共 3 個品項，按任何一列出卡片")], n: "例：**.samplexin**（英文也可以）。" }
        ] } },
      { t: "跟一般查詢差在哪", min: 1, p: "不加符號，找的是「名字像」的藥；加了符號，找的是「同成分」的全家。",
        d: { k: "chat", ttl: "比比看", ch: [
          { l: "示範寧", m: [me("示範寧"), lst("列表：名字像的藥", "按任何一列，出完整卡片")], n: "**不加符號**：名字有這幾個字的藥。" },
          { l: ".示範寧", m: [me(".示範寧"), lst("示範寧　家族", "同學名共 3 個品項，按任何一列出卡片")], n: "**加了符號**：同學名（同成分）的藥，不管規格、廠牌，全部列出來。" }
        ] } }
    ], tryp: { kind: "fam", p: "回 LINE，在一支真的藥名前面加一個點，看全家。", label: "在 LINE 查一個真的家族", hint: "會回到 LINE 聊天室，照上面的說明做做看。" },
    recap: ["**藥名前面加 . ＃ ／** 任何一個，同成分的全列出來。", "**中文名、英文名都可以**。", "**換規格、換廠牌**的時候最好用。"],
    quiz: { q: "想一次看到同一個成分的所有規格和廠牌，怎麼打？", h: "提示：在藥名前面加一個小符號。", o: ["打藥名兩次", "打藥名加位置", "打藥名，後面加「？」", "在藥名前面加「.」"], a: 3, why: "藥名前面加 . ＃ ／ 任何一個符號，同學名（同成分）的就全列出來。" } },

    { id: "pin", ch: 2, name: "釘住的按鈕", secs: [
      { t: "不用記指令，按就好", min: 1, p: "輸入框上面那排按鈕永遠都在，點一下就等於幫你打好那個字。按按看下面這四顆。",
        d: { k: "qbar", chips: true, pick: true },
        note: "按鈕不見的話，直接打「教學」「公告」「bug」也一樣。" },
      { t: "🌐 網頁", min: 1, p: "按它，直接開補藥神器網頁版——在 LINE 裡面開，不用另外登入。想用比較大的畫面看清單、查藥、看藥品通知的時候，就按它。",
        d: { k: "qbar", chips: true, hot: "web", cmd: "按「🌐 網頁」＝開網頁版（不是打字）" },
        note: "用 **LINE 以外的瀏覽器**（例如電腦）開網頁版：畫面上會有一組**代號**，把代號打在這個一對一的 LINE 聊天室（不是群組），我會回你 **6 位數驗證碼**，再打回網頁就登入了。驗證碼 5 分鐘內有效。",
        warn: "沒看到這顆？可能是網頁版目前沒有開，請問管理者。" },
      { t: "📖 教學", min: 1, p: "就是這一份教學。忘記怎麼用、想看某一課，按它就回來。",
        d: { k: "qbar", chips: true, hot: "guide", cmd: "按「📖 教學」＝打「教學」" },
        note: "任何時候都可以按，**不會影響你剛才查的東西**。" },
      { t: "📢 藥品通知", min: 1, p: "停止供貨、改包裝、缺貨……一次看完，一類一疊，往左滑。",
        d: { k: "chat", ttl: "按下去會怎樣", ch: [
          { l: "按「📢 藥品通知」", m: [act("👆 按「📢 藥品通知」＝打「公告」"), lst("📢 停止供貨：2 個品項有通知", "往左滑看下一類 →")], n: "有通知的藥，查到它的時候，**卡片上也會有黃色的 ⚠️ 框**（第 1 課）。" }
        ] } },
      { t: "🛠 BUG", min: 1, p: "位置錯、照片不對、查不到——寫一句話就好，開發者會收到。",
        d: { k: "chat", ttl: "回報一次", ch: [
          { l: "回報", m: [act("👆 按「🛠 BUG」＝打「bug」"), bot("要回報什麼？寫在後面就好 🙏\n例：90101 位置不對，實際在 K5"), me("90101 位置不對，實際在 K5"), bot("收到了，謝謝您 🙏\n\n已經記下來，開發者會看到。")], n: "" }
        ] } }
    ], tryp: { kind: "text", text: "教學", p: "回 LINE，按一顆按鈕，或打「教學」「公告」「bug」試試。", label: "在 LINE 試試看", hint: "會回到 LINE 聊天室，已經幫你填好「教學」，按送出就行。" },
    recap: ["**輸入框上面那排按鈕永遠都在**，按一下就好，不用記指令。", "**🌐 網頁**開大畫面、**📖 教學**回到這裡、**📢 藥品通知**一次看完通知。", "發現位置錯、照片不對，按**「🛠 BUG」**，寫一句話。"],
    quiz: { q: "發現某支藥的位置寫錯了，怎麼回報給開發者？", h: "提示：輸入框上面那排按鈕有答案。", o: ["按「🛠 BUG」，寫一句話", "按「📢 藥品通知」", "按「📖 教學」", "按「🌐 網頁」"], a: 0, why: "按「🛠 BUG」（等於打「bug」），寫一句話，開發者會收到。例：90101 位置不對，實際在 K5。" } }
  ];
  LESSONS.forEach(function(l) { l.min = l.secs.reduce(function(s, x) { return s + (x.min || 1); }, 0); });
  var N = LESSONS.length, TOTAL_MIN = LESSONS.reduce(function(s, l) { return s + l.min; }, 0);
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

  /* ───────── 示範區的小零件 ───────── */
  function bubble(m, animated) {
    var b = bubble0(m);
    if (animated) b.classList.add("pop");
    return b;
  }
  function bubble0(m) {
    var w = m.w;
    if (w === "act") return el("div", { class: "gapm", text: m.t });
    if (w === "card" || w === "list") {
      return el("div", { class: "hold" + (w === "list" ? " list" : "") }, [
        el("div", { class: "hold-m" }, [
          el("span", { class: "ic", text: "藥", "aria-hidden": "true" }),
          el("div", { class: "hold-t" }, [el("b", { text: m.t }), m.s ? el("small", { text: m.s }) : null])
        ]),
        m.warn ? el("div", { class: "hold-w", text: m.warn }) : null
      ]);
    }
    if (w === "bot") return el("div", { class: "bub bot", text: m.t });
    if (m.pic) return el("div", { class: "bub me pic", role: "img", "aria-label": "傳了一張照片：" + m.pic }, [el("span", { class: "pbox", text: "📷", "aria-hidden": "true" }), el("span", { class: "pcap", text: m.pic })]);
    if (m.voice) return el("div", { class: "bub me voice", role: "img", "aria-label": "傳了一段語音" }, [
      el("span", { text: "🎤", "aria-hidden": "true" }),
      el("span", { class: "bars", "aria-hidden": "true" }, [8, 14, 10, 18, 12, 16, 9, 13].map(function(h) { var i = el("i"); i.style.height = h + "px"; return i; })),
      el("span", { text: m.voice })
    ]);
    if (m.note) return el("div", { class: "bub me paper", role: "img", "aria-label": "傳了一張手寫的照片：" + m.note.join("、") }, [el("div", { class: "paper-in" }, m.note.map(function(t) { return el("div", { text: t }); }))]);
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
      var h = chat.offsetHeight;
      chat.textContent = "";
      if (!animate || REDUCE) {
        msgs.forEach(function(m) { chat.appendChild(bubble(m)); });
        chat.style.minHeight = "";
        return;
      }
      chat.style.minHeight = h + "px";
      msgs.forEach(function(m, i) {
        timers.push(setTimeout(function() {
          chat.appendChild(bubble(m, true));
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
  /* 卡片各部分的位置圖：只畫名稱和位置（不是藥品卡片）；點名稱或點方塊，圈起來並說明 */
  function demoAnat(d) {
    var keys = d.w === "top" ? ["code", "brand", "zh", "icon", "gen"] : ["feat", "ind", "photo", "loc", "map"];
    var blocks = {}, chips = {}, note = noteBox("");
    function B(k, cls) { return (blocks[k] = el("div", { class: "wf-b " + (cls || ""), "data-part": k, text: k === "loc" ? "📍 位置" : PARTS[k].n })); }
    var wf;
    if (d.w === "top") {
      wf = el("div", { class: "wf", "aria-hidden": "true" }, [el("div", { class: "wf-top" }, [
        el("div", { class: "wf-col" }, [B("code"), B("brand"), B("zh")]),
        B("icon", "icon"),
        B("gen", "wide dim")
      ])]);
    } else {
      wf = el("div", { class: "wf", "aria-hidden": "true" }, [
        el("div", { class: "wf-pan" }, [B("feat"), el("div", { class: "wf-r" }, [B("ind"), B("photo", "photo")])]),
        el("div", { class: "wf-r" }, [B("loc", "loc"), B("map", "map")])
      ]);
    }
    function show(k) {
      keys.forEach(function(x) {
        blocks[x].classList.toggle("on", x === k);
        chips[x].setAttribute("aria-pressed", x === k ? "true" : "false");
      });
      note.set("**" + PARTS[k].n + "**：" + PARTS[k].t);
    }
    var row = el("div", { class: "picks", role: "group", "aria-label": "卡片上的各個部分" });
    keys.forEach(function(k) {
      chips[k] = on(el("button", { type: "button", class: "pk", "aria-pressed": "false", text: PARTS[k].n }), "click", function() { show(k); });
      row.appendChild(chips[k]);
      on(blocks[k], "click", function() { show(k); });
    });
    var stage = el("div", { class: "stage" }, [
      el("div", { class: "stage-h" }, [el("span", { class: "stage-t", text: "點一個，看它是什麼" })]),
      row, wf,
      el("p", { class: "capn", text: "示意圖：只畫出每一塊的名稱和位置，不是真的藥品卡片。" })
    ]);
    show(keys[0]);
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
      el("span", { class: "inbox", text: "輸入訊息" }),
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
      el("div", { class: "sec-h" }, [el("h2", { text: s.t }), el("span", { class: "min", text: "▶ " + (s.min || 1) + " 分鐘" })]),
      el("p", { class: "lead" }, [rich(s.p)])
    ]);
    var parts = s.d.k === "anat" ? demoAnat(s.d) : s.d.k === "qbar" ? demoQbar(s.d) : demoChat(s.d);
    sec.appendChild(parts[0]);
    if (s.tips) sec.appendChild(tipsEl(s.tips));
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
      el("span", { class: "ln" }, [l.name, done[l.id] ? el("span", { class: "sr", text: "（已學）" }) : null]),
      el("span", { class: "lm", text: l.min + " 分鐘" })
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
  /* 目錄頁左上角的 ✕：知道官方帳號 ID 就回 LINE 聊天室，不然就關掉這一頁（關不掉就退回上一頁） */
  function closeBtn() {
    if (S.b) return el("a", { class: "x", href: lineUrl(""), rel: "noopener noreferrer", "aria-label": "回 LINE 聊天室", text: "✕" });
    return on(el("button", { type: "button", class: "x", "aria-label": "關閉這一頁", text: "✕" }), "click", function() {
      try { window.close(); } catch (e) {}
      setTimeout(function() { try { if (history.length > 1) history.back(); } catch (e) {} }, 250);
    });
  }
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
    setTop([closeBtn(), el("div", { class: "ttl" }, [el("span", { class: "t", text: "補藥神器 教學" })]), el("span", { class: "tag chip", text: "不用登入" })]);
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
        el("p", { class: "sub", text: N + " 課，約 " + TOTAL_MIN + " 分鐘。一課一個重點，點哪一課都可以，學到哪裡都記得。" }),
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
    var toc = el("div", { class: "toc", id: "toc", hidden: true }, [el("div", { class: "toc-in" }, [chapters(done, L.id, "toc")])]);
    on(toc, "click", function(ev) { var t = ev.target; while (t && t !== toc) { if (t.tagName === "A") { closeToc(); return; } t = t.parentNode; } });
    setTop([el("a", { class: "x", href: "#/", "aria-label": "回課程目錄", text: "✕" }), ttl, el("span", { class: "tag", text: "第 " + (li + 1) + " 課 / " + N })]);
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
