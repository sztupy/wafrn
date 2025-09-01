import { afterRenderEffect, Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core'
import { ProcessedPost } from 'src/app/interfaces/processed-post'
import { PostModule } from '../post/post.module'
import { LoaderComponent } from '../loader/loader.component'
import { HotkeyService, HotkeyType } from 'src/app/services/hotkey.service'
import { fromEvent, take } from 'rxjs'

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
  currentPostObserver: IntersectionObserver

  hasScrolled = signal<boolean>(false)
  highlightPost = signal<boolean>(false)

  selectedPost: number = 0

  constructor(hotkeyService: HotkeyService) {
    hotkeyService.hotkeySubscription.subscribe((type) => this.handleHotkeys(type))
    this.currentPostObserver = new IntersectionObserver((entries) => this.handleCurrentPostObserver(entries[0]))

    // Observe the first post after loading
    const firstLoadEffect = afterRenderEffect(() => {
      if (this.loading()) return
      const firstPost = this.postElementAt(0)
      if (firstPost) {
        this.currentPostObserver.observe(firstPost)
        firstLoadEffect.destroy()
      }
    })

    // If the user scrolls manually we don't pick first post on Next Post key
    fromEvent(document, 'scroll')
      .pipe(take(1))
      .subscribe(() => {
        this.hasScrolled.set(true)
      })

    // Stop highlighting if the user manually scrolls with the mouse
    fromEvent(document, 'wheel').subscribe(() => {
      this.highlightPost.set(false)
    })
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

  handleCurrentPostObserver(entry: IntersectionObserverEntry) {
    if (entry.isIntersecting) return
    const before = this.selectedPost

    // Observe next post
    const scrolledBelowPost = entry.boundingClientRect.top < 0
    if (scrolledBelowPost) {
      if (this.selectedPost < this.posts().length - 1) {
        this.selectedPost += 1
      }
    } else {
      if (this.selectedPost > 0) {
        this.selectedPost -= 1
      }
    }
    // Ignore non-moving observations
    if (this.selectedPost === before) return

    this.observeSelectedPost()
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
    if (this.selectedPost > 0) {
      this.selectedPost -= 1
    }
    this.scrollToSelectedPost()
  }

  nextPost() {
    // Has not scrolled so we use the first post
    if (!this.hasScrolled()) {
      this.scrollToSelectedPost()
      return
    }

    if (this.selectedPost < this.posts().length - 1) {
      this.selectedPost += 1
    }
    // Next post on the last post triggers loading new posts and scrolls to the loader
    if (this.selectedPost === this.posts().length - 1) {
      this.loadPosts.emit()
      this.scrollToLoader()
      return
    }
    this.scrollToSelectedPost()
  }

  scrollToLoader() {
    this.bottomPageElement()?.scrollIntoView()
    this.afterPostScroll()
  }

  scrollToSelectedPost() {
    const nextPost = this.postElementAt(this.selectedPost ?? 0)
    if (nextPost === null) return
    nextPost?.scrollIntoView({ behavior: 'instant' })
    this.afterPostScroll()
  }

  afterPostScroll() {
    this.observeSelectedPost()
    this.highlightPost.set(true)
  }

  observeSelectedPost() {
    this.currentPostObserver.disconnect()
    const postElem = this.postElementAt(this.selectedPost)
    if (postElem) {
      this.currentPostObserver.observe(postElem)
    }
  }
}
