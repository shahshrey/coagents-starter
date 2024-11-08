import { ContentItem } from "../lib/types";


const ContentItems = ({ items }: { items: ContentItem[] }) => {
  const parseContent = (item: ContentItem): ContentItem => {
    try {
      // If title and summary are already available, return them directly
      if (item.title && item.summary) {
        return item;
      }
      // Parse from repr string
      if (item.repr) {
        // Match title with single quotes
        const titleMatch = item.repr.match(/title='([^']+?)'/);
        
        // Match summary with either single or double quotes
        const summaryMatch = item.repr.match(/summary=(['"])(.*?)\1(?=\))/);
        
        if (titleMatch?.[1] && summaryMatch?.[2]) {
          return {
            title: titleMatch[1],
            summary: summaryMatch[2],
            id: item.id
          };
        }
      }
      console.log('Failed to parse:', item); // Debug log
      return { title: 'Unknown Title', summary: 'No summary available', id: item.id };
    } catch (e) {
      console.error('Error parsing content:', e);
      return { title: 'Error', summary: 'Failed to parse content', id: item.id };
    }
  };

  return (
    <div className="space-y-4 h-full">
      <h2 className="text-xl font-semibold mb-4">Articles for Linkedin</h2>
      {items && items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((item, index) => {
            const { title, summary } = parseContent(item);
            return (
              <div 
                key={index} 
                className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail/Icon container */}
                <div className="flex-shrink-0 w-16 bg-blue-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                {/* Content container */}
                <div className="flex-1 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {summary}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {item.id.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6">
          <p className="text-center text-gray-500">No content items available</p>
        </div>
      )}
    </div>
  );
};

export default ContentItems;