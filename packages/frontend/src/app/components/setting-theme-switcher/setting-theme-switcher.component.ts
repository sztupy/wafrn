import { Component, WritableSignal } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectChange, MatSelectModule } from '@angular/material/select'
import { TranslatePipe } from '@ngx-translate/core'
import { KeyValueTypedPipe } from 'src/app/pipes/keyvaluetyped.pipe'
import {
  AdditionalStyleMode,
  additionalStyleModesData,
  ColorScheme,
  colorSchemeData,
  colorSchemeGroupList,
  ColorTheme,
  colorThemeData,
  ThemeService
} from 'src/app/services/theme.service'

@Component({
  selector: 'app-setting-theme-switcher',
  imports: [MatFormFieldModule, MatSelectModule, TranslatePipe, KeyValueTypedPipe],
  templateUrl: './setting-theme-switcher.component.html',
  styleUrl: './setting-theme-switcher.component.scss'
})
export class SettingThemeSwitcherComponent {
  // light/dark
  colorTheme: WritableSignal<ColorTheme>
  colorThemeData = colorThemeData

  // colors
  colorScheme: WritableSignal<ColorScheme>
  colorSchemeData = colorSchemeData
  colorSchemeGroupList = colorSchemeGroupList

  // style modes
  additionalStyleModes
  additionalStyleModesSelect
  additionalStyleModesData = additionalStyleModesData
  setAdditionalStyleMode

  constructor(private themeService: ThemeService) {
    this.colorTheme = themeService.theme

    this.colorScheme = themeService.colorScheme

    this.additionalStyleModes = themeService.additionalStyleModes
    this.additionalStyleModesSelect = Object.entries(this.additionalStyleModes)
      .filter(([_, enabled]) => enabled())
      .map(([val, _]) => val) as AdditionalStyleMode[]
    this.setAdditionalStyleMode = themeService.setAdditionalStyleMode
  }

  setColorTheme(event: MatSelectChange) {
    this.themeService.setTheme(event.value)
  }
  setColorScheme(event: MatSelectChange) {
    this.themeService.setColorScheme(event.value)
  }
  setAdditionalStyleModes(event: MatSelectChange) {
    this.additionalStyleModesSelect = event.value as AdditionalStyleMode[]

    const allModes = Object.keys(this.additionalStyleModesData) as AdditionalStyleMode[]
    const enabledModes = this.additionalStyleModesSelect
    const disabledModes = allModes.filter((mode) => !this.additionalStyleModesSelect.includes(mode))
    enabledModes.forEach((mode) => this.setAdditionalStyleMode(mode, true))
    disabledModes.forEach((mode) => this.setAdditionalStyleMode(mode, false))
  }
}
