import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GetDataService } from '@app/getdata.service';
import { LoadFail, LoadTypesOfDevices, LoadTypesOfDevicesSuccess } from './types-of-devices.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DeviceType } from '@app/types-of-devices/types-of-devices.model';

@Injectable()
export class TypesOfDevicesEffects {

	public loadType$ = createEffect(() => this.actions$.pipe(
		ofType(LoadTypesOfDevices),
		switchMap(() => this.service.getDeviceTypes().pipe(
			map((types: DeviceType[]) => LoadTypesOfDevicesSuccess({ payload: types })),
			catchError((err: Error) => of(LoadFail({ payload: err })))
		))
	))

	constructor(
		private actions$: Actions,
		private service: GetDataService,
	) {}
}

