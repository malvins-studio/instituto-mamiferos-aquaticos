import { Module } from "@nestjs/common";
import { OccurrenceModule } from "./modules/occurrences/occurrence.module";

@Module({
  imports: [OccurrenceModule],
})
export class AppModule {}
