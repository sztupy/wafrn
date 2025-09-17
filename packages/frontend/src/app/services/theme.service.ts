import { Injectable, signal, WritableSignal } from '@angular/core'
import { LoginService } from './login.service'
import { HttpClient } from '@angular/common/http'
import { debounceTime, filter, firstValueFrom, fromEvent, merge, tap } from 'rxjs'
import { EnvironmentService } from './environment.service'
import { toObservable } from '@angular/core/rxjs-interop'
import { SettingListItem, SettingsService } from './settings.service'

// !! NOTE FOR ADDING THEMES !! //
//
// If you want to add a theme, you must:
// - Add it to `themeVariants`
// - Fill out its `themeData` (name data and if the theme forces light/dark) entry
//   - Compatibility allows you to force dark/light if you need.
//   - Auto Reset makes the theme be reset to default on reload
// - Add the theme as a CSS file in `/assets/themes/name.css`
// - Add a link file to it in theme-manager.component.html
// - Add your theme to a group in `themeGroupList`

// !! NOTE FOR ADDING MODES !! //
//
// If you want to add a style mode, you must:
// - Add it to `additionalStyleModeVariants`
// - Fill out its `additionalStyleModesData`
// - Add a link file to it in theme-manager.component.html

const themeVariants = [
  'default',
  'tan',
  'green',
  'gold',
  'red',
  'pink',
  'purple',
  'blue',
  'rizzler',
  'contrastWater',
  'wafrn98',
  'aqua',
  'unwafrn',
  'wafrnverse',
  'dracula',
  'fan',
  'waffler',
  'catppuccin_frappe',
  'catppuccin_latte',
  'catppuccin_macchiato',
  'catppuccin_mocha'
] as const
type ThemeTuple = typeof themeVariants
export type Theme = ThemeTuple[number]

type ThemeData = {
  [key in Theme]: {
    name: string
    compatibility: 'light' | 'dark' | 'both'
    autoReset?: boolean
  }
}

export const themeData: ThemeData = {
  default: { name: 'Default', compatibility: 'both' },
  tan: { name: 'Tan', compatibility: 'both' },
  green: { name: 'Green', compatibility: 'both' },
  gold: { name: 'Gold', compatibility: 'both' },
  red: { name: 'Red', compatibility: 'both' },
  pink: { name: 'Pink', compatibility: 'both' },
  purple: { name: 'Purple', compatibility: 'both' },
  blue: { name: 'Blue', compatibility: 'both' },
  rizzler: { name: 'Rizzler', compatibility: 'both', autoReset: true },
  contrastWater: { name: 'Contrast Water', compatibility: 'both', autoReset: true },
  wafrn98: { name: 'Wafrn98', compatibility: 'dark' },
  aqua: { name: 'Aqua', compatibility: 'light' },
  unwafrn: { name: 'Unwafrn', compatibility: 'dark' },
  wafrnverse: { name: 'Wafrnverse', compatibility: 'both' },
  dracula: { name: 'Dracula', compatibility: 'both' },
  fan: { name: 'Fan', compatibility: 'both' },
  waffler: { name: 'Waffler', compatibility: 'both' },
  catppuccin_frappe: { name: 'Catppuccin Frappe', compatibility: 'both' },
  catppuccin_latte: { name: 'Catppuccin Latte', compatibility: 'both' },
  catppuccin_macchiato: { name: 'Catppuccin Macchiato', compatibility: 'both' },
  catppuccin_mocha: { name: 'Catppuccin Mocha', compatibility: 'both' }
}

const themeGroupVariants = ['defaultThemes', 'computeryThemes', 'experimentalThemes', 'programmersThemes'] as const
type ThemeGroupTuple = typeof themeGroupVariants
export type ThemeGroup = ThemeGroupTuple[number]
export type ThemeGroupList = {
  [key in ThemeGroup]: {
    name: string
    entries: Theme[]
  }
}

export const themeGroupList: ThemeGroupList = {
  defaultThemes: {
    name: 'Default theme variants',
    entries: ['default', 'tan', 'green', 'gold', 'red', 'pink', 'purple', 'blue']
  },
  computeryThemes: {
    name: 'Computery themes',
    entries: ['unwafrn', 'wafrnverse', 'wafrn98', 'aqua', 'fan', 'waffler']
  },
  experimentalThemes: {
    name: 'Experimental themes',
    entries: ['rizzler', 'contrastWater']
  },
  programmersThemes: {
    name: "Programmer's Favourites",
    entries: ['dracula', 'catppuccin_latte', 'catppuccin_frappe', 'catppuccin_macchiato', 'catppuccin_mocha']
  }
}

