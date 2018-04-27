import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionnatDivisionsComponent } from './championnat-divisions.component';

describe('ChampionnatDivisionsComponent', () => {
  let component: ChampionnatDivisionsComponent;
  let fixture: ComponentFixture<ChampionnatDivisionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampionnatDivisionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampionnatDivisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
