export class Recipe {
    public id: number;
    public patient_id: number;
    public medications: any;
    public notes: string;

    constructor(data: Recipe | void) {
        if(data == undefined)
        {
            this.id = 0;
            this.patient_id = 0;
            this.medications = {};
            this.notes = '';
        } else {
            this.id = data.id;
            this.patient_id = data.patient_id;
            this.medications = data.medications;
            this.notes = data.notes;
        }
    }
}