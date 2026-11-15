import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { AppThemeProvider } from '../src/theme/ThemeProvider';
import ConfirmDialog from '../src/components/common/ConfirmDialog';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('ConfirmDialog', () => {
  it('renders the confirmation copy and calls the selected action', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const screen = await render(
      <AppThemeProvider>
        <ConfirmDialog
          visible
          title="Remove bank?"
          message="This action cannot be undone."
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      </AppThemeProvider>
    );

    expect(screen.getByText('Remove bank?')).toBeTruthy();
    expect(screen.getByText('This action cannot be undone.')).toBeTruthy();
    fireEvent.press(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
