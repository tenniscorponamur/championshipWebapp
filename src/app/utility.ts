export function compare(a, b, isAsc):number {
    //TODO : voir comment comparer avec null
    if (a==b){
        return 0;
    }
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export function addLeadingZero(value:number):string{
  if (value<10){
    return "0"+value;
  }else{
    return ""+value;
  }
}

