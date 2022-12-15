import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceRecognizeComponent } from './face-recognize.component';

describe('FaceRecognizeComponent', () => {
  let component: FaceRecognizeComponent;
  let fixture: ComponentFixture<FaceRecognizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceRecognizeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceRecognizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
