'use client';

import React from 'react';

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  hoverable?: boolean;
  striped?: boolean;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
  hoverable = true,
  striped = true,
}: TableProps<T>) => {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-surface)' }}>
        <thead>
          <tr style={{ background: 'var(--color-background)' }}>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 700,
                  color: 'var(--color-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '2px solid var(--color-border)',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: 'var(--space-xl)',
                  textAlign: 'center',
                  color: 'var(--color-muted)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row, index)}
                style={{
                  borderBottom: index < data.length - 1 ? '1px solid var(--color-border)' : 'none',
                  background: striped && index % 2 === 0 ? 'var(--color-background)' : 'transparent',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background var(--transition-fast)',
                }}
                className={hoverable ? 'hover:bg-gray-50' : ''}
                onMouseEnter={(e) => {
                  if (hoverable) {
                    e.currentTarget.style.background = 'var(--color-primary-5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hoverable) {
                    e.currentTarget.style.background = striped && index % 2 === 0 ? 'var(--color-background)' : 'transparent';
                  }
                }}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    style={{
                      padding: '12px 16px',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-foreground)',
                    }}
                  >
                    {column.render ? column.render(row[column.key], row, index) : String(row[column.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
