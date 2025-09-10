import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { Injectable, InjectionToken, Injector } from '@angular/core'
import { ImageOverlayComponent } from '../components/image-overlay/image-overlay.component'

export type ImageOverlayData = { url: string; backgroundSize: string }
export type OverlayData = ImageOverlayData

export const DATA_TOKEN = new InjectionToken<string>('portal-data')

@Injectable({ providedIn: 'root' })
export class OverlayService {
  constructor(private overlay: Overlay) {}

  createOverlay(data: OverlayData, component: any): OverlayRef {
    const overlayRef = this.overlay.create()
    const injector = Injector.create({ providers: [{ provide: DATA_TOKEN, useValue: data }] })

    const overlayPortal = new ComponentPortal(component, null, injector)
    overlayRef.attach(overlayPortal)

    return overlayRef
  }

  public createImageOverlay(url: string, backgroundSize: string = 'contain') {
    const imageOverlayRef = this.createOverlay({ url, backgroundSize }, ImageOverlayComponent)
    setTimeout(() => {
      imageOverlayRef.dispose()
    }, 2000)

    return imageOverlayRef
  }
}
