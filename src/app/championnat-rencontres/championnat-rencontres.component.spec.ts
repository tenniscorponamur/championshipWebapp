import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionnatRencontresComponent } from './championnat-rencontres.component';

describe('ChampionnatRencontresComponent', () => {
  let component: ChampionnatRencontresComponent;
  let fixture: ComponentFixture<ChampionnatRencontresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampionnatRencontresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampionnatRencontresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
