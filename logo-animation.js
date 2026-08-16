/* =========================================================
   HAYSX — animated circuit logo (hero)
   Loops forever: circuit trace -> core fill -> wordmark
   reveal -> hold -> fade to black -> repeat, seamlessly.
   ========================================================= */
(function(){

const canvas = document.getElementById("haysx");
if(!canvas) return;

const screenCtx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

/* Offscreen buffer everything is drawn to, so the whole
   composited frame can be faded to black for a seamless loop. */
const bufferCanvas = document.createElement("canvas");
bufferCanvas.width = W;
bufferCanvas.height = H;
const ctx = bufferCanvas.getContext("2d");

const logo = new Image();
logo.src = "logo.png";

const OUTER = [[311,99],[196,294],[425,294],[311,99]];
const INNER = [[311,158],[263,276],[369,276],[311,158]];
const CORE  = [[273,207],[311,158],[369,239],[334,276],[273,207]];

function pathLengths(path){
  const lengths=[]; let total=0;
  for(let i=1;i<path.length;i++){
    const dx=path[i][0]-path[i-1][0], dy=path[i][1]-path[i-1][1];
    const len=Math.hypot(dx,dy);
    lengths.push(len); total+=len;
  }
  return {lengths,total};
}

function pointOnPath(path,t){
  t=Math.max(0,Math.min(1,t));
  const data=pathLengths(path);
  let distance=t*data.total;
  for(let i=1;i<path.length;i++){
    const a=path[i-1], b=path[i], len=data.lengths[i-1];
    if(distance<=len){
      const u=len ? distance/len : 0;
      return [a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u];
    }
    distance-=len;
  }
  return path[path.length-1];
}

function drawFlow(path,progress,width=6){
  const data=pathLengths(path);
  let remaining=Math.max(0,Math.min(1,progress))*data.total;

  ctx.save();
  ctx.lineCap="round"; ctx.lineJoin="round";
  ctx.shadowColor="rgba(170,225,255,1)"; ctx.shadowBlur=30;
  ctx.strokeStyle="rgba(210,242,255,.85)"; ctx.lineWidth=width+8;
  ctx.beginPath();
  for(let i=1;i<path.length;i++){
    if(remaining<=0) break;
    const a=path[i-1], b=path[i], len=data.lengths[i-1];
    const u=Math.min(1,remaining/len);
    ctx.moveTo(a[0],a[1]);
    ctx.lineTo(a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u);
    remaining-=len;
  }
  ctx.stroke();

  remaining=Math.max(0,Math.min(1,progress))*data.total;
  ctx.shadowColor="rgba(255,255,255,1)"; ctx.shadowBlur=12;
  ctx.strokeStyle="rgba(255,255,255,1)"; ctx.lineWidth=width;
  ctx.beginPath();
  for(let i=1;i<path.length;i++){
    if(remaining<=0) break;
    const a=path[i-1], b=path[i], len=data.lengths[i-1];
    const u=Math.min(1,remaining/len);
    ctx.moveTo(a[0],a[1]);
    ctx.lineTo(a[0]+(b[0]-a[0])*u, a[1]+(b[1]-a[1])*u);
    remaining-=len;
  }
  ctx.stroke();
  ctx.restore();
}

function drawOrb(p){
  const x=p[0], y=p[1];
  ctx.save();
  const glow=ctx.createRadialGradient(x,y,0,x,y,75);
  glow.addColorStop(0,"rgba(255,255,255,1)");
  glow.addColorStop(.10,"rgba(235,250,255,.98)");
  glow.addColorStop(.30,"rgba(150,220,255,.65)");
  glow.addColorStop(.60,"rgba(80,170,255,.18)");
  glow.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=glow;
  ctx.beginPath(); ctx.arc(x,y,75,0,Math.PI*2); ctx.fill();

  ctx.shadowColor="#d9f6ff"; ctx.shadowBlur=30;
  ctx.fillStyle="#fff";
  ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2); ctx.fill();

  ctx.shadowBlur=10; ctx.fillStyle="#ffffff";
  ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

const stars=[];
for(let i=0;i<105;i++){
  stars.push({
    x:Math.random()*W, y:Math.random()*H,
    r:Math.random()<.88 ? Math.random()*.7+.25 : 1.0,
    speed:Math.random()*.035+.008,
    alpha:Math.random()*.55+.20,
    phase:Math.random()*Math.PI*2
  });
}

function drawStars(time){
  ctx.save();
  for(const s of stars){
    const x=(s.x + time*s.speed*1.8) % W;
    const y=(s.y + time*s.speed*.45) % H;
    const twinkle=.72+.28*Math.sin(time*.002+s.phase);
    ctx.globalAlpha=s.alpha*twinkle;
    ctx.fillStyle="#ffffff";
    ctx.beginPath(); ctx.arc(x,y,s.r,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function nodeFlash(x,y){
  ctx.save();
  const g=ctx.createRadialGradient(x,y,0,x,y,45);
  g.addColorStop(0,"rgba(255,255,255,.9)");
  g.addColorStop(.18,"rgba(210,240,255,.55)");
  g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g;
  ctx.beginPath(); ctx.arc(x,y,45,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawFinalWordmark(strength){
  if(!window.__haysxWordmarkCanvas){
    const c=document.createElement("canvas");
    c.width=W; c.height=H;
    const m=c.getContext("2d");
    m.drawImage(logo,0,0,W,H);

    const x0=145,y0=335,x1=485,y1=417;
    const ww=x1-x0, hh=y1-y0;
    const pixels=m.getImageData(x0,y0,ww,hh);
    const d=pixels.data;

    for(let i=0;i<d.length;i+=4){
      const r=d[i], g=d[i+1], b=d[i+2];
      const lum=.2126*r+.7152*g+.0722*b;
      let alpha=(lum-55)/125;
      alpha=Math.max(0,Math.min(1,alpha));
      d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=Math.round(alpha*255);
    }
    m.clearRect(0,0,W,H);
    m.putImageData(pixels,x0,y0);
    window.__haysxWordmarkCanvas=c;
  }

  const q=Math.max(0,Math.min(1,strength));
  const wc = window.__haysxWordmarkCanvas;

  ctx.save();
  ctx.globalCompositeOperation="lighter";
  ctx.globalAlpha=.55*q;
  ctx.shadowColor="rgba(190,235,255,1)"; ctx.shadowBlur=22;
  ctx.drawImage(wc,0,0);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation="lighter";
  ctx.globalAlpha=.9*q;
  ctx.shadowColor="rgba(255,255,255,1)"; ctx.shadowBlur=9;
  ctx.drawImage(wc,0,0);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation="source-over";
  ctx.globalAlpha=q;
  ctx.drawImage(wc,0,0);
  ctx.restore();
}

function drawCircuitComet(path, progress){
  const p=Math.max(0,Math.min(1,progress));
  const head=pointOnPath(path,p);
  const backT=Math.max(0,p-.045);
  const tail=pointOnPath(path,backT);
  const dx=head[0]-tail[0], dy=head[1]-tail[1];
  const len=Math.hypot(dx,dy)||1;
  const ux=dx/len, uy=dy/len;

  ctx.save();
  ctx.globalCompositeOperation="screen";
  ctx.lineCap="round";

  ctx.shadowColor="rgba(190,235,255,1)"; ctx.shadowBlur=22;
  ctx.strokeStyle="rgba(205,240,255,.72)"; ctx.lineWidth=9;
  ctx.beginPath(); ctx.moveTo(tail[0],tail[1]); ctx.lineTo(head[0],head[1]); ctx.stroke();

  ctx.shadowBlur=8;
  ctx.strokeStyle="rgba(255,255,255,.98)"; ctx.lineWidth=3;
  ctx.beginPath();
  ctx.moveTo(head[0]-ux*28, head[1]-uy*28);
  ctx.lineTo(head[0],head[1]);
  ctx.stroke();

  for(let i=1;i<=7;i++){
    const tt=Math.max(0,p-i*.014);
    const q=pointOnPath(path,tt);
    const fade=1-i/8;
    const r=.7+(1.8*fade);
    ctx.globalAlpha=.65*fade;
    ctx.fillStyle="#fff";
    ctx.shadowColor="rgba(190,235,255,1)"; ctx.shadowBlur=7;
    ctx.beginPath(); ctx.arc(q[0],q[1],r,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawWordmarkSoftGlow(){
  const wc = window.__haysxWordmarkCanvas;
  if(!wc) return;
  ctx.save();
  ctx.globalCompositeOperation="lighter";
  ctx.globalAlpha=.40;
  ctx.shadowColor="rgba(195,235,255,1)"; ctx.shadowBlur=20;
  ctx.drawImage(wc,0,0);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation="source-over";
  ctx.globalAlpha=1;
  ctx.drawImage(wc,0,0);
  ctx.restore();
}

const HOLD_END = 5.60;
const DURATION = 6.20;
let start = performance.now();

function drawFrame(t){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);

  drawStars(performance.now());

  ctx.save();
  ctx.globalAlpha=.075;
  ctx.drawImage(logo,0,0,W,H);
  ctx.restore();

  let orb;

  if(t<1.35){
    const p=Math.max(0,(t-.10)/1.25);
    drawFlow(OUTER,p,7);
    orb=pointOnPath(OUTER,p);
  }else if(t<2.15){
    const p=(t-1.35)/.80;
    drawFlow(OUTER,1,7); drawFlow(INNER,p,6);
    orb=pointOnPath(INNER,p);
  }else if(t<2.85){
    const p=(t-2.15)/.70;
    drawFlow(OUTER,1,7); drawFlow(INNER,1,6); drawFlow(CORE,p,5);
    orb=pointOnPath(CORE,p);
  }else{
    drawFlow(OUTER,1,7); drawFlow(INNER,1,6); drawFlow(CORE,1,5);
    orb=CORE[CORE.length-1];
  }

  drawOrb(orb);

  if(t < 4.05){
    if(t < 1.35) drawCircuitComet(OUTER, Math.max(0,(t-.10)/1.25));
    else if(t < 2.15) drawCircuitComet(INNER, (t-1.35)/.80);
    else drawCircuitComet(CORE, (t-2.15)/.70);
  }

  const nodes=[[311,99],[196,294],[425,294],[273,207],[369,239],[334,276]];
  for(const n of nodes){
    const d=Math.hypot(orb[0]-n[0],orb[1]-n[1]);
    if(d<18) nodeFlash(n[0],n[1]);
  }

  if(t>=2.78 && t<3.12) drawFinalWordmark(Math.min(1,(t-2.78)/.34));

  if(t>=3.08){
    drawFinalWordmark(1);
    drawWordmarkSoftGlow();
    drawWordmarkSoftGlow();
  }

  if(t>=3.05){
    ctx.save();
    ctx.globalCompositeOperation="screen";
    ctx.globalAlpha=.22;
    ctx.shadowColor="rgba(190,235,255,1)"; ctx.shadowBlur=16;
    ctx.strokeStyle="#fff"; ctx.lineWidth=3;
    ctx.lineCap="round"; ctx.lineJoin="round";
    ctx.beginPath();
    ctx.moveTo(311,99); ctx.lineTo(196,294); ctx.lineTo(425,294); ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

function animate(now){
  const elapsed=(now-start)/1000;
  const t = elapsed % DURATION;

  drawFrame(t);

  let fadeAlpha = 1;
  if(t > HOLD_END){
    fadeAlpha = 1 - Math.min(1,(t-HOLD_END)/(DURATION-HOLD_END));
  }

  screenCtx.clearRect(0,0,W,H);
  screenCtx.fillStyle="#000";
  screenCtx.fillRect(0,0,W,H);
  screenCtx.globalAlpha = fadeAlpha;
  screenCtx.drawImage(bufferCanvas,0,0);
  screenCtx.globalAlpha = 1;

  requestAnimationFrame(animate);
}

logo.onload = () => requestAnimationFrame(animate);

})();
