/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 * API: https://github.com/quasarframework/quasar/blob/master/app/lib/app-extension/IndexAPI.js
 */

module.exports = function (api) {
  api.extendQuasarConf((conf) => {
    conf.framework.plugins.push("Meta");
    conf.build.transpileDependencies.push(
      /@dreamonkey[\\/]quasar-app-extension-meta/
    );

    // Quasar doesn't perform process.env variables replacement at compile time
    // when the env variable isn't defined at all.
    // This is fine into prod mode where the META_APP_DOMAIN must be defined,
    // but will cause problems when running into dev mode and composing the domain base dynamically
    if (api.ctx.dev === true) {
      if (conf.build.env === undefined) {
        conf.build.env = {};
      }

      if (conf.build.env.META_APP_DOMAIN === undefined) {
        conf.build.env.META_APP_DOMAIN = undefined;
      }
    }
  });
};
