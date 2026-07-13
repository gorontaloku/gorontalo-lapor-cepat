import {
  ImageRun,
  Paragraph,
  AlignmentType,
} from "docx";

import { bab } from "./Builder";
import { Dokumentasi } from "@/components/spj/Dokumentasi";

export function Lampiran({
  images,
}: {
  images: Uint8Array[];
}) {
  const children: any[] = [];

  children.push(
    ...Dokumentasi("DOKUMENTASI KEGIATAN")
  );

  images.forEach((img, index) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 300,
          after: 120,
        },
        children: [
          new ImageRun({
            data: img,
            transformation: {
              width: 500,
              height: 350,
            },
          }),
        ],
      })
    );
  });

  return children;
}