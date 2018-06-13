import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrainDetailComponent } from './terrain-detail.component';

describe('TerrainDetailComponent', () => {
  let component: TerrainDetailComponent;
  let fixture: ComponentFixture<TerrainDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerrainDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerrainDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
