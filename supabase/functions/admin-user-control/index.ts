import {
  createClient,
} from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':
    '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':
    'POST, OPTIONS',
}

function json(
  body: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(
      body
    ),
    {
      status,

      headers: {
        ...corsHeaders,
        'Content-Type':
          'application/json',
      },
    }
  )
}

Deno.serve(
  async (
    request
  ) => {
    if (
      request.method ===
      'OPTIONS'
    ) {
      return new Response(
        'ok',
        {
          headers:
            corsHeaders,
        }
      )
    }

    try {
      const authHeader =
        request.headers.get(
          'Authorization'
        )

      if (
        !authHeader
      ) {
        return json(
          {
            error:
              'SessÃ£o nÃ£o informada.',
          },
          401
        )
      }

      const token =
        authHeader.replace(
          /^Bearer\s+/i,
          ''
        )

      const url =
        Deno.env.get(
          'SUPABASE_URL'
        )

      const serviceKey =
        Deno.env.get(
          'SUPABASE_SERVICE_ROLE_KEY'
        )

      if (
        !url ||
        !serviceKey
      ) {
        return json(
          {
            error:
              'Servidor nÃ£o configurado.',
          },
          500
        )
      }

      const admin =
        createClient(
          url,
          serviceKey,
          {
            auth: {
              autoRefreshToken:
                false,

              persistSession:
                false,
            },
          }
        )

      const {
        data:
          userResult,
        error:
          userError,
      } =
        await admin
          .auth
          .getUser(
            token
          )

      if (
        userError ||
        !userResult.user
      ) {
        return json(
          {
            error:
              'SessÃ£o invÃ¡lida.',
          },
          401
        )
      }

      const actorId =
        userResult
          .user.id

      const {
        data:
          roleRows,
        error:
          roleError,
      } =
        await admin
          .from(
            'user_roles'
          )
          .select(
            'roles!inner(key)'
          )
          .eq(
            'user_id',
            actorId
          )

      if (roleError) {
        return json(
          {
            error:
              roleError.message,
          },
          500
        )
      }

      const isAdmin =
        (
          roleRows ??
          []
        ).some(
          (
            item:
              Record<string, unknown>
          ) => {
            const nested =
              item.roles

            const role =
              Array.isArray(
                nested
              )
                ? nested[0]
                : nested

            const key =
              (
                role as
                  | Record<string, unknown>
                  | undefined
              )?.key

            return [
              'admin',
              'super_admin',
              'director',
            ].includes(
              String(
                key ?? ''
              )
            )
          }
        )

      if (!isAdmin) {
        return json(
          {
            error:
              'Acesso administrativo necessÃ¡rio.',
          },
          403
        )
      }

      const body =
        await request.json()

      if (
        body.action ===
        'set_temporary_password'
      ) {
        const userId =
          String(
            body.user_id ??
            ''
          )

        const password =
          String(
            body.password ??
            ''
          )

        if (
          !userId ||
          password.length < 8
        ) {
          return json(
            {
              error:
                'UsuÃ¡rio ou senha temporÃ¡ria invÃ¡lidos.',
            },
            400
          )
        }

        const {
          error,
        } =
          await admin
            .auth
            .admin
            .updateUserById(
              userId,
              {
                password,

                user_metadata: {
                  password_changed_by_admin:
                    true,

                  password_changed_at:
                    new Date()
                      .toISOString(),
                },
              }
            )

        if (error) {
          return json(
            {
              error:
                error.message,
            },
            400
          )
        }

        await admin
          .from(
            'audit_logs'
          )
          .insert({
            actor_user_id:
              actorId,

            action:
              'admin.temporary_password_set',

            entity_type:
              'user',

            entity_id:
              userId,

            metadata:
              {},
          })

        return json({
          ok: true,
        })
      }

      return json(
        {
          error:
            'AÃ§Ã£o administrativa desconhecida.',
        },
        400
      )
    } catch (
      error
    ) {
      return json(
        {
          error:
            error instanceof
            Error
              ? error.message
              : 'Erro interno.',
        },
        500
      )
    }
  }
)
