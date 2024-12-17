export class LaboratoryResult {
    public id: number;
    public patient_id: number;
    public test_type: any;
    public results: any;
    public notes: string;

    constructor(data: LaboratoryResult | void) {
        if(data == undefined)
        {
            this.id = 0;
            this.patient_id = 0;
            this.test_type = {};
            this.results = {};
            this.notes = '';
        } else {
            this.id = data.id;
            this.patient_id = data.patient_id;
            this.test_type = data.test_type;
            this.results = data.results;
            this.notes = data.notes;
        }
    }
}