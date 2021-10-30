import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { GetDataService } from '@app/getdata.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorService } from '@app/error.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Device } from '@app/main/stand/stand.interface';
import { Store } from '@ngrx/store';
import { AppState, getTypesOfDevices } from '@app/selectors';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DialogComponent } from '@app/dialog.component';
import { DeviceType } from '@app/types-of-devices/types-of-devices.model';
import { UtilsService } from '@app/utils.service';

@Component({
	selector: 'syr-device',
	templateUrl: './device.component.html',
	styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit, OnChanges, OnDestroy {

	@Input() device: Device;
	@Input() rackHeight: number;
	@Output() isEdited = new EventEmitter<boolean>();
	@Output() isDeleted = new EventEmitter<boolean>();

	constructor(
		private fb: FormBuilder,
		private store: Store<AppState>,
		private service: GetDataService,
		private errorService: ErrorService,
		private utils: UtilsService,
		private dialog: MatDialog,
	) { }

	form: FormGroup;
	editMode: boolean;
	maxPosition: number;
	types: DeviceType[] = [];
	destroyed$ = new Subject();

	ngOnInit(): void {}

	ngOnChanges() {
		this.form = this.fb.group({
			drawer_type_id: [this.device.drawer_type_id, Validators.required],
			name: [this.device.name, Validators.required],
			position: [this.device.position, Validators.required],
			power: [this.device.power, Validators.required],
			serial_number: [this.device.serial_number, Validators.required],
			status: [this.device.status, Validators.required],
			weight: [this.device.weight, Validators.required],
			rack_id: [this.device.rack_id]
		});

		this.store.select(getTypesOfDevices).pipe(takeUntil(this.destroyed$)).subscribe((types: DeviceType[]) => {
			this.types = types;
		});

		this.updatePositionControl();
	}

	editDevice() {
		this.service.editDevice(this.device.id, this.form.value).pipe(take(1)).subscribe(() => {
			this.isEdited.emit(true);
			this.editMode = false;
		}, ((err) => this.errorService.handleError(err)))
	}

	deleteDevice() {
		const dialogRef = this.dialog.open(DialogComponent, {
			width: '250px',
			data: {
				expected: 'yes',
				confirmation: 'yes'
			}
		});

		dialogRef.afterClosed().subscribe(() => {
			if (dialogRef.componentInstance.yes) {
				this.service.deleteDevice(this.device.id).pipe(take(1)).subscribe(() => {
					this.isDeleted.emit(true);
				}, (err) => {
					this.errorService.handleError(err);
				});
			}
		});
	}

	/** updates the validation for the 'position' field */
	updatePositionControl() {
		const positionControl: AbstractControl = this.form.get('position');
		const type: DeviceType = this.types.find(item => item.id === this.form.get('drawer_type_id').value);
		if (type) {
			this.maxPosition = this.utils.setPositionValidator(positionControl, this.rackHeight, type.height);
		} else {
			positionControl.disable();
		}
	}

	ngOnDestroy() {
		this.destroyed$.next();
		this.destroyed$.complete();
	}
}
