import { Component, Inject } from '@angular/core'
import { DATA_TOKEN, ImageOverlayData } from 'src/app/services/overlay.service'

@Component({
  selector: 'app-image-overlay',
  imports: [],
  templateUrl: './image-overlay.component.html',
  styleUrl: './image-overlay.component.scss'
})
export class ImageOverlayComponent {
  url: string
  backgroundSize: string

  constructor(@Inject(DATA_TOKEN) data: ImageOverlayData) {
    this.url = data.url
    this.backgroundSize = data.backgroundSize
  }
}
