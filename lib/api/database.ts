// Creating a new supabase server client object (e.g. in API route):
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next'
import { Database } from '../../lib/database.types'

export async function getAllProjects(context: GetServerSidePropsContext | { req: NextApiRequest; res: NextApiResponse<any> }) {
    const supabaseServerClient = createBrowserSupabaseClient<Database>()
    const { data, error, status } = await supabaseServerClient.from("projects").select("*")

    return { data, error, status }
}