import { Prisma } from '@prisma/client';
import { prisma } from '../db/client.js';
import { logger } from '../lib/logger.js';
import { HttpError } from '../lib/errorHandler.js';
const mapUser = (user) => {
    const prefs = typeof user.preferences === 'string'
        ? JSON.parse(user.preferences)
        : (user.preferences ?? []);
    return {
        id: user.id,
        name: user.name,
        phone: user.phoneE164,
        preferences: prefs,
        subscribed: user.subscribed,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
async function createUser(input) {
    try {
        const user = await prisma.user.create({
            data: {
                name: input.name,
                phoneE164: input.phone,
                preferences: JSON.stringify(input.preferences),
            },
        });
        return mapUser(user);
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            const prismaErr = err;
            if (prismaErr.code === 'P2002') {
                throw new HttpError(409, 'Phone number already registered');
            }
        }
        logger.error({ err }, 'Failed to create user');
        throw err;
    }
}
async function updatePreferences(userId, preferences) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { preferences: JSON.stringify(preferences) },
        });
        return mapUser(user);
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            const prismaErr = err;
            if (prismaErr.code === 'P2025') {
                return null;
            }
        }
        logger.error({ err, userId }, 'Failed to update preferences');
        throw err;
    }
}
async function unsubscribe(userId) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { subscribed: false },
        });
        return mapUser(user);
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            const prismaErr = err;
            if (prismaErr.code === 'P2025') {
                return null;
            }
        }
        logger.error({ err, userId }, 'Failed to unsubscribe user');
        throw err;
    }
}
async function resubscribe(userId) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { subscribed: true },
        });
        return mapUser(user);
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            const prismaErr = err;
            if (prismaErr.code === 'P2025') {
                return null;
            }
        }
        logger.error({ err, userId }, 'Failed to resubscribe user');
        throw err;
    }
}
async function listUsers(limit = 50) {
    const users = await prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
    });
    return users.map(mapUser);
}
async function getUser(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? mapUser(user) : null;
}
async function findSubscribedUsersByTags(tags) {
    const users = await prisma.user.findMany({
        where: {
            subscribed: true,
        },
    });
    if (tags.length === 0) {
        return users.map(mapUser);
    }
    return users
        .filter((user) => {
        const prefs = JSON.parse(user.preferences) || [];
        return prefs.length === 0 || prefs.some((pref) => tags.includes(pref));
    })
        .map(mapUser);
}
async function getUserByPhone(phone) {
    const user = await prisma.user.findUnique({ where: { phoneE164: phone } });
    return user ? mapUser(user) : null;
}
export const userService = {
    createUser,
    updatePreferences,
    unsubscribe,
    resubscribe,
    listUsers,
    getUser,
    findSubscribedUsersByTags,
    getUserByPhone,
};
