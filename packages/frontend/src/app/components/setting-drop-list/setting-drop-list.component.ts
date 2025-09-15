import { Component, Inject } from '@angular/core'
import { SETTINGS_TOKEN } from 'src/app/pages/settings/settings.component'
import { SettingData, SettingKey, SettingListItem, SettingsService } from 'src/app/services/settings.service'
import { replyBarItems } from '../bottom-reply-bar/bottom-reply-bar.component'
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop'
import { TranslatePipe } from '@ngx-translate/core'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import {
  faBars,
  faBookmark,
  faHeart,
  faPen,
  faQuoteLeft,
  faRepeat,
  faReply,
  faRotateRight,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { MatButtonModule } from '@angular/material/button'

type DropListDataEntryKeyData = { icon: IconDefinition; translationKey: string }
type DropListDataEntry = {
  list: string[]
  data: Record<string, DropListDataEntryKeyData>
}

@Component({
  selector: 'app-setting-drop-list',
  templateUrl: './setting-drop-list.component.html',
  imports: [CdkDropList, CdkDrag, CdkDragHandle, MatCheckboxModule, MatButtonModule, FontAwesomeModule, TranslatePipe],
  styleUrl: './setting-drop-list.component.scss'
})
export class SettingDropListComponent {
  data: SettingData
  settingKey: SettingKey
  itemList: SettingListItem[]
  defaultOrder: SettingListItem[]

  dropListData: Record<any, DropListDataEntry> = {
    postReplyBarOrder: {
      list: [...replyBarItems],
      data: {
        quote: { icon: faQuoteLeft, translationKey: 'settings.postReplyBarOrderOptions.quote' },
        rewoot: { icon: faRepeat, translationKey: 'settings.postReplyBarOrderOptions.rewoot' },
        reply: { icon: faReply, translationKey: 'settings.postReplyBarOrderOptions.reply' },
        bookmark: { icon: faBookmark, translationKey: 'settings.postReplyBarOrderOptions.bookmark' },
        like: { icon: faHeart, translationKey: 'settings.postReplyBarOrderOptions.like' },
        edit: { icon: faPen, translationKey: 'settings.postReplyBarOrderOptions.edit' },
        delete: { icon: faTrash, translationKey: 'settings.postReplyBarOrderOptions.delete' }
      }
    }
  }
  dropListDataEntry // The active entry from the data above

  barsIcon = faBars
  defaultIcon = faRotateRight

  constructor(
    private settingsService: SettingsService,
    @Inject(SETTINGS_TOKEN) data: { settingKey: SettingKey }
  ) {
    this.data = settingsService.data
    this.settingKey = data.settingKey
    this.dropListDataEntry = this.dropListData[this.settingKey as keyof typeof this.dropListData]

    this.defaultOrder = this.dropListDataEntry.list.map((item) => ({
      value: item,
      enabled: true
    }))
    this.itemList = settingsService.values[this.settingKey] as SettingListItem[]

    // Reset if no value or new values
    if (this.itemList.length === 0 || this.itemList.length !== this.defaultOrder.length) {
      this.resetList()
    }
  }

  dropItem(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.itemList, event.previousIndex, event.currentIndex)
    this.syncList()
  }
  toggleItem(index: number) {
    this.itemList[index].enabled = !this.itemList[index].enabled
    this.syncList()
  }

  resetList() {
    this.itemList = JSON.parse(JSON.stringify(this.defaultOrder))
  }

  syncList() {
    this.itemList = [...this.itemList] // update DOM hack
    this.settingsService.values.postReplyBarOrder = this.itemList
    this.settingsService.settingsModified.set(true)
  }

  keyToEntry(key: string): DropListDataEntryKeyData | undefined {
    return this.dropListDataEntry.data[key]
  }

  listAsString(list: SettingListItem[]): string {
    return list.map((item) => `${item.value}: ${item.enabled ? 'true' : 'false'}`).join(', ')
  }
}
