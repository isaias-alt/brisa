// @ts-nocheck
import { MatchedRoute } from "bun";
import { I18nFromRequest, RequestContext } from "../../types";

type ExtendRequestContext = {
  originalRequest: Request;
  currentRequestContext?: RequestContext;
  route?: MatchedRoute;
  i18n?: I18nFromRequest;
  finalURL?: string;
};

export default function extendRequestContext({
  originalRequest,
  currentRequestContext,
  route,
  i18n,
  finalURL,
}: ExtendRequestContext): RequestContext {
  // finalURL
  originalRequest.finalURL =
    currentRequestContext?.finalURL ??
    finalURL ??
    originalRequest.finalURL ??
    originalRequest.url;

  // route
  originalRequest.route =
    currentRequestContext?.route ?? route ?? originalRequest.route;

  // context
  originalRequest.context =
    currentRequestContext?.context ??
    originalRequest.context ??
    new Map<string, any>();

  // ws
  originalRequest.ws = globalThis.ws;

  // i18n
  originalRequest.i18n = currentRequestContext?.i18n ??
    originalRequest.i18n ??
    i18n ?? {
      defaultLocale: "",
      locales: [],
      locale: "",
      t: () => "",
    };

  return originalRequest as RequestContext;
}
