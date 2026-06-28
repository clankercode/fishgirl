#!/usr/bin/env bun
import { run } from "@mermaid-js/mermaid-cli";
import type { Viewport } from "puppeteer";

interface CliOptions {
  input?: string;
  output?: string;
  format?: "svg" | "png" | "pdf";
  theme?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  scale?: number;
  pdfFit?: boolean;
  config?: string;
  quiet?: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) {
      continue;
    }
    switch (arg) {
      case "-i":
      case "--input":
        opts.input = readOptionValue(argv, i, arg);
        i++;
        break;
      case "-o":
      case "--output":
        opts.output = readOptionValue(argv, i, arg);
        i++;
        break;
      case "-f":
      case "--format":
        opts.format = readFormat(readOptionValue(argv, i, arg));
        i++;
        break;
      case "-t":
      case "--theme":
        opts.theme = readOptionValue(argv, i, arg);
        i++;
        break;
      case "-b":
      case "--background":
        opts.backgroundColor = readOptionValue(argv, i, arg);
        i++;
        break;
      case "-w":
      case "--width":
        opts.width = readInteger(readOptionValue(argv, i, arg), arg);
        i++;
        break;
      case "-H":
      case "--height":
        opts.height = readInteger(readOptionValue(argv, i, arg), arg);
        i++;
        break;
      case "-s":
      case "--scale":
        opts.scale = readNumber(readOptionValue(argv, i, arg), arg);
        i++;
        break;
      case "-p":
      case "--pdfFit":
      case "--pdf-fit":
        opts.pdfFit = true;
        break;
      case "-c":
      case "--config":
        opts.config = argv[++i];
        break;
      case "-q":
      case "--quiet":
        opts.quiet = true;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
      default:
        if (arg.startsWith("-") && arg !== "--") {
          console.error(`Unknown option: ${arg}`);
          printHelp();
          process.exit(1);
        }
    }
  }
  return opts;
}

function readOptionValue(argv: string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value || value === "--") {
    console.error(`Error: ${option} requires a value`);
    process.exit(1);
  }
  return value;
}

function readFormat(value: string): "svg" | "png" | "pdf" {
  if (value === "svg" || value === "png" || value === "pdf") {
    return value;
  }
  console.error(`Error: Unsupported format: ${value}`);
  process.exit(1);
}

function readInteger(value: string, option: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    console.error(`Error: ${option} must be an integer`);
    process.exit(1);
  }
  return parsed;
}

function readNumber(value: string, option: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    console.error(`Error: ${option} must be a number`);
    process.exit(1);
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: fishgirl [options]
Options:
  -i, --input <file>       Input mermaid file (required)
  -o, --output <file>      Output file (required)
  -f, --format <format>    Output format: svg, png, pdf (default: svg)
  -t, --theme <theme>      Mermaid theme (default, dark, forest, neutral, etc.)
  -b, --background <color> Background color (e.g., transparent, #ffffff)
  -w, --width <px>          Viewport width in pixels
  -H, --height <px>        Viewport height in pixels
  -s, --scale <number>     Device scale factor
  -p, --pdfFit             Fit PDF to page
  -c, --config <file>      Mermaid config JSON file
  -q, --quiet              Suppress log output
  -h, --help               Show this help message
`);
}

async function main() {
  const argv = Bun.argv.slice(2);
  const opts = parseArgs(argv);

  if (!opts.input || !opts.output) {
    console.error("Error: Both --input and --output are required");
    printHelp();
    process.exit(1);
  }

  const format = opts.format ?? "svg";
  const outputFormat = format.replace(".", "") as "svg" | "png" | "pdf";

  let mermaidConfig: Record<string, unknown> = {};
  if (opts.config) {
    const configFile = Bun.file(opts.config);
    const configText = await configFile.text();
    mermaidConfig = JSON.parse(configText);
  }

  if (opts.theme) {
    mermaidConfig.theme = opts.theme;
  }

  const viewport: Viewport = {
    width: opts.width ?? 1200,
    height: opts.height ?? 800,
    deviceScaleFactor: opts.scale ?? 1,
  };

  await run(opts.input, opts.output as Parameters<typeof run>[1], {
    quiet: opts.quiet,
    outputFormat,
    puppeteerConfig: {
      headless: true,
    },
    parseMMDOptions: {
      viewport,
      backgroundColor: opts.backgroundColor ?? "transparent",
      mermaidConfig,
      pdfFit: opts.pdfFit,
    },
  });

  console.log(`Written to ${opts.output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
