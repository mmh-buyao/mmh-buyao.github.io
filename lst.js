/* 補藥神器網頁 v11.22.2（清單校對，開發者用）：畫面在 GitHub，資料由網頁專案的 API 給。這個檔沒有任何秘密。 */
/* v11.20.1：清單校對的網頁放在 GitHub，用 fetch 打網頁專案的 API（跟藥品查詢同一套：鑰匙、裝置碼跟部署 ID 一起算、開發者綁定碼） */
if(window.top!==window.self){try{document.documentElement.innerHTML="";}catch(e){}throw new Error("framed");}
function hashParams(){var o={};String(location.hash||"").replace(/^#/,"").split("&").forEach(function(kv){var i=kv.indexOf("=");if(i>0){try{o[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1));}catch(e){}}});return o;}
var HP=hashParams(),X=HP.x||"",API="",SYNC_T=null,DKX="";
var T=HP.dev||"",A=[],PICK=[],FILT="all",CUR=-1,PN=0,PICKN=0,RETRY=false;
var DK=(function(){var k="";try{k=localStorage.getItem("bdk")||"";}catch(e){k="";}if(/^[0-9a-f]{32}$/.test(k))return k;
 try{var a=new Uint8Array(16);crypto.getRandomValues(a);k=Array.prototype.map.call(a,function(x){return("0"+x.toString(16)).slice(-2);}).join("");localStorage.setItem("bdk",k);if(localStorage.getItem("bdk")!==k)k="";}catch(e){k="";}return k;})();
function post(fn,a,bg){return fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({v:1,fn:fn,t:T,dk:DKX,a:a}),credentials:"omit",cache:"no-store",referrerPolicy:"no-referrer",redirect:"follow",keepalive:!!bg}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();});}
/* 跟原本 Apps Script 網頁一樣的寫法：api().withSuccessHandler(ok).withFailureHandler(bad).lstData(T) */
function api(){var ok=function(){},bad=function(){},o={withSuccessHandler:function(f){ok=f;return o;},withFailureHandler:function(f){bad=f;return o;}};
 ["lstData","lstUpload","lstApply","lstDrop","lstDropAll"].forEach(function(fn){o[fn]=function(){var a=[].slice.call(arguments,1);
  post(fn,a).then(function(j){if(!j||j.ok!==1){var c=j&&j.code||"",m=j&&j.err||"後端沒有回應";if(c==="tok"||c==="bind"||c==="down"||c==="moved"){halt(m,j.need);return;}bad(m);return;}
   var r=j.r;if(r&&r.sync)syncSoon();ok(r);},
   function(e){bad("連不上後端（"+(e&&e.message||e)+"）");});};});
 return o;}
/* 寫進工作表1 之後（sync:1）：1.5 秒後在背景通知 LINE 清快取；還沒送就切走、關掉網頁 → 馬上送 */
function syncNow(){if(!SYNC_T)return;clearTimeout(SYNC_T);SYNC_T=null;post("appSync",[],true).catch(function(){});}
function syncSoon(){clearTimeout(SYNC_T);SYNC_T=setTimeout(syncNow,1500);}
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")syncNow();});
window.addEventListener("pagehide",syncNow);
/* 整頁停下來；開發者這台還沒綁定 → 出輸入綁定碼的框（LINE「開發者網頁 綁定」給的 6 位數碼），綁好就重新整理 */
function halt(m,need){var w=document.querySelector(".w");if(!w)return;
 w.innerHTML='<h1>📋 清單校對</h1><p class="sub" style="font-size:15px;color:inherit">'+esc(m).replace(/\n/g,"<br>")+'</p>'
  +(need?'<form class="bindf" id="bindf" autocomplete="off"><input id="bindc" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位數碼" aria-label="綁定碼"><button type="submit" id="bindb">綁定</button></form><p class="sub" id="bindm" role="status" style="color:#B33E2E;min-height:1.7em"></p><p class="sub">碼 10 分鐘內有效、只能用一次；錯 5 次鎖 1 小時；最多綁 3 處。這組碼只打在這裡，不要傳給任何人。</p>':'');
 var st=document.getElementById("sticky");if(st)st.hidden=true;
 if(!need)return;
 var inp=document.getElementById("bindc"),bm=document.getElementById("bindm"),bb=document.getElementById("bindb");try{inp.focus();}catch(e){}
 document.getElementById("bindf").onsubmit=function(e){e.preventDefault();var c=String(inp.value||"").replace(/\D/g,"");
  if(!/^\d{6}$/.test(c)){bm.textContent="請輸入 6 位數字";return;}
  bb.disabled=true;bm.textContent="確認中…";
  post("appBind",[c]).then(function(j){bb.disabled=false;var r=j&&j.ok===1?j.r:null;
   if(r&&r.ok){bm.style.color="";bm.textContent="✅ 這台綁好了";location.reload();return;}
   bm.textContent="❌ "+((r&&r.err)||(j&&j.err)||"沒綁成功，再試一次");inp.value="";try{inp.focus();}catch(x){}},
   function(){bb.disabled=false;bm.textContent="❌ 連不上後端，網路好了再試一次";});};}
