import { z } from 'astro/zod';

export const wantedSchema = z.object({
  as_of: z.string(),
  rule: z.string(),
  items: z
    .array(
      z.object({
        id: z.string(),
        card: z.string(),
        card_name: z.string(),
        model: z.string(),
        why: z.string(),
        request: z.string(),
      }),
    )
    .min(1),
});

export type WantedFile = z.infer<typeof wantedSchema>;

export function parseWanted(raw: unknown): WantedFile {
  const file = wantedSchema.parse(raw);
  if (/\$\d+|bounty/i.test(JSON.stringify(file))) {
    throw new Error('wanted.yaml: bounty amounts need amdai’s sign-off');
  }
  if (/Qwen2\.5|Qwen3-8B/i.test(JSON.stringify(file))) {
    throw new Error('wanted.yaml: banned model name');
  }
  return file;
}
