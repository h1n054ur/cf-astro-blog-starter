// @ts-check
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

export default defineConfig({
	output: "server",
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
	site: "https://example.com",
	vite: {
		resolve: {
			alias: {
				"@": "/src",
			},
		},
	},
});
