# fishgirl

Render Mermaid diagrams from the command line using Bun and
`@mermaid-js/mermaid-cli`.

## Install

```sh
bun add -g fishgirl
```

## Usage

```sh
fishgirl --input diagram.mmd --output diagram.svg
```

Options:

```text
  -i, --input <file>       Input Mermaid file (required)
  -o, --output <file>      Output file (required)
  -f, --format <format>    Output format: svg, png, pdf (default: svg)
  -t, --theme <theme>      Mermaid theme
  -b, --background <color> Background color, such as transparent or #ffffff
  -w, --width <px>         Viewport width in pixels
  -H, --height <px>        Viewport height in pixels
  -s, --scale <number>     Device scale factor
  -p, --pdf-fit            Fit PDF to page
  -c, --config <file>      Mermaid config JSON file
  -q, --quiet              Suppress log output
  -h, --help               Show help
```

## Development

```sh
bun install
bun run typecheck
bun run index.ts --help
```
