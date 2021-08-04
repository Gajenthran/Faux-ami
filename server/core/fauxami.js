const Game = require('./game')
const { hasUser, getUserIndex, getUsersInRoom, getUser } = require('./users')

const ROOM_LIMIT = 8
const MIN_NB_PLAYERS = 4
const MAX_NB_PLAYERS = 8

/**
 * Class representing the FauxAmi engine.
 */
class FauxAmi {
  /**
   * Create FauxAmi engine.
   */
  constructor() {
    this.users = []
    this.game = new Map()
  }

  startGame(io, socket, options) {
    const user = getUser(this.users, socket.id)

    if (!user) return { error: `Cannot connect with user.` }

    const users = getUsersInRoom(this.users, user.room)

    if (this.game.get() !== undefined)
      return { error: 'Cannot create the game: the room is already in game.' }

    if (users.length < MIN_NB_PLAYERS || users.length > MAX_NB_PLAYERS) {
      io.to(user.room).emit('game:start-game-response', { canStart: false })
      console.warn('Error: Inadequate number of players.')
      return { error: 'Error: Inadequate number of players.' }
    }

    this.game.set(user.room, new Game(users, options, socket.id))
    const game = this.game.get(user.room)

    if (!game) return { error: "Game don't exist." }

    const gameState = game.getGameState()
    io.to(user.room).emit('game:new-game', {
      users: game.getUsers(),
      gameState,
      options,
    })
  }

  startRound(io, socket) {
    const user = getUser(this.users, socket.id)

    if (!user) return { error: `Cannot connect with user.` }

    if (this.game.get() !== undefined)
      return { error: 'Cannot create the game: the room is already in game.' }

    const game = this.game.get(user.room)

    if (!game) return { error: "Game don't exist." }

    game.resetCountdown()
    game.clearCountdown()
    const timer = game.getTimer()
    io.to(user.room).emit('game:start-round-response')
    io.to(user.room).emit('game:countdown-tick', game.getTimer())
    game.setCountdown(() => {
      io.to(user.room).emit('game:countdown-tick', game.getTimer())
      const endRound = game.update()

      if (endRound) {
        game.clearCountdown()
        io.to(user.room).emit('game:end-round', {
          users: game.getUsers(),
          gameState: game.getGameState(),
        })
      } else {
        io.to(user.room).emit('game:end-turn', {
          users: game.getUsers(),
          gameState: game.getGameState(),
        })
      }
    }, timer.end - timer.start)
  }

  skipTurn(io, socket) {
    const user = getUser(this.users, socket.id)

    if (!user) return { error: `Cannot connect with user.` }

    if (this.game.get() !== undefined)
      return { error: 'Cannot create the game: the room is already in game.' }

    const game = this.game.get(user.room)

    if (!game) return { error: "Game don't exist." }

    game.resetCountdown()
    game.clearCountdown()
    io.to(user.room).emit('game:countdown-tick', game.getTimer())
    const endRound = game.update()
    if (endRound) {
      game.clearCountdown()
      io.to(user.room).emit('game:end-round', {
        users: game.getUsers(),
        gameState: game.getGameState(),
      })
    } else {
      io.to(user.room).emit('game:end-turn', {
        users: game.getUsers(),
        gameState: game.getGameState(),
      })
    }

    if (!endRound) {
      const timer = game.getTimer()
      io.to(user.room).emit('game:countdown-tick', game.getTimer())
      game.setCountdown(() => {
        io.to(user.room).emit('game:countdown-tick', game.getTimer())
        const endRound = game.update()

        if (endRound) {
          game.clearCountdown()
          io.to(user.room).emit('game:end-round', {
            users: game.getUsers(),
            gameState: game.getGameState(),
          })
        } else {
          io.to(user.room).emit('game:end-turn', {
            users: game.getUsers(),
            gameState: game.getGameState(),
          })
        }
      }, timer.end - timer.start)
    }
  }

  newRound(io, socket) {
    const user = getUser(this.users, socket.id)

    if (!user) return { error: `Cannot connect with user.` }

    if (this.game.get() !== undefined)
      return { error: 'Cannot create the game: the room is already in game.' }

    const game = this.game.get(user.room)

    if (!game) return { error: "Game don't exist." }

    const endGame = !game.newRound()
    if (endGame) {
      io.to(user.room).emit('game:end-game', {
        users: game.getUsers(),
        gameState: game.getGameState(),
      })
    } else {
      io.to(user.room).emit('game:new-round', {
        users: game.getUsers(),
        gameState: game.getGameState(),
      })
    }
  }

