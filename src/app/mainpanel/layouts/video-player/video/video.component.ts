import { Component, OnInit, ElementRef, EventEmitter, ViewChild, Output, HostListener } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.less']
})
export class VideoComponent implements OnInit {
  @ViewChild('video', {static: false}) video: ElementRef;
  @ViewChild('source', {static: false}) source: ElementRef;

  @Output() onCurrentTimeChange = new EventEmitter<number>();
  @Output() onVideoPlayedPaused = new EventEmitter<boolean>();

  videoLink: string;
  startLimit: number;
  endLimit: number;
  playbackRate: number = 1.0;
  isLoop: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('wheel', ['$event'])
  onWheelScroll(event: WheelEvent) {
    const delta = event.deltaY || event.detail;
    let secondsShift = 0.0333667;

    //if (event.shiftKey) secondsShift *= 5;
    this.pause();

    if (delta > 0) this.video.nativeElement.currentTime += secondsShift;
    else this.video.nativeElement.currentTime -= secondsShift;
  }

  setSourceVideo(videoLink: string) {
    this.videoLink = videoLink;

    this.pause();
    this.source.nativeElement.setAttribute('src', videoLink);
    this.video.nativeElement.load();
  }

  timeupdated() {
    let currentTime = this.video.nativeElement.currentTime;
    if (currentTime >= this.endLimit) {
    	// if loop is activated
    	if (this.isLoop) currentTime = this.startLimit;
    	else {
    		currentTime = this.endLimit;
    		this.pause();
    	}

    	this.video.nativeElement.currentTime = currentTime;
    }

    this.onCurrentTimeChange.emit(currentTime);
  }

  changePlaybackRate(speed) {
    this.playbackRate = speed;
    this.video.nativeElement.playbackRate = speed;
  }

  updateVideoTime(start, end) {
    const startMoment = moment.utc(start);
    const endMoment = moment.utc(end);

    const startSeconds = +moment.duration(startMoment.format("HH:mm:ss.SSS")).asSeconds();
    const endSeconds = +moment.duration(endMoment.format("HH:mm:ss.SSS")).asSeconds();

    this.pause();
    this.source.nativeElement.setAttribute('src', `${this.videoLink}#t=${startSeconds},${endSeconds}`);
    this.video.nativeElement.load();
    this.video.nativeElement.playbackRate = this.playbackRate;

    this.startLimit = startSeconds;
    this.endLimit = endSeconds;
  }

  updatePlayBoundaries(start, end) {
    this.startLimit = start;
    this.endLimit = end;
  }

  updateCurrentTime(time) {
    this.video.nativeElement.currentTime = time;
  	// this.play();
  }

  getCurrentTime() {
    return this.video.nativeElement.currentTime;
  }

  played() {
    this.onVideoPlayedPaused.emit(true);
  }

  paused() {
    this.onVideoPlayedPaused.emit(false);
  }


  /**** Control events ****/
  pause() {
    this.video.nativeElement.pause();
  }

  play() {
    this.video.nativeElement.play();
  }

  playPause() {
    if (this.video.nativeElement.paused) this.video.nativeElement.play();
    else this.video.nativeElement.pause();
  }

  enableLoop(enabled: boolean) {
    this.isLoop = enabled;
  }

}