import { useMeta } from "quasar";
import { Ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { domain, pageSocialMetaTags } from "./internals";

export interface I18nAlternateLocale {
  routePath: string;
  locale: string;
}

interface AlternateLocaleLink extends Record<string, string> {
  href: string;
  hreflang: string;
  rel: "alternate";
}

interface OpenGraphMetaTag {
  content: string;
  property: string;
}

function generateLocaleMetaTags(locale: Ref<string>, locales: string[]) {
  const meta: Record<string, OpenGraphMetaTag> = {};

  for (const locale of locales) {
    // The open graph locale only wants the language used as the value for the content property. See Open Graph https://ogp.me/
    meta[`og-alt-${locale}`] = {
      content: locale,
      property: "og:locale:alternate",
    };
  }

  // In addition, Open Graph also wants to know the locale of the current page in this way.
  meta[`og-alt-current-${locale.value}`] = {
    content: locale.value,
    property: "og:locale",
  };

  return meta;
}

function generateLocaleLinks(domain: string, locales: I18nAlternateLocale[]) {
  const links: Record<string, AlternateLocaleLink> = {};

  for (const { locale, routePath: url } of locales) {
    links[`alt-${locale}`] = {
      href: `${domain}${url}`,
      hreflang: locale,
      rel: "alternate",
    };
  }

  return links;
}

export function usePageSocialMetaI18n(
  titlePathOrContent: string,
  descriptionPathOrContent: string,
  locales: I18nAlternateLocale[] = []
) {
  const route = useRoute();
  const { te, t, locale } = useI18n();

  const localeLinks = generateLocaleLinks(domain(), locales);

  useMeta(() => {
    // Title and description could also be provided as actual content,
    // instead of translation path
    // This may happen when translations are done asynchronously,
    // eg. fetched by a server or a third party service
    const title = te(titlePathOrContent)
      ? t(titlePathOrContent)
      : titlePathOrContent;
    const description = te(descriptionPathOrContent)
      ? t(descriptionPathOrContent)
      : descriptionPathOrContent;

    // Uses locale ref, so it should be used inside the function to react to locale changes
    const localeMetaTags = generateLocaleMetaTags(
      locale,
      locales.map(({ locale }) => locale)
    );

    return {
      title,
      meta: {
        ...pageSocialMetaTags(title, description, route.path),
        ...localeMetaTags,
      },
      link: localeLinks,
    };
  });
}
