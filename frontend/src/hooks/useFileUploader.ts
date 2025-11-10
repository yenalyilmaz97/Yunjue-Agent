import { useState } from 'react'

type FileType = File & {
  preview?: string
  formattedSize?: string
}
export default function useFileUploader(showPreview: boolean = true) {
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([])
  /**
   * Handled the accepted files and shows the preview
   */
  const handleAcceptedFiles = (files: FileType[], callback?: (files: FileType[]) => void) => {
    // Process new files (add preview and formattedSize)
    const processedFiles = files.map((file) =>
      Object.assign(file, {
        preview: file['type'].split('/')[0] === 'image' ? URL.createObjectURL(file) : null,
        formattedSize: formatBytes(file.size),
      }),
    )
    
    if (showPreview) {
      // Update internal state for preview
      const allFiles = [...selectedFiles, ...processedFiles]
      setSelectedFiles(allFiles)
    }
    
    // Always pass only the newly added files to callback
    // The callback handler will manage its own state
    if (callback) callback(processedFiles)
  }
  /**
   * Formats the size
   */
  const formatBytes = (bytes: number, decimals: number = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
  /*
   * Removes the selected file
   */
  const removeFile = (file: FileType) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(newFiles.indexOf(file), 1)
    setSelectedFiles(newFiles)
  }
  return {
    selectedFiles,
    handleAcceptedFiles,
    removeFile,
  }
}
