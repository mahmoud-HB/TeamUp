import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getAuth() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;

    return { user, session };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, session: null };
  }
}
