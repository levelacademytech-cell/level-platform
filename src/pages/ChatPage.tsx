import {
  AtSign,
  Clock3,
  MessageCircle,
  Plus,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabase'


type ThreadRow = {
  thread_id: string
  kind: string
  thread_title: string
  last_message: string | null
  last_message_at: string | null
  member_count: number
}


type SearchUser = {
  user_id: string
  display_name: string
  username: string | null
  email: string
}


type ChatMessage = {
  id: string
  body: string
  created_at: string
  expires_at: string
  sender_id: string
  sender_name: string
}


type ThreadMember = {
  user_id: string
  display_name: string
  username: string | null
}


function shortTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString(
    'pt-BR',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}


function shortDate(
  value: string
) {
  const date =
    new Date(value)

  const today =
    new Date()

  if (
    date.toDateString() ===
    today.toDateString()
  ) {
    return shortTime(value)
  }

  return date.toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: '2-digit',
    }
  )
}


export function ChatPage() {
  const {
    user,
  } = useAuth()


  const [
    threads,
    setThreads,
  ] =
    useState<ThreadRow[]>([])


  const [
    selectedThreadId,
    setSelectedThreadId,
  ] =
    useState('')


  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>([])


  const [
    members,
    setMembers,
  ] =
    useState<ThreadMember[]>([])


  const [
    search,
    setSearch,
  ] =
    useState('')


  const [
    searchResults,
    setSearchResults,
  ] =
    useState<SearchUser[]>([])


  const [
    messageText,
    setMessageText,
  ] =
    useState('')


  const [
    statusMessage,
    setStatusMessage,
  ] =
    useState('')


  const [
    loadingMessages,
    setLoadingMessages,
  ] =
    useState(false)


  const [
    groupOpen,
    setGroupOpen,
  ] =
    useState(false)


  const [
    groupTitle,
    setGroupTitle,
  ] =
    useState('')


  const [
    groupUsers,
    setGroupUsers,
  ] =
    useState('')


  const selectedThread =
    useMemo(
      () =>
        threads.find(
          (thread) =>
            thread.thread_id ===
            selectedThreadId
        ) ?? null,
      [
        threads,
        selectedThreadId,
      ]
    )


  async function loadThreads(
    selectFirst = false
  ) {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        'adv_get_my_chat_threads'
      )

    if (error) {
      setStatusMessage(
        error.message
      )

      return
    }

    const rows =
      (data ?? []) as ThreadRow[]

    setThreads(rows)

    if (
      selectFirst &&
      !selectedThreadId &&
      rows.length > 0
    ) {
      setSelectedThreadId(
        rows[0].thread_id
      )
    }
  }


  async function loadConversation(
    threadId: string
  ) {
    if (!threadId) {
      setMessages([])
      setMembers([])
      return
    }

    setLoadingMessages(true)

    const [
      messagesResult,
      membersResult,
    ] =
      await Promise.all([
        supabase.rpc(
          'adv_get_chat_messages',
          {
            p_thread_id:
              threadId,
          }
        ),

        supabase.rpc(
          'adv_get_chat_thread_members',
          {
            p_thread_id:
              threadId,
          }
        ),
      ])


    if (messagesResult.error) {
      setStatusMessage(
        messagesResult.error.message
      )
    } else {
      setMessages(
        (messagesResult.data ??
          []) as ChatMessage[]
      )
    }


    if (membersResult.error) {
      setStatusMessage(
        membersResult.error.message
      )
    } else {
      setMembers(
        (membersResult.data ??
          []) as ThreadMember[]
      )
    }

    setLoadingMessages(false)
  }


  useEffect(() => {
    void loadThreads(true)
  }, [])


  useEffect(() => {
    if (!selectedThreadId) {
      return
    }

    void loadConversation(
      selectedThreadId
    )
  }, [selectedThreadId])


  useEffect(() => {
    if (!selectedThreadId) {
      return
    }

    const timer =
      window.setInterval(
        () => {
          void loadConversation(
            selectedThreadId
          )

          void loadThreads()
        },
        3000
      )

    return () =>
      window.clearInterval(
        timer
      )
  }, [selectedThreadId])


  useEffect(() => {
    const query =
      search.trim()

    if (
      query.length < 2
    ) {
      setSearchResults([])
      return
    }

    const timer =
      window.setTimeout(
        () => {
          void supabase
            .rpc(
              'adv_search_chat_users',
              {
                p_query:
                  query,
              }
            )
            .then(
              ({
                data,
                error,
              }) => {
                if (error) {
                  setStatusMessage(
                    error.message
                  )

                  return
                }

                setSearchResults((data ?? []) as SearchUser[])
              }
            )
        },
        250
      )

    return () =>
      window.clearTimeout(
        timer
      )
  }, [search])


  async function startDirectChat(
    target: SearchUser
  ) {
    const identifier =
      target.username ||
      target.email

    const {
      data,
      error,
    } =
      await supabase.rpc(
        'adv_start_direct_chat',
        {
          p_identifier:
            identifier,
        }
      )

    if (error) {
      setStatusMessage(
        error.message
      )

      return
    }

    if (!data) {
      setStatusMessage(
        'Não foi possível iniciar a conversa.'
      )

      return
    }

    setSearch('')
    setSearchResults([])

    await loadThreads()

    setSelectedThreadId(
      String(data)
    )
  }


  async function createGroup() {
    const title =
      groupTitle.trim()

    const identifiers =
      groupUsers
        .split(
          /[,;\n]+/
        )
        .map(
          (item) =>
            item.trim()
        )
        .filter(Boolean)


    if (!title) {
      setStatusMessage(
        'Informe o nome do grupo.'
      )

      return
    }


    if (
      identifiers.length === 0
    ) {
      setStatusMessage(
        'Informe pelo menos um e-mail ou @usuário.'
      )

      return
    }


    const {
      data,
      error,
    } =
      await supabase.rpc(
        'adv_create_group_chat',
        {
          p_title:
            title,

          p_identifiers:
            identifiers,
        }
      )


    if (error) {
      setStatusMessage(
        error.message
      )

      return
    }


    if (!data) {
      return
    }


    setGroupTitle('')
    setGroupUsers('')
    setGroupOpen(false)

    await loadThreads()

    setSelectedThreadId(
      String(data)
    )
  }


  async function sendMessage() {
    if (
      !user ||
      !selectedThreadId ||
      !messageText.trim()
    ) {
      return
    }


    const text =
      messageText.trim()

    setMessageText('')


    const {
      error,
    } =
      await supabase
        .from(
          'adv_chat_messages'
        )
        .insert({
          thread_id:
            selectedThreadId,

          sender_id:
            user.id,

          body:
            text,
        })


    if (error) {
      setMessageText(text)

      setStatusMessage(
        error.message
      )

      return
    }


    await Promise.all([
      loadConversation(
        selectedThreadId
      ),

      loadThreads(),
    ])
  }


  return (
    <div className="page chat-page">

      <div className="page-heading chat-page-heading">

        <div>
          <span className="eyebrow">
            COMUNICAÇÃO
          </span>

          <h1>
            Chat interno
          </h1>

          <p>
            Converse de forma privada com outros
            membros da LEVEL ou crie grupos para
            sua equipe.
          </p>
        </div>


        <div className="chat-expiration-notice">
          <Clock3 size={17} />

          <div>
            <strong>
              24 horas
            </strong>

            <span>
              As mensagens deste chat são
              excluídas automaticamente.
            </span>
          </div>
        </div>

      </div>


      {statusMessage && (
        <div className="system-message chat-system-message">

          <span>
            {statusMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setStatusMessage('')
            }
          >
            <X size={15} />
          </button>

        </div>
      )}


      <section className="chat-shell">


        <aside className="chat-conversations">

          <div className="chat-sidebar-heading">

            <div>
              <span className="eyebrow">
                CONVERSAS
              </span>

              <strong>
                Equipe LEVEL
              </strong>
            </div>


            <button
              type="button"
              className="chat-group-button"
              onClick={() =>
                setGroupOpen(
                  (current) =>
                    !current
                )
              }
              title="Criar grupo"
            >
              <Users size={17} />
              <Plus size={12} />
            </button>

          </div>


          {groupOpen && (
            <div className="new-group-box">

              <div className="new-group-title">
                <strong>
                  Novo grupo
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setGroupOpen(false)
                  }
                >
                  <X size={14} />
                </button>
              </div>


              <label>
                Nome do grupo

                <input
                  value={groupTitle}
                  onChange={(event) =>
                    setGroupTitle(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Equipe Bancário"
                />
              </label>


              <label>
                Participantes

                <textarea
                  rows={3}
                  value={groupUsers}
                  onChange={(event) =>
                    setGroupUsers(
                      event.target.value
                    )
                  }
                  placeholder="email@escritorio.com, @usuario..."
                />
              </label>


              <button
                type="button"
                className="primary-button full-button"
                onClick={() =>
                  void createGroup()
                }
              >
                <Users size={15} />

                Criar grupo
              </button>

            </div>
          )}


          <div className="chat-search-box">

            <Search size={16} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Buscar por nome, e-mail ou @usuário"
            />

          </div>


          {searchResults.length >
            0 && (
            <div className="chat-search-results">

              <span>
                INICIAR CONVERSA
              </span>


              {searchResults.map(
                (person) => (
                  <button
                    type="button"
                    key={
                      person.user_id
                    }
                    onClick={() =>
                      void startDirectChat(
                        person
                      )
                    }
                  >

                    <div className="chat-avatar">
                      {person.display_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>


                    <div>
                      <strong>
                        {
                          person.display_name
                        }
                      </strong>

                      <small>
                        {person.username
                          ? `@${person.username}`
                          : person.email}
                      </small>
                    </div>


                    <UserPlus
                      size={15}
                    />

                  </button>
                )
              )}

            </div>
          )}


          <div className="chat-thread-list">

            {threads.length === 0 && (
              <div className="chat-thread-empty">

                <MessageCircle
                  size={27}
                />

                <strong>
                  Nenhuma conversa
                </strong>

                <span>
                  Pesquise um colega acima para
                  iniciar.
                </span>

              </div>
            )}


            {threads.map(
              (thread) => (
                <button
                  key={
                    thread.thread_id
                  }
                  type="button"
                  className={
                    selectedThreadId ===
                    thread.thread_id
                      ? 'chat-thread active'
                      : 'chat-thread'
                  }
                  onClick={() =>
                    setSelectedThreadId(
                      thread.thread_id
                    )
                  }
                >

                  <div
                    className={
                      thread.kind ===
                      'group'
                        ? 'chat-avatar group'
                        : 'chat-avatar'
                    }
                  >
                    {thread.kind ===
                    'group'
                      ? (
                        <Users
                          size={15}
                        />
                      )
                      : thread.thread_title
                          .charAt(0)
                          .toUpperCase()}
                  </div>


                  <div className="chat-thread-content">

                    <div>
                      <strong>
                        {
                          thread.thread_title
                        }
                      </strong>

                      {thread.last_message_at && (
                        <span>
                          {shortDate(
                            thread.last_message_at
                          )}
                        </span>
                      )}
                    </div>


                    <p>
                      {thread.last_message ||
                        'Conversa iniciada'}
                    </p>

                  </div>

                </button>
              )
            )}

          </div>

        </aside>


        <section className="chat-conversation-panel">

          {!selectedThread ? (
            <div className="chat-welcome">

              <div className="chat-welcome-icon">
                <MessageCircle
                  size={34}
                />
              </div>

              <span className="eyebrow">
                LEVEL ADV
              </span>

              <h2>
                Comunicação da equipe
              </h2>

              <p>
                Selecione uma conversa ou busque
                um colega para começar.
              </p>

            </div>
          ) : (
            <>

              <header className="chat-conversation-header">

                <div className="chat-avatar large">
                  {selectedThread.kind ===
                  'group'
                    ? (
                      <Users
                        size={19}
                      />
                    )
                    : selectedThread
                        .thread_title
                        .charAt(0)
                        .toUpperCase()}
                </div>


                <div className="chat-header-info">

                  <strong>
                    {
                      selectedThread.thread_title
                    }
                  </strong>

                  <div>
                    {selectedThread.kind ===
                    'group' && (
                      <span>
                        {
                          selectedThread.member_count
                        } participantes
                      </span>
                    )}

                    <span>
                      mensagens temporárias
                    </span>
                  </div>

                </div>


                <div className="chat-header-members">

                  {members
                    .slice(
                      0,
                      4
                    )
                    .map(
                      (member) => (
                        <span
                          key={
                            member.user_id
                          }
                          title={
                            member.display_name
                          }
                        >
                          {member.display_name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )
                    )}

                </div>

              </header>


              <div className="chat-message-area">

                <div className="chat-privacy-note">

                  <Clock3
                    size={14}
                  />

                  <span>
                    As mensagens são removidas
                    automaticamente 24 horas após
                    o envio.
                  </span>

                </div>


                {loadingMessages &&
                  messages.length ===
                    0 && (
                    <div className="chat-loading">
                      Carregando conversa...
                    </div>
                  )}


                {!loadingMessages &&
                  messages.length ===
                    0 && (
                    <div className="chat-no-messages">

                      <MessageCircle
                        size={29}
                      />

                      <strong>
                        Comece a conversa
                      </strong>

                      <span>
                        Nenhuma mensagem ativa nas
                        últimas 24 horas.
                      </span>

                    </div>
                  )}


                {messages.map(
                  (item) => {
                    const own =
                      item.sender_id ===
                      user?.id

                    return (
                      <article
                        key={item.id}
                        className={
                          own
                            ? 'internal-message own'
                            : 'internal-message'
                        }
                      >

                        {!own && (
                          <strong>
                            {
                              item.sender_name
                            }
                          </strong>
                        )}


                        <p>
                          {item.body}
                        </p>


                        <footer>

                          <span>
                            {shortTime(
                              item.created_at
                            )}
                          </span>

                          <span>
                            expira às{' '}
                            {shortTime(
                              item.expires_at
                            )}
                          </span>

                        </footer>

                      </article>
                    )
                  }
                )}

              </div>


              <footer className="chat-composer">

                <div className="chat-composer-input">

                  <AtSign size={17} />

                  <textarea
                    rows={1}
                    maxLength={5000}
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(
                        event.target.value
                      )
                    }
                    placeholder="Digite uma mensagem..."
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          'Enter' &&
                        !event.shiftKey
                      ) {
                        event.preventDefault()

                        void sendMessage()
                      }
                    }}
                  />

                </div>


                <button
                  type="button"
                  className="primary-button chat-send-button"
                  disabled={
                    !messageText.trim()
                  }
                  onClick={() =>
                    void sendMessage()
                  }
                >
                  <Send size={17} />

                  Enviar
                </button>

              </footer>

            </>
          )}

        </section>

      </section>

    </div>
  )
}