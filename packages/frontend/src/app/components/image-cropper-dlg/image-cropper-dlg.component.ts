import { Component, Inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MatDialogTitle,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog'
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { TranslateModule } from '@ngx-translate/core'

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper-dlg.component.html',
  styleUrls: ['./image-cropper-dlg.component.scss'],
  imports: [MatButtonModule, MatDialogTitle, ImageCropperComponent, TranslateModule]
})
export class ImageCropperDlgComponent {

  constructor(
    private dialogRef: MatDialogRef<ImageCropperDlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { image: File, imageAspect: 'avatar' | 'header', cropFinishedCallback: (croppedImage: File) => void }
  ) {
    this.image = data.image
    this.imageAspect = data.imageAspect
    this.cropFinishedCallback = data.cropFinishedCallback
    if (this.imageAspect == 'avatar') {
      this.imageAspectRatio = 1 / 1
    } else if (this.imageAspect == 'header' ) {
      this.imageAspectRatio = 25 / 4
    }
  }

  canFinish: boolean = false
  imageAspectRatio = 1 / 1
  imageAspect: 'avatar' | 'header'
  image: File
  croppedImage: File | null = null;
  cropFinishedCallback: (croppedImage: File) => void

  addPngExt(path: string) {
    return path.endsWith('.png') ? path : path + '.png'
  }

  imageCropped(event: ImageCroppedEvent) {
    this.canFinish = true
    this.croppedImage = new File([event.blob!], this.addPngExt(this.image.name))
  }

  cropperReady() {
  }

  loadImageFailed() {
    console.log("Failed to load image in image cropper")
  }

  finishCrop() {
    if (this.croppedImage == null) return
    this.cropFinishedCallback(this.croppedImage)

    this.dialogRef.close()
  }
}
