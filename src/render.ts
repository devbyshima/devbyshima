import type { Rank } from './rank';
import type { Year } from './worker';

const BP_MEDIUM = 550;
const BP_LARGE = 700;
const BODY_COPY = `I'm Shima. An indie developer and maker, building apps, tools, and small corners of the internet.`;

interface Props {
  width?: number;
  height: number;
  theme: 'light' | 'dark';
}

interface Attributes {
  height: string;
  'data-theme': 'light' | 'dark';
  [key: string]: string;
}

const attr = (obj: Record<string, string>) =>
  Object.entries(obj).reduce((acc, [key, value]) => `${acc} ${key}="${value}"`, '');

const svg = (styles: string, html: string, attributes: Attributes) => {
  if (!attributes.width) attributes.width = '100%';
  return /*html*/ `
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" ${attr(attributes)}>
		<foreignObject width="100%" height="100%">
			<div xmlns="http://www.w3.org/1999/xhtml">
				<style>${styles}</style>
				${html}
			</div>
		</foreignObject>
	</svg>`;
};

export const shared = /* css */ `
	:root {
		/* #E09D56, in the same five steps the graph used to climb through white */
		--color-accent: #E09D56;
		--color-accent-ink: #24292F;
		--color-text-light: #24292F;
		--color-dot-bg-0-light: #F7F0E8;
		--color-dot-bg-1-light: #EED3B5;
		--color-dot-bg-2-light: #E6B784;
		--color-dot-bg-3-light: #E09D56;
		--color-dot-bg-4-light: #AB6226;
		--color-dot-border-light: rgb(0 0 0 / 0.06);

		--color-text-dark: #C9D1D9;
		--color-dot-bg-0-dark: #281D15;
		--color-dot-bg-1-dark: #52361E;
		--color-dot-bg-2-dark: #865428;
		--color-dot-bg-3-dark: #C2782E;
		--color-dot-bg-4-dark: #E09D56;
		--color-dot-border-dark: rgb(255 255 255 / 0.05);

		/* Initial animation offset... */
		--default-delay: 1s;
		--default-duration: 1.55s;
		--default-stagger: 0.1s;

		/* Animation orchestration */
		--animate-in-menu-delay: calc(var(--default-delay) + var(--default-stagger) * 0);
		--animate-in-links-delay: calc(var(--default-delay) + var(--default-stagger) * 1);
		--animate-in-contributions-delay: calc(var(--default-delay) + var(--default-stagger) * 5);
		--animate-in-readme-delay: calc(var(--default-delay) + var(--default-stagger) * 6);
		--animate-in-copy-delay: calc(var(--default-delay) + var(--default-stagger) * 7);
		--animate-in-graph-delay: calc(var(--default-delay) + var(--default-stagger) * 17);
	}

	[data-theme="dark"] {
		--color-text: var(--color-text-dark);
		--color-dot-bg-0: var(--color-dot-bg-0-dark);
		--color-dot-bg-1: var(--color-dot-bg-1-dark);
		--color-dot-bg-2: var(--color-dot-bg-2-dark);
		--color-dot-bg-3: var(--color-dot-bg-3-dark);
		--color-dot-bg-4: var(--color-dot-bg-4-dark);
		--color-dot-border: var(--color-dot-border-dark);
	}

	[data-theme="light"] {
		--color-text: var(--color-text-light);
		--color-dot-bg-0: var(--color-dot-bg-0-light);
		--color-dot-bg-1: var(--color-dot-bg-1-light);
		--color-dot-bg-2: var(--color-dot-bg-2-light);
		--color-dot-bg-3: var(--color-dot-bg-3-light);
		--color-dot-bg-4: var(--color-dot-bg-4-light);
		--color-dot-border: var(--color-dot-border-light);
	}

	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
	}

	.wrapper {
		contain: strict;
		block-size: calc(var(--size-height) * 1px);
		container-type: inline-size;
		position: relative;
		overflow: clip;

		font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
		color: var(--color-text);
	}

	/* Hide everything in Firefox by default – show fallback instead */
	@-moz-document url-prefix() {
		.wrapper {
			display: none;
		}
	}

	.label {
		contain: content;
		font-size: 14px;
		font-weight: 600;
	}

	.link {
		contain: content;
		font-size: 14px;
	}

	.fade-in {
		will-change: opacity;
		animation-name: fade-in;
		animation-fill-mode: both;
		animation-duration: var(--duration, var(--default-duration));
		animation-timing-function: var(--ease, ease-out);
		animation-delay: var(--delay, var(--default-delay));
	}

	p {
		constrain: content;
		margin: 0;
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	.shine {
		background-color: var(--color-text);
		background-image: linear-gradient(-75deg,
			rgb(0 0 0 / 0) 0%,
			rgb(255 255 255 / 0.18) 15%,
			rgb(0 0 0 / 0) 25%
		);
		background-size: 200%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-fill-color: transparent;

		animation-name: shine;
		animation-duration: 14s;
		animation-iteration-count: infinite;
	}

	@keyframes shine {
		0% {
			background-position: 200%;
		}
		10% {
			background-position: 0%;
		}
		to {
			background-position: 0%;
		}
	}
`;

