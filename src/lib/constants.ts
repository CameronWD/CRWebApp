export const DEFAULT_EMOTIONS: readonly string[] = [
  'Anxious',
  'Sad',
  'Angry',
  'Ashamed',
  'Guilty',
  'Embarrassed',
  'Hopeless',
  'Frustrated',
  'Overwhelmed',
  'Lonely',
  'Afraid',
  'Hurt',
];

export interface Distortion {
  name: string;
  description: string;
}

export const DISTORTIONS: Distortion[] = [
  { name: 'All-or-nothing thinking', description: 'Black and white — if it isn’t perfect, it’s a failure.' },
  { name: 'Overgeneralisation', description: 'One bad event becomes a never-ending pattern.' },
  { name: 'Mental filter', description: 'One negative detail colours everything else.' },
  { name: 'Discounting the positive', description: 'Good things don’t count — “they were just being nice”.' },
  { name: 'Mind-reading', description: 'Assuming you know what others think of you.' },
  { name: 'Fortune-telling', description: 'Predicting a bad outcome as if it were fact.' },
  { name: 'Catastrophising', description: 'Blowing things up into a looming disaster.' },
  { name: 'Emotional reasoning', description: 'It feels true, so it must be true.' },
  { name: 'Should statements', description: 'Beating yourself up with shoulds, musts and oughts.' },
  { name: 'Labelling', description: 'A global label instead of the event — “I’m an idiot”.' },
  { name: 'Personalisation', description: 'Taking the blame for things not fully in your control.' },
];
