export function compare(a, b, isAsc):number {
    //TODO : voir comment comparer avec null
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
