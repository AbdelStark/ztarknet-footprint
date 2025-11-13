import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const BACKGROUND = '#0B0E0C';

export async function exportNodeAsPng(
  node: HTMLElement | null,
  fileName = 'ztarknet-footprint.png',
): Promise<void> {
  if (!node) return;
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor: BACKGROUND,
  });
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

export async function exportNodeAsPdf(
  node: HTMLElement | null,
  fileName = 'ztarknet-footprint.pdf',
): Promise<void> {
  if (!node) return;
  const rect = node.getBoundingClientRect();
  const width = rect.width || node.scrollWidth || 800;
  const height = rect.height || node.scrollHeight || 600;
  const dataUrl = await toPng(node, {
    cacheBust: true,
    backgroundColor: BACKGROUND,
    width,
    height,
  });
  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [height, width],
  });
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  pdf.save(fileName);
}
