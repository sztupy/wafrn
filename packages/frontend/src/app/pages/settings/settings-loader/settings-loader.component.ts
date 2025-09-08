import { Component } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { SettingEntryComponent } from 'src/app/components/setting-entry/setting-entry.component'
import { ActivatedRoute } from '@angular/router'
import { GroupedSettingDataTransformed, SettingsService, SettingValues } from 'src/app/services/settings.service'
import { KeyValueTypedPipe } from 'src/app/pipes/keyvaluetyped.pipe'

@Component({
  selector: 'app-setting-loader',
  imports: [TranslateModule, SettingEntryComponent, KeyValueTypedPipe],
  templateUrl: './settings-loader.component.html'
})
export class SettingsLoaderComponent {
  group: GroupedSettingDataTransformed | undefined
  values: SettingValues

  constructor(settingsService: SettingsService, activatedRoute: ActivatedRoute) {
    this.values = settingsService.values
    activatedRoute.data.subscribe((data) => {
      this.group = settingsService.groupsTransformed.find((val) => val.key === data['group'])
    })
  }
}
