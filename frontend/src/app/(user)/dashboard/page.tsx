import PageTitle from '@/components/PageTitle'
import HeroSlider from '@/components/dashboard/HeroSlider'
import DailyContentCard from '@/components/dashboard/DailyContentCard'
import LastUnlockedContent from '@/components/dashboard/LastUnlockedContent'
import WeeklyTasksTable from '@/components/dashboard/WeeklyTasksTable'
import { useEffect, useState } from 'react'
import { dailyContentService } from '@/services'
import type { DailyContentResponseDTO } from '@/services/dailyContent'
import { useAuthContext } from '@/context/useAuthContext'
const DashboardPage = () => {
  const { user } = useAuthContext()
  const [dailyContent, setDailyContent] = useState<DailyContentResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      const userId = parseInt(user.id)
      dailyContentService
        .getDailyContentByUser(userId)
        .then((data) => {
          setDailyContent(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [user])

  return (
    <>
      <PageTitle subName="Keçıyı Besle" title="User Dashboard" />
      
      {/* Hero Slider - Mobil öncelikli, her zaman göster */}
      <div className="d-block d-lg-none">
        <HeroSlider />
      </div>

      {/* Web için Card yapısı - Sadece desktop'ta göster */}
      <div className="d-none d-lg-block mb-4">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        ) : dailyContent ? (
          <DailyContentCard dailyContent={dailyContent} />
        ) : (
          <div className="text-center text-muted py-5">
            <p>Henüz günlük içerik bulunmamaktadır.</p>
          </div>
        )}
      </div>

      {/* En Son Açılan İçerik - HeroSlider'dan sonra göster */}
      <LastUnlockedContent />

      {/* Haftalık Görevler Tablosu */}
      <WeeklyTasksTable />
    </>
  )
}

export default DashboardPage


