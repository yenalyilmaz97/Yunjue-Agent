import { useMemo, useState } from 'react'
import type { Column } from '@/types/keci'
import { Table, Form } from 'react-bootstrap'

type SortDirection = 'asc' | 'desc'

type DataTableProps<T> = {
  columns: Array<Column<T>>
  data: T[]
  isLoading?: boolean
  rowKey: (row: T, index: number) => string | number
  searchPlaceholder?: string
  searchKeys?: Array<keyof T | string>
  className?: string
  hideSearch?: boolean
  searchQuery?: string
  onSearchQueryChange?: (value: string) => void
  // Optional actions column
  renderRowActions?: (row: T) => React.ReactNode
  actionsHeader?: string
  // Optional accordion (expandable) rows
  accordion?: boolean
  renderAccordionContent?: (row: T) => React.ReactNode
}

function getValueByKey<T>(row: T, key: keyof T | string): unknown {
  if (typeof key === 'string' && key.includes('.')) {
    // support nested keys like a.b.c
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return key.split('.').reduce((acc: any, k) => (acc ? acc[k] : undefined), row as any)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (row as any)[key as any]
}

// Returns all scalar values resolved by a (possibly nested) key path.
// Supports traversing arrays when a segment resolves to an array (e.g., 'episodes.title').
function getValuesByKey<T>(row: T, key: keyof T | string): unknown[] {
  const resolve = (obj: unknown, parts: string[]): unknown[] => {
    if (!parts.length) return [obj]
    const [head, ...rest] = parts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next: unknown = (obj as any)?.[head]
    if (Array.isArray(next)) {
      return next.flatMap((el) => resolve(el, rest))
    }
    return resolve(next, rest)
  }

  if (typeof key === 'string') {
    return resolve(row as unknown, key.split('.'))
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = (row as any)[key as any]
  return Array.isArray(v) ? v : [v]
}

export function DataTable<T>({ columns, data, isLoading, rowKey, searchPlaceholder = 'Search...', searchKeys, className, hideSearch = false, searchQuery, onSearchQueryChange, renderRowActions, actionsHeader = 'Actions', accordion = false, renderAccordionContent }: DataTableProps<T>) {
  const [internalQuery, setInternalQuery] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | string | undefined>(undefined)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set())

  const query = searchQuery ?? internalQuery

  const effectiveSearchKeys = useMemo(() => {
    if (searchKeys && searchKeys.length > 0) return searchKeys
    // default: use column keys
    return columns.map((c) => c.key)
  }, [searchKeys, columns])

  const filtered = useMemo(() => {
    if (!query) return data
    const q = query.toLowerCase().trim()
    return data.filter((row) => {
      return effectiveSearchKeys.some((k) => {
        const values = getValuesByKey(row, k)
        return values.some((v) => v != null && String(v).toLowerCase().includes(q))
      })
    })
  }, [data, query, effectiveSearchKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const va = getValueByKey(a, sortKey)
      const vb = getValueByKey(b, sortKey)
      if (va == null && vb == null) return 0
      if (va == null) return sortDir === 'asc' ? -1 : 1
      if (vb == null) return sortDir === 'asc' ? 1 : -1
      const aNum = typeof va === 'number' || (!isNaN(Number(va)) && va !== '')
      const bNum = typeof vb === 'number' || (!isNaN(Number(vb)) && vb !== '')
      if (aNum && bNum) {
        const na = Number(va)
        const nb = Number(vb)
        return sortDir === 'asc' ? na - nb : nb - na
      }
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortDir === 'asc' ? -1 : 1
      if (sa > sb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const onHeaderClick = (col: Column<T>) => {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
  }

  const hasActions = typeof renderRowActions === 'function'
  const toggleExpanded = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={className}>
      {!hideSearch && (
        <div className="d-flex justify-content-end mb-3">
          <Form.Control
            size="sm"
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => (onSearchQueryChange ? onSearchQueryChange(e.target.value) : setInternalQuery(e.target.value))}
            style={{ maxWidth: 260 }}
          />
        </div>
      )}
      <Table hover responsive className="mb-0">
        <thead>
          <tr>
            {accordion && <th style={{ width: 40 }} />}
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{ width: col.width }}
                onClick={() => onHeaderClick(col)}
                role={col.sortable ? 'button' : undefined}
              >
                <span className="d-inline-flex align-items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span aria-hidden>{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </span>
              </th>
            ))}
            {hasActions && <th style={{ width: 160 }} className="text-end">{actionsHeader}</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + (accordion ? 1 : 0) + (hasActions ? 1 : 0)}>Loading...</td>
            </tr>
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (accordion ? 1 : 0) + (hasActions ? 1 : 0)}>No data</td>
            </tr>
          ) : (
            sorted.map((row, idx) => {
              const id = rowKey(row, idx)
              const isOpen = accordion && expanded.has(id)
              return (
                <>
                  <tr key={id} onClick={() => (accordion ? toggleExpanded(id) : undefined)} style={accordion ? { cursor: 'pointer' } : undefined}>
                    {accordion && (
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(id)
                          }}
                          aria-label={isOpen ? 'Collapse' : 'Expand'}
                        >
                          {isOpen ? '▾' : '▸'}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => {
                      const value = getValueByKey(row, col.key)
                      return <td key={String(col.key)}>{col.render ? col.render(row) : String(value ?? '')}</td>
                    })}
                    {hasActions && (
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        {renderRowActions!(row)}
                      </td>
                    )}
                  </tr>
                  {accordion && isOpen && (
                    <tr>
                      <td colSpan={columns.length + (accordion ? 1 : 0) + (hasActions ? 1 : 0)}>
                        {renderAccordionContent ? renderAccordionContent(row) : null}
                      </td>
                    </tr>
                  )}
                </>
              )
            })
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default DataTable


