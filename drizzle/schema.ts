import { pgTable, foreignKey, pgPolicy, bigint, timestamp, uuid, boolean, varchar, smallint, integer, text, jsonb, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const activitiesUser = pgTable("ActivitiesUser", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: ""ActivitiesUser_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
	activityId: uuid("activity_id").notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	systemCode: varchar("system_code"),
}, (table) => [
	foreignKey({
			columns: [table.activityId],
			foreignColumns: [activities.id],
			name: "ActivitiesUser_activity_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "ActivitiesUser_user_id_fkey"
		}),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const fansInfo = pgTable("FansInfo", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: ""FansInfo_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	bId: varchar("b_id"),
	userName: varchar("user_name"),
	avatar: varchar(),
	sign: varchar(),
});

export const likeRecord = pgTable("LikeRecord", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: ""LikeRecord_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	commentId: bigint("comment_id", { mode: "number" }),
	type: smallint(),
	userId: uuid("user_id").default(sql`auth.uid()`),
	likeUserId: uuid("like_user_id"),
	liked: boolean().default(true).notNull(),
	typeIndex: smallint("type_index").default(sql`'0'`).notNull(),
	postId: uuid("post_id"),
}, (table) => [
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [commentRecord.id],
			name: "likerecord_comment_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.likeUserId],
			foreignColumns: [users.id],
			name: "likerecord_like_user_id_fkey"
		}),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [pxCmtyArticles.id],
			name: "likerecord_post_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "likerecord_user_id_fkey"
		}),
	pgPolicy("Enable delete for authenticated users only", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`true` }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const productsInfo = pgTable("ProductsInfo", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "products_info_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: varchar(),
	description: varchar(),
	type: integer(),
	postId: uuid("post_id"),
	webUrl: varchar("web_url"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	keywords: bigint({ mode: "number" }).array(),
	payType: varchar("pay_type"),
	scoreNum: integer("score_num"),
	iconUrl: varchar("icon_url"),
	isVerify: boolean("is_verify"),
	providerId: uuid("provider_id"),
	payText: varchar("pay_text"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	hotNum: bigint("hot_num", { mode: "number" }),
}, (table) => [
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const likes = pgTable("likes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`).notNull(),
	userId: uuid("user_id").notNull(),
	landId: uuid("land_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.landId],
			foreignColumns: [landInfo.id],
			name: "likes_land_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "likes_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("authenticated users can delete their own likes", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(user_id = ( SELECT auth.uid() AS uid))` }),
	pgPolicy("authenticated users can insert their own likes", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("authenticated users can select likes", { as: "permissive", for: "select", to: ["authenticated"] }),
]);

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	name: text(),
	username: text(),
	avatarUrl: text("avatar_url"),
	blockCoins: integer("block_coins").default(0).notNull(),
	landCoins: integer("land_coins").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [users.id],
			name: "profiles_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
	pgPolicy("anyone can select profiles", { as: "permissive", for: "select", to: ["public"] }),
]);

export const userCustomList = pgTable("UserCustomList", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: varchar(),
	describe: varchar(),
	type: smallint().notNull(),
	status: smallint().default(sql`'0'`).notNull(),
	owner: uuid().default(sql`auth.uid()`).notNull(),
	sort: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.owner],
			foreignColumns: [profiles.id],
			name: "UserCustomList_owner_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	pgPolicy("Enable Update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const landInfo = pgTable("land_info", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	landName: varchar("land_name").notNull(),
	landOwner: uuid("land_owner"),
	landLevel: varchar("land_level").default('0').notNull(),
	landType: varchar("land_type").default('0').notNull(),
	capacitySize: integer("capacity_size"),
	usedPixelBlocks: integer("used_pixel_blocks").default(0).notNull(),
	coverIconUrl: varchar("cover_icon_url"),
	worldCoordinatesX: integer("world_coordinates_x").notNull(),
	worldCoordinatesY: integer("world_coordinates_y").notNull(),
	worldSizeX: integer("world_size_x").notNull(),
	worldSizeY: integer("world_size_y").notNull(),
	landDescription: varchar("land_description"),
	parentLandId: uuid("parent_land_id"),
	useExternalLink: boolean("use_external_link").default(false).notNull(),
	externalLinkType: varchar("external_link_type"),
	externalLink: varchar("external_link"),
	borderSize: smallint("border_size").default(sql`'0'`).notNull(),
	skipUrl: varchar("skip_url"),
	fillColor: varchar("fill_color").default('#000000').notNull(),
	blockCount: smallint("block_count").default(sql`'1'`).notNull(),
	landStatus: varchar("land_status").default('0').notNull(),
	showCoverList: jsonb("show_cover_list").array(),
}, (table) => [
	foreignKey({
			columns: [table.landOwner],
			foreignColumns: [profiles.id],
			name: "public_land_info_land_owner_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["public"], using: sql`true` }),
	pgPolicy("Enable update for users based on user_id", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("auth users can insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("public read access for all users", { as: "permissive", for: "select", to: ["anon", "authenticated"] }),
]);

export const commentRecord = pgTable("CommentRecord", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: ""CommentRecord_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	parentId: bigint("parent_id", { mode: "number" }).default(sql`'0'`).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	commentId: bigint("comment_id", { mode: "number" }),
	content: varchar(),
	imageUrl: varchar("image_url"),
	likeNum: integer("like_num").default(0).notNull(),
	postId: uuid("post_id"),
	userId: uuid("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [pxCmtyArticles.id],
			name: "commentrecord_post_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "commentrecord_user_id_fkey"
		}),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const keyword = pgTable("Keyword", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: ""Keyword_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	color: varchar(),
	description: varchar(),
	labelName: varchar("label_name"),
	labelType: smallint("label_type").default(sql`'0'`),
	userId: uuid("user_id").default(sql`auth.uid()`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "keyword_user_id_fkey"
		}),
	unique("Keyword_id_key").on(table.id),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const activities = pgTable("Activities", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: varchar().notNull(),
	type: varchar().notNull(),
	description: text(),
	postId: uuid("post_id"),
	id: uuid().defaultRandom().primaryKey().notNull(),
	isValid: boolean("is_valid").default(true).notNull(),
	systemCode: varchar("system_code"),
}, (table) => [
	unique("Activities_id_key").on(table.id),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const pixelInfo = pgTable("PixelInfo", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: ""PixelInfo_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	x: smallint(),
	y: smallint(),
	width: smallint(),
	height: smallint(),
	fillColor: varchar("fill_color"),
	imageSrc: varchar("image_src"),
	name: varchar(),
	type: smallint(),
	skipType: smallint("skip_type"),
	skipUrl: text("skip_url"),
}, (table) => [
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const pxCmtyArticles = pgTable("PxCmtyArticles", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	content: varchar(),
	description: varchar(),
	commentRecordNum: smallint("comment_record_num").default(sql`'0'`),
	bannerImgUrl: varchar("banner_img_url"),
	title: varchar(),
	id: uuid().defaultRandom().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	keywords: bigint({ mode: "number" }).array(),
	userId: uuid("user_id").default(sql`auth.uid()`).notNull(),
	likeArray: smallint("like_array").array(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "PxCmtyArticles_user_id_fkey"
		}),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const rejectRecord = pgTable("RejectRecord", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: ""RejectRecord_id_seq"", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	type: smallint(),
	userId: uuid("user_id").default(sql`auth.uid()`),
	status: boolean(),
	describe: varchar(),
	postId: uuid("post_id"),
}, (table) => [
	foreignKey({
			columns: [table.postId],
			foreignColumns: [pxCmtyArticles.id],
			name: "rejectrecord_post_id_fkey"
		}),
	pgPolicy("Enable delete for authenticated users only", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`true` }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const userCustomItem = pgTable("UserCustomItem", {
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	userCustomListId: uuid("user_custom_list_id").notNull(),
	landId: uuid("land_id").notNull(),
	sort: integer().default(0).notNull(),
	owner: uuid().default(sql`auth.uid()`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.landId],
			foreignColumns: [landInfo.id],
			name: "UserCustomItem_land_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userCustomListId],
			foreignColumns: [userCustomList.id],
			name: "UserCustomItem_user_custom_list_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Enable delete for authenticated users only", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`true` }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const systemMenu = pgTable("system_menu", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: varchar().notNull(),
	url: varchar(),
	icon: varchar(),
	shortcut: jsonb(),
	isActive: boolean("is_active").default(false).notNull(),
	parentId: uuid("parent_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	menuType: varchar("menu_type").default('0'),
	menuSort: integer("menu_sort").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "system_menu_parent_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const systemRole = pgTable("system_role", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar().notNull(),
	description: varchar(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const systemRoleMenu = pgTable("system_role_menu", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	roleId: uuid("role_id").notNull(),
	menuId: uuid("menu_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.menuId],
			foreignColumns: [systemMenu.id],
			name: "system_role_menu_menu_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [systemRole.id],
			name: "system_role_menu_role_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("system_role_menu_role_id_menu_id_key").on(table.roleId, table.menuId),
]);
