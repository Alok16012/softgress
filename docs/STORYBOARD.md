# Storyboard

Scene IDs, camera poses and hotspots are defined in `src/lib/tour/scenes.ts`; this document
is the creative intent behind them.

| # | Scene | Camera | What the visitor sees | Interactions |
|---|---|---|---|---|
| 0 | **Campus** (`campus`) | 9 s glide down the tree-lined access road, settling high over the drop-off loop | Glass curtain-wall HQ, backlit SOFTGRESS sign, canopy, cars and walkers, monument sign. Title: *SOFTGRESS · Ideas engineered. Growth accelerated.* | Skip intro · Guided tour · Explore freely · I know what I need · Ask the receptionist |
| 1 | **Reception** (`reception`) | Rail through the automatic sliding doors (they open as the camera approaches) into the double-height lobby | Oak-slat feature wall, reception desk, Aanya (AI receptionist), lounge, directory totem, feature stair, ring pendants | Talk to Aanya · Directory · Book a consultation · Doors to every wing · Rooftop |
| 2 | **Software** (`software`) | Through the east door; framing the desk clusters diagonally | 24 workstations with live code/design screens, engineers typing, design review corner, kanban boards | Kabir (AI software consultant) · Website / Mobile / E-commerce / SaaS / CRM-ERP / Integrations / Maintenance |
| 3 | **Marketing** (`marketing`) | Through the west door toward the 10 m campaign wall | Analyst desks facing an **illustrative** dashboard wall, content calendar | Meera (AI marketing strategist) · SEO / Google / Meta / Social / Performance / Lead gen / Content · Campaign wall |
| 4 | **Creative** (`creative`) | Down the corridor, through the studio door | Cyclorama with softboxes and camera, review table, editing bays, brand wall, clothes rail, moodboard | Rohan (AI creative lead) · Brand / UI-UX / Video / Content / Ad creatives · Before/after showcase (original sample) |
| 5 | **AI Lab** (`automation`) | Through the lab door toward the workflow board | Engineers at benches, 8 m lead-routing workflow board (**synthetic demo data**), server rack | Ira (AI automation consultant) · Chatbots / WhatsApp / CRM / Routing / Email / Reporting · Interactive workflow demo |
| 6 | **Strategy** (`strategy`) | Through the glass boardroom door | Walnut table, project gallery screen (sample concepts labelled), Dev | Dev (AI project strategist) · Gallery · Request a proposal · Discovery consultation |
| 7 | **Rooftop** (`rooftop`) | Rise through the lobby skylight; turn to face the campus at golden hour | Sunset sky, decking, planters, pergola lights, solar array, the campus below. Headline: *Your next chapter starts here.* | Request a proposal · Book a consultation · WhatsApp/Email (only if configured) |

## Motion principles

- Rails go through doorways (`WAYPOINTS`), never through walls; 1.4–5.2 s per move,
  ease in-out, the gaze leads along the path and settles on the room's focal point.
- Conversation framing: the guide sits left of centre so the chat drawer (right) never
  covers them.
- Reduced motion: no intro, cuts with a 150 ms dim instead of rails.
- Free look is "turn your head" (drag), not flying; WASD steps are clamped to the room.

## Remotion compositions (`remotion/src/Root.tsx`)

`Intro` (16:9) · `IntroMobile` (9:16) · `CampusReveal` · `DoorTransition` ·
`RooftopFinale` · `LogoTitle` (2D) · `Montage`. Each uses the same scene components as the
live tour. The intro is the fallback for the 2D navigator / constrained devices.
