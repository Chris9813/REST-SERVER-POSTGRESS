import { Request, Response } from 'express';
import { prisma } from '../../data/postgres';
import { CreateTodoDto } from '../../domain/dtos';
import { UpdateTodoDto } from '../../domain/dtos/todos/update-todo.dto';

export class TodosController {

  //* DI
  constructor() { }


  public getTodos = async ( req: Request, res: Response ) => {
    const todosDB = await prisma.todo.findMany();
    return res.json( todosDB );
  };

  public getTodoById = async ( req: Request, res: Response ) => {
    const id = +req.params.id;
    if ( isNaN( id ) ) return res.status( 400 ).json( { error: 'ID argument is not a number' } );

    // const todo = todos.find( todo => todo.id === id );
    const todo: any = await prisma.todo.findFirst({
      where:{
        id
      }
    });

    ( todo )
      ? res.json( todo )
      : res.status( 404 ).json( { error: `TODO with id ${ id } not found` } );
  };

  public createTodo = async ( req: Request, res: Response ) => {
    const [error, createTodoDto] = CreateTodoDto.create(req.body);
    if ( error ) return res.status( 400 ).json( { error } );

    const todo = await prisma.todo.create({
      data: createTodoDto as any,
    });

    res.json( todo );

  };

  public updateTodo = async( req: Request, res: Response ) => {
    const id = +req.params.id;
    const [error, updateTodoDto] = UpdateTodoDto.create({
      ...req.body, id,
    })
    if ( error ) return res.status( 400 ).json( { error } );
    const todo = await prisma.todo.findFirst({
      where:{
        id
      }
    });
    if ( !todo ) return res.status( 400 ).json( { error: `Todo with ${id} not found` } );

      const todoUpdated = await prisma.todo.update({
        where: {
          id,
        },
        data: (updateTodoDto as any).values as any
      })
      res.json( todoUpdated );
  }


  public deleteTodo = async(req:Request, res: Response) => {
    const id = +req.params.id;

    try {
      const todo = await prisma.todo.delete({
        where: {
          id,
        }
      })
      res.json( todo );
      
    } catch (error) {
      return res.status( 400 ).json( { error } );
    }
  }

}