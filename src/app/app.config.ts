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
  lucideCheckCircle,
  lucideCode,
  lucideFlag,
  lucideHeadphones,
  lucideLayers,
  lucideLayoutDashboard,
  lucideLoader,
  lucideLock,
  lucideLogOut,
  lucidePencil,
  lucidePlus,
  lucideRotateCcw,
  lucideServer,
  lucideTrash2,
  lucideTrendingUp,
  lucideUserPlus,
  lucideUsers,
  lucideX
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
      lucideCheckCircle,
      lucideCode,
      lucideFlag,
      lucideHeadphones,
      lucideLayers,
      lucideLayoutDashboard,
      lucideLoader,
      lucideLock,
      lucideLogOut,
      lucidePencil,
      lucidePlus,
      lucideRotateCcw,
      lucideServer,
      lucideTrash2,
      lucideTrendingUp,
      lucideUserPlus,
      lucideUsers,
      lucideX
    })
  ]
};
