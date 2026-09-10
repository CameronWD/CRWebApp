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

**Worksheet Format**:
The structure a Thought Record follows — **Realistic Thinking** (the therapist's three-section worksheet, the default) or **Classic** (the original 8-step version). Each record is permanently stamped with the format it was created under and is always viewed, completed, and edited in that format; the Settings toggle only chooses the format for *new* records. An Open Record completes in the format it was started in.
_Avoid_: mode, template, version

**Realistic Thinking (format)**:
The default Worksheet Format, mirroring the therapist's paper worksheet 1:1 in structure, wording, and question order. Three sections: *Identifying negative thoughts* (Situation, then one Negative Thought with a Belief Rating, then one Emotion Rating), *Gathering the evidence* (Evidence For / Evidence Against), *Realistic Thinking* (Alternative Thought with a Belief Rating, then the emotion now). Exactly one thought and one emotion per record; no Hot Thought selection and no Cognitive Distortions step. The before and after emotions may be different emotions, not a re-rating of the same one.

**Classic (format)**:
The original 8-step Worksheet Format: Situation, multiple Emotion Ratings, multiple Automatic Thoughts with a Hot Thought, Evidence For/Against, Cognitive Distortions, Balanced Thought, re-rating the same emotions.

**Negative Thought**:
In the Realistic Thinking format, the single thought the record works on, captured with a Belief Rating. The Classic format's equivalent concepts are Automatic Thought and Hot Thought.

**Belief Rating**:
How much the person believes a thought, 0–100%. Realistic Thinking only: asked once for the Negative Thought and once for the Alternative Thought. Distinct from an Emotion Rating's intensity.

**Alternative Thought**:
Realistic Thinking's counterpart to the Balanced Thought — the therapist's own wording, used verbatim in that format. Classic keeps "Balanced Thought"; the two terms are format-scoped, not synonyms to mix.

**Situation**:
The factual trigger of a Thought Record — what happened, where, when, with whom. Facts only, no interpretation.

**Emotion Rating**:
A named emotion with a 0–100% intensity, rated before and after restructuring. In the Classic format the same (possibly several) emotions are re-rated after; in Realistic Thinking there is one emotion before and one after, and they need not be the same emotion.
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