function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return("0"+x.toString(16)).slice(-2);}).join("");}
/* 連結格式對才連；裝置碼跟部署 ID 一起算（每個部署拿到的都不一樣） */
function gate(cb){
 if(!/^[A-Za-z0-9_-]{20,120}$/.test(X)||!/^[0-9a-f]{32}$/.test(T)){cb("bad");return;}
 if(!window.fetch){cb("old");return;}
 if(!DK||!(window.crypto&&crypto.subtle&&window.TextEncoder)){cb("ok");return;}
 crypto.subtle.digest("SHA-256",new TextEncoder().encode(DK+"|"+X)).then(function(b){DKX=hex(b).slice(0,32);cb("ok");},function(){cb("ok");});}
var GATE_MSG={bad:"這條清單校對連結不完整。\n回 LINE 打「清單校對」，再按「📤 多張上傳」或「📋 待審清單」。",old:"這個瀏覽器太舊，請改用最新的 Chrome 或 Safari。"};
var F=[["brand","商品名"],["loc","位置"],["form","劑型"],["zh","中文名"],["gen","學名"]];
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function $(id){return document.getElementById(id);}
function load(){api().withSuccessHandler(function(r){if(r.err){$("cnt").textContent=r.err;return;}A=[];(r.rows||[]).forEach(function(d){d.src="lst";A.push(d);});((r.imp&&r.imp.rows)||[]).forEach(function(d){d.src="imp";A.push(d);});PROB=Array.isArray(r.imp&&r.imp.problems)?r.imp.problems:[];draw();}).withFailureHandler(function(e){$("cnt").textContent="連不上："+e;}).lstData(T);}
var PROB=[];
/* 選檔、拖曳、貼上三種都走這一條 —— 用的是同一支 shrink，所以辨識準確度完全一樣 */
function addFiles(list,how){
 var fs=[],i;for(i=0;i<(list||[]).length;i++){var f=list[i];
  if(f&&((f.type||"").indexOf("image/")===0||/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name||"")))fs.push(f);}
 if(!fs.length)return 0;
 RETRY=false;var n=fs.length,done=0;
 fs.forEach(function(f){shrink(f,function(o){
  o.name=f.name||((how==="貼上"?"貼上的圖 ":"照片 ")+(PICKN+1));o.k=++PICKN;PICK.push(o);
  if(++done===n){thumbs();try{$("up").scrollIntoView({behavior:"smooth",block:"nearest"});}catch(e){}}});});
 return n;}
