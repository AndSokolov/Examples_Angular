import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { AB_API_URL } from '@app/constants';
import { environment } from '@environments/environment';
import { SocketAB, SocketConfigAB } from '@app/interfaces';

@Injectable({
	providedIn: 'root'
})

export class ABWebsocketService {

	constructor() {}

	private webSockets$: WebSocketSubject<SocketAB>[] = [];
	private config: WebSocketSubjectConfig<SocketConfigAB> = {
		url: null,
		closeObserver: {
			next: (event) => {
				if (event.code !== 1000 && event.target?.url){
					const url = event.target.url;
					const index = url.indexOf('logs/');
					let log = '';
					if (index !== -1) {
						log = url.slice(index + 5);
					}
					console.warn(`socket "${log}" closed with code: ${event.code}`)
				}
			}
		}
	};

	createSocket(id: string): WebSocketSubject<SocketAB> {
		const socketProtocol = window.location.protocol.includes('https') ? 'wss' : 'ws';
		const url = `${socketProtocol}://${environment.hostAbSocket}${AB_API_URL}ws/logs/${id}`;
		const webSocket$ = webSocket({ ...this.config, url });
		this.webSockets$.push(webSocket$);
		return webSocket$;
	}

	/** called when the component is destroyed */
	completeAll() {
		if (this.webSockets$.length) {
			this.webSockets$.forEach((socket$) => {
				socket$.complete();
			});
			this.webSockets$ = [];
		}
	}
}
