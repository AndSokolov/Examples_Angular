import { createAction, props } from '@ngrx/store';
import { DeviceType } from '@app/types-of-devices/types-of-devices.model';

export const LoadTypesOfDevices = createAction(
	'[TYPES] Init'
)

export const LoadTypesOfDevicesSuccess = createAction(
	'[TYPES] Load success',
	props<{ payload: DeviceType[] }>()
)

export const LoadFail = createAction(
	'[TYPES] Load fail',
	props<{ payload: Error }>()
);
