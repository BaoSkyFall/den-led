"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { keytoUrl } from "@/lib/utils";
import type {
  FeatureGridBlockData,
  FaqBlockData,
  HeadingBlockData,
  ImageBlockData,
  ImageComparisonBlockData,
  ListBlockData,
  ParagraphBlockData,
  ProductSection,
  QuoteBlockData,
  SectionBlock,
  SpecTableBlockData,
  YouTubeBlockData,
} from "./types";
import { youtubeIdFromUrl } from "./types";

type MediaLookup = (mediaId: string) => { key: string; alt: string } | null;

type Props = {
  sections: ProductSection[];
  mediaLookup?: MediaLookup;
};

/**
 * Resolve a mediaId to a full public URL. When no lookup is provided,
 * assume the caller already passed a full key or URL as mediaId.
 */
function resolveMedia(mediaId: string, mediaLookup?: MediaLookup): string {
  if (!mediaId) return "";
  if (mediaLookup) {
    const m = mediaLookup(mediaId);
    if (m?.key) return keytoUrl(m.key);
  }
  // Fallback: treat as full URL or storage key already.
  if (mediaId.startsWith("http") || mediaId.startsWith("/")) return mediaId;
  return keytoUrl(mediaId);
}

export default function ProductSectionsRenderer({
  sections,
  mediaLookup,
}: Props) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="space-y-11 lg:space-y-16">
      {sections.map((section) => (
        <SectionView
          key={section.id}
          section={section}
          mediaLookup={mediaLookup}
        />
      ))}
    </div>
  );
}

function SectionView({
  section,
  mediaLookup,
}: {
  section: ProductSection;
  mediaLookup?: MediaLookup;
}) {
  return (
    <section className="max-w-3xl mx-auto">
      {section.title && (
        <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white mb-3">
          {section.title}
        </h2>
      )}
      {section.description && (
        <p className="text-sm lg:text-base text-white/60 leading-relaxed mb-8">
          {section.description}
        </p>
      )}
      <div className="space-y-6">
        {(section.blocks ?? []).map((block) => (
          <BlockView key={block.id} block={block} mediaLookup={mediaLookup} />
        ))}
      </div>
    </section>
  );
}

function BlockView({
  block,
  mediaLookup,
}: {
  block: SectionBlock;
  mediaLookup?: MediaLookup;
}) {
  switch (block.type) {
    case "heading":
      return <HeadingView data={block.data as HeadingBlockData} />;
    case "paragraph":
      return <ParagraphView data={block.data as ParagraphBlockData} />;
    case "image":
      return (
        <ImageView
          data={block.data as ImageBlockData}
          mediaLookup={mediaLookup}
        />
      );
    case "youtube":
      return <YouTubeView data={block.data as YouTubeBlockData} />;
    case "list":
      return <ListView data={block.data as ListBlockData} />;
    case "quote":
      return <QuoteView data={block.data as QuoteBlockData} />;
    case "divider":
      return <div className="border-t border-white/10 my-4" />;
    case "spec_table":
      return <SpecTableView data={block.data as SpecTableBlockData} />;
    case "feature_grid":
      return <FeatureGridView data={block.data as FeatureGridBlockData} />;
    case "image_comparison":
      return (
        <ImageComparisonView
          data={block.data as ImageComparisonBlockData}
          mediaLookup={mediaLookup}
        />
      );
    case "faq":
      return <FaqView data={block.data as FaqBlockData} />;
    default:
      return null;
  }
}

