"use strict";(self.webpackChunkproject=self.webpackChunkproject||[]).push([[258],{5224:function(B,O,a){a.r(O),a.d(O,{CreateModule:function(){return W}});var v=a(3144),C=a(5671),S=a(9776),f=a(9808),M=a(3075),y=a(2271),h=a(1083),u=a(4942),s=a(2107),g=a(7106),P=a(2473),d=a(5581),e=a(5542),p=a(8223),m=a(9224),_=a(4917),E=a(6702),Z=a(7423);function F(r,i){if(1&r){var n=e.EpF();e.TgZ(0,"div",6),e.NdJ("click",function(){var x=e.CHM(n).$implicit;return e.oxw().selectedClass=x}),e._UZ(1,"img",7),e.TgZ(2,"div",8),e._uU(3),e.qZA(),e.qZA()}if(2&r){var t=i.$implicit,o=e.oxw();e.ekj("selected",o.selectedClass===t),e.xp6(1),e.MGl("src","assets/img/character/icon/",t,"/head.png",e.LSH),e.xp6(2),e.Oqu(o.getLevel(t))}}var b=function(){var r=function(){function i(n,t,o,c,l){(0,C.Z)(this,i),this.messageService=n,this.router=t,this.plannerService=o,this.slormancerSaveParserService=c,this.slormancerCharacterBuilderService=l,this.HERO_CLASSES=[s.i.Warrior,s.i.Huntress,s.i.Mage],this.characters=null,this.selectedClass=null}return(0,v.Z)(i,[{key:"parseGameSave",value:function(t){try{var o,c=this.slormancerSaveParserService.parseSaveFile(t);this.characters=((0,u.Z)(o={},s.i.Warrior,this.slormancerCharacterBuilderService.getCharacterFromSave(c,s.i.Warrior)),(0,u.Z)(o,s.i.Huntress,this.slormancerCharacterBuilderService.getCharacterFromSave(c,s.i.Huntress)),(0,u.Z)(o,s.i.Mage,this.slormancerCharacterBuilderService.getCharacterFromSave(c,s.i.Mage)),o),this.selectedClass=null}catch(l){console.error(l),this.messageService.error("An error occured while parsing this save file")}}},{key:"getLevel",value:function(t){var o="";return null!==this.characters&&(o=this.characters[t].level.toString()),o}},{key:"createBuild",value:function(){null!==this.selectedClass&&null!==this.characters&&(this.plannerService.createNewPlanner(this.selectedClass,this.characters[this.selectedClass]),this.router.navigate(["/build"]))}}]),i}();return r.\u0275fac=function(n){return new(n||r)(e.Y36(p.e),e.Y36(h.F0),e.Y36(_.q),e.Y36(g.X),e.Y36(P.o))},r.\u0275cmp=e.Xpm({type:r,selectors:[["app-create-build-from-game"]],decls:9,vars:6,consts:[[1,"import-game"],["label","Upload a Slormancer save file",3,"upload"],[1,"save-summary"],[1,"classes"],["class","head",3,"selected","click",4,"ngFor","ngForOf"],["mat-flat-button","","color","primary",3,"disabled","click"],[1,"head",3,"click"],[3,"src"],[1,"level"]],template:function(n,t){1&n&&(e.TgZ(0,"div",0),e.TgZ(1,"app-file-upload-button",1),e.NdJ("upload",function(c){return t.parseGameSave(c)}),e.qZA(),e.TgZ(2,"div",2),e.TgZ(3,"p"),e._uU(4,"Choose which character you want to upload"),e.qZA(),e.TgZ(5,"div",3),e.YNc(6,F,4,4,"div",4),e.qZA(),e.qZA(),e.TgZ(7,"button",5),e.NdJ("click",function(){return t.createBuild()}),e._uU(8,"Create build"),e.qZA(),e.qZA()),2&n&&(e.xp6(2),e.ekj("disabled",null===t.characters),e.xp6(1),e.ekj("disabled",null===t.characters),e.xp6(3),e.Q6J("ngForOf",t.HERO_CLASSES),e.xp6(1),e.Q6J("disabled",null===t.characters||null===t.selectedClass))},directives:[E.Q,f.sg,Z.lW],styles:[".import-game[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:stretch;grid-gap:12px;gap:12px}.import-game[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{text-align:center;margin-top:0}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;grid-gap:4px;gap:4px}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]{display:flex;flex-direction:row;align-items:center;grid-gap:4px;gap:4px;padding-bottom:20px}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]   .head[_ngcontent-%COMP%]{position:relative;border:4px solid black;width:40px;height:40px}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]   .head[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:100%;height:100%;image-rendering:pixelated;transition:opacity .5s}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]   .head[_ngcontent-%COMP%]   .level[_ngcontent-%COMP%]{position:absolute;bottom:-20px;width:24px;height:24px;line-height:8px;font-size:12px;text-align:center;border:2px solid black;padding:4px;border-radius:20% 20% 50% 50%;background-color:#353535;transition:opacity .5s;left:50%;transform:translate(-50%)}.import-game[_ngcontent-%COMP%]   .save-summary.disabled[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{opacity:.1}.import-game[_ngcontent-%COMP%]   .save-summary.disabled[_ngcontent-%COMP%]   .level[_ngcontent-%COMP%], .import-game[_ngcontent-%COMP%]   .save-summary.disabled[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{opacity:0}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]:not(.disabled){cursor:pointer}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]:not(.disabled)   .classes[_ngcontent-%COMP%]   .head.selected[_ngcontent-%COMP%], .import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]:not(.disabled)   .classes[_ngcontent-%COMP%]   .head.selected[_ngcontent-%COMP%]   .level[_ngcontent-%COMP%]{border-color:#b7b7b7}"]}),r}(),T=a(2846),D=function(){var r=function(){function i(n,t){(0,C.Z)(this,i),this.router=n,this.plannerService=t}return(0,v.Z)(i,[{key:"createBuild",value:function(t){null!==t.character?(this.plannerService.createNewPlanner(t.character.heroClass,t.character),this.router.navigate(["/build"])):null!==t.layer?(this.plannerService.createNewPlanner(t.layer.character.heroClass,t.layer.character,t.layer.name),this.router.navigate(["/build"])):null!==t.planner&&(this.plannerService.setPlanner(t.planner),this.router.navigate(["/build"]))}}]),i}();return r.\u0275fac=function(n){return new(n||r)(e.Y36(h.F0),e.Y36(_.q))},r.\u0275cmp=e.Xpm({type:r,selectors:[["app-create-build-from-export"]],decls:2,vars:0,consts:[[1,"import-game"],["uploadLabel","Upload an exported file","importLabel","Create build",3,"import"]],template:function(n,t){1&n&&(e.TgZ(0,"div",0),e.TgZ(1,"app-import-data",1),e.NdJ("import",function(c){return t.createBuild(c)}),e.qZA(),e.qZA())},directives:[T.M],styles:["input[type=file][_ngcontent-%COMP%]{display:none}.import-game[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:stretch;grid-gap:12px;gap:12px}.import-game[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{text-align:center;margin-top:0}"]}),r}();function L(r,i){if(1&r){var n=e.EpF();e.TgZ(0,"div",5),e.NdJ("click",function(){var x=e.CHM(n).$implicit;return e.oxw().selectedClass=x}),e._UZ(1,"img",6),e.qZA()}if(2&r){var t=i.$implicit,o=e.oxw();e.ekj("selected",o.selectedClass===t),e.xp6(1),e.MGl("src","assets/img/character/icon/",t,"/head.png",e.LSH)}}var U=function(){var r=function(){function i(n,t){(0,C.Z)(this,i),this.router=n,this.plannerService=t,this.HERO_CLASSES=[s.i.Warrior,s.i.Huntress,s.i.Mage],this.selectedClass=null}return(0,v.Z)(i,[{key:"createBuild",value:function(){null!==this.selectedClass&&(this.plannerService.createNewPlanner(this.selectedClass),this.router.navigate(["/build"]))}}]),i}();return r.\u0275fac=function(n){return new(n||r)(e.Y36(h.F0),e.Y36(_.q))},r.\u0275cmp=e.Xpm({type:r,selectors:[["app-create-build-empty"]],decls:8,vars:2,consts:[[1,"import-game"],[1,"save-summary"],[1,"classes"],["class","head",3,"selected","click",4,"ngFor","ngForOf"],["mat-flat-button","","color","primary",3,"disabled","click"],[1,"head",3,"click"],[3,"src"]],template:function(n,t){1&n&&(e.TgZ(0,"div",0),e.TgZ(1,"div",1),e.TgZ(2,"p"),e._uU(3,"Choose which character you want to build"),e.qZA(),e.TgZ(4,"div",2),e.YNc(5,L,2,3,"div",3),e.qZA(),e.qZA(),e.TgZ(6,"button",4),e.NdJ("click",function(){return t.createBuild()}),e._uU(7,"Create build"),e.qZA(),e.qZA()),2&n&&(e.xp6(5),e.Q6J("ngForOf",t.HERO_CLASSES),e.xp6(1),e.Q6J("disabled",null===t.selectedClass))},directives:[f.sg,Z.lW],styles:["input[type=file][_ngcontent-%COMP%]{display:none}.import-game[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:stretch;grid-gap:12px;gap:12px}.import-game[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{text-align:center;margin-top:0}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;grid-gap:4px;gap:4px}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]{display:flex;flex-direction:row;align-items:center;grid-gap:4px;gap:4px;padding-bottom:20px}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]   .head[_ngcontent-%COMP%]{position:relative;border:4px solid black;width:40px;height:40px}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]   .head[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:100%;height:100%;image-rendering:pixelated;transition:opacity .5s}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]   .classes[_ngcontent-%COMP%]   .head[_ngcontent-%COMP%]   .level[_ngcontent-%COMP%]{position:absolute;bottom:-20px;width:16px;height:16px;line-height:14px;text-align:center;border:2px solid black;padding:4px;border-radius:20% 20% 50% 50%;background-color:#353535;transition:opacity .5s;left:50%;transform:translate(-50%)}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]:not(.disabled){cursor:pointer}.import-game[_ngcontent-%COMP%]   .save-summary[_ngcontent-%COMP%]:not(.disabled)   .classes[_ngcontent-%COMP%]   .head.selected[_ngcontent-%COMP%]{border-color:#b7b7b7}"]}),r}(),R=[{path:"",component:function(){var r=function(){function i(n,t,o){(0,C.Z)(this,i),this.messageService=n,this.slormancerSaveParserService=t,this.slormancerCharacterBuilderService=o,this.MAX_UPLOAD_FILE_SIZE_MO=1,this.MAX_UPLOAD_FILE_SIZE=1048576*this.MAX_UPLOAD_FILE_SIZE_MO,this.importContent=new M.NI(null,M.kI.maxLength(this.MAX_UPLOAD_FILE_SIZE)),this.importResult=null,this.busy=!1,this.parsedGameCharacters=null}return(0,v.Z)(i,[{key:"uploadFile",value:function(t){return new Promise(function(o,c){var l=new FileReader;l.onerror=function(){l=null,c()},l.onloadend=function(){null!==l&&null!==l.result&&(o(l.result.toString()),l=null)},l.readAsText(t)})}},{key:"parseGameSave",value:function(t){try{var o,c=this.slormancerSaveParserService.parseSaveFile(t);this.parsedGameCharacters=((0,u.Z)(o={},s.i.Warrior,this.slormancerCharacterBuilderService.getCharacterFromSave(c,s.i.Warrior)),(0,u.Z)(o,s.i.Huntress,this.slormancerCharacterBuilderService.getCharacterFromSave(c,s.i.Huntress)),(0,u.Z)(o,s.i.Mage,this.slormancerCharacterBuilderService.getCharacterFromSave(c,s.i.Mage)),o)}catch(l){console.error(l),this.messageService.error("An error occured while parsing this save file")}}},{key:"uploadGameSave",value:function(t){var o=this;if(null!==t.target){var c=t.target.files,l=null===c?null:(0,d.lA)(c[0]);null!==l&&(l.size<=this.MAX_UPLOAD_FILE_SIZE?this.uploadFile(l).then(function(x){return o.parseGameSave(x)},function(){return o.messageService.error("Failed to upload this game save file")}):this.messageService.error("Cannot upload files bigger than "+this.MAX_UPLOAD_FILE_SIZE_MO+"Mo"))}}},{key:"uploadSave",value:function(t,o){if(null!==t.target){var c=t.target.files,l=null===c?null:(0,d.lA)(c[0]);null!==l&&(l.size<=this.MAX_UPLOAD_FILE_SIZE?o.value="":this.messageService.message("Cannot upload files bigger than "+this.MAX_UPLOAD_FILE_SIZE_MO+"Mo"))}}}]),i}();return r.\u0275fac=function(n){return new(n||r)(e.Y36(p.e),e.Y36(g.X),e.Y36(P.o))},r.\u0275cmp=e.Xpm({type:r,selectors:[["app-create-build"]],decls:14,vars:0,template:function(n,t){1&n&&(e.TgZ(0,"main"),e.TgZ(1,"mat-card"),e.TgZ(2,"mat-card-content"),e.TgZ(3,"h3"),e._uU(4,"Create build from a Slormancer save file"),e.qZA(),e._UZ(5,"app-create-build-from-game"),e._UZ(6,"hr"),e.TgZ(7,"h3"),e._uU(8,"Create build from exported data"),e.qZA(),e._UZ(9,"app-create-build-from-export"),e._UZ(10,"hr"),e.TgZ(11,"h3"),e._uU(12,"Create empty build"),e.qZA(),e._UZ(13,"app-create-build-empty"),e.qZA(),e.qZA(),e.qZA())},directives:[m.a8,m.dn,b,D,U],styles:["main[_ngcontent-%COMP%]{display:flex;flex-direction:row;align-items:stretch;justify-content:center;grid-gap:20px;gap:20px;padding:20px;overflow-x:auto}@media (max-width: 768px){main[_ngcontent-%COMP%]{flex-direction:column}}@media (max-width: 374px){main[_ngcontent-%COMP%]{padding-left:0;padding-right:0}}@media (max-width: 768px){main[_ngcontent-%COMP%]{height:auto}}main[_ngcontent-%COMP%]   mat-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:stretch;grid-gap:20px;gap:20px;width:340px;padding:0 60px}main[_ngcontent-%COMP%]   mat-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{width:100%;text-align:center;margin-top:0}@media (max-width: 768px){main[_ngcontent-%COMP%]   mat-card[_ngcontent-%COMP%]   mat-card-content[_ngcontent-%COMP%]{width:auto;padding:0}}"]}),r}()}],J=function(){var r=(0,v.Z)(function i(){(0,C.Z)(this,i)});return r.\u0275fac=function(n){return new(n||r)},r.\u0275mod=e.oAB({type:r}),r.\u0275inj=e.cJS({providers:[],imports:[[h.Bz.forChild(R)],h.Bz]}),r}(),W=function(){var r=(0,v.Z)(function i(){(0,C.Z)(this,i)});return r.\u0275fac=function(n){return new(n||r)},r.\u0275mod=e.oAB({type:r}),r.\u0275inj=e.cJS({providers:[],imports:[[f.ez,y.m,J,S.U8,M.u5]]}),r}()},8271:function(B,O,a){a.d(O,{s:function(){return s}});var v=a(5671),C=a(3144),S=a(7106),f=a(5458),M=a(2473),y=a(5581),h=a(3390),u=a(5542),s=function(){var g=function(){function P(d,e,p,m){(0,v.Z)(this,P),this.slormancerCharacterBuilderService=d,this.slormancerSaveParserService=e,this.slormancerShortDataService=p,this.jsonConverterService=m,this.VIEW_BUILD_PATH=window.origin+"/view/build/"}return(0,C.Z)(P,[{key:"parseSaveData",value:function(e,p){var m=this.slormancerSaveParserService.parseSaveFile(e);return this.slormancerCharacterBuilderService.getCharacterFromSave(m,p)}},{key:"parseUrlData",value:function(e){var p={character:null,layer:null,planner:null},m=null;try{var E=new URL(e).pathname.split("/");m=(0,y.lA)(E[E.length-1])}catch(Z){}return null!==m&&(p=this.importFromShortData(m)),p}},{key:"parseJsonData",value:function(e){var p=JSON.parse(e);return this.jsonConverterService.jsonToSharedData(p)}},{key:"import",value:function(e){var p=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,m={character:null,layer:null,planner:null};if(null!==p)try{return m.character=this.parseSaveData(e,p),m}catch(_){console.error("Error when parsing save file : ",_)}try{return this.parseJsonData(atob(e))}catch(_){}try{return this.parseJsonData(e)}catch(_){}return null===(m=this.importFromShortData(e)).character&&this.parseUrlData(e),m}},{key:"exportCharacter",value:function(e){return btoa(JSON.stringify(this.jsonConverterService.characterToJson(e)))}},{key:"exportLayer",value:function(e){return btoa(JSON.stringify(this.jsonConverterService.layerToJson(e)))}},{key:"exportPlanner",value:function(e){return btoa(JSON.stringify(this.jsonConverterService.plannerToJson(e)))}},{key:"exportCharacterAsLink",value:function(e){var p=this.slormancerShortDataService.characterToShortData(e);return this.VIEW_BUILD_PATH+p}},{key:"importFromShortData",value:function(e){return{character:this.slormancerShortDataService.shortDataToCharacter(e),layer:null,planner:null}}}]),P}();return g.\u0275fac=function(d){return new(d||g)(u.LFG(M.o),u.LFG(S.X),u.LFG(f.q),u.LFG(h.D))},g.\u0275prov=u.Yz7({token:g,factory:g.\u0275fac,providedIn:"root"}),g}()},2271:function(B,O,a){a.d(O,{m:function(){return h}});var v=a(3144),C=a(5671),S=a(9808),f=a(3075),M=a(9881),y=a(5542),h=function(){var u=(0,v.Z)(function s(){(0,C.Z)(this,s)});return u.\u0275fac=function(g){return new(g||u)},u.\u0275mod=y.oAB({type:u}),u.\u0275inj=y.cJS({providers:[],imports:[[S.ez,M.q,f.UX],M.q,f.UX]}),u}()}}]);