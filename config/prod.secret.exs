use Mix.Config

# In this file, we keep production configuration that
# you'll likely want to automate and keep away from
# your version control system.
#
# You should document the content of this
# file or create a script for recreating it, since it's
# kept out of version control and might be hard to recover
# or recreate for your teammates (or yourself later on).
config :cartel, CartelWeb.Endpoint,
  secret_key_base: "8RJKEVZWhlYDWaau4jvIWsK8s199PjNFEd8XWoVM65KwLKpxnlfbMJJ4YqthM/My"

# Configure your database
config :cartel, Cartel.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "cartel_prod",
  pool_size: 15
