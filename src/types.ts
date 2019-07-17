export interface ISocketMessage {
  topic:string
  type: string
  payload: string
}

export class TimeSet<T> extends Set<T>{
    public updateTime:number;
    constructor(...args:any){
        super(...args)
        this.updateTime=Date.now()
    }
    add(value:any){
        super.add(value);
        this.updateTime=Date.now()
        return this;
    }
}
