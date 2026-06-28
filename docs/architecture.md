# Architecture Decision Records (ADRs)

> This file records architectural decisions for darts-wien.  
> Each entry explains **why** a decision was made, not just **what** was done.  
> Agents MUST read this file before making architectural changes and MUST append new decisions here.

---

## Format

```
## ADR-NNN: Title
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX  
**Date:** YYYY-MM-DD  
**Context:** What problem are we solving?  
**Decision:** What did we decide and why?  
**Consequences:** What are the trade-offs?
```

---

## Records

## ADR-001: Standings Stats Include All Match Types
**Status:** Accepted  
**Date:** 2026-06-28  
**Context:** The standings page displayed "last 5 matches" showing only league matches (filtered by `match_type = 'league'`), while the player detail page showed all completed matches. This caused confusion — tournament group, playoff, and final matches were excluded from standings stats (wins, losses, sets, 180s, form, recent matches).  
**Decision:** The standings API now queries all completed matches with no `match_type` filter. Stats, form, and recent matches are computed from every completed match in the season (league, tournament group, playoff, final, grand final) ordered by `match_date DESC`.  
**Consequences:** Standings stats now reflect a player's full performance across all match types. The trade-off is that the standings no longer isolate league-only performance, but this matches user expectation that "all matches count."
