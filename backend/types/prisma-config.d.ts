declare module "prisma/config" {
  // Minimal types just to make VSCode & TypeScript happy.
  // Prisma CLI will work normally — this file does not affect runtime.
  export function defineConfig(config: any): any;
  export function env(name: string): string;
}
