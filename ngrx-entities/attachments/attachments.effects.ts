import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { GetDataService } from '@app/getdata.service';
import { LoadFail, LoadFilesSuccess } from './attachments.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as fileActions from '@app/attachments/attachments.actions';
import { of } from 'rxjs';

@Injectable()
export class AttachmentsEffects {

	@Effect()
	public loadFiles$ = this.actions$.pipe(
		ofType(fileActions.LOAD_FILES),
		mergeMap((action: any) => this.service.getFileList(action.systemId, action.infoType).pipe(
			map((data) => new LoadFilesSuccess(action.systemId, action.infoType, data)),
			catchError((err: Error) => of(new LoadFail(action.systemId, action.infoType, err)))))
	);

	constructor(
		private actions$: Actions,
		private service: GetDataService,
	) {
	}
}

