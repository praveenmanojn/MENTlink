import React from 'react';
import { Badge as NativewindBadge } from 'nativewind';

type BadgeProps = React.BoxProps & { children: React.ReactNode; variant?: 'primary' | 'secondary' };

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
  const { children, variant = 'primary', ...rest } = props;
  return (
    <NativewindBadge ref={ref} variant={variant} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" {...rest}>
      {children}
    </NativewindBadge>
  );
});