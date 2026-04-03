import Text, { enablePretext } from 'lib/util/Text';
import { create as svgCreate, attr as svgAttr, append as svgAppend } from 'tiny-svg';

// ─── Theme ─────────────────────────────────────────────────────────────────────
// fill is NOT included here — layoutText uses this only for font metrics.
// We set fill explicitly on the element afterwards.
const STYLE = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 12,
  fontWeight: 'normal',
  lineHeight: 1.2,
};
const TEXT_COLOR = '#e2e8f0';

const FILL_DEFAULT  = '#1a1f2e';
const FILL_SELECTED = '#1e293b';
const STROKE_DEFAULT  = '#3d4d63';
const STROKE_SELECTED = '#3b82f6';
const STROKE_DIFF     = '#f97316';
const HANDLE_FILL     = '#2d3748';
const HANDLE_SIZE     = 10;
const PAD    = 6;
const COLS   = 4;
const GAP    = 14;
const INIT_W = 120;
const INIT_H = 64;
const CANVAS_PAD = 20;

// ─── Label generator ──────────────────────────────────────────────────────────
function makeLcg(seed) {
  let s = seed >>> 0;
  return () => { s = Math.imul(1664525, s) + 1013904223 >>> 0; return s / 0xffffffff; };
}
function randWord(rng, min, max) {
  const len = min + Math.floor(rng() * (max - min + 1));
  let w = '';
  for (let i = 0; i < len; i++) w += String.fromCharCode(97 + Math.floor(rng() * 26));
  return w;
}
function generateLabel(rng) {
  const n = 1 + Math.floor(rng() * 5);
  return Array.from({ length: n }, () => randWord(rng, 3, 10)).join(' ');
}
let _rng = makeLcg(0xcafebabe);
function generateLabels(n) {
  return Array.from({ length: n }, () => generateLabel(_rng));
}

// ─── State ─────────────────────────────────────────────────────────────────────
let nextId = 0;
let boxes  = []; // { id, label, x, y, w, h }
let refs   = {}; // { [id]: { c: BoxEl, p: BoxEl } }  c=current, p=pretext
let selectedId = null;

// Interaction
let drag        = null; // { id, ox, oy, mx, my }
let resize      = null; // { id, ow, oh, mx, my }
let synced      = true;
let activePanel = 'c';  // 'c' | 'p' — which panel owns the current interaction

function createBox(label, x, y, w = INIT_W, h = INIT_H) {
  return { id: nextId++, label, x, y, w, h };
}

const INITIAL_LABELS = [
  'Start', 'End', 'Task', 'Gateway',
  'User Task', 'Service Task', 'Script Task', 'Manual Task',
  'Exclusive Gateway', 'Parallel Gateway', 'Inclusive Gateway', 'Event Gateway',
  'Process Payment', 'Validate Order', 'Send Notification', 'Handle Exception',
  'Process Customer Payment Request',
  'Validate Order and Check Inventory',
  'Review and approve customer refund request based on policy',
  'Escalate unresolved tickets to level two support team',
];

function initBoxes(labels) {
  nextId = 0; refs = {}; boxes = [];
  labels.forEach((label, i) => {
    boxes.push(createBox(
      label,
      CANVAS_PAD + (i % COLS) * (INIT_W + GAP),
      CANVAS_PAD + Math.floor(i / COLS) * (INIT_H + GAP),
    ));
  });
}

// ─── SVG element creation ──────────────────────────────────────────────────────

// Returns { el, layoutMs } — layoutMs is just the createText() time.
function makeBoxEl(svg, box, usePretext) {
  enablePretext(usePretext);
  const tu = new Text({ style: STYLE });

  const g = svgCreate('g');
  svgAttr(g, { transform: `translate(${box.x},${box.y})` });

  const rect = svgCreate('rect');
  svgAttr(rect, {
    x: 0, y: 0, width: box.w, height: box.h, rx: 5, ry: 5,
    fill: FILL_DEFAULT, stroke: STROKE_DEFAULT, 'stroke-width': 1.5,
    style: 'cursor:move',
  });

  const totalT0 = performance.now();

  const layoutT0 = performance.now();
  const textEl = tu.createText(box.label, {
    box: { width: box.w, height: box.h },
    padding: PAD,
    align: 'center-middle',
  });
  const layoutMs = performance.now() - layoutT0;

  // Use CSS inline style for fill — higher specificity than SVG presentation attrs
  svgAttr(textEl, { style: `fill:${TEXT_COLOR};pointer-events:none` });

  const handle = svgCreate('rect');
  svgAttr(handle, {
    x: box.w - HANDLE_SIZE, y: box.h - HANDLE_SIZE,
    width: HANDLE_SIZE, height: HANDLE_SIZE, rx: 2, ry: 2,
    fill: HANDLE_FILL, style: 'cursor:se-resize',
  });

  svgAppend(g, rect);
  svgAppend(g, textEl);
  svgAppend(g, handle);
  svgAppend(svg, g);

  const totalMs = performance.now() - totalT0;

  return { el: { g, rect, textEl, handle, lineCount: textEl.children.length }, layoutMs, totalMs };
}

