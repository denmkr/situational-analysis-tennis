import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodelinkSliderComponent } from './nodelink-slider.component';

describe('NodelinkSliderComponent', () => {
  let component: NodelinkSliderComponent;
  let fixture: ComponentFixture<NodelinkSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodelinkSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodelinkSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
