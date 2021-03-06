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
  name: "MainLayout",
  mixins: [LayoutMetaMixin((title) => `${title} - FooBarAgency`)],
  data() {
    // ...
  },
};
```

```ts
// src/pages/contacts.vue

import { PageMetaMixin } from "@dreamonkey/quasar-app-extension-meta";

const title = "Contacts";
const description =
  "Contact FooBarAgency with the online form or reach us in our office at 766 Parkway Street, Los Angeles, California.";

export default {
  name: "ContactPage",
  mixins: [PageMetaMixin(title, description)],
  data() {
    // ...
  },
};
```

`` title => `${title} - FooBarAgency`  `` argument is useful to add a prefix/suffix to nested pages own title, but if no transformation is needed just leave it blank:

```ts
export default {
  name: "MainLayout",
  mixins: [LayoutMetaMixin()], // <-- no argument here
  data() {
    // ...
  },
};
```

This AE sets `og:url` and `og:image` based on the domain provided into `process.env.APP_DOMAIN` (read more about [process.env](https://quasar.dev/quasar-cli/handling-process-env#Adding-to-process.env)).
If not provided, the app domain is deduced from `window.location.origin`.
While building for SSR/SSG you _must_ set `process.env.APP_DOMAIN` as `window` object is not defined.

How to set it:

```ts
//quasar.conf.js

  build: {
    env: ctx.prod || ctx.mode.ssr
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

## Dynamic support for i18n

Be sure to understand how [App Internationalization (i18n)](https://quasar.dev/options/app-internationalization#Introduction) and [Custom directive localization](http://kazupon.github.io/vue-i18n/guide/directive.html#string-syntax) work before proceeding.
This mixin assumes [`vue-i18n`](https://github.com/kazupon/vue-i18n) has already been set up in your project.

`PageMetaMixin` is perfect until you add internationalization to the mix, which requires to dynamically update you tags and meta tags accordingly to the selected language: `PageMetaI18nMixin` address this use case.

### Using `PageMetaI18nMixin`

You use `PageMetaI18nMixin` exactly how you would use `PageMetaMixin`, except you provide "translation paths" as arguments instead of the text itself.
The mixin automatically react to `$root.$i18n.locale` changes, updating meta tags accordingly.

```ts
// src/i18n/it/contacts.ts    <-- Notice these are the website italian translations

export default {
  meta: {
    title: "Contatti",
    description:
      "Contatta FooBarAgency con il nostro modulo online o raggiungici in ufficio a Parkway Street 766, Los Angeles, California.",
  },
  form: {
    title: "Contattaci compilando il nostro modulo!",
  },
  // ... other translations
};
```

```ts
// src/pages/contacts.vue

import { PageMetaI18nMixin } from "@dreamonkey/quasar-app-extension-meta";

const titleLabel = "contacts.meta.title"; // <-- The title 'translation path'
const descriptionLabel = "contacts.meta.description"; // <-- The description 'translation path'

export default {
  name: "ContactPage",
  mixins: [PageMetaI18nMixin(titleLabel, descriptionLabel)],
  data() {
    // ...
  },
};
```

The "translation paths" are those you use to access translations with `vue-i18n` methods.
In the following snippet the "translation path" is `contacts.form.title`:

```html
<p>{{ $t('contacts.form.title') }}</p>
```

## Testing social preview

If the website is online you can test it using [this tool](https://metatags.io/).
If your website is built for SSR/SSG, you can serve it locally, use [http://localhost.run/](http://localhost.run/) to expose it and test it with the previous tool.

You can also copy/paste the website link directly into the social network you want to support and manually check the generated preview.

**Meta tags are computed by Quasar at runtime and outputted into `<head>` tag, but since most crawlers won't execute JS they won't be able to see the tags when your website is a SPA. You will need to use SSR or SSG to be sure all crawlers see the tags correctly**

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
PageMetaI18nMixin(titleLabel: string, descriptionLabel: string);
```

```ts
metaTag(names: string | string[], value: string);
```

`og:image` path: "public/social-cover.jpg"

## License

MIT

## Donate

If you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).
