import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorationViewComponent } from './exploration-view.component';

describe('ExplorationViewComponent', () => {
  let component: ExplorationViewComponent;
  let fixture: ComponentFixture<ExplorationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExplorationViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
