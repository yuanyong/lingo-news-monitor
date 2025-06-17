'use client';

import { Webset } from '@prisma/client';
import { useState } from 'react';
import { X, BookOpen, Github } from 'lucide-react';
import { getAssetPath } from '@/app/utils';

interface InfoCardProps {
  webset: Webset;
}

export default function InfoCard({ webset }: InfoCardProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('infoCardDismissed') === 'true';
    }
    return true; // Default to hidden during SSR
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('infoCardDismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-secondary-faint border border-gray-200 rounded p-4 mb-8 mt-4 relative">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-medium text-gray-900">What is this?</h3>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss info card"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mt-3 text-sm text-gray-700 space-y-3">
          <p>
            This demo uses <a href="https://websets.exa.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Websets</a> to <strong>monitor the web semantically</strong> with natural language. Websets is a powerful tool for finding articles, people, companies, and more that match specific criteria.
          </p>
          
          <p>
            It's powered by the <a href="https://docs.exa.ai/websets/api/overview" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Websets API</a>, each topic is a Webset with a monitor for daily updates. It implements techniques like semantic whitelisting and storyline deduplication with embedings to curate the feed.
          </p>
          
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm items-center sm:justify-center">
          <a 
            href="#" 
            className="text-blue-600 hover:text-blue-700 font-bold transition-colors flex items-center gap-1"
          >
            <img src={getAssetPath("/exa_icon.ico")} alt="Exa" className="w-3.5 h-3.5" />
            Try Websets
          </a>
          <span className="hidden sm:inline text-gray-300">•</span>
          <a 
            href="https://docs.exa.ai/examples/demo-websets-news-monitor" 
            className="text-gray-600 hover:text-gray-800 font-bold transition-colors flex items-center gap-1"
          >
            <BookOpen size={14} />
            Read the Guide
          </a>
          <span className="hidden sm:inline text-gray-300">•</span>
          <a 
            href="https://github.com/exa-labs/websets-news-monitor/tree/main" 
            className="text-gray-600 hover:text-gray-800 font-bold transition-colors flex items-center gap-1"
          >
            <Github size={14} />
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}