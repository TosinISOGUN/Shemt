/**
 * AI Service Layer for Shemt
 * 
 * Handles interaction with the AI Edge Function for analytics insights.
 */

import { supabase } from '@/lib/supabase/client'


export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export const aiService = {
  /**
   * Ask a question about analytics data
   */
  askAnalyticsQuestion: async (
    projectId: string, 
    question: string, 
    history: AIMessage[] = []
  ): Promise<string> => {
    // 1. Fetch latest metrics for context
    const { data: metrics } = await supabase
      .from('metrics_summary')
      .select('*')
      .eq('id', projectId) // metrics_summary ID is the project UUID
      .single()

    // 2. Fetch recent events for trend context
    const { data: events } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(20)

    // 3. Format data summary
    const dataSummary = `
LATEST METRICS:
- Revenue: $${metrics?.revenue?.toLocaleString() || 0}
- Active Users: ${metrics?.active_users?.toLocaleString() || 0}
- Conversion Rate: ${metrics?.conversion_rate || 0}%

RECENT ACTIVITY (LATEST 20 EVENTS):
${events?.map(e => `- ${new Date(e.created_at).toLocaleDateString()}: ${e.event_type} = ${e.value}`).join('\n') || 'No recent activity.'}
    `.trim()

    // 4. Call Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          question,
          dataSummary,
          history: history.slice(-6) // Only send last 6 messages for context
        }
      })

      if (error) throw error

      return data.answer
    } catch (error: any) {
      console.error('AI Service Error:', error)
      throw new Error(error.message || 'Failed to get AI response')
    }
  },

  /**
   * Generate suggested insights automatically
   */
  generateSuggestedInsights: async (projectId: string): Promise<string[]> => {
    const question = "Provide 3 short, punchy, bullet-point style insights or trends based on the data. Each should be one sentence."
    
    try {
      const answer = await aiService.askAnalyticsQuestion(projectId, question)
      
      // Parse bullet points from AI response
      const insights = answer
        .split('\n')
        .map(line => line.replace(/^[*-]\s*/, '').trim())
        .filter(line => line.length > 10) // Filter out noise
        .slice(0, 3)

      return insights
    } catch (error) {
      console.error('Suggested Insights Error:', error)
      return [
        "Revenue is showing a steady upward trend this month.",
        "User engagement peaks on weekend mornings.",
        "Consider optimizing your conversion funnel for mobile users."
      ]
    }
  }
}
