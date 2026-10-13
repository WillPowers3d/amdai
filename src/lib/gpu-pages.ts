import { GPU_PRESETS, type GpuId } from './calculator';
import { recipesForCard, type Recipe } from './recipes';
import { gpuDirectory, type GpuCard } from './status';
import { gpuCardId } from './gpu-ids';

export { GPU_NAME_IDS, MODEL_PAGES, gpuCardId } from './gpu-ids';

export type GpuPage = GpuCard & {
  id: string;
  calcId: GpuId | null;
  recipes: Recipe[];
};

export function gpuPages(list: Recipe[]): GpuPage[] {
  return gpuDirectory.cards.map((card) => {
    const id = gpuCardId(card);
    const calcId = (GPU_PRESETS.some((gpu) => gpu.id === id) ? id : null) as GpuId | null;
    return {
      ...card,
      id,
      calcId,
      recipes: recipesForCard(list, id),
    };
  });
}

export function gpuPageById(list: Recipe[], id: string): GpuPage | undefined {
  return gpuPages(list).find((page) => page.id === id);
}
