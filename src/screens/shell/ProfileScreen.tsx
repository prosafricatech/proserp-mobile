import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Divider, List, Snackbar, Text } from 'react-native-paper';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../auth/AuthProvider';
import { dictionary } from '../../i18n';
import { profileApi } from '../../modules/profile/api';
import UserAvatar from '../../components/common/UserAvatar';
import { fonts } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

const t = dictionary.profile;

// Port of live-repo src/components/profile/Profile.tsx (own profile) + UserPhotoUpload.tsx.
// Opened from the drawer (with an organization) or from the root stack (without one).
export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { authUser, authOrganization, refreshAuth } = useAuth();
  const { palette } = useAppTheme();
  const [message, setMessage] = useState<string | null>(null);
  const user = authUser?.user;

  const upload = useMutation({
    mutationFn: profileApi.updatePhoto,
    onSuccess: async () => {
      await refreshAuth();
      setMessage(t.photoUpdated);
    },
    onError: (e) => setMessage(getErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: profileApi.deletePhoto,
    onSuccess: async () => {
      await refreshAuth();
      setMessage(t.photoRemoved);
    },
    onError: (e) => setMessage(getErrorMessage(e)),
  });

  const pickPhoto = async () => {
    // Runtime permission: mobile asks the user explicitly; the browser has no equivalent prompt
    // here.
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage(t.permissionDenied);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    upload.mutate({
      uri: asset.uri,
      name: asset.fileName ?? 'photo.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    });
  };

  const busy = upload.isPending || remove.isPending;

  return (
    <View style={[styles.flex, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: palette.paper }]}>
          <View style={styles.avatar}>
            <UserAvatar size={96} />
            {busy ? <ActivityIndicator style={StyleSheet.absoluteFill} /> : null}
          </View>
          <Text style={[styles.name, { color: palette.textPrimary }]}>{user?.name}</Text>
          <View style={styles.photoActions}>
            <Button icon="camera-outline" compact onPress={pickPhoto} disabled={busy}>
              {t.changePhoto}
            </Button>
            {user?.photo_path ? (
              <Button
                icon="delete-outline"
                compact
                textColor={palette.error}
                onPress={() => remove.mutate()}
                disabled={busy}
              >
                {t.removePhoto}
              </Button>
            ) : null}
          </View>
          <Divider style={styles.divider} />
          <List.Item
            title={user?.email}
            description={t.email}
            left={(p) => <List.Icon {...p} icon="at" />}
          />
          {user?.phone ? (
            <List.Item
              title={user.phone}
              description={t.phone}
              left={(p) => <List.Icon {...p} icon="phone-outline" />}
            />
          ) : null}
          <List.Item
            title={authOrganization?.organization?.name}
            description={t.organization}
            left={(p) => <List.Icon {...p} icon="domain" />}
          />
          <List.Item
            title={user?.organization_roles?.map((r) => r.name).join(', ') || '—'}
            description={t.roles}
            left={(p) => <List.Icon {...p} icon="shield-account-outline" />}
          />
        </View>

        <Button
          mode="outlined"
          icon="lock-reset"
          style={styles.button}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          {t.changePassword}
        </Button>
      </ScrollView>
      <Snackbar visible={!!message} onDismiss={() => setMessage(null)} duration={3000}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16 },
  card: { borderRadius: 16, padding: 16, alignItems: 'stretch' },
  avatar: { alignSelf: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.bold, fontSize: 20, textAlign: 'center', marginTop: 12 },
  photoActions: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  divider: { marginVertical: 8 },
  button: { borderRadius: 10 },
});
