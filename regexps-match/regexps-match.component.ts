import { Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GetDataService } from '@app/getdata.service';
import { ErrorService } from '@app/error.service';
import { File, RegexpMatch } from '@app/logs.model';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
	selector: 'syr-regexps-match',
	templateUrl: './regexps-match.component.html',
	styleUrls: ['./regexps-match.component.scss']
})
export class RegexpsMatchComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<RegexpsMatchComponent>,
		private dialog: MatDialog,
		private router: Router,
		private service: GetDataService,
		private errorService: ErrorService,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) {}

	@ViewChildren(MatPaginator) paginators: QueryList<MatPaginator>;
	@ViewChild('content') content: ElementRef;

	regexpData: RegexpMatch[] = [];
	logId: string;
	dataSources = [];
	initialData = [];
	currentRegexp = 'Regex:';

	ngOnInit() {
		this.logId = this.data.uploadID;
		this.getRegexp(this.logId);
	}

	/** getting regex matches for a specific id */
	getRegexp(id: string) {
		this.service.getRegexp(id).pipe(take(1)).subscribe((data) => {
			this.dataTransform(data);
			this.regexpData = data;
			
		},
		err => this.errorService.handleError(err));
	}

	/** open LogsComponent and pass options there */
	openLogs(event, line: number, file: string) {
		event.preventDefault();
		this.router.navigate([`${this.router.url}/log/${this.logId}`], { queryParams: { line, file } }).then(() => {
			this.content.nativeElement.click();
		});
	}

	/** dataSource initialization for tables */
	initDataSource(dataSource: any, i: number, j: number) {
		let index = 0;
		if (i !== 0) {
			for (let k = 0; k < i; k += 1){
				index += this.regexpData[k].tableData.length;
			}
			index += j;
		} else {
			index = j;
		}
		
		if (!this.dataSources[index]) {
			this.dataSources[index] = new MatTableDataSource();
			this.initialData[index] = dataSource;
		}

		return this.dataSources[index];
	}

	/** data transformation for dataSource */
	dataTransform(data: RegexpMatch[]) {
		data.forEach((meta: RegexpMatch) => {
			meta.tableData = this.transformFiles(meta.files);
		});
	}

	/** generates records for the table */
	transformFiles(files: File[]): Array<Array<any>> {
		const data = [];
		if (Array.isArray(files)) {
			files.forEach(file => {
				const name = file.name;
				if (Array.isArray(file.regexps)) {
					file.regexps.forEach((record) => {
						const regexp = record.regexp;
						if (Array.isArray(record.lines)) {
							record.lines.forEach(line => {
								const row = {};
								row['name'] = name;
								row['regexp'] = regexp;
								row['text'] = line.text;
								row['number'] = line.number;
								data.push(row);
							});
						}
					});
				}
			});
		}

		return this.splitDataByRegexp(data.sort(this.compareItemsByRegexp));
	}

	/** split data table by regexp */
	splitDataByRegexp(data: Array<any>): Array<Array<any>>{
		const dataSources = [];
		let startIndex = 0;

		data.forEach((elem, i) => {
			if (i && data[i - 1].regexp !== data[i].regexp) {
				dataSources.push(data.slice(startIndex, i))
				startIndex = i;
			}
		});

		if (startIndex) {
			dataSources.push(data.slice(startIndex))
		} else {
			dataSources.push(data);
		}

		return dataSources;
	}

	/** compare records by regexp */
	compareItemsByRegexp(a, b){
		if (a.item < b.item){
			return -1;
		} else if (a.item > b.item){
			return 1;
		} else {
			return 0;
		}
	}

	/** for better performance, first install pagination, and then data */
	afterRenderPaginator() {
		this.paginators.forEach((paginator, i) => {
			if (this.dataSources[i] && !this.dataSources[i].paginator){
				this.dataSources[i].paginator = paginator;
				this.dataSources[i].data = this.initialData[i];
			}
		});
	}

	/** set current regexp */
	setCurrentRegexp(regexp: string) {
		this.currentRegexp = `Regex: ${regexp}`;
	}
}
