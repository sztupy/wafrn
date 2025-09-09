import { JsonPipe } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatListModule } from '@angular/material/list'
import { RouterModule } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { TranslateModule } from '@ngx-translate/core'
import { GroupedSettingData, SettingData, SettingsService, SettingValues } from 'src/app/services/settings.service'

@Component({
  selector: 'app-settings',
  imports: [
    MatListModule,
    MatExpansionModule,
    MatButtonModule,
    FontAwesomeModule,
    RouterModule,
    TranslateModule,
    JsonPipe
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  data: SettingData
  values: SettingValues = {}
  groups: GroupedSettingData[]

  constructor(settingsService: SettingsService) {
    this.data = settingsService.data
    this.values = settingsService.values
    this.groups = settingsService.groups
  }

  test() {
    console.log('hi')
  }
}
