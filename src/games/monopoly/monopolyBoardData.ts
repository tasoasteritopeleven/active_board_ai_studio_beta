export type MonopolySpace = {
  index: number;
  label: string;
  stripe?: string;
  isCorner?: boolean;
};

export const MONOPOLY_SPACES: MonopolySpace[] = [
  { index: 0, label: 'GO', isCorner: true },
  { index: 1, label: 'Mediterranean', stripe: '#6b4423' },
  { index: 2, label: 'Community', stripe: '#94a3b8' },
  { index: 3, label: 'Baltic', stripe: '#6b4423' },
  { index: 4, label: 'Income Tax', stripe: '#64748b' },
  { index: 5, label: 'Reading RR', stripe: '#1e293b' },
  { index: 6, label: 'Oriental', stripe: '#38bdf8' },
  { index: 7, label: 'Chance', stripe: '#f59e0b' },
  { index: 8, label: 'Vermont', stripe: '#38bdf8' },
  { index: 9, label: 'Connecticut', stripe: '#38bdf8' },
  { index: 10, label: 'Jail', isCorner: true },
  { index: 11, label: 'St. Charles', stripe: '#ec4899' },
  { index: 12, label: 'Electric', stripe: '#eab308' },
  { index: 13, label: 'States', stripe: '#ec4899' },
  { index: 14, label: 'Virginia', stripe: '#ec4899' },
  { index: 15, label: 'Penn RR', stripe: '#1e293b' },
  { index: 16, label: 'St. James', stripe: '#f97316' },
  { index: 17, label: 'Community', stripe: '#94a3b8' },
  { index: 18, label: 'Tennessee', stripe: '#f97316' },
  { index: 19, label: 'New York', stripe: '#f97316' },
  { index: 20, label: 'Free Parking', isCorner: true },
  { index: 21, label: 'Kentucky', stripe: '#ef4444' },
  { index: 22, label: 'Chance', stripe: '#f59e0b' },
  { index: 23, label: 'Indiana', stripe: '#ef4444' },
  { index: 24, label: 'Illinois', stripe: '#ef4444' },
  { index: 25, label: 'B&O RR', stripe: '#1e293b' },
  { index: 26, label: 'Atlantic', stripe: '#facc15' },
  { index: 27, label: 'Ventnor', stripe: '#facc15' },
  { index: 28, label: 'Water Works', stripe: '#06b6d4' },
  { index: 29, label: 'Marvin', stripe: '#facc15' },
  { index: 30, label: 'Go To Jail', isCorner: true },
  { index: 31, label: 'Pacific', stripe: '#22c55e' },
  { index: 32, label: 'NC', stripe: '#22c55e' },
  { index: 33, label: 'Community', stripe: '#94a3b8' },
  { index: 34, label: 'Pennsylvania', stripe: '#22c55e' },
  { index: 35, label: 'Short Line', stripe: '#1e293b' },
  { index: 36, label: 'Chance', stripe: '#f59e0b' },
  { index: 37, label: 'Park Place', stripe: '#2563eb' },
  { index: 38, label: 'Luxury Tax', stripe: '#64748b' },
  { index: 39, label: 'Boardwalk', stripe: '#2563eb' },
];
