import { Component, computed, input, OnChanges, Signal } from '@angular/core'
import { ProcessedPost } from '../../interfaces/processed-post'
import { MessageService } from '../../services/message.service'

import {
  faArrowUpRightFromSquare,
  faChevronDown,
  faHeart,
  faHeartBroken,
  faShareNodes,
  faTrash,
  faTriangleExclamation,
  faPen,
  faBellSlash,
  faBell,
  faReply,
  faRepeat,
  faQuoteLeft,
  faGlobe,
  faClose,
  faBookmark,
  faBookBookmark,
  faCommentSlash,
  faLink,
  faPaperPlane,
  faUserSlash,
  faVolumeMute
} from '@fortawesome/free-solid-svg-icons'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { LoginService } from '../../services/login.service'

import { ReportService } from '../../services/report.service'
import { DeletePostService } from '../../services/delete-post.service'
import { PostsService } from '../../services/posts.service'
import { UtilsService } from '../../services/utils.service'
import { EnvironmentService } from '../../services/environment.service'
import { firstValueFrom } from 'rxjs'
import { faBluesky } from '@fortawesome/free-brands-svg-icons'
import { TranslateModule } from '@ngx-translate/core'
import { SettingsService } from 'src/app/services/settings.service'
import { PostActionButtonsComponent } from '../post-action-buttons/post-action-buttons.component'
import { SimpleDialogService } from 'src/app/services/simple-dialog.service'

@Component({
  selector: 'app-post-actions',
  imports: [PostActionButtonsComponent, MatButtonModule, MatMenuModule, FontAwesomeModule, TranslateModule],
  templateUrl: './post-actions.component.html',
  styleUrl: './post-actions.component.scss'
})
export class PostActionsComponent implements OnChanges {
  post = input.required<ProcessedPost>()
  loggedIn: Signal<boolean>
  myId: string = 'user-00000000-0000-0000-0000-000000000000 '
  postSilenced = false
  myRewootsIncludePost = false
  bookmarked = computed(() => this.post().bookmarkers.includes(this.myId))

  bskyUrl = computed<string>(() => {
    this.settingsService.settingsModified() // evil fix to update correctly
    const bskyUri = this.post().bskyUri
    if (!bskyUri) return ''
    const parts = bskyUri.split('/app.bsky.feed.post/')
    const userDid = parts[0].split('at://')[1]
    return `https://${this.settingsService.values.atprotoLinkDestination}/profile/${userDid}/post/${parts[1]}`
  })
  externalUrl = computed<string>(() => (this.post().bskyUri ? this.bskyUrl() : this.post().remotePostId))

  // icons
  shareIcon = faLink
  shareMenuIcon = faShareNodes
  expandDownIcon = faChevronDown
  solidHeartIcon = faHeart
  clearHeartIcon = faHeartBroken
  reblogIcon = faReply
  quickReblogIcon = faRepeat
  shareExternalIcon = faArrowUpRightFromSquare
  bskyIcon = faBluesky
  goExternalPost = faGlobe
  reportIcon = faTriangleExclamation
  deleteIcon = faTrash
  closeIcon = faClose
  editedIcon = faPen
  silenceIcon = faBellSlash
  silenceReplyIcon = faCommentSlash
  unsilenceIcon = faBell
  quoteIcon = faQuoteLeft
  bookmarkIcon = faBookmark
  unbookmarkIcon = faBookBookmark
  refederateIcon = faPaperPlane
  muteIcon = faVolumeMute
  blockIcon = faUserSlash

  constructor(
    private messages: MessageService,
    private postService: PostsService,
    loginService: LoginService,
    private reportService: ReportService,
    private deletePostService: DeletePostService,
    private utilsService: UtilsService,
    private settingsService: SettingsService,
    private simpleDialog: SimpleDialogService
  ) {
    this.loggedIn = loginService.loggedIn
    if (this.loggedIn()) {
      this.myId = loginService.getLoggedUserUUID()
    }
  }

  ngOnChanges(): void {
    this.myRewootsIncludePost = this.postService.rewootedPosts.includes(this.post().id)
    this.checkPostSilenced()
  }

  sharePost() {
    navigator.clipboard.writeText(`${EnvironmentService.environment.frontUrl}/fediverse/post/${this.post().id}`)
    this.messages.add({
      severity: 'success',
      summary: 'The woot URL was copied to your clipboard!'
    })
  }

  shareOriginalPost() {
    navigator.clipboard.writeText(this.externalUrl())
    this.messages.add({
      severity: 'success',
      summary: 'The woot original URL was copied to your clipboard!'
    })
  }

  async silencePost(superMute: boolean = false) {
    const confirm = await this.simpleDialog.createConfirmDialog({
      title: !superMute ? 'dialog.post-header.silenceInteractionsTitle' : 'dialog.post-header.silenceReplyTitle',
      content: !superMute
        ? 'dialog.post-header.silenceInteractionsDescription'
        : 'dialog.post-header.silenceReplyDescription'
    })

    if (!confirm) return

    if (await this.postService.silencePost(this.post().id, superMute)) {
      this.messages.add({
        severity: 'success',
        summary: 'You successfully silenced the notifications for this woot'
      })
      await this.checkPostSilenced()
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
  }

  async deleteRewoots() {
    const success = await firstValueFrom(this.deletePostService.deleteRewoots(this.post().id))
    if (success) {
      this.myRewootsIncludePost = false
      this.messages.add({
        severity: 'success',
        summary: 'You successfully deleted your rewoot'
      })
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong! Check your internet connectivity and try again'
      })
    }
  }

  async unsilencePost() {
    if (await this.postService.unsilencePost(this.post().id)) {
      this.messages.add({
        severity: 'success',
        summary: 'You successfully reactivated the notifications for this woot'
      })
      await this.checkPostSilenced()
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
  }

  private async checkPostSilenced() {
    this.postSilenced = (await this.utilsService.getSilencedPostIds()).includes(this.post().id)
  }

  async forceRefederate() {
    await this.postService.forceRefederate(this.post().id)
  }

  // Dangerous options
  async muteAccount() {
    const confirm = await this.simpleDialog.createConfirmDialog({
      title: 'dialog.post-header.muteAccountTitle',
      content: 'dialog.post-header.muteAccountDescription'
    })

    if (!confirm) return

    console.log('Muted')
  }

  async blockAccount() {
    const confirm = await this.simpleDialog.createConfirmDialog({
      title: 'dialog.post-header.blockAccountTitle',
      content: 'dialog.post-header.blockAccountDescription'
    })

    if (!confirm) return

    console.log('Blocked')
  }

  reportPost() {
    this.reportService.openReportPostDialog(this.post())
  }
}
