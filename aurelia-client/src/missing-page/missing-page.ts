export class MissingPage {
  public static parameters: string[] = ["id"]
  public missingComponent: string

  public loading(parameters: { id: string }) {
    this.missingComponent = parameters.id
  }
}
