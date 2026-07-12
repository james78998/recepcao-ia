const prisma = require('../repositories/prisma');
const moduleRepository = require('../repositories/moduleRepository');
const tenantModuleRepository = require('../repositories/tenantModuleRepository');
const tenantRepository = require('../repositories/tenantRepository');
const adminAuditLogService = require('./adminAuditLogService');
const AppError = require('../utils/AppError');

async function getEnabledModuleKeys(tenantId) {
  return tenantModuleRepository.findEnabledKeysByTenant(tenantId);
}

async function hasModule(tenantId, moduleKey) {
  const enabledKeys = await getEnabledModuleKeys(tenantId);
  return enabledKeys.includes(moduleKey);
}

// Catálogo completo com o status (enabled/disabled) para um tenant específico —
// usado pela tela de Módulos do Super Admin. Módulos sem linha em TenantModule
// (não deveria acontecer após onboarding/backfill) aparecem como desabilitados.
async function getCatalogWithStatus(tenantId) {
  const tenant = await tenantRepository.findByIdProfile(tenantId);
  if (!tenant) {
    throw new AppError('Tenant não encontrado.', 404);
  }

  const [catalog, tenantModules] = await Promise.all([
    moduleRepository.findAll(),
    tenantModuleRepository.findAllByTenant(tenantId),
  ]);

  const statusByModuleId = new Map(tenantModules.map((tm) => [tm.moduleId, tm.enabled]));

  return catalog.map((module) => ({
    key: module.key,
    name: module.name,
    description: module.description,
    enabled: statusByModuleId.get(module.id) ?? false,
  }));
}

async function setModuleEnabled(tenantId, moduleKey, enabled, { adminUserId }) {
  const tenant = await tenantRepository.findByIdProfile(tenantId);
  if (!tenant) {
    throw new AppError('Tenant não encontrado.', 404);
  }

  const module = await moduleRepository.findByKey(moduleKey);
  if (!module) {
    throw new AppError('Módulo não encontrado.', 404);
  }

  const [existing] = (await tenantModuleRepository.findAllByTenant(tenantId)).filter(
    (tm) => tm.moduleId === module.id
  );
  const previousEnabled = existing?.enabled ?? false;

  await tenantModuleRepository.upsert({ tenantId, moduleId: module.id, enabled });

  await adminAuditLogService.record({
    adminUserId,
    tenantId,
    action: enabled ? 'MODULE_ENABLED' : 'MODULE_DISABLED',
    resource: 'TenantModule',
    resourceId: moduleKey,
    oldValue: { enabled: previousEnabled },
    newValue: { enabled },
  });

  return getCatalogWithStatus(tenantId);
}

async function setModulesBulk(tenantId, changes, { adminUserId }) {
  const tenant = await tenantRepository.findByIdProfile(tenantId);
  if (!tenant) {
    throw new AppError('Tenant não encontrado.', 404);
  }

  const catalog = await moduleRepository.findAll();
  const moduleByKey = new Map(catalog.map((m) => [m.key, m]));

  for (const change of changes) {
    if (!moduleByKey.has(change.key)) {
      throw new AppError(`Módulo "${change.key}" não encontrado.`, 404);
    }
  }

  const existingTenantModules = await tenantModuleRepository.findAllByTenant(tenantId);
  const previousByModuleId = new Map(existingTenantModules.map((tm) => [tm.moduleId, tm.enabled]));

  const oldValue = {};
  const newValue = {};

  await prisma.$transaction(async (tx) => {
    for (const change of changes) {
      const module = moduleByKey.get(change.key);
      oldValue[change.key] = previousByModuleId.get(module.id) ?? false;
      newValue[change.key] = change.enabled;
      await tenantModuleRepository.upsert({ tenantId, moduleId: module.id, enabled: change.enabled }, tx);
    }
  });

  await adminAuditLogService.record({
    adminUserId,
    tenantId,
    action: 'MODULES_BULK_UPDATED',
    resource: 'TenantModule',
    resourceId: null,
    oldValue,
    newValue,
  });

  return getCatalogWithStatus(tenantId);
}

module.exports = { getEnabledModuleKeys, hasModule, getCatalogWithStatus, setModuleEnabled, setModulesBulk };
