import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { dictionary } from '../../i18n';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  visible,
  title = dictionary.masters.common.deleteTitle,
  message = dictionary.masters.common.deleteBody,
  confirming,
  onCancel,
  onConfirm,
}: Props) {
  const { palette } = useAppTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>{dictionary.masters.common.cancel}</Button>
          <Button
            mode="contained"
            buttonColor={palette.error}
            loading={confirming}
            disabled={confirming}
            onPress={onConfirm}
          >
            {dictionary.masters.common.delete}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
