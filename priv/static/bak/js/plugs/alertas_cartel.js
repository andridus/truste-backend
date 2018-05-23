'use strict';

const AlertaCartel = {
  _alertaModel:{
    closed: true,
    allTypes: ["PROCESS","INFO","DANGER","CONFIRM"],
    type: "INFO",
    noPrimary: false,
    noDanger: false,
    noCancel: false,
    empresas: [],
    items: [],
    cancelLabel: "Fechar",
    dangerLabel: "Fechar",
    primaryLabel: "Certo",
    acoes_empresas: [],
    player_money: null,
    fun : function(){}

  },
  alertaProjector: maquette.createProjector(),

  init() {
    var h = maquette.h;
    var domNode = document.getElementById('alertas-cartel');



    //PRIVATE
    var cancelarAlerta = function(e){
      AlertaCartel._alertaModel.items.splice(0,1);
      AlertaCartel.alertaProjector.renderNow();
    }
     var noAlerta = function(e){
      var item = AlertaCartel._alertaModel.items[0];
      if(typeof item.fun2 =="function")
        item.fun2();
      cancelarAlerta();
    }
    var compraEmpresa = function(e){
      var empresa = e.target.item;

      var item = AlertaCartel._alertaModel.items[0];
      if(empresa.limite_para_compra <25){
        if(item.player_money - empresa.price >= 0)
        {
          empresa.limite_para_compra++
          if(item.acoes_empresas.length<3){
            item.acoes_empresas.push(empresa)
            item.player_money -= empresa.price;
          }else{
              AlertaTiny.info("Você só pode comprar no máximo 3 ações por rodada.")
          }
        }else{
          AlertaTiny.info("Você não tem recursos para adquirir ações dessa empresa")
        }

      }else{
        AlertaTiny.info("Nâo pode comprar! 25 é o limite de ações desta empresa")
      }
      

    }
    var vendeAcao = function(e){
      var empresa = e.target.item;
      var item = AlertaCartel._alertaModel.items[0];
        if(empresa.limite_para_venda){
          empresa.limite_para_venda--;
          item.acoes_empresas.push(empresa)
          item.player_money += empresa.price;
          AlertaCartel.alertaProjector.renderNow();
        }else{
          AlertaTiny.info("Você não tem mais ações dessa empresa");
        }

        

    }
    var okComprarAcoes = function(e){
      var item = AlertaCartel._alertaModel.items[0];
      item.fun(item.acoes_empresas, item.player_money);
      cancelarAlerta();
    }
    var selecionaImagem = function(e){
      var i = e.target.item
      var item = AlertaCartel._alertaModel.items[0];
      item.fun(item.path+i+".png");
      cancelarAlerta();
    }
    var cancelarComprarAcoes = function(e){
      var item = AlertaCartel._alertaModel.items[0];
      item.fun([], item.player_money);
      cancelarAlerta();
    }
    var removeEmpresa = function(e){
      var empresa = e.target.item;
      var item = AlertaCartel._alertaModel.items[0];
      item.player_money += empresa.price;
      empresa.limite_para_compra--;
      var idx = item.acoes_empresas.indexOf(empresa)
      item.acoes_empresas.splice(idx,1)
    }
    var removeEmpresaAcao = function(e){
      var empresa = e.target.item;
      var item = AlertaCartel._alertaModel.items[0];
      item.player_money -= empresa.price;
      empresa.limite_para_venda++;
      var idx = item.acoes_empresas.indexOf(empresa);
      item.acoes_empresas.splice(idx,1)
    }
    var okAlerta = function(e){
      var item = AlertaCartel._alertaModel.items[0];
      item.fun();
      cancelarAlerta();
    }
    var okEmpresa = function(e){
      var empresa = e.target.item;
      var item = AlertaCartel._alertaModel.items[0];
      item.fun(empresa);
      cancelarAlerta();
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
      var item = AlertaCartel._alertaModel.items[0];
      var tp = item.type;
      return R.contains(tp, arrTp);
    }

    var alerta = {
      renderMaquette: function() {
        var model = AlertaCartel._alertaModel;
        return h("div",{},[
          !model.items.length ? h("div",[]) :
          model.items[0].closed ?
            h('div',{},[]) :

            h('div.alerta-bg',{
              enterAnimation: fadeIn, exitAnimation: fadeOut,
              styles: {
                zIndex:"100001",
                backgroundColor:
                  isType1(["DANGER", "VENDE_ACOES"]) ? "#79E1E9AA" : null
              }
            }, [
              h('div.alerta',{
                styles: {
                  width: window.innerWidth < 600 ? "100%" : "400px",
                  border:
                    isType1(["DANGER", "VENDE_ACOES"]) ? "1px solid #79E1E9AA" : null
                }
              },[
                h('div.alerta-titulo',{
                  styles: {
                    borderBottom:
                      isType1(["DANGER"]) ? "1px solid rgba(255, 0, 0, 0.39)" : null
                  }
                },[model.items[0].titulo]),
                isType1(["CONFIRM","INFO"]) ? h('div.alerta-conteudo',{key:"c01",innerHTML: model.items[0].corpo}):null,
                isType1(["CONFIRM","INFO"]) ? null : h('div.alerta-conteudo',{key:"c02",
                  styles:{
                    overflowY: isType1(["ESCOLHE_IMAGEM"]) ? "scroll" : null,
                    height: isType1(["ESCOLHE_IMAGEM"]) ? "300px" : null
                  }
                },[
                  isType1(["ESCOLHE_IMAGEM"])?
                      h("div",{key:"esc"},[
                        model.items[0].num.map(function(p, j){
                            var i = j+1;
                            return h("div.card-empresa",{key:i, item: i, onclick: selecionaImagem,
                              styles: {height:"80px", width:"75px"}
                            }
                            ,[
                              h("img.empresa-icon.np", {src: model.items[0].path+i+".png"}),
                            ])

                        })
                      ])
                  :null,
                  isType1(["COMPRA_ACOES"])?
                      h("div",{key:"cmp1"},[
                        h("p",["Selecione a empresa de que você quer comprar ações!"]),
                        h("small",["pode comprar até três ações:"]),
                        h("div.is-clearfix"),
                        model.items[0].empresas.map(function(e){
                            return e.limite_para_compra <= 25 ? h("div.card-empresa",{key:e, item: e, onclick: compraEmpresa, styles:{backgroundColor:e.cor}}
                            ,[
                              h("div.empresa-title.np",[e.name]),
                              h("img.empresa-icon.np", {src: e.icon}),
                              h("div.empresa-price.np",[e.price])
                            ]):null

                        }),
                        h("div.is-clearfix"),
                        model.items[0].acoes_empresas.length ?  h("div",[
                          h("p",["Você Escolheu:"]),
                          h("hr"),
                          h("p",[
                            model.items[0].acoes_empresas.map(function(e){
                                console.log(e)
                                return h("div.card-empresa",
                                {key: e, item: e, onclick: removeEmpresa, styles:{backgroundColor:e.cor, zoom:"0.8"}}
                                ,[
                                  h("div.empresa-title.np",[e.name]),
                                  h("img.empresa-icon.np", {src: e.icon}),
                                ])

                            }),

                          ])
                        ]):null,
                        h("div.is-clearfix"),
                        h('div.tag.is-large.is-primary',[model.items[0].player_money]),
                        h('div.button.is-danger',{onclick:cancelarComprarAcoes},["Não comprar"]),
                        model.items[0].acoes_empresas.length ? h('div.button.is-success',{onclick:okComprarAcoes},["Comprar Ações"]): null,
                      ])
                  :null,
                  isType1(["VENDE_ACOES"])?
                      h("div",{key:"vda1"},[
                        h("p",["Selecione a empresa da qual você venderá suas ações!"]),
                        h("small",["pode vender quantas ações quiser:"]),
                        h("div.is-clearfix"),
                        model.items[0].empresas.map(function(e){
                            return e.limite_para_venda ?  h("div.card-empresa",{key:e, item: e, onclick: vendeAcao, styles:{backgroundColor:e.cor}}
                            ,[
                              h("div.empresa-title.np",[e.name]),
                              h("img.empresa-icon.np", {src: e.icon}),
                              h("div.empresa-price.np",[e.price])
                            ]):null

                        }),
                        h("div.is-clearfix"),
                        model.items[0].acoes_empresas.length ?  h("div",[
                          h("p",["Você Escolheu:"]),
                          h("hr"),
                          h("p",[
                            model.items[0].acoes_empresas.map(function(e){
                                console.log(e)
                                return h("div.card-empresa",
                                {key: e, item: e, onclick: removeEmpresaAcao, styles:{backgroundColor:e.cor, zoom:"0.8"}}
                                ,[
                                  h("div.empresa-title.np",[e.name]),
                                  h("img.empresa-icon.np", {src: e.icon}),
                                ])

                            }),

                          ])
                        ]):null,
                        h("div.is-clearfix"),
                        h('div.tag.is-large.is-primary',[model.items[0].player_money]),
                        h('div.button.is-danger',{onclick:cancelarComprarAcoes},["Não Vender"]),
                        model.items[0].acoes_empresas.length ? h('div.button.is-success',{onclick:okComprarAcoes},["Vender Ações"]): null,
                      ])
                  :null,
                  isType1(["NOVA_EMPRESA"])?
                  [
                      h("div",{key:"vna1"},[
                        h("p",["Você pode formar uma nova empresa!"]),
                        h("small",["Selecione a empresa que você deseja:"]),
                        h("div.is-clearfix"),
                        model.items[0].empresas.map(function(e){
                          var arr = Array.apply(null, {length: e.peso})
                          if(e.disponivel){
                            return h("div.card-empresa",
                            {key:e, item: e, onclick: okEmpresa, styles:{backgroundColor:e.cor}}
                            ,[
                              h("div.empresa-title.np",[e.name]),
                              h("img.empresa-icon.np", {src: e.icon}),
                              h("div.empresa-price.np",[
                                arr.map(function(e,i){
                                  return h("b.fa.fa-dollar",{styles:{color:"#fff", textShadow:"0px 0px 5px #000", fontSize:"20px"}},["$"])
                                })
                                
                              ])
                            ])
                          }else null

                        })

                      ])
                  ]: null,
                  isType1(["FUSAO_EMPRESA"])?
                    [
                        h("div",{key:"fs1"},[
                          h("p",["Como as quantidade de peças das empresas são iguais, você precisa escolher a empresa que vai continuar exisitindo!"]),
                          h("small",["Selecione a empresa que irá crescer:"]),
                          h("div.is-clearfix"),
                          model.items[0].empresas.map(function(e){
                            return h("div.card-empresa",
                            {key:e, item: e, onclick: okEmpresa, styles:{backgroundColor:e.cor}}
                            ,[
                              h("div.empresa-title.np",[e.name]),
                              h("img.empresa-icon.np", {src: e.icon}),
                              h("div.empresa-price.np",[""])
                            ])

                          })

                        ])
                    ]:null

                ]),
                h('div.alerta-botoes',
                  { styles: {
                    textAlign:"center"
                  }
                },[
                  !isType1(["INFO", "DANGER", "CONFIRM"]) ? null : (model.items[0].noCancel ? null : h('div.button.is-light',{onclick:noAlerta},[model.items[0].cancelLabel])),
                  !isType1(["DANGER"]) ? null : (model.items[0].noDanger ? null : h('div.button.is-warning',{onclick:noAlerta},[model.items[0].dangerLabel])),
                  !isType1(["INFO", "CONFIRM"]) ? null : (model.items[0].noPrimary ? null : h('div.button.is-primary',{onclick:okAlerta},[model.items[0].primaryLabel])),
                ])
              ])
            ])
          ])
      }

    };
    AlertaCartel.alertaProjector.append(domNode, alerta.renderMaquette, {})
    console.warn('ALERTAS INICIADO')
  },

  fechar(id){
    AlertaCartel._alertaModel.closed = true;
    AlertaCartel.alertaProjector.renderNow();
  },
  process(title, body){
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "PROCESS",
        noPrimary: true,
        noCancel: true,
        cancelLabel: "Ok",
        titulo: titulo,
        corpo: body,
      })
    AlertaCartel.alertaProjector.renderNow();
  },

  info(title, body){
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "INFO",
        noPrimary: true,
        noCancel: false,
        cancelLabel: "Ok",
        titulo: titulo,
        corpo: body,
      })
    AlertaCartel.alertaProjector.renderNow();1

  },
  nova_empresa(fun, empresas){
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "NOVA_EMPRESA",
        noPrimary: true,
        noCancel: true,
        cancelLabel: "Ok",
        titulo: "Nova Empresa!",
        corpo: "Você formou uma nova empresa!",
        empresas: empresas,
        fun: fun

      })
    AlertaCartel.alertaProjector.renderNow();
  },
  fusao_de_empresa(fun, empresas){
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "FUSAO_EMPRESA",
        noPrimary: true,
        noCancel: true,
        cancelLabel: "Ok",
        titulo: "Fusão de Empresas!",
        corpo: "Como as empresas tem a mesma quantidade de peças, você precisa escolhe a empresa que vai continuar existindo:",
        empresas: empresas,
        fun: fun

      })
    AlertaCartel.alertaProjector.renderNow();
  },
  compra_acoes(fun, empresas){
    var player = Jogadores.me();
    empresas.forEach(function(e){
      e.limite_para_compra = e.limite;
    })
    console.log(empresas)
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "COMPRA_ACOES",
        noPrimary: true,
        noCancel: true,
        cancelLabel: "Ok",
        titulo: "Compra de AÇÕES!",
        corpo: "Você pode escolher até três ações para comprar:",
        empresas: empresas,
        acoes_empresas: [],
        player_money: player.din,
        fun: fun

      })
    AlertaCartel.alertaProjector.renderNow();
  },
  vende_acoes(fun, empresas){
    var player = Jogadores.me();
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "VENDE_ACOES",
        noPrimary: true,
        noCancel: true,
        cancelLabel: "Ok",
        titulo: "Venda de AÇÕES!",
        corpo: "Você pode vender quantas ações quiser:",
        empresas: empresas,
        acoes_empresas: [],
        player_money: player.din,
        fun: fun

      })
    AlertaCartel.alertaProjector.renderNow();
  },
  choose_pic(fun, path, num){
    var player = Jogadores.me();
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "ESCOLHE_IMAGEM",
        noPrimary: true,
        noCancel: true,
        cancelLabel: "Ok",
        titulo: "Escolha a imagem do seu avatar!",
        path: path,
        num: Array.apply(null, {length: num}),
        fun: fun

      })
    AlertaCartel.alertaProjector.renderNow();
  },

  danger(title, body){
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "DANGER",
        noPrimary: false,
        noCancel: true,
        cancelLabel: "Ok",
        titulo: title,
        corpo: body
      })
    AlertaCartel.alertaProjector.renderNow();
  },

  confirm(title, body, fn){
    AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "CONFIRM",
        noPrimary: false,
        noCancel: false,
        cancelLabel: "Não",
        primaryLabel: "Sim",
        titulo: title,
        corpo: body,
        fun : fn
      })
    AlertaCartel.alertaProjector.renderNow();
  },
  confirm_user(uid, title, body, fn, fn2){
    var player = Jogadores.get(uid);
    if(player.uid == window.PLAYER.uid){
      AlertaCartel._alertaModel.items.push({
        closed: false,
        type: "CONFIRM",
        noPrimary: false,
        noCancel: false,
        cancelLabel: "Não",
        primaryLabel: "Sim",
        titulo: title,
        corpo: body,
        fun : fn,
        fun2 : fn2
      })
      AlertaCartel.alertaProjector.renderNow();
      
    }
    
  },
  confirm_only(title, body, fn){
    AlertaCartel._alertaModel.closed = false;
    AlertaCartel._alertaModel.noCancel = true;
    AlertaCartel._alertaModel.noPrimary = false;
    AlertaCartel._alertaModel.cancelLabel = "Não";
    AlertaCartel._alertaModel.primaryLabel = "Ok";
    AlertaCartel._alertaModel.type = "CONFIRM";
    AlertaCartel._alertaModel.titulo = title;
    AlertaCartel._alertaModel.corpo = body;
    AlertaCartel._alertaModel.fun = fn;
    AlertaCartel.alertaProjector.renderNow();
  }
};

//module.exports = Alerta
