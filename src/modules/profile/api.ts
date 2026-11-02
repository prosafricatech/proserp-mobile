import { api } from '../../api/client';
import { appendFile, type PickedFile } from '../../api/upload';

// Port of live-repo src/components/profile/{ChangePasswordForm,UserPhotoUpload}.tsx.
export const profileApi = {
  async changePassword(values: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    const { data } = await api.post<{ message?: string }>('/change-password', values);
    return data;
  },

  async updatePhoto(photo: PickedFile) {
    const form = new FormData();
    appendFile(form, 'photo', photo);
    const { data } = await api.post<{ message?: string }>('/update-photo', form);
    return data;
  },

  async deletePhoto() {
    const { data } = await api.delete<{ message?: string }>('/delete-photo');
    return data;
  },
};
