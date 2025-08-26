import { useState } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { X, Calendar, Tag, ArrowLeft } from "lucide-react";
import { NewsItem, getAllNews, getNewsById } from "../lib/news";

const NewsModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const newsItems = getAllNews();

  if (!modalsOpen.news) return null;

  const closeNews = () => {
    setSelectedNews(null);
    setModalsOpen('news', false);
  };

  const openNews = (news: NewsItem) => {
    setSelectedNews(news);
  };

  const goBack = () => {
    setSelectedNews(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-blue-600 text-blue-100';
      case 'update': return 'bg-green-600 text-green-100';
      case 'patch': return 'bg-purple-600 text-purple-100';
      case 'event': return 'bg-orange-600 text-orange-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (selectedNews) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">News</h2>
                <div className="text-sm text-gray-400">Article</div>
              </div>
            </div>
            <button
              onClick={closeNews}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* News Content */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedNews.category)}`}>
                  {selectedNews.category.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Calendar size={14} />
                  {formatDate(selectedNews.date)}
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">{selectedNews.title}</h1>
              
              {selectedNews.image && (
                <div className="mb-6">
                  <img 
                    src={selectedNews.image} 
                    alt={selectedNews.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">News</h2>
            <div className="text-sm text-gray-400">Latest updates and announcements</div>
          </div>
          <button
            onClick={closeNews}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* News List */}
        <div className="p-6">
          <div className="grid gap-4">
            {newsItems.map((news) => (
              <div
                key={news.id}
                onClick={() => openNews(news)}
                className="bg-gray-750 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:bg-gray-700 hover:scale-[1.02] border border-gray-700"
              >
                <div className="flex gap-4">
                  {/* News Image or Placeholder */}
                  <div className="w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {news.image ? (
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-2xl">📰</div>
                        <div className="text-xs">News</div>
                      </div>
                    )}
                  </div>
                  
                  {/* News Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(news.category)}`}>
                        {news.category.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Calendar size={12} />
                        {formatDate(news.date)}
                      </div>
                      {news.featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-600 text-yellow-100">
                          FEATURED
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {news.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {news.summary}
                    </p>
                    
                    <div className="mt-3 text-xs text-emerald-400 font-medium">
                      Click to read more →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
