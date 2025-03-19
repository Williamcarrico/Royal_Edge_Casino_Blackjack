import React from 'react';

interface CasinoIconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export const CasinoIcon: React.FC<CasinoIconProps> = ({ className, ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            {/* Playing card icon */}
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M7 7h.01" />
            <path d="M17 17h.01" />
            <path d="M12 12h.01" />
            <path d="M17 7h.01" />
            <path d="M7 17h.01" />
        </svg>
    );
};

export default CasinoIcon;