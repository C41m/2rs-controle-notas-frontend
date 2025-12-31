import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarNotaUsuarioDialogComponent } from './visualizar-nota-usuario-dialog.component';

describe('VisualizarNotaUsuarioDialogComponent', () => {
  let component: VisualizarNotaUsuarioDialogComponent;
  let fixture: ComponentFixture<VisualizarNotaUsuarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarNotaUsuarioDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarNotaUsuarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
