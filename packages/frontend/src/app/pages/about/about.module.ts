import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AboutComponent } from './about.component'
import { Route, RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { LoaderComponent } from 'src/app/components/loader/loader.component'
import { ForumComponent } from '../forum/forum.component'

const routes: Route[] = [
  {
    path: '',
    component: AboutComponent,
    data: {
      title: 'system.about'
    }
  }
]

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MatCardModule, MatButtonModule, LoaderComponent, ForumComponent]
})
export class AboutModule { }
