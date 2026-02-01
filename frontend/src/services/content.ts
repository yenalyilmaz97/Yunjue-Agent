import { api, API_CONFIG } from '@/lib/axios'
import type { Music, Movie, Task, WeeklyQuestion, Affirmation, Aphorism, Article, CreateArticleRequest, EditArticleRequest } from '@/types/keci'

const MUSIC_ENDPOINT = API_CONFIG.ENDPOINTS.MUSIC
const MOVIES_ENDPOINT = API_CONFIG.ENDPOINTS.MOVIES
const TASKS_ENDPOINT = API_CONFIG.ENDPOINTS.TASKS
const WEEKLY_QUESTION_ENDPOINT = API_CONFIG.ENDPOINTS.WEEKLY_QUESTION
const APHORISMS_ENDPOINT = API_CONFIG.ENDPOINTS.APHORISMS
const AFFIRMATION_ENDPOINT = API_CONFIG.ENDPOINTS.AFFIRMATION
const ARTICLE_ENDPOINT = API_CONFIG.ENDPOINTS.ARTICLE

export const contentService = {
	// Music endpoints
	async getAllMusic(): Promise<Music[]> {
		return api.get<Music[]>(`${MUSIC_ENDPOINT}/music`)
	},

	async getMusicById(id: number): Promise<Music> {
		return api.get<Music>(`${MUSIC_ENDPOINT}/music/${id}`)
	},

	async createMusic(musicData: { musicTitle: string; musicURL: string; musicDescription?: string }): Promise<Music> {
		return api.post<Music>(`${MUSIC_ENDPOINT}/music`, musicData)
	},

	async updateMusic(_id: number, musicData: { musicId: number; musicTitle: string; musicURL: string; musicDescription?: string }): Promise<Music> {
		return api.put<Music>(`${MUSIC_ENDPOINT}/music`, musicData)
	},

	async deleteMusic(id: number): Promise<Music> {
		return api.delete<Music>(`${MUSIC_ENDPOINT}/music/${id}`)
	},

	// Movie endpoints
	async getAllMovies(): Promise<Movie[]> {
		return api.get<Movie[]>(`${MOVIES_ENDPOINT}/movies`)
	},

	async getMovieById(id: number): Promise<Movie> {
		return api.get<Movie>(`${MOVIES_ENDPOINT}/movies/${id}`)
	},

	async createMovie(movieData: { movieTitle: string; movieDescription?: string; imageFile?: File }): Promise<Movie> {
		// Always use FormData for consistency (even without image)
		const formData = new FormData()
		formData.append('movieTitle', movieData.movieTitle)
		if (movieData.movieDescription) {
			formData.append('movieDescription', movieData.movieDescription)
		}
		if (movieData.imageFile) {
			formData.append('imageFile', movieData.imageFile)
		}
		// Don't set-Content-Type header - let axios/browser set it with boundary
		return api.post<Movie>(`${MOVIES_ENDPOINT}/movies`, formData, {
			timeout: 300000, // 5 minutes for large file uploads
		})
	},

	async updateMovie(_id: number, movieData: { movieId: number; movieTitle: string; movieDescription?: string }): Promise<Movie> {
		return api.put<Movie>(`${MOVIES_ENDPOINT}/movies`, movieData)
	},

	async deleteMovie(id: number): Promise<Movie> {
		return api.delete<Movie>(`${MOVIES_ENDPOINT}/movies/${id}`)
	},

	async uploadMovieImage(movieId: number, file: File): Promise<Movie> {
		const form = new FormData()
		form.append('file', file)
		return api.post<Movie>(`${MOVIES_ENDPOINT}/movies/${movieId}/image`, form, {
			timeout: 300000, // 5 minutes for large file uploads
		})
	},

	async deleteMovieImage(movieId: number): Promise<Movie> {
		return api.delete<Movie>(`${MOVIES_ENDPOINT}/movies/${movieId}/image`)
	},

	// Task endpoints
	async getAllTasks(): Promise<Task[]> {
		return api.get<Task[]>(`${TASKS_ENDPOINT}/tasks`)
	},

	async getTaskById(id: number): Promise<Task> {
		return api.get<Task>(`${TASKS_ENDPOINT}/tasks/${id}`)
	},

	async createTask(taskData: { taskDescription: string }): Promise<Task> {
		return api.post<Task>(`${TASKS_ENDPOINT}/tasks`, taskData)
	},

	async updateTask(_id: number, taskData: { taskId: number; taskDescription: string }): Promise<Task> {
		return api.put<Task>(`${TASKS_ENDPOINT}/tasks`, taskData)
	},

	async deleteTask(id: number): Promise<Task> {
		return api.delete<Task>(`${TASKS_ENDPOINT}/tasks/${id}`)
	},

	// Weekly Question endpoints
	async getAllWeeklyQuestions(): Promise<WeeklyQuestion[]> {
		return api.get<WeeklyQuestion[]>(`${WEEKLY_QUESTION_ENDPOINT}/weekly-questions`)
	},

	async getWeeklyQuestionById(id: number): Promise<WeeklyQuestion> {
		return api.get<WeeklyQuestion>(`${WEEKLY_QUESTION_ENDPOINT}/weekly-questions/${id}`)
	},

	async createWeeklyQuestion(questionData: { weeklyQuestionText: string }): Promise<WeeklyQuestion> {
		return api.post<WeeklyQuestion>(`${WEEKLY_QUESTION_ENDPOINT}/weekly-questions`, questionData)
	},

	async updateWeeklyQuestion(_id: number, questionData: { weeklyQuestionId: number; weeklyQuestionText: string }): Promise<WeeklyQuestion> {
		return api.put<WeeklyQuestion>(`${WEEKLY_QUESTION_ENDPOINT}/weekly-questions`, questionData)
	},

	async deleteWeeklyQuestion(id: number): Promise<WeeklyQuestion> {
		return api.delete<WeeklyQuestion>(`${WEEKLY_QUESTION_ENDPOINT}/weekly-questions/${id}`)
	},

	// Aphorism endpoints
	async getAllAphorisms(): Promise<Aphorism[]> {
		return api.get<Aphorism[]>(`${APHORISMS_ENDPOINT}/aphorisms`)
	},

	async getAphorismById(id: number): Promise<Aphorism> {
		return api.get<Aphorism>(`${APHORISMS_ENDPOINT}/aphorisms/${id}`)
	},

	async createAphorism(aphorismData: { aphorismText: string }): Promise<Aphorism> {
		return api.post<Aphorism>(`${APHORISMS_ENDPOINT}/aphorism`, aphorismData)
	},

	async updateAphorism(_id: number, aphorismData: { aphorismId: number; aphorismText: string }): Promise<Aphorism> {
		return api.put<Aphorism>(`${APHORISMS_ENDPOINT}/aphorism`, aphorismData)
	},

	async deleteAphorism(id: number): Promise<Aphorism> {
		return api.delete<Aphorism>(`${APHORISMS_ENDPOINT}/aphorisms/${id}`)
	},

	// Affirmation endpoints
	async getAllAffirmations(): Promise<Affirmation[]> {
		return api.get<Affirmation[]>(`${AFFIRMATION_ENDPOINT}/affirmations`)
	},

	async getAffirmationById(id: number): Promise<Affirmation> {
		return api.get<Affirmation>(`${AFFIRMATION_ENDPOINT}/affirmations/${id}`)
	},

	async createAffirmation(affirmationData: { affirmationText: string }): Promise<Affirmation> {
		return api.post<Affirmation>(`${AFFIRMATION_ENDPOINT}/affirmation`, affirmationData)
	},

	async updateAffirmation(_id: number, affirmationData: { affirmationId: number; affirmationText: string }): Promise<Affirmation> {
		return api.put<Affirmation>(`${AFFIRMATION_ENDPOINT}/affirmation`, affirmationData)
	},

	async deleteAffirmation(id: number): Promise<Affirmation> {
		return api.delete<Affirmation>(`${AFFIRMATION_ENDPOINT}/affirmations/${id}`)
	},

	// Articles
	async getPublicArticles(): Promise<Article[]> {
		return api.get<Article[]>(`${ARTICLE_ENDPOINT}/articles`)
	},

	async getArticleBySlug(slug: string): Promise<Article> {
		return api.get<Article>(`${ARTICLE_ENDPOINT}/articles/${slug}`)
	},

	async getAllArticlesAdmin(): Promise<Article[]> {
		return api.get<Article[]>(`${ARTICLE_ENDPOINT}/articles/all`)
	},

	async createArticle(payload: CreateArticleRequest): Promise<Article> {
		return api.post<Article>(`${ARTICLE_ENDPOINT}/articles`, payload)
	},

	async createArticleWithFile(formData: FormData, onProgress?: (progress: number) => void): Promise<Article> {
		if (onProgress) {
			return api.postWithProgress<Article>(`${ARTICLE_ENDPOINT}/articles`, formData, onProgress, {
				headers: { 'Content-Type': 'multipart/form-data' },
				timeout: 600000, // 10 minutes for large file uploads (2GB)
			})
		}
		return api.post<Article>(`${ARTICLE_ENDPOINT}/articles`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
			timeout: 600000, // 10 minutes for large file uploads (2GB)
		})
	},

	async updateArticle(payload: EditArticleRequest): Promise<Article> {
		return api.put<Article>(`${ARTICLE_ENDPOINT}/articles`, payload)
	},

	async deleteArticle(articleId: number): Promise<Article> {
		return api.delete<Article>(`${ARTICLE_ENDPOINT}/articles/${articleId}`)
	},

	// Article cover upload (now binds to specific article and returns updated article)
	async uploadArticleCoverFor(articleId: number, file: File): Promise<Article> {
		const form = new FormData()
		form.append('file', file)
		return api.post<Article>(`${ARTICLE_ENDPOINT}/articles/${articleId}/cover`, form, {
			headers: { 'Content-Type': 'multipart/form-data' },
			timeout: 300000, // 5 minutes for large file uploads
		})
	},

	async postArticleAsset(file: File): Promise<{ url: string }> {
		const form = new FormData()
		form.append('file', file)
		return api.post<{ url: string }>(`${ARTICLE_ENDPOINT}/articles/asset`, form, {
			headers: { 'Content-Type': 'multipart/form-data' },
			timeout: 300000, // 5 minutes for large file uploads
		})
	},
}


