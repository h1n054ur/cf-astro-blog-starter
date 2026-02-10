import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import * as jose from "jose";

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
	const token = getCookie(c, "admin_session");

	if (!token) {
		return c.redirect("/api/auth/login");
	}

	try {
		const secret = new TextEncoder().encode(c.env.JWT_SECRET);
		await jose.jwtVerify(token, secret);
		await next();
	} catch {
		return c.redirect("/api/auth/login");
	}
}

export async function verifyToken(
	jwtSecret: string,
	token: string,
): Promise<boolean> {
	try {
		const secret = new TextEncoder().encode(jwtSecret);
		await jose.jwtVerify(token, secret);
		return true;
	} catch {
		return false;
	}
}

export async function createToken(jwtSecret: string): Promise<string> {
	const secret = new TextEncoder().encode(jwtSecret);
	return await new jose.SignJWT({ role: "admin" })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(secret);
}
