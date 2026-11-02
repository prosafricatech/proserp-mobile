import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  Divider,
  List,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthProvider';
import { dictionary } from '../../i18n';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

const t = dictionary.userMenu;

// Takes the photo as a prop: Paper's <Portal> renders its children in the host inside
// PaperProvider, which sits ABOVE AuthProvider, so useAuth() isn't reachable in there.
function UserAvatar({
  size,
  borderColor,
  photo,
}: {
  size: number;
  borderColor: string;
  photo?: string | null;
}) {
  const { palette } = useAppTheme();
  const style = { width: size, height: size, borderRadius: size / 2, borderWidth: 4, borderColor };
  return photo ? (
    <Image source={{ uri: photo }} style={style} contentFit="cover" />
  ) : (
    // MUI <Avatar> without an image shows a generic person icon.
    <View style={[style, styles.center, { backgroundColor: palette.divider }]}>
      <Avatar.Icon
        size={size - 8}
        icon="account"
        style={{ backgroundColor: 'transparent' }}
        color={palette.paper}
      />
    </View>
  );
}

// live-repo components/authUserPopover/AuthUserPopover.tsx: the avatar at the top right
// holds the user, the active organization, Profile, Switch Organization and Logout.
export default function UserMenu() {
  const navigation = useNavigation<any>();
  const { authUser, authOrganization, signOut } = useAuth();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const user = authUser?.user;
  const organization = authOrganization?.organization;
  const mainColor = organization?.settings?.main_color || 'transparent';

  if (!user) return null;

  const go = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={user.name}
      >
        <UserAvatar size={36} borderColor={mainColor} photo={user.photo_path} />
      </Pressable>

      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={[
            styles.popover,
            { top: insets.top + 56, backgroundColor: palette.paper },
          ]}
        >
          <View style={styles.head}>
            <UserAvatar size={60} borderColor={mainColor} photo={user.photo_path} />
            <Text numberOfLines={1} style={[styles.name, { color: palette.textPrimary }]}>
              {user.name}
            </Text>
            <Text numberOfLines={1} style={{ color: palette.textSecondary }}>
              {user.email}
            </Text>
            {organization?.id ? (
              <Chip
                mode="outlined"
                compact
                style={[styles.chip, { borderColor: palette.primary }]}
                textStyle={{ color: palette.primary }}
                onPress={() =>
                  go(() =>
                    navigation.navigate('ComingSoon', {
                      id: 'organizationProfile',
                      title: organization.name,
                      path: `/organizations/profile/${organization.id}`,
                      hatua: 13,
                    })
                  )
                }
              >
                {organization.name}
              </Chip>
            ) : (
              <Text
                style={[styles.warning]}
                onPress={() => go(() => navigation.navigate('Organizations'))}
              >
                {t.noOrganization}
              </Text>
            )}
          </View>
          <Divider />
          <List.Item
            title={t.profile}
            left={(p) => <List.Icon {...p} icon="account-outline" />}
            onPress={() =>
              go(() =>
                organization?.id
                  ? navigation.navigate('App', { screen: 'Profile' })
                  : navigation.navigate('ProfileStandalone')
              )
            }
          />
          <List.Item
            title={t.switchOrganization}
            left={(p) => <List.Icon {...p} icon="repeat" />}
            onPress={() => go(() => navigation.navigate('Organizations'))}
          />
          <List.Item
            title={t.logout}
            left={(p) => <List.Icon {...p} icon="logout" />}
            onPress={() => go(() => setConfirm(true))}
          />
        </Modal>

        <Dialog visible={confirm} onDismiss={() => setConfirm(false)}>
          <Dialog.Title>{t.confirmTitle}</Dialog.Title>
          <Dialog.Content>
            <Text>{t.confirmBody}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm(false)}>{t.cancel}</Button>
            <Button
              onPress={() => {
                setConfirm(false);
                signOut();
              }}
            >
              {t.logout}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  trigger: { marginHorizontal: 8 },
  popover: {
    position: 'absolute',
    right: 12,
    width: 280,
    borderRadius: 12,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  head: { alignItems: 'center', padding: 20, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 18, marginTop: 12 },
  chip: { marginTop: 8 },
  warning: { color: '#F39711', textDecorationLine: 'underline', textAlign: 'center', marginTop: 8 },
});
