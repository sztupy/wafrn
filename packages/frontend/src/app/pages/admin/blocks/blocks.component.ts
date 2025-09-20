import { Component } from '@angular/core'
import { AdminService } from 'src/app/services/admin.service'
import { SimpleTitleService } from 'src/app/services/simple-title.service'

@Component({
  selector: 'app-blocks',
  templateUrl: './blocks.component.html',
  styleUrls: ['./blocks.component.scss'],
  standalone: false
})
export class BlocksComponent {
  userBlocks: any[] = []
  serverBlocks: any[] = []
  ready = false
  constructor(
    private adminService: AdminService,
    simpleTitle: SimpleTitleService
  ) {
    simpleTitle.set('menu.admin.blocklist')

    adminService.getBlocks().then((response) => {
      this.userBlocks = response.userBlocks.map((elem: any) => {
        return elem
      })
      this.serverBlocks = response.userServerBlocks.map((elem: any) => {
        return elem
      })
      this.ready = true
    })
  }
}
