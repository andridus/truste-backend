var JogoChannels = {
      teste: function(data){

        state.uid.set("a")
      },
      jogada_anterior: function(d){
        if(jogo.historico.length > 0){
          var turn_anterior = jogo.historico[jogo.historico.length-1]
          JogoFunctions.remove_jogada(turn_anterior)
          var players = Jogadores.getAll(jogo.uid);
          players.forEach(function(p){
            p.vez = false;
            p.alerta = false;
          })
          var player = Jogadores.get(turn_anterior.player);
            player.vez = true;
            player.alerta = false;

          jogo.historico.pop();
          channel.push("alerta_tiny", {a: "<p>UMA JOGADA ANTERIOR FOI DESFEITA.</p>"}, 10000); 
          save_model()

        }else{
          AlertaTiny.danger("Não existem mais jogadas anteriores")
        }
        

      },
      after_created_game: function(){
        var player = Jogadores.me();
        if(player.vez && player.jogada){
          JogoFunctions.redireciona_jogada()
        }else{
          if(player.vez && !player.alerta){
            Alerta.process("","<p> É a sua vez de jogar!</p>");

            setTimeout(function(){
              Alerta.fechar();
              player.alerta = true;
            },3000)
          }
        }
      },
      after_created_input: function(el){
        el.focus()
      },
      send_a_message: function(e){
        var player = e.target.player;
        player.send = !player.send;
        projector.renderNow();
      },
      envia_mensagem: function(e){
        e.preventDefault();
        var player = e.target.player;
        var form = e.target;
        if(form.msg.value.length > 0)
          channel.push("message_to_player", {from_uid: window.PLAYER.uid, to_uid: player.uid, msg:form.msg.value, time: moment().valueOf() }, 10000);
        form.msg.value="";
        player.send = false;

      },
      new_game: function(){

        channel.push("encerrar_jogo", {uid: window.PLAYER.uid}, 10000)

      },
      ver_acoes: function(){
        Jogadores.me().ver_acoes = !Jogadores.me().ver_acoes;
      },
      fechar_ver_acoes: function(){
        Jogadores.me().ver_acoes = false;
      },
      vender_acoes: function(e){
        var item = e.target.item;
        var player = e.target.player;
        if(player.vez){

        var empresa = window.jogo.empresas.filter(function(e){
          return e.uid == item.uid;
        })[0]


        Alerta.confirm("Vender ações", "<p>Vender <b>1</b> ação da <img src='"+empresa.icon+"' width='20' /> <b>"+empresa.name+"</b>?</p><p>A ação está valendo <b>R$ "+empresa.price+",00</b>", function(){
          if(item.acoes>1){
            player.din +=empresa.price;
            item.acoes--; 
          }else{
            var idx = player.acoes.indexOf(item);
            if(idx>=0){
              player.din +=empresa.price;
              item.acoes--;
              player.acoes.splice(idx,1);
            }
          }
          

          channel.push("vender_acoes", {empresa: empresa, player:player}, 10000) 
          save_model();


        });  
        }else{
          Alerta.info("Vender Ações", "Você só pode vender ações na sua vez de jogar")
        }
      },
      ////created
      board_created: function(el){
        JogoFunctions.board_zoom(el);
      },

      board_insert_peca:function(ev){
        //PASSO 1 DA JOGADA
        //INSERE PEÇA DO JOGADOR E VERIFICA SE O A JOGADA FORMOU, AMPLIOU OU FUNDIU EMREPSAS
        var player = Jogadores.me();
        player.jogada = null;

        projector.renderNow();
        
        if(player.vez){
           var peca = ev.target.item;
           player.turn = {
                    player: player.uid,
                    peca: peca, //PEÇA DO JOGADOR COLOCADA NO TABULEIRO
                    atualizar_pecas: {empresa: null, pecas: []}, //PECAS PARA SEREM ATUALIZADAS
                    nova_peca: null, //NOVA PECA PEGADA NO FINAL DA RODADA;
                    jogada: JogoFunctions.verifica_jogada1(peca),//VERIFICA A JOGADA, "NADA","FUNDE_EMPRESA", "AMPLIA_EMPRESA", "NOVA_EMPRESA" 
                    acoes: { // EFEITO DE AÇÕES DO JOGADOR
                      compra: [], //AÇÕES COMPRADAS NA RODADA
                      vende: [], //AÇÕES VENDIDAS NA RODADA
                      bonus: [], //AÇÕES DE BONUS NA RODADA
                    },
                    outros_usuarios: [],//AÇOES PENDENTES DE OUTROS USUÁRIOS
                    dinheiro: { //DINHEIRO DO JOGADOR NA RODADA
                      atual: Jogadores.me().din, //DINHEIRO ATUAL
                      bonus: [] // DINHEIRO DO BONUS, SE FUNDIDA ALGUMA EMPRESA
                    },
                    infos: [],
                    step: "passo1",
                    invalida: [], //{msg:"", verificado: null}
                  };
           
           //player.jogada = 0;

           JogoFunctions.jogada(player.turn);
           
           
           
         /*JogoFunctions.verifica_jogada(peca, function(v){
          if(v){
            
            var board_item = window.jogo.board.filter(function(b){
              return b.column == peca.column && b.row == peca.row;
             })[0]
            board_item.player = player.uid;
            var idx_piece = player.pieces.indexOf(peca);
            player.pieces.splice(idx_piece,1);
            player.pieces.push(JogoFunctions.get_new_piece());
            player.jogada=1;
            save_model();
            //segunda etapa da jogada
            JogoFunctions.jogada_passo_2();
          }else{
            Alerta.danger("Atenção!","Jogada não permitida!");
          }

         })*/
       }else{
        Alerta.danger("Atenção","Não é sua vez de jogar");
        player.jogada=null;
       }
        

      },
      board_mouse_move: function(ev){
        var model = window.jogo;
        var target = ev.target;
         JogoFunctions.clear_all_simula_pecas()
         if(target.item != undefined)
         {
           var item = target.item;
           model.board.forEach(function(b){
             if(b.row == item.row){
               b.hover = true;
             }
             if(b.column == item.column){
              b.hover = true;
             }
             if(b.column == item.column && b.row == item.row){
               // b.selected = true;
             }
             return b
           });
         }

      },

      ///simula peça
      simula_peca: function(ev){
        var item = ev.target.item;
        JogoFunctions.clear_all_simula_pecas();
        window.jogo.board.forEach(function(b){
          if(b.row == item.row){
            b.hover = true;
          }
          if(b.column == item.column){
          b.hover = true;
          }
          if(b.column == item.column && b.row == item.row){
          b.selected= true;
          }
        });
      }
    }
