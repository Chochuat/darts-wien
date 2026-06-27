"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TrackChanges from "@mui/icons-material/TrackChanges";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Orbitron, Roboto_Condensed } from "next/font/google";
import { colors } from "@/lib/design-tokens";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"] });
const robotoCondensed = Roboto_Condensed({ subsets: ["latin"], weight: ["700"] });

const tabs = [
  { label: "Standings", href: "/" },
  { label: "Matches", href: "/matches" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "About", href: "/about" },
];

export default function AppBar() {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        display: { xs: "flex", lg: "none" },
        flexDirection: "column",
        alignItems: "center",
        px: 2,
        pt: 1.5,
        pb: 1,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        gap: 1,
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TrackChanges sx={{ color: colors.accent, fontSize: "1.2rem" }} />
          <Typography
            className={orbitron.className}
            sx={{
              color: "#fff",
              fontWeight: 900,
              fontSize: "0.9rem",
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            darts wien
          </Typography>
        </Box>
      </Link>

      {/* Tabs — mobile only */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, width: "100%" }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <Link key={tab.label} href={tab.href} style={{ textDecoration: "none" }}>
              <Box
                className={robotoCondensed.className}
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  px: 1.5,
                  py: 0.5,
                  cursor: "pointer",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: 2,
                    borderRadius: 1,
                    bgcolor: isActive ? colors.accent : "transparent",
                    transition: "background-color 0.2s",
                  },
                }}
              >
                {tab.label}
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}
