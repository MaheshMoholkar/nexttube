import { createTRPCRouter } from "../init";
import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures";
import { videoCommentsRouter } from "@/modules/video-comments/server/procedures";
import { commentReactionsRouter } from "@/modules/comment-reaction/server/procedures";
import { suggestionsRouter } from "@/modules/suggestions/server/procedures";
import { searchRouter } from "@/modules/search/server/procedures";
import { usersRouter } from "@/modules/users/server/procedures";
import { playlistsRouter } from "@/modules/playlists/server/procedures";

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  categories: categoriesRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoComments: videoCommentsRouter,
  videoReactions: videoReactionsRouter,
  subscriptions: subscriptionsRouter,
  commentReactions: commentReactionsRouter,
  suggestions: suggestionsRouter,
  search: searchRouter,
  users: usersRouter,
  playlists: playlistsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