function rebuildText(el, box, usePretext) {
  enablePretext(usePretext);
  const tu = new Text({ style: STYLE });

  const t0 = performance.now();
  const newText = tu.createText(box.label, {
    box: { width: box.w, height: box.h },
    padding: PAD,
    align: 'center-middle',
  });
  const layoutMs = performance.now() - t0;

  svgAttr(newText, { style: `fill:${TEXT_COLOR};pointer-events:none` });
  el.g.replaceChild(newText, el.textEl);
  el.textEl = newText;
  el.lineCount = newText.children.length;
  svgAttr(el.rect,   { width: box.w, height: box.h });
  svgAttr(el.handle, { x: box.w - HANDLE_SIZE, y: box.h - HANDLE_SIZE });
  return layoutMs;
}

// ─── Canvas size ───────────────────────────────────────────────────────────────

function updateCanvasSize() {
  const svgC = document.getElementById('svg-current');
  const svgP = document.getElementById('svg-pretext');
  const maxX = boxes.reduce((m, b) => Math.max(m, b.x + b.w), 0) + CANVAS_PAD;
  const maxY = boxes.reduce((m, b) => Math.max(m, b.y + b.h), 0) + CANVAS_PAD;
  [svgC, svgP].forEach(s => svgAttr(s, { width: maxX, height: maxY }));
}

// ─── Diff + timing display ─────────────────────────────────────────────────────

function updateDiff() {
  let diffCount = 0;
  boxes.forEach(box => {
    const r = refs[box.id];
    if (!r) return;
    const differs = r.c.lineCount !== r.p.lineCount;
    const stroke = differs ? STROKE_DIFF : (box.id === selectedId ? STROKE_SELECTED : STROKE_DEFAULT);
    const sw = differs || box.id === selectedId ? 2.5 : 1.5;
    svgAttr(r.c.rect, { stroke, 'stroke-width': sw });
    svgAttr(r.p.rect, { stroke, 'stroke-width': sw });
    if (differs) diffCount++;
  });

  const el = document.getElementById('diff-count');
  el.textContent = diffCount === 0 ? '✓ No differences' : `⚠ ${diffCount} box${diffCount > 1 ? 'es' : ''} differ`;
  el.style.color = diffCount === 0 ? '#34d399' : '#f97316';
}

function setTiming(layoutC, totalC, layoutP, totalP) {
  document.getElementById('timing-current').textContent =
    `layout ${layoutC.toFixed(2)} ms · total ${totalC.toFixed(1)} ms`;
  document.getElementById('timing-pretext').textContent =
    `layout ${layoutP.toFixed(2)} ms · total ${totalP.toFixed(1)} ms`;
}

// ─── Full render (used on init and bulk add) ───────────────────────────────────

function fullRender() {
  const svgC = document.getElementById('svg-current');
  const svgP = document.getElementById('svg-pretext');
  while (svgC.firstChild) svgC.removeChild(svgC.firstChild);
  while (svgP.firstChild) svgP.removeChild(svgP.firstChild);
  refs = {};

  let layoutC = 0, totalC = 0, layoutP = 0, totalP = 0;
  boxes.forEach(box => {
    const { el, layoutMs, totalMs } = makeBoxEl(svgC, box, false);
    refs[box.id] = { c: el };
    layoutC += layoutMs; totalC += totalMs;
  });
  boxes.forEach(box => {
    const { el, layoutMs, totalMs } = makeBoxEl(svgP, box, true);
    refs[box.id].p = el;
    layoutP += layoutMs; totalP += totalMs;
  });

  updateCanvasSize();
  updateDiff();
  setTiming(layoutC, totalC, layoutP, totalP);
  enablePretext(false);
}

// ─── Interaction helpers ───────────────────────────────────────────────────────

