import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotasRecebidasListComponent } from './notas-recebidas-list.component';

describe('NotasRecebidasListComponent', () => {
  let component: NotasRecebidasListComponent;
  let fixture: ComponentFixture<NotasRecebidasListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotasRecebidasListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotasRecebidasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
