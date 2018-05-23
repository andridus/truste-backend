defmodule CartelWeb.JogoChannel do
  use Phoenix.Channel
  alias CartelWeb.Presence

  def join("jogo:" <> jid, %{"uid" => uid}, socket) do
    #send(self(), :after_login_jogo)
    {:ok, %{player: %{ jid: jid, uid: uid }},socket}
  end
  
  def handle_in("envia_jogo",%{"jogador" => jogador, "jogo" => jogo, "from" => from}, socket) do
    broadcast! socket, "recebe_jogo", %{jogador: jogador, jogo: jogo, from: from}
    {:noreply, socket}
    
  end

  def handle_in("envia_board",%{"jogo" => jogo, "board" => board}, socket) do
    broadcast! socket, "recebe_board", %{board: board, jogo: jogo}
    {:noreply, socket}
    
  end

  def handle_in("envia_turno",%{"jogo" => jogo, "turno" => turno}, socket) do
    broadcast! socket, "recebe_turno", %{jogo: jogo, turno: turno}
    {:noreply, socket}
    
  end

  def handle_in("envia_dialogos",%{"dialogos" => dialogos}, socket) do
    broadcast! socket, "recebe_dialogos", %{dialogos: dialogos}
    {:noreply, socket}
    
  end

  def handle_in("envia_jogadores",%{"jogadores" => jogadores, "jogador" => jogador}, socket) do
    broadcast! socket, "recebe_jogadores", %{jogadores: jogadores, jogador: jogador}
    {:noreply, socket}
    
  end

  def handle_in("envia_cancela_dialogo",%{"dialogo" => dialogo}, socket) do
    broadcast! socket, "recebe_cancela_dialogo", %{dialogo: dialogo}
    {:noreply, socket}
    
  end

  def handle_in("atualiza_turno",%{"from" => from, "jogadores" => jogadores, "turno" => turno, "board" => board}, socket) do
    broadcast! socket, "recebe_turno_atualizado", %{jogadores: jogadores, turno: turno, board: board, from: from}
    {:noreply, socket}
    
  end

  def handle_in("paga_bonus",%{"from" => from, "jogadores" => jogadores, "turno" => turno, "board" => board}, socket) do
    broadcast! socket, "recebe_paga_bonus", %{jogadores: jogadores, turno: turno, board: board, from: from}
    {:noreply, socket}
    
  end
  def handle_in("venda_acao_fusao",%{"from" => from, "jogadores" => jogadores, "turno" => turno, "board" => board}, socket) do
    broadcast! socket, "recebe_venda_acao_fusao", %{jogadores: jogadores, turno: turno, board: board, from: from}
    {:noreply, socket}
    
  end

  def handle_in("envia_jogo_para_jogadores",%{"jogadores" => jogadores, "jogo" => jogo, "from" => from}, socket) do
    broadcast! socket, "recebe_jogo_para_jogadores", %{jogadores: jogadores, jogo: jogo, from: from}
    {:noreply, socket}
    
  end

  

  def handle_in("sair_do_jogo",%{"uid" => uid, "criador" => criador}, socket) do
    broadcast! socket, "sair_do_jogo:"<>criador, %{uid: uid}
    {:noreply, socket}
    
  end

  def handle_in("retira_todos_do_jogo",%{"jid" => jid, "criador" => criador}, socket) do
    broadcast! socket, "retira_todos_do_jogo:"<>criador, %{jid: jid}
    {:noreply, socket}
    
  end

  

end
