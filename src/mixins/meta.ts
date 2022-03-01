import { useMeta } from 'quasar';
import type { MetaOptions } from 'quasar/dist/types/meta';
// TODO: find a way to tree-shake this away
import 'vue-i18n';
import { useRoute } from 'vue-router';

type TemplateFn = (title: string) => string;

export function useLayoutSocialMeta(
  titleTemplateFn: TemplateFn = (title = '') => title
) {
  const metaData: MetaOptions = {
    titleTemplate: titleTemplateFn,
    meta: layoutSocialMetaTags(titleTemplateFn),
  };
  useMeta(() => metaData);
}

export function usePageSocialMeta(title: string, description: string) {
  const route = useRoute();

  const metaData: MetaOptions = {
    title,
    meta: pageSocialMetaTags(title, description, route.path),
  };

  useMeta(() => metaData);
}

function domain() {
  // When building for SSR or SSG, it's required to provide the app domain via APP_DOMAIN env variable
  // See https://quasar.dev/quasar-cli/handling-process-env#Import-based-on-process.env
  // If it's not provided, an error will be raised due to undefined window object being accessed (this is on purpose)
  return process!.env!.APP_DOMAIN || window.location.origin;
}

const HTML5Properties = [
  'application-name',
  'author',
  'description',
  'generator',
  'keywords',
];

export function metaTag(
  names: string | string[],
  valueOrTemplateFn: string | TemplateFn,
  // If not defined means auto
  attributeName: 'auto' | 'name' | 'property' = 'auto'
) {
  names = typeof names === 'string' ? [names] : names;

  const metaTagsObject: {
    [index: string]:
      | { name: string; content: string }
      | { name: string; template: TemplateFn }
      | { property: string; content: string }
      | { property: string; template: TemplateFn };
  } = {};

  const contentOrTemplateFn: { content: string } | { template: TemplateFn } =
    typeof valueOrTemplateFn === 'string'
      ? { content: valueOrTemplateFn }
      : { template: valueOrTemplateFn };

  for (const name of names) {
    // We must copy and not override the original value if we are in 'auto' mode or the next loop the auto value is falsified
    let attributeNameToUse;

    if (attributeName === 'auto') {
      if (HTML5Properties.includes(name)) {
        attributeNameToUse = 'name';
      } else {
        attributeNameToUse = 'property';
      }
    } else {
      attributeNameToUse = attributeName;
    }

    metaTagsObject[name] = {
      ...(attributeNameToUse === 'property' ? { property: name } : { name }),
      ...contentOrTemplateFn,
    };
  }

  return metaTagsObject;
}

export function PageMetaI18nMixin(
  titleLabel: string,
  descriptionLabel: string
) {
  return {
    data() {
      return {
        metaI18nTitle: '',
        metaI18nDescription: '',
      };
    },
    watch: {
      '$root.$i18n.locale': {
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
      };
    },
  };
}

function layoutSocialMetaTags(
  titleTemplateFn: TemplateFn
): MetaOptions['meta'] {
  return {
    ...metaTag('og:title', titleTemplateFn),
    ...metaTag('og:type', 'website'),
    // Image is crawled only when absolute URL is provided
    ...metaTag('og:image', `${domain()}/social-cover.jpg`),
  };
}

function pageSocialMetaTags(title: string, description: string, path: string) {
  return {
    ...metaTag('og:title', title),
    ...metaTag(['description', 'og:description'], description),
    ...metaTag('og:url', `${domain()}${path}`),
  };
}
