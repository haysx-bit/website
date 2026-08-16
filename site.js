/* Footer year */
const yearEl = document.getElementById("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

/* Lightweight full-page starfield, drawn once + gentle drift.
   Respects reduced-motion. */
(function(){
  const canvas = document.getElementById("stars");
  if(!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let stars = [];

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.round((canvas.width * canvas.height) / 9000);
    stars = Array.from({length: count}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() < 0.85 ? Math.random() * 0.7 + 0.3 : 1.1,
      speed: Math.random() * 0.02 + 0.004,
      alpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function draw(time){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(const s of stars){
      const y = reduceMotion ? s.y : (s.y + time * s.speed * 0.25) % canvas.height;
      const twinkle = reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(time * 0.0015 + s.phase);
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fillStyle = "#eaf6ff";
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if(!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
})();
