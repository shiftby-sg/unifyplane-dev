export type RegistryEntry = {
  slug: string;
  markdownPath: string;
  title: string;
  description: string;
  maturityLabel?: string;
  truthSource: ReadonlyArray<string>;
  derivedFrom: ReadonlyArray<string>;
  related: ReadonlyArray<string>;
};

export async function getComponentsRegistry(): Promise<ReadonlyArray<RegistryEntry>> {
  const mod = await import("../../content/registries/components.config");
  return mod.default as ReadonlyArray<RegistryEntry>;
}

export async function getFoundationsRegistry(): Promise<ReadonlyArray<RegistryEntry>> {
  const mod = await import("../../content/registries/foundations.config");
  return mod.default as ReadonlyArray<RegistryEntry>;
}

export async function getWritingRegistry(): Promise<ReadonlyArray<RegistryEntry>> {
  const mod = await import("../../content/registries/writing.config");
  return mod.default as ReadonlyArray<RegistryEntry>;
}
