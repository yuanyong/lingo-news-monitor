'use client';

import { WebsetItem } from '@prisma/client';
import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

function WebsetItemsSkeleton() {
  return (
    <div className="border-t border-gray-200 divide-y divide-gray-200">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex gap-4 py-3 animate-pulse">
          <div className="w-28 h-22 bg-gray-200 rounded"></div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface WebsetItemsResponse {
  items: WebsetItem[];
  hasMore: boolean;
  page: number;
  limit: number;
}

export default function WebsetItems({ websetId, page = 1 }: { websetId: string, page?: number }) {
  const [data, setData] = useState<WebsetItemsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const response = await fetch(`/api/websets/${websetId}/items?page=${page}`);
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    if (websetId) {
      fetchItems();
    }
  }, [websetId, page]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <WebsetItemsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-red-500 mt-4">Error: {error}</div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-500 mt-4">No items found for this webset.</p>
      </div>
    );
  }

  const { items, hasMore } = data;

  return (
    <div className="max-w-4xl mx-auto">
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
                  <time dateTime={new Date(item.publishedAt).toISOString()} className="whitespace-nowrap">
                    {formatDistanceToNowStrict(new Date(item.publishedAt), { addSuffix: true })}
                  </time>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
      
      {/* More button - only show if we have the full page of items and there are more */}
      {items.length === data.limit && hasMore && (
        <div className="my-4 text-center">
          <Link
            href={`/?websetId=${websetId}&page=${page + 1}`}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            More
          </Link>
        </div>
      )}
    </div>
  );
}