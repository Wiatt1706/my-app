import { relations } from "drizzle-orm/relations";
import { activities, activitiesUser, profiles, commentRecord, likeRecord, usersInAuth, pxCmtyArticles, landInfo, likes, userCustomList, keyword, rejectRecord, userCustomItem } from "./schema";

export const activitiesUserRelations = relations(activitiesUser, ({one}) => ({
	activity: one(activities, {
		fields: [activitiesUser.activityId],
		references: [activities.id]
	}),
	profile: one(profiles, {
		fields: [activitiesUser.userId],
		references: [profiles.id]
	}),
}));

export const activitiesRelations = relations(activities, ({many}) => ({
	activitiesUsers: many(activitiesUser),
}));

export const profilesRelations = relations(profiles, ({one, many}) => ({
	activitiesUsers: many(activitiesUser),
	likes: many(likes),
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id]
	}),
	userCustomLists: many(userCustomList),
	landInfos: many(landInfo),
	commentRecords: many(commentRecord),
	pxCmtyArticles: many(pxCmtyArticles),
}));

export const likeRecordRelations = relations(likeRecord, ({one}) => ({
	commentRecord: one(commentRecord, {
		fields: [likeRecord.commentId],
		references: [commentRecord.id]
	}),
	usersInAuth_likeUserId: one(usersInAuth, {
		fields: [likeRecord.likeUserId],
		references: [usersInAuth.id],
		relationName: "likeRecord_likeUserId_usersInAuth_id"
	}),
	pxCmtyArticle: one(pxCmtyArticles, {
		fields: [likeRecord.postId],
		references: [pxCmtyArticles.id]
	}),
	usersInAuth_userId: one(usersInAuth, {
		fields: [likeRecord.userId],
		references: [usersInAuth.id],
		relationName: "likeRecord_userId_usersInAuth_id"
	}),
}));

export const commentRecordRelations = relations(commentRecord, ({one, many}) => ({
	likeRecords: many(likeRecord),
	pxCmtyArticle: one(pxCmtyArticles, {
		fields: [commentRecord.postId],
		references: [pxCmtyArticles.id]
	}),
	profile: one(profiles, {
		fields: [commentRecord.userId],
		references: [profiles.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	likeRecords_likeUserId: many(likeRecord, {
		relationName: "likeRecord_likeUserId_usersInAuth_id"
	}),
	likeRecords_userId: many(likeRecord, {
		relationName: "likeRecord_userId_usersInAuth_id"
	}),
	profiles: many(profiles),
	keywords: many(keyword),
}));

export const pxCmtyArticlesRelations = relations(pxCmtyArticles, ({one, many}) => ({
	likeRecords: many(likeRecord),
	commentRecords: many(commentRecord),
	profile: one(profiles, {
		fields: [pxCmtyArticles.userId],
		references: [profiles.id]
	}),
	rejectRecords: many(rejectRecord),
}));

export const likesRelations = relations(likes, ({one}) => ({
	landInfo: one(landInfo, {
		fields: [likes.landId],
		references: [landInfo.id]
	}),
	profile: one(profiles, {
		fields: [likes.userId],
		references: [profiles.id]
	}),
}));

export const landInfoRelations = relations(landInfo, ({one, many}) => ({
	likes: many(likes),
	profile: one(profiles, {
		fields: [landInfo.landOwner],
		references: [profiles.id]
	}),
	userCustomItems: many(userCustomItem),
}));

export const userCustomListRelations = relations(userCustomList, ({one, many}) => ({
	profile: one(profiles, {
		fields: [userCustomList.owner],
		references: [profiles.id]
	}),
	userCustomItems: many(userCustomItem),
}));

export const keywordRelations = relations(keyword, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [keyword.userId],
		references: [usersInAuth.id]
	}),
}));

export const rejectRecordRelations = relations(rejectRecord, ({one}) => ({
	pxCmtyArticle: one(pxCmtyArticles, {
		fields: [rejectRecord.postId],
		references: [pxCmtyArticles.id]
	}),
}));

export const userCustomItemRelations = relations(userCustomItem, ({one}) => ({
	landInfo: one(landInfo, {
		fields: [userCustomItem.landId],
		references: [landInfo.id]
	}),
	userCustomList: one(userCustomList, {
		fields: [userCustomItem.userCustomListId],
		references: [userCustomList.id]
	}),
}));