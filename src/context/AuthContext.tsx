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

import {
  supabase,
} from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  roles: string[]
  isAdmin: boolean
  accountStatus: string
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

const blockedStatuses = [
  'suspended',
  'banned',
  'deleted',
]

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null
    )

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    roles,
    setRoles,
  ] =
    useState<string[]>([])

  const [
    accountStatus,
    setAccountStatus,
  ] =
    useState('active')

  async function loadAccess(
    userId: string
  ) {
    const [
      roleResult,
      profileResult,
    ] =
      await Promise.all([
        supabase.rpc(
          'get_my_role_keys'
        ),

        supabase
          .from('profiles')
          .select(
            'account_status'
          )
          .eq(
            'id',
            userId
          )
          .maybeSingle(),
      ])

    const nextRoles =
      roleResult.error
        ? []
        : Array.isArray(
            roleResult.data
          )
          ? roleResult.data
          : []

    const nextStatus =
      profileResult.data
        ?.account_status ??
      'active'

    setRoles(nextRoles)
    setAccountStatus(
      nextStatus
    )

    if (
      blockedStatuses.includes(
        nextStatus
      )
    ) {
      await supabase.auth
        .signOut()

      setRoles([])
      setSession(null)

      return false
    }

    return true
  }

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(
        async ({
          data,
        }) => {
          const next =
            data.session

          setSession(next)

          if (next) {
            await loadAccess(
              next.user.id
            )
          }

          setLoading(false)
        }
      )

    const {
      data:
        subscription,
    } =
      supabase.auth
        .onAuthStateChange(
          async (
            _event,
            nextSession
          ) => {
            setSession(
              nextSession
            )

            if (
              nextSession
            ) {
              await loadAccess(
                nextSession
                  .user.id
              )
            } else {
              setRoles([])
              setAccountStatus(
                'active'
              )
            }

            setLoading(false)
          }
        )

    return () => {
      subscription
        .subscription
        .unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user.id) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          void supabase
            .from('profiles')
            .select(
              'account_status'
            )
            .eq(
              'id',
              session.user.id
            )
            .maybeSingle()
            .then(
              async ({
                data,
              }) => {
                const status =
                  data
                    ?.account_status ??
                  'active'

                setAccountStatus(
                  status
                )

                if (
                  blockedStatuses
                    .includes(
                      status
                    )
                ) {
                  await supabase
                    .auth
                    .signOut()
                }
              }
            )
        },
        60000
      )

    return () =>
      window.clearInterval(
        timer
      )
  }, [session?.user.id])

  async function signIn(
    email: string,
    password: string
  ) {
    const {
      data,
      error,
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        })

    if (error) {
      return error.message
    }

    if (data.user) {
      const allowed =
        await loadAccess(
          data.user.id
        )

      if (!allowed) {
        return 'Seu acesso está bloqueado. Entre em contato com o administrador da LEVEL ADV.'
      }
    }

    return null
  }

  async function signOut() {
    await supabase.auth
      .signOut()
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

        accountStatus,

        isAdmin:
          roles.includes(
            'director'
          ) ||
          roles.includes(
            'admin'
          ) ||
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
        accountStatus,
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
    useContext(
      AuthContext
    )

  if (!context) {
    throw new Error(
      'useAuth precisa estar dentro do AuthProvider.'
    )
  }

  return context
}
