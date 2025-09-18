import { Component, input, OnChanges, Signal, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule } from '@angular/router'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import {
  faShareNodes,
  faChevronDown,
  faHeart,
  faHeartBroken,
  faReply,
  faRepeat,
  faQuoteLeft,
  faArrowUpRightFromSquare,
  faTrash,
  faClose,
  faGlobe,
  faUnlock,
  faEnvelope,
  faServer,
  faUser,
  faPen,
  faCheck,
  faBookmark,
  faBookBookmark
} from '@fortawesome/free-solid-svg-icons'
import { firstValueFrom } from 'rxjs'
import { PostLinkModule } from 'src/app/directives/post-link/post-link.module'
import { ProcessedPost } from 'src/app/interfaces/processed-post'
import { DeletePostService } from 'src/app/services/delete-post.service'
import { EditorService } from 'src/app/services/editor.service'
import { LoginService } from 'src/app/services/login.service'
import { MessageService } from 'src/app/services/message.service'
import { PostsService } from 'src/app/services/posts.service'
import { SettingKey, SettingListItem, SettingsService } from 'src/app/services/settings.service'

export const replyBarItems = ['quote', 'rewoot', 'reply', 'bookmark', 'like', 'edit', 'delete'] as const
export type replyBarItemsVariants = typeof replyBarItems
export type ReplyBarItem = replyBarItemsVariants[number]

@Component({
  selector: 'app-post-action-buttons',
  imports: [RouterModule, FontAwesomeModule, MatButtonModule, MatTooltipModule, PostLinkModule],
  templateUrl: './post-action-buttons.component.html',
  styleUrl: './post-action-buttons.component.scss'
})
export class PostActionButtonsComponent implements OnChanges {
  fragment = input.required<ProcessedPost>()
  settingKey = input.required<SettingKey>()

  loggedIn: Signal<boolean>
  isEmptyReblog = false
  myId = ''
  loadingAction = false
  myRewootsIncludePost = false
  bookmarked = signal<boolean>(false)

  // icons
  shareIcon = faShareNodes
  expandDownIcon = faChevronDown
  solidHeartIcon = faHeart
  clearHeartIcon = faHeartBroken
  reblogIcon = faReply
  quickReblogIcon = faRepeat
  quoteIcon = faQuoteLeft
  shareExternalIcon = faArrowUpRightFromSquare
  deleteIcon = faTrash
  closeIcon = faClose
  worldIcon = faGlobe
  unlockIcon = faUnlock
  envelopeIcon = faEnvelope
  serverIcon = faServer
  userIcon = faUser
  editedIcon = faPen
  checkIcon = faCheck
  bookmarkIcon = faBookmark
  unbookmarkIcon = faBookBookmark

  // Ordering
  buttonList: SettingListItem[] = []

  constructor(
    readonly loginService: LoginService,
    private readonly postService: PostsService,
    private readonly editorService: EditorService,
    private readonly deletePostService: DeletePostService,
    private readonly messages: MessageService,
    private readonly editor: EditorService,
    private settingsService: SettingsService
  ) {
    this.loggedIn = loginService.loggedIn
    if (this.loggedIn()) {
      this.myId = loginService.getLoggedUserUUID()
    }
  }

  ngOnInit(): void {
    this.buttonList = this.settingsService.values[this.settingKey()] as SettingListItem[]
    this.bookmarked.set(this.fragment().bookmarkers.includes(this.myId))
  }

  ngOnChanges(): void {
    this.myRewootsIncludePost = this.postService.rewootedPosts.includes(this.fragment().id)

    const finalOne = this.fragment()
    this.isEmptyReblog =
      finalOne &&
      finalOne.content == '' &&
      finalOne.tags.length == 0 &&
      finalOne.quotes.length == 0 &&
      !finalOne.questionPoll &&
      finalOne.medias?.length == 0
  }

  async replyPost() {
    await this.editorService.replyPost(this.fragment())
  }

  async quotePost() {
    await this.editorService.quotePost(this.fragment())
  }

  async editPost(post: ProcessedPost) {
    await this.editorService.replyPost(post, true)
  }

  async deletePost(id: string) {
    this.deletePostService.openDeletePostDialog(id)
  }

  async deleteRewoots() {
    this.loadingAction = true
    const success = await firstValueFrom(this.deletePostService.deleteRewoots(this.fragment().id))
    if (success) {
      this.myRewootsIncludePost = false
      this.messages.add({
        severity: 'success',
        summary: 'messages.deleteRewootSuccess',
        translate: true
      })
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'messages.genericError',
        translate: true
      })
    }
    this.loadingAction = false
  }

  async toggleLike() {
    if (this.loadingAction || this.fragment().userId === this.myId) return

    const hasLikedPost = this.fragment().userLikesPostRelations.includes(this.myId)
    if (!hasLikedPost) {
      this.likePost()
    } else {
      this.unlikePost()
    }
  }

  async likePost() {
    this.loadingAction = true
    if (await this.postService.likePost(this.fragment().id)) {
      this.fragment().userLikesPostRelations.push(this.myId)
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
    this.loadingAction = false
  }

  async unlikePost() {
    this.loadingAction = true
    if (await this.postService.unlikePost(this.fragment().id)) {
      this.fragment().userLikesPostRelations = this.fragment().userLikesPostRelations.filter(
        (elem) => elem != this.myId
      )
      this.messages.add({
        severity: 'success',
        summary: 'You no longer like this woot'
      })
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
    this.loadingAction = false
  }

  async toggleBookmark() {
    if (!this.bookmarked()) {
      this.bookmarkPost()
    } else {
      this.unbookmarkPost()
    }
  }

  async bookmarkPost() {
    this.loadingAction = true
    if (await this.postService.bookmarkPost(this.fragment().id)) {
      this.fragment().bookmarkers.push(this.myId)
      const disableConfetti = localStorage.getItem('disableConfetti') == 'true'
      this.messages.add({
        severity: 'success',
        summary: 'You successfully bookmarked this woot',
        confettiEmojis: disableConfetti ? [] : ['💾']
      })
      this.bookmarked.set(true)
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
    this.loadingAction = false
  }

  async unbookmarkPost() {
    this.loadingAction = true
    if (await this.postService.unbookmarkPost(this.fragment().id)) {
      this.fragment().bookmarkers = this.fragment().bookmarkers.filter((elem) => elem != this.myId)
      this.messages.add({
        severity: 'success',
        summary: 'You successfully unbookmarked this woot'
      })
      this.bookmarked.set(false)
    } else {
      this.messages.add({
        severity: 'error',
        summary: 'Something went wrong. Please try again'
      })
    }
    this.loadingAction = false
  }

  async toggleReblog() {
    if (!this.myRewootsIncludePost) {
      this.quickReblog()
    } else {
      this.deleteRewoots()
    }
  }

  async quickReblog() {
    this.loadingAction = true
    if (this.fragment().privacy !== 10) {
      const response = await this.editor.createPost({
        mentionedUsers: [],
        content: '',
        idPostToReblog: this.fragment().id,
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
    this.loadingAction = false
  }
}
