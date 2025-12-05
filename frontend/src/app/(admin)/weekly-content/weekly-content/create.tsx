import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import { weeklyService, contentService } from '@/services'
import type { WeeklyContent, EditWeeklyContentRequest } from '@/types/keci'
import type { Music, Movie, Task, WeeklyQuestion } from '@/types/keci'
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useI18n } from '@/i18n/context'

type FormFields = {
  weekOrder: number
  musicId: number
  movieId: number
  taskId: number
  weeklyQuestionId: number
}

const CreateWeeklyContentPage = () => {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [musics, setMusics] = useState<Music[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [weeklyQuestions, setWeeklyQuestions] = useState<WeeklyQuestion[]>([])

  const schema = yup.object({
    weekOrder: yup.number().required(t('weeklyContent.enterWeekOrder')).min(1, t('weeklyContent.weekOrderMin')),
    musicId: yup.number().required(t('weeklyContent.selectMusicRequired')).min(1, t('weeklyContent.selectMusicRequired')),
    movieId: yup.number().required(t('weeklyContent.selectMovieRequired')).min(1, t('weeklyContent.selectMovieRequired')),
    taskId: yup.number().required(t('weeklyContent.selectTaskRequired')).min(1, t('weeklyContent.selectTaskRequired')),
    weeklyQuestionId: yup.number().required(t('weeklyContent.selectWeeklyQuestionRequired')).min(1, t('weeklyContent.selectWeeklyQuestionRequired')),
  })

  const { control, handleSubmit, reset, formState } = useForm<FormFields>({
    resolver: yupResolver(schema),
    defaultValues: { weekOrder: 1, musicId: undefined as any, movieId: undefined as any, taskId: undefined as any, weeklyQuestionId: undefined as any },
  })
  const { isSubmitting } = formState
  const state = (location.state as any) || {}
  const isEdit = state.mode === 'edit'
  const editItem = state.item as WeeklyContent | undefined

  useEffect(() => {
    const loadOptions = async () => {
      const [musicsData, moviesData, tasksData, questionsData] = await Promise.all([
        contentService.getAllMusic(),
        contentService.getAllMovies(),
        contentService.getAllTasks(),
        contentService.getAllWeeklyQuestions(),
      ])
      setMusics(musicsData)
      setMovies(moviesData)
      setTasks(tasksData)
      setWeeklyQuestions(questionsData)
    }
    loadOptions()
  }, [])

  useEffect(() => {
    if (!isEdit || !editItem) {
      // Only allow edit mode - redirect if not in edit mode
      navigate('/admin/content/weekly-content')
      return
    }
    reset({
      weekOrder: editItem.weekOrder,
      musicId: editItem.musicId,
      movieId: editItem.movieId,
      taskId: editItem.taskId,
      weeklyQuestionId: editItem.weeklyQuestionId,
    })
  }, [isEdit, editItem, reset, navigate])

  const onSubmit = handleSubmit(async (data) => {
    if (!isEdit || !editItem) {
      return
    }
    try {
      const updateData: EditWeeklyContentRequest = {
        weekId: editItem.weekId,
        weekOrder: data.weekOrder,
        musicId: data.musicId,
        movieId: data.movieId,
        taskId: data.taskId,
        weeklyQuestionId: data.weeklyQuestionId,
      }
      await weeklyService.updateWeeklyContent(editItem.weekId, updateData)
      navigate('/admin/content/weekly-content')
    } catch (err) {
      console.error('Submit error:', err)
    }
  })

  return (
    <>
      <PageTitle subName={t('pages.content')} title={t('weeklyContent.edit')} />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>{t('weeklyContent.edit')}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form onSubmit={onSubmit} className="needs-validation" noValidate>
            <Row className="g-3">
              <Col md={6}>
                <Controller
                  control={control}
                  name="weekOrder"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('weeklyContent.weekOrder')}</label>
                      <input
                        type="number"
                        className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="musicId"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('weeklyContent.musicTable')}</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">{t('weeklyContent.selectMusic')}</option>
                        {musics.map((m) => (
                          <option key={m.musicId} value={m.musicId}>
                            {m.musicTitle}
                          </option>
                        ))}
                      </select>
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="movieId"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('weeklyContent.movieTable')}</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">{t('weeklyContent.selectMovie')}</option>
                        {movies.map((m) => (
                          <option key={m.movieId} value={m.movieId}>
                            {m.movieTitle}
                          </option>
                        ))}
                      </select>
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="taskId"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('weeklyContent.taskTable')}</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">{t('weeklyContent.selectTask')}</option>
                        {tasks.map((t) => (
                          <option key={t.taskId} value={t.taskId}>
                            {t.taskDescription}
                          </option>
                        ))}
                      </select>
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
              <Col md={6}>
                <Controller
                  control={control}
                  name="weeklyQuestionId"
                  render={({ field, fieldState }) => (
                    <>
                      <label className="form-label">{t('weeklyContent.weeklyQuestions.title')}</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">{t('weeklyContent.selectWeeklyQuestion')}</option>
                        {weeklyQuestions.map((q) => (
                          <option key={q.weeklyQuestionId} value={q.weeklyQuestionId}>
                            {q.weeklyQuestionText}
                          </option>
                        ))}
                      </select>
                      {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                    </>
                  )}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/weekly-content')}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || !isEdit}>
                {isSubmitting ? t('common.saving') : t('common.update')}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateWeeklyContentPage

