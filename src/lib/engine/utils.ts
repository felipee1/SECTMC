export function parseIngredientLine(line: string): {
  name: string;
  qty: number;
  unit: string;
} {
  const match = line.match(
    /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|un|unidade|unidades|pacote|lata|dúzia|duzia|units?)$/i,
  );
  if (match) {
    return {
      name: match[1].trim(),
      qty: parseFloat(match[2].replace(",", ".")),
      unit: match[3].toLowerCase(),
    };
  }
  return { name: line.trim(), qty: 0, unit: "" };
}

export function normalizeToBaseUnit(
  qty: number,
  unit: string,
): { qty: number; baseUnit: string } {
  const u = unit.toLowerCase();
  if (u === "kg") return { qty: qty * 1000, baseUnit: "g" };
  if (u === "l") return { qty: qty * 1000, baseUnit: "ml" };
  return { qty, baseUnit: u };
}
