/**
 * The four pillars of the Kouci app, in the order they appear on the page.
 * Copy is written around the product spec — no placeholder text.
 */
export type FeatureId = 'players' | 'penalty' | 'tactics' | 'live'

export interface Feature {
  id: FeatureId
  index: string
  eyebrow: string
  title: string
  description: string
  /** Short, concrete capability bullets shown beneath the description. */
  points: string[]
}

export const features: Feature[] = [
  {
    id: 'players',
    index: '01',
    eyebrow: 'Players',
    title: 'Your roster, all season long',
    description:
      'Set up your squad once at the start of the season — names and cap numbers — then track every player game after game. One source of truth for the whole campaign.',
    points: [
      'Add, edit and remove players in seconds',
      'Cap numbers tied to season-long stats',
      'A living dashboard for every athlete',
    ],
  },
  {
    id: 'penalty',
    index: '02',
    eyebrow: 'Penalty Shot Stats',
    title: 'Read the shooter before they shoot',
    description:
      'Map every penalty a player has ever taken: exactly where it went, goal or miss, first attempt or a repeat in the same match, even whether the ball bounced off the water.',
    points: [
      'Shot placement plotted on the goal',
      'Goal vs. miss, first attempt vs. repeat',
      'Bounce-in-the-water flag for keepers',
    ],
  },
  {
    id: 'tactics',
    index: '03',
    eyebrow: 'Tactics with Animation',
    title: 'Draw it. Animate it. Send it.',
    description:
      'Lay out plays on a real water polo field with colored pins and animated 3D arrows. When it clicks, export the whole sequence to MP4 or GIF and send it straight to your players.',
    points: [
      'Full water polo field board',
      'Animated pins and 3D arrows, color-coded',
      'Export to MP4 or GIF to share',
    ],
  },
  {
    id: 'live',
    index: '04',
    eyebrow: 'Live Match Statistics',
    title: 'Capture the game as it happens',
    description:
      'Switch into live mode on game day and log every player’s stats in real time. The numbers are ready the moment the final whistle blows — no paper, no catch-up.',
    points: [
      'Real-time stat entry, player by player',
      'Built for the pace of the bench',
      'Season data updated instantly',
    ],
  },
]
