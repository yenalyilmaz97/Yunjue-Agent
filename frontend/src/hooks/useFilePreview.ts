import { useEffect, useState } from 'react'

export const useFilePreview = (file: File | null) => {
    const [preview, setPreview] = useState<string | null>(null)

    useEffect(() => {
        if (!file) {
            setPreview(null)
            return
        }

        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    return preview
}
