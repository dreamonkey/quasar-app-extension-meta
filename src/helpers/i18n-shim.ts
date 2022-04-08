// Exporting `usePageSocialMetaI18n` function from `meta.ts` as other composables
// implied a dependency on i18n which some Quasar projects don't have, breaking compilation

// We now export usePageSocialMetaI18n composable by building it in a separate step to avoid those problems
// Yet, TS isn't really deep-imports friendly: we can define only one types entry point, which means
// all deep imports types should be defined via ambient modules declarations, such as this one,
// which should then be referenced by the main types entry point to be correctly evaluated

// This module provide typings to the deep import, which is generated without own types,
// and match the output folder of the i18n build step. It cannot reference the related module
// or it would import it at compile time

// This must be a .ts file (instead of a .d.ts) to not being elided at compile time by TS,
// which would make it useless

// Since i18n files depends on `internals` helpers, we cannot put them into a separate `i18n` folder
// or they'll be compiled into a nested structure, and we must keep a flat one.
// This isn't ideal since we get an `index` file which is actually i18n-related

// The solution we found is a bit esoteric, but at least works
// When TS will support native ESM modules, which allow multiple entry points,
// we should be able to remove this workaround and rely on something much simpler

declare module "@dreamonkey/quasar-app-extension-meta/i18n" {
  interface I18nAlternateLocale {
    routePath: string;
    locale: string;
  }

  function usePageSocialMetaI18n(
    titlePathOrContent: string,
    descriptionPathOrContent: string,
    locales?: I18nAlternateLocale[]
  ): void;
}
