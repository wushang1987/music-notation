import React from "react";

const BrandLogo = ({ className = "w-7 h-7", title = "Score Canvas" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="1.75" />
      <path
        d="M8 8.5h8"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M8 11.5h6"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path d="M14.5 8.7v7.2" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M14.5 10.2c1.5-0.5 2.8-0.9 4.2-1.1"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.7 16.9c0 1.1-0.9 2-2 2s-2-0.9-2-2 0.9-2 2-2 2 0.9 2 2Z"
        strokeWidth="1.75"
      />
    </svg>
  );
};

export default BrandLogo;
