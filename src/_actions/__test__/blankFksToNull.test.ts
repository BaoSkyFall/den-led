/**
 * @jest-environment node
 */
import { blankFksToNull } from "../products";

/**
 * Postgres treats '' as a key to look up, not as "no value", so a blank
 * foreign key fails the constraint:
 *   Key (generation_id)=() is not present in table "generations"
 *
 * React Hook Form's Controller produces exactly that when a field has no
 * default, which is what an admin saving a product without picking a vehicle
 * class used to send.
 */
describe("blankFksToNull", () => {
  it("turns a blank vehicle class into null", () => {
    expect(blankFksToNull({ generationId: "" } as never)).toEqual({
      generationId: null,
    });
  });

  it("turns a blank featured image into null", () => {
    expect(blankFksToNull({ featuredImageId: "" } as never)).toEqual({
      featuredImageId: null,
    });
  });

  it("leaves a real key alone", () => {
    const values = { generationId: "gen-sh-2026", featuredImageId: "med_1" };
    expect(blankFksToNull(values as never)).toEqual(values);
  });

  it("leaves null and absent keys alone", () => {
    expect(blankFksToNull({ generationId: null } as never)).toEqual({
      generationId: null,
    });
    expect(blankFksToNull({ name: "SH 2026" } as never)).toEqual({
      name: "SH 2026",
    });
  });

  it("does not blank other empty strings", () => {
    expect(blankFksToNull({ name: "", generationId: "" } as never)).toEqual({
      name: "",
      generationId: null,
    });
  });

  it("does not mutate the caller's object", () => {
    const original = { generationId: "" };
    blankFksToNull(original as never);
    expect(original.generationId).toBe("");
  });
});
