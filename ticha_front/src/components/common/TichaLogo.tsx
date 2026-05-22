import React from 'react';
import tichaLogoSrc from '../../assets/ticha-logo.jpg';

interface TichaLogoProps {
  /** Size in pixels for height. Width scales proportionally. */
  size?: number;
  /** Optional extra CSS classes */
  className?: string;
}

/**
 * Renders the actual Ticha brand logo (brain‑T mark) from the imported asset.
 * The image is displayed with a transparent-feeling treatment via mix-blend-mode.
 */
export const TichaLogo: React.FC<TichaLogoProps> = ({
  size = 36,
  className = '',
}) => {
  return (
    <img
      src={tichaLogoSrc}
      alt="Ticha Logo"
      style={{ height: size, width: 'auto' }}
      className={`object-contain mix-blend-multiply ${className}`}
    />
  );
};
