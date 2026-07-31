import React from 'react';
import { View, Text, Image } from 'react-native';

type EmptyStateProps = {
  message?: string;
  illustration?: React.ReactNode;
};

export const EmptyState = React.forwardRef<HTMLViewElement, EmptyStateProps>((props, ref) => {
  const { message = 'Nothing here', illustration = <Text>Empty</Text> } = props;
  return (
    <View ref={ref} className="flex flex-col items-center justify-center h-full">
      {illustration}
      <Text className="mt-4 text-center text-muted">{message}</Text>
    </View>
  );
});