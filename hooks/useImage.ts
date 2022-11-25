import { useEffect, useState } from "react";

const DEFAULT_IMAGES = ["https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286"]

const useImage = (url: string, title?: string) => {
    const [image, setImage] = useState(() => {
        if(title) {
            let hash = 0
            for (let index = 0; index < title.length; index++) {
                hash += title[index].charCodeAt(index);
            }
            return(DEFAULT_IMAGES[hash % DEFAULT_IMAGES.length])
        }
        return DEFAULT_IMAGES[0]
    })

    useEffect(() => {
        if(url) {
            setImage(url)
        }
    }, [url])


    return image
}

export default useImage