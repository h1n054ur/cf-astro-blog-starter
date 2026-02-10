export interface SiteConfig {
	name: string;
	url: string;
	description: string;
	author: string;
	language: string;
}

export const siteConfig: SiteConfig = {
	name: "CF Astro Blog",
	url: "https://example.com",
	description: "A blog powered by Astro + Hono on Cloudflare Workers",
	author: "Admin",
	language: "en",
};

export interface PaginationParams {
	page: number;
	limit: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export type PostStatus = "draft" | "published" | "scheduled";
