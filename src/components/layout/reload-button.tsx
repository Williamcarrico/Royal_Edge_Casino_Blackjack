'use client';

import React from 'react';

interface ReloadButtonProps {
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export function ReloadButton({ children = 'Return to lobby', className }: ReloadButtonProps) {
  return (
    <button
      onClick={() => window.location.reload()}
      className={className ?? "underline"}
    >
      {children}
    </button>
  );
}