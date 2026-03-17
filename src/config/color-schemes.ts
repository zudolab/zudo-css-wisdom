/** A color reference: palette index (number) or direct color value (string) */
export type ColorRef = number | string;

export interface ColorScheme {
  background: ColorRef;
  foreground: ColorRef;
  cursor: ColorRef;
  selectionBg: ColorRef;
  selectionFg: ColorRef;
  palette: [
    string, string, string, string, string, string, string, string,
    string, string, string, string, string, string, string, string,
  ];
  shikiTheme: NonNullable<import("astro").ShikiConfig["theme"]>;
  /** Optional semantic overrides — when omitted, defaults are used:
   *  surface=p0, muted=p8, accent=p5, accentHover=p14
   *  codeBg=p10, codeFg=p11, success=p2, danger=p1, warning=p3, info=p4
   *  Each field accepts a palette index (number) or a direct color value (string). */
  semantic?: {
    surface?: ColorRef;
    muted?: ColorRef;
    accent?: ColorRef;
    accentHover?: ColorRef;
    codeBg?: ColorRef;
    codeFg?: ColorRef;
    success?: ColorRef;
    danger?: ColorRef;
    warning?: ColorRef;
    info?: ColorRef;
    mermaidNodeBg?: ColorRef;
    mermaidText?: ColorRef;
    mermaidLine?: ColorRef;
    mermaidLabelBg?: ColorRef;
    mermaidNoteBg?: ColorRef;
    chatUserBg?: ColorRef;
    chatUserText?: ColorRef;
    chatAssistantBg?: ColorRef;
    chatAssistantText?: ColorRef;
  };
}

export const colorSchemes: Record<string, ColorScheme> = {
  "ZCSS Dark": {
    background: "#181818",
    foreground: "#b8b8b8",
    cursor: "oklch(70.4% 0.04 256.788)",
    selectionBg: "#383838",
    selectionFg: "#e0e0e0",
    palette: [
      "#1c1c1c", "#da6871", "#93bb77", "#dfbb77",
      "#5caae9", "#c074d6", "oklch(70.4% 0.04 256.788)", "#a0a0a0",
      "#888888", "#da6871", "#93bb77", "#dfbb77",
      "#5caae9", "#c074d6", "oklch(80% 0.057 256.788)", "#b8b8b8",
    ],
    shikiTheme: "dracula",
    semantic: {
      accent: "oklch(70.4% 0.04 256.788)",
      accentHover: "oklch(80% 0.057 256.788)",
      muted: "#888888",
      surface: "#222222",
    },
  },
  "ZCSS Light": {
    background: "#f8f8f8",
    foreground: "#303030",
    cursor: "oklch(70.4% 0.04 256.788)",
    selectionBg: "#303030",
    selectionFg: "#f8f8f8",
    palette: [
      "#2a2a2a", "#bd4b53", "#266538", "#7a5218",
      "#3277c8", "#977acc", "oklch(70.4% 0.04 256.788)", "#707070",
      "#808080", "#9c2d3f", "#327e48", "#654516",
      "#5b99dc", "#b89ee7", "oklch(65% 0.027 256.788)", "#989898",
    ],
    shikiTheme: "github-light",
    semantic: {
      accent: "oklch(70.4% 0.04 256.788)",
      accentHover: "oklch(65% 0.027 256.788)",
      surface: "#eeeeee",
    },
  },
};
