import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RencontresComponent } from './rencontres.component';

describe('RencontresComponent', () => {
  let component: RencontresComponent;
  let fixture: ComponentFixture<RencontresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RencontresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RencontresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
