/**
 * @jest-environment node
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Every export of a `"use server"` module is turned into a server action by
 * Next, which makes it async. Export a synchronous helper from one and callers
 * silently receive a Promise:
 *
 *   schema.parse(blankFksToNull(product))  ->  "Expected object, received promise"
 *   if (!isAdmin(user))                    ->  !Promise is always false
 *
 * The first shape took down every product save in production. Neither
 * `next build` nor an ordinary unit test catches it — jest imports the raw
 * module without Next's transform, so the helper behaves normally under test
 * while being broken in the deployed app.
 *
 * So this is a static check rather than a behavioural one: it reads the source
 * and asserts the invariant that makes the other tests trustworthy.
 */

const SRC = join(process.cwd(), "src");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === "node_modules" ? [] : walk(full);
    }
    return /\.tsx?$/.test(entry) ? [full] : [];
  });

/** `export const foo =` / `export function foo(` at the top level. */
const EXPORT_LINE = /^export\s+(?:const|function)\s+(\w+)/;

const syncExportsOf = (source: string): string[] =>
  source
    .split("\n")
    .map((line) => {
      const match = EXPORT_LINE.exec(line);
      if (!match) return null;
      return /\basync\b/.test(line) ? null : match[1];
    })
    .filter((name): name is string => name !== null);

describe('"use server" modules', () => {
  const serverModules = walk(SRC).filter((file) =>
    /^["']use server["']/.test(readFileSync(file, "utf8").trimStart()),
  );

  it("finds the server modules it is meant to police", () => {
    // Guards the walker itself: if this ever hits zero the suite would pass
    // vacuously while checking nothing at all.
    expect(serverModules.length).toBeGreaterThan(0);
  });

  it("exports only async functions", () => {
    const offenders = serverModules.flatMap((file) => {
      const names = syncExportsOf(readFileSync(file, "utf8"));
      return names.map((name) => `${file.replace(SRC, "src")} -> ${name}`);
    });

    // Listed by name so a failure says which helper to move, not just a count.
    expect(offenders).toEqual([]);
  });
});
