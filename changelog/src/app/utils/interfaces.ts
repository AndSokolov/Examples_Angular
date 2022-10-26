export interface Commit {
  BoardNumber: string,
  CommitAuthor: string,
  CommitDate: number,
  CommitHash: string,
  CommitMessage: any,
  JiraIssue: string,
  DirectoryName: string,
  FirmwareNumber?: string
  FirmwareDate?: number
  stringDateCommit?: string
  stringDateFW?: string
}

export interface Jira {
  number: string
}

export interface JiraCommits {
  jiraNumber: string,
  commits: Commit[]
}

export interface Board {
  number: string
}

export interface BoardCommits {
  boardNumber: string,
  commits: Commit[]
}
