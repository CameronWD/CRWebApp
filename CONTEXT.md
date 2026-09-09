# Thought Records

A private, local-first mobile web app for completing CBT cognitive restructuring worksheets ("thought records") on a phone, replacing the paper worksheet used between therapy sessions.

## Language

**Thought Record**:
One completed worksheet entry, capturing a single situation and the full 8-step restructuring process around it.
_Avoid_: worksheet, note, journal entry

**Open Record**:
A Thought Record captured in the moment with only the first steps filled (Situation, Emotion Ratings, Automatic Thoughts). It waits on the home screen to be completed.
_Avoid_: draft, pending entry

**Completed Record**:
A Thought Record whose restructuring steps (evidence, distortions, Balanced Thought, emotion re-rating) are done. Completion is a one-way transition from Open Record.

**Situation**:
The factual trigger of a Thought Record — what happened, where, when, with whom. Facts only, no interpretation.

**Emotion Rating**:
A named emotion with a 0–100% intensity. Each Thought Record rates emotions twice: before (step 2) and after (step 8) restructuring, using the same emotion list both times.
_Avoid_: mood, feeling score

**Automatic Thought**:
A thought that went through the person's mind in the Situation. A Thought Record can hold several.

**Hot Thought**:
The one Automatic Thought carrying the most emotional charge; the rest of the record works on this thought.

**Evidence For / Evidence Against**:
Facts (not feelings) supporting or contradicting the Hot Thought.

**Cognitive Distortion**:
A named thinking-pattern label (catastrophising, mind-reading, all-or-nothing, etc.) tagged onto the Hot Thought from a fixed pick-list.
_Avoid_: bias, fallacy

**Balanced Thought**:
The realistic, believable reframe that accounts for both evidence columns. Explicitly not forced positivity.
_Avoid_: positive thought, reframe (as a noun)

**Theme**:
One of four calming, low-saturation colour palettes (Sage, Dusk, Ocean, Sand) the whole app renders in; chosen in Settings, each with light and dark variants. Sage is the default. Stored on-device in localStorage (not in backups) — a device preference, like the thinking-pattern toggle which lives in the settings table; neither travels with an exported backup.
_Avoid_: skin, colour scheme

## Example dialogue

> **Dev:** So an entry has one emotion?
> **Expert:** No — a Thought Record has one Situation but several Emotion Ratings, and each emotion is rated twice: once when recording the Situation, and again after writing the Balanced Thought. The drop between the two ratings is the signal the technique worked.
> **Dev:** And the Balanced Thought replaces the Automatic Thoughts?
> **Expert:** It answers the Hot Thought specifically. The other Automatic Thoughts stay recorded but aren't worked on in that record.
