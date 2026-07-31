import React from 'react';
import { Input } from 'nativewind';

type TextInputProps = React.TextInputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  placeholder?: string;
};

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const { label, placeholder, ...rest } = props;
  return (
    <div className="mt-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Input
        ref={ref}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
        {...rest}
      />
    </div>
  );
});