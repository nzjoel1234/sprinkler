import express = require("express");

class Program {
  programId: number = 0;
  name: string;
  scheduleItems: ProgramScheduleItem[] = [];
  programScheduleType: ProgramScheduleType = ProgramScheduleType.ManualOnly;
  startTimeHours: number = 0;
  startTimeMinutes: number = 0;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

class ProgramScheduleItem {
  zoneId: number;
  minutes: number;
}

enum ProgramScheduleType {
  ManualOnly = 0,
  AllDays = 1,
  OddDays = 2,
  EvenDays = 3,
  DaysOfWeek = 4
}

let apiRouter = express.Router();

apiRouter.get('/programs', (request: express.Request, response: express.Response) => {
    
    let program1 = new Program()
    program1.programId = 1;
    program1.name = 'Program One';

    let program2 = new Program()
    program2.programId = 2;
    program2.name = 'Program Two';

    let program3 = new Program()
    program3.programId = 3;
    program3.name = 'Program Three';
    
    let testData = [ program1, program2, program3 ];
    response.send(testData);
});

export = apiRouter;