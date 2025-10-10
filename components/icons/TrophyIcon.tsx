import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a2.25 2.25 0 01-2.25-2.25V9.75A2.25 2.25 0 017.5 7.5h9A2.25 2.25 0 0118.75 9.75v6.75A2.25 2.25 0 0116.5 18.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5V6a3 3 0 013-3v0a3 3 0 013 3v1.5M12 18.75v3M9 21.75h6" />
    </svg>
);