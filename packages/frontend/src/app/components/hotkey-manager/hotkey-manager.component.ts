import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatTooltipModule } from '@angular/material/tooltip'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faKeyboard } from '@fortawesome/free-solid-svg-icons'
import { TranslateModule } from '@ngx-translate/core'
import { EditorService } from 'src/app/services/editor.service'
import { CallbackDictionary, GlobalKeydownService } from 'src/app/services/global-keydown.service'
import { JwtService } from 'src/app/services/jwt.service'

@Component({
  selector: 'app-hotkey-manager',
  imports: [MatButtonModule, FontAwesomeModule, MatTooltipModule],
  templateUrl: './hotkey-manager.component.html',
  styleUrl: './hotkey-manager.component.scss'
})
export class HotkeyManagerComponent {
  scrollSize = 100

  keyboardIcon = faKeyboard

  shortcutList: CallbackDictionary = {
    j: () => this.scrollDown(),
    k: () => this.scrollUp(),
    e: () => this.openEditor(),
    '?': () => this.openHotkeyListDialog()
  }

  constructor(
    private keyboardService: GlobalKeydownService,
    private editorService: EditorService,
    private jwtService: JwtService,
    private dialogService: MatDialog
  ) {
    this.keyboardService.keydownEvents.subscribe((key) => {
      this.keyboardService.handleKeydown(key, this.shortcutList)
    })
  }

  openHotkeyListDialog() {
    this.dialogService.closeAll()
    this.dialogService.open(HotkeyListComponent, {
      width: '400px'
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

@Component({
  selector: 'app-hotkey-list-dialog',
  imports: [TranslateModule],
  templateUrl: './hotkey-list-dialog.component.html',
  styleUrl: './hotkey-manager.component.scss'
})
export class HotkeyListComponent {}
