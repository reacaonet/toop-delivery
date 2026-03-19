import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageBankComponent } from './image-bank.component';

describe('ImageBankComponent', () => {
  let component: ImageBankComponent;
  let fixture: ComponentFixture<ImageBankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageBankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
