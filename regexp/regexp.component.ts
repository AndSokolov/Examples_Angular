import { Component, OnInit, } from '@angular/core';


@Component({
	selector: 'syr-regexp',
	template: `
        <mat-tab-group (selectedIndexChange)="changeTab($event)">
            <mat-tab label="Regexp">
                <mat-card class="mat-elevation-z5">
                    <mat-card-content>
						<syr-regexp-create [updateVersions] = updateVersions></syr-regexp-create>
                    </mat-card-content>
                </mat-card>
            </mat-tab>
            <mat-tab label="Version">
                <mat-card class="mat-elevation-z5">
                    <mat-card-content>
                        <syr-regexp-version></syr-regexp-version>
                    </mat-card-content>
                </mat-card>
            </mat-tab>
        </mat-tab-group>
    `,
	styles: ['mat-card{  margin: 15px 5px;}']
})

export class RegexpComponent implements OnInit {
	constructor() {}

	updateVersions = false;

	ngOnInit() {}

	/** triggered when switching the Version / Regexp tabs */
	changeTab(indexTab: number) {
		this.updateVersions = indexTab === 0;
	}
}
