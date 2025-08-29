import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { TranslateModule } from '@ngx-translate/core'
import { EmojiCollectionsComponent } from 'src/app/components/emoji-collections/emoji-collections.component'
import { FileUploadComponent } from 'src/app/components/file-upload/file-upload.component'

@Component({
  selector: 'app-emoji-uploader',
  imports: [FormsModule, MatCardModule, FileUploadComponent, EmojiCollectionsComponent, TranslateModule],
  templateUrl: './emoji-uploader.component.html',
  styleUrl: './emoji-uploader.component.scss'
})
export class EmojiUploaderComponent {
  onEmojiUpload(evt: any) {
    window.location.reload()
  }
}