  restartGame(io, socket) {
    const user = getUser(this.users, socket.id)
    if (!user) return { error: `Cannot connect with user.` }

    const game = this.game.get(user.room)
    if (!game) return { error: "Game don't exist." }

    this.game.delete(user.room)
    io.to(user.room).emit('game:restart-response')
  }

  createLobby(io, socket, { user, room }) {
    if (!(user.name || room)) {
      console.warn('Username and room are required.')
      return { error: 'Username and room are required.' }
    }

    if (hasUser(this.users, user.name, room)) {
      console.warn('Username is taken.')
      return { error: 'Username is taken.' }
    }

    user.id = socket.id
    user.room = room
    this.users.unshift(user)

    const game = this.game.get(room)

    if (game) {
      console.warn('The game has already started.')
      return { error: 'The game has already started.' }
    }

    socket.join(user.room)
    setTimeout(() => {
      io.to(user.room).emit('lobby:create-response', {
        user,
        articles: Game.ARTICLES_.map((article) => {
          return { id: article.id, title: article.title, checked: true }
        }),
      })
    }, 300)
  }

  checkLobby(io, socket, { room }) {
    let error = false
    if (!room || !room.length === ROOM_LIMIT) error = true

    const roomExist = io.sockets.adapter.rooms[room] || false
    let userExist = false

    if (roomExist) userExist = io.sockets.adapter.rooms[room].sockets[socket.id]

    io.to(socket.id).emit('lobby:check-response', {
      error,
      roomExist,
      userExist,
    })
  }

  joinLobby(io, socket, { user, room }) {
    user.id = socket.id
    user.room = room
    this.users.unshift(user)
    socket.join(user.room)

    const game = this.game.get(room)

    if (game) {
      return { error: 'The game has already started.' }
    }

    const articles = Game.ARTICLES_.map((article) => {
      return { id: article.id, title: article.title, checked: true }
    })

    io.to(socket.id).emit('lobby:join-response-user', {
      user,
      users: getUsersInRoom(this.users, user.room),
      articles,
    })

    socket.broadcast.to(user.room).emit('lobby:join-response-all', {
      users: getUsersInRoom(this.users, user.room),
      articles,
    })
  }

  updateGame(io, socket) {
    const index = getUserIndex(this.users, socket.id)
    const user = this.users[index]

    if (!user) {
      return { error: "User don't exist." }
    }

    const game = this.game.get(user.room)

    if (!game || game === null) {
      console.warn('Game is not existing.')
      return { error: 'Game is not existing.' }
    }

    const { state, newRound } = game.update()

    io.to(user.room).emit(`game:update-response`, {
      state,
      newRound,
      users: game.getUsers(),
      gameState: game.getGameState(),
    })
  }

  votePlayer(io, socket, { userId }) {
    const index = getUserIndex(this.users, socket.id)
    const user = this.users[index]

    if (!user) {
      return { error: "User don't exist." }
    }

    const game = this.game.get(user.room)

    if (!game || game === null) {
      console.warn('Game is not existing.')
      return { error: 'Game is not existing.' }
    }

    game.vote(socket.id, userId)

    io.to(user.room).emit(`game:vote-response`, { users: game.getUsers() })
  }

  confirmVote(io, socket) {
    const index = getUserIndex(this.users, socket.id)
    const user = this.users[index]

    if (!user) {
      return { error: "User don't exist." }
    }

    const game = this.game.get(user.room)

    if (!game || game === null) {
      console.warn('Game is not existing.')
      return { error: 'Game is not existing.' }
    }

    const end = game.confirmVote(socket.id)

    if (end) {
      game.endVote()
      io.to(user.room).emit(`game:end-vote`, { users: game.getUsers() })
    } else {
      io.to(user.room).emit(`game:confirm-vote-response`, {
        users: game.getUsers(),
      })
    }
  }

  /**
   * Remove user from the lobby or the game.
   *
   * @param {object} io - io
   * @param {object} socket - socket io
   */
  removeUser(io, socket) {
    const index = this.users.findIndex((user) => user.id === socket.id)

    const user = this.users[index]

    if (index !== -1) {
      const room = user.room
      const game = this.game.get(room)
      if (game) {
        if (game.disconnect(user.id)) {
          this.game.delete(room)
          return
        }

        this.users.splice(index, 1)
        io.to(user.room).emit('game:disconnect', {
          users: getUsersInRoom(game.getUsers(), user.room),
          gameState: game.getGameState(),
        })
      } else {
        this.users.splice(index, 1)
        io.to(user.room).emit('game:disconnect', {
          users: getUsersInRoom(this.users, room),
        })
      }
    }
  }
}

module.exports = new FauxAmi()
