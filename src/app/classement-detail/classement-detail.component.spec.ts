import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassementDetailComponent } from './classement-detail.component';

describe('ClassementDetailComponent', () => {
  let component: ClassementDetailComponent;
  let fixture: ComponentFixture<ClassementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassementDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
