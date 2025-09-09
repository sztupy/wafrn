import { Component, signal } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { SettingEntryComponent } from 'src/app/components/setting-entry/setting-entry.component'
import { ActivatedRoute } from '@angular/router'
import { GroupedSettingData, SettingData, SettingsService, SettingValues } from 'src/app/services/settings.service'

@Component({
  selector: 'app-setting-loader',
  imports: [TranslateModule, SettingEntryComponent],
  templateUrl: './settings-loader.component.html'
})
export class SettingsLoaderComponent {
  data: SettingData
  group = signal<GroupedSettingData | undefined>(undefined)
  values: SettingValues

  constructor(settingsService: SettingsService, activatedRoute: ActivatedRoute) {
    this.data = settingsService.data
    this.values = settingsService.values
    activatedRoute.data.subscribe((data) => {
      this.group.set(settingsService.groups.find((val) => val.key === data['group']))
    })
  }
}
