import React from 'react';

export const SpeculationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25h.01M12 12h.01M12 15.75h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);