import { useMeta } from "quasar";
import { useRoute } from "vue-router";
import {
  layoutSocialMetaTags,
  pageSocialMetaTags,
  TemplateFn,
} from "./internals";

export function useLayoutSocialMeta(
  titleTemplateFn: TemplateFn = (title) => title
) {
  useMeta(() => ({
    titleTemplate: titleTemplateFn,
    meta: layoutSocialMetaTags(titleTemplateFn),
  }));
}

export function usePageSocialMeta(title: string, description: string) {
  const route = useRoute();

  useMeta({
    title,
    meta: pageSocialMetaTags(title, description, route.path),
  });
}
