import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PagenotfoundComponent } from './pagenotfound.component'
import { RouterModule, Routes } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
import { TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

const routes: Routes = [
  {
    path: '',
    component: PagenotfoundComponent
  }
]

@NgModule({
  declarations: [PagenotfoundComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    TranslateModule,
    MatButtonModule,
    FontAwesomeModule
  ],
  exports: [PagenotfoundComponent]
})
export class PagenotfoundModule {}
