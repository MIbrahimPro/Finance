'use client';

import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSession } from 'next-auth/react';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import NetWorthWidget from './NetWorthWidget';
import NetWorthChart from './NetWorthChart';
import QuickStats from './QuickStats';
import BurnRateIndicator from './BurnRateIndicator';
import DailyExpenseChart from './DailyExpenseChart';
import type { WidgetType } from '@/lib/types';

const WIDGET_COMPONENTS: Record<WidgetType, () => React.ReactElement> = {
  netWorth: () => <NetWorthWidget />,
  quickStats: () => <QuickStats />,
  netWorthChart: () => <NetWorthChart />,
  burnRate: () => <BurnRateIndicator />,
  dailyExpense: () => <DailyExpenseChart />,
};

const WIDGET_META: Record<WidgetType, { title: string; wide?: boolean }> = {
  netWorth: { title: 'Net Worth', wide: true },
  quickStats: { title: 'Quick Stats' },
  netWorthChart: { title: 'Net Worth Chart', wide: true },
  burnRate: { title: 'Burn Rate' },
  dailyExpense: { title: 'Daily Expense', wide: true },
};

function SortableWidget({ id, wide }: { id: string; wide?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const Component = WIDGET_COMPONENTS[id as WidgetType];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`h-full cursor-grab active:cursor-grabbing ${
        wide ? 'col-span-2' : ''
      }`}
    >
      {Component ? <Component /> : null}
    </div>
  );
}

export default function DraggableGrid() {
  const { data: session } = useSession();
  const { layout, saveLayout } = useDashboardLayout(session?.user?.id ?? '');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const widgetIds = useMemo(
    () =>
      layout ?? ['netWorth', 'quickStats', 'netWorthChart', 'burnRate', 'dailyExpense'],
    [layout],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgetIds.indexOf(active.id as string);
    const newIndex = widgetIds.indexOf(over.id as string);
    const newOrder = [...widgetIds];
    newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, active.id as string);
    saveLayout(newOrder);
  };

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 auto-rows-fr gap-4 h-full">
            {widgetIds.map((id) => (
              <SortableWidget
                key={id}
                id={id}
                wide={WIDGET_META[id as WidgetType]?.wide}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}