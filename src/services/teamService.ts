import { supabase } from '@/lib/supabase/client'

export type TeamRole = 'admin' | 'editor' | 'viewer'
export type TeamStatus = 'pending' | 'accepted'

export interface TeamMember {
  id: string
  project_id: string
  invited_email: string
  role: TeamRole
  status: TeamStatus
  invited_by?: string | null
  created_at: string
}

class TeamService {
  /**
   * Invite a new member to a project
   */
  async inviteMember(
    projectId: string,
    email: string,
    role: TeamRole = 'viewer',
    invitedBy: string
  ): Promise<{ data: TeamMember | null; error: any }> {
    const { data, error } = await supabase
      .from('team_members')
      .insert([
        {
          project_id: projectId,
          invited_email: email,
          role,
          invited_by: invitedBy,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inviting team member:', error)
      return { data: null, error }
    }

    return { data: data as TeamMember, error: null }
  }

  /**
   * Fetch all team members for a specific project
   */
  async getProjectTeam(projectId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching project team:', error)
      return []
    }

    return data as TeamMember[]
  }

  /**
   * Remove a member from a project team
   */
  async removeMember(memberId: string): Promise<boolean> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      console.error('Error removing team member:', error)
      return false
    }

    return true
  }
}

export const teamService = new TeamService()
