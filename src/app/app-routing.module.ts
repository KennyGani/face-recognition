import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FaceRecognizeComponent } from './face-recognize/face-recognize.component';
import { MenuComponent } from './menu/menu.component';
import { TakePhotoAndTrainingComponent } from './take-photo-and-training/take-photo-and-training.component';

const routes: Routes = [
    { path: 'menu', component: MenuComponent },
    { path: 'face-recognize', component: FaceRecognizeComponent },
    {
        path: 'take-photo-and-training',
        component: TakePhotoAndTrainingComponent,
    },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
