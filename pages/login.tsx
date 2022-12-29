import { User, useSupabaseClient } from '@supabase/auth-helpers-react'
import Button from '@mui/joy/Button'
import Box from '@mui/joy/Box'
import { useEffect, useState } from 'react'

const Login = () => {
    const supabase = useSupabaseClient()

    const [user, setUser] = useState<User | null>()

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = () => {
        supabase.auth.getUser().then(resp => {
            setUser(resp.data.user)
        }).catch(() => setUser(null))
    }

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
                            <img width="25px" alt="GitHub Login" src="assets/GitHub-Mark-Light-120px-plus.png" />
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