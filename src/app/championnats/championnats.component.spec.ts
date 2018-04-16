import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionnatsComponent } from './championnats.component';

describe('ChampionnatsComponent', () => {
  let component: ChampionnatsComponent;
  let fixture: ComponentFixture<ChampionnatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampionnatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampionnatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
