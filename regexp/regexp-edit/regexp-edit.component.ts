import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GetDataService } from '@app/getdata.service';
import { ErrorService } from '@app/error.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Checks } from '@app/checks';
import { take } from 'rxjs/operators';


@Component({
	selector: 'syr-regexp-edit',
	templateUrl: './regexp-edit.component.html',
	styleUrls: ['./regexp-edit.component.scss'],
})
export class RegexpEditComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<RegexpEditComponent>,
		private service: GetDataService,
		private errorService: ErrorService,
		@Inject(MAT_DIALOG_DATA) public data,
		private fb: FormBuilder
	) {}

	public form: FormGroup;
	versions: Array<string> = [];

	ngOnInit() {
		this.form = this.fb.group({
			system_type: ['', Validators.required],
			versions: [''],
			kdb_url: ['', Validators.required],
			regexp: ['', Validators.compose([Validators.required, Checks.regexpsValidator])],
			filename: ['', Validators.required],
		});

		if (this.data?.regexp) {
			this.form.setValue(this.data.regexp);
			if (this.data.regexp.system_type) {
				this.generateVersions(this.data.regexp.system_type);
			}
		}
	}

	/** generates versions by system type */
	generateVersions(type: string) {
		this.service.getVersion(type).pipe(take(1)).subscribe((data) => {
			this.versions = data;
		}, err => this.errorService.handleError(err))
	}

	/** Save Regexp */
	save(id: string) {
		const regexp = this.form.value;
		this.service.editRegexp(id, regexp).pipe(take(1)).subscribe((resp) => {
			this.dialogRef.close('afterSave');
		});
	}
}
