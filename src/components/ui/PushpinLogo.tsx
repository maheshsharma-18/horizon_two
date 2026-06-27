import type { SVGProps } from "react";

/**
 * Underpin's pushpin mark. Uses fill="currentColor" so it's recolorable
 * via Tailwind text-color utilities wherever it's placed — e.g.
 * `<PushpinLogo className="w-6 h-6 text-on-surface" />` for the near-black
 * "dark" wordmark on the light app background, or `text-surface`/`text-white`
 * if it ever sits on a dark or saturated surface. No separate light/dark
 * SVG files needed.
 */
export function PushpinLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 90 112.5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M83.2 22.8C80.4 20 68.6 8.2 65.8 5.5c-2.8-2.8-8 0-7.7 3.8.4 4.5 0 5.9-3.8 8.8-8 6.2-12.1 9.5-15.3 11.8-6.5 4.5-12.1-1.4-18.7 2.3-5.3 3-5 7.4-2.3 10.1l28.4 28.4c2.7 2.7 7.1 3 10.1-2.3 3.7-6.5-2.2-12.2 2.3-18.7 2.4-3.2 5.6-7.3 11.8-15.3 2.9-3.8 4.3-4.2 8.8-3.8 3.8.2 6.6-5 3.8-7.8M28.7 55.2S4.8 81.3 3.9 82.4s-.6 1.9.1 2.6 1.6 1 2.6.1 27.2-24.8 27.2-24.8z" />
    </svg>
  );
}
