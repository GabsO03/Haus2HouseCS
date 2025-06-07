import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Pipe({
  name: 'user_pfp',
  standalone: false
})
export class UserPfpPipe implements PipeTransform {
  transform(imagen: string | null): string {
    if (!imagen) {
      return 'no_image.png';
    }
    return `${environment.baseURL}/proxy-image/${imagen}`;
  }
}