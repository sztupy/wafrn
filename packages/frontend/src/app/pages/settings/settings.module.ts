import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Route, RouterModule } from '@angular/router'
import { SettingsComponent } from './settings.component'
import { SettingsLoaderComponent } from './settings-loader.component'

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
        component: SettingsLoaderComponent,
        data: { group: 'profile' }
      },
      {
        path: 'preferences',
        component: SettingsLoaderComponent,
        data: { group: 'preferences' }
      },
      {
        path: 'mutesAndBlocks',
        component: SettingsLoaderComponent,
        data: { group: 'mutesAndBlocks' }
      }
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class SettingsModule {}
