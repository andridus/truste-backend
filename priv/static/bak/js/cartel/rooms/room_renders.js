var RoomRenders = {
    main: function(){
      return h("section.is-fullheight.cartel",{ styles: {
        height: window.innerHeight+"px"
      }},[
        h("div.hero-body",[
          h("div.container.has-text-centered",[
            h("div.column",[

              h("h3.title.has-text=grey",[
                "Cartel"
              ]),
              h("p.subtitle.has-text-grey",["O jogo das ações"]),
              h("h3.has-text=grey",[
                "Jogos"
              ]),
              
              h("div.button",{onclick: RoomChannels.nova_sala, styles:{float:"left", margin:"20px"}},[
                h("i.fa.fa-plus.fa-3x")
              ]),
              //SE FOR UMA NOVA SALA, ABRE O FORMULÁRIO DE CRIAÇÃO DA NOVA SALA
              window.nova_sala ? 
                h("div.box.sala",{ key: window.nova_sala,
                    styles: {width:"200px", margin:"auto", 
                    marginBottom:"10px"}
                  },[
                    h("img",{onclick: RoomChannels.choose_pic, src:window.nova_sala.emblema, item: window.nova_sala}),
                    h("input.input",{value: window.nova_sala.title, oninput: RoomChannels.change_title, item: window.nova_sala}),
                    h("span",["Maximo de Jogadores"]),
                    h("select.input",{value: window.nova_sala.max, oninput: RoomChannels.change_max, item: window.nova_sala},[
                      ["1","2","3","4","5","6"].map(function(v){
                        return h("option",{value: v}, [v])  
                      })
                    ]),
                    h("div.button.is-info",{onclick: RoomChannels.criar},["Criar"]),
                    h("div.button.is-danger", {onclick: RoomChannels.remover},[h("i.fa.fa-times.np")])
                ])
              :null,

              //MOSTRA SALAS CRIADAS
              window.salas.map(function(s){
                return !s.iniciado ? h("div.sala",{
                    key: s,
                    onclick: RoomChannels.enter_room,
                    sala: s,
                    styles: {width:"150px", margin:"auto",
                    marginBottom:"10px"}
                  },[
                    h("img.np",{src:s.emblema}),
                    h("span.np",[s.title]),
                    h("br.np"),
                    h("small.np",["Máximo jogadores ", s.max]),
                    h("div.players",{sala: s},[
                      s.players ? s.players.map(function(p){
                        var player = Jogadores.get(p.uid);
                        var p1 = player || p
                        return h("i.fa.fa-user",{key: p, title: p1.nome, width:"25", styles:{float:"left", margin:"5px"}})
                      }):null
                    ])
                ]): h("div.sala.iniciado",{
                    key: s,
                    title: "Não pode entrar no jogo já iniciado",
                    styles: {width:"150px", margin:"auto",
                    marginBottom:"10px", position:"relative"}
                  },[
                    h("div",{styles:{position:"absolute", top:"0px", left:"0px", width:"150px", backgroundColor:"#FF0000FF", color: "#FFF"}},["Jogo Inciado"]),
                    h("img.np",{src:s.emblema}),
                    h("span.np",[s.title]),
                    h("br.np"),
                    h("small.np",["Máximo jogadores ", s.max]),
                    h("div.players",{sala: s},[
                      s.players ? 
                      s.players.map(function(p){
                        var id = R.findIndex(R.propEq('uid', p.uid))(window.players);
                        var p1 = window.players[id] || p
                        return h("i.fa.fa-user",{key: p, title: p1.nome, width:"25", styles:{float:"left", margin:"5px"}})
                      }) : null
                    ])
                ])
              })



            ])
          ]),
        ])
      ])
    }
}
