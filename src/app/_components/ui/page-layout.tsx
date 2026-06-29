import Box from "@mui/material/Box";
import { colors } from "@/lib/design-tokens";
import AppBar from "@/app/_components/ui/app-bar";
import Sidebar from "@/app/_components/ui/sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
}

/**
 * Page layout wrapper with consistent padding.
 *
 * @param props - Component properties.
 */
const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100dvh" }}>
      <AppBar />
      <Sidebar />
      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, md: 3 }, ml: { md: "100px" } }}>
        {children}
      </Box>
    </Box>
  );
}

export default PageLayout;
