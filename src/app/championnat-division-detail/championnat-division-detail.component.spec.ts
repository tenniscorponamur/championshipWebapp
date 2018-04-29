import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionnatDivisionDetailComponent } from './championnat-division-detail.component';

describe('ChampionnatDivisionDetailComponent', () => {
  let component: ChampionnatDivisionDetailComponent;
  let fixture: ComponentFixture<ChampionnatDivisionDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampionnatDivisionDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampionnatDivisionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
