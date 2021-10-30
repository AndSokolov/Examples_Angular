export interface Files {
	[key: string]: File[];
}

export interface isLoadedFiles {
	[key: string]: boolean;
}

export interface Errors {
	[key: string]: Error;
}

export interface File {
	filename: string;
	length: number;
	metadata?: Meta;
	uploadDate: string;
	_id: string;
	match_count?: number;
	sysinfo_count?: number;
	log_type?: string;
	meta_status?: string;
}

export interface Meta{
	status?: string;
	uploadID?: string;
	uploader?: string;
}
