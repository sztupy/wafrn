import { Component } from '@angular/core'
import { AdminService } from 'src/app/services/admin.service'
import { SimpleTitleService } from 'src/app/services/simple-title.service'

@Component({
  selector: 'app-bans',
  templateUrl: './bans.component.html',
  styleUrls: ['./bans.component.scss'],
  standalone: false
})
export class BansComponent {
  bannedUsers: any[] = []
  ready = false
  constructor(
    private adminService: AdminService,
    simpleTitle: SimpleTitleService
  ) {
    simpleTitle.set('menu.admin.bans')

    this.adminService.banList().then((res: any) => {
      this.bannedUsers = this.processUsers(res.users)
      this.ready = true
    })
  }

  unbanUser(id: string) {
    this.ready = false
    this.adminService.pardonUser(id).then((res: any) => {
      this.bannedUsers = this.processUsers(res.users)
      this.ready = true
    })
  }

  processUsers(users: any[]) {
    return users.map((elem) => {
      return elem
    })
  }
}
