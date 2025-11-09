import { useState, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { contentService } from '@/services'

type ContentType = 'audio' | 'video' | 'image'

interface ContentUploaderProps {
  onUploadComplete: (type: ContentType, url: string) => void
  disabled?: boolean
}

const getFileType = (fileName: string): ContentType | null => {
  const ext = fileName.toLowerCase().split('.').pop()
  if (!ext) return null

  const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma']
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv']
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']

  if (audioExts.includes(ext)) return 'audio'
  if (videoExts.includes(ext)) return 'video'
  if (imageExts.includes(ext)) return 'image'
  return null
}

const ContentUploader = ({ onUploadComplete, disabled = false }: ContentUploaderProps) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileType = getFileType(file.name)
    if (!fileType) {
      alert(`Unsupported file type: ${file.name}. Please upload audio, video, or image files.`)
      return
    }

    setUploading(true)
    try {
      const { url } = await contentService.postArticleAsset(file)
      onUploadComplete(fileType, url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
      // Reset input so same file can be selected again
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="d-none"
        accept="audio/*,video/*,image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline-primary"
        size="sm"
        onClick={() => {
          fileInputRef.current?.click()
        }}
        disabled={disabled || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>
    </div>
  )
}

export default ContentUploader

