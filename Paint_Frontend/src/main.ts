import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, icons } from 'lucide-angular';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),

    // 🔹 Add HttpClient so your backend shape API works
    importProvidersFrom(HttpClientModule),

    // 🔹 Lucide icons
    importProvidersFrom(
      LucideAngularModule.pick(icons)
    )
  ]
}).catch(err => console.error(err));
