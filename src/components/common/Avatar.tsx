import React from 'react';
import { Image } from 'react-native';

type AvatarProps = {
  src: string;
  size?: number;
};

export const Avatar = React.forwardRef<HTMLViewElement, AvatarProps>((props, ref) => {
  const { src, size = 32 } = props;
  return (
    <View ref={ref} className={`w-${size} h-${size} rounded-full border border-muted overflow-hidden`}>
      <Image source={src} className="w-full h-full" />
    </View>
  );
});