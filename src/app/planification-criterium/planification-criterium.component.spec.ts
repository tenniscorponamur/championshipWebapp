import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanificationCriteriumComponent } from './planification-criterium.component';

describe('PlanificationCriteriumComponent', () => {
  let component: PlanificationCriteriumComponent;
  let fixture: ComponentFixture<PlanificationCriteriumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanificationCriteriumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanificationCriteriumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
