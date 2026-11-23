import type { NoteFileType } from '@/types';

export const MAX_NOTE_BYTES = 50 * 1024 * 1024; // 50 MB

export const COMMON_NOTE_SUBJECTS = [
  'Anatomy & Physiology',
  'Pharmacology',
  'Medical-Surgical Nursing',
  'Community Health Nursing',
  'Pediatric / Child Health',
  'Obstetrics & Gynecology (OBG)',
  'Mental Health / Psychiatric',
  'Nursing Foundations',
  'Microbiology',
  'Nutrition & Biochemistry',
  'Nursing Research & Statistics',
  'Nursing Management & Leadership',
] as const;

export function detectNoteFileType(filename: string, mime: string, buffer: Buffer | Uint8Array): NoteFileType | null {
  const ext = filename.toLowerCase().split('.').pop() ?? '';

  if (ext === 'pdf') {
    if (buffer.length >= 5) {
      const header = Buffer.isBuffer(buffer)
        ? buffer.subarray(0, 5).toString('latin1')
        : new TextDecoder('latin1').decode(buffer.subarray(0, 5));
      if (header === '%PDF-') return 'PDF';
    }
    if (mime.toLowerCase().includes('pdf')) return 'PDF';
  }

  if (ext === 'docx') {
    // Standard ZIP archive header (PK\x03\x04) used by OOXML (.docx)
    if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) return 'DOCX';
    if (
      mime.includes('wordprocessingml') ||
      mime.includes('vnd.openxmlformats') ||
      mime.includes('application/octet-stream')
    ) {
      return 'DOCX';
    }
  }

  if (ext === 'doc') {
    // OLE Compound File header (D0 CF 11 E0) used by legacy Word (.doc)
    if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) return 'DOC';
    if (mime.includes('msword') || mime.includes('application/octet-stream')) return 'DOC';
  }

  return null;
}

export function normalizeNoteMime(fileType: NoteFileType, reportedMime: string): string {
  switch (fileType) {
    case 'PDF':
      return 'application/pdf';
    case 'DOCX':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'DOC':
      return 'application/msword';
    default:
      return reportedMime || 'application/octet-stream';
  }
}
