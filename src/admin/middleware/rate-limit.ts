import { eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { loginAttempts } from "@/db/schema";
import { getDb } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function rateLimit(c: Context<{ Bindings: Env }>, next: Next) {
	const ip = c.req.header("cf-connecting-ip") || "unknown";

	try {
		const db = getDb(c.env.DB);
		const [record] = await db
			.select()
			.from(loginAttempts)
			.where(eq(loginAttempts.ipAddress, ip))
			.limit(1);

		if (record) {
			// Check if locked out
			if (record.lockedUntil) {
				const lockExpiry = new Date(record.lockedUntil);
				if (lockExpiry > new Date()) {
					const remainingSeconds = Math.ceil(
						(lockExpiry.getTime() - Date.now()) / 1000,
					);
					return c.json(
						{
							error: "Too many attempts",
							retryAfterSeconds: remainingSeconds,
						},
						429,
					);
				}

				// Lock expired — reset
				await db
					.update(loginAttempts)
					.set({ attempts: 0, lockedUntil: null })
					.where(eq(loginAttempts.ipAddress, ip));
			}
		}
	} catch {
		// D1 not available — skip rate limiting
	}

	await next();
}

export async function recordFailedAttempt(env: Env, ip: string): Promise<void> {
	try {
		const db = getDb(env.DB);
		const [record] = await db
			.select()
			.from(loginAttempts)
			.where(eq(loginAttempts.ipAddress, ip))
			.limit(1);

		const now = new Date().toISOString();
		const newAttempts = (record?.attempts ?? 0) + 1;
		const lockedUntil =
			newAttempts >= MAX_ATTEMPTS
				? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
				: null;

		if (record) {
			await db
				.update(loginAttempts)
				.set({ attempts: newAttempts, lockedUntil, lastAttempt: now })
				.where(eq(loginAttempts.ipAddress, ip));
		} else {
			await db.insert(loginAttempts).values({
				ipAddress: ip,
				attempts: newAttempts,
				lockedUntil,
				lastAttempt: now,
			});
		}
	} catch {
		// D1 not available
	}
}

export async function clearAttempts(env: Env, ip: string): Promise<void> {
	try {
		const db = getDb(env.DB);
		await db.delete(loginAttempts).where(eq(loginAttempts.ipAddress, ip));
	} catch {
		// D1 not available
	}
}
