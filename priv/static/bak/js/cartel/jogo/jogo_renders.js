var h =  maquette.h;


var JogoRenders = {


    players: function(){
      var model = window.jogo;
      var  player = Jogadores.me();
      var players = Jogadores.getAll(jogo.uid)
      players.sort(function(a,b){
        return b.din - a.din;
      })
      return h("div",[
        players.map(function(p,i){

            var msgs = [];
            if(p.messages){
              msgs = p.messages.filter(function(m){
                return m.viewed == false;
              });
              msgs.forEach(function(m){
                if(m.from.uid == window.PLAYER.uid){
                  channel.push("alerta_tiny", {a: "<small> <b><img width='20'src='"+player.avatar+"'/>"+(player.nome||"Sem nome")+"</b>: </small><small>"+m.msg+"</small>"}, 10000);  
                }else{
                  channel.push("alerta_tiny#"+window.PLAYER.uid, {a: "<small> <b><img width='20'src='"+m.from.avatar+"'/>"+(m.from.nome||"Sem nome")+"</b>    diz em privado: </small><small>"+m.msg+"</small>"}, 10000);
                }
                
                m.viewed = true;
              })
              p.messages = [];
            }
            return h("div.is-light",{key:p,
              styles: {
                width:"35px",
                padding:"5px",
                position: "fixed",
                left: "0px",
                zIndex:"500000",  
                backgroundColor: p.vez ? "#550000AA" : "#FFF",
                top:(45*(i+2))+"px"
              },
              title: p.nome
            },[
              p.send ? h("div",{styles:{position:"relative"}},[
                h("div",{styles:{position:"absolute", left:"30px", zIndex:"500001   "}},[
                  h("form",{onsubmit: JogoChannels.envia_mensagem, player: p},[
                    h("input", {name:"msg", afterCreate: JogoChannels.after_created_input, placeholder:"Envie uma mensagem"})
                  ])
                  
                ])
              ]):null,
              h("img",{onclick: JogoChannels.send_a_message, player: p, src:p.avatar||"/images/players/no-image.png", styles:{width:"35px"}}),
              p.vez ? h("i.fa.fa-clock.np", {styles:{ position: "absolute", color: "#C80000FF"}}): null
            ])
        })
      ])
    },
    acoes: function(){
      var model = window.jogo;
      var players = Jogadores.getAll(jogo.uid);
      return h("div",{key:"acoes_board", styles:{ 
        position: "fixed",
        zIndex:"255500",
        backgroundColor:"#EEEEEEFF",
        width:"100%",
        overflow:"auto",
        height:"100%"}},[
        h("div.button.is-black",{onclick:JogoChannels.fechar_ver_acoes},["Fechar"]),
        h("h2.has-text-centered",["Ações"]),
        h("div.corpo-ver_acoes",[
          h("table.table.is-bordered",{
            styles:{
              margin:"auto"
            }
          },[
              h("thead",[
                h("tr",[
                  h("th",["Empresa"]),
                  players.map(function(p){
                    return h("th",[
                      h("img",{src: p.avatar || "/images/players/no-image.png", styles:{width:"25px", marginRight:"5px"}}),
                      p.nome
                    ])
                  })
                  
                ])
              ]),
              h("tbody",[
                window.jogo.empresas.map(function(e){
                  var preco = e.price || "X"
                  return h("tr",[
                      h("td",[
                        h("img",{src: e.icon, styles:{width:"25px", marginRight:"5px"}}),
                        h("b",[e.name]),
                        "["+e.pecas+"]("+preco+")"
                      ]),
                      players.map(function(p){
                        var id = R.findIndex(R.propEq('uid', e.uid))(p.acoes);
                        var acao = 0;
                        if(id!= -1){
                          acao = p.acoes[id].acoes;
                        }
                        return h("td",[acao])
                      })
                    ])
                })
              ])  
            ])
        ])
      ])
    },
    my_pieces: function(model){
      var model = window.jogo;
      var player = Jogadores.me();
      return h("nav.cartel-bottom-bar.uk-navbar-container",{"uk-navbar":"uk-navbar", styles:{position:"fixed", width:"100%", bottom:"20px", background:"transparent"}},[
        h("div.uk-navbar-left",[
          h("div.navbar-item.cartel-pieces-buttons.buttons.has-addons",[
            // h("div.button.is-light",["Banco"])
          ])
        ]),
        h("div.uk-navbar-center",[

        player.pieces.map(function(p,i){

            return h("div.piece", {key: p,
              onmouseover: JogoChannels.simula_peca,
              onclick: JogoChannels.simula_peca,
              onmouseout:JogoFunctions.clear_all_simula_pecas,
              ondblclick: JogoChannels.board_insert_peca,
              item: p},[h("div.np.cartel-pieces",[p.row+p.column])])
          })
        ]),
        h("div.uk-navbar-right",[
          h("div.navbar-item.cartel-buttons.buttons.has-addons",[
            // h("div.button.is-success",["R$ 0,00"])
          ])
        ])
      ])

    },
    toolbar: function(model){
      var model = window.jogo;
      var player = Jogadores.me();
      numeral.locale('pt_br');
      var num =  numeral(player.din);
      return h("nav.cartel-top-bar.uk-navbar-container",{"uk-navbar":"uk-navbar", styles:{zIndex:"250000"}},[
        h("div.uk-navbar-left",[
          h("div.navbar-item.cartel-buttons.buttons.has-addons",[
            h("div.button.is-light", {onclick: JogoChannels.ver_acoes},["Ações"])
          ]),
          player.uid == jogo.criador ? (jogo.historico.length ? h("div.navbar-item.cartel-buttons.buttons.has-addons",{key:"ant01"},[
            h("div.button.is-danger", {onclick: JogoChannels.jogada_anterior},["Anterior"]) 
          ]):null): null
        ]),
        h("div.uk-navbar-center",[
          player.acoes.map(function(e,i){
            var idx = R.findIndex(R.propEq('uid', e.uid))(model.empresas);
            var emp = model.empresas[idx];
            emp.acoes = e.acoes;

            return h("div.cartel-empresa",{key:e},[
              h("div.tag.empresa-logo", { /*onclick:JogoChannels.vende_acoes*/ player: player, item: e, title: emp.name + " (R$"+emp.price+",00*"+emp.acoes+" = R$ "+emp.price*emp.acoes+")",  styles: { backgroundColor:emp.cor}}),
              h("div.empresa-acoes",[emp.acoes])
            ])
          })
        ]),
        h("div.uk-navbar-right",[
          h("div.navbar-item.cartel-buttons.buttons.has-addons",{
          },[
            h("div.button.is-success",[num.format('$0.00[,]00 ')])
          ])
        ])
      ])
    },

    board: function(){
      var model = window.jogo;
      return h("table.table.is-bordered.is-striped.cartel-board",
      { key:"board"
      , afterCreate: JogoChannels.board_created
      , onmouseover: JogoChannels.board_mouse_move
      , onmouseout: JogoFunctions.clear_all_simula_pecas
      },[
        h("thead",[
          h("tr",[
            h("th", ["-"]),
            function(){
              var colunas = []
              for(i = 1; i <= model.colunas; i++){
                colunas.push(h("th.board-column-"+i, [i.toString()]))
              }
              return colunas
            }(),
          ])
        ]),
        h("tbody",[
          model.linhas.map(function(c){
            return h("tr.board-row-"+c,[
              h("th", [c]),
              function(){
                var colunas = []
                for(i = 1; i <= model.colunas; i++){
                  var item = R.filter(function(e){ return e.row == c && e.column == i;}, model.board)[0];

                  var empresa_cor = "rgba(255, 255, 255, 1)";
                  if(item.empresa){
                    var emp = model.empresas.filter(function(e){
                      return e.uid == item.empresa;
                    })[0]
                    empresa_cor = emp.cor;
                  }

                  var cores = [empresa_cor];
                  if(item.hover){
                    if(item.selected){
                      if(item.empresa && item.player){
                        cores = [empresa_cor, "rgba(255,255,255,0.5)"]
                      }else if(item.player){
                        cores = [empresa_cor, "rgba(255, 14, 202, 1)"];
                      }else{
                        cores = ["rgba(255, 6, 34, 1)"];
                      }
                    }else if(item.player && item.empresa){
                      cores = [empresa_cor, "rgba(255,255,255,0.5)"]
                    }else if(item.player){
                      cores = [empresa_cor, "rgba(87, 108, 119, 0.8)"]

                    }else{
                      cores = [empresa_cor, "rgba(232, 227, 230, 0.2)"];
                    }
                  }else{
                    if(item.player && item.empresa){
                      cores = [empresa_cor]
                    }else if(item.player){
                      cores = [empresa_cor, "rgba(87, 108, 119, 1)"]

                    }
                  }
                  empresa_cor = chroma.average(cores).css();

                  var classe_item_board = ".board-row-"+c+".board-column-"+i;
                  colunas.push(h("td.cartel-tile"+classe_item_board,{ /*ondblclick: JogoChannels.board_insert_peca,*/item: item, "empty": !item.player?"true":"false", classes:{ "piece-on-board":item.player?true:false}, styles:{
                    border: "1px solid #E5E5E5FF",
                    backgroundColor:empresa_cor
                  }},[item.display]))
                }
                return colunas
              }(),
            ])
          })

        ]),
      ])
    },
    fim_do_jogo: function(){
      numeral.locale('pt_br');
      var players = Jogadores.getAll(jogo.uid);
      players.sort(function(a,b){
        return b.din - a.din
      })
      return h("section.is-fullheight.cartel",{ styles: {
        height: window.innerHeight+"px"
      }},[
        h("div.hero-body",[
          h("div.container.has-text-centered",[
            h("div.column",[
              h("h3.title.has-text=grey",[
                "Fim do Jogo"
              ]),

              players.map(function(p,i){
                var primary=false;
                if(p.uid == window.PLAYER.uid){
                  primary=true;
                }
                var num =  numeral(p.din);
                return h("div.box",{key: p, styles:{
                  margin: "5px", 
                  width: "100%", 
                  position: "relative",
                  float: "left",
                  }},[
                  h("table.table",{
                    styles:{
                      width: "100%"
                    }
                  },[
                    h("tbody",[
                      h("tr",[
                        h("td",{styles:{verticalAlign:"middle"}},[
                          h("b", {styles: { color: "#000000FF", fontSize:"45px"}},[ (i+1).toString()])
                        ]),
                        h("td",{styles:{verticalAlign:"middle"}},[
                          h("img",{src:p.avatar || "/images/players/no-image.png", styles: {width:"70px"}}),
                        ]),
                        h("td",{styles:{verticalAlign:"middle"}},[
                          h("div",[
                            p.nome ? p.nome : "Jogador "+(i+1)
                          ]),
                        ]),
                        h("td",{styles:{verticalAlign:"middle"}},[
                          h("b",{styles: { fontSize:"20px"}},[
                            num.format('$0.00[,]00 ')
                          ])
                        ])
                      ])
                    ])
                  ])  
                ])
              }),
              h("div.button.is-danger",{onclick:JogoChannels.new_game},[
                "Começar novo jogo!"
              ])
            ])
          ])

        ])
      ])
    },

    main: function(){
      var player = Jogadores.me();
      if(!player){
        return h("div",{styles:{width:"100px", margin:"auto", marginTop:"100px"}},["Aguardando Jogadores"]);
      }
      
      
      return h('div',{key:window.uid,
        afterCreate: JogoChannels.after_created_game
      },[
         h('div',{classes:{"vez": player.vez, "aguarde": !player.vez}},[ player.vez?"":"Aguarde sua vez..."]),
         player.ver_acoes ? JogoRenders.acoes():null,
         JogoRenders.toolbar(),
         JogoRenders.players(),
         JogoRenders.board(),
         JogoRenders.my_pieces(),
      ])
    }

}
var subscriptions = {
    onresize: function(){
      JogoFunctions.board_zoom(document.querySelector(".cartel-board"));
    }
};
var init_subscriptions = function(){
  window.addEventListener("resize", subscriptions.onresize);
}
