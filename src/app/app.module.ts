import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FaceRecognizeComponent } from './face-recognize/face-recognize.component';
import { MenuComponent } from './menu/menu.component';
import { TakePhotoAndTrainingComponent } from './take-photo-and-training/take-photo-and-training.component';

@NgModule({
    declarations: [
        AppComponent,
        FaceRecognizeComponent,
        TakePhotoAndTrainingComponent,
        MenuComponent,
    ],
    imports: [BrowserModule, AppRoutingModule, HttpClientModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
