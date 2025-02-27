import { IntersectionType, PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsDefined, IsOptional, IsString } from "class-validator";


export class FindOneParams {
  @IsString()
  @IsDefined()
  id: string;
}


export class CreateTodoDto {
  @IsString()
  @IsDefined()
  title: string;
}

export class UpdateTodoDto extends IntersectionType(
    FindOneParams,
    PartialType(CreateTodoDto)
) {
    @IsBoolean()
    @IsOptional()
    completed: boolean;
}

