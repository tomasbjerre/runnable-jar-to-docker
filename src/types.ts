export interface Context {
  cliname: string;
  mavenGroupSlashes: string;
  version: string;
  dockerUser: string;
  dockerPassword: string;
  shortDescription: string;
  compileNative: boolean;
  dryRun: boolean;
}
