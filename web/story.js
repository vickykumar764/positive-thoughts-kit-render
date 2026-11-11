// Staging for "एक रुपये की कहानी" (Positive Thoughts style — ORIGINAL moral story):
// every value is a pure function of the frame number.
// FORMAT (Sisa title-cards-only): NO subtitles during the story — the narration carries it.
// Only text: the hook as a FULL-SCREEN title card (first 3 s, parchment style),
// and the "कमेंट में बताओ — A, B या C?" comment-prompt card (last 60 frames).
// STYLE: flat 2D cartoon, soft beige/parchment palette, village, kurtas, slow calm
// storybook pacing, one continuous narration. The three men are colour-coded so the
// A/B/C prompt is readable at a glance: A = RUST kurta (eater), B = GREEN kurta (saver),
// C = BLUE kurta (tailor).
// QUALITY BAR (littlelafda notes): character consistency above all (same faces/outfits in
// EVERY shot — the kit's deterministic castdefs guarantee this by construction);
// fully built authentic Indian backgrounds (village lane, market stalls, home courtyard,
// kirana shop); natural daylight + warm golden hour, saturated colour, shallow-DOF feel;
// role-accurate props; mostly static shots with a slow push-in/drift, hard cuts,
// subtle in-shot movement.
// TIMING: RE-TIMED to the real Puck voiceover (48.24 s, 1447 f) — timing.py 2026-11-11.
// Re-time by editing ONLY the CUTS array below if the voiceover ever changes
// (timing.py against lines-only.txt); every shot reads its range from CUTS.
import { clamp, lin, smooth, smoother, easeOut, easeIn, easeInOut, back, spring, lerp, lerp3, add3, catmull, camKeys, kick, blinkAt, idle, q } from "./motion.js";
import { groundAt, chanEnd, floorH, terrainH } from "./terrain.js";
import { SADHU, MAN_A, MAN_B, MAN_C, VIL_A, VIL_B, VIL_C } from "./castdefs.js";

export const FPS = 30, TOTAL = 1447; // RE-TIMED to the real Puck voiceover (48.24 s, timing.py 2026-11-11).

// ---------------- subtitles ----------------
// One subtitle per shot = the shot's spoken line. The hook (first 3 s = 90 frames) shows
// the title BIG in the centre (parchment title card in main.js); the last 60 frames show
// the comment-prompt end card.
export const LINES = [
  "एक रुपये से अमीर कैसे बना जाता है? ये है एक रुपये की कहानी।",
  "एक दिन एक साधु ने तीन आदमियों को एक-एक रुपया दिया।",
  "पहला आदमी भूखा था, उसने उसी वक्त रुपये का समोसा खा लिया।",
  "दूसरा आदमी भी भूखा था, लेकिन उसने रुपया बचा लिया और रोज़ थोड़ा-थोड़ा जोड़ता रहा।",
  "तीसरे आदमी की सोच अलग थी। उसने रुपये से सुई-धागा खरीदा और कपड़े सिलने लगा।",
  "कुछ ही महीनों में उसके पास सिलाई मशीन आ गई, फिर एक छोटी सी दुकान।",
  "और एक दिन उसने पहले आदमी को अपनी दुकान में काम पर रख लिया।",
  "तीनों को एक ही रुपया मिला था — फर्क रुपये में नहीं था, सोच में था।",
  "कमेंट में बताओ — आप कौन हो, A, B या C?",
];
export const HOOK = "एक रुपये से अमीर कैसे बना?";
export const ENDCARD = "कमेंट में बताओ — A, B या C?";

// ---------------- timing (edit ONLY this array to re-time) ----------------
// CUTS[i] = first frame of shot i (9 shots, one per line); CUTS[9] = TOTAL.
// RE-TIMED to the real Puck voiceover (timing.py 2026-11-11). One cut per line at the
// gap midpoint; gaps: L01→L02 1.17s, L02→L03 0.93s, L03→L04 1.10s, L04→L05 0.90s,
// L05→L06 0.93s, L06→L07 0.80s, L07→L08 0.80s, L08→L09 0.67s. Lead-in 0.27s, tail 0.23s.
export const CUTS = [0, 165, 309, 456, 661, 864, 1010, 1139, 1304, 1447];

