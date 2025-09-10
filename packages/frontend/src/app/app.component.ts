import { Component, Injector, Inject, OnInit, DOCUMENT } from '@angular/core'
import { SwUpdate } from '@angular/service-worker'
import { LoginService } from './services/login.service'
import { EnvironmentService } from './services/environment.service'
import { TranslateService } from '@ngx-translate/core'
import { SwPush } from '@angular/service-worker'
import { Title } from '@angular/platform-browser'
import { GlobalData } from './services/global-data.service'
import { WebsocketService } from './services/websocket.service'
import { NavigationError, Router } from '@angular/router'
import { filter, map } from 'rxjs'
import { MessageService } from './services/message.service'
import { supportedLanguages } from './lists/languages'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'wafrn'

  constructor(
    private swUpdate: SwUpdate,
    private swPush: SwPush,
    private injector: Injector,
    private loginService: LoginService,
    private environmentService: EnvironmentService,
    @Inject(DOCUMENT) private document: Document,
    private translateService: TranslateService,
    private websocketService: WebsocketService,
    private router: Router,
    private messages: MessageService,
    private titleService: Title
  ) {
    this.title = this.titleService.getTitle()
    GlobalData.appDefaultTitle = this.title

    this.translateService.addLangs(supportedLanguages)
    this.translateService.setDefaultLang('en')

    // User specified language
    const userLanguage = localStorage?.getItem('appLanguage')
    if (userLanguage !== null && translateService.langs.includes(userLanguage)) {
      // Given the above call to add languages is correct to what we have, this should always succeed
      translateService.use(userLanguage)
    }

    // Keep the 'lang' property up to date
    const currentLang = this.translateService.currentLang || this.translateService.getDefaultLang() || 'en'
    this.document.documentElement.lang = currentLang
    this.translateService.onLangChange.subscribe((event) => {
      this.document.documentElement.lang = event.lang
    })

    router.events
      .pipe(
        filter((evt) => evt instanceof NavigationError),
        map((evt) => evt as NavigationError)
      )
      .subscribe((evt) => {
        if (evt.error instanceof Error && evt.error.name == 'ChunkLoadError') {
          window.location.assign(evt.url)
        }
      })
    swUpdate.unrecoverable.subscribe((event) => {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (const registration of registrations) {
          registration.unregister()
        }
        window.location.reload()
      })
    })
  }

  ngOnInit() {
    // unregister serviceworkers
    /*navigator.serviceWorker.getRegistrations().then(function (registrations) {
      for (const registration of registrations) {
        registration.unregister();
      }
    });*/
    const wafrnUpdated = localStorage.getItem('wafrnUpdated')
    if (wafrnUpdated == 'true') {
      localStorage.removeItem('wafrnUpdated')
      this.messages.add({ severity: 'success', summary: 'Wafrn has been updated!' })
    }
    if (this.swUpdate.isEnabled) {
      console.log('SOFTWARE UPDATES ACTIVE - This is a PWA')
      this.swUpdate.checkForUpdate().then((updateAvaiable) => {
        console.log(updateAvaiable)
        if (EnvironmentService.environment.disablePWA) {
          if ('caches' in window) {
            caches.keys().then(function (keyList) {
              return Promise.all(
                keyList.map(function (key) {
                  return caches.delete(key)
                })
              )
            })
          }
          if (window.navigator && navigator.serviceWorker) {
            navigator.serviceWorker.getRegistrations().then(function (registrations) {
              for (const registration of registrations) {
                registration.unregister()
              }
            })
          }
        }
        // we are no longer asking nicely
        if (updateAvaiable) {
          localStorage.setItem('wafrnUpdated', 'true')
          if (window.location.toString().toLowerCase().endsWith('/editor')) {
            if (confirm('There is an update available, would you like to update?')) {
              window.location.reload()
            } else {
              alert('Please reload manualy after writing the post!')
            }
          } else {
            window.location.reload()
          }
        }
      })
    }

    if (EnvironmentService.environment.disablePWA) {
      if ('caches' in window) {
        caches.keys().then(function (keyList) {
          return Promise.all(
            keyList.map(function (key) {
              return caches.delete(key)
            })
          )
        })
      }
      if (window.navigator && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
          for (const registration of registrations) {
            registration.unregister()
          }
        })
      }
    }
    // TODO lets keep with this later
    /*
    if (this.swPush.isEnabled && EnvironmentService.environment.webpushPublicKey) {
      this.swPush
        .requestSubscription({
          serverPublicKey: EnvironmentService.environment.webpushPublicKey
        })
        .then((notificationSubscription) => {
          console.log(notificationSubscription)
        })
    }
    */
  }
}
