import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoPlayerComponent } from './mainpanel/layouts/video-player/video-player.component';
import { LinearLayoutComponent } from './mainpanel/layouts/linear-layout/linear-layout.component';
import { NodelinkLayoutComponent } from './mainpanel/layouts/nodelink-layout/nodelink-layout.component';

/*
const routes: Routes = [
  { path: 'video-player', component: VideoPlayerComponent },
  { path: 'linear-layout', component: LinearLayoutComponent },
  { path: 'nodelink-layout', component: NodelinkLayoutComponent }
];
*/

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
