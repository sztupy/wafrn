import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { fromEvent, merge, Subscription } from 'rxjs'
import { Action } from 'src/app/interfaces/editor-launcher-data'
import { DashboardService } from 'src/app/services/dashboard.service'
import { EditorService } from 'src/app/services/editor.service'
import { JwtService } from 'src/app/services/jwt.service'
import { AccountData, LoginService } from 'src/app/services/login.service'
import { NotificationsService } from 'src/app/services/notifications.service'
import { toObservable } from '@angular/core/rxjs-interop'

import {
  faQuestion,
  faHouse,
  faUser,
  faCompass,
  faPencil,
  faBell,
  faPowerOff,
  faServer,
  faExclamationTriangle,
  faBan,
  faEnvelope,
  faSearch,
  faUserEdit,
  faVolumeMute,
  faSignOut,
  faBars,
  faUserLock,
  faCog,
  faChartSimple,
  faHourglass,
  faBellSlash,
  faIcons,
  faSkull,
  faPaintbrush,
  faBookmark,
  faSync,
  faHashtag,
  faArrowLeft,
  faUserPlus,
  faArrowRightToBracket,
  faGrip,
  faImagePortrait,
  faUsers,
  faPlus,
  faShuffle,
  faInbox
} from '@fortawesome/free-solid-svg-icons'
import { MenuItem, MenuLink } from 'src/app/interfaces/menu-item'
import { EnvironmentService } from 'src/app/services/environment.service'
import { AudioService } from 'src/app/services/audio.service'
import { ThemeService } from 'src/app/services/theme.service'
import packageJson from '../../../../package.json'
import { BlogDetails } from 'src/app/interfaces/blogDetails'

