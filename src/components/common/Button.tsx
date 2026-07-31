import React from 'react';
import { Button } from 'nativewind';

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' };
type SecondaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'secondary' };
type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: React.ReactNode; size?: number };

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>((props, ref) => {
  const { variant = 'primary', ...rest } = props;
  return (
    <Button
      ref={ref}
      variant={variant}
      className="rounded-md font-medium"
      {...rest}
    />
  );
});

export const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>((props, ref) => {
  const { variant = 'secondary', ...rest } = props;
  return (
    <Button
      ref={ref}
      variant={variant}
      className="rounded-md font-medium"
      {...rest}
    />
  );
});

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const { icon, size = 20, ...rest } = props;
  return (
    <Button
      ref={ref}
      size={size}
      className="p-0"
      {...rest}
    >
      {icon}
    </Button>
  );
});