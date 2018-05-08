import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionnatPoulesComponent } from './championnat-poules.component';

describe('ChampionnatPoulesComponent', () => {
  let component: ChampionnatPoulesComponent;
  let fixture: ComponentFixture<ChampionnatPoulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampionnatPoulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampionnatPoulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
