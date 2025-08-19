import { $Enums } from '@prisma/client';

export class OtpValidateDto {
    userId: string;
    type: $Enums.OtpType;
    code: string;
}
