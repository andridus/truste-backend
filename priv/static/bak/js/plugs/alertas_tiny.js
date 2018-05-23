'use strict';

const AlertaTiny = {
  _allAlertas:[],
  alertaTinyProjector: maquette.createProjector(),

  init() {
    var h = maquette.h;
    var domNode = document.getElementById('alertas-tiny');

    var fadeInTiny = function(element){
      var tp = parseInt(element.style.top);
      element.style.top = (window.outerHeight/2 + 100) +"px";
      element.style.opacity = 0;
      Velocity.animate(element, {top:tp, opacity: 1}, {duration: 200, begin: 0}, "ease-out");
      if(!isType(["PROCESS"],element.item.tipo)){
        setTimeout(function(){
          //
          fadeOutTiny(element);
          AlertaTiny.fechar({target: element});
        }, 25000);
      }

    }
    var closeTiny = function(e){
      var element = e.target;
      fadeOutTiny(element);
      AlertaTiny.fechar({target: element});
    }
    var fadeOutTiny = function(element){
      Velocity.animate(element, {right:-260},
        {duration: 200,
        begin: 0,
        complete:function(){
          element.remove();
          AlertaTiny.alertaTinyProjector.renderNow();
        }
      }, "ease-out");
    }

    var isType = function(arrTp,tipo){
      var tp = tipo;
      return R.contains(tp, arrTp);
    }

    var posHeight = function(x){
      var idx = AlertaTiny._allAlertas.indexOf(x);
      var $el = document.getElementById("all_tiny_alertas");
      var height = 60;
      for(var j =0; j<idx; j++){
        var p = $el.childNodes[j].querySelector(".alerta_tiny-conteudo");
        if(p){
          height += p.offsetHeight+15;  
        }
        
      }
      return height+"px"
    }
    var alerta_tiny = {
      renderMaquette: function() {
        return h("div#all_tiny_alertas",{},[
          AlertaTiny._allAlertas.map(function(x,i){
            return h('div.alerta_tiny',{
              classes:{
                "tiny-is-danger":isType(["DANGER"],x.tipo),
                "tiny-is-info":isType(["INFO"],x.tipo)
              },
              key: x,
              onclick: closeTiny,
              enterAnimation: fadeInTiny, exitAnimation: fadeOutTiny,
              item: x,
              styles: {
                top: posHeight(x),
                border:
                  isType(["DANGER"],x.tipo) ? "1px solid red" : null
              }
            },[
              //h("div.button.is-small.is-danger.is-outlined.is-pulled-right",{onclick:AlertaTiny.fechar, item: x},[ h("i.fa.fa-times.np")]),
              /*h('div.alerta_tiny-titulo',{
                style: {
                  borderBottom:
                    isType(["DANGER"]) ? "1px solid rgba(255, 0, 0, 0.39)" : null
                }
              },[x.titulo]),*/
              h('div.alerta_tiny-conteudo',{innerHTML: x.corpo})

            ])
          })
        ])
      }
    };
      console.warn('ALERTA-TINY INICIADO')

      AlertaTiny.alertaTinyProjector.append(domNode, alerta_tiny.renderMaquette, {})



  },
  new_alerta_tiny(tipo,corpo){
    return {
      tipo: tipo || "INFO",
      corpo: corpo || "corpo",

    }
  },


  fechar(e){
    var item = e.target.item;
    var idx = AlertaTiny._allAlertas.indexOf(item);
    var a = AlertaTiny._allAlertas.splice(idx,1);
  },
  f(item){
    var idx = AlertaTiny._allAlertas.indexOf(item);
    var a = AlertaTiny._allAlertas.splice(idx,1);
    AlertaTiny.alertaTinyProjector.renderNow();
  },
  process(body){
    var item = AlertaTiny.new_alerta_tiny("PROCESS", body)
    AlertaTiny._allAlertas.push(item);
    AlertaTiny.alertaTinyProjector.renderNow();
    return item;
  },

  info(body, time = 0){
    setTimeout(function(){
      AlertaTiny._allAlertas.push(AlertaTiny.new_alerta_tiny("INFO", body));
    AlertaTiny.alertaTinyProjector.renderNow();  
    }, time)
    
  },

  danger(body){
    AlertaTiny._allAlertas.push(AlertaTiny.new_alerta_tiny("DANGER", body));
    AlertaTiny.alertaTinyProjector.renderNow();
  },

};
