import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors } from "@/lib/design-tokens";

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}


/**
 * Page header with title and optional back button.
 * @param root0
 * @param root0.icon
 * @param root0.title
 * @param root0.subtitle
 */
const PageHeader = ({ icon, title, subtitle }: PageHeaderProps) => {
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.3, px: 0.5 }}>
        <Box sx={{ color: colors.accent, fontSize: "1.2rem", display: "flex" }}>
          {icon}
        </Box>
        <Typography
          sx={{
            color: colors.text.primary,
            fontWeight: 800,
            fontSize: { xs: "1.15rem", md: "1.5rem" },
            letterSpacing: 1,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        sx={{
          color: colors.text.muted,
          fontSize: "0.7rem",
          letterSpacing: 1,
          fontWeight: 600,
          mb: 2.5,
          px: 0.5,
        }}
      >
        {subtitle}
      </Typography>
    </>
  );
}

export default PageHeader;
