# Typing practice reference adaptation — 21 October 2026

> Superseded visual direction, 21 October 2026: the owner rejected this rendition after its historical `ship` review and explicitly approved the simpler EdClub-video scene. The composition, fixed raster-hand and acceptance claims below describe that earlier rendition. Current implementation removes large metric cards/Byte bubble, uses an open neutral field and measured moving SVG hands, small progress/metrics and original keyboard clicks. See [Simple typing guide](TYPING_SIMPLE_GUIDE_2026_10_21.md). Final same-reviewer disposition is `ship` for the three scored hand/Shift-contour, clean-line and documentation fixes only, not a new whole-surface review or owner acceptance. Final rerun and twelve refreshed captures are recorded in that guide. Curriculum, grading, saved-progress boundaries and native repair/writing remain. Preserve the earlier checks as history, not current visual acceptance.

This follows the owner's two typing mockups and pasted brief, senior passage first and shorter drills through the same system. The brief changes the reference's cat to **Byte**, preserves KodeArcade's actual identity/navigation, and moves WPM left of the keyboard with accuracy/streak at right. Mockup numbers are not seeded into the activity and no invented improvement indicator is shown.

## Interface and interaction

Copying/key/check practice, review, and the existing game/story rounds use the displayed passage itself: focus it with Tab or click, then type on a physical keyboard. It is a focus-scoped keyboard surface, **not a textarea**, and does not intercept navigation/settings keys elsewhere on the document. Backspace removes the last character, Enter enters a supplied newline, modifier shortcuts remain untouched, and pasted text is recorded as support. US English QWERTY is the existing target. A touchscreen-only keyboard/IME editor is not provided by this direct-entry surface. Repair and original writing retain native textareas with caret, selection and undo; original writing retains its explicit text download.

Large monospaced text is split visually without deleting spaces or newlines. The current line is centered and prominent; previous/next lines are faded and clipped. Finishing a visual line moves the track upward over 280ms; system/saved reduced motion makes the transition immediate. Width, font size and the large-text preference remeasure line capacity. Short early-grade patterns use enlarged separated characters with the same states.

- Correct on first entry: green.
- Wrong: red plus underline.
- Wrong character removed with Backspace and later corrected: amber plus dotted baseline, retained across further retyping in that round.
- Current position: violet outline and caret.

Correction history resets on a new activity/round and is not persisted in the account. The existing first-try accuracy calculation still counts all meaningful inserted characters, including corrections; deleting a mistake does not erase it from accuracy. Best stars, checkpoint support and independent-result rules are unchanged. The streak consistently counts consecutive correct **characters**, not words: a wrong inserted character resets it, Backspace does not change it, and opening/retrying an activity resets it. Game/story round changes retain the streak.

WPM derives from actual correct characters and active elapsed time, refreshes during focused typing, and is withheld before ten keystrokes/one second or after paste. Existing saved-result WPM eligibility (forty keystrokes) is unchanged. No countdown or speed gate was added. Blur, pause and hidden-tab handling stop active timing. Resume restores the passage focus and place.

## Preserved boundaries

The public activity reuses the existing `MarketingNav`, K mark, navigation labels and current login/dashboard CTA; the global header component/CSS is not redesigned. Its search icon links to the existing course catalogue. Authenticated learners keep their existing private learner header/menu. The referenced star-logo/cat and sample metric values are not product identity/data.

All six grades, 120 activities per grade, lesson IDs, curriculum content, game/story/repair/writing completion rules, routing and version-1 progress schemas remain. This retains the first release's sixty unit seeds expanded through reusable teaching roles, not a new curriculum or independently validated set of 720 bespoke lessons. Only bounded existing results/preferences save privately or to the separate public namespace; raw practice/writing, correction history and live streak do not save. Corrupt progress remains recoverable. Guide/pause/settings, larger text, reduced motion, retry, lesson map and writing-leave confirmation remain available.

Desktop prioritizes passage + keyboard + nearby metrics. The 1306×656 density mode reduces secondary copy/key sizes rather than hiding the task. Hands are the already-approved child-friendly transparent raster, clipped within keyboard guidance instead of overlapping bottom actions. Small screens stack and may scroll vertically without horizontal page overflow. This is desktop/laptop typing, not a claim that a phone's software keyboard is supported.

## Implementation

`TypingCourse` retains curriculum/result/save ownership. `TypingPractice` supplies the viewport/line/character presentation, Byte coach, legend and keyboard/metric panel. `typingFeedback` contains independently tested line splitting and correction-state rules. The line progression hook cleans up ResizeObserver; session timing cleans up its interval. Existing `TypingKeyboard`, hand art and shared `RewardStars` are reused; no new bitmap or dependency is added.

## Verification and disposition

The fresh finish review in `.impeccable/review/typing-redesign-finish.md` returns `ship` for this reference adaptation, with no material fixes. Its reviewer independently opened all nine final senior/short/large captures across desktop, phone and tablet. Normal senior desktop is 1440×1000; short and larger-text desktop captures are 1306×656. Phone captures establish responsive composition, not software-keyboard support.

Supplied implementation verification in `.impeccable/review/typing-redesign-verification.md` records 36 typing browser checks, 9 focused unit tests, 3,783 tests across 94 files, and passing frontend build, frontend types and server types. Exercised browser states have no axe violations. These are local checks with synthetic public/private fixtures, not live production child-account testing, classroom outcomes, or whole-platform accessibility certification. One detector pass produced 50 advisory findings only; the reused-raster provenance scan checked eight rasters with zero missing. No new raster was introduced. The documentation pass read these results without rerunning browser captures, tests, context or detector.

The existing `DESIGN.md` and `.impeccable/design.json` are preserved. Local mono passage sizing, four-state feedback shades, keycap shadows and compact dimensions describe this exercise rather than a new global token system. `.impeccable/review/typing-redesign-documentation.md` records the source comparison and documentation completion. The historical initial typing implementation record is not overwritten. No push, deployment, migration or hibernation was performed by this redesign.
