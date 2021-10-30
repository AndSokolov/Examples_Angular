import { Action, createReducer, on } from '@ngrx/store';
import { LoadFail, LoadTypesOfDevicesSuccess } from './types-of-devices.actions';
import { TypesOfDevicesState } from './types-of-devices.model';

export const InitialState: TypesOfDevicesState = {
	types: [],
	error: null,
	isLoaded: false,
};

export const typesOfDevicesReducer = createReducer(
	InitialState,
	on(LoadTypesOfDevicesSuccess, (state, action) => ({
		types: action.payload,
		error: null,
		isLoaded: true
	})),
	on(LoadFail, (state, action) => ({
		...state,
		error: action.payload,
		isLoaded: true
	}))
);

export function reducer(state: TypesOfDevicesState, action: Action) {
	return typesOfDevicesReducer(state, action)
}
