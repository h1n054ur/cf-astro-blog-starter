import { describe, expect, test } from "bun:test";
import { app } from "../../src/admin/app";

describe("Admin API", () => {
	test("GET /health returns ok", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);

		const body = await res.json();
		expect(body.status).toBe("ok");
		expect(body.timestamp).toBeDefined();
	});

	test("GET /auth/login returns login page", async () => {
		const res = await app.request("/auth/login");
		expect(res.status).toBe(200);

		const html = await res.text();
		expect(html).toContain("Admin Login");
		expect(html).toContain("username");
		expect(html).toContain("password");
	});

	test("GET /admin redirects to login without auth", async () => {
		const res = await app.request("/admin", { redirect: "manual" });
		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("/api/auth/login");
	});

	test("GET /admin/posts redirects to login without auth", async () => {
		const res = await app.request("/admin/posts", { redirect: "manual" });
		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("/api/auth/login");
	});

	test("GET /admin/media redirects to login without auth", async () => {
		const res = await app.request("/admin/media", { redirect: "manual" });
		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("/api/auth/login");
	});

	test("GET /admin/analytics redirects to login without auth", async () => {
		const res = await app.request("/admin/analytics", {
			redirect: "manual",
		});
		expect(res.status).toBe(302);
		expect(res.headers.get("location")).toBe("/api/auth/login");
	});

	test("POST /auth/login without credentials returns 400", async () => {
		const res = await app.request("/auth/login", {
			method: "POST",
			body: new URLSearchParams({}),
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});
		expect(res.status).toBe(400);

		const html = await res.text();
		expect(html).toContain("required");
	});
});
