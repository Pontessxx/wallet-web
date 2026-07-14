import type { ReactNode } from 'react'
import '@/styles/TableShell.scss'

interface TableShellProps {
  children: ReactNode
  className?: string
}

const TableShell = ({ children, className }: TableShellProps) => {
  const classes = className ? `table-shell ${className}` : 'table-shell'

  return <div className={classes}>{children}</div>
}

export default TableShell