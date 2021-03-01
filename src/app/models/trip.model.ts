export class TripModel {
  constructor(
    public date: string,
    public time: string,
    public startingCity: string,
    public destinationCity: string,
    public startingPlace: string[],
    public busNo: string,
    public key?: string,
    public passengers?: []
  ) {}
}