$("pick").onclick=function(){$("file").click();};
$("file").onchange=function(e){addFiles(e.target.files||[],"選檔");e.target.value="";};
/* 整頁都能拖，不用瞄準那一格 */
(function(){var depth=0,dz=$("dz"),db=$("dropbox");
 function hasFiles(e){var t=(e.dataTransfer&&e.dataTransfer.types)||[];
  for(var i=0;i<t.length;i++)if(t[i]==="Files")return true;return false;}
 function show(){dz.hidden=false;if(db)db.className="drop hot";}
 function hide(){depth=0;dz.hidden=true;if(db)db.className="drop";}
 document.addEventListener("dragenter",function(e){if(!hasFiles(e))return;e.preventDefault();depth++;show();});
 document.addEventListener("dragover",function(e){if(!hasFiles(e))return;e.preventDefault();
  try{e.dataTransfer.dropEffect="copy";}catch(x){}});
 document.addEventListener("dragleave",function(e){if(!hasFiles(e))return;depth--;if(depth<=0)hide();});
 document.addEventListener("drop",function(e){if(!hasFiles(e))return;e.preventDefault();hide();
  var n=addFiles((e.dataTransfer&&e.dataTransfer.files)||[],"拖曳");
  if(!n){var mn=$("many");mn.hidden=false;mn.textContent="拖進來的不是圖片檔，沒有收。";}});
 window.addEventListener("blur",hide);})();
/* 截圖後直接貼上 */
document.addEventListener("paste",function(e){
 var it=(e.clipboardData&&e.clipboardData.items)||[],fs=[],i;
 for(i=0;i<it.length;i++)if(it[i].kind==="file"){var f=it[i].getAsFile();if(f)fs.push(f);}
 if(!fs.length)return;
 e.preventDefault();addFiles(fs,"貼上");});
/* 夠小的照片原檔直接送（不重壓，準確度不打折）；太大的才縮到 3000px */
function shrink(file,cb){var MAXPX=3000,MAXKB=4200,THPX=200;var fr=new FileReader();
 fr.onload=function(){var raw=String(fr.result);var im=new Image();
  im.onload=function(){var w=im.width,h=im.height,lg=Math.max(w,h),kb=Math.round(raw.length*3/4/1024);
   // 畫面上的縮圖另外做小的，不然 12 張大圖掛在 DOM 上手機會很喘
   var ts=THPX/lg,tc=document.createElement("canvas");
   tc.width=Math.max(1,Math.round(w*ts));tc.height=Math.max(1,Math.round(h*ts));
   tc.getContext("2d").drawImage(im,0,0,tc.width,tc.height);
   var th=tc.toDataURL("image/jpeg",.6);
   if(lg<=MAXPX&&kb<=MAXKB){cb({url:th,b64:raw.substring(raw.indexOf(",")+1),mime:file.type||"image/jpeg",kb:kb,raw:true});return;}
   var sc=MAXPX/lg,cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);
   cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
   var u=cv.toDataURL("image/jpeg",.92);
   cb({url:th,b64:u.substring(u.indexOf(",")+1),mime:"image/jpeg",kb:Math.round(u.length*3/4/1024)});};
  im.onerror=function(){cb({url:"",b64:raw.substring(raw.indexOf(",")+1),mime:file.type||"image/jpeg",kb:Math.round(file.size/1024)});};
  im.src=raw;};
 fr.readAsDataURL(file);}
function thumbs(){var h="";PICK.forEach(function(p,i){h+='<div class="th"><img src="'+esc(p.url)+'" alt=""><button class="x" data-i="'+i+'" aria-label="移除">✕</button><span class="n"><span>'+(i+1)+'</span><span>'+p.kb+'K</span></span></div>';});
 $("thumbs").innerHTML=h;Array.prototype.forEach.call($("thumbs").querySelectorAll(".x"),function(b){b.onclick=function(){PICK.splice(+b.dataset.i,1);thumbs();};});
 $("gorow").hidden=!PICK.length;$("clr").hidden=!PICK.length;
 var mn=$("many");mn.hidden=!PICK.length;
 if(PICK.length)mn.textContent=PICK.length+" 張，同時跑 3 張，大約要 "+Math.max(1,Math.ceil(PICK.length/3*40/60))+" 分鐘"
   +(PICK.length>12?"　★ 超過 12 張建議分批，中途關掉頁面會停在一半":"");
 $("go").textContent=(RETRY?"🔁 重試這 ":"🔍 開始辨識（")+PICK.length+(RETRY?" 張":" 張）");}
$("clr").onclick=function(){if(!PICK.length)return;
 if(!confirm("要把選好的 "+PICK.length+" 張照片全部清掉嗎？\n（還沒送去辨識，清掉不影響下面已經讀進來的）"))return;
 PICK=[];RETRY=false;thumbs();};
