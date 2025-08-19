import { KeyValuePipe } from '@angular/common'
import { Component, inject, signal, WritableSignal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { MatTooltipModule } from '@angular/material/tooltip'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faKeyboard, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { TranslateModule, TranslateService, _ } from '@ngx-translate/core'
import { filter, fromEvent, Subject, takeUntil } from 'rxjs'
import { EditorService } from 'src/app/services/editor.service'
import { CallbackDictionary, GlobalKeydownService } from 'src/app/services/global-keydown.service'
import { JwtService } from 'src/app/services/jwt.service'

type HotkeyConfig = Record<string, string | undefined>
type ShortcutFunctionMap = Record<string, Function>

const defaultKeybinds: HotkeyConfig = {
  scrollDown: 'j',
  scrollUp: 'k',
  openEditor: 'e',
  viewKeyboardShortcuts: '?'
}

// const example_mapping: HotkeyConfig = {
//   scrollDown: 'a',
//   scrollUp: 'b'
//   // openEditor: 'c',
//   // viewKeyboardShortcuts: 'd'
// }

const example_mapping: HotkeyConfig = defaultKeybinds

let hotkeysEnabled = true

@Component({
  selector: 'app-hotkey-manager',
  imports: [MatButtonModule, FontAwesomeModule, MatTooltipModule],
  templateUrl: './hotkey-manager.component.html',
  styleUrl: './hotkey-manager.component.scss'
})
export class HotkeyManagerComponent {
  scrollSize = 100

  keyboardIcon = faKeyboard

  // Loaded and mapped from user profile
  shortcutListLookup: ShortcutFunctionMap = {
    scrollDown: () => this.scrollDown(),
    scrollUp: () => this.scrollUp(),
    openEditor: () => this.openEditor(),
    viewKeyboardShortcuts: () => this.openHotkeyListDialog(),
    no_op: () => {}
  }
  userMapping: HotkeyConfig
  shortcutList: WritableSignal<CallbackDictionary>

  constructor(
    private keyboardService: GlobalKeydownService,
    private editorService: EditorService,
    private jwtService: JwtService,
    private dialogService: MatDialog
  ) {
    this.userMapping = example_mapping
    this.shortcutList = signal(this.mapHotkeys(this.userMapping))

    this.keyboardService.keydownEvents.pipe(filter(() => hotkeysEnabled)).subscribe((key) => {
      this.keyboardService.handleKeydown(key, this.shortcutList())
    })
  }

  mapHotkeys(hotkeys: HotkeyConfig) {
    console.log(hotkeys)
    return Object.fromEntries(
      Object.entries(hotkeys).map(([key, shortcutMapping]) => [
        shortcutMapping,
        this.shortcutListLookup[key] || this.shortcutListLookup['no_op']
      ])
    )
  }

  openHotkeyListDialog() {
    this.dialogService.closeAll()
    const dialogRef = this.dialogService.open(HotkeyListComponent, {
      width: '400px',
      data: {
        currentHotkeys: this.userMapping
      },
      closePredicate: () => hotkeysEnabled
    })
    dialogRef.afterClosed().subscribe(() => {
      this.shortcutList.set(this.mapHotkeys(example_mapping))
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

interface DialogData {
  currentHotkeys: HotkeyConfig
}

@Component({
  selector: 'app-hotkey-list-dialog',
  imports: [MatButtonModule, FontAwesomeModule, TranslateModule, KeyValuePipe],
  templateUrl: './hotkey-list-dialog.component.html',
  styleUrl: './hotkey-manager.component.scss'
})
export class HotkeyListComponent {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA)
  mapping = this.data.currentHotkeys
  defaultKeybinds = defaultKeybinds

  changingKey: string | null = null
  cancelSetKeybind = new Subject()

  undoIcon = faRotateLeft

  constructor(private translateService: TranslateService) {
    this.cancelSetKeybind.subscribe(() => {
      hotkeysEnabled = true
      this.changingKey = null
    })
  }

  getKeybind(id: string) {
    const key = this.mapping[id] || this.translateService.instant(_('keyboard-shortcuts.unbound'))

    if (this.changingKey === id) {
      return `>${key}<`
    }

    return key
  }

  isOverlapping(key: string | undefined) {
    if (key === undefined) return false

    const allKeys = Object.entries(this.mapping).map((v) => v[1])
    return allKeys.indexOf(key) !== allKeys.lastIndexOf(key)
  }

  setKeybind(id: string) {
    if (!hotkeysEnabled) return
    hotkeysEnabled = false
    this.changingKey = id
    const modifierKeys = ['Shift', 'Alt', 'Control']

    fromEvent(document, 'keydown')
      .pipe(takeUntil(this.cancelSetKeybind))
      .subscribe((eventRaw) => {
        const e = <KeyboardEvent>eventRaw
        e.preventDefault()
        const keyIsModifier = modifierKeys.includes(e.key)
        if (keyIsModifier) return

        const isLetter = e.code.slice(0, 3) === 'Key'
        if (isLetter) {
          this.mapping[id] = e.shiftKey ? e.key.toUpperCase() : e.key
        } else {
          this.mapping[id] = undefined
        }

        this.cancelSetKeybind.next('')
      })
  }

  resetKeybind(id: string) {
    this.mapping[id] = defaultKeybinds[id]
    this.cancelSetKeybind.next('')
  }
}
