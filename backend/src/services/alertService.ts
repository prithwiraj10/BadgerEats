import { Prisma } from '@prisma/client';
import { prisma } from '../db/client.js';
import { logger } from '../lib/logger.js';

export type CreateAlertInput = {
  title: string;
  summary: string;
  location: string;
  startTime?: Date;
  endTime?: Date;
  tags: string[];
  source: string;
};

type DbAlert = Prisma.AlertGetPayload<{}>;

const mapAlert = (alert: DbAlert) => ({
  id: alert.id,
  title: alert.title,
  summary: alert.summary,
  location: alert.location,
  startTime: alert.startTime,
  endTime: alert.endTime,
  tags: alert.tags,
  source: alert.source,
  createdAt: alert.createdAt,
});

export type AlertDto = ReturnType<typeof mapAlert>;

async function createAlert(input: CreateAlertInput) {
  try {
    const alert = await prisma.alert.create({
      data: {
        title: input.title,
        summary: input.summary,
        location: input.location,
        startTime: input.startTime,
        endTime: input.endTime,
        tags: input.tags.join(","),
        source: input.source,
      },
    });

    return mapAlert(alert);
  } catch (err) {
    logger.error({ err, input }, 'Failed to create alert');
    throw err;
  }
}

async function listAlerts(limit = 100) {
  const alerts = await prisma.alert.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return alerts.map(mapAlert);
}

async function getAlert(alertId: string) {
  const alert = await prisma.alert.findUnique({ where: { id: alertId } });
  return alert ? mapAlert(alert) : null;
}

export const alertService = {
  createAlert,
  listAlerts,
  getAlert,
};