export type Main = {
  years: Year[];
  sizes: number[][];
  length: number;
  dots: {
    rows: number;
    size: number;
    gap: number;
  };
  year: {
    gap: number;
  };
};

export const main = (props: Props & Main) => {
  const styles = /*css*/ `
		${shared}

		:root {
			--rows: ${props.dots.rows};
			--size-width: 100cqw;
			--size-height: ${props.height};
			--size-dot-gap: ${props.dots.gap};
			--size-dot: ${props.dots.size};
			--size-year-gap: ${props.year.gap};
			--size-label-height: 20;
			--duration: 360;
		}

		.wrapper {
			align-items: flex-end;
			grid-template-rows: 1fr auto;
			row-gap: 20px;
		}

		.intro {
			contain: content;
			grid-area: 1 / 1 / span 1 / span 6;
			font-size: 18px;
			font-weight: 300;
		}
		.intro span {
			contain: content;
			--duration: 980ms;
			--delay: calc(var(--animate-in-copy-delay) + var(--i) * 10ms);
		}

		@media (width > ${BP_MEDIUM}px) {
			.intro {
				grid-area: 1 / 3 / span 1 / span 4;
				font-size: 22px;
			}
		}
		@media (width > ${BP_LARGE}px) {
			.intro {
				grid-area: 1 / 4 / span 1 / span 3;
			}
		}

		.graph {
			--delay: var(--animate-in-graph-delay);
			grid-area: 2 / 1 / span 1 / span 6;
			overflow: clip;
			min-inline-size: 0;

			animation-name: fade-in;
			animation-timing-function: ease-out;
			animation-duration: 2.5s;
			animation-fill-mode: both;
			animation-delay: var(--animate-in-graph-delay);
		}

		.years {
			--size-loop-gap: 120;
			--_h: calc(var(--h) + var(--size-label-height));

			display: flex;
			inline-size: max-content;
			block-size: calc(var(--_h) * 1px);
			will-change: transform;
			backface-visibility: hidden;

			/* --w is one year. The loop gap sits after it, so the repeat doesn't touch. */
			animation-name: scroll;
			animation-timing-function: linear;
			animation-duration: calc((var(--w) + var(--size-loop-gap)) * 0.03s);
			animation-iteration-count: infinite;
			animation-delay: var(--animate-in-graph-delay);
		}
		@media (prefers-reduced-motion: reduce) {
			.years {
				animation: none;
			}
		}
		@keyframes scroll {
			from {
				transform: translateX(0);
			}
			to {
				transform: translateX(-50%);
			}
		}

		.years__set {
			display: flex;
			flex: none;
			padding-inline-end: calc(var(--size-loop-gap) * 1px);
		}

		.year {
			contain: strict;
			flex: none;
			inline-size: calc(var(--w) * 1px);
			block-size: calc(var(--_h) * 1px);
		}

		.year__label {
			contain: strict;
			block-size: calc(var(--size-label-height) * 1px);
			display: flex;
			align-items: end;
		}
		.year__days {
			display: grid;
			grid-auto-flow: column;
			grid-template-rows: repeat(var(--rows), calc(var(--size-dot) * 1px));
			grid-auto-columns: calc(var(--size-dot) * 1px);
			gap: calc(var(--size-dot-gap) * 1px);

			contain: strict;
			inline-size: calc(var(--w) * 1px);
			block-size: calc(var(--h) * 1px);
		}
		.year__days .dot {
			contain: strict;
			aspect-ratio: 1;
			inline-size: calc(var(--size-dot) * 1px);
			block-size: calc(var(--size-dot) * 1px);
			border: calc(var(--size-dot) * 0.075 * 1px) solid var(--color-dot-border);
			border-radius: calc(var(--size-dot) * 0.15 * 1px);
			will-change: transform;
		}
		.dot--0 { background-color: var(--color-dot-bg-0); }
		.dot--1 { background-color: var(--color-dot-bg-1); }
		.dot--2 { background-color: var(--color-dot-bg-2); }
		.dot--3 { background-color: var(--color-dot-bg-3); }
		.dot--4 { background-color: var(--color-dot-bg-4); }
	`;

  const days = (levels: Year['days']) =>
    levels.map((level) => `<div class="dot dot--${level}"></div>`).join('');

  // Stored newest-first. The strip reads January at the left through December at the right.
  const januaryToDecember = (year: Year) => {
    const yearNum = new Date(year.from).getUTCFullYear();
    const total =
      Math.round((Date.UTC(yearNum, 11, 31) - Date.UTC(yearNum, 0, 1)) / 86_400_000) + 1;
    const levels = [...year.days].reverse();
    while (levels.length < total) levels.push(0);
    return levels.slice(0, total);
  };

  // The graph is one calendar year, looped. years[0] is the current year.
  const year = props.years[0];
  const levels = januaryToDecember(year);
  const columns = Math.ceil(levels.length / props.dots.rows);
  const width = columns * props.dots.size + Math.max(0, columns - 1) * props.dots.gap;
  const height = props.dots.rows * props.dots.size + (props.dots.rows - 1) * props.dots.gap;
  const label = new Date(year.from).getUTCFullYear();

  const yearSet = (hidden = false) => /* html */ `
		<div class="years__set"${hidden ? ' aria-hidden="true"' : ''}>
			<div class="year" style="--w: ${width}; --h: ${height};">
				<div class="year__days">${days(levels)}</div>
				<div class="year__label label"><span>${label}</span></div>
			</div>
		</div>
	`;

  const html = /* html */ `
		<main class="wrapper grid">
			<article class="intro">
				<p>${BODY_COPY.split('')
          .map((c, i) => `<span class="fade-in" style="--i: ${i};">${c}</span>`)
          .join('')}</p>
			</article>
			<article class="graph">
				<div class="years" style="--w: ${width}; --h: ${height};">
					${yearSet()}
					${yearSet(true)}
				</div>
			</article>
		</main>
	`;

  return svg(styles, html, {
    height: `${props.height}`,
    'data-theme': `${props.theme}`
  });
};

