import { Response } from 'express';
import { Runbook } from '../models/Runbook';
import { RunbookExecution } from '../models/RunbookExecution';
import { User } from '../models/User';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const startExecution = async (req: AuthRequest, res: Response) => {
  try {
    const { runbookId, occurrenceId } = req.body;
    const runbook = await Runbook.findById(runbookId);
    if (!runbook) return res.status(404).json({ error: 'Runbook não encontrado' });

    const user = await User.findById(req.userId);

    const execution = await RunbookExecution.create({
      runbookId: runbook._id.toString(),
      runbookTitle: runbook.title,
      occurrenceId,
      startedBy: req.userId!,
      startedByName: user?.fullName,
      startedAt: new Date(),
      status: 'running',
      steps: runbook.steps.map((s) => ({
        order: s.order,
        description: s.description,
        status: s.order === 0 ? 'in_progress' : 'pending',
      })),
      currentStep: 0,
    });

    const populated = await execution.populate('runbookId', 'title');
    res.status(201).json(populated);
  } catch (error: any) {
    logger.error('[startExecution]', error.message);
    res.status(400).json({ error: 'Erro ao iniciar execução' });
  }
};

export const completeStep = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes, action } = req.body;

    const execution = await RunbookExecution.findById(id);
    if (!execution) return res.status(404).json({ error: 'Execução não encontrada' });
    if (execution.status !== 'running')
      return res.status(400).json({ error: 'Execução já foi finalizada' });

    const step = execution.steps[execution.currentStep];
    if (!step) return res.status(400).json({ error: 'Passo inválido' });

    step.status = action === 'skip' ? 'skipped' : 'completed';
    step.completedAt = new Date();
    step.completedBy = req.userId;
    if (notes) step.notes = notes;

    const nextIndex = execution.currentStep + 1;
    if (nextIndex < execution.steps.length) {
      execution.currentStep = nextIndex;
      execution.steps[nextIndex].status = 'in_progress';
    } else {
      execution.status = 'completed';
      execution.completedAt = new Date();
    }

    await execution.save();
    res.json(execution);
  } catch (error: any) {
    logger.error('[completeStep]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar passo' });
  }
};

export const cancelExecution = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const execution = await RunbookExecution.findById(id);
    if (!execution) return res.status(404).json({ error: 'Execução não encontrada' });
    if (execution.status !== 'running')
      return res.status(400).json({ error: 'Execução já foi finalizada' });

    execution.status = 'cancelled';
    execution.completedAt = new Date();
    await execution.save();
    res.json(execution);
  } catch (error: any) {
    logger.error('[cancelExecution]', error.message);
    res.status(400).json({ error: 'Erro ao cancelar execução' });
  }
};

export const getExecution = async (req: AuthRequest, res: Response) => {
  try {
    const execution = await RunbookExecution.findById(req.params.id);
    if (!execution) return res.status(404).json({ error: 'Execução não encontrada' });
    res.json(execution);
  } catch (error: any) {
    logger.error('[getExecution]', error.message);
    res.status(400).json({ error: 'Erro ao buscar execução' });
  }
};

export const listExecutions = async (req: AuthRequest, res: Response) => {
  try {
    const { status, runbookId, occurrenceId, page, limit } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (runbookId) filter.runbookId = runbookId;
    if (occurrenceId) filter.occurrenceId = occurrenceId;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [executions, total] = await Promise.all([
      RunbookExecution.find(filter).sort({ startedAt: -1 }).skip(skip).limit(limitNum),
      RunbookExecution.countDocuments(filter),
    ]);

    res.json({
      data: executions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    logger.error('[listExecutions]', error.message);
    res.status(400).json({ error: 'Erro ao listar execuções' });
  }
};
