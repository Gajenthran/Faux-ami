const fs = require('fs')
const path = require('path')
const { getUserIndex } = require('./users')

const MIN_NB_PLAYERS = 4

const TEAM_ENUM = {
  spy: 0,
  protagonist: 1,
}
Object.freeze(TEAM_ENUM)

const TEAM_SPLIT = [
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [3, 5],
]
Object.freeze(TEAM_SPLIT)

const CARDS_ENUM = {
  secure: 0,
  defuse: 1,
  bomb: 2,
}
Object.freeze(CARDS_ENUM)

const STATE_ENUM = {
  idle: 0,
  win: 1,
  loose: 2,
}
Object.freeze(STATE_ENUM)

const ARTICLES_JSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/articles.json'))
)

const ARTICLES = ARTICLES_JSON.articles

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}

class Game {
  static ARTICLES_ = ARTICLES
  constructor(users, options) {
    this.users = users

    this.round = 1
    this.turn = 1
    // nbPlayer, nbTurn, nbKeywords, countdown, nbRound, nbCommonWords
    this.options = options
    this.countdown = null
    this.timer = null

    this.articleIndexes =
      options.articles && options.articles.length >= options.nbRound
        ? options.articles.map((article) => article.id)
        : Array.from(Array(ARTICLES.length), (_, i) => i)

    shuffleArray(this.articleIndexes)
    this.articleIndexes = this.articleIndexes.slice(0, this.options.nbRound)
    this.article = ARTICLES[this.articleIndexes[this.round - 1]]

    const keywordsIndexes = Array.from(
      Array(this.article.keywords.length),
      (_, i) => i
    )
    shuffleArray(keywordsIndexes)

    const keywords = new Array(this.options.nbKeywords)
      .fill(null)
      .map((_, i) => this.article.keywords[keywordsIndexes[i]])

    const spyKeywords = new Array(this.options.nbKeywords)
      .fill(null)
      .map((_, i) => this.article.spyKeywords[keywordsIndexes[i]])

    if (this.options.nbCommonWords > 0) {
      const wordIndexes = Array.from(
        Array(this.options.nbKeywords),
        (_, i) => i
      )
      shuffleArray(wordIndexes)
      for (let i = 0; i < this.options.nbCommonWords; i++)
        spyKeywords[wordIndexes[i]] = keywords[wordIndexes[i]]
    }

    const userIndexes = Array.from(
      Array(this.users.length),
      (_, index) => index
    )
    shuffleArray(userIndexes)

    for (let i = 0; i < userIndexes.length; i++)
      this.users[userIndexes[i]].role = this.article.players[i]

    const nbSpy = TEAM_SPLIT[this.users.length - MIN_NB_PLAYERS][TEAM_ENUM.spy]
    this.spyIndexes = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.spyIndexes)

