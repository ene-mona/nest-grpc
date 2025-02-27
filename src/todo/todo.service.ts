import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ClientGrpc } from '@nestjs/microservices';
import { map, Observable,} from 'rxjs';
import { COLLEAGUE_TODO_SERVICE_NAME, ColleagueTodoServiceClient, Empty } from 'proto/teddy';


@Injectable()
export class TodoService implements OnModuleInit {
  private colleagueTodoService: ColleagueTodoServiceClient; 

  constructor(
    @Inject('TEDDY_TODO_PACKAGE') private readonly colleagueClient: ClientGrpc, 
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
  ) {}

  onModuleInit() {
    this.colleagueTodoService = this.colleagueClient.getService<ColleagueTodoServiceClient>(COLLEAGUE_TODO_SERVICE_NAME);
  }

  

  
  async findAll(): Promise<{ todos: Todo[] }> {
    const todos = await this.todoRepository.find();
    return { todos };
  }

  async findOne(id: string): Promise<Todo | null> {
    const parsedId = parseInt(id, 10);
    return this.todoRepository.findOneBy({ id:parsedId });
  }

  async create(title: string): Promise<Todo> {
    const todo = this.todoRepository.create({ title });
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

  
  createTodoInColleagueService(title: string): Observable<Todo> {
    return this.colleagueTodoService.createTodo({ title }).pipe(
      map(todo => ({
        ...todo,
        id: Number(todo.id),
      })),
    );
  }
  

  getTodosFromColleague(): Observable<{ todos: Todo[] }> {
    console.log(`🔹 Updating todo in COLLEAGUE'S APP: `);
    
    return this.colleagueTodoService.getTodos({} as Empty).pipe(
      map(response => ({
        todos: response.todos.map(todo => ({
          ...todo,
          id: Number(todo.id),
        })),
      })),
    );
  }

  getTodoByIdFromColleague(id: string): Observable<Todo> {
    return this.colleagueTodoService.getTodoById({ id }).pipe(
      map(todo => ({
        ...todo,
        id: Number(todo.id),
      })),
    );
  }
  

  updateTodoByIdInColleague(id: string, title: string, completed: boolean): Observable<Empty> {
    return this.colleagueTodoService.updateTodoById({ id, title, completed });
  }

  deleteTodoByIdInColleague(id: string): Observable<Empty> {
    return this.colleagueTodoService.deleteTodoById({ id });
  }


  // async testColleagueConnection() {
  //   this.getTodosFromColleague().subscribe(response => {
  //     console.log('✅ Successfully fetched todos from colleague:', response.todos);
  //   });
  // }
 
 


}
