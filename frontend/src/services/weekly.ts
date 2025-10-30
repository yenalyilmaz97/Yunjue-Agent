import { api } from '@/lib/axios'
import type { WeeklyContent, CreateWeeklyContentRequest, EditWeeklyContentRequest, WeeklyContentFilter } from '@/types/keci'

const WEEKLY_ENDPOINT = '/Weekly'

export const weeklyService = {
  async getAllWeeklyContent(): Promise<WeeklyContent[]> {
    return api.get<WeeklyContent[]>(`${WEEKLY_ENDPOINT}/content`)
  },
  async createWeeklyContent(contentData: CreateWeeklyContentRequest): Promise<WeeklyContent> {
    return api.post<WeeklyContent>(`${WEEKLY_ENDPOINT}/content`, contentData)
  },
  async updateWeeklyContent(_id: number, contentData: EditWeeklyContentRequest): Promise<WeeklyContent> {
    return api.put<WeeklyContent>(`${WEEKLY_ENDPOINT}/content`, contentData)
  },
  async deleteWeeklyContent(id: number): Promise<boolean> {
    await api.delete(`${WEEKLY_ENDPOINT}/content/${id}`)
    return true
  },
  async getFilteredWeeklyContent(filter: WeeklyContentFilter): Promise<WeeklyContent[]> {
    const allContent = await this.getAllWeeklyContent()
    return allContent.filter((content) => {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const matchesSearch =
          content.music?.musicTitle.toLowerCase().includes(searchLower) ||
          content.task?.taskDescription.toLowerCase().includes(searchLower) ||
          content.movie?.movieTitle.toLowerCase().includes(searchLower) ||
          content.weeklyQuestion?.weeklyQuestionText.toLowerCase().includes(searchLower) ||
          content.music?.musicDescription?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      if (filter.weekNumber && content.weekOrder !== filter.weekNumber) return false
      return true
    })
  },
  async getWeeklyContentStats(): Promise<{ totalContent: number; activeContent: number; weeksCovered: number; years: number[] }> {
    const allContent = await this.getAllWeeklyContent()
    const activeContent = allContent
    const uniqueWeeks = new Set(allContent.map((c) => c.weekOrder))
    return { totalContent: allContent.length, activeContent: activeContent.length, weeksCovered: uniqueWeeks.size, years: [] }
  },
  isContentComplete(content: WeeklyContent): boolean {
    return !!(
      content.music?.musicTitle &&
      content.music?.musicURL &&
      content.task?.taskDescription &&
      content.movie?.movieTitle &&
      content.weeklyQuestion?.weeklyQuestionText
    )
  },
}

export default weeklyService


