export const BLOCK_TYPES = [
  "heading",
  "paragraph",
  "image",
  "youtube",
  "tiktok",
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
  tiktok: "Video TikTok",
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
/** `url` accepts a share URL, a bare video id, or TikTok's full embed snippet. */
export type TikTokBlockData = { url: string; caption?: string };
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
  | { type: "tiktok"; data: TikTokBlockData }
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
    case "tiktok":
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

/**
 * Pull the numeric video id out of whatever TikTok hands the admin: a share
 * URL, a bare id, or the whole `<blockquote class="tiktok-embed">…</blockquote>`
 * snippet from TikTok's "Embed" button. The snippet is the common case — it is
 * what the Embed button copies to the clipboard — so `data-video-id` is checked
 * first and the raw paste is accepted verbatim rather than made the admin's
 * problem to trim down to a URL.
 *
 * Short links (vm.tiktok.com/..., tiktok.com/t/...) deliberately return null:
 * they carry no id and only resolve through an HTTP redirect, which the block
 * renderer cannot follow. The editor tells the admin to paste the full link
 * instead of silently rendering an empty embed.
 */
export function tiktokIdFromUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // `\d{15,25}` everywhere below, not `\d{6,}`: real ids are 19 digits, and a
  // loose run also matched short numbers sitting in unrelated TikTok URLs,
  // which showed the admin a green "id accepted" for something that is not a
  // video. Repeated per pattern on purpose — regex literals are validated at
  // parse time, which a built-from-string RegExp is not.
  const patterns = [
    // The embed snippet: <blockquote ... data-video-id="7123456789012345678">
    /data-video-id=["'](\d{15,25})["']/,
    // https://www.tiktok.com/@user/video/7123456789012345678?is_from_webapp=1
    // Also matches the `cite="…"` URL inside an embed snippet. `photo` covers
    // slideshow posts, which share the same embed endpoint as videos.
    /tiktok\.com\/@[^/"']+\/(?:video|photo)\/(\d{15,25})/,
    // https://m.tiktok.com/v/7123456789012345678.html
    /tiktok\.com\/v\/(\d{15,25})/,
    // https://www.tiktok.com/embed/v2/7123456789012345678 — re-pasted embed URL
    /tiktok\.com\/embed(?:\/v\d)?\/(\d{15,25})/,
    // A bare id copied out of the share sheet.
    /^(\d{15,25})$/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  return null;
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
