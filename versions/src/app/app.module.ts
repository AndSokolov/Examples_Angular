import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { GetVersionsService } from './services/get-versions.service';
import { LibraryVersionsComponent } from './components/stand/library-versions/library-versions.component';
import { HttpClientModule } from '@angular/common/http';
import { ServiceVersionsComponent } from './components/stand/service-versions/service-versions.component';
import { ErrorService } from './services/error.service';
import { ErrorComponent } from './components/error/error.component';
import { StandComponent } from './components/stand/stand.component';
import { BackendVersionsComponent } from './components/stand/backend-versions/backend-versions.component';

@NgModule({
  declarations: [
    AppComponent,
    StandComponent,
    LibraryVersionsComponent,
    ServiceVersionsComponent,
    ErrorComponent,
    BackendVersionsComponent,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule],
  providers: [GetVersionsService, ErrorService],
  bootstrap: [AppComponent],
})
export class AppModule {}
