import { Injectable, signal } from '@angular/core'
import { DashboardService } from './dashboard.service'
import { JwtService } from './jwt.service'
import {
  faBan,
  faEllipsis,
  faKey,
  faPaintbrush,
  faSliders,
  faUser,
  faUserSecret,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons'
import { UtilsService } from './utils.service'
import { HttpClient } from '@angular/common/http'
import { EnvironmentService } from './environment.service'
import { catchError, lastValueFrom, of, timeout } from 'rxjs'
import { PostsService } from './posts.service'
import { MessageService } from './message.service'
import { LoginService } from './login.service'
import { SettingsProfileComponent } from '../pages/settings/settings-profile/settings-profile.component'

// All setting keys for use throughout the app
const settingKeyVariants = [
  // required parts of the user profile
  'name',
  'description',
  'manuallyAcceptsFollows',
  'hideFollows',
  'hideProfileNotLoggedIn',
  'disableEmailNotifications',
  // everything else - stored in the options table
  'forceClassicLogo',
  'forceClassicVideoPlayer',
  'forceClassicAudioPlayer',
  'forceClassicMediaView',
  'disableConfetti',
  'enableConfettiReceivingLike', // misspelled key
  'disableSounds',
  'disableCW',
  'hideNoDescriptionMedia',
  'expandQuotes',
  'disableForceAltText',
  'disableNSFWFilter',
  'automaticallyExpandPosts', // misspelled key
  'defaultPostEditorPrivacy',
  'enableAsks',
  'enableAnonymousAsks',
  'displayMentionsOfBlockedUsersFromOtherUsers', // lmao
  'mutedWords',
  'superMutedWords',
  'hideQuotes',
  'replaceAIWithCocaine',
  'replaceAIWord'
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
  translationDescriptionKey?: string
  serverKey?: string
  localStorageKey?: string
  profileOption?: boolean // Whether it is stored on the User server side. Leave unset if you don't know
  type: SettingFormTypes
  default: SettingValueType
  variants?: Record<string, string> // For type 'select'
  convertFromStorage?: (stored: string) => SettingValueType
  convertToStorage?: (value: SettingValueType) => string
}

// Data on each setting to generate form controls
export type SettingData = Record<SettingKey, SettingDataEntry>
export type SettingRenderList =
  | { type: 'separator' }
  | { type: 'key'; value: SettingKey }
  | { type: 'header'; value: string }
  | { type: 'description'; value: string }

export type GroupedSettingData = ComponentSettingData | GenericSettingData
export type ComponentSettingData = {
  key: string // From router
  icon?: IconDefinition
  title: string
  type: 'component'
  component: unknown
}
export type GenericSettingData = {
  key: string // From router
  icon?: IconDefinition
  title: string
  type: 'generic'
  values: SettingRenderList[] // For setting-loader to auto-display. Use an empty list for custom pages
}

// Values to store user data
export type SettingValues = {
  [key in SettingKey]?: SettingValueType
}

export type FediAttachment = {
  name: string
  value: string
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public data: SettingData = {
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
      translationDescriptionKey: 'settings.hideProfileNotLoggedInDescription',
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
    forceClassicLogo: {
      key: 'forceClassicLogo',
      translationKey: 'settings.forceClassicLogo',
      serverKey: 'wafrn.forceClassicLogo',
      localStorageKey: 'forceClassicLogo',
      type: 'checkbox',
      default: false
    },
    forceClassicVideoPlayer: {
      key: 'forceClassicVideoPlayer',
      translationKey: 'settings.forceClassicVideoPlayer',
      serverKey: 'wafrn.forceClassicVideoPlayer',
      localStorageKey: 'forceClassicVideoPlayer',
      type: 'checkbox',
      default: false
    },
    forceClassicAudioPlayer: {
      key: 'forceClassicAudioPlayer',
      translationKey: 'settings.forceClassicAudioPlayer',
      serverKey: 'wafrn.forceClassicAudioPlayer',
      localStorageKey: 'forceClassicAudioPlayer',
      type: 'checkbox',
      default: false
    },
    forceClassicMediaView: {
      key: 'forceClassicMediaView',
      translationKey: 'settings.forceClassicMediaView',
      serverKey: 'wafrn.forceClassicMediaView',
      localStorageKey: 'forceClassicMediaView',
      type: 'checkbox',
      default: false
    },
    disableConfetti: {
      key: 'disableConfetti',
      translationKey: 'settings.disableConfetti',
      translationDescriptionKey: 'settings.disableConfettiDescription',
      serverKey: 'wafrn.disableConfetti',
      localStorageKey: 'disableConfetti',
      type: 'checkbox',
      default: false
    },
    enableConfettiReceivingLike: {
      key: 'enableConfettiReceivingLike',
      translationKey: 'settings.enableConfettiReceivingLike',
      serverKey: 'wafrn.enableConfettiRecivingLike', // legacy misspelling
      localStorageKey: 'enableConfettiRecivingLike',
      type: 'checkbox',
      default: false
    },
    disableSounds: {
      key: 'disableSounds',
      translationKey: 'settings.disableSounds',
      translationDescriptionKey: 'settings.disableSoundsDescription',
      serverKey: 'wafrn.disableSounds',
      localStorageKey: 'disableSounds',
      type: 'checkbox',
      default: false
    },
    disableCW: {
      key: 'disableCW',
      translationKey: 'settings.disableCW',
      serverKey: 'wafrn.disableCW',
      localStorageKey: 'disableCW',
      type: 'checkbox',
      default: false
    },
    hideNoDescriptionMedia: {
      key: 'hideNoDescriptionMedia',
      translationKey: 'settings.hideNoDescriptionMedia',
      serverKey: 'wafrn.hideNoDescriptionMedia',
      localStorageKey: 'hideNoDescriptionMedia',
      type: 'checkbox',
      default: false
    },
    expandQuotes: {
      key: 'expandQuotes',
      translationKey: 'settings.expandQuotes',
      serverKey: 'wafrn.expandQuotes',
      localStorageKey: 'expandQuotes',
      type: 'checkbox',
      default: false
    },
    disableForceAltText: {
      key: 'disableForceAltText',
      translationKey: 'settings.disableForceAltText',
      translationDescriptionKey: 'settings.disableForceAltTextDescription',
      serverKey: 'wafrn.disableForceAltText',
      localStorageKey: 'disableForceAltText',
      type: 'checkbox',
      default: false
    },
    disableNSFWFilter: {
      key: 'disableNSFWFilter',
      translationKey: 'settings.disableNSFWFilter',
      serverKey: 'wafrn.disableNSFWFilter',
      localStorageKey: 'disableNSFWFilter',
      type: 'checkbox',
      default: false
    },
    automaticallyExpandPosts: {
      key: 'automaticallyExpandPosts',
      translationKey: 'settings.automaticallyExpandPosts',
      serverKey: 'wafrn.automaticalyExpandPosts', // legacy misspelling
      localStorageKey: 'automaticalyExpandPosts',
      type: 'checkbox',
      default: false
    },
    defaultPostEditorPrivacy: {
      key: 'defaultPostEditorPrivacy',
      translationKey: 'settings.defaultPostEditorPrivacy',
      serverKey: 'wafrn.defaultPostEditorPrivacy',
      localStorageKey: 'defaultPostEditorPrivacy',
      type: 'select',
      default: '0',
      variants: {
        '0': 'settings.postEditorPrivacyOptions.public',
        '1': 'settings.postEditorPrivacyOptions.followersOnly',
        '2': 'settings.postEditorPrivacyOptions.instanceOnly',
        '3': 'settings.postEditorPrivacyOptions.unlisted'
      }
    },
    enableAsks: {
      key: 'enableAsks',
      translationKey: 'settings.enableAsks',
      serverKey: 'wafrn.public.asks',
      localStorageKey: 'public.asks',
      type: 'checkbox',
      default: true,
      convertFromStorage: (val) => val === '1' || val === '2',
      convertToStorage: () => this.convertAsksTo()
    },
    enableAnonymousAsks: {
      key: 'enableAnonymousAsks',
      translationKey: 'settings.enableAnonymousAsks',
      localStorageKey: 'public.asks',
      type: 'checkbox',
      default: false,
      convertFromStorage: (val) => val === '2'
    },
    displayMentionsOfBlockedUsersFromOtherUsers: {
      key: 'displayMentionsOfBlockedUsersFromOtherUsers',
      translationKey: 'settings.displayMentionsOfBlockedUsersFromOtherUsers',
      serverKey: 'wafrn.displayMentionsOfBlockedUsersFromOtherUsers',
      localStorageKey: 'displayMentionsOfBlockedUsersFromOtherUsers',
      type: 'checkbox',
      default: false
    },
    mutedWords: {
      key: 'mutedWords',
      translationKey: 'settings.mutedWords',
      translationDescriptionKey: 'settings.mutedWordsDescription',
      serverKey: 'wafrn.mutedWords',
      localStorageKey: 'mutedWords',
      type: 'textarea',
      default: '""',
      convertFromStorage: this.convertListFrom,
      convertToStorage: this.convertListTo
    },
    superMutedWords: {
      key: 'superMutedWords',
      translationKey: 'settings.superMutedWords',
      translationDescriptionKey: 'settings.superMutedWordsDescription',
      serverKey: 'wafrn.superMutedWords',
      localStorageKey: 'superMutedWords',
      type: 'textarea',
      default: '""',
      convertFromStorage: this.convertListFrom,
      convertToStorage: this.convertListTo
    },
    hideQuotes: {
      key: 'hideQuotes',
      translationKey: 'settings.hideQuotes',
      serverKey: 'wafrn.hideQuotes',
      localStorageKey: 'hideQuotes',
      type: 'select',
      default: '1',
      variants: {
        '1': 'settings.hideQuotesOptions.cwDisabledQuotesUsers',
        '2': 'settings.hideQuotesOptions.cwUnfollowedOrDisabledQuotesUsers',
        '3': 'settings.hideQuotesOptions.hidePostsDisabledQuotesUsers'
      }
    },
    replaceAIWithCocaine: {
      key: 'replaceAIWithCocaine',
      translationKey: 'settings.replaceAIWithCocaine',
      serverKey: 'wafrn.replaceAIWithCocaine',
      localStorageKey: 'replaceAIWithCocaine',
      type: 'checkbox',
      default: false
    },
    replaceAIWord: {
      key: 'replaceAIWord',
      translationKey: 'settings.replaceAIWord',
      serverKey: 'wafrn.replaceAIWord',
      localStorageKey: 'replaceAIWord',
      type: 'input',
      default: '"cocaine"',
      convertFromStorage: this.convertStringFrom,
      convertToStorage: this.convertStringTo
    }
  }
  // Generates settings sidebar links and gives the settings-loader pages their data through values
  // For manual pages like Profile, values can be skipped.
  public groups: GroupedSettingData[] = [
    {
      key: 'profile',
      icon: faUser,
      title: 'settings.sidebar.profile',
      type: 'component',
      component: SettingsProfileComponent
    },
    {
      key: 'account',
      icon: faKey,
      title: 'settings.sidebar.account',
      type: 'generic',
      values: [
        { type: 'description', value: 'CHANGE EMAIL FIELD HERE' },
        { type: 'key', value: 'disableEmailNotifications' },
        { type: 'description', value: 'CHANGE PASSWORD FIELD HERE' },
        { type: 'description', value: '2FA FIELD HERE' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.integrations' },
        { type: 'description', value: 'ENABLE BLUESKY FIELD HERE' },
        { type: 'description', value: 'RSS MICROFRONT FIELD HERE' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.migration' },
        { type: 'description', value: 'MIGRATE FROM AN OLD ACCOUNT FIELD HERE' },
        { type: 'description', value: 'IMPORT FOLLOWERS FIELD HERE' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.deleteAccount' },
        { type: 'description', value: 'DELETE ACCOUNT BUTTON HERE' }
      ]
    },
    {
      key: 'appearance',
      icon: faPaintbrush,
      title: 'settings.sidebar.appearance',
      type: 'generic',
      values: [
        { type: 'description', value: 'THEME FIELD HERE' },
        { type: 'description', value: 'COLOR SCHEME FIELD HERE' },
        { type: 'description', value: 'ADDITIONAL STYLE MODES FIELD HERE' },
        { type: 'description', value: 'LANGUAGE HERE' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.classicOptions' },
        { type: 'key', value: 'forceClassicLogo' },
        { type: 'key', value: 'forceClassicVideoPlayer' },
        { type: 'key', value: 'forceClassicAudioPlayer' },
        { type: 'key', value: 'forceClassicMediaView' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.animationsAndSounds' },
        { type: 'key', value: 'disableConfetti' },
        { type: 'key', value: 'enableConfettiReceivingLike' },
        { type: 'key', value: 'disableSounds' }
      ]
    },
    {
      key: 'behavior',
      icon: faSliders,
      title: 'settings.sidebar.behavior',
      type: 'generic',
      values: [
        { type: 'description', value: 'DEFAULT DASHBOARD FIELD HERE' },
        { type: 'key', value: 'automaticallyExpandPosts' },
        { type: 'key', value: 'expandQuotes' },
        { type: 'key', value: 'disableCW' },
        { type: 'key', value: 'disableNSFWFilter' },
        { type: 'key', value: 'hideNoDescriptionMedia' },
        { type: 'key', value: 'disableForceAltText' }
      ]
    },
    {
      key: 'privacy',
      icon: faUserSecret,
      title: 'settings.sidebar.privacy',
      type: 'generic',
      values: [
        { type: 'key', value: 'manuallyAcceptsFollows' },
        { type: 'key', value: 'enableAsks' },
        { type: 'key', value: 'enableAnonymousAsks' },
        { type: 'key', value: 'hideProfileNotLoggedIn' },
        { type: 'key', value: 'hideFollows' },
        { type: 'key', value: 'displayMentionsOfBlockedUsersFromOtherUsers' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.editor' },
        { type: 'key', value: 'defaultPostEditorPrivacy' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.followers' },
        { type: 'description', value: 'MANAGE FOLLOWERS MENU BUTTON' }
      ]
    },
    {
      key: 'mutesAndBlocks',
      icon: faBan,
      title: 'settings.sidebar.mutesAndBlocks',
      type: 'generic',
      values: [
        { type: 'header', value: 'settings.header.mutedBlockedWords' },
        { type: 'key', value: 'mutedWords' },
        { type: 'key', value: 'superMutedWords' },
        { type: 'separator' },
        { type: 'header', value: 'settings.header.mutedBlockedUsers' },
        { type: 'description', value: 'MUTED USERS HERE' },
        { type: 'description', value: 'BLOCKED USERS HERE' },
        { type: 'separator' },
        { type: 'description', value: 'MUTED POSTS HERE' },
        { type: 'description', value: 'BLOCKED SERVERS HERE' },
        { type: 'key', value: 'hideQuotes' }
      ]
    },
    {
      key: 'miscellaneous',
      icon: faEllipsis,
      title: 'settings.sidebar.miscellaneous',
      type: 'generic',
      values: [
        { type: 'description', value: 'EMOJI LIST HERE' },
        { type: 'key', value: 'replaceAIWithCocaine' },
        { type: 'key', value: 'replaceAIWord' },
        { type: 'description', value: 'CRASH BUTTON HERE' },
        { type: 'description', value: 'DOOM LINK HERE' }
      ]
    }
  ]
  public values: SettingValues

  public fediAttachments: FediAttachment[] = [{ name: '', value: '' }] // Only shown before load completes
  public avatar: File | undefined // Only set when updating
  public headerImage: File | undefined // Only set when updating

  public settingsModified = signal(false)
  public settingsLoading = signal(false)

  constructor(
    private dashboardService: DashboardService,
    private loginService: LoginService,
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
        this.values.name = blogDetails.name
        this.values.description = blogDetails.descriptionMarkdown

        const rawAttachments = blogDetails.publicOptions?.find(
          (elem) => elem.optionName === 'fediverse.public.attachment'
        )
        if (rawAttachments) {
          try {
            this.fediAttachments.length = 0
            this.fediAttachments.push(...JSON.parse(rawAttachments.optionValue))
          } catch (error) {}

          if (this.fediAttachments.length === 0) {
            this.fediAttachments.push({ name: '', value: '' })
          }
        }
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
        if (dataEntry.convertFromStorage) {
          storedValues[key as keyof SettingValues] = dataEntry.convertFromStorage(retrievedValue)
        } else if (inputType === 'checkbox') {
          storedValues[key as keyof SettingValues] = retrievedValue === 'true'
        } else {
          storedValues[key as keyof SettingValues] = JSON.parse(retrievedValue).toString()
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
    // Map the non-required options into a specific key of the payload
    const options: { name: string; value: string }[] = Object.entries(this.data)
      .filter(([_key, entry]) => entry.profileOption !== true && entry.serverKey !== undefined)
      .map(([_key, entry]) => {
        const rawValue = this.values[entry.key] ?? ''
        let convertedValue: string = ''
        if (entry.convertToStorage) {
          convertedValue = entry.convertToStorage(rawValue)
        } else {
          convertedValue = this.values[entry.key]!.toString()
        }

        return { name: entry.serverKey!, value: convertedValue }
      })

    // Add Fediverse attachments
    // Ignore attachment if it doesn't have both fields
    options.push({
      name: 'fediverse.public.attachment',
      value: JSON.stringify(this.fediAttachments.filter((attachment) => attachment.name && attachment.value))
    })

    const payload = {
      avatar: this.avatar,
      headerImage: this.headerImage,
      name: this.values.name,
      description: this.values.description,
      manuallyAcceptsFollows: this.values.manuallyAcceptsFollows,
      hideFollows: this.values.hideFollows,
      hideProfileNotLoggedIn: this.values.hideProfileNotLoggedIn,
      disableEmailNotifications: this.values.disableEmailNotifications,
      options: JSON.stringify(options)
    }

    const formData = this.utils.objectToFormData(payload)

    const res = await lastValueFrom(
      this.http.post<{ success: boolean }>(`${EnvironmentService.environment.baseUrl}/editProfile`, formData).pipe(
        timeout(60000), // If it doesn't return in a full minute you've got problems
        catchError((_err) => of({ success: false }))
      )
    )
    if (res.success) {
      await this.postsService.loadFollowers()
      await this.updateMultipleAccountData()
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

  async updateMultipleAccountData() {
    // Update multiple account saved data
    const currentBlog = this.loginService.currentAccount()
    if (currentBlog) {
      const newBlog = await this.dashboardService.getBlogDetails(currentBlog.url)
      this.loginService.accountList.update((list) => {
        list[0].blog = newBlog
        return [...list]
      })
      localStorage.setItem('accountList', JSON.stringify(this.loginService.accountList()))
    }
  }

  // Various conversions for annoying edge cases
  convertStringFrom(list: string): string {
    try {
      return JSON.parse(list)
    } catch (error) {
      return ''
    }
  }
  convertStringTo(list: SettingValueType): string {
    return `"${list}"`
  }

  convertListFrom(list: string): string {
    try {
      return JSON.parse(list).replaceAll(',', '\n')
    } catch (error) {
      return ''
    }
  }
  convertListTo(list: SettingValueType): string {
    if (typeof list !== 'string') return ''
    return `"${list.replaceAll('\n', ',')}"`
  }

  convertAsksTo(): string {
    if (this.values.enableAsks && this.values.enableAnonymousAsks) {
      return '1'
    } else if (this.values.enableAsks) {
      return '2'
    } else {
      return '3'
    }
  }
}
