import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

const hotkeyActionsVariants = [
  'scrollDown',
  'scrollUp',
  'scrollDownPage',
  'scrollUpPage',
  'nextPost',
  'previousPost',
  'likePost',
  'rewootPost',
  'replyPost',
  'quotePost',
  'bookmarkPost',
  'openEditor',
  'viewKeyboardShortcuts'
] as const
type HotkeyActionsTuple = typeof hotkeyActionsVariants
export type HotkeyAction = HotkeyActionsTuple[number]

@Injectable({
  providedIn: 'root'
})
export class HotkeyService {
  public hotkeySubscription = new Subject<HotkeyAction>()
}
