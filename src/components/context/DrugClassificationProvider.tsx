import React, { useState, useEffect, useMemo } from 'react';
import DrugClassificationContext, { DrugClassificationContextType } from './DrugClassificationContext';
import { Cycle, Group, Subgroup, Category, DraggedGroup, DraggedSubgroup, DraggedCategory } from '../types';
import { textContainsQuery } from '../utils/textUtils';
import PDFGenerator from '../PDFGenerator';
import { useAuth } from './AuthProvider';
import { dataAPI } from '../../services/api';

interface DrugClassificationProviderProps {
  children: React.ReactNode;
}

export const DrugClassificationProvider: React.FC<DrugClassificationProviderProps> = ({ children }) => {
  // Получаем данные аутентификации
  const { isAuthenticated, logout, login } = useAuth();
  
  // Состояния для хранения данных
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycles, setSelectedCycles] = useState<number[]>([]);
  
  // Состояния для модальных окон
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editType, setEditType] = useState<'cycle' | 'group' | 'subgroup' | 'category'>('cycle');
  const [editTitle, setEditTitle] = useState('');
  const [editData, setEditData] = useState<any>(null);
  const [parentForEdit, setParentForEdit] = useState<number | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  
  // Состояния для редактирования заголовков
  const [isEditingTitle, setIsEditingTitle] = useState<number | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  
  // Состояния для поиска
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для drag and drop
  const [draggedCycle, setDraggedCycle] = useState<Cycle | null>(null);
  const [dragOverCycle, setDragOverCycle] = useState<Cycle | null>(null);
  const [draggedGroup, setDraggedGroup] = useState<DraggedGroup | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<DraggedGroup | null>(null);
  const [draggedSubgroup, setDraggedSubgroup] = useState<DraggedSubgroup | null>(null);
  const [dragOverSubgroup, setDragOverSubgroup] = useState<DraggedSubgroup | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<DraggedCategory | null>(null);
  
  // Загрузка данных из API при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dataAPI.getData();
        if (result.cycles) {
          setCycles(result.cycles);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    }
    
    fetchData();
  }, []);
  
  // Сохранение данных через API при изменении
  useEffect(() => {
    if (cycles.length > 0) {
      const saveData = async () => {
        try {
          await dataAPI.saveData(cycles);
        } catch (error) {
          console.error('Ошибка при сохранении данных:', error);
        }
      }
      
      saveData();
    }
  }, [cycles]);
  
  // Использование useEffect для проверки аутентификации
  useEffect(() => {
    // Если пользователь не аутентифицирован, выходим из режима редактирования
    if (!isAuthenticated && isEditorMode) {
      setIsEditorMode(false);
    }
  }, [isAuthenticated, isEditorMode]);
  
  // Фильтрация циклов по поисковому запросу
  const filteredCycles = useMemo(() => {
    if (!searchQuery.trim()) {
      return cycles;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    return cycles.filter(cycle => {
      // Поиск в названии цикла
      if (cycle.name.toLowerCase().includes(query)) {
        return true;
      }
      
      // Поиск в группах и их препаратах
      const hasMatchInGroups = cycle.groups.some(group => {
        // Поиск в названии группы
        if (group.name.toLowerCase().includes(query)) {
          return true;
        }
        
        // Поиск в препаратах группы
        if (group.preparations && textContainsQuery(group.preparations, query)) {
          return true;
        }
        
        // Поиск в подгруппах
        return group.subgroups.some(subgroup => {
          // Поиск в названии подгруппы
          if (subgroup.name.toLowerCase().includes(query)) {
            return true;
          }
          
          // Поиск в категориях
          return subgroup.categories.some(category => {
            // Поиск в названии категории
            if (category.name.toLowerCase().includes(query)) {
              return true;
            }
            
            // Поиск в препаратах категории
            return textContainsQuery(category.preparations, query);
          });
        });
      });
      
      return hasMatchInGroups;
    });
  }, [cycles, searchQuery]);
  
  // Открытие модального окна для ввода пароля
  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setPasswordError(null);
  }
  
  // Закрытие модального окна для ввода пароля
  const closePasswordModal = () => {
    setPasswordModalOpen(false);
  }
  
  // Обработчик успешной аутентификации
  const handlePasswordSubmit = async (password: string) => {
    console.log('handlePasswordSubmit вызван с паролем:', password);
    
    try {
      // Используем AuthProvider для входа
      const result = await login('admin', password);
      console.log('Результат аутентификации:', result);
      
      if (result.success) {
        setIsEditorMode(true);
        setPasswordModalOpen(false);
        setPasswordError(null);
      } else {
        setPasswordError(result.message);
      }
    } catch (error) {
      console.error('Ошибка при аутентификации:', error);
      setPasswordError('Неверный пароль. Попробуйте еще раз.');
    }
  };
  
  // Выход из режима редактирования
  const exitEditorMode = () => {
    setIsEditorMode(false);
    // Выход из системы при выходе из режима редактирования
    logout();
  }
  
  // Открытие модального окна редактирования
  const openEditModal = (type: 'cycle' | 'group' | 'subgroup' | 'category', parentId?: number) => {
    console.log('openEditModal:', type, parentId);
    setEditType(type);
    setParentForEdit(parentId || null);
    
    // Найти существующие данные для редактирования
    if (parentId) {
      let itemData = null;
      
      switch (type) {
        case 'cycle':
          // Для циклов поиск по ID
          const cycleToEdit = cycles.find(c => c.id === parentId);
          if (cycleToEdit) {
            itemData = cycleToEdit;
            setEditTitle('Редактировать цикл');
          }
          break;
          
        case 'group':
          // Ищем группу во всех циклах
          cycles.forEach(cycle => {
            // Поиск группы для редактирования
            const groupToEdit = cycle.groups.find(g => g.id === parentId);
            if (groupToEdit) {
              itemData = groupToEdit;
              setEditTitle('Редактировать группу');
            }
          });
          break;
          
        case 'category':
          // Ищем категорию по ID во всех циклах и подгруппах
          cycles.forEach(cycle => {
            cycle.groups.forEach(group => {
              group.subgroups.forEach(subgroup => {
                // Поиск категории для редактирования
                const categoryToEdit = subgroup.categories.find(c => c.id === parentId);
                if (categoryToEdit) {
                  itemData = categoryToEdit;
                  setEditTitle('Редактировать категорию');
                }
              });
            });
          });
          break;
          
        case 'subgroup':
          // Ищем подгруппу по ID во всех циклах
          cycles.forEach(cycle => {
            cycle.groups.forEach(group => {
              // Поиск подгруппы для редактирования
              const subgroupToEdit = group.subgroups.find(s => s.id === parentId);
              if (subgroupToEdit) {
                itemData = subgroupToEdit;
                setEditTitle('Редактировать подгруппу');
              }
            });
          });
          break;
      }
      
      if (itemData) {
        console.log('Найдены данные для редактирования:', itemData);
        setEditData(itemData);
      } else {
        // Если не нашли элемент для редактирования, значит добавляем новый
        console.log('Не найдены данные для редактирования, создаем новый элемент');
        setEditData(null);
        switch (type) {
          case 'cycle':
            setEditTitle('Добавить новый цикл');
            break;
          case 'group':
            setEditTitle('Добавить новую группу');
            break;
          case 'subgroup':
            setEditTitle('Добавить новую подгруппу');
            break;
          case 'category':
            setEditTitle('Добавить новую категорию');
            break;
        }
      }
    } else {
      // Нет ID родителя, значит создаём новый элемент
      console.log('Создаем новый элемент (без ID родителя)');
      setEditData(null);
      switch (type) {
        case 'cycle':
          setEditTitle('Добавить новый цикл');
          break;
        case 'group':
          setEditTitle('Добавить новую группу');
          break;
        case 'subgroup':
          setEditTitle('Добавить новую подгруппу');
          break;
        case 'category':
          setEditTitle('Добавить новую категорию');
          break;
      }
    }
    
    setEditModalOpen(true);
  }
  
  // Закрытие модального окна редактирования
  const closeEditModal = () => {
    setEditModalOpen(false);
  }
  
  // Сохранение данных после редактирования
  const handleSaveEdit = (data: any) => {
    let newCycles = [...cycles];
    
    // Проверяем, есть ли у данных ID - если есть, обновляем существующий элемент
    const isUpdate = data.id !== undefined;
    
    // Если это новый элемент, генерируем ID
    const newItem = isUpdate 
      ? data 
      : {
          id: Date.now(),
          ...data
        };
    
    console.log('handleSaveEdit:', newItem, 'isUpdate:', isUpdate);
    
    switch (editType) {
      case 'cycle':
        if (isUpdate) {
          // Обновляем существующий цикл
          newCycles = newCycles.map(cycle => 
            cycle.id === newItem.id 
              ? { ...cycle, name: newItem.name, gradient: newItem.gradient } 
              : cycle
          );
        } else {
          // Добавляем новый цикл
          newCycles.push(newItem as Cycle);
        }
        break;
        
      case 'group':
        if (isUpdate) {
          // Обновляем существующую группу
          newCycles = newCycles.map(cycle => {
            return {
              ...cycle,
              groups: cycle.groups.map(group => {
                if (group.id === newItem.id) {
                  console.log('Обновляем препараты группы:', newItem.preparations);
                  return { 
                    ...group, 
                    name: newItem.name, 
                    preparations: newItem.preparations 
                  };
                }
                return group;
              })
            };
          });
        } else if (parentForEdit !== null) {
          // Добавляем новую группу
          newCycles = newCycles.map(cycle => {
            if (cycle.id === parentForEdit) {
              return {
                ...cycle,
                groups: [...cycle.groups, newItem as Group]
              }
            }
            return cycle;
          });
        }
        break;
        
      case 'subgroup':
        if (isUpdate) {
          // Обновляем существующую подгруппу
          newCycles = newCycles.map(cycle => {
            return {
              ...cycle,
              groups: cycle.groups.map(group => {
                return {
                  ...group,
                  subgroups: group.subgroups.map(subgroup => 
                    subgroup.id === newItem.id 
                      ? { ...subgroup, name: newItem.name } 
                      : subgroup
                  )
                };
              })
            };
          });
        } else if (parentForEdit !== null) {
          // Добавляем новую подгруппу
          newCycles = newCycles.map(cycle => {
            return {
              ...cycle,
              groups: cycle.groups.map(group => {
                if (group.id === parentForEdit) {
                  return {
                    ...group,
                    subgroups: [...group.subgroups, newItem as Subgroup]
                  }
                }
                return group;
              })
            }
          });
        }
        break;
        
      case 'category':
        if (isUpdate) {
          // Обновляем существующую категорию
          newCycles = newCycles.map(cycle => {
            return {
              ...cycle,
              groups: cycle.groups.map(group => {
                return {
                  ...group,
                  subgroups: group.subgroups.map(subgroup => {
                    return {
                      ...subgroup,
                      categories: subgroup.categories.map(category => {
                        if (category.id === newItem.id) {
                          console.log('Обновляем препараты категории:', newItem.preparations);
                          return { 
                            ...category, 
                            name: newItem.name, 
                            preparations: newItem.preparations 
                          };
                        }
                        return category;
                      })
                    };
                  })
                };
              })
            };
          });
        } else if (parentForEdit !== null) {
          // Добавляем новую категорию
          newCycles = newCycles.map(cycle => {
            return {
              ...cycle,
              groups: cycle.groups.map(group => {
                return {
                  ...group,
                  subgroups: group.subgroups.map(subgroup => {
                    if (subgroup.id === parentForEdit) {
                      return {
                        ...subgroup,
                        categories: [...subgroup.categories, newItem as Category]
                      }
                    }
                    return subgroup;
                  })
                }
              })
            }
          });
        }
        break;
    }
    
    setCycles(newCycles);
  }
  
  // Открытие модального окна экспорта
  const openExportModal = () => {
    setExportModalOpen(true);
  }
  
  // Закрытие модального окна экспорта
  const closeExportModal = () => {
    setExportModalOpen(false);
  }
  
  // Обработчик экспорта в PDF
  const handleExport = (cycleIds: number[]) => {
    const pdfGenerator = new PDFGenerator(cycles, cycleIds);
    pdfGenerator.generatePDF();
  }
  
  // Открытие палитры цветов
  const openColorPicker = (cycleId: number) => {
    setSelectedCycleId(cycleId);
    setColorPickerOpen(true);
  }
  
  // Закрытие палитры цветов
  const closeColorPicker = () => {
    setColorPickerOpen(false);
  }
  
  // Обработчик изменения градиента цикла
  const handleColorSelect = (gradient: string) => {
    if (selectedCycleId === null) return;
    
    const newCycles = cycles.map(cycle => {
      if (cycle.id === selectedCycleId) {
        return { ...cycle, gradient }
      }
      return cycle;
    });
    
    setCycles(newCycles);
  }
  
  // Обработчик переключения состояния цикла (свернуть/развернуть)
  const toggleCycle = (cycleId: number) => {
    setSelectedCycles(prev => {
      if (prev.includes(cycleId)) {
        return prev.filter(id => id !== cycleId);
      } else {
        return [...prev, cycleId];
      }
    });
  }
  
  // Обработчики для редактирования заголовков
  const startEditingTitle = (type: string, item: any) => {
    setIsEditingTitle(item.id);
    setEditingTitleValue(item.name);
  }
  
  const finishEditingTitle = (type: string, id: number) => {
    if (!editingTitleValue.trim()) {
      setIsEditingTitle(null);
      return;
    }
    
    let newCycles = [...cycles];
    
    switch (type) {
      case 'cycle':
        newCycles = newCycles.map(cycle => {
          if (cycle.id === id) {
            return { ...cycle, name: editingTitleValue }
          }
          return cycle;
        });
        break;
        
      case 'group':
        newCycles = newCycles.map(cycle => {
          return {
            ...cycle,
            groups: cycle.groups.map(group => {
              if (group.id === id) {
                return { ...group, name: editingTitleValue }
              }
              return group;
            })
          }
        });
        break;
        
      case 'subgroup':
        newCycles = newCycles.map(cycle => {
          return {
            ...cycle,
            groups: cycle.groups.map(group => {
              return {
                ...group,
                subgroups: group.subgroups.map(subgroup => {
                  if (subgroup.id === id) {
                    return { ...subgroup, name: editingTitleValue }
                  }
                  return subgroup;
                })
              }
            })
          }
        });
        break;
        
      case 'category':
        newCycles = newCycles.map(cycle => {
          return {
            ...cycle,
            groups: cycle.groups.map(group => {
              return {
                ...group,
                subgroups: group.subgroups.map(subgroup => {
                  return {
                    ...subgroup,
                    categories: subgroup.categories.map(category => {
                      if (category.id === id) {
                        return { ...category, name: editingTitleValue }
                      }
                      return category;
                    })
                  }
                })
              }
            })
          }
        });
        break;
    }
    
    setCycles(newCycles);
    setIsEditingTitle(null);
  }
  
  // Обработчик удаления элементов
  const handleDelete = (type: string, id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      return;
    }
    
    let newCycles = [...cycles];
    
    switch (type) {
      case 'cycle':
        newCycles = newCycles.filter(cycle => cycle.id !== id);
        break;
        
      case 'group':
        newCycles = newCycles.map(cycle => {
          return {
            ...cycle,
            groups: cycle.groups.filter(group => group.id !== id)
          }
        });
        break;
        
      case 'subgroup':
        newCycles = newCycles.map(cycle => {
          return {
            ...cycle,
            groups: cycle.groups.map(group => {
              return {
                ...group,
                subgroups: group.subgroups.filter(subgroup => subgroup.id !== id)
              }
            })
          }
        });
        break;
        
      case 'category':
        newCycles = newCycles.map(cycle => {
          return {
            ...cycle,
            groups: cycle.groups.map(group => {
              return {
                ...group,
                subgroups: group.subgroups.map(subgroup => {
                  return {
                    ...subgroup,
                    categories: subgroup.categories.filter(category => category.id !== id)
                  }
                })
              }
            })
          }
        });
        break;
    }
    
    setCycles(newCycles);
  }
  
  // Обработчики для drag-and-drop циклов
  const handleCycleDragStart = (e: React.DragEvent, cycle: Cycle) => {
    setDraggedCycle(cycle);
  }
  
  const handleCycleDragOver = (e: React.DragEvent, cycle: Cycle) => {
    e.preventDefault();
    
    if (draggedCycle && draggedCycle.id !== cycle.id) {
      setDragOverCycle(cycle);
    }
  }
  
  const handleCycleDrop = (e: React.DragEvent, targetCycle: Cycle) => {
    e.preventDefault();
    
    if (draggedCycle && draggedCycle.id !== targetCycle.id) {
      const sourceIndex = cycles.findIndex(c => c.id === draggedCycle.id);
      const targetIndex = cycles.findIndex(c => c.id === targetCycle.id);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const newCycles = [...cycles];
        const [removed] = newCycles.splice(sourceIndex, 1);
        newCycles.splice(targetIndex, 0, removed);
        setCycles(newCycles);
      }
    }
    
    setDraggedCycle(null);
    setDragOverCycle(null);
  }
  
  const handleCycleDragEnd = () => {
    setDraggedCycle(null);
    setDragOverCycle(null);
  }
  
  // Обработчики для drag-and-drop групп
  const handleGroupDragStart = (e: React.DragEvent, group: Group, cycleId: number) => {
    setDraggedGroup({ ...group, cycleId });
  }
  
  const handleGroupDragOver = (e: React.DragEvent, group: Group, cycleId: number) => {
    e.preventDefault();
    
    if (draggedGroup && (draggedGroup.id !== group.id || draggedGroup.cycleId !== cycleId)) {
      setDragOverGroup({ ...group, cycleId });
    }
  }
  
  const handleGroupDrop = (e: React.DragEvent, targetGroup: Group, targetCycleId: number) => {
    e.preventDefault();
    
    if (draggedGroup) {
      const sourceCycleId = draggedGroup.cycleId;
      
      // Если это та же группа или если их позиции идентичны, не делаем ничего
      if (draggedGroup.id === targetGroup.id && sourceCycleId === targetCycleId) {
        setDraggedGroup(null);
        setDragOverGroup(null);
        return;
      }
      
      const newCycles = [...cycles];
      
      // Находим исходный и целевой циклы
      const sourceCycleIndex = newCycles.findIndex(c => c.id === sourceCycleId);
      const targetCycleIndex = newCycles.findIndex(c => c.id === targetCycleId);
      
      if (sourceCycleIndex !== -1 && targetCycleIndex !== -1) {
        // Удаляем группу из исходного цикла
        const draggedGroupIndex = newCycles[sourceCycleIndex].groups.findIndex(g => g.id === draggedGroup.id);
        if (draggedGroupIndex !== -1) {
          const [removed] = newCycles[sourceCycleIndex].groups.splice(draggedGroupIndex, 1);
          
          // Находим целевую группу в целевом цикле
          const targetGroupIndex = newCycles[targetCycleIndex].groups.findIndex(g => g.id === targetGroup.id);
          if (targetGroupIndex !== -1) {
            // Добавляем группу в целевой цикл после целевой группы
            newCycles[targetCycleIndex].groups.splice(targetGroupIndex + 1, 0, removed);
          } else {
            // Если целевая группа не найдена, добавляем в конец
            newCycles[targetCycleIndex].groups.push(removed);
          }
        }
      }
      
      setCycles(newCycles);
    }
    
    setDraggedGroup(null);
    setDragOverGroup(null);
  }
  
  const handleGroupDragEnd = () => {
    setDraggedGroup(null);
    setDragOverGroup(null);
  }
  
  // Функция для проверки сессии перед выполнением защищенных действий
  const checkSessionBeforeAction = (action: () => void) => {
    if (!isAuthenticated && isEditorMode) {
      setIsEditorMode(false);
      setPasswordError('Время сессии истекло. Пожалуйста, войдите снова.');
      openPasswordModal();
    } else {
      action();
    }
  }
  
  // Обновляем функции, требующие проверки сессии
  const secureOpenEditModal = (type: 'cycle' | 'group' | 'subgroup' | 'category', parentId?: number) => {
    if (!isAuthenticated && isEditorMode) {
      setIsEditorMode(false);
      setPasswordError('Время сессии истекло. Пожалуйста, войдите снова.');
      openPasswordModal();
    } else {
      openEditModal(type, parentId);
    }
  }

  const secureHandleSaveEdit = (data: any) => {
    if (!isAuthenticated && isEditorMode) {
      setIsEditorMode(false);
      setPasswordError('Время сессии истекло. Пожалуйста, войдите снова.');
      openPasswordModal();
    } else {
      handleSaveEdit(data);
    }
  }

  const secureHandleDelete = (type: string, id: number) => {
    if (!isAuthenticated && isEditorMode) {
      setIsEditorMode(false);
    }
    checkSessionBeforeAction(() => handleDelete(type, id));
  }

  const secureStartEditingTitle = (type: string, item: any) => {
    checkSessionBeforeAction(() => startEditingTitle(type, item));
  }

  const secureFinishEditingTitle = (type: string, id: number) => {
    checkSessionBeforeAction(() => finishEditingTitle(type, id));
  }
  
  // Создаем значение контекста, объединяя состояние и действия
  const contextValue: DrugClassificationContextType = {
    // Состояние
    cycles,
    selectedCycles,
    passwordModalOpen,
    passwordError,
    isEditorMode,
    editModalOpen,
    editType,
    editTitle,
    editData,
    parentForEdit,
    exportModalOpen,
    colorPickerOpen,
    selectedCycleId,
    isEditingTitle,
    editingTitleValue,
    searchQuery,
    draggedCycle,
    dragOverCycle,
    draggedGroup,
    dragOverGroup,
    draggedSubgroup,
    dragOverSubgroup,
    draggedCategory,
    
    // Действия
    setCycles,
    toggleCycle,
    openPasswordModal,
    closePasswordModal,
    handlePasswordSubmit,
    exitEditorMode,
    setIsEditorMode,
    setPasswordModalOpen,
    setPasswordError,
    openEditModal: secureOpenEditModal,
    closeEditModal,
    handleSaveEdit: secureHandleSaveEdit,
    openExportModal,
    closeExportModal,
    handleExport,
    openColorPicker,
    closeColorPicker,
    handleColorSelect,
    startEditingTitle: secureStartEditingTitle,
    finishEditingTitle: secureFinishEditingTitle,
    setEditingTitleValue,
    setSearchQuery,
    handleDelete: secureHandleDelete,
    handleCycleDragStart,
    handleCycleDragOver,
    handleCycleDrop,
    handleCycleDragEnd,
    handleGroupDragStart,
    handleGroupDragOver,
    handleGroupDrop,
    handleGroupDragEnd,
  }
  
  return (
    <DrugClassificationContext.Provider value={contextValue}>
      {children}
    </DrugClassificationContext.Provider>
  );
}; 