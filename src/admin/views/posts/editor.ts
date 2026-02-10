import type { BlogCategory, BlogPost, BlogTag } from "@/db/schema";
import { adminLayout } from "../layout";

interface EditorData {
	post?: BlogPost;
	categories: BlogCategory[];
	tags: BlogTag[];
	selectedTagIds?: number[];
}

export function postEditorPage(data: EditorData): string {
	const { post, categories, tags, selectedTagIds = [] } = data;
	const isEdit = !!post;
	const formAction = isEdit
		? `/api/admin/posts/${post.id}`
		: "/api/admin/posts";

	const content = `
		<h1>${isEdit ? "Edit Post" : "New Post"}</h1>

		<form method="post" action="${formAction}">
			<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
				<div>
					<div class="form-group">
						<label for="title">Title</label>
						<input type="text" id="title" name="title" class="form-input" value="${post?.title || ""}" required />
					</div>

					<div class="form-group">
						<label for="slug">Slug</label>
						<input type="text" id="slug" name="slug" class="form-input" value="${post?.slug || ""}" required pattern="[a-z0-9\\-]+" />
					</div>

					<div class="form-group">
						<label for="excerpt">Excerpt</label>
						<input type="text" id="excerpt" name="excerpt" class="form-input" value="${post?.excerpt || ""}" maxlength="200" />
					</div>

					<div class="form-group">
						<label for="content">Content (Markdown)</label>
						<textarea id="content" name="content" class="form-textarea" required>${post?.content || ""}</textarea>
					</div>
				</div>

				<div>
					<div class="form-group">
						<label for="status">Status</label>
						<select id="status" name="status" class="form-select">
							<option value="draft" ${post?.status === "draft" ? "selected" : ""}>Draft</option>
							<option value="published" ${post?.status === "published" ? "selected" : ""}>Published</option>
							<option value="scheduled" ${post?.status === "scheduled" ? "selected" : ""}>Scheduled</option>
						</select>
					</div>

					<div class="form-group">
						<label for="categoryId">Category</label>
						<select id="categoryId" name="categoryId" class="form-select">
							<option value="">None</option>
							${categories.map((cat) => `<option value="${cat.id}" ${post?.categoryId === cat.id ? "selected" : ""}>${cat.name}</option>`).join("")}
						</select>
					</div>

					<div class="form-group">
						<label for="authorName">Author</label>
						<input type="text" id="authorName" name="authorName" class="form-input" value="${post?.authorName || "Admin"}" />
					</div>

					<div class="form-group">
						<label for="featuredImageKey">Featured Image (R2 Key)</label>
						<input type="text" id="featuredImageKey" name="featuredImageKey" class="form-input" value="${post?.featuredImageKey || ""}" />
					</div>

					<div class="form-group">
						<label for="featuredImageAlt">Image Alt Text</label>
						<input type="text" id="featuredImageAlt" name="featuredImageAlt" class="form-input" value="${post?.featuredImageAlt || ""}" />
					</div>

					<details style="margin-bottom: 1rem;">
						<summary style="cursor: pointer; color: var(--text-secondary); margin-bottom: 0.75rem;">SEO Settings</summary>
						<div class="form-group">
							<label for="metaTitle">Meta Title</label>
							<input type="text" id="metaTitle" name="metaTitle" class="form-input" value="${post?.metaTitle || ""}" />
						</div>
						<div class="form-group">
							<label for="metaDescription">Meta Description</label>
							<input type="text" id="metaDescription" name="metaDescription" class="form-input" value="${post?.metaDescription || ""}" maxlength="160" />
						</div>
						<div class="form-group">
							<label for="metaKeywords">Meta Keywords</label>
							<input type="text" id="metaKeywords" name="metaKeywords" class="form-input" value="${post?.metaKeywords || ""}" />
						</div>
						<div class="form-group">
							<label for="canonicalUrl">Canonical URL</label>
							<input type="url" id="canonicalUrl" name="canonicalUrl" class="form-input" value="${post?.canonicalUrl || ""}" />
						</div>
					</details>

					${
						tags.length > 0
							? `<div class="form-group">
						<label>Tags</label>
						<input type="hidden" id="tagIds" name="tagIds" value="${selectedTagIds.join(",")}" />
						<div style="display: flex; flex-wrap: wrap; gap: 0.375rem;">
							${tags
								.map(
									(tag) => `
								<label style="display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.8rem; cursor: pointer;">
									<input type="checkbox" value="${tag.id}" ${selectedTagIds.includes(tag.id) ? "checked" : ""} onchange="updateTagIds()" />
									${tag.name}
								</label>`,
								)
								.join("")}
						</div>
					</div>`
							: ""
					}

					<div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
						<button type="submit" class="btn btn-primary">${isEdit ? "Update" : "Create"} Post</button>
						<a href="/api/admin/posts" class="btn">Cancel</a>
					</div>
				</div>
			</div>
		</form>

		<script>
			// Auto-generate slug from title
			document.getElementById('title')?.addEventListener('input', function() {
				const slugField = document.getElementById('slug');
				if (slugField && !slugField.dataset.manual) {
					slugField.value = this.value
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-')
						.replace(/^-|-$/g, '');
				}
			});

			document.getElementById('slug')?.addEventListener('input', function() {
				this.dataset.manual = 'true';
			});

			function updateTagIds() {
				const checkboxes = document.querySelectorAll('input[type="checkbox"][onchange="updateTagIds()"]');
				const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
				document.getElementById('tagIds').value = selected.join(',');
			}
		</script>
	`;

	return adminLayout(isEdit ? "Edit Post" : "New Post", content);
}
