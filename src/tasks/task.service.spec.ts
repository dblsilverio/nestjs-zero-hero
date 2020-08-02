import { Test } from '@nestjs/testing';
import { TasksService } from '../tasks/tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn()
});

const mockUser = { id: 1, username: 'Test User' };

describe('TaskService', () => {

    let tasksService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useFactory: mockTaskRepository }
            ]
        }).compile();

        tasksService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('gets all tasks from the repository', async () => {
            taskRepository.getTasks.mockResolvedValue('value');
            expect(taskRepository.getTasks).not.toHaveBeenCalled();

            const filters: GetTasksFilterDto = { status: TaskStatus.IN_PROGRESS, search: 'search text' };
            const result = await tasksService.getTasks(filters, mockUser);

            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(result).toEqual('value');
        })
    });

    describe('getTaskById', () => {

        it('calls taskRepository.findOne() successfully', async () => {
            const mockTask = { title: 'Test task', description: 'Task description' };

            taskRepository.findOne.mockResolvedValue(mockTask);
            const result = await tasksService.getTaskById(1, mockUser);

            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 1,
                    userId: mockUser.id
                }
            })
        });

        it('throws an error as task not found', () => {
            taskRepository.findOne.mockResolvedValue(null);
            expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createTask', () => {
        it('create a task and successfully return result', async () => {
            const mockTask = { title: 'Test task', description: 'Task description' };
            taskRepository.createTask.mockResolvedValue(mockTask);

            expect(taskRepository.createTask).not.toHaveBeenCalled();

            const result = await tasksService.createTask(mockTask, mockUser);

            expect(taskRepository.createTask).toHaveBeenCalledWith(mockTask, mockUser);
            expect(result).toEqual(mockTask);

        });
    });

    describe('deleteTask', () => {
        it('call repository deleteTask()', async () => {
            taskRepository.delete.mockResolvedValue({ affected: 1 });
            expect(taskRepository.delete).not.toHaveBeenCalled();

            await tasksService.deleteTask(1, mockUser);

            expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
        });

        it('throws an error as task not found', async () => {
            taskRepository.delete.mockResolvedValue({ affected: 0 });

            expect(taskRepository.delete).not.toHaveBeenCalled();
            expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateTaskStatus', () => {
        it('updates a task status', async () => {
            const save = jest.fn().mockResolvedValue(true);
            tasksService.getTaskById = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
                save
            });

            expect(tasksService.getTaskById).not.toHaveBeenCalled();
            expect(save).not.toHaveBeenCalled();

            const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);

            expect(tasksService.getTaskById).toHaveBeenCalled();
            expect(save).toHaveBeenCalled();

            expect(result.status).toEqual(TaskStatus.DONE);
        });
    });

});