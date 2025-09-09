import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Route, RouterModule } from '@angular/router'
import { SettingsComponent } from './settings.component'
import { SettingsLoaderComponent } from './settings-loader/settings-loader.component'
import { SettingsProfileComponent } from './settings-profile/settings-profile.component'

const routes: Route[] = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
          const isMobile = window.innerWidth <= 992
          return isMobile ? '' : 'profile'
        }
      },
      {
        path: 'profile',
        component: SettingsProfileComponent
      },
      {
        path: 'account',
        component: SettingsLoaderComponent,
        data: { group: 'account' }
      },
      {
        path: 'appearance',
        component: SettingsLoaderComponent,
        data: { group: 'appearance' }
      },
      {
        path: 'behavior',
        component: SettingsLoaderComponent,
        data: { group: 'behavior' }
      },
      {
        path: 'privacy',
        component: SettingsLoaderComponent,
        data: { group: 'privacy' }
      },
      {
        path: 'mutesAndBlocks',
        component: SettingsLoaderComponent,
        data: { group: 'mutesAndBlocks' }
      },
      {
        path: 'miscellaneous',
        component: SettingsLoaderComponent,
        data: { group: 'miscellaneous' }
      }
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class SettingsModule {}
