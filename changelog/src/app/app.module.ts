import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from "@angular/material/toolbar";
import { BoardsComponent } from "./components/boards/boards.component";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule } from "@angular/material/paginator";
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from "./utils/page-not-found/page-not-found.component";
import { MatCardModule } from "@angular/material/card";
import { NavigationBarComponent } from './utils/navigation-bar/navigation-bar.component';
import { JiraComponent } from './components/jira/jira.component';
import { AllCommitsComponent } from './components/all-commits/all-commits.component';
import { CommitsComponent } from "./utils/commits/commits.component";
import { ToastrModule } from 'ngx-toastr';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { DatePipe } from '@angular/common';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'allCommits'
  },
  {
    path: 'allCommits',
    component: AllCommitsComponent
  },
  {
    path: 'jira',
    component: JiraComponent
  },
  {
    path: 'boards',
    component: BoardsComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {enableTracing: false}),
    ToastrModule.forRoot(),
    HttpClientModule,
    BrowserModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    BoardsComponent,
    PageNotFoundComponent,
    NavigationBarComponent,
    JiraComponent,
    AllCommitsComponent,
    CommitsComponent
  ],
  providers: [HttpClient, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
