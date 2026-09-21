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

    const rpcResult =
      await supabase.rpc(
        'get_my_role_keys'
      )

    if (
      !rpcResult.error &&
      Array.isArray(rpcResult.data)
    ) {
      setRoles(
        rpcResult.data.map(String)
      )

      setLoading(false)
      return
    }

    const fallback =
      await supabase
        .from('user_roles')
        .select('roles(key)')
        .eq('user_id', user.id)

    if (fallback.error) {
      console.error(
        'LEVEL role lookup:',
        fallback.error
      )

      setRoles([])
      setLoading(false)
      return
    }

    const keys =
      (fallback.data ?? [])
        .flatMap((row: any) => {
          const role = row.roles

          if (!role) return []

          if (Array.isArray(role)) {
            return role.map(
              (item) => String(item.key)
            )
          }

          return [String(role.key)]
        })

    setRoles(keys)
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
      'AdminProvider ausente'
    )
  }

  return context
}