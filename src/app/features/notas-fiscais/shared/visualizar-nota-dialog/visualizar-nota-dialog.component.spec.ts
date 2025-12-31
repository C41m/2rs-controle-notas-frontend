import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarNotaDialogComponent } from './visualizar-nota-dialog.component';

describe('VisualizarNotaDialogComponent', () => {
  let component: VisualizarNotaDialogComponent;
  let fixture: ComponentFixture<VisualizarNotaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarNotaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarNotaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
