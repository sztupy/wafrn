import { Injectable } from '@angular/core'
import { DashboardService } from './dashboard.service'
import { JwtService } from './jwt.service'
import { debounceTime, Subject } from 'rxjs'
import { faUser, IconDefinition } from '@fortawesome/free-solid-svg-icons'

// All setting keys for use throughout the app
const settingKeyVariants = [
  //
  'avatar',
  'name',
  'disableNSFWFilter',
  'mutedWords'
] as const
type SettingKeyTuple = typeof settingKeyVariants
export type SettingKey = SettingKeyTuple[number]

export type SettingFormTypes = 'checkbox' | 'select' | 'input' | 'textarea'

// Setting type cannot be numbers because of a bug with mat-select
// Simply write your numbers as strings (agony)
export type SettingValueType = string | boolean
export interface SettingDataEntry<T> {
  translationKey: string
  serverKey?: string
  localStorageKey?: string
  type: SettingFormTypes
  default: T
  variants?: Record<string, T>
}

// Data on each setting to generate form controls
export type SettingData = Record<SettingKey, SettingDataEntry<SettingValueType>>

// Values to store user data
export type SettingValues = {
  [key in SettingKey]?: SettingValueType
}

export type GroupedSettingData = {
  key: string // From router
  icon?: IconDefinition
  title: string
  values: SettingKey[]
}

export type GroupedSettingDataTransformed = {
  key: string // From router
  icon?: IconDefinition
  title: string
  values: Array<{ key: SettingKey; value: SettingDataEntry<SettingValueType> }>
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public data: SettingData = {
    avatar: {
      translationKey: 'settings.avatar',
      serverKey: 'avatar',
      type: 'input',
      default: ''
    },
    name: {
      translationKey: 'settings.name',
      serverKey: 'name',
      type: 'input',
      default: ''
    },
    disableNSFWFilter: {
      translationKey: 'settings.disableNSFWFilter',
      serverKey: 'wafrn.disableNSFWFilter',
      localStorageKey: 'disableNSFWFilter',
      type: 'checkbox',
      default: false
    },
    mutedWords: {
      translationKey: 'settings.mutedWords',
      serverKey: 'wafrn.mutedWords',
      localStorageKey: 'mutedWords',
      type: 'textarea',
      default: ''
    }
  }
  public groups: GroupedSettingData[] = [
    { key: 'profile', icon: faUser, title: 'settings.profile', values: ['avatar', 'name'] },
    { key: 'preferences', title: 'settings.preferences', values: ['disableNSFWFilter'] },
    { key: 'mutesAndBlocks', title: 'settings.mutesAndBlocks', values: ['mutedWords'] }
  ]
  public values: SettingValues

  // Transform the data into the groups
  public groupsTransformed = this.transformSettingGroups(this.groups)

  public settingsUpdatedSubject = new Subject<void>()

  constructor(
    private dashboardService: DashboardService,
    private jwtService: JwtService
  ) {
    const localStorageValues = this.getLocalStorageValues()
    this.values = Object.assign(this.getDefaultSettings(), localStorageValues)

    const userBlog = this.jwtService.getTokenData()
    console.log(userBlog)
    if (userBlog === null) return

    // Load blog details
    this.dashboardService.getBlogDetails(userBlog.url, true).then((blogDetails) => {
      this.values.avatar = blogDetails.avatar
      this.values.name = blogDetails.name
    })

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

  transformSettingGroups(groups: GroupedSettingData[]): GroupedSettingDataTransformed[] {
    return groups.map((entry) => ({
      ...entry,
      values: entry.values.map((key) => ({
        key: key,
        value: this.data[key]
      }))
    }))
  }

  saveSettings() {
    console.log('saved settings')
  }
}
