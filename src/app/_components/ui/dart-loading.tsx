"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import PageLayout from "@/app/_components/ui/page-layout";
import { DartSpinner } from "@/app/_components/ui/dart-spinner";

interface DartLoadingProps {
  withSection?: boolean;
  spinnerSize?: number;
}

/**
 * Full-page loading screen with animated dartboard spinner.
 *
 * Renders within PageLayout and optionally Section, providing a
 * consistent loading state across all data-fetching pages.
 */
export const DartLoading = ({ withSection = true, spinnerSize = 64 }: DartLoadingProps) => {
  const { t } = useTranslation();

  const content = (
    <Box sx={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 3, py: 8 }}>
      <DartSpinner size={spinnerSize} />
      <Typography sx={{ color: colors.text.muted, fontSize: "0.85rem", fontStyle: "italic" }}>
        {t("common.loading")}
      </Typography>
    </Box>
  );

  if (withSection) {
    return (
      <PageLayout>
        <Section>{content}</Section>
      </PageLayout>
    );
  }

  return <PageLayout>{content}</PageLayout>;
};
