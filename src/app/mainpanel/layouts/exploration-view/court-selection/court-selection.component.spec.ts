import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtSelectionComponent } from './court-selection.component';

describe('CourtSelectionComponent', () => {
  let component: CourtSelectionComponent;
  let fixture: ComponentFixture<CourtSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourtSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CourtSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
