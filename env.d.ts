/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

interface Env {
	DB: D1Database;
	MEDIA_BUCKET: R2Bucket;
	SESSION: KVNamespace;
	ASSETS: Fetcher;

	SITE_NAME: string;
	SITE_URL: string;
	TURNSTILE_SITE_KEY: string;

	JWT_SECRET: string;
	ADMIN_USERNAME: string;
	ADMIN_PASSWORD_HASH: string;
	TURNSTILE_SECRET_KEY: string;
}

declare namespace App {
	interface Locals extends Runtime {}
}
