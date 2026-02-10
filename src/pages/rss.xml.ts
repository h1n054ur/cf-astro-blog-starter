import type { APIRoute } from "astro";
import { desc, eq } from "drizzle-orm";
import { blogPosts } from "@/db/schema";
import { getDb } from "@/lib/db";
import { siteConfig } from "@/lib/types";

export const GET: APIRoute = async (context) => {
	let posts: Array<{
		title: string;
		slug: string;
		excerpt: string | null;
		publishedAt: string | null;
		content: string;
	}> = [];

	try {
		const { env } = context.locals.runtime;
		const db = getDb(env.DB);

		posts = await db
			.select({
				title: blogPosts.title,
				slug: blogPosts.slug,
				excerpt: blogPosts.excerpt,
				publishedAt: blogPosts.publishedAt,
				content: blogPosts.content,
			})
			.from(blogPosts)
			.where(eq(blogPosts.status, "published"))
			.orderBy(desc(blogPosts.publishedAt))
			.limit(20);
	} catch {
		// D1 not bound
	}

	const items = posts
		.map(
			(post) => `
		<item>
			<title><![CDATA[${post.title}]]></title>
			<link>${siteConfig.url}/blog/${post.slug}</link>
			<guid isPermaLink="true">${siteConfig.url}/blog/${post.slug}</guid>
			<description><![CDATA[${post.excerpt || ""}]]></description>
			${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
		</item>`,
		)
		.join("\n");

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${siteConfig.name}</title>
		<description>${siteConfig.description}</description>
		<link>${siteConfig.url}</link>
		<atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
		<language>${siteConfig.language}</language>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		${items}
	</channel>
</rss>`;

	return new Response(rss.trim(), {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
