import * as actions from './attachments.actions';
import { Errors, Files, isLoadedFiles } from './attachments.model';

export interface State {
	files: Files;
	isLoadedFiles: isLoadedFiles;
	errors: Errors;
	loading: boolean;
}

export const InitialState: State = {
	files: {},
	isLoadedFiles: {},
	errors: {},
	loading: true,
};

export function reducer(state = InitialState, action: actions.AttachmentsActions): State {
	switch (action.type) {

		case actions.LOAD_FILES: {
			return {
				...state,
				loading: true
			};
		}

		case actions.LOAD_FILES_SUCCESS: {
			return {
				...state,
				files: { ...state.files, [`${action.systemId}_${action.infoType}`]: action.payload },
				isLoadedFiles: { ...state.isLoadedFiles, [`${action.systemId}_${action.infoType}`]: true },
				loading: false
			};
		}

		case actions.UPDATE_STATUS: {
			return {
				...state,
				files: {
					...state.files,
					[`${action.systemId}_${action.infoType}`]: state.files[`${action.systemId}_${action.infoType}`].map((file) => {
						if (action.fileId === file._id){
							if (file.metadata) {
								return { ...file, metadata: { ...file.metadata, status: action.status } };
							}
						}
						return file;
					})
				},
			};
		}

		case actions.LOAD_FAIL: {
			return {
				...state,
				loading: false,
				errors: { ...state.errors, [`${action.systemId}_${action.infoType}`]: action.payload },
				isLoadedFiles: { ...state.isLoadedFiles, [`${action.systemId}_${action.infoType}`]: true }
			};
		}

		case actions.DELETE_FILES: {
			const files = { ...state.files };
			const isLoadedFiles = { ...state.isLoadedFiles };
			action.systemsId.forEach((id) => {
				Object.keys(files).forEach((key) => {
					if (key.includes(id)) {
						delete files[key];
						if (isLoadedFiles && isLoadedFiles[key]) {
							delete isLoadedFiles[key];
						}
					}
				});
			});

			const errors = { ...state.errors };
			action.systemsId.forEach((id) => {
				Object.keys(errors).forEach((key) => {
					if (key.includes(id)) {
						if (errors && errors[key]) {
							delete errors[key];
						}
					}
				});
			});

			return {
				...state,
				files,
				isLoadedFiles,
				errors
			};
		}

		default: {
			return state;
		}
	}
}


export const getFiles = (state: State, param: string) => state.files[param];
export const getIsLoadedFiles = (state: State, param: string) => state.isLoadedFiles[param];
export const getErrors = (state: State, param: string) => state.errors[param];
