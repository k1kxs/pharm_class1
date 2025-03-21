import mongoose, { Schema, Document } from 'mongoose';

// Интерфейсы для всех типов данных
interface ICategory {
  id: number;
  name: string;
  preparations: string;
}

interface ISubgroup {
  id: number;
  name: string;
  categories: ICategory[];
}

interface IGroup {
  id: number;
  name: string;
  subgroups: ISubgroup[];
  preparations?: string;
}

interface ICycle {
  id: number;
  name: string;
  gradient: string;
  groups: IGroup[];
}

// Интерфейс документа классификации лекарств
export interface IDrugClassification extends Document {
  user: mongoose.Types.ObjectId;
  cycles: ICycle[];
  lastModified: Date;
  version: number;
}

// Схемы для каждого уровня данных
const CategorySchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  preparations: { type: String, default: '' }
});

const SubgroupSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  categories: [CategorySchema]
});

const GroupSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  preparations: { type: String },
  subgroups: [SubgroupSchema]
});

const CycleSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  gradient: { type: String, default: 'linear-gradient(to right, #4f46e5, #818cf8)' },
  groups: [GroupSchema]
});

// Основная схема для всей классификации лекарств
const DrugClassificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cycles: [CycleSchema],
  lastModified: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
});

// Обновление даты последней модификации перед сохранением
DrugClassificationSchema.pre<IDrugClassification>('save', function(next) {
  this.lastModified = new Date();
  this.version += 1;
  next();
});

export default mongoose.model<IDrugClassification>('DrugClassification', DrugClassificationSchema); 