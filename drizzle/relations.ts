import { relations } from "drizzle-orm/relations";
import { user, videos, categories, account, session } from "./schema";

export const videosRelations = relations(videos, ({one}) => ({
	user: one(user, {
		fields: [videos.userId],
		references: [user.id]
	}),
	category: one(categories, {
		fields: [videos.categoryId],
		references: [categories.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	videos: many(videos),
	accounts: many(account),
	sessions: many(session),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	videos: many(videos),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));