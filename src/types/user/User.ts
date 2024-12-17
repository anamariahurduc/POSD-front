import {MedicalRecord} from "@/types/medical_documents/MedicalRecord";
import {Recipe} from "@/types/medical_documents/Recipe";
import {LaboratoryResult} from "@/types/medical_documents/LaboratoryResult";

export class User {
    public id: number;
    public email: string;
    public first_name: string;
    public last_name: string;
    public medical_records: MedicalRecord[];
    public recipes: Recipe[];
    public laboratory_results: LaboratoryResult[];

    constructor(data: User | void) {
        if(data == undefined)
        {
            this.id = 0;
            this.email = '';
            this.first_name = '';
            this.last_name = '';
            this.medical_records = <MedicalRecord[]>([]);
            this.recipes = <Recipe[]>([]);
            this.laboratory_results = <LaboratoryResult[]>([]);
        } else {
            this.id = data.id;
            this.email = data.email;
            this.first_name = data.first_name;
            this.last_name = data.last_name;
            this.medical_records = [];
            data.medical_records.forEach((medical_record) => {
                this.medical_records.push(medical_record);
            })
            this.recipes = [];
            data.recipes.forEach((recipe) => {
                this.recipes.push(recipe);
            })
            this.laboratory_results = [];
            data.laboratory_results.forEach((laboratory_result) => {
                this.laboratory_results.push(laboratory_result);
            })
        }
    }
}