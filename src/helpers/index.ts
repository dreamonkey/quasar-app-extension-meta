import { useMeta } from "quasar";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { pageSocialMetaTags } from "./internals";

export function usePageSocialMetaI18n(
  titlePath: string,
  descriptionPath: string
) {
  const route = useRoute();
  const { t } = useI18n();

  useMeta(() => {
    const title = t(titlePath);
    const description = t(descriptionPath);

    return {
      title,
      meta: pageSocialMetaTags(title, description, route.path),
    };
  });
}
