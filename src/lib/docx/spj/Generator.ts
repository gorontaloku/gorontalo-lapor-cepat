import {
    Document,
    Paragraph,
    Packer
} from "docx";

export async function generateSPJWord(data:any){

    const doc = new Document({
        sections:[
            {
                children:[
                    new Paragraph("LAPORAN KEGIATAN")
                ]
            }
        ]
    });

    return await Packer.toBlob(doc);
}