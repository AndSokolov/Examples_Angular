import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetDataService } from '@app/getdata.service';
import { ErrorService } from '@app/error.service';
import { take } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@app/dialog.component';

export interface Version {
	version: string,
	system_type: string	
}

@Component({
	selector: 'syr-regexp-version',
	templateUrl: './regexp-version.component.html',
	styleUrls: ['./regexp-version.component.scss']
})
export class RegexpVersionComponent implements OnInit {
	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: false }) sort: MatSort;

	constructor(
		private service: GetDataService,
		private dialog: MatDialog,
		private errorService: ErrorService,
		private fb: FormBuilder
	) {}

	duplicateEntry = false;
	dataSource = new MatTableDataSource<Version>();
	form: FormGroup;
	displayedColumns = ['system_type', 'version', 'action'];

	ngOnInit() {
		this.form = this.fb.group({
			system_type: ['', Validators.required],
			version: ['', Validators.compose([Validators.required, Validators.maxLength(200)])]
		});
		this.getVersions();
	}

	/** Transform data to Version interface */
	dataTransform(data: any): Array<Version> {
		const versions: Array<Version> = [];
		for (const system_type in data) {
			if (data.hasOwnProperty(system_type) && Array.isArray(data[system_type])) {
				data[system_type].forEach((version) => {
					versions.push({ system_type, version })
				});
			}
		}
		return versions;
	}

	/** Get Versions */
	getVersions(){
		this.service.getVersions().pipe(take(1)).subscribe((data) => {
			this.dataSource.data = data ? this.dataTransform(data) : [];
			this.dataSource.sort = this.sort;
			this.dataSource.paginator = this.paginator;
		}, err => this.errorService.handleError(err));
	}

	/** Save Version */
	save() {
		const version: Version = this.form.value;
		this.duplicateEntry = this.checkDuplicateEntry(version);
		if (!this.duplicateEntry) {
			this.service.createVersion(version).pipe(take(1)).subscribe(() => {
				this.form.reset();
				this.form.markAsPristine();
				this.getVersions();
			}, err => this.errorService.handleError(err));
		}
	}

	/** Delete Version */
	delete(type: string, version: string) {
		const dialogRef = this.dialog.open(DialogComponent, {
			width: '250px',
			data: {
				expected: 'yes',
				confirmation: 'yes'
			}
		});
		dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
			if (dialogRef.componentInstance.yes) {
				this.service.deleteVersion(type, version).pipe(take(1)).subscribe(() => {
					this.getVersions();
				}, err => this.errorService.handleError(err));
			}
		});
	}

	/** check record for uniqueness */
	checkDuplicateEntry(entry: Version): boolean{
		const data: Array<Version> = this.dataSource.data;
		return data.some((item) => item.system_type === entry.system_type && item.version === entry.version);
	}
}
