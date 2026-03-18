import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
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
}

export function DataTable<T extends Record<string, any>>({
  columns, data, onRowClick, searchable = false, searchPlaceholder = 'Search...', pageSize = 10
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const filtered = searchable && search
    ? data.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    : data;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div>
      {searchable && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-white/5 bg-card/30">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground',
                    col.className
                  )}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">No data found</td></tr>
            ) : (
              paged.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-t border-white/5 transition-colors duration-100',
                    i % 2 === 0 ? 'bg-transparent' : 'bg-white/5',
                    onRowClick && 'cursor-pointer hover:bg-primary/5'
                  )}
                >
                  {columns.map(col => (
                    <td key={col.key} className={cn('px-4 py-2.5', col.className)}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{sorted.length} results</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  'w-7 h-7 rounded-sm font-mono',
                  page === i ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
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
