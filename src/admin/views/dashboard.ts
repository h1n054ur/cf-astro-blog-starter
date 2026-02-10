import { adminLayout } from "./layout";

interface DashboardData {
	posts: { total: number; published: number; drafts: number };
	sessions: number;
	events: number;
	recentPosts: Array<{
		id: number;
		title: string;
		slug: string;
		status: string;
		viewCount: number | null;
		createdAt: string;
	}>;
}

export function dashboardPage(data: DashboardData): string {
	const content = `
		<h1>Dashboard</h1>
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-value">${data.posts.total}</span>
				<span class="stat-label">Total Posts</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">${data.posts.published}</span>
				<span class="stat-label">Published</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">${data.posts.drafts}</span>
				<span class="stat-label">Drafts</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">${data.sessions}</span>
				<span class="stat-label">Sessions</span>
			</div>
			<div class="stat-card">
				<span class="stat-value">${data.events}</span>
				<span class="stat-label">Events</span>
			</div>
		</div>

		<h2>Recent Posts</h2>
		${
			data.recentPosts.length > 0
				? `<table class="data-table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Status</th>
						<th>Views</th>
						<th>Created</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					${data.recentPosts
						.map(
							(post) => `
					<tr>
						<td><a href="/api/admin/posts/${post.id}/edit">${post.title}</a></td>
						<td><span class="badge badge-${post.status}">${post.status}</span></td>
						<td>${post.viewCount ?? 0}</td>
						<td>${new Date(post.createdAt).toLocaleDateString()}</td>
						<td>
							<a href="/api/admin/posts/${post.id}/edit" class="btn btn-sm">Edit</a>
							<a href="/blog/${post.slug}" target="_blank" class="btn btn-sm">View</a>
						</td>
					</tr>`,
						)
						.join("")}
				</tbody>
			</table>`
				: '<p class="empty-state">No posts yet. <a href="/api/admin/posts/new">Create your first post</a>.</p>'
		}

		<div style="margin-top: 1rem;">
			<a href="/api/admin/posts/new" class="btn btn-primary">New Post</a>
		</div>
	`;

	return adminLayout("Dashboard", content);
}
