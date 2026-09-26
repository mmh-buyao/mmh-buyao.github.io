/* 補藥神器網頁 v11.22.2（藥品查詢）：畫面在 GitHub，資料由網頁專案的 API 給（見 index.html 的安全設定）。這個檔沒有任何秘密。 */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  /* ══════════ 安全：不讓別的網站用框框把這一頁包進去（防有人做假網站騙人點）══════════ */
  if (window.top !== window.self) { try { document.documentElement.innerHTML = ""; } catch (e) {} return; }
  /* ══════════ 連結：#x=網頁專案部署ID&app=鑰匙（藥師版）／&dev=鑰匙（開發者版）══════════
     鑰匙放在 # 後面：瀏覽器不會把 # 後面的東西送給任何伺服器（GitHub 也看不到）。
     舊外殼的 ?x=…&app=… 也收：收了就搬到 # 後面、網址列也換掉。 */
  (function(){ var qs=location.search||""; if(!/[?&](x|app|dev|lst)=/.test(qs)) return;
    var p=new URLSearchParams(qs), f=[]; ["x","app","dev","lst"].forEach(function(k){ if(p.get(k)) f.push(k+"="+encodeURIComponent(p.get(k))); });
    try{ history.replaceState(null,"",location.pathname+"#"+f.join("&")); }catch(e){ location.replace(location.pathname+"#"+f.join("&")); } })();
  function hashParams(){ var o={}; String(location.hash||"").replace(/^#/,"").split("&").forEach(function(kv){ var i=kv.indexOf("="); if(i>0){ try{ o[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1)); }catch(e){} } }); return o; }
  var HP=hashParams(), X=HP.x||"", T=HP.dev||HP.app||"";
  var q=$("q"), out=$("out"), hint=$("hint");
  /* 手機那格比較窄，提示字縮短一點才放得下 */
  try{ if (window.innerWidth<480) q.placeholder="輸入藥名或 CODE，再按「搜尋」"; }catch(e){}
  var DEV=false, SPOT={}, FULL={}, HOME=null, TAB="錠", SORT="name", NCAT=0;
  var NICON={"停止供貨":"⛔","改包裝通知":"📦","製廠缺貨":"🏭","換廠":"🔁","給慢箋":"📄","其他":"📌"};
  var HINT0='<span>點左上 logo 回首頁</span> <span>🎤 用講的</span> <span>📷 拍包裝</span>';
  var ICON={"錠":"data:image/png;base64,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","水":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEUTm/Wi2fkKY9XS4vMCMqobTrNhqek3xP4GnYcLnW6Qr+AZS7AkzGKU5Fdk1lUDclxPc8Vqy/otz5KV4zkDNKlRaKtLaLYAAP/8qFcDMaQrjTMVnVvt5+j/1FZUrVoA//8ib1EsUaVbZ55bqzQLdDMHbkwSR65pb2z47bEQNqCescsCc1d///9Xm1cnWTP/4xoTDnYrk06y6Y/I8qR5yzVqk6Rp01LhpaienaTzp+iYd5Sz4uoSYscinFIA/38syFh2f/azyNb0YnYmk+AA/wBLZqxvg7JqkM5xyzufq9YAPMQCR8MwjDYzpONuGWBmZjtQukhohLZrxTtg042ekW6Dk7yVsqObsc2L4E/H3OEJGy46xftLO41OeMJNrT1ilq9ticOqeW2hctCN4Tq6ztz/cpnlXeX/qioCEVsAf/8gnD9MMwBmM8xTtzd//39hzkeg8GOU5WCNxqr/AH8AAADz/P7Q+P6u9f6M6f7+/v5Jyf104/4tuP1q2v5V1f6V8/6DOF2/AAAAgHRSTlP+/v7+9/j+/v76/Wv9/fr5/P/++6Ne9gEGW/+ZEQb5AR0pF//7XJwKBS5kpgIcGwQIJf7++/aaBw4HDRRoXQKaAlwJewGUaCaFGf+qJJgNDVulaP0OYe2YnVMNtRFOJxZbCgWYqwoEBlkCjAoFQAJENnoJAgD+/v//Av///v////14JAcAAA/8SURBVHja7ZuHd9tGEoexKAuBFAtMmjIlRt0qtuTu2I7tS7k0p/d26cnlehcqAfJfv5nZRSVBUomU5L27zbMlUwrmw29mZ2Z3AeVk5gimjZOzHMrUT1c2hKlXvv6iDqMvBn5b/+IVibFyjgDBweAVstrVdaM09C6xvBIcBBvnBLDy1Xa93zWMNue8Vqux/IB/w6e8Z3T79e3B+QCsHG33dYMzprmVgzHe07v1eyvnosAzfaOmOY5Lt1yk0DRNfuo4Wq+7HZwHQHBR74F9Mdyyffwif1bT62cQiRUALEWoGJp2zgDM0ZjjIAei5P7Qx8xhtZ8BQENLCKHl/rCfCaDmaLVfCqAuAf6XFWj/H+CXBfjVzIJfUIH2r2AaQibkqbUyQO18Aba7BsN6I2tBQQEnEQWKQru7dS7l+OTgsGu0a5o2sxbWeK97+MzGuQAc7W9RL9jrYUemFQf2ZL0etIa63t9/7pya0o1gSycT1JKqhSE/16E5PTgL+xVd8faeAQ6v1e72cKQdMf2rh7JABHaDG+cI0EWAqjDAOfJzAHDsPqkLTQIgac7t2rkD7BGAh/0nKzamHi0PHKZ3B386P4CtLodUo1E68KYCaHr3meC8AAIoB3CPzGWTnblLywVIksaZrAoqAPb3dIhzRiuAiVURSsAZJeKN8wFYubfVbUMxrABwpQ+MM8nE0wBwDmDRcb3pAJ7wAUhw7+g8AJ6714cIgDkg1mDZWqxAUHMcKEYHG2cPsHEPp0AqgJOtBTMESgbkhIOzBzjY6vbIAdJwzr5TikN2FjNBmUwBFAAstZ8DcEpTsab3f7ITygAQgDIApgEkCCwh6B4OzhQgOKAArFXalwSe2K9xHOhKgjMFwAwADvA8z5kFICVgZ5ANlFIKxACAKsQya1MBUAJfEPR/Wk0oANyriwwAITgHACTQRBjw00jwYhD8J6gGoCrs0L6cMzEFywDYL8uUvKgEQfDDjc2bNysBNg6oCBYEqARAJ2lJVRqsLHT3P3z2+J1nn70ZVAEE32AE8JwAFIlVPnBJAg4S7F1aQILg3rV3nm42l5cfDzaqALaxCOYBUAG3ygdAIKKgvUA+DE72j8E82F9euxdMB8g84Gs5U5VBQJlA+mBuPtx+4x9onwD2qwCu13VGHvDdqiQwCYA+0OtPzZTgevDG38i8ALhWARA8VTc0bR5AqS8RQdCfCRAcfinNN5sWELxRBXAJAFguBKZOgpRCSwA0Te0fBDPm3vF7nyT2lxHgz4PfLAzgZotCsUktRjoVOQVBu/tVJUCwffxJp9lsCIBVBFh75mgegNiWZpxzRZ0YsFpst7OTBATQL1YBBJvH33UazcatRmp/ee2tYDYA53YYMt/nqjJlSAxauPbafDZAsPned2D8zq1bt9H+KtpffvbtmQBw00ocx77nxcrMIdQw1BkAwc1XO43bzu1OAwbYtwTAtVkAcOUo8odDDwEiMWYhqJA7KgBeJPuQU243Oo0O2EcBmnMAeBTGZjQkAD8yxajAQPPwJQ9wvag/2KdoBoDGzs4OCNBsQAzcnAWght4w9Ic+Apj5MYUC7UcKTwGCra2C/u+BXbR/u9Np7KzugADNDihgPc7PwzKAoozCWGaaOB7RCDOEzHrEMVgBIlVgY1CvZ/cW3Hjnzi0HPKA1Op3OndU7ZJ8A1h7MBAAXQAjKPCCaP5gSPiuPWM7RFCD4pru3lTrhwZevwu03GnD7YH/3DjgA7IMHFgAw/bEH1j0y63nJcVmyP2HbMFWyCZkBHO4Z/YPUAU83If5udWisrnZ2l1GJZQL4/cZMgJAAQIDxeDwUg3wRhmYxCIoAG0Gf1/aS/ux4De1rMAPB7M5qZ9WiqSAAXjiaARABwFgCQCQCxBiUSDAAIouFIkAw6HJNlV16cHP5fbTf2EEBdu/cWW2m9ucBDPMAY8/1EAAJ4liqMBVgg3Y1ev2BaK/XLA3t4/03wAGr65iKln8EgIwF3/ekAmGVAvf7BnO5WKgMblrvO9otTIB3Gju7nR0LvluW9ucDhCUFxlKDeJT4wLYnAPCcw7GZ0b8Plzpes5hD9hs7jd3VBgjQTO3PCcIiAMUAAgxTH4RmCHMQc7bCcwAHfVhURm77dQjDYHPNggQsAHZ2m+uWNE/2YRqeAqAQhkKCiLmxHdpFBVa2YVXvR4zpj+5vIIAm7Dc6KICVt2+tzcyE8wHM2PVjSEMSQKTib/s6d5lpa8brhw+Dx9bdW6g+KgACtKzlZmbfWgs2TwswLgCYMYvtQgy8jNsKkKPMSKvpj/aDNQujbqcJfwkB8vaty7OK0UIAUAeiAkDt4z2dQ6o0TQ4SbA8kAEiwvrsOAlA7mIy1a6cD8IoAVJrERMwAuKEbzHZic4QS7L1rtVpNbEGajd3dhmXl7h4B3j5aECCdBAnASObCAgDEAB4icNt2Qvgx0wDGsFrrJAEI0GxZS9L08gX8++oHiwO49Hcahczz41Bm4zyAAjY1xWUAMFJgpYQAFrSi66uru4311pIYFy5ckCHw90UBsCJ7lIooE/ku/JGJIMxcoIWKrtfs0GEhKBQBkGostVCC5uqu1QAByLi0v1S9MpoC4FIMeJ4QwHehMYAYCKFXQQKpgA8CtJnCnBhdNFLcmqqrSxQFFoagtH5haQlRrMtVa8PgD2UAl1oSHDIPwBcMQkhEcZaI+EiFCAwjxx3FOEACrhoKEVi7TauVmBfD2qzaH5gE8PIAST2cAAhBgBqLYocJgFBhGjTsSqtl4QRsWXnzS9bVaoBLVQBuPhNiNfChXYwkQIhTELppx/EFACwn3Jqhq0AAgbBOIZAN6/L9UwB4wr6XBzBNCAIoCElfjg6oxYrvOLEcoWK7beGEFnigZH+zcpOKluflPIANoZfVAggz36dpKMuxMoIZwLUodMADom0aggSMgQQRAEBGKthvle3PBSgVI6pDYZQCCAfYMAUcmKKCACTgXk3XFQyDgges1uXj6n3CqZmwXAtKANEIwo0i0HGG1Djh742gU/C4bkTohKL9CQEWBPBlcxyPGASgmQCAAyAFaNwEAVwJgJ0T/JR56AQjDwD2rwUzdkqrXIAEMBGTlggESDNxGIEAmh3hjobvpwBDTJM+hAE4wcrb33948uL10jOh8xXAvhBTcjoL0lIgHKBFsUsAHstLwMfgBNNIFIAadPn4IRj/6+f7b58yCD3xLYtzXSllgZFCAoQ+/rKfZiwgMLFhHKsggSGsW63dzUHw4Mbm8T+fXnucj4QFAFyHrsz8uAhghrg7wIQATMolAEYYIr5t6JECtRgzUuujwf1rx//65Ol1aAj+cioAdIAgSACEfUwBatsJQ3HA62UE4KxIEU5QwQmYEG99tI7VcZ16gquXjhYEoEQI35cUCBkJEKEAWhg7uazpUSCIMFTsIcXh+keadne92WiCJ6goX160KRW3PqZLwzo5iYHQ90KKAD2NAEesod1EgljsL5EE3NHuQlO4LqxDXVrbDBYNQldOQ/jKWNYSogJqRBHghhQBkwA0TfgQo+CuZZH594V9aMkWBRiXMzG1hJhq4eIjuDtVY0KA5Iw/A6DfUYYKZiPqCdPpaF1+MBsAur6xX700w1jgFIKvQTtox2IvZQKA5oEaDnXdVLJsCBzW1Zmb1VIBv7w/4KfdAMQCAqAHoCMXITgFgIJA5TbkgshIm0L0QHVLdr1KAZneGO5bhdiQQgiECAAeqACA5lQka0qH1lKCsGStVXdEGYBfAJBTmzlQENiImgFVCbmaCwE3i0EmF/KmkGAERVE1cj4oF+RJgCEB4BwcizyIkxCKPdiHTMAkAKbhtmNPAsgQSAGMJB/LinAtWBTAFQAOZgK4KQCA8Bv5EmBISxKZBiVAmoeoaEkARQZB0pIOTk4WccFYAIADsCWjYuxKBSgP86GMwQRA5oxUgNCUHUMWBKIin5wGAAfmQbEooHwsuiGYX0YewPHytQgARNeK+TJXlK3W1ZkdUZIHTADwRTOKU0D2Q9iPsqQZUcNYAvh5AOZnAiQAIQBgFGJJnmK/CoBuXCYh2Y3FuYWxAGAlgJx94YEUoIXm0f7+wgCJAn5hUZTW4sQFI7GrTCf+LN1LQ1IJEIe6HqnYnl+9PM1+BcAwAUjsDwu9QApggwT0rI/PRD+W3D94QOxlowIAAPav3Q9mH99PxoCfLMv9TADcsiYAVQJAZMitTJmDhacUyJscV66cXAC3PwhOFgMYmeHQFzEvLoozLGkHYV0ahpySvPoaxx2BOB4Oc/blFgqszpjHRB4AgD8eD+Y/wJAHkGtxcf8AwOQeZYTLglAUQ+O1tuNidY6l/unq2YxAAE8CwNLRfPOt4OTUAFmbj9dPPeD5sc2pFkA/xMgH2JK4Un7hf1PhGgKolIpV89ELR4sDKFBuxDqIzo2SNamwb0Yxs2mL0gwNPDBjIWZjKBx+nNnHhRGo5taAEyaB8ubhwcmPAUDfJzlolAAkqzLoB3S9DYEGTnCSA6Y0UWDlJg/YEALKm58FpwIIozhVIJ2BaD+/U08+0JnDOBUkTx6pEIDCcQ65DCIFPGCYv33rlACmGcfD5LAmLtlPAUIVF6YuN6lNpGHKnQNGmqg0B3TldzOfdSoBkNuw8R2Nkg2PzH4C4NsYBNiWQ1vMInm+GSVrRgFA9kMS4MbCALoGskV0M8n0Fmd2dGgXx7Ztw1TkzKZCC1FgGOBqICgfajLGcfcE5uA8AUoATMPDUKx7XvFRifzg4lg/wqZIVzHYlDKA2L5DB6hzBMg/QzKo67jFBz0RHhGJ7i4f21HBAFw6RCe0gYDjEe5U+4aizHnaTSk/SggXC5lsLpK5jWPi6NjAOBQEvl0+TeQh2Yd+8NH2wgBHH+yBBHiCH0GnQytCWeN8ioCYgsAO7ZiSIVS5MEICg4/H9IkcCuehbXMD79989Hmw+MNswWEXwhpfpxQMfm7Fhy4RZ8gx5+JBDkOF6AP7kJDYGOWyMTq4HY+GNu5fo/05AVACWAkO8WLiERk8H44iuBkcdGWeKdwGOzYURCBQ6GkOlbPkmBdyB6e3EMC+Wp/7jFXhcb7nnuCrFTx5oFSTIZ8ap+9qpAQeYfd0VYHKq8p3IZJflf9Uo0jtXTkdwEnwcE9cq/xuQf65Zpge+NKrsAMimAo901Ic8Lli9L5/uH/aZ0oH7+7ppF+bHtQpvmAiXvzlvJ2852H0DJi2hJC+/KHjWyERCnP3++f/fdqnaleeBMGTl/bSN0lgtGmAVRhGaoWs3wXGuwbmLtOMsqdKKDKM3sfPPxkEpwU4gf9jEARXXr5Y3zPy5vScYTD90sWLH16h8fzHvR7ZTZ82QZDeS1c+ffjc0QLPGU48Wb2ysiLeeR9c+fDlizDq+YEfvAxWATK4/+0AvjwYfPr81+/2srdxCO9KENzYX+g9LKXyJyvBjIGXXtmA/1Y28D35wadXLqbjwysD/IUF39JXTs5kTOItOv4LmyGziwdiNVMAAAAASUVORK5CYII="};
  try{ TAB=localStorage.getItem("bt")||"錠"; SORT=localStorage.getItem("bs")||"name"; }catch(e){}

  /* ══════════ 後端：網頁專案的 API（v11.20：網頁在 GitHub，用 fetch 打 Apps Script）══════════
     只送三樣：要做什麼（fn）、鑰匙（t）、這台裝置的裝置碼（dk，開發者連結綁裝置用）。沒有 cookie、不帶來源網址。
     v11.20.1：送出去的裝置碼＝這台瀏覽器自己的亂數（bdk，只存在這台）跟連結裡的部署 ID 一起算出來的——
     每個部署拿到的都不一樣：就算有人做假連結（連到他自己的部署），他拿到的那一串拿去真的後端也沒有用。 */
  var API="", LIVE=false, SYNC_T=null, DKX="", BOUND=false;
  var DK=(function(){ var k=""; try{ k=localStorage.getItem("bdk")||""; }catch(e){ k=""; }
    if (/^[0-9a-f]{32}$/.test(k)) return k;
    try{ var a=new Uint8Array(16); crypto.getRandomValues(a); k=Array.prototype.map.call(a,function(x){ return ("0"+x.toString(16)).slice(-2); }).join(""); localStorage.setItem("bdk",k); if(localStorage.getItem("bdk")!==k) k=""; }catch(e){ k=""; }
    return k; })();
  function post(fn, a, bg){
    return fetch(API, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify({v:1, fn:fn, t:T, dk:DKX, a:a}),
      credentials:"omit", cache:"no-store", referrerPolicy:"no-referrer", redirect:"follow", keepalive:!!bg})
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); });
  }
  function call(fn, args, ok, bad){
    if (!LIVE){ setTimeout(function(){ MOCK[fn].apply(null, args.concat([ok, bad])); }, 260); return; }
    var fail=bad||function(e){ setHint("❌ "+(e&&e.message||e), true); };
    post(fn, args.slice(1)).then(function(j){
      if (!j || j.ok!==1){
        var code=j&&j.code||"", msg=j&&j.err||"後端沒有回應";
        if (code==="tok"||code==="bind"||code==="down"||code==="moved"){ stop(msg, code, j.need); return; }
        fail(new Error(msg)); return;
      }
      var res=j.r;
      if (res && res.sync) syncSoon();
      ok(res);
    }, function(err){ fail(new Error("連不上後端（"+(err&&err.message||err)+"），網路好了再試一次")); });
  }
  /* 改了資料（sync:1）→ 1.5 秒內沒有再改，就在背景通知 LINE 那邊清快取（這裡不用等）；
     還沒送就切走、關掉網頁 → 馬上送（萬一還是沒送到，網頁專案的保溫排程 30 分鐘內會補） */
  function syncNow(){ if(!SYNC_T) return; clearTimeout(SYNC_T); SYNC_T=null; post("appSync", [], true).catch(function(){}); }
  function syncSoon(){ clearTimeout(SYNC_T); SYNC_T=setTimeout(syncNow, 1500); }
  document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="hidden") syncNow(); });
  window.addEventListener("pagehide", syncNow);
  /* 整頁停下來（鑰匙不對、LINE 專案連不到、舊連結、連結有問題）；開發者版這台還沒綁定 → 出輸入綁定碼的框 */
  function stop(msg, code, need){
    if (code==="bind" && need){ bindForm(msg); return; }
    out.innerHTML='<div class="empty"><b>'+esc(msg).replace(/\n/g,"<br>")+'</b>'+(code==="tok"?"回 LINE 按下面那排的「🌐 補藥神器網頁」再開一次。":"")+'</div>';
    setHint(""); $("sf").hidden=true;
  }
  /* 開發者版：這台還沒綁定 → 輸入 LINE「開發者網頁 綁定」給的 6 位數碼（10 分鐘、只能用一次；錯 5 次鎖 1 小時；最多 3 處） */
  function bindForm(msg){
    out.innerHTML='<div class="empty bindbox"><b>'+esc(msg).replace(/\n/g,"<br>")+'</b>'
      +'<form class="bindf" id="bindf" autocomplete="off"><input id="bindc" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位數碼" aria-label="綁定碼"><button type="submit" id="bindb">綁定</button></form>'
      +'<span class="bindm" id="bindm" role="status"></span>'
      +'<small>碼 10 分鐘內有效、只能用一次；錯 5 次鎖 1 小時；最多綁 3 處。<br>這組碼只打在這裡，不要傳給任何人。</small></div>';
    setHint(""); $("sf").hidden=true;
    var inp=$("bindc"); try{ inp.focus(); }catch(e){}
    $("bindf").onsubmit=function(e){
      e.preventDefault();
      var c=String(inp.value||"").replace(/\D/g,"");
      if (!/^\d{6}$/.test(c)){ $("bindm").textContent="請輸入 6 位數字"; return; }
      $("bindb").disabled=true; $("bindm").textContent="確認中…";
      post("appBind",[c]).then(function(j){
        $("bindb").disabled=false;
        var r=j&&j.ok===1?j.r:null;
        if (r&&r.ok){ out.innerHTML=""; $("sf").hidden=false; BOUND=true; setHint("✅ 這台綁好了"); start(); return; }
        $("bindm").textContent="❌ "+((r&&r.err)||(j&&j.err)||"沒綁成功，再試一次");
        inp.value=""; try{ inp.focus(); }catch(x){}
      }, function(){ $("bindb").disabled=false; $("bindm").textContent="❌ 連不上後端，網路好了再試一次"; });
    };
  }
  /* 連結檢查：格式對才連。裝置碼跟部署 ID 一起算（算不出來就不送：藥師版照常用，開發者版會請他改用一般模式） */
  function hex(buf){ return Array.prototype.map.call(new Uint8Array(buf),function(x){ return ("0"+x.toString(16)).slice(-2); }).join(""); }
  function gate(cb){
    var later=function(v){ setTimeout(function(){ cb(v); }, 0); };
    if (HP.lst && !T) { later("oldlst"); return; }
    if (!X && !T) { later("none"); return; }
    if (!/^[A-Za-z0-9_-]{20,120}$/.test(X) || !/^[0-9a-f]{32}$/.test(T)) { later("bad"); return; }
    if (!window.fetch) { later("old"); return; }
    if (!DK || !(window.crypto&&crypto.subtle&&window.TextEncoder)) { later("ok"); return; }
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(DK+"|"+X)).then(function(b){ DKX=hex(b).slice(0,32); cb("ok"); }, function(){ cb("ok"); });
  }
  var GATE_MSG={
    none:"🌐 請從 LINE 按下面那排的「🌐 補藥神器網頁」開這個網頁。",
    oldlst:"📋 清單校對的連結換新了。\n回 LINE 打「清單校對」，再按「📤 多張上傳」或「📋 待審清單」。",
    bad:"這條連結不完整。\n回 LINE 按下面那排的「🌐 補藥神器網頁」再開一次。",
    old:"這個瀏覽器太舊，開不了補藥神器。請改用最新的 Chrome 或 Safari。"
  };

  /* ══════════ 小工具 ══════════ */
  /* 照片載不到就拿掉那一張（v11.20.0：不寫行內的錯誤處理，嚴格的安全設定不准網頁裡有行內程式） */
  document.addEventListener("error", function(e){ var t=e.target; if(t&&t.tagName==="IMG"&&t.hasAttribute("data-rm")&&t.parentNode) t.parentNode.removeChild(t); }, true);
  function esc(s){ return String(s===null||s===undefined?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function setHint(s, bad, busy){ if(s===HINT0) hint.innerHTML=s+(window.innerWidth>=700?' <span>拖照片進來或 Ctrl+V 貼上也能辨識</span>':''); else hint.textContent=s||""; hint.className="hint"+(bad?" bad":"")+(busy?" busy":""); }
  /* 錠／水：正式版由後端算好 r.kind；這裡的規則＝劑型有「水、液、漿、滴、注射、針」或位置開頭是「水」→ 水，其他都算錠 */
  function kindOf(r){ if(r.kind==="水"||r.kind==="錠") return r.kind; var f=String(r.form||""), l=String(r.location||""); return (/水|液|漿|滴|注射|針/.test(f)||/^\s*水/.test(l))?"水":"錠"; }   /* 只認「錠」「水」兩個字，後端給別的一律自己算 */
  function num(x){ return +x||0; }   /* 數字才放進畫面（不信任後端給的 length） */
  /* 每一列最前面一張小照片：有藥品照片就放照片（捲到才載入），沒有就放錠／水的小圖 */
  function thumbHtml(r){
    var th=r.thumb||(r.photo?String(r.photo).replace(/([?&]sz=w)\d+/,"$1120"):"");
    return '<span class="ph"><img class="ki" src="'+ICON[kindOf(r)]+'" alt="">'+(th?'<img class="pi" src="'+esc(th)+'" loading="lazy" alt="" data-rm="">':'')+'</span>';
  }
  /* 一列的長相跟 LINE 公告卡一樣：照片｜藥名、中文（有數量就接 ×數量）、extra（公告補充）、劑型小圖＋錠／水＋CODE｜位置 */
  /* v11.22.2：照片才有的：藥師寫在藥名後面的數量（×20） */
  var PH_KEYS=["qty"];
  function isPh(r){ return !!(r&&r.qty); }
  function noPh(r){ var c={}, k; for (k in r) if (Object.prototype.hasOwnProperty.call(r,k) && PH_KEYS.indexOf(k)<0) c[k]=r[k]; return c; }
  /* 照片那一份（查到的＋「可能是」的候選）裡有沒有這一支 */
  function photoHas(res, code){ return (res.rows||[]).some(function(x){ return x.code===code; }) || (res.asks||[]).some(function(a){ return (a.rows||[]).some(function(x){ return x.code===code; }); }); }
  /* 開發者改完（✏️、📷 換照片、公告照片）：新的那一列照樣帶照片的數量 */
  function keepPh(from, to){ PH_KEYS.forEach(function(k){ if(from&&from[k]) to[k]=from[k]; }); return to; }
  /* 開發者改完：上一份清單（照片那一份也是）裡同一支換成新的，按「← 回清單」看到的是改好的（每一列自己的數量照舊） */
  function swapRow(nr){
    if (!LAST) return;
    var fix=function(list){ for (var i=0;list&&i<list.length;i++) if (list[i].code===nr.code) list[i]=keepPh(list[i], noPh(nr)); };
    fix(LAST.rows);
    if (LAST.photo){ if (LAST.photo.rows!==LAST.rows) fix(LAST.photo.rows); (LAST.photo.asks||[]).forEach(function(a){ fix(a.rows); }); }
  }
  function rowHtml(r, extra){
    var k=kindOf(r);
    return '<button type="button" class="row" data-code="'+esc(r.code)+'"'+(isPh(r)?' data-ph="1"':'')+'>'+thumbHtml(r)
      +'<span class="n"><b>'+esc(r.brand)+'</b><span class="z">'+esc(r.chName||"")+(r.qty?'　×'+esc(r.qty):'')+'</span>'+(extra||'')
      +'<span class="k"><img src="'+ICON[k]+'" alt="">'+esc(k)+'<span class="c mono">'+esc(r.code)+'</span></span></span>'
      +'<span class="l">'+esc(r.location||"")+'</span></button>';
  }
  /* 同成分彙整：三段（不同劑量／不同劑型／同劑量其他廠牌），列的長相跟清單一樣，點了開那支藥 */
  var SAME={};
  var SAME_SEC=[["dose","💊 同成分不同劑量"],["form","🔁 同成分不同劑型"],["brand","🏷 同成分同劑量"]];
  function sameHtml(res){
    /* 固定三段＋複方：多出來的成分一段（➕ CLAVULANATE 的成分）、只有部分成分的照它們有的成分一段（🧩 AMOXYCILLIN 的成分） */
    var secs=[];
    SAME_SEC.forEach(function(sec){ var list=res[sec[0]]||[]; if(list.length) secs.push({title:sec[1], rows:list}); });
    (res.combo||[]).forEach(function(g){ secs.push({title:"➕ "+g.name+" 的成分", rows:g.rows}); });
    (res.part||[]).forEach(function(g){ secs.push({title:"🧩 "+g.name+" 的成分", rows:g.rows}); });
    var h='', total=0;
    secs.forEach(function(sec){ total+=num(sec.rows.length); });
    if (!total) return '';
    h+='<div class="kg same"><img src="'+ICON["錠"]+'" alt="">藥品家族<b>'+total+' 個品項</b></div>';
    secs.forEach(function(sec){
      h+='<div class="sub">'+esc(sec.title)+'<b>'+num(sec.rows.length)+' 個品項</b></div>';
      sec.rows.forEach(function(x){ h+=rowHtml(x, x.formLabel?'<i class="fl">'+esc(x.formLabel)+'</i>':''); });
    });
    return '<div class="list samebox">'+h+'</div>';
  }
  function homeBtn(){ return '<div class="actions"><button type="button" class="quiet" data-go="home">🏠 首頁</button></div>'; }

  /* ══════════ 首頁：公告＋所有藥品 ══════════ */
  function renderHome(){
    var h='<section class="sec"><div class="sh"><b>📢 公告</b><span id="ncount"></span></div><div class="tabs wrap" role="tablist" id="ntabs"></div><div class="list" id="nlist"><div class="none">載入中…</div></div></section>';
    h+='<section class="sec"><div class="sh"><b>💊 所有藥品</b><span id="acount"></span></div>'
      +'<div class="tabs" role="tablist"><button type="button" role="tab" data-tab="錠" aria-selected="'+(TAB==="錠")+'"><img src="'+ICON["錠"]+'" alt="">錠<small id="c錠"></small></button>'
      +'<button type="button" role="tab" data-tab="水" aria-selected="'+(TAB==="水")+'"><img src="'+ICON["水"]+'" alt="">水<small id="c水"></small></button></div>'
      +'<div class="sortrow">排序<button type="button" data-sort="name" aria-pressed="'+(SORT==="name")+'">藥名</button><button type="button" data-sort="loc" aria-pressed="'+(SORT==="loc")+'">位置</button></div>'
      +'<div class="list" id="alist"><div class="none">載入中…</div></div></section>';
    out.innerHTML=h;
    if (HOME) fillHome(HOME); else call("appHome",[T],function(res){ if(!res||res.err){ setHint("❌ "+(res&&res.err||"首頁載入失敗"), true); return; } HOME=res; if($("nlist")) fillHome(res); });
    window.scrollTo({top:0});
  }
  function fillHome(d){
    var n=0, groups=d.notices||[];
    groups.forEach(function(g){ n+=num(g.rows&&g.rows.length); });
    /* 公告：分類做成一排分頁（跟下面錠／水同一種長相），點哪一類、清單就換成那一類 */
    if (n){
      if (!(NCAT>=0 && NCAT<groups.length)) NCAT=0;
      $("ntabs").innerHTML=groups.map(function(g,gi){ return '<button type="button" role="tab" data-ncat="'+gi+'" aria-selected="'+(gi===NCAT)+'">'+(Object.prototype.hasOwnProperty.call(NICON,g.name)?NICON[g.name]:"📌")+' '+esc(g.name)+'<small>'+num(g.rows.length)+'</small></button>'; }).join("");
      fillNotice(groups);
    } else {
      $("ntabs").hidden=true;
      $("nlist").innerHTML='<div class="none">目前沒有藥品通知</div>';
    }
    $("ncount").textContent = n ? n+" 個品項" : "";
    var all=d.drugs||[], cnt={"錠":0,"水":0};
    all.forEach(function(r){ cnt[kindOf(r)]++; });
    $("acount").textContent = all.length+" 個品項";
    $("c錠").textContent=cnt["錠"]; $("c水").textContent=cnt["水"];
    fillAll(all);
  }
  function fillNotice(groups){
    var g=groups[NCAT]; if(!g) return;
    var h=""; g.rows.forEach(function(r){ h+=rowHtml(r, r.memo?'<i>'+esc(r.memo)+'</i>':''); });
    $("nlist").innerHTML=h||'<div class="none">這一類沒有藥</div>';
  }
  function fillAll(all){
    var rows=all.filter(function(r){ return kindOf(r)===TAB; });
    var cmp=function(a,b){ return String(a||"").localeCompare(String(b||""),"zh-Hant",{numeric:true,sensitivity:"base"}); };
    rows.sort(SORT==="loc" ? function(a,b){ return cmp(a.location,b.location)||cmp(a.brand,b.brand); } : function(a,b){ return cmp(a.brand,b.brand); });
    var h=""; rows.forEach(function(r){ h+=rowHtml(r); });
    $("alist").innerHTML = h || '<div class="none">這一類還沒有藥</div>';
  }

  /* ══════════ 清單／卡片 ══════════ */
  var LAST=null;   /* 上一份清單（回清單時要記得標題和分組） */
  function renderList(rows, title, extra, loc){
    if (LAST && rows===LAST.rows){ if(title===undefined) title=LAST.title; if(extra===undefined) extra=LAST.extra; if(loc===undefined) loc=LAST.loc; }
    LAST={rows:rows, title:title, extra:extra, loc:loc};
    var h='<div class="list"><div class="h">'+esc(title||("找到 "+rows.length+" 個品項，點一個看卡片"))+'</div>'+(extra||'');
    if (loc){
      /* 位置查詢：跟 LINE 的位置卡一樣分「錠劑類／水劑類」，圖用藥品卡片那兩張 */
      var tab=rows.filter(function(r){ return kindOf(r)!=="水"; }), water=rows.filter(function(r){ return kindOf(r)==="水"; });
      [["錠","錠劑類",tab],["水","水劑類",water]].forEach(function(g){
        if (!g[2].length) return;
        h+='<div class="kg"><img src="'+ICON[g[0]]+'" alt="">'+g[1]+'<b>'+g[2].length+' 個品項</b></div>';
        g[2].forEach(function(r){ FULL[r.code]=r; h+=rowHtml(r); });
      });
    } else rows.forEach(function(r){ FULL[r.code]=r; h+=rowHtml(r); });
    out.innerHTML=h+'</div>'+homeBtn();
    window.scrollTo({top:0});
  }
  /* 查無：後端給「你是不是要找」的候選 */
  function renderGuess(kw, guess){
    var h='<div class="list"><div class="h">沒有「'+esc(kw)+'」，你是不是要找：</div>';
    guess.forEach(function(r){ h+=rowHtml(r); });
    out.innerHTML=h+'</div>'+homeBtn();
    window.scrollTo({top:0});
  }
  /* 照片：查到的＋每一行讀到什麼＋沒對到的名字（附候選） */
  function renderPhoto(res){
    var rows=res.rows||[], asks=res.asks||[], read=res.read||[];
    var chips='';
    if (read.length){ chips='<div class="chips">'+read.map(function(x){ return '<span class="'+(x.none?"no":"ok")+'">'+esc(x.shown)+(x.qty?' ×'+esc(x.qty):'')+'</span>'; }).join('')+'</div>'; }
    /* 只查到一支就直接出卡片；v11.22.2：OCR 接手的（res.via：AI 沒讀到、可能有漏）照樣出清單，上面那一句才看得到 */
    if (rows.length===1 && !asks.length && !res.via){ renderCard(rows[0], null); return; }
    /* v11.22.2：記住這一份，卡片上的「← 回清單」回到這裡（以前會回到更早的查詢清單） */
    LAST={rows:rows, photo:res};
    var h='', mine={};
    /* 語音只有候選（沒有讀到的行、也沒有查到的）→ 不出「📷 讀到 0 行」那一塊 */
    if (rows.length || read.length || !asks.length){
      h='<div class="list"><div class="h">📷 讀到 '+num(read.length)+' 行，查到 '+num(rows.length)+' 個品項'+(res.via?'（'+esc(res.via)+'）':'')+'</div>'+chips;
      rows.forEach(function(r){ FULL[r.code]=r; mine[r.code]=1; h+=rowHtml(r); });
      if (!rows.length && !asks.length) h+='<div class="none">沒有對到院內的藥。拍清楚一點（字面朝上、光線夠）再試，或直接打字查。</div>';
      h+='</div>';
    }
    asks.forEach(function(a){
      h+='<div class="list"><div class="g">❓ 「'+esc(a.name)+'」沒對到，可能是：</div>';
      /* v11.22.2：候選裡剛好有上面查到的那一支 → 不蓋掉上面那一列（它帶著照片上的數量） */
      a.rows.forEach(function(r){ if(!mine[r.code]) FULL[r.code]=r; h+=rowHtml(r); });
      h+='</div>';
    });
    out.innerHTML=h+homeBtn();
    window.scrollTo({top:0});
  }
  function renderCard(r, backTo){
    FULL[r.code]=r;
    var spot = SPOT[r.code] || (r.spots&&r.spots.length ? r.spots[0].name : "");
    var mapUrl = r.map||"";
    if (r.spots&&r.spots.length){ r.spots.forEach(function(s){ if(s.name===spot&&s.map) mapUrl=s.map; }); }
    var h='<article class="card" id="card" data-code="'+esc(r.code)+'">';
    h+='<div class="head"><div class="t"><div class="code mono">'+esc(r.code)+(r.qty?' <span class="qty">×'+esc(r.qty)+'</span>':'')+'</div><div class="brand">'+esc(r.brand)+'</div>'
      +(r.chName?'<div class="zh">'+esc(r.chName)+'</div>':'')+(r.generic?'<div class="gen">'+esc(r.generic)+'</div>':'')+'</div>'
      +'<div class="side">'+(r.ref?'<a class="icon" href="'+esc(r.ref)+'" target="_blank" rel="noopener noreferrer" title="點圖院內藥物查詢">':'<div class="icon" title="'+esc(r.form||"")+'">')
      +'<img src="'+ICON[kindOf(r)]+'" alt="'+esc(kindOf(r))+'">'+(r.ref?'</a><small class="ref">點圖院內藥物查詢</small>':'</div>')
      +'</div></div>';
    if (r.notice){
      h+='<div class="box notice"><span class="k">⚠️ 公告</span><span class="v">'+esc(r.notice)+'</span>';
      var zt=(r.zones&&r.zones.length)?'<table class="zones"><caption>📍 各區位置</caption>'+r.zones.map(function(z){ return '<tr><th>'+esc(z.name)+'</th><td>'+esc(z.pos)+'</td></tr>'; }).join("")+'</table>':'';
      var np=r.npic?'<img class="npic" src="'+esc(String(r.npic).replace(/([?&]sz=w)\d+/,"$1400"))+'" alt="公告照片" data-big="'+esc(r.npic)+'">':'';
      if (zt||np) h+='<div class="nrow">'+(zt||(np?'<span class="sp"></span>':''))+np+'</div>';
      h+='</div>';
    }
    if (r.feat)   h+='<div class="box feat"><span class="k">🔍 藥品特徵</span><span class="v">'+esc(r.feat)+'</span></div>';
    var left='', hasNote=!!(r.pair||r.note||r.old||r.abbr);
    if (r.pair) left+='<div class="box pair"><span class="k">⚠️ 注意</span><span class="v">'+esc(r.pair)+'</span></div>';
    if (r.note) left+='<div class="kv"><span class="k">適應症</span><span class="v">'+esc(r.note)+'</span></div>';
    if (r.old)  left+='<div class="kv"><span class="k">曾用藥品</span><span class="v">'+esc(r.old)+'</span></div>';
    if (r.abbr) left+='<div class="kv"><span class="k">縮寫</span><span class="v">'+esc(r.abbr)+'</span></div>';
    if (hasNote||r.photo){
      h+='<div class="grid2"><div style="display:flex;flex-direction:column;gap:9px;min-width:0">'+left+'</div>'
        +(r.photo?'<img class="photo" src="'+esc(r.photo)+'" alt="藥品照片" data-big="'+esc(r.photo)+'">':'')+'</div>';
    }
    /* 位置＋平面圖 */
    h+='<div class="locrow"><div class="loc'+((r.location||"").length>4?" long":"")+'"><span class="pin">📍</span><span class="t">'+esc(r.location||"—")+'</span></div>'
      +(mapUrl?'<img class="map" src="'+esc(mapUrl)+'" alt="平面圖" data-big="'+esc(r.mapBig||mapUrl)+'">':'')+'</div>';
    if (r.spots&&r.spots.length>1){
      h+='<div class="spots">'+r.spots.map(function(s){ return '<button type="button" data-spot="'+esc(s.name)+'" aria-pressed="'+(s.name===spot)+'">'+esc(s.name)+'</button>'; }).join("")+'</div>';
    }
    /* 藥品家族（v11.18.0）：位置下面；另外問後端，有才出現 */
    h+='<div id="same">'+(SAME[r.code]?sameHtml(SAME[r.code]):'')+'</div>';
    /* 卡片最下面：有清單才有「← 回清單」；開發者版多一顆「✏️ 修改」（跟 LINE 卡片一樣）。首頁請點左上 logo。 */
    var acts=[];
    if (backTo&&(backTo.length>1||(LAST&&LAST.photo&&LAST.rows===backTo))) acts.push('<button type="button" class="quiet" id="back">← 回清單</button>');
    /*DEV*/if (DEV) acts.push('<button type="button" class="edit" id="edit">✏️ 修改</button>');/*/DEV*/
    if (acts.length) h+='<div class="actions">'+acts.join("")+'</div>';
    h+='</article>';
    out.innerHTML=h;
    Array.prototype.forEach.call(out.querySelectorAll("img[data-big]"),function(im){ im.onclick=function(){ $("lbimg").src=im.dataset.big; $("lb").hidden=false; }; });
    Array.prototype.forEach.call(out.querySelectorAll(".spots button"),function(b){ b.onclick=function(){ SPOT[r.code]=b.dataset.spot; renderCard(r, backTo); }; });
    if ($("back")) $("back").onclick=function(){ if (LAST&&LAST.photo&&LAST.rows===backTo) renderPhoto(LAST.photo); else renderList(backTo); };
    if (!SAME[r.code]) call("appSame",[T, r.code],function(res){ if(!res||res.err) return; SAME[r.code]=res; var el=$("same"); if(el&&out.contains(el)&&el.closest("article")&&el.closest("article").getAttribute("data-code")===String(r.code)) el.innerHTML=sameHtml(res); });   /* v11.22.2：比卡片上記的 CODE（以前比 .code 的字，有「×數量」時永遠對不上，藥品家族第一次打開出不來） */
    /*DEV*/if ($("edit")) $("edit").onclick=function(){ renderEdit(r, backTo); };/*/DEV*/
    window.scrollTo({top:0});
  }
  /* 點清單任何一列：查過的直接開卡片，沒查過的（首頁的精簡列）用 CODE 去後端拿完整資料 */
  /* 從查詢清單點進卡片 → 卡片有「← 回清單」（回到同一份清單、同樣的分組） */
  /* v11.22.2：照片上的數量（×20）只跟著照片那一份清單走；
     首頁、公告、藥品家族裡點到同一支（FULL 裡還是照片那一列）→ 開沒有數量的卡片，不會把紙條上的數量帶到別的地方 */
  function openCode(code, ph){
    var r=FULL[code]; if (r && !ph && isPh(r)) r=noPh(r);
    /* 「← 回清單」：照片那一份（查到的、候選的都算，幾列都一樣）回照片；查詢清單照舊（兩列以上才有） */
    var back = LAST&&LAST.photo ? (photoHas(LAST.photo, code)?LAST.rows:null) : (LAST&&LAST.rows&&LAST.rows.length>1&&LAST.rows.some(function(x){return x.code===code;})?LAST.rows:null);
    if (r) renderCard(r, back); else search(code);
  }
  out.addEventListener("click", function(e){
    var b=e.target.closest ? e.target.closest("button") : null; if(!b) return;
    if (b.dataset.code){ openCode(b.dataset.code, b.hasAttribute("data-ph")); return; }
    if (b.dataset.go==="home"){ renderHome(); return; }
    if (b.dataset.ncat!==undefined){ NCAT=+b.dataset.ncat; Array.prototype.forEach.call(out.querySelectorAll("[data-ncat]"),function(t){ t.setAttribute("aria-selected", +t.dataset.ncat===NCAT); }); if(HOME) fillNotice(HOME.notices||[]); return; }
    if (b.dataset.tab){ TAB=b.dataset.tab; try{localStorage.setItem("bt",TAB);}catch(x){} Array.prototype.forEach.call(out.querySelectorAll("[data-tab]"),function(t){ t.setAttribute("aria-selected", t.dataset.tab===TAB); }); if(HOME) fillAll(HOME.drugs||[]); return; }
    if (b.dataset.sort){ SORT=b.dataset.sort; try{localStorage.setItem("bs",SORT);}catch(x){} Array.prototype.forEach.call(out.querySelectorAll("[data-sort]"),function(t){ t.setAttribute("aria-pressed", t.dataset.sort===SORT); }); if(HOME) fillAll(HOME.drugs||[]); return; }
  });
  $("home").onclick=function(){ q.value=""; setHint(HINT0); renderHome(); };

  /*DEV*/
  /* ══════════ 修改（開發者版才有這一段；藥師版出頁時整段拿掉）══════════ */
  /* 16 欄跟 LINE 的 ✏️ 改 一模一樣；字母＝LINE「一次改」的代號（A～J），沒有代號的就是 LINE 上沒給字母的那幾欄 */
  var EF=[
    {k:"brand", c:"A", l:"商品名"},
    {k:"zh",    c:"B", l:"中文"},
    {k:"loc",   c:"C", l:"小藥庫位置", cap:1},
    {k:"form",  l:"劑型", list:1},
    {k:"gen",   c:"E", l:"學名", ta:1, nl:1},
    {k:"ref",   l:"藥品查詢參考網站", url:1, hint:"貼院內網站那一頁的整串網址（http:// 或 https:// 開頭）；卡片右上角的劑型圖會連過去"},
    {k:"feat",  c:"D", l:"藥品特徵", ta:1, nl:1},
    {k:"note",  l:"適應症", ta:1, nl:1},
    {k:"pair",  l:"注意", ta:1, nl:1},
    {k:"old",   c:"I", l:"曾用藥品", ta:1, nl:1, hint:"一行一個（卡片上就一行一個），或用「、」分開"},
    {k:"pic",   l:"📷 換照片", pic:1},
    {k:"photo", c:"F", l:"藥品外觀（照片網址）", url:1, hint:"通常不用手動改——上面「換照片」存好會自動填"},
    {k:"nk",    c:"G", l:"公告類別", nk:1},
    {k:"nm",    c:"H", l:"公告補充說明", ta:1, nl:1},
    {k:"npic",  l:"📷 公告照片", npic:1},
    {k:"zones", l:"📍 各區位置（公告框裡的表格）", zones:1},
    {k:"map",   l:"🗺 平面圖", map:1},
    {k:"abbr",  c:"J", l:"縮寫", hint:"多個用逗號分開，例如 HCTZ, HCT；清空＝全部拿掉"}
  ];
  var NK={"":"（沒有公告）","1":"1 停止供貨","2":"2 改包裝通知","3":"3 製廠缺貨","4":"4 換廠","5":"5 給慢箋"};
  var ZONES=[["z1","成錠"],["z2","兒錠"],["z3","兒水"],["z4","急診"],["z5","UD1"],["z6","UD2"]];
  var FORMS=["錠劑","膠囊","口服液","糖漿","懸液","眼藥水","滴劑","噴劑","藥膏","乳膏","貼片","栓劑","注射液","粉劑","顆粒","外用液"];
  function mapOpts(m){
    var cur=m&&m.now||"", h='';
    var opt=function(v,l){ return '<option value="'+esc(v)+'"'+(v===cur?" selected":"")+'>'+esc(l)+'</option>'; };
    h+=opt("","自動判斷（跟著小藥庫位置走）")+opt("公藥","沒有平面圖（公藥那種）");
    h+='<optgroup label="棧板">'+opt("棧左","棧左")+opt("棧中","棧中")+opt("棧右","棧右")+'</optgroup>';
    var n=m&&m.names||{};
    [["錠櫃",n.tab],["水櫃",n.water],["其他",n.other],["雲端資料夾裡的圖",n.drive]].forEach(function(g){
      if(!g[1]||!g[1].length) return;
      h+='<optgroup label="'+esc(g[0])+'">'+g[1].map(function(x){ return opt(x,x); }).join("")+'</optgroup>';
    });
    if (cur && h.indexOf('value="'+esc(cur)+'"')<0) h+=opt(cur,cur+"（現在設的）");
    return h;
  }
  function renderEdit(r, backTo){
    out.innerHTML='<article class="card"><div class="head"><div class="t"><div class="code mono">'+esc(r.code)+'</div><div class="brand">'+esc(r.brand)+'</div></div></div><div class="edit"><div class="t">✏️ 讀現在的內容…</div></div></article>';
    window.scrollTo({top:0});
    call("appEditInfo",[T, r.code],function(info){
      if (!info || info.err){ setHint("❌ "+(info&&info.err||"讀不到現在的內容"), true); renderCard(r, backTo); return; }
      buildEdit(r, backTo, info);
    });
  }
  function buildEdit(r, backTo, info){
    var v=info.vals||{}, h='<article class="card"><div class="head"><div class="t"><div class="code mono">'+esc(r.code)+'</div><div class="brand">'+esc(r.brand)+'</div></div></div>';
    h+='<div class="edit"><div class="t">✏️ 跟 LINE 的 ✏️ 改 同樣 16 欄：直接改下面的框，按「存」就寫進試算表。照片選好會直接存進雲端（不用按「存」）。學名、藥品特徵、適應症、注意、曾用藥品、公告補充說明可以多行：按 Enter 換行，卡片上就跳行。</div>';
    EF.forEach(function(f){
      var k=f.k, cur=v[k]===undefined||v[k]===null?"":String(v[k]);
      h+='<div class="f"><label for="e_'+k+'">'+(f.c?'<b>'+f.c+'</b>':'')+esc(f.l)+'</label>';
      if (f.pic){
        h+='<div class="picrow drop" id="e_picdrop" data-zone="photo" tabindex="0"><span class="ph big"><img class="ki" src="'+ICON[kindOf(r)]+'" alt="">'+(r.thumb||r.photo?'<img class="pi" id="e_picimg" src="'+esc(r.thumb||r.photo)+'" alt="" data-rm="">':'')+'</span>'
          +'<span class="dz"><button type="button" class="quiet" id="e_picbtn">📷 拍照或選照片</button><small>或把照片拖到這一格、點一下這格再 Ctrl+V 貼上</small></span><input type="file" id="e_picfile" accept="image/*" hidden></div>'
          +'<span class="was" id="e_picmsg">存進雲端照片資料夾（檔名 '+esc(r.code)+'.jpeg），舊的會移到「舊照片」，卡片馬上換新照片</span></div>';
        return;
      }
      if (f.npic){
        var np=v.npic||"";
        h+='<div class="picrow drop" id="e_npicdrop" data-zone="npic" tabindex="0"><span class="ph big" id="e_npicph">'+(np?'<img class="pi" id="e_npicimg" src="'+esc(String(np).replace(/([?&]sz=w)\d+/,"$1120"))+'" alt="" data-rm="">':'<span class="none">沒有</span>')+'</span>'
          +'<span class="dz"><span class="dzb"><button type="button" id="e_npicbtn">📷 拍照或選照片</button>'+(np?'<button type="button" id="e_npicdel">🗑 移除</button>':'')+'</span><small>或把照片拖到這一格、點一下這格再 Ctrl+V 貼上</small></span><input type="file" id="e_npicfile" accept="image/*" hidden></div>'
          +'<span class="was" id="e_npicmsg">顯示在藥品卡片的公告框裡（例如新包裝的外盒）；選好直接存進雲端「公告照片」，公告移除時一起拿掉</span></div>';
        return;
      }
      if (f.zones){
        h+='<div class="zgrid">'+ZONES.map(function(z){ var zv=v[z[0]]||""; return '<label class="zc"><span>'+esc(z[1])+'</span><input id="e_'+z[0]+'" value="'+esc(zv)+'" autocapitalize="characters" placeholder="（沒放）"></label>'; }).join("")+'</div>'
          +'<span class="was">成錠、兒錠、兒水、急診、UD1、UD2 各區的位置；有填的區才會出現在公告框的表格（有公告的藥才顯示）</span></div>';
        return;
      }
      if (f.map){
        var m=info.map||{}, now=m.now||"", nowText=!now?"自動判斷":(now==="公藥"?"沒有平面圖":now);
        h+='<select id="e_map">'+mapOpts(m)+'</select><span class="was">原本：'+esc(nowText)+'　設完全院立刻生效</span></div>';
        return;
      }
      if (f.nk){
        h+='<select id="e_'+k+'">'+Object.keys(NK).map(function(n){ return '<option value="'+n+'"'+(cur===n?" selected":"")+'>'+esc(NK[n])+'</option>'; }).join("")+'</select>';
      } else if (f.ta){
        h+='<textarea id="e_'+k+'">'+esc(cur)+'</textarea>';
      } else if (f.list){
        h+='<input id="e_'+k+'" value="'+esc(cur)+'" list="l_'+k+'"><datalist id="l_'+k+'">'+FORMS.map(function(x){ return '<option value="'+esc(x)+'">'; }).join("")+'</datalist>';
      } else {
        h+='<input id="e_'+k+'" value="'+esc(cur)+'"'+(f.cap?' autocapitalize="characters"':'')+(f.url?' inputmode="url"':'')+'>';
      }
      h+='<span class="was">'+(f.nl?'按 Enter 換行＝卡片上跳行　':'')+(f.hint?esc(f.hint)+'　':'')+'原本：'+(cur?esc((cur.length>60?cur.slice(0,60)+"…":cur).replace(/\n/g," ⏎ ")):"（空的）")+'</span></div>';
    });
    h+='<div class="actions"><button type="button" class="quiet" id="ecancel">取消</button><button type="button" class="pri" id="esave">💾 存</button></div></div></article>';
    out.innerHTML=h;
    $("ecancel").onclick=function(){ renderCard(r, backTo); };
    /* 📷 換照片：選好就直接送（跟 LINE 一樣，照片是唯一不用按「存」的） */
    $("e_picbtn").onclick=function(){ $("e_picfile").click(); };
    $("e_picfile").onchange=function(e){ var file=e.target.files&&e.target.files[0]; e.target.value=""; if(file) uploadPic(file); };
    function uploadPic(file){
      if (!file||!/^image\//.test(file.type||"")) { setHint("❌ 這不是照片檔", true); return; }
      $("e_picbtn").disabled=true; $("e_picmsg").textContent="📷 讀照片…";
      shrink(file,function(b64,mime,kb){
        $("e_picmsg").textContent="📷 存進雲端（"+kb+" KB）…";
        call("appPic",[T, r.code, b64, mime],function(res){
          $("e_picbtn").disabled=false;
          if (!res || res.err){ $("e_picmsg").textContent="❌ "+(res&&res.err||"沒存成"); setHint("❌ "+(res&&res.err||"照片沒存成"), true); return; }
          $("e_picmsg").textContent="✅ 換好了（雲端 "+(res.name||"")+(res.moved&&res.moved.length?"；舊的移到「舊照片」":"")+"）新照片要幾秒鐘才會出現";
          if (res.url){ var im=$("e_picimg"); var th=String(res.url).replace(/([?&]sz=w)\d+/,"$1120"); if(im) im.src=th; else { var ph=$("e_picbtn").parentNode.querySelector(".ph"); if(ph) ph.insertAdjacentHTML("beforeend",'<img class="pi" id="e_picimg" src="'+esc(th)+'" alt="" data-rm="">'); } r.photo=res.url; r.thumb=th; if($("e_photo")) $("e_photo").value=res.url; v.photo=res.url; }
          if (res.row){ keepPh(r, res.row); FULL[res.row.code]=res.row; r=res.row; swapRow(res.row); }
          HOME=null;
          setHint("✅ "+r.code+" 照片換好了");
        });
      });
    }
    /* 📷 公告照片：選好直接存（跟換照片一樣）；🗑 移除＝按「存」時一起送 npic:"" */
    var npicDel=false;
    $("e_npicbtn").onclick=function(){ $("e_npicfile").click(); };
    if ($("e_npicdel")) $("e_npicdel").onclick=function(){ npicDel=!npicDel; this.textContent=npicDel?"↩ 不移除":"🗑 移除"; $("e_npicmsg").textContent=npicDel?"按「存」就把公告照片拿掉":"顯示在藥品卡片的公告框裡"; };
    $("e_npicfile").onchange=function(e){ var file=e.target.files&&e.target.files[0]; e.target.value=""; if(file) uploadNpic(file); };
    function uploadNpic(file){
      if (!file||!/^image\//.test(file.type||"")) { setHint("❌ 這不是照片檔", true); return; }
      $("e_npicbtn").disabled=true; $("e_npicmsg").textContent="📷 讀照片…";
      shrink(file,function(b64,mime,kb){
        $("e_npicmsg").textContent="📷 存進雲端（"+kb+" KB）…";
        call("appPic",[T, r.code, b64, mime, "npic"],function(res){
          $("e_npicbtn").disabled=false;
          if (!res || res.err){ $("e_npicmsg").textContent="❌ "+(res&&res.err||"沒存成"); setHint("❌ "+(res&&res.err||"公告照片沒存成"), true); return; }
          npicDel=false; $("e_npicmsg").textContent="✅ 公告照片換好了（雲端 公告照片／"+(res.name||"")+"）"+(v.nk?"":"　⚠️ 這支藥還沒掛公告，掛上才會顯示");
          if (res.url){ var th=String(res.url).replace(/([?&]sz=w)\d+/,"$1120"); $("e_npicph").innerHTML='<img class="pi" id="e_npicimg" src="'+esc(th)+'" alt="" data-rm="">'; v.npic=res.url; }
          if (res.row){ keepPh(r, res.row); FULL[res.row.code]=res.row; r=res.row; swapRow(res.row); }
          HOME=null;
        });
      });
    }
    /* 拖進格子／貼上：兩格各自收拖進來的照片；Ctrl+V 貼上放到「最後點過」的那一格（預設藥品照片） */
    EDIT_ZONE={photo:uploadPic, npic:uploadNpic, active:"photo"};
    [$("e_picdrop"), $("e_npicdrop")].forEach(function(z){
      if (!z) return;
      z.addEventListener("click", function(){ EDIT_ZONE.active=z.dataset.zone; markZone(); });
      z.addEventListener("focus", function(){ EDIT_ZONE.active=z.dataset.zone; markZone(); });
      z.addEventListener("dragover", function(e){ e.preventDefault(); e.stopPropagation(); z.classList.add("over"); });
      z.addEventListener("dragleave", function(){ z.classList.remove("over"); });
      z.addEventListener("drop", function(e){ e.preventDefault(); e.stopPropagation(); z.classList.remove("over"); var f=dropFile(e); if (f){ EDIT_ZONE.active=z.dataset.zone; markZone(); EDIT_ZONE[z.dataset.zone](f); } });
    });
    function markZone(){ [$("e_picdrop"), $("e_npicdrop")].forEach(function(z){ if(z) z.classList.toggle("active", z.dataset.zone===EDIT_ZONE.active); }); }
    markZone();
    $("esave").onclick=function(){
      var ch={};
      EF.forEach(function(f){ if(f.pic||f.map||f.npic||f.zones) return; var k=f.k, el=$("e_"+k); if(!el) return; var val=el.value; var cur=v[k]===undefined||v[k]===null?"":String(v[k]); if(k==="loc") val=val.toUpperCase(); if(val!==cur) ch[k]=val; });
      ZONES.forEach(function(z){ var el=$("e_"+z[0]); if(!el) return; var val=el.value.trim(), cur=(v[z[0]]||"").toString(); if(val!==cur) ch[z[0]]=val; });
      if (npicDel) ch.npic="";
      var mapNow=(info.map&&info.map.now)||"", mapSel=$("e_map")?$("e_map").value:mapNow; if(mapSel!==mapNow) ch.map=mapSel;
      if (!Object.keys(ch).length){ setHint("沒有改任何東西"); renderCard(r, backTo); return; }
      if (ch.ref && !/^https?:\/\/\S+$/i.test(ch.ref)){ setHint("❌ 藥品查詢參考網站：要以 http:// 或 https:// 開頭、中間不能有空格", true); $("e_ref").focus(); return; }
      $("esave").disabled=true; setHint("寫進試算表…", false, true);
      call("appEdit",[T, r.code, ch],function(res){
        if (!res || res.err){ setHint("❌ "+(res&&res.err||"寫入失敗"), true); $("esave").disabled=false; return; }
        var done=res.done||[], errs=res.errs||[];
        if (errs.length) setHint((done.length?"✅ 改好 "+done.join("、")+"；":"")+"⚠️ 沒改成："+errs.join("；"), true);
        else setHint("✅ 改好 "+done.length+" 項（"+done.join("、")+"），已寫進試算表"+(res.undo?"　↩️ 改錯了：LINE 打「復原 "+res.undo+"」":""));
        var nr=res.row?res.row:r; if(res.row){ keepPh(r, nr); FULL[nr.code]=nr; swapRow(nr); }   /* v11.22.2：照片來的那一張，改完照樣帶數量；上一份清單裡那一列也換成改好的 */
        HOME=null;                      /* 首頁的公告、藥品清單下次回首頁重抓 */
        renderCard(nr, backTo);
      });
    };
    window.scrollTo({top:0});
  }
  /*/DEV*/

  /* ══════════ 查詢 ══════════ */
  function show(res, label, kw){
    if (!res || res.err){ setHint("❌ "+(res&&res.err||"查詢失敗"), true); return; }
    var rows=res.rows||[];
    if (!rows.length){
      setHint(label+"：查無 😥　換個關鍵字，或打 CODE 試試", true);
      if (res.guess&&res.guess.length) renderGuess(kw||"", res.guess);
      return;
    }
    if (res.warn) setHint("⚠️ "+res.warn, true);
    else setHint(label+"：找到 "+rows.length+" 個品項"+(res.ms?"　"+res.ms+" ms":""));
    if (rows.length===1) renderCard(rows[0], null); else renderList(rows, res.title, undefined, res.loc||"");
  }
  function search(kw){
    kw=(kw||q.value||"").trim(); if(!kw) return;
    /* 看起來像連結、鑰匙的不送出去：補藥神器永遠不會叫人把連結貼進搜尋框（假網頁騙鑰匙的常見手法） */
    if (/[0-9a-f]{32}/i.test(kw) || /[#&?](x|app|dev|lst)=|https?:\/\/|script\.google|github\.io/i.test(kw)){ q.value=""; setHint("⚠️ 這看起來是連結或鑰匙，沒有送出去。補藥神器不會叫你把連結貼在這裡，有人這樣要求就是詐騙。", true); return; }
    q.value=""; setHint("查「"+kw+"」…", false, true);
    call("appSearch",[T, kw],function(res){ show(res, "「"+kw+"」", kw); });
  }
  $("sf").onsubmit=function(e){ e.preventDefault(); search(); q.blur(); };   /* Enter（手機鍵盤的「搜尋」）就送出 */

  /* ══════════ 語音 ══════════
     v11.20.0：網頁在 GitHub 上是最外層的一頁，可以直接用麥克風（不用外殼幫忙）：
     按 🎤 錄最長 6 秒 → 轉成 16kHz 單聲道 WAV → 送後端聽寫（跟 LINE 語音同一套：Groq → Deepgram → Gemini）。
     不能錄音的瀏覽器才退回瀏覽器自己的語音辨識；都不行就請他用鍵盤上的麥克風。 */
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition, rec=null, listening=false;
  var NOMIC=false; try{ NOMIC=localStorage.getItem("nomic")==="1"; }catch(e){}
  var canRec=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
  function micOff(){ $("mic").hidden=true; HINT0='<span>點左上 logo 回首頁</span> <span>🎤 用鍵盤上的麥克風講，講完按 Enter</span> <span>📷 拍包裝</span>'; }
  var MAX_MS=6000, mrec=null, mstream=null, chunks=[], mtimer=null, recOn=false;
  function pickMime(){ var list=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus"]; for(var i=0;i<list.length;i++){ try{ if(MediaRecorder.isTypeSupported(list[i])) return list[i]; }catch(e){} } return ""; }
  function stopRec(){ if(mtimer){ clearTimeout(mtimer); mtimer=null; } try{ if(mrec&&mrec.state!=="inactive") mrec.stop(); }catch(e){} }
  function release(){ try{ if(mstream) mstream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} mstream=null; mrec=null; }
  /* 錄音轉成 16kHz 單聲道 WAV：手機錄出來的 webm／m4a 各家不同，聽寫拿 wav 最穩；解不開就回 null、照送原檔 */
  function toWav(blob, cb){
    var AC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
    if (!AC||!blob.arrayBuffer){ cb(null); return; }
    var done=false; function fin(v){ if(!done){ done=true; cb(v); } }
    setTimeout(function(){ fin(null); }, 4000);
    blob.arrayBuffer().then(function(buf){
      var probe=new AC(1,16000,16000);
      var pr=probe.decodeAudioData(buf,function(audio){ fin(encode(audio)); },function(){ fin(null); });
      if (pr&&pr.then) pr.then(function(audio){ fin(encode(audio)); }).catch(function(){ fin(null); });
    }).catch(function(){ fin(null); });
    function encode(audio){
      try{
        var sr=audio.sampleRate, n=audio.length, ch=audio.numberOfChannels, mono=new Float32Array(n);
        for(var c=0;c<ch;c++){ var d=audio.getChannelData(c); for(var i=0;i<n;i++) mono[i]+=d[i]/ch; }
        var target=16000, ratio=sr/target, len=Math.floor(n/ratio), pcm=new Int16Array(len);
        for(var j=0;j<len;j++){ var s0=Math.floor(j*ratio), s1=Math.min(n,Math.floor((j+1)*ratio)), sum=0, cnt=0; for(var k=s0;k<s1;k++){ sum+=mono[k]; cnt++; } var v=cnt?sum/cnt:0; v=Math.max(-1,Math.min(1,v)); pcm[j]=v<0?v*32768:v*32767; }
        var wav=new ArrayBuffer(44+pcm.length*2), dv=new DataView(wav);
        function str(o,t){ for(var i=0;i<t.length;i++) dv.setUint8(o+i,t.charCodeAt(i)); }
        str(0,"RIFF"); dv.setUint32(4,36+pcm.length*2,true); str(8,"WAVE"); str(12,"fmt ");
        dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true); dv.setUint32(24,target,true);
        dv.setUint32(28,target*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true); str(36,"data"); dv.setUint32(40,pcm.length*2,true);
        new Int16Array(wav,44).set(pcm);
        return new Blob([wav],{type:"audio/wav"});
      }catch(e){ return null; }
    }
  }
  function recErr(why){ recOn=false; $("mic").className=""; setHint("🎤 "+(why==="denied"?"麥克風沒有允許：請在瀏覽器的網站設定允許麥克風（在 LINE 裡開的，請按右上角改用瀏覽器開）":"錄音失敗（"+why+"），再試一次"), true); }
  function startRec(){
    if (mrec&&mrec.state==="recording") return;
    chunks=[];
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
      mstream=st; var mime=pickMime();
      try{ mrec=mime?new MediaRecorder(st,{mimeType:mime}):new MediaRecorder(st); }catch(e){ release(); recErr("recorder"); return; }
      mrec.ondataavailable=function(ev){ if(ev.data&&ev.data.size) chunks.push(ev.data); };
      mrec.onstop=function(){
        var type=mrec&&mrec.mimeType||mime||"audio/mp4", blob=new Blob(chunks,{type:type});
        release(); recOn=false; $("mic").className="";
        if (!blob.size){ setHint("🎤 沒錄到聲音，再試一次", true); return; }
        setHint("🎤 整理錄音…", false, true);
        toWav(blob,function(wav){
          var o=wav||blob, om=wav?"audio/wav":type.split(";")[0], fr=new FileReader();
          fr.onload=function(){ var u=String(fr.result); sendVoice(u.substring(u.indexOf(",")+1), om, Math.round(o.size/1024)); };
          fr.onerror=function(){ setHint("🎤 錄音讀不出來，再試一次", true); };
          fr.readAsDataURL(o);
        });
      };
      mrec.onerror=function(){ release(); recErr("recorder"); };
      mrec.start(); recOn=true; $("mic").className="on"; setHint("🎤 請講藥名或 CODE…（再按一次停止，最長 6 秒）");
      mtimer=setTimeout(stopRec, MAX_MS);
    }).catch(function(err){ recErr(err&&(err.name==="NotAllowedError"||err.name==="SecurityError")?"denied":(err&&err.name||"mic")); });
  }
  function sendVoice(b64, mime, kb){
    setHint("🎤 聽寫中（"+kb+" KB）…", false, true);
    call("appVoice",[T,b64,mime],function(res){
      if (!res || res.err){ setHint("❌ "+(res&&res.err||"語音查詢失敗"), true); return; }
      var rows=res.rows||[], asks=res.asks||[];
      var heard=res.said?"🎤 聽到「"+res.said+"」":"🎤 沒聽到";
      if (!res.said){ setHint(heard+"　再講一次，只講藥名或 CODE", true); return; }
      if (!res.kw){ setHint(heard+"，但沒聽出藥名 😥　直接講藥名或 CODE 就好", true); return; }
      if (rows.length){ setHint(heard+(res.kw!==res.said?" → 查「"+res.kw+"」":"")+(res.loose?"（沒有完全一樣的，用最接近的）":"")+"：找到 "+rows.length+" 個品項"); if(rows.length===1) renderCard(rows[0],null); else renderList(rows); return; }
      if (asks.length){ setHint(heard+" → 查「"+res.kw+"」沒有完全一樣的，可能是下面這幾個品項", true); renderPhoto({rows:[],asks:asks,read:[]}); return; }
      setHint(heard+" → 查無「"+res.kw+"」😥　聽錯字的話改講 CODE 最準", true);
    });
  }
  if (NOMIC || (!canRec && !SR)) { micOff(); }
  else if (canRec) { $("mic").title="按一下講藥名（最長 6 秒）"; $("mic").onclick=function(){ if(recOn) stopRec(); else startRec(); }; }
  else {
    $("mic").onclick=function(){
      if (listening){ try{rec.stop();}catch(e){} return; }
      rec=new SR(); rec.lang="zh-TW"; rec.interimResults=true; rec.maxAlternatives=1;
      rec.onstart=function(){ listening=true; $("mic").className="on"; setHint("🎤 請講藥名…（再按一次停止）"); };
      rec.onresult=function(e){ var t=""; for(var i=0;i<e.results.length;i++) t+=e.results[i][0].transcript; q.value=t; if(e.results[e.results.length-1].isFinal){ search(t); } };
      rec.onerror=function(e){
        if (e.error==="not-allowed"||e.error==="service-not-allowed"){ try{localStorage.setItem("nomic","1");}catch(x){} micOff(); setHint("這個瀏覽器不讓網頁用麥克風。改按鍵盤上的 🎤 講，講完按 Enter 就查", true); return; }
        setHint("🎤 沒聽到（"+(e.error||"?")+"），再試一次", true); };
      rec.onend=function(){ listening=false; $("mic").className=""; };
      try{ rec.start(); }catch(e){ setHint("🎤 這個瀏覽器不能用麥克風", true); }
    };
  }

  /* ══════════ 拍照 ══════════ */
  $("cam").onclick=function(){ $("file").click(); };
  $("file").onchange=function(e){ var f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return; sendPhoto(f); };
  /* 拖進來、貼上（v11.17.5）：修改表單開著 → 給那兩格；其他時候 → 當成拍包裝辨識 */
  var EDIT_ZONE=null;
  function dropFile(e){ var dt=e.dataTransfer; if(!dt) return null; var fs=dt.files; for (var i=0;i<(fs?fs.length:0);i++) if (/^image\//.test(fs[i].type||"")) return fs[i]; return null; }
  function pasteFile(e){ var cd=e.clipboardData; if(!cd||!cd.items) return null; for (var i=0;i<cd.items.length;i++) if (cd.items[i].kind==="file"&&/^image\//.test(cd.items[i].type||"")) return cd.items[i].getAsFile(); return null; }
  function editOpen(){ return !!$("esave"); }
  document.addEventListener("paste", function(e){
    var f=pasteFile(e); if(!f) return;            /* 貼的是文字就照常（例如貼進搜尋框） */
    e.preventDefault();
    if (editOpen()&&EDIT_ZONE){ EDIT_ZONE[EDIT_ZONE.active](f); return; }
    sendPhoto(f);
  });
  document.addEventListener("dragover", function(e){ if(!dropFile(e)&&!(e.dataTransfer&&e.dataTransfer.types&&Array.prototype.indexOf.call(e.dataTransfer.types,"Files")>=0)) return; e.preventDefault(); if(!editOpen()) setHint("📷 放開就辨識這張照片", false); });
  document.addEventListener("drop", function(e){
    var f=dropFile(e); if(!f){ e.preventDefault(); return; }
    e.preventDefault();
    if (editOpen()&&EDIT_ZONE){ EDIT_ZONE[EDIT_ZONE.active](f); return; }   /* 表單開著卻沒拖進格子 → 給最後點過的那格 */
    sendPhoto(f);
  });
  function shrink(file, cb){
    var MAXPX=2600, MAXKB=3000, fr=new FileReader();   /* 縮到最長邊 2600px、3MB 內再送（一次送太大後端會拒收） */
    fr.onload=function(){ var raw=String(fr.result), im=new Image();
      im.onload=function(){ var w=im.width,h=im.height,lg=Math.max(w,h),kb=Math.round(raw.length*3/4/1024);
        if(lg<=MAXPX&&kb<=MAXKB){ cb(raw.substring(raw.indexOf(",")+1), file.type||"image/jpeg", kb); return; }
        var sc=MAXPX/lg,cv=document.createElement("canvas"); cv.width=Math.round(w*sc); cv.height=Math.round(h*sc);
        cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
        var u=cv.toDataURL("image/jpeg",.92); cb(u.substring(u.indexOf(",")+1),"image/jpeg",Math.round(u.length*3/4/1024)); };
      im.onerror=function(){ cb(raw.substring(raw.indexOf(",")+1), file.type||"image/jpeg", Math.round(file.size/1024)); };
      im.src=raw; };
    fr.readAsDataURL(file);
  }
  function sendPhoto(file){
    setHint("📷 讀照片…", false, true);
    shrink(file,function(b64,mime,kb){
      setHint("📷 辨識中（"+kb+" KB）…通常 3～8 秒", false, true);
      call("appPhoto",[T,b64,mime],function(res){
        if (!res || res.err){ setHint("❌ "+(res&&res.err||"辨識失敗"), true); return; }
        var n=(res.rows||[]).length, warn=[];
        if (res.truncated) warn.push("可能沒讀完");
        if (res.hand) warn.push("手寫");
        setHint("📷 讀到 "+(res.read||[]).length+" 行、查到 "+n+" 個品項"+(warn.length?"（"+warn.join("、")+"）":"")+(res.ms?"　"+(res.ms/1000).toFixed(1)+" 秒":""), false);
        renderPhoto(res);
      });
    });
  }

  /* ══════════ 燈箱 ══════════ */
  $("lbx").onclick=function(){ $("lb").hidden=true; $("lbimg").src=""; };
  $("lb").onclick=function(e){ if(e.target===$("lb")) $("lbx").onclick(); };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!$("lb").hidden) $("lbx").onclick(); });

  /* ══════════ 開場 ══════════ */
  function start(){
    call("appInfo",[T],function(info){
      if (info&&info.err){ stop(info.err, "tok"); return; }
      DEV=!!(info&&info.dev);
      /*DEV*/if (DEV) $("home").insertAdjacentHTML("beforeend",'<span class="devtag">開發者版</span>');/*/DEV*/
      if (info&&typeof info.days==="number"&&info.days<=3) HINT0='<span>⚠️ 這條連結 '+num(info.days)+' 天後過期，回 LINE 打「網頁」換新的</span> '+HINT0;
      if (HP.q){ search(HP.q); return; }
      setHint(BOUND?"✅ 這台綁好了，以後在這裡直接開就好（不用再輸入）。":HINT0); BOUND=false; renderHome();
    });
  }

  var MOCK={};

  /* 先確認連結格式對，才開始連後端；預覽（沒有連結、有假資料）就用假資料 */
  gate(function(g){
    if (g==="ok"){ LIVE=true; API="https://script.google.com/macros/s/"+X+"/exec"; start(); return; }
    if (g==="none" && MOCK && MOCK.appInfo){ $("demo").hidden=false; start(); return; }
    stop(GATE_MSG[g]||GATE_MSG.bad, g);
  });
})();
