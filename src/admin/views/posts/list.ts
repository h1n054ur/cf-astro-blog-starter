import { adminLayout } from "../layout";

interface PostRow {
	id: number;
	title: string;
	slug: string;
	status: string;
	publishedAt: string | null;
	viewCount: number | null;
	createdAt: string;
	categoryName: string | null;
}

export function postsListPage(posts: PostRow[]): string {
	const content = `
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
			<h1 style="margin-bottom: 0;">Posts</h1>
			<a href="/api/admin/posts/new" class="btn btn-primary">New Post</a>
		</div>

		${
			posts.length > 0
				? `<table class="data-table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Category</th>
						<th>Status</th>
						<th>Views</th>
						<th>Date</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					${posts
						.map(
							(post) => `
					<tr>
						<td><a href="/api/admin/posts/${post.id}/edit">${post.title}</a></td>
						<td>${post.categoryName || "-"}</td>
						<td><span class="badge badge-${post.status}">${post.status}</span></td>
						<td>${post.viewCount ?? 0}</td>
						<td>${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</td>
						<td>
							<a href="/api/admin/posts/${post.id}/edit" class="btn btn-sm">Edit</a>
							<a href="/blog/${post.slug}" target="_blank" class="btn btn-sm">View</a>
							<form method="post" action="/api/admin/posts/${post.id}/delete" style="display:inline;">
								<button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Delete this post?')">Delete</button>
							</form>
						</td>
					</tr>`,
						)
						.join("")}
				</tbody>
			</table>`
				: '<p class="empty-state">No posts yet. <a href="/api/admin/posts/new">Create your first post</a>.</p>'
		}
	`;

	return adminLayout("Posts", content);
}
