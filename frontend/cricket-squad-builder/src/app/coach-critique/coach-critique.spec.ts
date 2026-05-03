import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachCritique } from './coach-critique';

describe('CoachCritique', () => {
  let component: CoachCritique;
  let fixture: ComponentFixture<CoachCritique>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachCritique],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachCritique);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
