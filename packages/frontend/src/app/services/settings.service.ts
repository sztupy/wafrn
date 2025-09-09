import { Injectable } from '@angular/core'
import { DashboardService } from './dashboard.service'
import { JwtService } from './jwt.service'
import { debounceTime, Subject } from 'rxjs'
import { faBarcode, faCake, faUser, IconDefinition } from '@fortawesome/free-solid-svg-icons'

// All setting keys for use throughout the app
const settingKeyVariants = [
  //
  'avatar',
  'name',
  'description',
  'disableNSFWFilter',
  'mutedWords'
] as const
type SettingKeyTuple = typeof settingKeyVariants
export type SettingKey = SettingKeyTuple[number]

export type SettingFormTypes = 'checkbox' | 'select' | 'input' | 'textarea'

// Setting type cannot be numbers because of a bug with mat-select
// Simply write your numbers as strings (agony)
export type SettingValueType = string | boolean
export interface SettingDataEntry {
  key: SettingKey // Copy of key for components to use
  translationKey: string
  serverKey?: string
  localStorageKey?: string
  type: SettingFormTypes
  default: SettingValueType
  variants?: Record<string, SettingValueType>
}

// Data on each setting to generate form controls
export type SettingData = Record<SettingKey, SettingDataEntry>
export type SettingRenderList = { type: 'key'; value: SettingKey } | { type: 'header'; value: string }

export type GroupedSettingData = {
  key: string // From router
  icon?: IconDefinition
  title: string
  values: SettingRenderList[] // For setting-loader to auto-display. Use an empty list for custom pages
}

// Values to store user data
export type SettingValues = {
  [key in SettingKey]?: SettingValueType
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public data: SettingData = {
    avatar: {
      key: 'avatar',
      translationKey: 'settings.avatar',
      serverKey: 'avatar',
      type: 'input',
      default: ''
    },
    name: {
      key: 'name',
      translationKey: 'settings.name',
      serverKey: 'name',
      type: 'input',
      default: ''
    },
    description: {
      key: 'description',
      translationKey: 'settings.description',
      serverKey: 'description',
      type: 'textarea',
      default: ''
    },
    disableNSFWFilter: {
      key: 'disableNSFWFilter',
      translationKey: 'settings.disableNSFWFilter',
      serverKey: 'wafrn.disableNSFWFilter',
      localStorageKey: 'disableNSFWFilter',
      type: 'checkbox',
      default: false
    },
    mutedWords: {
      key: 'mutedWords',
      translationKey: 'settings.mutedWords',
      serverKey: 'wafrn.mutedWords',
      localStorageKey: 'mutedWords',
      type: 'textarea',
      default: ''
    }
  }
  public groups: GroupedSettingData[] = [
    {
      key: 'profile',
      icon: faUser,
      title: 'settings.sidebar.profile',
      values: []
    },
    {
      key: 'preferences',
      icon: faBarcode,
      title: 'settings.sidebar.preferences',
      values: [
        { type: 'header', value: 'settings.header.appearance' },
        { type: 'key', value: 'disableNSFWFilter' },
        { type: 'header', value: 'settings.header.appearance' },
        { type: 'key', value: 'disableNSFWFilter' }
      ]
    },
    {
      key: 'mutesAndBlocks',
      icon: faCake,
      title: 'settings.sidebar.mutesAndBlocks',
      values: [
        { type: 'header', value: 'settings.header.sus' },
        { type: 'key', value: 'mutedWords' }
      ]
    }
  ]
  public values: SettingValues

  public settingsUpdatedSubject = new Subject<void>()

  constructor(
    private dashboardService: DashboardService,
    private jwtService: JwtService
  ) {
    // Set defaults from local storage
    const localStorageValues = this.getLocalStorageValues()
    this.values = Object.assign(this.getDefaultSettings(), localStorageValues)

    // Load blog details
    const userBlog = this.jwtService.getTokenData()
    if (userBlog) {
      this.dashboardService.getBlogDetails(userBlog.url, true).then((blogDetails) => {
        this.values.avatar = blogDetails.avatar
        this.values.name = blogDetails.name
        this.values.description = blogDetails.descriptionMarkdown
      })
    }

    // Listen for and save updated settings
    // Debounced so we don't spam the server
    this.settingsUpdatedSubject.pipe(debounceTime(2000)).subscribe(() => {
      this.saveSettings()
    })
  }

  getLocalStorageValues(): SettingValues {
    const storedValues: SettingValues = {}

    const dataEntries = Object.entries(this.data)
    dataEntries.forEach(([key, dataEntry]) => {
      if (!dataEntry.localStorageKey) return

      const retrievedValue = localStorage.getItem(dataEntry.localStorageKey)
      if (retrievedValue) {
        storedValues[key as keyof SettingValues] = JSON.parse(retrievedValue)
      }
    })

    return storedValues
  }

  getDefaultSettings(): SettingValues {
    return Object.fromEntries(Object.entries(this.data).map(([key, dataEntry]) => [key, dataEntry.default]))
  }

  saveSettings() {
    console.log('saved settings')
  }
}
