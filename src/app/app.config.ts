import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBarChart,
  lucideBookOpen,
  lucideCheck,
  lucideCircle,
  lucideCode,
  lucideHeadphones,
  lucideLayers,
  lucideLogOut,
  lucidePencil,
  lucidePlus,
  lucideServer,
  lucideTrash2,
  lucideUsers,
  lucideUserPlus,
  lucideVideo,
  lucideX,
  lucideLock,
  lucideLoader
} from '@ng-icons/lucide';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideIcons({
      lucideArrowRight,
      lucideBarChart,
      lucideBookOpen,
      lucideCheck,
      lucideCircle,
      lucideCode,
      lucideHeadphones,
      lucideLayers,
      lucideLogOut,
      lucidePencil,
      lucidePlus,
      lucideServer,
      lucideTrash2,
      lucideUsers,
      lucideUserPlus,
      lucideVideo,
      lucideX,
      lucideLock,
      lucideLoader
    })
  ]
};
