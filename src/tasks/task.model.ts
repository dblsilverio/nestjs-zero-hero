import { ExecFileOptionsWithStringEncoding } from "child_process";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
}

export enum TaskStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGESS',
    DONE = 'DONE'
}