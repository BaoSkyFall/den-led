"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { MultiImageDialog } from "@/features/medias";
import { keytoUrl } from "@/lib/utils";
import Image from "next/image";
import ProductSectionsRenderer from "../ProductSectionsRenderer";
import {
  BLOCK_LABELS,
  BLOCK_TYPES,
  defaultBlockData,
  type BlockType,
  type FaqBlockData,
  type FeatureGridBlockData,
  type HeadingBlockData,
  type ImageBlockData,
  type ImageComparisonBlockData,
  type ListBlockData,
  type ParagraphBlockData,
  type ProductSection,
  type QuoteBlockData,
  type SectionBlock,
  type SpecTableBlockData,
  type YouTubeBlockData,
} from "../types";

type Props = { productId: string };

let tmpCounter = 0;
const tmpId = (prefix: string) => `tmp-${prefix}-${++tmpCounter}`;

// Small media cache so admin can preview images by mediaId.
type MediaEntry = { id: string; key: string; alt: string };

export default function ProductSectionsEditor({ productId }: Props) {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const [mediaCache, setMediaCache] = useState<Record<string, MediaEntry>>({});
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/product-sections/${productId}`)
      .then((r) => r.json())
      .then((data: ProductSection[]) => {
        setSections(Array.isArray(data) ? data : []);
        setLoading(false);
        // Pre-fetch media for image blocks so preview can render right away.
        const mediaIds = new Set<string>();
        for (const s of data ?? []) {
          for (const b of s.blocks ?? []) {
            if (b.type === "image" && b.data.mediaId)
              mediaIds.add(b.data.mediaId);
            if (b.type === "image_comparison") {
              if (b.data.leftMediaId) mediaIds.add(b.data.leftMediaId);
              if (b.data.rightMediaId) mediaIds.add(b.data.rightMediaId);
            }
          }
        }
        loadMedia([...mediaIds]);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function loadMedia(ids: string[]) {
    const missing = ids.filter((id) => id && !mediaCache[id]);
    if (missing.length === 0) return;
    const responses = await Promise.all(
      missing.map((id) =>
        fetch(`/api/medias/${id}`).then((r) => (r.ok ? r.json() : null)),
      ),
    );
    const patch: Record<string, MediaEntry> = {};
    for (const m of responses) {
      if (m?.id) patch[m.id] = m;
    }
    if (Object.keys(patch).length > 0) {
      setMediaCache((prev) => ({ ...prev, ...patch }));
    }
  }

  function save() {
    startSave(async () => {
      const res = await fetch(`/api/product-sections/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      if (!res.ok) {
        toast({ title: "Lỗi", description: "Không lưu được sections." });
        return;
      }
      const data = await res.json();
      toast({ title: `Đã lưu ${data.count ?? 0} section` });
      // Refresh IDs from server so subsequent saves match DB rows.
      const refreshed = await fetch(`/api/product-sections/${productId}`).then(
        (r) => r.json(),
      );
      if (Array.isArray(refreshed)) setSections(refreshed);
    });
  }

  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        id: tmpId("s"),
        title: "",
        description: null,
        order: prev.length,
        blocks: [],
      },
    ]);
  }

  function updateSection(idx: number, patch: Partial<ProductSection>) {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  }

  function removeSection(idx: number) {
    if (!confirm("Xoá section này?")) return;
    setSections((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveSection(idx: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function addBlock(sectionIdx: number, type: BlockType) {
    const base = defaultBlockData(type);
    const block: SectionBlock = {
      id: tmpId("b"),
      order: sections[sectionIdx].blocks.length,
      ...base,
    } as SectionBlock;
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx ? { ...s, blocks: [...s.blocks, block] } : s,
      ),
    );
  }

  function updateBlock(
    sectionIdx: number,
    blockIdx: number,
    data: SectionBlock["data"],
  ) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        const nextBlocks = s.blocks.map((b, j) =>
          j === blockIdx ? ({ ...b, data } as SectionBlock) : b,
        );
        return { ...s, blocks: nextBlocks };
      }),
    );
  }

  function removeBlock(sectionIdx: number, blockIdx: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIdx
          ? { ...s, blocks: s.blocks.filter((_, j) => j !== blockIdx) }
          : s,
      ),
    );
  }

  function moveBlock(sectionIdx: number, blockIdx: number, dir: -1 | 1) {
    setSections((prev) =>
      prev.map((s, i) => {
        if (i !== sectionIdx) return s;
        const next = [...s.blocks];
        const target = blockIdx + dir;
        if (target < 0 || target >= next.length) return s;
        [next[blockIdx], next[target]] = [next[target], next[blockIdx]];
        return { ...s, blocks: next };
      }),
    );
  }

  const mediaLookup = useMemo(
    () => (id: string) => {
      const m = mediaCache[id];
      return m ? { key: m.key, alt: m.alt } : null;
    },
    [mediaCache],
  );

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground py-2">Đang tải sections...</p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b pb-3">
        <p className="text-xs text-slate-600">
          <span className="font-bold">{sections.length}</span> section
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 border border-slate-300 hover:border-slate-500 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md"
          >
            <Eye size={14} /> {showPreview ? "Ẩn preview" : "Hiện preview"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-black text-xs font-bold px-4 py-1.5 rounded-md"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Lưu Sections
          </button>
        </div>
      </div>

      <div
        className={
          showPreview
            ? "grid grid-cols-1 xl:grid-cols-2 gap-6"
            : "grid grid-cols-1 gap-6"
        }
      >
        {/* Editor column */}
        <div className="space-y-4 min-w-0">
          {sections.map((section, idx) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={idx}
              total={sections.length}
              mediaCache={mediaCache}
              onLoadMedia={loadMedia}
              onChange={(patch) => updateSection(idx, patch)}
              onRemove={() => removeSection(idx)}
              onMove={(dir) => moveSection(idx, dir)}
              onAddBlock={(type) => addBlock(idx, type)}
              onUpdateBlock={(bIdx, data) => updateBlock(idx, bIdx, data)}
              onRemoveBlock={(bIdx) => removeBlock(idx, bIdx)}
              onMoveBlock={(bIdx, dir) => moveBlock(idx, bIdx, dir)}
            />
          ))}

          <button
            type="button"
            onClick={addSection}
            className="w-full border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50 text-slate-600 text-sm font-medium py-4 rounded-md transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Thêm Section
          </button>
        </div>

        {/* Preview column */}
        {showPreview && (
          <div className="min-w-0">
            <div className="sticky top-4 border border-slate-200 rounded-md overflow-hidden">
              <div className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase">
                Preview (giống trên store)
              </div>
              <div className="bg-[#111111] p-6 max-h-[80vh] overflow-y-auto">
                {sections.length === 0 ? (
                  <p className="text-xs text-white/40">
                    Chưa có section nào để preview.
                  </p>
                ) : (
                  <ProductSectionsRenderer
                    sections={sections}
                    mediaLookup={mediaLookup}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section editor
// ─────────────────────────────────────────────────────────────────────────────

function SectionEditor(props: {
  section: ProductSection;
  index: number;
  total: number;
  mediaCache: Record<string, MediaEntry>;
  onLoadMedia: (ids: string[]) => void;
  onChange: (patch: Partial<ProductSection>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (blockIdx: number, data: SectionBlock["data"]) => void;
  onRemoveBlock: (blockIdx: number) => void;
  onMoveBlock: (blockIdx: number, dir: -1 | 1) => void;
}) {
  const {
    section,
    index,
    total,
    mediaCache,
    onLoadMedia,
    onChange,
    onRemove,
    onMove,
    onAddBlock,
    onUpdateBlock,
    onRemoveBlock,
    onMoveBlock,
  } = props;

  return (
    <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
      <header className="flex items-center justify-between gap-2 bg-slate-50 border-b px-3 py-2">
        <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
          Section #{index + 1}
        </p>
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={() => onMove(-1)}
            disabled={index === 0}
            title="Chuyển lên"
          >
            <ArrowUp size={14} />
          </IconBtn>
          <IconBtn
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="Chuyển xuống"
          >
            <ArrowDown size={14} />
          </IconBtn>
          <IconBtn onClick={onRemove} title="Xoá section" danger>
            <Trash2 size={14} />
          </IconBtn>
        </div>
      </header>

      <div className="p-4 space-y-3">
        <input
          type="text"
          value={section.title}
          placeholder="Tiêu đề section (VD: 'Tính năng nổi bật')"
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full text-lg font-bold text-slate-900 border-0 border-b border-slate-200 focus:border-amber-500 outline-none py-1"
        />
        <textarea
          value={section.description ?? ""}
          placeholder="Mô tả ngắn (optional)"
          onChange={(e) => onChange({ description: e.target.value || null })}
          rows={2}
          className="w-full text-sm text-slate-600 border border-slate-200 focus:border-amber-500 outline-none rounded-md px-3 py-2 resize-none"
        />

        {/* Blocks */}
        <div className="space-y-2">
          {section.blocks.map((block, bIdx) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={bIdx}
              total={section.blocks.length}
              mediaCache={mediaCache}
              onLoadMedia={onLoadMedia}
              onChange={(data) => onUpdateBlock(bIdx, data)}
              onRemove={() => onRemoveBlock(bIdx)}
              onMove={(dir) => onMoveBlock(bIdx, dir)}
            />
          ))}
        </div>

        {/* Add block */}
        <AddBlockMenu onPick={onAddBlock} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add-block menu
// ─────────────────────────────────────────────────────────────────────────────

// Always-visible chip picker — the previous absolute-positioned dropdown got
// clipped by the section card's overflow-hidden and by the dialog's scroll
// container, hiding half of the options. Chips are laid out inline so admin
// always sees all 11 available block types.
function AddBlockMenu({ onPick }: { onPick: (t: BlockType) => void }) {
  return (
    <div className="border-t border-dashed border-slate-200 pt-3 mt-3">
      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
        + Thêm block
      </p>
      <div className="flex flex-wrap gap-1.5">
        {BLOCK_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded border border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors"
          >
            <Plus size={11} strokeWidth={2.5} />
            {BLOCK_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Block editor dispatch
// ─────────────────────────────────────────────────────────────────────────────

function BlockEditor(props: {
  block: SectionBlock;
  index: number;
  total: number;
  mediaCache: Record<string, MediaEntry>;
  onLoadMedia: (ids: string[]) => void;
  onChange: (data: SectionBlock["data"]) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { block, index, total, onChange, onRemove, onMove } = props;
  return (
    <div className="border border-slate-200 rounded-md">
      <header className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b text-xs">
        <span className="font-bold text-slate-500 tracking-wider uppercase">
          {BLOCK_LABELS[block.type]}
        </span>
        <div className="flex items-center gap-1">
          <IconBtn
            onClick={() => onMove(-1)}
            disabled={index === 0}
            title="Chuyển lên"
            size="sm"
          >
            <ArrowUp size={12} />
          </IconBtn>
          <IconBtn
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            title="Chuyển xuống"
            size="sm"
          >
            <ArrowDown size={12} />
          </IconBtn>
          <IconBtn onClick={onRemove} title="Xoá block" size="sm" danger>
            <Trash2 size={12} />
          </IconBtn>
        </div>
      </header>
      <div className="p-3">
        <BlockBody
          block={block}
          mediaCache={props.mediaCache}
          onLoadMedia={props.onLoadMedia}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function BlockBody(props: {
  block: SectionBlock;
  mediaCache: Record<string, MediaEntry>;
  onLoadMedia: (ids: string[]) => void;
  onChange: (data: SectionBlock["data"]) => void;
}) {
  const { block, mediaCache, onLoadMedia, onChange } = props;

  if (block.type === "heading") {
    const d = block.data as HeadingBlockData;
    return (
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={d.text}
          onChange={(e) => onChange({ ...d, text: e.target.value })}
          placeholder="Nội dung tiêu đề"
          className="border border-slate-200 rounded px-3 py-2 text-sm"
        />
        <select
          value={d.level}
          onChange={(e) =>
            onChange({ ...d, level: Number(e.target.value) as 2 | 3 })
          }
          className="border border-slate-200 rounded px-2 text-sm"
        >
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      </div>
    );
  }

  if (block.type === "paragraph") {
    const d = block.data as ParagraphBlockData;
    return (
      <RichTextEditor
        value={d.html}
        onChange={(html) => onChange({ html })}
        placeholder="Nhập nội dung..."
      />
    );
  }

  if (block.type === "image") {
    const d = block.data as ImageBlockData;
    const media = d.mediaId ? mediaCache[d.mediaId] : null;
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <div className="relative w-24 h-24 shrink-0 bg-slate-100 rounded overflow-hidden border border-slate-200">
            {media?.key ? (
              <Image
                src={keytoUrl(media.key)}
                alt={media.alt}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                Chưa chọn
              </div>
            )}
          </div>
          <MultiImageDialog
            onConfirm={(ids) => {
              if (ids[0]) {
                onLoadMedia([ids[0]]);
                onChange({ ...d, mediaId: ids[0] });
              }
            }}
            renderTrigger={
              <button
                type="button"
                className="border border-slate-300 hover:border-amber-500 text-xs font-medium px-3 py-1.5 rounded"
              >
                {d.mediaId ? "Đổi ảnh" : "Chọn / Upload ảnh"}
              </button>
            }
          />
        </div>
        <input
          value={d.caption ?? ""}
          onChange={(e) => onChange({ ...d, caption: e.target.value })}
          placeholder="Chú thích (optional)"
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (block.type === "youtube") {
    const d = block.data as YouTubeBlockData;
    return (
      <div className="space-y-2">
        <input
          value={d.url}
          onChange={(e) => onChange({ ...d, url: e.target.value })}
          placeholder="Dán URL YouTube (https://youtu.be/... hoặc https://youtube.com/watch?v=...)"
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
        />
        <input
          value={d.caption ?? ""}
          onChange={(e) => onChange({ ...d, caption: e.target.value })}
          placeholder="Chú thích (optional)"
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (block.type === "list") {
    const d = block.data as ListBlockData;
    return (
      <div className="space-y-2">
        <select
          value={d.style}
          onChange={(e) =>
            onChange({ ...d, style: e.target.value as "bullet" | "numbered" })
          }
          className="border border-slate-200 rounded px-2 py-1 text-sm"
        >
          <option value="bullet">Bullet (•)</option>
          <option value="numbered">Numbered (1, 2, 3)</option>
        </select>
        <RepeatableStrings
          items={d.items}
          onChange={(items) => onChange({ ...d, items })}
          placeholder="Item"
        />
      </div>
    );
  }

  if (block.type === "quote") {
    const d = block.data as QuoteBlockData;
    return (
      <div className="space-y-2">
        <textarea
          value={d.text}
          onChange={(e) => onChange({ ...d, text: e.target.value })}
          placeholder="Nội dung trích dẫn"
          rows={2}
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm resize-none"
        />
        <input
          value={d.cite ?? ""}
          onChange={(e) => onChange({ ...d, cite: e.target.value })}
          placeholder="Nguồn (optional)"
          className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (block.type === "divider") {
    return (
      <p className="text-xs text-slate-500 italic">
        Đường kẻ ngang — không cần cấu hình.
      </p>
    );
  }

  if (block.type === "spec_table") {
    const d = block.data as SpecTableBlockData;
    return (
      <div className="space-y-2">
        {d.rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              value={row.label}
              onChange={(e) => {
                const next = [...d.rows];
                next[i] = { ...row, label: e.target.value };
                onChange({ rows: next });
              }}
              placeholder="Thông số (VD: Công suất)"
              className="border border-slate-200 rounded px-3 py-2 text-sm"
            />
            <input
              value={row.value}
              onChange={(e) => {
                const next = [...d.rows];
                next[i] = { ...row, value: e.target.value };
                onChange({ rows: next });
              }}
              placeholder="Giá trị (VD: 45W)"
              className="border border-slate-200 rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                onChange({ rows: d.rows.filter((_, j) => j !== i) })
              }
              className="text-red-500 hover:bg-red-50 rounded p-2"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({ rows: [...d.rows, { label: "", value: "" }] })
          }
          className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900"
        >
          <Plus size={12} /> Thêm hàng
        </button>
      </div>
    );
  }

  if (block.type === "feature_grid") {
    const d = block.data as FeatureGridBlockData;
    return (
      <div className="space-y-3">
        {d.items.map((it, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded p-3 space-y-2"
          >
            <div className="flex items-start gap-2">
              <input
                value={it.icon ?? ""}
                onChange={(e) => {
                  const next = [...d.items];
                  next[i] = { ...it, icon: e.target.value };
                  onChange({ items: next });
                }}
                placeholder="Icon (emoji)"
                className="border border-slate-200 rounded px-2 py-1.5 text-sm w-24"
              />
              <input
                value={it.title}
                onChange={(e) => {
                  const next = [...d.items];
                  next[i] = { ...it, title: e.target.value };
                  onChange({ items: next });
                }}
                placeholder="Tiêu đề tính năng"
                className="border border-slate-200 rounded px-3 py-1.5 text-sm flex-1"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ items: d.items.filter((_, j) => j !== i) })
                }
                className="text-red-500 hover:bg-red-50 rounded p-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={it.description ?? ""}
              onChange={(e) => {
                const next = [...d.items];
                next[i] = { ...it, description: e.target.value };
                onChange({ items: next });
              }}
              placeholder="Mô tả"
              rows={2}
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm resize-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              items: [...d.items, { title: "", description: "" }],
            })
          }
          className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900"
        >
          <Plus size={12} /> Thêm tính năng
        </button>
      </div>
    );
  }

  if (block.type === "image_comparison") {
    const d = block.data as ImageComparisonBlockData;
    const l = d.leftMediaId ? mediaCache[d.leftMediaId] : null;
    const r = d.rightMediaId ? mediaCache[d.rightMediaId] : null;
    return (
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            side: "left" as const,
            mediaId: d.leftMediaId,
            label: d.leftLabel,
            media: l,
          },
          {
            side: "right" as const,
            mediaId: d.rightMediaId,
            label: d.rightLabel,
            media: r,
          },
        ].map((c) => (
          <div
            key={c.side}
            className="border border-slate-200 rounded p-3 space-y-2"
          >
            <div className="relative aspect-[4/3] bg-slate-100 rounded overflow-hidden">
              {c.media?.key ? (
                <Image
                  src={keytoUrl(c.media.key)}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                  Chưa chọn
                </div>
              )}
            </div>
            <MultiImageDialog
              onConfirm={(ids) => {
                if (!ids[0]) return;
                onLoadMedia([ids[0]]);
                onChange(
                  c.side === "left"
                    ? { ...d, leftMediaId: ids[0] }
                    : { ...d, rightMediaId: ids[0] },
                );
              }}
              renderTrigger={
                <button
                  type="button"
                  className="w-full border border-slate-300 hover:border-amber-500 text-xs font-medium px-3 py-1.5 rounded"
                >
                  {c.mediaId ? "Đổi ảnh" : "Chọn / Upload"}
                </button>
              }
            />
            <input
              value={c.label ?? ""}
              onChange={(e) =>
                onChange(
                  c.side === "left"
                    ? { ...d, leftLabel: e.target.value }
                    : { ...d, rightLabel: e.target.value },
                )
              }
              placeholder="Nhãn (VD: Trước độ)"
              className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
            />
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "faq") {
    const d = block.data as FaqBlockData;
    return (
      <div className="space-y-3">
        {d.items.map((it, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded p-3 space-y-2"
          >
            <div className="flex items-start gap-2">
              <input
                value={it.question}
                onChange={(e) => {
                  const next = [...d.items];
                  next[i] = { ...it, question: e.target.value };
                  onChange({ items: next });
                }}
                placeholder="Câu hỏi"
                className="border border-slate-200 rounded px-3 py-1.5 text-sm flex-1 font-medium"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ items: d.items.filter((_, j) => j !== i) })
                }
                className="text-red-500 hover:bg-red-50 rounded p-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={it.answer}
              onChange={(e) => {
                const next = [...d.items];
                next[i] = { ...it, answer: e.target.value };
                onChange({ items: next });
              }}
              placeholder="Câu trả lời"
              rows={3}
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm resize-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              items: [...d.items, { question: "", answer: "" }],
            })
          }
          className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900"
        >
          <Plus size={12} /> Thêm câu hỏi
        </button>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────────────

function RepeatableStrings(props: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const { items, onChange, placeholder } = props;
  return (
    <div className="space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={it}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
            className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-red-500 hover:bg-red-50 rounded p-1.5"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900"
      >
        <Plus size={12} /> Thêm dòng
      </button>
    </div>
  );
}

function IconBtn(props: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
  danger?: boolean;
  size?: "sm" | "md";
}) {
  const sizeCls = props.size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const colorCls = props.danger
    ? "text-red-500 hover:bg-red-50"
    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900";
  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      className={`${sizeCls} ${colorCls} inline-flex items-center justify-center rounded disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {props.children}
    </button>
  );
}
