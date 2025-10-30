import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { podcastService } from '@/services'
import { Controller as RHFController } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { PodcastSeries } from '@/types/keci'

type Props = {
  control: Control<any>
  name: string
  onSeriesSelected?: (series: PodcastSeries) => void
  selectedId?: number
}

const SeriesSelect = ({ control, name, onSeriesSelected, selectedId }: Props) => {
  const [series, setSeries] = useState<PodcastSeries[]>([])

  useEffect(() => {
    podcastService.getAllSeries().then(setSeries).catch(() => setSeries([]))
  }, [])

  return (
    <RHFController
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Select
          value={(field.value ?? selectedId ?? '') as any}
          onChange={(e) => {
            const val = Number(e.target.value)
            field.onChange(val)
            const s = series.find((x) => x.seriesId === val)
            if (s && onSeriesSelected) onSeriesSelected(s)
          }}
        >
          <option value="" disabled>
            Select series
          </option>
          {series.map((s) => (
            <option key={s.seriesId} value={s.seriesId}>
              {s.title}
            </option>
          ))}
        </Form.Select>
      )}
    />
  )
}

export default SeriesSelect


