'use client';


import { useEffect, useState } from 'react';

function NextUpdateCountdown() {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));

      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Update immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xs text-gray-500 font-mono">
      Update in:{' '}
      <span>{timeRemaining}</span>
    </div>
  );
}


export default function Header() {
  return (
    <div className="border-b border-gray-200">
      <div className="max-w-4xl mx-auto py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-medium">
            <span className="inline-block">Semantic</span>{' '}
            <span className='text-brand-default inline-block'>Web Monitor</span>
          </h2>
          <NextUpdateCountdown />
        </div>
      </div>
    </div>
  );
}