import * as fromEmployeeReducer from './employee.reducer';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

export interface EmployeeState {
    employee: fromEmployeeReducer.State;
}

export const reducers: ActionReducerMap<EmployeeState> = {
    employee: fromEmployeeReducer.EmployeeReducer
};

export const getEmployeeModuleState = createFeatureSelector<EmployeeState>('employee');
export const getEmployeeState = createSelector(getEmployeeModuleState, state => state.employee);

export const getBestEmployee = createSelector(getEmployeeState, fromEmployeeReducer.getBestEmployee);
export const getEmployee = createSelector(getEmployeeState, fromEmployeeReducer.getEmployee);
export const getEmployees = createSelector(getEmployeeState, fromEmployeeReducer.getEmployees);
export const getTotalRecords = createSelector(getEmployeeState, fromEmployeeReducer.getTotalRecords);