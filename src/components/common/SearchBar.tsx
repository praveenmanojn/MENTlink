import React from 'react';
import { Input, Icon } from 'nativewind';
import { SearchIcon } from '@expo/vector-icons';

type SearchBarProps = React.TextInputHTMLAttributes<HTMLInputElement> & {
  placeholder?: string;
};

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>((props, ref) => {
  const { placeholder = 'Search...', ...rest } = props;
  return (
    <Input
      ref={ref}
      placeholder={placeholder}
      className="mt-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
      {...rest}
    >
      <SearchIcon className="mt-1 h-5 w-5 text-gray-500" />
    </Input>
  );
});