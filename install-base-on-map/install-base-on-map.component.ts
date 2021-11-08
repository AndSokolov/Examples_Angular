import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { GetDataService } from '@app/getdata.service';
import { AppState, getMapFilter, getRegistration, isRegistrationLoaded } from '@app/store/selectors';
import { Store } from '@ngrx/store';
import { filter, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Filter, Registration } from '@app/registration/registration.model';
import { RegFilterComponent } from '@app/reg-filter/reg-filter.component';
import { Init as SystemsInit } from '@app/registration/registration.actions';
import { ErrorService } from '@app/error.service';
import { SnackBarComponent } from '@app/snackbar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogComponent } from '@app/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Checks } from '@app/checks';
import { SetMapFilter } from '@app/misc/misc.actions';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy } from '@angular/core';

interface Actions {
	saveButton: HTMLElement;
	cancelButton: HTMLElement;
	editButton: HTMLElement;
}

@Component({
	selector: 'syr-install-base-on-map',
	templateUrl: './install-base-on-map.component.html',
	styleUrls: ['./install-base-on-map.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallBaseOnMapComponent implements OnInit, AfterViewInit, OnDestroy {


	public searchText: string;
	public registrations: Registration[];
	private destroyed$ = new Subject();
	public layerGroup;
	public updatedSystem: string;
	public filter: Filter;
	public resetFilter = false;
	public readonlyFields = new Set(['system_type', 'sn', 'creation_date'])
	public initialValues;
	public map;

	constructor(
		private service: GetDataService,
		private errorService: ErrorService,
		private store: Store<AppState>,
		private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private datePipe: DatePipe
	) {
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.initMap();
	}

	/** draws a map with search and places markers by addresses */
	initMap(): void {
		this.map = L.map('map', {
			center: [55.02131, 82.97272],
			zoom: 4,
		});
		const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		});
		tiles.addTo(this.map);

		this.layerGroup = L.layerGroup().addTo(this.map);

		this.store.select(isRegistrationLoaded).pipe(
			filter(Boolean),
			switchMap(() => this.store.select(getRegistration)),
			withLatestFrom(this.store.select(getMapFilter)),
			takeUntil(this.destroyed$)
		).subscribe(([regs, filterParam]) => {
			this.registrations = regs;
			this.filter = filterParam ? JSON.parse(JSON.stringify(filterParam)) : this.filter;
			this.setMarkersOnMap(this.filter);
			if (this.updatedSystem) {
				this.snackBar.openFromComponent(SnackBarComponent, { data: this.updatedSystem + ' was updated', duration: 2500 });
				this.updatedSystem = null;
			}
		});
	}
	
	/** set markers on map*/
	setMarkersOnMap(filterParam: Filter) {
		this.layerGroup.clearLayers();
		const redIconUrl = '../../../../assets/marker-icon-red.png';
		const blueIconUrl = '../../../../assets/marker-icon-blue.png';
		const shadowUrl = '../../../../assets/marker-shadow.png';

		if (Array.isArray(this.registrations)) {
			this.registrations.forEach((reg: Registration) => {
				if (reg.latitude && reg.longitude && (!filterParam || RegFilterComponent.regFilter(reg, filterParam))) {
					const customIcon = new L.Icon({
						iconUrl: reg.issues && reg.issues.length ? redIconUrl : blueIconUrl,
						shadowUrl,
						iconSize: [25, 41],
						iconAnchor: [12, 41],
						popupAnchor: [1, -34],
						shadowSize: [41, 41]
					});
					
					const options = { icon: customIcon, draggable: true };
					const marker = L.marker([reg.latitude, reg.longitude], options);

					const content = document.createElement('DIV');
					const actions = this.fillContent(content, reg);
					
					marker.addTo(this.layerGroup).bindPopup(content, { maxWidth: '400' })
						.on('popupclose', (e) => {
							this.changeReadOnly(true, content);
							content.classList.remove('edit');
							actions.saveButton.hidden = true;
							actions.cancelButton.hidden = true;
							actions.editButton.hidden = false;
							if (this.initialValues) {
								this.setInitialValues(content);
								this.initialValues = null;
							}
						})
						.on('dragend', (e) => {
							this.changeCoords(e, content, reg, marker);
						});
				}
			});
		}
	}

	/** fills in content and returns a button action */
	fillContent(content: HTMLElement, reg: Registration): Actions {
		let creationDate = '';
		if (Date.parse(reg.creation_date)) {
			creationDate = this.datePipe.transform(reg.creation_date, 'yyyy-MM-dd');
		}
		const host = location.origin;
		content.classList.add('reg-info');
		content.title = reg.system_id;
		content.innerHTML = `<div><b><a href="${host}/#/install-base/${reg.system_id}" target='_blank'>${reg.system_name}</a></b></div>
								  <div><span>System type:</span><input name="system_type" value="${reg.system_type}" readonly></div>  
                                  <div><span>Status:</span> <select disabled name="status"></select></div>
                                  <div><span>Serial number:</span> <input name="sn" value="${reg.sn}" readonly></div> 
                                  <div><span>Creation date:</span> <input name="creation_date" value="${creationDate}" readonly></div> 
                                  <div><span>Address:</span> <input name="address" value="${reg.address}" readonly> </div>
                                  <div><span>Latitude:</span> <input name="latitude" value="${reg.latitude}" readonly></div>
                                  <div><span>Longitude:</span> <input name="longitude" value="${reg.longitude}" readonly></div>`;
		
		this.setStatuses(content, reg);

		const containerActions = document.createElement('DIV');
		containerActions.classList.add('actions');

		const actions = this.generateActions(content);

		containerActions.append(actions.editButton, actions.saveButton, actions.cancelButton);
		content.append(containerActions);

		return actions;
	}

	/** sets statuses in select depending on the original value */
	setStatuses(content: HTMLElement, reg: Registration) {
		const statuses: Array<string> = Checks.filterStatuses(reg.status);
		const select = content.children[2].children[1];
		statuses.forEach((status) => {
			let option;
			if (reg.status === status) {
				option = new Option(status, status, true, true);
			} else {
				option = new Option(status, status);
			}
			select.append(option);
		});
	}

	/** generate buttons: edit save and cancel */
	generateActions(content: HTMLElement): Actions {
		const editButton = document.createElement('BUTTON');
		editButton.innerHTML = 'Edit';

		editButton.onclick = (e) => {
			this.changeReadOnly(false, content);
			this.initialValues = this.getInitialValues(content);
			content.classList.add('edit');
			editButton.hidden = true;
			cancelButton.hidden = false;
			saveButton.hidden = false;
		};

		const saveButton = document.createElement('BUTTON');

		saveButton.innerHTML = 'Save';
		saveButton.hidden = true;

		saveButton.onclick = () => {
			this.updateSystem(content);
			this.initialValues = null;
			content.classList.remove('edit');
		};

		const cancelButton = document.createElement('BUTTON');
		cancelButton.innerHTML = 'Cancel';
		cancelButton.classList.add('cancel');
		cancelButton.hidden = true;

		cancelButton.onclick = () => {
			this.changeReadOnly(true, content);
			this.setInitialValues(content);
			this.initialValues = null;
			content.classList.remove('edit');
			saveButton.hidden = true;
			cancelButton.hidden = true;
			editButton.hidden = false;
		};

		return { editButton, cancelButton, saveButton };
	}

	/** updates the system when editing data or moving a marker */
	updateSystem(content: HTMLElement, latitude?: number, longitude?: number) {
		let box = this.registrations.find((registration) => registration.system_id === content.title);
		if (box) {
			box = { ...box };
			
			if (latitude && longitude) {
				box.latitude = latitude;
				box.longitude = longitude;
			} else {
				[].forEach.call(content.children, (elem) => {
					const field = elem.children[1];
					if (field && !this.readonlyFields.has(field.name) && (field.tagName === 'INPUT' || field.tagName === 'SELECT')) {
						box[field.name] = field.name === 'latitude' || field.name === 'longitude' ? +field.value : field.value;
					}
				});
			}
			
			this.service.editReg(box).pipe(take(1)).subscribe(() => {
				this.store.dispatch(new SystemsInit());
				this.updatedSystem = box.system_name;
			}, (err) => this.errorService.handleError(err));
		}
	}

	/** changes the logic of the readonly attribute for the input */
	changeReadOnly(readonly: boolean, content: HTMLElement) {
		[].forEach.call(content.children, (elem) => {
			const field = elem.children[1];
			if (field && (field.tagName === 'INPUT' || field.tagName === 'SELECT')) {
				if (readonly) {
					field.tagName === 'INPUT' ? field.setAttribute('readonly', true) : field.setAttribute('disabled', true);
				} else if (!this.readonlyFields.has(field.name)) {
					field.tagName === 'INPUT' ? field.removeAttribute('readonly') : field.removeAttribute('disabled');
				}
			}
		});
	}

	/** changes coordinates after moving the marker */
	changeCoords(e, content: HTMLElement, reg: Registration, marker) {
		const dialogRef = this.dialog.open(DialogComponent, {
			width: '320px',
			data: {
				title: `Change coordinates?`,
				buttonText: 'Change',
				expected: 'yes',
				confirmation: 'yes'
			}
		});

		dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
			if (dialogRef.componentInstance.yes) {
				const latLng = e.target._latlng;
				this.updateSystem(content, latLng.lat, latLng.lng);
			} else {
				marker.setLatLng([reg.latitude, reg.longitude]);
			}
		});
	}

	/** finds coordinates by address and moves the map there */
	findAddress(e: KeyboardEvent) {
		if (e.key === 'Enter' && this.searchText) {
			this.service.getCoords(this.searchText).pipe(take(1)).subscribe((coords) => {
				if (coords && coords.features && coords.features.length) {
					const newCoords = coords.features[0].geometry.coordinates;
					this.map.setView([newCoords[1], newCoords[0]], 17);
				}
			}, (err) => this.errorService.handleError(err));
		}
	}

	/** keeps the original data for the popup */
	getInitialValues(content): Record<string, any>{
		const values = {};
		[].forEach.call(content.children, (elem) => {
			const field = elem.children[1];
			if (field && !this.readonlyFields.has(field.name) && (field.tagName === 'INPUT' || field.tagName === 'SELECT')) {
				values[field.name] = field.name === 'latitude' || field.name === 'longitude' ? +field.value : field.value;
			}
		});
		return values;
	}

	/** inserts the original data if cancel was clicked or the popup was closed */
	setInitialValues(content: HTMLElement){
		[].forEach.call(content.children, (elem) => {
			const field = elem.children[1];
			if (field && !this.readonlyFields.has(field.name) && (field.tagName === 'INPUT' || field.tagName === 'SELECT')
				&& this.initialValues.hasOwnProperty(field.name)) {
				field.value = this.initialValues[field.name];
			}
		});
	}

	/** updates the filter and saves it to the store */
	updateFilter(filterParam: Filter){
		this.setMarkersOnMap(filterParam);
		this.store.dispatch(new SetMapFilter(JSON.parse(JSON.stringify(filterParam))));
		this.resetFilter = false;
	}

	ngOnDestroy() {
		this.destroyed$.next();
		this.destroyed$.complete();
	}
}
