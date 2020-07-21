import { PipeTransform, BadRequestException } from "@nestjs/common";
import { TaskStatus } from "../task.model";
import { stat } from "fs";

export class TaskStatusValidationPipe implements PipeTransform {

    transform(value: any) {
        value = value.toUpperCase();

        if (this.isStatusValid(value)) {
            throw new BadRequestException(`"${value}" is an invalid status`);
        }

        return value;
    }

    private isStatusValid(status: any) {
        return Object.values(TaskStatus).indexOf(status) !== 0;
    }
}