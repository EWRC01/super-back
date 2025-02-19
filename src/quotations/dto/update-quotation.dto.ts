import { IsDate, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateQuotationDto {
        @IsDate()
        @ApiProperty({
            description: 'Fecha de la cotización',
            example: '2021-10-01T00:00:00.000Z',
        })
        date: Date;
    
        @IsNumber()
        @ApiProperty({
            description: 'Total de la cotización',
            example: 1500,
        })
        total: number;
    
        @IsNumber()
        @ApiProperty({
            description: 'Id del cliente',
            example: 1,
        })
        customerId: number;
    
        @IsNumber()
        @ApiProperty({
            description: 'Id del usuario',
            example: 1,
        })
        userId: number;
}
