/**
 * FontAwesomeIcon Wrapper Component
 * Provides a simple interface for using Font Awesome icons with lucide-like API
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ReactNode } from 'react';

interface IconProps {
  icon: IconDefinition;
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x';
  spin?: boolean;
  pulse?: boolean;
  flip?: 'horizontal' | 'vertical' | 'both';
  rotation?: 90 | 180 | 270;
  fixedWidth?: boolean;
  inverse?: boolean;
  opacity?: 0.25 | 0.5 | 0.75 | 1;
  border?: boolean;
  pull?: 'left' | 'right';
  children?: ReactNode;
  [key: string]: unknown;
}

export function FAIcon({
  icon,
  className = '',
  size,
  spin,
  pulse,
  flip,
  rotation,
  fixedWidth,
  inverse,
  opacity,
  border,
  pull,
  ...rest
}: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      size={size}
      spin={spin}
      pulse={pulse}
      flip={flip}
      rotation={rotation}
      fixedWidth={fixedWidth}
      inverse={inverse}
      opacity={opacity}
      border={border}
      pull={pull}
      {...rest}
    />
  );
}

export default FAIcon;
