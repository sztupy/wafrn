import { Injectable } from '@angular/core'

const audioNameVariants = [
  'like',
  'sendWoot',
  // no use for 3.ogg yet
  'notification',
  'follow'
] as const
type AudioNameTuple = typeof audioNameVariants
export type AudioName = AudioNameTuple[number]
export type AudioData = {
  [key in AudioName]: string
}

export const audioMap: AudioData = {
  like: '/assets/sounds/1.ogg',
  sendWoot: '/assets/sounds/2.ogg',
  // no use for 3.ogg yet
  notification: '/assets/sounds/4.ogg',
  follow: '/assets/sounds/5.ogg'
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  audios: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    // TODO maybe a better way to say "hey preload these audios"
    const audiosToPreload = [
      '/assets/sounds/1.ogg',
      '/assets/sounds/2.ogg',
      '/assets/sounds/3.ogg',
      '/assets/sounds/4.ogg',
      '/assets/sounds/5.ogg'
    ]

    audiosToPreload.forEach((elem) => {
      const audio = new Audio(elem)
      audio.preload = 'auto'
      this.audios.set(elem, audio)
    })
  }

  playSound(name: AudioName, volume = 0.3) {
    const soundFile = audioMap[name]
    try {
      let audio = this.audios.get(soundFile)
      if (!audio) {
        audio = new Audio(soundFile)
        this.audios.set(soundFile, audio)
      }
      audio.volume = volume
      audio.play()
    } catch (error) {
      console.error(error)
    }
  }
}
