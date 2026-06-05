import { Response } from 'express';
import { Occurrence } from '../models/Occurrence';
import { User } from '../models/User';
import type { AuthRequest } from '../middleware/auth';
import PDFDocument from 'pdfkit';

export const exportCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, from, to, assignedTo } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) {
        const endDate = new Date(to as string);
        endDate.setDate(endDate.getDate() + 1);
        filter.createdAt.$lte = endDate;
      }
    }

    const occurrences = await Occurrence.find(filter)
      .populate('createdBy', 'fullName email department')
      .populate('assignedTo', 'fullName email department')
      .populate('category', 'name')
      .populate('resolvidoPor', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      'ID', 'Título', 'Status', 'Prioridade', 'Categoria',
      'Criado por', 'Departamento', 'Responsável',
      'Criado em', 'Resolvido em', 'Tempo (min)',
      'Resolução', 'Causa Raiz',
    ];

    const rows = occurrences.map((o: any) => [
      o._id.toString(),
      `"${(o.title || '').replace(/"/g, '""')}"`,
      o.status,
      o.priority,
      `"${o.category?.name || ''}"`,
      `"${o.createdBy?.fullName || ''}"`,
      `"${o.createdBy?.department || ''}"`,
      `"${o.assignedTo?.fullName || ''}"`,
      o.createdAt ? new Date(o.createdAt).toISOString() : '',
      o.resolvidoEm ? new Date(o.resolvidoEm).toISOString() : '',
      o.timeSpentMinutes || 0,
      `"${(o.resolucao || '').replace(/"/g, '""')}"`,
      `"${o.rca?.causaRaiz || ''}"`,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r: string[]) => r.join(',')),
    ].join('\n');

    const filename = `relatorio-ocorrencias-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv);
  } catch (error: any) {
    console.error('[exportCSV]', error.message);
    res.status(400).json({ error: 'Erro ao exportar relatório' });
  }
};

export const reportSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;
    const dateFilter: any = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from as string);
      if (to) {
        const endDate = new Date(to as string);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.createdAt.$lte = endDate;
      }
    }

    const [
      totalOccurrences,
      statusCounts,
      priorityCounts,
      topCreators,
      avgResolutionTime,
      slaStats,
    ] = await Promise.all([
      Occurrence.countDocuments(dateFilter),
      Occurrence.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Occurrence.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Occurrence.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$createdBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Occurrence.aggregate([
        { $match: { ...dateFilter, status: 'finalizada', resolvidoEm: { $ne: null } } },
        {
          $project: {
            resolutionTime: {
              $divide: [
                { $subtract: ['$resolvidoEm', '$createdAt'] },
                60000,
              ],
            },
          },
        },
        { $group: { _id: null, avgMinutes: { $avg: '$resolutionTime' } } },
      ]),
      Occurrence.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            dentro: { $sum: { $cond: [{ $eq: ['$slaStatus', 'dentro'] }, 1, 0] } },
            atrasado: { $sum: { $cond: [{ $eq: ['$slaStatus', 'atrasado'] }, 1, 0] } },
            violado: { $sum: { $cond: [{ $eq: ['$slaStatus', 'violado'] }, 1, 0] } },
            semSLA: { $sum: { $cond: [{ $eq: ['$slaStatus', null] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const creatorIds = topCreators.map((c: any) => c._id);
    const users = await User.find({ _id: { $in: creatorIds } })
      .select('fullName email department')
      .lean();

    const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
    const topCreatorsWithNames = topCreators.map((c: any) => ({
      userId: c._id,
      count: c.count,
      user: userMap.get(c._id?.toString()) || null,
    }));

    res.json({
      totalOccurrences,
      statusCounts: Object.fromEntries(statusCounts.map((s: any) => [s._id, s.count])),
      priorityCounts: Object.fromEntries(priorityCounts.map((p: any) => [p._id, p.count])),
      topCreators: topCreatorsWithNames,
      avgResolutionTimeMinutes: Math.round(avgResolutionTime[0]?.avgMinutes || 0),
      slaStats: slaStats[0] || { dentro: 0, atrasado: 0, violado: 0, semSLA: 0 },
    });
  } catch (error: any) {
    console.error('[reportSummary]', error.message);
    res.status(400).json({ error: 'Erro ao gerar resumo do relatório' });
  }
};

export const exportPDF = async (req: AuthRequest, res: Response) => {
  try {

    const { from, to } = req.query;
    const dateFilter: any = {};
    if (from) dateFilter.createdAt = { $gte: new Date(from as string) };
    if (to) {
      if (!dateFilter.createdAt) dateFilter.createdAt = {};
      const endDate = new Date(to as string);
      endDate.setDate(endDate.getDate() + 1);
      dateFilter.createdAt.$lte = endDate;
    }

    const occurrences = await Occurrence.find(dateFilter)
      .populate('createdBy', 'fullName department')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const filename = `relatorio-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Ocorrências', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });
    doc.moveDown();

    if (from || to) {
      doc.fontSize(9).fillColor('#666')
        .text(`Período: ${from || 'início'} até ${to || 'hoje'}`)
        .fillColor('#000');
    }
    doc.moveDown();

    const statusCount: Record<string, number> = {};
    for (const o of occurrences as any[]) {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    }

    doc.fontSize(12).font('Helvetica-Bold').text('Resumo');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total: ${occurrences.length}`);
    doc.text(`Abertas: ${statusCount['aberta'] || 0}`);
    doc.text(`Em Execução: ${statusCount['em_execucao'] || 0}`);
    doc.text(`Finalizadas: ${statusCount['finalizada'] || 0}`);
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text('Ocorrências');
    doc.fontSize(8).font('Helvetica');

    for (const o of occurrences as any[]) {
      const y = doc.y;
      if (y > 700) doc.addPage();

      doc.font('Helvetica-Bold').text(o.title || 'Sem título');
      doc.font('Helvetica').fillColor('#666')
        .text(`Status: ${o.status} | Prioridade: ${o.priority} | Criado por: ${o.createdBy?.fullName || 'N/A'}`)
        .fillColor('#000');
      doc.moveDown(0.5);
    }

    doc.end();
  } catch (error: any) {
    console.error('[exportPDF]', error.message);
    if (!res.headersSent) {
      res.status(400).json({ error: 'Erro ao gerar PDF' });
    }
  }
};
