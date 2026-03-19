#!/usr/bin/env node
/**
 * Installs Puppeteer's Chrome browser for local PDF generation.
 * Skipped on Vercel (uses @sparticuz/chromium instead).
 */
if (process.env.VERCEL) {
  console.log("Skipping Puppeteer Chrome install (Vercel uses @sparticuz/chromium)");
  process.exit(0);
}

const { execSync } = require("child_process");

try {
  console.log("Installing Puppeteer Chrome for local PDF generation...");
  execSync("pnpm exec puppeteer browsers install chrome", { stdio: "inherit" });
  console.log("Puppeteer Chrome installed successfully.");
} catch (error) {
  console.warn("Puppeteer Chrome install failed. PDF generation may not work locally.");
  console.warn("Run manually: pnpm exec puppeteer browsers install chrome");
  process.exit(0); // Don't fail the install
}
