import { Controller, Param, Body, Get,  } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreateTodoDto, FindOneParams, UpdateTodoDto } from './dto';
import { GrpcMethod } from '@nestjs/microservices';
import { Empty } from 'proto/todo';
import { Observable } from 'rxjs';

@Controller('todos')
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    @GrpcMethod('TodoService', 'CreateTodo')
    createTodo(payload:CreateTodoDto): Promise<Todo> {
        return this.todoService.create(payload.title);
    }
    @GrpcMethod('TodoService', 'GetTodos')
    getTodos(_: Empty): Promise<{ todos: Todo[] }> {
        return this.todoService.findAll();
    }

    @GrpcMethod('TodoService', 'GetTodoById')
    getTodoById(params: FindOneParams): Promise<Todo | null> {
        return this.todoService.findOne(params.id);
    }

    @GrpcMethod('TodoService', 'UpdateTodoById')
    updateTodoById(payload: UpdateTodoDto): Promise<UpdateResult> {
        const attr = { title: payload.title, completed: payload.completed };
        return this.todoService.updateById(payload.id, attr);
    }

    @GrpcMethod('TodoService', 'DeleteTodoById')
    deleteTodoById(params: FindOneParams): Promise<DeleteResult> {
        return this.todoService.deleteById(params.id);
    }

    @Get('/colleague')
    getTodosFromColleague(_: Empty): Observable<{ todos: Todo[] }> { 
        return this.todoService.getTodosFromColleague();
    }
    
}
