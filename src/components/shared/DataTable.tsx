import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  toolbarContent?: React.ReactNode;
}

export function DataTable<T extends object>({
  columns, data, onRowClick, searchable = false, searchPlaceholder = 'Search...', pageSize = 10, toolbarContent
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = searchable && search
    ? data.filter(item =>
      Object.values(item).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
    )
    : data;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
      const sortColumn = columns.find(c => c.key === sortKey);
      const av = sortColumn?.sortValue ? sortColumn.sortValue(a) : (a as Record<string, unknown>)[sortKey];
      const bv = sortColumn?.sortValue ? sortColumn.sortValue(b) : (b as Record<string, unknown>)[sortKey];
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div>
      {/* ── Search ── */}
      {searchable && (
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg text-foreground placeholder:text-steel/60 border border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
              style={{ background: 'hsl(220 16% 10%)' }}
            />
          </div>
          {toolbarContent}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06]" style={{ background: 'linear-gradient(145deg, hsl(220 16% 9%), hsl(220 16% 7%))' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'hsl(220 16% 6%)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3.5 text-left text-[10px] font-mono uppercase tracking-[0.15em] text-steel whitespace-nowrap border-b border-white/[0.06]',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  role={col.sortable ? 'button' : undefined}
                  tabIndex={col.sortable ? 0 : undefined}
                  aria-label={col.sortable ? `Sort by ${col.label}` : undefined}
                  onKeyDown={col.sortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort(col.key); } } : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && sortKey === col.key ? (
                      sortDir === 'asc'
                        ? <ChevronUp size={11} className="text-primary" />
                        : <ChevronDown size={11} className="text-primary" />
                    ) : col.sortable ? (
                      <ChevronUp size={11} className="opacity-15" />
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/[0.06]" style={{ background: 'hsl(220 14% 12%)' }}>
                      <Search size={16} className="text-steel/50" />
                    </div>
                    <span className="text-steel text-xs font-display uppercase tracking-wide">No data found</span>
                    {search && <span className="text-steel/50 text-[10px]">Try a different search term</span>}
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-t border-white/[0.04] transition-all duration-150',
                    onRowClick && 'cursor-pointer hover:bg-primary/[0.04]'
                  )}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3.5 text-foreground/80', col.className)}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="font-mono text-steel">{sorted.length} results</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  'w-8 h-8 rounded-lg font-mono text-xs transition-all duration-200',
                  page === i
                    ? 'bg-primary text-white shadow-[0_0_12px_hsl(0_72%_51%/0.3)]'
                    : 'text-steel hover:bg-white/[0.06] hover:text-foreground'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
