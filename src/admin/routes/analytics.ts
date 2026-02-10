import { desc, sql } from "drizzle-orm";
import { Hono } from "hono";
import { analyticsEvents, analyticsSessions } from "@/db/schema";
import { getDb } from "@/lib/db";
import { requireAuth } from "../middleware/auth";
import { adminLayout } from "../views/layout";

const analytics = new Hono<{ Bindings: Env }>();

analytics.use("*", requireAuth);

// GET /api/admin/analytics — analytics dashboard
analytics.get("/", async (c) => {
	const stats = {
		totalSessions: 0,
		totalPageViews: 0,
		topPages: [] as Array<{ pageUrl: string; views: number }>,
		topReferrers: [] as Array<{ referrer: string; count: number }>,
		recentEvents: [] as Array<{
			eventType: string;
			pageUrl: string | null;
			timestamp: string;
		}>,
	};

	try {
		const db = getDb(c.env.DB);

		const [sessionCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(analyticsSessions);
		stats.totalSessions = sessionCount?.count ?? 0;

		const [pageViewCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(analyticsEvents);
		stats.totalPageViews = pageViewCount?.count ?? 0;

		stats.topPages = (await db
			.select({
				pageUrl: analyticsEvents.pageUrl,
				views: sql<number>`count(*)`,
			})
			.from(analyticsEvents)
			.groupBy(analyticsEvents.pageUrl)
			.orderBy(desc(sql`count(*)`))
			.limit(10)) as Array<{ pageUrl: string; views: number }>;

		stats.topReferrers = (
			await db
				.select({
					referrer: analyticsSessions.referrer,
					count: sql<number>`count(*)`,
				})
				.from(analyticsSessions)
				.groupBy(analyticsSessions.referrer)
				.orderBy(desc(sql`count(*)`))
				.limit(10)
		).filter((r) => r.referrer) as Array<{ referrer: string; count: number }>;

		stats.recentEvents = await db
			.select({
				eventType: analyticsEvents.eventType,
				pageUrl: analyticsEvents.pageUrl,
				timestamp: analyticsEvents.timestamp,
			})
			.from(analyticsEvents)
			.orderBy(desc(analyticsEvents.timestamp))
			.limit(20);
	} catch {
		// D1 not bound
	}

	const content = `
		<h1>Analytics</h1>
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-value">${stats.totalSessions}</span>
				<span class="stat-label">Total Sessions</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">${stats.totalPageViews}</span>
				<span class="stat-label">Total Events</span>
			</div>
		</div>

		<h2>Top Pages</h2>
		${
			stats.topPages.length > 0
				? `<table class="data-table">
				<thead><tr><th>Page</th><th>Views</th></tr></thead>
				<tbody>
					${stats.topPages.map((p) => `<tr><td>${p.pageUrl}</td><td>${p.views}</td></tr>`).join("")}
				</tbody>
			</table>`
				: "<p class='empty-state'>No page view data yet.</p>"
		}

		<h2>Top Referrers</h2>
		${
			stats.topReferrers.length > 0
				? `<table class="data-table">
				<thead><tr><th>Referrer</th><th>Count</th></tr></thead>
				<tbody>
					${stats.topReferrers.map((r) => `<tr><td>${r.referrer}</td><td>${r.count}</td></tr>`).join("")}
				</tbody>
			</table>`
				: "<p class='empty-state'>No referrer data yet.</p>"
		}

		<h2>Recent Events</h2>
		${
			stats.recentEvents.length > 0
				? `<table class="data-table">
				<thead><tr><th>Type</th><th>Page</th><th>Time</th></tr></thead>
				<tbody>
					${stats.recentEvents.map((e) => `<tr><td>${e.eventType}</td><td>${e.pageUrl || "-"}</td><td>${e.timestamp}</td></tr>`).join("")}
				</tbody>
			</table>`
				: "<p class='empty-state'>No events recorded yet.</p>"
		}
	`;

	return c.html(adminLayout("Analytics", content));
});

export { analytics as analyticsRoutes };
