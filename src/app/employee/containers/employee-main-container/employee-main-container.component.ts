import { Component, OnInit } from '@angular/core';
import * as EmployeeActions from './../../state/actions/employee.actions';
import * as fromEmployeeReducer from './../../state/reducers';
import { Store, ActionsSubject } from '@ngrx/store';
import { GetEmployees } from '../../models/get-employees';
import { Observable, Subject } from 'rxjs';
import { Employee } from '../../models/employee';
import { takeUntil } from 'rxjs/operators';
import { ofType } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeDetailContainerComponent } from '../employee-detail-container/employee-detail-container.component';
import { EmployeeEditContainerComponent } from '../employee-edit-container/employee-edit-container.component';
import { Constants } from '../../../constants/constans';
import { EmployeeNewContainerComponent } from '../employee-new-container/employee-new-container.component';
import { ConfirmData } from '../../../shared/models/confirm-data';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { BestEmployee } from '../../models/best-employee';

@Component({
  selector: 'app-employee-main-container',
  templateUrl: './employee-main-container.component.html',
  styleUrls: ['./employee-main-container.component.scss']
})
export class EmployeeMainContainerComponent implements OnInit {

  addEmploye: string;
  request: GetEmployees;

  constructor(
    private actionsSubject$: ActionsSubject,
    private confirm: ConfirmService,
    private dialog: MatDialog,
    private store: Store<fromEmployeeReducer.EmployeeState>) { }

  bestEmployee$: Observable<BestEmployee> = this.store.select(fromEmployeeReducer.getBestEmployee);
  employees$: Observable<Employee[]> = this.store.select(fromEmployeeReducer.getEmployees);
  length$: Observable<number> = this.store.select(fromEmployeeReducer.getTotalRecords);
  protected ngUnsubscribe: Subject<any> = new Subject<any>();

  offset = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageSize = this.pageSizeOptions[0];

  ngOnInit(): void {
    this.addEmploye = Constants.ADD_EMPLOYEE_TITLE;
    this.triggers();
    this.refreshData(this.pageSizeOptions[0], this.offset);
  }

  triggers(): void {
    this.actionsSubject$
      .pipe(takeUntil(this.ngUnsubscribe))
      .pipe(ofType(EmployeeActions.EmployeeActionTypes.DeleteEmployeeByIdComplete))
      .subscribe(_ => this.refreshData(this.pageSize, this.offset));
  }

  changePage(event: any): void {
    this.offset = event.pageIndex * event.pageSize;
    this.pageSize = event.pageSize;
    this.refreshData(event.pageSize, this.offset);
  }

  onDelete(event: any) {
    console.log(event);

    const confirmData = new ConfirmData(
      `${Constants.DELETE_EMPLOYEE_TITLE} - ${event.firstName} ${event.lastName}`,
      Constants.DELETE_EMPLOYEE_MESSAGE,
      true
    );
    this.confirm.confirm(confirmData).subscribe(result => {
      if (result) {
        this.store.dispatch(new EmployeeActions.DeleteEmployeeById(event.id));
      }
    });
  }

  onAdd(): void {
    const dialogRef = this.dialog.open(EmployeeNewContainerComponent,
      {
        panelClass: 'employee-modal-dialog'
      }
    );
    dialogRef.afterClosed().subscribe(_ => this.refreshData(this.pageSize, this.offset));
  }

  onDetail(event: any): void {
    const dialogRef = this.dialog.open(EmployeeDetailContainerComponent,
      {
        panelClass: 'employee-modal-dialog',
        data: { employeeId: event.id }
      }
    );
    dialogRef.afterClosed().subscribe(_ => this.refreshData(this.pageSize, this.offset));
  }

  onEdit(event) {
    const dialogRef = this.dialog.open(EmployeeEditContainerComponent, {
      width: '100%',
      data: { employeeId: event.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.refreshData(this.pageSize, this.offset);
    });
  }

  refreshData(pageSize, offset): void {
    this.request = new GetEmployees(pageSize, offset);
    this.store.dispatch(new EmployeeActions.LoadEmployees(this.request));
    this.store.dispatch(new EmployeeActions.GetBestEmployee());
  }
}
