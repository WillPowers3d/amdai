export type RigSnapshot = {
  name?: string;
  gpu: string;
  gfx?: string | null;
  rocmVersion?: string | null;
  backend: string;
  backendVersion?: string | null;
  os?: string | null;
  distro?: string | null;
};
