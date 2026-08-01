import { getCurrentUser } from "./actions";
import { isAdmin } from "./isAdmin";

/**
 * Throws unless the caller is an authenticated admin.
 *
 * Server actions that write through drizzle bypass PostgREST — and therefore
 * RLS — entirely, so this guard is the ONLY thing standing between an anonymous
 * caller and a write. It must be the first line of every such mutation.
 *
 * Deliberately not a `"use server"` export: it is an internal helper, never a
 * callable action.
 */
export const assertAdmin = async () => {
  const currentUser = await getCurrentUser();
  if (!isAdmin(currentUser)) {
    throw new Error("Không có quyền thực hiện thao tác này.");
  }
};
