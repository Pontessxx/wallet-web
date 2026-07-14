import { useState, type KeyboardEvent } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Target,
  FileBarChart,
  PieChart,
  Tag,
  CandlestickChart,
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
      { label: 'Contas', icon: <Wallet size={20} />, href: '/carteira' },
    ],
  },
  {
    title: 'Transações',
    items: [
      { label: 'Transações', icon: <ArrowLeftRight size={20} />, href: '/transacoes' },
      { label: 'Operações Bolsa', icon: <CandlestickChart size={20} />, href: '/operacoes-bolsa' },
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
      { label: 'Categorias', icon: <Tag size={20} />, href: '/categorias' },
      { label: 'Calendário', icon: <Calendar size={20} />, href: '/calendario' },
      { label: 'Objetivos', icon: <Target size={20} />, href: '/objetivos' },
    ],
  },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
}

function handleActivateKey(e: KeyboardEvent, callback: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    callback()
  }
}

function SideBar() {
  const [collapsed, setCollapsed] = useState(true)
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <header className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__logo">⬡</span>
          {!collapsed && <span className="sidebar__title">Wallet</span>}
        </div>
      </header>

      <span
        className="sidebar__toggle"
        role="button"
        tabIndex={0}
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={(e) => handleActivateKey(e, () => setCollapsed(!collapsed))}
        aria-label="Recolher menu"
      >
        <ChevronLeft
          size={16}
          className={
            collapsed
              ? 'sidebar__toggle-icon sidebar__toggle-icon--rotated'
              : 'sidebar__toggle-icon'
          }
        />
      </span>

      <nav className="sidebar__nav">
        {navSections.map((section) => (
          <section key={section.title} className="sidebar__section">
            {!collapsed && (
              <h2 className="sidebar__section-title">{section.title}</h2>
            )}
            <ul className="sidebar__list">
              {section.items.map((item) => (
                <li key={item.href} className="sidebar__item">
                  <NavLink
                    to={item.href}
                    className={navLinkClass}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="sidebar__icon">{item.icon}</span>
                    {!collapsed && (
                      <span className="sidebar__label">{item.label}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <footer className="sidebar__footer">
        <NavLink
          to="/configuracoes"
          className={navLinkClass}
          title={collapsed ? 'Configurações' : undefined}
        >
          <span className="sidebar__icon">
            <Settings size={20} />
          </span>
          {!collapsed && <span className="sidebar__label">Configurações</span>}
        </NavLink>

        <span
          className="sidebar__link sidebar__link--button"
          role="button"
          tabIndex={0}
          onClick={toggleTheme}
          onKeyDown={(e) => handleActivateKey(e, toggleTheme)}
        >
          <span className="sidebar__icon">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </span>
          {!collapsed && (
            <span className="sidebar__label">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          )}
        </span>
      </footer>
    </aside>
  )
}

export default SideBar