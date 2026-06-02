import { Request, Response } from 'express';
import { Occurrence } from '../models/Occurrence';
import { occurrenceSchema, updateOccurrenceSchema } from '@noc/shared';
import type { AuthRequest } from '../middleware/auth';

export const listOccurrences = async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedTo, priority } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    const occurrences = await Occurrence.find(filter)
      .populate('createdBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(occurrences);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findById(id)
      .populate('createdBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('comments.author', 'fullName email')
      .populate('history.changedBy', 'fullName email');

    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    res.json(occurrence);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const data = occurrenceSchema.parse(req.body);

    const occurrence = await Occurrence.create({
      ...data,
      createdBy: req.userId,
      comments: [],
      attachments: [],
      history: [],
    });

    const populated = await occurrence.populate([
      { path: 'createdBy', select: 'fullName email' },
      { path: 'assignedTo', select: 'fullName email' },
    ]);

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateOccurrenceSchema.parse(req.body);

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    const oldData = occurrence.toObject();
    Object.assign(occurrence, data);
    await occurrence.save();

    // Add to history
    for (const key of Object.keys(data)) {
      if (oldData[key as keyof typeof oldData] !== data[key as keyof typeof data]) {
        occurrence.history.push({
          field: key,
          oldValue: String(oldData[key as keyof typeof oldData] || ''),
          newValue: String(data[key as keyof typeof data] || ''),
          changedBy: req.userId as any,
          changedAt: new Date(),
        });
      }
    }
    await occurrence.save();

    const updated = await occurrence.populate([
      { path: 'createdBy', select: 'fullName email' },
      { path: 'assignedTo', select: 'fullName email' },
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findByIdAndDelete(id);

    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    res.json({ message: 'Occurrence deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    occurrence.comments.push({
      author: req.userId as any,
      text,
      createdAt: new Date(),
    });

    await occurrence.save();

    const updated = await occurrence.populate([
      { path: 'comments.author', select: 'fullName email' },
      { path: 'createdBy', select: 'fullName email' },
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
