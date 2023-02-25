export class Config {
  public static readonly host: string = process.env.WGD_EVENT_LOG_URL
    ? process.env.WGD_EVENT_LOG_URL
    : 'http://localhost:3100';
  
    public static readonly createEventUrl: string = `${Config.host}/api/event/create`;
}
