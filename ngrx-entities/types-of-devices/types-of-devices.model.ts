import { Observable } from 'rxjs';

export interface TypesOfDevicesState {
	types: DeviceType[];
	error: Error;
	isLoaded: boolean;
}

export interface DeviceType {
	id: string;
	name: string;
	height: number;
	front_pic_id: string;
	rear_pic_id: string;
	front_pic_url$?: Observable<string>;
	rear_pic_url$?: Observable<string>
}
