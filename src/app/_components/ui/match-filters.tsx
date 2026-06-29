"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Collapse from "@mui/material/Collapse";
import Search from "@mui/icons-material/Search";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";
import FilterList from "@mui/icons-material/FilterList";
import Close from "@mui/icons-material/Close";
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
  player: string;
  result: string;
  scoreQ: string;
  quickQ: string;
  showFilters: boolean;
  playerNames: string[];
  hasFilters: boolean;
  onPlayerChange: (v: string) => void;
  onResultChange: (v: string) => void;
  onScoreQChange: (v: string) => void;
  onQuickQChange: (v: string) => void;
  onToggleFilters: () => void;
  onClearAll: () => void;
}

/**
 * Filter bar for the all-matches page.
 *
 * @param props - Component properties.
 */
export const MatchFilters = (props: MatchFiltersProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ px: 0.5, mb: 2 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
        <ToggleButtonGroup exclusive onChange={(_, v) => props.onResultChange(v ?? "")} size="small" value={props.result}>
          <ToggleButton sx={{ fontSize: "0.7rem", px: 1.5, bgcolor: colors.card, borderColor: colors.accent4d, color: colors.green, "&.Mui-selected": { bgcolor: colors.green, color: "#fff", "&:hover": { bgcolor: colors.green } } }} value="W">
            <CheckCircle sx={{ fontSize: "0.75rem", mr: 0.3 }} /> {t("common.win")}
          </ToggleButton>
          <ToggleButton sx={{ fontSize: "0.7rem", px: 1.5, bgcolor: colors.card, borderColor: colors.accent4d, color: colors.red, "&.Mui-selected": { bgcolor: colors.red, color: "#fff", "&:hover": { bgcolor: colors.red } } }} value="L">
            <Cancel sx={{ fontSize: "0.75rem", mr: 0.3 }} /> {t("common.loss")}
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          onChange={(e) => props.onQuickQChange(e.target.value)}
          placeholder={t("matchesPage.searchPlaceholder")}
          size="small"
          slotProps={{ input: { startAdornment: <Search sx={{ fontSize: "0.85rem", mr: 0.5, color: colors.text.muted }} /> } }}
          sx={{ minWidth: 220, flex: { xs: 1, md: "none" }, ...inputSx }}
          value={props.quickQ}
        />

        <Box onClick={props.onToggleFilters} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 1, bgcolor: props.showFilters ? colors.accent : colors.card, border: "1px solid", borderColor: colors.accent4d, cursor: "pointer", flexShrink: 0 }}>
          {props.showFilters ? <Close sx={{ fontSize: "0.85rem", color: "#fff" }} /> : <FilterList sx={{ fontSize: "0.85rem", color: colors.text.secondary }} />}
        </Box>

        {props.hasFilters ? <Typography onClick={props.onClearAll} sx={{ color: colors.accent, fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
            {t("common.clearAll")}
          </Typography> : null}
      </Box>

      <Collapse in={props.showFilters} timeout={250}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", mt: 1.5 }}>
          <Autocomplete
            inputValue={props.player}
            onChange={(_, v) => props.onPlayerChange(v ?? "")}
            onInputChange={(_, v) => { if (!v) props.onPlayerChange(""); }}
            options={props.playerNames}
            renderInput={(params) => <TextField {...params} placeholder={t("matchesPage.filterPlayer")} sx={inputSx} />}
            size="small"
            sx={{ minWidth: 180, maxWidth: 240 }}
            value={props.player}
          />
          <TextField
            onChange={(e) => props.onScoreQChange(e.target.value)}
            placeholder={t("matchesPage.filterScore")}
            size="small"
            sx={{ minWidth: 130, ...inputSx }}
            value={props.scoreQ}
          />
        </Box>
      </Collapse>
    </Box>
  );
};
