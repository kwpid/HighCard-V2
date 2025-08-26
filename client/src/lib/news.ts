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
    title: 'Season 1 Launch',
    summary: 'The first competitive season is now live!',
    content: `
      <h2>Welcome to Season 1!</h2>
      <p>HighCard's first competitive season is now live! Here's what's new:</p>
      <ul>
        <li>Ranked play with MMR system</li>
        <li>Season rewards for reaching milestones</li>
        <li>New Card Legend prestige rank</li>
        <li>Improved AI opponents</li>
      </ul>
      <p>Good luck on your journey to become a Card Legend!</p>
    `,
    date: '2025-01-15',
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
    date: '2025-01-10',
    category: 'update',
    featured: true
  },
  {
    id: 'balance-update',
    title: 'Balance Update v1.2',
    summary: 'Power-up card adjustments and AI improvements',
    content: `
      <h2>Balance Update v1.2</h2>
      <p>We've made several balance adjustments to improve gameplay:</p>
      <h3>Power-Up Cards</h3>
      <ul>
        <li>Adjusted power-up card distribution</li>
        <li>Improved strategic value of power-ups</li>
      </ul>
      <h3>AI Improvements</h3>
      <ul>
        <li>Better decision making for high-ranked AI</li>
        <li>More varied playing styles</li>
        <li>Improved difficulty scaling</li>
      </ul>
      <p>These changes should make matches more competitive and enjoyable!</p>
    `,
    date: '2025-01-08',
    category: 'patch'
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