function HeadingView({ data }: { data: HeadingBlockData }) {
  const cls =
    "font-black uppercase tracking-tight text-white " +
    (data.level === 2 ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl");
  return data.level === 2 ? (
    <h3 className={cls}>{data.text}</h3>
  ) : (
    <h4 className={cls}>{data.text}</h4>
  );
}

function ParagraphView({ data }: { data: ParagraphBlockData }) {
  return (
    <div
      className="text-sm lg:text-base text-white/70 leading-relaxed prose-invert max-w-none [&_h2]:text-white [&_h3]:text-white/90 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-amber-500 [&_a]:underline"
      dangerouslySetInnerHTML={{ __html: data.html || "" }}
    />
  );
}

function ImageView({
  data,
  mediaLookup,
}: {
  data: ImageBlockData;
  mediaLookup?: MediaLookup;
}) {
  const src = resolveMedia(data.mediaId, mediaLookup);
  if (!src) return null;
  return (
    <figure>
      <div className="relative aspect-[16/9] bg-[#0a0a0a] overflow-hidden">
        <Image
          src={src}
          alt={data.caption ?? ""}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
        />
      </div>
      {data.caption && (
        <figcaption className="text-xs text-white/40 mt-2 text-center italic">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}

function YouTubeView({ data }: { data: YouTubeBlockData }) {
  const videoId = youtubeIdFromUrl(data.url);
  if (!videoId) return null;
  return (
    <figure>
      <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={data.caption ?? "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {data.caption && (
        <figcaption className="text-xs text-white/40 mt-2 text-center italic">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
}

function ListView({ data }: { data: ListBlockData }) {
  const items = (data.items ?? []).filter(Boolean);
  if (items.length === 0) return null;
  const cls =
    "text-sm lg:text-base text-white/70 pl-5 space-y-1 " +
    (data.style === "numbered" ? "list-decimal" : "list-disc");
  return data.style === "numbered" ? (
    <ol className={cls}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ol>
  ) : (
    <ul className={cls}>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

function QuoteView({ data }: { data: QuoteBlockData }) {
  return (
    <blockquote className="border-l-2 border-amber-500 pl-5 py-2">
      <p className="text-base lg:text-lg text-white italic leading-relaxed">
        {data.text}
      </p>
      {data.cite && (
        <cite className="block text-xs text-white/40 mt-2 not-italic">
          — {data.cite}
        </cite>
      )}
    </blockquote>
  );
}

function SpecTableView({ data }: { data: SpecTableBlockData }) {
  const rows = (data.rows ?? []).filter((r) => r.label || r.value);
  if (rows.length === 0) return null;
  return (
    <div className="border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}
            >
              <th className="text-left px-4 py-3 font-bold text-amber-500 tracking-wider text-[11px] uppercase w-1/3 border-r border-white/5 align-top">
                {r.label}
              </th>
              <td className="px-4 py-3 text-white/70 leading-relaxed">
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureGridView({ data }: { data: FeatureGridBlockData }) {
  const items = (data.items ?? []).filter((it) => it.title || it.description);
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((it, i) => (
        <div
          key={i}
          className="border border-white/10 p-5 hover:border-amber-500 transition-colors"
        >
          {it.icon && (
            <p className="text-2xl mb-2" aria-hidden>
              {it.icon}
            </p>
          )}
          <p className="text-sm font-bold uppercase tracking-wider text-white mb-2">
            {it.title}
          </p>
          {it.description && (
            <p className="text-xs text-white/50 leading-relaxed">
              {it.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ImageComparisonView({
  data,
  mediaLookup,
}: {
  data: ImageComparisonBlockData;
  mediaLookup?: MediaLookup;
}) {
  const left = resolveMedia(data.leftMediaId, mediaLookup);
  const right = resolveMedia(data.rightMediaId, mediaLookup);
  if (!left || !right) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { src: left, label: data.leftLabel },
        { src: right, label: data.rightLabel },
      ].map((c, i) => (
        <figure key={i}>
          <div className="relative aspect-[4/3] bg-[#0a0a0a] overflow-hidden">
            <Image
              src={c.src}
              alt={c.label ?? ""}
              fill
              sizes="(max-width: 768px) 50vw, 400px"
              className="object-cover"
            />
          </div>
          {c.label && (
            <figcaption className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mt-2 text-center">
              {c.label}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function FaqView({ data }: { data: FaqBlockData }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const items = (data.items ?? []).filter((it) => it.question);
  if (items.length === 0) return null;
  return (
    <div className="border border-white/10 divide-y divide-white/10">
      {items.map((it, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-bold text-white pr-4">
                {it.question}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-white/40 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed whitespace-pre-line">
                {it.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
