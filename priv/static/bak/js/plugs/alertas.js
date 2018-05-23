  var alertaProjector = maquette.createProjector();
  var h = maquette.h;
  var domNode = document.getElementById('alertas');



  //PRIVATE
  var cancelarAlerta = function(e){
    _alertaModel.closed = true;
    if(_alertaModel.fun2){
      _alertaModel.fun2();
    }
  }
  var okAlerta = function(e){
    _alertaModel.closed = true;
    _alertaModel.fun();
  }
  var fadeIn = function(element){
    element.style.opacity = 0;
    //element.style.display = "none";
    //Velocity.animate(element, {display:"inline"}, {duration: 0, begin: 0}, "ease-out")
    Velocity.animate(element, {opacity: 1}, {duration: 200, begin: 0}, "ease-out")
  }
  var fadeOut = function(element){
    element.style.opacity = 100;
    Velocity.animate(element, {opacity: 0},
      { duration: 200,
        complete:function(){
          element.remove()
        },
        easing: "ease-out"});
  }

  var isType1 = function(arrTp){
    var tp = _alertaModel.type;
    return R.contains(tp, arrTp);
  }

  var alerta = {
    renderMaquette: function() {
      var model = _alertaModel;
      return h("div",{},[
        model.closed ?
          h('div',{},[]) :

          h('div.alerta-bg',{
            enterAnimation: fadeIn, exitAnimation: fadeOut,
            styles: {
              zIndex:"100000",
              width:"100%",
              backgroundColor:
                isType1(["DANGER"]) ? "rgba(255, 0, 0, 0.19)" : null
            }
          }, [
            h('div.alerta',{
              styles: {
                border:
                  isType1(["DANGER"]) ? "1px solid red" : null
              }
            },[
              h('div.alerta-titulo',{
                styles: {
                  borderBottom:
                    isType1(["DANGER"]) ? "1px solid rgba(255, 0, 0, 0.39)" : null
                }
              },[model.titulo]),
              h('div.alerta-conteudo',{innerHTML: model.corpo}),
              h('div.alerta-botoes',
                { styles: {
                  textAlign:"right"
                }
              },[
                !isType1(["INFO", "DANGER", "CONFIRM"]) ? null : (model.noCancel ? null : h('div.button.button-light',{onclick:cancelarAlerta},[model.cancelLabel])),
                !isType1(["DANGER"]) ? null : (model.noDanger ? null : h('div.button.button-warning',{onclick:cancelarAlerta},[model.dangerLabel])),
                !isType1(["INFO", "CONFIRM"]) ? null : (model.noPrimary ? null : h('div.button.button-primary',{onclick:okAlerta},[model.primaryLabel])),
              ])
            ])
          ])
        ])
    }
  };



  _alertaModel ={
    closed: true,
    allTypes: ["PROCESS","INFO","DANGER","CONFIRM"],
    type: "INFO",
    noPrimary: false,
    noDanger: false,
    noCancel: false,
    cancelLabel: "Fechar",
    dangerLabel: "Fechar",
    primaryLabel: "Certo",
    fun : function(){}

  };

  alertaProjector.append(domNode, alerta.renderMaquette, {})

  //PUBLICS
  Alerta = {
    fechar: function(){
      _alertaModel.closed = true;
      alertaProjector.renderNow();

    },
    process: function(title, body){
      _alertaModel.closed = false;
      _alertaModel.noPrimary = true;
      _alertaModel.noCancel = true;
      _alertaModel.type = "PROCESS";
      _alertaModel.titulo = title;
      _alertaModel.corpo = body;
      alertaProjector.renderNow();
    },

    info: function(title, body){
      _alertaModel.closed = false;
      _alertaModel.noPrimary = true;
      _alertaModel.noCancel = false;
      _alertaModel.type = "INFO";
      _alertaModel.titulo = title;
      _alertaModel.corpo = body;
      alertaProjector.renderNow();
    },

    danger: function(title, body){
      _alertaModel.closed = false;
      _alertaModel.noCancel = true;
      _alertaModel.type = "DANGER";
      _alertaModel.titulo = title;
      _alertaModel.corpo = body;
      alertaProjector.renderNow();
    },

    confirm: function(title, body, fn, fn2){
      _alertaModel.closed = false;
      _alertaModel.noCancel = false;
      _alertaModel.noPrimary = false;
      _alertaModel.cancelLabel = "Não";
      _alertaModel.primaryLabel = "Sim";
      _alertaModel.type = "CONFIRM";
      _alertaModel.titulo = title;
      _alertaModel.corpo = body;
      _alertaModel.fun = fn;
      _alertaModel.fun2 = fn2;
      alertaProjector.renderNow();
    },
    

  }
