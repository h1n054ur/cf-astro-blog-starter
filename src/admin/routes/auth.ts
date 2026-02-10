import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { createToken } from "../middleware/auth";
import {
	clearAttempts,
	rateLimit,
	recordFailedAttempt,
} from "../middleware/rate-limit";
import { loginPage } from "../views/login";

const auth = new Hono<{ Bindings: Env }>();

// GET /api/auth/login — render login page
auth.get("/login", (c) => {
	return c.html(loginPage());
});

// POST /api/auth/login — authenticate
auth.post("/login", rateLimit, async (c) => {
	const body = await c.req.parseBody();
	const username = String(body.username || "");
	const password = String(body.password || "");
	const ip = c.req.header("cf-connecting-ip") || "unknown";

	if (!username || !password) {
		return c.html(loginPage("Username and password are required"), 400);
	}

	// Verify credentials
	if (username !== c.env.ADMIN_USERNAME) {
		await recordFailedAttempt(c.env, ip);
		return c.html(loginPage("Invalid credentials"), 401);
	}

	// Verify password hash (SHA-256)
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	if (hashHex !== c.env.ADMIN_PASSWORD_HASH) {
		await recordFailedAttempt(c.env, ip);
		return c.html(loginPage("Invalid credentials"), 401);
	}

	// Create JWT and set cookie
	const token = await createToken(c.env.JWT_SECRET);
	setCookie(c, "admin_session", token, {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
		path: "/",
		maxAge: 7 * 24 * 60 * 60, // 7 days
	});

	await clearAttempts(c.env, ip);
	return c.redirect("/api/admin");
});

// GET /api/auth/logout
auth.get("/logout", (c) => {
	deleteCookie(c, "admin_session", { path: "/" });
	return c.redirect("/api/auth/login");
});

// GET /api/auth/verify
auth.get("/verify", async (c) => {
	const { getCookie } = await import(/* @vite-ignore */ "hono/cookie");
	const token = getCookie(c, "admin_session");
	if (!token) {
		return c.json({ authenticated: false }, 401);
	}

	try {
		const { verifyToken } = await import(
			/* @vite-ignore */ "../middleware/auth"
		);
		const valid = await verifyToken(c.env.JWT_SECRET, token);
		return c.json({ authenticated: valid }, valid ? 200 : 401);
	} catch {
		return c.json({ authenticated: false }, 401);
	}
});

export { auth as authRoutes };
