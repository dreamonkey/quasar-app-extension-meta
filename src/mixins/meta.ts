import Vue from "vue";
import "vue-router";
// TODO: find a way to tree-shake this away
import "vue-i18n";

export interface QMetaI18nAlternateLocale {
  locale: string;
  url: string;
}

// TODO: we can improve this when there are other options by making the alternate optional
export interface QMetaI18nOptions {
  alternate: {
    currentLocale?: QMetaI18nAlternateLocale;
    locales: QMetaI18nAlternateLocale[];
    openGraph?: boolean;
  }
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
  options?: QMetaI18nOptions,
) {
  // Parses options
  let alternateMeta = pageAlternateLocales(options?.alternate.locales ?? [], (options?.alternate.openGraph && options.alternate.currentLocale) ? options.alternate.currentLocale : undefined );

  return {
    data() {
      return {
        metaI18nTitle: "",
        metaI18nDescription: "",
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
      }
    ) {
      return {
        title: this.metaI18nTitle,
        meta: pageSocialMetaTags(
          this.metaI18nTitle,
          this.metaI18nDescription,
          this.$route.path
        ),
        link: {
          ...(alternateMeta.links ?? {})
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

// ALernate locales generator
export interface AlterateLocalLink {
  href: string;
  hreflang: string;
  rel: "alternate";
}

export interface OpenGraphMetaTag {
  content: string;
  property: string;
}

function pageAlternateLocales(locales: QMetaI18nAlternateLocale[], useOpengraph?: QMetaI18nAlternateLocale) {
  const currentDomain = domain();
  
  const links: {[index: string]: AlterateLocalLink } = {};
  const metaAlternate: {[index: string]: OpenGraphMetaTag} = {};

  for (const locale of locales) {
    links["alt-" + locale.locale] = {
      href: currentDomain + locale.url,
      hreflang: locale.locale,
      rel: "alternate",
    };

    if (useOpengraph) {
      metaAlternate["og-alt-" + locale.locale] = {
        content: currentDomain + locale.locale,
        property: "og:locale:alternate",
      };
    }
  }

  if (useOpengraph) {
    metaAlternate["og-alt-current-" + useOpengraph.locale] = {
      content: currentDomain + useOpengraph.locale,
      property: "og:locale:alternate",
    };
  }

  return {
    links,
    metaAlternate,
  };
}