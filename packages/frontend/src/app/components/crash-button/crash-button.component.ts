import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { TranslateModule } from '@ngx-translate/core'
import { debounceTime, Subject } from 'rxjs'
import { OverlayService } from 'src/app/services/overlay.service'

@Component({
  selector: 'app-crash-button',
  imports: [MatButtonModule, TranslateModule],
  templateUrl: './crash-button.component.html',
  styleUrl: './crash-button.component.scss'
})
export class CrashButtonComponent {
  survivedCount = 0
  clearTextTimeout = new Subject<void>()
  survivedTextList: number[] = []

  constructor(private overlayService: OverlayService) {
    this.clearTextTimeout.pipe(debounceTime(2000)).subscribe(() => {
      this.survivedTextList.length = 0
    })
  }

  rollToDie() {
    // SECURE AND COMPLETELY RANDOMIZED DEATH CHANCE!!!
    const crypto = window.crypto || window.Crypto
    const randArr = new Uint32Array(1)
    crypto.getRandomValues(randArr)
    const randomNumber = randArr[0]

    if (randomNumber % 6 === 0) {
      this.overlayService.createImageOverlay(
        'https://cdn.development.wafrn.net/api/cache?media=https%3A%2F%2Fmedia.development.wafrn.net%2F1757416602692_e04e6e24f9e8a4fd8a42c15e6c30039475a5c0a4_processed.webp'
      )
      return
    }

    this.clearTextTimeout.next()

    this.survivedTextList.push(this.survivedCount)
    this.survivedCount += 1
  }
}