const lightDarkModeVariants = ['light', 'dark', 'auto'] as const
type lightDarkModeTuple = typeof lightDarkModeVariants
export type LightDarkMode = lightDarkModeTuple[number]

export type LightDarkModeData = { [key in LightDarkMode]: string }
export const lightDarkModeData: LightDarkModeData = {
  light: 'Light',
  dark: 'Dark',
  auto: 'Auto'
}

// Verifying that a theme/scheme is real
function isLightDarkMode(value: string | undefined): value is LightDarkMode {
  return value !== undefined && lightDarkModeVariants.includes(value as LightDarkMode)
}

function isTheme(value: string | undefined): value is Theme {
  return value !== undefined && themeVariants.includes(value as Theme)
}

// Covers SettingListItem[] because type jank
function isAdditionalStyleMode(value: string[] | SettingListItem[]): value is AdditionalStyleMode[] {
  return !value.some((mode) => !additionalStyleModeVariants.includes(mode as AdditionalStyleMode))
}

// More styles!
const additionalStyleModeVariants = [
  'centerLayout',
  'topToolbar',
  'horizontalMenu',
  'lowContrastSidebar',
  'oldTags',
  'colorfulTags'
] as const
type AdditionalStyleModeTuple = typeof additionalStyleModeVariants
export type AdditionalStyleMode = AdditionalStyleModeTuple[number]

type AdditionalStyleModeData = {
  [key in AdditionalStyleMode]: {
    name: string
  }
}

