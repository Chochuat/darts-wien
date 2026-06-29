"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { colors } from "@/lib/design-tokens";
import Section from "@/app/_components/ui/section";
import PageLayout from "@/app/_components/ui/page-layout";

const StandingsSkeleton = () => (
  <PageLayout>
    <Section>
      <Box sx={{ alignItems: "center", display: "flex", gap: 1.5, mb: 2 }}>
        <Skeleton height={10} variant="circular" width={10} />
        <Skeleton height={22} variant="rounded" width={120} />
      </Box>
      {Array.from({ length: 10 }, (_, i) => (
        <Box
          key={i}
          sx={{
            alignItems: "center",
            borderBottom: i < 9 ? "1px solid" : "none",
            borderColor: colors.accent4d,
            display: "flex",
            gap: 1.5,
            py: 1.5,
          }}
        >
          <Skeleton height={24} variant="circular" width={24} />
          <Skeleton height={16} variant="rounded" width={140} />
          <Skeleton height={14} sx={{ ml: "auto" }} variant="rounded" width={28} />
          <Skeleton height={14} variant="rounded" width={28} />
          <Skeleton height={14} variant="rounded" width={28} />
          <Skeleton height={14} variant="rounded" width={36} />
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {Array.from({ length: 5 }, (_, j) => (
              <Skeleton height={8} key={j} variant="circular" width={8} />
            ))}
          </Box>
        </Box>
      ))}
    </Section>
  </PageLayout>
);

const MatchesSkeleton = () => (
  <PageLayout>
    <Section>
      <Skeleton height={22} sx={{ mb: 2 }} variant="rounded" width={140} />
      {Array.from({ length: 8 }, (_, i) => (
        <Box
          key={i}
          sx={{
            alignItems: "center",
            borderBottom: i < 7 ? "1px solid" : "none",
            borderColor: colors.accent4d,
            display: "flex",
            gap: 1.5,
            py: 1.5,
          }}
        >
          <Skeleton height={16} variant="rounded" width={110} />
          <Skeleton height={14} variant="rounded" width={14} />
          <Skeleton height={16} variant="rounded" width={110} />
          <Skeleton height={22} sx={{ ml: "auto" }} variant="rounded" width={44} />
          <Skeleton height={12} variant="rounded" width={70} />
        </Box>
      ))}
    </Section>
  </PageLayout>
);

const TournamentsSkeleton = () => (
  <PageLayout>
    <Section>
      <Skeleton height={22} sx={{ mb: 2 }} variant="rounded" width={180} />
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          sx={{
            border: "1px solid",
            borderColor: colors.accent4d,
            borderRadius: 2,
            mb: 1.5,
            p: 2,
          }}
        >
          <Skeleton height={18} sx={{ mb: 0.75 }} variant="rounded" width="60%" />
          <Skeleton height={14} sx={{ mb: 0.5 }} variant="rounded" width="40%" />
          <Skeleton height={14} variant="rounded" width="50%" />
        </Box>
      ))}
    </Section>
  </PageLayout>
);

const DetailSkeleton = () => (
  <PageLayout>
    <Section>
      <Box sx={{ alignItems: "center", display: "flex", gap: 2, mb: 3 }}>
        <Skeleton height={32} variant="circular" width={32} />
        <Skeleton height={26} variant="rounded" width={180} />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton height={52} key={i} variant="rounded" width={90} />
        ))}
      </Box>
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={i}
          sx={{
            alignItems: "center",
            borderBottom: i < 4 ? "1px solid" : "none",
            borderColor: colors.accent4d,
            display: "flex",
            gap: 1.5,
            py: 1.2,
          }}
        >
          <Skeleton height={14} variant="rounded" width={80} />
          <Skeleton height={14} sx={{ flex: 1 }} variant="rounded" />
          <Skeleton height={20} variant="rounded" width={50} />
        </Box>
      ))}
    </Section>
  </PageLayout>
);

const CardSkeleton = () => (
  <Box
    sx={{
      border: "1px solid",
      borderColor: colors.accent4d,
      borderRadius: 2,
      p: 2,
    }}
  >
    <Skeleton height={18} sx={{ mb: 1 }} variant="rounded" width="60%" />
    <Skeleton height={14} variant="rounded" width="40%" />
  </Box>
);

type SkeletonVariant = "standings" | "matches" | "tournaments" | "detail" | "card";

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
}

/**
 * Content skeleton placeholder that mirrors page layout shapes.
 *
 * Use while data is loading to provide a visual scaffold that
 * matches the eventual page structure (standings, matches,
 * tournaments, detail, or a generic card).
 */
export const LoadingSkeleton = ({ variant = "card" }: LoadingSkeletonProps) => {
  switch (variant) {
    case "standings":
      return <StandingsSkeleton />;
    case "matches":
      return <MatchesSkeleton />;
    case "tournaments":
      return <TournamentsSkeleton />;
    case "detail":
      return <DetailSkeleton />;
    default:
      return <CardSkeleton />;
  }
};
