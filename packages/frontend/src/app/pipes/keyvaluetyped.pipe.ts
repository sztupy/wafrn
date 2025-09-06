import { KeyValue, KeyValuePipe } from '@angular/common'
import { Pipe, PipeTransform, ɵdefaultKeyValueDiffers } from '@angular/core'

@Pipe({
  name: 'KeyValue',
  standalone: true
})
export class KeyValueTypedPipe implements PipeTransform {
  keyValuePipe = new KeyValuePipe(ɵdefaultKeyValueDiffers)

  transform<V extends Record<string, unknown>>(input: V, compareFn = (_a: V, _b: V) => 0) {
    return this.keyValuePipe.transform(
      input,
      compareFn as unknown as Parameters<typeof this.keyValuePipe.transform>[1]
    ) as Array<KeyValue<keyof V, V[keyof V]>>
  }
}
