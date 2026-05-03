import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadBuilder } from './squad-builder';

describe('SquadBuilder', () => {
  let component: SquadBuilder;
  let fixture: ComponentFixture<SquadBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SquadBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(SquadBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
