import { Component, computed, Signal } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { SettingEntryComponent } from 'src/app/components/setting-entry/setting-entry.component'
import { ActivatedRoute } from '@angular/router'
import { GroupedSettingDataTransformed, SettingsService, SettingValues } from 'src/app/services/settings.service'
import { MatCardModule } from '@angular/material/card'
import { BlogDetails } from 'src/app/interfaces/blogDetails'
import { LoginService } from 'src/app/services/login.service'
import { EnvironmentService } from 'src/app/services/environment.service'
import { KeyValueTypedPipe } from 'src/app/pipes/keyvaluetyped.pipe'
import { MatExpansionModule } from '@angular/material/expansion'

@Component({
  selector: 'app-setting-loader',
  imports: [MatCardModule, MatExpansionModule, TranslateModule, SettingEntryComponent, KeyValueTypedPipe],
  templateUrl: './settings-profile.component.html',
  styleUrl: './settings-profile.component.scss'
})
export class SettingsProfileComponent {
  group: GroupedSettingDataTransformed | undefined
  values: SettingValues

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

  constructor(loginService: LoginService, settingsService: SettingsService, activatedRoute: ActivatedRoute) {
    this.blog = loginService.currentAccount
    this.values = settingsService.values
    activatedRoute.data.subscribe((data) => {
      this.group = settingsService.groupsTransformed.find((val) => val.key === data['group'])
    })
  }
}
