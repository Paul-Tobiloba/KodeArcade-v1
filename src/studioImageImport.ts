import { importedImage } from './studioProject';

export const imageImportBytes = 5 * 1024 * 1024;
const formats = ['image/png', 'image/jpeg', 'image/webp'];
export function checkImageFile(file: Pick<File, 'size' | 'type'>) {
  if (!formats.includes(file.type)) throw new Error('Choose a PNG, JPEG or WebP image. SVG and GIF files are not supported.');
  if (!file.size || file.size > imageImportBytes) throw new Error('Choose an image up to 5 MB. Your current background is unchanged.');
}
/** Re-encode pixels: no remote URL, SVG, original metadata or filename is stored. */
export async function importStudioImage(file: File): Promise<string> {
  checkImageFile(file);
  const url = URL.createObjectURL(file), image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve(); image.onerror = () => reject(new Error('That image could not be read. Try another PNG, JPEG or WebP file.'));
      image.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 16000000 || Math.max(image.naturalWidth, image.naturalHeight) > 8192) throw new Error('Choose an image no larger than 16 megapixels and 8,192 pixels on either side.');
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Image import is unavailable in this browser. Try a different browser.');
    // Bounded attempts keep project saves and recovery backups small. Never silently crop.
    for (const edge of [768, 512, 384]) {
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [.8, .6, .4]) {
        const data = canvas.toDataURL('image/jpeg', quality);
        if (importedImage.safeParse(data).success) return data;
      }
    }
    throw new Error('This image is too detailed to fit in a private project. Try a simpler or smaller image.');
  } finally { image.onload = null; image.onerror = null; image.src = ''; URL.revokeObjectURL(url); }
}
