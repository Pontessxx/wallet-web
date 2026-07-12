import { useEffect, useRef, useState } from 'react'

type MenuPosition = { top: number; left: number }

export function useDropdownMenu(menuWidth = 120) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [position, setPosition] = useState<MenuPosition | null>(null)

  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openId) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const trigger = triggerRefs.current[openId]

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        trigger &&
        !trigger.contains(target)
      ) {
        setOpenId(null)
      }
    }

    const handleReposition = () => setOpenId(null)

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [openId])

  const registerTriggerRef = (id: string) => (el: HTMLButtonElement | null) => {
    triggerRefs.current[id] = el
  }

  const toggle = (id: string) => {
    if (openId === id) {
      setOpenId(null)
      return
    }

    const trigger = triggerRefs.current[id]
    if (trigger) {
      const rect = trigger.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.right - menuWidth,
      })
    }
    setOpenId(id)
  }

  const close = () => setOpenId(null)

  return { openId, position, menuRef, registerTriggerRef, toggle, close }
}