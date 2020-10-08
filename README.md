# @dreamonkey/quasar-app-extension-meta

This is a [Quasar App Extension (AE)](https://quasar.dev/app-extensions/introduction#Introduction)
It adds minimal [meta tag](https://it.wikipedia.org/wiki/Meta_tag) to fill social network previews and provides you a better DX over [Quasar Meta Plugin](https://quasar.dev/quasar-cli/developing-ssr/seo-for-ssr#Quasar-Meta-Plugin), which is powerful but also verbose and somewhat difficult to understand.

## Install

```bash
quasar ext add @dreamonkey/meta
```

## Uninstall

```bash
quasar ext remove @dreamonkey/meta
```

## Using Quasar Meta Plugin

> Get familiar with the concepts of [Layout and Pages](https://quasar.dev/layout/layout) before proceeding.

To set the minimal meta tags to show you website nicely in posts on social networks, while using Quasar Meta Plugin, you'll need to write:

```ts
// src/layouts/main-layout.vue

export default {
  name: "MainLayout",
  data() {
    return { metaTitle: "" };
  },
  meta() {
    return {
      titleTemplate: (title) => `${title} - FooBarAgency`,
    };
  },
};
```

```ts
// src/pages/contacts.vue

const title = "Contacts";
const description =
  "Contact FooBarAgency with the online form or reach us in our office at 766 Parkway Street, Los Angeles, California.";

export default {
  name: "ContactPage",
  meta: {
    title,
    meta: {
      description: { name: "description", content: description },
      ogTitle: { name: "og:title", content: title },
      ogDescription: { name: "og:description", content: description },
      ogUrl: {
        name: "og:url",
        content: "https://www.foo-bar-agency.com/contacts",
      },
      ogImage: {
        name: "og:image",
        content: "https://www.foo-bar-agency.com/social-cover.jpg",
      },
      ogType: { name: "og:type", content: "website" },
    },
  },
};
```

## Using this AE

We provide two mixins to simplify the DX.

`LayoutMetaMixin` optionally adds a title prefix/suffix to pages displayed into a layout and sets minimal website-wide social tags (`title`) and meta tags (`og:title`, `og:type`, `og:image`).

`og:image` searches for a cover image (shown in your social preview) stored into `public/social-cover.jpg`.

`PageMetaMixin` sets minimal page-wide minimal social tags (`description`) and meta tags (`og:description`, `og:url`).

Here are some examples:

```ts
// src/layouts/main-layout.vue

import { LayoutMetaMixin } from "@dreamonkey/quasar-app-extension-meta";

export default {
  name: 'MainLayout',
  mixins: [LayoutMetaMixin(title => `${title} - FooBarAgency`)],
  data() {
   ...
  }
}
```

```ts
// src/pages/contacts.vue

import { PageMetaMixin } from "@dreamonkey/quasar-app-extension-meta";

const title = 'Contacts';
const description =
  'Contact FooBarAgency with the online form or reach us in our office at 766 Parkway Street, Los Angeles, California.';

export default {
  name: 'ContactPage',
  mixins: [PageMetaMixin(title, description)],
  data() {
    ...
  }
}
```

`` title => `${title} - FooBarAgency`  `` argument is useful to add a prefix/suffix to nested pages own title, but if no transformation is needed just leave it blank:

```ts
export default {
  name: 'MainLayout',
  mixins: [LayoutMetaMixin()], // <-- no argument here
  data() {
   ...
  }
}
```

This AE sets `og:url` and `og:image` based on the domain provided into `process.env.APP_DOMAIN` (read more about [process.env](https://quasar.dev/quasar-cli/handling-process-env#Adding-to-process.env)).
If not provided, the app domain is deduced from `window.location.origin`.
While building for SSR/SSG you _must_ set `process.env.APP_DOMAIN` as `window` object is not defined.

How to set it:

```ts
//quasar.conf.js

  build: {
    env: ctx.prod
      ? {
          APP_DOMAIN: 'https://www.FooBarAgency.it',
        }
      : {},
  }
```

We also expose a `metaTag` function which adds meta tags in a clearer and more elegant way.

Suppose you don't want to use `LayoutMetaMixins` and `PageMetaMixins` and you want to provide meta tags for a twitter card.
First you should search [which meta tags you need](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started), then fill the `meta` object, here's an example:

```ts
import { metaTag } from "@dreamonkey/quasar-app-extension-meta";

export default {
  name: "MainLayout",
  meta: {
    meta: {
      ...metaTag("twitter:card", "summary"),
      ...metaTag("twitter:site", "@nytimesbits"),
      ...metaTag("twitter:creator", "@nickbilton"),
    },
  },
};
```

`metaTag` accepts the meta tag name, or an array of names, as first parameter and the value as second parameter.

## Testing that everything works fine

If the website is online you can test it using [this tool](https://metatags.io/).
If your website is built for SSR/SSG, you can serve it locally, then use [http://localhost.run/](http://localhost.run/) to expose it.

You could also test the website directly on the social network you want to support to see the actual preview.

Be careful if you decide to search them inside the head tag because they can't be found there when in spa.

# Cheat sheet

```ts
LayoutMetaMixin(
  titleTemplateFn: (title: string) => string = (title) => title
);
```

```ts
PageMetaMixin(title: string, description: string);
```

```ts
metaTag(names: string | string[], value: string);
```

`og:image` path: "public/social-cover.jpg"

## License

MIT

## Donate

If you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).
