import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembreSelectionComponent } from './membre-selection.component';

describe('MembreSelectionComponent', () => {
  let component: MembreSelectionComponent;
  let fixture: ComponentFixture<MembreSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembreSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembreSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
