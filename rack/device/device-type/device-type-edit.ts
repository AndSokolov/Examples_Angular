import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@app/dialog.component';
import { GetDataService } from '@app/getdata.service';
import { ErrorService } from '@app/error.service';
import { DeviceType } from '@app/types-of-devices/types-of-devices.model';
import { take } from 'rxjs/operators';


@Component({
	selector: 'syr-device-type-edit',
	template: `
        <h1 mat-dialog-title> Edit device type
            <button mat-icon-button class="close-icon" (click)="dialogRef.close()">
                <mat-icon>close</mat-icon>
            </button>
        </h1>
        <form [formGroup]="form" (ngSubmit)="editDeviceType()">
            <mat-form-field class="input-area">
                <input cdkFocusRegionStart matInput placeholder="Name" formControlName="name"/>
            </mat-form-field>
            <mat-form-field class="input-area">
                <input type="number" matInput placeholder="Height" formControlName="height"/>
            </mat-form-field>
            <div>
                <span>Front image </span>
                <mat-icon class="attachment-icon" (click)="front.click()">attachment</mat-icon>
                <span [innerHTML]="form.get('front').value || 'current image'"></span>
                <input #front placeholder="Front" formControlName="front" type="file" class="file-input input-area"/>
            </div>

            <div>
                <span>Rear image </span>
                <mat-icon class="attachment-icon" (click)="rear.click()">attachment</mat-icon>
                <span [innerHTML]="form.get('rear').value || 'current image'"></span>
                <input #rear placeholder="Rear" formControlName="rear" type="file" class="file-input input-area"/>
            </div>
            <div>
                <button id="submit" mat-raised-button type="submit" [disabled]="form.invalid">Save</button>
            </div>
        </form>
	`,
	styles: ['.close-icon { float: right } .input-area { width: 100%; display: block; margin: auto; } ' +
	'#submit {float: right}  .file-input { opacity: 0; width: 0; } .attachment-icon{ display: inline-block; vertical-align: bottom; margin: 0 5px}']
})

export class EditDeviceTypeComponent implements OnInit {
	form: FormGroup;
	@ViewChild('front') frontFileInput: ElementRef;
	@ViewChild('rear') rearFileInput: ElementRef;

	constructor(
		public dialogRef: MatDialogRef<DialogComponent>,
		private fb: FormBuilder,
		private service: GetDataService,
		private errorService: ErrorService,
		@Inject(MAT_DIALOG_DATA) public type: DeviceType,
	) {
	}

	ngOnInit(): void {
		this.form = this.fb.group({
			name: [this.type.name, Validators.required],
			height: [this.type.height, Validators.required],
			rear: [''],
			front: ['']
		});
	}

	editDeviceType() {
		const formData: FormData = new FormData();

		formData.append('name', this.form.get('name').value);
		formData.append('height', this.form.get('height').value);

		formData.append('front_pic_id', this.type.front_pic_id);
		formData.append('rear_pic_id', this.type.rear_pic_id);

		if (this.frontFileInput.nativeElement.files[0]) {
			formData.append('pictures', this.frontFileInput.nativeElement.files[0], 'front');
		}

		if (this.rearFileInput.nativeElement.files[0]) {
			formData.append('pictures', this.rearFileInput.nativeElement.files[0], 'rear');
		}

		this.service.editDeviceType(this.type.id, formData).pipe(take(1)).subscribe(() => {
			this.dialogRef.close('afterSave');
		}, (err) => {
			this.errorService.handleError(err);
		})
	}
}
