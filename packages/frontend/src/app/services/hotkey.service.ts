import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'

export enum HotkeyType {
  nextPost,
  previousPost
}

@Injectable({
  providedIn: 'root'
})
export class HotkeyService {
  public hotkeySubscription = new Subject<HotkeyType>()
}
