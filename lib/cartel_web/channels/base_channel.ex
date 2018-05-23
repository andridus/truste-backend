defmodule CartelWeb.BaseChannel do
  use Phoenix.Channel
  alias CartelWeb.Presence


  def join("base", %{"uid" => uid}, socket) do
    send(self(), :after_login)
    {:ok, %{player: %{ uid: uid }},socket}
  end

  def handle_in("envia_jogo_para_exibir",%{"criador_id" => criador_id, "nome" => nome, "jid" => jid, "jogadores" => jogadores, "max_users" => max_users, "timestamp" => timestamp, "iniciado" => iniciado}, socket) do
    broadcast! socket, "recebe_jogo_para_exibir", %{criador_id: criador_id, nome: nome, jid: jid, jogadores: jogadores, max_users: max_users, timestamp: timestamp, iniciado: iniciado }
    {:noreply, socket}
    
  end
  def handle_in("envia_me",%{"uid" => uid, "nome" => nome, "avatar" => avatar, "pronto" => pronto}, socket) do
    broadcast! socket, "recebe_usuario", %{uid: uid, nome: nome, avatar: avatar, pronto: pronto}
    {:noreply, socket}
    
  end

  def handle_in("entra_no_jogo",%{"criador" => criador, "uid" => uid, "jid" => jid, "nome" => nome,"avatar" => avatar}, socket) do
    broadcast! socket, ("entrou_no_jogo:"<>criador), %{uid: uid, jid: jid, nome: nome, avatar: avatar}
    {:noreply, socket}
    
  end
  def handle_in("entre_no_jogo",%{"criador" => criador, "jogador" => uid, "jid" => jid}, socket) do
    broadcast! socket, ("entre_no_jogo:"<>uid), %{criador: criador, jid: jid}
    {:noreply, socket}
    
  end

  def handle_in("base_entrou", %{"player" => player}, socket) do
    broadcast! socket, "base_entrou", %{player: player}
    {:noreply, socket}
  end

  def handle_in("salas", %{"salas" => salas}, socket) do
    broadcast! socket, "salas", %{salas: salas}
    {:noreply, socket}
  end

  def handle_in("jogos", %{"jogos" => jogos}, socket) do
    broadcast! socket, "jogos", %{jogos_para_exibir: jogos}
    {:noreply, socket}
  end

  def handle_in("sala", %{"sala" => sala}, socket) do
    broadcast! socket, "sala", %{sala: sala}
    {:noreply, socket}
  end

  def handle_in("sala_out", %{"sala" => sala}, socket) do
    broadcast! socket, "sala_out", %{sala: sala}
    {:noreply, socket}
  end

  def handle_in("players", %{"players" => players}, socket) do
    broadcast! socket, "players", %{players: players}
    {:noreply, socket}
  end
  
  def handle_info(:after_login, socket) do
    IO.inspect socket
    push socket, "presence_state", Presence.list(socket)
    {:ok, _} = Presence.track(socket, socket.assigns.uid, %{
                  online_at: inspect(System.system_time(:seconds))
               })
    #broadcast! socket, "recebe_uid", %{texto: "novo_uid"}
    {:noreply, socket}
  end
  def handle_in("retira_jogo_para_exibir",%{"jid" => jid}, socket) do
    broadcast! socket, "retira_jogo_para_exibir", %{jid: jid}
    {:noreply, socket}
  end
end
