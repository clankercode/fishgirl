#!/usr/bin/env bun
import { run } from "@mermaid-js/mermaid-cli";

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
    switch (arg) {
      case "-i":
      case "--input":
        opts.input = argv[++i];
        break;
      case "-o":
      case "--output":
        opts.output = argv[++i];
        break;
      case "-f":
      case "--format":
        opts.format = argv[++i] as "svg" | "png" | "pdf";
        break;
      case "-t":
      case "--theme":
        opts.theme = argv[++i];
        break;
      case "-b":
      case "--background":
        opts.backgroundColor = argv[++i];
        break;
      case "-w":
      case "--width":
        opts.width = parseInt(argv[++i], 10);
        break;
      case "-H":
      case "--height":
        opts.height = parseInt(argv[++i], 10);
        break;
      case "-s":
      case "--scale":
        opts.scale = parseFloat(argv[++i]);
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

  const viewport: puppeteer.Viewport = {
    width: opts.width ?? 1200,
    height: opts.height ?? 800,
    deviceScaleFactor: opts.scale ?? 1,
  };

  await run(opts.input, opts.output, {
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

import puppeteer from "puppeteer";
