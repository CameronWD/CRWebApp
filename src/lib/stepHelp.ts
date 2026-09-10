export interface StepHelp {
  title: string;
  paragraphs: string[];
  example?: string;
}

export const STEP_HELP = {
  situation: {
    title: 'The situation',
    paragraphs: [
      'Describe what happened as if a camera recorded it: where you were, when it was, who was there, what was said or done.',
      'Stick to facts you could point at. Interpretations ("she was annoyed with me") and feelings belong in the later steps — here it’s only what actually happened.',
    ],
    example: 'This afternoon at work, my manager criticised my report in front of the team.',
  },
  emotionsClassic: {
    title: 'Naming your emotions',
    paragraphs: [
      'Pick every emotion that was present in the moment — there are often several at once.',
      'Emotions are single words: anxious, sad, ashamed. If it takes a sentence, it’s probably a thought — save it for the next step.',
      'Then set how strong each one felt, from 0 to 100%. There’s no wrong number; go with your gut.',
    ],
  },
  thoughts: {
    title: 'Catching the thoughts',
    paragraphs: [
      'Write down what went through your mind in the situation, one thought at a time, in the words they arrived in.',
      'Thoughts can be statements, questions ("what if they fire me?") or images. Add them all.',
      'Then tap the one that stings the most — the hot thought. The rest of the worksheet works on that one.',
    ],
    example: '"I always mess this up."',
  },
  distortions: {
    title: 'Thinking patterns',
    paragraphs: [
      'These are common thinking traps — habitual ways a mind bends the facts under stress.',
      'Read the descriptions and tap any that fit the hot thought. Naming the pattern helps you spot it sooner next time.',
      'It’s fine to pick none, one, or several.',
    ],
  },
  balanced: {
    title: 'A fairer take',
    paragraphs: [
      'Write a thought that accounts for the evidence on both sides — believable, not forced positivity.',
      'A good balanced thought usually acknowledges what’s true and puts it in proportion.',
      'Ask yourself: what would I tell a friend in this exact situation?',
    ],
    example: 'I made two mistakes in an otherwise solid report — that’s a normal miss, not proof I can’t do my job.',
  },
  rerate: {
    title: 'Rating the feelings again',
    paragraphs: [
      'With your balanced thought in mind, rate the same emotions once more.',
      'Any drop counts — from 80 to 60 is a real shift. The goal is movement, not zero.',
    ],
  },
  negativeThought: {
    title: 'Your thought',
    paragraphs: [
      'Write the thought that went through your mind in the situation, in the words it arrived in.',
      'If several thoughts came at once, choose the one that stings the most — you can make another record for the others.',
      'Then rate how much you believe it right now, from 0 (not at all) to 100% (completely).',
    ],
    example: '"I always mess this up."',
  },
  emotionBefore: {
    title: 'Your emotion',
    paragraphs: [
      'Pick the emotion that was strongest in the moment. One word: anxious, sad, ashamed. If it takes a sentence, it’s probably a thought.',
      'If the right word isn’t there, add your own with "+ something else".',
      'Then set how strong it felt, from 0 to 100%. There’s no wrong number.',
    ],
  },
  evidenceFor: {
    title: 'Evidence for the thought',
    paragraphs: [
      'List facts that genuinely support the thought — things a fair observer would accept, not feelings or hunches.',
      '"I felt terrible" is a feeling; "my manager pointed out two errors" is evidence. It’s okay if some real evidence exists — that’s normal.',
      'Nothing coming? That’s fine too. Leave it empty and move on.',
    ],
    example: 'My manager pointed out two mistakes in the report.',
  },
  evidenceAgainst: {
    title: 'Evidence against the thought',
    paragraphs: [
      'List facts that don’t fit the thought — anything that contradicts it, or that it conveniently ignores.',
      'A useful trick: imagine a friend had this exact thought. What would you point out to them?',
    ],
    example: 'Last month the same manager praised my analysis — two errors in thirty pages isn’t "always messing up".',
  },
  alternative: {
    title: 'Your alternative thought',
    paragraphs: [
      'Write a thought that fits all the evidence — both columns — and is believable to you. Forced positivity doesn’t work; realism does.',
      'A good alternative usually acknowledges what’s true and puts it in proportion. Ask yourself: what would I tell a friend who showed me this evidence?',
      'Then rate how much you believe this new thought, from 0 to 100%.',
    ],
    example: 'I made two mistakes in an otherwise solid report — that’s a normal miss, not proof I always mess up.',
  },
  emotionNow: {
    title: 'Your emotion now',
    paragraphs: [
      'With your alternative thought in mind, notice what you feel right now. It can be the same emotion as before, weaker — or a different one entirely, like relief.',
      'Rate its strength from 0 to 100%. Any shift from where you started counts.',
    ],
  },
} satisfies Record<string, StepHelp>;
