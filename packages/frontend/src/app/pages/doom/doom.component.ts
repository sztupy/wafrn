import { Component, ElementRef, viewChild } from '@angular/core'
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-doom',
  templateUrl: './doom.component.html',
  styleUrls: ['./doom.component.scss'],
  standalone: false
})
export class DoomComponent {
  doomFrame = viewChild<ElementRef<HTMLIFrameElement>>('doom')

  constructor(private titleService: Title) {
    this.titleService.setTitle('Wafrn - the social network with DOOM!')
  }

  snOnHide() {
    // Destroy the DOOM player when navigating away
    this.doomFrame()?.nativeElement.remove()
  }
}
