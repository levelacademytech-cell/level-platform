import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/context/AuthContext'
import { useTheme } from '../theme/ThemeContext'
import type { ThemePresetId } from '../theme/presets'

export interface LevelCourse {
  id: string
  slug: string
  name: string
  short_name: string | null
  description: string | null
  theme_key: ThemePresetId
  icon_emoji: string | null

  audience_segment:
    | 'university'
    | 'adult'
    | 'teen'
    | 'kids'
}

interface UserProgress {
  lifetime_xp: number
  active_xp: number
  level: number
  level_coins: number
  streak_days: number
  last_activity_at: string
}

interface CourseContextValue {
  courses: LevelCourse[]
  linkedCourses: LevelCourse[]
  activeCourse: LevelCourse | null
  progress: UserProgress | null
  loading: boolean

  enrollAndActivate: (
    courseId: string
  ) => Promise<void>

  activateCourse: (
    courseId: string
  ) => Promise<void>

  refresh: () => Promise<void>
}

const CourseContext =
  createContext<CourseContextValue | undefined>(
    undefined
  )

export function CourseProvider({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()
  const { setPreset } = useTheme()

  const [courses, setCourses] =
    useState<LevelCourse[]>([])

  const [linkedCourses, setLinkedCourses] =
    useState<LevelCourse[]>([])

  const [activeCourse, setActiveCourse] =
    useState<LevelCourse | null>(null)

  const [progress, setProgress] =
    useState<UserProgress | null>(null)

  const [loading, setLoading] =
    useState(true)

  async function refresh() {
    if (!user) {
      setCourses([])
      setLinkedCourses([])
      setActiveCourse(null)
      setProgress(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const [
      coursesResult,
      profileResult,
      linksResult,
      progressResult,
    ] = await Promise.all([
      supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('sort_order'),

      supabase
        .from('profiles')
        .select('active_course_id')
        .eq('id', user.id)
        .single(),

      supabase
        .from('user_courses')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('status', 'active'),

      supabase
        .from('user_progress')
        .select(
          'lifetime_xp, active_xp, level, level_coins, streak_days, last_activity_at'
        )
        .eq('user_id', user.id)
        .single(),
    ])

    const allCourses =
      (coursesResult.data ?? []) as LevelCourse[]

    setCourses(allCourses)

    const linkedIds =
      (linksResult.data ?? []).map(
        (item) => item.course_id
      )

    const linked =
      allCourses.filter(
        (course) =>
          linkedIds.includes(course.id)
      )

    setLinkedCourses(linked)

    const active =
      allCourses.find(
        (course) =>
          course.id ===
          profileResult.data?.active_course_id
      ) ?? null

    setActiveCourse(active)

    if (active?.theme_key) {
      setPreset(active.theme_key)
    }

    setProgress(
      progressResult.data
        ? (progressResult.data as UserProgress)
        : null
    )

    setLoading(false)
  }

  async function enrollAndActivate(
    courseId: string
  ) {
    const { error } =
      await supabase.rpc(
        'enroll_and_activate_course',
        {
          requested_course_id: courseId,
        }
      )

    if (error) {
      throw error
    }

    await refresh()
  }

  async function activateCourse(
    courseId: string
  ) {
    const { error } =
      await supabase.rpc(
        'activate_course',
        {
          requested_course_id: courseId,
        }
      )

    if (error) {
      throw error
    }

    await refresh()
  }

  useEffect(() => {
    if (!user) {
      void refresh()
      return
    }

    void refresh()

    void supabase
      .rpc('record_user_activity')
      .then(() => refresh())

    const interval =
      window.setInterval(() => {
        if (
          document.visibilityState === 'visible'
        ) {
          void supabase.rpc(
            'record_user_activity'
          )
        }
      }, 30 * 60 * 1000)

    return () =>
      window.clearInterval(interval)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <CourseContext.Provider
      value={{
        courses,
        linkedCourses,
        activeCourse,
        progress,
        loading,
        enrollAndActivate,
        activateCourse,
        refresh,
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export function useCourses() {
  const context =
    useContext(CourseContext)

  if (!context) {
    throw new Error(
      'useCourses precisa ser usado dentro de CourseProvider'
    )
  }

  return context
}