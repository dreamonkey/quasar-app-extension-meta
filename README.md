# @dreamonkey/quasar-app-extension-meta

This extension is made exclusively for [Quasar framework](https://quasar.dev/) and adds and simplify the use of their awesome [meta-plugin](https://quasar.dev/quasar-cli/developing-ssr/seo-for-ssr#Quasar-Meta-Plugin).

# Why should i use this extension

There are several reasons why you should use this [AppExtension](https://quasar.dev/app-extensions/introduction#Introduction) and let me introduce you why:

1. Better SEO:
   You know that SEO is not a simple task to accomplish and you also know that your best performance depends on that. How someone can find your page under other tonns? Well this mixin doesn't instantli put you page on top of that pile of results but it really helps you to scales up your visibility!

2. It's an app extension:
   If you are using quasar framework why you shouldn't use something imagined and designed exclusively for the framework you are developing on? That means you shouldn't have any problem adding this on you web-site, right? (programmer joke)

3. Why not using just the quasar-plugin offered by the framework:
   Quasar give us an awesome plugin which comes handy in SEO and it' s called [Quasar-meta-plugin](https://quasar.dev/quasar-cli/developing-ssr/seo-for-ssr#Quasar-Meta-Plugin).
   You could decide to handle meta tags in the classic way or decide to recive a little help. In fact this AE is not a sostitute of the plug-in rather is a UE boost to get the best out of it for who decide to use it.

4. What can i do with this AppExtension:
   You can set a title and a description for every page and the extension will automatically create and set standard tag also supported by social like:

   - og:title
   - og:description
   - og:url
   - og:type
   - og:image

5. As mentioned before to add a og:image you can just add a new image called `social-cover.jpg` inside your `statics` folder.

6. You will boost your SEO in a blink of an eye

# Install

```bash
quasar ext add @dreamonkey/meta
```

Quasar CLI will retrieve it from the NPM registry and install the extension to your project.

# Uninstall

```bash
quasar ext remove @dreamonkey/meta
```

# How to use it

Just launch:

```bash
quasar ext add @dreamonkey/meta
```

to install the AE then import it on your _nested page_:

```js
import { PageMetaMixin } from "@dreamonkey/quasar-app-extension-meta";
```

and expose the mixin _in every nested page_ like so:

```js

const title = 'Page title';
const description =
  'Page description';

export default {
  name: 'PageName',
  mixins: [PageMetaMixin(title, description)],
  data() {
    ...
```

Remember to change `Page title` and `Page description`.

Then import it in the _layout_

```js
import { LayoutMetaMixin } from "@dreamonkey/quasar-app-extension-meta";
```

and expose it like so

```js
export default {
  name: 'Layout',
  mixins: [LayoutMetaMixin(title => `${title} - Web-site title`)],
  data() {
   ...
```

here remember to change the `- Web-site title`.
This is usefull to add a prefix based on the nesting level of the pages but if you rather prefere to pass the title as it is use it like so:

```js
export default {
  name: 'Layout',
  mixins: [LayoutMetaMixin(title => title)],
  data() {
   ...
```

# How to test that everithing works just fine

To test it if the web-site is online you can copy paste the link on this tester [https://metatags.io/](https://metatags.io/) or if your website is ssr/ssg served you can use [http://localhost.run/](http://localhost.run/).

Or if you want to be sure try to share the link over a socal network instead and see the preview.

# The simpler way

Just watch inside the head tag on the html elements and see if meta tags are present.

# Other info

This extension also expose another feature that you can use if you wat to add a custom meta tag:

```js
import { metaTag } from "@dreamonkey/quasar-app-extension-meta";
```

And to use it you can pass the list of your meta tag and the value you want to assign them.
For exaple let's try to manually set the `description` and the `og:description` to 'my description' and `title` and the `og:title` to 'my title':

```js
import { metaTag } from "@dreamonkey/quasar-app-extension-meta";

const descriptionsNames = ['description','og:description'];
const descriptionsValue = 'my description';

const titlesNames = ['title','og:title'];
const titlesValue = 'my title';

export default {
  name: 'Layout',
  mixins: [metaTag],
  data() {
   ...
  },
  meta()
  {
    meta: ...metaTag(descriptionsNames, descriptionsValue);
    meta: ...metaTag(titlesNames, titlesValue);
  }
...
```

# License

MIT

# Donate

If you appreciate the work that went into this App Extension, please consider [donating to Quasar](https://donate.quasar.dev).
