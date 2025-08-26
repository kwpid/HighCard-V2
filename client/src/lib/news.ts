// News feed configuration - add new news items here
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image?: string; // URL to image, or undefined for placeholder
  date: string; // ISO date string
  category: 'update' | 'event' | 'announcement' | 'patch';
  featured?: boolean; // Featured news appear first
}

export const newsItems: NewsItem[] = [
  {
    id: 'season-1-launch',
    title: 'Season 1 Launch Data',
    summary: 'The first official season of Ranked',
    content: `
      <h2>Season 1 Launch Date</h2>
      <p>HighCards Season 1 launches on 9/1/2025:</p>
      <ul>
        <li>Ranked play with MMR system</li>
        <li>Season rewards for reaching milestones</li>
      </ul>
      <p>Good luck on your journey to become a Card Legend!</p>
    `,
    date: '2025-08-126',
    category: 'announcement',
    featured: true
  },
  {
    id: 'card-legend-rank',
    title: 'New Card Legend Rank',
    summary: 'Introducing the highest prestige rank in HighCard',
    content: `
      <h2>Card Legend Rank</h2>
      <p>We're excited to announce the new Card Legend rank, the highest prestige rank in HighCard!</p>
      <p>To achieve Card Legend status, you need to reach 1600+ MMR. This rank represents the pinnacle of skill and consistency in the game.</p>
      <p>Card Legend players will receive special recognition and exclusive rewards. Will you be the first to reach this prestigious rank?</p>
    `,
    date: '2025-08-26',
    category: 'update',
    featured: true
  }
];

// Get featured news (appears first)
export const getFeaturedNews = () => {
  return newsItems.filter(item => item.featured);
};

// Get all news sorted by date (newest first)
export const getAllNews = () => {
  return [...newsItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get news by ID
export const getNewsById = (id: string) => {
  return newsItems.find(item => item.id === id);
};
