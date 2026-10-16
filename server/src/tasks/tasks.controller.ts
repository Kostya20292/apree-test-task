import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

const taskIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException("Некорректный идентификатор"),
});

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", taskIdPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  create(@Body() input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  @Patch(":id")
  update(@Param("id", taskIdPipe) id: string, @Body() input: UpdateTaskDto) {
    return this.tasksService.update(id, input);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id", taskIdPipe) id: string) {
    await this.tasksService.remove(id);
  }
}
