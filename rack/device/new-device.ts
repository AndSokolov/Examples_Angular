import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@app/dialog.component';
import { GetDataService } from '@app/getdata.service';
import { take } from 'rxjs/operators';
import { ErrorService } from '@app/error.service';
import { Observable } from 'rxjs';
import { AppState, getTypesOfDevices } from '@app/selectors';
import { Store } from '@ngrx/store';
import { DeviceType } from '@app/types-of-devices/types-of-devices.model';


@Component({
	selector: 'syr-new-device',
	template: `
        <h1 mat-dialog-title> New device
            <button mat-icon-button class="close-icon" (click)="dialogRef.close()">
                <mat-icon>close</mat-icon>
            </button>
        </h1>
        <form [formGroup]="form" (ngSubmit)="addDevice()">
            <mat-form-field class="input-area">
                <input cdkFocusRegionStart matInput placeholder="Name" formControlName="name"/>
            </mat-form-field>
			<mat-form-field class="input-area">
				<mat-select placeholder="Device type" formControlName="drawer_type_id">
					<mat-option *ngFor="let type of types$ | async" [value]="type.id">{{type.name}}</mat-option>
				</mat-select>
			</mat-form-field>
			<mat-form-field class="input-area">
                <mat-select placeholder="Status" formControlName="status">
                    <mat-option value="plan">plan</mat-option>
                    <mat-option value="production">production</mat-option>
                </mat-select>
			</mat-form-field>
            <mat-form-field class="input-area">
                <input type="number" matInput placeholder="Weight" formControlName="weight"/>
            </mat-form-field>
            <mat-form-field class="input-area">
                <input type="number" matInput placeholder="Power" formControlName="power"/>
            </mat-form-field>
            <mat-form-field class="input-area">
                <input matInput placeholder="Serial Number" formControlName="serial_number"/>
            </mat-form-field>

            <mat-form-field class="input-area">
                <input type="number" matInput placeholder="Position" formControlName="position"/>
            </mat-form-field>
            <div>
                <button id="submit" mat-raised-button type="submit" [disabled]="form.invalid">Save</button>
            </div>
        </form>
	`,
	styles: ['.close-icon { float: right } .input-area { width: 100%; display: block; margin: auto; } #submit { float: right }']
})

export class NewDeviceComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<DialogComponent>,
		private fb: FormBuilder,
		private service: GetDataService,
		private errorService: ErrorService,
		private store: Store<AppState>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) {}

	form: FormGroup;
	types$: Observable<DeviceType[]>;

	ngOnInit(): void {
		this.form = this.fb.group({
			drawer_type_id: ['', Validators.required],
			name: ['', Validators.required],
			position: [this.data.position, Validators.required],
			power: ['', Validators.required],
			serial_number: ['', Validators.required],
			status: ['', Validators.required],
			weight: ['', Validators.required],
			rack_id: [this.data.rackId]
		});

		this.types$ = this.store.select(getTypesOfDevices);
	}

	addDevice() {
		this.service.createDevice(this.form.value).pipe(take(1)).subscribe(() => {
			this.dialogRef.close('afterSave');
		}, (err) => {
			this.errorService.handleError(err);
		})
	}
}

