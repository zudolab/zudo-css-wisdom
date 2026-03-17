export interface HeaderNavItem {
  label: string;
  labelKey?: string;
  path: string;
  categoryMatch?: string;
}

export interface ColorModeConfig {
  defaultMode: "light" | "dark";
  lightScheme: string;
  darkScheme: string;
  respectPrefersColorScheme: boolean;
}

export interface LocaleConfig {
  label: string;
  dir: string;
}

export interface VersionConfig {
  slug: string;
  label: string;
  docsDir: string;
  banner?: "unmaintained" | "unreleased";
  locales?: Record<string, LocaleConfig>;
}

export interface FooterConfig {
  links: Array<{
    title: string;
    items: Array<{ label: string; href: string }>;
  }>;
  copyright?: string;
}

export interface HtmlPreviewConfig {
  head?: string;
  css?: string;
  js?: string;
}