$("go").onclick=function(){run(PICK.slice());};
function run(list){if(!list.length)return;
 $("go").disabled=true;$("prog").hidden=false;$("fill").style.width="0%";
 var h="";list.forEach(function(p){h+='<div class="p" id="p'+p.k+'"><span class="s">⏳</span><span class="t">'+esc(p.name||("照片 "+p.k))+'</span><span class="r">排隊中</span></div>';});
 $("plist").innerHTML=h;
 var n=list.length,done=0,at=0,BUSY=3,fail=[];
 function fin(){done++;$("fill").style.width=Math.round(done/n*100)+"%";
  if(done<n){next();return;}
  PICK=fail;RETRY=fail.length>0;thumbs();$("go").disabled=false;
  var d=document.createElement("div");d.className="p";
  d.innerHTML='<span class="s">'+(fail.length?"⚠️":"🎉")+'</span><span class="t">'+(fail.length?("有 "+fail.length+" 張沒成功，按上面「重試這 "+fail.length+" 張」再送一次"):("全部 "+n+" 張都讀完了，往下審"))+'</span><span class="r"></span>';
  $("plist").appendChild(d);load();}
 function next(){if(at>=n)return;var p=list[at++];var el=$("p"+p.k);
  el.querySelector(".s").textContent="🔍";el.querySelector(".r").textContent="辨識中…";
  api().withSuccessHandler(function(r){
   if(!r||r.err){el.className="p bad";el.querySelector(".s").textContent="⚠️";el.querySelector(".r").textContent=(r&&r.err)||"失敗";fail.push(p);}
   else{el.className="p ok";el.querySelector(".s").textContent="✅";p.b64=null;
    el.querySelector(".r").textContent="讀到 "+r.read+"　不一樣 "+r.edit+"　新 "+r.neu+"　"+r.sec+"s"+(r.full?"　⚠️ 待審已滿":"");}
   fin();})
  .withFailureHandler(function(e){el.className="p bad";el.querySelector(".s").textContent="⚠️";el.querySelector(".r").textContent=String(e).substring(0,40);fail.push(p);fin();})
  .lstUpload(T,p.b64,p.mime,p.name||"",++PN);}
 for(var k=0;k<Math.min(BUSY,n);k++)next();}
function inputs(i,d){var h="";F.forEach(function(f){var v=(d.v&&d.v[f[0]])||"";if(f[0]==="brand"&&!v)v=d.brand||"";if(f[0]==="loc"&&!v)v=d.loc||"";h+='<div class="fi"><span class="l">'+f[1]+'</span><input id="i'+i+'_'+f[0]+'" value="'+esc(v)+'" placeholder="'+(f[0]==="brand"||f[0]==="zh"?"至少填一個":"可空")+'"></div>';});return h;}
function chgRows(i,d){var h="";(d.chg||[]).forEach(function(c){var fk=c[0],lab=c[4]||fk,old=c[1],nv=c[2];if(d.src==="lst"){lab=c[1];old=c[2];nv=c[3];}h+='<p class="f">'+esc(lab)+'</p><div class="vs"><div class="v o"><span class="l">工作表1</span><span class="x">'+(old?esc(old):"—")+'</span></div><div class="ar">→</div><div class="v n"><span class="l">'+(d.src==="lst"?"清單讀到（可改）":"待匯入分頁（可改）")+'</span><input id="i'+i+'_'+esc(fk)+'" value="'+esc(nv)+'"></div></div>';});return h;}
function isNew(d){return (d.src==="lst"&&d.kind==="new")||(d.src==="imp"&&d.kind==="add");}
function card(i,d){var h='<div class="card'+(i===CUR?" cur":"")+'" id="k'+i+'"><div class="h"><div><div class="code">'+esc(d.code)+'</div><div class="nm">'+esc(d.brand||(d.v&&d.v.brand)||"")+'</div></div>';
 h+=isNew(d)?'<span class="tag n">🔵 表上沒有</span></div>':'<span class="tag">🟡 不一樣</span></div>';
 h+='<div class="b">';
 if(d.hand)h+='<p class="hand">✍️ 清單上這一筆是手寫改的</p>';
 (d.w||[]).forEach(function(w){h+='<p class="hand">⚠️ '+esc(w)+'</p>';});
 if(isNew(d)){h+='<p class="note">'+(d.src==="lst"?"工作表1 沒有這個 code。填好按「匯入工作表1」就新增（7 天內可復原）。":"待匯入分頁上的新藥。按「匯入工作表1」新增並從分頁移掉。")+'</p>'+inputs(i,d);}
 else{h+=chgRows(i,d);}
 h+='</div><div class="acts"><button class="y fu" data-a="ok" data-i="'+i+'">'+(isNew(d)?"📥 匯入工作表1":"✅ 寫進工作表1")+'</button><button class="no" data-a="drop" data-i="'+i+'">'+(isNew(d)?"❌ 不需要":"❌ 不要")+'</button><button class="sk" data-a="skip" data-i="'+i+'">⏭ 跳過</button></div></div>';return h;}
