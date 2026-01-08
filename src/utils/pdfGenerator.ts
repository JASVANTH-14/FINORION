import jsPDF from 'jspdf';
import { ScreeningResult } from '../lib/supabase';

export function generatePDFReport(result: ScreeningResult, logoUrl?: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFillColor(17, 40, 54);
  doc.rect(0, 0, pageWidth, 40, 'F');

  if (logoUrl && logoUrl.startsWith('data:image')) {
    try {
      doc.addImage(logoUrl, 'PNG', pageWidth - 45, 5, 30, 30);
    } catch (e) {
      console.error('Failed to add logo to PDF:', e);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('FINORION', 15, 25);
  doc.setFontSize(12);
  doc.text('Sanction Screening Report', 15, 33);

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date(result.screening_timestamp).toLocaleString()}`, 15, yPosition);
  doc.text(`IP Address: ${result.device_ip}`, pageWidth - 80, yPosition);

  yPosition += 15;

  doc.setFontSize(16);
  doc.setTextColor(17, 40, 54);
  doc.text('Customer Information', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${result.customer_name}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Country: ${result.customer_country}`, 20, yPosition);
  yPosition += 15;

  doc.setFontSize(16);
  doc.setTextColor(17, 40, 54);
  doc.text('Risk Assessment', 15, yPosition);
  yPosition += 8;

  const riskColor =
    result.overall_risk_level === 'critical' ? [220, 38, 38] :
    result.overall_risk_level === 'high' ? [234, 88, 12] :
    result.overall_risk_level === 'medium' ? [250, 204, 21] :
    [34, 197, 94];

  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(20, yPosition - 5, 60, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`${result.overall_risk_level.toUpperCase()}`, 25, yPosition + 2);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Risk Level: ${result.risk_percentage.toFixed(2)}%`, 90, yPosition + 2);

  yPosition += 15;

  doc.setFontSize(11);
  doc.text(`Name Similarity Score: ${result.similarity_score.toFixed(2)}%`, 20, yPosition);
  yPosition += 7;
  doc.text(`Country Risk Score: ${result.country_risk_score.toFixed(2)}`, 20, yPosition);
  yPosition += 15;

  if (Array.isArray(result.matched_entities) && result.matched_entities.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(17, 40, 54);
    doc.text('Matched Entities', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const matches = result.matched_entities as Array<{
      name: string;
      type: string;
      country: string;
      sanction_list: string;
      risk_level: string;
      match_score: number;
    }>;

    matches.slice(0, 5).forEach((match, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(17, 40, 54);
      doc.text(`${index + 1}. ${match.name}`, 20, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`   Type: ${match.type} | Country: ${match.country}`, 20, yPosition);
      yPosition += 5;
      doc.text(`   List: ${match.sanction_list} | Match: ${match.match_score.toFixed(1)}%`, 20, yPosition);
      yPosition += 8;
    });
  }

  yPosition += 5;

  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(17, 40, 54);
  doc.text('AI Explanation', 15, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const explanation = result.ai_explanation || '';
  const lines = doc.splitTextToSize(explanation, pageWidth - 30);

  lines.forEach((line: string) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    doc.text(line, 15, yPosition);
    yPosition += 5;
  });

  const amlFlags = result.aml_flags as Array<{
    type: string;
    description: string;
    severity: string;
  }>;

  if (Array.isArray(amlFlags) && amlFlags.length > 0) {
    yPosition += 10;

    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(17, 40, 54);
    doc.text('AML Flags', 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    amlFlags.forEach((flag) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      const flagColor =
        flag.severity === 'critical' ? [220, 38, 38] :
        flag.severity === 'high' ? [234, 88, 12] :
        flag.severity === 'medium' ? [250, 204, 21] :
        [100, 100, 100];

      doc.setFillColor(flagColor[0], flagColor[1], flagColor[2]);
      doc.circle(18, yPosition - 1, 2, 'F');

      doc.text(`[${flag.severity.toUpperCase()}] ${flag.description}`, 23, yPosition);
      yPosition += 7;
    });
  }

  const fileName = `finorion_report_${result.customer_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
}
