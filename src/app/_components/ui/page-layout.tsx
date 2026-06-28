import Box from "@mui/material/Box";
import { colors } from "@/lib/design-tokens";
import AppBar from "@/app/_components/ui/app-bar";
import Sidebar from "@/app/_components/ui/sidebar";


/**
 * Page layout wrapper with max width and padding.
 * @param root0
 * @param root0.children
 */
const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box sx={{ bgcolor: colors.background, minHeight: "100dvh" }}>
      <AppBar />
      <Sidebar />
      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, md: 3 }, ml: { lg: "100px" } }}>
        {children}
      </Box>
    </Box>
  );
}

export default PageLayout;
