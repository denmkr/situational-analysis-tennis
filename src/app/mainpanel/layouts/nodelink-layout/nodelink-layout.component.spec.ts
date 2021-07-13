import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodelinkLayoutComponent } from './nodelink-layout.component';

describe('NodelinkLayoutComponent', () => {
  let component: NodelinkLayoutComponent;
  let fixture: ComponentFixture<NodelinkLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodelinkLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodelinkLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
