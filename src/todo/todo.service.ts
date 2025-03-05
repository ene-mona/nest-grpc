import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { ClientGrpc } from '@nestjs/microservices';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {  firstValueFrom } from 'rxjs';
import { Empty, TodoServiceClient } from 'proto/todo';



@Injectable()
export class TodoService implements OnModuleInit {
  private remoteTodoService: TodoServiceClient;

  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @Inject('TODO_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.remoteTodoService = this.client.getService<TodoServiceClient>('TodoService');
  }

  // Local CRUD operations
  async findAll(): Promise<{ todos: Todo[] }> {
    const todos = await this.todoRepository.find();
    return { todos };
  }

  async findOne(id: string): Promise<Todo | null> {
    const parsedId = parseInt(id, 10);
    return this.todoRepository.findOneBy({ id: parsedId });
  }

  async create(title: string): Promise<Todo> {
    const todo = this.todoRepository.create({title});
    return this.todoRepository.save(todo);
  }

  async updateById(id: string, attr: QueryDeepPartialEntity<Todo>): Promise<UpdateResult> {
    const parsedId = parseInt(id, 10);
    return this.todoRepository.update(parsedId, attr);
  }

  async deleteById(id: string): Promise<DeleteResult> {
    const parsedId = parseInt(id, 10);
    return this.todoRepository.delete(parsedId);
  }

  // // Remote CRUD operations
  async createRemoteTodo(title: string): Promise<Todo> {
    const remoteTodo = await firstValueFrom(this.remoteTodoService.createTodo({ title }));
    return { ...remoteTodo, id: parseInt(remoteTodo.id, 10) };
  }

  async getRemoteTodos(): Promise<{ todos: Todo[] }> {
    const result = await firstValueFrom(this.remoteTodoService.getTodos({}));
   console.log('results ',result)
    const todos = result?.todos.map(todo => ({ ...todo, id: parseInt(todo.id, 10) })) ?? [];
   console.log('todos ',todos)
    
    return { todos };
  }

  async getRemoteTodoById(id: string): Promise<Todo> {
    
    const todo = await firstValueFrom(this.remoteTodoService.getTodoById({ id }));
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    return { ...todo, id: parseInt(todo.id, 10) };
  }

  async updateRemoteTodoById(id: string, title: string, completed: boolean): Promise<Empty> {
    return firstValueFrom(this.remoteTodoService.updateTodoById({ id, title, completed }));
  }

  async deleteRemoteTodoById(id: string): Promise<Empty> {
    return firstValueFrom(this.remoteTodoService.deleteTodoById({ id }));
  }
}
