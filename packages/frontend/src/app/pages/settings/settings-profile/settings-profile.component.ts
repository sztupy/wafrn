import { Component, computed, Signal } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { SettingEntryComponent } from 'src/app/components/setting-entry/setting-entry.component'
import { FediAttachment, SettingData, SettingsService, SettingValues } from 'src/app/services/settings.service'
import { MatCardModule } from '@angular/material/card'
import { BlogDetails } from 'src/app/interfaces/blogDetails'
import { LoginService } from 'src/app/services/login.service'
import { EnvironmentService } from 'src/app/services/environment.service'
import { MatInputModule } from '@angular/material/input'
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'app-setting-loader',
  imports: [MatCardModule, MatInputModule, MatButtonModule, FontAwesomeModule, TranslateModule, SettingEntryComponent],
  templateUrl: './settings-profile.component.html',
  styleUrl: './settings-profile.component.scss'
})
export class SettingsProfileComponent {
  data: SettingData
  values: SettingValues
  fediAttachments: FediAttachment[]

  blog: Signal<BlogDetails | undefined>
  avatarUrl = computed<string>(() =>
    this.blog()
      ? EnvironmentService.environment.externalCacheurl +
        encodeURIComponent(EnvironmentService.environment.baseMediaUrl + this.blog()?.avatar)
      : ''
  )
  headerUrl = computed<string>(() =>
    this.blog()
      ? EnvironmentService.environment.externalCacheurl +
        encodeURIComponent(EnvironmentService.environment.baseMediaUrl + this.blog()?.headerImage)
      : ''
  )

  addIcon = faPlus
  removeIcon = faXmark

  constructor(
    private settingsService: SettingsService,
    loginService: LoginService
  ) {
    this.data = settingsService.data
    this.values = settingsService.values
    this.fediAttachments = settingsService.fediAttachments
    this.blog = loginService.currentAccount
  }

  addFediAttachment() {
    this.fediAttachments.push({ name: '', value: '' })
  }
  removeFediAttachment(index: number) {
    this.fediAttachments.splice(index, 1)
  }
  updateFediAttachment(index: number, key: keyof FediAttachment, event: Event) {
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      this.fediAttachments[index][key] = target.value
    }
    this.settingsService.settingsModified.set(true)
  }
}