// ---------------- world layout (same village as the Bhai Dooj kit) ----------------
const houses = [];
{
  let s = 5;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const rowL = [[-11, 54, 1], [-12.5, 63, 0], [-11.5, 72, 2], [-13, 82, 1], [-12, 92, 0], [-14, 103, 2], [-12, 114, 1], [-25, 60, 0], [-27, 76, 2], [-26, 95, 1]];
  const rowR = [[11, 58, 0], [12.5, 68, 2], [11.5, 79, 1], [13, 89, 0], [12, 100, 2], [14, 111, 1], [25, 66, 1], [27, 84, 0], [26, 104, 2]];
  for (const [x, z, k] of rowL) houses.push([x, z, 5 + r() * 2.5, 4.2 + r() * 1.5, 2.9 + r() * 0.6, Math.PI / 2, k, r() < 0.45]);
  for (const [x, z, k] of rowR) houses.push([x, z, 5 + r() * 2.5, 4.2 + r() * 1.5, 2.9 + r() * 0.6, -Math.PI / 2, k, r() < 0.45]);
}
export const VILLAGE = {
  houses,
  palms: [[-19, 50, 10], [19, 52, 9], [-6, 120, 11], [33, 72, 9.5], [-35, 88, 10.5], [36, 98, 8.5], [-31, 66, 9], [7, 133, 10], [44, 60, 10], [-46, 74, 9]],
  trees: [[-6.5, 47, 2.6, 2.4], [17, 75, 3, 2.8], [-19, 108, 2.8, 2.6], [40, 118, 3.2, 3], [-42, 120, 3, 2.8], [55, 40, 2.6, 2.4], [-60, 45, 2.8, 2.6], [70, -40, 3, 2.8], [-50, -48, 2.8, 2.6]],
  hay: [[-20, 58, 1], [19.5, 63, 0.9], [-21, 86, 1.1], [33, 79, 1], [-33, 104, 0.9]],
  fields: [[85, 85, 70, 55, 1, 0.05], [-90, 90, 75, 60, 0, -0.04], [80, 150, 60, 45, 0, 0.1], [-85, 160, 70, 50, 1, 0], [40, -95, 80, 55, 1, 0.08], [-70, -100, 90, 60, 0, -0.05], [170, -40, 60, 70, 0, 0.1]],
};
export const LANE = [[0.5, 150], [0.3, 110], [0.2, 70], [0.4, 40], [0.5, 27]];
// main.js imports these to build the world; the rupee shots do not use them directly.
export const CLINIC = [92, -246, 0.3];
export const ROAD = [[2, 82], [40, 87], [90, 82], [138, 68], [174, 44], [190, 12], [192, -22], [180, -58], [158, -98], [132, -142], [110, -186], [96, -228]];
export const MAPCAM = { pos: [92, 520, 44], look: [92, 0, -80], fov: 50 };
export const SHORT = [[0.4, -22], [6, -70], [26, -130], [56, -190], [86, -236]];

// ---------------- light presets ----------------
const LP = {
  day: { az: 112, el: 50, sun: [1.2, 1.12, 0.97], amb: [0.36, 0.37, 0.46], gnd: [0.32, 0.27, 0.2], top: "#3f80d4", mid: "#8fb7e6", hor: "#c4d8ee", fog: [120, 1300], sat: 1.1, lift: [0.02, 0.025, 0.05], gain: [1, 1, 1], card: [1, 1, 1], cloud: [1, 1, 1], disc: 0 },
  morning: { az: 28, el: 20, sun: [1.38, 1.04, 0.74], amb: [0.34, 0.34, 0.47], gnd: [0.3, 0.24, 0.19], top: "#4f8ad8", mid: "#a6c3e4", hor: "#f0dcbc", fog: [110, 1200], sat: 1.12, lift: [0.025, 0.02, 0.05], gain: [1.02, 1, 0.97], card: [1.03, 0.98, 0.93], cloud: [1, 0.93, 0.86], disc: 0.003 },
  golden: { az: 168, el: 10, sun: [1.62, 0.98, 0.52], amb: [0.31, 0.28, 0.48], gnd: [0.27, 0.21, 0.19], top: "#6d7cc4", mid: "#e6a98e", hor: "#ffcf8e", fog: [90, 1100], sat: 1.14, lift: [0.03, 0.02, 0.06], gain: [1.04, 0.99, 0.94], card: [1.06, 0.94, 0.82], cloud: [1, 0.84, 0.72], disc: 0.004 },
};
const hexMix = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const ch = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0"); return `#${ch(16)}${ch(8)}${ch(0)}`; };
const blendL = (a, b, t) => {
  const o = {};
  for (const k of Object.keys(a)) {
    const x = a[k], y = b[k];
    o[k] = typeof x === "string" ? hexMix(x, y, t) : Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], t)) : lerp(x, y, t);
  }
  let d = b.az - a.az; if (d > 180) d -= 360; if (d < -180) d += 360; o.az = a.az + d * t;
  return o;
};

// ---------------- helpers ----------------
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dist = (a, b) => Math.hypot(...sub(a, b));
const camRight = (c) => norm(cross(sub(c.look, c.pos), [0, 1, 0]));
const camUp = (c) => norm(cross(camRight(c), sub(c.look, c.pos)));
const lightAng = (c, L, mirror = 1) => {
  const d = [Math.cos(L.el * Math.PI / 180) * Math.cos(L.az * Math.PI / 180), Math.sin(L.el * Math.PI / 180), Math.cos(L.el * Math.PI / 180) * Math.sin(L.az * Math.PI / 180)];
  const r = camRight(c), u = camUp(c);
  const sx = (d[0] * r[0] + d[1] * r[1] + d[2] * r[2]) * mirror, sy = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
  return q(Math.atan2(-Math.max(0.25, sy), sx), 0.35);
};
const mirrorOf = (c, dir) => { const r = camRight(c); return dir[0] * r[0] + dir[1] * r[2] < 0 ? -1 : 1; };
const ext = (f, a, b) => f >= a && f < b;
const ht = (x, z, p) => groundAt(x, z, p);
let CAMNOW = null;
const pullTo = (p, d = 0.9) => { if (!CAMNOW) return p; const v = sub(CAMNOW.pos, p), l = Math.hypot(...v) || 1; return add3(p, v.map((x) => (x * Math.min(d, l * 0.5)) / l)); };
const walkPhase = (d) => q(d / 1.25, 1 / 24);

