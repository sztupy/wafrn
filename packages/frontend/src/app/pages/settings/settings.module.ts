import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Route, RouterModule } from '@angular/router'
import { SettingsComponent } from './settings.component'

const routes: Route[] = [
  {
    path: '',
    component: SettingsComponent
  },
  {
    path: 'profile',
    component: SettingsComponent
  },
  {
    path: 'account',
    component: SettingsComponent
  },
  {
    path: 'appearance',
    component: SettingsComponent
  },
  {
    path: 'behavior',
    component: SettingsComponent
  },
  {
    path: 'privacy',
    component: SettingsComponent
  },
  {
    path: 'mutesAndBlocks',
    component: SettingsComponent
  },
  {
    path: 'miscellaneous',
    component: SettingsComponent
  }
]

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class SettingsModule {}
