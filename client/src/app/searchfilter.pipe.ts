import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchfilter'
})
export class SearchfilterPipe implements PipeTransform {

  transform(arr , searchValue): any {
    if(searchValue.length < 1 ){
return arr;
    }

    return arr.filter(x=>x.name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1)

  }

}
