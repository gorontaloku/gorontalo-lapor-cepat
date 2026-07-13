import {
  Paragraph,
  HeadingLevel,
  AlignmentType,
} from "docx";

export function Bab5(data: any) {
  return [

    new Paragraph({
      text: "PENGESAHAN",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),

    new Paragraph(""),

    new Paragraph({
      text: data.instansi ?? "BADAN NARKOTIKA NASIONAL KABUPATEN GORONTALO",
      alignment: AlignmentType.RIGHT,
    }),

    new Paragraph(""),

    new Paragraph({
      text: data.kepala ?? "",
      alignment: AlignmentType.RIGHT,
    }),

    new Paragraph(""),

    new Paragraph(""),

    new Paragraph(""),

    new Paragraph({
      text: data.pejabat ?? "",
      alignment: AlignmentType.RIGHT,
    }),

  ];
}