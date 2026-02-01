import React from 'react';

const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5a2.25 2.25 0 0 1-2.25 2.25H10.5v-1.5a1.5 1.5 0 0 0-1.5-1.5H7.5V3.75m9 0a2.25 2.25 0 0 0-2.25-2.25H8.25a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 8.25 19.5h7.5a2.25 2.25 0 0 0 2.25-2.25V3.75Z" />
  </svg>
);

export default SaveIcon;
