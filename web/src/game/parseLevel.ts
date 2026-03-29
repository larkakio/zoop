export type Cell = "empty" | "wall" | "zoop";

export type ParsedLevel = {
  rows: number;
  cols: number;
  grid: Cell[][];
  start: { r: number; c: number };
  maxMoves: number;
  id: number;
};

function cellFromChar(ch: string): Cell | "start" | null {
  switch (ch) {
    case "#":
      return "wall";
    case ".":
      return "empty";
    case "Z":
      return "zoop";
    case "P":
      return "start";
    default:
      return null;
  }
}

export function parseAsciiLevel(
  id: number,
  maxMoves: number,
  lines: string[],
): ParsedLevel {
  const trimmed = lines.map((l) => l.trim()).filter(Boolean);
  const rows = trimmed.length;
  const cols = Math.max(...trimmed.map((l) => l.length));
  const grid: Cell[][] = [];
  let start = { r: 0, c: 0 };

  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    const line = trimmed[r] ?? "";
    for (let c = 0; c < cols; c++) {
      const ch = line[c] ?? "#";
      const parsed = cellFromChar(ch);
      if (parsed === null) {
        row.push("wall");
        continue;
      }
      if (parsed === "start") {
        start = { r, c };
        row.push("empty");
        continue;
      }
      row.push(parsed);
    }
    grid.push(row);
  }

  return { id, rows, cols, grid, start, maxMoves };
}
