import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { GetDataService } from '@app/getdata.service';
import { ErrorService } from '@app/error.service';
import { MatSort } from '@angular/material/sort';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Regexp } from '@app/logs.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { RegexpEditComponent } from '@app/main/regexp/regexp-edit/regexp-edit.component';
import { Checks } from '@app/checks';
import { take } from 'rxjs/operators';
import { DialogComponent } from '@app/dialog.component';

@Component({
	selector: 'syr-regexp-create',
	templateUrl: './regexp-create.component.html',
	styleUrls: ['./regexp-create.component.scss'],
	animations: [
		trigger('detailExpand', [
			state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
			state('*', style({ height: '*', visibility: 'visible' })),
			transition('void <=> *', animate('125ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})

export class RegexpCreateComponent implements OnInit, OnChanges {

	@Input() updateVersions: boolean;
	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: false }) sort: MatSort;
	public displayedColumns = ['type', 'version', 'matches', 'author', 'kdb_id', 'kdb_url', 'regexp', 'filename', 'action_button', 'indicator'];
	public dataSource = new MatTableDataSource<Regexp>();
	public form: FormGroup;
	expandedElements = new Set();
	versions: Array<string> = [];

	constructor(
		private dialog: MatDialog,
		private errorService: ErrorService,
		private service: GetDataService,
		private fb: FormBuilder
	) {}

	ngOnInit() {
		const regexps = this.fb.array([
			this.getRegexpsDefaultControls()
		]);
		this.form = this.fb.group({
			system_type: ['', Validators.required],
			versions: [''],
			kdb_id: ['', Validators.required],
			kdb_url: ['', Validators.required],
			regexps
		});

		this.getRegexps();
	}

	ngOnChanges(changes) {
		if (this.updateVersions && this.form.get('system_type').value) {
			this.generateVersions(this.form.get('system_type').value);
		}
	}

	/** Adds two new controls for the current form */
	addItem() {
		(<FormArray> this.form.get('regexps')).push(this.getRegexpsDefaultControls());
	}

	/** Removes the selected control */
	removeItem(i: number) {
		(<FormArray> this.form.get('regexps')).removeAt(i);
	}

	/** Returns default controls for Regexps */
	getRegexpsDefaultControls(): FormArray {
		return new FormArray([this.fb.control('', Validators.required),
			this.fb.control('', Validators.compose([Validators.required, Checks.regexpsValidator]))
		]);
	}

	/** Clear controls for regexps */
	clearRegexpsControls() {
		const regexps = (<FormArray> this.form.controls['regexps']);
		for (let i = regexps.length - 1; regexps.length !== 1; i -= 1) {
			(<FormArray> this.form.controls['regexps']).removeAt(i);
		}
	}

	/** Get regular expressions from backend */
	getRegexps() {
		this.service.getRegexps().pipe(take(1)).subscribe((data) => {
			this.dataTransform(data.regexes);
			this.dataSource.paginator = this.paginator;
			this.expandRows();
			
		}, err => this.errorService.handleError(err));
	}

	/** Edit Regexp */
	edit(e: MouseEvent, regexp: Regexp) {
		e.stopPropagation();
		const dialogRef = this.dialog.open(RegexpEditComponent, {
			width: '450px',
			height: '475px',
			data: {
				regexp: {
					system_type: regexp.type.toUpperCase(),
					versions: regexp.version,
					kdb_url: regexp.kdb_url,
					regexp: regexp.regexp,
					filename: regexp.filename,
				},
				id: regexp.id
			}
		});
		dialogRef.afterClosed().pipe(take(1)).subscribe((status) => {
			if (status === 'afterSave') {
				this.getRegexps();
			}
		});
	}

	/** Delete Regexp */
	delete(e: MouseEvent, id: string) {
		e.stopPropagation();
		const dialogRef = this.dialog.open(DialogComponent, {
			width: '250px',
			data: {
				expected: 'yes',
				confirmation: 'yes'
			}
		});
		dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
			if (dialogRef.componentInstance.yes) {
				this.service.deleteRegexp(id).pipe(take(1)).subscribe(() => {
					this.getRegexps();
				});
			}
		});
	}

	/** sorting the received data by kbd_id blocks, where the first element of each block is the parent */
	dataTransform(data: Array<any>) {
		if (Array.isArray(data)) {
			data.sort((a, b) => a.kdb_id.localeCompare(b.kdb_id));
			data.forEach((item, i) => {
				if (i !== 0 && data[i].kdb_id === data[i - 1].kdb_id) {
					data[i].parentRegexp = data[i - 1].isParent ? data[i - 1] : data[i - 1].parentRegexp;
				} else if (data[i + 1] && data[i].kdb_id === data[i + 1].kdb_id) {
					data[i].isParent = true;
					data[i].children = [];
					for (let j = i + 1; j < data.length; j += 1) {
						if (data[i].kdb_id === data[j].kdb_id) {
							data[i].children.push(data[j]);
						}
					}
				}
			});
			data = data.filter((item) => item.children || (!item.isParent && !item.parentRegexp));
		}
		this.dataSource = new MatTableDataSource(data || []);
	}

	/** submits data from the form to create regular expressions */
	submit() {
		const regexp = this.form.value;
		this.service.createRegexp(regexp).pipe(take(1)).subscribe(() => {
			this.clearRegexpsControls();
			this.form.reset();
			this.form.markAsPristine();
			this.getRegexps();
		}, err => this.errorService.handleError(err));
	}

	/** clear expanded elements and resets the defaultExpand flag */
	clearExpandedElements() {
		this.expandedElements.clear();
		const data = this.dataSource.data;
		if (data && data.length) {
			data.forEach((row: Regexp) => {
				if (row.defaultExpand) {
					row.defaultExpand = false;
				}
			});
		}
	}

	/** opens the same group of rows that were opened before updating from back */
	expandRows() {
		const data = this.dataSource.data;
		if (data && data.length) {
			data.forEach((row: Regexp) => {
				if (row.children && this.expandedElements.has(row.kdb_id)) {
					row.defaultExpand = true;
				}
			});
		}
	}

	/** generates versions by system type */
	generateVersions(type: string) {
		this.service.getVersion(type).pipe(take(1)).subscribe((data) => {
			this.versions = data;
		}, err => this.errorService.handleError(err))
	}
}
