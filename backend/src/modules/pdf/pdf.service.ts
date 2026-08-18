import PDFDocument from 'pdfkit';
import { db, schema, eq } from '@asthiwar/database';

export class PdfGenerationError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'PdfGenerationError';
  }
}

// Currency Formatter Helper (Indian Rupee Numbering Format)
function formatINR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs. 0';
  return 'Rs. ' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export async function generateEstimatePdf(estimateNumberOrId: string): Promise<Buffer> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(estimateNumberOrId);

  const estimate = await db.query.estimates.findFirst({
    where: isUuid
      ? eq(schema.estimates.id, estimateNumberOrId)
      : eq(schema.estimates.estimateNumber, estimateNumberOrId),
  });

  if (!estimate) {
    throw new PdfGenerationError(404, 'ESTIMATE_NOT_FOUND', `Estimate ${estimateNumberOrId} not found`);
  }

  // Fetch items and addons
  const items = await db.query.estimateItems.findMany({
    where: eq(schema.estimateItems.estimateId, estimate.id),
  });

  const addons = await db.query.estimateAddons.findMany({
    where: eq(schema.estimateAddons.estimateId, estimate.id),
  });

  const milestones = (estimate.milestoneBreakdownJson as any[]) || [];

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Color Palette
      const PRIMARY = '#1E3A8A'; // Deep Indigo / Brand Blue
      const SECONDARY = '#0F766E'; // Teal Accent
      const DARK = '#1F2937'; // Slate Text
      const LIGHT_BG = '#F3F4F6';
      const BORDER_COLOR = '#E5E7EB';
      const GOLD = '#D97706';

      // ----------------------------------------------------
      // HEADER & BRANDING
      // ----------------------------------------------------
      doc.rect(0, 0, doc.page.width, 100).fill(PRIMARY);

      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22);
      doc.text('ASTHIWAR DESIGN & BUILD', 40, 28);

      doc.font('Helvetica').fontSize(9).fillColor('#E0E7FF');
      doc.text('Turnkey Residential Construction & Architectural Engineering', 40, 54);
      doc.text('Tamil Nadu (Coimbatore | Chennai | Tiruppur | Erode | Pollachi)', 40, 68);

      // Estimate Badge on Right Header
      doc.roundedRect(doc.page.width - 210, 24, 170, 54, 4).fill('#1E293B');
      doc.fillColor('#FBBF24').font('Helvetica-Bold').fontSize(9).text('ESTIMATE QUOTATION', doc.page.width - 200, 32);
      doc.fillColor('#FFFFFF').fontSize(11).text(estimate.estimateNumber, doc.page.width - 200, 46);
      doc.fillColor('#94A3B8').fontSize(8).text(`Date: ${new Date(estimate.createdAt).toLocaleDateString('en-IN')}`, doc.page.width - 200, 62);

      doc.y = 115;

      // ----------------------------------------------------
      // CLIENT & PROJECT DETAILS CARD
      // ----------------------------------------------------
      const startY = doc.y;
      doc.roundedRect(40, startY, doc.page.width - 80, 85, 4).strokeColor(BORDER_COLOR).fillAndStroke(LIGHT_BG, BORDER_COLOR);

      // Left Column: Client Details
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(10).text('CLIENT INFORMATION', 55, startY + 10);
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text('Name: ', 55, startY + 28);
      doc.font('Helvetica').text(estimate.customerName, 100, startY + 28);
      doc.font('Helvetica-Bold').text('Phone: ', 55, startY + 44);
      doc.font('Helvetica').text(estimate.customerPhone, 100, startY + 44);
      doc.font('Helvetica-Bold').text('Email: ', 55, startY + 60);
      doc.font('Helvetica').text(estimate.customerEmail, 100, startY + 60);

      // Right Column: Project Dimension
      const col2X = 320;
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(10).text('PROJECT SPECIFICATIONS', col2X, startY + 10);
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text('Location: ', col2X, startY + 28);
      doc.font('Helvetica').text(`${estimate.plotLocation} (${estimate.locationMultiplier}x Multiplier)`, col2X + 75, startY + 28);
      doc.font('Helvetica-Bold').text('Floors: ', col2X, startY + 44);
      doc.font('Helvetica').text(`${estimate.floorCount} | Plot: ${estimate.plotAreaSqft} sq.ft`, col2X + 75, startY + 44);
      doc.font('Helvetica-Bold').text('Total Built-up: ', col2X, startY + 60);
      doc.font('Helvetica-Bold').fillColor(GOLD).text(`${estimate.totalBuiltupAreaSqft} sq.ft`, col2X + 75, startY + 60);

      doc.y = startY + 100;

      // ----------------------------------------------------
      // PACKAGE & COST BREAKDOWN
      // ----------------------------------------------------
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(12).text('1. PACKAGE & BASE CONSTRUCTION COST', 40, doc.y);
      doc.y += 6;

      const pkgTableY = doc.y;
      doc.rect(40, pkgTableY, doc.page.width - 80, 22).fill(SECONDARY);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      doc.text('Package Tier', 50, pkgTableY + 6);
      doc.text('Built-up Area', 220, pkgTableY + 6);
      doc.text('Effective Rate / Sq.Ft', 340, pkgTableY + 6);
      doc.text('Base Amount', doc.page.width - 130, pkgTableY + 6, { align: 'right', width: 80 });

      const pkgRowY = pkgTableY + 24;
      doc.rect(40, pkgRowY, doc.page.width - 80, 24).fill('#FAFAFA').strokeColor(BORDER_COLOR).stroke();
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9);
      doc.text(estimate.packageSlug.toUpperCase() + ' PACKAGE', 50, pkgRowY + 7);
      doc.font('Helvetica').text(`${estimate.totalBuiltupAreaSqft} sq.ft`, 220, pkgRowY + 7);
      doc.text(formatINR(estimate.packageRatePerSqft) + ' / sq.ft', 340, pkgRowY + 7);
      doc.font('Helvetica-Bold').text(formatINR(estimate.baseConstructionCost), doc.page.width - 130, pkgRowY + 7, { align: 'right', width: 80 });

      doc.y = pkgRowY + 34;

      // ----------------------------------------------------
      // BRAND CUSTOMIZATIONS / UPGRADES (If any)
      // ----------------------------------------------------
      if (items.length > 0) {
        doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(11).text('2. BRAND CUSTOMIZATIONS & SPECIFICATION UPGRADES', 40, doc.y);
        doc.y += 6;

        const custTableY = doc.y;
        doc.rect(40, custTableY, doc.page.width - 80, 20).fill('#475569');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5);
        doc.text('Item Category', 50, custTableY + 5);
        doc.text('Selected Brand / Option', 220, custTableY + 5);
        doc.text('Unit Delta', 360, custTableY + 5);
        doc.text('Cost Addition', doc.page.width - 130, custTableY + 5, { align: 'right', width: 80 });

        let currentY = custTableY + 20;
        items.forEach((item) => {
          doc.rect(40, currentY, doc.page.width - 80, 20).fill('#FAFAFA').strokeColor(BORDER_COLOR).stroke();
          doc.fillColor(DARK).font('Helvetica').fontSize(8.5);
          doc.text(item.itemName, 50, currentY + 5);
          doc.text(item.selectedOptionName, 220, currentY + 5);
          doc.text(`+${formatINR(item.unitPriceDelta)}/sq.ft`, 360, currentY + 5);
          doc.font('Helvetica-Bold').text(formatINR(item.calculatedPrice), doc.page.width - 130, currentY + 5, { align: 'right', width: 80 });
          currentY += 20;
        });

        doc.y = currentY + 10;
      }

      // ----------------------------------------------------
      // ADD-ONS INCLUSIONS (If any)
      // ----------------------------------------------------
      if (addons.length > 0) {
        doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(11).text('3. SELECTED ADD-ONS & INFRASTRUCTURE', 40, doc.y);
        doc.y += 6;

        const addonTableY = doc.y;
        doc.rect(40, addonTableY, doc.page.width - 80, 20).fill('#475569');
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5);
        doc.text('Add-On Name', 50, addonTableY + 5);
        doc.text('Variant / Specification', 220, addonTableY + 5);
        doc.text('Quantity / Unit', 360, addonTableY + 5);
        doc.text('Total Cost', doc.page.width - 130, addonTableY + 5, { align: 'right', width: 80 });

        let currentY = addonTableY + 20;
        addons.forEach((addon) => {
          doc.rect(40, currentY, doc.page.width - 80, 20).fill('#FAFAFA').strokeColor(BORDER_COLOR).stroke();
          doc.fillColor(DARK).font('Helvetica').fontSize(8.5);
          doc.text(addon.addonName, 50, currentY + 5);
          doc.text(addon.selectedVariant.replace(/_/g, ' ').toUpperCase(), 220, currentY + 5);
          doc.text(`${addon.quantity} ${addon.unit}`, 360, currentY + 5);
          doc.font('Helvetica-Bold').text(formatINR(addon.totalPrice), doc.page.width - 130, currentY + 5, { align: 'right', width: 80 });
          currentY += 20;
        });

        doc.y = currentY + 10;
      }

      // ----------------------------------------------------
      // COMMERCIAL SUMMARY BOX
      // ----------------------------------------------------
      const sumBoxY = doc.y;
      doc.roundedRect(doc.page.width - 250, sumBoxY, 210, 70, 4).fillAndStroke('#EFF6FF', PRIMARY);
      doc.fillColor(DARK).font('Helvetica').fontSize(9).text('Base Cost:', doc.page.width - 240, sumBoxY + 10);
      doc.text(formatINR(estimate.baseConstructionCost), doc.page.width - 120, sumBoxY + 10, { align: 'right', width: 70 });

      if (parseFloat(estimate.upgradesCost) > 0) {
        doc.text('Brand Upgrades:', doc.page.width - 240, sumBoxY + 24);
        doc.text(formatINR(estimate.upgradesCost), doc.page.width - 120, sumBoxY + 24, { align: 'right', width: 70 });
      }

      if (parseFloat(estimate.addonsCost) > 0) {
        doc.text('Add-Ons Subtotal:', doc.page.width - 240, sumBoxY + 38);
        doc.text(formatINR(estimate.addonsCost), doc.page.width - 120, sumBoxY + 38, { align: 'right', width: 70 });
      }

      doc.font('Helvetica-Bold').fontSize(11).fillColor(PRIMARY).text('TOTAL PROJECT COST:', doc.page.width - 240, sumBoxY + 54);
      doc.text(formatINR(estimate.totalProjectCost), doc.page.width - 140, sumBoxY + 54, { align: 'right', width: 90 });

      doc.y = sumBoxY + 85;

      // ----------------------------------------------------
      // PAGE 2: 10-STAGE MILESTONE PAYMENT SCHEDULE
      // ----------------------------------------------------
      doc.addPage();

      doc.rect(0, 0, doc.page.width, 45).fill(PRIMARY);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('10-STAGE MILESTONE PAYMENT SCHEDULE', 40, 16);

      doc.y = 60;
      doc.fillColor(DARK).font('Helvetica').fontSize(9).text('Payments are strictly linked to on-site civil completion stages with zero front-loading:', 40, doc.y);
      doc.y += 12;

      const msTableY = doc.y;
      doc.rect(40, msTableY, doc.page.width - 80, 22).fill(SECONDARY);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      doc.text('Stage #', 50, msTableY + 6);
      doc.text('Milestone Description & Work Scope', 110, msTableY + 6);
      doc.text('Share %', 380, msTableY + 6);
      doc.text('Milestone Amount', doc.page.width - 140, msTableY + 6, { align: 'right', width: 90 });

      let msY = msTableY + 22;
      milestones.forEach((m, idx) => {
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
        doc.rect(40, msY, doc.page.width - 80, 22).fill(bg).strokeColor(BORDER_COLOR).stroke();
        doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8.5).text(`Stage ${m.stage || idx + 1}`, 50, msY + 6);
        doc.font('Helvetica').text(m.name || m.title || `Stage ${idx + 1} Completion`, 110, msY + 6);
        doc.text(`${m.percentage}%`, 380, msY + 6);
        doc.font('Helvetica-Bold').text(formatINR(m.amount), doc.page.width - 140, msY + 6, { align: 'right', width: 90 });
        msY += 22;
      });

      // Total Milestones Summary Row
      doc.rect(40, msY, doc.page.width - 80, 24).fill('#E2E8F0').strokeColor(PRIMARY).stroke();
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(9.5);
      doc.text('TOTAL CONTRACT VALUE', 110, msY + 7);
      doc.text('100.00%', 380, msY + 7);
      doc.text(formatINR(estimate.totalProjectCost), doc.page.width - 140, msY + 7, { align: 'right', width: 90 });

      doc.y = msY + 40;

      // ----------------------------------------------------
      // TERMS, INCLUSIONS & EXCLUSIONS
      // ----------------------------------------------------
      doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(11).text('TERMS & CONDITIONS', 40, doc.y);
      doc.y += 6;

      const terms = [
        '1. Quotation Validity: This estimate is valid for 30 calendar days from the date of generation.',
        '2. Rate Basis: Built-up area is calculated outer-to-outer including balconies and parking as specified.',
        '3. Standard Inclusions: 100% material, labor, structural drawings, 3D elevation, site engineer supervision.',
        '4. Standard Exclusions: Government building approval fees, EB permanent connection deposits, borewell depth beyond allowances.',
        '5. Payment Guarantee: Zero advance beyond Stage 1 booking fee; milestone payments only upon site stage verification.',
      ];

      terms.forEach((t) => {
        doc.fillColor(DARK).font('Helvetica').fontSize(8.5).text(t, 45, doc.y);
        doc.y += 14;
      });

      // ----------------------------------------------------
      // SIGNATURE & FOOTER
      // ----------------------------------------------------
      doc.y = doc.page.height - 110;
      doc.strokeColor(BORDER_COLOR).lineWidth(1).moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();

      doc.y += 15;
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9).text('For Asthiwar Design & Build', 40, doc.y);
      doc.font('Helvetica').fontSize(8).fillColor('#64748B').text('Authorized Signatory', 40, doc.y + 14);

      doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('Customer Acknowledgment', doc.page.width - 200, doc.y);
      doc.font('Helvetica').fontSize(8).fillColor('#64748B').text('Signature / Acceptance Date', doc.page.width - 200, doc.y + 14);

      // Page Numbering
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.font('Helvetica').fontSize(7.5).fillColor('#94A3B8');
        doc.text(
          `ASTHIWAR Quotation • ${estimate.estimateNumber} • Page ${i + 1} of ${range.count}`,
          40,
          doc.page.height - 25,
          { align: 'center', width: doc.page.width - 80 }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
