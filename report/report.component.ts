import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorService } from '@app/error.service';
import { GetDataService } from '@app/getdata.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Registration } from '@app/registration/registration.model';
import { AppState, getRegistration } from '@app/store/selectors';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, Subject } from 'rxjs';
import { SystemInfo } from '@app/interfaces';

@Component({
	selector: 'syr-report',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {
	@ViewChild('autosize') autosize: CdkTextareaAutosize;

	box: Registration;
	form: FormGroup;
	recommendations: FormArray;
	loadingPdf = false;
	loadingLpars = false;
	destroyed$ = new Subject();

	constructor(
		public dialogRef: MatDialogRef<ReportComponent>,
		private errorService: ErrorService,
		private store: Store<AppState>,
		private service: GetDataService,
		private fb: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data,
	) {
	}

	ngOnInit() {
		this.formInit();

		this.insertDataFromRegistration();

		this.updateLparName();
	}

	/** initialize the form with initial values */
	formInit(){
		this.recommendations = new FormArray([this.fb.group({
			lpar_name: [null],
			recommendation: ['', Validators.required],
			uploadID: [null],
		})]);

		this.form = this.fb.group({
			yadro_name: ['', Validators.required],
			yadro_mtm: ['', Validators.required],
			yadro_sn: ['', Validators.required],
			support_start: ['', Validators.required],
			support_end: ['', Validators.required],
			years: ['', Validators.required],
			sla: ['', Validators.required],
			doc_date: ['', Validators.required],
			vendor: ['', Validators.required],
			vendor_sn: ['', Validators.required],
			vendor_mtm: ['', Validators.required],
			recommendations: this.recommendations
		});

	}

	/** inserts data into the form from registration */
	insertDataFromRegistration(){
		this.store.select(getRegistration)
			.pipe(takeUntil(this.destroyed$))
			.subscribe(regs => {
				this.box = regs.filter(reg => reg.system_id === this.data.systemId)[0];
				this.form.patchValue({
					yadro_mtm: this.box.yadro_mtm,
					yadro_name: this.box.yadro_name,
					yadro_sn: this.box.yadro_sn,
					sla: this.box.sla,
					vendor: this.box.vendor,
					vendor_mtm: this.box.vendor_mtm,
					vendor_name: this.box.vendor_name,
					vendor_sn: this.box.vendor_sn,
					years: this.box.years,
					support_start: this.box.support_start,
					support_end: this.box.support_end,
					doc_date: this.box.doc_date,
				});
			});
	}

	/** get data by lpar_name and add it to the form */
	updateLparName(){
		const streams: Record<string, Observable<SystemInfo>> = {};
		this.data.uploadIDs.forEach(uploadID => streams[uploadID] = this.service.getSystemInfo(uploadID))
		this.loadingLpars = true;

		forkJoin(streams).pipe(takeUntil(this.destroyed$)).subscribe((dataSet: Record<string, SystemInfo>) => {
			for (const uploadID in dataSet){
				if (dataSet.hasOwnProperty(uploadID)){
				 const data = dataSet[uploadID];
					if (data && Array.isArray(data.summary)) {
						data.summary.forEach((elem) => {
							if (elem.key === 'lpar_name') {
								this.addRecommendations(elem.value, uploadID);
							}
						});
					}
				}
			}
			this.loadingLpars = false;
		}, err => {
			this.loadingLpars = false;
			this.errorService.handleError(err)
		})
	}

	/** Adds recommendations controls for the current form */
	addRecommendations(lpar_name: string, uploadID: string) {
		(<FormArray> this.form.get('recommendations')).push(
			this.fb.group({
				lpar_name: [lpar_name, Validators.required],
				recommendation: ['', Validators.required],
				uploadID: [uploadID],
			})
		);
	}

	/** submits data */
	submit() {
		const data = this.form.value;
		this.loadingPdf = true;

		this.service.sendReport(data).pipe(takeUntil(this.destroyed$)).subscribe(response => {
			this.loadingPdf = false;

			const a = document.createElement('a');
			document.body.appendChild(a);
			a.href = window.URL.createObjectURL(new Blob([response as BlobPart], { type: 'application/pdf' }));
			a.download = this.box.sn + '.pdf';
			a.click();
			window.URL.revokeObjectURL(a.href);
			document.body.removeChild(a);

			this.dialogRef.close();
		}, (err) => {
			this.loadingPdf = false;
			if (err instanceof Blob) {
				err['text']().then((text) => {
					err = JSON.parse(text);
					this.errorService.handleError(err);
				});
			} else {
				this.errorService.handleError(err);
			}
		});
	}

	ngOnDestroy() {
		this.destroyed$.next();
		this.destroyed$.complete();
	}
}
