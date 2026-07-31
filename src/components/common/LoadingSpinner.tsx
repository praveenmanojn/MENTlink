import React from 'react';
import { ActivityIndicator } from 'react-native';

export const LoadingSpinner = React.forwardRef<HTMLViewElement, {}>((_props, ref) => {
  return (
    <ActivityIndicator
      ref={ref}
      style={{ width: 40, height: 40, margin: 'auto' }}
      size="large"
    />
  );
});