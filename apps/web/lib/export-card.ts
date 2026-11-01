/**
 * CivicPulse OS — Pillar 1: 1-Pager WhatsApp Infographic Exporter
 * Generates an ultra-crisp, high-density 1080x1350 image card
 * optimized for WhatsApp/Telegram mobile broadcast with official verification stamps.
 */

export interface ExportCardData {
  schemeName: string;
  authority: string;
  notificationNo: string;
  verdictTag: "ELIGIBLE" | "CONDITIONALLY ELIGIBLE" | "INELIGIBLE";
  benefitSummary: string;
  disbursalAmount: string;
  keyEntitlements: string[];
  requiredDocuments: string[];
  officialPortalUrl: string;
  contentHash: string;
  language?: string;
}

export async function generateBenefitSummaryCard(data: ExportCardData): Promise<string> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas context");
  }

  // 1. Background Fill (Dark civic gradient)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#09090b"); // zinc-950
  bgGrad.addColorStop(0.5, "#0d151c");
  bgGrad.addColorStop(1, "#042f2e"); // emerald-950 tint
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // 2. Header Brand & Gazette Stamp
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(90, 95, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#09090b";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("CP", 72, 104);

  ctx.fillStyle = "#f4f4f5";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("CivicPulse OS", 136, 95);

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "20px monospace";
  ctx.fillText("OFFICIAL STATUTORY POLICY SUMMARY · CITIZEN BRIEF", 136, 126);

  // Official Seal Badge (Top Right)
  ctx.fillStyle = "#18181b";
  ctx.fillRect(720, 64, 300, 70);
  ctx.strokeStyle = "#10b98188";
  ctx.lineWidth = 2;
  ctx.strokeRect(720, 64, 300, 70);

  ctx.fillStyle = "#10b981";
  ctx.font = "bold 18px monospace";
  ctx.fillText("VERIFIED STATUTORY DATA", 740, 96);
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "14px monospace";
  ctx.fillText("SHA-256 CITATION ANCHOR", 740, 120);

  // Line Divider
  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 170);
  ctx.lineTo(width - 60, 170);
  ctx.stroke();

  // 3. Scheme Title & Authority
  ctx.fillStyle = "#f43f5e";
  ctx.font = "bold 20px monospace";
  ctx.fillText("ISSUED BY: " + data.authority.toUpperCase(), 64, 215);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px sans-serif";
  wrapText(ctx, data.schemeName, 64, 275, 950, 52);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "20px monospace";
  ctx.fillText(`Gazette Notif: ${data.notificationNo} · Portal: ${data.officialPortalUrl}`, 64, 375);

  // 4. Hero Benefit Box (Central Glowing Card)
  const boxY = 415;
  const boxHeight = 230;
  ctx.fillStyle = "#18181b";
  ctx.fillRect(60, boxY, width - 120, boxHeight);
  ctx.strokeStyle = data.verdictTag === "ELIGIBLE" ? "#10b981" : "#f59e0b";
  ctx.lineWidth = 3;
  ctx.strokeRect(60, boxY, width - 120, boxHeight);

  // Verdict Pill
  ctx.fillStyle = data.verdictTag === "ELIGIBLE" ? "#10b98122" : "#f59e0b22";
  ctx.fillRect(84, boxY + 24, 280, 44);
  ctx.fillStyle = data.verdictTag === "ELIGIBLE" ? "#10b981" : "#f59e0b";
  ctx.font = "bold 22px monospace";
  ctx.fillText(`● STATUS: ${data.verdictTag}`, 98, boxY + 54);

  // Benefit Amount in Bold
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 64px monospace";
  ctx.fillText(data.disbursalAmount, 84, boxY + 140);

  ctx.fillStyle = "#e4e4e7";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(data.benefitSummary, 84, boxY + 185);

  // 5. Entitlements Checklist (2 Column Section)
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("DIRECT STATUTORY ENTITLEMENTS", 64, 700);

  ctx.font = "22px sans-serif";
  ctx.fillStyle = "#e4e4e7";
  let entY = 745;
  data.keyEntitlements.slice(0, 3).forEach((item) => {
    ctx.fillStyle = "#10b981";
    ctx.fillText("✓", 64, entY);
    ctx.fillStyle = "#f4f4f5";
    wrapText(ctx, item, 100, entY, 900, 32);
    entY += 56;
  });

  // 6. Required Documents Checklist
  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("REQUIRED MANDATORY DOCUMENTS", 64, 955);

  let docY = 1000;
  data.requiredDocuments.slice(0, 4).forEach((doc) => {
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("◻", 64, docY);
    ctx.fillStyle = "#d4d4d8";
    ctx.font = "21px sans-serif";
    wrapText(ctx, doc, 100, docY, 900, 30);
    docY += 50;
  });

  // 7. Footer Provenance & Hash Stamp
  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 1220);
  ctx.lineTo(width - 60, 1220);
  ctx.stroke();

  ctx.fillStyle = "#71717a";
  ctx.font = "16px monospace";
  ctx.fillText(`PROVENANCE SHA-256: ${data.contentHash}`, 64, 1260);
  ctx.fillText(`GENERATED AT: ${new Date().toISOString()} · VERIFIED CIVIC PUBLIC RECORD`, 64, 1290);

  return canvas.toDataURL("image/png");
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

