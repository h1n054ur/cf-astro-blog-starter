import { describe, expect, test } from "bun:test";
import {
	analyticsEvents,
	analyticsSessions,
	blogCategories,
	blogPosts,
	blogPostTags,
	blogTags,
	loginAttempts,
} from "../../src/db/schema";

describe("Database Schema", () => {
	test("blogPosts table has required columns", () => {
		const columns = Object.keys(blogPosts);
		expect(columns).toContain("id");
		expect(columns).toContain("title");
		expect(columns).toContain("slug");
		expect(columns).toContain("content");
		expect(columns).toContain("status");
		expect(columns).toContain("excerpt");
		expect(columns).toContain("publishedAt");
		expect(columns).toContain("featuredImageKey");
		expect(columns).toContain("metaTitle");
		expect(columns).toContain("metaDescription");
		expect(columns).toContain("categoryId");
		expect(columns).toContain("authorName");
		expect(columns).toContain("viewCount");
		expect(columns).toContain("createdAt");
		expect(columns).toContain("updatedAt");
	});

	test("blogCategories table has required columns", () => {
		const columns = Object.keys(blogCategories);
		expect(columns).toContain("id");
		expect(columns).toContain("name");
		expect(columns).toContain("slug");
		expect(columns).toContain("description");
		expect(columns).toContain("parentId");
	});

	test("blogTags table has required columns", () => {
		const columns = Object.keys(blogTags);
		expect(columns).toContain("id");
		expect(columns).toContain("name");
		expect(columns).toContain("slug");
	});

	test("blogPostTags junction table has required columns", () => {
		const columns = Object.keys(blogPostTags);
		expect(columns).toContain("postId");
		expect(columns).toContain("tagId");
	});

	test("analyticsSessions table has required columns", () => {
		const columns = Object.keys(analyticsSessions);
		expect(columns).toContain("sessionId");
		expect(columns).toContain("ipHash");
		expect(columns).toContain("country");
		expect(columns).toContain("browser");
		expect(columns).toContain("deviceType");
		expect(columns).toContain("referrer");
		expect(columns).toContain("utmSource");
	});

	test("analyticsEvents table has required columns", () => {
		const columns = Object.keys(analyticsEvents);
		expect(columns).toContain("sessionId");
		expect(columns).toContain("eventType");
		expect(columns).toContain("pageUrl");
		expect(columns).toContain("eventData");
		expect(columns).toContain("scrollDepth");
	});

	test("loginAttempts table has required columns", () => {
		const columns = Object.keys(loginAttempts);
		expect(columns).toContain("ipAddress");
		expect(columns).toContain("attempts");
		expect(columns).toContain("lockedUntil");
	});
});