function pass(d){if(d.gone)return false;if(FILT==="all")return true;if(FILT==="hand")return !!d.hand;if(FILT==="new")return isNew(d);return !isNew(d);}
function draw(){var live=A.filter(function(d){return !d.gone;});var nl=0,ni=0;live.forEach(function(d){if(d.src==="lst")nl++;else ni++;});
 $("cnt").innerHTML="待審 <b>"+nl+"</b> 筆　待匯入分頁 <b>"+ni+"</b> 筆";
 var shown=[];A.forEach(function(d,i){if(pass(d))shown.push(i);});
 $("alln").textContent=shown.length;$("sticky").hidden=!shown.length;
 if(!shown.length){$("l").innerHTML='<div class="empty">目前沒有待審、也沒有待匯入 🎉<br>上面選照片就可以開始，或在「待匯入」分頁填資料。</div>';return;}
 var h="",secId="";
 shown.forEach(function(i){var d=A[i];var sid=d.src==="imp"?"imp":("p"+(d.pn||0));
  if(sid!==secId){secId=sid;h+=d.src==="imp"?'<h2 class="sec">📥 待匯入分頁</h2>':'<h2 class="sec">📷 '+(d.pn?"第 "+esc(d.pn)+" 張":"之前傳的")+'<span class="c">'+esc(d.when||"")+'</span></h2>';}
  h+=card(i,d);});
 if(PROB.length){h+='<div class="card"><div class="b"><p class="f">待匯入分頁有 '+(+PROB.length||0)+' 列讀不進來</p>';PROB.forEach(function(p){h+='<p class="note">第 '+esc(p.n)+' 列：'+esc(p.why)+'</p>';});h+='</div></div>';}
 $("l").innerHTML=h;
 Array.prototype.forEach.call($("l").querySelectorAll("button[data-a]"),function(b){b.onclick=function(){act(+b.dataset.i,b.dataset.a);};});}
function res(i,cls,txt){var el=$("k"+i);if(!el)return;var a=el.querySelector(".acts");if(a)a.remove();var d=document.createElement("div");d.className="res "+cls;d.textContent=txt;el.appendChild(d);el.style.opacity=".55";}
function vals(i){var v={};var els=document.querySelectorAll('[id^="i'+i+'_"]');for(var k=0;k<els.length;k++){v[els[k].id.substring(("i"+i+"_").length)]=els[k].value;}return v;}
function nextCur(){var n=-1;A.forEach(function(d,i){if(n<0&&pass(d))n=i;});CUR=n;}
function act(i,a){var d=A[i];if(!d)return;
 if(a==="skip"){d.gone=true;nextCur();draw();return;}
 if(a==="drop"){if(d.src==="imp"&&!confirm("這一列會從「待匯入」分頁刪掉（分頁那一列不能復原）。確定不需要？"))return;
  api().withSuccessHandler(function(r){res(i,"bad",(r&&r.msg)||"已移掉");}).withFailureHandler(function(e){res(i,"bad","❌ "+e);}).lstDrop(T,d.id);
  d.gone=true;nextCur();return;}
 var b=document.querySelector("#k"+i+" .y");if(b){b.disabled=true;b.textContent="寫入中…";}
 api().withSuccessHandler(function(r){if(r&&r.err){res(i,"bad","❌ "+r.err);}else{res(i,"ok","✅ "+(r&&r.msg?r.msg:"已寫入")+"　打「復原」可還原");d.gone=true;}}).withFailureHandler(function(e){res(i,"bad","❌ "+e);}).lstApply(T,d.id,vals(i));}
