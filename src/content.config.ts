import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const works = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    category: z.enum(["development", "game", "video", "image"]),
    tags: z.array(z.string()).default([]),
    cover: z.string(),
    coverAlt: z.string(),
    coverCaption: z.string().optional(),
    year: z.string(),
    status: z.string(),
    role: z.string(),
    featured: z.boolean().default(false),
    featuredOrder: z.number().int().positive().optional(),
    detailMode: z.enum(["case-study", "profile"]).default("profile"),
    repository: z
      .object({
        name: z.string(),
        url: z.url()
      })
      .optional(),
    externalUrl: z.url().optional(),
    video: z
      .object({
        platform: z.string(),
        url: z.url(),
        embedUrl: z.url()
      })
      .optional(),
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional()
        })
      )
      .default([])
  })
});

export const collections = { works };
