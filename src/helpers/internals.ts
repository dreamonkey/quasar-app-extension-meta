import type { MetaOptions } from "quasar/dist/types/meta";

export type TemplateFn = (value: string) => string;

export function domain() {
  // When building for SSR or SSG, it's required to provide the app domain via META_APP_DOMAIN env variable
  // See https://quasar.dev/quasar-cli/handling-process-env#Import-based-on-process.env
  // If it's not provided, an error will be raised due to undefined window object being accessed (this is on purpose)
  return process.env.META_APP_DOMAIN || window.location.origin;
}

export function layoutSocialMetaTags(
  titleTemplateFn: TemplateFn
): MetaOptions["meta"] {
  return {
    ...metaTag("og:title", titleTemplateFn),
    ...metaTag("og:type", "website"),
    // Image is crawled only when absolute URL is provided
    ...metaTag("og:image", `${domain()}/social-cover.jpg`),
  };
}

export function pageSocialMetaTags(
  title: string,
  description: string,
  path: string
): MetaOptions["meta"] {
  return {
    ...metaTag("og:title", title),
    ...metaTag(["description", "og:description"], description),
    ...metaTag("og:url", `${domain()}${path}`),
  };
}

const html5Properties = [
  "application-name",
  "author",
  "description",
  "generator",
  "keywords",
];

export function metaTag(
  names: string | string[],
  valueOrTemplateFn: string | TemplateFn,
  attributeName: "auto" | "name" | "property" = "auto"
) {
  names = typeof names === "string" ? [names] : names;

  const metaTagsObject: {
    [index: string]:
      | { name: string; content: string }
      | { name: string; template: TemplateFn }
      | { property: string; content: string }
      | { property: string; template: TemplateFn };
  } = {};

  const contentOrTemplateFn =
    typeof valueOrTemplateFn === "string"
      ? { content: valueOrTemplateFn }
      : { template: valueOrTemplateFn };

  for (const name of names) {
    // We must copy and not override the original value if we are in 'auto' mode or the next loop the auto value is falsified
    const attributeNameToUse =
      attributeName !== "auto"
        ? attributeName
        : html5Properties.includes(name)
        ? "name"
        : "property";

    metaTagsObject[name] = {
      // TS isn't able to correctly infer `[attributeNameToUse]: name`
      ...(attributeNameToUse === "property" ? { property: name } : { name }),
      ...contentOrTemplateFn,
    };
  }

  return metaTagsObject;
}
