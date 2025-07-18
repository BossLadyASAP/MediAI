import PDFDocument from 'pdfkit';
import { SymptomEntry, MealEntry, MedicationEntry, MoodEntry } from '../models/tracker';
import { Response } from 'express';

export async function generateHealthReportPDF(opts: {
  symptoms: SymptomEntry[];
  meals: MealEntry[];
  medications: MedicationEntry[];
  moods: MoodEntry[];
  analysis: any;
  res: Response;
}) {
  const { symptoms, meals, medications, moods, analysis, res } = opts;
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="HealthReport.pdf"');
  doc.pipe(res);

  doc.fontSize(22).text('Health Tracker Report', { align: 'center' });
  doc.moveDown();

  // Analysis Summary
  doc.fontSize(16).text('Summary & Trends', { underline: true });
  doc.fontSize(12).moveDown(0.5);
  doc.text(`Total Symptoms: ${analysis.symptomSummary.total}`);
  doc.text(`Most Common Symptoms: ${analysis.symptomSummary.mostCommon.map((s: any) => `${s.description} (${s.count})`).join(', ')}`);
  doc.text(`Medication Days: ${analysis.medicationSummary.adherenceDays}`);
  doc.text(`Mood Breakdown: ${Object.entries(analysis.moodSummary.byMood).map(([m, c]) => `${m}: ${c}`).join(', ')}`);
  doc.moveDown();

  // Symptoms Table
  doc.fontSize(16).text('Symptoms', { underline: true });
  symptoms.forEach((s, i) => {
    doc.fontSize(11).text(`${i + 1}. ${s.date.toISOString().slice(0,10)} - ${s.description} (${s.severity})${s.notes ? ' - ' + s.notes : ''}`);
  });
  doc.moveDown();

  // Meals Table
  doc.fontSize(16).text('Meals', { underline: true });
  meals.forEach((m, i) => {
    doc.fontSize(11).text(`${i + 1}. ${m.date.toISOString().slice(0,10)} - ${m.meal}${m.notes ? ' - ' + m.notes : ''}`);
  });
  doc.moveDown();

  // Medications Table
  doc.fontSize(16).text('Medications', { underline: true });
  medications.forEach((m, i) => {
    doc.fontSize(11).text(`${i + 1}. ${m.date.toISOString().slice(0,10)} - ${m.medication} (${m.dose})${m.notes ? ' - ' + m.notes : ''}`);
  });
  doc.moveDown();

  // Mood Table
  doc.fontSize(16).text('Mood Log', { underline: true });
  moods.forEach((m, i) => {
    doc.fontSize(11).text(`${i + 1}. ${m.date.toISOString().slice(0,10)} - ${m.mood}`);
  });

  doc.end();
}
