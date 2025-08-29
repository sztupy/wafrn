import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { server } from '../interfaces/servers'
import { firstValueFrom } from 'rxjs'
import { SimplifiedUser } from '../interfaces/simplified-user'
import { statsReply } from '../interfaces/statsReply'
import { EnvironmentService } from './environment.service'

export type UserReport = {
  id: string
  resolved: string
  severity: string
  description: string
  userId: string
  user: string
  postId: string
  post: string
  reportedUserId: string
  reportedUser: string
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  async getServers(): Promise<server[]> {
    const response = await firstValueFrom(
      this.http.get<{ servers: server[] }>(`${EnvironmentService.environment.baseUrl}/admin/server-list`)
    )
    return response?.servers ? response?.servers : []
  }

  async updateServers(serversToUpdate: server[]) {
    const response = await firstValueFrom(
      this.http.post(`${EnvironmentService.environment.baseUrl}/admin/server-update`, serversToUpdate)
    )
    return response
  }

  async getBlocks(): Promise<any> {
    const response = await firstValueFrom(
      this.http.get(`${EnvironmentService.environment.baseUrl}/admin/userBlockList`)
    )
    return response
  }

  async getReports(): Promise<UserReport[]> {
    return firstValueFrom(this.http.get<UserReport[]>(`${EnvironmentService.environment.baseUrl}/admin/reportList`))
  }

  async ignoreReport(id: number): Promise<any> {
    return firstValueFrom(this.http.post(`${EnvironmentService.environment.baseUrl}/admin/ignoreReport`, { id: id }))
  }

  async banUser(id: string) {
    return firstValueFrom(this.http.post(`${EnvironmentService.environment.baseUrl}/admin/banUser`, { id: id }))
  }

  async banList() {
    return firstValueFrom(this.http.get(`${EnvironmentService.environment.baseUrl}/admin/getBannedUsers`))
  }
  async pardonUser(id: string) {
    return firstValueFrom(this.http.post(`${EnvironmentService.environment.baseUrl}/admin/unbanUser`, { id: id }))
  }

  async getPendingActivationUsers(): Promise<SimplifiedUser[]> {
    return firstValueFrom(
      this.http.get<SimplifiedUser[]>(`${EnvironmentService.environment.baseUrl}/admin/getPendingApprovalUsers`)
    )
  }

  async requireExtraSteps(id: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${EnvironmentService.environment.baseUrl}/admin/notActivateAndSendEmail`, {
        id
      })
    )
  }

  async userUsedVPN(id: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${EnvironmentService.environment.baseUrl}/admin/userUsedVPN`, {
        id
      })
    )
  }

  async activateUser(id: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${EnvironmentService.environment.baseUrl}/admin/activateUser`, {
        id
      })
    )
  }

  async getStats(): Promise<statsReply> {
    return firstValueFrom(this.http.get<statsReply>(`${EnvironmentService.environment.baseUrl}/status/workerStats`))
  }
}
