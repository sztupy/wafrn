import { Component } from '@angular/core'
import { EditorService } from 'src/app/services/editor.service'
import { CallbackDictionary, GlobalKeydownService } from 'src/app/services/global-keydown.service'
import { JwtService } from 'src/app/services/jwt.service'

@Component({
  selector: 'app-hotkey-manager',
  imports: [],
  templateUrl: './hotkey-manager.component.html',
  styleUrl: './hotkey-manager.component.scss'
})
export class HotkeyManagerComponent {
  scrollSize = 100

  shortcutList: CallbackDictionary = {
    j: () => this.scrollDown(),
    k: () => this.scrollUp(),
    e: () => this.openEditor()
  }

  constructor(
    private keyboardService: GlobalKeydownService,
    private editorService: EditorService,
    private jwtService: JwtService
  ) {
    this.keyboardService.keydownEvents.subscribe((key) => {
      this.keyboardService.handleKeydown(key, this.shortcutList)
    })
  }

  scrollDown() {
    this.performScroll(this.scrollSize)
  }

  scrollUp() {
    this.performScroll(-this.scrollSize)
  }

  performScroll(amount: number) {
    document.documentElement.scrollBy({ behavior: 'instant', top: amount })
  }

  openEditor() {
    // Only if user is logged in
    if (!this.jwtService.tokenValid()) return
    this.editorService.openDialogWithData(undefined)
  }
}
