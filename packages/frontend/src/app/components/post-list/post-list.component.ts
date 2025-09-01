import { Component, computed, ElementRef, input, output, viewChild } from '@angular/core'
import { ProcessedPost } from 'src/app/interfaces/processed-post'
import { PostModule } from '../post/post.module'
import { LoaderComponent } from '../loader/loader.component'

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

  constructor() {}

  ngOnInit() {
    this.bottomPageObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]

      // Do not send the signal if we're already loading or just loaded
      if (this.loading() || !entry.isIntersecting) return

      this.loadPosts.emit()
    })
    this.bottomPageObserver.observe(this.bottomPageElement()!)
  }
}
