import { Image } from 'expo-image';
import React from 'react';
import { Avatar } from 'react-native-paper';
import { useAuth } from '../../auth/AuthProvider';
import { initials } from '../../navigation/AppDrawerContent';
import { useAppTheme } from '../../theme/ThemeProvider';

// The signed-in user's photo (expo-image caches it to disk), or their initials.
export default function UserAvatar({ size = 48 }: { size?: number }) {
  const { authUser } = useAuth();
  const { palette } = useAppTheme();
  const photo = authUser?.user?.photo_path;
  return photo ? (
    <Image
      source={{ uri: photo }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  ) : (
    <Avatar.Text
      size={size}
      label={initials(authUser?.user?.name)}
      style={{ backgroundColor: palette.primary }}
    />
  );
}
