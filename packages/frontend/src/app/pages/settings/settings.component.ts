import { JsonPipe } from '@angular/common'
import { Component } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { SettingEntryComponent } from 'src/app/components/setting-entry/setting-entry.component'
import {
  GroupedSettingDataTransformed,
  SettingData,
  SettingsService,
  SettingValues
} from 'src/app/services/settings.service'

@Component({
  selector: 'app-settings',
  imports: [RouterModule, TranslateModule, JsonPipe, SettingEntryComponent, MatCardModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {
  data: SettingData
  values: SettingValues = {}
  groups: GroupedSettingDataTransformed[]

  constructor(settingsService: SettingsService) {
    this.data = settingsService.data
    this.values = settingsService.values
    this.groups = settingsService.groupsTransformed
  }
}
