import React from 'react';
import { Box } from 'nativewind';

type CardProps = React.BoxProps & { children: React.ReactNode };

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  return (
    <Box ref={ref} className="bg-card rounded-lg shadow-sm p-4">
      {props.children}
    </Box>
  );
});