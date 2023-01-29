import { User, useSupabaseClient } from '@supabase/auth-helpers-react'
import Button from '@mui/joy/Button'
import Box from '@mui/joy/Box'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'

const Login = () => {
    const supabase = useSupabaseClient()

    const [user, setUser] = useState<User | null>()

    const fetchUser = useCallback( () => {
        supabase.auth.getUser().then(resp => {
            setUser(resp.data.user)
        }).catch(() => setUser(null))
    }, [supabase.auth])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    async function signInWithGitHub() {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
        })
        await fetchUser()
    }

    async function signout() {
        await supabase.auth.signOut()
        await fetchUser()
    }


    return (
        <Box height="10rem" display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Box display="flex" justifyContent="center" alignItems="center">
                {user === null
                    ? (
                        <Button onClick={signInWithGitHub} startDecorator={(
                            <Image width={25} alt="GitHub Login" src="assets/GitHub-Mark-Light-120px-plus.png" />
                        )}>
                            Login with GitHub
                        </Button>
                    )
                    : (user === undefined
                        ? null
                        : (
                            <Button color='danger' onClick={signout}>
                                Logout
                            </Button>
                        )
                    )
                }
            </Box>
        </Box>

    )
}

export default Login