import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Web downloads files; a phone saves them to the cache and opens the share sheet
// (WhatsApp, email, Files, Drive...). That is the mobile equivalent of a download link.
const downloadOnWeb = (data: BlobPart, filename: string, type: string) => {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const safeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-');

export async function shareExcel(buffer: ArrayBuffer, filename: string) {
  const name = safeName(filename);
  if (Platform.OS === 'web') return downloadOnWeb(buffer, name, XLSX);
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  await file.write(new Uint8Array(buffer));
  await Sharing.shareAsync(file.uri, {
    mimeType: XLSX,
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
    dialogTitle: name,
  });
}

// PDFs are rendered from HTML by the OS (expo-print), replacing web's @react-pdf/renderer.
export async function sharePdf(html: string, filename: string) {
  if (Platform.OS === 'web') return Print.printAsync({ html });
  const { uri } = await Print.printToFileAsync({ html });
  const target = new File(Paths.cache, safeName(filename));
  target.create({ overwrite: true });
  await target.write(await new File(uri).bytes());
  await Sharing.shareAsync(target.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: filename,
  });
}

export const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );

// A captured image file (react-native-view-shot) → share sheet; on web, a download.
export async function shareImage(
  uri: string,
  filename: string,
  mimeType: 'image/png' | 'image/jpeg'
) {
  if (Platform.OS === 'web') {
    const a = document.createElement('a');
    a.href = uri;
    a.download = filename;
    a.click();
    return;
  }
  const target = new File(Paths.cache, safeName(filename));
  target.create({ overwrite: true });
  await target.write(await new File(uri).bytes());
  await Sharing.shareAsync(target.uri, { mimeType, dialogTitle: filename });
}
