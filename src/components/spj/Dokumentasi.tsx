import {
  Paragraph,
  HeadingLevel,
  AlignmentType,
} from "docx";

export function Dokumentasi(data: any) {

  return [

    new Paragraph({
      text: "DOKUMENTASI KEGIATAN",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),

    new Paragraph(""),

  ];

}