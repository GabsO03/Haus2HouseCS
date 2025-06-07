import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkerService } from '../../services/worker.service';
import { AlertService } from '../../../shared/services/alert.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Availability } from '../../interfaces/worker.interface';

@Component({
  selector: 'app-schedule-edit-page',
  standalone: false,
  templateUrl: './schedule-edit-page.component.html'
})
export class ScheduleEditPageComponent implements OnInit {
  public scheduleForm: FormGroup;
  public isLoading = true;
  public daysOfWeek = [
    { name: 'Lunes', index: 0 },
    { name: 'Martes', index: 1 },
    { name: 'Miércoles', index: 2 },
    { name: 'Jueves', index: 3 },
    { name: 'Viernes', index: 4 },
    { name: 'Sábado', index: 5 },
    { name: 'Domingo', index: 6 }
  ];

  constructor(
    private fb: FormBuilder,
    private workerService: WorkerService,
    private alertService: AlertService,
    private router: Router,
    private authService: AuthService
  ) {
    this.scheduleForm = this.fb.group({
      weeklyAvailability: this.fb.array(
        this.daysOfWeek.map(() => this.fb.group({
          morningStart: [''],
          morningEnd: [''],
          afternoonStart: [''],
          afternoonEnd: ['']
        }))
      )
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    const userId = localStorage.getItem('token')!;
    this.workerService.getWorkerHorario(userId).subscribe({
      next: (horario_semenal) => {
        this.loadWorkerSchedule(horario_semenal);
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.error('Error al cargar el horario');
        this.isLoading = false;
      }
    });
  }

  get weeklyAvailability(): FormArray {
    return this.scheduleForm.get('weeklyAvailability') as FormArray;
  }

  getFormControl(dayIndex: number, field: string): FormControl {
    const dayGroup = this.weeklyAvailability.at(dayIndex) as FormGroup;
    return dayGroup.get(field) as FormControl;
  }

  loadWorkerSchedule(availability: Availability[]) {
    // Relleno con los 7 días 
    const weeklySchedule = this.daysOfWeek.map(() => ({
      morningStart: '',
      morningEnd: '',
      afternoonStart: '',
      afternoonEnd: ''
    }));

    if(availability) {
      availability.forEach((availability: Availability) => {
        const dia = availability.dia;
        const horas = availability.horas;

        if (horas) {
          if (horas[0]) {
            const [start, end] = horas[0].split('-');
            weeklySchedule[dia].morningStart = start || '';
            weeklySchedule[dia].morningEnd = end || '';
          }
          if (horas[1]) {  
            const [start, end] = horas[1].split('-');
            weeklySchedule[dia].afternoonStart = start || '';
            weeklySchedule[dia].afternoonEnd = end || '';
          }
        }

      });

      this.scheduleForm.setControl('weeklyAvailability', this.fb.array(
        weeklySchedule.map(dia => this.fb.group({
          morningStart: [dia.morningStart],
          morningEnd: [dia.morningEnd],
          afternoonStart: [dia.afternoonStart],
          afternoonEnd: [dia.afternoonEnd]
        }))
      ));
    }
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const weeklyAvailability = this.weeklyAvailability.value.map((dia: any, index: number) => ({
      dia: index,
      horas: [
        dia.morningStart && dia.morningEnd ? `${dia.morningStart}-${dia.morningEnd}` : null,
        dia.afternoonStart && dia.afternoonEnd ? `${dia.afternoonStart}-${dia.afternoonEnd}` : null
      ]
    }));

    // console.log('Enviando al backend:', { horario_semanal: weeklyAvailability });

    this.workerService.updateWorkerSchedule(this.authService.currentUser!.id, { horario_semanal: weeklyAvailability })
      .subscribe({
        next: () => {
          this.alertService.success('Horario actualizado correctamente');
          this.router.navigate(['/helper/schedule']);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.alertService.error('Error al actualizar el horario');
          this.isLoading = false;
        }
      });
    }
}