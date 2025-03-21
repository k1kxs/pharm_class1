import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Интерфейс для пользователя
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  loginAttempts: number;
  lockUntil: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

// Схема пользователя
const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  }
});

// Хеширование пароля перед сохранением
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Метод для сравнения паролей
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Метод для проверки, заблокирован ли пользователь
UserSchema.methods.isLocked = function(): boolean {
  // Проверка, истек ли срок блокировки
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Метод для увеличения счетчика неудачных попыток входа
UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // Если у пользователя есть lockUntil и он истек, сбрасываем счетчик попыток
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = 0;
    await this.save();
    return;
  }
  
  // Увеличиваем счетчик попыток
  this.loginAttempts += 1;
  
  // Блокируем пользователя после MAX_LOGIN_ATTEMPTS неудачных попыток
  if (this.loginAttempts >= 5) {
    // Блокируем на 15 минут
    this.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  
  await this.save();
};

export default mongoose.model<IUser>('User', UserSchema); 