export class BusModel {
  constructor(
    public busNo: string,
    public drivers: string[],
    public seatNo: number,
    public key?: string
  ) {}
}
