import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("Execute este verificador por npm: npm run verify:package");
}

const temporaryRoot = await mkdtemp(join(tmpdir(), "faillens-package-"));

try {
  const packOutput = execFileSync(
    process.execPath,
    [npmCli, "pack", "--json", "--pack-destination", temporaryRoot],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const packResult = JSON.parse(packOutput);
  const tarball = join(temporaryRoot, packResult[0].filename);
  const consumer = join(temporaryRoot, "consumer");
  await mkdir(consumer);
  await writeFile(
    join(consumer, "package.json"),
    `${JSON.stringify({ name: "faillens-package-check", private: true }, null, 2)}\n`,
    "utf8",
  );

  execFileSync(
    process.execPath,
    [npmCli, "install", tarball, "--ignore-scripts", "--no-audit", "--no-fund"],
    { cwd: consumer, stdio: "pipe" },
  );

  const installedRoot = join(consumer, "node_modules", "@soaressilves", "faillens");
  const installedPackage = JSON.parse(
    await readFile(join(installedRoot, "package.json"), "utf8"),
  );
  const shim = join(
    consumer,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "faillens.cmd" : "faillens",
  );
  await access(shim);

  const fixture = join(projectRoot, "examples", "github-actions-failure.log");
  const report = execFileSync(
    process.execPath,
    [join(installedRoot, "bin", "faillens.js"), fixture, "--format", "json"],
    { cwd: consumer, encoding: "utf8" },
  );
  const result = JSON.parse(report);

  if (installedPackage.version !== "0.1.0") {
    throw new Error(`Versão instalada inesperada: ${installedPackage.version}`);
  }
  if (result.primary?.category !== "test") {
    throw new Error("A CLI instalada não encontrou a falha de teste esperada.");
  }

  console.log(`Pacote ${installedPackage.name}@${installedPackage.version} instalado e executado com sucesso.`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
