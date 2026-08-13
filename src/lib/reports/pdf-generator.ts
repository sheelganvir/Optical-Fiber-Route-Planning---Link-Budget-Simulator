import jsPDF from "jspdf";
import { LinkBudgetInput, LinkBudgetResult } from "../calculations/link-budget";

export interface PDFReportData {
  projectName: string;
  sourceSite: string;
  destinationSite: string;
  routeName: string;
  fiberType: string;
  wavelength: number;
  input: LinkBudgetInput;
  result: LinkBudgetResult;
}

export function generateEngineeringPDF(data: PDFReportData): void {
  const doc = new jsPDF();

  // Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("OPTICAL FIBER LINK ANALYSIS REPORT", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text("SIMULATOR DECISION SUPPORT DOCUMENT • ITU-T STANDARD G.652/G.655", 14, 25);

  let y = 40;

  // Feasibility Badge Box
  if (data.result.feasible) {
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(14, y, 182, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`STATUS: LINK FEASIBLE (Remaining Safety Margin: +${data.result.remainingMargin} dB)`, 18, y + 8);
  } else {
    doc.setFillColor(239, 68, 68); // rose-500
    doc.rect(14, y, 182, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`STATUS: LINK NOT FEASIBLE (Margin Deficit: ${data.result.remainingMargin} dB)`, 18, y + 8);
  }

  y += 20;

  // Project Info Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("1. Project & Route Parameters", 14, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const projectDetails = [
    ["Project / Link Title:", data.projectName || "OFC Fiber Route Plan"],
    ["Source Site (Tx):", data.sourceSite || "Origin POP Node"],
    ["Destination Site (Rx):", data.destinationSite || "Remote Terminus Site"],
    ["Fiber Cable Specification:", `${data.fiberType} (${data.wavelength} nm)`],
    ["Route Fiber Distance:", `${data.input.fiberLength} km`],
    ["Fiber Wavelength Attenuation:", `${data.input.attenuation} dB/km`],
  ];

  projectDetails.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, 80, y);
    y += 6;
  });

  y += 6;

  // Loss Budget Breakdown Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. Optical Loss Budget Breakdown", 14, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 7, "F");
  doc.setFontSize(9);
  doc.text("Parameter / Component", 16, y + 5);
  doc.text("Count / Unit", 90, y + 5);
  doc.text("Unit Loss", 130, y + 5);
  doc.text("Total Loss (dB)", 165, y + 5);
  y += 10;

  const lossRows = [
    ["Fiber Cable Attenuation", `${data.input.fiberLength} km`, `${data.input.attenuation} dB/km`, `${data.result.fiberLoss} dB`],
    ["Fusion Splice Points", `${data.input.spliceCount} splices`, `${data.input.spliceLoss} dB/splice`, `${data.result.spliceLoss} dB`],
    ["Optical Connector Ports", `${data.input.connectorCount} connectors`, `${data.input.connectorLoss} dB/conn`, `${data.result.connectorLoss} dB`],
    ["Additional System / Cable Loss", "-", "-", `${data.result.additionalLoss} dB`],
  ];

  lossRows.forEach(([comp, count, unit, total]) => {
    doc.setFont("helvetica", "normal");
    doc.text(comp, 16, y);
    doc.text(count, 90, y);
    doc.text(unit, 130, y);
    doc.setFont("helvetica", "bold");
    doc.text(total, 165, y);
    y += 6;
  });

  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PHYSICAL LINK LOSS:", 16, y);
  doc.text(`${data.result.physicalLoss} dB`, 165, y);
  y += 12;

  // Optical Power & Link Margin Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. Optical Power & Link Margin Budget", 14, y);
  y += 6;

  const opticalRows = [
    ["Transmitter Launch Power (Tx):", `${data.input.txPower > 0 ? "+" : ""}${data.input.txPower} dBm`],
    ["Total Physical Link Loss:", `-${data.result.physicalLoss} dB`],
    ["Calculated Received Power (Rx):", `${data.result.receivedPower} dBm`],
    ["Receiver Sensitivity Threshold:", `${data.input.rxSensitivity} dBm`],
    ["Total Link Margin (Rx Power - Rx Sens):", `${data.result.linkMargin} dB`],
    ["Required Safety Engineering Margin:", `${data.input.safetyMargin} dB`],
    ["REMAINING ENGINEERING MARGIN:", `${data.result.remainingMargin} dB`],
  ];

  opticalRows.forEach(([lbl, val], idx) => {
    const isHeader = idx === 6;
    doc.setFont("helvetica", isHeader ? "bold" : "normal");
    doc.setFontSize(10);
    doc.text(lbl, 16, y);
    doc.text(val, 165, y);
    y += 6;
  });

  y += 12;

  // Standard Engineering Assumptions Disclaimer (Section 32 Requirement)
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 32, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, 182, 32, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("ENGINEERING ASSUMPTIONS & SIMULATION DISCLAIMER:", 18, y + 6);

  doc.setFont("helvetica", "normal");
  const disclaimerText =
    "1. Fiber attenuation and splice/connector losses are engineering simulation parameters. Field OTDR verification is mandatory prior to commissioning.\n" +
    "2. Route distance is based on GIS map geometry. Actual installed cable length must account for route slack (typically 3-5% extra).\n" +
    "3. Deployment cost figures represent planning estimates and do not replace formal vendor bids or field surveys.";

  doc.text(disclaimerText, 18, y + 12);

  // Download PDF file
  const fileName = `OFC_Link_Budget_Report_${Date.now()}.pdf`;
  doc.save(fileName);
}
