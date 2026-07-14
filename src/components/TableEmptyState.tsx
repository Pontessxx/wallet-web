interface TableEmptyStateProps {
  hasItems: boolean
  isLoading: boolean
  loadingText: string
  emptyText: string
  className: string
}

const TableEmptyState = ({
  hasItems,
  isLoading,
  loadingText,
  emptyText,
  className,
}: TableEmptyStateProps) => {
  if (hasItems) return null

  return <p className={className}>{isLoading ? loadingText : emptyText}</p>
}

export default TableEmptyState