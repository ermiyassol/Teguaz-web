export class TripModel {
  constructor(
    public date: string,
    public time: string,
    public startingCity: string,
    public destinationCity: string,
    public startingPlace: string[],
    public driver: string,
    public busNo: string,
    public companyId: string,
    public key?: string,
    public passengers?: []
  ) {}
}
