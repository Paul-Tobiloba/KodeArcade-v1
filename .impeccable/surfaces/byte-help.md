# Ask Byte — learning-workspace extension

Mode: Operate. Ordinary extension of the incumbent Build & Play learning workspace. Current implementation recorded 12 October 2026; see `activity-chat-session.md` for the combined chat/session direction and `../review/activity-chat-session-documentation.md` for the documentation comparison.

## Direction contract

THESIS: Help a learner understand the current activity without taking over their program. Keep coding visible while a short question or starter opens bounded help; experimental AI remains an explicitly labelled adult-only pilot.

OWN-WORLD: Inherit the white/lavender learning guide, violet actions, system reading type, Fredoka heading voice, Lucide controls and approved Byte sprite. Preserve the learning layout, Play placement and brand. No new art or visual identity.

STORY: Open Ask Byte from the floating launcher or Lesson & instructions, choose Explain this topic, What is my task? or Help check my code, or type a coding question. Read or listen to the bounded answer and return to building. Off-topic questions receive a coding redirect. Clear chat, close and pending-reply cancellation are available; existing progressive hints and star accounting remain separate.

FIRST VIEWPORT: The guide contains a labelled Ask Byte / Coding help launcher above progressive hints. A second fixed launcher uses Byte and sits clear of Play. Opening either reveals a nonmodal floating panel with Byte, Ask Byte heading, close control, visible mode disclosure, short transcript, three wrapping starters and a labelled composer with a character count. Desktop width is bounded at 410px; phone/tablet use available viewport width and internal scrolling without replacing the existing stacked learning shell.

FORM: Precisely scoped incumbent Operate extension, code-led; no concept seed or composition tournament required. The panel has labelled nonmodal dialog semantics, a polite conversation log, composer focus on opening, Escape close with focus return, visible focus and 44px controls. Questions accept 8–300 characters; the in-memory transcript retains at most 12 messages and clears when the activity changes or is left. Learners/public users receive authored on-device coding help, visibly described as not live AI; their questions and programs stay on-device. Only a verified allowlisted adult can use the existing private pilot for typed questions, sending topic and question without child identity, code, progress or history. Starters and structural code checks stay local for adults too. Busy state explains the possible 45-second wait; cancel discards stale replies and failure supplies local help. The separate private lab remains available for adult evaluation. Child live-model rollout remains incomplete and outside this release.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation and review record

`src/ByteHelp.tsx`, `src/byte.css` and `src/byteQuestionHelp.ts` implement this surface; `docs/ASK_BYTE.md` records the local-help/pilot boundary and pending evaluation. The combined finish review resolved its single authenticated-account-header finding and records a scoped ship verdict. Supplied verification covers Byte chat, session warning and expiry on desktop, phone and tablet. This brief does not authorize child live AI or certify model safety, accessibility or the whole platform. Existing DESIGN.md remains the global identity authority; this surface's dimensions, supporting type sizes and error tone are local roles.
