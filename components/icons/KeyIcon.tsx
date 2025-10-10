import React from 'react';

export const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.998-.562 1.563-.43zM1.5 18h5.25m6-10.5v.008c0 .347.282.625.625.625h.008a.625.625 0 00.625-.625v-.008c0-.347-.282-.625-.625-.625h-.008A.625.625 0 0012.75 7.5z" />
    </svg>
);