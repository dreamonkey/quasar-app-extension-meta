import Vue from "vue";
import "vue-router";
import "vue-i18n";

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
        meta: pageSocialMetaTags(description, title, this.$route.path),
      };
    },
  };
}

export function PageMetaI18nMixin(
  titleLabel: string,
  descriptionLabel: string
) {
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
          this.metaI18nDescription,
          this.metaI18nTitle,
          this.$route.path
        ),
      };
    },
  };
}

function layoutSocialMetaTags(titleTemplateFn: TemplateFn) {
  return {
    ...metaTag("og:type", "website"),
    ...metaTag("og:title", titleTemplateFn),
    // Image is crawled only when absolute URL is provided
    ...metaTag("og:image", `${domain()}/social-cover.jpg`),
  };
}

function pageSocialMetaTags(description: string, title: string, path: string) {
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