export const additionalStyleModesData: AdditionalStyleModeData = {
  centerLayout: { name: 'Center Layout' },
  topToolbar: { name: 'Top Toolbar' },
  horizontalMenu: { name: 'Horizontal Menu' },
  lowContrastSidebar: { name: 'Low Contrast Sidebar' },
  oldTags: { name: 'Old Tags' },
  colorfulTags: { name: 'Colorful Tags' }
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public theme = signal<Theme>('default')
  public lightDarkMode = signal<LightDarkMode>('auto')
  public additionalStyleModes: { [key in AdditionalStyleMode]: WritableSignal<boolean> } = {
    centerLayout: signal(false),
    topToolbar: signal(false),
    horizontalMenu: signal(false),
    lowContrastSidebar: signal(false),
    oldTags: signal(false),
    colorfulTags: signal(false)
  }

  constructor(
    private loginService: LoginService,
    private http: HttpClient,
    private settingService: SettingsService
  ) {
    // Setup when logging out, completing setting sync, and also run once (yay signals)
    // Also watches change from other tabs
    merge(
      toObservable(loginService.loggedIn).pipe(filter((logged) => !logged)),
      this.settingService.settingsLoadedFromLogin.asObservable(),
      fromEvent(window, 'storage').pipe(
        filter((event) => ['theme', 'colorScheme'].includes((<StorageEvent>event).key ?? '')),
        debounceTime(200)
      )
    ).subscribe(() => this.setup())
  }

  setup() {
    const theme = this.settingService.values.theme
    if (typeof theme === 'string' && isTheme(theme)) {
      this.setTheme(theme)
    }

    const darkLightMode = this.settingService.values.lightDarkMode
    if (typeof darkLightMode === 'string' && isLightDarkMode(darkLightMode)) {
      this.setLightDarkMode(darkLightMode)
    }

    const settingAdditionalStyleModes = this.settingService.values.additionalStyleModes
    if (Array.isArray(settingAdditionalStyleModes) && isAdditionalStyleMode(settingAdditionalStyleModes)) {
      additionalStyleModeVariants.forEach((mode) => {
        const enabled = settingAdditionalStyleModes.includes(mode)
        this.additionalStyleModes[mode].set(enabled)
      })
    }

    // Fan theme fallback for old browsers
    const chromeVersionForCompatibilityReasons = this.getChromeVersion()
    if (chromeVersionForCompatibilityReasons && chromeVersionForCompatibilityReasons < 122) {
      // we force the fan theme on old browsers
      this.setTheme('fan', true)
    }
  }

  public setTheme = async (theme: Theme, doNotSavePreference = false) => {
    this.theme.set(theme)
    this.settingService.values.theme = theme

    // Forced lightDarkMode
    if (themeData[theme]?.compatibility === 'light') await this.setLightDarkMode('light')
    if (themeData[theme]?.compatibility === 'dark') await this.setLightDarkMode('dark')

    this.settingService.forceUpdateValue('theme', !doNotSavePreference)
  }

  public setLightDarkMode = async (lightDarkMode: LightDarkMode, doNotSavePreference = false) => {
    this.lightDarkMode.set(lightDarkMode)
    this.settingService.values.lightDarkMode = lightDarkMode

    document.documentElement.setAttribute('data-theme', lightDarkMode)
    this.settingService.forceUpdateValue('lightDarkMode', !doNotSavePreference)
  }

  // When setting additionalStyleMode either call the set method here or modify and call sync afterwards if modifying many settings at once.
  public setAdditionalStyleMode = async (mode: AdditionalStyleMode, value: boolean, doNotSavePreference = false) => {
    this.additionalStyleModes[mode].set(value)
    this.syncAdditionalStyleModeSettings()

    this.settingService.forceUpdateValue('additionalStyleModes', !doNotSavePreference)
  }

  public syncAdditionalStyleMode() {
    this.syncAdditionalStyleModeSettings()

    this.settingService.forceUpdateValue('additionalStyleModes')
  }

  // Helper to sync up the settings service values and theme service values
  private syncAdditionalStyleModeSettings() {
    const modes = Object.entries(this.additionalStyleModes)
      .filter(([_, enabled]) => enabled())
      .map(([val, _]) => val)

    this.settingService.values.additionalStyleModes = modes
  }

  public async toggleAdditionalStyleMode(mode: AdditionalStyleMode, doNotSavePreference = false) {
    this.setAdditionalStyleMode(mode, !this.additionalStyleModes[mode](), doNotSavePreference)
  }

  getChromeVersion() {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)

    return raw ? parseInt(raw[2], 10) : false
  }

  // CUSTOM CSS STUFF
  setMyTheme() {
    if (this.loginService.getLoggedUserUUID()) {
      this.setCustomCSS(this.loginService.getLoggedUserUUID())
    }
  }

  updateTheme(newTheme: string) {
    return firstValueFrom(this.http.post(`${EnvironmentService.environment.baseUrl}/updateCSS`, { css: newTheme }))
  }

  // 0 no data 1 does not want custom css 2 accepts custom css
  hasUserAcceptedCustomThemes(): number {
    let res = 0
    try {
      const storedResponse = localStorage.getItem('acceptsCustomThemes')
      res = storedResponse ? parseInt(storedResponse) : 0
    } catch (error) {}
    return res
  }

  async checkThemeExists(theme: string): Promise<boolean> {
    let res = false
    try {
      const response = await firstValueFrom(
        this.http.get(`${EnvironmentService.environment.baseMediaUrl}/themes/${theme}.css`, {
          responseType: 'text'
        })
      )
      if (response && response.length > 0) {
        res = true
      }
    } catch (error) {}
    return res
  }

  async getMyThemeAsSting(): Promise<string> {
    let res = ''
    try {
      const themeResponse = await this.http
        .get(`${EnvironmentService.environment.baseUrl}/uploads/themes/${this.loginService.getLoggedUserUUID()}.css`, {
          responseType: 'text'
        })
        .toPromise()
      if (themeResponse && themeResponse.length > 0) {
        res = themeResponse
      }
    } catch (error) {}
    return res
  }

  setCustomCSS(themeToSet: string) {
    try {
      this.setStyle('customUserTheme', `${EnvironmentService.environment.baseUrl}/uploads/themes/${themeToSet}.css`)
    } catch (error) {}
  }

  private getLinkElementForKey(key: string) {
    return this.getExistingLinkElementByKey(key) || this.createLinkElementWithKey(key)
  }

  private getExistingLinkElementByKey(key: string) {
    return document.head.querySelector(`link[rel="stylesheet"].${this.getClassNameForKey(key)}`)
  }

  private createLinkElementWithKey(key: string) {
    const linkEl = document.createElement('link')
    linkEl.setAttribute('rel', 'stylesheet')
    linkEl.classList.add(this.getClassNameForKey(key))
    document.head.appendChild(linkEl)
    return linkEl
  }

  private getClassNameForKey(key: string) {
    return `app-${key}`
  }

  /**
   * Set the stylesheet with the specified key.
   */
  private setStyle(key: string, href: string) {
    this.getLinkElementForKey(key).setAttribute('href', href)
  }

  /**
   * Remove the stylesheet with the specified key.
   */
  private removeStyle(key: string) {
    const existingLinkElement = this.getExistingLinkElementByKey(key)
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement)
    }
  }
}
