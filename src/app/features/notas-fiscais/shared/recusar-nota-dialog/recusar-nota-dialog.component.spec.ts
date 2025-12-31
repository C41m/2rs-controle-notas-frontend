import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecusarNotaDialogComponent } from './recusar-nota-dialog.component';

describe('RecusarNotaDialogComponent', () => {
  let component: RecusarNotaDialogComponent;
  let fixture: ComponentFixture<RecusarNotaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecusarNotaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecusarNotaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
