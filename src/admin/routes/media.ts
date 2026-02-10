import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { adminLayout } from "../views/layout";

const media = new Hono<{ Bindings: Env }>();

media.use("*", requireAuth);

// GET /api/admin/media — media library
media.get("/", async (c) => {
	let objects: R2Object[] = [];

	try {
		const listed = await c.env.MEDIA_BUCKET.list({ limit: 100 });
		objects = listed.objects;
	} catch {
		// R2 not bound
	}

	const content = `
		<h1>Media Library</h1>
		<form method="post" action="/api/admin/media/upload" enctype="multipart/form-data" class="upload-form">
			<input type="file" name="file" accept="image/*,video/*,.pdf,.webp,.avif" required />
			<button type="submit" class="btn btn-primary">Upload</button>
		</form>
		<div class="media-grid">
			${
				objects.length > 0
					? objects
							.map(
								(obj) => `
				<div class="media-item">
					<div class="media-preview">
						${
							obj.key.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)
								? `<img src="/api/admin/media/file/${obj.key}" alt="${obj.key}" loading="lazy" />`
								: `<span class="file-icon">${obj.key.split(".").pop()?.toUpperCase() || "FILE"}</span>`
						}
					</div>
					<div class="media-info">
						<span class="media-name" title="${obj.key}">${obj.key}</span>
						<span class="media-size">${formatBytes(obj.size)}</span>
					</div>
					<form method="post" action="/api/admin/media/delete/${obj.key}" class="media-actions">
						<button type="button" class="btn btn-sm" onclick="navigator.clipboard.writeText('${obj.key}')">Copy Key</button>
						<button type="submit" class="btn btn-sm btn-danger">Delete</button>
					</form>
				</div>`,
							)
							.join("")
					: "<p class='empty-state'>No media files uploaded yet.</p>"
			}
		</div>
	`;

	return c.html(adminLayout("Media", content));
});

// POST /api/admin/media/upload
media.post("/upload", async (c) => {
	const body = await c.req.parseBody();
	const file = body.file;

	if (!(file instanceof File)) {
		return c.json({ error: "No file provided" }, 400);
	}

	const key = `uploads/${Date.now()}-${file.name}`;
	await c.env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type },
	});

	return c.redirect("/api/admin/media");
});

// GET /api/admin/media/file/:key — serve file from R2
media.get("/file/*", async (c) => {
	const key = c.req.path.replace("/api/admin/media/file/", "");
	const object = await c.env.MEDIA_BUCKET.get(key);

	if (!object) {
		return c.notFound();
	}

	return new Response(object.body, {
		headers: {
			"Content-Type":
				object.httpMetadata?.contentType || "application/octet-stream",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
});

// POST /api/admin/media/delete/:key — delete file from R2
media.post("/delete/*", async (c) => {
	const key = c.req.path.replace("/api/admin/media/delete/", "");
	await c.env.MEDIA_BUCKET.delete(key);
	return c.redirect("/api/admin/media");
});

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export { media as mediaRoutes };
