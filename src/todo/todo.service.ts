import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { ClientGrpc } from '@nestjs/microservices';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Observable, firstValueFrom } from 'rxjs';

interface RemoteTodoService {
  createTodo(payload: { title: string }): Observable<Todo>;
  getTodos(data: {}): Observable<{ todos: Todo[] }>;
  getTodoById(data: { id: string }): Observable<Todo>;
  updateTodoById(payload: { id: string; title: string; completed: boolean }): Observable<void>;
  deleteTodoById(payload: { id: string }): Observable<void>;
}

@Injectable()
export class TodoService implements OnModuleInit {
  private remoteTodoService: RemoteTodoService;

  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
    @Inject('TODO_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.remoteTodoService = this.client.getService<RemoteTodoService>('TodoService');
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

  // Remote CRUD operations
  async createRemoteTodo(title: string): Promise<Todo> {
    return firstValueFrom(this.remoteTodoService.createTodo({ title }));
  }

  async getRemoteTodos(): Promise<{ todos: Todo[] }> {
    const result = await firstValueFrom(this.remoteTodoService.getTodos({}));
    return { todos: result?.todos ?? [] };
  }

  async getRemoteTodoById(id: string): Promise<Todo> {
    const todo = await firstValueFrom(this.remoteTodoService.getTodoById({ id }));
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    return todo;
  }

  async updateRemoteTodoById(id: string, title: string, completed: boolean): Promise<void> {
    return firstValueFrom(this.remoteTodoService.updateTodoById({ id, title, completed }));
  }

  async deleteRemoteTodoById(id: string): Promise<void> {
    return firstValueFrom(this.remoteTodoService.deleteTodoById({ id }));
  }
}
