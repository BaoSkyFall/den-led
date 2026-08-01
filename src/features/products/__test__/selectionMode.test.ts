import { DEFAULT_SELECTION_MODE } from "../selectionMode";

/**
 * The default lives in one module because four unrelated layers need it — the
 * drizzle column, the create-option action, the admin dropdown and the
 * storefront route handler. If it ever drifts back to a literal in one of them,
 * new options silently render as a checkbox again.
 */
describe("DEFAULT_SELECTION_MODE", () => {
  it("is quantity", () => {
    expect(DEFAULT_SELECTION_MODE).toBe("quantity");
  });
});
