import { type ParsedLevel, parseAsciiLevel } from "./parseLevel";

const L1 = parseAsciiLevel(1, 22, [
  "#####",
  "#Z..#",
  "#.P.#",
  "#..Z#",
  "#####",
]);

const L2 = parseAsciiLevel(2, 20, [
  "#######",
  "#Z#...#",
  "#.#.#.#",
  "#...P.#",
  "#.#.#.#",
  "#...Z.#",
  "#######",
]);

const L3 = parseAsciiLevel(3, 16, [
  "#######",
  "#ZZZZ.#",
  "#....##",
  "##.P..#",
  "#....##",
  "#.....#",
  "#######",
]);

export const LEVELS: ParsedLevel[] = [L1, L2, L3];
