import type { SystemRamNeed } from './calculator';
import { measuredRamHits } from './measured-ram-data';
import { recipeSystemRam } from './recipes';
import { recipes } from './recipes-data';

export const HOUSE_RAM_RECIPE = {
  daily: 'qwen36-35b.llamacpp-vulkan.262k',
  flash: 'qwen38-flash.strata.262k',
} as const;

export type HouseRamKind = keyof typeof HOUSE_RAM_RECIPE;

export function houseSystemRam(kind: HouseRamKind): SystemRamNeed | null {
  const recipe = recipes.find((row) => row.id === HOUSE_RAM_RECIPE[kind]);
  if (!recipe) return null;
  return recipeSystemRam(recipe, measuredRamHits);
}
