import { Component, Inject } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { SettingEntryComponent } from 'src/app/components/setting-entry/setting-entry.component'
import { GroupedSettingData, SettingData, SettingsService, SettingValues } from 'src/app/services/settings.service'
import { SETTINGS_TOKEN } from '../settings.component'
import { RouterModule } from '@angular/router'
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal'

@Component({
  selector: 'app-setting-loader',
  imports: [TranslateModule, SettingEntryComponent, RouterModule, CdkPortalOutlet],
  templateUrl: './settings-loader.component.html'
})
export class SettingsLoaderComponent {
  data: SettingData
  values: SettingValues
  group: GroupedSettingData | undefined

  constructor(settingsService: SettingsService, @Inject(SETTINGS_TOKEN) groupKey: string) {
    this.data = settingsService.data
    this.values = settingsService.values
    this.group = settingsService.groups.find((val) => val.key === groupKey)
  }

  componentAsPortal(component: any) {
    return new ComponentPortal(component)
  }
}
