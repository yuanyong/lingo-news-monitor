import { WebsetItem } from '@prisma/client';
import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

function formatAuthor(author: string): string {
  // Handle "By Author Name - Title, Publication" format
  let cleanAuthor = author;
  
  // Remove "By " prefix (case insensitive)
  if (cleanAuthor.toLowerCase().startsWith('by ')) {
    cleanAuthor = cleanAuthor.substring(3);
  }
  
  // Split by dash and take only the name part
  const dashIndex = cleanAuthor.indexOf(' – ');
  if (dashIndex !== -1) {
    cleanAuthor = cleanAuthor.substring(0, dashIndex);
  } else {
    // Try regular dash too
    const regularDashIndex = cleanAuthor.indexOf(' - ');
    if (regularDashIndex !== -1) {
      cleanAuthor = cleanAuthor.substring(0, regularDashIndex);
    }
  }
  
  return cleanAuthor.trim();
}

async function getWebsetItems(websetId: string): Promise<WebsetItem[]> {
  return prisma.websetItem.findMany({
    where: {
      websetId: websetId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export default async function WebsetItems({ websetId }: { websetId: string }) {
  const items = await getWebsetItems(websetId);

  if (items.length === 0) {
    return <p className="text-gray-500 mt-4">No items found for this webset.</p>;
  }

  const groupedItems: WebsetItem[][] = [];
  let index = 0;
  
  while (index < items.length) {
    // Take 1 item for full width row
    if (items[index]) {
      groupedItems.push([items[index]]);
      index++;
    }
    
    // Take up to 3 items for multi-column row
    const threeItems = [];
    for (let i = 0; i < 3 && index < items.length; i++) {
      threeItems.push(items[index]);
      index++;
    }
    if (threeItems.length > 0) {
      groupedItems.push(threeItems);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {groupedItems.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.length === 1 ? (
            // Full width item
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {group[0].imageUrl && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-50">
                  <Image 
                    src={group[0].imageUrl} 
                    alt={group[0].title || 'Article image'}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={groupIndex === 0}
                  />
                </div>
              )}
              <div className="p-6 flex flex-col">
                <h3 className="font-semibold text-2xl mb-3 line-clamp-2">
                  <a 
                    href={group[0].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {group[0].title || 'Untitled'}
                  </a>
                </h3>
                
                <p className="text-base text-gray-600 mb-4 line-clamp-3">
                  {group[0].description || '\u00A0'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <div className="flex items-center gap-2 min-w-0">
                    {group[0].faviconUrl && (
                      <img 
                        src={group[0].faviconUrl} 
                        alt=""
                        className="w-5 h-5 rounded flex-shrink-0"
                      />
                    )}
                    {group[0].author && (
                      <span className="truncate">{formatAuthor(group[0].author)}</span>
                    )}
                  </div>
                  
                  {group[0].publishedAt && (
                    <time dateTime={group[0].publishedAt} className="flex-shrink-0 ml-2">
                      {formatDistanceToNowStrict(new Date(group[0].publishedAt), { addSuffix: false })} ago
                    </time>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Three column items
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {group.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {item.imageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.title || 'Article image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  
                  <div className="p-4 flex flex-col">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {item.title || 'Untitled'}
                      </a>
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 min-h-[3.75rem] line-clamp-3">
                      {item.description || '\u00A0'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.faviconUrl && (
                          <img 
                            src={item.faviconUrl} 
                            alt=""
                            className="w-4 h-4 rounded flex-shrink-0"
                          />
                        )}
                        {item.author && (
                          <span className="truncate">{formatAuthor(item.author)}</span>
                        )}
                      </div>
                      
                      {item.publishedAt && (
                        <time dateTime={item.publishedAt} className="flex-shrink-0 ml-2">
                          {formatDistanceToNowStrict(new Date(item.publishedAt), {addSuffix: false})} ago
                        </time>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}