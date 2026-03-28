type MiddlewareContext = {
  request: { url: string };
  redirect: (url: string, status?: 300 | 301 | 302 | 303 | 304 | 307 | 308) => Response;
};

type MiddlewareNext = () => Response | Promise<Response>;

/**
 * trailingSlash が有効な場合、末尾スラッシュなしのURLを
 * 末尾スラッシュありのURLへ301リダイレクトするミドルウェア。
 *
 * Astro の dev サーバーは trailingSlash: "always" を設定しても
 * 自動リダイレクトしないため、ミドルウェアで補完する。
 */
export function trailingSlashHandler(
  context: MiddlewareContext,
  next: MiddlewareNext,
  trailingSlash: boolean,
): Response | Promise<Response> {
  if (!trailingSlash) {
    return next();
  }

  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 既に末尾スラッシュがある場合はスキップ
  if (pathname.endsWith("/")) {
    return next();
  }

  // Astro内部パスはスキップ
  if (pathname.startsWith("/_astro/") || pathname.startsWith("/_image")) {
    return next();
  }

  // 最後のパスセグメントにファイル拡張子がある場合はスキップ（静的アセット）
  // 拡張子はアルファベットで始まるもののみ対象（v2.0 のような誤検出を防ぐ）
  const lastSegment = pathname.split("/").pop() || "";
  if (/\.[a-zA-Z]\w*$/.test(lastSegment)) {
    return next();
  }

  // 末尾スラッシュを付与して301リダイレクト
  const redirectUrl = pathname + "/" + url.search;
  return context.redirect(redirectUrl, 301);
}
