import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {
  Session,
  User,
} from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  roles: string[]
  isAdmin: boolean
  signIn: (
    email: string,
    password: string
  ) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null
  )

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [session, setSession] =
    useState<Session | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [roles, setRoles] =
    useState<string[]>([])

  async function loadRoles() {
    const { data, error } =
      await supabase.rpc(
        'get_my_role_keys'
      )

    if (error) {
      setRoles([])
      return
    }

    setRoles(
      Array.isArray(data)
        ? data
        : []
    )
  }

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session)

        if (data.session) {
          await loadRoles()
        }

        setLoading(false)
      })

    const {
      data: subscription,
    } =
      supabase.auth.onAuthStateChange(
        async (_event, nextSession) => {
          setSession(nextSession)

          if (nextSession) {
            await loadRoles()
          } else {
            setRoles([])
          }

          setLoading(false)
        }
      )

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function signIn(
    email: string,
    password: string
  ) {
    const { error } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        })

    return error
      ? error.message
      : null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value =
    useMemo<AuthContextValue>(
      () => ({
        session,

        user:
          session?.user ??
          null,

        loading,

        roles,

        isAdmin:
          roles.includes('director') ||
          roles.includes('admin') ||
          roles.includes(
            'super_admin'
          ),

        signIn,
        signOut,
      }),
      [
        session,
        loading,
        roles,
      ]
    )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth precisa estar dentro do AuthProvider.'
    )
  }

  return context
}