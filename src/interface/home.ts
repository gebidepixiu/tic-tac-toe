export interface gameList extends vals{
    list:inCoordinate[]
}
export interface inCoordinate{
    x:number
    y:number
}
export interface vals{
    id?:number
    coordinate:inCoordinate
    value?:number
}