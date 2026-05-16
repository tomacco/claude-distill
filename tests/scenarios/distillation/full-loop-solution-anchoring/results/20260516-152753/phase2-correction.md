---
domain: craft
scope: Analytics solution selection — when to use pipeline vs client events
last_updated: 2026-05-16
---

## [IMPORTANT] Not every analytics question needs the Comet pipeline

LEARNED FROM DIRECT CORRECTION: When asked to measure UI interactions (menu opens, button taps, screen views, tooltip dismissals), I proposed the full Nebula → StarFlow → Comet → Product Database → Metabase flow. The user corrected me: 'This doesn't need any of that. The data exists at the point of interaction. Just track 3 client-side events.'

### When CLIENT-SIDE EVENTS are sufficient:
- Counting user interactions with UI elements (taps, opens, dismissals)
- Measuring time-on-element (tooltip read duration)
- Before/after comparisons of screen arrival rates
- Funnel analysis within a single screen or flow
- Any metric where the data originates at the moment of user action

### When the PIPELINE is actually needed:
- Cross-service data aggregation (orders + payments + accounts joined)
- Historical batch processing over millions of records
- Data that originates in backend services (not the client)
- Complex transformations that need ETL scheduling
- Regulatory/compliance reporting from multiple data sources

### The check I MUST do before proposing infrastructure:
1. Ask: 'Where does this data physically exist at the moment it's created?'
2. If answer is 'in the client, at the moment the user acts' → client events
3. If answer is 'spread across multiple backend services' → pipeline

confidence: hardened (direct correction, unambiguous signal)
origin: evidence (user demonstrated simpler path was correct)
correction_count: 1
last_correction: 2026-05-16
