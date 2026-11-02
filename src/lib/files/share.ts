import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Web downloads files; a phone saves them to the cache and opens the share sheet
// (WhatsApp, email, Files, Drive...). That is the mobile equivalent of a download link.

const safeName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '-');

// Copy a file the OS produced (print, screenshot) to a nicely named cache file, then share it.
async function shareFileAs(sourceUri: string, filename: string, mimeType: string, uti?: string) {
  const target = new File(Paths.cache, safeName(filename));
  target.create({ overwrite: true });
  await target.write(await new File(sourceUri).bytes());
  await Sharing.shareAsync(target.uri, { mimeType, UTI: uti, dialogTitle: filename });
}

export async function shareExcel(buffer: ArrayBuffer, filename: string) {
  const name = safeName(filename);
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
  const { uri } = await Print.printToFileAsync({ html });
  await shareFileAs(uri, filename, 'application/pdf', 'com.adobe.pdf');
}

// A captured image file (react-native-view-shot) → share sheet.
export async function shareImage(
  uri: string,
  filename: string,
  mimeType: 'image/png' | 'image/jpeg'
) {
  await shareFileAs(uri, filename, mimeType);
}

export const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
