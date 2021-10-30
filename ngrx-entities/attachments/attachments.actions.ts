import { Action } from '@ngrx/store';
import { File } from '@app/attachments/attachments.model';

export const LOAD_FILES = '[Files] Init';
export const LOAD_FILES_SUCCESS = '[Files] Load success';
export const UPDATE_STATUS = '[Files] Update status';
export const LOAD_FAIL = '[Files] Load fail';
export const DELETE_FILES = '[Files] delete files';

export class LoadFiles implements Action {
	public readonly type = LOAD_FILES;

	constructor(public systemId: string, public infoType: string) {
	}
}

export class LoadFilesSuccess implements Action {
	public readonly type = LOAD_FILES_SUCCESS;

	constructor(public systemId: string, public infoType: string, public payload: File[]) {
	}
}

export class UpdateStatus implements Action {
	public readonly type = UPDATE_STATUS;

	constructor(public systemId: string, public infoType: string, public fileId, public status: string) {
	}
}

export class LoadFail implements Action {
	public readonly type = LOAD_FAIL;

	constructor(public systemId: string,  public infoType: string, public payload: Error) {
	}
}

export class DeleteFiles implements Action {
	public readonly type = DELETE_FILES;

	constructor(public systemsId: Array<string>) {
	}
}

export type AttachmentsActions = LoadFiles | LoadFilesSuccess | UpdateStatus | LoadFail | DeleteFiles ;
