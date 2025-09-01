import { Component, computed, ElementRef, input, output, viewChild } from '@angular/core'
import { ProcessedPost } from 'src/app/interfaces/processed-post'
import { PostModule } from '../post/post.module'
import { LoaderComponent } from '../loader/loader.component'
import { HotkeyService, HotkeyType } from 'src/app/services/hotkey.service'

@Component({
  selector: 'app-post-list',
  imports: [PostModule, LoaderComponent],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss'
})
export class PostListComponent {
  posts = input<ProcessedPost[][]>([])
  visible = input<boolean>(true) // Disables keybinds, required due to SnappyRouter so we do not act off screen
  loading = input.required<boolean>()
  loadPosts = output<void>()

  bottomPageElementRef = viewChild<ElementRef<HTMLElement>>('bottom')
  bottomPageElement = computed(() => this.bottomPageElementRef()?.nativeElement)
  bottomPageObserver: IntersectionObserver | undefined

  selectedPost: number | null = null // null means no hotkeys pressed yet

  constructor(hotkeyService: HotkeyService) {
    hotkeyService.hotkeySubscription.subscribe((type) => this.handleHotkeys(type))
  }

  ngOnInit() {
    this.bottomPageObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]

      // Do not send the signal if we're already loading or just loaded
      if (this.loading() || !entry.isIntersecting) return

      this.loadPosts.emit()
    })
    this.bottomPageObserver.observe(this.bottomPageElement()!)
  }

  postElementAt(index: number): HTMLElement | null {
    return document.getElementById('post-element-' + this.posts().at(index)?.at(-1)?.id)
  }

  handleHotkeys(type: HotkeyType) {
    if (!this.visible()) return

    switch (type) {
      case HotkeyType.nextPost:
        this.nextPost()
        break
      case HotkeyType.previousPost:
        this.previousPost()
        break
      default:
        break
    }
  }

  previousPost() {
    if (this.selectedPost === null) {
      this.selectedPost = 0
      this.scrollToSelectedPost()
      return
    }
    if (this.selectedPost > 0) {
      this.selectedPost -= 1
    }
    this.scrollToSelectedPost()
  }

  nextPost() {
    if (this.selectedPost === null) {
      this.selectedPost = 0
      this.scrollToSelectedPost()
      return
    }
    if (this.selectedPost < this.posts().length - 1) {
      this.selectedPost += 1
    }
    if (this.selectedPost === this.posts().length - 1) {
      this.loadPosts.emit()
      this.scrollToLoader()
      return
    }
    this.scrollToSelectedPost()
  }

  scrollToLoader() {
    this.bottomPageElement()?.scrollIntoView()
  }

  scrollToSelectedPost() {
    const nextPost = this.postElementAt(this.selectedPost ?? 0)
    if (nextPost === null) return
    nextPost?.scrollIntoView({ behavior: 'instant' })
  }

  test() {
    console.log('hi')
  }
}
