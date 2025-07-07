package com.backend.qu2data.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    public byte[] generateOfferPdf(String fullName, String company, String offerContent) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        document.add(new Paragraph("Offre commerciale", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18)));
        document.add(new Paragraph(" "));
        document.add(new Paragraph("Client : " + fullName));
        document.add(new Paragraph("Société : " + company));
        document.add(new Paragraph("Date : " + java.time.LocalDate.now()));
        document.add(new Paragraph(" "));
        document.add(new Paragraph("Détail de l’offre :"));
        document.add(new Paragraph(offerContent));

        document.close();
        return out.toByteArray();
    }
}
