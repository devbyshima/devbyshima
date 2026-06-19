import { mkdir, writeFile } from 'node:fs/promises';
import { fallback, link, main, top } from '../src/render';
import type { Year } from '../src/worker';

/**
 * Render every section to `dist/*.svg` using mock contribution data so the
 * output can be eyeballed locally without deploying or calling the GitHub API.
 *
 * Run with: pnpm preview
 */

const mockDays = Array.from({ length: 186 }, (_, i) => [0, 1, 0, 2, 3, 4, 2, 1, 0][i % 9]);
const years: Year[] = [
  { from: '2026-01-01T00:00:00.000Z', to: new Date().toISOString(), days: mockDays },
  { from: '2025-11-19T00:00:00.000Z', to: '2026-01-01T00:00:00.000Z', days: mockDays.slice(0, 78) }
];

const options = { dots: { rows: 6, size: 24, gap: 5 }, year: { gap: 5 } };
const sizes = years.map((year) => {
  const columns = Math.ceil(year.days.length / options.dots.rows);
  const width = columns * options.dots.size + (columns - 1) * options.dots.gap;
  const height = options.dots.rows * options.dots.size + (options.dots.rows - 1) * options.dots.gap;
  return [width, height];
});
const length = sizes.reduce((acc, size) => acc + size[0] + options.year.gap, 0) - options.year.gap;

const themes = ['light', 'dark'] as const;

await mkdir('dist', { recursive: true });

for (const theme of themes) {
  const files: Record<string, string> = {
    [`top-${theme}`]: top({ height: 20, contributions: 1234, theme }),
    [`link-website-${theme}`]: link({ height: 18, width: 100, index: 0, theme })('Website'),
    [`link-x-${theme}`]: link({ height: 18, width: 100, index: 1, theme })('X'),
    [`link-linkedin-${theme}`]: link({ height: 18, width: 100, index: 2, theme })('LinkedIn'),
    [`fallback-${theme}`]: fallback({ height: 180, width: 420, theme }),
    [`main-${theme}`]: main({ height: 290, years, sizes, length, theme, ...options })
  };

  for (const [name, content] of Object.entries(files)) {
    await writeFile(`dist/${name}.svg`, content.trim());
  }
}

console.log('...Wrote preview SVGs to ./dist');
