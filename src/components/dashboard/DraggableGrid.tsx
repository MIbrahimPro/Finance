'use client';

import { useState, useCallback, useMemo } from 'react';
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
import type { WidgetType, WidgetConfig } from '@/lib/types';

const WIDGETS: Record<WidgetType, WidgetConfig> = {
  netWorth: { id: 'netWorth', title: 'Net Worth' },
  quickStats: { id: 'quickStats', title: 'Quick Stats' },
  netWorthChart: { id: 'netWorthChart', title: 'Net Worth Chart' },
  burnRate: { id: 'burnRate', title: 'Burn Rate' },
};

function SortableWidget({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const renderWidget = () => {
    switch (id) {
      case 'netWorth':
        return <NetWorthWidget />;
      case 'quickStats':
        return <QuickStats />;
      case 'netWorthChart':
        return <NetWorthChart />;
      case 'burnRate':
        return <BurnRateIndicator />;
      default:
        return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full cursor-grab active:cursor-grabbing">
      {renderWidget()}
    </div>
  );
}

export default function DraggableGrid() {
  const { data: session } = useSession();
  const { layout, saveLayout } = useDashboardLayout(session?.user?.id ?? '');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const widgetIds = useMemo(() => layout ?? ['netWorth', 'quickStats', 'netWorthChart', 'burnRate'], [layout]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = widgetIds.indexOf(active.id as string);
      const newIndex = widgetIds.indexOf(over.id as string);
      const newOrder = [...widgetIds];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id as string);
      saveLayout(newOrder);
    },
    [widgetIds, saveLayout],
  );

  return (
    <div className="h-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
            {widgetIds.map((id) => (
              <SortableWidget key={id} id={id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
