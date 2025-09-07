import { Component, computed, ElementRef, input, output, signal, viewChild, viewChildren } from '@angular/core'
import { ProcessedPost } from 'src/app/interfaces/processed-post'
import { PostModule } from '../post/post.module'
import { LoaderComponent } from '../loader/loader.component'
import { HotkeyAction, HotkeyService } from 'src/app/services/hotkey.service'
import { fromEvent, Subject, take, throttleTime } from 'rxjs'
import { PostComponent } from '../post/post.component'

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
  postListRef = viewChildren<PostComponent, ElementRef<HTMLElement>>(PostComponent, { read: ElementRef })
  postListElements = computed(() => this.postListRef()?.map((post) => post.nativeElement))

  postIsActive = signal<boolean>(false)

  selectedPost: number = 0

  postActionSubject = new Subject<HotkeyAction>()

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

  selectMiddlePost() {
    // Find the post whose top is closest to the top of the screen
    const windowCenter = window.scrollY
    const postDistances = this.postListElements().map((elem) => Math.abs(elem.offsetTop - windowCenter))
    const smallestDistance = Math.min(...postDistances)
    const closestPostIndex = postDistances.findIndex((elem) => elem === smallestDistance)

    this.selectedPost = closestPostIndex
    this.scrollToSelectedPost(true) // Smooth scroll to initial highlighted post (UX!!)

    // Stop highlighting if the user manually scrolls with the mouse
    fromEvent(document, 'wheel')
      .pipe(take(1))
      .subscribe(() => {
        this.postIsActive.set(false)
      })
  }

  handleHotkeys(action: HotkeyAction) {
    if (!this.visible()) return

    switch (action) {
      // Stop highlighting if screen-based scroll is used
      case 'scrollDown':
      case 'scrollUp':
      case 'scrollUpPage':
      case 'scrollDownPage':
        this.postIsActive.set(false)
        break
      case 'nextPost':
        this.nextPost()
        break
      case 'previousPost':
        this.previousPost()
        break
      default:
        // Send other actions to bottom reply bar
        this.postActionSubject.next(action)
        break
    }
  }

  //
  // Hotkey functions
  //

  previousPost() {
    if (!this.postIsActive()) {
      this.selectMiddlePost()
      return
    }

    if (this.selectedPost > 0) {
      this.selectedPost -= 1
    }
    this.scrollToSelectedPost()
  }

  nextPost() {
    if (!this.postIsActive()) {
      this.selectMiddlePost()
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

  scrollToLoader(smooth: boolean = false) {
    this.bottomPageElement()?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
    this.afterPostScroll()
  }

  scrollToSelectedPost(smooth: boolean = false) {
    const nextPost = this.postElementAt(this.selectedPost ?? 0)
    if (nextPost === null) return
    nextPost?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
    this.afterPostScroll()
  }

  afterPostScroll() {
    this.postIsActive.set(true)
  }
}
