"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useGame } from "./game-context";
import { useTranslation } from "react-i18next";

export default function NameDialog() {
  const { state, closeKeypad, setPlayerName } = useGame();
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayerName(trimmed.toUpperCase());
  };

  return (
    <Dialog
      key={state.keypadOpen ? "name-dialog-open" : "name-dialog-closed"}
      open={state.keypadOpen}
      onClose={closeKeypad}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "#1a0c04",
            border: "1px solid #5a3e20",
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: '"Georgia", serif',
          color: "#e8d5a3",
          fontSize: 20,
          letterSpacing: 2,
          textAlign: "center",
          pt: 3,
        }}
      >
        {t("keyboard.title")}
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        <TextField
          autoFocus
          fullWidth
          placeholder={t("keyboard.title")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
          slotProps={{
            htmlInput: {
              maxLength: 12,
              sx: {
                color: "#e8d5a3",
                fontFamily: '"Georgia", serif',
                fontSize: 18,
                letterSpacing: 1,
                textAlign: "center",
              },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: 1,
              "& fieldset": { borderColor: "#5a3e20" },
              "&:hover fieldset": { borderColor: "#8b0000" },
              "&.Mui-focused fieldset": { borderColor: "#8b0000" },
            },
            "& input::placeholder": {
              color: "rgba(201,168,106,0.5)",
              fontFamily: '"Georgia", serif',
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1, justifyContent: "center" }}>
        <Button
          onClick={closeKeypad}
          sx={{
            fontFamily: '"Georgia", serif',
            color: "#c9a86a",
            letterSpacing: 1,
            textTransform: "none",
            fontSize: 14,
          }}
        >
          {t("keyboard.cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!name.trim()}
          variant="contained"
          sx={{
            fontFamily: '"Georgia", serif',
            color: "#e8d5a3",
            backgroundColor: "#1f5a1f",
            letterSpacing: 1,
            textTransform: "none",
            fontSize: 16,
            fontWeight: "bold",
            px: 4,
            "&:hover": { backgroundColor: "#2a7a2a" },
            "&.Mui-disabled": { opacity: 0.4, color: "#e8d5a3" },
          }}
        >
          {t("keyboard.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}