import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { GetDataService } from '@app/getdata.service';
import { ErrorService } from '@app/error.service';
import { MatTableDataSource } from '@angular/material/table';
import { map, take, takeUntil } from 'rxjs/operators';
import { DialogComponent } from '@app/dialog.component';
import { NewDeviceTypeComponent } from './new-device-type';
import { Store } from '@ngrx/store';
import { AppState, getTypesOfDevices } from '@app/selectors';
import { LoadTypesOfDevices } from '@app/entities/types-of-devices/types-of-devices.actions';
import { DeviceType } from '@app/types-of-devices/types-of-devices.model';
import { EditDeviceTypeComponent } from './device-type-edit';
import { Subject } from 'rxjs';

@Component({
	selector: 'syr-device-type',
	templateUrl: './device-type.component.html',
	styleUrls: ['./device-type.component.scss']
})
export class DeviceTypeComponent implements OnInit, OnDestroy {

	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: false }) sort: MatSort;

	constructor(
		private dialog: MatDialog,
		private service: GetDataService,
		private errorService: ErrorService,
		private store: Store<AppState>,
	) { }

	displayedColumns = ['name', 'height', 'front_pic', 'rear_pic', 'actions']
	dataSource = new MatTableDataSource<DeviceType>([]);
	destroy$ = new Subject();
	devicesIsLoaded: boolean;

	ngOnInit(): void {}
	
	getTypesOfDevices() {
		this.store.select(getTypesOfDevices).pipe(
			map(typesDevice => typesDevice ? typesDevice.map(type => this.addImageUrl(type)) : []),
			takeUntil(this.destroy$)
		).subscribe((typesDevice: DeviceType[]) => {
			this.dataSource.data = typesDevice;
			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;
			this.devicesIsLoaded = true;
		});
	}

	addImageUrl(initType: DeviceType): DeviceType {
		const type = JSON.parse(JSON.stringify(initType));
		type.front_pic_url$ = this.service.downloadDevicePicture(type.front_pic_id).pipe(map(img => img.url));
		type.rear_pic_url$ = this.service.downloadDevicePicture(type.rear_pic_id).pipe(map(img => img.url));
		return type;
	}

	addDeviceType() {
		const dialogRef = this.dialog.open(NewDeviceTypeComponent, { width: '400px' });
		dialogRef.afterClosed().subscribe((status) => {
			if (status === 'afterSave') {
				this.store.dispatch(LoadTypesOfDevices());
			}
		});
	}

	editType(e: MouseEvent, type: DeviceType) {
		e.stopPropagation();

		const dialogRef = this.dialog.open(EditDeviceTypeComponent, {
			width: '400px',
			data: type,
		});

		dialogRef.afterClosed().subscribe((status) => {
			if (status === 'afterSave') {
				this.store.dispatch(LoadTypesOfDevices());
			}
		});
	}

	deleteType(e: MouseEvent, id: string) {
		e.stopPropagation();

		const dialogRef = this.dialog.open(DialogComponent, {
			width: '250px',
			data: {
				expected: 'yes',
				confirmation: 'yes'
			}
		});

		dialogRef.afterClosed().subscribe(() => {
			if (dialogRef.componentInstance.yes) {
				this.service.deleteDeviceType(id).pipe(take(1)).subscribe(() => {
					this.store.dispatch(LoadTypesOfDevices());
				}, (err) => {
					this.errorService.handleError(err);
				});
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
