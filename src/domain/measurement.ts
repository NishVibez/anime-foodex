import type {
  Allergen,
  DietaryTag,
  MarketCode,
  QuantityUnit,
  RecipeIngredient,
  RegionalSubstitution,
  StructuredQuantity,
  UnitSystem,
} from "./contracts";

type UnitDimension = "mass" | "volume" | "temperature" | "count";

interface LinearUnitDefinition {
  readonly dimension: Exclude<UnitDimension, "temperature">;
  readonly toBase: number;
}

const LINEAR_UNITS: Readonly<
  Record<Exclude<QuantityUnit, "celsius" | "fahrenheit">, LinearUnitDefinition>
> = {
  mg: { dimension: "mass", toBase: 0.001 },
  g: { dimension: "mass", toBase: 1 },
  kg: { dimension: "mass", toBase: 1_000 },
  oz: { dimension: "mass", toBase: 28.349523125 },
  lb: { dimension: "mass", toBase: 453.59237 },
  ml: { dimension: "volume", toBase: 1 },
  l: { dimension: "volume", toBase: 1_000 },
  tsp: { dimension: "volume", toBase: 4.92892159375 },
  tbsp: { dimension: "volume", toBase: 14.78676478125 },
  cup: { dimension: "volume", toBase: 236.5882365 },
  fl_oz: { dimension: "volume", toBase: 29.5735295625 },
  piece: { dimension: "count", toBase: 1 },
  pinch: { dimension: "count", toBase: 1 },
};

function roundForKitchen(value: number): number {
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 2) / 2;
  return Math.round(value * 100) / 100;
}

function roundConversion(value: number): number {
  return Math.round(value * 100) / 100;
}

function dimensionOf(unit: QuantityUnit): UnitDimension {
  if (unit === "celsius" || unit === "fahrenheit") return "temperature";
  return LINEAR_UNITS[unit].dimension;
}

function linearUnit(unit: QuantityUnit): LinearUnitDefinition {
  if (unit === "celsius" || unit === "fahrenheit") {
    throw new RangeError(`${unit} is not a linear unit.`);
  }
  return LINEAR_UNITS[unit];
}

export function convertQuantity(
  amount: number,
  from: QuantityUnit,
  to: QuantityUnit,
  gramsPerMilliliter?: number,
): number {
  if (!Number.isFinite(amount)) throw new RangeError("Amount must be finite.");
  if (from === to) return roundConversion(amount);

  const fromDimension = dimensionOf(from);
  const toDimension = dimensionOf(to);

  if (fromDimension === "temperature" || toDimension === "temperature") {
    if (fromDimension !== toDimension) {
      throw new RangeError(`Cannot convert ${from} to ${to}.`);
    }
    const converted =
      from === "celsius" ? (amount * 9) / 5 + 32 : ((amount - 32) * 5) / 9;
    return roundConversion(converted);
  }

  if (fromDimension === toDimension) {
    return roundConversion(
      (amount * linearUnit(from).toBase) / linearUnit(to).toBase,
    );
  }

  const massVolumePair =
    (fromDimension === "mass" && toDimension === "volume") ||
    (fromDimension === "volume" && toDimension === "mass");
  if (!massVolumePair || !gramsPerMilliliter || gramsPerMilliliter <= 0) {
    throw new RangeError(`Cannot convert ${from} to ${to} without density.`);
  }

  const baseAmount = amount * linearUnit(from).toBase;
  const convertedBase =
    fromDimension === "mass"
      ? baseAmount / gramsPerMilliliter
      : baseAmount * gramsPerMilliliter;
  return roundConversion(convertedBase / linearUnit(to).toBase);
}

function preferredUnit(
  amount: number,
  source: QuantityUnit,
  system: UnitSystem,
): QuantityUnit {
  const dimension = dimensionOf(source);
  if (dimension === "temperature") {
    return system === "metric" ? "celsius" : "fahrenheit";
  }
  if (dimension === "mass") {
    if (system === "metric") {
      const grams = convertQuantity(amount, source, "g");
      return grams >= 1_000 ? "kg" : "g";
    }
    const ounces = convertQuantity(amount, source, "oz");
    return ounces >= 16 ? "lb" : "oz";
  }
  if (dimension === "volume") {
    if (system === "metric") {
      const milliliters = convertQuantity(amount, source, "ml");
      return milliliters >= 1_000 ? "l" : "ml";
    }
    const fluidOunces = convertQuantity(amount, source, "fl_oz");
    if (fluidOunces >= 8) return "cup";
    return fluidOunces >= 0.5 ? "fl_oz" : "tsp";
  }
  return source;
}

export function scaleQuantity(
  quantity: StructuredQuantity,
  factor: number,
  unitSystem?: UnitSystem,
): StructuredQuantity {
  if (!Number.isFinite(factor) || factor <= 0) {
    throw new RangeError("Scale factor must be positive and finite.");
  }

  const scaledAmount = quantity.amount * factor;
  const scaledMaximum = quantity.maximumAmount
    ? quantity.maximumAmount * factor
    : undefined;
  const targetUnit = unitSystem
    ? preferredUnit(scaledAmount, quantity.unit, unitSystem)
    : quantity.unit;

  return {
    ...quantity,
    amount: roundForKitchen(
      convertQuantity(scaledAmount, quantity.unit, targetUnit),
    ),
    unit: targetUnit,
    maximumAmount:
      scaledMaximum === undefined
        ? undefined
        : roundForKitchen(
            convertQuantity(scaledMaximum, quantity.unit, targetUnit),
          ),
  };
}

export function scaleIngredients(
  ingredients: readonly RecipeIngredient[],
  baseServings: number,
  targetServings: number,
  unitSystem: UnitSystem,
): readonly RecipeIngredient[] {
  if (baseServings <= 0 || targetServings <= 0) {
    throw new RangeError("Serving counts must be greater than zero.");
  }
  const factor = targetServings / baseServings;
  return ingredients.map((ingredient) => ({
    ...ingredient,
    quantity: scaleQuantity(ingredient.quantity, factor, unitSystem),
  }));
}

export interface SubstitutionContext {
  readonly market: MarketCode;
  readonly allergens: readonly Allergen[];
  readonly dietaryRequirements: readonly DietaryTag[];
}

/** Selects the safest highest-priority regional replacement, if one exists. */
export function chooseRegionalSubstitution(
  ingredientId: string,
  substitutions: readonly RegionalSubstitution[],
  context: SubstitutionContext,
): RegionalSubstitution | null {
  return (
    substitutions
      .filter(
        (substitution) =>
          substitution.ingredientId === ingredientId &&
          substitution.markets.includes(context.market) &&
          !substitution.allergens.some((allergen) =>
            context.allergens.includes(allergen),
          ) &&
          context.dietaryRequirements.every((requirement) =>
            substitution.dietaryTags.includes(requirement),
          ),
      )
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          left.id.localeCompare(right.id, "en"),
      )[0] ?? null
  );
}
