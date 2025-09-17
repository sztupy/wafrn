import { Component, inject, Inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { TranslatePipe } from '@ngx-translate/core'
import { KeyValueTypedPipe } from 'src/app/pipes/keyvaluetyped.pipe'

export interface CustomDialogData<T extends string> {
  title: string
  titleSuffix?: string // Left untranslated and emphasized
  content?: string
  contentSuffix?: string
  options: Record<T, { type: 'confirm' | 'cancel'; text: string }>
}

@Component({
  selector: 'app-custom-dialog',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogTitle,
    MatDialogContent,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    KeyValueTypedPipe
  ],
  templateUrl: './custom-dialog.component.html'
})
export class CustomDialogComponent<T extends string> {
  readonly dialogRef = inject<MatDialogRef<CustomDialogComponent<T>, T | undefined>>(
    MatDialogRef<CustomDialogComponent<T>>
  )

  textData: CustomDialogData<T>

  // Defaults for the buttons

  inputResponse = signal('')

  constructor(@Inject(MAT_DIALOG_DATA) protected data: CustomDialogData<T>) {
    this.textData = data
  }

  onInput(event: InputEvent): void {
    if (event.target instanceof HTMLTextAreaElement) {
      this.inputResponse.set(event.target.value)
    }
  }

  // All options return their key, clicking off returns undefined
  onSelect(value: T): void {
    this.dialogRef.close(value)
  }
}
