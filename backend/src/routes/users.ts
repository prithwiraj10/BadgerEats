import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { userService } from '../services/userService.js';
import { HttpError } from '../lib/errorHandler.js';

const usersRouter = Router();

const phoneRegex = /^\+?[1-9]\d{6,14}$/;

const createUserSchema = z.object({
  name: z.string().min(1),
  phone: z.string().regex(phoneRegex, 'Phone must be E.164 format'),
  preferences: z.array(z.string()).default([]),
});

const updatePrefsSchema = z.object({
  preferences: z.array(z.string()),
});

usersRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await userService.createUser(data);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

usersRouter.put('/:id/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = updatePrefsSchema.parse(req.body);
    const user = await userService.updatePreferences(id, data.preferences);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/:id/unsubscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.unsubscribe(id);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json({ message: 'User unsubscribed', user });
  } catch (err) {
    next(err);
  }
});

usersRouter.post('/:id/resubscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.resubscribe(id);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json({ message: 'User resubscribed', user });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await userService.getUser(id);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

export { usersRouter };
