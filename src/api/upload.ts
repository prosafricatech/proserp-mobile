// A picked file, as expo-image-picker / expo-document-picker describe it.
export type PickedFile = { uri: string; name: string; type: string };

export const isPickedFile = (value: unknown): value is PickedFile =>
  !!value && typeof value === 'object' && 'uri' in value && 'name' in value;

export const appendFile = (form: FormData, key: string, file: PickedFile) => {
  // React Native's FormData takes { uri, name, type } and streams the file from disk.
  form.append(key, { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
};

// Same encoding as live-repo organizationServices.buildFormData(): skip null/undefined,
// files as files, arrays as key[], everything else as a string ("true"/"false" for booleans).
export const toFormData = (values: Record<string, unknown>) => {
  const form = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (isPickedFile(value)) appendFile(form, key, value);
    else if (Array.isArray(value)) value.forEach((v) => form.append(`${key}[]`, String(v)));
    else if (typeof value === 'object') form.append(key, JSON.stringify(value));
    else form.append(key, String(value));
  });
  return form;
};
