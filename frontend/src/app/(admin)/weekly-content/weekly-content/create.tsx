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

type FormFields = {
  weekOrder: number
  musicId: number
  movieId: number
  taskId: number
  weeklyQuestionId: number
}

const CreateWeeklyContentPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [musics, setMusics] = useState<Music[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [weeklyQuestions, setWeeklyQuestions] = useState<WeeklyQuestion[]>([])

  const schema = yup.object({
    weekOrder: yup.number().required('Please enter week order').min(1, 'Week order must be at least 1'),
    musicId: yup.number().required('Please select music').min(1, 'Please select music'),
    movieId: yup.number().required('Please select movie').min(1, 'Please select movie'),
    taskId: yup.number().required('Please select task').min(1, 'Please select task'),
    weeklyQuestionId: yup.number().required('Please select weekly question').min(1, 'Please select weekly question'),
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
      <PageTitle subName="Content" title="Edit Weekly Content" />
      <Card>
        <CardHeader>
          <CardTitle as={'h5'}>Edit Weekly Content</CardTitle>
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
                      <label className="form-label">Week Order</label>
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
                      <label className="form-label">Music</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">Select Music</option>
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
                      <label className="form-label">Movie</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">Select Movie</option>
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
                      <label className="form-label">Task</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">Select Task</option>
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
                      <label className="form-label">Weekly Question</label>
                      <select className={`form-select ${fieldState.error ? 'is-invalid' : ''}`} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} value={field.value || ''}>
                        <option value="">Select Weekly Question</option>
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
              <Button type="button" variant="light" onClick={() => navigate('/admin/content/weekly-content')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || !isEdit}>
                {isSubmitting ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  )
}

export default CreateWeeklyContentPage

