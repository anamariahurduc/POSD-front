export class MedicalRecord {
    public id: number;
    public patient_id: number;
    public doctor_id: number;
    public recipe_id: number;
    public diagnosis: string;
    public lab_result_ids: any;
    public procedures: string;
    public notes: string;
    public status: string;

    constructor(data: MedicalRecord | void) {
        if(data == undefined)
        {
            this.id = 0;
            this.patient_id = 0;
            this.doctor_id = 0;
            this.recipe_id = 0;
            this.diagnosis = '';
            this.lab_result_ids = {};
            this.procedures = '';
            this.notes = '';
            this.status = '';
        } else {
            this.id = data.id;
            this.patient_id = data.patient_id;
            this.doctor_id = data.doctor_id;
            this.recipe_id = data.recipe_id;
            this.diagnosis = data.diagnosis;
            this.lab_result_ids = data.lab_result_ids;
            this.procedures = data.procedures;
            this.notes = data.notes;
            this.status = data.status;
        }
    }
}