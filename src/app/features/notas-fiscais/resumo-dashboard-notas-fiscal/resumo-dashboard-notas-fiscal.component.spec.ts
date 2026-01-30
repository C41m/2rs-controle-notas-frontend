import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoDashboardNotasFiscalComponent } from './resumo-dashboard-notas-fiscal.component';

describe('ResumoDashboardNotasFiscalComponent', () => {
  let component: ResumoDashboardNotasFiscalComponent;
  let fixture: ComponentFixture<ResumoDashboardNotasFiscalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoDashboardNotasFiscalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumoDashboardNotasFiscalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
