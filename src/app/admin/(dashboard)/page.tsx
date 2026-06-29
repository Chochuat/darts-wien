import { redirect } from "next/navigation";

/** Redirects /admin to /admin/tournaments. */
export default function AdminRedirectPage() {
  redirect("/admin/tournaments");
}
