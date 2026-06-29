import type { Metadata } from "next";

export
/**
 * Next.js metadata for the admin area.
 */
const metadata: Metadata = {
  title: "darts-wien — Admin",
  description: "Tournament administration",
};

/**
 * Admin area layout. Auth pages render without the sidebar; the main admin
 * layout with navigation is handled by a nested route group.
 *
 * @param props - Component properties.
 */
const AdminLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return children;
};

export default AdminLayout;
