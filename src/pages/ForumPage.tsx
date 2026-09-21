import {
  ArrowLeft,
  Eye,
  Heart,
  Lock,
  MessageSquare,
  Pin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Unlock,
  Users,
  X,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'


type TopicRow = {
  id: string
  author_id: string
  author_name: string
  username: string | null
  category: string
  title: string
  body: string
  tags: string[]
  is_pinned: boolean
  is_locked: boolean
  views_count: number
  replies_count: number
  likes_count: number
  liked_by_me: boolean
  created_at: string
  last_activity_at: string
}


type PostRow = {
  id: string
  author_id: string
  author_name: string
  username: string | null
  body: string
  created_at: string
  updated_at: string
}


const categories = [
  { value: 'all', label: 'Todos' },
  { value: 'geral', label: 'Geral' },
  { value: 'bancario', label: 'Bancário' },
  { value: 'previdenciario', label: 'Previdenciário' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'tributario', label: 'Tributário' },
  { value: 'civel', label: 'Cível' },
  { value: 'penal', label: 'Penal' },
  { value: 'processual', label: 'Processual' },
]


function categoryLabel(
  value: string
) {
  return (
    categories.find(
      (item) =>
        item.value === value
    )?.label ??
    value
  )
}


function dateTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}


export function ForumPage() {
  const {
    topicId,
  } = useParams()

  const navigate =
    useNavigate()

  const {
    user,
    isAdmin,
  } = useAuth()


  const [
    topics,
    setTopics,
  ] =
    useState<TopicRow[]>([])


  const [
    posts,
    setPosts,
  ] =
    useState<PostRow[]>([])


  const [
    search,
    setSearch,
  ] =
    useState('')


  const [
    category,
    setCategory,
  ] =
    useState('all')


  const [
    newTopicOpen,
    setNewTopicOpen,
  ] =
    useState(false)


  const [
    newTitle,
    setNewTitle,
  ] =
    useState('')


  const [
    newCategory,
    setNewCategory,
  ] =
    useState('geral')


  const [
    newTags,
    setNewTags,
  ] =
    useState('')


  const [
    newBody,
    setNewBody,
  ] =
    useState('')


  const [
    reply,
    setReply,
  ] =
    useState('')


  const [
    message,
    setMessage,
  ] =
    useState('')


  const [
    loading,
    setLoading,
  ] =
    useState(true)


  const currentTopic =
    useMemo(
      () =>
        topics.find(
          (item) =>
            item.id === topicId
        ) ?? null,
      [
        topics,
        topicId,
      ]
    )


  async function loadTopics(
    forceAll = false
  ) {
    setLoading(true)

    const {
      data,
      error,
    } =
      await supabase.rpc(
        'adv_forum_topics_feed',
        {
          p_search:
            forceAll
              ? ''
              : search.trim(),

          p_category:
            forceAll
              ? 'all'
              : category,
        }
      )

    if (error) {
      setMessage(
        error.message
      )

      setLoading(false)

      return
    }

    setTopics(
      (data ?? []) as TopicRow[]
    )

    setLoading(false)
  }


  async function loadPosts(
    id: string
  ) {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        'adv_forum_topic_posts',
        {
          p_topic_id:
            id,
        }
      )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    setPosts(
      (data ?? []) as PostRow[]
    )
  }


  useEffect(() => {
    if (topicId) {
      void loadTopics(true)
      return
    }

    const timer =
      window.setTimeout(
        () => {
          void loadTopics()
        },
        250
      )

    return () =>
      window.clearTimeout(
        timer
      )
  }, [
    search,
    category,
    topicId,
  ])


  useEffect(() => {
    if (!topicId) {
      setPosts([])
      return
    }

    void loadPosts(
      topicId
    )

    void supabase.rpc(
      'adv_forum_add_view',
      {
        p_topic_id:
          topicId,
      }
    )
  }, [topicId])


  async function createTopic() {
    if (!user) {
      return
    }

    if (
      newTitle.trim().length < 5
    ) {
      setMessage(
        'O título precisa ter pelo menos 5 caracteres.'
      )

      return
    }

    if (
      newBody.trim().length < 10
    ) {
      setMessage(
        'Descreva melhor o assunto da discussão.'
      )

      return
    }

    const tags =
      newTags
        .split(',')
        .map(
          (item) =>
            item
              .trim()
              .replace(
                /^#/,
                ''
              )
        )
        .filter(Boolean)
        .slice(0, 8)


    const {
      data,
      error,
    } =
      await supabase
        .from(
          'adv_forum_topics'
        )
        .insert({
          author_id:
            user.id,

          category:
            newCategory,

          title:
            newTitle.trim(),

          body:
            newBody.trim(),

          tags,
        })
        .select('id')
        .single()


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    setNewTopicOpen(false)
    setNewTitle('')
    setNewCategory('geral')
    setNewTags('')
    setNewBody('')

    navigate(
      `/app/forum/${data.id}`
    )
  }


  async function sendReply() {
    if (
      !user ||
      !topicId ||
      !reply.trim()
    ) {
      return
    }


    const {
      error,
    } =
      await supabase
        .from(
          'adv_forum_posts'
        )
        .insert({
          topic_id:
            topicId,

          author_id:
            user.id,

          body:
            reply.trim(),
        })


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    setReply('')

    await Promise.all([
      loadPosts(topicId),
      loadTopics(true),
    ])
  }


  async function toggleLike(
    id: string
  ) {
    const {
      error,
    } =
      await supabase.rpc(
        'adv_forum_toggle_like',
        {
          p_topic_id:
            id,
        }
      )

    if (error) {
      setMessage(
        error.message
      )

      return
    }

    await loadTopics(
      Boolean(topicId)
    )
  }


  async function deleteTopic(
    topic: TopicRow
  ) {
    const confirmed =
      window.confirm(
        `Excluir o tópico "${topic.title}"?`
      )

    if (!confirmed) {
      return
    }


    const {
      error,
    } =
      await supabase
        .from(
          'adv_forum_topics'
        )
        .delete()
        .eq(
          'id',
          topic.id
        )


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    navigate(
      '/app/forum'
    )

    await loadTopics()
  }


  async function deletePost(
    post: PostRow
  ) {
    const confirmed =
      window.confirm(
        'Excluir esta resposta?'
      )

    if (!confirmed) {
      return
    }


    const {
      error,
    } =
      await supabase
        .from(
          'adv_forum_posts'
        )
        .delete()
        .eq(
          'id',
          post.id
        )


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    if (topicId) {
      await loadPosts(
        topicId
      )
    }
  }


  async function togglePinned(
    topic: TopicRow
  ) {
    const {
      error,
    } =
      await supabase
        .from(
          'adv_forum_topics'
        )
        .update({
          is_pinned:
            !topic.is_pinned,
        })
        .eq(
          'id',
          topic.id
        )


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    await loadTopics(true)
  }


  async function toggleLocked(
    topic: TopicRow
  ) {
    const {
      error,
    } =
      await supabase
        .from(
          'adv_forum_topics'
        )
        .update({
          is_locked:
            !topic.is_locked,
        })
        .eq(
          'id',
          topic.id
        )


    if (error) {
      setMessage(
        error.message
      )

      return
    }


    await loadTopics(true)
  }


  if (
    topicId &&
    currentTopic
  ) {
    return (
      <div className="page forum-page">

        <button
          type="button"
          className="calculator-back"
          onClick={() =>
            navigate(
              '/app/forum'
            )
          }
        >
          <ArrowLeft
            size={15}
          />

          Voltar para o fórum
        </button>


        {message && (
          <div className="system-message forum-system-message">
            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage('')
              }
            >
              <X size={14} />
            </button>
          </div>
        )}


        <article className="forum-topic-detail">

          <div className="forum-detail-flags">

            <span>
              {categoryLabel(
                currentTopic.category
              )}
            </span>


            {currentTopic.is_pinned && (
              <span>
                <Pin size={12} />

                Fixado
              </span>
            )}


            {currentTopic.is_locked && (
              <span>
                <Lock size={12} />

                Encerrado
              </span>
            )}

          </div>


          <h1>
            {currentTopic.title}
          </h1>


          <div className="forum-author-line">

            <div className="forum-avatar">
              {currentTopic.author_name
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {currentTopic.author_name}
              </strong>

              <span>
                {currentTopic.username
                  ? `@${currentTopic.username} · `
                  : ''}

                {dateTime(
                  currentTopic.created_at
                )}
              </span>
            </div>

          </div>


          <p className="forum-topic-body">
            {currentTopic.body}
          </p>


          {currentTopic.tags.length >
            0 && (
            <div className="forum-tags">

              {currentTopic.tags.map(
                (tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                )
              )}

            </div>
          )}


          <div className="forum-detail-footer">

            <div>

              <button
                type="button"
                className={
                  currentTopic.liked_by_me
                    ? 'forum-action liked'
                    : 'forum-action'
                }
                onClick={() =>
                  void toggleLike(
                    currentTopic.id
                  )
                }
              >
                <Heart
                  size={15}
                />

                {currentTopic.likes_count}
              </button>


              <span className="forum-stat">
                <MessageSquare
                  size={15}
                />

                {currentTopic.replies_count}
              </span>


              <span className="forum-stat">
                <Eye size={15} />

                {currentTopic.views_count}
              </span>

            </div>


            {(currentTopic.author_id ===
              user?.id ||
              isAdmin) && (
              <button
                type="button"
                className="forum-delete"
                onClick={() =>
                  void deleteTopic(
                    currentTopic
                  )
                }
              >
                <Trash2
                  size={14}
                />

                Excluir tópico
              </button>
            )}

          </div>


          {isAdmin && (
            <div className="forum-admin-actions">

              <span>
                <ShieldCheck
                  size={14}
                />

                MODERAÇÃO
              </span>


              <button
                type="button"
                onClick={() =>
                  void togglePinned(
                    currentTopic
                  )
                }
              >
                <Pin size={14} />

                {currentTopic.is_pinned
                  ? 'Desafixar'
                  : 'Fixar tópico'}
              </button>


              <button
                type="button"
                onClick={() =>
                  void toggleLocked(
                    currentTopic
                  )
                }
              >
                {currentTopic.is_locked
                  ? (
                    <Unlock
                      size={14}
                    />
                  )
                  : (
                    <Lock
                      size={14}
                    />
                  )}

                {currentTopic.is_locked
                  ? 'Reabrir discussão'
                  : 'Encerrar discussão'}
              </button>

            </div>
          )}

        </article>


        <section className="forum-replies">

          <div className="forum-section-heading">

            <div>
              <span className="eyebrow">
                DISCUSSÃO
              </span>

              <h2>
                Respostas
              </h2>
            </div>

            <strong>
              {posts.length}
            </strong>

          </div>


          {posts.length ===
            0 && (
            <div className="forum-empty">

              <MessageSquare
                size={28}
              />

              <strong>
                Nenhuma resposta ainda
              </strong>

              <span>
                Seja o primeiro a contribuir
                com esta discussão.
              </span>

            </div>
          )}


          {posts.map(
            (post) => (
              <article
                key={post.id}
                className="forum-reply"
              >

                <div className="forum-avatar">
                  {post.author_name
                    .charAt(0)
                    .toUpperCase()}
                </div>


                <div>

                  <header>

                    <div>
                      <strong>
                        {post.author_name}
                      </strong>

                      <span>
                        {post.username
                          ? `@${post.username} · `
                          : ''}

                        {dateTime(
                          post.created_at
                        )}
                      </span>
                    </div>


                    {(post.author_id ===
                      user?.id ||
                      isAdmin) && (
                      <button
                        type="button"
                        onClick={() =>
                          void deletePost(
                            post
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    )}

                  </header>


                  <p>
                    {post.body}
                  </p>

                </div>

              </article>
            )
          )}


          {!currentTopic.is_locked ? (
            <div className="forum-reply-form">

              <textarea
                rows={5}
                value={reply}
                onChange={(event) =>
                  setReply(
                    event.target.value
                  )
                }
                placeholder="Escreva sua contribuição para esta discussão..."
              />


              <button
                type="button"
                className="primary-button"
                disabled={
                  !reply.trim()
                }
                onClick={() =>
                  void sendReply()
                }
              >
                <Send size={15} />

                Publicar resposta
              </button>

            </div>
          ) : (
            <div className="forum-locked">

              <Lock size={18} />

              <div>
                <strong>
                  Discussão encerrada
                </strong>

                <span>
                  O conteúdo continua disponível
                  para consulta.
                </span>
              </div>

            </div>
          )}

        </section>

      </div>
    )
  }


  return (
    <div className="page forum-page">

      <div className="page-heading forum-heading">

        <div>
          <span className="eyebrow">
            EQUIPE
          </span>

          <h1>
            Fórum jurídico
          </h1>

          <p>
            Discussões, dúvidas, interpretações,
            estratégias e conhecimento entre
            membros da equipe.
          </p>
        </div>


        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setNewTopicOpen(
              true
            )
          }
        >
          <Plus size={16} />

          Novo tópico
        </button>

      </div>


      {message && (
        <div className="system-message forum-system-message">
          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage('')
            }
          >
            <X size={14} />
          </button>
        </div>
      )}


      {newTopicOpen && (
        <section className="forum-new-topic">

          <div className="forum-new-header">

            <div>
              <span className="eyebrow">
                NOVA DISCUSSÃO
              </span>

              <h2>
                Criar tópico
              </h2>
            </div>


            <button
              type="button"
              onClick={() =>
                setNewTopicOpen(
                  false
                )
              }
            >
              <X size={18} />
            </button>

          </div>


          <div className="forum-form-grid">

            <label>
              Área jurídica

              <select
                value={newCategory}
                onChange={(event) =>
                  setNewCategory(
                    event.target.value
                  )
                }
              >
                {categories
                  .filter(
                    (item) =>
                      item.value !==
                      'all'
                  )
                  .map(
                    (item) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {item.label}
                      </option>
                    )
                  )}
              </select>
            </label>


            <label>
              Tags

              <input
                value={newTags}
                onChange={(event) =>
                  setNewTags(
                    event.target.value
                  )
                }
                placeholder="rotativo, BACEN, revisão..."
              />
            </label>

          </div>


          <label>
            Título

            <input
              value={newTitle}
              maxLength={180}
              onChange={(event) =>
                setNewTitle(
                  event.target.value
                )
              }
              placeholder="Qual assunto você quer discutir?"
            />
          </label>


          <label>
            Contexto da discussão

            <textarea
              rows={7}
              value={newBody}
              maxLength={20000}
              onChange={(event) =>
                setNewBody(
                  event.target.value
                )
              }
              placeholder="Explique a situação, dúvida ou interpretação..."
            />
          </label>


          <div className="forum-form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setNewTopicOpen(
                  false
                )
              }
            >
              Cancelar
            </button>


            <button
              type="button"
              className="primary-button"
              onClick={() =>
                void createTopic()
              }
            >
              <Plus size={15} />

              Publicar tópico
            </button>

          </div>

        </section>
      )}


      <section className="forum-toolbar">

        <div className="forum-search">

          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Pesquisar assunto, termo ou palavra-chave..."
          />

        </div>


        <div className="forum-tabs">

          {categories.map(
            (item) => (
              <button
                type="button"
                key={item.value}
                className={
                  category ===
                  item.value
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setCategory(
                    item.value
                  )
                }
              >
                {item.label}
              </button>
            )
          )}

        </div>

      </section>


      <section className="forum-feed">

        <header className="forum-feed-header">

          <div>
            <Users size={18} />

            <strong>
              Discussões da equipe
            </strong>
          </div>

          <span>
            {topics.length}
          </span>

        </header>


        {loading && (
          <div className="forum-empty">
            Carregando discussões...
          </div>
        )}


        {!loading &&
          topics.length ===
            0 && (
            <div className="forum-empty">

              <MessageSquare
                size={30}
              />

              <strong>
                Nenhuma discussão ainda
              </strong>

              <span>
                Crie o primeiro tópico do
                escritório.
              </span>

            </div>
          )}


        {!loading &&
          topics.map(
            (topic) => (
              <article
                key={topic.id}
                className="forum-topic-card"
                onClick={() =>
                  navigate(
                    `/app/forum/${topic.id}`
                  )
                }
              >

                <div className="forum-avatar">
                  {topic.author_name
                    .charAt(0)
                    .toUpperCase()}
                </div>


                <div className="forum-topic-content">

                  <div className="forum-topic-flags">

                    <span>
                      {categoryLabel(
                        topic.category
                      )}
                    </span>


                    {topic.is_pinned && (
                      <span>
                        <Pin size={11} />
                        FIXADO
                      </span>
                    )}


                    {topic.is_locked && (
                      <span>
                        <Lock size={11} />
                        ENCERRADO
                      </span>
                    )}

                  </div>


                  <h2>
                    {topic.title}
                  </h2>


                  <p>
                    {topic.body}
                  </p>


                  <footer>

                    <div>
                      <strong>
                        {topic.author_name}
                      </strong>

                      {topic.username && (
                        <span>
                          @{topic.username}
                        </span>
                      )}
                    </div>


                    <div>

                      <span>
                        <MessageSquare
                          size={14}
                        />

                        {topic.replies_count}
                      </span>

                      <span>
                        <Heart
                          size={14}
                        />

                        {topic.likes_count}
                      </span>

                      <span>
                        <Eye
                          size={14}
                        />

                        {topic.views_count}
                      </span>

                    </div>

                  </footer>

                </div>

              </article>
            )
          )}

      </section>

    </div>
  )
}