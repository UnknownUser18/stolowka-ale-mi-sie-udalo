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
      const opiekun = this.opiekun_zsti!.find((opiekun) => opiekun.id_opiekun === student.opiekun_id);
      return { ...student, ...opiekun } as Student & Opiekun;
    });
  }
}
