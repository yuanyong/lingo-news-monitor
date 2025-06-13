'use client';

import Link from 'next/link';
import { Webset } from '@prisma/client';
import { useState } from 'react';
import { Code } from 'lucide-react';
import CodeModal from './CodeModal';

interface WebsetNavProps {
  websets: Webset[];
  selectedWebsetId: string;
}

export default function WebsetNav({ websets, selectedWebsetId }: WebsetNavProps) {
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const selectedWebset = websets.find(w => w.websetId === selectedWebsetId) || null;

  if (websets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-4">
        <p className="text-gray-500">No websets found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pr-32">
          {websets.map((webset) => (
            <Link
              key={webset.id}
              href={`/?websetId=${webset.websetId}`}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm transition-colors cursor-pointer ${selectedWebsetId === webset.websetId
                ? 'bg-blue-500 text-white font-bold'
                : 'hover:border-gray-300 border border-secondary-default'
                }`}
            >
              {webset.name}
            </Link>
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          <div className="w-4 h-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-secondary-default/95"></div>
          </div>
          <div className='bg-secondary-default'>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="flex-shrink-0 px-3 py-1 bg-secondary-faint border border-gray-200 text-gray-700 text-sm rounded hover:shadow-sm transition-colors flex items-center gap-1"
            >
              Get Code
              <Code size={14} />
            </button>
          </div>
        </div>

        <CodeModal
          isOpen={isCodeModalOpen}
          onClose={() => setIsCodeModalOpen(false)}
          webset={selectedWebset}
        />
      </div>
    </div>
  );
}