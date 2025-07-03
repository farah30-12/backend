package com.backend.qu2data.service;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.backend.qu2data.entites.AttachmentDTO;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendQualificationEmail(String to, String firstName, String companyName) {
        String subject = "Confirmation d'intérêt - " + companyName;
        String text = String.format(
            "Bonjour %s,\n\nMerci pour votre intérêt.\n" +
            "Pourriez-vous nous donner plus d'infos sur votre budget, échéance et vos besoins ?\n\n" +
            "Cordialement,\nVotre équipe",
            firstName
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("farah.dridi2222@gmail.com");

        mailSender.send(message);
    }
   /* public void sendOfferEmailWithPdf(String to, String fullName, String company, byte[] pdfContent) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("📄 Votre proposition commerciale - " + company);
        helper.setText("Bonjour " + fullName + ",\n\nVeuillez trouver ci-joint notre offre.\n\nCordialement,\nL’équipe " + company);
        helper.setFrom("ton.email@gmail.com");

        helper.addAttachment("offre.pdf", new ByteArrayResource(pdfContent));

        mailSender.send(message);
    }*/
    public void sendOfferEmailWithPdf(String to, String fullName, String company, List<AttachmentDTO> attachments) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("📄 Offre personnalisée - " + company);
        helper.setText("Bonjour " + fullName + ",\n\nVeuillez trouver ci-joint votre document personnalisé.");

        for (AttachmentDTO file : attachments) {
            helper.addAttachment(file.getFilename(), new ByteArrayResource(file.getFileBytes()));
        }

        mailSender.send(message);
    }

    public void sendClosingEmailWithFile(String to, String clientName, String company, List<AttachmentDTO> files) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject("✅ Finalisation du contrat - " + company);
        helper.setFrom("ton.email@gmail.com");

        String body = "<p>Bonjour <strong>" + clientName + "</strong>,</p>"
                    + "<p>Merci pour votre confiance. Votre contrat est signé, et le service est activé.</p>"
                    + "<p>📎 Veuillez trouver ci-joint le(s) document(s) final(aux).</p>"
                    + "<p>Cordialement,<br>L'équipe " + company + "</p>";

        helper.setText(body, true);

        for (AttachmentDTO file : files) {
            helper.addAttachment(file.getFilename(), new ByteArrayResource(file.getFileBytes()));
        }

        mailSender.send(message);
    }
   /* public void sendEmailWithAttachments(String to, String subject, String htmlBody, String sender, List<AttachmentDTO> attachments) throws Exception {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // HTML
        helper.setFrom(sender != null ? sender : "noreply@qu2data.com");

        for (AttachmentDTO att : attachments) {
            helper.addAttachment(att.getFileName(), new ByteArrayResource(att.getFileData()));
        }

        javaMailSender.send(message);
    }
}

*/

}