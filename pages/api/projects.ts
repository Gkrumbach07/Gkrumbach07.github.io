import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from '../../lib/database.types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const supabaseServerClient = createServerSupabaseClient<Database>({req, res})
    const { data, error, status } = await supabaseServerClient.from("projects").select("*")


  res.status(200).json({data, error, status})
}