export interface ConfettiOptions {
  intensity?: 'standard' | 'epic' | 'legendary';
  wpm?: number;
}

export function launchConfetti(options?: ConfettiOptions) {
  if (typeof window === 'undefined') return;

  const wpm = options?.wpm ?? 0;
  let intensity = options?.intensity;
  if (!intensity) {
    if (wpm >= 90) intensity = 'legendary';
    else if (wpm >= 70) intensity = 'epic';
    else intensity = 'standard';
  }

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotSpeed: number;
    opacity: number;
    shape: 'rect' | 'circle' | 'star';
    tilt: number;
    tiltSpeed: number;
  }

  // Theme palettes based on rank tier
  let colors: string[];
  let particleCount: number;
  let duration: number;

  if (intensity === 'legendary') {
    // Royal gold, amber, champagne, diamond cyan, warm bronze
    colors = ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#38bdf8', '#ffffff', '#ffd700'];
    particleCount = 180;
    duration = 3800;
  } else if (intensity === 'epic') {
    // Purple, violet, magenta, gold, neon blue
    colors = ['#a855f7', '#c084fc', '#e879f9', '#fbbf24', '#60a5fa', '#ffffff'];
    particleCount = 130;
    duration = 3200;
  } else {
    // Joyful spectrum
    colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#f43f5e', '#eab308'];
    particleCount = 85;
    duration = 2600;
  }

  const particles: Particle[] = [];

  // Emit from bottom corners and center for epic/legendary
  const origins = intensity === 'legendary' || intensity === 'epic'
    ? [
        { x: width * 0.15, y: height * 0.75, angle: -Math.PI / 3, spread: 0.6 },
        { x: width * 0.85, y: height * 0.75, angle: (-2 * Math.PI) / 3, spread: 0.6 },
        { x: width * 0.5, y: height * 0.45, angle: -Math.PI / 2, spread: 1.4 },
      ]
    : [
        { x: width * 0.5, y: height * 0.4, angle: -Math.PI / 2, spread: 1.2 },
      ];

  const particlesPerOrigin = Math.ceil(particleCount / origins.length);

  origins.forEach((origin) => {
    for (let i = 0; i < particlesPerOrigin; i++) {
      const speed = Math.random() * 14 + (intensity === 'legendary' ? 8 : 5);
      const angle = origin.angle + (Math.random() - 0.5) * origin.spread;
      const shapes: Particle['shape'][] = intensity === 'legendary' ? ['rect', 'star', 'circle'] : ['rect', 'circle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      particles.push({
        x: origin.x + (Math.random() * 40 - 20),
        y: origin.y + (Math.random() * 40 - 20),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + (shape === 'star' ? 6 : 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        opacity: 1,
        shape,
        tilt: Math.random() * 10,
        tiltSpeed: Math.random() * 0.15 + 0.05,
      });
    }
  });

  const gravity = intensity === 'legendary' ? 0.32 : 0.38;
  const startTime = Date.now();

  function drawStar(ctx: CanvasRenderingContext2D, size: number) {
    const points = 5;
    const outerRadius = size;
    const innerRadius = size * 0.45;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function animate() {
    if (!ctx) return;
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      if (canvas.parentNode) {
        document.body.removeChild(canvas);
      }
      return;
    }

    ctx.clearRect(0, 0, width, height);

    let activeCount = 0;
    const fadeStart = duration * 0.65;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.vx *= 0.985;
      p.rotation += p.rotSpeed;
      p.tilt += p.tiltSpeed;

      if (elapsed > fadeStart) {
        p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (duration - fadeStart));
      }

      if (p.opacity > 0 && p.y < height + 60) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'star') {
          drawStar(ctx, p.size);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 3D fluttering ribbon rectangle
          const tiltX = Math.sin(p.tilt);
          ctx.fillRect(-p.size / 2, (-p.size * tiltX) / 2, p.size, p.size * 0.6 * Math.abs(tiltX));
        }

        ctx.restore();
      }
    }

    if (activeCount > 0) {
      requestAnimationFrame(animate);
    } else {
      if (canvas.parentNode) {
        document.body.removeChild(canvas);
      }
    }
  }

  requestAnimationFrame(animate);
}
