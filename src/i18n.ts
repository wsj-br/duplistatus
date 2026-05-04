import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uiLanguages from "./locales/ui-languages.json";
import {
  defaultI18nInitOptions,
  wrapI18nWithKeyTrim,
  makeLoadLocale,
  applyDirection,
} from "ai-i18n-tools/runtime";
import { SOURCE_LOCALE } from "./i18n-config";

export { SOURCE_LOCALE, LOCALE_COOKIE_NAME } from "./i18n-config";

void i18n.use(initReactI18next).init(defaultI18nInitOptions(SOURCE_LOCALE));
wrapI18nWithKeyTrim(i18n as unknown as Parameters<typeof wrapI18nWithKeyTrim>[0]);
i18n.on("languageChanged", applyDirection);
applyDirection(i18n.language);

const localeLoaders = Object.fromEntries(
  (uiLanguages as { code: string }[])
    .filter(({ code }) => code !== SOURCE_LOCALE)
    .map(({ code }) => [
      code,
      () => import(`./locales/${code}.json`) as Promise<{ default: Record<string, string> }>,
    ])
);

export const loadLocale = makeLoadLocale(
  i18n as unknown as Parameters<typeof makeLoadLocale>[0],
  localeLoaders,
  SOURCE_LOCALE
);
export default i18n;
