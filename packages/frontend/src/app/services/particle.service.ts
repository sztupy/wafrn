import { Injectable } from '@angular/core'
import { confetti, ConfettiOptions } from '@tsparticles/confetti'
import { RecursivePartial } from '@tsparticles/engine'
import { SettingsService } from './settings.service'

@Injectable({
  providedIn: 'root'
})
export class ParticleService {
  constructor(private settings: SettingsService) {}

  private confetti(opts: {
    location?: { event?: MouseEvent; scroll?: { x: number; y: number } }
    config?: RecursivePartial<ConfettiOptions>
  }) {
    if (this.settings.values.disableConfetti === true) return

    // Attempt to place the confetti on the clicked location
    if (opts?.location?.event !== undefined && opts?.location?.scroll !== undefined) {
      // Locational confetti
      const updatedX = opts.location.scroll.x - window.scrollX + opts.location.event.x
      const updatedY = opts.location.scroll.y - window.scrollY + opts.location.event.y

      const normalizedX = updatedX / window.innerWidth
      const normalizedY = updatedY / window.innerHeight

      // Ensure we're on screen and play locational OR just do the generic
      if (updatedX >= 0 && updatedY >= 0) {
        const confettiConfig = Object.assign(
          {
            particleCount: 15,
            spread: 360,
            startVelocity: 20,
            gravity: 2,
            origin: {
              x: normalizedX,
              y: normalizedY
            },
            scalar: 8
          },
          opts.config
        )
        confetti(confettiConfig)
        return
      }
    }

    // No location = generic confetti
    const conf = Object.assign(
      {
        particleCount: 30,
        spread: 60,
        startVelocity: 60,
        gravity: 2,
        scalar: 8
      },
      opts.config
    )
    confetti({
      angle: 30,
      origin: {
        x: 0,
        y: 0.66
      },
      ...conf
    })
    confetti({
      angle: 180 - 30,
      origin: {
        x: 1,
        y: 0.66
      },
      ...conf
    })
  }

  like(event?: MouseEvent, scroll?: { x: number; y: number }) {
    this.confetti({
      location: { event, scroll },
      config: {
        shapes: ['hearts'],
        colors: ['#d2849c', '#70b07d', '#73a1dc'],
        scalar: 8
      }
    })
  }

  emojiReact(emoji: string[] | string, event?: MouseEvent, scroll?: { x: number; y: number }) {
    if (!Array.isArray(emoji)) {
      emoji = [emoji]
    }

    this.confetti({
      location: { event, scroll },
      config: {
        shapes: ['emoji'],
        shapeOptions: {
          emoji: {
            value: [...emoji],
            font: 'sans-serif'
          }
        },
        scalar: 4
      }
    })
  }
  imageReact(image: string, event?: MouseEvent, scroll?: { x: number; y: number }) {
    this.confetti({
      location: { event, scroll },
      config: {
        shapes: ['image'],
        shapeOptions: {
          image: [{ src: image, width: 64, height: 64 }]
        }
      }
    })
  }
}
