import {formatDate} from '@angular/common';

export function compare(a, b, isAsc):number {
    if (a==null) return (isAsc ? 1 : -1);
    if (b==null) return (isAsc ? -1 : 1);
    if (a==b){
        return 0;
    }
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

export function getDate(value:any):Date{
  let dateStr = formatDate(value,'dd/MM/yyyy HH:mm','fr-BE');
  let newDate = new Date();
  newDate.setFullYear(new Number(formatDate(value,'yyyy','fr-BE')).valueOf());
  newDate.setMonth(new Number(formatDate(value,'MM','fr-BE')).valueOf() - 1);
  newDate.setDate(new Number(formatDate(value,'dd','fr-BE')).valueOf());
  newDate.setHours(new Number(formatDate(value,'HH','fr-BE')).valueOf());
  newDate.setMinutes(new Number(formatDate(value,'mm','fr-BE')).valueOf());
  return newDate;
}

export function addLeadingZero(value:number):string{
  if (value<10){
    return "0"+value;
  }else{
    return ""+value;
  }
}

export function formatDateInString(date:Date){
  let dateStr:string = "";
  if (date){
    return formatDate(date,'yyyyMMdd','fr-BE');
  }
  return dateStr;
}
