import { Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateTodoDto, Empty, TodoByIdDto, UpdateTodoDto, Todo as ProtoTodo } from 'proto/todo';
import { Metadata } from '@grpc/grpc-js';
import { CompressionTypes } from '@nestjs/microservices/external/kafka.interface';


@Controller('todos')
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    // Local CRUD Operations
    @GrpcMethod('TodoService', 'CreateTodo')
    async createTodo(payload: CreateTodoDto, metadata:Metadata): Promise<ProtoTodo> {
     const isRemote = metadata.get('remote')
        const todo = isRemote[0]  ?
        await this.todoService.createRemoteTodo(payload.title)
        : await this.todoService.create(payload.title);
        return { id: todo.id.toString(), title: todo.title, completed: todo.completed };
    }

    @GrpcMethod('TodoService', 'GetTodos')
    async getTodos(_: Empty, metadata:Metadata): Promise<{ todos: ProtoTodo[] }> {
        const isRemote = metadata.get('remote')

        const todos = isRemote[0] ? await this.todoService.getRemoteTodos() : await this.todoService.findAll();
        return { todos: todos.todos.map((todo: Todo): ProtoTodo => ({ id: todo.id.toString(), title: todo.title, completed: todo.completed })) };
    }

    @GrpcMethod('TodoService', 'GetTodoById')
    async getTodoById(params: TodoByIdDto, metadata:Metadata): Promise<ProtoTodo> {  
    const isRemote = metadata.get('remote')
        const todo = isRemote[0] ?
        await this.todoService.getRemoteTodoById(params.id)
        : await this.todoService.findOne(params.id);
        if (!todo) {
            throw new Error('Todo not found');
        }
        return { id: todo.id.toString(), title: todo.title, completed: todo.completed };
    }

    @GrpcMethod('TodoService', 'UpdateTodoById')
    updateTodoById(payload: UpdateTodoDto, metadata:Metadata): Promise<UpdateResult | Empty> {
        const isRemote = metadata.get('remote')
        return isRemote[0] ?
        this.todoService.updateRemoteTodoById(payload.id, payload.title, payload.completed)
        : this.todoService.updateById(payload.id, { title: payload.title, completed: payload.completed });
    }

    @GrpcMethod('TodoService', 'DeleteTodoById')
    deleteTodoById(params: TodoByIdDto, metadata:Metadata): Promise<DeleteResult | Empty> {
        const isRemote = metadata.get('remote')
        return isRemote[0] ?
        this.todoService.deleteRemoteTodoById(params.id)
            : this.todoService.deleteById(params.id);
    }

}
