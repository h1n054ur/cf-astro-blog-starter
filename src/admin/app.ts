import { Hono } from "hono";
import { analyticsRoutes } from "./routes/analytics";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { mediaRoutes } from "./routes/media";
import { postsRoutes } from "./routes/posts";

const app = new Hono<{ Bindings: Env }>();

// Mount admin routes
app.route("/auth", authRoutes);
app.route("/admin", dashboardRoutes);
app.route("/admin/posts", postsRoutes);
app.route("/admin/media", mediaRoutes);
app.route("/admin/analytics", analyticsRoutes);

// Health check
app.get("/health", (c) =>
	c.json({ status: "ok", timestamp: new Date().toISOString() }),
);

export { app };
