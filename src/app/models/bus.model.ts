export class BusModel {
  constructor(
    public busNo: string,
    public drivers: string[],
    public key?: string
  ) {}
}
