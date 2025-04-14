import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Clock, RotateCcw, AlertCircle, Check, Plus } from 'lucide-react';
import { backupAPI } from '../services/api';
import { toast } from 'react-toastify';

interface Backup {
  id: string;
  name: string;
  date: number;
  data: any;
}

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadData: () => Promise<void>;
}

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onReloadData }) => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBackupName, setNewBackupName] = useState('');
  const [showConfirmRestore, setShowConfirmRestore] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Загрузка списка резервных копий
  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const backupsList = await backupAPI.getBackups();
      setBackups(backupsList);
    } catch (error) {
      console.error('Ошибка при загрузке резервных копий:', error);
      toast.error('Не удалось загрузить список резервных копий');
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем резервные копии при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen]);

  // Создание новой резервной копии
  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      await backupAPI.createBackup(newBackupName.trim() || undefined);
      toast.success('Резервная копия успешно создана');
      setNewBackupName('');
      loadBackups();
    } catch (error) {
      console.error('Ошибка при создании резервной копии:', error);
      toast.error('Не удалось создать резервную копию');
    } finally {
      setIsCreating(false);
    }
  };

  // Восстановление из резервной копии
  const handleRestoreBackup = async (backupId: string) => {
    setIsLoading(true);
    try {
      await backupAPI.restoreBackup(backupId);
      toast.success('Данные успешно восстановлены из резервной копии');
      setShowConfirmRestore(null);
      onClose();
      onReloadData();
    } catch (error) {
      console.error('Ошибка при восстановлении из резервной копии:', error);
      toast.error('Не удалось восстановить данные из резервной копии');
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление резервной копии
  const handleDeleteBackup = async (backupId: string) => {
    setIsLoading(true);
    try {
      await backupAPI.deleteBackup(backupId);
      toast.success('Резервная копия успешно удалена');
      setShowConfirmDelete(null);
      loadBackups();
    } catch (error) {
      console.error('Ошибка при удалении резервной копии:', error);
      toast.error('Не удалось удалить резервную копию');
    } finally {
      setIsLoading(false);
    }
  };

  // Форматирование даты
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="py-4 px-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Save className="mr-2" size={20} />
            Управление резервными копиями
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-auto flex-1">
          {/* Форма создания новой резервной копии */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">Создать новую резервную копию</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Введите название (необязательно)"
                value={newBackupName}
                onChange={(e) => setNewBackupName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                disabled={isCreating}
              />
              <button
                onClick={handleCreateBackup}
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Создать
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-blue-600">
              Резервные копии автоматически удаляются через 7 дней.
            </p>
          </div>

          {/* Список резервных копий */}
          <h3 className="text-lg font-semibold mb-3">Доступные резервные копии</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Загрузка резервных копий...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <AlertCircle size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Резервные копии не найдены</p>
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  {/* Подтверждение восстановления */}
                  {showConfirmRestore === backup.id ? (
                    <div className="mb-3 bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-yellow-800 mb-2">
                        <AlertCircle size={16} className="inline mr-1" />
                        Восстановить данные из этой резервной копии? Текущие данные будут заменены.
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRestoreBackup(backup.id)}
                          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm flex items-center"
                          disabled={isLoading}
                        >
                          <Check size={14} className="mr-1" />
                          Подтвердить
                        </button>
                        <button 
                          onClick={() => setShowConfirmRestore(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                          disabled={isLoading}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Подтверждение удаления */}
                  {showConfirmDelete === backup.id ? (
                    <div className="mb-3 bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-red-800 mb-2">
                        <AlertCircle size={16} className="inline mr-1" />
                        Удалить эту резервную копию? Это действие нельзя отменить.
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center"
                          disabled={isLoading}
                        >
                          <Check size={14} className="mr-1" />
                          Удалить
                        </button>
                        <button 
                          onClick={() => setShowConfirmDelete(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                          disabled={isLoading}
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{backup.name}</h4>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(backup.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {new Date(backup.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowConfirmRestore(backup.id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Восстановить из этой копии"
                        disabled={isLoading}
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button 
                        onClick={() => setShowConfirmDelete(backup.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                        title="Удалить эту копию"
                        disabled={isLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="py-3 px-6 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupModal; 