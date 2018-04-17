import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionnatEquipesComponent } from './championnat-equipes.component';

describe('ChampionnatEquipesComponent', () => {
  let component: ChampionnatEquipesComponent;
  let fixture: ComponentFixture<ChampionnatEquipesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampionnatEquipesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampionnatEquipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