@Component({
  selector: 'app-navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class NavigationMenuComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = []
  menuItemsMobile: MenuItem[][] = []
  menuLinks: MenuLink[] = []

  currentAccount: Signal<BlogDetails | undefined>
  accountList: Signal<AccountData[]>
  accountListMenuItems = computed(() =>
    this.accountList()
      .filter((_, index) => index !== 0)
      .map<MenuItem>((account) => {
        return {
          label: '',
          labelDynamic: () => account.blog.name,
          image: this.dashboardService.getAvatarUrl(account.blog),
          visible: () => this.loggedIn(),
          badge: 0, // TODO: badges on other accounts from token (needs API)
          items: [
            {
              label: 'menu.viewBlog',
              icon: faImagePortrait,
              visible: () => this.loggedIn(),
              routerLinkDynamic: computed(() => '/blog/' + account.blog.url),
              command: () => {
                this.hideMenu()
              }
            },
            {
              label: 'menu.switchToAlt',
              icon: faShuffle,
              visible: () => this.loggedIn(),
              command: () => {
                this.hideMenu()
                this.loginService.switchAccount(account.token)
              }
            },
            {
              label: '',
              visible: () => this.loggedIn(),
              divider: true
            },
            {
              label: 'menu.logout',
              icon: faSignOut,
              visible: () => this.loggedIn(),
              command: () => {
                this.loginService.logOutAccount(account.token)
                this.hideMenu()
              }
            }
          ]
        }
      })
  )

  maintenanceMode = EnvironmentService.environment.maintenance
  maintenanceMessage = EnvironmentService.environment.maintenanceMessage
  menuVisible: boolean
  notifications = 0
  adminNotifications = 0
  usersAwaitingApproval = 0
  followsAwaitingApproval = 0
  awaitingAsks = 0
  privateMessagesNotifications = ''
  mobile: WritableSignal<boolean>
  logo = EnvironmentService.environment.logo
  defaultIcon = faQuestion
  navigationSubscription: Subscription
  loggedIn: Signal<boolean>
  scrollSubscription: Subscription
  hamburguerIcon = faBars
  pencilIcon = faPencil
  currentRoute = ''
  reloadIcon = faSync
  backIcon = faArrowLeft

  pwaPage: boolean

  keyboardActive = true

  horizontalMenuMode: Signal<boolean>
  offsetTopArea: Signal<boolean>

  frontendVersion = packageJson.version

  constructor(
    private editorService: EditorService,
    private router: Router,
    public jwtService: JwtService,
    private loginService: LoginService,
    private notificationsService: NotificationsService,
    private cdr: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private audioService: AudioService,
    themeService: ThemeService
  ) {
    this.currentAccount = loginService.currentAccount
    this.accountList = loginService.accountList

    if (this.loginService.getForceClassicLogo()) {
      this.logo = '/assets/classicLogo.png'
    }
    this.navigationSubscription = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.currentRoute = ev.url
        this.updateNotifications(ev.url)
      }
    })

    this.loggedIn = loginService.loggedIn

    this.scrollSubscription = this.dashboardService.scrollEventEmitter.subscribe(() => {
      this.updateNotifications('scroll')
    })

    this.pwaPage = window.matchMedia('(display-mode: standalone)').matches

    // Focus overlay evil fix
    fromEvent(document, 'keydown').subscribe(() => (this.keyboardActive = true))
    fromEvent(document, 'click').subscribe(() => (this.keyboardActive = false))

    this.mobile = signal(window.innerWidth <= 992)
    this.horizontalMenuMode = themeService.additionalStyleModes.horizontalMenu
    const topToolbarMode = themeService.additionalStyleModes.topToolbar
    this.offsetTopArea = computed(() => (this.mobile() || this.horizontalMenuMode()) && topToolbarMode())

    merge(fromEvent(window, 'resize'), toObservable(this.horizontalMenuMode), toObservable(topToolbarMode)).subscribe(
      () => this.syncMobileMode()
    )

    this.menuVisible = !this.mobile()

    effect(() => this.loggedIn() && this.drawMenu())
  }

  ngOnInit(): void {
    // IMPORTANT: HIDE THE SPLASH SCREEN
    const splashElement = document.getElementById('splash')
    splashElement?.classList.add('loaded')

    const microformatsElement = document.getElementById('indieweb')
    microformatsElement?.classList.add('loaded')
    this.drawMenu()
    if (localStorage.getItem('horizontalMenu') === 'true') {
      this.onCloseMenu()
    }
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe()
    this.scrollSubscription.unsubscribe()
  }

  showMenu() {
    this.menuVisible = true
  }

  hideMenu() {
    this.menuVisible = false
    this.editorService.launchPostEditorEmitter.next({ action: Action.Close })
  }

  async updateNotifications(url: string) {
    if (!this.loggedIn()) return

    const previousNotifications =
      this.adminNotifications + this.usersAwaitingApproval + this.followsAwaitingApproval + this.awaitingAsks
    const response = await this.notificationsService.getUnseenNotifications()
    if (url === '/dashboard/notifications') {
      this.notifications = 0
    } else {
      this.notifications = response.notifications
    }
    this.adminNotifications = response.reports
    this.usersAwaitingApproval = response.usersAwaitingApproval
    this.followsAwaitingApproval = response.followsAwaitingApproval
    this.awaitingAsks = response.asks
    const newNotifications =
      this.adminNotifications + this.usersAwaitingApproval + this.followsAwaitingApproval + this.awaitingAsks
    if (previousNotifications != newNotifications && localStorage.getItem('disableSounds') != 'true') {
      this.audioService.playSound('notification')
    }
    this.cdr.detectChanges()

    this.drawMenu()
  }

  syncMobileMode() {
    this.mobile.set(window.innerWidth <= 992 || this.horizontalMenuMode())
  }

  async openEditor() {
    const nodeName = document.activeElement?.nodeName ? document.activeElement.nodeName : ''
    if (!['INPUT', 'TEXTAREA', 'DIV'].includes(nodeName) && this.loggedIn()) {
      this.editorService.openDialogWithData(undefined)
    }
  }

  handleWootKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return
    this.openEditor()
  }

  onCloseMenu() {
    this.menuVisible = false
  }

  historyBack() {
    history.back()
  }

  refresh() {
    const currentUrl = this.router.url
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl])
    })
  }

  drawMenu() {
    // JSON driven UI lmao
    this.menuItems = [
      {
        label: 'menu.register',
        icon: faUserPlus,
        visible: () => !this.loggedIn(),
        routerLink: '/register',
        command: () => {
          this.hideMenu()
        }
      },
      {
        label: 'menu.login',
        icon: faArrowRightToBracket,
        visible: () => !this.loggedIn(),
        routerLink: '/login',
        command: () => {
          this.hideMenu()
        }
      },
      {
        label: 'divider',
        visible: () => !this.loggedIn(),
        divider: true
      },
      {
        label: 'menu.exploreWafrn',
        icon: faCompass,
        visible: () => !this.loggedIn(),
        routerLink: '/dashboard/exploreLocal',
        command: () => {
          this.hideMenu()
        }
      },
      {
        label: 'menu.dashboard',
        icon: faHouse,
        visible: () => this.loggedIn(),
        routerLink: '/dashboard',
        command: () => {
          this.hideMenu()
        }
      },
      {
        label: 'menu.explore',
        icon: faCompass,
        visible: () => this.loggedIn(),
        items: [
          {
            label: 'menu.exploreWafrn',
            icon: faServer,
            visible: () => this.loggedIn(),
            routerLink: '/dashboard/exploreLocal',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.exploreFediverse',
            icon: faCompass,
            visible: () => this.loggedIn(),
            routerLink: '/dashboard/explore',
            command: () => {
              this.hideMenu()
            }
          }
        ]
      },
      {
        label: 'menu.search',
        icon: faSearch,
        visible: () => this.loggedIn(),
        routerLink: '/dashboard/search',
        command: () => {
          this.hideMenu()
        }
      },
      {
        label: 'menu.inbox',
        icon: faInbox,
        visible: () => this.loggedIn(),
        badge: this.notifications + this.awaitingAsks,
        items: [
          {
            label: 'menu.notifications',
            icon: faBell,
            visible: () => this.loggedIn(),
            badge: this.notifications,
            routerLink: '/dashboard/notifications',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.privateMessages',
            icon: faEnvelope,
            visible: () => this.loggedIn(),
            routerLink: '/dashboard/private',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.unansweredAsks',
            icon: faQuestion,
            visible: () => this.loggedIn(),
            badge: this.awaitingAsks,
            routerLink: '/profile/myAsks',
            command: () => {
              this.hideMenu()
            }
          }
        ]
      },
      {
        label: 'divider',
        visible: () => this.loggedIn(),
        divider: true
      },
      {
        label: 'user',
        labelDynamic: computed(() => this.currentAccount()?.name ?? 'No one will believe you'),
        image:
          this.currentAccount() !== undefined
            ? this.dashboardService.getAvatarUrl(<BlogDetails>this.currentAccount())
            : '',
        visible: () => this.loggedIn(),
        class: 'active-account',
        active: true,
        items: [
          {
            label: 'menu.myBlog',
            icon: faImagePortrait,
            visible: () => this.loggedIn(),
            routerLinkDynamic: computed(() => '/blog/' + this.currentAccount()?.url),
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'divider',
            visible: () => this.loggedIn(),
            divider: true
          },
          {
            label: 'menu.addAccount',
            icon: faPlus,
            visible: () => this.loggedIn(),
            routerLink: '/login',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.logout',
            icon: faSignOut,
            visible: () => this.loggedIn(),
            command: () => {
              this.loginService.logOut()
              this.hideMenu()
            }
          }
        ]
      },
      {
        label: 'menu.otherAccounts',
        visible: () => this.loggedIn() && this.accountList().length > 1,
        plainText: true
      },
      ...this.accountListMenuItems(),
      {
        label: '',
        visible: () => this.loggedIn(),
        divider: true
      },
      {
        label: 'menu.settings.title',
        icon: faCog,
        visible: () => this.loggedIn(),
        badge: this.followsAwaitingApproval,
        routerLink: '/settings',
        highlightRoute: false
      },
      {
        label: 'menu.more',
        icon: faGrip,
        visible: () => this.loggedIn(),
        items: [
          {
            label: 'menu.settings.superSecretMenu',
            icon: faSkull,
            visible: () => this.loggedIn(),
            routerLink: '/doom',
            command: () => {
              this.hideMenu()
            }
          }
        ]
      },
      {
        label: 'menu.admin.title',
        icon: faPowerOff,
        visible: () => this.jwtService.adminToken(),
        badge: this.adminNotifications + this.usersAwaitingApproval,
        items: [
          {
            label: 'menu.admin.awaitingAproval',
            icon: faUserLock,
            visible: () => true,
            badge: this.usersAwaitingApproval,
            routerLink: '/admin/activate-users',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.admin.reports',
            icon: faExclamationTriangle,
            visible: () => true,
            badge: this.adminNotifications,
            routerLink: '/admin/user-reports',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.admin.addEmojis',
            icon: faIcons,
            visible: () => true,
            routerLink: '/admin/emojis',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.admin.stats',
            icon: faChartSimple,
            visible: () => true,
            routerLink: '/admin/stats',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.admin.serverList',
            icon: faServer,
            visible: () => true,
            routerLink: '/admin/server-list',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.admin.bans',
            icon: faBan,
            visible: () => true,
            routerLink: '/admin/bans',
            command: () => {
              this.hideMenu()
            }
          },
          {
            label: 'menu.admin.blocklist',
            icon: faHourglass,
            visible: () => true,
            routerLink: '/admin/user-blocks',
            command: () => {
              this.hideMenu()
            }
          }
        ]
      }
    ]

    this.menuItemsMobile = [
      [
        {
          label: 'menu.showMenu',
          icon: faBars,
          visible: () => true,
          badge:
            this.awaitingAsks + this.adminNotifications + this.usersAwaitingApproval + this.followsAwaitingApproval,
          command: () => {
            this.menuVisible = !this.menuVisible
          }
        }
      ],
      [
        {
          label: 'menu.register',
          icon: faUserPlus,
          visible: () => !this.loggedIn(),
          routerLink: '/register',
          command: () => {
            this.hideMenu()
          }
        },
        {
          label: 'menu.login',
          icon: faArrowRightToBracket,
          visible: () => !this.loggedIn(),
          routerLink: '/login',
          command: () => {
            this.hideMenu()
          }
        },
        {
          label: 'mobileDivider',
          visible: () => !this.loggedIn(),
          divider: true
        },
        {
          label: 'menu.home',
          icon: faHouse,
          visible: () => this.loggedIn(),
          routerLink: '/',
          command: () => {
            this.hideMenu()
          }
        },
        {
          label: 'menu.exploreWafrn',
          icon: faCompass,
          visible: () => !this.loggedIn(),
          routerLink: '/dashboard/exploreLocal',
          command: () => {
            this.hideMenu()
          }
        },
        {
          label: 'menu.explore',
          icon: faCompass,
          visible: () => this.loggedIn(),
          items: [
            {
              label: 'menu.dashboard',
              icon: faHouse,
              visible: () => this.loggedIn(),
              routerLink: '/dashboard',
              command: () => {
                this.hideMenu()
              }
            },
            {
              label: 'menu.exploreWafrn',
              icon: faServer,
              visible: () => this.loggedIn(),
              routerLink: '/dashboard/exploreLocal',
              command: () => {
                this.hideMenu()
              }
            },
            {
              label: 'menu.exploreFediverse',
              icon: faCompass,
              visible: () => this.loggedIn(),
              routerLink: '/dashboard/explore',
              command: () => {
                this.hideMenu()
              }
            },
            {
              label: 'menu.privateMessages',
              icon: faEnvelope,
              visible: () => this.loggedIn(),
              routerLink: '/dashboard/private',
              command: () => {
                this.hideMenu()
              }
            },
            {
              label: 'menu.search',
              icon: faSearch,
              visible: () => this.loggedIn(),
              routerLink: '/dashboard/search',
              command: () => {
                this.hideMenu()
              }
            }
          ]
        },
        {
          label: 'menu.notifications',
          icon: faBell,
          visible: () => this.loggedIn(),
          badge: this.notifications,
          routerLink: '/dashboard/notifications',
          command: () => {
            this.hideMenu()
          }
        },
        {
          label: 'menu.myBlog',
          icon: faUser,
          visible: () => this.loggedIn(),
          routerLinkDynamic: computed(() => '/blog/' + this.currentAccount()?.url),
          command: () => {
            this.hideMenu()
          }
        }
      ],
      [
        {
          label: 'menu.writeWoot',
          icon: faPencil,
          visible: () => this.loggedIn(),
          routerLink: '/editor',
          command: async () => {
            this.hideMenu()
            this.openEditor()
          }
        }
      ]
    ]

    this.menuLinks = [
      {
        label: 'menu.about',
        routerLink: '/about'
      },
      {
        label: 'menu.privacy',
        routerLink: '/privacy'
      },
      {
        label: 'menu.faq',
        url: 'https://wafrn.net/faq/overview.html'
      },
      {
        label: 'menu.source',
        url: 'https://codeberg.org/wafrn/wafrn'
      },
      {
        label: 'menu.patreon',
        url: 'https://patreon.com/wafrn'
      },
      {
        label: 'menu.kofi',
        url: 'https://ko-fi.com/wafrn'
      }
    ]
  }
}
