/// <reference types="react" />

declare namespace JSX {
    interface IntrinsicElements {
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
    }
  }