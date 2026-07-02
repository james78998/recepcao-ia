const prisma = require('./prisma');

async function findAllByTenantId(tenantId) {
  return prisma.tenantBusinessHour.findMany({ where: { tenantId } });
}

// Substitui as 7 linhas do tenant numa única transação — a tela sempre
// envia a semana completa, então tratamos como um "replace" atômico.
async function replaceAll(tenantId, days) {
  return prisma.$transaction(
    days.map((day) =>
      prisma.tenantBusinessHour.upsert({
        where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day.dayOfWeek } },
        create: { tenantId, ...day },
        update: day,
      })
    )
  );
}

module.exports = { findAllByTenantId, replaceAll };
