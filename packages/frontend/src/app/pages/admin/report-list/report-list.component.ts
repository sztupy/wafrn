import { Component, OnInit, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { AdminService } from 'src/app/services/admin.service'

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

  constructor(private adminService: AdminService) {
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

  ignore(id: number) {
    this.adminService.ignoreReport(id).then(() => {
      this.loadReports()
    })
  }

  async ban(id: string) {
    await this.adminService.banUser(id)
    this.loadReports()
  }

  async forceNSFW(id: string) {
    await this.adminService.forceNSFWUser(id)
    this.loadReports()
  }

  mapReport(key: number) {
    return this.reportMap[key] ?? 'unknown'
  }
}
