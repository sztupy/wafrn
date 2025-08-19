import { KeyValuePipe } from '@angular/common'
import { Component, inject, signal, WritableSignal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { MatTooltipModule } from '@angular/material/tooltip'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faKeyboard, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { TranslateModule, TranslateService, _ } from '@ngx-translate/core'
import { filter, fromEvent, Subject, takeUntil } from 'rxjs'
import { EditorService } from 'src/app/services/editor.service'
import { CallbackDictionary, GlobalKeydownService } from 'src/app/services/global-keydown.service'
import { JwtService } from 'src/app/services/jwt.service'
import { LoginService } from 'src/app/services/login.service'

type HotkeyConfig = Record<string, string | undefined>
type ShortcutFunctionMap = Record<string, Function>

type ScrollInput = 'up' | 'down' | 'upPage' | 'downPage' | null

const defaultKeybinds: HotkeyConfig = {
  scrollDown: 'j',
  scrollUp: 'k',
  scrollDownPage: 'd',
  scrollUpPage: 'u',
  openEditor: 'e',
  viewKeyboardShortcuts: '?'
}

let hotkeysEnabled = true
let smoothScroll = signal(true)

@Component({
  selector: 'app-hotkey-manager',
  imports: [MatButtonModule, FontAwesomeModule, MatTooltipModule],
  templateUrl: './hotkey-manager.component.html',
  styleUrl: './hotkey-manager.component.scss'
})
export class HotkeyManagerComponent {
  scrollSize = 100 // Pixels per scroll
  scrollPageSize = 300 // Pixels per page scroll
  scrollRate = 120 // Milliseconds per pixel scroll and minimum scroll

  keyboardIcon = faKeyboard

  currentlyScrolling = false
  continueScrolling = false
  lockedScrollingDirection: ScrollInput = null
  scrollDirection: ScrollInput = null

  // Loaded and mapped from user profile
  shortcutListLookup: ShortcutFunctionMap = {
    scrollDown: () => this.scrollDown(),
    scrollUp: () => this.scrollUp(),
    scrollDownPage: () => this.scrollDownPage(),
    scrollUpPage: () => this.scrollUpPage(),
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
    private dialogService: MatDialog,
    private loginService: LoginService
  ) {
    const cachedMap = localStorage.getItem('customHotKeyMapping')
    const customMapping = cachedMap !== null ? JSON.parse(cachedMap) : {}
    const joinedMapping = Object.assign(customMapping, defaultKeybinds)
    this.userMapping = joinedMapping
    this.shortcutList = signal(this.mapHotkeys(this.userMapping))

    const cachedSmoothScroll = (localStorage.getItem('hotkeySmoothScroll') ?? 'true') === 'true'
    smoothScroll.set(cachedSmoothScroll)

    this.keyboardService.keydownEvents.pipe(filter(() => hotkeysEnabled)).subscribe((key) => {
      this.keyboardService.handleKeydown(key, this.shortcutList())
    })
  }

  saveHotkeys() {
    // Setting localStorage here because of cache issues in login service
    localStorage.setItem('customHotKeyMapping', JSON.stringify(this.userMapping))
    localStorage.setItem('hotkeySmoothScroll', smoothScroll().toString())
    this.loginService.updateUserOptions([
      { name: 'wafrn.customHotKeyMapping', value: JSON.stringify(this.userMapping) },
      { name: 'wafrn.hotkeySmoothScroll', value: smoothScroll().toString() }
    ])
  }

  mapHotkeys(hotkeys: HotkeyConfig) {
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
      this.shortcutList.set(this.mapHotkeys(this.userMapping))
      this.saveHotkeys()
    })
  }

  scrollDown() {
    this.scrollDirection = 'down'
    this.scroll(this.scrollSize, this.userMapping['scrollDown'])
  }

  scrollUp() {
    this.scrollDirection = 'up'
    this.scroll(-this.scrollSize, this.userMapping['scrollUp'])
  }

  scrollDownPage() {
    this.scrollDirection = 'downPage'
    this.scroll(this.scrollPageSize, this.userMapping['scrollDownPage'])
  }

  scrollUpPage() {
    this.scrollDirection = 'upPage'
    this.scroll(-this.scrollPageSize, this.userMapping['scrollUpPage'])
  }

  scroll(amount: number, key: string | undefined) {
    // For motion sickness
    if (!smoothScroll()) {
      this.performScroll(amount)
      return
    }

    if (this.continueScrolling) return
    this.continueScrolling = true

    const otherKey = ['scrollUp', 'scrollDown', 'scrollUpPage', 'scrollDownPage']
      .map((key) => this.userMapping[key])
      .filter((k) => k !== key)

    const cancelScroll = () => {
      this.continueScrolling = false
      terminate.next('')
    }

    const terminate = new Subject()

    // Cancel on started key unpress
    fromEvent(document, 'keyup')
      .pipe(
        takeUntil(terminate),
        filter((e) => (<KeyboardEvent>e).key === key)
      )
      .subscribe(cancelScroll)
    // Cancel on other scroll key pressed
    fromEvent(document, 'keydown')
      .pipe(
        takeUntil(terminate),
        filter((e) => otherKey.includes((<KeyboardEvent>e).key))
      )
      .subscribe(cancelScroll)

    // Smooth scroll animation function
    let totalElapsed = 0
    let previousTimestamp: DOMHighResTimeStamp | null = null
    let currentDirection = this.scrollDirection
    const animate = (timestamp: DOMHighResTimeStamp) => {
      if (previousTimestamp === null) {
        previousTimestamp = timestamp
      }
      const elapsed = timestamp - previousTimestamp
      totalElapsed += elapsed
      previousTimestamp = timestamp
      const delta = amount * (elapsed / this.scrollRate)

      const incorrectDirection = currentDirection !== this.scrollDirection
      const cancelScrolling = totalElapsed > this.scrollRate && !this.continueScrolling
      if (incorrectDirection || cancelScrolling) {
        this.currentlyScrolling = false
        return
      }

      this.currentlyScrolling = true
      this.performScroll(delta)

      requestAnimationFrame(animate)
    }

    // Prevent multiple of the same scroll
    if (this.currentlyScrolling && this.lockedScrollingDirection === currentDirection) return
    requestAnimationFrame(animate)
    this.lockedScrollingDirection = currentDirection
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
  imports: [MatButtonModule, FontAwesomeModule, TranslateModule, KeyValuePipe, MatCheckboxModule],
  templateUrl: './hotkey-list-dialog.component.html',
  styleUrl: './hotkey-manager.component.scss'
})
export class HotkeyListComponent {
  readonly data = inject<DialogData>(MAT_DIALOG_DATA)
  mapping = this.data.currentHotkeys
  defaultKeybinds = defaultKeybinds

  changingKey: string | null = null
  cancelSetKeybind = new Subject()
  smoothScroll = smoothScroll

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
        e.stopImmediatePropagation()
        const keyIsModifier = modifierKeys.includes(e.key)
        if (keyIsModifier) return

        console.log(e)
        const unbind = e.code === 'Escape'
        if (unbind) {
          this.mapping[id] = undefined
        } else {
          this.mapping[id] = e.shiftKey ? e.key.toUpperCase() : e.key
        }

        this.cancelSetKeybind.next('')
      })
  }

  resetKeybind(id: string) {
    this.mapping[id] = defaultKeybinds[id]
    this.cancelSetKeybind.next('')
  }

  toggleSignal(signal: WritableSignal<boolean>) {
    signal.update((v) => !v)
  }
}
