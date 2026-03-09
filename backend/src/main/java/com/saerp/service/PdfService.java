package com.saerp.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.saerp.dto.ExamDtos;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfService {

    public byte[] generateResultPdf(String studentName, String registerNumber,
                                    List<ExamDtos.ResultDTO> results) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            Document doc = new Document(PageSize.A4);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // Title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.DARK_GRAY);
            Font subFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, BaseColor.DARK_GRAY);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
            Font cellFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);

            Paragraph title = new Paragraph("SAERP - Examination Result", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);
            doc.add(new Paragraph("Secure Anonymous Examination Result Portal", subFont) {{
                setAlignment(Element.ALIGN_CENTER);
            }});
            doc.add(Chunk.NEWLINE);

            // Student info
            doc.add(new Paragraph("Student Name: " + studentName, subFont));
            doc.add(new Paragraph("Register Number: " + registerNumber, subFont));
            doc.add(new Paragraph("Generated: " + LocalDateTime.now().toString(), subFont));
            doc.add(Chunk.NEWLINE);

            // Table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 1.5f, 1.5f, 1, 1});

            String[] headers = {"Subject", "Marks", "Max Marks", "Grade", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new BaseColor(52, 73, 94));
                cell.setPadding(8);
                table.addCell(cell);
            }

            for (ExamDtos.ResultDTO r : results) {
                table.addCell(new PdfPCell(new Phrase(r.getSubject(), cellFont)) {{ setPadding(6); }});
                table.addCell(new PdfPCell(new Phrase(r.getMarks().toString(), cellFont)) {{ setPadding(6); }});
                table.addCell(new PdfPCell(new Phrase(r.getMaxMarks().toString(), cellFont)) {{ setPadding(6); }});
                table.addCell(new PdfPCell(new Phrase(r.getGrade(), cellFont)) {{ setPadding(6); }});
                BaseColor statusColor = "PASS".equals(r.getStatus()) ? new BaseColor(39, 174, 96) : new BaseColor(231, 76, 60);
                PdfPCell statusCell = new PdfPCell(new Phrase(r.getStatus(),
                        new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, statusColor)));
                statusCell.setPadding(6);
                table.addCell(statusCell);
            }
            doc.add(table);

            doc.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph("This is a digitally generated result. Verify at saerp.edu", subFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
        } catch (Exception e) {
            log.error("PDF generation error: {}", e.getMessage());
            throw new RuntimeException("PDF generation failed", e);
        }
        return baos.toByteArray();
    }
}
