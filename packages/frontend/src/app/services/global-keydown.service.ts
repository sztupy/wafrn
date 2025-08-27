import { Injectable } from '@angular/core'
import { Observable, filter, fromEvent, map } from 'rxjs'

export type CallbackDictionary = Record<string, Function>

@Injectable({
  providedIn: 'root'
})
export class GlobalKeydownService {
  keydownEvents: Observable<string>

  private ignoredElements = [HTMLInputElement, HTMLTextAreaElement]

  constructor() {
    this.keydownEvents = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      filter((event) => !this.ignoredElements.some((elem) => event.target instanceof elem)),
      map((event) => event.key)
    )
  }

  handleKeydown(key: string, callbackDictionary: CallbackDictionary): void {
    const callback = callbackDictionary[key]
    if (callback === undefined) return

    callback()
  }
}
