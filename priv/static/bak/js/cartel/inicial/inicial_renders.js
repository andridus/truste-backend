var h = maquette.h;
a = document.querySelector("html");
a.style.backgroundColor = "rgb(251, 217, 73)";
var InicialRenders = {
    main: function(){
      //RESGATA TODOS OS JOGADORES ONLINE
      var players = Jogadores.getAll();
      var poss = [];
      if(typeof sala != "undefined" )
        poss = Array.apply(null, {length: sala.max})
      //FILTRA APENAS PARA JOGADORES NÃO PRONTOS
      var nao_prontos = players.filter(function(x){
        return !x.pronto;
      });

      var uid = null;
      if(players.length>0){
        uid = players[0].uid;
      }

      var player  = Jogadores.me();

      var avatar = "/images/players/no-image.png";

      if(player)
      {
        var avatar = player.avatar || avatar;  
      }
      
      var player_box_width = "150px";
      var player_box_img_styles = {};
        player_box_img_styles = {
          maxWidth: "30px",
        }

      
      if(player){
        return h("section.is-fullheight.cartel",{ key: "01", styles: {
          height: window.innerHeight+"px"
        }},[
          window.sala ? h("div.sala-info",{styles:{position:"fixed", left:"0px", top:"0px"}} ,[
            h("img",{src:window.sala.emblema, styles:{width:"25px"}}),
            h("b",[window.sala.title]),
            h("span",["("+players.length+")"])
          ]):null,
          h("div.hero-body",[
            h("div.container.has-text-centered",[
              h("div.column",[
                h("h3.title.has-text=grey",[
                  "Cartel"
                ]),
                h("p.subtitle.has-text-grey",["O jogo das ações"]),
                h("div.box",{
                  onclick: InicialChannels.choose_pic,
                  styles: {width:"150px", margin:"auto", marginBottom:"10px"}
                },[
                  h("img.np",{src:avatar}),
                ]),
                

                h("p",[
                    !player.pronto ? h("input.input", { oninput: InicialChannels.change_name, item: player, placeholder: "Entre com seu nome", value: player.nome}) : null,
                    player.pronto ? h("div.button.is-success",{key:"dis1","disabled":"disabled", onclick: InicialChannels.estou_pronto, item: player },["Estou pronto"]) : h("div.button.is-success",{key:"dis2",onclick: InicialChannels.estou_pronto, item: player },["Estou pronto"]),
                    player.uid == jogo.criador? (nao_prontos.length ? h("div.button.is-danger",{key:"btn1","disabled":"disabled"},["Começar Jogo"]) : h("div.button.is-info",{key:"btn2", onclick: InicialChannels.prepara_jogo, item: player},["Começar Jogo"])): null
                  ]),
                window.jogo.preparando? 
                h("div",{key:"01"},[
                  h("p",{key:"n1"},["Arrumando dados iniciais do jogo"]),
                  h("p",{key:"n2"},["Aguarde..."])
                ])
                :h("div",{key:"02"},[
                  h("table.table",{styles:{width:"100%"}},[
                    h("thead",[
                      h("tr",[
                        h("th",[" - "]),
                        h("th",["Foto"]),
                        h("th",["Nome"]),
                        h("th",["Tipo"]),
                        h("th",[" - "])

                      ])
                    ]),
                    h("tbody",[
                      poss.map(function(m,i){
                        if(players[i]){
                          return h("tr",{key: players[i], styles:{
                            margin: "5px", 
                            position: "relative",
                            backgroundColor: players[i].pronto ? "#1DDA3CFF" : ""
                            }},[
                            h("td",[
                              players[i].uid == jogo.criador? h("div",{styles: {

                              }},[
                                h("i.fa.fa-star", {styles: { color: "#FF0000FF"}})
                              ]): null,
                            ]),
                            h("td",[
                              h("img",{src:players[i].avatar || "/images/players/no-image.png", styles: player_box_img_styles})
                            ]),
                            h("td",[
                              h("div",[
                                players[i].nome ? players[i].nome : players[i].uid
                              ])
                            ]),
                            h("td",[
                              Jogadores.me().uid == jogo.criador ?h("select",[
                                h("option",["Aberto",]),
                                h("option",["Fechado",]),
                                h("option",["Máquina",]),
                              ]) :null
                            ]),
                            h("td",[
                              Jogadores.me().uid == jogo.criador ? h("div.button.is-small",{onclick: InicialChannels.chutar_usuario, item: players[i]},[
                                h("i.fa.fa-times.np")
                              ]): null
                            ])
                          ])
                        }else{
                          return h("tr",{key: "und"+i, styles:{
                            margin: "5px", 
                            position: "relative",
                            backgroundColor: "#DFDFDF"
                            }},[
                            h("td",[""]),
                            h("td",[
                              h("img",{src:"/images/players/no-image.png", styles: player_box_img_styles})
                            ]),
                            h("td",[
                              h("div",[""])
                            ]),
                            h("td",[
                              h("select",[
                                h("option",["Aberto",]),
                                h("option",["Fechado",]),
                                h("option",["Máquina",]),
                              ])
                            ])
                          ])
                        }
                      })
                    ])
                  ])
                ])
              ])
            ]),

          ])
        ])
      }else{
        return h("section.is-fullheight.cartel",{ key:"02", styles: {
            height: window.innerHeight+"px"
          }},[
            h("div.hero-body",{key:"011"},[
              h("div.container.has-text-centered",[
                h("div.column",[
                  h("h3.title.has-text=grey",[
                    "Cartel"
                  ]),
                  h("p.subtitle.has-text-grey",["Aguarde Jogadores"]),
                  
              ]),

            ])
          ])
        ])
      }
    }
}
