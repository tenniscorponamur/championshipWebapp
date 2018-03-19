import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RencontreDetailComponent } from './rencontre-detail.component';

describe('RencontreDetailComponent', () => {
  let component: RencontreDetailComponent;
  let fixture: ComponentFixture<RencontreDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RencontreDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RencontreDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
