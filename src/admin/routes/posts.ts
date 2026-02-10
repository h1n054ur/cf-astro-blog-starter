import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { blogCategories, blogPosts, blogPostTags, blogTags } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireAuth } from "../middleware/auth";
import { postEditorPage } from "../views/posts/editor";
import { postsListPage } from "../views/posts/list";

const posts = new Hono<{ Bindings: Env }>();

posts.use("*", requireAuth);

// GET /api/admin/posts — list all posts
posts.get("/", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const allPosts = await db
			.select({
				id: blogPosts.id,
				title: blogPosts.title,
				slug: blogPosts.slug,
				status: blogPosts.status,
				publishedAt: blogPosts.publishedAt,
				viewCount: blogPosts.viewCount,
				createdAt: blogPosts.createdAt,
				categoryName: blogCategories.name,
			})
			.from(blogPosts)
			.leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
			.orderBy(desc(blogPosts.createdAt));

		return c.html(postsListPage(allPosts));
	} catch {
		return c.html(postsListPage([]));
	}
});

// GET /api/admin/posts/new — new post form
posts.get("/new", async (c) => {
	try {
		const db = getDb(c.env.DB);
		const categories = await db.select().from(blogCategories);
		const tags = await db.select().from(blogTags);
		return c.html(postEditorPage({ categories, tags }));
	} catch {
		return c.html(postEditorPage({ categories: [], tags: [] }));
	}
});

// POST /api/admin/posts — create post
posts.post("/", async (c) => {
	const db = getDb(c.env.DB);
	const body = await c.req.parseBody();

	const now = new Date().toISOString();
	const status = String(body.status || "draft");
	const publishedAt = status === "published" ? now : null;

	const [inserted] = await db
		.insert(blogPosts)
		.values({
			title: String(body.title),
			slug: String(body.slug),
			content: String(body.content),
			excerpt: String(body.excerpt || "") || null,
			status,
			publishedAt,
			featuredImageKey: String(body.featuredImageKey || "") || null,
			featuredImageAlt: String(body.featuredImageAlt || "") || null,
			metaTitle: String(body.metaTitle || "") || null,
			metaDescription: String(body.metaDescription || "") || null,
			metaKeywords: String(body.metaKeywords || "") || null,
			canonicalUrl: String(body.canonicalUrl || "") || null,
			categoryId: body.categoryId ? Number(body.categoryId) : null,
			authorName: String(body.authorName || "Admin"),
			createdAt: now,
			updatedAt: now,
		})
		.returning({ id: blogPosts.id });

	// Handle tags
	const tagIds = String(body.tagIds || "")
		.split(",")
		.filter(Boolean)
		.map(Number);
	if (inserted && tagIds.length > 0) {
		await db.insert(blogPostTags).values(
			tagIds.map((tagId) => ({
				postId: inserted.id,
				tagId,
			})),
		);
	}

	return c.redirect("/api/admin/posts");
});

// GET /api/admin/posts/:id/edit — edit post form
posts.get("/:id/edit", async (c) => {
	const id = Number(c.req.param("id"));
	const db = getDb(c.env.DB);

	const [post] = await db
		.select()
		.from(blogPosts)
		.where(eq(blogPosts.id, id))
		.limit(1);

	if (!post) {
		return c.redirect("/api/admin/posts");
	}

	const categories = await db.select().from(blogCategories);
	const tags = await db.select().from(blogTags);
	const postTagRows = await db
		.select({ tagId: blogPostTags.tagId })
		.from(blogPostTags)
		.where(eq(blogPostTags.postId, id));

	return c.html(
		postEditorPage({
			post,
			categories,
			tags,
			selectedTagIds: postTagRows.map((r) => r.tagId),
		}),
	);
});

// POST /api/admin/posts/:id — update post
posts.post("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const db = getDb(c.env.DB);
	const body = await c.req.parseBody();

	const now = new Date().toISOString();
	const status = String(body.status || "draft");

	// Check if transitioning to published
	const [existing] = await db
		.select({ status: blogPosts.status, publishedAt: blogPosts.publishedAt })
		.from(blogPosts)
		.where(eq(blogPosts.id, id))
		.limit(1);

	const publishedAt =
		status === "published" && existing?.status !== "published"
			? now
			: (existing?.publishedAt ?? null);

	await db
		.update(blogPosts)
		.set({
			title: String(body.title),
			slug: String(body.slug),
			content: String(body.content),
			excerpt: String(body.excerpt || "") || null,
			status,
			publishedAt,
			featuredImageKey: String(body.featuredImageKey || "") || null,
			featuredImageAlt: String(body.featuredImageAlt || "") || null,
			metaTitle: String(body.metaTitle || "") || null,
			metaDescription: String(body.metaDescription || "") || null,
			metaKeywords: String(body.metaKeywords || "") || null,
			canonicalUrl: String(body.canonicalUrl || "") || null,
			categoryId: body.categoryId ? Number(body.categoryId) : null,
			authorName: String(body.authorName || "Admin"),
			updatedAt: now,
		})
		.where(eq(blogPosts.id, id));

	// Update tags
	await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
	const tagIds = String(body.tagIds || "")
		.split(",")
		.filter(Boolean)
		.map(Number);
	if (tagIds.length > 0) {
		await db.insert(blogPostTags).values(
			tagIds.map((tagId) => ({
				postId: id,
				tagId,
			})),
		);
	}

	return c.redirect("/api/admin/posts");
});

// POST /api/admin/posts/:id/delete — delete post
posts.post("/:id/delete", async (c) => {
	const id = Number(c.req.param("id"));
	const db = getDb(c.env.DB);
	await db.delete(blogPosts).where(eq(blogPosts.id, id));
	return c.redirect("/api/admin/posts");
});

export { posts as postsRoutes };
