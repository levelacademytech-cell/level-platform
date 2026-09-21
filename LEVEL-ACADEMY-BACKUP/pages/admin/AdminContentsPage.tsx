import {
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import { supabase } from '../../lib/supabase'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function courseName(row: any) {
  const value = row?.courses

  if (Array.isArray(value)) {
    return value[0]?.name ?? 'Curso'
  }

  return value?.name ?? 'Curso'
}

function subjectName(row: any) {
  const value = row?.subjects

  if (Array.isArray(value)) {
    return value[0]?.name ?? 'Disciplina'
  }

  return value?.name ?? 'Disciplina'
}

export function AdminContentsPage() {
  const [courses, setCourses] =
    useState<any[]>([])

  const [subjects, setSubjects] =
    useState<any[]>([])

  const [materials, setMaterials] =
    useState<any[]>([])

  const [courseId, setCourseId] =
    useState('')

  const [newSubject, setNewSubject] =
    useState('')

  const [subjectDescription, setSubjectDescription] =
    useState('')

  const [materialSubjectId, setMaterialSubjectId] =
    useState('')

  const [materialTitle, setMaterialTitle] =
    useState('')

  const [materialType, setMaterialType] =
    useState('lesson')

  const [materialDescription, setMaterialDescription] =
    useState('')

  const [externalUrl, setExternalUrl] =
    useState('')

  const [message, setMessage] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  async function load() {
    setLoading(true)

    const [
      coursesResult,
      subjectsResult,
      materialsResult,
    ] = await Promise.all([
      supabase
        .from('courses')
        .select('id,name')
        .order('name'),

      supabase
        .from('subjects')
        .select(`
          id,
          course_id,
          name,
          description,
          is_active,
          courses(name)
        `)
        .order('name'),

      supabase
        .from('materials')
        .select(`
          id,
          subject_id,
          title,
          material_type,
          description,
          external_url,
          is_active,
          subjects(name)
        `)
        .order('created_at', {
          ascending: false,
        }),
    ])

    if (coursesResult.error) {
      setMessage(coursesResult.error.message)
    }

    if (subjectsResult.error) {
      setMessage(subjectsResult.error.message)
    }

    if (materialsResult.error) {
      setMessage(materialsResult.error.message)
    }

    setCourses(coursesResult.data ?? [])
    setSubjects(subjectsResult.data ?? [])
    setMaterials(materialsResult.data ?? [])

    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function createSubject(
    event: FormEvent
  ) {
    event.preventDefault()

    if (!courseId || !newSubject.trim()) {
      return
    }

    const { error } =
      await supabase
        .from('subjects')
        .insert({
          course_id: courseId,

          name:
            newSubject.trim(),

          slug:
            slugify(newSubject),

          description:
            subjectDescription.trim() ||
            null,
        })

    if (error) {
      setMessage(error.message)
      return
    }

    setNewSubject('')
    setSubjectDescription('')

    setMessage(
      'Disciplina criada com sucesso.'
    )

    await load()
  }

  async function createMaterial(
    event: FormEvent
  ) {
    event.preventDefault()

    if (
      !materialSubjectId ||
      !materialTitle.trim()
    ) {
      return
    }

    const { error } =
      await supabase
        .from('materials')
        .insert({
          subject_id:
            materialSubjectId,

          title:
            materialTitle.trim(),

          material_type:
            materialType,

          description:
            materialDescription.trim() ||
            null,

          external_url:
            externalUrl.trim() ||
            null,
        })

    if (error) {
      setMessage(error.message)
      return
    }

    setMaterialTitle('')
    setMaterialDescription('')
    setExternalUrl('')

    setMessage(
      'Conteudo adicionado com sucesso.'
    )

    await load()
  }

  async function toggleSubject(row: any) {
    const { error } =
      await supabase
        .from('subjects')
        .update({
          is_active:
            !row.is_active,
        })
        .eq('id', row.id)

    if (error) {
      setMessage(error.message)
      return
    }

    await load()
  }

  async function toggleMaterial(row: any) {
    const { error } =
      await supabase
        .from('materials')
        .update({
          is_active:
            !row.is_active,
        })
        .eq('id', row.id)

    if (error) {
      setMessage(error.message)
      return
    }

    await load()
  }

  async function removeMaterial(row: any) {
    const confirmed =
      window.confirm(
        `Excluir "${row.title}"?`
      )

    if (!confirmed) return

    const { error } =
      await supabase
        .from('materials')
        .delete()
        .eq('id', row.id)

    if (error) {
      setMessage(error.message)
      return
    }

    await load()
  }

  return (
    <div className="director-page">

      <div className="director-page-heading row">
        <div>
          <span>ACADEMICO</span>

          <h1>
            Disciplinas e conteudos
          </h1>

          <p>
            Crie disciplinas e organize os
            materiais de cada curso.
          </p>
        </div>

        <button
          className="director-button"
          type="button"
          onClick={() => void load()}
        >
          <RefreshCw size={17} />
          Atualizar
        </button>
      </div>


      {message && (
        <div className="director-alert">
          {message}
        </div>
      )}


      <section className="director-grid-two">

        <form
          className="director-panel director-form"
          onSubmit={createSubject}
        >
          <div className="director-panel-heading">
            <div>
              <span>DISCIPLINA</span>
              <h2>Nova disciplina</h2>
            </div>

            <BookOpen size={21} />
          </div>

          <label>
            Curso

            <select
              value={courseId}
              onChange={(event) =>
                setCourseId(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Selecione um curso
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nome da disciplina

            <input
              value={newSubject}
              onChange={(event) =>
                setNewSubject(
                  event.target.value
                )
              }
              placeholder="Ex.: Direito Penal"
              required
            />
          </label>

          <label>
            Descricao

            <textarea
              rows={4}
              value={subjectDescription}
              onChange={(event) =>
                setSubjectDescription(
                  event.target.value
                )
              }
              placeholder="Conte brevemente o que sera estudado."
            />
          </label>

          <button className="director-primary-button">
            <Plus size={17} />
            Criar disciplina
          </button>
        </form>


        <form
          className="director-panel director-form"
          onSubmit={createMaterial}
        >
          <div className="director-panel-heading">
            <div>
              <span>MATERIAL</span>
              <h2>Novo conteudo</h2>
            </div>

            <FileText size={21} />
          </div>

          <label>
            Disciplina

            <select
              value={materialSubjectId}
              onChange={(event) =>
                setMaterialSubjectId(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Selecione uma disciplina
              </option>

              {subjects.map((subject) => (
                <option
                  key={subject.id}
                  value={subject.id}
                >
                  {courseName(subject)}
                  {' / '}
                  {subject.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Titulo

            <input
              value={materialTitle}
              onChange={(event) =>
                setMaterialTitle(
                  event.target.value
                )
              }
              placeholder="Ex.: Introducao ao Direito Penal"
              required
            />
          </label>

          <label>
            Tipo

            <select
              value={materialType}
              onChange={(event) =>
                setMaterialType(
                  event.target.value
                )
              }
            >
              <option value="lesson">
                Aula
              </option>

              <option value="article">
                Artigo
              </option>

              <option value="video">
                Video
              </option>

              <option value="pdf">
                PDF
              </option>

              <option value="link">
                Link
              </option>

              <option value="flashcard">
                Flashcard
              </option>
            </select>
          </label>

          <label>
            Descricao

            <textarea
              rows={3}
              value={materialDescription}
              onChange={(event) =>
                setMaterialDescription(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Link / URL

            <input
              value={externalUrl}
              onChange={(event) =>
                setExternalUrl(
                  event.target.value
                )
              }
              placeholder="https://..."
            />
          </label>

          <button className="director-primary-button">
            <Plus size={17} />
            Adicionar conteudo
          </button>
        </form>

      </section>


      <section
        className="director-panel"
        style={{ marginTop: 12 }}
      >
        <div className="director-panel-heading">
          <div>
            <span>ESTRUTURA</span>

            <h2>
              Disciplinas cadastradas
            </h2>
          </div>
        </div>

        {loading && (
          <div className="director-empty">
            Carregando...
          </div>
        )}

        {!loading &&
          subjects.length === 0 && (
            <div className="director-empty">
              Nenhuma disciplina cadastrada ainda.
            </div>
          )}

        <div className="director-list">
          {subjects.map((subject) => (
            <div
              className="director-list-row"
              key={subject.id}
            >
              <div>
                <strong>
                  {subject.name}
                </strong>

                <span>
                  {courseName(subject)}
                </span>
              </div>

              <button
                type="button"
                className={
                  subject.is_active
                    ? 'director-course-toggle active'
                    : 'director-course-toggle'
                }
                onClick={() =>
                  void toggleSubject(subject)
                }
              >
                {subject.is_active
                  ? <Eye size={17} />
                  : <EyeOff size={17} />}

                {subject.is_active
                  ? 'Ativa'
                  : 'Oculta'}
              </button>
            </div>
          ))}
        </div>
      </section>


      <section
        className="director-panel"
        style={{ marginTop: 12 }}
      >
        <div className="director-panel-heading">
          <div>
            <span>BIBLIOTECA</span>

            <h2>
              Conteudos cadastrados
            </h2>
          </div>
        </div>

        {materials.length === 0 && (
          <div className="director-empty">
            Nenhum conteudo cadastrado ainda.
          </div>
        )}

        <div className="director-list">
          {materials.map((material) => (
            <div
              className="director-list-row"
              key={material.id}
            >
              <div>
                <strong>
                  {material.title}
                </strong>

                <span>
                  {subjectName(material)}
                  {' / '}
                  {material.material_type}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  className={
                    material.is_active
                      ? 'director-course-toggle active'
                      : 'director-course-toggle'
                  }
                  onClick={() =>
                    void toggleMaterial(
                      material
                    )
                  }
                >
                  {material.is_active
                    ? <Eye size={16} />
                    : <EyeOff size={16} />}
                </button>

                <button
                  type="button"
                  className="director-delete"
                  onClick={() =>
                    void removeMaterial(
                      material
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}