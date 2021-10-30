import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogComponent } from '@app/dialog.component';
import { GetDataService } from '@app/getdata.service';
import { take } from 'rxjs/operators';
import { ErrorService } from '@app/error.service';


@Component({
	selector: 'syr-new-device',
	template: `
        <h1 mat-dialog-title> New type
            <button mat-icon-button class="close-icon" (click)="dialogRef.close()">
                <mat-icon>close</mat-icon>
            </button>
        </h1>
        <form [formGroup]="form" (ngSubmit)="addDeviceType()">
            <mat-form-field class="input-area">
                <input cdkFocusRegionStart matInput placeholder="Name" formControlName="name"/>
            </mat-form-field>
            <mat-form-field class="input-area">
                <input type="number" matInput placeholder="Height" formControlName="height"/>
            </mat-form-field>
            <div>
                <span>Front image </span>
				<mat-icon class="attachment-icon" (click)="front.click()">attachment</mat-icon>
                <span [innerHTML]="form.get('front').value"></span>
                <input #front placeholder="Front" formControlName="front" type="file" class="file-input input-area"/>
            </div>

            <div>
                <span>Rear image </span>
				<mat-icon class="attachment-icon" (click)="rear.click()">attachment</mat-icon>
				<span [innerHTML]="form.get('rear').value"></span>
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

export class NewDeviceTypeComponent implements OnInit {

	@ViewChild('front') frontFileInput: ElementRef;
	@ViewChild('rear') rearFileInput: ElementRef;

	constructor(
		public dialogRef: MatDialogRef<DialogComponent>,
		private fb: FormBuilder,
		private service: GetDataService,
		private errorService: ErrorService,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) {
	}
	form: FormGroup;

	ngOnInit(): void {
		this.form = this.fb.group({
			name: ['', Validators.required],
			height: ['', Validators.required],
			rear: ['', Validators.required],
			front: ['', Validators.required]
		});
	}

	addDeviceType() {
		const formData: FormData = new FormData();

		formData.append('name', this.form.get('name').value);
		formData.append('height', this.form.get('height').value);

		formData.append('pictures', this.frontFileInput.nativeElement.files[0], 'front');
		formData.append('pictures', this.rearFileInput.nativeElement.files[0], 'rear');

		this.service.createDeviceType(formData).pipe(take(1)).subscribe(() => {
			this.dialogRef.close('afterSave');
		}, (err) => {
			this.errorService.handleError(err);
		})
	}
}
