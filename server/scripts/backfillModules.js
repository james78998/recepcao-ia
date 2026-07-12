// Backfill do Sistema de Módulos/Entitlements (Fase 0): garante que o catálogo de
// módulos exista na tabela Module e que todo tenant já existente tenha uma linha
// TenantModule (enabled: true) para cada módulo do catálogo.
//
// Idempotente — pode ser executado quantas vezes for necessário sem duplicar
// dados (upsert por Module.key; skipDuplicates na criação de TenantModule).
//
// Uso: node scripts/backfillModules.js
require('dotenv').config();
const prisma = require('../src/repositories/prisma');
const moduleRepository = require('../src/repositories/moduleRepository');
const tenantModuleRepository = require('../src/repositories/tenantModuleRepository');
const { MODULE_CATALOG } = require('../src/constants/modules');

async function main() {
  for (const entry of MODULE_CATALOG) {
    const module = await moduleRepository.upsertByKey(entry);
    console.log(`Módulo garantido: ${module.key}`);
  }

  const catalog = await moduleRepository.findAll();
  const moduleIds = catalog.map((module) => module.id);

  const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } });

  for (const tenant of tenants) {
    const result = await tenantModuleRepository.createManyEnabledForTenant(tenant.id, moduleIds);
    console.log(`Tenant ${tenant.name} (${tenant.id}): ${result.count} módulo(s) habilitado(s).`);
  }

  console.log(`Backfill concluído: ${catalog.length} módulo(s) × ${tenants.length} tenant(s).`);
}

main()
  .catch((err) => {
    console.error('Erro ao executar o backfill de módulos:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
