import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import type { OccurrenceFormValues } from "@siima/shared";
import { OccurrenceService, type OccurrenceSituacao } from "./occurrence.service";

@Controller("occurrences")
export class OccurrenceController {
  constructor(private readonly occurrenceService: OccurrenceService) {}

  @Get()
  list(
    @Query("situacao") situacao?: OccurrenceSituacao,
    @Query("busca") busca?: string
  ) {
    return this.occurrenceService.list({ situacao, busca });
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    const values = await this.occurrenceService.getFormValues(id);
    if (!values) {
      throw new NotFoundException("Ocorrência não encontrada.");
    }
    return values;
  }

  @Post()
  create(@Body() body: OccurrenceFormValues) {
    return this.occurrenceService.create(body);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: OccurrenceFormValues) {
    return this.occurrenceService.update(id, body);
  }
}
