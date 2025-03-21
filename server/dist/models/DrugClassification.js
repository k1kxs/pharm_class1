"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Схемы для каждого уровня данных
const CategorySchema = new mongoose_1.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    preparations: { type: String, default: '' }
});
const SubgroupSchema = new mongoose_1.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    categories: [CategorySchema]
});
const GroupSchema = new mongoose_1.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    preparations: { type: String },
    subgroups: [SubgroupSchema]
});
const CycleSchema = new mongoose_1.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    gradient: { type: String, default: 'linear-gradient(to right, #4f46e5, #818cf8)' },
    groups: [GroupSchema]
});
// Основная схема для всей классификации лекарств
const DrugClassificationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
DrugClassificationSchema.pre('save', function (next) {
    this.lastModified = new Date();
    this.version += 1;
    next();
});
exports.default = mongoose_1.default.model('DrugClassification', DrugClassificationSchema);
