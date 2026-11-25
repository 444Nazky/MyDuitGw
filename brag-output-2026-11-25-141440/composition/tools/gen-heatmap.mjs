// Bakes the heatmap grids into the scene files. Deterministic: same output on
// every run, no Math.random or Date.now inside the composition itself.
import { readFileSync, writeFileSync } from 'node:fs';

const COLORS = {
  idle: 'rgba(139,92,246,0.22)',
  expense: '#52525B',
  income: '#8B5CF6',
  future: 'rgba(255,255,255,0.05)',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86400000;

const hash = (key) => {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1000;
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const today = startOfDay(new Date());
const lastSunday = new Date(today.getTime() - today.getDay() * DAY_MS);
const firstSunday = new Date(lastSunday.getTime() - 52 * 7 * DAY_MS);

// Sample data shape: mostly quiet days, spending clusters on weekends, a handful
// of income days, plus one expense on the most recent completed day.
const toneFor = (date) => {
  if (date.getTime() > today.getTime()) return 'future';
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const h = hash(key);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  if (h % 17 === 0) return 'income';
  if (h % (weekend ? 2 : 3) === 0) return 'expense';
  return 'idle';
};

const weeks = [];
for (let week = 0; week < 53; week += 1) {
  const weekStart = new Date(firstSunday.getTime() + week * 7 * DAY_MS);
  const days = [];
  let label = null;
  for (let day = 0; day < 7; day += 1) {
    const date = new Date(weekStart.getTime() + day * DAY_MS);
    days.push(toneFor(date));
    if (!label && date.getDate() === 1) label = MONTHS[date.getMonth()];
  }
  weeks.push({ days, label });
}

// the newest tracked day carries today's expense
const lastIdx = weeks.length - 1;
const todayIdx = today.getDay();
weeks[lastIdx].days[todayIdx] = 'expense';

const strip = `<div class="hm-strip-row">${weeks
  .map(
    (week) =>
      `<div class="hm-strip-col">${week.days
        .map((tone) => `<i style="background:${COLORS[tone]}"></i>`)
        .join('')}</div>`,
  )
  .join('')}</div>`;

const labels = `<div id="yr-labels">${weeks
  .map(
    (week) =>
      `<div class="yr-month-slot">${week.label ? `<span class="yr-month">${week.label}</span>` : ''}</div>`,
  )
  .join('')}</div>`;

const grid = `<div id="yr-grid">${weeks
  .map(
    (week) =>
      `<div class="y-col">${week.days
        .map((tone) => `<div class="y-cell" style="background:${COLORS[tone]}"></div>`)
        .join('')}</div>`,
  )
  .join('')}</div>`;

const year = `${labels}\n${grid}`;

const files = [
  ['compositions/home.html', '<!--HEATMAP_STRIP-->', strip],
  ['compositions/tap.html', '<!--HEATMAP_STRIP-->', strip],
  ['compositions/year.html', '<!--HEATMAP_YEAR-->', year],
];

for (const [file, token, markup] of files) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(token)) {
    console.warn(`no token ${token} in ${file}`);
    continue;
  }
  writeFileSync(file, source.split(token).join(markup));
  console.log(`baked ${file}`);
}
