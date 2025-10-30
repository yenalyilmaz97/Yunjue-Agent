import { api, API_CONFIG } from '@/lib/axios'
import type { Music, Movie, Task, WeeklyQuestion, Affirmation, Aphorism, Article, CreateArticleRequest, EditArticleRequest } from '@/types/keci'

const CONTENT_ENDPOINT = API_CONFIG.ENDPOINTS.CONTENT

export const contentService = {
	// Music endpoints
	async getAllMusic(): Promise<Music[]> {
		return api.get<Music[]>(`${CONTENT_ENDPOINT}/music`)
	},

	async getMusicById(id: number): Promise<Music> {
		return api.get<Music>(`${CONTENT_ENDPOINT}/music/${id}`)
	},

	async createMusic(musicData: { musicTitle: string; musicURL: string; musicDescription?: string }): Promise<Music> {
		return api.post<Music>(`${CONTENT_ENDPOINT}/music`, musicData)
	},

	async updateMusic(_id: number, musicData: { musicId: number; musicTitle: string; musicURL: string; musicDescription?: string }): Promise<Music> {
		return api.put<Music>(`${CONTENT_ENDPOINT}/music`, musicData)
	},

	async deleteMusic(id: number): Promise<Music> {
		return api.delete<Music>(`${CONTENT_ENDPOINT}/music/${id}`)
	},

	// Movie endpoints
	async getAllMovies(): Promise<Movie[]> {
		return api.get<Movie[]>(`${CONTENT_ENDPOINT}/movies`)
	},

	async getMovieById(id: number): Promise<Movie> {
		return api.get<Movie>(`${CONTENT_ENDPOINT}/movies/${id}`)
	},

	async createMovie(movieData: { movieTitle: string }): Promise<Movie> {
		return api.post<Movie>(`${CONTENT_ENDPOINT}/movies`, movieData)
	},

	async updateMovie(_id: number, movieData: { movieId: number; movieTitle: string }): Promise<Movie> {
		return api.put<Movie>(`${CONTENT_ENDPOINT}/movies`, movieData)
	},

	async deleteMovie(id: number): Promise<Movie> {
		return api.delete<Movie>(`${CONTENT_ENDPOINT}/movies/${id}`)
	},

	// Task endpoints
	async getAllTasks(): Promise<Task[]> {
		return api.get<Task[]>(`${CONTENT_ENDPOINT}/tasks`)
	},

	async getTaskById(id: number): Promise<Task> {
		return api.get<Task>(`${CONTENT_ENDPOINT}/tasks/${id}`)
	},

	async createTask(taskData: { taskDescription: string }): Promise<Task> {
		return api.post<Task>(`${CONTENT_ENDPOINT}/tasks`, taskData)
	},

	async updateTask(_id: number, taskData: { taskId: number; taskDescription: string }): Promise<Task> {
		return api.put<Task>(`${CONTENT_ENDPOINT}/tasks`, taskData)
	},

	async deleteTask(id: number): Promise<Task> {
		return api.delete<Task>(`${CONTENT_ENDPOINT}/tasks/${id}`)
	},

	// Weekly Question endpoints
	async getAllWeeklyQuestions(): Promise<WeeklyQuestion[]> {
		return api.get<WeeklyQuestion[]>(`${CONTENT_ENDPOINT}/weekly-questions`)
	},

	async getWeeklyQuestionById(id: number): Promise<WeeklyQuestion> {
		return api.get<WeeklyQuestion>(`${CONTENT_ENDPOINT}/weekly-questions/${id}`)
	},

	async createWeeklyQuestion(questionData: { weeklyQuestionText: string }): Promise<WeeklyQuestion> {
		return api.post<WeeklyQuestion>(`${CONTENT_ENDPOINT}/weekly-questions`, questionData)
	},

	async updateWeeklyQuestion(_id: number, questionData: { weeklyQuestionId: number; weeklyQuestionText: string }): Promise<WeeklyQuestion> {
		return api.put<WeeklyQuestion>(`${CONTENT_ENDPOINT}/weekly-questions`, questionData)
	},

	async deleteWeeklyQuestion(id: number): Promise<WeeklyQuestion> {
		return api.delete<WeeklyQuestion>(`${CONTENT_ENDPOINT}/weekly-questions/${id}`)
	},

	// Aphorism endpoints
	async getAllAphorisms(): Promise<Aphorism[]> {
		return api.get<Aphorism[]>(`${CONTENT_ENDPOINT}/aphorisms`)
	},

	async getAphorismById(id: number): Promise<Aphorism> {
		return api.get<Aphorism>(`${CONTENT_ENDPOINT}/aphorisms/${id}`)
	},

	async createAphorism(aphorismData: { aphorismText: string }): Promise<Aphorism> {
		return api.post<Aphorism>(`${CONTENT_ENDPOINT}/aphorism`, aphorismData)
	},

	async updateAphorism(_id: number, aphorismData: { aphorismId: number; aphorismText: string }): Promise<Aphorism> {
		return api.put<Aphorism>(`${CONTENT_ENDPOINT}/aphorism`, aphorismData)
	},

	async deleteAphorism(id: number): Promise<Aphorism> {
		return api.delete<Aphorism>(`${CONTENT_ENDPOINT}/aphorisms/${id}`)
	},

	// Affirmation endpoints
	async getAllAffirmations(): Promise<Affirmation[]> {
		return api.get<Affirmation[]>(`${CONTENT_ENDPOINT}/affirmations`)
	},

	async getAffirmationById(id: number): Promise<Affirmation> {
		return api.get<Affirmation>(`${CONTENT_ENDPOINT}/affirmations/${id}`)
	},

	async createAffirmation(affirmationData: { affirmationText: string }): Promise<Affirmation> {
		return api.post<Affirmation>(`${CONTENT_ENDPOINT}/affirmation`, affirmationData)
	},

	async updateAffirmation(_id: number, affirmationData: { affirmationId: number; affirmationText: string }): Promise<Affirmation> {
		return api.put<Affirmation>(`${CONTENT_ENDPOINT}/affirmation`, affirmationData)
	},

	async deleteAffirmation(id: number): Promise<Affirmation> {
		return api.delete<Affirmation>(`${CONTENT_ENDPOINT}/affirmations/${id}`)
	},

	// Articles
	async getPublicArticles(): Promise<Article[]> {
		return api.get<Article[]>(`${CONTENT_ENDPOINT}/articles`)
	},

	async getArticleBySlug(slug: string): Promise<Article> {
		return api.get<Article>(`${CONTENT_ENDPOINT}/articles/${slug}`)
	},

	async getAllArticlesAdmin(): Promise<Article[]> {
		return api.get<Article[]>(`${CONTENT_ENDPOINT}/articles/all`)
	},

	async createArticle(payload: CreateArticleRequest): Promise<Article> {
		return api.post<Article>(`${CONTENT_ENDPOINT}/articles`, payload)
	},

	async updateArticle(payload: EditArticleRequest): Promise<Article> {
		return api.put<Article>(`${CONTENT_ENDPOINT}/articles`, payload)
	},

	async deleteArticle(articleId: number): Promise<Article> {
		return api.delete<Article>(`${CONTENT_ENDPOINT}/articles/${articleId}`)
	},

	// Article cover upload (now binds to specific article and returns updated article)
	async uploadArticleCoverFor(articleId: number, file: File): Promise<Article> {
		const form = new FormData()
		form.append('file', file)
		return api.post<Article>(`${CONTENT_ENDPOINT}/articles/${articleId}/cover`, form, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},

	async postArticleAsset(file: File): Promise<{ url: string }> {
		const form = new FormData()
		form.append('file', file)
		return api.post<{ url: string }>(`${CONTENT_ENDPOINT}/articles/asset`, form, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
	},
}


