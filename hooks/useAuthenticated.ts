import { useEffect, useState } from "react"

export const useAuthenticated = () => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)

    useEffect(() => {
        let active = true
        load()
        return () => { active = false }

        async function load() {
            const res = await (await fetch("api/auth")).json()
            if (!active) { return }
            setIsAdmin(res.data.isAdmin)
        }
    }, [])

    return isAdmin
}