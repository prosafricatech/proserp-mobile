import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';
import { notificationsApi } from '../../modules/notifications/api';
import { useAppTheme } from '../../theme/ThemeProvider';

// Header bell with the unread count, like live-repo's NotificationBell. Polls every minute
// while the app is in the foreground (React Query pauses refetchInterval in the background).
export default function NotificationBell() {
  const navigation = useNavigation<any>();
  const { palette } = useAppTheme();
  const { data: count = 0 } = useQuery({
    queryKey: ['notificationsUnread'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 60_000,
  });

  return (
    <View>
      <IconButton
        icon="bell-outline"
        iconColor={palette.textSecondary}
        onPress={() => navigation.navigate('Notifications')}
      />
      {count > 0 ? (
        <Badge size={18} style={styles.badge}>
          {count > 99 ? '99+' : count}
        </Badge>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ badge: { position: 'absolute', top: 4, right: 4 } });
