import { defaultBlockData, tiktokIdFromUrl } from "../types";

const ID = "7123456789012345678";

describe("tiktokIdFromUrl", () => {
  it("reads the id from a standard share URL", () => {
    expect(
      tiktokIdFromUrl(`https://www.tiktok.com/@sanchoidenled/video/${ID}`),
    ).toBe(ID);
  });

  it("ignores the tracking query params TikTok appends to a copied link", () => {
    expect(
      tiktokIdFromUrl(
        `https://www.tiktok.com/@sanchoidenled/video/${ID}?is_from_webapp=1&sender_device=pc`,
      ),
    ).toBe(ID);
  });

  it("reads the mobile and embed forms", () => {
    expect(tiktokIdFromUrl(`https://m.tiktok.com/v/${ID}.html`)).toBe(ID);
    expect(tiktokIdFromUrl(`https://www.tiktok.com/embed/v2/${ID}`)).toBe(ID);
  });

  it("accepts a bare id and trims stray whitespace", () => {
    expect(tiktokIdFromUrl(ID)).toBe(ID);
    expect(tiktokIdFromUrl(`  ${ID}  `)).toBe(ID);
  });

  // Verbatim clipboard output of TikTok's Embed button — the path most admins
  // will take, so it is pinned against the real thing rather than a paraphrase.
  it("reads the id out of a pasted embed snippet", () => {
    const snippet = `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@sanchoidenledxe/video/7597732462030097671" data-video-id="7597732462030097671" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@sanchoidenledxe" href="https://www.tiktok.com/@sanchoidenledxe?refer=embed">@sanchoidenledxe</a> Mẫu đang cực kỳ hót nha anh em <a title="sanchoidenled" target="_blank" href="https://www.tiktok.com/tag/sanchoidenled?refer=embed">#sanchoidenled</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>`;

    expect(tiktokIdFromUrl(snippet)).toBe("7597732462030097671");
  });

  it("still reads a snippet whose data-video-id attribute is missing", () => {
    const snippet = `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@sanchoidenledxe/video/${ID}"></blockquote>`;

    expect(tiktokIdFromUrl(snippet)).toBe(ID);
  });

  // These carry no id at all — they only resolve through an HTTP redirect,
  // which the block renderer cannot follow, so the editor has to warn instead
  // of rendering an empty embed.
  it("rejects short links", () => {
    expect(tiktokIdFromUrl("https://vm.tiktok.com/ZSxyz123/")).toBeNull();
    expect(tiktokIdFromUrl("https://vt.tiktok.com/ZSxyz123/")).toBeNull();
    expect(tiktokIdFromUrl("https://www.tiktok.com/t/ZSxyz123/")).toBeNull();
  });

  it("reads slideshow (photo) posts, which share the video embed endpoint", () => {
    expect(
      tiktokIdFromUrl(`https://www.tiktok.com/@sanchoidenledxe/photo/${ID}`),
    ).toBe(ID);
  });

  // These all contain a long digit run that a looser pattern would happily
  // mistake for a video id, which would show the admin a green "id accepted"
  // confirmation and then embed nothing. The music case matters most: it is
  // present in every real embed snippet, right alongside the correct id.
  it("does not mistake other TikTok URLs that carry long digit runs", () => {
    expect(
      tiktokIdFromUrl(
        "https://www.tiktok.com/music/nhac-nen-7324294167730260737",
      ),
    ).toBeNull();
    expect(
      tiktokIdFromUrl("https://www.tiktok.com/tag/sanchoidenled"),
    ).toBeNull();
    expect(tiktokIdFromUrl(`https://www.tiktok.com/@${ID}`)).toBeNull();
    expect(tiktokIdFromUrl(`https://www.tiktok.com/search?q=${ID}`)).toBeNull();
  });

  it("rejects empty input and non-TikTok URLs", () => {
    expect(tiktokIdFromUrl("")).toBeNull();
    expect(tiktokIdFromUrl("https://youtu.be/dQw4w9WgXcQ")).toBeNull();
    expect(tiktokIdFromUrl("https://www.tiktok.com/@sanchoidenled")).toBeNull();
  });
});

describe("defaultBlockData", () => {
  it("seeds a tiktok block with empty fields", () => {
    expect(defaultBlockData("tiktok")).toEqual({
      type: "tiktok",
      data: { url: "", caption: "" },
    });
  });
});