    for (let i = 0; i < this.users.length; i++)
      this.users[this.spyIndexes[i]].spy = i >= nbSpy ? false : true

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].keywords = this.users[i].spy
        ? [...spyKeywords]
        : [...keywords]
      this.users[i].vote = []
      this.users[i].voted = null
      this.users[i].score = 0
      this.users[i].currentScore = 0
      this.users[i].comments = []
    }

    this.usersOrder = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.usersOrder)
    this.currentPlayer = 0
  }

  update() {
    if (this.turn > this.options.nbTurn) {
      this.resetCountdown()
      this.clearCountdown()
      return true
    }

    this.currentPlayer = (this.currentPlayer + 1) % this.users.length
    if (this.currentPlayer === 0) this.turn++

    const endRound = this.turn > this.options.nbTurn
    if (endRound) {
      this.resetCountdown()
      this.clearCountdown()
    }

    return endRound
  }

  vote(id, userId) {
    if (id === userId) return

    const votedPlayer = this.users[getUserIndex(this.users, userId)]
    const user = this.users[getUserIndex(this.users, id)]

    if (user.voted !== null) {
      const previousVoted = this.users.find((usr) => user.voted === usr.id)
      if (previousVoted) {
        const removedId = previousVoted.vote.findIndex(
          (voter) => voter.id === id
        )
        previousVoted.vote.splice(removedId, 1)
        user.voted = null
      }
    }

    votedPlayer.vote.push({
      id: user.id,
      img: user.img,
      name: user.name,
      confirmed: false,
    })
    user.voted = votedPlayer.id
  }

  checkConfirmation() {
    let nbVotes = 0
    for (let i = 0; i < this.users.length; i++) {
      for (let v = 0; v < this.users[i].vote.length; v++) {
        if (!this.users[i].vote[v].confirmed) return false
        else nbVotes++
      }
    }

    return nbVotes === this.users.length
  }

  confirmVote(id) {
    const user = this.users[getUserIndex(this.users, id)]

    if (user && user.voted) {
      const votedPlayer = this.users[getUserIndex(this.users, user.voted)]
      const updatedId = votedPlayer.vote.findIndex((voter) => voter.id === id)
      votedPlayer.vote[updatedId].confirmed = true
    }

    return this.checkConfirmation()
  }

  getGameState() {
    return {
      users: this.users,
      currentPlayer: this.users[this.usersOrder[this.currentPlayer]].id,
      round: this.round,
      nbRound: this.options.nbRound,
      duration: this.options.countdown,
      article: this.article,
    }
  }

  getUsers() {
    return this.users
  }

  endVote() {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].spy) {
        const voters = this.users[i].vote
        if (voters.length < Math.ceil((this.users.length - 1) / 2)) {
          this.users[i].currentScore += 100
          this.users[i].comments.push('+100 Discret')
          if (voters.length === 0) {
            this.users[i].currentScore += 50
            this.users[i].comments.push('+50 Incognito')
          }
        }
        this.users[i].score += this.users[i].currentScore
      }
    }

    const spies = this.users.filter((usr) => usr.spy === true)
    let found = false
    let onlyVoter = false
    for (let i = 0; i < this.users.length; i++) {
      if (!this.users[i].spy) {
        found = false
        onlyVoter = false
        // const voted = spies.find(spy => spy.id === this.users[i].id)
        for (let s = 0; s < spies.length; s++) {
          const voted = spies[s].vote.find((v) => v.id === this.users[i].id)
          if (voted) {
            onlyVoter = spies[s].vote.length === 1
            found = true
            break
          }
        }

        if (found) {
          this.users[i].currentScore += 100
          this.users[i].comments.push('+100 Espion trouvé')
          if (onlyVoter) {
            this.users[i].currentScore += 50
            this.users[i].comments.push('+50 Detektiv')
          }
          this.users[i].score += this.users[i].currentScore
        }
      }
    }
  }

  rankUsers() {
    this.users.sort((u1, u2) => (u1.score < u2.score ? 1 : -1))
  }

  newRound() {
    this.round++

    if (this.round > this.options.nbRound) {
      this.rankUsers()
      return false
    }

    this.article = ARTICLES[this.articleIndexes[this.round - 1]]
    this.turn = 1

    const keywordsIndexes = Array.from(
      Array(this.article.keywords.length),
      (_, i) => i
    )
    shuffleArray(keywordsIndexes)

    const keywords = new Array(this.options.nbKeywords)
      .fill(null)
      .map((_, i) => this.article.keywords[keywordsIndexes[i]])

    const spyKeywords = new Array(this.options.nbKeywords)
      .fill(null)
      .map((_, i) => this.article.spyKeywords[keywordsIndexes[i]])

    for (let i = 0; i < this.options.nbCommonWords; i++)
      spyKeywords[i] = keywords[i]

    const userIndexes = Array.from(
      Array(this.users.length),
      (_, index) => index
    )
    shuffleArray(userIndexes)

    for (let i = 0; i < userIndexes.length; i++)
      this.users[userIndexes[i]].role = this.article.players[i]

    const nbSpy = TEAM_SPLIT[this.users.length - MIN_NB_PLAYERS][TEAM_ENUM.spy]
    this.spyIndexes = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.spyIndexes)

    for (let i = 0; i < this.users.length; i++)
      this.users[this.spyIndexes[i]].spy = i >= nbSpy ? false : true

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].keywords = this.users[i].spy
        ? [...spyKeywords]
        : [...keywords]
      this.users[i].vote = []
      this.users[i].voted = null
      this.users[i].currentScore = 0
      this.users[i].comments = []
    }

    this.usersOrder = Array.from(Array(this.users.length), (_, index) => index)
    shuffleArray(this.usersOrder)
    this.currentPlayer = 0

    return true
  }

  removeUser(id) {
    const index = this.users.findIndex((user) => user.id === id)
    if (index !== -1) this.users.splice(index, 1)
    return index
  }

  disconnect(id) {
    if (id === this.users[this.currentPlayer].id) {
      this.removeUser(id)
      if (this.users.length === 0) return true
      let currentPlayer = this.currentPlayer
      do {
        currentPlayer = (currentPlayer + 1) % this.users.length
      } while (this.users[currentPlayer].loose)
      this.currentPlayer = currentPlayer
    } else {
      const index = this.removeUser(id)
      if (index !== -1 && this.currentPlayer > index) this.currentPlayer--
    }

    return false
  }

  setCountdown(fct, timeout) {
    this.countdown = setInterval(fct, timeout)
  }

  clearCountdown() {
    clearInterval(this.countdown)
  }

  resetCountdown() {
    const now = new Date()
    this.timer = {
      start: now.getTime(),
      end: now.getTime() + this.options.countdown * 1000,
    }
  }

  getTimer() {
    return this.timer
  }

  setEndTurn() {
    this.resetCountdown()
    this.clearCountdown()
  }
}

module.exports = Game
