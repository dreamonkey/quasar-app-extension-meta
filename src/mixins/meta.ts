import Vue from "vue";
import "vue-router";
// TODO: find a way to tree-shake this away
import "vue-i18n";

export interface QMetaI18nAlternateLocale {
  locale: string;
  url: string;
}

export interface QMetaI18nAlternate {
  currentLocale?: QMetaI18nAlternateLocale;
  locales: QMetaI18nAlternateLocale[];
}

export interface AlternateLocaleLink {
  href: string;
  hreflang: string;
  rel: "alternate";
}

export interface OpenGraphMetaTag {
  content: string;
  property: string;
}

type TemplateFn = (title: string) => string;

export function LayoutMetaMixin(
  titleTemplateFn: TemplateFn = (title) => title
) {
  return {
    meta() {
      return {
        titleTemplate: titleTemplateFn,
        meta: layoutSocialMetaTags(titleTemplateFn),
      };
    },
  };
}

export function PageMetaMixin(title: string, description: string) {
  return {
    meta(this: Vue) {
      return {
        title,
        meta: pageSocialMetaTags(title, description, this.$route.path),
      };
    },
  };
}

export function PageMetaI18nMixin(
  titleLabel: string,
  descriptionLabel: string,
) {
  return {
    data() {
      return {
        metaI18nTitle: "",
        metaI18nDescription: "",
        metaI18nAlternate: undefined,
      };
    },
    watch: {
      "$root.$i18n.locale": {
        handler: function (
          this: Vue & {
            metaI18nTitle: string;
            metaI18nDescription: string;
          }
        ) {
          this.metaI18nTitle = this.$root.$i18n.t(titleLabel).toString();
          this.metaI18nDescription = this.$root.$i18n
            .t(descriptionLabel)
            .toString();
        },
        immediate: true,
      },
    },
    meta(
      this: Vue & {
        metaI18nTitle: string;
        metaI18nDescription: string;
        metaI18nRoutePath: string;
        metaI18nAlternateLocale?: QMetaI18nAlternate;
      }
    ) {
      const { locales = [], currentLocale } = this.metaI18nAlternateLocale ?? {};
      // Generate the alternate meta tags.
      const {  metaAlternate: pageAlternateMetaTags, linksAlternate: pageAlternateLinks } = pageAlternateLocales(locales, currentLocale);

      return {
        title: this.metaI18nTitle,
        meta: {
          ...pageSocialMetaTags(
            this.metaI18nTitle,
            this.metaI18nDescription,
            this.$route.path
          ),
          ...(pageAlternateMetaTags ?? {}),
        },
        link: {
          ...(pageAlternateLinks ?? {})
        }
      };
    },
  };
}

function layoutSocialMetaTags(titleTemplateFn: TemplateFn) {
  return {
    ...metaTag("og:title", titleTemplateFn),
    ...metaTag("og:type", "website"),
    // Image is crawled only when absolute URL is provided
    ...metaTag("og:image", `${domain()}/social-cover.jpg`),
  };
}

function pageSocialMetaTags(title: string, description: string, path: string) {
  return {
    ...metaTag("og:title", title),
    ...metaTag(["description", "og:description"], description),
    ...metaTag("og:url", `${domain()}${path}`),
  };
}

function domain() {
  // When building for SSR or SSG, it's required to provide the app domain via APP_DOMAIN env variable
  // See https://quasar.dev/quasar-cli/handling-process-env#Import-based-on-process.env
  // If it's not provided, an error will be raised due to undefined window object being accessed (this is on purpose)
  return (
    (process && process.env && process.env.APP_DOMAIN) || window.location.origin
  );
}

export function metaTag(
  names: string | string[],
  valueOrTemplateFn: string | TemplateFn
) {
  names = typeof names === "string" ? [names] : names;

  const metaTagsObject: {
    [index: string]:
      | { name: string; content: string }
      | { name: string; template: TemplateFn };
  } = {};

  if (typeof valueOrTemplateFn === "string") {
    for (const name of names) {
      metaTagsObject[name] = { name, content: valueOrTemplateFn };
    }
  } else {
    for (const name of names) {
      metaTagsObject[name] = {
        name,
        template: valueOrTemplateFn,
      };
    }
  }

  return metaTagsObject;
}

/**
 * Alternate locales meta and link tags generator.
 * @param locales Array of alternate locales the the webpage is currently available in.
 * @param pageCurrentLocale
 * @returns 
 */
function pageAlternateLocales(locales: QMetaI18nAlternateLocale[], pageCurrentLocale?: QMetaI18nAlternateLocale) {
  const currentDomain = domain();
  
  const linksAlternate: {[index: string]: AlternateLocaleLink } = {};
  const metaAlternate: {[index: string]: OpenGraphMetaTag} = {};

  for (const {locale, url} of locales) {
    linksAlternate["alt-" + locale] = {
      href: currentDomain + url,
      hreflang: locale,
      rel: "alternate",
    };

    // [1] - The open graph locale only wants the language used as the value for the content property. See Open Graph https://ogp.me/
    metaAlternate["og-alt-" + locale] = {
      content: locale,
      property: "og:locale:alternate",
    };
  }

  // [1]
  // In addition, Open Graph also wants to know the locale of the current page in this way.
  if (pageCurrentLocale) {
    metaAlternate["og-alt-current-" + pageCurrentLocale.locale] = {
      content: pageCurrentLocale.locale,
      property: "og:locale",
    };
  }

  return {
    linksAlternate,
    metaAlternate,
  };
}