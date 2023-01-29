import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '../../lib/types/database.types'

const auth = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({ req, res })
  const {
    data: { user },
    error
  } = await supabaseServerClient.auth.getUser()

  res.status(200).json({ data: { isAdmin: user?.email === "gkrumbach@gmail.com" }, error})
}

export default auth