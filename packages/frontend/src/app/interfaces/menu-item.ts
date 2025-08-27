import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export interface MenuItem {
  label: string
  icon?: IconDefinition
  visible: () => boolean
  badge?: number
  items?: MenuItem[]
  routerLink?: string
  routerLinkDynamic?: () => string
  highlightRoute?: boolean
  url?: string
  command?: () => void
  divider?: boolean
}

export interface MenuLink {
  label: string
  routerLink?: string
  url?: string
}
