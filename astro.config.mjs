import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://uronika.github.io",
  output: "static",
  integrations: [sitemap()],
  build: {
    assets: "assets"
  }
});
