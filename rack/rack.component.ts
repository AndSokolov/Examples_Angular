import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Building, City, Device, NavLinks, Rack, Room } from '@app/main/stand/stand.interface';
import { MatTableDataSource } from '@angular/material/table';
import { GetDataService } from '@app/getdata.service';
import { ErrorService } from '@app/error.service';
import { map, switchMap, take } from 'rxjs/operators';
import { NewDeviceComponent } from '@app/main/stand/cities/buildings/rooms/racks/rack/device/new-device';
import { UtilsService } from '@app/utils.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
	selector: 'syr-rack',
	templateUrl: './rack.component.html',
	styleUrls: ['./rack.component.scss']
})
export class RackComponent implements OnInit {
	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private service: GetDataService,
		private errorService: ErrorService,
		private dialog: MatDialog,
		public utils: UtilsService
	) { }

	navLinks: NavLinks = { links: [], currentPage: null };
	displayedColumns = ['position', 'device_image'];
	dataSource_front = new MatTableDataSource<Device>([]);
	dataSource_rear = new MatTableDataSource<Device>([]);
	url: string;
	currentDevice: Device;
	rack: Rack;
	room: Room;
 	building: Building;
 	city: City;


	ngOnInit(): void {
		this.activatedRoute.params.pipe(
			switchMap((params) => forkJoin([
				this.service.getCities()
					.pipe(map(cities => cities ? cities.find((city) => city.id === params.city_id) : null)),
				this.service.getBuildingsFromCity(params.city_id)
					.pipe(map(buildings => buildings ? buildings.find((bulding) => bulding.id === params.build_id) : null)),
				this.service.getRoomsFromBuilding(params.build_id)
					.pipe(map(rooms => rooms ? rooms.find((room) => room.id === params.room_id) : null)),
				this.service.getRacksFromRoom(params.room_id)
					.pipe(map(racks => racks ? racks.find((rack) => rack.id === params.rack_id) : null))
			]))
		).subscribe(([city, building, room, rack]) => {
			this.building = building;
			this.room = room;
			this.city = city;
			this.rack = rack;

			this.createNavLinks();
			this.getDevices();
		})
	}

	/** creates navigation links for the 'toolbar' component */
	createNavLinks() {
		this.navLinks.links.push({ name: 'Cities', link: '../../../../../../../' });
		this.navLinks.links.push({ name: this.city.name, link: '../../../../../../' });
		this.navLinks.links.push({ name: this.building.name, link: '../../../../' });
		this.navLinks.links.push({ name: this.room.name, link: '../../' });
		this.navLinks.currentPage = this.rack.name;
	}

	getDevices(){
		this.service.getRackDevices(this.rack.id).pipe(
			map(devices => devices ? devices.map((device) => this.addParamsToDevice(device)) : []),
			take(1)
		).subscribe((devices: Device[]) => {
			this.dataSource_front.data = this.fillRack(devices);
			this.dataSource_rear.data = this.fillRack(devices);
			this.updatePower(devices);
			this.updateCurrentDevice(devices);
		});
	}

	/** adds position parameters and links for images */
	addParamsToDevice(device: Device): Device {
		device.front_pic_url$ = this.service.downloadDevicePicture(device.front_pic_id).pipe(map(img => img.url));
		device.rear_pic_url$ = this.service.downloadDevicePicture(device.rear_pic_id).pipe(map(img => img.url));
		device.topPosition = device.position + (device.height - 1);
		device.bottomPosition = device.position;
		device.isDevice = true;
		return device;
	}

	/** fills the rack with devices for the front and back */
	fillRack(devices: Device[]): Device[]{
		let dataRack = [];
		const height = this.rack.height;

		for (let i = height; i > 0; i -= 1){
			dataRack.push({ bottomPosition: i });
		}
		
		dataRack = dataRack.map((emptyDevice) => {
			const device = devices.find((dev) => dev.topPosition === emptyDevice.bottomPosition);

			if (device) {
				if (device.height > 1) {
					this.hideCellsOccupiedByDevice(dataRack, device);
				}
				return device;
			}
			return emptyDevice;
		});
		
		return dataRack;
	}

	/** hides the cells of the material table if a device is located in them */
	hideCellsOccupiedByDevice(dataRack: Device[], device: Device){
		dataRack.forEach((item) => {
			if (item.bottomPosition < device.topPosition && item.bottomPosition >= device.bottomPosition){
				item.cellIsHidden = true;
			}
		});
	}

	updatePower(devices: Device[]) {
		this.rack.used_power = devices.reduce((sum, device) => sum + device.power, 0);
		this.rack.used_power_per = this.utils.calcUsedPowerPercent(this.rack.power, this.rack.used_power);
	}

	updateCurrentDevice(devices: Device[]) {
		if (this.currentDevice) {
			this.currentDevice = devices.find((device) => device.id === this.currentDevice.id);
		}
	}

	addDevice(position: number) {
		const dialogRef = this.dialog.open(NewDeviceComponent, {
			width: '450px',
			data: {
				rackId: this.rack.id,
				position
			},
		});

		dialogRef.afterClosed().pipe(take(1)).subscribe((status) => {
			if (status === 'afterSave') {
				this.getDevices();
			}
		})
	}

	setCurrentDevice(device: Device) {
		this.currentDevice = device;
	}
}
