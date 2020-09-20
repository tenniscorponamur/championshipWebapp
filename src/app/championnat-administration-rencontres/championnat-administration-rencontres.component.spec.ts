import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionnatAdministrationRencontresComponent } from './championnat-administration-rencontres.component';

describe('ChampionnatAdministrationRencontresComponent', () => {
  let component: ChampionnatAdministrationRencontresComponent;
  let fixture: ComponentFixture<ChampionnatAdministrationRencontresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampionnatAdministrationRencontresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampionnatAdministrationRencontresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