/** a short golden burst (sparkle) at a fixed world pos, frames fi..fi+11 */
const burstAt = (fx, id, f, fi, pos, size = 0.5) => {
  if (f >= fi && f < fi + 12) fx.push({ id, kind: "burst", pos: pullTo(pos), size, t: q((f - fi + 1) / 12, 0.08), col: "#ffe98a" });
};
const head3 = (A, h = 1.6) => [A[0], A[1] + h, A[2]];
const dustAt = (fx, f, i, x, y, z) => {
  fx.push({ id: "dust" + i, kind: "glow", pos: [x + 0.12 * Math.sin(f * 0.05 + i * 2.1), y + 0.06 * Math.sin(f * 0.03 + i * 1.7), z], size: 0.07, alpha: 0.25 });
};
const birdsAt = (fx, f, a, b, n = 3, y0 = 30, z0 = 70) => {
  const t = (f - a) / (b - a);
  for (let i = 0; i < n; i++) fx.push({ id: "bird" + i, kind: "bird", pos: [-40 + t * 80 + i * 4, y0 + i * 2.5 + Math.sin(t * 6 + i) * 1.5, z0 - i * 3], size: 1.6, t: q(((f * 0.09 + i * 0.33) % 1), 0.125) });
};
/** piecewise-linear path through waypoints [[x,y,z], ...] at u in [0,1] */
const pathAt = (pts, u) => {
  const n = pts.length - 1, x = Math.min(0.999999, Math.max(0, u)) * n, i = Math.floor(x), t = x - i;
  return pts[i].map((v, k) => lerp(v, pts[i + 1][k], t));
};

// ---------------- shots ----------------
// "एक रुपये की कहानी" — 9 shots / 9 lines / TOTAL 1447f (RE-TIMED to the real voiceover).
// Camera languages: close-up sage + rupee gleam (1), wide give + coin path (2), medium
// market close-up (3), home courtyard pot (4), cloth stall + sewing (5), proud shop front (6),
// walk-in hire (7), golden three-men moral (8), direct-to-camera prompt (9).
// STAGING RULES: portrait 9:16 => horizontal fov ~23deg; stage groups along DEPTH;
// keep actors + cameras in the open lane (|x| <= 4); never stage against a house wall.
// LOCATIONS: tree by the lane (sage, z ~64); market stalls (z 44-55); home courtyard (z 86-92,
// chulha + pot at z ~87); kirana shop front (z 74-78, plain signboard, NO text).
const SHOTS = [];
const shot = (id, a, b, fn) => SHOTS.push({ id, a, b, fn });
const S = (i) => [CUTS[i], CUTS[i + 1]];

