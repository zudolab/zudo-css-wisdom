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

<<<<<<< HEAD
export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterLinkColumn {
  title: string;
  items: FooterLinkItem[];
}

export interface FooterConfig {
  links: FooterLinkColumn[];
  /** Copyright text displayed at the bottom of the footer. HTML is supported. */
=======
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
>>>>>>> update-zudo-doc-base/config-content
  copyright?: string;
}

export interface HtmlPreviewConfig {
<<<<<<< HEAD
  /** Raw HTML injected into <head> (links, meta, fonts) */
  head?: string;
  /** CSS injected as <style> after preflight */
  css?: string;
  /** JS injected as <script> before </body> */
  js?: string;
}

export interface VersionConfig {
  /** Version identifier, used in URL path (e.g., "1.0", "v1") */
  slug: string;
  /** Display label (e.g., "1.0.0", "Version 1") */
  label: string;
  /** Content directory for this version's English docs */
  docsDir: string;
  /** Per-locale content directories for this version */
  locales?: Record<string, { dir: string }>;
  /** Banner text shown on versioned pages (e.g., "unmaintained", "unreleased") */
  banner?: "unmaintained" | "unreleased" | false;
}
=======
  head?: string;
  css?: string;
  js?: string;
}
>>>>>>> update-zudo-doc-base/config-content