export const top = (props: Props & { contributions: number }) => {
  const styles = /* css */ `
		${shared}

		:root {
			--size-height: ${props.height};
		}

		.wrapper {
			align-items: center;
		}

		.menu {
			--delay: var(--animate-in-menu-delay);
			contain: content;
			text-align: left;
			grid-area: 1 / 1 / span 1 / span 2;
		}
		.contributions {
			--delay: var(--animate-in-contributions-delay);
			contain: strict; /* hide, show later */
			grid-area: 1 / 3 / span 1 / span 2;
		}
		.readme {
			--delay: var(--animate-in-readme-delay);
			contain: content;
			text-align: right;
			grid-area: 1 / 5 / span 1 / span 2;
		}

		@media (width > ${BP_MEDIUM}px) {
			.menu {
				grid-area: 1 / 1 / span 1 / span 2;
			}
			.contributions {
				contain: content; /* show agian */
				grid-area: 1 / 3 / span 1 / span 2;
			}
			.readme {
				grid-area: 1 / 5 / span 1 / span 2;
			}
		}

		@media (width > ${BP_LARGE}px) {
			.menu {
				grid-area: 1 / 1 / span 1 / span 3;
			}
			.contributions {
				grid-area: 1 / 4 / span 1 / span 2;
			}
			.readme {
				grid-area: 1 / 6 / span 1 / span 1;
			}
		}
	`;

  const count =
    props.contributions >= 1000
      ? `${(props.contributions / 1000).toFixed(1)}k`
      : `${props.contributions}`;

  const html = /*html*/ `
		<div class="wrapper grid label">
			<div class="menu fade-in">Menu</div>
			<div class="contributions fade-in">
				<span class="shine">${count}</span> Contributions
			</div>
			<div class="readme fade-in">readme.md</div>
		</div>
	`;

  return svg(styles, html, {
    height: `${props.height}`,
    'data-theme': `${props.theme}`
  });
};

