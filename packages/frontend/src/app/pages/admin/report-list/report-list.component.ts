import { Component, OnInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { AdminService, UserReport } from 'src/app/services/admin.service'
import { SimpleDialogService } from 'src/app/services/simple-dialog.service'

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  standalone: false
})
export class ReportListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  dataSource!: MatTableDataSource<any, MatPaginator>
  displayedColumns = ['user', 'reportedUser', 'type', 'report', 'solved', 'actions']

  ready = false

  reportMap: { [index: number]: string } = {
    1: 'SPAM',
    5: 'Hate',
    10: 'Illegal'
  }

  constructor(
    private adminService: AdminService,
    private simpleDialog: SimpleDialogService
  ) {
    this.loadReports()
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Report, MatPaginator>([])
    setTimeout(() => {
      this.dataSource.paginator = this.paginator
    })
    console.log(this.dataSource)
  }

  async loadReports() {
    this.ready = false
    const res = await this.adminService.getReports()
    res.sort((a, b) => +a.resolved - +b.resolved)
    this.dataSource.data = res
    console.log(res)
    this.ready = true
  }

  async ignore(report: UserReport) {
    const confirm = await this.simpleDialog.createConfirmDialog({
      title: 'dialog.admin.confirmIgnoreTitle',
      titleSuffix: `${this.mapReport(report.severity)}`,
      content: 'dialog.admin.confirmNSFWContent',
      contentSuffix: report.description
    })

    if (!confirm) return

    await this.adminService.ignoreReport(report.id)
    this.loadReports()
  }

  async ban(report: UserReport) {
    let confirm = false
    let reason = ''

    // BSKY users do not get a reason I guess
    const blueskyUser = report.reportedUser.url.startsWith('@')
    if (blueskyUser) {
      const confirmRes = await this.simpleDialog.createConfirmDialog({
        title: 'dialog.admin.confirmBanTitle',
        titleSuffix: report.reportedUser.url,
        content: 'confirmBanContentBluesky'
      })
      confirm = confirmRes ?? false
    } else {
      const banRes = await this.simpleDialog.createPromptDialog({
        title: 'dialog.admin.promptBanTitle',
        titleSuffix: report.reportedUser.url,
        content: 'dialog.admin.promptBanReasonLabel',
        label: 'dialog.admin.promptBanReasonLabel'
      })

      if (!banRes?.confirmed) return

      reason = banRes.value
      const confirmRes = await this.simpleDialog.createConfirmDialog({
        title: 'dialog.admin.confirmBanTitle',
        titleSuffix: report.reportedUser.url,
        content: 'dialog.admin.confirmBanContentFedi',
        contentSuffix: reason
      })
      confirm = confirmRes ?? false
    }

    if (!confirm) return

    await this.adminService.banUser(report.reportedUser.id, reason)
    this.loadReports()
  }

  async forceNSFW(report: UserReport) {
    const confirm = await this.simpleDialog.createConfirmDialog({
      title: 'dialog.admin.confirmNSFWTitle',
      titleSuffix: report.reportedUser.url,
      content: 'dialog.admin.confirmNSFWContent'
    })

    if (!confirm) return

    await this.adminService.forceNSFWUser(report.reportedUser.id)
    this.loadReports()
  }

  mapReport(key: number) {
    return this.reportMap[key] ?? 'unknown'
  }
}
