'use client'

import { handleSignOut } from '@/app/actions/auth'

interface LogoutButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function LogoutButton({ children, className, onClick }: LogoutButtonProps) {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (onClick) {
      onClick(e)
    }
    await handleSignOut()
  }

  return (
    <button onClick={handleClick} className={className} type="button">
      {children}
    </button>
  )
}