Array.prototype.forEach.call($("chips").querySelectorAll(".chip"),function(c){c.onclick=function(){FILT=c.dataset.f;
 Array.prototype.forEach.call($("chips").querySelectorAll(".chip"),function(o){o.className="chip"+(o===c?" on":"");});nextCur();draw();};});
$("all").onclick=function(){var ids=[];A.forEach(function(d,i){if(pass(d))ids.push(i);});if(!ids.length)return;
 if(!confirm("要把這 "+ids.length+" 筆全部寫進工作表1 嗎？\n（7 天內打「復原」可以還原）"))return;
 $("all").disabled=true;var n=0;
 ids.forEach(function(i){var d=A[i];
  api().withSuccessHandler(function(r){if(r&&r.err){res(i,"bad","❌ "+r.err);}else{res(i,"ok","✅ 已寫入");d.gone=true;}if(++n===ids.length){$("all").disabled=false;draw();}})
  .withFailureHandler(function(e){res(i,"bad","❌ "+e);if(++n===ids.length){$("all").disabled=false;draw();}}).lstApply(T,d.id,vals(i));});};
$("delall").onclick=function(){var idx=[],ids=[],imp=0;
 A.forEach(function(d,i){if(pass(d)){idx.push(i);ids.push(d.id);if(d.src==="imp")imp++;}});
 if(!ids.length)return;
 var msg="要把這 "+ids.length+" 筆全部刪掉嗎？\n不會寫進工作表1，工作表1 不會有任何改變。";
 if(imp)msg+="\n\n⚠️ 其中 "+imp+" 筆是「待匯入分頁」的，那幾列會從分頁上刪掉，不能復原。";
 if(!confirm(msg))return;
 $("delall").disabled=true;
 api().withSuccessHandler(function(r){$("delall").disabled=false;
  if(r&&r.err){alert("刪不掉："+r.err);return;}
  idx.forEach(function(i){A[i].gone=true;});CUR=-1;draw();
  if(r&&r.bad&&r.bad.length)alert("有 "+r.bad.length+" 筆刪不掉：\n"+r.bad.join("\n"));})
 .withFailureHandler(function(e){$("delall").disabled=false;alert("刪不掉："+e);}).lstDropAll(T,ids);};
document.addEventListener("keydown",function(e){var t=e.target.tagName;if(t==="INPUT"&&e.key!=="Enter")return;
 var live=[];A.forEach(function(d,i){if(pass(d))live.push(i);});if(!live.length)return;
 if(CUR<0||live.indexOf(CUR)<0)CUR=live[0];
 var pos=live.indexOf(CUR),k=(e.key||"").toLowerCase();
 if(k==="j"||e.key==="ArrowDown"){CUR=live[Math.min(pos+1,live.length-1)];draw();look();e.preventDefault();}
 else if(k==="k"||e.key==="ArrowUp"){CUR=live[Math.max(pos-1,0)];draw();look();e.preventDefault();}
 else if(e.key==="Enter"){act(CUR,"ok");e.preventDefault();}
 else if(k==="s"){act(CUR,"skip");look();e.preventDefault();}
 else if(k==="d"){act(CUR,"drop");look();e.preventDefault();}});
function look(){var el=$("k"+CUR);if(el)el.scrollIntoView({block:"nearest"});}
gate(function(g){if(g!=="ok"){halt(GATE_MSG[g]||GATE_MSG.bad);return;}
 API="https://script.google.com/macros/s/"+X+"/exec";load();
 if(HP.v==="up"||HP.v==="rv"){var el=$(HP.v);if(el)setTimeout(function(){el.scrollIntoView();},50);}});
