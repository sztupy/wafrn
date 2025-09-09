import { JsonPipe } from '@angular/common'
import { Component, Signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { RouterModule } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { TranslateModule } from '@ngx-translate/core'
import { GroupedSettingData, SettingData, SettingsService, SettingValues } from 'src/app/services/settings.service'

@Component({
  selector: 'app-settings',
  imports: [
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
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

  settingsModified: Signal<boolean>
  settingsLoading: Signal<boolean>

  saveIcon = faFloppyDisk

  constructor(private settingsService: SettingsService) {
    this.data = settingsService.data
    this.values = settingsService.values
    this.groups = settingsService.groups
    this.settingsModified = settingsService.settingsModified
    this.settingsLoading = settingsService.settingsLoading
  }

  saveSettings() {
    this.settingsService.saveSettings()
  }
}
