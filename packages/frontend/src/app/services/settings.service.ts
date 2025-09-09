import { Injectable, signal } from '@angular/core'
import { DashboardService } from './dashboard.service'
import { JwtService } from './jwt.service'
import { faBarcode, faCake, faUser, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { UtilsService } from './utils.service'
import { HttpClient } from '@angular/common/http'
import { EnvironmentService } from './environment.service'
import { catchError, lastValueFrom, of, timeout } from 'rxjs'
import { PostsService } from './posts.service'
import { MessageService } from './message.service'

// All setting keys for use throughout the app
const settingKeyVariants = [
  // images
  'avatar',
  'headerImage',
  // required parts of the user profile
  'name',
  'description',
  'manuallyAcceptsFollows',
  'hideFollows',
  'hideProfileNotLoggedIn',
  'disableEmailNotifications',
  // everything else - stored in the options table
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
  profileOption?: boolean // Whether it is stored on the User server side. Leave unset if you don't know
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
      profileOption: true,
      type: 'input',
      default: '' // TODO: set as file
    },
    headerImage: {
      key: 'headerImage',
      translationKey: 'settings.headerImage',
      serverKey: 'headerImage',
      profileOption: true,
      type: 'input',
      default: '' // TODO: set as file
    },
    name: {
      key: 'name',
      translationKey: 'settings.name',
      serverKey: 'name',
      profileOption: true,
      type: 'input',
      default: ''
    },
    description: {
      key: 'description',
      translationKey: 'settings.description',
      serverKey: 'description',
      profileOption: true,
      type: 'textarea',
      default: ''
    },
    manuallyAcceptsFollows: {
      key: 'manuallyAcceptsFollows',
      translationKey: 'settings.manuallyAcceptsFollows',
      serverKey: 'manuallyAcceptsFollows',
      profileOption: true,
      type: 'checkbox',
      default: false
    },
    hideFollows: {
      key: 'hideFollows',
      translationKey: 'settings.hideFollows',
      serverKey: 'hideFollows',
      profileOption: true,
      type: 'checkbox',
      default: false
    },
    hideProfileNotLoggedIn: {
      key: 'hideProfileNotLoggedIn',
      translationKey: 'settings.hideProfileNotLoggedIn',
      serverKey: 'hideProfileNotLoggedIn',
      profileOption: true,
      type: 'checkbox',
      default: false
    },
    disableEmailNotifications: {
      key: 'disableEmailNotifications',
      translationKey: 'settings.disableEmailNotifications',
      serverKey: 'disableEmailNotifications',
      profileOption: true,
      type: 'checkbox',
      default: false
    },
    // For new options, add below here.
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
  // Generates settings sidebar links and gives the settings-loader pages their data through values
  // For manual pages like Profile, values can be skipped.
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

  public settingsModified = signal(false)
  public settingsLoading = signal(false)

  constructor(
    private dashboardService: DashboardService,
    private postsService: PostsService,
    private messages: MessageService,
    private http: HttpClient,
    private utils: UtilsService,
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
  }

  private getLocalStorageValues(): SettingValues {
    const storedValues: SettingValues = {}

    const dataEntries = Object.entries(this.data)
    dataEntries.forEach(([key, dataEntry]) => {
      if (!dataEntry.localStorageKey) return

      const retrievedValue = localStorage.getItem(dataEntry.localStorageKey)
      if (retrievedValue) {
        const inputType = this.data[key as keyof SettingValues].type
        if (inputType === 'checkbox') {
          storedValues[key as keyof SettingValues] = retrievedValue === 'true'
        } else {
          storedValues[key as keyof SettingValues] = retrievedValue
        }
      }
    })

    return storedValues
  }

  private getDefaultSettings(): SettingValues {
    return Object.fromEntries(Object.entries(this.data).map(([key, dataEntry]) => [key, dataEntry.default]))
  }

  public async saveSettings() {
    this.settingsLoading.set(true)

    this.settingsModified.set(false)
    const success = await this.updateProfile()
    if (!success) {
      this.settingsModified.set(true)
    }

    this.settingsLoading.set(false)
  }

  async updateProfile(): Promise<boolean> {
    const options: { name: string; value: string }[] = Object.entries(this.data)
      .filter(([_key, entry]) => entry.profileOption !== true && entry.serverKey !== undefined)
      .map(([_key, entry]) => ({ name: entry.serverKey!, value: this.values[entry.key]!.toString() }))
    const payload = {
      avatar: undefined,
      headerImage: undefined,
      name: this.values.name,
      description: this.values.description,
      manuallyAcceptsFollows: this.values.manuallyAcceptsFollows,
      hideFollows: this.values.hideFollows,
      hideProfileNotLoggedIn: this.values.hideProfileNotLoggedIn,
      disableEmailNotifications: this.values.disableEmailNotifications,
      options: JSON.stringify(options)
    }
    console.log(payload)
    const formData = this.utils.objectToFormData(payload)

    const res = await lastValueFrom(
      this.http.post<{ success: boolean }>(`${EnvironmentService.environment.baseUrl}/editProfile`, formData).pipe(
        timeout(60000), // If it doesn't return in a full minute you've got problems
        catchError((_err) => of({ success: false }))
      )
    )
    if (res.success) {
      await this.postsService.loadFollowers()
      this.messages.add({
        severity: 'success',
        summary: 'Your profile was updated!'
      })
      return true
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong'
      })
      return false
    }
  }
}
