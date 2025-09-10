import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faWarning } from '@fortawesome/free-solid-svg-icons'
import { TranslatePipe } from '@ngx-translate/core'
import { InfoCardComponent } from '../info-card/info-card.component'
import { MatExpansionModule } from '@angular/material/expansion'

@Component({
  selector: 'app-setting-delete-account',
  imports: [
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    FontAwesomeModule,
    InfoCardComponent,
    TranslatePipe
  ],
  templateUrl: './setting-delete-account.component.html',
  styleUrl: './setting-delete-account.component.scss'
})
export class SettingDeleteAccountComponent {
  password: string = ''

  warnIcon = faWarning

  constructor() {}

  handleInput(event: Event) {
    const target = event.target
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      this.password = target.value
    }
  }

  requestDeleteAccount() {}
}
