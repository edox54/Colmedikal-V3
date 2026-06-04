import { jsPDF } from 'jspdf';

interface PDFDependant {
  relation: string;
  age: number;
}

interface PDFGeneratorOptions {
  leadCode: string;
  fullName: string;
  email: string;
  phone: string;
  docNumber: string;
  docType: string;
  planName: string;
  basePrice: number;
  finalPrice: number;
  province: string;
  coverageStartDate: string;
  dependents: PDFDependant[];
  hospitalNetwork: string;
  maxCoverage: string;
  dedHosp: string;
  signatureText?: string;
  features: string[];
}

/**
 * Generates a high-quality, professional PDF document representing the official Colmedikal quotation.
 */
export function generateQuotePDF(options: PDFGeneratorOptions): jsPDF {
  // Create PDF on A4 sheet
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Color Palette Definitions
  const NAVY = '#0C4169';
  const LIGHT_BLUE = '#E6F0F6';
  const STEEL_MUTED = '#4597CA';
  const TEXT_DARK = '#1C2E3C';
  const TEXT_MUTED = '#5C6C7C';
  const SUCCESS_GREEN = '#10B981';

  // HELPER Functions
  const drawHeader = () => {
    // Top Accent Bar
    doc.setFillColor(12, 65, 105); // NAVY
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Branding text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Colmedikal', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(190, 220, 240);
    doc.text('MEDICINA PREPAGADA DE EXCELENCIA S.A.', 15, 24);

    // Document Subject Badge
    doc.setFillColor(69, 151, 202); // STEEL_MUTED
    doc.rect(pageWidth - 85, 12, 70, 16, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('COTIZACIÓN CERTIFICADA', pageWidth - 80, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(240, 248, 255);
    doc.text(`CUC: ${options.leadCode}-SECURE`, pageWidth - 80, 24);
  };

  const drawFooter = () => {
    // Light accent bar
    doc.setFillColor(241, 245, 249);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Colmedikal - Sede Principal: Av. de la República E6-447 y El Jardín, Quito - Ecuador.', 15, pageHeight - 9);
    doc.text('Superintendencia de Compañías del Ecuador Registro Reg: 923-CO. Teléfono: 1800-COLMED.', 15, pageHeight - 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Página 1 de 1', pageWidth - 30, pageHeight - 7);
  };

  // 1. Setup Header & Footer template
  drawHeader();
  drawFooter();

  // 2. Client Particulars Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 65, 105);
  doc.text('1. DATOS DEL CONTRAYENTE TITULAR', 15, 52);

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 54, pageWidth - 15, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(28, 46, 60); // TEXT_DARK

  // Column 1
  doc.text(`Asegurado Titular:`, 15, 61);
  doc.setFont('helvetica', 'bold');
  doc.text(options.fullName, 48, 61);

  doc.setFont('helvetica', 'normal');
  doc.text(`${options.docType.toUpperCase()}:`, 15, 67);
  doc.text(options.docNumber, 48, 67);

  doc.text(`Provincia Residencia:`, 15, 73);
  doc.text(options.province, 48, 73);

  // Column 2
  doc.text(`Correo Electrónico:`, 110, 61);
  doc.text(options.email, 142, 61);

  doc.text(`Teléfono Celular:`, 110, 67);
  doc.text(options.phone, 142, 67);

  doc.text(`Inicio de Cobertura:`, 110, 73);
  const formattedDate = options.coverageStartDate 
    ? new Date(options.coverageStartDate).toLocaleDateString('es-EC', {day: '2-digit', month: 'long', year: 'numeric'})
    : new Date().toLocaleDateString('es-EC', {day: '2-digit', month: 'long', year: 'numeric'});
  doc.text(formattedDate, 142, 73);

  // 3. Dependent List (if any)
  if (options.dependents && options.dependents.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Beneficiarios Familiares Adicionales:', 15, 82);
    
    doc.setFont('helvetica', 'normal');
    let xOffset = 15;
    options.dependents.forEach((dep, index) => {
      const depText = `[Familiar] ${dep.relation} (${dep.age} años)`;
      doc.text(depText, xOffset, 87);
      xOffset += 50 + (depText.length * 0.4);
    });
  }

  // Divider Line
  doc.line(15, 93, pageWidth - 15, 93);

  // 4. Proposed Health coverage Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 65, 105);
  doc.text('2. PLAN MÉDICO E INFORME DE COBERTURAS', 15, 101);

  doc.line(15, 103, pageWidth - 15, 103);

  // Proposed coverage box styled background
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 108, pageWidth - 30, 48, 'F');
  
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, 108, pageWidth - 30, 48, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(12, 65, 105);
  doc.text(`Programa Cobertura Seleccionada: ${options.planName} de Red Directa`, 20, 115);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(28, 46, 60);

  doc.text('Límite General Hospitalario:', 20, 122);
  doc.setFont('helvetica', 'bold');
  doc.text(`${options.maxCoverage} por evento por asegurado`, 70, 122);

  doc.setFont('helvetica', 'normal');
  doc.text('Red Clínicas Asociadas:', 20, 128);
  doc.setFont('helvetica', 'bold');
  doc.text(options.hospitalNetwork, 70, 128);

  doc.setFont('helvetica', 'normal');
  doc.text('Deducible Anual en Hospital:', 20, 134);
  doc.setFont('helvetica', 'bold');
  doc.text(options.dedHosp, 70, 134);

  doc.setFont('helvetica', 'normal');
  doc.text('Copago en Citas Médicas:', 20, 140);
  doc.setFont('helvetica', 'bold');
  doc.text('$15.00 USD pago de copago fijo directo en red ágil', 70, 140);

  doc.setFont('helvetica', 'normal');
  doc.text('Cobertura en Medicamentos:', 20, 146);
  doc.setFont('helvetica', 'bold');
  doc.text('100% de cobertura (Fybeca, Medicity, Sana Sana o Económicas)', 70, 146);

  // 5. Plan Benefits Highlights
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(12, 65, 105);
  doc.text('Beneficios Claves de Cobertura Complementaria:', 15, 163);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 90);

  let bulletY = 169;
  options.features.slice(0, 4).forEach((feat) => {
    doc.setFillColor(16, 185, 129); // Green bullets
    doc.circle(18, bulletY - 1, 1.2, 'F');
    doc.setTextColor(28, 46, 60);
    doc.text(feat, 22, bulletY);
    bulletY += 5.5;
  });

  // Divider
  doc.line(15, 195, pageWidth - 15, 195);

  // 6. Cost summary Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 65, 105);
  doc.text('3. DETALLE DE APORTES MENSUALES Y FISCALIDAD', 15, 203);

  doc.line(15, 205, pageWidth - 15, 205);

  // Visual layout for quote cost
  doc.setFillColor(230, 240, 246); // LIGHT_BLUE background
  doc.setDrawColor(190, 215, 230);
  doc.rect(15, 210, pageWidth - 30, 20, 'F');
  doc.rect(15, 210, pageWidth - 30, 20, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(12, 65, 105);
  doc.text('APORTE MENSUAL TOTAL PROPUESTO:', 20, 222);

  doc.setFontSize(16);
  doc.setTextColor(12, 65, 105);
  doc.text(`$${options.finalPrice.toFixed(2)} USD`, 105, 222.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Este valor incluye todos los impuestos gubernamentales, tasas del reaseguro internacional y descuentos de red aplicados.', 20, 227);

  // 7. Signature / Certification Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(12, 65, 105);
  doc.text('4. DECLARACIÓN JURAMENTADA DE SALUD Y CONSENTIMIENTO', 15, 238);
  doc.line(15, 240, pageWidth - 15, 240);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Declaro bajo la gravedad del juramento que todos los datos consignados en esta suscripción digital son verdaderos y fidedignos.', 15, 244);
  doc.text('Ratifico conocer los periodos obligatorios de carencia (30 días para atención ambulatoria, 90 días para hospitalización y maternidad).', 15, 247.5);

  // Draw signature line or visual simulated signature
  if (options.signatureText) {
    doc.setDrawColor(12, 65, 105);
    doc.setLineWidth(0.3);
    doc.line(15, 263, 85, 263);

    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(12, 65, 105);
    doc.text(options.signatureText, 25, 259);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Firma Digital del Propitente Afiliado', 15, 267);
    doc.text(`C.I. ${options.docNumber}`, 15, 270.5);
  }

  // Draw official verification seal
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.rect(pageWidth - 65, 245, 50, 22, 'D');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(16, 185, 129);
  doc.text('COLMEDIKAL S.A.', pageWidth - 60, 250);
  doc.text('VALIDADO ELECTRÓNICAMENTE', pageWidth - 60, 253.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`CÓDIGO: CLM-${options.leadCode}`, pageWidth - 60, 257);
  doc.text(`FECHA: ${new Date().toLocaleDateString()}`, pageWidth - 60, 260.5);
  doc.text('ESTADO: SUSCRIPCION PENDIENTE', pageWidth - 60, 264);

  // Download Action
  doc.save(`Colmedikal_Cotizacion_${options.leadCode}.pdf`);

  return doc;
}
