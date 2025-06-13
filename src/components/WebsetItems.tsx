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
      publishedAt: 'desc'
    }
  });
}

export default async function WebsetItems({ websetId }: { websetId: string }) {
  const items = await getWebsetItems(websetId);

  if (items.length === 0) {
    return <p className="text-gray-500 mt-4">No items found for this webset.</p>;
  }

  return (
    <div className="border-t border-gray-200 divide-y divide-gray-200">
      {items.map((item, index) => (
        <a 
          key={item.id}
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex gap-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
        >
          {/* Slightly wide aspect ratio image on the left */}
          {item.imageUrl ? (
            <div 
              className="relative w-28 h-22 flex-shrink-0 bg-gray-100"
              style={{ borderRadius: '0.5rem', overflow: 'hidden' }}
            >
              <Image 
                src={item.imageUrl} 
                alt={item.title || 'Article image'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 224px"
                priority={index < 5}
              />
            </div>
          ) : (
            <div className="w-28 h-22 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Text content on the right */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-base mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title || 'Untitled'}
              </h3>
              
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-1">
                  {item.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              {item.faviconUrl && (
                <img 
                  src={item.faviconUrl} 
                  alt=""
                  className="w-4 h-4 rounded flex-shrink-0"
                />
              )}
              {item.author && (
                <span className="truncate max-w-[150px]">{formatAuthor(item.author)}</span>
              )}
              {item.author && item.publishedAt && <span>•</span>}
              {item.publishedAt && (
                <time dateTime={new Date(item.publishedAt).toISOString()}>
                  {formatDistanceToNowStrict(new Date(item.publishedAt), { addSuffix: true })}
                </time>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}