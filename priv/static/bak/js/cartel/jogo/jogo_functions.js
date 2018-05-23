var JogoFunctions = {
  reset_peca : function(i, p){
    jogo.board[i].player = p.player;
    jogo.board[i].empresa = p.empresa;
    projector.renderNow();
  },
  atualiza_din : function(j, p, m){
    console.log(j, p, m)
    if(m == "mais"){
      var j = Jogadores.get(j);
      j.din += p;
      projector.renderNow();  
    }
    if(m == "menos"){
      var j = Jogadores.get(j);
      j.din -= p;
      projector.renderNow();  
    }
    
  },
  remove_jogada: function(turn){
    //ALERTAS ERROR
    /*turn.invalida.forEach(function(i){
        Alerta.danger("Jogada não permitida!", i.msg)
    })

    if(turn.invalida.length){
      turn = null;
      return;
      
    }*/
    var player = Jogadores.get(turn.player)
    player.pieces.splice(player.pieces.indexOf(turn._nova_peca), 1);
    player.pieces.push(turn.peca)
    jogo.pecas_disponiveis.push(player.pieces.indexOf(turn._nova_peca))

    player.turn = turn;
    console.log(player, turn)
    //ATUALIZA PEÇAS
    turn.atualizar_pecas.pecas.forEach(function(pe){
      jogo.board.forEach(function(p, i){
        if(p.row == pe.row && p.column == pe.column){
          console.log(pe, p)
          JogoFunctions.reset_peca(i, pe)

          
        }
     })
    })
    

    var remove = [];
    //ATUALIZA AÇOES -- BONUS
    turn.acoes.bonus.forEach(function(acb){
      var jogador = Jogadores.get(turn.player)
      var atualizado = false;

      jogador.acoes.forEach(function(a,i){
        if(a.uid == acb.uid){
          a.acoes -=acb.acoes;
          if(a.acoes <= 0){
            remove.push(i);  
          }
          
        }
      })
      if(remove.length){
        remove.forEach(function(r){
          jogador.acoes.splice(r,1)
        })
      }
    })
    //ATUALIZA AÇOES -- COMPRA
    turn.acoes.compra.forEach(function(acb){
      var jogador = Jogadores.get(turn.player)
      var valor = 0;
      valor += acb.empresa.price*acb.acoes;
      jogador.acoes.forEach(function(a,i){
        if(a.uid == acb.empresa.uid){
          a.acoes -=acb.acoes;
          if(a.acoes <= 0){
            remove.push(i);  
          }
          
        }
      })
       console.log(valor)
      jogador.din += valor;
      if(remove.length){
        remove.forEach(function(r){
          jogador.acoes.splice(r,1)
        })
      }
    })

    //ATUALIZA AÇOES -- Venda
    turn.acoes.vende.forEach(function(acb){
      var jogador = Jogadores.get(turn.player)
      var valor = 0;
      valor -= acb.empresa.price*acb.acoes;
      jogador.acoes.forEach(function(a,i){
        if(a.uid == acb.empresa.uid){
          a.acoes +=acb.acoes;
          if(a.acoes <= 0){
            remove.push(i);  
          }
          
        }
      })
      console.log(valor)
      jogador.din += valor;
      if(remove.length){
        remove.forEach(function(r){
          jogador.acoes.splice(r,1)
        })
      }
    })
    

    //ATUALIZA DINHEIRO
    turn.dinheiro.bonus.forEach(function(b){
      b.primeiro.forEach(function(prim){
        var jogador = Jogadores.get(prim.player);
        jogador.din -= prim.valor;
        
      })
      b.segundo.forEach(function(seg){
        var jogador = Jogadores.get(seg.player);
        jogador.din -= seg.valor;

      })
      
    })
    
    //ATUALIZA VENDA DE AÇÕES DE OUTROS USUARIOS
    turn.outros_usuarios.forEach(function(o){
      if(o.empresa){
        var jogador = Jogadores.get(o.player);
        var aid = R.findIndex(R.propEq("uid", o.falencia.uid),jogador.acoes);
        if(aid != -1){
          jogador.acoes[aid].acoes += o.acoes;  
        }else{
          jogador.acoes.push({uid: o.falencia.uid, acoes: o.acoes})
        }
        
        jogador.din -= (o.falencia.price*o.acoes);


      }
      
    })
    //ALERTAS


   
    return true
    
    

  },
  jogada: function(turn){
    switch(turn.step){
      case "passo1":///VERIFICA JOGADA
         turn.nova_peca = JogoFunctions.insere_peca_e_pega_nova_peca(turn.peca);
         switch(turn.jogada.label){
            case "nada":
              turn.atualizar_pecas.pecas.push(turn.peca); //PEÇA DO JOGADOR
              
              turn.step = "passo2";
              JogoFunctions.finaliza_jogada1(turn);
              break;
            case "nova_empresa":
              JogoFunctions.define_nova_empresa(turn)
              break;
            case "amplia_empresa":
              JogoFunctions.define_amplia_empresa(turn)
              break;
            case "funde_empresa":
              JogoFunctions.define_funde_empresas(turn)
              break;
            default:
              turn.step = "passo4";
              JogoFunctions.finaliza_jogada1(turn);
              break;
         }
        break;
      case "passo2": //FINALIZA JOGADA PASSO 1
          JogoFunctions.finaliza_jogada1(turn)

        break;
      case "passo3": //VENDE ACOES
        var jogador = Jogadores.get(turn.player);
        if(jogador.acoes.length>0){
          Alerta.process("Venda de Ações", "<h3>Vender Ações</h3> (venda se quiser)")
          setTimeout(function(){
            Alerta.fechar();
            JogoFunctions.vende_acoes(turn)  
          }, 1000)
          
        }else{
          turn.step = "passo4";
          JogoFunctions.jogada(turn);
        }
        
      break;
      case "passo4": //COMPRA ACOES
          Alerta.process("Compra de Ações", "Momento para comprar ações.")
          setTimeout(function(){
            Alerta.fechar();
            JogoFunctions.compra_acoes(turn)
          }, 1000)
          
        break;
      case "passo5": //FINALIZA JOGADA
      default:
        projector.renderNow();
        jogo.historico = jogo.historico || [];
        turn.timestamp = moment().valueOf();
        jogo.historico.push(JSON.parse(JSON.stringify(turn)));
        console.log("Finaliza jogada", jogo.historico[jogo.historico.length - 1])
        JogoFunctions.finaliza_jogada(turn);
        return null;
    }


  },
  finaliza_jogada1: function(turn){
    //ALERTAS ERROR
    turn.invalida.forEach(function(i){
        Alerta.danger("Jogada não permitida!", i.msg)
    })

    if(turn.invalida.length){
      turn = null;
      return;
      
    }

    //VERIFICA SE EXISTE ALGUMA SOLICITAÇÃO PENDENTE
    var pendente = false;
    turn.outros_usuarios.forEach(function(o){
      if(o.pendente)
        pendente = true;
    })

    var i = 0;
    if(pendente){
      Alerta.process("Aguarde outros Jogadores", "Você precisa aguardar a resposta dos outros jogadores")
      return 
    }else{
      Alerta.fechar();
    }
    //ATUALIZA PEÇAS
    turn.atualizar_pecas.pecas.forEach(function(pe){
      jogo.board.forEach(function(p){
        if(p.row == pe.row && p.column == pe.column){
          if(p.player){
            p.empresa = turn.atualizar_pecas.empresa.uid 
          }else{
            if(turn.atualizar_pecas.empresa)
            p.empresa = turn.atualizar_pecas.empresa.uid 
            p.player = turn.player;
          }
          
        }
     })
    })
    


    //ATUALIZA AÇOES -- BONUS
    turn.acoes.bonus.forEach(function(acb){
      var jogador = Jogadores.get(turn.player)
      var atualizado = false;

      jogador.acoes.forEach(function(a){
        if(a.uid == acb.uid){
          a.acoes +=acb.acoes;
          atualizado = true;
        }
      })
      if(!atualizado){
        jogador.acoes.push(acb)
      }
    })

    //ATUALIZA AÇOES -- VENDA
    

    //ATUALIZA DINHEIRO
    turn.dinheiro.bonus.forEach(function(b){
      b.primeiro.forEach(function(prim){
        var jogador = Jogadores.get(prim.player);
        jogador.din += prim.valor;
        channel.push("alerta_tiny", {a: "<p>O jogador <b><img width='20'src='"+jogador.avatar+"'/>"+(jogador.nome||"Sem nome")+"</b> recebeu <b>R$ "+prim.valor+"</b> de Bonus por ser "+(b.primeiro.length>1 ? "um dos maiores acionistas" : "o maior acionista")+" da empresa <img width='20'src='"+prim.empresa.icon+"'/> "+prim.empresa.name+"</b></p>"}, 10000); 
      })
      b.segundo.forEach(function(seg){
        var jogador = Jogadores.get(seg.player);
        jogador.din += seg.valor;
        channel.push("alerta_tiny", {a: "<p>O jogador <b><img width='20'src='"+jogador.avatar+"'/>"+(jogador.nome||"Sem nome")+"</b> recebeu <b>R$ "+seg.valor+"</b> de Bonus por ser "+(b.primeiro.length>1 ? "um dos segundo maiores acionistas" : "o segundo maior acionista")+" da empresa <img width='20'src='"+seg.empresa.icon+"'/> "+seg.empresa.name+"</b></p>"}, 10000); 
      })
      
    })
    
    //ATUALIZA VENDA DE AÇÕES DE OUTROS USUARIOS
    turn.outros_usuarios.forEach(function(o){
      if(o.empresa){
        var jogador = Jogadores.get(o.player);
        var aid = R.findIndex(R.propEq("uid", o.falencia.uid),jogador.acoes);
        jogador.acoes[aid].acoes -= o.acoes;
        if(jogador.acoes[aid].acoes <= 0){
          jogador.acoes.splice(aid, 1);
        }
        jogador.din += (o.falencia.price*o.acoes);

        channel.push("alerta_tiny", {a: "<p>O jogador <b><img width='20'src='"+jogador.avatar+"'/>"+(jogador.nome||"Sem nome")+"</b> vendeu "+o.acoes+" ações  da <img width='20'src='"+o.falencia.icon+"'/> "+o.falencia.name+"</b> e recebeu <u>R$ "+(o.falencia.price*o.acoes)+".00 </u></p>"}, 10000);  
      }
      
    })
    //ALERTAS
    turn.infos.forEach(function(i){
      switch(i.tipo){
      case "nova_empresa":
        var player = Jogadores.get(i.player);
        channel.push("alerta_tiny", {a: "<p>O jogador <b><img width='20'src='"+player.avatar+"'/>"+(player.nome||"Sem nome")+"</b> fundou a empresa <img width='20'src='"+i.empresa.icon+"'/> "+i.empresa.name+"</b></p>"}, 10000);
        break;
    }
    })


    channel.push("update_board", {board: jogo.board}, 10000) 
    turn.step = "passo3";
    JogoFunctions.jogada(turn)
    
    

  },



  insere_peca_e_pega_nova_peca: function(peca){
    /*var board_item = window.jogo.board.filter(function(b){
      return b.column == peca.column && b.row == peca.row;
     })[0]
    board_item.player = player.uid;
    var idx_piece = player.pieces.indexOf(peca);
    player.pieces.splice(idx_piece,1);*/
    return JogoFunctions.get_new_piece();
  },

  define_nova_empresa: function(turn){
    //ATUALIZA PREÇO DAS EMPRESAS
    var atom = turn.jogada;
    JogoFunctions.atualiza_preco_das_empresas(atom.pecas.sem_empresa.length+1);

    //LISTA EMPRESAS DISPONIVEIS
    var empresas = window.jogo.empresas.filter(function(e){
      return e.disponivel
    })

    //VERIFICA SE EXISTEM EMPRESAS DISPONÍVEIS
    if(empresas.length > 0){
      AlertaCartel.nova_empresa(function(empresa){
        //AÇÃO DE BONUS POR TER FUNDADO UMA NOVA EMPRESA
        turn.acoes.bonus.push({uid: empresa.uid, acoes: 1});
        
        turn.atualizar_pecas.empresa = empresa;
        turn.atualizar_pecas.pecas.push(Object.assign({},turn.peca)); //PEÇA DO JOGADOR

        // PEÇAS VIZINHAS
        atom.pecas.sem_empresa.forEach(function(p){
          turn.atualizar_pecas.pecas.push(Object.assign({},p));
        })

        //ENVIA UM ALERTA DIZENDO QUE O PLAYER FUNDOU UMA NOVA EMPRESA
        turn.infos.push({player: turn.player, tipo: "nova_empresa", empresa: empresa})
        
        //MUDA PARA O PASSO 2
        turn.step = "passo2";
        JogoFunctions.jogada(turn);
      }, empresas);
    }else{ // CASO NÃO EXISTAM EMPRESAS DISPONIVEIS
      turn.step = "passo2";
      turn.invalida.push({verificado: true, msg: "<p>Não existe mais empresas disponiveis para formar</p><p>Você não pode realizar essa jogada</p>"});
      JogoFunctions.jogada(turn);
    }
  },

  define_amplia_empresa: function(turn){
    var atom = turn.jogada;
    //PEGA A EMPRESA QUE JÁ EXISTE
    var empresa =atom.pecas.empresas[0];

    turn.atualizar_pecas.empresa = empresa;
    turn.atualizar_pecas.pecas.push(Object.assign({},turn.peca)); //PEÇA DO JOGADOR

    // PEÇAS VIZINHAS
    atom.pecas.sem_empresa.forEach(function(p){
      turn.atualizar_pecas.pecas.push(Object.assign({},p));
    })

    //MUDA PARA O PASSO 2
    turn.step = "passo2";
    JogoFunctions.jogada(turn);
  },

  define_funde_empresas: function(turn){
    var atom = turn.jogada;
    console.log("funas", atom)
    //ATUALIZA O PREÇO DAS EMPRESAS DE ACORDO COM A QUANTIDADE DE PEÇAS
    JogoFunctions.atualiza_preco_das_empresas();

    //ORDENA AS EMPRESAS DA MAIOR PRA MENOR
    var empresas = atom.pecas.empresas.sort(function(a,b){
      return b.pecas - a.pecas
    });


    var empresas_iguais = [];
    var empresas_para_falencia = [];


    //VERIFICA QUANTAS EMPRESAS IGUAIS EXISTEM E QUAIS SÃO AS MENORES PARA FALÊNCIA
    empresas.forEach(function(e){
      if(empresas_iguais.length == 0)
        {
          empresas_iguais.push(e);
        }
      else{
        if(empresas_iguais[0].pecas == e.pecas){
          empresas_iguais.push(e);
        }else{
          empresas_para_falencia.push(e);
        }
      }
    })

    var errig = error = 0; // VARIAVEL CASO EXISTA ALGUM IMPEDIMENTO
    for(var o = 0; o < empresas_para_falencia.length; o++){
      if(empresas_para_falencia[o].pecas >= 12){
        error++;
      };
    }
    for(var o = 0; o < empresas_iguais.length; o++){
      if(empresas_iguais[o].pecas >= 12){
        errig++;
      };
    }
    if(errig>1){
      error++;
    }


    //RETORNA COM JOGADA INVÁLIDA CASO AS EMPRESAS PARA FAlÊNCIA POSSUIREM MAIS DE 12 PEÇAS
    if(error){
      turn.step = "passo2";
      turn.invalida.push({verificado: true, msg: "<p>Esta jogada não é permitida! Vocẽ não pode fundir empresas com mais de 12 peças no tabuleiro"});
      JogoFunctions.jogada(turn);
      return
    }

    //SE TIVERMOS MAIS DE 1 EMPRESA IGUAL
    if(empresas_iguais.length>1){
      //SE TIVER EMPRESAS IGUAIS ABRE A OPÇÕÃO PARA O USUÁRIO ESCOLHER A EMPRESA QUE CONTINUARÁ EXISITNDO
      AlertaCartel.fusao_de_empresa(function(empresa){
        turn.atualizar_pecas.empresa = empresa;
        turn.atualizar_pecas.pecas.push(Object.assign({},turn.peca)); //PEÇA DO JOGADOR

        atom.pecas.sem_empresa.forEach(function(p){
          turn.atualizar_pecas.pecas.push(Object.assign({},p)) // PEÇAS SEM EMPRESAS
        })
        atom.pecas.empresas.forEach(function(e){
         window.jogo.board.forEach(function(p){
           if(p.empresa == e.uid)
              turn.atualizar_pecas.pecas.push(Object.assign({},p)) // PEÇAS COM EMPRESAS (NO FINAL TODAS SÃO APENAS PEÇAS)
          })
        });
        empresas_iguais.splice(empresas_iguais.indexOf(empresa),1);

       
        JogoFunctions.paga_usuarios_de_empresas_vendidas(turn, empresa,empresas_para_falencia);
        JogoFunctions.paga_usuarios_de_empresas_vendidas(turn, empresa,empresas_iguais);
        //MUDA PARA O PASSO 2
          turn.step = "passo2";
          JogoFunctions.jogada(turn);
        
      }, empresas_iguais);
    }else{
      //SE NÃO TIVER EMPRESAS IGUAIS A MAIOR ENGOLE AS MENORES
      var empresa = empresas_iguais[0];

      
      
      turn.atualizar_pecas.empresa = empresa;
      turn.atualizar_pecas.pecas.push(turn.peca); //PEÇA DO JOGADOR

      atom.pecas.sem_empresa.forEach(function(p){
          turn.atualizar_pecas.pecas.push(Object.assign({},p)) // PEÇAS SEM EMPRESAS
        })

      empresas_para_falencia.forEach(function(e){
       window.jogo.board.forEach(function(p){
         if(p.empresa == e.uid)
            turn.atualizar_pecas.pecas.push(Object.assign({},p))
        })
      })

      console.log(empresas_para_falencia)

      JogoFunctions.paga_usuarios_de_empresas_vendidas(turn, empresa,empresas_para_falencia)


      //MUDA PARA O PASSO 2
          turn.step = "passo2";
          JogoFunctions.jogada(turn);
      
    }

  },
  paga_usuarios_de_empresas_vendidas: function(turn, empresa,empresas_para_falencia){
    empresas_para_falencia.forEach(function(e){
        //VERIFICA O ACIONISTA MAJORITARIO
        var jogadores = [];
        var players = Jogadores.getAll(jogo.uid)
        players.forEach(function(j){
          j.acoes.forEach(function(m){ 
            if(m.uid == e.uid){
              var jogador = {uid: j.uid, name: e.name, empresa: e.uid, acoes: m.acoes}
              jogadores.push(jogador)
            }  
          })
        })

        jogadores.sort(function(a,b){
          return b.acoes - a.acoes
        })

        if(jogadores.length==1){
          //SE HOUVER APENAS UM  MAJORITÁRIO NA EMPRESA
          turn.dinheiro.bonus.push({
            primeiro: JogoFunctions.bonus_primeiro1(e.uid, jogadores), 
            segundo: JogoFunctions.bonus_segundo1(e.uid, jogadores),
          });
          turn.infos.push({player: turn.player, tipo: "empresa_falencia_bonus", empresa: e, primeiro: jogadores});
        }else if(jogadores.length>1){
          //SE HOUVER DOIS OU MAIS MAJORITARIOS NA EMPRESA
          var b1 = [];
          var b2 = [];
          jogadores.forEach(function(j){
            if(b1.length == 0){
              b1.push(j)
            }else{
              if(b1[0].acoes == j.acoes){
                b1.push(j)
              } else{
                if(b2.length == 0){
                  b2.push(j)
                }else{
                  if(b2[0].acoes == j.acoes){
                    b2.push(j);
                  }
                }
              }
            }
             
          })
          console.log("GErência de bonus",b1, b2, jogadores);
          //SE OS DOIS(OU MAIS) FOREM IGUAIS
          if(b1.length >= 2){
            turn.dinheiro.bonus.push({
              primeiro: JogoFunctions.bonus_primeiro1(e.uid, b1), 
              segundo: JogoFunctions.bonus_segundo1(e.uid, b1),
            });
            turn.infos.push({player: turn.player, tipo: "empresa_falencia_bonus", empresa: e.uid, primeiro: b1});  
          }else{
            //SE TIVER APENAS 1 MAJORITARIO E OS OUTROS FOREM
            turn.dinheiro.bonus.push({
              primeiro: JogoFunctions.bonus_primeiro1(e.uid, b1), 
              segundo: JogoFunctions.bonus_segundo1(e.uid, b2),
            });
            turn.infos.push({player: turn.player, tipo: "empresa_falencia_bonus", empresa: e.uid, primeiro: b1, segundo: b2});  
          }
          
        }

        ///QUESTIONA SE OS USUÁRIOS QUE TIVERAM AS EMPRESAS ENGOLIDAS QUEREM VENDER SUAS AÇÕES
        var nenhuma_acao_com_usuarios = true;
        players.forEach(function(p, i){
          var acoes = p.acoes.filter(function(a){
            return a.uid == e.uid;
          });
          if(acoes.length == 1){
            if(empresa){
              var questao = {quid: uid(5), pendente: true, empresa: empresa, falencia: e, player:p.uid};
              turn.outros_usuarios.push(questao);
              channel.push("falencia_vende_acoes_jogo", {quid: questao.quid, empresa: empresa, falencia: e.uid, player:p.uid}, 10000) 
            }else{
              channel.push("falencia_vende_acoes", {empresa: "*", falencia: e, player:p}, 10000) 
              
            }
          }

        });
          
      })
  },
  bonus_primeiro1: function(emp, players){
    var eidx = R.findIndex(R.propEq('uid', emp))(window.jogo.empresas);
    var empresa = window.jogo.empresas[eidx];
    var preco =  empresa.price*10/players.length;
    var retorno = [];
    players.forEach(function(p){
      var player = Jogadores.get(p.uid)
      retorno.push({empresa:empresa, player: player.uid, valor: preco});
    });
    return retorno;

  },
  bonus_segundo1: function(emp, players){
    var eidx = R.findIndex(R.propEq('uid', emp))(window.jogo.empresas);
    var empresa = window.jogo.empresas[eidx];
    var preco =  empresa.price*5/players.length;
    var retorno = [];
    players.forEach(function(p){
      var player = Jogadores.get(p.uid)
      retorno.push({empresa:empresa, player: player.uid, valor: preco});
    })
    return retorno
    

  },
  vende_acoes:function(turn){
    var model = window.jogo;
    var player = Jogadores.get(turn.player);
    JogoFunctions.atualiza_preco_das_empresas();
    var empresas = player.acoes.map(function(x){ 
      var idx = R.findIndex(R.propEq('uid', x.uid))(window.jogo.empresas);
      var empresa = window.jogo.empresas[idx];
      empresa.limite_para_venda =x.acoes;
      return  empresa
    })
    AlertaCartel.vende_acoes(function(empresas, valor){
      var vendas = [];
      player.din = valor; 
      empresas.forEach(function(e){
        vendas[e.uid] = vendas[e.uid] || {acoes: 0, empresa: e};
        vendas[e.uid].acoes++;
        
      })
      Object.keys(vendas).map(function (key) { 
          var acoes = vendas[key].acoes;
          var empresa = vendas[key].empresa;
          var jogador = Jogadores.get(turn.player)
          var aid = R.findIndex(R.propEq("uid", empresa.uid),jogador.acoes);
          jogador.acoes[aid].acoes -= acoes;
          empresa.limite -= acoes;
          if(jogador.acoes[aid].acoes <= 0){
            jogador.acoes.splice(aid, 1);
          }
          turn.acoes.vende.push({empresa: Object.assign({},empresa), player: jogador.uid, acoes: acoes})
          channel.push("alerta_tiny", {a: "<p>O jogador <b><img width='20'src='"+jogador.avatar+"'/>"+(jogador.nome||"Sem nome")+"</b> vendeu <b>"+acoes+" ações</b> da empresa <img width='20'src='"+empresa.icon+"'/> "+empresa.name+"</b></p>"}, 10000); 
        });

      turn.step = "passo4";
      JogoFunctions.jogada(turn);
      
    }, empresas);
  },

  compra_acoes: function(turn){
    var model = window.jogo;
    var player = Jogadores.get(turn.player);
    JogoFunctions.atualiza_preco_das_empresas();
    var empresas = model.empresas.filter(function(x){ 
      return x.disponivel == false && x.limite < 25 })
    if(empresas.length){
      AlertaCartel.compra_acoes(function(empresas, valor){
        var compras = [];
        player.din = valor; 
        empresas.forEach(function(e){
          compras[e.uid] = compras[e.uid] || {acoes: 0, empresa: e};
          compras[e.uid].acoes++;

        })
        Object.keys(compras).map(function (key) { 
          var acoes = compras[key].acoes;
          var empresa = compras[key].empresa; 
          var jogador = Jogadores.get(turn.player)
          var aid = R.findIndex(R.propEq("uid", empresa.uid),jogador.acoes);
          
          if(aid == -1){
            empresa.limite += acoes;
            jogador.acoes.push({uid: empresa.uid, acoes: acoes});
          }else{
            empresa.limite += acoes;
            jogador.acoes[aid].acoes += acoes;  
          }

          turn.acoes.compra.push({empresa: Object.assign({},empresa), player: jogador.uid, acoes: acoes})
          channel.push("alerta_tiny", {a: "<p>O jogador <b><img width='20'src='"+player.avatar+"'/>"+(player.nome||"Sem nome")+"</b> comprou <b>"+acoes+" ações</b> da empresa <img width='20'src='"+empresa.icon+"'/> "+empresa.name+"</b></p>"}, 10000); 
        });
        
        turn.step = "passo5";
        JogoFunctions.jogada(turn);
      }, empresas);
    }else{
      Alerta.process("Ações","Sem ações para comprar");
      setTimeout(function(){ Alerta.fechar()}, 2000)
      turn.step = "passo5";
      JogoFunctions.jogada(turn);
    }  
    
  },
  end_game: function(){
    Alerta.info("Fim do Jogo", "Contabilizando!");
  },




  atualiza_preco_das_empresas : function(mod){
    var empresas_pecas = [];
    var mod = mod || 0;
    var model = window.jogo
    model.board.forEach(function(b){
      if(b.empresa){
        if(empresas_pecas["a"+b.empresa] == undefined)
          empresas_pecas["a"+b.empresa] = 0;
        empresas_pecas["a"+b.empresa]++;
      }
    });
    empresas = model.empresas;
    for(l=0; l<empresas.length; l++){
      var e = empresas[l];
      e.price = 0;
      if(empresas_pecas["a"+e.uid]!= undefined){
        e.price = JogoFunctions.preco_da_empresa(e.peso, empresas_pecas["a"+e.uid]+mod);  
        e.pecas = empresas_pecas["a"+e.uid];
        e.disponivel=false;
      }else{
        e.disponivel=true;
        e.pecas = 0;
        e.price=JogoFunctions.preco_da_empresa(e.peso,(mod));
      }
    }
    model.empresas = empresas ;

  },
  preco_da_empresa: function(peso,pecas){
    if(pecas == 0){
      switch(peso){
        case 1:
        return 0
        case 2:
        return 0
        case 3:
        return 0
      }

    }else if(pecas == 2){
      switch(peso){
        case 1:
        return 20
        case 2:
        return 30
        case 3:
        return 40
      }

    }else if(pecas == 3){
      switch(peso){
        case 1:
        return 30
        case 2:
        return 40
        case 3:
        return 50
      }

    }else if(pecas == 4){
      switch(peso){
        case 1:
        return 40
        case 2:
        return 50
        case 3:
        return 60
      }

    }else if(pecas == 5){
      switch(peso){
        case 1:
        return 50
        case 2:
        return 60
        case 3:
        return 70
      }

    }else if(pecas >= 6 && pecas <= 10){
      switch(peso){
        case 1:
        return 60
        case 2:
        return 70
        case 3:
        return 80
      }

    }else if(pecas >= 11 && pecas <= 20){
      switch(peso){
        case 1:
        return 70
        case 2:
        return 80
        case 3:
        return 90
      }

    }else if(pecas >= 21 && pecas <= 30){
      switch(peso){
        case 1:
        return 80
        case 2:
        return 90
        case 3:
        return 100
      }

    }else if(pecas >= 31 && pecas <= 40){
      switch(peso){
        case 1:
        return 90
        case 2:
        return 100
        case 3:
        return 110
      }

    }else if(pecas >= 41){
       switch(peso){
        case 1:
        return 100
        case 2:
        return 110
        case 3:
        return 120
      }
    }
  },




  pega_peca : function(r,c){
    var peca = window.jogo.board.filter(function(b){
      return b.row == window.jogo.linhas[r] && b.column == c;
    })
    return peca[0];
  },
  
  
  /*jogada_passo_2: function(){
    
    var model = window.jogo;
    var player = Jogadores.me();
    if(player.jogada == 1 && player.vez){
      JogoFunctions.atualiza_preco_das_empresas();
      var empresas = player.acoes.map(function(x){ 
        var idx = R.findIndex(R.propEq('uid', x.uid))(window.jogo.empresas);
        var empresa = window.jogo.empresas[idx];
        empresa.limite =x.acoes;
        return  empresa
      })
      if(empresas.length){
         Alerta.confirm("Vender ações?", "<p>Você quer vender alguma ação antes de comprar ações?", function(){
            Alerta.process("Jogada","VENDER AÇÕES");

            setTimeout(function(){ Alerta.fechar()}, 2000)
            JogoFunctions.vende_acoes();
            
            
          },function(){
            player.jogada=2;
            save_model();
            
            JogoFunctions.compra_acoes();
          });

          
      }else{
        player.jogada=2;
        save_model();
        JogoFunctions.compra_acoes()
      }
    }
    
    

  },*/
  redireciona_jogada: function(){
    var player = Jogadores.me();
    if(player.vez){
      switch(player.jogada){
        case 1:
          JogoFunctions.jogada_passo_2();
          break;
        case 2:
          JogoFunctions.compra_acoes();
          break;
        case 3:
          JogoFunctions.finaliza_jogada();
          break;
        default:
          nulli+1

      }  
    }
    
  },

  finaliza_jogada: function(turn){
    
    var player = Jogadores.me();
    var players = Jogadores.getAll(jogo.uid);
    JogoFunctions.clear_all_simula_pecas();
    if(!JogoFunctions.verifica_fim_do_jogo()){
      for(var i=0; i< players.length; i++){
          if(players[i].vez){
            players[i].vez = false;
            if(i==players.length-1){
              players[0].vez = true
              players[0].alerta = false;
              channel.push("alerta_tiny", {a: "<p> É a vez do  jogador <b><img width='20'src='"+players[0].avatar+"'/>"+(players[0].nome||"Sem nome")+"</b>! </p>"}, 10000); 
            }else{
              players[i+1].vez = true;
              players[i+1].alerta = false;
              channel.push("alerta_tiny", {a: "<p> É a vez do  jogador <b><img width='20'src='"+players[i+1].avatar+"'/>"+(players[i+1].nome||"Sem nome")+"</b>! </p>"}, 10000); 
              break;
            }
          }
        }  
    }else{
      var empresas = window.jogo.empresas.filter(function(e){
        return !e.disponivel
      });
      
      if(window.jogo && window.jogo.criador == window.PLAYER.uid){
        JogoFunctions.paga_usuarios_de_empresas_vendidas(turn, undefined,empresas);
          fim_do_jogo();
      }
      
    }
    finaliza_jogada(turn);
  },
  verifica_fim_do_jogo: function(){
    var fim = false;
    var por_pecas = 0;
    JogoFunctions.atualiza_preco_das_empresas();
    var empresas = window.jogo.empresas.filter(function(e){
      return !e.disponivel
    });
    empresas.forEach(function(e){
      if(e.pecas >= 12 )
        por_pecas++;
      if(e.pecas >= 41){
        fim = true;
        return true;
      }
    });
    if(window.jogo.pecas_disponiveis.length == 0){
      fim = true;
    };
    if(por_pecas == empresas.length && por_pecas != 0){
      fim = true;
    }
    if(fim==true){
      return true;
    }else{
      return  false;
    }
  },
  pega_pecas_sem_nada: function(p){
    var idx_row = jogo.linhas.indexOf(p.row);
    var idx_column = p.column;
    var atom = JogoFunctions.arredondezas_da_peca_small(idx_row, idx_column);
    if(atom.label=="nova_empresa"){
      return atom.pecas.sem_empresa; 
    }else{
      return [];
    }
  },
  arredondezas_da_peca_small : function(idr, idc){
    var p = [];
    var pecas = [];
    var atom = "";
    if(idr != 0){
      p.push("top")
    }
    if(idr != (window.jogo.linhas.length-1)){
      p.push("bottom")
    }
    if(idc != 1){
      p.push("left")
    }
    if(idc != 12){
      p.push("right")
    }

    p.forEach(function(p){
      if(p=="bottom"){
        pecas.push(JogoFunctions.pega_peca(idr+1, idc))
      }else if(p=="top"){
        pecas.push(JogoFunctions.pega_peca(idr-1, idc))
      }else if(p=="left"){
        pecas.push(JogoFunctions.pega_peca(idr, idc-1))
      }else if(p=="right"){
        pecas.push(JogoFunctions.pega_peca(idr, idc+1))
      }
    })
    var nil = [];
    var com_empresa = [];
    var sem_empresa = [];
    var empresas_unicas = [];
    pecas.forEach(function(p){
      if(p.empresa == null && p.player == null){
        nil.push(p);
      };
      if(p.empresa != null){
        com_empresa.push(p);
        empresas_unicas.push(window.jogo.empresas.filter(function(e){ return e.uid == p.empresa})[0])
      };
      if(p.player != null && p.empresa == null){
        sem_empresa.push(p);
      }
    })
    function concat(){
        return {nada: nil,
                com_empresa: com_empresa,
                sem_empresa: sem_empresa,
                empresas: empresas_unicas
              }
    };
    if(nil.length==pecas.length)
      return {label:"nada", pecas: concat()};
    if(sem_empresa.length>0){
      return {label:"nova_empresa", pecas: concat()}
    }
    return {};
    
  },
  arredondezas_da_peca : function(idr, idc){
    var p = [];
    var pecas = [];
    var atom = "";
    if(idr != 0){
      p.push("top")
    }
    if(idr != (window.jogo.linhas.length-1)){
      p.push("bottom")
    }
    if(idc != 1){
      p.push("left")
    }
    if(idc != 12){
      p.push("right")
    }

    p.forEach(function(p){
      if(p=="bottom"){
        pecas.push(JogoFunctions.pega_peca(idr+1, idc))
      }else if(p=="top"){
        pecas.push(JogoFunctions.pega_peca(idr-1, idc))
      }else if(p=="left"){
        pecas.push(JogoFunctions.pega_peca(idr, idc-1))
      }else if(p=="right"){
        pecas.push(JogoFunctions.pega_peca(idr, idc+1))
      }
    })
    var nil = [];
    var com_empresa = [];
    var sem_empresa = [];
    var empresas_unicas = [];
    pecas.forEach(function(p){
      if(p.empresa == null && p.player == null){
        nil.push(p);
      };
      if(p.empresa != null){
        com_empresa.push(p);
        empresas_unicas.push(window.jogo.empresas.filter(function(e){ return e.uid == p.empresa})[0])
      };
      if(p.player != null && p.empresa == null){

        sem_empresa.push(p);
        var mais_pecas = JogoFunctions.pega_pecas_sem_nada(p);
        if(mais_pecas.length){
          mais_pecas.forEach(function(p1){
            sem_empresa.push(p1);
          })
        }
      }
    }) // com as peças
    console.log
    var empresas_unicas = R.uniq(empresas_unicas);
    function concat(){
        return {nada: nil,
                com_empresa: com_empresa,
                sem_empresa: sem_empresa,
                empresas: empresas_unicas
              }
    }
    if(empresas_unicas.length> 1){
      return {label:"funde_empresa", pecas: concat()}
    }
    if(empresas_unicas.length== 1){
      return {label:"amplia_empresa", pecas: concat()}
    }

    if(nil.length==pecas.length){
      return {label:"nada", pecas: concat()};
    }
    if(sem_empresa.length>0){
      return {label:"nova_empresa", pecas: concat()}
    }

  },


  verifica_jogada1: function(peca, fn){

    var idx_row = jogo.linhas.indexOf(peca.row);
    var idx_column = peca.column;
    var atom = JogoFunctions.arredondezas_da_peca(idx_row, idx_column);
    var player = Jogadores.me();
    return atom;
  },


  generate_board : function(rows, columns){
    // var rows = model.get().char;
    // var columns = model.get().colunas;
    var itens = [];
    for(i=0; i<rows.length;i++){
      for(j=1;j<=columns; j++){
        itens.push({row: rows[i], column: j, player: null, empresa: null,  display:""});
      }
    }
    return itens;
  },

  new_player : function(uid){
    var pieces = [];

    return {uid: uid, pieces: pieces, din: 600.0, acoes: [], last_online: moment().unix(), vivo: true, sala: null, avatar: "/images/players/no-image.png"}
  },

  all_pieces : function(board){
    var pieces = JSON.parse(JSON.stringify(board));
    for (let i = pieces.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    return pieces
  },



  get_new_piece : function(){
      var model = window.jogo;
      if(model.pecas_disponiveis.length==0){
        JogoFunctions.end_game();
      }else{
        var piece = model.pecas_disponiveis.splice(0,1)[0];
        return piece;
      }
  },

  clear_all_simula_pecas : function(){
     var model = window.jogo;
     model.board.forEach(function(b){
        b.hover = null
        b.selected = null;
        return b;
    });

  },

  board_zoom : function(el){
    var rect = el.getClientRects()

    var width = window.innerWidth;
    
    var prop = (width-width/2.3)/(el.offsetWidth);
    if(width-width/2.3 > 600){
      prop=1;
    }
    el.style.zoom = prop;
    el.style.margin ="auto";
    el.style.marginTop ="50px";
  },

  gera_ordem_jogador: function(){
    var ordem = [];
    var primeiro = "";
    var players1 = Jogadores.getAll(jogo.uid);
    players1.forEach(function(p){
      p.pieces.forEach(function(pi){
        ordem.push({row: pi.row.charCodeAt(), column: pi.column, uid: p.uid})
      })
    });


    ordem.sort(function(a,b){
        return a.row - b.row
    })

    if(ordem[0].row == ordem[1].row)
    {
      var filtered = ordem.filter(function(f){
        return f.row == ordem[0].row
      })
      filtered.sort(function(a,b){
        return a.column - b.column
      })
      primeiro = filtered[0].uid;
    }else if(ordem[0].row < ordem[1].row){
      primeiro = ordem[0].uid;
    }else if(ordem[0].row > ordem[1].row){
      primeiro = ordem[1].uid;
    }

    var player = 0;
    var players = [];
    players1.forEach(function(p, i){
      if(p.uid == primeiro){
        player = i
      }
    })
    
    for(i=player; i<players1.length; i++){
      players.push(players1[i])

    }
    if(player > 0){
      for(i=0; i<players1.length - (player+1); i++){
        players.push(players1[i])
      
      }
    }
    players1.forEach(function(p, i){
      if(i==0){
      p.vez = true;  
      }
      p.ordem = i+1;
    })
    Jogadores.overrideAll(players1)
  },
  encerrar_jogo: function(){

    channel.push("encerrar_jogo", {uid: window.PLAYER.uid}, 10000)

  },
  init: function(){
      var model = window.jogo;
      var board = JogoFunctions.generate_board(model.linhas, model.colunas)
      var pecas_disponiveis = JogoFunctions.all_pieces(board);
      var empresas = model.empresas.map(function(e,i){
         e.cor = model.cores[i];
         return e;
     });
     window.jogo.board=board;
     window.jogo.pecas_disponiveis = pecas_disponiveis;
     window.jogo.empresas = empresas;
     var players1 = Jogadores.getAll(jogo.uid);
     var players = players1.map(function(p){
       var pieces = []
       for(i=0; i<6; i++){
         pieces.push(JogoFunctions.get_new_piece());
       };
       p.pieces = pieces;
       return p;
     });


     
     JogoFunctions.gera_ordem_jogador();
     //save_model()
     /*channel.push("players", {players: players}, 10000)
     channel.push("board", {board: window.model.board}, 10000)
     channel.push("pieces_avaiables", {pieces_avaiables: window.model.pieces_avaiables}, 10000)
     channel.push("empresas", {empresas: window.model.empresas}, 10000);*/
     window.jogo.iniciado1 = true;
     console.log("INICIADO")
     channel.push("inicia_jogo",{ uid: window.PLAYER.uid }, 10000)


   //
   // atualiza_preco_das_empresas;
   // ///GENERATE PLAYER
   // window.PLAYER = JogoFunctions.new_player(model, window.PLAYER.uid);
   // var players = window.model.players;
   // players.push(window.PLAYER);
  }

}
