import { sql } from "drizzle-orm";
import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

// ─── Blog Categories ─────────────────────────────────────────────────────────

export const blogCategories = sqliteTable("blog_categories", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	description: text("description"),
	parentId: integer("parent_id").references(
		(): ReturnType<typeof integer> => blogCategories.id,
	),
	createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
	updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Blog Tags ───────────────────────────────────────────────────────────────

export const blogTags = sqliteTable("blog_tags", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export const blogPosts = sqliteTable(
	"blog_posts",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		title: text("title").notNull(),
		slug: text("slug").notNull().unique(),
		content: text("content").notNull(),
		excerpt: text("excerpt"),
		status: text("status").notNull().default("draft"),
		publishAt: text("publish_at"),
		publishedAt: text("published_at"),
		featuredImageKey: text("featured_image_key"),
		featuredImageAlt: text("featured_image_alt"),
		metaTitle: text("meta_title"),
		metaDescription: text("meta_description"),
		metaKeywords: text("meta_keywords"),
		canonicalUrl: text("canonical_url"),
		categoryId: integer("category_id").references(() => blogCategories.id),
		authorName: text("author_name").default("Admin"),
		viewCount: integer("view_count").default(0),
		createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
		updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
	},
	(table) => [
		index("posts_slug_idx").on(table.slug),
		index("posts_status_publish_idx").on(table.status, table.publishAt),
	],
);

// ─── Blog Post Tags (junction) ──────────────────────────────────────────────

export const blogPostTags = sqliteTable(
	"blog_post_tags",
	{
		postId: integer("post_id")
			.notNull()
			.references(() => blogPosts.id, { onDelete: "cascade" }),
		tagId: integer("tag_id")
			.notNull()
			.references(() => blogTags.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

// ─── Analytics Sessions ──────────────────────────────────────────────────────

export const analyticsSessions = sqliteTable("analytics_sessions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	sessionId: text("session_id").notNull().unique(),
	ipHash: text("ip_hash"),
	country: text("country"),
	region: text("region"),
	city: text("city"),
	userAgent: text("user_agent"),
	browser: text("browser"),
	os: text("os"),
	deviceType: text("device_type"),
	referrer: text("referrer"),
	utmSource: text("utm_source"),
	utmMedium: text("utm_medium"),
	utmCampaign: text("utm_campaign"),
	landingPage: text("landing_page"),
	startedAt: text("started_at").notNull().default(sql`(datetime('now'))`),
	lastSeenAt: text("last_seen_at").notNull().default(sql`(datetime('now'))`),
});

// ─── Analytics Events ────────────────────────────────────────────────────────

export const analyticsEvents = sqliteTable("analytics_events", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	sessionId: text("session_id").notNull(),
	eventType: text("event_type").notNull(),
	eventName: text("event_name"),
	pageUrl: text("page_url"),
	pageTitle: text("page_title"),
	eventData: text("event_data"),
	scrollDepth: integer("scroll_depth"),
	timeOnPageSeconds: integer("time_on_page_seconds"),
	timestamp: text("timestamp").notNull().default(sql`(datetime('now'))`),
});

// ─── Login Attempts ──────────────────────────────────────────────────────────

export const loginAttempts = sqliteTable("login_attempts", {
	ipAddress: text("ip_address").primaryKey(),
	attempts: integer("attempts").notNull().default(0),
	lockedUntil: text("locked_until"),
	lastAttempt: text("last_attempt"),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type BlogCategory = typeof blogCategories.$inferSelect;
export type NewBlogCategory = typeof blogCategories.$inferInsert;

export type BlogTag = typeof blogTags.$inferSelect;
export type NewBlogTag = typeof blogTags.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type AnalyticsSession = typeof analyticsSessions.$inferSelect;
export type NewAnalyticsSession = typeof analyticsSessions.$inferInsert;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
