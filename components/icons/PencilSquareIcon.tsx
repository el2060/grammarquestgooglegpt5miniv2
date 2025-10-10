import React from 'react';

export const PencilSquareIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.5l-4.243 1.273 1.273-4.243L16.862 4.487z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75v6a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-12A2.25 2.25 0 016.75 4.5h6" />
    </svg>
);