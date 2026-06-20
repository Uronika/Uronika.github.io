export const categoryLabels = {
  development: "开发",
  game: "游戏",
  video: "视频",
  image: "图像"
} as const;

export type WorkCategory = keyof typeof categoryLabels;

export function getCategoryLabel(category: WorkCategory): string {
  return categoryLabels[category];
}

