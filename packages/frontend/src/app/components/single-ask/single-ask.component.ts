import { Component, input, Input } from '@angular/core'
import { AvatarSmallComponent } from '../avatar-small/avatar-small.component'
import { Ask } from '../../interfaces/ask'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-single-ask',
  imports: [AvatarSmallComponent, RouterModule],
  templateUrl: './single-ask.component.html',
  styleUrl: './single-ask.component.scss'
})
export class SingleAskComponent {
  ask = input.required<Ask>()
}
