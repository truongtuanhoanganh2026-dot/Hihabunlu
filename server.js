const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 2e4 });

const HTML = "<!DOCTYPE html>\n<html lang=\"vi\"><head><meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no\">\n<title>Phòng Chat TikTok</title>\n<style>\n:root{--bg:#0b0b10;--p:#16161f;--ink:#fff;--mut:#9a9aab;--line:#2b2b38;--pink:#fe2c55;--cyan:#25f4ee}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%;margin:0;overflow:hidden}\nbody{background:var(--bg);color:var(--ink);font:15px/1.4 system-ui,-apple-system,\"Segoe UI\",sans-serif;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}\nbutton,input{font:inherit;color:inherit}\nbutton{background:#ffffff14;border:1px solid var(--line);border-radius:12px;padding:9px 12px;cursor:pointer}\ninput{background:#ffffff10;border:1px solid var(--line);border-radius:14px;padding:12px 14px;outline:0;min-width:0}\n.hide{display:none!important}\n#home{height:100%;display:flex;flex-direction:column;justify-content:center;padding:24px;max-width:480px;margin:auto;text-align:center}\n.logo{font-size:44px;font-weight:900;letter-spacing:-2px;text-shadow:3px 3px 0 var(--pink),-3px -3px 0 var(--cyan)}\n#home p{color:var(--mut)}\n.row{display:flex;gap:8px;margin-top:10px}.row input{flex:1}\n.go{background:linear-gradient(135deg,var(--pink),#ff6b8a);border:0;font-weight:800}\n#room{height:100%;display:flex;flex-direction:column;max-width:560px;margin:auto;position:relative}\n#bar{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--p);border-bottom:1px solid var(--line)}\n#bar b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.pill{background:#ffffff14;border-radius:20px;padding:4px 10px;font-size:13px}\n#stage{flex:1;min-height:0;position:relative;overflow:auto;background:#000}\n#emb{padding:6px;display:flex;justify-content:center}\n#emb blockquote{margin:0!important}\n#fallback{padding:10px;text-align:center;color:var(--mut);font-size:13px}\n#fallback a{color:var(--cyan)}\n#chat{position:absolute;left:0;bottom:0;width:78%;max-height:44%;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:none;padding:8px;gap:5px;overflow:hidden;\n -webkit-mask-image:linear-gradient(transparent,#000 28%);mask-image:linear-gradient(transparent,#000 28%)}\n.m{align-self:flex-start;max-width:100%;padding:5px 11px;border-radius:16px;background:#000a;font-size:14px;overflow-wrap:anywhere;animation:in .25s}\n.m b{margin-right:6px;font-weight:700}\n.m.hl{background:linear-gradient(135deg,#ffb23d,#fe2c55);color:#fff;font-weight:600;box-shadow:0 0 14px #fe2c5599;font-size:15px}\n.m.hl b{color:#fff}\n.m.pin{background:linear-gradient(135deg,#7c5cff,#25f4ee);color:#06121a;font-weight:700;font-size:15px}\n.m.sys{background:none;color:var(--mut);font-size:12px;padding:0 4px}\n@keyframes in{from{opacity:0;transform:translateY(10px)}}\n#pinb{position:absolute;left:8px;right:8px;top:8px;z-index:3;border-radius:14px;padding:8px 12px;background:linear-gradient(135deg,#7c5cff,#25f4ee);color:#06121a;font-weight:700;overflow:hidden}\n#pinb i{position:absolute;left:0;bottom:0;height:3px;background:#06121a99;width:100%}\n#hearts{position:absolute;right:8px;bottom:0;width:60px;height:60%;pointer-events:none;overflow:hidden}\n.h{position:absolute;bottom:0;font-size:26px;animation:fl 2.2s ease-out forwards}\n@keyframes fl{to{transform:translate(var(--dx),-300px) scale(1.4);opacity:0}}\n#comp{background:var(--p);border-top:1px solid var(--line);padding:8px 10px}\n.tiers{display:flex;gap:6px;margin-bottom:8px}\n.tiers button{flex:1;font-size:12.5px;padding:7px 4px;position:relative}\n.tiers button.on{border-color:transparent;font-weight:800}\n.tiers button[data-t=normal].on{background:#ffffff33}\n.tiers button[data-t=hl].on{background:linear-gradient(135deg,#ffb23d,#fe2c55)}\n.tiers button[data-t=pin].on{background:linear-gradient(135deg,#7c5cff,#25f4ee);color:#06121a}\n.tiers button:disabled{opacity:.45}\n.cmp{display:flex;gap:8px}.cmp input{flex:1}\n#like{background:none;border:0;font-size:28px;padding:0 4px}\n#err{color:#ff8da1;font-size:12px;min-height:16px;margin-top:4px}\n</style></head><body>\n<div id=\"home\">\n <div class=\"logo\">Live Chat</div><p>Nhập tên TikTok (ID) để vào phòng chat của người đó cùng mọi người.</p>\n <div class=\"row\"><input id=\"uid\" placeholder=\"@tên_tiktok\" autocapitalize=\"none\" autocomplete=\"off\"></div>\n <div class=\"row\"><input id=\"nick\" placeholder=\"Biệt danh của bạn\" maxlength=\"16\"></div>\n <div class=\"row\"><button class=\"go\" id=\"enter\" style=\"flex:1;padding:14px\">Vào phòng</button></div>\n <p style=\"font-size:12px;margin-top:18px\">Mỗi ID có một phòng chat riêng trong ứng dụng này. Đây không phải chat LIVE chính thức của TikTok.</p>\n</div>\n<div id=\"room\" class=\"hide\">\n <div id=\"bar\"><button id=\"back\">←</button><b id=\"rid\"></b><span class=\"pill\">👁 <span id=\"vw\">1</span></span><span class=\"pill\">❤ <span id=\"lk\">0</span></span></div>\n <div id=\"stage\">\n  <div id=\"emb\"></div>\n  <div id=\"fallback\"></div>\n  <div id=\"pinb\" class=\"hide\"><span id=\"pint\"></span><i id=\"pini\"></i></div>\n  <div id=\"chat\"></div><div id=\"hearts\"></div>\n </div>\n <div id=\"comp\">\n  <div class=\"tiers\"><button data-t=\"normal\" class=\"on\">💬 Thường</button><button data-t=\"hl\" data-n=\"Nổi bật\" data-s=\"20\">✨ Nổi bật</button><button data-t=\"pin\" data-n=\"Ghim\" data-s=\"90\">📌 Ghim 30s</button></div>\n  <div class=\"cmp\"><input id=\"txt\" placeholder=\"Nhắn tin cho cả phòng…\" maxlength=\"150\" autocomplete=\"off\"><button id=\"send\" class=\"go\">Gửi</button><button id=\"like\">❤️</button></div>\n  <div id=\"err\"></div>\n </div>\n</div>\n<script src=\"/socket.io/socket.io.js\"></script>\n<script>\nconst $=s=>document.querySelector(s);\nlet sock,room='',tier='normal',cd={hl:0,pin:0},pinEnd=0,pinTimer=0;\n$('#nick').value=localStorage.getItem('tkn')||'';\nconst norm=s=>String(s||'').toLowerCase().replace(/^@/,'').replace(/[^a-z0-9._]/g,'').slice(0,24);\nconst hue=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return`hsl(${h} 85% 72%)`};\nfunction enter(id){\n  id=norm(id);if(!id)return;room=id;localStorage.setItem('tkn',$('#nick').value.trim());location.hash=id;\n  $('#home').classList.add('hide');$('#room').classList.remove('hide');$('#rid').textContent='@'+id;$('#chat').innerHTML='';\n  embed(id);\n  if(!sock){sock=io();\n    sock.on('hist',d=>{$('#chat').innerHTML='';d.msgs.forEach(add);sys('Bạn đã vào phòng @'+room);vw(d.viewers);$('#lk').textContent=d.likes;pin(d.pin)});\n    sock.on('msg',add);sock.on('pin',pin);sock.on('viewers',vw);\n    sock.on('like',d=>{$('#lk').textContent=d.total;for(let i=0;i<Math.min(d.n,3);i++)heart()});\n    sock.on('connect',()=>room&&sock.emit('join',{room,name:$('#nick').value.trim()}));\n    sock.on('connect_error',()=>sys('Mất kết nối, đang thử lại…'))}\n  else sock.emit('join',{room,name:$('#nick').value.trim()});\n}\nfunction embed(id){\n  $('#emb').innerHTML=`<blockquote class=\"tiktok-embed\" cite=\"https://www.tiktok.com/@${id}\" data-unique-id=\"${id}\" data-embed-type=\"creator\" style=\"max-width:780px;min-width:288px\"><section><a target=\"_blank\" rel=\"noopener\" href=\"https://www.tiktok.com/@${id}?refer=creator_embed\">@${id}</a></section></blockquote>`;\n  $('#fallback').innerHTML=`Không hiện trang? <a target=\"_blank\" rel=\"noopener\" href=\"https://www.tiktok.com/@${id}\">Mở @${id} trên TikTok</a> · <a target=\"_blank\" rel=\"noopener\" href=\"https://www.tiktok.com/@${id}/live\">📺 Xem LIVE</a>`;\n  const o=document.getElementById('tkjs');if(o)o.remove();const s=document.createElement('script');s.id='tkjs';s.async=true;s.src='https://www.tiktok.com/embed.js';document.body.appendChild(s)}\nfunction add(m){const c=$('#chat'),d=document.createElement('div');d.className='m '+(m.tier==='normal'?'':m.tier);\n  const b=document.createElement('b');b.textContent=m.name;if(m.tier==='normal')b.style.color=hue(m.name);d.appendChild(b);d.appendChild(document.createTextNode(m.text));c.appendChild(d);while(c.children.length>40)c.firstChild.remove()}\nfunction sys(t){const d=document.createElement('div');d.className='m sys';d.textContent=t;$('#chat').appendChild(d)}\nfunction vw(n){$('#vw').textContent=n}\nfunction pin(p){clearInterval(pinTimer);const b=$('#pinb');if(!p||p.until<=Date.now()){b.classList.add('hide');return}\n  b.classList.remove('hide');$('#pint').textContent='📌 '+p.name+': '+p.text;const tot=p.until-Date.now();\n  pinTimer=setInterval(()=>{const l=p.until-Date.now();if(l<=0){b.classList.add('hide');clearInterval(pinTimer)}else $('#pini').style.width=l/tot*100+'%'},200)}\nfunction heart(){const h=document.createElement('div');h.className='h';h.textContent=['❤️','💖','💗','🧡','💜'][Math.random()*5|0];h.style.left=Math.random()*30+'px';h.style.setProperty('--dx',(Math.random()*40-20)+'px');$('#hearts').appendChild(h);setTimeout(()=>h.remove(),2300)}\n/* ---- gửi tin ---- */\ndocument.querySelectorAll('.tiers button').forEach(b=>b.onclick=()=>{if(b.disabled)return;tier=b.dataset.t;document.querySelectorAll('.tiers button').forEach(x=>x.classList.toggle('on',x===b))});\nfunction send(){const t=$('#txt').value.trim();if(!t||!room)return;$('#err').textContent='';\n  sock.emit('msg',{text:t,tier},r=>{if(!r)return;if(r.ok){$('#txt').value='';if(r.cd)cd[tier]=Date.now()+r.cd}else{$('#err').textContent=r.err||'Không gửi được.';if(r.wait)cd[tier]=Date.now()+r.wait}})}\n$('#send').onclick=send;$('#txt').onkeydown=e=>e.key==='Enter'&&send();\nlet lt=0;$('#like').onclick=()=>{const n=Date.now();if(n-lt<120)return;lt=n;heart();sock&&sock.emit('like')};\nsetInterval(()=>{document.querySelectorAll('.tiers button[data-n]').forEach(b=>{const l=cd[b.dataset.t]-Date.now();b.disabled=l>0;b.textContent=l>0?`⏳ ${Math.ceil(l/1000)}s`:(b.dataset.t==='hl'?'✨ Nổi bật':'📌 Ghim 30s');if(l>0&&tier===b.dataset.t){tier='normal';document.querySelector('.tiers [data-t=normal]').classList.add('on');b.classList.remove('on')}})},500);\n/* ---- điều hướng ---- */\n$('#enter').onclick=()=>enter($('#uid').value);$('#uid').onkeydown=e=>e.key==='Enter'&&enter($('#uid').value);\n$('#back').onclick=()=>{sock&&sock.emit('leave');room='';location.hash='';$('#room').classList.add('hide');$('#home').classList.remove('hide');$('#emb').innerHTML=''};\nif(location.hash.length>1){$('#uid').value=location.hash.slice(1)}\n</script></body></html>\n";
app.get('/', (req, res) => res.type('html').send(HTML));
app.get('/health', (req, res) => res.send('ok'));

