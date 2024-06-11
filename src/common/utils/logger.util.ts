import { Logger } from "@nestjs/common";

export class CustomLogger extends Logger {

    log(message: string){
        super.log(`[AppService] $(message)`);
    }

    error(message: string, trace: string){
        super.error(`[AppService] $(message)`, trace);
    }
}