export const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "image",
  "youtube",
  "list",
  "quote",
  "divider",
  "spec_table",
  "feature_grid",
  "image_comparison",
  "faq",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Tiêu Đề",
  paragraph: "Đoạn Văn (Rich Text)",
  image: "Ảnh Đơn",
  youtube: "Video YouTube",
  list: "Danh Sách",
  quote: "Trích Dẫn",
  divider: "Đường Kẻ",
  spec_table: "Bảng Thông Số",
  feature_grid: "Grid Tính Năng",
  image_comparison: "So Sánh 2 Ảnh",
  faq: "Câu Hỏi Thường Gặp",
};

export type HeadingBlockData = { text: string; level: 2 | 3 };
export type ParagraphBlockData = { html: string };
export type ImageBlockData = { mediaId: string; caption?: string };
export type YouTubeBlockData = { url: string; caption?: string };
export type ListBlockData = { items: string[]; style: "bullet" | "numbered" };
export type QuoteBlockData = { text: string; cite?: string };
export type DividerBlockData = Record<string, never>;
export type SpecTableRow = { label: string; value: string };
export type SpecTableBlockData = { rows: SpecTableRow[] };
export type FeatureGridItem = {
  title: string;
  description?: string;
  icon?: string;
};
export type FeatureGridBlockData = { items: FeatureGridItem[] };
export type ImageComparisonBlockData = {
  leftMediaId: string;
  leftLabel?: string;
  rightMediaId: string;
  rightLabel?: string;
};
export type FaqItem = { question: string; answer: string };
export type FaqBlockData = { items: FaqItem[] };

export type BlockData =
  | { type: "heading"; data: HeadingBlockData }
  | { type: "paragraph"; data: ParagraphBlockData }
  | { type: "image"; data: ImageBlockData }
  | { type: "youtube"; data: YouTubeBlockData }
  | { type: "list"; data: ListBlockData }
  | { type: "quote"; data: QuoteBlockData }
  | { type: "divider"; data: DividerBlockData }
  | { type: "spec_table"; data: SpecTableBlockData }
  | { type: "feature_grid"; data: FeatureGridBlockData }
  | { type: "image_comparison"; data: ImageComparisonBlockData }
  | { type: "faq"; data: FaqBlockData };

export type SectionBlock = {
  id: string;
  order: number;
} & BlockData;

export type ProductSection = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  blocks: SectionBlock[];
};

export function defaultBlockData(type: BlockType): BlockData {
  switch (type) {
    case "heading":
      return { type, data: { text: "", level: 2 } };
    case "paragraph":
      return { type, data: { html: "" } };
    case "image":
      return { type, data: { mediaId: "", caption: "" } };
    case "youtube":
      return { type, data: { url: "", caption: "" } };
    case "list":
      return { type, data: { items: [""], style: "bullet" } };
    case "quote":
      return { type, data: { text: "", cite: "" } };
    case "divider":
      return { type, data: {} };
    case "spec_table":
      return { type, data: { rows: [{ label: "", value: "" }] } };
    case "feature_grid":
      return { type, data: { items: [{ title: "", description: "" }] } };
    case "image_comparison":
      return {
        type,
        data: { leftMediaId: "", rightMediaId: "" },
      };
    case "faq":
      return { type, data: { items: [{ question: "", answer: "" }] } };
  }
}

export function youtubeIdFromUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
