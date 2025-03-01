import { Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateTodoDto, Empty, TodoByIdDto, TodoServiceController, UpdateTodoDto, Todo as ProtoTodo } from 'proto/todo';


@Controller('todos')
export class TodoController implements TodoServiceController{
    constructor(private readonly todoService: TodoService) {}

    // Local CRUD Operations
    @GrpcMethod('TodoService', 'CreateTodo')
    async createTodo(payload: CreateTodoDto): Promise<ProtoTodo> {
        const todo = await this.todoService.create(payload.title);
        return { id: todo.id.toString(), title: todo.title, completed: todo.completed };
    }

    @GrpcMethod('TodoService', 'GetTodos')
    async getTodos(_: Empty): Promise<{ todos: ProtoTodo[] }> {
        const todos = await this.todoService.findAll();
        return { todos: todos.todos.map((todo: Todo): ProtoTodo => ({ id: todo.id.toString(), title: todo.title, completed: todo.completed })) };
    }

    @GrpcMethod('TodoService', 'GetTodoById')
    async getTodoById(params: TodoByIdDto): Promise<ProtoTodo> {
        const todo = await this.todoService.findOne(params.id);
        if (!todo) {
            throw new Error('Todo not found');
        }
        return { id: todo.id.toString(), title: todo.title, completed: todo.completed };
    }

    @GrpcMethod('TodoService', 'UpdateTodoById')
    updateTodoById(payload: UpdateTodoDto): Promise<UpdateResult> {
        return this.todoService.updateById(payload.id, { title: payload.title, completed: payload.completed });
    }

    @GrpcMethod('TodoService', 'DeleteTodoById')
    deleteTodoById(params: TodoByIdDto): Promise<DeleteResult> {
        return this.todoService.deleteById(params.id);
    }

    @Post('create')
    createRemoteTodo(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
        const { title } = createTodoDto;
        return this.todoService.createRemoteTodo(title);
    }

    @Get()
    getRemoteTodos(_: Empty): Promise<{ todos: Todo[] }> {
        return this.todoService.getRemoteTodos();
    }

    @Get(':id')
    getRemoteTodoById(@Param('id') params: TodoByIdDto): Promise<Todo> {
        return this.todoService.getRemoteTodoById(params.id);
    }

    @Post(':id')
    updateRemoteTodoById(@Param('id') params: TodoByIdDto, @Body() payload: UpdateTodoDto): Promise<Empty> {
        return this.todoService.updateRemoteTodoById(params.id, payload.title ?? '', payload.completed);
    }

    @Delete(':id')
    deleteRemoteTodoById(@Param('id') params: TodoByIdDto): Promise<Empty> {
        return this.todoService.deleteRemoteTodoById(params.id);
    }
}