function svgCoords(svg, e) {
  const r = svg.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function boxAtPoint(svg, e) {
  const { x, y } = svgCoords(svg, e);
  // Walk in reverse so topmost (last rendered) wins
  for (let i = boxes.length - 1; i >= 0; i--) {
    const b = boxes[i];
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b;
  }
  return null;
}

function isOnHandle(box, svg, e) {
  const { x, y } = svgCoords(svg, e);
  return (
    x >= box.x + box.w - HANDLE_SIZE && x <= box.x + box.w &&
    y >= box.y + box.h - HANDLE_SIZE && y <= box.y + box.h
  );
}

// ─── Mouse events ──────────────────────────────────────────────────────────────

function onMouseDown(svgEl, panel, e) {
  if (e.button !== 0) return;
  const box = boxAtPoint(svgEl, e);
  if (!box) { selectBox(null); return; }

  selectBox(box.id);
  activePanel = panel;

  if (isOnHandle(box, svgEl, e)) {
    resize = { id: box.id, ow: box.w, oh: box.h, mx: e.clientX, my: e.clientY };
  } else {
    drag = { id: box.id, ox: box.x, oy: box.y, mx: e.clientX, my: e.clientY };
  }
  e.preventDefault();
}

document.addEventListener('mousemove', (e) => {
  if (drag) {
    const box = boxes.find(b => b.id === drag.id);
    if (!box) return;
    box.x = Math.max(0, drag.ox + (e.clientX - drag.mx));
    box.y = Math.max(0, drag.oy + (e.clientY - drag.my));
    const t = `translate(${box.x},${box.y})`;
    const keys = synced ? ['c', 'p'] : [activePanel];
    keys.forEach(k => svgAttr(refs[box.id][k].g, { transform: t }));
    updateCanvasSize();
  }

  if (resize) {
    const box = boxes.find(b => b.id === resize.id);
    if (!box) return;
    box.w = Math.max(40, resize.ow + (e.clientX - resize.mx));
    box.h = Math.max(24, resize.oh + (e.clientY - resize.my));

    const keys = synced ? ['c', 'p'] : [activePanel];
    let layoutC = 0, layoutP = 0;
    if (keys.includes('c')) layoutC = rebuildText(refs[box.id].c, box, false);
    if (keys.includes('p')) layoutP = rebuildText(refs[box.id].p, box, true);

    updateCanvasSize();
    if (synced) updateDiff();
    setTiming(layoutC, 0, layoutP, 0);
    enablePretext(false);
  }
});

document.addEventListener('mouseup', () => { drag = null; resize = null; });

document.getElementById('svg-current').addEventListener('mousedown', e => onMouseDown(document.getElementById('svg-current'), 'c', e));
document.getElementById('svg-pretext').addEventListener('mousedown',  e => onMouseDown(document.getElementById('svg-pretext'),  'p', e));

// ─── Selection ─────────────────────────────────────────────────────────────────

function selectBox(id) {
  selectedId = id;
  const box = id !== null ? boxes.find(b => b.id === id) : null;
  const input = document.getElementById('label-input');
  input.value = box ? box.label : '';
  if (box) { input.focus(); input.select(); }
  updateDiff(); // re-applies selection stroke
}

document.getElementById('label-input').addEventListener('input', (e) => {
  if (selectedId === null) return;
  const box = boxes.find(b => b.id === selectedId);
  if (!box) return;
  box.label = e.target.value;

  const layoutC = rebuildText(refs[box.id].c, box, false);
  const layoutP = rebuildText(refs[box.id].p, box, true);

  updateDiff();
  setTiming(layoutC, 0, layoutP, 0);
  enablePretext(false);
});

document.getElementById('label-input').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { selectBox(null); e.target.blur(); }
});

// ─── Toolbar ───────────────────────────────────────────────────────────────────

document.getElementById('add-label').addEventListener('click', () => {
  const n = Math.max(1, parseInt(document.getElementById('add-count').value, 10) || 1);
  const newLabels = generateLabels(n);
  const lastBox = boxes[boxes.length - 1];
  let x = CANVAS_PAD, y = lastBox ? lastBox.y + lastBox.h + GAP : CANVAS_PAD;

  // Try to continue filling the current row
  if (lastBox) {
    const col = Math.round((lastBox.x - CANVAS_PAD) / (INIT_W + GAP));
    if (col < COLS - 1) {
      x = lastBox.x + lastBox.w + GAP;
      y = lastBox.y;
    }
  }

  const svgC = document.getElementById('svg-current');
  const svgP = document.getElementById('svg-pretext');

  let layoutC = 0, totalC = 0, layoutP = 0, totalP = 0;
  newLabels.forEach((label, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const box = createBox(
      label,
      CANVAS_PAD + col * (INIT_W + GAP),
      y + row * (INIT_H + GAP),
    );
    boxes.push(box);
    const { el, layoutMs, totalMs } = makeBoxEl(svgC, box, false);
    refs[box.id] = { c: el };
    layoutC += layoutMs; totalC += totalMs;
  });
  newLabels.forEach((_, i) => {
    const box = boxes[boxes.length - newLabels.length + i];
    const { el, layoutMs, totalMs } = makeBoxEl(svgP, box, true);
    refs[box.id].p = el;
    layoutP += layoutMs; totalP += totalMs;
  });

  updateCanvasSize();
  updateDiff();
  setTiming(layoutC, totalC, layoutP, totalP);
  enablePretext(false);
});

document.getElementById('width-slider').addEventListener('input', (e) => {
  const w = Number(e.target.value);
  document.getElementById('width-value').textContent = w + 'px';
  boxes.forEach(b => { b.w = w; });
  fullRender(); // always resyncs both panels
});

document.getElementById('toggle-sync').addEventListener('click', (e) => {
  synced = !synced;
  e.currentTarget.textContent = synced ? '⇄ Synced' : '⇄ Independent';
  e.currentTarget.style.color = synced ? '#34d399' : '#f97316';
  if (synced) {
    // Re-sync: rebuild pretext panel to match current state
    fullRender();
  }
});

document.getElementById('reset').addEventListener('click', () => {
  selectedId = null;
  _rng = makeLcg(0xcafebabe);
  document.getElementById('label-input').value = '';
  initBoxes(INITIAL_LABELS);
  fullRender();
});

// ─── Init ─────────────────────────────────────────────────────────────────────
initBoxes(INITIAL_LABELS);
document.fonts.ready.then(fullRender);
