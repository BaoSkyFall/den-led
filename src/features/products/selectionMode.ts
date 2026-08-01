/**
 * How a variant option is picked on the storefront.
 *
 * `quantity` renders a −/+ stepper, `select` renders a single checkbox. Most
 * options here are things a customer buys several of, so quantity is the
 * default for anything created from now on.
 *
 * Kept in its own module because the default is needed by the drizzle schema,
 * a server action, an admin client component and a storefront route handler —
 * importing any of those from the others would drag server-only code into the
 * browser bundle.
 */
export type SelectionMode = "select" | "quantity";

export const DEFAULT_SELECTION_MODE: SelectionMode = "quantity";
