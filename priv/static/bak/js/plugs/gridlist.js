  'use strict';
  function HGridList(dom, items, columns, buttons, opts){
    var opts = opts || {};
    var dom = document.getElementById(dom);
    var h = maquette.h;
    var _hgrid_projector_ = maquette.createProjector();
    /*var freezer = new Freezer({
      max_rows: 10, //NÚMERO MÁXIMO DE LINHAS POR PÁGINA
      query: '', //TERMO DE BUSCA
      query_data_in: 0, //TERMO DE BUSCA POR DATA EM TIMESTAMP
      query_data_out: 0, //TERMO DE BUSCA POR DATA EM TIMESTAMP
      open_calendar: false, //Abrir o calendário
      pagina: 0, //pagina atual
      pags: [], //paginas disponiveis
      where: [], //termo de busca separado em array
      show_search_opt: false, //mostrar opções de busca
      items: items, //items do datagrid
      root_d: items, //backup raiz dos items
      ub: items, //
      items_b: [], //
      sorted_element: columns.map(function(x){
        return {f:x.field,v:0, l: x.label}
      }) // DEFINE AS COLUNAS DO GRID
    })*/
    //var state = freezer.get(); //define o state com os dados acima
    var state = {
      width: window.innerWidth,
      hide: opts.hide ? trkl(opts.hide) : trkl(false),
      dateHide: opts.dateHide ? trkl(opts.dateHide) : trkl(false),
      max_rows: trkl(10), //NÚMERO MÁXIMO DE LINHAS POR PÁGINA
      query: trkl(''), //TERMO DE BUSCA
      query_data_in: trkl(0), //TERMO DE BUSCA POR DATA EM TIMESTAMP
      query_data_out: trkl(0), //TERMO DE BUSCA POR DATA EM TIMESTAMP
      open_calendar: trkl(false), //Abrir o calendário
      pagina: trkl(0), //pagina atual
      pags: trkl([]), //paginas disponiveis
      where: trkl(columns.map(function(x){
        return x.field
      })), //termo de busca separado em array
      show_search_opt: trkl(false), //mostrar opções de busca
      items: trkl(items), //items do datagrid
      root_d: trkl(items), //backup raiz dos items
      items_show: trkl(items), //
      items_filtrados_por_data: trkl(items), //items filtrados_por_data
      items_filtrados_por_pesquisa: trkl(items), //
      sorted_element: trkl(columns.map(function(x){
        return {f:x.field,v:0, l: x.label, moment: x.moment, data: x.data, parse: x.parse, values: x.values, href: x.href, to_sm:x.to_sm, to_xs:x.to_xs, to_md:x.to_md, vals: x.vals}
      })),
      update_all_items: function(is){
        state.root_d(is);
        state.items(is);
        state.items_filtrados_por_data(is);
        state.items_filtrados_por_pesquisa(is);
        state.items_show(aplicaUsers(state.root_d()));
      },
      remove_all_items: function(){
        var is = [];
        state.root_d(is);
        state.items(is);
        state.items_filtrados_por_data(is);
        state.items_filtrados_por_pesquisa(is);
        state.items_show(aplicaUsers(state.root_d()));
      },

      update_item: function(x,f,v){
        var items = state.items();
        var idx_items = R.findIndex(R.propEq(f, v))(items);
        if(idx_items!=-1){
          items[idx_items] = x;
          state.items(items);
        }


        var root_d = state.root_d();
        var idx_root_d = R.findIndex(R.propEq(f, v))(root_d);
        if(idx_root_d!=-1){
          root_d[idx_root_d] = x;
          state.root_d(root_d);
        }


        var items_show = state.items_show();
        var idx_items_show = R.findIndex(R.propEq(f, v))(items_show);
        if(idx_items_show!=-1){
          items_show[idx_items_show] = x;
          state.items_show(items_show);
        }


        var items_filtrados_por_data = state.items_filtrados_por_data();
        var idx_items_filtrados_por_data = R.findIndex(R.propEq(f, v))(items_filtrados_por_data);
        if(idx_items_filtrados_por_data!=-1){
          items_filtrados_por_data[idx_items_filtrados_por_data] = x;
          state.items_filtrados_por_data(items_filtrados_por_data);
        }


        var items_filtrados_por_pesquisa = state.items_filtrados_por_pesquisa();
        var idx_items_filtrados_por_pesquisa = R.findIndex(R.propEq(f, v))(items_filtrados_por_pesquisa);
        if(idx_items_filtrados_por_pesquisa!=-1){
          items_filtrados_por_pesquisa[idx_items_filtrados_por_pesquisa] = x;
          state.items_filtrados_por_data(items_filtrados_por_pesquisa);
        }
      },
      remove_item: function(x,f,v){
        var items = state.items();
        var idx_items = R.findIndex(R.propEq(f, v))(items);
        if(idx_items!=-1){
          items.splice(idx_items,1);
          state.items(items);
        }


        var root_d = state.root_d();
        var idx_root_d = R.findIndex(R.propEq(f, v))(root_d);
        if(idx_root_d!=-1){
          root_d.splice(idx_root_d,1);
          state.root_d(root_d);
        }


        var items_show = state.items_show();
        var idx_items_show = R.findIndex(R.propEq(f, v))(items_show);
        if(idx_items_show!=-1){
          items_show.splice(idx_items_show,1);
          state.items_show(items_show);
        }

      },
      buttons: buttons,


    }
    window.addEventListener("resize",function(x){
      console.log("resized");
      state.width = window.innerWidth;
      _hgrid_projector_.renderNow();
    })
    var subs = function(new_value){
      _hgrid_projector_.renderNow();
    }
    state.max_rows.subscribe(subs);
    state.hide.subscribe(subs);
    state.query.subscribe(subs);
    state.query_data_in.subscribe(subs);
    state.query_data_out.subscribe(subs);
    state.open_calendar.subscribe(subs);
    state.pagina.subscribe(subs);
    state.pags.subscribe(subs);
    state.where.subscribe(subs);
    state.show_search_opt.subscribe(subs);
    state.items.subscribe(subs);
    state.root_d.subscribe(subs);
    state.items_show.subscribe(subs);
    var renderMaquette = function(){
      return h("div",[
        !state.hide()?h("div.container",{key:"grid1"},[
        //Se a variavel show_search_opt estiver verdadeira, vai mostrar as opções de busca que tem a ver com os os elementos da coluna


        state.show_search_opt() ? h("div.columns.is-centered",{key:"opts"},[
          h("div.column",[
            h("div.field.has-addons",[
              h("small",{styles:{marginRight:"5px", fontSize:"12px"}},["Colunas: "]),
              state.sorted_element().map(renderColumns)
            ])
          ]),
        ]):null,



        h("div.columns.is-centered",[
          // busca por calendário // opções de busca por calendário
          h("div.column",[
            h("div.field.has-addons",[
              state.open_calendar() ? h("div.control",{key:"ca"},[
                h("input.input.is-dark.is-small",{afterCreate: after_calendar_in, type: "text", readOnly: true, placeholder: "Inicio [desde o início]"}),
                h("input.input.is-dark.is-small",{afterCreate: after_calendar_out, type: "text", readOnly: true, placeholder: "Fim [até o final]"})
              ]):null,
              !state.dateHide()?h("p.control",{key:"date01"},[
                h("div.button.is-dark.is-small",{classes:{"is-outlined":!state.open_calendar()}, onclick: open_calendar},[
                    h("span.icon.is-small.np",[
                      h("i.fa.fa-calendar.np")
                    ]),
                    h("span.np",["Data"])
                  ]),
                ]):null,
              h("div.control",[
                h("input.input.is-dark.is-small",{oninput: set_pesquisar, type: "text", placeholder: "Procure"})
                ]),
              h("p.control",[
                h("div.button.is-dark.is-small",{classes:{"is-outlined":!state.show_search_opt()},onclick:open_opts},[
                    h("span.icon.is-small.np",[
                      !state.show_search_opt()? h("i.fa.fa-search.np"):h("i.fa.fa-arrow-up.np")
                    ]),
                    h("span.np",["Opções"])
                  ]),
              ])
            ])
          ])
        ]),
        h("div.columns.is-centered",[
          // PÁGINAÇÃO
          h("div.column",[
            h("div.field.has-addons",[

              h("p.button.is-light.is-small.np",["Páginas:"]),
              state.pags().map(renderPagination),
              h("p.button.is-light.is-small.np",[ h("span",{styles:{marginRight:"5px"}},"Total:"),state.items().length,h("span",{styles:{marginLeft:"2px"}},""), "["+Math.ceil(state.items().length/state.max_rows())+"]"]),
            ])
          ]),
          // DEFINIR NÚMERO MÁXIMO DE LINHAS POR PAGINA
          h("div.column",[
            h("div.field.has-addons",[
              h("p.button.is-light.is-small.np",["Mostrando por vez: "]),
              [
                h("p.button.is-dark.is-small",{onclick: set_max_rows, v:"10", classes:{"is-gray":qmax_rows(10),"is-outlined":!qmax_rows(10)}},"10"),
                h("p.button.is-dark.is-small",{onclick: set_max_rows, v:"30", classes:{"is-gray":qmax_rows(30),"is-outlined":!qmax_rows(30)}},"30"),
                h("p.button.is-dark.is-small",{onclick: set_max_rows, v:"50", classes:{"is-gray":qmax_rows(50),"is-outlined":!qmax_rows(50)}},"50"),
                h("p.button.is-dark.is-small",{onclick: set_max_rows, v:"80", classes:{"is-gray":qmax_rows(80),"is-outlined":!qmax_rows(80)}},"80"),
                h("p.button.is-dark.is-small",{onclick: set_max_rows, v:"150", classes:{"is-gray":qmax_rows(150),"is-outlined":!qmax_rows(150)}},"150"),
                h("p.button.is-dark.is-small",{onclick: set_max_rows, v:"300", classes:{"is-gray":qmax_rows(300),"is-outlined":!qmax_rows(300)}},"300")

              ]
            ])
          ])
        ]),
        //TABELA DE DADOS
        state.items_show().length? h("table.table.is-striped.is-bordered.is-fullwidth",{afterCreate: resizeTable},[
          h("thead",[
            h("tr",[
              state.sorted_element().map(function(x){
                if(state.width<800){
                  if(state.width<700){
                    if(state.width<400){
                      if(!x.to_sm && !x.to_xs){
                        return h("th",{key: x, height:"50", onclick: users_sort, v:x.f},[x.l,is_sorted(x.f)]);
                      }
                    }else{
                      if(!x.to_sm){
                        return h("th",{key: x, height:"50", onclick: users_sort, v:x.f},[x.l,is_sorted(x.f)]);
                      }
                    }
                  }else{
                    if(!x.to_md){
                      return h("th",{key: x, height:"50", onclick: users_sort, v:x.f},[x.l,is_sorted(x.f)]);
                    }
                  }
                }else{
                  return h("th",{key: x, height:"50", onclick: users_sort, v:x.f},[x.l,is_sorted(x.f)]);
                }
              }),
              h("td",[])
            ])
          ]),
          h("tbody",state.items_show().map(renderItem))
        ]):[
          state.query().length>0 ? h("h1",["Não existe nenhum item com o termo da pesquisa"]) : h("h1",["Não existem items cadastrados"])
        ]
      ]):null
    ])
    }
    var rederItemPre = function(x,i){
      if(state.width<700){
        if(!x.to_small){
          return renderItem(x,i);
        }
      }else{
        return renderItem(x,i);
      }

    }
    var renderItem = function(x,i){
      return h("tr",{key: x},[
        state.sorted_element().map(function(y){
          if(state.width<800){
            if(state.width<700){
              if(state.width<400){
                if(!y.to_xs){
                  return renderTd(y,x);
                }
              }else{
                if(!y.to_sm){
                  return renderTd(y,x);
                }
              }
            }else{
              if(!y.to_md){
                return renderTd(y,x);
              }
            }
          }else{
            return renderTd(y,x);
          }

        }),
        h("td",[
          h("div.field.has-addons",[
            state.buttons.length > 0 ?
            h("p.control",[
              state.buttons.map(function(z){
                if(z.show){
                  var el = state.sorted_element().filter(function(y){
                    return y.f == z.show;
                  });
                  if(el.length>0){
                    if(pega_valor(el[0],x)=="Sim"){
                        return renderOptionButton(z,x,true);

                    }else if(pega_valor(el[0],x)=="Não"){
                      return renderOptionButton(z,x,false);
                    }
                  }
                }else{
                  return renderOptionButton(z,x);
                }
              })
            ])

              //{label:"Desbloquear", title:"Desbloquear usuário", icon:"fa.fa-lock", classe:"button.is-light", fun: desbloquear, show:"u.block", show_when: true},
            : null,


          ]),
          h("div.is-clearfix")
        ])
      ])
    }
    //FUNCTIONS
    var renderTd = function(y,x){
      var value = pega_valor(y,x);
      if(y.href){
        value = h("a",{href:update_url(y.href,x), target:"_blank"}, value);
      }
      return h("td",{key:x},value);
    }
    var renderOptionButton = function(z,x,o ){
      if(typeof o == "undefined"){
        if(z.href){
          return h("a"+z.classe,{key:z, target: z.target? z.target : "self", state: state, item: x, title:z.title,href:z.file?update_url(x[z.file],x):update_url(z.href,x)},[h("i.np"+z.icon)]);
        }else{
          return h("div"+z.classe,{key:z, state: state, item: x, title:z.title,onclick:z.fun},[h("i.np"+z.icon)]);
        }

      }else{
        if(o){
          if(z.href){
            return h("a"+z.classe_true,{key:z, target: z.target? z.target : "self", state: state, item: x, title:z.title_true,href:z.file?z.file:update_url(z.href_true,x)},[h("i.np"+z.icon_true)]);
          }else{
            return h("div"+z.classe_true,{key:z, state: state, item: x, title:z.title_true,onclick:z.fun_true},[h("i.np"+z.icon_true)]);
          }
        }else{
          if(z.href){
            return h("a"+z.classe_false,{key:z, target: z.target? z.target : "self", state: state, item: x, title:z.title_false,href:z.file?z.file:update_url(z.href_false,x)},[h("i.np"+z.icon_false)]);
          }else{
            return h("div"+z.classe_false,{key:z, state: state, item: x, title:z.title_false,onclick:z.fun_false},[h("i.np"+z.icon_false)]);
          }
        }
      }
    }
    var resizeTable = function(x){

      var width = window.innerWidth;

    }
    var update_url = function(url,x){
      var shortcode_regex = /\[:(\S+)\]/g;
      return url.replace(shortcode_regex, function(match, code, id) {
          return pega_valor({f: code},x);
      });
    }
    var pega_valor = function(y,x){
      var splited = (y.f).split(".");
      var value = x[splited[0]];
      if(splited.length>0){
        var j = 1;
        while(j<=(splited.length-1)){
          if(value != null){
            value = value[splited[j]];
          }
          j++;
        }
      }
      if(is.not.null(value) && y.data ){
        if(value=="0000-00-00 00:00:00Z"|| value=="0000-00-00T00:00:00Z"){
          value="-"
        }else{
          if(y.moment=="fromNow"){
            value = moment(value).fromNow();
          } else if(y.moment){
            value = moment(value).format(y.moment);
          }
        }
      }
      if(y.parse && y.values){
        value = y.values[value];
      }
      console.log(y)
      if(y.vals!=null){
        var m = y.vals.filter(function(x){
          return x.val == value;
        })
        console.log(m)
        value = m[0].label;
      }
      return value;
    }
    var open_calendar = function(){
      state.open_calendar(!state.open_calendar());
      if(!state.open_calendar()){
        //pesquisa();
        state.items_filtrados_por_data(state.root_d())
        state.items(state.items_filtrados_por_pesquisa())
        state.items_show(aplicaUsers(state.items_filtrados_por_pesquisa()));
      }
    }
    var after_calendar_in = function(x){
      var picker = new Pikaday({
        field: x,
        format:"DD/MM/YYYY",
        position: "bottom left",
        repositon: true,
        i18n: {
        previousMonth : 'Mês anterior',
        nextMonth     : 'Próximo mês',
        months        : ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        weekdays      : ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
        weekdaysShort : ['Dom','Seg','Ter','Qua','Qui','Sex','Sab']
        },
        onSelect: function() {
            state.query_data_in(this.getMoment().unix());
            filtra_por_data();
          }
      });
    }
    var after_calendar_out = function(x){
      var picker = new Pikaday({
        field: x,
        format:"DD/MM/YYYY",
        position: "bottom left",
        repositon: true,
        i18n: {
        previousMonth : 'Mês anterior',
        nextMonth     : 'Próximo mês',
        months        : ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        weekdays      : ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
        weekdaysShort : ['Dom','Seg','Ter','Qua','Qui','Sex','Sab']
        },
        onSelect: function() {
            state.query_data_out(this.getMoment().unix());
            filtra_por_data();
          }
      });
    }
    var renderColumns = function(x){
      return h("p.control",{key:x},[
        h("div.button.is-dark.is-small",{onclick:get_out_where, item: x, classes:{"is-outlined": !R.contains(x.f,state.where())}},[
            h("span.np",[x.l])
          ]),
      ])
    }
    var get_out_where = function(e){
      var x = e.target.item;
      if(R.contains(x.f,state.where())){
        var idx = state.where().indexOf(x.f);
        state.where().splice(idx,1);
      }else{
        state.where().push(x.f);
      }
      pesquisa();
    }
    var open_opts = function(){
      state.show_search_opt(!state.show_search_opt());

    }
    var filtra_por_data = function(q){
      var campos_data = state.sorted_element().filter(function(x){
        if(x.data){
          var a = false;
          state.where().forEach(function(i){
            if(i == x.f){
              a = true;
              return
            }
          })
          return a;
        }

      });
      if(campos_data.length>0){

          /*if(state.users_b().length == 0 ){
            state.users_b(state.items().slice(0));
          }*/
          var u = state.items_filtrados_por_pesquisa();
          u = u.filter(function(x){
            var a = false;
            campos_data.forEach(function(y){
              var splited = (y.f).split(".");
              var value = x[splited[0]];
              if(splited.length>0){
                var j = 1;
                while(j<=(splited.length-1)){
                  if(value != null)
                    value = value[splited[j]];
                  j++;
                }
              }
              if(is.not.nan(moment(value).unix())){
                if(state.query_data_in() != 0 && state.query_data_out() == 0){
                  return a = moment(value).unix()>=state.query_data_in()
                }
                if(state.query_data_in()==0 && state.query_data_out()!=0){
                  return a = moment(value).unix()<=state.query_data_out()
                }
                if(state.query_data_in()!=0 && state.query_data_out()!=0){
                  return a = moment(value).unix()>=state.query_data_in() && moment(value).unix()<=state.query_data_out()
                }
              }

            });
            return a;
          });
        if(u.length>0)
        {
          if(Math.ceil(u.length/state.max_rows())<=state.pagina()){
            state.pagina(Math.ceil(u.length/state.max_rows())-1);
          }
        }else{
          state.pagina(0);
        }

        state.items_filtrados_por_data(u);
        state.items(u);
        state.items_show(aplicaUsers(u));

        //pesquisa();

      }
    }
    var pesquisa = function(){
      var pesq = state.query();
      //items_show, items, root_d
      if(pesq.length>0){
        var strs = R.split(",",pesq);
        strs = strs.map(function(x){ return R.trim(x.toLowerCase())});
        var u = [];
        var campos_data = state.sorted_element().filter(function(x){
            var a = false;
            state.where().forEach(function(i){
              if(i == x.f){
                a = true;
                return
              }
            })
            return a;

        });
        if(campos_data.length>0){
          var bt = strs.slice(0);
          var items = state.items_filtrados_por_data();
          while(bt.length>0){
            u = items.filter(function(x){
              var a = false;
              campos_data.forEach(function(y){
                var splited = (y.f).split(".");
                var value = x[splited[0]];
                if(splited.length>0){
                  var j = 1;
                  while(j<=(splited.length-1)){
                    if(value != null)
                      value = value[splited[j]];
                    j++;
                  }
                }
                if(y.f != "idx"){
                  if(y.parse && y.values){
                    value = y.values[value];
                  }
                  if(typeof value == "string"){
                    if(value.toLowerCase().removeAccents().search(R.head(bt).removeAccents())!= -1)
                      a = true;
                      return;
                  }
                }else{
                  var o = x["idx"]+"";
                  if(o.toLowerCase().search(R.head(bt))!= -1)
                    a = true;
                    return;
                }
              });
              return a;
            });
            bt.shift();
          }

          if(u.length>0)
          {
            if(Math.ceil(u.length/state.max_rows())<=state.pagina()){

              state.pagina(Math.ceil(u.length/state.max_rows())-1);
            }
          }
          state.items_filtrados_por_pesquisa(u);
          state.items(u)
          state.items_show(aplicaUsers(u));
        }else{
          state.items_filtrados_por_pesquisa([]);
          state.items([]);
          state.items_show(aplicaUsers([]));
        }
      }else{
        state.items_filtrados_por_pesquisa(state.root_d());
        state.items(state.root_d());
        state.items_show(aplicaUsers(state.root_d()));
      }
    }
    var set_pesquisar = function(e){
      var pesq = e.target.value;
      state.query(pesq);
      pesquisa();

    }
    var renderPagination = function(x){
      if(state.pagina()+1 == x.idx){
        return h("div.button.is-gray.is-small",{onclick: set_page, item: x.idx, key:x},[""+x.label]);
      }else{
        return h("div.button.is-dark.is-outlined.is-small",{onclick: set_page, item: x.idx, key:x},[""+x.label]);
      }
    }
    var set_page = function(e){
        var users_s = []
      if(e.target.item == -1){//PROX
        state.pagina(state.pags()[state.pags().length-2].idx);

      }else if(e.target.item == -2){//PREV
        state.pagina(state.pagina()-5);
      }else{
        var v = e.target.item-1;
        state.pagina(v);

      }
      state.items_show(aplicaUsers(state.items()));
      paginas(state.items());
    }
    var paginas = function(u){
      var pags = Math.ceil(state.items().length/state.max_rows());
      state.pags([])
      if(pags>(5+state.pagina())){
        if(state.pagina()>4){
          state.pags().push({idx:-2, label:'Anterior'})
        }
        var inicial = (Math.floor((state.pagina())/5)*5)+1;
        for(var i=inicial; i<5+inicial; i++){
          state.pags().push({idx:i, label: i})
        }
        state.pags().push({idx:-1, label:'Próxima'})
      }else{
        if(state.pagina()>4){
          state.pags().push({idx:-2, label:'Anterior'})
        }
        var inicial = (Math.floor((state.pagina())/5)*5)+1;
        for(var i=inicial; i<=pags; i++){
          state.pags().push({idx:i, label: i})
        }
      }
      return u;
    }
    var set_max_rows = function(e){
      var v = e.target.attributes.v.value;
      state.max_rows(parseInt(v));
      if(Math.ceil(state.items().length/state.max_rows())<=state.pagina()){
        var v1 = Math.ceil(state.items().length/state.max_rows())-1;
        if(v1 == -1)
          state.pagina(0);
        else
          state.pagina(v1)
      }
      console.log(state.pagina());
      state.items_show(aplicaUsers(state.items()));


    }
    var qmax_rows = function(x){
      return state.max_rows() == x;
    }
    var is_sorted = function(x){
      var f = R.filter(function(y){ return y.f == x},state.sorted_element())
      if(is.undefined(f[0])){
        return null
      }
      if(f[0].v==1){
        return h("i.fa.fa-arrow-up.pull-right.np")
      }else if(f[0].v==2){
        return h("i.fa.fa-arrow-down.pull-right.np")
      }else{
        return null
      }

    }
    var users_sort = function(e){
      var x = e.target.attributes.v.value;
      var f = R.filter(function(y){ return y.f == x},state.sorted_element())
      if(is.undefined(f[0])){
        return null
      }
      var idx = state.sorted_element().indexOf(f[0]);

      if(f[0].v==0){
        state.sorted_element()[idx].v=1;
      }else if(f[0].v==1){
        state.sorted_element()[idx].v=2;
      }else{
        state.sorted_element()[idx].v=0;
      }
      var sm = R.filter(function(x){ return x.v > 0},state.sorted_element());
      var sorted_fn = sm.map(function(v){
          switch(v.v){
            case 1:

              return R.ascend(R.prop(v.f));
              break;
            case 2:
              return R.descend(R.prop(v.f));
              break;
            default:
              return R.ascend(R.prop(v.f));
              break;
          }
        });
        var sortf = R.sortWith(sorted_fn);
        if(sorted_fn.length == 0){
          var diff = function(a, b) {
          return a.idx - b.idx; };
          state.items(R.sort(diff, state.items()))
        }else{
          state.items(sortf(state.items()));
        }
        state.items_show(aplicaUsers(state.items()));



    }
    function primeiros(){
      return 1*state.pagina()*state.max_rows()
    }
    function ultimos(){
      return ((1*state.pagina()*state.max_rows())+state.max_rows())
    }
    function aplicaUsers(b){
      if(( 1 * state.pagina() * state.max_rows() + state.max_rows()) >b.length){
        var a = b.slice((1*state.pagina()*state.max_rows()), b.length);
        return paginas(a);
      }else if(b.length>0){
        var a = b.slice((1*state.pagina()*state.max_rows()),(1*state.pagina()*state.max_rows())+state.max_rows());
        return paginas(a);
      }else{
        return paginas([]);
      }
    }

    state.items_show(aplicaUsers(state.root_d()));


    _hgrid_projector_.append(dom,renderMaquette);

    return state
  }
