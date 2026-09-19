import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/context/AuthContext'

interface AdminContextValue {
  roles: string[]
  loading: boolean
  canAccessControl: boolean
  refreshRoles: () => Promise<void>
}

const AdminContext =
  createContext<AdminContextValue | null>(null)

const controlRoles = [
  'director',
  'admin',
  'super_admin',
]

export function AdminProvider({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()

  const [roles, setRoles] =
    useState<string[]>([])

  const [loading, setLoading] =
    useState(true)

  async function refreshRoles() {
    if (!user) {
      setRoles([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error } =
      await supabase.rpc(
        'get_my_role_keys'
      )

    if (error) {
      console.error(
        'LEVEL roles:',
        error
      )

      setRoles([])
      setLoading(false)
      return
    }

    setRoles(
      Array.isArray(data)
        ? data.map(String)
        : []
    )

    setLoading(false)
  }

  useEffect(() => {
    void refreshRoles()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const canAccessControl =
    roles.some(
      (role) =>
        controlRoles.includes(role)
    )

  return (
    <AdminContext.Provider
      value={{
        roles,
        loading,
        canAccessControl,
        refreshRoles,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context =
    useContext(AdminContext)

  if (!context) {
    throw new Error(
      'useAdmin precisa estar dentro de AdminProvider'
    )
  }

  return context
}