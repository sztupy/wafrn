import { Injectable } from '@angular/core'

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
  title: string
  values: SettingKey[]
}

export type GroupedSettingDataTransformed = {
  key: string // From router
  title: string
  values: Array<{ key: SettingKey; value: SettingDataEntry<SettingValueType> }>
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  data: SettingData = {
    avatar: {
      translationKey: 'settings.avatar',
      serverKey: 'wafrn.coolName',
      type: 'input',
      default: ''
    },
    name: {
      translationKey: 'settings.name',
      serverKey: 'wafrn.coolName',
      type: 'input',
      default: ''
    },
    disableNSFWFilter: {
      translationKey: 'settings.disableNSFWFilter',
      serverKey: 'wafrn.cool',
      type: 'checkbox',
      default: false
    },
    mutedWords: {
      translationKey: 'settings.mutedWords',
      serverKey: 'wafrn.mutedWords',
      type: 'textarea',
      default: ''
    }
  }
  groups: GroupedSettingData[] = [
    { key: 'profile', title: 'settings.profile', values: ['avatar', 'name'] },
    { key: 'preferences', title: 'settings.preferences', values: ['disableNSFWFilter'] },
    { key: 'mutesAndBlocks', title: 'settings.mutesAndBlocks', values: ['mutedWords'] }
  ]
  values: SettingValues

  // Transform the data into the groups
  groupsTransformed = this.transformSettingGroups(this.groups)

  constructor() {
    this.values = this.getDefaultSettings()
  }

  getDefaultSettings(): SettingValues {
    return Object.fromEntries(Object.entries(this.data).map(([key, dataEntry]) => [key, dataEntry.default]))
  }

  transformSettingGroups(groups: GroupedSettingData[]): GroupedSettingDataTransformed[] {
    return groups.map((entry) => ({
      key: entry.key,
      title: entry.title,
      values: entry.values.map((key) => ({
        key: key,
        value: this.data[key]
      }))
    }))
  }
}
