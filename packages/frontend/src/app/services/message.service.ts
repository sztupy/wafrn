import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import JSConfetti from 'js-confetti'
import { AudioName, AudioService } from './audio.service'

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public static confetti: JSConfetti
  constructor(
    private snackBar: MatSnackBar,
    private audioService: AudioService
  ) {
    if (!MessageService.confetti) {
      MessageService.confetti = new JSConfetti()
    }
  }

  add(message: {
    severity: 'error' | 'success' | 'warn' | 'info'
    summary: string
    confettiEmojis?: string[]
    soundName?: AudioName
  }) {
    if (localStorage.getItem('disableSounds') != 'true' && message.soundName) {
      this.audioService.playSound(message.soundName)
    }
    let icon = ''
    switch (message.severity) {
      case 'warn':
      case 'error':
        icon = '❌'
        break
      default:
        icon = '✅'
    }
    this.snackBar.open(message.summary, icon, {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    })
    if (message.confettiEmojis && message.confettiEmojis.length) {
      MessageService.confetti.addConfetti({
        emojis: message.confettiEmojis
      })
    }
  }
}
