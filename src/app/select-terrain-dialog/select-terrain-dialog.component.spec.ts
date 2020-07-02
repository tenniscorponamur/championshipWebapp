import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTerrainDialogComponent } from './select-terrain-dialog.component';

describe('SelectTerrainDialogComponent', () => {
  let component: SelectTerrainDialogComponent;
  let fixture: ComponentFixture<SelectTerrainDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectTerrainDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTerrainDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
