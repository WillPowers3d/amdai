import { pickRecipes, catalogPayload } from '../../../../lib/recipes';
import { recipes } from '../../../../lib/recipes-data';
import { gpuPages } from '../../../../lib/gpu-pages';
import { isPublicQuant, jsonResponse, planFitInput } from '../../../../lib/public-api';
import { ramPickPayload, ramRecommendation, setupNeedsRamOffload } from '../../../../lib/ram-kit';
import { cpuPickPayload, cpuRecommendation } from '../../../../lib/cpu-pick';
import { psuPickPayload, psuRecommendation } from '../../../../lib/psu-pick';
import { storagePickPayload, storageRecommendation } from '../../../../lib/storage-pick';
import { casePickPayload, caseRecommendation } from '../../../../lib/case-pick';
import { coolerPickPayload, coolerRecommendation } from '../../../../lib/cooler-pick';
import { buildList } from '../../../../lib/build-list';

export function getStaticPaths() {
  return gpuPages(recipes).map((page) => ({ params: { gpu: page.id } }));
}

export async function GET({ params }: { params: { gpu: string } }) {
  const picked = pickRecipes(recipes, params.gpu, null).filter((row) => isPublicQuant(row.weights.quant));
  const sample = planFitInput({ gpu: params.gpu });
  const needsOffload = setupNeedsRamOffload(sample);
  return jsonResponse({
    gpu: params.gpu,
    as_of: catalogPayload(recipes).as_of,
    ram: {
      ...ramPickPayload(),
      recommended: ramRecommendation({ bigModels: false, needsOffload }),
    },
    cpu: {
      ...cpuPickPayload(),
      recommended: cpuRecommendation({ bigModels: false, needsOffload, cpuWork: false }),
    },
    psu: {
      ...psuPickPayload(),
      recommended: psuRecommendation({ gpuCount: 1, expandGpu: false }),
    },
    storage: {
      ...storagePickPayload(),
      recommended: storageRecommendation({ bigModels: false, coldLoad: false }),
    },
    case: {
      ...casePickPayload(),
      recommended: caseRecommendation({
        boardId: 'asrock-x870-taichi-creator',
        formFactor: 'ATX',
        gpuCount: 1,
        psuName: 'Corsair RM850x (2024, ATX 3.1)',
      }),
    },
    cooler: {
      ...coolerPickPayload(),
      recommended: coolerRecommendation({ cpuId: '9600x', caseId: 'fractal-torrent', gpuCount: 1 }),
    },
    parts: buildList({
      gpuCount: 1,
      minBudget: false,
      expandGpu: false,
      bigModels: false,
      cpuWork: false,
      coldLoad: false,
      needsOffload,
    }),
    recipes: picked,
  });
}
