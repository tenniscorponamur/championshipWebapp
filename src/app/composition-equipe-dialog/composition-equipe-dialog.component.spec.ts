import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositionEquipeDialogComponent } from './composition-equipe-dialog.component';

describe('CompositionEquipeDialogComponent', () => {
  let component: CompositionEquipeDialogComponent;
  let fixture: ComponentFixture<CompositionEquipeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompositionEquipeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompositionEquipeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
