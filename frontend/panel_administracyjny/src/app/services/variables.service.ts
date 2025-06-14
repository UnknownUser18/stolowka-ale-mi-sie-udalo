import { Injectable } from '@angular/core';
import { DataService, Opiekun, Student } from './data.service';

@Injectable({
  providedIn : 'root'
})
export class VariablesService {

  private persons_zsti : Student[] | undefined;
  private opiekun_zsti : Opiekun[] | undefined;

  constructor(
    private database : DataService
  ) {
  }

  public setUsersZsti(users : Student[]) : void {
    this.persons_zsti = users;
  }

  public getUsersZsti() : Student[] | undefined {
    return this.persons_zsti;
  }

  public setOpiekunZsti(opiekunowie : Opiekun[]) : void {
    this.opiekun_zsti = opiekunowie;
  }

  public getOpiekunZsti() : Opiekun[] | undefined {
    return this.opiekun_zsti;
  }

  public async fetchUsersZsti() : Promise<boolean> {
    try {
      const students = await this.database.request('zsti.student.get', {}, 'studentList');
      this.setUsersZsti(students);
      return true;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  public async fetchOpiekunZsti() : Promise<boolean> {
    try {
      const guardians = await this.database.request('zsti.guardian.get', {}, 'guardianList');
      this.setOpiekunZsti(guardians);
      return true;
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  /**
   * @method mapStudentsToOpiekun
   * @description Mapuje tablicę studentów do tablicy opiekunów, łącząc je na podstawie opiekun_id. Bierze na podstawie `this.persons_zsti` i `this.opiekun_zsti` z **VariablesService**.
   * @return Tablica studentów z dodanymi danymi opiekunów.
   * @example
   * this.mapStudentsToOpiekun().then((persons) => {
   *    this.persons_zsti = persons;
   * });
   * @memberOf VariablesService
   */
  public async mapStudentsToOpiekun() : Promise<(Student & Opiekun)[]> {
    if (!this.persons_zsti || !this.opiekun_zsti)
      await Promise.all([this.fetchUsersZsti(), this.fetchOpiekunZsti()]);

    if (this.persons_zsti?.length === 0 || this.opiekun_zsti?.length === 0)
      return [];

    return this.persons_zsti!.map((student) : Student & Opiekun => {
      const opiekun = this.opiekun_zsti!.find((opiekun) => opiekun.id === student.opiekun_id);
      return { ...student, ...opiekun } as Student & Opiekun;
    });
  }

  /**
   * @method getStudentFromId
   * @description Pobiera studenta na podstawie jego ID i łączy go z danymi opiekuna.
   * @param {number} id - ID studenta.
   * @return {Promise<(Student & Opiekun) | undefined>} - Obiekt studenta z danymi opiekuna lub undefined, jeśli nie znaleziono.
   * @example
   * const student = await this.getStudentFromId(1);
   * @memberOf VariablesService
   */
  public async getStudentFromId(id : number) : Promise<(Student & Opiekun) | undefined> {
    const student = this.database.request('zsti.student.getById', { id }, 'studentList');
    const opiekun = this.database.request('zsti.guardian.getByStudentId', { id }, 'guardianList');
    const [studentData, opiekunData] = await Promise.all([student, opiekun]);
    if (!studentData || studentData.length === 0 || !opiekunData || opiekunData.length === 0) {
      return undefined;
    }
    return { ...studentData[0], ...opiekunData[0] } as Student & Opiekun;
  }
}
