import { ReactNode } from 'react'

interface CenteredContainerProps {
  children: ReactNode
  className?: string
}

export function CenteredContainer({ children, className = '' }: CenteredContainerProps) {
  return (
    <div className={`flex items-center justify-center min-h-screen w-full ${className}`}>
      <div className="w-full">
        {children}
      </div>
    </div>
  )
} 