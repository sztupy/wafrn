import { DatePipe } from '@angular/common'
import { Component, viewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { RouterModule } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AvatarSmallComponent } from 'src/app/components/avatar-small/avatar-small.component'
import { AdminService, UserBan } from 'src/app/services/admin.service'
import { SimpleDialogService } from 'src/app/services/simple-dialog.service'

@Component({
  selector: 'app-bans',
  imports: [
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    AvatarSmallComponent,
    TranslatePipe,
    DatePipe
  ],
  templateUrl: './bans.component.html',
  styleUrls: ['./bans.component.scss']
})
export class BansComponent {
  showBans = true
  bannedUsers = new MatTableDataSource<UserBan, MatPaginator>([])
  bannedUsersPaginator = viewChild.required<MatPaginator>(MatPaginator)
  bannedUsersColumns = ['user', 'actions']

  constructor(
    private adminService: AdminService,
    private simpleDialog: SimpleDialogService
  ) {}

  async ngOnInit() {
    const res: { users: UserBan[] } = await this.adminService.banList()
    console.log(res)

    this.bannedUsers.data = res.users
    this.bannedUsers.filterPredicate = (ban, filter) => ban.url.startsWith(filter)
    this.bannedUsers.paginator = this.bannedUsersPaginator()
  }

  onChange(event: Event) {
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      this.bannedUsers.filter = target.value
    }
  }

  async unban(ban: UserBan) {
    const confirm = await this.simpleDialog.createConfirmDialog({
      title: 'dialog.admin.confirmUnbanTitle',
      titleSuffix: ban.url,
      content: 'dialog.admin.confirmUnbanContent'
    })

    if (!confirm) return

    const res: { users: UserBan[] } = await this.adminService.unbanUser(ban.id)
    this.bannedUsers.data = res.users
  }
}
