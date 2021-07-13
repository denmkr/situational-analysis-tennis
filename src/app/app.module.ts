import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router/';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomReuseStrategy } from './custom-reuse-strategy';
import { MatSliderModule } from '@angular/material/slider';

import { SituationpanelComponent } from './situationpanel/situationpanel.component';
import { SpectrumpanelComponent } from './spectrumpanel/spectrumpanel.component';
import { StatisticspanelComponent } from './statisticspanel/statisticspanel.component';
import { KeypanelComponent } from './keypanel/keypanel.component';
import { MainpanelComponent } from './mainpanel/mainpanel.component';
import { VideoPlayerComponent } from './mainpanel/layouts/video-player/video-player.component';
import { LinearLayoutComponent } from './mainpanel/layouts/linear-layout/linear-layout.component';
import { NodelinkLayoutComponent } from './mainpanel/layouts/nodelink-layout/nodelink-layout.component';
import { VideoComponent } from './mainpanel/layouts/video-player/video/video.component';
import { ControlsComponent } from './mainpanel/layouts/video-player/controls/controls.component';
import { WinbarComponent } from './topbar/winbar/winbar.component';
import { SituationsComponent } from './mainpanel/layouts/video-player/situations/situations.component';
import { TopbarComponent } from './topbar/topbar.component';
import { ExplorationViewComponent } from './mainpanel/layouts/exploration-view/exploration-view.component';
import { ScorePanelComponent } from './mainpanel/layouts/video-player/score-panel/score-panel.component';
import { MatchinfoComponent } from './topbar/matchinfo/matchinfo.component';
import { NodelinkSliderComponent } from './topbar/nodelink-slider/nodelink-slider.component';
import { CourtSelectionComponent } from './mainpanel/layouts/exploration-view/court-selection/court-selection.component';


@NgModule({
  declarations: [
    AppComponent,
    SituationpanelComponent,
    SpectrumpanelComponent,
    StatisticspanelComponent,
    KeypanelComponent,
    MainpanelComponent,
    VideoPlayerComponent,
    LinearLayoutComponent,
    NodelinkLayoutComponent,
    VideoComponent,
    ControlsComponent,
    WinbarComponent,
    SituationsComponent,
    TopbarComponent,
    ExplorationViewComponent,
    ScorePanelComponent,
    MatchinfoComponent,
    NodelinkSliderComponent,
    CourtSelectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    DragDropModule,
    CarouselModule,
    BrowserAnimationsModule,
    MatSliderModule,
    FormsModule
  ],
  providers: [
    /*{provide: RouteReuseStrategy, useClass: CustomReuseStrategy}*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
