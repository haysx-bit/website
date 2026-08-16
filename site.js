/* Footer year */
const yearEl = document.getElementById("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================================================
   Shared ambient background: starfield + slow drifting
   circuit shapes. One canvas, one scene, so nothing on the
   page reads as a layer pasted on top of another.
   ========================================================= */
(function(){
  const canvas = document.getElementById("stars");
  if(!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];
  let shapes = [];

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const starCount = Math.round((canvas.width * canvas.height) / 9000);
    stars = Array.from({length: starCount}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() < 0.85 ? Math.random() * 0.7 + 0.3 : 1.1,
      speed: Math.random() * 0.02 + 0.004,
      alpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2
    }));

    const shapeCount = Math.max(4, Math.round((canvas.width * canvas.height) / 260000));
    shapes = Array.from({length: shapeCount}, () => makeShape());
  }

  function makeShape(){
    const types = ["triangle","ring","node"];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      type,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 90 + 50,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.00012,
      dx: (Math.random() - 0.5) * 0.010,
      dy: (Math.random() - 0.5) * 0.006,
      alpha: Math.random() * 0.05 + 0.035
    };
  }

  function drawTriangle(s){
    const h = s.size;
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.6);
    ctx.lineTo(-h * 0.55, h * 0.4);
    ctx.lineTo(h * 0.55, h * 0.4);
    ctx.closePath();
    ctx.stroke();
  }

  function drawRing(s){
    ctx.beginPath();
    ctx.arc(0, 0, s.size * 0.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawNode(s){
    const r = s.size * 0.5;
    ctx.beginPath();
    ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
    ctx.moveTo(0, -r); ctx.lineTo(0, r);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShapes(dt){
    ctx.save();
    ctx.strokeStyle = "rgba(191,232,255,1)";
    ctx.fillStyle = "rgba(191,232,255,1)";
    ctx.lineWidth = 1;

    for(const s of shapes){
      if(!reduceMotion){
        s.x += s.dx * dt;
        s.y += s.dy * dt;
        s.rot += s.rotSpeed * dt;

        const pad = s.size;
        if(s.x < -pad) s.x = canvas.width + pad;
        if(s.x > canvas.width + pad) s.x = -pad;
        if(s.y < -pad) s.y = canvas.height + pad;
        if(s.y > canvas.height + pad) s.y = -pad;
      }

      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      if(s.type === "triangle") drawTriangle(s);
      else if(s.type === "ring") drawRing(s);
      else drawNode(s);
      ctx.restore();
    }
    ctx.restore();
  }

  let last = null;

  function draw(time){
    if(last === null) last = time;
    const dt = time - last;
    last = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawShapes(dt);

    for(const s of stars){
      const y = reduceMotion ? s.y : (s.y + time * s.speed * 0.25) % canvas.height;
      const twinkle = reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(time * 0.0015 + s.phase);
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = "#eaf6ff";
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if(!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();