// 1 HOOK (L01): CLOSE-UP — the sage under the tree, three men behind him in depth;
//    a golden glow (the rupee) shines at his outstretched hand. Title card covers f 0-89;
//    from f 90 the sage's face + the rupee gleam are revealed.
shot("hook", ...S(0), (f) => {
  const p = 0;
  const G = [0.3, ht(0.3, 64, p), 64];
  const A = [-0.5, ht(-0.5, 62.2, p), 62.2];
  const B = [0.8, ht(0.8, 61.8, p), 61.8];
  const C = [1.4, ht(1.4, 62.2, p), 62.2];
  const cam = camKeys([
    { f: CUTS[0], pos: [0.4, 2.0, 69.8], look: [0.4, 1.15, 63.5], fov: 34 },
    { f: CUTS[1], pos: [0.4, 1.95, 69.2], look: [0.4, 1.18, 63.5], fov: 32, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = LP.morning, mir = mirrorOf(cam, [0, -1]);
  const actors = [
    { id: "sadhu", kind: "front", outfit: SADHU, pos: [G[0], G[2]], opts: { expr: "smile", armR: "point", armL: "hang", blink: blinkAt(f, 3), seed: 3, light: lightAng(cam, L, mir), tilt: q(idle(f, 3).tilt, 0.5) } },
    { id: "mana", kind: "front", outfit: MAN_A, pos: [A[0], A[2]], opts: { expr: "neutral", armL: "hang", armR: "hang", blink: blinkAt(f, 11), seed: 11, light: -2.2, tilt: q(idle(f, 11).tilt, 0.5) } },
    { id: "manb", kind: "front", outfit: MAN_B, pos: [B[0], B[2]], opts: { expr: "neutral", armL: "hang", armR: "hang", blink: blinkAt(f, 13), seed: 13, light: -2.2, tilt: q(idle(f, 13).tilt, 0.5) } },
    { id: "manc", kind: "front", outfit: MAN_C, pos: [C[0], C[2]], opts: { expr: "smile", armL: "hang", armR: "hang", blink: blinkAt(f, 15), seed: 15, light: -2.2, tilt: q(idle(f, 15).tilt, 0.5) } },
  ];
  const fx = [];
  // the rupee gleams at the sage's hand (in front of him, toward the camera)
  fx.push({ id: "rupee", kind: "glow", pos: [0.3, 1.12, 63.3], size: 0.3, alpha: 0.9 });
  burstAt(fx, "ru1", f, 120, [0.3, 1.3, 63.2], 0.45);
  dustAt(fx, f, 0, 0.2, 1.6, 63.0); dustAt(fx, f, 1, -0.4, 1.8, 62.5);
  birdsAt(fx, f, CUTS[0], CUTS[1], 2, 32, 70);
  return { cam, L, actors, fx, p, kicks: [{ f: 120, a: 0.01 }], dof: { focus: dist(cam.pos, add3(G, [0, 1.2, 0])), cInf: 9 }, shadow: { c: [0.3, 0, 63], r: 12 } };
});

// 2 GIVE (L02): WIDE — the sage gives one rupee to each man. The golden glow travels
//    from the sage's hand to man A, then B, then C; a small burst twinkles at each handover.
shot("give", ...S(1), (f) => {
  const p = 0;
  const G = [0.3, ht(0.3, 64, p), 64];
  const A = [-0.6, ht(-0.6, 62.5, p), 62.5];
  const B = [0.8, ht(0.8, 62.0, p), 62.0];
  const C = [1.4, ht(1.4, 62.5, p), 62.5];
  const cam = camKeys([
    { f: CUTS[1], pos: [0.4, 2.0, 69.5], look: [0.4, 1.15, 63.5], fov: 38 },
    { f: CUTS[2], pos: [0.4, 1.95, 69.0], look: [0.4, 1.18, 63.5], fov: 37, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = LP.morning, mir = mirrorOf(cam, [0, -1]);
  // L02 is one phrase, f 182-295 (shot 165-309): the coin travels sage -> A -> B -> C
  // across the line. Handovers at f 216 (A), 250 (B), 284 (C).
  const u = (f - (CUTS[1] + 17)) / ((CUTS[2] - 14) - (CUTS[1] + 17));
  const coin = pathAt([[0.3, 1.15, 63.3], [-0.6, 1.1, 62.0], [0.8, 1.1, 61.5], [1.4, 1.1, 62.0]], Math.min(1, Math.max(0, u)));
  const gotA = f >= CUTS[1] + 51, gotB = f >= CUTS[1] + 85, gotC = f >= CUTS[1] + 119;
  const actors = [
    { id: "sadhu", kind: "front", outfit: SADHU, pos: [G[0], G[2]], opts: { expr: "smile", armR: "point", armL: "hang", blink: blinkAt(f, 3), seed: 3, light: lightAng(cam, L, mir), tilt: q(idle(f, 3).tilt, 0.5) } },
    { id: "mana", kind: "front", outfit: MAN_A, pos: [A[0], A[2]], opts: { expr: gotA ? "smile" : "neutral", armL: "hang", armR: gotA ? "belly" : "hang", blink: blinkAt(f, 11), seed: 11, light: -2.2, tilt: q(idle(f, 11).tilt, 0.5) } },
    { id: "manb", kind: "front", outfit: MAN_B, pos: [B[0], B[2]], opts: { expr: gotB ? "smile" : "neutral", armL: "hang", armR: gotB ? "belly" : "hang", blink: blinkAt(f, 13), seed: 13, light: -2.2, tilt: q(idle(f, 13).tilt, 0.5) } },
    { id: "manc", kind: "front", outfit: MAN_C, pos: [C[0], C[2]], opts: { expr: gotC ? "smile" : "neutral", armL: "hang", armR: gotC ? "belly" : "hang", blink: blinkAt(f, 15), seed: 15, light: -2.2, tilt: q(idle(f, 15).tilt, 0.5) } },
  ];
  const fx = [];
  fx.push({ id: "rupee", kind: "glow", pos: coin, size: 0.28, alpha: 0.95 });
  burstAt(fx, "giveA", f, CUTS[1] + 51, [-0.6, 1.3, 62.0], 0.4);
  burstAt(fx, "giveB", f, CUTS[1] + 85, [0.8, 1.3, 61.5], 0.4);
  burstAt(fx, "giveC", f, CUTS[1] + 119, [1.4, 1.3, 62.0], 0.4);
  dustAt(fx, f, 0, 0.0, 1.7, 63.0); dustAt(fx, f, 1, 1.0, 1.9, 62.0);
  birdsAt(fx, f, CUTS[1], CUTS[2], 2, 32, 70);
  return { cam, L, actors, fx, p, kicks: [{ f: CUTS[1] + 51, a: 0.01 }, { f: CUTS[1] + 85, a: 0.01 }, { f: CUTS[1] + 119, a: 0.01 }], dof: { focus: dist(cam.pos, add3(G, [0, 1.2, 0])), cInf: 9 }, shadow: { c: [0.3, 0, 63], r: 12 } };
});

// 3 SAMOSA (L03): MEDIUM — man A (rust) at the veg stall, eating the samosa, delighted;
//    then the food is gone and he is hungry again (expression + arm drop).
shot("samosa", ...S(2), (f) => {
  const p = 0;
  const A = [-4.3, ht(-4.3, 50.8, p), 50.8];
  const cam = camKeys([
    { f: CUTS[2], pos: [-4.3, 1.55, 54.2], look: [-4.3, 1.25, 50.8], fov: 36 },
    { f: CUTS[3], pos: [-4.3, 1.5, 53.8], look: [-4.3, 1.28, 50.8], fov: 34, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = LP.day, mir = mirrorOf(cam, [0, -1]);
  // L03 (f 323-439): phrase 1 (323-353) he is hungry; phrase 2 (376-439) he eats the
  // samosa; after the line ends (439) the food is gone and he is hungry again.
  const eatStart = CUTS[2] + 44, eatEnd = CUTS[3] - 17; // f 353, f 439
  const eating = f >= eatStart && f < eatEnd;
  const actors = [
    { id: "mana", kind: "front", outfit: MAN_A, pos: [A[0], A[2]], opts: { expr: eating ? "smile" : "neutral", armR: eating ? "chin" : "hang", armL: "belly", blink: blinkAt(f, 11), seed: 11, light: lightAng(cam, L, mir), tilt: q(eating ? idle(f, 11).tilt : 2, 0.5) } },
  ];
  const fx = [];
  // the hot samosa's warm gleam at his hand while he eats
  if (eating) fx.push({ id: "food", kind: "glow", pos: [-4.5, 1.05, 50.2], size: 0.16, alpha: 0.7 });
  burstAt(fx, "bite", f, eatStart + 5, [-4.5, 1.3, 50.2], 0.35);
  dustAt(fx, f, 0, -4.5, 1.6, 50.0); dustAt(fx, f, 1, -3.8, 1.8, 49.5);
  birdsAt(fx, f, CUTS[2], CUTS[3], 2, 30, 60);
  return { cam, L, actors, fx, p, kicks: [{ f: eatStart + 5, a: 0.012 }, { f: eatEnd, a: 0.01 }], dof: { focus: dist(cam.pos, add3(A, [0, 1.1, 0])), cInf: 9 }, shadow: { c: [-4.3, 0, 50], r: 12 } };
});

// 4 SAVE (L04): MEDIUM — man B (green) at the home courtyard drops coins into a clay pot;
//    two coins descend with a soft golden twinkle as they land.
shot("save", ...S(3), (f) => {
  const p = 0;
  const B = [-0.5, ht(-0.5, 89, p), 89];
  const cam = camKeys([
    { f: CUTS[3], pos: [-0.5, 1.5, 93.0], look: [-0.5, 1.2, 89.0], fov: 36 },
    { f: CUTS[4], pos: [-0.5, 1.45, 92.6], look: [-0.5, 1.22, 89.0], fov: 35, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = LP.morning, mir = mirrorOf(cam, [0, -1]);
  const actors = [
    { id: "manb", kind: "front", outfit: MAN_B, pos: [B[0], B[2]], opts: { expr: "smile", armR: "belly", armL: "belly", blink: blinkAt(f, 13), seed: 13, light: lightAng(cam, L, mir), tilt: q(idle(f, 13).tilt, 0.5) } },
  ];
  const fx = [];
  // the clay savings pot beside him, at his depth so it stays in frame (raised 0.43*size
  // so it sits ON the ground, not buried) — the visible symbol of his saving.
  fx.push({ id: "pot", kind: "pot", pos: [-1.0, ht(-1.0, 89.2, p) + 0.43 * 0.45, 89.2], size: 0.45 });
  // L04 phrase 2 (f 532-647) is the saving: coin 1 descends f 545-590, coin 2 f 600-645.
  const c1 = lin(CUTS[3] + 89, CUTS[3] + 134, f), c2 = lin(CUTS[3] + 144, CUTS[3] + 189, f);
  if (c1 > 0 && c1 < 1) fx.push({ id: "coin1", kind: "glow", pos: [lerp(-0.5, -1.0, smooth(c1)), lerp(1.3, 0.55, smooth(c1)), lerp(89.3, 89.2, smooth(c1))], size: 0.14, alpha: 0.9 });
  if (c2 > 0 && c2 < 1) fx.push({ id: "coin2", kind: "glow", pos: [lerp(-0.5, -1.0, smooth(c2)), lerp(1.3, 0.55, smooth(c2)), lerp(89.3, 89.2, smooth(c2))], size: 0.14, alpha: 0.9 });
  burstAt(fx, "land1", f, CUTS[3] + 134, [-1.0, 0.7, 89.2], 0.35);
  burstAt(fx, "land2", f, CUTS[3] + 189, [-1.0, 0.7, 89.2], 0.35);
  dustAt(fx, f, 0, -0.3, 1.5, 89.5); dustAt(fx, f, 1, 0.4, 1.7, 89.0);
  birdsAt(fx, f, CUTS[3], CUTS[4], 2, 30, 80);
  return { cam, L, actors, fx, p, kicks: [{ f: CUTS[3] + 134, a: 0.01 }, { f: CUTS[3] + 189, a: 0.01 }], dof: { focus: dist(cam.pos, add3(B, [0, 1.1, 0])), cInf: 9 }, shadow: { c: [-0.5, 0, 89], r: 12 } };
});

// 5 SEW (L05): MEDIUM — man C (blue) at the cloth stall buys needle-thread, then sews;
//    a needle gleam sparkles at his hands as he works.
shot("sew", ...S(4), (f) => {
  const p = 0;
  const C = [4.3, ht(4.3, 50.5, p), 50.5];
  const cam = camKeys([
    { f: CUTS[4], pos: [4.3, 1.55, 54.0], look: [4.3, 1.25, 50.5], fov: 36 },
    { f: CUTS[5], pos: [4.3, 1.5, 53.6], look: [4.3, 1.28, 50.5], fov: 34, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = LP.day, mir = mirrorOf(cam, [0, -1]);
  // L05 (f 674-850): phrase 1 (674-720) his thinking is different — the idea spark;
  // phrase 2 (747-850) he buys needle-thread, then sews (switch at f 800).
  const buying = f < CUTS[4] + 139; // f 800
  const actors = [
    { id: "manc", kind: "front", outfit: MAN_C, pos: [C[0], C[2]], opts: { expr: "smile", armR: buying ? "point" : "belly", armL: "belly", blink: blinkAt(f, 15), seed: 15, light: lightAng(cam, L, mir), tilt: q(idle(f, 15).tilt, 0.5) } },
  ];
  const fx = [];
  if (buying) fx.push({ id: "thread", kind: "glow", pos: [4.5, 1.0, 47.6], size: 0.16, alpha: 0.7 });
  burstAt(fx, "idea", f, CUTS[4] + 29, [4.3, 2.6, 50.5], 0.45); // the idea spark, f 690
  burstAt(fx, "needle", f, CUTS[4] + 150, [4.3, 1.15, 50.0], 0.35);
  burstAt(fx, "sew2", f, CUTS[4] + 175, [4.4, 1.1, 50.0], 0.3);
  dustAt(fx, f, 0, 4.5, 1.6, 50.0); dustAt(fx, f, 1, 3.8, 1.8, 49.5);
  birdsAt(fx, f, CUTS[4], CUTS[5], 2, 30, 60);
  return { cam, L, actors, fx, p, kicks: [{ f: CUTS[4] + 150, a: 0.012 }, { f: CUTS[4] + 139, a: 0.01 }], dof: { focus: dist(cam.pos, add3(C, [0, 1.1, 0])), cInf: 9 }, shadow: { c: [4.3, 0, 50], r: 12 } };
});

// 6 SHOP (L06): WIDE — man C stands proud in front of HIS kirana shop (plain signboard,
//    no text); a warm golden gleam at the counter (the sewing machine), shop opens.
shot("shop", ...S(5), (f) => {
  const p = 0;
  const C = [0.4, ht(0.4, 80.8, p), 80.8];
  const cam = camKeys([
    { f: CUTS[5], pos: [0.4, 1.7, 85.0], look: [0.4, 1.3, 80.5], fov: 40 },
    { f: CUTS[6], pos: [0.4, 1.65, 84.4], look: [0.4, 1.32, 80.5], fov: 38, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = blendL(LP.day, LP.golden, 0.4), mir = mirrorOf(cam, [0, -1]);
  const actors = [
    { id: "manc", kind: "front", outfit: MAN_C, pos: [C[0], C[2]], opts: { expr: "grin", armR: "up", armL: "hip", blink: blinkAt(f, 15), seed: 15, light: lightAng(cam, L, mir), tilt: q(idle(f, 15).tilt, 0.5) } },
  ];
  const fx = [];
  fx.push({ id: "machine", kind: "glow", pos: [0.4, 1.2, 78.6], size: 0.5, alpha: 0.55 });
  // L06 phrase 2 (f 966-998) is the shop: the golden gleam bursts as it opens, f 975.
  burstAt(fx, "open", f, CUTS[5] + 111, [0.4, 2.2, 79.0], 0.8);
  dustAt(fx, f, 0, 0.2, 1.6, 80.0); dustAt(fx, f, 1, -0.4, 1.8, 79.5);
  birdsAt(fx, f, CUTS[5], CUTS[6], 2, 32, 70);
  return { cam, L, actors, fx, p, kicks: [{ f: CUTS[5] + 111, a: 0.014 }], dof: { focus: dist(cam.pos, add3(C, [0, 1.3, 0])), cInf: 10 }, shadow: { c: [0.4, 0, 80], r: 12 } };
});

// 7 HIRE (L07): TWO-SHOT — man A walks in from the lane to the shop; man C gestures him
//    inside. Man A arrives smiling, now an employee.
shot("hire", ...S(6), (f) => {
  const p = 0;
  const C = [0.4, ht(0.4, 80.5, p), 80.5];
  // L07 is one phrase, f 1022-1127 (shot 1010-1139): man A walks in over f 1010-1090,
  // arrives at f 1090, man C invites him in at f 1110.
  const zA = lerp(86.0, 82.5, smooth(lin(CUTS[6], CUTS[6] + 80, f)));
  const A = [0.4, ht(0.4, zA, p), zA];
  const cam = camKeys([
    { f: CUTS[6], pos: [0.4, 1.6, 85.5], look: [0.4, 1.3, 81.0], fov: 38 },
    { f: CUTS[7], pos: [0.4, 1.55, 85.0], look: [0.4, 1.32, 81.0], fov: 37, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = blendL(LP.day, LP.golden, 0.4), mir = mirrorOf(cam, [0, -1]);
  const arrived = f >= CUTS[6] + 80;
  const invite = f >= CUTS[6] + 100;
  const actors = [];
  if (!arrived) {
    actors.push({ id: "mana", kind: "side", wide: true, outfit: MAN_A, pos: [A[0], A[2]], dir: [0, -1], opts: { mode: "walk", phase: walkPhase(86.0 - zA), expr: "neutral", blink: blinkAt(f, 11), seed: 11, light: lightAng(cam, L, mir), lean0: 3 } });
  } else {
    actors.push({ id: "mana", kind: "front", outfit: MAN_A, pos: [A[0], A[2]], opts: { expr: "smile", armR: "belly", armL: "hang", blink: blinkAt(f, 11), seed: 11, light: lightAng(cam, L, mir), tilt: q(idle(f, 11).tilt, 0.5) } });
  }
  actors.push({ id: "manc", kind: "front", outfit: MAN_C, pos: [C[0], C[2]], opts: { expr: invite ? "grin" : "smile", armR: invite ? "up" : "point", armL: "hip", blink: blinkAt(f, 15), seed: 15, light: lightAng(cam, L, mir), tilt: q(idle(f, 15).tilt, 0.5) } });
  const fx = [];
  burstAt(fx, "invite", f, CUTS[6] + 100, [0.4, 2.6, 80.5], 0.5);
  dustAt(fx, f, 0, 0.2, 1.6, 81.0); dustAt(fx, f, 1, -0.4, 1.8, 80.5);
  birdsAt(fx, f, CUTS[6], CUTS[7], 2, 32, 70);
  return { cam, L, actors, fx, p, kicks: [{ f: CUTS[6] + 100, a: 0.012 }], dof: { focus: dist(cam.pos, add3(C, [0, 1.3, 0])), cInf: 10 }, shadow: { c: [0.4, 0, 81], r: 12 } };
});

// 8 MORAL (L08): GOLDEN WIDE — all three men at the shop front; man C stands proud in
//    front, man A (now his employee) and man B (with his savings pot) behind him.
shot("moral", ...S(7), (f) => {
  const p = 0;
  const C = [0.2, ht(0.2, 80.5, p), 80.5];
  const A = [-0.7, ht(-0.7, 81.8, p), 81.8];
  const B = [1.4, ht(1.4, 81.8, p), 81.8];
  const cam = camKeys([
    { f: CUTS[7], pos: [0.4, 2.0, 90.0], look: [0.4, 1.3, 81.0], fov: 44 },
    { f: CUTS[8], pos: [0.4, 1.9, 89.0], look: [0.4, 1.3, 81.0], fov: 42, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = LP.golden, mir = mirrorOf(cam, [0, -1]);
  const actors = [
    { id: "manc", kind: "front", outfit: MAN_C, pos: [C[0], C[2]], opts: { expr: "grin", armR: "up", armL: "hip", blink: blinkAt(f, 15), seed: 15, light: lightAng(cam, L, mir), tilt: q(idle(f, 15).tilt, 0.5) } },
    { id: "mana", kind: "front", outfit: MAN_A, pos: [A[0], A[2]], opts: { expr: "smile", armL: "belly", armR: "hang", blink: blinkAt(f, 11), seed: 11, light: -2.2, tilt: q(idle(f, 11).tilt, 0.5) } },
    { id: "manb", kind: "front", outfit: MAN_B, pos: [B[0], B[2]], opts: { expr: "smile", armL: "belly", armR: "hang", blink: blinkAt(f, 13), seed: 13, light: -2.2, tilt: q(idle(f, 13).tilt, 0.5) } },
  ];
  const fx = [];
  // B's savings pot beside him (raised 0.43*size so it sits ON the ground)
  fx.push({ id: "pot", kind: "pot", pos: [1.4, ht(1.4, 82.6, p) + 0.43 * 0.3, 82.6], size: 0.3 });
  // L08 phrase 3 (f 1270-1294) is the punchline "सोच में था": the golden burst lands there.
  burstAt(fx, "moral", f, CUTS[7] + 131, [0.2, 3.0, 81.0], 0.9);
  fx.push({ id: "glow1", kind: "glow", pos: [0.2, 2.4, 80.5], size: 0.5, alpha: 0.5 });
  dustAt(fx, f, 0, 0.2, 1.7, 81.0); dustAt(fx, f, 1, -0.4, 1.9, 80.5); dustAt(fx, f, 2, 0.8, 1.5, 81.5);
  birdsAt(fx, f, CUTS[7], CUTS[8], 2, 34, 70);
  return { cam, L, actors, fx, p, kicks: [{ f: CUTS[7] + 131, a: 0.014 }], dof: { focus: dist(cam.pos, add3(C, [0, 1.3, 0])), cInf: 10 }, shadow: { c: [0.4, 0, 81], r: 14 } };
});

// 9 PROMPT (L09): DIRECT-TO-CAMERA — man C points at the viewer, man A and man B wave
//    beside him; the comment-prompt end card shows for the last 60 frames.
shot("prompt", ...S(8), (f) => {
  const p = 0;
  const C = [0.1, ht(0.1, 82.0, p), 82.0];
  const A = [-0.8, ht(-0.8, 81.2, p), 81.2];
  const B = [1.1, ht(1.1, 81.2, p), 81.2];
  const cam = camKeys([
    { f: CUTS[8], pos: [0.2, 1.6, 87.5], look: [0.2, 1.3, 81.5], fov: 42 },
    { f: CUTS[9], pos: [0.2, 1.55, 86.8], look: [0.2, 1.32, 81.5], fov: 41, ease: (t) => smooth(t) },
  ], f);
  CAMNOW = cam;
  const L = LP.golden, mir = mirrorOf(cam, [0, -1]);
  const wave = f >= CUTS[8] + 55;
  const actors = [
    { id: "manc", kind: "front", outfit: MAN_C, pos: [C[0], C[2]], opts: { expr: "grin", armR: "point", armL: "hip", blink: blinkAt(f, 15), seed: 15, light: lightAng(cam, L, mir), tilt: q(idle(f, 15).tilt, 0.5) } },
    { id: "mana", kind: "front", outfit: MAN_A, pos: [A[0], A[2]], opts: { expr: "smile", armR: wave ? "up" : "hang", armL: "hang", blink: blinkAt(f, 11), seed: 11, light: -2.2, tilt: q(idle(f, 11).tilt, 0.5) } },
    { id: "manb", kind: "front", outfit: MAN_B, pos: [B[0], B[2]], opts: { expr: "grin", armR: wave ? "up" : "hang", armL: "hang", blink: blinkAt(f, 13), seed: 13, light: -2.2, tilt: q(idle(f, 13).tilt, 0.5) } },
  ];
  const fx = [];
  burstAt(fx, "cta", f, CUTS[8] + 55, [0.1, 2.6, 82.0], 0.5);
  dustAt(fx, f, 0, 0.2, 1.7, 81.5); dustAt(fx, f, 1, -0.4, 1.9, 81.0);
  birdsAt(fx, f, CUTS[8], CUTS[9], 2, 34, 70);
  return { cam, L, actors, fx, p, kicks: [{ f: CUTS[8] + 55, a: 0.01 }], dof: { focus: dist(cam.pos, add3(C, [0, 1.2, 0])), cInf: 10 }, shadow: { c: [0.2, 0, 81.5], r: 12 } };
});

export const SHOTLIST = SHOTS.map((s) => ({ id: s.id, a: s.a, b: s.b }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];

export const frameState = (f) => {
  const s = shotAt(f), r = s.fn(f);
  const cam = { ...r.cam, pos: [...r.cam.pos], look: [...r.cam.look] };
  const [kx, ky] = kick(f, r.kicks || []);
  if (kx || ky) {
    const d = dist(cam.pos, cam.look), R = camRight(cam), U = camUp(cam);
    cam.look = add3(cam.look, [R[0] * kx * d + U[0] * ky * d, R[1] * kx * d + U[1] * ky * d, R[2] * kx * d + U[2] * ky * d]);
  }
  const world = { progress: r.p ?? 0, slab: null, plug: null, short: false, ...(r.world || {}) };
  // text layer: the title (first 90 frames) is a FULL-SCREEN parchment title card; the
  // current line is kept as a subtitle ONLY when window.SUBS is on (default OFF —
  // title-cards-only format); the comment-prompt end card shows for the last 60 frames.
  const idx = SHOTS.indexOf(s);
  const sub = f < 90 ? { text: HOOK, kind: "hook" } : { text: LINES[idx], kind: "bottom" };
  const end = f >= TOTAL - 60 ? ENDCARD : null;
  return { shot: s.id, cam, light: r.L, actors: r.actors || [], fx: r.fx || [], world, flash: r.flash || 0, vign: r.vign ?? 0.18, dof: r.dof, shadow: r.shadow, sub, end };
};
