import Text, { enablePretext } from 'lib/util/Text';

// ─── Configuration ─────────────────────────────────────────────────────────────
// Mirrors bpmn-js TextRenderer defaults.
const FONT_FAMILY     = 'Arial, sans-serif';
const FONT_SIZE       = 12;
const LINE_HEIGHT_RATIO = 1.2;
const BOX_WIDTH       = 150;
const BOX_HEIGHT      = 50;
const PADDING         = 5;

const STYLE = {
  fontFamily: FONT_FAMILY,
  fontSize: FONT_SIZE,
  fontWeight: 'normal',
  lineHeight: LINE_HEIGHT_RATIO,
};

const OPTS = {
  box: { width: BOX_WIDTH, height: BOX_HEIGHT },
  padding: PADDING,
};

// ─── Sample texts ───────────────────────────────────────────────────────────────
const TEXT_SAMPLES = [
  'Start', 'End', 'Task', 'Gateway', 'Start Event', 'End Event',
  'User Task', 'Service Task', 'Script Task',
  'Exclusive Gateway', 'Parallel Gateway', 'Intermediate Event',
  'Process Payment', 'Validate Order', 'Send Notification', 'Handle Exception',
  'Process Customer Payment Request',
  'Validate Order and Check Inventory',
  'Send Confirmation Email to Customer',
  'Review and Approve Work Order',
  'Handle Exception and Retry Operation',
  'Notify administrator about the error condition',
  'Check inventory availability and update stock records in the system',
  'Review and approve customer refund request based on company policy',
  'Send automated notification to all stakeholders about process completion',
  'Escalate unresolved tickets to the level two technical support team',
  'Perform quality assurance review and document results for compliance',
  'Evaluate business impact and escalate to senior management if needed',
  'Verify payment details and confirm order before dispatching to warehouse',
  'Coordinate with logistics team to schedule pickup and delivery window',
];

function generateTexts(count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(TEXT_SAMPLES[i % TEXT_SAMPLES.length]);
  return out;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// ─── Benchmark runners ──────────────────────────────────────────────────────────

function runBatch(texts) {
  const textUtil = new Text({ style: STYLE });
  const t = performance.now();
  for (const text of texts) textUtil.getDimensions(text, OPTS);
  return performance.now() - t;
}

async function runScenario(count) {
  const texts = generateTexts(count);

  // Warmup pass (small slice, both engines)
  enablePretext(false);
  runBatch(texts.slice(0, 10));
  enablePretext(true);
  runBatch(texts.slice(0, 10));
  await sleep(80);

  // ── Cold: 3 runs each ──────────────────────────────────────────────────────
  const currentCold = [], pretextCold = [];

  for (let i = 0; i < 3; i++) {
    await sleep(30);
    enablePretext(false);
    currentCold.push(runBatch(texts));

    await sleep(30);
    enablePretext(true);
    pretextCold.push(runBatch(texts));
  }

  await sleep(80);

  // ── Hot re-layout: same texts, slightly different box (simulates resize) ───
  const altOpts = { box: { width: BOX_WIDTH - 20, height: BOX_HEIGHT }, padding: PADDING };
  const altTextUtil = new Text({ style: STYLE });

  function runHot(texts) {
    const t = performance.now();
    for (const text of texts) altTextUtil.getDimensions(text, altOpts);
    return performance.now() - t;
  }

  const currentHot = [], pretextHot = [];

  for (let i = 0; i < 3; i++) {
    await sleep(30);
    enablePretext(false);
    currentHot.push(runHot(texts));

    await sleep(30);
    enablePretext(true);
    pretextHot.push(runHot(texts));
  }

  return {
    count,
    cold: { currentMs: median(currentCold), pretextMs: median(pretextCold) },
    hot:  { currentMs: median(currentHot),  pretextMs: median(pretextHot)  },
  };
}

// ─── UI ────────────────────────────────────────────────────────────────────────
function fmt(ms) { return ms < 1 ? ms.toFixed(3) : ms.toFixed(1); }

function speedupBadge(factor) {
  if (!isFinite(factor)) return '<span class="badge" style="background:#1e3a2a">—</span>';
  const label = `${factor.toFixed(1)}×`;
  const hue = Math.min(factor * 8, 120);
  return `<span class="badge" style="background:hsl(${hue},70%,38%)">${label}</span>`;
}

function appendRow(result) {
  if (window.__chartPush) window.__chartPush(result);

  const { count, cold, hot } = result;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="num">${count}</td>
    <td class="num">${fmt(cold.currentMs)}</td>
    <td class="num">${fmt(cold.pretextMs)}</td>
    <td class="num">${speedupBadge(cold.currentMs / cold.pretextMs)}</td>
    <td class="num sep">${fmt(hot.currentMs)}</td>
    <td class="num">${fmt(hot.pretextMs)}</td>
    <td class="num">${speedupBadge(hot.currentMs / hot.pretextMs)}</td>
  `;
  document.getElementById('results-body').appendChild(row);
}

function setStatus(msg, done = false) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = done ? 'done' : '';
}

async function run() {
  document.getElementById('run').disabled = true;
  document.getElementById('results-body').innerHTML = '';
  setStatus('Waiting for fonts…');

  await document.fonts.ready;
  await sleep(100);

  const counts = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
  for (const count of counts) {
    setStatus(`Running ${count} nodes…`);
    await sleep(50);
    appendRow(await runScenario(count));
  }

  // Reset flag to default after benchmark
  enablePretext(false);
  setStatus('Done.', true);
  document.getElementById('run').disabled = false;
}

document.getElementById('run').addEventListener('click', run);
