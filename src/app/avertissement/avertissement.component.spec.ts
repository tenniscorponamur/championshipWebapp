import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvertissementComponent } from './avertissement.component';

describe('AvertissementComponent', () => {
  let component: AvertissementComponent;
  let fixture: ComponentFixture<AvertissementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvertissementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvertissementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
