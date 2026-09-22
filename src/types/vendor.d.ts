declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'json-url' {
  type Algorithm = 'lzma' | 'lzstring' | 'lzw' | 'msgpack' | 'safe64';

  type Codec = {
    compress(value: unknown): Promise<string>;
    decompress(value: string | string[]): Promise<string>;
  };

  export default function jsonUrl(algorithm: Algorithm): Codec;
}

declare module 'react-helmet' {
  import type { ComponentType, ReactNode } from 'react';

  export const Helmet: ComponentType<{ children?: ReactNode }>;
}

declare module 'react-color' {
  import type { ComponentType } from 'react';

  export type ColorResult = {
    rgb: { r: number; g: number; b: number; a?: number };
  };

  export const SketchPicker: ComponentType<{
    color?: string;
    className?: string;
    onChangeComplete?: (color: ColorResult) => void;
    presetColors?: string[];
  }>;
}