export const link = (props: Props & { index: number }) => (label: string) => {
  const styles = /*css*/ `
		${shared}

		:root {
			--size-height: ${props.height};
			--size-width: ${props.width};
			--i: ${props.index};
		}

		.wrapper {
			--delay: calc(var(--animate-in-links-delay) + var(--i) * 1.2s);
		}
		@-moz-document url-prefix() {
			/* Overwrite default, allow this to show in FF */
			.wrapper {
				display: block;
			}
		}

		.link {
			display: flex;
			justify-content: start;
			align-items: center;
			gap: 3px;
		}
		.link__label {
			animation-delay: ${Math.random() * 10}s;
		}
		.link__arrow {
			color: var(--color-accent);
			font-size: 0.75em;
			position: relative;
			inset-block-start: 0.1em;
			animation-name: rotate;
			animation-duration: 5s;
			animation-timing-function: ease-in-out;
			animation-iteration-count: infinite;
			animation-delay: ${Math.random() * 5}s;
		}

		@keyframes rotate {
			0% {
				transform: rotate(0deg);
			}
			10%,
			100% {
				transform: rotate(360deg);
			}
		}
	`;

  const html = /*html*/ `
		<main class="wrapper">
			<a class="link fade-in">
				<div class="link__label shine">${label}</div>
				<div class="link__arrow">↗</div>
			</a>
		</main>
	`;

  return svg(styles, html, {
    width: `${props.width}`,
    height: `${props.height}`,
    'data-theme': `${props.theme}`
  });
};

export const tag = (props: Props & { rank: Rank }) => {
  const styles = /*css*/ `
		${shared}

		:root {
			--size-height: ${props.height};
			--size-width: ${props.width};

			/* GitHub's page background, for text set on a filled tag */
			--color-bg-light: #FFFFFF;
			--color-bg-dark: #0D1117;
		}

		[data-theme="dark"] {
			--color-bg: var(--color-bg-dark);
		}

		[data-theme="light"] {
			--color-bg: var(--color-bg-light);
		}

		.wrapper {
			--delay: calc(var(--animate-in-graph-delay) + 1s);
			display: flex;
			align-items: end;
		}
		@-moz-document url-prefix() {
			/* Overwrite default, allow this to show in FF */
			.wrapper {
				display: flex;
			}
		}

		.tag {
			display: inline-flex;
			block-size: 20px;
			border: 1px solid var(--color-text);
			border-radius: 4px;
			overflow: hidden;
			font-size: 12px;
			line-height: 18px;
			white-space: nowrap;
		}
		.tag__label,
		.tag__value {
			padding-inline: 7px;
		}
		.tag__value {
			background-color: var(--color-accent);
			color: var(--color-accent-ink);
			font-weight: 600;
		}
	`;

  const { country, position } = props.rank;
  const value =
    position === undefined
      ? country
      : position === 0
        ? `${country} unranked`
        : `${country} #${position}`;

  const html = /*html*/ `
		<main class="wrapper">
			<div class="tag fade-in">
				<span class="tag__label">committers.top</span>
				<span class="tag__value">${value}</span>
			</div>
		</main>
	`;

  return svg(styles, html, {
    width: `${props.width}`,
    height: `${props.height}`,
    'data-theme': `${props.theme}`
  });
};

export const fallback = (props: Props & { width: number }) => {
  const styles = /* css */ `
		${shared}

		:root {
			--size-height: ${props.height};
			--size-width: ${props.width};
		}

		.wrapper {
			display: none;
		}
		@-moz-document url-prefix() {
			/* Hide everywhere but Firefox */
			.wrapper {
				display: flex;
				align-items: end;
			}
		}

		.intro {
			font-size: 22px;
			font-weight: 300;
		}
		.intro span {
			contain: content;
			--duration: 980ms;
			--delay: calc(var(--animate-in-contributions-delay) + var(--i) * 10ms);
		}

		.hint {
			--duration: 1.2s;
			--delay: calc(var(--animate-in-contributions-delay) + 2.5s);
			margin-block-start: 10px;
			font-size: 10px;
			font-style: italic;
		}
	`;

  const html = /* html */ `
		<main class="wrapper">
			<div class="intro">
				<p>${BODY_COPY.split('')
          .map((c, i) => `<span class="fade-in" style="--i: ${i};">${c}</span>`)
          .join('')}</p>
				<p class="hint fade-in">— I'm all for the foxy browser, but try Chrome/Safari for this one!</p>
			</div>
		</main>
	`;

  return svg(styles, html, {
    width: `${props.width}`,
    height: `${props.height}`,
    'data-theme': `${props.theme}`,
    viewbox: `0 0 ${props.width} ${props.height}`
  });
};
