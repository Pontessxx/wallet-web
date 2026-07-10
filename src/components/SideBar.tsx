import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Target,
  FileBarChart,
  PieChart,
  FolderKanban,
  Tag,
  Calendar,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import '@/styles/SideBar.scss'

type NavItem = {
  label: string
  icon: ReactNode
  href: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
      { label: 'Contas', icon: <Wallet size={20} />, href: '/contas' },
      { label: 'Transações', icon: <ArrowLeftRight size={20} />, href: '/transacoes' },
      { label: 'Objetivos', icon: <Target size={20} />, href: '/objetivos' },
    ],
  },
  {
    title: 'Análises',
    items: [
      { label: 'Relatórios', icon: <FileBarChart size={20} />, href: '/relatorios' },
      { label: 'Gráficos', icon: <PieChart size={20} />, href: '/graficos' },
    ],
  },
  {
    title: 'Organização',
    items: [
      { label: 'Categorias', icon: <FolderKanban size={20} />, href: '/categorias' },
      { label: 'Tags', icon: <Tag size={20} />, href: '/tags' },
      { label: 'Calendário', icon: <Calendar size={20} />, href: '/calendario' },
    ],
  },
]

function SideBar() {
  const [collapsed, setCollapsed] = useState(true)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(href: string) {
    return location.pathname === href
  }

  return (
    <aside className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <header className="sidebar__header">
        {!collapsed && <span className="sidebar__logo">Menu</span>}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Recolher menu"
          type="button"
        >
          <ChevronLeft
            size={18}
            className={
              collapsed
                ? 'sidebar__toggle-icon sidebar__toggle-icon--rotated'
                : 'sidebar__toggle-icon'
            }
          />
        </button>
      </header>

      <nav className="sidebar__nav">
        {navSections.map((section) => (
          <section key={section.title} className="sidebar__section">
            {!collapsed && (
              <h2 className="sidebar__section-title">{section.title}</h2>
            )}
            <ul className="sidebar__list">
              {section.items.map((item) => (
                <li key={item.href} className="sidebar__item">
                  <button
                    type="button"
                    className={
                      isActive(item.href)
                        ? 'sidebar__link sidebar__link--active'
                        : 'sidebar__link'
                    }
                    onClick={() => navigate(item.href)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="sidebar__icon">{item.icon}</span>
                    {!collapsed && (
                      <span className="sidebar__label">{item.label}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <footer className="sidebar__footer">
        <button
          type="button"
          className={
            isActive('/configuracoes')
              ? 'sidebar__link sidebar__link--active'
              : 'sidebar__link'
          }
          onClick={() => navigate('/configuracoes')}
          title={collapsed ? 'Configurações' : undefined}
        >
          <span className="sidebar__icon">
            <Settings size={20} />
          </span>
          {!collapsed && <span className="sidebar__label">Configurações</span>}
        </button>

        <button
          type="button"
          className="sidebar__link sidebar__link--button"
          onClick={toggleTheme}
        >
          <span className="sidebar__icon">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </span>
          {!collapsed && (
            <span className="sidebar__label">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          )}
        </button>
      </footer>
    </aside>
  )
}

export default SideBar