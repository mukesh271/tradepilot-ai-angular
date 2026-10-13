import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalScoreComponent } from './signal-score.component';

describe('SignalScoreComponent', () => {
  let component: SignalScoreComponent;
  let fixture: ComponentFixture<SignalScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalScoreComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SignalScoreComponent);
    component = fixture.componentInstance;
  });

  it('should display the strong label for scores above 90', () => {
    component.score = 95;
    fixture.detectChanges();
    expect(component.label).toBe('Strong');
    expect(fixture.nativeElement.textContent).toContain('95 / 100');
  });

  it('should display the avoid label below 60', () => {
    component.score = 45;
    fixture.detectChanges();
    expect(component.label).toBe('Avoid');
  });
});