// Mức nhắn: thường (nhanh), nổi bật (hồi chiêu 20s), ghim (hồi chiêu 90s, hiện 30s trên đầu phòng)
const TIERS = { normal: { cd: 2000, max: 150 }, hl: { cd: 20000, max: 120 }, pin: { cd: 90000, max: 100 } };
const PIN_MS = 30000;
const rooms = new Map(); // id -> { msgs, pin, likes }

const norm = (s) => String(s || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9._]/g, '').slice(0, 24);
const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
const getRoom = (id) => { if (!rooms.has(id)) rooms.set(id, { msgs: [], pin: null, likes: 0 }); return rooms.get(id); };
const viewers = (id) => (io.sockets.adapter.rooms.get('r:' + id) || { size: 0 }).size;

function leave(s) {
  if (!s.room) return;
  const id = s.room; s.leave('r:' + id); s.room = null;
  io.to('r:' + id).emit('viewers', viewers(id));
  if (!viewers(id)) setTimeout(() => { if (!viewers(id)) rooms.delete(id); }, 10 * 60 * 1000); // giữ phòng 10 phút sau khi vắng
}

io.on('connection', (s) => {
  s.cd = { hl: 0, pin: 0 }; s.stamps = []; s.likeT = 0;

  s.on('join', (p) => {
    const id = norm(p && p.room); if (!id) return;
    leave(s);
    s.room = id; s.join('r:' + id);
    s.nick = clean(p.name, 16) || 'Khách' + (100 + Math.floor(Math.random() * 900));
    const r = getRoom(id);
    if (r.pin && r.pin.until <= Date.now()) r.pin = null;
    s.emit('hist', { msgs: r.msgs.slice(-30), pin: r.pin, viewers: viewers(id), likes: r.likes });
    io.to('r:' + id).emit('viewers', viewers(id));
  });

  s.on('msg', (p, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    if (!s.room || !p) return reply({ ok: false, err: 'Chưa vào phòng.' });
    const tier = TIERS[p.tier] ? p.tier : 'normal', T = TIERS[tier], now = Date.now();
    s.stamps = s.stamps.filter((t) => t > now - 6000);
    if (s.stamps.length >= 5) return reply({ ok: false, err: 'Bạn nhắn nhanh quá, chậm lại chút nhé.' });
    if (tier !== 'normal' && s.cd[tier] > now) return reply({ ok: false, err: 'Mức này đang hồi chiêu.', wait: s.cd[tier] - now });
    if (tier === 'normal' && s.stamps.length && now - s.stamps[s.stamps.length - 1] < 800) return reply({ ok: false, err: 'Đợi một chút nhé.' });
    const text = clean(p.text, T.max);
    if (!text) return reply({ ok: false, err: 'Tin nhắn trống.' });
    s.stamps.push(now);
    if (tier !== 'normal') s.cd[tier] = now + T.cd;
    const m = { id: now + '-' + Math.random().toString(36).slice(2, 6), name: s.nick, text, tier, t: now };
    const r = getRoom(s.room);
    r.msgs.push(m); if (r.msgs.length > 60) r.msgs.shift();
    io.to('r:' + s.room).emit('msg', m);
    if (tier === 'pin') {
      r.pin = { ...m, until: now + PIN_MS };
      io.to('r:' + s.room).emit('pin', r.pin);
      const id = s.room, pid = m.id;
      setTimeout(() => { const rr = rooms.get(id); if (rr && rr.pin && rr.pin.id === pid) { rr.pin = null; io.to('r:' + id).emit('pin', null); } }, PIN_MS);
    }
    reply({ ok: true, cd: tier === 'normal' ? 0 : T.cd });
  });

  s.on('like', () => {
    if (!s.room) return;
    const now = Date.now(); if (now - s.likeT < 100) return; s.likeT = now;
    const r = getRoom(s.room); r.likes++;
    io.to('r:' + s.room).except(s.id).emit('like', { n: 1, total: r.likes });
    s.emit('like', { n: 0, total: r.likes });
  });

  s.on('leave', () => leave(s));
  s.on('disconnect', () => leave(s));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Live Chat chạy tại cổng ' + PORT));
