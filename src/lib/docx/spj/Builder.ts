import {
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  PageBreak,
} from "docx";

export const FONT = "Arial";

export const SIZE = {
  NORMAL: 24, // 12 pt
  SUBTITLE: 26, // 13 pt
  TITLE: 28, // 14 pt
  COVER: 32, // 16 pt
};

/**
 * Paragraph biasa
 */
export function paragraph(
  text: string,
  options?: {
    bold?: boolean;
    center?: boolean;
    justify?: boolean;
    firstLine?: boolean;
    spacingAfter?: number;
    spacingBefore?: number;
    line?: number;
    size?: number;
  }
) {
  return new Paragraph({
    alignment: options?.center
      ? AlignmentType.CENTER
      : options?.justify
      ? AlignmentType.JUSTIFIED
      : AlignmentType.LEFT,

    spacing: {
      before: options?.spacingBefore ?? 0,
      after: options?.spacingAfter ?? 150,
      line: options?.line ?? 360, // 1.5 spasi
    },

    indent: options?.firstLine
      ? {
          firstLine: 720,
        }
      : undefined,

    children: [
      new TextRun({
        text,
        font: FONT,
        bold: options?.bold ?? false,
        size: options?.size ?? SIZE.NORMAL,
      }),
    ],
  });
}

/**
 * Judul BAB
 */
export function bab(judul: string, subjudul: string) {
  return [
    paragraph(judul, {
      bold: true,
      center: true,
      spacingAfter: 80,
      line: 240,
      size: SIZE.TITLE,
    }),

    paragraph(subjudul, {
      bold: true,
      center: true,
      spacingAfter: 300,
      line: 240,
      size: SIZE.TITLE,
    }),
  ];
}

/**
 * Sub BAB
 */
export function subBab(text: string) {
  return paragraph(text, {
    bold: true,
    spacingBefore: 250,
    spacingAfter: 150,
    line: 240,
  });
}

/**
 * Isi paragraf
 */
export function isi(text: string) {
  return paragraph(text ?? "", {
    justify: true,
    firstLine: true,
  });
}

/**
 * List bernomor
 */
export function nomor(items: string[]) {
  return items.map(
    (item, index) =>
      new Paragraph({
        spacing: {
          after: 120,
          line: 360,
        },
        indent: {
          left: 360,
        },
        children: [
          new TextRun({
            text: `${index + 1}. ${item}`,
            font: FONT,
            size: SIZE.NORMAL,
          }),
        ],
      })
  );
}

/**
 * Page Break
 */
export function pageBreak() {
  return new Paragraph({
    children: [new PageBreak()],
  });
}