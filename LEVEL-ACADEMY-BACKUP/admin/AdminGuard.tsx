import type { ReactNode } from 'react'

import {
  Navigate,
} from 'react-router-dom'

import { useAdmin } from './AdminContext'

export function AdminGuard({
  children,
}: {
  children: ReactNode
}) {
  const {
    loading,
    canAccessControl,
  } = useAdmin()

  if (loading) {
    return (
      <div className="director-loading">
        Verificando acesso da direcao...
      </div>
    )
  }

  if (!canAccessControl) {
    return (
      <Navigate
        to="/app"
        replace
      />
    )
  }

  return children
}