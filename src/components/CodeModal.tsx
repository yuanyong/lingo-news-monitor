'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import outdent from 'outdent';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Webset } from '@prisma/client';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  webset: Webset | null;
}

export default function CodeModal({ isOpen, onClose, webset }: CodeModalProps) {
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  const getLanguage = (tab: string) => {
    switch (tab) {
      case 'curl': return 'bash';
      case 'python': return 'python';
      case 'javascript': return 'javascript';
      default: return 'text';
    }
  };

  const websetData = webset?.data as any;
  const websetName = webset?.name || 'My Webset';
  const query = websetData?.searches?.[0]?.query || 'Your search query here';
  const criteriaObjs = websetData?.searches?.[0]?.criteria || [];
  const criteria = criteriaObjs.map((c: any) => typeof c === 'string' ? c : c.description || 'Your criteria here');
  const enrichmentDesc = websetData?.enrichments?.[0]?.description || 'One sentence summary of the article using content not in the title';

  const formatCriteria = (criteria: string[], format: 'json' | 'python' | 'javascript') => {
    if (format === 'json') {
      return criteria.map(c => `       "${c}"`).join(',\n');
    } else if (format === 'javascript') {
      return criteria.map(c => `      "${c}"`).join(',\n');
    } else {
      return criteria.map(c => `                "${c}"`).join(',\n');
    }
  };

  const codeExamples = {
    curl: outdent`
      curl --request POST \\
        --url https://api.exa.ai/websets/v0/websets/ \\
        --header 'accept: application/json' \\
        --header 'content-type: application/json' \\
        --header "x-api-key: \${EXA_API_KEY}" \\
        --data '{
        "search": {
          "query": "${query}",
          "criteria": [
${formatCriteria(criteria, 'json')}
          ],
          "count": 25
        },
        "enrichments": [
          {
            "description": "${enrichmentDesc}",
            "format": "text"
          }
        ]
      }'
    `,
    python: outdent`
      from exa_py import Exa
      from exa_py.websets.types import CreateWebsetParameters, CreateEnrichmentParameters
      import os

      exa = Exa(os.getenv('EXA_API_KEY'))

      webset = exa.websets.create(
          params=CreateWebsetParameters(
              search={
                  "query": "${query}",
                  "criteria": [
${formatCriteria(criteria, 'python')}
                  ],
                  "count": 25
              },
              enrichments=[
                  {
                      "description": "${enrichmentDesc}",
                      "format": "text"
                  }
              ]
          )
      )
    `,
    javascript: outdent`
      import Exa from "exa-js";

      const exa = new Exa(process.env.EXA_API_KEY);

      const webset = await exa.websets.create({
        search: {
          query: "${query}",
          criteria: [
${formatCriteria(criteria, 'javascript')}
          ],
          count: 25
        },
        enrichments: [
          {
            description: "${enrichmentDesc}",
            format: "text"
          }
        ]
      });
    `
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-6" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div className="bg-white rounded max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-medium">Get Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            This project was built with the{' '}
            <a 
              href="https://docs.exa.ai/websets/api/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Websets API
            </a>
            . You can use the following code to recreate this webset yourself:
          </p>
          
          <div className="mb-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {Object.keys(codeExamples).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize cursor-pointer ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Code Block */}
            <div className="relative -mt-px">
              <div className="overflow-hidden h-64 sm:h-120">
                <SyntaxHighlighter
                  language={getLanguage(activeTab)}
                  style={oneDark}
                  showLineNumbers={true}
                  customStyle={{
                    margin: 0,
                    fontSize: '12px',
                    height: '100%',
                    overflow: 'auto'
                  }}
                  lineNumberStyle={{
                    minWidth: '2.5em',
                    paddingRight: '1em',
                    color: '#6b7280'
                  }}
                >
                  {codeExamples[activeTab as keyof typeof codeExamples]}
                </SyntaxHighlighter>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeExamples[activeTab as keyof typeof codeExamples]);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          <p className="text-gray-600">
            You can also view this project's source code on{' '}
            <a 
              href="https://github.com/exa-labs/websets-news-monitor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}