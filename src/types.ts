export interface Context {
  cliname: string;
  mavenGroupSlashes: string;
  version: string;
  dockerUser: string;
  dockerPassword: string;
  dockerRegistryPath: string;
  dockerImageName: () => string;
  shortDescription: string;
  compileNative: boolean;
  dryRun: boolean;
  architecture: string;
  repositoryUrl: string;
  updateReadme: boolean;
}
