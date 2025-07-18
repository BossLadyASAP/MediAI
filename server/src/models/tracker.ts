import mongoose, { Schema, Document } from 'mongoose';

export interface SymptomEntry extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

const SymptomSchema = new Schema<SymptomEntry>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
  notes: { type: String },
});

export const Symptom = mongoose.model<SymptomEntry>('Symptom', SymptomSchema);

export interface MealEntry extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  meal: string;
  notes?: string;
}

const MealSchema = new Schema<MealEntry>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  meal: { type: String, required: true },
  notes: { type: String },
});

export const Meal = mongoose.model<MealEntry>('Meal', MealSchema);

export interface MedicationEntry extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  medication: string;
  dose: string;
  notes?: string;
}

const MedicationSchema = new Schema<MedicationEntry>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  medication: { type: String, required: true },
  dose: { type: String, required: true },
  notes: { type: String },
});

export const Medication = mongoose.model<MedicationEntry>('Medication', MedicationSchema);

export interface MoodEntry extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  mood: string;
}

const MoodSchema = new Schema<MoodEntry>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mood: { type: String, required: true },
});

export const Mood = mongoose.model<MoodEntry>('Mood', MoodSchema);
