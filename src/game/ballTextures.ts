import * as THREE from 'three';
import { BallEvolutionId } from '../types/game';

/**
 * Creates ultra-vivid, high-definition (1024x512) procedural canvas textures
 * with realistic lighting, depth, gloss highlights, and detailed surface wraps ("giydirme").
 * Wrapped around THREE.SphereGeometry with MeshPhysicalMaterial, these textures roll,
 * tumble, and catch the sun with genuine 3D realism!
 */
export function createBallTexture(id: BallEvolutionId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const w = canvas.width;
  const h = canvas.height;

  switch (id) {
    case 'NORMAL_CORE': {
      // --- ULTRA CRISP HIGH-CONTRAST RACING 8-BALL ---
      // Deep pitch black background
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);

      // Saturated neon cyan and electric lime dual racing stripes
      const stripeHeight = 28;
      ctx.fillStyle = '#00f0ff'; // Ultra-vivid neon cyan
      ctx.fillRect(0, h * 0.5 - stripeHeight - 6, w, stripeHeight);
      ctx.fillStyle = '#10ff50'; // Ultra-vivid electric lime
      ctx.fillRect(0, h * 0.5 + 6, w, stripeHeight);

      // Clean bright white racing pin-stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, h * 0.5 - stripeHeight - 12, w, 5);
      ctx.fillRect(0, h * 0.5 + stripeHeight + 9, w, 5);

      // Two White Circles with Bold "8" on opposite sides
      const centers = [w * 0.25, w * 0.75];
      for (const cx of centers) {
        const cy = h * 0.5;
        const radius = 98;

        // Outer vibrant yellow-gold accent ring
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();

        // Inner pure white circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Thin sharp black inner rim
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#050508';
        ctx.stroke();

        // Bold deep black "8"
        ctx.fillStyle = '#000000';
        ctx.font = '900 120px "Outfit", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('8', cx, cy + 2);
      }
      break;
    }

    case 'ENERGY_CORE': {
      // --- CHAMPIONS LEAGUE PRO SOCCER BALL ---
      // Brilliant white leather base
      const leatherGrad = ctx.createLinearGradient(0, 0, 0, h);
      leatherGrad.addColorStop(0, '#ffffff');
      leatherGrad.addColorStop(0.5, '#f8fafc');
      leatherGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = leatherGrad;
      ctx.fillRect(0, 0, w, h);

      // Fine leather grain bump simulation
      ctx.fillStyle = 'rgba(0, 0, 0, 0.025)';
      for (let x = 0; x < w; x += 6) {
        for (let y = 0; y < h; y += 6) {
          if ((x * 3 + y * 7) % 5 === 0) {
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // FIFA-style modern pentagons and hexagonal panels
      const patchPositions = [
        { x: w * 0.25, y: h * 0.5, r: 72 },
        { x: w * 0.75, y: h * 0.5, r: 72 },
        { x: w * 0.5, y: h * 0.2, r: 56 },
        { x: w * 0.5, y: h * 0.8, r: 56 },
        { x: 0, y: h * 0.2, r: 56 },
        { x: w, y: h * 0.2, r: 56 },
        { x: 0, y: h * 0.8, r: 56 },
        { x: w, y: h * 0.8, r: 56 }
      ];

      for (const p of patchPositions) {
        // Shaded pentagon patch
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = p.x + Math.cos(angle) * p.r;
          const py = p.y + Math.sin(angle) * p.r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // High-contrast gradient in patch (deep obsidian with electric cyan/lime edge glow)
        const patchGrad = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, p.r);
        patchGrad.addColorStop(0, '#090d16');
        patchGrad.addColorStop(0.7, '#1e293b');
        patchGrad.addColorStop(1, '#06b6d4');
        ctx.fillStyle = patchGrad;
        ctx.fill();

        ctx.lineWidth = 5;
        ctx.strokeStyle = '#0284c7';
        ctx.stroke();

        // Radiating double seam stitching lines
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = p.x + Math.cos(angle) * p.r;
          const py = p.y + Math.sin(angle) * p.r;
          const outerX = p.x + Math.cos(angle) * (p.r + 48);
          const outerY = p.y + Math.sin(angle) * (p.r + 48);

          // Deep seam groove
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(outerX, outerY);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#334155';
          ctx.stroke();

          // Highlight seam edge
          ctx.beginPath();
          ctx.moveTo(px + 1, py + 1);
          ctx.lineTo(outerX + 1, outerY + 1);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        }
      }

      // Golden Trophy emblem stamp in center
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚽ PRO MATCH', w * 0.5, h * 0.5);
      break;
    }

    case 'MAGNETIC_CORE': {
      // --- REALISTIC NBA TOURNAMENT BASKETBALL ---
      // Rich vibrant burnt-orange leather
      const ballGrad = ctx.createLinearGradient(0, 0, 0, h);
      ballGrad.addColorStop(0, '#f97316');
      ballGrad.addColorStop(0.5, '#ea580c');
      ballGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = ballGrad;
      ctx.fillRect(0, 0, w, h);

      // Realistic pebble grain dimple texture
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let x = 0; x < w; x += 5) {
        for (let y = 0; y < h; y += 5) {
          if ((x + y) % 3 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Pebble highlight specular dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      for (let x = 1; x < w; x += 5) {
        for (let y = 1; y < h; y += 5) {
          if ((x + y) % 3 === 0) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      // Recessed black rubber seams with bevel depth
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';

      // 1. Horizontal equator seam
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(w, h * 0.5);
      ctx.stroke();

      // 2. Vertical meridian seams
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 0);
      ctx.lineTo(w * 0.25, h);
      ctx.moveTo(w * 0.75, 0);
      ctx.lineTo(w * 0.75, h);
      ctx.stroke();

      // 3. Hyperbolic curved ribs
      ctx.beginPath();
      ctx.ellipse(w * 0.25, h * 0.5, 90, 180, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(w * 0.75, h * 0.5, 90, 180, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Golden championship insignia stamp
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ OFFICIAL BALL ★', w * 0.25, h * 0.25);
      ctx.fillText('★ OFFICIAL BALL ★', w * 0.75, h * 0.25);
      break;
    }

    case 'BEACH_BALL': {
      // --- VIVID TROPICAL BEACH BALL ---
      const colors = ['#ef4444', '#facc15', '#3b82f6', '#10b981', '#ec4899', '#ffffff'];
      const stripeWidth = w / colors.length;

      for (let i = 0; i < colors.length; i++) {
        // High-gloss vinyl gradient on each panel
        const panelGrad = ctx.createLinearGradient(i * stripeWidth, 0, (i + 1) * stripeWidth, 0);
        panelGrad.addColorStop(0, colors[i]);
        panelGrad.addColorStop(0.3, colors[i]);
        panelGrad.addColorStop(0.7, '#ffffff33');
        panelGrad.addColorStop(1, colors[i]);
        ctx.fillStyle = panelGrad;
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, h);

        // Welded vinyl seam line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(i * stripeWidth, 0, stripeWidth, h);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(i * stripeWidth + 2, 0, stripeWidth - 4, h);
      }

      // Glossy pole caps (top & bottom)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, 28);
      ctx.fillRect(0, h - 28, w, 28);
      break;
    }

    case 'BOWLING_BALL': {
      // --- COSMIC PEARL SWIRL BOWLING BALL ---
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.3, '#1e1b4b');
      bgGrad.addColorStop(0.6, '#312e81');
      bgGrad.addColorStop(0.85, '#0284c7');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Pearlized marble swirls
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(236, 72, 153, 0.25)';
        ctx.lineWidth = 26 - i * 3;
        ctx.beginPath();
        ctx.moveTo(0, h * (0.2 + i * 0.12));
        ctx.bezierCurveTo(w * 0.25, h * (0.9 - i * 0.1), w * 0.65, h * (0.1 + i * 0.1), w, h * (0.5 + i * 0.08));
        ctx.stroke();
      }

      // Glitter flecks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 150; i++) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        const gr = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3 Drilled finger grip holes with realistic depth
      const cx = w * 0.25;
      const cy = h * 0.5;
      const holes = [
        { x: cx, y: cy - 42, r: 18 },
        { x: cx - 34, y: cy + 34, r: 22 },
        { x: cx + 34, y: cy + 34, r: 22 }
      ];

      for (const hole of holes) {
        // Outer beveled ring
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.r + 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();

        // Inner dark hole
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
        const holeGrad = ctx.createRadialGradient(hole.x - 5, hole.y - 5, 2, hole.x, hole.y, hole.r);
        holeGrad.addColorStop(0, '#020617');
        holeGrad.addColorStop(1, '#000000');
        ctx.fillStyle = holeGrad;
        ctx.fill();
      }
      break;
    }

    case 'FIRE_CORE': {
      // --- INCANDESCENT MAGMA / VOLCANO CORE ---
      ctx.fillStyle = '#0f0a07';
      ctx.fillRect(0, 0, w, h);

      // Cracked tectonic basalt plates
      ctx.fillStyle = '#1c140d';
      for (let x = 0; x < w; x += 64) {
        for (let y = 0; y < h; y += 64) {
          ctx.beginPath();
          ctx.rect(x + 4, y + 4, 56, 56);
          ctx.fill();
        }
      }

      // Glowing molten lava fissures
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < 24; i++) {
        const startX = (i * w) / 24;
        const startY = Math.random() * h;

        // Outer red-orange glow
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() - 0.5) * 120, startY + (Math.random() - 0.5) * 90);
        ctx.lineTo(startX + (Math.random() - 0.5) * 180, (startY + 140) % h);
        ctx.stroke();

        // Core blinding yellow-white lava
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3.5;
        ctx.stroke();
      }

      // Heat bloom gradient
      const lavaGlow = ctx.createRadialGradient(w * 0.25, h * 0.5, 15, w * 0.25, h * 0.5, 180);
      lavaGlow.addColorStop(0, 'rgba(249, 115, 22, 0.6)');
      lavaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lavaGlow;
      ctx.fillRect(0, 0, w, h);
      break;
    }

    case 'ELECTRIC_CORE': {
      // --- CYBERTRON CARBON MATRIX ---
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Carbon-fiber honeycomb background
      ctx.fillStyle = '#090d16';
      for (let x = 0; x < w; x += 16) {
        for (let y = 0; y < h; y += 16) {
          if ((x + y) % 32 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Neon grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Blazing cyan and magenta circuit bus lines
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(0, h * 0.5);
      ctx.lineTo(w * 0.25, h * 0.5);
      ctx.lineTo(w * 0.35, h * 0.3);
      ctx.lineTo(w * 0.65, h * 0.3);
      ctx.lineTo(w * 0.75, h * 0.7);
      ctx.lineTo(w, h * 0.7);
      ctx.stroke();

      // Energy microchip nodes
      for (const nx of [w * 0.25, w * 0.35, w * 0.65, w * 0.75]) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(nx, h * 0.5, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(nx, h * 0.5, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      break;
    }

    case 'GOLDEN_BALL': {
      // --- 24K ROYAL CHAMPIONSHIP GOLD ---
      const goldGrad = ctx.createLinearGradient(0, 0, w, h);
      goldGrad.addColorStop(0, '#fef9c3');
      goldGrad.addColorStop(0.2, '#facc15');
      goldGrad.addColorStop(0.4, '#eab308');
      goldGrad.addColorStop(0.6, '#ca8a04');
      goldGrad.addColorStop(0.8, '#fef08a');
      goldGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, w, h);

      // Diamond reflective facet highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let x = 0; x < w; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 32, h);
        ctx.lineTo(x + 48, h);
        ctx.lineTo(x + 16, 0);
        ctx.fill();
      }

      // Royal engraved stars and laurel wreath
      ctx.fillStyle = '#713f12';
      for (const cx of [w * 0.25, w * 0.75]) {
        drawStar(ctx, cx, h * 0.5, 5, 64, 30);
      }
      break;
    }

    case 'COSMIC_CORE':
    default: {
      // --- CELESTIAL GALAXY NEBULA ---
      const galaxyGrad = ctx.createLinearGradient(0, 0, w, h);
      galaxyGrad.addColorStop(0, '#090514');
      galaxyGrad.addColorStop(0.3, '#3b0764');
      galaxyGrad.addColorStop(0.6, '#831843');
      galaxyGrad.addColorStop(0.85, '#0c4a6e');
      galaxyGrad.addColorStop(1, '#020617');
      ctx.fillStyle = galaxyGrad;
      ctx.fillRect(0, 0, w, h);

      // Shimmering starlight dust
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 200; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        const sr = Math.random() * 2.5 + 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vibrant orbital light rings
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 7;
      ctx.shadowColor = '#e879f9';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(w * 0.25, h * 0.5, 110, 48, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(w * 0.75, h * 0.5, 110, 48, -Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
