import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'derp' })
export class DerpPipe implements PipeTransform {
    transform(value, args) {
        if (Array.isArray(value))
            return Array.from(value);
        else
            return [value];
    }
}