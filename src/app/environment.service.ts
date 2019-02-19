import { Injectable } from '@angular/core';

@Injectable()
export class EnvironmentService {

  constructor() { }

    private devFrontEndUrl:string  = "http://localhost:4200";
    private testFrontEndUrl:string = "https://tenniscorpofrontend.herokuapp.com";
    private prodFrontEndUrl:string = "https://tenniscorponamur.herokuapp.com";

    private devBackEndUrl:string = "http://localhost:9100";
    private testBackEndUrl:string = "https://tenniscorpobackend.herokuapp.com";
    private prodBackEndUrl:string = "https://tenniscorponamurengine.herokuapp.com";

    isProduction(){
      return window.location.href.startsWith(this.prodFrontEndUrl);
    }

    getBackEndUrl(){

      if (window.location.href.startsWith(this.prodFrontEndUrl)){
         return this.prodBackEndUrl;
      }else if (window.location.href.startsWith(this.testFrontEndUrl)){
        return this.testBackEndUrl;
      }else{
        return this.devBackEndUrl;
      }

    }

    getPublicApiUrl(){
      return this.getBackEndUrl() + '/api/v1/public';
    }

    getPrivateApiUrl(){
      return this.getBackEndUrl() + '/api/v1/private';
    }

    getTokenUrl(){
      return this.getBackEndUrl() + '/oauth/token';
    }

    getRecaptchaKey(){
      if (this.isProduction()){
        return "6LcykZAUAAAAAMUjjsxQD1lo6F69qekxWdIRKcMR";
      }else{
        return "6LdAAHcUAAAAAMuhytC4gGWLu3yYFgFW9r8WH54E";
      }
    }

}
