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
  faCommentSlash
} from '@fortawesome/free-solid-svg-icons'
import { MatButtonModule } from '@angular/material/button'
import { MatMenuModule } from '@angular/material/menu'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { EditorService } from '../../services/editor.service'
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

@Component({
  selector: 'app-post-actions',
  imports: [MatButtonModule, MatMenuModule, FontAwesomeModule, TranslateModule],
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
  shareIcon = faShareNodes
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
  globeIcon = faGlobe

  constructor(
    private messages: MessageService,
    private editor: EditorService,
    private postService: PostsService,
    loginService: LoginService,
    private reportService: ReportService,
    private deletePostService: DeletePostService,
    private utilsService: UtilsService,
    private settingsService: SettingsService
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

  async quickReblog() {
    if (this.post()?.privacy !== 10) {
      const response = await this.editor.createPost({
        mentionedUsers: [],
        content: '',
        idPostToReblog: this.post().id,
        privacy: 0,
        media: []
      })
      if (response) {
        const disableConfetti = localStorage.getItem('disableConfetti') == 'true'
        this.myRewootsIncludePost = true
        this.messages.add({
          severity: 'success',
          summary: 'You rewooted the woot!',
          confettiEmojis: disableConfetti ? [] : ['🔁'],
          soundName: 'sendWoot'
        })
      }
    } else {
      this.messages.add({
        severity: 'warn',
        summary: 'Sorry, this woot is not rebloggeable as requested by the user'
      })
    }
  }

  replyPost() {
    this.editor.replyPost(this.post())
  }
  quoteWoot() {
    this.editor.quotePost(this.post())
  }
  async unlikePost() {
    if (await this.postService.unlikePost(this.post().id)) {
      this.post().userLikesPostRelations = this.post().userLikesPostRelations.filter((elem) => elem != this.myId)
      this.messages.add({
        severity: 'success',
        summary: 'You successfully unliked this woot'
      })
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
  }
  async likePost() {
    if (await this.postService.likePost(this.post().id)) {
      this.post().userLikesPostRelations.push(this.myId)
      const disableConfetti = localStorage.getItem('disableConfetti') == 'true'
      this.messages.add({
        severity: 'success',
        summary: 'You successfully liked this woot',
        confettiEmojis: disableConfetti ? [] : ['❤️', '💚', '💙'],
        soundName: 'like'
      })
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
  }
  async unbookmarkPost() {
    if (await this.postService.unbookmarkPost(this.post().id)) {
      this.post().bookmarkers = this.post().bookmarkers.filter((elem) => elem != this.myId)
      this.messages.add({
        severity: 'success',
        summary: 'You successfully unbookmarked this woot'
      })
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
  }
  async bookmarkPost() {
    if (await this.postService.bookmarkPost(this.post().id)) {
      this.post().bookmarkers.push(this.myId)
      const disableConfetti = localStorage.getItem('disableConfetti') == 'true'
      this.messages.add({
        severity: 'success',
        summary: 'You successfully bookmarked this woot',
        confettiEmojis: disableConfetti ? [] : ['💾']
      })
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
  }
  reportPost() {
    this.reportService.openReportPostDialog(this.post())
  }
  editPost() {
    this.editor.replyPost(this.post(), true)
  }
  deletePost() {
    this.deletePostService.openDeletePostDialog(this.post().id)
  }
  async silencePost(superMute: boolean = false) {
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
}
