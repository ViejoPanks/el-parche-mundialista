import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Handler que recibe el callback de OAuth (Google) o de email confirmation.
 *
 * Flujo:
 *   1. El usuario hace clic en "Iniciar con Google" → Supabase abre Google OAuth
 *   2. Google redirige aquí con un código (?code=xxx)
 *   3. Intercambiamos el código por una sesión
 *   4. Aseguramos que el perfil exista en la tabla profiles
 *   5. Redirigimos al usuario a la app
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/protected';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=No code provided`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Asegurar que el perfil existe en la tabla profiles
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingProfile) {
      // Crear perfil con datos de Google (full_name, avatar_url) o display_name del signup
      const displayName =
        user.user_metadata.display_name ||
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        user.email?.split('@')[0] ||
        'Usuario';

      const avatarUrl = user.user_metadata.avatar_url ?? user.user_metadata.picture ?? null;

      await supabase.from('profiles').insert({
        id: user.id,
        display_name: displayName,
        avatar_url: avatarUrl,
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
