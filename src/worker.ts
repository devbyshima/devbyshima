import { fallback, link, main, top } from './render.js';
import data from './stats.json';

export type Year = {
  from: string;
  to: string;
  days: number[];
};

const MAX_YEARS = 3;

const worker: ExportedHandler = {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const theme = (searchParams.get('theme') ?? 'light') as 'light' | 'dark';
    const section = searchParams.get('section') ?? '';
    let content = ':-)';

    if (section === 'top') {
      const { contributions } = data;
      content = top({ height: 20, contributions, theme });
    } else if (section === 'link-website') {
      const index = Number(searchParams.get('i')) || 0;
      content = link({ height: 18, width: 100, index, theme })('Website');
    } else if (section === 'link-x') {
      const index = Number(searchParams.get('i')) || 0;
      content = link({ height: 18, width: 100, index, theme })('X');
    } else if (section === 'link-linkedin') {
      const index = Number(searchParams.get('i')) || 0;
      content = link({ height: 18, width: 100, index, theme })('LinkedIn');
    } else if (section === 'fallback') {
      content = fallback({ height: 180, width: 420, theme });
    } else {
      const years = data.years.slice(0, MAX_YEARS);
      const options = {
        dots: {
          rows: 6,
          size: 24,
          gap: 5
        },
        year: {
          gap: 5
        }
      };

      // Used to give the containing div `contain: strict` for performance reasons.
      const sizes = years.map((year) => {
        const columns = Math.ceil(year.days.length / options.dots.rows);
        const width = columns * options.dots.size + (columns - 1) * options.dots.gap;
        const height =
          options.dots.rows * options.dots.size + (options.dots.rows - 1) * options.dots.gap;
        return [width, height];
      });

      // Calculate total length based on the width of the columns and the year gap
      const length =
        sizes.reduce((acc, size) => {
          acc += size[0] + options.year.gap;
          return acc;
        }, 0) - options.year.gap;

      content = main({ height: 290, years, sizes, length, theme, ...options });
    }

    return new Response(content, {
      headers: {
        'content-type': 'image/svg+xml',
        'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        pragma: 'no-cache',
        expires: '0'
      }
    });
  }
};

export default worker;
