'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToSyncQueue } from '@/lib/db';
import { generateId, getRandomTagColor } from '@/lib/utils';
import type { Tag, TransactionType } from '@/lib/types';

interface Props {
  type: TransactionType;
  value: string;
  onChange: (tagId: string) => void;
}

export default function TagSelect({ type, value, onChange }: Props) {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const tags = useLiveQuery(
    () => db.tags.where({ userId: session?.user?.id ?? '', type }).toArray(),
    [session, type],
  ) as Tag[] | undefined;

  const allTags = tags ?? [];
  const selectedTag = allTags.find((t) => t.id === value);

  const filtered = allTags.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()),
  );

  const existing = allTags.find(
    (t) => t.name.toLowerCase() === query.toLowerCase(),
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const createTag = async () => {
    if (!session?.user?.id || !query.trim() || existing) return;
    const usedColors = allTags.map((t) => t.color);
    const tag: Tag = {
      id: generateId(),
      userId: session.user.id,
      name: query.trim(),
      color: getRandomTagColor(usedColors),
      type,
    };
    await db.tags.add(tag);
    await addToSyncQueue('create', 'tags', tag.id, tag, session.user.id);
    onChange(tag.id);
    setQuery('');
    setOpen(false);
  };

  const selectTag = (tag: Tag) => {
    onChange(tag.id);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div
        className="flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm cursor-pointer"
        style={{ background: 'var(--color-input-bg)', borderColor: 'var(--color-input-border)', color: 'var(--color-text)' }}
        onClick={() => setOpen(!open)}
      >
        {selectedTag ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: selectedTag.color }} />
            <span>{selectedTag.name}</span>
          </>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>Select tag</span>
        )}
      </div>

      {open && (
        <div
          className="absolute z-20 w-full mt-1 border rounded-lg overflow-hidden shadow-xl"
          style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
        >
          <input
            type="text"
            placeholder="Search or create tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full px-3 py-2.5 text-sm border-b outline-none"
            style={{
              background: 'var(--color-input-bg)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
            }}
          />

          <div className="max-h-40 overflow-y-auto">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => selectTag(tag)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:opacity-80"
                style={{ color: 'var(--color-text)' }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: tag.color }} />
                {tag.name}
              </button>
            ))}

            {query.trim() && !existing && (
              <button
                type="button"
                onClick={createTag}
                className="w-full px-3 py-2 text-sm text-left border-t flex items-center gap-2 hover:opacity-80"
                style={{ color: 'var(--color-accent)', borderColor: 'var(--color-border)' }}
              >
                + Create "{query.trim()}"
              </button>
            )}

            {filtered.length === 0 && !query.trim() && (
              <p className="px-3 py-4 text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                No tags yet. Type to create one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
