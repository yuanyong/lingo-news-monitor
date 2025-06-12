import { WebsetItem } from '@prisma/client';

import { prisma } from '@/lib/prisma';

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

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {item.title || 'Untitled'}
            </a>
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
          {item.publishedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Published: {new Date(item.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}