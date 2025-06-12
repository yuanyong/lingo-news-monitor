import Link from 'next/link';
import { Webset } from '@prisma/client';

interface WebsetNavProps {
  websets: Webset[];
  selectedWebsetId: string;
}

export default function WebsetNav({ websets, selectedWebsetId }: WebsetNavProps) {
  if (websets.length === 0) {
    return <p className="text-gray-500">No websets found.</p>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {websets.map((webset) => (
        <Link
          key={webset.id}
          href={`/?websetId=${webset.websetId}`}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
            selectedWebsetId === webset.websetId
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {webset.name}
        </Link>
      ))}
    </div>
  );
}