import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { dailyContentService } from '@/services'
import type { DailyContentResponseDTO } from '@/services/dailyContent'
import { Card, CardBody, CardHeader, CardTitle, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import DataTable from '@/components/table/DataTable'

const page = () => {
  const [items, setItems] = useState<DailyContentResponseDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [search, setSearch] = useState('')
  const [affirmationsMap, setAffirmationsMap] = useState<Map<number, string>>(new Map())
  const [aphorismsMap, setAphorismsMap] = useState<Map<number, string>>(new Map())
  const navigate = useNavigate()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await dailyContentService.getAllDailyContent()
      
      // If any item has null navigation properties, fetch all affirmations and aphorisms
      const hasNullProperties = data.some(dc => !dc.affirmation || !dc.aphorism)
      
      if (hasNullProperties) {
        const { contentService } = await import('@/services')
        const [affirmations, aphorisms] = await Promise.all([
          contentService.getAllAffirmations(),
          contentService.getAllAphorisms(),
        ])
        
        const affirmationsMap = new Map(affirmations.map(a => [a.affirmationId, a.affirmationText || `ID: ${a.affirmationId}`]))
        const aphorismsMap = new Map(aphorisms.map(a => [a.aphorismId, a.aphorismText || `ID: ${a.aphorismId}`]))
        
        setAffirmationsMap(affirmationsMap)
        setAphorismsMap(aphorismsMap)
        
        // Fill in missing navigation properties
        const enrichedData = data.map(dc => ({
          ...dc,
          affirmation: dc.affirmation || (affirmationsMap.has(dc.affirmationId) ? {
            affirmationId: dc.affirmationId,
            affirmationText: affirmationsMap.get(dc.affirmationId) || null,
            order: affirmations.find(a => a.affirmationId === dc.affirmationId)?.order || 0,
          } : undefined),
          aphorism: dc.aphorism || (aphorismsMap.has(dc.aporismId) ? {
            aphorismId: dc.aporismId,
            aphorismText: aphorismsMap.get(dc.aporismId) || null,
            order: aphorisms.find(a => a.aphorismId === dc.aporismId)?.order || 0,
          } : undefined),
        }))
        
        setItems(enrichedData)
      } else {
        setItems(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAutoGenerate = async () => {
    if (!confirm('Generate new daily content automatically? This will create daily content entries by matching affirmations and aphorisms based on their order.')) {
      return
    }
    setGenerating(true)
    try {
      // Get all affirmations and aphorisms
      const { contentService } = await import('@/services')
      const [affirmations, aphorisms] = await Promise.all([
        contentService.getAllAffirmations(),
        contentService.getAllAphorisms(),
      ])

      // Get existing content to find max day order and used IDs
      const existingContent = await dailyContentService.getAllDailyContent()
      const maxDayOrder = existingContent.length > 0 ? Math.max(...existingContent.map(c => c.dayOrder)) : 0

      // Get used IDs to avoid duplicates
      const usedAffirmationIds = new Set(existingContent.map(c => c.affirmationId))
      const usedAphorismIds = new Set(existingContent.map(c => c.aporismId))

      // Sort by order if available, otherwise by ID
      const sortedAffirmations = [...affirmations]
        .filter(a => !usedAffirmationIds.has(a.affirmationId))
        .sort((a, b) => (a.order || a.affirmationId) - (b.order || b.affirmationId))
      
      const sortedAphorisms = [...aphorisms]
        .filter(a => !usedAphorismIds.has(a.aphorismId))
        .sort((a, b) => (a.order || a.aphorismId) - (b.order || b.aphorismId))

      // Generate for each order-based combination
      const minLength = Math.min(sortedAffirmations.length, sortedAphorisms.length)
      const promises: Promise<any>[] = []

      for (let i = 0; i < minLength; i++) {
        const affirmation = sortedAffirmations[i]
        const aphorism = sortedAphorisms[i]

        if (affirmation && aphorism) {
          const dayOrder = maxDayOrder + i + 1
          promises.push(
            dailyContentService.createDailyContent({
              dayOrder,
              affirmationId: affirmation.affirmationId,
              aporismId: aphorism.aphorismId,
            })
          )
        }
      }

      if (promises.length === 0) {
        alert('No new daily content to generate. All available affirmations and aphorisms are already assigned.')
        return
      }

      await Promise.all(promises)
      await loadData()
    } catch (error) {
      console.error('Generate error:', error)
      alert('Failed to generate daily content. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <PageTitle subName="Content" title="Daily Content" />
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <CardTitle as={'h5'}>Daily Content List</CardTitle>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search daily content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button variant="primary" size="sm" onClick={handleAutoGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Auto Generate'}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            isLoading={loading}
            data={items}
            rowKey={(r) => (r as DailyContentResponseDTO).dailyContentId}
            hideSearch
            searchQuery={search}
            onSearchQueryChange={setSearch}
            searchPlaceholder="Search daily content..."
            searchKeys={['dayOrder', 'affirmation.affirmationText', 'aphorism.aphorismText']}
            actionsHeader="Actions"
            renderRowActions={(row) => {
              const dc = row as DailyContentResponseDTO
              return (
                <div className="d-inline-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => navigate('/admin/content/daily-content/create', { state: { mode: 'edit', item: dc } })}>Edit</Button>
                  <Button size="sm" variant="outline-danger" onClick={async () => {
                    if (confirm('Delete this daily content?')) {
                      await dailyContentService.deleteDailyContent(dc.dailyContentId)
                      await loadData()
                    }
                  }}>Delete</Button>
                </div>
              )
            }}
            columns={[
              { key: 'dailyContentId', header: 'ID', width: '80px', sortable: true },
              { key: 'dayOrder', header: 'Day #', width: '100px', sortable: true },
              {
                key: 'affirmation',
                header: 'Affirmation',
                render: (r) => {
                  const dc = r as DailyContentResponseDTO
                  if (dc.affirmation?.affirmationText) {
                    return dc.affirmation.affirmationText
                  }
                  if (affirmationsMap.has(dc.affirmationId)) {
                    return affirmationsMap.get(dc.affirmationId) || `ID: ${dc.affirmationId}`
                  }
                  return `ID: ${dc.affirmationId}`
                },
              },
              {
                key: 'aphorism',
                header: 'Aphorism',
                render: (r) => {
                  const dc = r as DailyContentResponseDTO
                  if (dc.aphorism?.aphorismText) {
                    return dc.aphorism.aphorismText
                  }
                  if (aphorismsMap.has(dc.aporismId)) {
                    return aphorismsMap.get(dc.aporismId) || `ID: ${dc.aporismId}`
                  }
                  return `ID: ${dc.aporismId}`
                },
              },
            ]}
          />
        </CardBody>
      </Card>
    </>
  )
}

export default page

