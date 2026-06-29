"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Search from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";

const inputSx = {
  bgcolor: colors.card,
  color: colors.text.primary,
  "& .MuiInputBase-root": { fontSize: "0.75rem", bgcolor: colors.card, color: colors.text.primary },
  "& fieldset": { borderColor: colors.accent4d },
  "&:hover fieldset": { borderColor: colors.accent },
  "& input": { color: colors.text.primary },
  "& input::placeholder": { color: colors.text.subtle, opacity: 1 },
  "& .MuiInputBase-input": { color: colors.text.primary },
  "& .MuiInputBase-input::placeholder": { color: colors.text.subtle, opacity: 1 },
};

interface MatchFiltersProps {
  quickQ: string;
  hasFilters: boolean;
  onQuickQChange: (v: string) => void;
  onClearAll: () => void;
}

/**
 * Filter bar for the all-matches page.
 *
 * @param props - Component properties.
 */
export const MatchFilters = ({
  quickQ,
  hasFilters,
  onQuickQChange,
  onClearAll,
}: MatchFiltersProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
      <TextField
        onChange={(e) => onQuickQChange(e.target.value)}
        placeholder={t("matchesPage.searchPlaceholder")}
        size="small"
        slotProps={{ input: { startAdornment: <Search sx={{ fontSize: "0.85rem", mr: 0.5, color: colors.text.muted }} /> } }}
        sx={{ minWidth: 220, flex: { xs: 1, md: "none" }, ...inputSx }}
        value={quickQ}
      />

      {hasFilters ? <Typography onClick={onClearAll} sx={{ color: colors.accent, fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
          {t("common.clearAll")}
        </Typography> : null}
    </Box>
  );
};
