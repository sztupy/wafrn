import { Component, input, viewChildren } from '@angular/core'
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox'
import { MatInputModule } from '@angular/material/input'
import { MatSelectChange, MatSelectModule } from '@angular/material/select'
import { TranslateModule } from '@ngx-translate/core'
import { KeyValueTypedPipe } from 'src/app/pipes/keyvaluetyped.pipe'
import {
  SettingData,
  SettingEntry,
  SettingKey,
  SettingsService,
  SettingValues
} from 'src/app/services/settings.service'

@Component({
  selector: 'app-setting-entry',
  imports: [TranslateModule, MatCheckboxModule, MatSelectModule, MatInputModule, KeyValueTypedPipe],
  templateUrl: './setting-entry.component.html'
})
export class SettingEntryComponent {
  data: SettingData
  values = input.required<SettingValues>()
  setting = input.required<SettingEntry>()

  matFormFieldElements = viewChildren('formSelect')

  constructor(private settingsService: SettingsService) {
    this.data = settingsService.data
  }

  updateCheckbox(key: SettingKey, event: MatCheckboxChange) {
    this.values()[key] = event.checked
    this.settingsService.settingsUpdatedSubject.next()
  }

  updateSelect(key: SettingKey, event: MatSelectChange) {
    this.values()[key] = event.value
    this.settingsService.settingsUpdatedSubject.next()
  }

  updateInput(key: SettingKey, event: Event) {
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      this.values()[key] = target.value
      this.settingsService.settingsUpdatedSubject.next()
    }
  }
}
