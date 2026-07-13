import {
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

import { bab, paragraph } from "./Builder";
import { formatHariTanggal } from "@/lib/format";

export function Bab2({ laporan }: any) {
  const tempat = laporan.tempat ?? [];
  const pelaksana = laporan.pelaksana ?? [];
  const dd = laporan.data_dinamis ?? {};

  const rows: TableRow[] = [];

  rows.push(
    new TableRow({
      children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          children: [paragraph("Hari / Tanggal")],
        }),

        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          children: [
            paragraph(`: ${formatHariTanggal(laporan.tanggal)}`),
          ],
        }),
      ],
    })
  );

  if (laporan.jam) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph("Pukul")],
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph(`: ${laporan.jam}`)],
          }),
        ],
      })
    );
  }

  rows.push(
    new TableRow({
      children: [
        new TableCell({
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          children: [paragraph("Tempat")],
        }),
        new TableCell({
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          children: [
            paragraph(`: ${tempat.join(", ")}`),
          ],
        }),
      ],
    })
  );

  if (dd.narasumber) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph("Narasumber")],
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph(`: ${dd.narasumber}`)],
          }),
        ],
      })
    );
  }

  if (dd.materi) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph("Materi")],
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph(`: ${dd.materi}`)],
          }),
        ],
      })
    );
  }

  if (dd.jumlah_peserta) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph("Jumlah Peserta")],
          }),
          new TableCell({
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [paragraph(`: ${dd.jumlah_peserta}`)],
          }),
        ],
      })
    );
  }

  const petugasRows = pelaksana.map(
  (p: any, i: number) =>
    new TableRow({
      children: [
        new TableCell({
          width: {
            size: 8,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
          },
          children: [
            paragraph(`${i + 1}.`),
          ],
        }),

        new TableCell({
          width: {
            size: 57,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
          },
          children: [
            paragraph(
              `${p.nama}${p.gelar ? ", " + p.gelar : ""}`
            ),
          ],
        }),

        new TableCell({
          width: {
            size: 35,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.NONE, size: 0 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
          },
          children: [
            paragraph("(................................)", {
              center: true,
            }),
          ],
        }),
      ],
    })
);

  return [
    ...bab("BAB II", "PELAKSANAAN"),

    paragraph("D. MEKANISME KEGIATAN", {
      bold: true,
      spacingBefore: 200,
    }),

    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows,
    }),

    paragraph("E. ANGGARAN BIAYA", {
      bold: true,
      spacingBefore: 250,
    }),

    paragraph(
      `Kegiatan ini didukung melalui sumber dana ${laporan.sumber_dana ?? "-"}.`,
      {
        firstLine: true,
        justify: true,
      }
    ),

    paragraph("F. SUSUNAN KOORDINATOR KEGIATAN", {
      bold: true,
      spacingBefore: 250,
    }),

    paragraph("Adapun petugasnya adalah :", {
      firstLine: true,
    }),

    new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },

        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: {
            style: BorderStyle.NONE,
            size: 0,
            color: "FFFFFF",
          },
          insideVertical: {
            style: BorderStyle.NONE,
            size: 0,
            color: "FFFFFF",
          },
        },

        rows: petugasRows,
    }),
  ];
}