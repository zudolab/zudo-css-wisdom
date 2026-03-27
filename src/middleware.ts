import { defineMiddleware } from "astro:middleware";
import { settings } from "@/config/settings";
import { trailingSlashHandler } from "./middleware-handler";

export const onRequest = defineMiddleware((context, next) => {
  return trailingSlashHandler(
    context,
    next,
    settings.trailingSlash,
  );
});
