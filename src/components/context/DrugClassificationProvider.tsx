import React, { useState, useEffect, useMemo } from 'react';
import DrugClassificationContext, { DrugClassificationContextType } from './DrugClassificationContext';
import { Cycle, Group, Subgroup, Category, DraggedGroup, DraggedSubgroup, DraggedCategory } from '../types';
import { textContainsQuery } from '../utils/textUtils';
import PDFGenerator from '../PDFGenerator';
import { useAuth } from './AuthProvider';
import { dataAPI } from '../../services/api';
// Импорт компонентов из @dnd-kit
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

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
  
  // Состояния для палитры цветов
  const [itemType, setItemType] = useState<'cycle' | 'group'>('cycle');
  
  // Конфигурация сенсоров DnD (для мыши и тач-устройств)
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Требуется нажать и удерживать элемент перед началом перетаскивания
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Настройки для сенсорных устройств
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );
  
  // Загрузка данных из API при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dataAPI.getData();
        if (result.cycles && result.cycles.length > 0) {
          setCycles(result.cycles);
        } else {
          // Если в localStorage нет данных, загружаем исходные данные из файла
          try {
            const response = await fetch('/initial-data.json');
            const initialData = await response.json();
            if (initialData.cycles && initialData.cycles.length > 0) {
              setCycles(initialData.cycles);
              // Сохраняем исходные данные в localStorage
              await dataAPI.saveData(initialData.cycles);
            }
          } catch (error) {
            console.error('Ошибка при загрузке исходных данных:', error);
          }
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
  const openColorPicker = (itemId: number, itemType: 'cycle' | 'group' = 'cycle') => {
    setSelectedCycleId(itemId);
    setItemType(itemType);
    setColorPickerOpen(true);
  }
  
  // Закрытие палитры цветов
  const closeColorPicker = () => {
    setColorPickerOpen(false);
  }
  
  // Обработчик изменения градиента
  const handleColorSelect = (gradient: string) => {
    if (selectedCycleId === null) return;
    
    if (itemType === 'cycle') {
      const newCycles = cycles.map(cycle => {
        if (cycle.id === selectedCycleId) {
          return { ...cycle, gradient }
        }
        return cycle;
      });
      
      setCycles(newCycles);
    } else if (itemType === 'group') {
      const newCycles = cycles.map(cycle => {
        const updatedGroups = cycle.groups.map(group => {
          if (group.id === selectedCycleId) {
            return { ...group, gradient }
          }
          return group;
        });
        return { ...cycle, groups: updatedGroups };
      });
      
      setCycles(newCycles);
    }
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
  
  // Обработчики для DnD-kit
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id, data } = active;
    
    // Определяем тип перетаскиваемого элемента по data.current
    const itemType = data.current?.type;
    
    if (itemType === 'cycle') {
      const cycle = cycles.find(c => c.id === id);
      if (cycle) {
        setDraggedCycle(cycle);
      }
    } else if (itemType === 'group') {
      const cycleId = data.current?.cycleId;
      const cycle = cycles.find(c => c.id === cycleId);
      if (cycle) {
        const group = cycle.groups.find(g => g.id === id);
        if (group) {
          setDraggedGroup({ ...group, cycleId });
        }
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const { id: activeId, data: activeData } = active;
    const { id: overId, data: overData } = over;
    
    // Пропускаем, если перетаскиваем над тем же элементом
    if (activeId === overId) return;
    
    const activeType = activeData.current?.type;
    const overType = overData.current?.type;
    
    // Обрабатываем перетаскивание цикла
    if (activeType === 'cycle' && overType === 'cycle') {
      const cycle = cycles.find(c => c.id === overId);
      if (cycle) {
        setDragOverCycle(cycle);
      }
    } 
    // Обрабатываем перетаскивание группы
    else if (activeType === 'group' && overType === 'group') {
      const activeCycleId = activeData.current?.cycleId;
      const overCycleId = overData.current?.cycleId;
      
      const overCycle = cycles.find(c => c.id === overCycleId);
      if (overCycle) {
        const group = overCycle.groups.find(g => g.id === overId);
        if (group) {
          setDragOverGroup({ ...group, cycleId: overCycleId });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      // Если перетаскивание завершилось не над элементом, сбрасываем состояние
      setDraggedCycle(null);
      setDragOverCycle(null);
      setDraggedGroup(null);
      setDragOverGroup(null);
      return;
    }
    
    const { id: activeId, data: activeData } = active;
    const { id: overId, data: overData } = over;
    
    // Если перетаскиваем элемент на самого себя - ничего не делаем
    if (activeId === overId) {
      setDraggedCycle(null);
      setDragOverCycle(null);
      setDraggedGroup(null);
      setDragOverGroup(null);
      return;
    }
    
    const activeType = activeData.current?.type;
    
    // Обрабатываем перемещение циклов
    if (activeType === 'cycle') {
      const activeIndex = cycles.findIndex(c => c.id === activeId);
      const overIndex = cycles.findIndex(c => c.id === overId);
      
      if (activeIndex !== -1 && overIndex !== -1) {
        const newCycles = arrayMove(cycles, activeIndex, overIndex);
        setCycles(newCycles);
      }
    } 
    // Обрабатываем перемещение групп
    else if (activeType === 'group') {
      const activeCycleId = activeData.current?.cycleId;
      const overCycleId = overData.current?.cycleId;
      
      const newCycles = [...cycles];
      
      // Находим индексы циклов и групп
      const activeCycleIndex = newCycles.findIndex(c => c.id === activeCycleId);
      const overCycleIndex = newCycles.findIndex(c => c.id === overCycleId);
      
      if (activeCycleIndex !== -1 && overCycleIndex !== -1) {
        // Перемещение в рамках одного цикла
        if (activeCycleId === overCycleId) {
          const activeGroupIndex = newCycles[activeCycleIndex].groups.findIndex(g => g.id === activeId);
          const overGroupIndex = newCycles[activeCycleIndex].groups.findIndex(g => g.id === overId);
          
          if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
            newCycles[activeCycleIndex].groups = arrayMove(
              newCycles[activeCycleIndex].groups, 
              activeGroupIndex, 
              overGroupIndex
            );
            setCycles(newCycles);
          }
        } 
        // Перемещение между разными циклами
        else {
          const activeGroupIndex = newCycles[activeCycleIndex].groups.findIndex(g => g.id === activeId);
          const overGroupIndex = newCycles[overCycleIndex].groups.findIndex(g => g.id === overId);
          
          if (activeGroupIndex !== -1) {
            // Копируем группу для перемещения
            const [groupToMove] = newCycles[activeCycleIndex].groups.splice(activeGroupIndex, 1);
            
            // Вставляем группу в целевой цикл
            if (overGroupIndex !== -1) {
              newCycles[overCycleIndex].groups.splice(overGroupIndex + 1, 0, groupToMove);
            } else {
              newCycles[overCycleIndex].groups.push(groupToMove);
            }
            
            setCycles(newCycles);
          }
        }
      }
    }
    
    // Очищаем состояние перетаскивания
    setDraggedCycle(null);
    setDragOverCycle(null);
    setDraggedGroup(null);
    setDragOverGroup(null);
  };
  
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
  
  // Обновление старых обработчиков dnd для обратной совместимости
  const handleCycleDragStart = (e: React.DragEvent, cycle: Cycle) => {
    e.dataTransfer.setData('text/plain', cycle.id.toString());
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
        const newCycles = arrayMove(cycles, sourceIndex, targetIndex);
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
  
  // Обновленные обработчики для перетаскивания групп
  const handleGroupDragStart = (e: React.DragEvent, group: Group, cycleId: number) => {
    e.dataTransfer.setData('text/plain', group.id.toString());
    e.dataTransfer.setData('cycleId', cycleId.toString());
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
        // Если перемещение внутри одного цикла
        if (sourceCycleId === targetCycleId) {
          const draggedGroupIndex = newCycles[sourceCycleIndex].groups.findIndex(g => g.id === draggedGroup.id);
          const targetGroupIndex = newCycles[sourceCycleIndex].groups.findIndex(g => g.id === targetGroup.id);
          
          if (draggedGroupIndex !== -1 && targetGroupIndex !== -1) {
            // Используем arrayMove для более чистого кода
            newCycles[sourceCycleIndex].groups = arrayMove(
              newCycles[sourceCycleIndex].groups,
              draggedGroupIndex,
              targetGroupIndex
            );
          }
        } else {
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
  
  // Создаем значение контекста, объединяя состояние и действия
  const contextValue: DrugClassificationContextType = {
    // Состояние
    cycles: filteredCycles,
    selectedCycles,
    setSelectedCycles,
    isEditorMode,
    setIsEditorMode,
    passwordModalOpen,
    openPasswordModal,
    closePasswordModal,
    handlePasswordSubmit,
    passwordError,
    isAuthenticated,
    exitEditorMode,
    openEditModal: secureOpenEditModal,
    closeEditModal,
    editModalOpen,
    editType,
    editTitle,
    handleSaveEdit: secureHandleSaveEdit,
    editData,
    parentForEdit,
    exportModalOpen,
    openExportModal,
    closeExportModal,
    handleExport,
    toggleCycle,
    searchQuery,
    setSearchQuery,
    isEditingTitle,
    editingTitleValue,
    startEditingTitle: secureStartEditingTitle,
    finishEditingTitle: secureFinishEditingTitle,
    onEditingTitleChange: setEditingTitleValue,
    setEditingTitleValue,
    handleDelete: secureHandleDelete,
    // DnD состояния
    draggedCycle,
    dragOverCycle,
    draggedGroup,
    dragOverGroup,
    // Старые обработчики DnD
    handleCycleDragStart,
    handleCycleDragOver,
    handleCycleDrop,
    handleCycleDragEnd,
    handleGroupDragStart,
    handleGroupDragOver,
    handleGroupDrop,
    handleGroupDragEnd,
    // Новые обработчики DnD из @dnd-kit
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    sensors,
    // Работа с цветами
    colorPickerOpen,
    openColorPicker,
    closeColorPicker,
    selectedCycleId,
    itemType,
    handleColorSelect,
    // Шифрование и безопасность
    checkSessionBeforeAction,
    setCycles,
    setPasswordModalOpen,
    setPasswordError
  }
  
  return (
    <DrugClassificationContext.Provider value={contextValue}>
      {children}
    </DrugClassificationContext.Provider>
  );
}; 