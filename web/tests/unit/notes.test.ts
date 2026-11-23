import { describe, expect, it } from 'vitest';
import { detectNoteFileType, normalizeNoteMime } from '@/lib/notes';
import { formatBytes } from '@/lib/format';

describe('detectNoteFileType', () => {
  it('detects PDF files by header and extension', () => {
    const pdfBuffer = Buffer.from('%PDF-1.5 some pdf content');
    expect(detectNoteFileType('anatomy_notes.pdf', 'application/pdf', pdfBuffer)).toBe('PDF');
    expect(detectNoteFileType('notes.PDF', '', pdfBuffer)).toBe('PDF');
  });

  it('detects DOCX files by zip signature and extension', () => {
    // ZIP magic bytes: PK\x03\x04
    const docxBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    expect(detectNoteFileType('pharmacology.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', docxBuffer)).toBe('DOCX');
  });

  it('detects legacy DOC files by OLE container signature and extension', () => {
    // OLE compound document magic bytes: D0 CF 11 E0
    const docBuffer = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1]);
    expect(detectNoteFileType('microbiology.doc', 'application/msword', docBuffer)).toBe('DOC');
  });

  it('rejects unsupported extensions or corrupt files', () => {
    const exeBuffer = Buffer.from('MZ random executable');
    expect(detectNoteFileType('malware.exe', 'application/octet-stream', exeBuffer)).toBeNull();

    const imageBuffer = Buffer.from('\x89PNG\r\n\x1a\n');
    expect(detectNoteFileType('diagram.png', 'image/png', imageBuffer)).toBeNull();
  });
});

describe('normalizeNoteMime', () => {
  it('returns canonical MIME types for each supported file type', () => {
    expect(normalizeNoteMime('PDF', 'application/octet-stream')).toBe('application/pdf');
    expect(normalizeNoteMime('DOCX', 'application/octet-stream')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(normalizeNoteMime('DOC', 'application/octet-stream')).toBe('application/msword');
  });
});

describe('formatBytes', () => {
  it('formats various byte sizes into human readable strings', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(null)).toBe('0 B');
    expect(formatBytes(undefined)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(5.5 * 1024 * 1024)).toBe('5.5 MB');
    expect(formatBytes(50 * 1024 * 1024)).toBe('50.0 MB');
  });
});
