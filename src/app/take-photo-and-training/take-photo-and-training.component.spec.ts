import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakePhotoAndTrainingComponent } from './take-photo-and-training.component';

describe('TakePhotoAndTrainingComponent', () => {
  let component: TakePhotoAndTrainingComponent;
  let fixture: ComponentFixture<TakePhotoAndTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TakePhotoAndTrainingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TakePhotoAndTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
